const appConfig = {
    consumerId: "YOUR_APP_KEY",
    consumerToken: "YOUR_APP_SECRET",
};

const appSecrets = {
    idKey: "APP_KEY_IDENTIFIER",
    tokenKey: "APP_TOKEN_IDENTIFIER",

    storeKeys: (identifier, token) => {
        ScriptProperties.setProperty(appSecrets.idKey, identifier);
        ScriptProperties.setProperty(appSecrets.tokenKey, token);
    },
    retrieveId: () => ScriptProperties.getProperty(appSecrets.idKey),
    retrieveToken: () => ScriptProperties.getProperty(appSecrets.tokenKey)
};

const authorizer = {
    serviceName: "microblog_access",
    setup: () => {
        const authService = UrlFetchApp.addOAuthService(authorizer.serviceName);
        authService.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
        authService.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
        authService.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
        authService.setConsumerKey(appSecrets.retrieveId());
        authService.setConsumerSecret(appSecrets.retrieveToken());
    },
    verifyConnection: () => {
        authorizer.setup();
        const testEndpoint = "https://api.twitter.com/1.1/application/rate_limit_status.json";
        const fetchOptions = {
            "method": "get",
            "oAuthServiceName": authorizer.serviceName,
            "oAuthUseToken": "always"
        };
        try {
            UrlFetchApp.fetch(testEndpoint, fetchOptions);
        } catch (err) {
            Logger.log("Connection verification failed: " + err.toString());
        }
    }
};

const urlEncoder = {
    encodeParam: (rawInput) => {
        let processed = encodeURIComponent(rawInput);
        processed = processed.replace(/!/g, '%21');
        processed = processed.replace(/\*/g, '%2A');
        processed = processed.replace(/\(/g, '%28');
        processed = processed.replace(/\)/g, '%29');
        processed = processed.replace(/'/g, '%27');
        return processed;
    }
};

const htmlEncoder = {
    escapeContent: (rawInput) => {
        const mapping = {
            '&': '&amp;',
            '>': '&gt;',
            '<': '&lt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return rawInput.replace(/[&><"']/g, char => mapping[char]);
    }
};

const apiClient = {
    retrieveData: (endpoint, authServiceName) => {
        authorizer.setup();
        const requestOpts = {
            "method": "get",
            "oAuthServiceName": authServiceName,
            "oAuthUseToken": "always"
        };
        try {
            const response = UrlFetchApp.fetch(endpoint, requestOpts);
            if (response.getResponseCode() === 200) {
                return Utilities.jsonParse(response.getContentText());
            }
        } catch (error) {
            Logger.log("API client error: " + error.toString());
        }
        return null;
    }
};

const dataCache = {
    cacheDuration: 900,
    getEntry: (keyIdentifier) => CacheService.getPublicCache().get(keyIdentifier),
    setEntry: (keyIdentifier, contentData) => CacheService.getPublicCache().put(keyIdentifier, contentData, dataCache.cacheDuration)
};

const feedCreator = {
    generateXml: (apiPath, resourcePath, contentSummary, operationType, searchCrit) => {
        const fetchedData = apiClient.retrieveData(apiPath, authorizer.serviceName);

        if (!fetchedData) {
            return null;
        }

        let tweetData = fetchedData;
        if (operationType === "search") {
            tweetData = fetchedData.statuses;
        }

        if (!tweetData || tweetData.length === 0) {
            return null;
        }

        const firstTweetDate = new Date(tweetData[0].created_at).toUTCString();

        const rssItems = tweetData.map(post => {
            const posterId = post.user.screen_name;
            const postText = htmlEncoder.escapeContent(post.text);
            const postDate = new Date(post.created_at).toUTCString();
            const uniqueId = post.id_str;
            const postLink = `https://twitter.com/${posterId}/statuses/${uniqueId}`;

            return `<item><title>${posterId}: ${postText}</title><pubDate>${postDate}</pubDate><guid isPermaLink='false'>${uniqueId}</guid><link>${postLink}</link><description>${postText}</description></item>`;
        }).join('');

        const channelTitle = `Microblog ${operationType}: ${searchCrit}`;

        return `<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title>${channelTitle}</title>
        <link>${resourcePath}</link>
        <description>${contentSummary}</description>
        <pubDate>${firstTweetDate}</pubDate>
        ${rssItems}
    </channel>
</rss>`;
    }
};

