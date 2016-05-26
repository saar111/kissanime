var keyCodes = {
    SPACE: 32,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    NUMBERS: {
        CONTAINS: function (num) {
            for (var i = 0; i < Object.keys(this).length; i++) {
                if (this[Object.keys(this)[i]] == num)
                    return true;
            }
            return false;
        },
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        SIX: 6,
        SEVEN: 7,
        EIGHT: 8,
        NINE: 9
    },
    FKEYS: {
        CONTAINS: function (num) {
            for (var i = 0; i < Object.keys(this).length; i++) {
                if (this[Object.keys(this)[i]] == num)
                    return true;
            }
            return false;
        },
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123
    },
    ESC: 27,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    TILDE: 192
};
String.prototype.setMax = function (num) {
    if (this.length > num)
        return this.substring(0, num - 3) + '...';
    else
        return this.substring(0, num);
}
String.prototype.titalize = function () {
    var words = this.split(' ');
    var newString = '';

    while (words.indexOf('') != -1)
        delete words[words.indexOf('')];

    for (var i = 0; i < words.length; i++) {
        newString += words[i][0].toUpperCase() + words[i].toLowerCase().substring(1) + ((i == words.length - 1) ? '' : ' ');
    }

    return newString;
}
function toHHMMSS(num) {
    if (num || num == 0) {
        if (typeof num == 'string')
            var sec_num = parseInt(num, 10); // don't forget the second param
        else
            var sec_num = num;
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            if (hours == 0) {
                hours = '';
            }
            else
                hours = "0" + hours + ':';
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var time = hours + minutes + ':' + seconds;
        return time;
    }
    else return num;
}
function getQueryValue(query, key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
        results = regex.exec(query);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
Object.prototype.getObjectLength = function (obj) {
    obj = obj || this;

    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }

    return size;
};
function clone(obj) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            if (typeof obj[attr] == 'object' && obj[attr]) {
                copy[attr] = clone(obj[attr]);
            }
            else
                copy[attr] = obj[attr];
        }
    }
    return copy;
}
Object.prototype.fillMissing = function (obj) {
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            if (typeof this[attr] == 'object' && typeof obj[attr] == 'object' && this[attr] && obj[attr]) {
                this[attr].fillMissing(obj[attr]);
            }
            else {
                if (!this.hasOwnProperty(attr))
                    this[attr] = obj[attr];
            }
        }
    }
};
function updateExtensionStorageObject(storageType, hierarchy, value, callback) {
    chrome.storage[storageType].get(hierarchy[0], function (object) {
        var setObject = clone(object), updateObject = setObject;
        for (var i = 0; i < hierarchy.length - 1; i++) {
            if (updateObject[hierarchy[i]] != undefined) {
                updateObject = updateObject[hierarchy[i]];
            }
            else {
                updateObject[hierarchy[i]] = {};
                updateObject = updateObject[hierarchy[i]];
            }
        }
        updateObject[hierarchy[hierarchy.length - 1]] = value;
        setObject.fillMissing(object);

        chrome.storage[storageType].set(setObject, callback);
    });
}
function getAttachedAttribute(element, attr) {
    if (element != document.body) {
        if (element.getAttribute(attr) != null)
            return element.getAttribute(attr);

        return getAttachedAttribute(element.parentNode, attr);
    }
}

