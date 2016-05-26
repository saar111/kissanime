var timeouts = {};
var intervals = {};
var gSettings = {};
var path = 'chrome-extension://' + chrome.runtime.id + '/';

function getPlayer() {
    return $('embed')[0] || $('video')[0];
}
function getBackground() {
    return $('embed')[0] || $('video').parent()[0];
}

var youtube;
var statusBar = {
    init: function (callback) {
        var status = this;

        this.dragging = false;
        this.createStatus();
        this.attachListeners();
        this.setDuration();
        intervals.status = setInterval(function () {
            status.updateStatus()
        }, 1000);

        if (callback)
            callback();
    },
    createStatus: function () {
        var statusBar = this;

        var status = document.createElement('div');
        status.id = 'automator-status';
        status.setAttribute('style', '-webkit-user-select:none;opacity:0;transition:0.2s;position:absolute;background-color:#1B1B1B;font-family:\'Arial\';z-index:9999999;');
        this.status = status;
        statusBar.placeStatus();
        setTimeout(function () {
            statusBar.placeStatus();
        }, 1000);

        var progress = document.createElement('div');
        progress.id = 'automator-progress-bar';
        progress.setAttribute('style', 'height:8px;width:100%;background-color:#444444;');
        this.progress = progress;
        var buffered = document.createElement('div');
        buffered.id = 'automator-progress-bar-buffered';
        buffered.setAttribute('style', 'display:inline-block;position:absolute;width:0px;background-color:rgb(178, 183, 194);height:inherit;transition:0.1s;');
        this.buffered = buffered;
        var elapsed = document.createElement('div');
        elapsed.id = 'automator-progress-bar-elapsed';
        elapsed.setAttribute('style', 'display:inline-block;position:absolute;width:0px;background-color:#CC181E;height:inherit;transition:0s;');
        this.elapsed = elapsed;
        var indicator = document.createElement('img');
        indicator.id = 'automator-indicator';
        indicator.src = path + 'images/progress-bar-indicator.png';
        indicator.setAttribute('style', 'pointer-events:none;position:absolute;right:-8px;top:-8px;width:22px;');
        this.indicator = indicator;
        elapsed.appendChild(indicator);
        $(progress).append(buffered, elapsed);

        var statusText = document.createElement('div');
        statusText.id = 'automator-status-text;';
        statusText.setAttribute('style', 'height:20px;width:100%;padding-top:4px;font-weight:700;font-size:9pt;');
        this.statusText = indicator;
        var playState = document.createElement('img');
        playState.id = 'automator-play-state';
        playState.src = path + 'images/pause.svg';
        playState.setAttribute('style', 'padding-left:9px;float:left;width:12px;cursor:pointer;');
        playState.title = 'Pause';
        this.playState = playState;
        var elapsedText = document.createElement('div');
        elapsedText.id = 'automator-status-text-elapsed';
        elapsedText.setAttribute('style', 'display:inline-block;padding-left:23px;color:whitesmoke;position: relative;top: -1px;');
        elapsedText.innerHTML = '00:00';
        this.elapsedText = elapsedText;
        var duration = document.createElement('div');
        duration.id = 'automator-status-duration';
        duration.setAttribute('style', 'display:inline-block;color:grey;position: relative;top: -1px;');
        this.duration = duration;
        var slash = document.createElement('div');
        slash.setAttribute('style', 'display:inline-block;font-size:11pt;position: relative;top: 0px;padding-left:4px;padding-right:4px;');
        slash.innerHTML = '/';
        var durationText = document.createElement('div');
        durationText.id = 'automator-status-duration-text';
        durationText.setAttribute('style', 'display:inline-block;position: relative;top: 0px;');
        durationText.innerHTML = '--:--';
        this.durationText = durationText;
        var volumeContainer = document.createElement('div');
        volumeContainer.id = 'automator-status-volume-container';
        volumeContainer.setAttribute('style', 'display:inline-block;position: relative;top: 2px;padding-left: 20px;');
        this.volumeContainer = volumeContainer;
        var volumeImg = document.createElement('img');
        volumeImg.id = 'automator-status-volume-image';
        volumeImg.src = path + 'images/volume.svg';
        volumeImg.setAttribute('style', 'display:inline-block;position: relative;top: 0px;width:19px;cursor:pointer;');
        this.volumeImg = volumeImg;
        var volumeBar = document.createElement('div');
        volumeBar.id = 'automator-status-volume-bar';
        volumeBar.setAttribute('style', 'display: inline-block;position: relative;top: -6px;width: 50px;height: 3px;width: 50px;margin-left: 7px;padding-top:10px;padding-bottom:10px;cursor:pointer;');
        this.volumeBar = volumeBar;
        var volumeBackground = document.createElement('div');
        volumeBackground.id = 'automator-status-volume-background';
        volumeBackground.setAttribute('style', 'display: inline-block;position: absolute;width: 50px;height: 3px;width: 50px;background-color:rgb(75, 75, 75);');
        this.volumeBackground = volumeBackground;
        var currentVolume = document.createElement('div');
        currentVolume.id = 'automator-status-volume-current';
        currentVolume.setAttribute('style', 'display: inline-block;position: relative;top: 0px;width: 100%;height: 3px;background-color: rgb(94, 225, 247);');
        this.currentVolume = currentVolume;
        this.setVolume();
        var volumeIndicator = document.createElement('div');
        volumeIndicator.id = 'automator-status-volume-indicator';
        volumeIndicator.setAttribute('style', 'height: 14px;width: 4px;position: absolute;top: -5px;right: 0;background-color: rgb(75, 75, 75);pointer-events:none;');
        this.volumeIndicator = volumeIndicator;
        $(currentVolume).append(volumeIndicator);
        $(volumeBar).append(volumeBackground, currentVolume);
        $(volumeContainer).append(volumeImg, volumeBar);

        var skipForward = document.createElement('div');
        skipForward.id = 'automator-status-skip-forward';
        skipForward.setAttribute('style', 'float:right;cursor:pointer;');
        skipForward.title = 'Next episode';
        skipForward.click = win.nextEpisode;
        this.skipForward = skipForward;
        var skipForwardImg = document.createElement('img');
        skipForwardImg.id = 'automator-status-skip-forward-image';
        skipForwardImg.src = path + 'images/skip-forward.png';
        skipForwardImg.setAttribute('style', 'display:inline-block;position: relative;top: 0px;width:16px;position:relative;top:1px;cursor:pointer;');
        this.skipForwardImg = skipForwardImg;
        skipForward.appendChild(skipForwardImg);
        var skipBackward = document.createElement('div');
        skipBackward.id = 'automator-status-skip-backward';
        skipBackward.setAttribute('style', 'float:right;cursor:pointer;');
        skipBackward.title = 'Previous episode';
        skipBackward.onclick = win.previousEpisode;
        this.skipBackward = skipBackward;
        var skipBackwardImg = document.createElement('img');
        skipBackwardImg.id = 'automator-status-skip-backward-image';
        skipBackwardImg.src = path + 'images/skip-backward.png';
        skipBackwardImg.setAttribute('style', 'display:inline-block;position: relative;top: 0px;width:16px;position:relative;top:1px;cursor:pointer;padding-right:4px;');
        this.skipBackwardImg = skipBackwardImg;
        skipBackward.appendChild(skipBackwardImg);

        var fullscreen = document.createElement('div');
        fullscreen.id = 'automator-status-fullscreen';
        fullscreen.setAttribute('style', 'float:right;cursor:pointer;');
        fullscreen.title = 'Fullscreen';
        fullscreen.click = win.toggleFullScreen();
        this.fullscreen = fullscreen;
        var fullscreenImg = document.createElement('img');
        fullscreenImg.id = 'automator-status-fullscreen-img';
        fullscreenImg.setAttribute('style', 'float:right;cursor:pointer;width:14px;position:relative;top:2px;padding-right:10px;padding-left:19px;');
        fullscreenImg.src = path + 'images/fullscreen.svg';
        this.fullscreenImg = fullscreen;
        fullscreen.appendChild(fullscreenImg);

        $(duration).append(slash, durationText);
        $(statusText).append(playState, elapsedText, duration, volumeContainer, fullscreen, skipForward, skipBackward);


        var timeIndicatorContainer = document.createElement('div');
        timeIndicatorContainer.id = 'automator-status-time-indicator-container';
        timeIndicatorContainer.setAttribute('style', 'display: inline-block;text-align: center;position:absolute;top: -29px;font-family:serif;pointer-events:none;opacity:0;transition:0s;');
        this.timeIndicator = timeIndicatorContainer;
        var timeIndicatorBox = document.createElement('div');
        timeIndicatorBox.id = 'automator-status-time-indicator-time';
        timeIndicatorBox.setAttribute('style', 'background-color: rgba(50,50,50,0.7);display: block;padding: 2px 3px 1px 3px;font-size:10pt;font-weight:bolder;');
        timeIndicatorBox.innerText = '00:00';
        this.timeIndicatorBox = timeIndicatorBox;
        var timeIndicatorArrow = document.createElement('div');
        timeIndicatorArrow.id = 'automator-status-time-indicator-arrow';
        timeIndicatorArrow.setAttribute('style', 'width: 0;height: 7px;display: inline-block;position: relative;border-top: 7px solid rgba(50, 50, 50, 0.7);border-right: 6px solid transparent;border-left: 6px solid transparent;');
        $(timeIndicatorContainer).append(timeIndicatorBox, timeIndicatorArrow);

        $(status).append(progress, statusText, timeIndicatorContainer);
        document.body.appendChild(status);
    },
    attachListeners: function () {
        var status = this;
        $(this.status).hover(function () {
            status.show(null);
        }, function () {
            if (!youtube.isPaused())
                status.hide(600);
        })
            .mouseup(function () {
                status.dragging_progress = false;
                status.dragging_volume = false;
            })
            .mousemove(function () {
                status.show(null);
            });
        $(this.playState).mousedown(function () {
            youtube.togglePlayState();
        });
        $(this.progress)
            .mousedown(function (e) {
                if (e.which == 1) {
                    status.dragging_progress = true;

                    var percentage = (e.offsetX / $(this).width()) * 100;
                    youtube.skipTo(youtube.percentToTime(percentage));
                }
            })
            .mousemove(function (e) {
                var percentage = (e.offsetX / $(this).width()) * 100;
                status.indicateTime(percentage);

                if (status.dragging_progress) {
                    youtube.skipTo(youtube.percentToTime(percentage));
                }
            })
            .mouseup(function () {
                status.closeTimeIndicator();
                status.dragging_progress = false;
            })
            .mouseout(function () {
                status.closeTimeIndicator();
                status.dragging_progress = false;
            });

        $(this.volumeBar)
            .mousedown(function (e) {
                if (e.which == 1) {
                    status.dragging_volume = true;
                    var volume = (e.offsetX / $(this).width()) * 100;
                    youtube.setVolume(volume);
                }
            })
            .mousemove(function (e) {
                if (status.dragging_volume) {
                    var volume = (e.offsetX / $(this).width()) * 100;
                    youtube.setVolume(volume);
                }
            })
            .mouseup(function () {
                status.dragging_volume = false;
            })
            .mouseout(function () {
                //status.dragging_volume = false;
            });
        $(this.volumeImg).mousedown(function () {
            youtube.toggleMute();
        });
        $(this.fullscreen).click(function () {
            win.toggleFullScreen();
        });
        $(this.skipForward).click(function () {
            win.nextEpisode();
        });
        //    $(this.fullscreen).click(function(){win.toggleFullScreen();});
    },
    updateStatus: function (percent) {
        var updateTo = youtube.percentToTime(percent) || youtube.elapsed();
        this.updateElapsed(youtube.timeToPercent(updateTo));
        this.updateElapsedText(updateTo);
        this.updateBuffered();

        //this.updateIndicator(youtube.timeToPercent(updateTo));
    },
    updateElapsed: function (percent) {
        this.elapsed.style.width = percent + '%';
    },
    updateElapsedText: function (time) {
        this.elapsedText.innerHTML = toHHMMSS(parseInt(time));
    },
    updateBuffered: function () {
        $(this.buffered).css('width', youtube.getBuffered() + '%');
    },
    placeStatus: function () {
        $(this.status).css({
            top: (($(getPlayer()).offset().top + $(getPlayer()).height()) - 32) + 'px',
            width: $(getPlayer()).width() + 'px',
            left: $(getPlayer()).offset().left + 'px'
        });
    },
    setDuration: function () {
        var statusBar = this;

        clearInterval(intervals.duration);
        intervals.duration = setInterval(function () {
            if (youtube.duration()) {
                clearInterval(intervals.duration);
                statusBar.durationText.innerHTML = toHHMMSS(parseInt(youtube.duration()));
            }
        }, 500);
    },
    show: function (duration) {
        this.updateStatus();

        if (duration !== null)
            duration = duration || 800;

        var status = this;
        status.status.style.opacity = youtube.opacity;

        clearTimeout(timeouts.showStatus);
        clearTimeout(timeouts.hideStatus);
        if (duration) {
            timeouts.showStatus = setTimeout(function () {
                if (!youtube.isPaused())
                    status.hide();
            }, duration)
        }
    },
    hide: function (timeout) {
        var status = this;

        clearTimeout(timeouts.hideStatus);
        clearTimeout(timeouts.showStatus);
        timeouts.hideStatus = setTimeout(function () {
            status.status.style.opacity = 0;
        }, timeout || 0)
    },
    onPause: function () {
        this.show(null);
        this.playState.src = path + 'images/play.svg';
        this.playState.title = 'Play';
    },
    onPlay: function () {
        this.hide(300);
        if (this.playState) {
            this.playState.src = path + 'images/pause.svg';
            this.playState.title = 'Pause';
        }
    },
    setVolume: function (volume) {
        volume = volume == undefined ? youtube.getVolume() : volume;
        this.currentVolume.style.width = volume + '%';
    },
    indicateTime: function (percentage) {
        var left = (($(this.timeIndicator).parent().width() / 100) * percentage) - ($(this.timeIndicator).width() / 2);
        $(this.timeIndicator).css({opacity: 1, left: left + 'px'});
        $(this.timeIndicatorBox).text(toHHMMSS(youtube.percentToTime(percentage)));
    },
    closeTimeIndicator: function () {
        $(this.timeIndicator).css({opacity: 0});
    },
    reset: function () {
        this.placeStatus();
    }
};
var player = {
    init: function (callback) {
        var player = this;

        this.fullscreen = true;
        this.background = getBackground();
        this.video = getPlayer();
        chromeapi.isPropertyEnabled_DefaultOn('settings:settings:fullscreen', function () {
            player.setFullscreen();

            if (callback)
                callback();
        }, function () {
            player.fullscreen = false;

            if (callback)
                callback();
        });
    },
    setFullscreen: function () {
        this.setPlayerSize();
        this.setPlayerPosition();
        this.setZIndex();
    },
    scrollToPlayer: function () {
        window.scrollTo(0, Math.ceil($(this.background).offset().top));
    },
    setPlayerSize: function () {
        this.background.style.width = window.innerWidth + 'px';
        this.background.style.height = window.innerHeight + 'px';
    },
    setPlayerPosition: function () {
        this.background.style.position = 'absolute';
        this.background.style.left = (-($(this.video).offset().left)) + 'px';
        //this.video.style.top =  (-($(this.video).offset().top)) + 'px';
    },
    setZIndex: function () {
        this.background.style.zIndex = 999;
        this.video.style.zIndex = 9999;
    },
    onPlayerReady: function (callback) {
        clearInterval(intervals.checkPlayer);
        intervals.checkPlayer = setInterval(function () {
            if (getPlayer() != undefined) {
                if (getPlayer().pauseVideo != undefined || getPlayer().pause != undefined) {
                    clearInterval(intervals.checkPlayer);
                    callback();
                }
            }
        }, 100);
    },
    onPlayerDOMReady: function (callback) {
        clearInterval(intervals.checkPlayerDOM);
        intervals.checkPlayerDOM = setInterval(function () {
            if (getPlayer() != undefined) {
                clearInterval(intervals.checkPlayerDOM);

                if (callback)
                    callback();
            }
        }, 100);
    },
    swapPlayer: function (callback) {
        var video = getPlayer();
        if (video.src.indexOf('youtube') != undefined) {
            video.src += '&autohide=1';
            $(video).parent().append(video);
            this.onPlayerDOMReady(callback);
        }
    },
    resetPlayer: function () {
        if (this.fullscreen) {
            this.background.style.left = 0;
            this.background.style.top = 0;
            this.setFullscreen();
        }
    }
};
var win = {
    init: function (callback) {
        var win = this;

        this.movie = this.isMovie();
        this.mouseProcs = 0;
        this.prepareMsgDiv();
        this.createBlocker();
        this.updateLatestEpisode();

        this.initEventHandlers();
        this.createMouse();
        chromeapi.isPropertyEnabled_DefaultOff('settings:settings:fillers', function () {
            fillers.isFiller(win.getShowName(), win.getEpisode(), function (show, episode) {

                win.displayMsg('Skipping Fillers', 2500, '90pt', function () {
                    win.skipToEpisode(show, episode);
                });
                win.blockMsgs = true;
            });
        });

        if (callback)
            callback();
    },
    initEventHandlers: function () {
        var win = this;
        chromeapi.isPropertyEnabled_DefaultOn('settings:settings:shortcuts', function () {
            var ctrl = false;
            $(document, getPlayer(), document.body, win.blocker, window).on('keydown', function (e) {
                if (document.activeElement == document || document.activeElement == document.body || document.activeElement == getPlayer() || document.activeElement == win.blocker || document.activeElement == window) {
                    if (keyCodes.CTRL == e.keyCode) {
                        ctrl = true;
                    }

                    if (e.keyCode == keyCodes.SPACE) {
                        youtube.togglePlayState();
                        e.preventDefault();
                    }
                    else if (e.keyCode == keyCodes.LEFT_ARROW) {
                        youtube.skipTo('-5');
                        statusBar.show();
                    }
                    else if (e.keyCode == keyCodes.RIGHT_ARROW) {
                        youtube.skipTo('+5');
                        statusBar.show();
                    }
                    else if (e.keyCode == keyCodes.UP_ARROW) {
                        youtube.setVolume('+5');
                        e.preventDefault();
                    }
                    else if (e.keyCode == keyCodes.DOWN_ARROW) {
                        youtube.setVolume('-5');
                        e.preventDefault();
                    }
                    else if (keyCodes.NUMBERS.CONTAINS(e.keyCode - 48)) {
                        chromeapi.setCountdown(e.keyCode - 48);
                        win.displayMsg((e.keyCode - 48) + (' Countdown'), 1100);
                        e.preventDefault();
                    }
                    else if (keyCodes.TILDE == e.keyCode) {
                        chromeapi.setCountdown(undefined);
                        win.displayMsg('Stopped Countdown', undefined, '29pt');
                    }
                    else if (keyCodes.F11 == e.keyCode) {
                        //   win.toggleFullScreen();
                        //  e.preventDefault();
                    }
                    else if (ctrl && keyCodes.DOT == e.keyCode) {
                        win.nextEpisode();
                    }
                    else if (ctrl && keyCodes.COMMA == e.keyCode) {
                        win.previousEpisode();
                    }
                    else if (keyCodes.ESC == e.keyCode) {
                        window.scroll(0, 0);
                    }
                    else if (keyCodes.V == e.keyCode) {
                        player.scrollToPlayer();
                    }
                    else if (keyCodes.C == e.keyCode) {
                        chrome.storage.sync.get('countdown', function (countdown) {
                            if (countdown.countdown) {
                                win.displayMsg(countdown.countdown + (' Countdown'), 1500, '47pt');
                            }
                            else {
                                win.displayMsg(('Countdown Closed'), 1500, '47pt');
                            }
                        });
                    }
                    else if (keyCodes.M == e.keyCode) {
                        youtube.toggleMute();
                    }
                    else if (keyCodes.I == e.keyCode) {
                        clearInterval(intervals.intro);
                        win.displayMsg('Disabled intro skipping');
                    }
                    else if (keyCodes.O == e.keyCode) {
                        clearInterval(intervals.outro);
                        win.displayMsg('Disabled episode skipping');
                    }
                    else if (keyCodes.S == e.keyCode) {
                        win.toggleSynopsis();
                    }
                }
            }).keyup(function (e) {
                if (keyCodes.CTRL == e.keyCode) {
                    ctrl = false;
                }
            });
        });
        $(document).on('mousewheel', function () {
            clearTimeout(timeouts.scrollToPlayer)
        });
        $(window).on('resize', function () {
            clearTimeout(timeouts.delayResize);
            timeouts.delayResize = setTimeout(function () {
                restart();
            }, 0);
        });
        $(document).on('click', function (e) {
            if (e.which == 2) {
                $('#automator-blocker').css('pointer-events', 'all');
            }
        });
        $(this.blocker).mousemove(function (e) {      //Mouse handler
            win.mouseProcs++;
            clearTimeout(timeouts.mouseProcsTimeWindow);
            timeouts.mouseProcsTimeWindow = setTimeout(function () {
                win.mouseProcs = 0;
            }, 1000);

            if (win.mouseProcs >= 25) {
                $(win.mouse).css({left: e.pageX + 'px', top: e.pageY + 'px', opacity: 1});
                statusBar.show(1100);

                clearTimeout(timeouts.mouseProcsReset);
                timeouts.mouseProcsReset = setTimeout(function () {
                    win.mouseProcs = 0;
                }, 350);
                clearTimeout(timeouts.mouse);
                timeouts.mouse = setTimeout(function () {
                    $(win.mouse).css('opacity', 0);
                }, 350);
            }
        });
        $(this.blocker).mouseout(function () {
            $(win.mouse).css('opacity', 0);
        });

    },
    createMouse: function () {
        var mouse = document.createElement('img');
        mouse.src = path + "images/Mouse-Pointer.png";
        mouse.setAttribute('style', 'position:absolute;left:0;top:0;z-index:9999999999999999999999;width:12px;pointer-events:none;opacity:0;');

        document.body.appendChild(mouse);
        this.mouse = mouse;
    },
    createBlocker: function () {
        var blocker = document.createElement('div');
        blocker.id = 'automator-blocker';
        blocker.setAttribute('style', 'cursor:none;position:absolute;left:' + $(player.video).offset().left + 'px;top:' + $(player.video).offset().top + 'px;height:' + (parseInt(getComputedStyle(player.video).height)) + 'px' + ';width:' + getComputedStyle(player.video).width + ';z-index :' + (getComputedStyle(player.video).zIndex + 1) + ';');
        $(blocker).on('mousedown', function (e) {
            if (e.which == 1) {
                youtube.togglePlayState();
            }
            if (e.which == 2) {
                this.style.pointerEvents = 'none';
                e.preventDefault();
            }
        });
        this.blocker = blocker;

        document.body.appendChild(blocker);
    },
    isMovie: function (url) {
        url = url || document.location.pathname;
        url = url.replace('/Anime/', '');
        url = url.substring(url.indexOf('/') + 1);
        return url.toLowerCase().indexOf('movie') != -1;
    },
    getShowName: function (method) {
        method = method || function () {
            var showName = document.location.pathname;
            showName = showName.replace('/Anime/', '');
            showName = showName.substring(0, showName.indexOf('/'));
            showName = showName.replace(/-/g, ' ');

            return showName.toLowerCase();
        };

        return method();
    },
    getEpisode: function (url) {
        var episode = url || document.location.pathname;
        episode = episode.replace('http://kissanime.to', '');
        episode = episode.replace('/Anime/', '');
        episode = episode.substring(episode.indexOf('/') + 1);
        if (episode.toLowerCase().indexOf('movie') != -1)
            return 'movie';
        episode = episode.substring(episode.indexOf('-') + 1);


        return parseInt(episode);
    },
    removeSubDub: function (show) {
        return show.replace(/(.dub)|(.Dub)|(.sub)|(.Sub)/g, '');
    },
    nextEpisode: function () {
        var self = win || this;
        youtube.clearSavedElapsed();

        var btnNext = $('#btnNext');
        if (self.isLastEpisode()) {
            alert('You have finished: ' + win.getShowName().titalize());
            self.finishedShow();
            youtube.pause();
        }
        else {
            btnNext.click();
        }

    },
    previousEpisode: function () {
        youtube.clearSavedElapsed();

        var btnPrev = $('#btnPrevious');
        if (btnPrev.length == 0) {
        }
        else {
            btnPrev.click();
        }
    },
    starting: function () {
        var insertImageNO = 0;

        clearInterval(intervals.icon);
        intervals.icon = setInterval(function () {
            insertImageNO = (insertImageNO + 1) % 7;
        }, 400);
    },
    finished: function () {
        clearInterval(intervals.icon);
    },
    updateLatestEpisode: function (episode) {
        var win = this;

        chrome.storage.sync.get(this.getShowName(), function (settings) {
            if (settings[win.getShowName()]) {
                if (settings[win.getShowName()].last) {
                    if ((settings[win.getShowName()].last.episode || 0) <= win.getEpisode()) {
                        if (win.isLastEpisode()) {
                            win.finishedShow();
                        }
                        updateExtensionStorageObject('sync', [win.getShowName(), 'last'], {
                            url: document.location.href,
                            episode: win.getEpisode()
                        });
                    }
                }
                else {
                    updateExtensionStorageObject('sync', [win.getShowName(), 'last'], {
                        url: document.location.href,
                        episode: win.getEpisode()
                    });
                }
            }
        })
    },
    setEpisodeToNext: function (callback) {
        var url = $('#btnNext');

        if (url.length > 0) {
            url = url.parent()[0].href;
            var episode = this.getEpisode(url);

            updateExtensionStorageObject('sync', [win.getShowName(), 'last'], {
                url: url,
                episode: episode,
                time: 0
            }, callback || function () {
            });
        }
        else if (callback)
            callback();
    },
    reset: function () {
        var blocker = this.blocker;
        if (blocker) {
            blocker.style.top = $(player.video).offset().top + 'px';
            blocker.style.left = $(player.video).offset().left + 'px';
            blocker.style.height = (parseInt(getComputedStyle(player.video).height)) + 'px';
            blocker.style.width = getComputedStyle(player.video).width;
        }

        var synopsisDiv = this.synopsis;
        $(synopsisDiv).css({
            top: ( (( ($(getPlayer()).offset().top + $(getPlayer()).height()) - ($(synopsisDiv).height() + parseInt($(synopsisDiv).css('padding-top')) + parseInt($(synopsisDiv).css('padding-bottom'))) ) - 32 ) + 'px' )
        });     //Determine top
    },
    addEpisodeToMAL: function () {
        var self = win || this;
        chrome.storage.sync.get('mal-user-info', function (user) {
            user = user['mal-user-info'];
            mal.addEpisode(user.username, self.decryptString(user.password), self.getShowName(), self.getEpisode())
        });
    },
    addEpisodeToHummingBird: function () {
        var self = win || this;
        chrome.storage.sync.get('hummingbird-user-info', function (user) {
            user = user['hummingbird-user-info'];
            hummingbird.addEpisode(user.username, self.decryptString(user.password), self.getShowName(), self.getEpisode())
        });
    },
    decryptString: function (string) {


        return string;
    },
    suggestF11: function () {
        if (window.outerHeight != screen.height) {

        }
    },
    prepareMsgDiv: function () {
        var div = document.createElement('div');
        div.id = 'automator-msg';
        div.setAttribute('style', '' +
                'pointer-events:none;' +
                'position:fixed;' +
                'opacity:0;' +
                // 'left:' + $(getPlayer()).offset().left + 'px;' +
                // 'top:' + $(getPlayer()).offset().top + 'px;' +
                'font-size:40pt;' +
                'left:20px;' +
                'top:30px;' +
                //'width:100%;' +
                //'text-align:center;' +
                'z-index:999999999999999;' +
                'color:#eaeaea;' +
                'font-weight:500;' +
                "font-family:'Calibri';" +
                'text-shadow:2px 2px 5px black;' +
                '-webkit-user-select: none;'
        );
        document.body.appendChild(div);
    },
    prepareSynopsisDiv: function (synopsis, imgurl, show, age_rating, rating, title) {
        var xDiv = document.createElement('div');
        xDiv.id = 'automator-xDiv';
        xDiv.setAttribute('style', 'position:absolute;right:15px;top:10px;pointer-events:all;cursor:pointer');
        $(xDiv).mousedown(function () {
            synopsisDiv.style.opacity = 0;
            setTimeout(function () {
                synopsisDiv.style.display = 'none';
            }, 274);
        });

        var xButton = document.createElement('img');
        xButton.src = path + 'images/xButton.svg';
        xButton.setAttribute('style', 'width:25px;');
        xDiv.appendChild(xButton);

        var paddingDiv = document.createElement('div');
        paddingDiv.setAttribute('style', 'padding-left:45px;');

        var img = document.createElement('img');
        img.onload = function () {
            $(synopsisDiv).css({
                top: ( (( ($(getPlayer()).offset().top + $(getPlayer()).height()) - ($(synopsisDiv).height() + parseInt($(synopsisDiv).css('padding-top')) + parseInt($(synopsisDiv).css('padding-bottom'))) ) - 32 ) + 'px' )
            });
        }
        img.setAttribute('style', 'width:200px;border-radius: 10px;');
        img.src = imgurl;

        var episode = this.getEpisode() == 'movie' ? 'Movie' : 'Episode ' + this.getEpisode();
        if (title) {
            episode += ' - "' + title + '"';
        }

        var synopsisDiv = document.createElement('div');
        synopsisDiv.id = 'automator-synopsis';
        synopsisDiv.setAttribute('style', '' +
                'position:absolute;' +
                'opacity:0;' +
                'transition:0.274s;' +
                'font-size:25px;' +
                'padding:18px 0px 45px 0px;' +
                'background-color: rgba(10,10,10,0.65);' +
                'z-index:99999;' +
                'color:#eaeaea;' +
                'pointer-events:none;' +
                'font-weight:500;' +
                'line-height: 30px;' +
                "font-family:'Calibri';" +
                'text-shadow:rgba(18,21,29,0.4) 2px 2px 15px;' +
                'width:100%'
        );


        paddingDiv.appendChild(xDiv);
        paddingDiv.appendChild(img);

        var miscDiv = $('<div style="display: inline-block;width: 67%;padding-left: 20px;"><div style="position:absolute;top:17px;font-size:30pt;margin-left:-1px;color: #999;">' + show.titalize() + '</div><div style="position:absolute;top: 53px;font-size:20pt;color:wheat;">' + episode + '</div><div style="position:relative;top:-2px;">' + synopsis.setMax(610) + '</div><div style="position: absolute;bottom: 19px;Left: 44px;">' + age_rating + '</div>')[0]
        var ratingDiv = document.createElement('div');
        ratingDiv.setAttribute('style', 'position: absolute;margin-left: -122px;margin-top:-5px;');
        paddingDiv.appendChild(ratingDiv);

        for (var i = 0; i < 5; i++) {
            if (i < rating) {
                ratingDiv.innerHTML += '<span style="color:gold;">★</span>'
            } else {
                ratingDiv.innerHTML += '<span style="color: rgba(255, 255, 255, 0.81);">☆</span>'
            }
        }
        miscDiv.appendChild(ratingDiv);

        paddingDiv.appendChild(miscDiv);
        synopsisDiv.appendChild(paddingDiv);

        this.synopsis = synopsisDiv;
        document.body.appendChild(synopsisDiv);
    },
    displayMsg: function (msg, duration, fontsize, callback) {
        function resetDiv(div) {
            clearTimeout(timeouts.fadeOutDiv);
        }

        if (this.blockMsgs != true) {
            duration = duration || 1000;
            fontsize = fontsize || '40pt';
            if (typeof msg != 'string' && (msg || msg == 0) && msg != false)
                msg = msg.toString();

            var div = $('#automator-msg')[0], transition = duration / 9;
            if (div) {
                resetDiv($(div));
                $(div).html(msg);
                $(div).css('transition', transition / 1000 + 's')

                setTimeout(function () {
                    div.style.fontSize = fontsize;
                    div.style.opacity = 1;
                    timeouts.fadeOutDiv = setTimeout(function () {
                        div.style.opacity = 0;
                        div.style.fontSize = '60pt';

                        if (callback)
                            callback();
                    }, duration - (transition / 2));
                }, 5);
            }
            else if (callback)
                callback();
        }
    },
    displaySynopsis: function () {
        $('#automator-synopsis').css('opacity', '1');
        $('#automator-xDiv').css('pointer-events', 'all');
    },
    undisplaySynopsis: function () {
        $('#automator-synopsis').css('opacity', '0');
        $('#automator-xDiv').css('pointer-events', 'none');
    },
    toggleSynopsis: function () {
        if ($('#automator-synopsis').css('opacity') == 0) {
            this.displaySynopsis();
        } else {
            this.undisplaySynopsis();
        }
    },
    decryptToUrl: function (show, episode) {
        var url = "http://kissanime.to/Anime/{show}/Episode-{episode}";
        show = show.replace(/ /g, '-');
        url = url.replace('{show}', show.replace(/shippuden/g, 'shippuuden')).replace('{episode}', toXXX(episode));

        return url;
    },
    skipToEpisode: function (show, episode) {
        var self = win || this;

        document.location.href = self.decryptToUrl(show, episode);
    },
    isLastEpisode: function () {
        var btnNext = $('#btnNext');
        if (btnNext.length == 0) {
            return true;
        }

        return false;
    },
    finishedShow: function (show) {
        show = show || this.getShowName();

        youtube.clearSavedElapsed();
        updateExtensionStorageObject('sync', [show, 'isFinished'], true);
    },
    toggleFullScreen: function () {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    },
    fixDoubleEpisodes: function () {
        if ($('#divMsg').text().indexOf('has not been released yet. Please come back later ^^!') != -1) {
            if (document.location.pathname.substring(document.location.pathname.indexOf('/Episode')).split('-').length < 3) {
                document.location.href = document.location.href.replace(document.location.search, '') + '-' + (this.getEpisode() + 1);
            }
        }
    }
};
var chromeapi = {
    init: function (callback) {
        var chromeapi = this;
        chrome.storage.sync.get('default', function (settings) {
            if (!win.isMovie())
                chromeapi.checkSettings(settings, 'default');
            else
                chromeapi.checkSettings(settings, 'default', callback);
        });
        chrome.storage.sync.get(win.getShowName(), function (settings) {
            if (!win.isMovie()) {
                chromeapi.checkSettings(settings, win.getShowName(), function () {
                    chromeapi.defineSettings(win.getShowName(), callback);
                });
            }
        });
    },
    checkSettings: function (settings, show, callback) {
        if (settings.getObjectLength() == 0) {
            var set_settings = new Object();
            set_settings[show] = new Object();

            if (show == 'default') {
                set_settings[show].intro_from = 0;
                set_settings[show].intro_to = 0;
                set_settings[show].outro = 0;
            }
            set_settings[show].last = {url: null, episode: 0};
            set_settings[show].show = show;

            chrome.storage.sync.set(set_settings, callback || function () {
            });
        }
        else if (callback)
            callback();
    },
    isPropertyEnabled_DefaultOn: function (property, on, off) {
        var path = property.split(':').splice(1);
        path = path.slice(0, path.length - 1);
        var propertyRoot = property.split(':')[0];
        property = property.split(':')[property.split(':').length - 1];

        chrome.storage.sync.get(propertyRoot, function (settings) {
            for (var i = 0; i < path.length; i++) {
                if (settings[path[i]] == undefined)
                    settings = {};
                else
                    settings = settings[path[i]];
            }

            if ((settings[property] == true || settings[property] == undefined)) {
                if (on) {
                    on();
                }
            }
            else if (off) off();
        });
    },
    isPropertyEnabled_DefaultOff: function (property, on, off) {
        var path = property.split(':').splice(1);
        path = path.slice(0, path.length - 1);
        var propertyRoot = property.split(':')[0];
        property = property.split(':')[property.split(':').length - 1];

        chrome.storage.sync.get(propertyRoot, function (settings) {
            for (var i = 0; i < path.length; i++) {
                if (settings[path[i]] == undefined)
                    settings = {};
                else
                    settings = settings[path[i]];
            }

            if (settings[property] == true) {
                if (on) {
                    on();
                }
            }
            else if (off) off();
        });
    },
    setCountdown: function (counter, callback) {
        if (counter != undefined)
            chrome.storage.sync.set({countdown: counter}, callback || function () {
            });
        else {
            chrome.storage.sync.remove('countdown', callback || function () {
            });
        }
    },
    defineSettings: function (show, callback) {
        chrome.storage.sync.get(show, function (show_settings) {
            show_settings = show_settings[show];
            gSettings[show] = {last: show_settings.last, show: show};


            if (show_settings.intro_from == undefined) {
                chrome.storage.sync.get('default', function (show_settings) {
                    show_settings = show_settings.default;

                    gSettings[show].intro_from = show_settings.intro_from;
                    gSettings[show].intro_to = show_settings.intro_to;
                    gSettings[show].outro = show_settings.outro;

                    if (callback)
                        callback();
                });
            }
            else {
                gSettings[show].intro_from = show_settings.intro_from;
                gSettings[show].intro_to = show_settings.intro_to;
                gSettings[show].outro = show_settings.outro;

                if (callback)
                    callback();
            }
        })
    }
};


