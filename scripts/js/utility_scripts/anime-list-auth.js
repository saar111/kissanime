var hummingbird = {
    getAnimeId: function (show, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                var jsonresponse = JSON.parse(xhr.response);
                var id = jsonresponse[0].id;

                if (callback)
                    callback(id);
            }
        };

        xhr.open('GET', 'http://hummingbird.me/api/v1/search/anime?query=' + show, true);
        xhr.send();
    },
    getAnimeInfo: function (show, callback) {
        var xhr = new XMLHttpRequest(), hummingbird = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                var jsonresponse = JSON.parse(xhr.response);
                var synopsis = jsonresponse[0].synopsis;
                var poster = jsonresponse[0].cover_image;
                var age_rating = jsonresponse[0].age_rating || '';
                var rating = Math.round(jsonresponse[0].community_rating || 0);

                if (callback)
                    callback(synopsis, poster, age_rating, rating);
            }
        };

        xhr.open('GET', 'http://hummingbird.me/api/v1/search/anime?query=' + show, true);
        xhr.send();
    },
    authenticate: function (username, password, valid, invalid) {
        var xhr = new XMLHttpRequest(), hummingbird = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                var auth_token = xhr.response;

                if (valid)
                    valid.call(hummingbird, auth_token);
            }
            if (xhr.readyState == 4 && (xhr.status == 401)) {
                var error;
                try {
                    error = JSON.parse(xhr.response).error;
                } catch (err) {
                }

                if (error == 'Invalid credentials') {
                    if (invalid)
                        invalid(error);
                }
            }
        };


        xhr.open('POST', 'http://hummingbird.me/api/v1/users/authenticate', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('username=' + username + '&password=' + password);


    },
    addEpisode: function (username, password, show, episode) {
        this.authenticate(username, password, function (token) {
            this.getAnimeId(show, function (id) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                    }
                };

                xhr.open('POST', 'http://hummingbird.me/api/v1/libraries/' + id, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send('auth_token=' + token.replace(/"/g, '') + '&status=currently-watching&privacy=public' + '&episodes_watched=' + episode);

            })
        })

    }

}
var mal = {
    getAnimeId: function (username, password, show, callback) {
        var xhr = new XMLHttpRequest(), mal = this;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                var id = xhr.response.substring(xhr.response.indexOf('<id>'), xhr.response.indexOf('</id>')).replace('<id>', '');

                if (callback)
                    callback.call(mal, id);
            }
        };

        xhr.open('GET', 'http://myanimelist.net/api/anime/search.xml?q=' + show.replace(/ /g, '+'), true, username, password);
        xhr.send();
    },
    authenticate: function (username, password, valid, invalid) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
                if (valid)
                    valid();
            }
            if (xhr.readyState == 4 && (xhr.status == 401)) {
                var error = xhr.response;

                if (error == 'Invalid credentials') {
                    if (invalid)
                        invalid(error);
                }
                if (error == 'This anime is already on your list.') {
                    if (invalid)
                        invalid(error);
                }
            }
        };


        xhr.open('GET', 'http://myanimelist.net/api/account/verify_credentials.xml', true, username, password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();
    },
    addEpisode: function (username, password, show, episode) {
        this.getAnimeId(username, password, show, function (id) {
            var xhr = new XMLHttpRequest(), mal = this;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {

                }
                if (xhr.readyState == 4 && (xhr.status == 501)) {
                    var error = xhr.response;

                    if (error == 'This anime is already on your list.') {
                        mal.updateEpisode(username, password, episode, id);
                    }
                }
            };

            var data = '<entry>' +
                '<episode>' + episode + '</episode>' +
                '<status>1</status>' +
                '<score></score>' +
                '<downloaded_episodes></downloaded_episodes>' +
                '<date_start></date_start>' +
                '<date_finish></date_finish>' + '<comments></comments>' +
                '<storage_value></storage_value>' +
                '<times_rewatched></times_rewatched>' +
                '<rewatch_value></rewatch_value>' +
                '<priority></priority>' +
                '<storage_type></storage_type>' +
                '<enable_rewatching></enable_rewatching>' +
                '<enable_discussion></enable_discussion>' +
                '<fansub_group></fansub_group>' +
                '<tags></tags>' + '</entry>';


            xhr.open('POST', 'http://myanimelist.net/api/animelist/add/' + id + '.xml', true, username, password);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send('data=' + data);
        });
    },
    updateEpisode: function (username, password, episode, id) {
        var xhr = new XMLHttpRequest(), mal = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
            }
            if (xhr.readyState == 4 && (xhr.status == 401)) {
            }
        };

        var data = '<entry>' +
            '<episode>' + episode + '</episode>' +
            '<status>1</status>' +
            '<score></score>' +
            '<downloaded_episodes></downloaded_episodes>' +
            '<date_start></date_start>' +
            '<date_finish></date_finish>' + '<comments></comments>' +
            '<storage_value></storage_value>' +
            '<times_rewatched></times_rewatched>' +
            '<rewatch_value></rewatch_value>' +
            '<priority></priority>' +
            '<storage_type></storage_type>' +
            '<enable_rewatching></enable_rewatching>' +
            '<enable_discussion></enable_discussion>' +
            '<fansub_group></fansub_group>' +
            '<tags></tags>' + '</entry>';


        xhr.open('POST', 'http://myanimelist.net/api/animelist/update/' + id + '.xml', true, username, password);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('data=' + data);
    }
};
var trakt = {
    formatShow: function (show) {
        return show.replace(/ /g, '-').replace(/shippuuden/g, 'shippuden');
    },
	getAccessToken: function(){
		alert(chrome.webRequest);
	
		xhr = new XMLHttpRequest()
		xhr.onload = function(){
			console.log(this.getResponseHeader);
			alert(this.getResponseHeader('location'));
		}
		console.log('before xhr');
		
		xhr.open('GET', 'https://trakt.tv/oauth/authorize?client_id=7f673ab492e9859ebff2b3d024ce69d2223cf1849ad2321324ed2f1d4032221b&redirect_uri=https%3A%2F%2Fwww.runscope.com%2Foauth_tool%2Fcallback&response_type=code');
		xhr.send()
	},
	authenticate: function(callback){
		this.getAccessToken();
		var access_token = window.localStorage.getItem('access_token') || {value: 'dad7d8673c6895ce0d051c3f0f2e96980eef097447bb4e524a349a1035dfa249', date: (new Date()).getTime()};
		
		if (access_token.date/1000/60/60/24 > 50) {
			
		}
	},
    episodeToSeason: function (episode, episodeSeasonIndexing) {
        for (var season in episodeSeasonIndexing) {
            if (episodeSeasonIndexing.hasOwnProperty(season)) {
                for (var range_start in episodeSeasonIndexing[season]) {
                    if (episodeSeasonIndexing[season].hasOwnProperty(range_start)) {
                        if (isBetween(episode, range_start, episodeSeasonIndexing[season][range_start])) {
                            return season;
                        }
                    }
                }
            }
        }
    },
    episodeToRelative: function (episode, episodeSeasonIndexing) {
        var relativeEpisode = episode;
        for (var season in episodeSeasonIndexing) {
            if (episodeSeasonIndexing.hasOwnProperty(season)) {
                for (var range_start in episodeSeasonIndexing[season]) {
                    if (episodeSeasonIndexing[season].hasOwnProperty(range_start)) {
                        if (relativeEpisode - (episodeSeasonIndexing[season][range_start] - range_start + 1) <= 0)
                            return relativeEpisode;
                        else
                            relativeEpisode -= (episodeSeasonIndexing[season][range_start] - range_start + 1);
                    }
                }
            }
        }
        return relativeEpisode;
    },
    getSeasonAndRelativeEpisode: function (show, episode, callback, failed) {
        var xhr = new XMLHttpRequest(), trakt = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(xhr.status == 200 || xhr.status == 201) {
                    var body = $(xhr.responseXML.body);
                    var titles = body.find('.season-posters').children().find('.titles').children().get().reverse();
                    var episodeSeasonIndexing = {};

                    var episodeEndRange = 0;
                    for (var i = 1; i < titles.length; i += 2) {
                        titles[i] = $(titles[i]).text();
                        titles[i - 1] = $(titles[i - 1]).text();
                        if (titles[i].toLowerCase().indexOf('season') != -1) {
                            var season = (parseInt(titles[i].toLowerCase().replace(/Season|season/g, '').replace(/ /g, '')));
                            var episodeStartRange = episodeEndRange + 1;
                            episodeEndRange += (parseInt(titles[i - 1].toLowerCase().replace(/Episode|episode/g, '').replace(/ /g, '')));

                            var episodeObj = {};
                            episodeObj[episodeStartRange] = episodeEndRange;
                            episodeSeasonIndexing[season] = episodeObj;
                        }
                    }

                    var season = trakt.episodeToSeason(episode, episodeSeasonIndexing);
                    episode = trakt.episodeToRelative(episode, episodeSeasonIndexing);

                    if (callback && season && episode != undefined)
                        callback.call(trakt, season, episode);
                }
                else {
                    if (failed)
                        failed();
                }
            }
        };

        xhr.open('GET', 'http://trakt.tv/shows/' + this.formatShow(show), true);
        xhr.responseType = "document";
        xhr.send();
    },

    getEpisodeSynopsis: function (show, episode, callback, failed) {
        this.getSeasonAndRelativeEpisode(show, episode, function (season, episode) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 || xhr.status == 201 || xhr.status == 304) {
                        var jsonresponse = JSON.parse(xhr.response);
                        var synopsis = jsonresponse.overview;
                        var title = jsonresponse.title;

                        if (callback)
                            callback(synopsis, title);
                    }
                    else {
                        if (failed)
                            failed();
                    }
                }
            };

            xhr.open('GET', 'https:/api-v2launch.trakt.tv/shows/' + this.formatShow(show) + '/seasons/' + season + '/episodes/' + episode + '?extended=full', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('trakt-api-version', '2');
            xhr.setRequestHeader('trakt-api-key', '7f673ab492e9859ebff2b3d024ce69d2223cf1849ad2321324ed2f1d4032221b');
            xhr.setRequestHeader('Authorization', 'Bearer 34480f3e62197a65f2ccc9052eefa325d354ab540a60ad07f73a45fdaf714d42');
            xhr.send();
        }, failed)


    }
};

function getSynopsis(show, episode, callback) {
    if (!callback) return;
	
	//strakt.authenticate();
    show = win.removeSubDub(show);
    hummingbird.getAnimeInfo(show, function (general_synopsis, coverimg, age_rating, rating) {
        if (episode > 1) {
            trakt.getEpisodeSynopsis(show, episode, function (episode_synopsis, title) {
                callback(episode_synopsis || "* No synopsis available yet *", coverimg, age_rating, rating, title);
            }, function () {
                callback('* Couldn\'t fetch episode synopsis *', coverimg, age_rating, rating);
            });
        }
        else {
            callback(general_synopsis, coverimg, age_rating, rating);
        }
    });
}










