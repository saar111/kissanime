var timeouts = {};
var intervals = {};
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
if (Object.prototype.fillMissing == undefined) {
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
            }
        }
        updateObject[hierarchy[hierarchy.length - 1]] = value;
        setObject.fillMissing(object);

        if (setObject[hierarchy[0]]) {
            if (setObject[hierarchy[0]].show != undefined && setObject[hierarchy[0]].last != undefined) {
                settings = setObject;
            }
        }

        chrome.storage[storageType].set(setObject, callback);
    });
}
function mul_str(str, num) {
    var newStr = '';
    for (var i = 0; i < num; i++) {
        newStr += str;
    }
    return newStr;
}


var chromeapi = {
    init: function (callback) {
        var chromeapi = this;
        this.fillSettings(function() {
            chrome.storage.sync.get('default', function (settings) {
                chromeapi.checkSettings(settings, 'default', callback);
            });
        });
    },
    checkSettings: function (settings, showName, callback) {
        if (settings.getObjectLength() == 0) {
            var set_settings = new Object();
            set_settings[showName] = new Object();

            if (showName == 'default') {
                set_settings[showName].intro_from = 0;
                set_settings[showName].intro_to = 0;
                set_settings[showName].outro = 0;
            }
            set_settings[showName].last = {url: null, episode: 0};
            set_settings[showName].show = showName;

            chrome.storage.sync.set(set_settings, callback || function () {
            });
        }
        else if (callback)
            callback();
    },
    isPropertyEnabled_DefaultOn: function (property, on, off) {
        chrome.storage.sync.get(property, function (settings) {
            if ((settings[property] == true || settings[property] == undefined)) {
                if (on) {
                    on();
                }
            }
            else if (off) off();
        });
    },
    isPropertyEnabled_DefaultOff: function (property, on, off) {
        chrome.storage.sync.get(property, function (settings) {
            if (settings[property] == true) {
                if (on) {
                    on();
                }
            }
            else if (off) off();
        });
    },
    fillSettings: function (callback) {
        chrome.storage.sync.get('settings', function (settings) {
            settings = settings.settings || {};
            var settingsDivs = $('#settings-div').children(), settingsObj = {};

            for (var setting = 0; settings < settingsDivs; setting++) {
                var propName = settingsDivs[setting].getAttribute('data-property-name');
                var propValue = settingsDivs[setting].getAttribute('data-state') == 'on';
                if(settings[propName] == undefined){
                    settingsObj[propName] = propValue;
                }
            }

            updateExtensionStorageObject('sync', ['settings'], settingsObj, callback || function(){});
        });
    }
};
var win = {
    degree: 0,
    init: function (callback) {
        var win = this;

        this.checkMALAuth();
        this.fillSettings();
        this.checkHummingbirdAuth(callback);
    },
    rotateBack180: function () {
        var back = $('#back-img');
        win.degree += 180;

        back.css('transform', 'rotate(' + win.degree + 'deg)');
    },
    getAttachedSpoiler: function (element) {
        var spoiler = $(element);
        if (element) {
            if (spoiler.attr('data-on') == undefined)
                return $(element).next();
            else
                return spoiler;
        }
    },
    closeAllSpoilersExcept: function (element) {
        var thisSpoiler = this.getAttachedSpoiler(element);
        var spoilers = $('[data-on=on]').not(thisSpoiler);

        spoilers.attr('data-on', 'off');
        spoilers.css('height', '0px');
    },
    closeSpoiler: function (spoiler) {
        spoiler = this.getAttachedSpoiler(spoiler);

        if (spoiler.attr('data-on') == 'on')
            this.toggleSpoiler(spoiler);

    },
    toggleSpoiler: function (elem) {
        this.closeAllSpoilersExcept(elem);
        var spoiler = this.getAttachedSpoiler(elem);
        if (spoiler.attr('data-on') == 'off') {
            spoiler.attr('data-on', 'on');
            spoiler.css('height', $(spoiler).data('height'));
        }
        else {
            spoiler.attr('data-on', 'off');
            spoiler.css('height', '0px');
        }
    },
    checkMALAuth: function (callback) {
        var win = this;
        chromeapi.isPropertyEnabled_DefaultOff('mal-auth', function () {
            chrome.storage.sync.get('mal-user-info', function (user_info) {
                win.fill_mal(user_info['mal-user-info'].username, (user_info['mal-user-info']).password.length);

                if (callback)
                    callback();
            });
        }, callback);
    },
    checkHummingbirdAuth: function (callback) {
        var win = this;
        chromeapi.isPropertyEnabled_DefaultOff('hummingbird-auth', function () {
            chrome.storage.sync.get('hummingbird-user-info', function (user_info) {
                win.fill_hummingbird(user_info['hummingbird-user-info'].username, (user_info['hummingbird-user-info']).password.length);

                if (callback)
                    callback();
            });
        }, callback);
    },
    fill_mal: function (username, pLength) {
        $('#mal-auth-username').val(username);
        $('#mal-auth-password').val(mul_str('*', pLength));
        this.revealAuth($('#auth-mal')[0], 'Saved', null);

        this.lockForm($('#mal-form'));
    },
    fill_hummingbird: function (username, pLength) {
        $('#hummingbird-auth-username').val(username);
        $('#hummingbird-auth-password').val(mul_str('*', pLength));
        this.revealAuth($('#auth-hummingbird'), 'Saved', null);

        this.lockForm($('#hummingbird-form'));
    },
    graphic_flashInvalid: function (elem, color) {
        //clearTimeout(timeouts[elem]);

        var transition = parseFloat($(elem).css('transition-duration')) * 1000, color = color || 'rgba(200,0,0,0.9)';
        $(elem).css('background-color', color).css('opacity', '0.4');
        timeouts[elem] = setTimeout(function () {
            $(elem).css('background-color', '').css('opacity', '1');
        }, transition);

    },
    hideAuth: function (auth) {
        $(auth).css('height', '0');
    },
    revealAuth: function (auth, msg, duration, callback) {
        if (typeof duration == 'function')
            callback = duration;
        if (duration != null && !duration)
            duration = 2000;

        $(auth).css('height', '').html(msg);


        setTimeout(function () {
            if (duration != null) {
                $(auth).html('Authenticate');
            }
            if (callback)
                callback();
        }, duration || 500);

    },
    saveAuth: function (website) {
        switch (website.toLowerCase()) {
            case 'mal':
                this.saveMALAuth();
                break;
            case 'hummingbird':
                this.saveHummingbirdAuth();
                break;
        }
    },
    lockForm: function (form) {
        var username = $(form).children()[0];
        var password = $(form).children()[1];
        var auth = $(form).children()[3];

        $(username).css({opacity: 0.6});
        $(password).css({opacity: 0.6});
        $(auth).css({'pointer-events': 'none', opacity: 0.6});
    },
    freeForm: function (form) {
        var username = $(form).children()[0];
        var password = $(form).children()[1];
        var auth = $(form).children()[3];

        if ($(username).css('opacity') < 1) {
            $(username).css({opacity: 1}).val('');
            $(password).css({opacity: 1}).val('');
            this.revealAuth(auth, 'Authenticate', null);
            $(auth).css({'pointer-events': 'all', opacity: 1});


            chrome.storage.sync.remove($(form).attr('id').split('-')[0] + '-user-info');
            chrome.storage.sync.remove($(form).attr('id').split('-')[0] + '-auth');
        }
    },
    saveMALAuth: function () {
        var win = this;
        var username = {elem: $('#mal-auth-username'), val: $('#mal-auth-username').val()};
        var password = {elem: $('#mal-auth-password'), val: $('#mal-auth-password').val()};

        if (this.isFormValid($('#mal-form'))) {
            this.hideAuth($('#auth-mal')[0]);
            mal.authenticate(username.val, password.val, function () {
                win.revealAuth($('#auth-mal')[0], 'Saved', null, function () {
                    win.closeSpoiler($('#mal-form'));
                });
                win.lockForm($('#mal-form'));
                chrome.storage.sync.set({'mal-user-info': {username: username.val, password: password.val}});
                chrome.storage.sync.set({'mal-auth': true});
            }, function (err) {
                win.revealAuth($('#auth-mal')[0], err);
                win.graphic_flashInvalid(username.elem);
                win.graphic_flashInvalid(password.elem);
            });
        }
    },
    saveHummingbirdAuth: function () {
        var win = this;
        var username = {elem: $('#hummingbird-auth-username'), val: $('#hummingbird-auth-username').val()};
        var password = {elem: $('#hummingbird-auth-password'), val: $('#hummingbird-auth-password').val()};

        if (this.isFormValid($('#hummingbird-form'))) {
            this.hideAuth($('#auth-hummingbird')[0]);
            hummingbird.authenticate(username.val, password.val, function () {
                win.revealAuth($('#auth-hummingbird')[0], 'Saved', null, function () {
                    win.closeSpoiler($('#hummingbird-form'));
                });
                win.lockForm($('#hummingbird-form'));
                chrome.storage.sync.set({'hummingbird-user-info': {username: username.val, password: password.val}});
                chrome.storage.sync.set({'hummingbird-auth': true});
            }, function (err) {
                win.revealAuth($('#auth-hummingbird')[0], err);
                win.graphic_flashInvalid(username.elem);
                win.graphic_flashInvalid(password.elem);
            });
        }
    },
    isFormValid: function (spoiler) {
        spoiler = $(spoiler);
        var valid = true;
        var username = {elem: $(spoiler).children()[0], val: $($(spoiler).children()[0]).val()};
        var password = {elem: $(spoiler).children()[1], val: $($(spoiler).children()[1]).val()};
        if (username.val == '' || !username.val) {
            this.graphic_flashInvalid(username.elem);
            valid = false;
        }
        if (password.val == '' || !password.val) {
            this.graphic_flashInvalid(password.elem);
            valid = false;
        }

        return valid;
    },
    fillSettings: function () {
        chrome.storage.sync.get('settings', function (settings) {
            settings = settings.settings;
            if (settings) {
                for (var setting in settings) {
                    if (settings.hasOwnProperty(setting)) {
                        var settingDiv = $('[data-property-name="' + setting + '"]');
                        settingDiv.attr('data-state', settings[setting] ? 'on':'off');
                    }
                }
            }
        });
    },
    toggleSetting: function (forceState) {
        if ((this.getAttribute('data-state') == 'off' || forceState) && !forceState) {
            this.setAttribute('data-state', 'on');
            updateExtensionStorageObject('sync', ['settings', this.getAttribute('data-property-name')], true)
        }
        else {
            this.setAttribute('data-state', 'off');
            updateExtensionStorageObject('sync', ['settings', this.getAttribute('data-property-name')], false)
        }
    }
}


