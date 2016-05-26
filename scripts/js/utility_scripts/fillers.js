var fillers = {
    parseList: function (list) {
        fillersList = list.text().replace('Filler Episodes:', '').split(',');
        var fillersObj = {};
        for (var i = 0; i < fillersList.length; i++) {
            fillersList[i] = fillersList[i].trim().split('-');

            if (fillersList[i].length == 1)
                fillersList[i].push(fillersList[i][0]);

            for (var j = 0; j < fillersList[i].length; j++) {
                fillersList[i][j] = parseInt(fillersList[i][j]);
            }
        }

        for (var i = 0; i < fillersList.length; i++) {
            fillersObj[fillersList[i][0]] = fillersList[i][1];
        }

        return fillersObj;

    },
    consturctUrl: function (show) {
        show = show.replace(/dub/g, '').trim().replace(/ /g, '-');
        var url = 'http://www.animefillerlist.com/shows/' + show;

        return url;
    },
    isBetweenFillers: function (episode, fillers) {
        for (var from in fillers) {
            if (fillers.hasOwnProperty(from)) {
                if (episode >= parseInt(from) && episode <= fillers[from])
                    return (fillers[from] + 1);
            }
        }

        return false;
    },
    isFiller: function (show, episode, callback) {
        show = show.replace(/shippuuden/g, 'shippuden');
        function getFillersList(show, episode, callback) {
            var url = this.consturctUrl(show), req = new XMLHttpRequest();

            var fillers = this;
            req.onreadystatechange = function () {
                if (req.readyState == 4 && (req.status == 200 || req.status == 201 || req.status == 304)) {
                    var fillerObj = {};
                    fillerObj[show] = fillers.parseList(($(req.responseXML.body).find('#Condensed').find('.filler')));

                    updateExtensionStorageObject('local', ['fillers'], fillerObj, function () {

                        if (callback && fillers.isBetweenFillers(episode, fillerObj[show]))
                            callback(show, fillers.isBetweenFillers(episode, fillerObj[show]));
                    });
                }
            }

            req.open('GET', url, true);
            req.responseType = "document";
            req.send();
        }

        var fillers = this;
        chrome.storage.local.get('fillers', function (fillersObj) {
            if (fillersObj.fillers) {
                if (fillersObj.fillers[show]) {
                    if (callback && fillers.isBetweenFillers(episode, fillersObj.fillers[show]))
                        callback(show, fillers.isBetweenFillers(episode, fillersObj.fillers[show]));
                }
                else {
                    getFillersList.call(fillers, show, episode, callback);
                }
            }
            else {
                chrome.storage.local.set({fillers: {}}, function () {
                    getFillersList.call(fillers, show, episode, callback);
                });
            }
        });
    }
}