var chromeapi = {
    init: function (callback) {
        var chromeapi = this;

        chrome.storage.sync.get('default', function (settings) {
            chromeapi.checkSettings(settings, 'default', callback);
        });
    },
    checkSettings: function (settings, showName, callback) {
        if (settings.getObjectLength() == 0) {
            var set_settings = new Object();
            set_settings[showName] = new Object();

            set_settings[showName].intro_from = 0;
            set_settings[showName].intro_to = 0;
            set_settings[showName].outro = 0;
            set_settings[showName].last = {url: null, episode: 0};
            set_settings[showName].show = showName;

            chrome.storage.sync.set(set_settings, callback || function () {
            });
        }
        else if (callback)
            callback();
    },
    getSettings: function (showName, callback) {
        var chromeapi = this;

        chrome.storage.sync.get(showName, function (settings) {
            if (settings.getObjectLength() == 0 && showName != 'default')
                chromeapi.getSettings('default', callback);
            else
                callback(settings[showName]);
        });
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
    }
};
var win = {
    init: function (callback) {
        this.createRows(callback);
        this.setExtState();
        this.redirectToEdit();
    },
    getShowName: function (callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            var showName = tab[0].url;
            if (showName.toLowerCase().indexOf('movie') != -1)
                return 'movie';
            showName = showName.replace(/https?:\/\//, '');
            showName = showName.substring(showName.indexOf('/'));
            showName = showName.replace('/Anime/', '');
            showName = showName.substring(0, showName.indexOf('/'));
            showName = showName.replace(/-/g, ' ');

            if (callback)
                callback(showName.toLowerCase());
        });
    },
    displayDefaults: function () {
        var defaults = $('.default');
        defaults.css('background-color', 'gold');
        defaults.find('.background-image').css('opacity', '0.79');

        //var non_defaults = $('.not-affected-by-default:not(#default)');
        //non_defaults.css({overflow:'hidden', height:'0px'});
    },
    undisplayDefaults: function () {
        var defaults = $('.default');
        defaults.css('background-color', '');
        defaults.find('.background-image').css('opacity', '1');

        // var non_defaults = $('.not-affected-by-default:not(#default)');
        //non_defaults.css({height:'42px'});
        //setTimeout(function(){
        //     non_defaults.css({overflow:''});
        //}, 240);
    },
    createRow: function (settings, rowNumber, stopAt, callback) {
        function createTooltipRow(settings, row, animeRow) {
            var tooltiprow = document.createElement('div');
            tooltiprow.className = 'row a tooltip-row hover-tooltip pointer';
            tooltiprow.setAttribute('data-tooltip-placing-y', 'below-element');
            tooltiprow.setAttribute('data-create-url', '../html/edit_anime.html?show=' + settings.show);
            tooltiprow.setAttribute('tooltip-show', settings.show);
            tooltiprow.setAttribute('data-tooltip', 'Edit');

            var intro_from = document.createElement('div');
            var intro_to = document.createElement('div');
            var outro = document.createElement('div');

            intro_from.className = 'col-xs-4 height-100';
            intro_to.className = 'col-xs-4 height-100';
            outro.className = 'col-xs-4 height-100';


            if (settings.intro_from != undefined) {
                animeRow.className += ' not-affected-by-default';
                $(intro_from).html('Skip from <b class="limegreen">' + (toHHMMSS(settings.intro_from)) + '</b>');
                $(intro_to).html('To <b class="limegreen">' + (toHHMMSS(settings.intro_to)) + '</b>');
                $(outro).html('Skip episode <b class="red">' + (settings.outro >= 1000 ? '&nbsp;...' : settings.outro + 's') + '</b>');
            }
            else {
                row.className += ' default';
                chrome.storage.sync.get('default', function (settings) {
                    settings = settings.default;
                    $(intro_from).html('Skip from <b class="limegreen">' + (toHHMMSS(settings.intro_from)) + '</b>');
                    $(intro_to).html('To <b class="limegreen">' + (toHHMMSS(settings.intro_to)) + '</b>');
                    $(outro).html('Skip episode <b class="red">' + (settings.outro) + 's</b>');
                });
            }

            $(tooltiprow).append(intro_from, intro_to, outro);
            return tooltiprow;
        }

        function createRow(settings, rowNumber, length, callback) {
            var animeRow = document.createElement('div');
            animeRow.className = 'transition anime-bundle-row';
            animeRow.id = settings.show.replace(/ /g, '-');

            var row = document.createElement('div');
            row.className = 'row anime-row transition';
            row.setAttribute('data-show', settings.show);

            var background = document.createElement('div');
            background.className = 'background-image';

            var show = document.createElement('div');
            var episode = document.createElement('div');
            var del = document.createElement('div');
            var edit = document.createElement('div');

            show.className = 'col-xs-6 show-row hover-tooltip create-tab';
            show.setAttribute('data-create-url', settings.last.url);
            episode.className = 'col-xs-2 show-row border-left-1 create-tab hover-orange episode-index';
            episode.setAttribute('data-create-url', settings.last.url);
            del.className = 'col-xs-2 show-row border-left-1 hover-background pointer delete hover-orange';
            edit.className = 'col-xs-2 show-row hover-background pointer edit a hover-orange';
            edit.setAttribute('data-create-url', '../html/edit_anime.html?show=' + settings.show);

            $(show).html(settings.show.titalize().setMax(25));
            $(episode).text('E' + settings.last.episode);
            $(del).html('Delete');
            $(edit).html('Edit');

            if (settings.show != 'default') {
                getShowImageUrl(settings.show, function (imgurl) {
                    background.style.backgroundImage = 'url(' + imgurl + ')';

                    setTimeout(function () {
                        background.style.opacity = 1
                    }, (rowNumber + 1) * 110);
                });
            }
            else {
                setTimeout(function () {
                    background.style.opacity = 1
                    background.style.backgroundColor = '#777777';
                }, 110);

                //   $(animeRow).hover(this.displayDefaults, this.undisplayDefaults);
                $(del).html('');
                $(episode).html('');
            }


            $(row).append(background, show, episode, del, edit);
            $(animeRow).append(row, createTooltipRow(settings, row, animeRow));
            $('#rows').append(animeRow);


            if (rowNumber == stopAt && callback) {
                callback();
            }
        }

        if (typeof settings == 'string') {
            chrome.storage.sync.get(settings, function (data) {
                createRow(data[settings], rowNumber, stopAt, callback)
            });
        }
        else
            createRow(settings, rowNumber, stopAt, callback);
    },
    createRows: function (callback) {
        var win = this;

        chrome.storage.sync.get(null, function (shows) {
            var animes = [];
            for (var showName in shows) {
                if (shows[showName].show) {
                    animes.push(shows[showName]);
                }
            }

            animes.sort(function (a, b) {
                if (a.show == 'default')
                    return -1;
                if (b.show == 'default')
                    return 1;

                if (a.show > b.show) {
                    return 1;
                }
                if (a.show < b.show) {
                    return -1;
                }

                return 0;
            });
            for (var i = 0; i < animes.length; i++) {
                function timeout(i) {
                    setTimeout(function () {
                        win.createRow(animes[i], i, animes.length - 1, function () {
                            // win.createNewButton();
                            callback()
                        });
                    }, (i + 1) * 100);
                }

                timeout(i);
            }
        })
    },
    getAttachedTooltipRow: function (element) {
        var show = $(element).data('show');
        if (element.getAttribute('tooltip-show')) {
            return $(element);
        }

        return $('[tooltip-show="' + show + '"]');
    },
    openTooltipRow: function (e) {
        var backgroundImage = $(this).find('.background-image')[0];
        if (backgroundImage == undefined) {
            backgroundImage = $(this).prev();
            backgroundImage = backgroundImage.find('.background-image')[0];
        }
        if (backgroundImage) {
            var filter = getComputedStyle(backgroundImage)['-webkit-filter'];
            $(backgroundImage).css('-webkit-filter', 'blur(0.8px) grayscale(0.35)');
        }

        var tooltipRow = win.getAttachedTooltipRow(this);
        tooltipRow.css('opacity', 1).css('height', getComputedStyle($('.tooltip-row')[0]).lineHeight).css('pointer-events', 'all');
    },
    closeTooltipRow: function (e) {
        var backgroundImage = $(this).find('.background-image')[0];
        if (backgroundImage == undefined) {
            backgroundImage = $(this).prev();
            backgroundImage = backgroundImage.find('.background-image')[0];
        }
        if (backgroundImage) {
            var filter = getComputedStyle(backgroundImage)['-webkit-filter'];
            $(backgroundImage).css('-webkit-filter', 'blur(2.2px) grayscale(0.75)');
        }

        var tooltipRow = win.getAttachedTooltipRow(this);
        tooltipRow.css('opacity', 0).css('height', '').css('pointer-events', 'none');
    },
    setExtState: function (state) {
        if (state == false) {
            this.graphic_setOff();
            chrome.storage.sync.set({on: state});
        }
        else if (state == true) {
            this.graphic_setOn();
            chrome.storage.sync.set({on: state});
        }
        else {
            var win = this;
            chrome.storage.sync.get('on', function (state) {
                if (state.on == true || state.on == undefined) {
                    chrome.storage.sync.set({on: true});
                    win.graphic_setOn();

                }
                else {
                    chrome.storage.sync.set({on: false});
                    win.graphic_setOff();
                }
            });
        }

    },
    graphic_setOn: function () {
        $('#on-text').text('On');
        $('#on').css('color', 'limegreen');
    },
    graphic_setOff: function () {
        $('#on-text').text('Off');
        $('#on').css('color', 'red');
    },
    getStateFromWindow: function () {
        var state = $('#on-text').text();
        state = state.toLowerCase() === 'on';

        return state;
    },
    redirectToEdit: function () {
        this.getShowName(function (show) {
            if (show != "" && show != 'movie') {
                if (getQueryValue(document.location.search, 'noedit') == "") {
                    document.location.href = '../html/edit_anime.html?show=' + show;
                }
            }
        });
    },
    removeSubDub: function (show) {
        return show.replace(/(.dub)|(.Dub)|(.sub)|(.Sub)/g, '');
    },
    getFinishedShows: function (callback) {
        chrome.storage.sync.get(null, function (shows) {
            var finishedShows = [];
            for (var showName in shows) {
                if (shows[showName].isFinished) {
                    finishedShows.push(shows[showName]);
                }
            }
            if (callback)
                callback(finishedShows);
        });
    },
    markShowsWithNewEpisodes: function () {
        var win = this;
        this.getFinishedShows(function (shows) {
            for (var show = 0; show < shows.length; show++) {
                var currentShow = shows[show];
                showInfoManager.isShowStillAiring(currentShow.show, $('#' + currentShow.show.replace(/ /g, '-'))[0], currentShow.last.episode, function (show, showElement, episode) {
                    showInfoManager.isNewEpisode(show, showElement, episode, function (show, showElement, episode, link) {
                        var episodeIndex = $(showElement).find('.episode-index');
                        episodeIndex.html('New');
                        episodeIndex.addClass('color-red transition-1');

                        episodeIndex.css('color', 'red');
                        setInterval(function () {
                            episodeIndex.css('color', 'red');
                        }, 2000);
                        setTimeout(function () {
                            episodeIndex.css('color', 'darkorange');
                            setInterval(function () {
                                episodeIndex.css('color', 'darkorange');
                            }, 2000);
                        }, 1000);

                        var infoBar = $(showElement).children()[0];
                        infoBar.className += ' hover-tooltip';
                        $(infoBar).attr('data-tooltip-placing-y', 'above-element');
                        $(infoBar).attr('data-tooltip', 'New episode: ' + episode);

                        var links = $(showElement).find('.create-tab');
                        links.attr('data-create-url', link);

                        tooltip.reload();
                        $('.anime-row').hover(win.openTooltipRow, win.closeTooltipRow);
                        $('.tooltip-row').hover(win.openTooltipRow, win.closeTooltipRow);
                    });
                });
            }
        });
    }
}

