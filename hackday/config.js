PxHelper = {};
PxHelper.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for ( var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
};
PxHelper.eraseCookie = function(name) {
    var options = {};
    options.time = -1 * 24 * 60 * 60 * 1000;
    options.domain = document.domain;
    options.path = "/";
    PxHelper.createCookie(name, "", options);
}

function augmentKeyValuePair(key, value) {
    var result = [];
    result.push(key);
    result.push("=");
    result.push(value);
    return result.join("");
}

PxHelper.createCookie = function(name, value, options) {
    if (typeof (options) == "undefined" || options == null) {
        options = {};
    }
    var result = [];
    result.push(augmentKeyValuePair(name, value));
    if (typeof (options.time) == "undefined" || options.time == null) {
        var date = new Date();
        date.setTime(date.getTime() + options.time);
        result.push(augmentKeyValuePair("expires", date.toGMTString()));
    }
    if (typeof (options.path) == "undefined" || options.path == null) {
        options.path = "/";
    }
    result.push(augmentKeyValuePair("path", options.path));
    if (typeof (options.domain) == "undefined" || options.domain == null) {
        result.push(augmentKeyValuePair("domain", options.domain));
    }
    document.cookie = result.join("; ");
};

PxHelper.getUseCase = function() {
    var loc = location.href;
    var useCase = "unknown";

    var contentFrame = $("ContentFrame");
    var isErrorScenario = false;
    if (contentFrame) {
        var errorContainers = contentFrame.select('h1');
        errorContainers.each(function(errorContainer) {
            if (errorContainer && !isErrorScenario) {
                if (Element.hasClassName(errorContainer, "Failure")) {
                    isErrorScenario = true;
                } else if (loc.indexOf("trains/results") > 0 && Element.hasClassName(errorContainer, "Error")) {
                    isErrorScenario = true;
                }
            }
        });
    }

    if (isErrorScenario) {
        return "errorOnWebsite";
    }

    var flightsFound = undefined;
    if (loc.indexOf("flights/noresults") > 0) {
        flightsFound = false;
    }
    if (loc.indexOf("flights/results") > 0) {
        flightsFound = true;
    }
    if (loc.indexOf("trains/results") > 0) {
        if (trainData["total_count"] == "0") {
            var showTrainOptionDone = PxHelper.readCookie("showTrainOption");
            if (showTrainOptionDone == "true") {
                return "showChatAndCall";
            }
        }
    }

    if (flightsFound == false) {
        return "showTrainOption";
    }
    return useCase;
};

PxHelper.getRootElement = function(useCase) {
    // if (useCase == "showTrainOption") {
    return $("Header");
    // }
    // return null;
}