$(document).ready(function () {
    chromeapi.init(function () {
        win.init(function () {
            $('#back-img').hover(win.rotateBack180, win.rotateBack180);
            $('.spoiler-controller').mousedown(function (e) {
                if (e.which == 1) {
                    win.toggleSpoiler(this);
                }
            });
            $('.a').on('mousedown', function (e) {
                var url = this.getAttribute('data-create-url');

                if (url && url != 'null' && url != 'undefined' && e.which == 1) {
                    document.location.href = url;
                }
            });
            $('.cred').focus(function () {
                this.select();
            });
            $('#auth-mal').mousedown(function (e) {
                if (e.which == 1)
                    win.saveAuth('mal');
            });
            $('#auth-hummingbird').mousedown(function (e) {
                if (e.which == 1)
                    win.saveAuth('hummingbird');
            });
            $('#mal-form').find('.cred').mousedown(function (e) {
                if (e.which == 1)
                    win.freeForm(this.parentNode)
            });
            $('#hummingbird-form').find('.cred').mousedown(function (e) {
                if (e.which == 1)
                    win.freeForm(this.parentNode)
            });
            $('.setting').mousedown(function (e) {
                if (e.which == 1) {
                    win.toggleSetting.call(this);
                }
            });
            tooltip.init();
        });
    });
});

