const requestProcessor = {
    actionRoutes: {
        "timeline": (queryVal) => ({
            dataEndpoint: `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${queryVal}`,
            resourceAddress: `https://twitter.com/${queryVal}`,
            summaryText: `Microblog updates from ${queryVal}.`,
            queryModifier: null
        }),
        "search": (queryVal) => ({
            dataEndpoint: `https://api.twitter.com/1.1/search/tweets.json?q=${urlEncoder.encodeParam(queryVal)}`,
            resourceAddress: `https://twitter.com/search?q=${urlEncoder.encodeParam(queryVal)}`,
            summaryText: `Microblog updates from search for: ${queryVal}.`,
            queryModifier: (data) => data.statuses
        }),
        "favorites": (queryVal) => ({
            dataEndpoint: `https://api.twitter.com/1.1/favorites/list.json?screen_name=${queryVal}`,
            resourceAddress: `https://twitter.com/${queryVal}/favorites/`,
            summaryText: `Microblog favorites from ${queryVal}.`,
            queryModifier: null
        }),
        "list": (queryVal) => {
            const parts = queryVal.split("/");
            return {
                dataEndpoint: `https://api.twitter.com/1.1/lists/statuses.json?slug=${parts[1]}&owner_screen_name=${parts[0]}`,
                resourceAddress: `https://twitter.com/${queryVal}`,
                summaryText: `Microblog updates from ${queryVal}.`,
                queryModifier: null
            };
        },
        "default": () => ({
            dataEndpoint: "https://api.twitter.com/1.1/statuses/user_timeline.json",
            resourceAddress: "https://twitter.com",
            summaryText: "Microblog timeline.",
            queryModifier: null
        })
    },

    handleGet: (incomingEvent) => {
        const activityType = incomingEvent.parameter.activity || "default";
        const activityQuery = incomingEvent.parameter.criteria;

        const routeHandler = requestProcessor.actionRoutes[activityType] || requestProcessor.actionRoutes["default"];
        const { dataEndpoint, resourceAddress, summaryText } = routeHandler(activityQuery);

        const cacheKey = Utilities.base64Encode(dataEndpoint);
        let feedContent = dataCache.getEntry(cacheKey);

        if (!feedContent) {
            feedContent = feedCreator.generateXml(dataEndpoint, resourceAddress, summaryText, activityType, activityQuery);
            if (feedContent) {
                dataCache.setEntry(cacheKey, feedContent);
            }
        }

        return ContentService.createTextOutput(feedContent || "").setMimeType(ContentService.MimeType.RSS);
    }
};

function configureService() {
    appSecrets.storeKeys(appConfig.consumerId, appConfig.consumerToken);

    const serviceUrl = ScriptApp.getService().getUrl();

    if (serviceUrl) {
        authorizer.verifyConnection();

        const messageParts = [
            "Sample Microblog Feeds\n",
            "============================",
            "\n\nMicroblog Timeline for user @exampleuser",
            `\n${serviceUrl}?activity=timeline&criteria=exampleuser`,
            "\n\nMicroblog Favorites for user @exampleuser",
            `\n${serviceUrl}?activity=favorites&criteria=exampleuser`,
            "\n\nMicroblog List exampleuser/friends-list",
            `\n${serviceUrl}?activity=list&criteria=exampleuser/friends-list`,
            "\n\nMicroblog Search for San Francisco",
            `\n${serviceUrl}?activity=search&criteria=san+francisco`,
            "\n\nYou should adjust the 'criteria' parameter in the URLs to your preference.",
            "\n\nFor assistance, consult the project documentation."
        ];

        MailApp.sendEmail(Session.getActiveUser().getEmail(), "Microblog RSS Feeds", messageParts.join(''));
    }
}

function doGet(event) {
    return requestProcessor.handleGet(event);
}

function bootStrap() {
    configureService();
}