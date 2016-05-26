/**
 * Created by saar on 1/18/2015.
 */

function getShowImageUrl(show, callback)
{
    show = win.removeSubDub(show);
    function getUrlFromGoogle(show, callback) {
        var query = encodeURI(show).replace(/%20/g, '+');
        var url = 'https://www.google.com/search?q=' + query + '&safe=off&tbm=isch', req = new XMLHttpRequest();

        req.onreadystatechange = function () {
            if (req.readyState == 4 && (req.status == 200 || req.status == 201 || req.status == 304)) {
                var imgurl = $(req.responseXML.body).find('#rg_s').children()[0].children[0].href, obj = {};
                imgurl = getQueryValue(imgurl, 'imgurl');
                obj[show] = imgurl;

                chrome.storage.local.set(obj);

                if (callback)
                    callback(imgurl);
            }
        }

        req.open('GET', url, true);
        req.responseType = "document";
        req.send();
    }

    chrome.storage.local.get(show, function(imgurl){
        if(imgurl[show] != undefined)
            callback(imgurl[show], 'imgurl');
        else
            getUrlFromGoogle(show, callback);
    });
}