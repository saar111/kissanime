var keyCodes = {
    SPACE: 32,
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
    O: 79,
    S: 83
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

    while (words.indexOf(' ') != -1)
        delete words[words.indexOf(' ')];

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
function toHHMMSS(num) {
    if (num || num == 0) {
        if (typeof num == 'string')
            var sec_num = parseInt(num, 10); // don't forget the second param
        else
            var sec_num = num;
        sec_num = parseInt(sec_num);
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
function isBetween(num, range_start, range_end) {
    return (num >= range_start && num <= range_end);
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
if (Object.prototype.compare == undefined) {
    Object.prototype.compare = function (obj1, obj2) {
        var result = true;
        if (typeof(obj1) !== typeof(obj2)) {
            return false;
        }

        if (typeof(obj1) === 'string') {
            result = result && obj1 === obj2;
        }
        else if (typeof(obj1) === 'object') {
            if (obj1 !== null && obj2 !== null) {
                if (obj1.getObjectLength() !== obj2.getObjectLength())
                    result = false;
            }
            else
                result = result && obj1 === obj2;    //Check if both null

            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    result = result && Object.compare(obj1[key], obj2[key]);
                    if (!result)
                        break;
                }
            }
        }
        else {
            result = result && obj1.toString() === obj2.toString();
        }

        return result;
    };
}
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
/*if (Object.prototype.clone == undefined) {
 Object.prototype.clone = function () {
 var copy = {};
 for (var attr in this) {
 if (this.hasOwnProperty(attr)) {
 if (typeof this[attr] == 'object' && this[attr]) {
 copy[attr] = this[attr].clone();
 }
 else
 copy[attr] = this[attr];
 }
 }
 return copy;
 };
 }*/
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





















