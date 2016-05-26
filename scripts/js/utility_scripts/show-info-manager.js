var showInfoManager = {
    isShowStillAiring: function (show, showElement, episode, callback) {
        function isShowStillAiring() {
            var xhr = new XMLHttpRequest(), showInfoManager = this;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                    var jsonresponse = JSON.parse(xhr.response);
                    var isAiring = (jsonresponse[0].status || '').toLowerCase() == 'currently airing';

                    updateExtensionStorageObject('local', [show + ' airing', 'airing'], isAiring);

                    if (callback && isAiring)
                        callback(show, showElement, episode);
                }
            };

            xhr.open('GET', 'http://hummingbird.me/api/v1/search/anime?query=' + show, true);
            xhr.send();
        }

        chrome.storage.local.get(show + ' airing', function (airing) {
            airing = airing[show + ' airing'];
            if (airing) {
                if (airing.count >= 10) {
                    updateExtensionStorageObject('local', [show + ' airing', 'count'], 0);
                    isShowStillAiring();
                }
                else if (airing.airing != undefined) {
                    updateExtensionStorageObject('local', [show + ' airing', 'count'], airing.count + 1);
                    if (callback && airing.airing) {
                        callback(show, showElement, episode);
                    }
                }
            }
            else {
                var airingObj = {};
                airingObj[show + ' airing'] = {count: 0};
                chrome.storage.local.set(airingObj);
                isShowStillAiring();
            }
        });
    },
    isNewEpisode: function (show, showElement, episode, callback) {
        function removeEvenCells(arr) {
            for (var cell = (arr.length % 2 == 0 ? (arr.length - 1) : (arr.length - 2)); cell >= 1; cell -= 2) {
                arr.splice(cell, 1);
            }
        }

        function extremeParseInt(string) {
            for (var i = 0; i < string.length; i++) {
                if (!isNaN(parseInt(string.substring(i)))) {
                    return parseInt(string.substring(i));
                }
            }
        }

        var xhr = new XMLHttpRequest(), showInfoManager = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                episodes = $(xhr.responseXML.body).find('.listing').children().children().find('td');
                links = $(xhr.responseXML.body).find('.listing').children().children().find('td').children();

                removeEvenCells(episodes);
                for (var episodeIndex = 0; episodeIndex < episodes.length; episodeIndex++) {
                    links[episodeIndex] = links[episodeIndex] ? links[episodeIndex].href : '';
                    episodes[episodeIndex] = $(episodes[episodeIndex]).text().trim();
                    episodes[episodeIndex] = extremeParseInt(episodes[episodeIndex].substring(episodes[episodeIndex].toLowerCase().indexOf('episode')));
                }

                var latestEpisode = 0;
                var link = '';
                for (var episodeIndex = 0; episodeIndex < episodes.length; episodeIndex++) {
                    if (episodes[episodeIndex] > episode) {
                        latestEpisode = episodes[episodeIndex];
                        link = links[episodeIndex];
                    }
                }

                if (callback && latestEpisode) {
                    callback(show, showElement, latestEpisode, link);
                }
            }
        };

        xhr.open('GET', 'http://kissanime.to/Anime/' + show.replace(/ /g, '-'), true);
        xhr.responseType = "document";
        xhr.send();
    }
};