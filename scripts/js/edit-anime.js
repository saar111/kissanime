var keyCodes = {
    SPACE: 32,
    ENTER: 13,
    CTRL: 17,
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
    TILDE: 192,
    N: 78,
    V: 86,
    C: 67,
    M: 77,
    QUESTION_MARK: 191,
    SLASH: 191,
    DOT: 190,
    COMMA: 188,
    I: 73,
    O: 79
};
function getQueryValue(query, key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
        results = regex.exec(query);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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
        console.log(setObject);

        chrome.storage[storageType].set(setObject, callback || function(){});
    });
}
String.prototype.titalize = function () {
    var words = this.split(' ');
    var newString = '';

    for (var i = 0; i < words.length; i++) {
        newString += words[i][0].toUpperCase() + words[i].toLowerCase().substring(1) + ((i == words.length - 1) ? '' : ' ');
    }

    return newString;
}
function toXXX(num) {
    var numXXX;
    if (num || num == 0) {
        if (typeof num == 'string') {
            numXXX = parseInt(num);
        }
        else {
            numXXX = num;
        }
        if (isNaN(numXXX))
            return num;

        if (numXXX >= 100)
            return numXXX.toString();
        if (numXXX <= 99 && numXXX >= 10)
            return '0' + numXXX;
        if (numXXX <= 9 && numXXX >= 0)
            return '00' + numXXX;
    }
    else return num;
}