$(document).ready(function () {
    $('#on-text').on('mousedown', function (e) {
        if (e.which == 1) {
            win.setExtState(!win.getStateFromWindow());
        }
    });
    chromeapi.init(function () {
        win.init(function () {
            $('.create-tab').on('mousedown', function (e) {
                var url = this.getAttribute('data-create-url');

                if (url && url != 'null' && url != 'undefined' && e.which == 1) {
                    chrome.tabs.create({url: url});
                }
            });
            $('.a').on('mousedown', function (e) {
                var url = this.getAttribute('data-create-url');

                if (url && url != 'null' && url != 'undefined' && e.which == 1) {
                    document.location.href = url;
                }
            });
            $('.anime-row').hover(win.openTooltipRow, win.closeTooltipRow);
            $('.tooltip-row').hover(win.openTooltipRow, win.closeTooltipRow);
            $('#default').hover(win.displayDefaults, win.undisplayDefaults);
            $('.delete').on('mousedown', function () {
                var show = getAttachedAttribute(this, 'data-show');
                chrome.storage.sync.remove(show);

                this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
                win.getAttachedTooltipRow(this.parentNode)[0].parentNode.removeChild(win.getAttachedTooltipRow(this.parentNode)[0]);
            });
            chromeapi.isPropertyEnabled_DefaultOn('settings:settings:newEpisodes', function(){win.markShowsWithNewEpisodes()});
            tooltip.init();
        });
    });
});