function start() {
    youtube = newVideo();

    chromeapi.isPropertyEnabled_DefaultOn('settings:settings:synopsis', function () {
        getSynopsis(win.getShowName(), win.getEpisode(), function (synopsis, imgurl, age_rating, title, rating) {
            win.prepareSynopsisDiv(synopsis, imgurl, win.getShowName(), age_rating, title, rating);
            if (youtube.isPaused()) {
                setTimeout(win.displaySynopsis, 0);
            }
        });
    });

    win.starting();
    chromeapi.init(function () {
        player.swapPlayer(function () {
            player.init(function () {
                player.onPlayerReady(function () {
                    youtube.init(function () {
                        statusBar.init(function () {
                            win.init(function () {
                                timeouts.scrollToPlayer = setTimeout(function () {
                                    player.scrollToPlayer();
                                }, 2900);

                                win.finished();

                                chrome.storage.sync.get('countdown', function (countdown) {
                                    if (countdown.countdown) {
                                        win.displayMsg(countdown.countdown + (' Countdown'), 4500, '47pt');
                                    }
                                    else {
                                        win.displayMsg(('Countdown Closed'), 4500, '47pt');
                                    }

                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
function restart(callback) {
    chromeapi.isPropertyEnabled_DefaultOn('on', function () {
        win.starting();
        player.resetPlayer();
        win.reset();
        statusBar.reset();
        player.onPlayerReady(function () {
            timeouts.scrollToPlayer = setTimeout(function () {
                player.scrollToPlayer();
            }, 100);

            if (callback)
                callback();

            win.finished();
        });
    });
}

$(document).ready(function () {
    chromeapi.isPropertyEnabled_DefaultOn('on', function () {
        win.fixDoubleEpisodes();
        player.onPlayerDOMReady(start);
    });
});