var form = {
    init: function () {
        this.intro_from_min = $('#intro-from-min');
        this.intro_from_sec = $('#intro-from-sec');

        this.intro_to_min = $('#intro-to-min');
        this.intro_to_sec = $('#intro-to-sec');

        this.outro_min = $('#outro-min');
        this.outro_sec = $('#outro-sec');

        this.show = $('#show-name');
        this.episode = $('#episode');
    },
    fillForm: function (settings) {
        var form = this;
        this.setShow(settings.show);

        if (settings.intro_from != undefined) {
            this.setIntroFromMin(settings.intro_from);
            this.setIntroFromSec(settings.intro_from);

            this.setIntroToMin(settings.intro_to);
            this.setIntroToSec(settings.intro_to);

            this.setOutroMin(settings.outro);
            this.setOutroSec(settings.outro);
        }
        else {
            chrome.storage.sync.get('default', function (settings) {
                settings = settings.default;

                form.setIntroFromMin(settings.intro_from);
                form.setIntroFromSec(settings.intro_from);

                form.setIntroToMin(settings.intro_to);
                form.setIntroToSec(settings.intro_to);
                form.setOutroMin(settings.outro);
                form.setOutroSec(settings.outro);
            });
        }

        this.setEpisode(settings.last.episode);
    },
    checkFormValidity: function () {
        return true;
    },
    get_form_values: function () {
        var intro_from, intro_to, outro, show, episode, obj = {};

        intro_from = parseInt(this.intro_from_min.val()) * 60 + parseInt(this.intro_from_sec.val());
        intro_to = parseInt(this.intro_to_min.val()) * 60 + parseInt(this.intro_to_sec.val());
        outro = parseInt(this.outro_min.val()) * 60 + parseInt(this.outro_sec.val());
        show = this.show.val().toLowerCase();
        episode = parseInt(this.episode.val());

        return {intro_from: intro_from, intro_to: intro_to, show: show, outro: outro, episode: episode};
    },
    decryptToUrl: function (show, episode) {
        var url = "http://kissanime.to/Anime/{show}/Episode-{episode}";
        show = show.replace(/ /g, '-');
        url = url.replace('{show}', show).replace('{episode}', toXXX(episode));

        return url;
    },
    constructObject: function () {
        var self = (form || this), formValues;
        if (self.checkFormValidity()) {
            formValues = self.get_form_values(), animeObj = {};
            animeObj[formValues.show] = {
                show: formValues.show,
                last: {
                    episode: formValues.episode
                }
            };

            if (formValues.show == 'default')
                animeObj[formValues.show].last.url = null;
            if (self.isElementChanged(self.episode)) {
                animeObj[formValues.show].last.url = self.decryptToUrl(formValues.show, formValues.episode);
                animeObj[formValues.show].isFinished = false;
                animeObj[formValues.show].last.time = 0;
            }
            if (self.isElementChanged(self.intro_from_min) || self.isElementChanged(self.intro_from_sec) || self.isElementChanged(self.intro_to_min) || self.isElementChanged(self.intro_to_sec) || self.isElementChanged(self.outro_min) || self.isElementChanged(self.outro_sec)) {
                animeObj[formValues.show].intro_from = formValues.intro_from;
                animeObj[formValues.show].intro_to = formValues.intro_to;
                animeObj[formValues.show].outro = formValues.outro;
            }

            createWidgetsForElements($('input, select'), $('#save')[0], self.exit);
            updateExtensionStorageObject('sync', [formValues.show], animeObj[formValues.show]);
        }
    },
    exit: function () {
        document.location.href = '../html/animes.html?noedit=true';
    },
    secondsToSecXX: function (num) {
        var sec = (parseInt(num % 60));
        if (sec < 10)
            sec = '0' + sec;
        else
            sec = sec.toString();

        return sec;
    },
    secondsToMinXX: function (num) {
        var min = (parseInt(num / 60));
        if (min < 10)
            min = '0' + min;
        else
            min = min.toString();

        return min;
    },
    setShow: function (show) {
        this.show.val(show.titalize());
    },
    setIntroFromMin: function (num) {
        this.intro_from_min.val(this.secondsToMinXX(num));
        this.intro_from_min.attr('data-original-value', this.secondsToMinXX(num));
    },
    setIntroFromSec: function (num) {
        this.intro_from_sec.val(this.secondsToSecXX(num));
        this.intro_from_sec.attr('data-original-value', this.secondsToSecXX(num));
    },
    setIntroToMin: function (num) {
        this.intro_to_min.val(this.secondsToMinXX(num));
        this.intro_to_min.attr('data-original-value', this.secondsToMinXX(num));
    },
    setIntroToSec: function (num) {
        this.intro_to_sec.val(this.secondsToSecXX(num));
        this.intro_to_sec.attr('data-original-value', this.secondsToSecXX(num));
    },
    setOutroMin: function (num) {
        this.outro_min.val(this.secondsToMinXX(num));
        this.outro_min.attr('data-original-value', this.secondsToMinXX(num));
    },
    setOutroSec: function (num) {
        this.outro_sec.val(this.secondsToSecXX(num));
        this.outro_sec.attr('data-original-value', this.secondsToSecXX(num));
    },
    setEpisode: function (episode) {
        this.episode.val(episode);
        this.episode.attr('data-original-value', episode);
    },
    isElementChanged: function (element) {
        return $(element).data('original-value') != $(element).val();
    },
    clearEpisodeCache: function (show) {
        updateExtensionStorageObject('sync', [show, 'isFinished'], false);
        updateExtensionStorageObject('sync', [show, 'last', 'time'], 0);
    },
    changeEpisode: function (relativeNum) {
        this.episode.val(parseInt(this.episode.val()) + relativeNum);
    }

}


var win = {
    degree: 0,
    init: function () {
        this.fillForm();
    },
    rotateBack180: function () {
        var back = $('#back-img');
        win.degree += 180;

        back.css('transform', 'rotate(' + win.degree + 'deg)');
    },
    getParameterByName: function (key) {
        key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    fillForm: function (show) {
        show = show == undefined ? this.getParameterByName('show') : show;

        chrome.storage.sync.get(show, function (settings) {
            if (settings[show])
                form.fillForm(settings[show]);
        });
    }

}


$(document).ready(function () {
    form.init();
    win.init();
    $('*').keydown(function (e) {
        if (e.keyCode == keyCodes.ENTER) {
            form.constructObject();
        }
    })
    $('#back-img').hover(win.rotateBack180, win.rotateBack180);
    $('#save').mousedown(function (e) {
        if (e.which == 1) {
            form.constructObject();
        }
    });
    $('#show-name').keyup(function () {
        win.fillForm($(this).val());
    }).focus(function () {
        this.select();
    });
    $('#episode').focus(function () {
        this.select();
    });
    $('#plus-episode').mousedown(function(){form.changeEpisode(1)});
    $('#minus-episode').mousedown(function(){form.changeEpisode(-1)});
});


// getImageFromGoogle($('#show-name').val(), function(d){$('#background-image').css('background-image', 'url(' + d + ')');});