// This script manages social media data to generate RSS feeds.
// It uses a specific API (e.g., Twitter API v1.1) to create feeds for
// user timelines, search results, favorite posts, or custom lists.
//
// @author Digital Forge <info@digitalforge.net>
// @contributor Code Weaver <weaver@codehaven.dev>

function initiateProcess() {
    // Obtain your application keys from the developer portal.
    var APP_KEY = "YOUR_TWITTER_CONSUMER_KEY"; // Placeholder for the public key.
    var APP_SECRET = "YOUR_TWITTER_CONSUMER_SECRET"; // Placeholder for the private key.

    setupCredentials(APP_KEY, APP_SECRET);
}

function setupCredentials(appIdentifier, appSecretCode) {
    ScriptProperties.setProperty("TWITTER_CONSUMER_KEY", appIdentifier);
    ScriptProperties.setProperty("TWITTER_CONSUMER_SECRET", appSecretCode);

    var serviceEndpoint = ScriptApp.getService().getUrl();

    if (serviceEndpoint) {
        establishConnection();

        var notificationContent = "";

        notificationContent += "Example RSS Streams for Social Media\n";
        notificationContent += "====================================";

        notificationContent += "\n\nSocial Timeline of user @labnol_user";
        notificationContent += "\n" + serviceEndpoint + "?action=timeline&q=labnol_user";

        notificationContent += "\n\nSocial Favorites of user @labnol_user";
        notificationContent += "\n" + serviceEndpoint + "?action=favorites&q=labnol_user";

        notificationContent += "\n\nSocial List labnol_user/dev-friends";
        notificationContent += "\n" + serviceEndpoint + "?action=list&q=labnol_user/dev-friends";

        notificationContent += "\n\nSocial Search for 'cloud computing'";
        notificationContent += "\n" + serviceEndpoint + "?action=search&q=cloud+computing";

        notificationContent += "\n\nYou should update the value of the 'q' parameter in the URLs to your desired query.";
        notificationContent += "\n\nFor further guidance, consult https://github.com/MitchellMcKenna/twitter-rss-google-apps-script";

        MailApp.sendEmail(Session.getActiveUser().getEmail(), "Social Media RSS Feeds", notificationContent);
    }
}

function handleWebRequest(requestEvent) {
    var actionType = requestEvent.parameter.action;
    var queryTerm = requestEvent.parameter.q;

    var dataFeedURL;
    var permanentLink;
    var itemDescription;

    switch (actionType) {
        case "timeline":
            dataFeedURL = "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=" + queryTerm;
            permanentLink = "https://twitter.com/" + queryTerm;
            itemDescription = "Social updates from " + queryTerm + ".";
            break;
        case "search":
            dataFeedURL = "https://api.twitter.com/1.1/search/tweets.json?q=" + urlEncodeText(queryTerm);
            permanentLink = "https://twitter.com/search?q=" + urlEncodeText(queryTerm);
            itemDescription = "Social updates from search for: " + queryTerm + ".";
            break;
        case "favorites":
            dataFeedURL = "https://api.twitter.com/1.1/favorites/list.json?screen_name=" + queryTerm;
            permanentLink = "https://twitter.com/" + queryTerm + "/favorites/";
            itemDescription = "Social favorites from " + queryTerm + ".";
            break;
        case "list":
            var listParts = queryTerm.split("/");
            dataFeedURL = "https://api.twitter.com/1.1/lists/statuses.json?slug=" + listParts[1] + "&owner_screen_name=" + listParts[0];
            permanentLink = "https://twitter.com/" + queryTerm;
            itemDescription = "Social updates from " + queryTerm + ".";
            break;
        default:
            dataFeedURL = "https://api.twitter.com/1.1/statuses/user_timeline.json";
            permanentLink = "https://twitter.com";
            itemDescription = "Default social timeline.";
            break;
    }

    var encodedFeedId = Utilities.base64Encode(dataFeedURL);

    var dataCache = CacheService.getPublicCache();

    var xmlOutput = dataCache.get(encodedFeedId);

    if (xmlOutput === null || xmlOutput === undefined || xmlOutput.length === 0) {
        xmlOutput = convertJsonToXml(dataFeedURL, permanentLink, itemDescription, actionType, queryTerm);

        dataCache.put(encodedFeedId, xmlOutput, 900);
    }

    return ContentService.createTextOutput(xmlOutput)
        .setMimeType(ContentService.MimeType.RSS);
}