PxHelper.getConfig = function(useCase) {
    var config = {
        "showTrainOption" : {},
        "showChatAndCall" : {},
        "errorOnWebsite" : {}
    };

    function convertToObject(str) {
        var entries = str.split("&");
        var obj = {};
        for ( var i = 0; i < entries.length; i++) {
            var vals = entries[i].split("=");
            if (vals.length == 2) {
                obj[vals[0]] = vals[1];
            }
        }
        return obj;
    }

    function fooDate(d) {
        return d.replace(/\//gi, "-");
    }

    var data = config[useCase] || {};
    data.options = data.options || [];
    data.links = data.links || [];

    if (useCase == "errorOnWebsite") {
        data.text = "Sorry our servers misbehaved. :-( Would you like to try following for immediate attention?";
        data.options.push( {
            "id" : "chat",
            "text" : "Chat with agent",
            "href" : "https://admin.instantservice.com/Customer?ai=6328&di=42907&reason=serverMisbehaved"
        });
    }

    if (useCase == "showTrainOption") {
        PxHelper.createCookie("showTrainOption", "true");
        var cookieData = convertToObject(PxHelper.readCookie("flight_sr"));
        var origin = unescape(cookieData.origin.split(",")[0]);
        var destination = unescape(cookieData.destination.split(",")[0]);
        var departDate = fooDate(cookieData["depart_date"]);
        var adultsCount = cookieData["adults"];
        var childCount = cookieData["childs"];
        data.type = "pp";
        data.text = "Sorry we couldn't find flights for you from " + origin + " to " + destination
                + "! :( Would you like to book train tickets instead?";
        var trainBookingUrl = "http://www.cleartrip.com/trains/results?from_city=" + origin + "&to_city=" + destination
                + "&class=SL&date=" + departDate + "&adults=" + adultsCount + "&children=" + childCount
                + "&male_seniors=0&female_seniors=0";
        var chatUrl = "https://admin.instantservice.com/Customer?ai=6328&di=42907&from_city=" + origin + "&to_city="
                + destination + "&class=SL&date=" + departDate + "&adults=" + adultsCount + "&children=" + childCount
                + "&male_seniors=0&female_seniors=0";
        data.options.push( {
            "id" : "booktrain",
            "text" : "Book train ticket",
            "href" : trainBookingUrl,
            "push" : true
        });
        data.options.push( {
            "id" : "chat",
            "text" : "Chat with agent",
            "href" : chatUrl
        });
        data.links.push( {
            "id" : "chat-img",
            "href" : chatUrl,
            "img" : "http://www.sumitkumar.in/hackday/images/spechbubble.png"
        });
    }

    else if (useCase == "showChatAndCall") {
        var showTrainOptionDone = PxHelper.readCookie("showTrainOption");
        if (showTrainOptionDone == "true") {
            PxHelper.eraseCookie("showTrainOption");

            var sourceDestinationInfo = "(";
            var isFirst = true;
            for (stn in fromStationList) {
                if (isFirst == true) {
                    isFirst = false;
                } else {
                    sourceDestinationInfo += " AND/OR ";
                }
                sourceDestinationInfo += fromStationList[stn].name;
            }
            sourceDestinationInfo += ") to (";
            isFirst = true;
            for (stn in toStationList) {
                if (isFirst == true) {
                    isFirst = false;
                } else {
                    sourceDestinationInfo += " AND/OR ";
                }
                sourceDestinationInfo += toStationList[stn].name;
            }
            sourceDestinationInfo += ")";

            data.text = "Sorry we couldn't find any train as well :(. We tried searching between "
                    + sourceDestinationInfo + ". Need help?";

        } else {
            data.text = "Sorry we couldn't help! :-(";
        }
        data.type = "pp";
        var chatUrl = "https://admin.instantservice.com/Customer?ai=6328&di=42907&from_city=" + origin + "&to_city="
                + destination + "&class=SL&date=" + departDate + "&adults=" + adultsCount + "&children=" + childCount
                + "&male_seniors=0&female_seniors=0";
        data.options.push( {
            "id" : "chat",
            "text" : "Chat with agent",
            "href" : chatUrl
        });
        data.links.push( {
            "id" : "chat-img",
            "href" : chatUrl,
            "img" : "http://www.sumitkumar.in/hackday/images/spechbubble.png"
        });
    }

    data.options.push( {
        "id" : "call",
        "text" : "Call the customer care",
        "href" : "skype:+18602339000?call",
        "push" : true
    });
    data.links.push( {
        "id" : "call-img",
        "href" : "skype:+18602339000?call",
        "img" : "http://www.sumitkumar.in/hackday/images/telephone.png"
    });
    data.links.push( {
        "id" : "youtube-img",
        "href" : "http://www.youtube.com/embed/SsdbC9cbsVs",
        "img" : "http://www.sumitkumar.in/hackday/images/youtube.png"
    });
    return data;
};
Element.observe(window, "load", function() {
    var useCase = PxHelper.getUseCase();
    if (useCase != "unknown") {
        var rootElem = PxHelper.getRootElement(useCase);
        var config = PxHelper.getConfig(useCase);
        var widget = new PxHelper.PPWidget(rootElem, config);
    }
});
