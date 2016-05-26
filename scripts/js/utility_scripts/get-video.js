(function () {
    var youtube = {
        playerType: 'youtube',
        opacity: 0.85,
        init: function (callback) {
            var youtube = this;


            this.video = getPlayer();
			chromeapi.isPropertyEnabled_DefaultOn('settings:settings:quality', function () {
                youtube.setQualityToHigh();
            });
            if (!win.isMovie()) {
                chromeapi.isPropertyEnabled_DefaultOn('settings:settings:intro', function () {
                    youtube.listen_intro(win.getShowName());
                });
                chromeapi.isPropertyEnabled_DefaultOn('settings:settings:outro', function () {
                    youtube.listen_outro(win.getShowName());

                    if (callback)
                        callback();
                }, callback || function () {
                });
            }
            this.listen_watched((win.isMovie() ? 600 : 300), function () {
                chromeapi.isPropertyEnabled_DefaultOff('mal-auth', win.addEpisodeToMAL);
                chromeapi.isPropertyEnabled_DefaultOff('hummingbird-auth', win.addEpisodeToHummingBird);
                win.setEpisodeToNext();
            });
            this.jumpToSavedElapsed();
        },
        togglePlayState: function () {
            switch (this.video.getPlayerState()) {
                case 1:
                    this.pause();
                    break;
                case 2:
                    this.play();
                    break;
                default:
                    break;
            }
        },
        isPaused: function () {
            if (this.video.getPlayerState() == 2)
                return true;
            else return false;
        },
        pause: function () {
            this.video.pauseVideo();
            win.displayMsg('Pause');
            win.displaySynopsis();
            statusBar.onPause();
        },
        play: function () {
            this.video.playVideo();
            win.displayMsg('Play');
            win.undisplaySynopsis();
            statusBar.onPlay();
        },
        listen_intro: function (showName) {
            var youtube = this;

            chrome.storage.sync.get(showName, function (settings) {
                if (settings[showName].intro_from != undefined) {
                    // if(settings[showName].intro_from && settings[showName].intro_to) {
                    youtube.intro_from = settings[showName].intro_from;
                    youtube.intro_to = settings[showName].intro_to;

                    clearInterval(intervals.intro);
                    if (settings[showName].intro_to != 0) {
                        intervals.intro = setInterval(function () {
                            if (youtube.elapsed() >= settings[showName].intro_from) {
                                youtube.skipTo(settings[showName].intro_to);
                                clearInterval(intervals.intro);
                            }
                        }, 1000);
                    }
                }
                else if (showName != 'default')
                    youtube.listen_intro('default');
            });
        },
        listen_outro: function (showName) {
            var youtube = this;

            chrome.storage.sync.get(showName, function (settings) {
                if (settings[showName].outro != undefined) {
                    youtube.outro = settings[showName].outro;

                    clearInterval(intervals.outro);
                    intervals.outro = setInterval(function () {
                        if (youtube.elapsed() >= youtube.duration() - settings[showName].outro && youtube.duration() > 0 && settings[showName].outro != -1) {
                            youtube.clearSavedElapsed();
                            chrome.storage.sync.get('countdown', function (countdown) {
                                if (countdown.countdown != 1 && countdown.countdown != 0) {
                                    win.setEpisodeToNext(function () {
                                        clearInterval(intervals.outro);
                                        chromeapi.setCountdown(countdown.countdown - 1, win.nextEpisode);
                                    });
                                }
                                else {
                                    clearInterval(intervals.outro);
                                    chromeapi.setCountdown(undefined);
                                    youtube.video.pauseVideo();
                                }
                            });
                        }
                    }, 1000);
                }
                else if (showName != 'default')
                    youtube.listen_outro('default');
            });
        },
        listen_watched: function (watched, callback) {
            var youtube = this;

            clearInterval(intervals.watched);
            intervals.watched = setInterval(function () {
                if (youtube.elapsed() >= youtube.duration() - watched && youtube.duration() > 0) {
                    clearInterval(intervals.watched);
                    youtube.clearSavedElapsed();
                    if (callback)
                        callback();
                }
            }, 10000);
        },
        saveElapsed: function () {
            updateExtensionStorageObject('sync', [win.getShowName(), 'last', 'time'], youtube.elapsed());
        },
        clearSavedElapsed: function () {
            clearInterval(intervals.saveElapsed);
            updateExtensionStorageObject('sync', [win.getShowName(), 'last', 'time'], 0);
        },
        jumpToSavedElapsed: function () {
            var youtube = this;
            setTimeout(function () {
                chrome.storage.sync.get(win.getShowName(), function (settings) {
                    intervals.saveElapsed = setInterval(youtube.saveElapsed, 15000);
                    chromeapi.isPropertyEnabled_DefaultOn('settings:settings:continue', function () {
                        var time = settings[win.getShowName()].last.time;
                        if (time) {
                            if (time > settings[win.getShowName()].intro_from) {
                                clearInterval(intervals.intro);
                            }
                            youtube.skipTo(time);
                            win.displayMsg('Continuing from last point watched');
                        }
                    });
                })
            }, 2500);
        },
        duration: function () {
            if (this.isPlayerReady())
                return this.video.getDuration();
        },
        elapsed: function () {
            if (this.isPlayerReady())
                return this.video.getCurrentTime();
        },
        setQualityToHigh: function () {
            var qualities = ['highres', 'hd1080', 'hd720', 'large', 'medium', 'small'];
            var availableQualities = this.video.getAvailableQualityLevels();

            for (var i = 0; i < availableQualities.length; i++) {
                if (qualities.indexOf(availableQualities[i]) != -1) {
                    this.video.setPlaybackQuality(availableQualities[i]);
                    break;
                }
            }

        },
        isPlayerReady: function () {
            return this.video.playVideo != undefined;
        },
        skipTo: function (duration) {
            if (this.isPlayerReady()) {
                this.play();

                if (typeof duration == 'string') {
                    if (duration[0] == '-' || duration[0] == '+') {
                        win.displayMsg(duration + ' time');
                        duration = eval(this.elapsed() + duration[0] + parseInt(duration.substring(1)));
                    }
                }
                else {
                    duration = parseInt(duration);
                    win.displayMsg(toHHMMSS(duration));
                }

                statusBar.updateElapsed(this.timeToPercent(duration));
                this.video.seekTo(duration, true);
            }
        },
        muteVolume: 50,
        getVolume: function () {
            if (this.isPlayerReady()) {
                return this.video.getVolume();
            }
        },
        setVolume: function (volume) {
            if (this.isPlayerReady()) {
                if (typeof volume == 'string') {
                    var currentVolume = this.getVolume();
                    if (volume[0] == '-' || volume[0] == '+')
                        volume = eval(currentVolume + volume[0] + parseInt(volume.substring(1)));
                }
                volume = parseInt(volume);
                if (volume < 0)
                    volume = 0;
                else if (volume > 100)
                    volume = 100;

                statusBar.setVolume(volume);
                this.video.setVolume(volume);

                if (volume == 0)
                    volume = 'Muted';
                else
                    volume = volume + ' volume';

                win.displayMsg(volume, 1770);
            }
        },
        percentToTime: function (percent) {
            return ((this.duration() / 100) * percent);
        },
        timeToPercent: function (time) {
            return ((time / this.duration()) * 100);
        },
        isMuted: function () {
            if (this.isPlayerReady()) {
                return this.getVolume() == 0;
            }
        },
        toggleMute: function () {
            if (this.isPlayerReady()) {
                if (this.isMuted()) {
                    this.unmute();
                }
                else {
                    this.mute();
                }
            }
        },
        mute: function () {
            if (this.isPlayerReady()) {
                this.muteVolume = this.getVolume();
                this.setVolume(0);
            }
        },
        unmute: function () {
            if (this.isPlayerReady()) {
                this.setVolume(this.muteVolume);
            }
        },
        getBuffered: function () {
            if (this.isPlayerReady()) {
                return this.video.getVideoLoadedFraction() * 100;
            }
        }
    };

    var html = {
        playerType: 'html5',
        opacity: 1,
        init: function (callback) {
            var youtube = this;


            this.video = getPlayer();
            if (!win.isMovie()) {
                chromeapi.isPropertyEnabled_DefaultOn('settings:settings:intro', function () {
                    youtube.listen_intro(win.getShowName());
                });
                chromeapi.isPropertyEnabled_DefaultOn('settings:settings:outro', function () {
                    youtube.listen_outro(win.getShowName());

                    if (callback)
                        callback();
                }, callback || function () {
                });
            }
            this.listen_watched(300, function () {
                chromeapi.isPropertyEnabled_DefaultOff('mal-auth', win.addEpisodeToMAL);
                chromeapi.isPropertyEnabled_DefaultOff('hummingbird-auth', win.addEpisodeToHummingBird);
                win.setEpisodeToNext();
            });
            this.loadVolume();
            this.play();
        },
        togglePlayState: function () {
            if (!this.video.paused) {
                this.pause();
            } else {
                this.play();
            }
        },
        isPaused: function () {
            if (this.video.paused)
                return true;
            else return false;
        },
        pause: function () {
            this.video.pause();
            win.displayMsg('Pause');
            win.displaySynopsis();
            statusBar.onPause();
        },
        play: function () {
            this.video.play();
            win.displayMsg('Play');
            win.undisplaySynopsis();
            statusBar.onPlay();
        },
        listen_intro: function (showName) {
            var youtube = this;

            chrome.storage.sync.get(showName, function (settings) {
                if (settings[showName].intro_from != undefined) {
                    youtube.intro_from = settings[showName].intro_from;
                    youtube.intro_to = settings[showName].intro_to;

                    clearInterval(intervals.intro);
                    if (settings[showName].intro_to != 0) {
                        intervals.intro = setInterval(function () {
                            if (youtube.elapsed() >= settings[showName].intro_from) {
                                youtube.skipTo(settings[showName].intro_to);
                                clearInterval(intervals.intro);
                            }
                        }, 1000);
                    }
                }
                else if (showName != 'default')
                    youtube.listen_intro('default');
            });
        },
        listen_outro: function (showName) {
            var youtube = this;

            chrome.storage.sync.get(showName, function (settings) {
                if (settings[showName].outro != undefined) {
                    youtube.outro = settings[showName].outro;

                    clearInterval(intervals.outro);
                    intervals.outro = setInterval(function () {
                        if (youtube.elapsed() >= youtube.duration() - settings[showName].outro && youtube.duration() > 0 && settings[showName].outro != -1) {
                            chrome.storage.sync.get('countdown', function (countdown) {
                                youtube.clearSavedElapsed();
                                if (countdown.countdown != 1 && countdown.countdown != 0) {
                                    win.setEpisodeToNext(function () {
                                        clearInterval(intervals.outro);
                                        chromeapi.setCountdown(countdown.countdown - 1, win.nextEpisode);
                                    });
                                }
                                else {
                                    clearInterval(intervals.outro);
                                    chromeapi.setCountdown(undefined);
                                    youtube.pause();
                                }
                            });
                        }
                    }, 1000);
                }
                else if (showName != 'default')
                    youtube.listen_outro('default');
            });
        },
        listen_watched: function (watched, callback) {
            var youtube = this;

            clearInterval(intervals.watched);
            intervals.watched = setInterval(function () {
                if (youtube.elapsed() >= youtube.duration() - watched && youtube.duration() > 0) {
                    clearInterval(intervals.watched);
                    youtube.clearSavedElapsed();

                    if (callback)
                        callback();
                }
            }, 10000);
        },
        saveElapsed: function () {
            updateExtensionStorageObject('sync', [win.getShowName(), 'last', 'time'], youtube.elapsed());
        },
        clearSavedElapsed: function () {
            clearInterval(intervals.saveElapsed);
            updateExtensionStorageObject('sync', [win.getShowName(), 'last', 'time'], 0);
        },
        duration: function () {
            if (this.isPlayerReady())
                return this.video.duration;
        },
        elapsed: function () {
            if (this.isPlayerReady())
                return this.video.currentTime;
        },
        isPlayerReady: function () {
            return this.video.play != undefined;
        },
        skipTo: function (duration) {
            if (this.isPlayerReady()) {
                this.play();

                if (typeof duration == 'string') {
                    if (duration[0] == '-' || duration[0] == '+') {
                        win.displayMsg(duration + ' time');
                        duration = eval(this.elapsed() + duration[0] + parseInt(duration.substring(1)));
                    }
                }
                else {
                    duration = parseInt(duration);
                    win.displayMsg(toHHMMSS(duration));
                }

                statusBar.updateElapsed(this.timeToPercent(duration));
                this.video.currentTime = duration;
            }
        },
        muteVolume: 50,
        getVolume: function () {
            if (this.isPlayerReady()) {
                return this.video.volume * 100;
            }
        },
        setVolume: function (volume) {
            if (this.isPlayerReady()) {
                var toVolume = volume;
                if (typeof volume == 'string') {
                    var currentVolume = this.getVolume();
                    toVolume = parseFloat(volume.substring(1));
                    if (volume[0] == '-' || volume[0] == '+')
                        toVolume = eval(currentVolume + volume[0] + toVolume);
                }


                toVolume = parseInt(toVolume);
                toVolume = toVolume / 100;
                if (toVolume < 0)
                    toVolume = 0;
                else if (toVolume > 1)
                    toVolume = 1;

                this.saveVolume(toVolume*100);
                statusBar.setVolume(toVolume * 100);
                this.video.volume = (toVolume);

                if (toVolume == 0)
                    toVolume = 'Muted';
                else
                    toVolume = Math.ceil((toVolume * 100)) + ' volume';

                win.displayMsg(toVolume, 1770);
            }
        },
        saveVolume: function (volume) {
            chrome.storage.sync.set({volume: volume});
        },
        loadVolume: function () {
            var youtube = this;

            chrome.storage.sync.get('volume', function (volume) {
                volume = volume.volume;
                if (volume != undefined) {
                    youtube.setVolume(volume);
                }
            })
        },
        percentToTime: function (percent) {
            if (percent != undefined)
                return (this.duration() / 100) * percent;
        },
        timeToPercent: function (time) {
            if (time != undefined)
                return ((time / this.duration()) * 100);
        },
        isMuted: function () {
            if (this.isPlayerReady()) {
                return this.getVolume() == 0;
            }
        },
        toggleMute: function () {
            if (this.isPlayerReady()) {
                if (this.isMuted()) {
                    this.unmute();
                }
                else {
                    this.mute();
                }
            }
        },
        mute: function () {
            if (this.isPlayerReady()) {
                this.muteVolume = this.getVolume();
                this.setVolume(0);
            }
        },
        unmute: function () {
            if (this.isPlayerReady()) {
                this.setVolume(this.muteVolume);
            }
        },
        getBuffered: function () {
            if (this.isPlayerReady()) {
                if (this.video.buffered.length < 1000000 && this.video.buffered.length > 0) {
                    return (this.video.buffered.end(this.video.buffered.length - 1) / this.video.duration) * 100;
                }
            }
        }
    };

    newVideo = function () {
        if ($('embed')[0]) {
            return youtube;
        }
        else {
            return html;
        }
    };
})();