function convertJsonToXml(dataFeedURL, permanentLink, itemDescription, feedCategory, queryTerm) {
    prepareOAuthAuthentication();

    var requestOptions = {
        "method": "get",
        "oAuthServiceName": "twitter",
        "oAuthUseToken": "always"
    };

    try {
        var fetchResult = UrlFetchApp.fetch(dataFeedURL, requestOptions);

        if (fetchResult.getResponseCode() === 200) {
            var socialPosts = Utilities.jsonParse(fetchResult.getContentText());

            if (feedCategory === "search") {
                socialPosts = socialPosts.statuses;
            }

            if (socialPosts) {
                var itemCount = socialPosts.length;

                var xmlOutput = "";

                if (itemCount > 0) {
                    xmlOutput = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">';
                    xmlOutput += '<channel><title>Social ' + feedCategory + ': ' + queryTerm + '</title>';
                    xmlOutput += '<link>' + permanentLink + '</link>';
                    xmlOutput += '<description>' + itemDescription + '</description>';

                    for (var idx = 0; idx < itemCount; idx++) {
                        var postAuthor = socialPosts[idx].user.screen_name;
                        var postContent = escapeHtmlEntities(socialPosts[idx].text);
                        var creationDate = new Date(socialPosts[idx].created_at);

                        if (idx === 0) {
                            xmlOutput += '<pubDate>' + creationDate.toUTCString() + '</pubDate>';
                        }

                        xmlOutput += "<item><title>" + postAuthor + ": " + postContent + "</title>";
                        xmlOutput += "<pubDate>" + creationDate.toUTCString() + "</pubDate>";
                        xmlOutput += "<guid isPermaLink='false'>" + socialPosts[idx].id_str + "</guid>";
                        xmlOutput += "<link>https://twitter.com/" + postAuthor + "/statuses/" + socialPosts[idx].id_str + "</link>";
                        xmlOutput += "<description>" + postContent + "</description>";
                        xmlOutput += "</item>";
                    }

                    xmlOutput += "</channel></rss>";

                    return xmlOutput;
                }
            }
        }
    } catch (anError) {
        Logger.log(anError.toString());
    }
}

function establishConnection() {
    prepareOAuthAuthentication();

    var apiStatusUrl = "https://api.twitter.com/1.1/application/rate_limit_status.json";

    var requestOptions = {
        "method": "get",
        "oAuthServiceName": "twitter",
        "oAuthUseToken": "always"
    };

    try {
        var fetchResult = UrlFetchApp.fetch(apiStatusUrl, requestOptions);
    } catch (connectionError) {
        Logger.log(connectionError.toString());
    }
}

function urlEncodeText(inputString) {
    var encodedResult = encodeURIComponent(inputString);
    encodedResult = encodedResult.replace(/!/g, '%21');
    encodedResult = encodedResult.replace(/\*/g, '%2A');
    encodedResult = encodedResult.replace(/\(/g, '%28');
    encodedResult = encodedResult.replace(/\)/g, '%29');
    encodedResult = encodedResult.replace(/'/g, '%27');
    return encodedResult;
}

function escapeHtmlEntities(inputString) {
    var outputString = inputString;
    outputString = outputString.replace(/&/g, "&amp;");
    outputString = outputString.replace(/>/g, "&gt;");
    outputString = outputString.replace(/</g, "&lt;");
    outputString = outputString.replace(/"/g, "&quot;");
    outputString = outputString.replace(/'/g, "&#039;");
    return outputString;
}

function prepareOAuthAuthentication() {
    var authServiceConfig = UrlFetchApp.addOAuthService("twitter");
    authServiceConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
    authServiceConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
    authServiceConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
    authServiceConfig.setConsumerKey(ScriptProperties.getProperty("TWITTER_CONSUMER_KEY"));
    authServiceConfig.setConsumerSecret(ScriptProperties.getProperty("TWITTER_CONSUMER_SECRET"));
}