(function($appContext) {
  var   performanceMetrics = {
            domElementInsertions: 0
        },
        logPerformance = function (metricName, metricType, timeValue) {
            // Check if metric category exists, initialize if not
            if (!performanceMetrics[metricName]) {
                performanceMetrics[metricName] = {};
            }
            // If only two arguments, assume the second is the direct value
            if (arguments.length === 2) {
                performanceMetrics[metricName] = arguments[1];
            }
            else {
                // Append new time value to existing ones, separated by semicolon
                performanceMetrics[metricName][metricType] = (performanceMetrics[metricName][metricType] ? performanceMetrics[metricName][metricType] + ';' : '') + timeValue;
            }
        };

    // Expose performance utilities via the application context
    $appContext.telemetry = {
        register: logPerformance,
        metrics: performanceMetrics
    };
}(window.$appContext));


(function($appContext) {
    // Define primary and fallback API hosts for stories
    var mainApiHost = $appContext.config.api.stories,
        failoverApiHost = $appContext.config.api.storiesBackup;

    // Current active API host
    var currentApiHost = mainApiHost;

    // Collection of API endpoints
    var apiEndpoints = {
        'listingPath': '/headlines',
        'itemDetailsPath': '/record/{itemId}',
        'textViewPath': 'http://viewtext.org/api/text?url={targetUrl}&format={dataFormat}',
        'askHnSearchUrl': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="Ask+hn"&filter[fields][type]=submission&facet[queries][]=username:Ask&facet[queries][]=username:hn',
        'showHnSearchUrl': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="show+hn"&filter[fields][type]=submission&facet[queries][]=username:show&facet[queries][]=username:hn',
        'topTenByDateUrl': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type][]=submission&sortby=points+desc&filter[fields][create_ts][]=[{startPeriod}+TO+{endPeriod}]&limit=10'
    };

    // Override the default view text path with a configured readability service
    apiEndpoints.textViewPath = $appContext.config.api.readability;


    /**
     * Retrieves the appropriate endpoint URL based on the resource key.
     * @param {string} resourceKey - Identifier for the resource.
     * @returns {string} The constructed URL for the resource.
     */
    var getEndpointUrl = function(resourceKey) {

        if (resourceKey === 'listingPath' || resourceKey === 'itemDetailsPath') {
            return currentApiHost + apiEndpoints[resourceKey]
        }
        else if (resourceKey === 'askHnSearchUrl' || resourceKey === 'showHnSearchUrl') {
            return apiEndpoints[resourceKey]
        }
        else if (resourceKey === 'currentDayTop' || resourceKey === 'previousDayTop' || resourceKey === 'weeklyTop') {
            var startPeriod = new Date();
            var endPeriod;

            startPeriod.setHours(0);
            startPeriod.setMinutes(0);
            startPeriod.setSeconds(0);

            endPeriod = new Date(startPeriod);
            if (resourceKey === 'currentDayTop') {
                endPeriod.setHours(24);
            }
            else if (resourceKey === 'previousDayTop') {
                startPeriod.setHours(-24);
            }
            else if (resourceKey === 'weeklyTop') {
                startPeriod.setDate(startPeriod.getDate() - 7);
            }


            return $appContext.templateEngine.render(apiEndpoints.topTenByDateUrl, {
                'startPeriod': startPeriod.toISOString(),
                'endPeriod': endPeriod.toISOString()
            });
        }
    };


    var lastHostSwitchTime; // Timestamp of the last API host switch
    /**
     * Switches the active API host if a certain time has passed since the last switch.
     * @param {string} requestPath - (Unused) The path of the failed request.
     * @returns {boolean} True if the host was switched, false otherwise.
     */
    var switchApiHost = function(requestPath) {
        console.warn('Initiating API host switch:', lastHostSwitchTime, currentApiHost);
        // Only switch if no previous switch or if 20 minutes have passed
        if (!lastHostSwitchTime || lastHostSwitchTime + (1000 * 60 * 20) < Date.now()) {
            lastHostSwitchTime = Date.now();
            // Toggle between primary and backup hosts
            currentApiHost = (currentApiHost === mainApiHost ? failoverApiHost : mainApiHost);
            console.info('API host switched to:', currentApiHost, 'at', lastHostSwitchTime);
            return true;
        }
        return false;
    };


    var applicationCache; // Holds cached application data

    /**
     * Initializes or clears the application cache.
     */
    var initializeCache = function() {
        applicationCache = {
            cachedItems: {} // Stores individual item data
        };
    };

    initializeCache(); // Perform initial cache setup

    /**
     * Updates and normalizes items in the application cache.
     */
    var processCachedList = function() {
        jQuery.each(applicationCache.currentList, function(itemIdx, listItem) {

            listItem.commentsViewedStatus = '';
            listItem.articleViewedStatus = '';
            // Check if this item has been viewed previously
            if (viewHistory[listItem.itemId]) {
                if (viewHistory[listItem.itemId].articleAccessed) {
                    listItem.articleViewedStatus = 'hasBeenRead';
                }
                if (viewHistory[listItem.itemId].commentsAccessed) {
                    listItem.commentsViewedStatus = 'hasBeenRead';
                }
            }
            // Special handling for job postings
            if (listItem.itemType === 'employment') {
                listItem.score = 'JOB_POST';
            }
            // Ensure author field is not null
            if (!listItem.submittedBy) {
                listItem.submittedBy = '';
            }
            // Sanitize title for display
            listItem.itemTitle = listItem.itemTitle.replace('<', '&lt;');
            applicationCache.cachedItems[listItem.itemId] = listItem;
        });
    };


    var viewHistory = {
        // Example structure for viewed items:
        // itemId: {
        //     'commentsAccessed': 1678886400000,
        //     'articleAccessed': 1678886400000,
        // },
        // schemaVersion: 2 // Schema version for future compatibility
    };

    /**
     * Loads application state from persistent storage.
     */
    var loadApplicationState = function() {
        console.info('Attempting to load persistent application state...');
        var loadStartTimestamp = Date.now();
        var storedViewHistory = window.appStore.getItem('viewed');
        var cachedListFromStorage = window.appStore.getItem('currentListing');

        $appContext.telemetry.logPerformance('storageAccess', 'readOperation', Date.now() - loadStartTimestamp);

        if (storedViewHistory) {
            // Merge stored data with current view history
            jQuery.extend(true, viewHistory, storedViewHistory);

            // Handle schema migration if needed
            if (!viewHistory.schemaVersion) {
                jQuery.each(viewHistory, function(key, entry) {
                    if (entry.articleAccessed) {
                        entry.articleAccessed = entry.oldTimestamp; // Migrate old timestamp field
                    }
                    if (entry.commentsAccessed) {
                        entry.commentsAccessed = entry.oldTimestamp; // Migrate old timestamp field
                    }
                    delete entry.oldTimestamp; // Remove deprecated field
                });
            }
            viewHistory.schemaVersion = 2; // Update to current schema version

            // Prune old entries from view history (older than 7 days)
            jQuery.each(viewHistory, function(entryKey, entry) {
                if (entryKey !== 'schemaVersion') { // Skip the version field
                    if (entry.articleAccessed < Date.now() - (1000 * 60 * 60 * 24 * 7)) {
                        delete entry.articleAccessed;
                    }
                    if (entry.commentsAccessed < Date.now() - (1000 * 60 * 60 * 24 * 7)) {
                        delete entry.commentsAccessed;
                    }
                    // Remove entry if both article and comments access times are gone
                    if (!entry.articleAccessed && !entry.commentsAccessed) {
                        delete viewHistory[entryKey];
                    }
                }
            });

            saveViewHistory(); // Persist changes after pruning
        }
        if (cachedListFromStorage) {
            // Check if cached list is still fresh (within 5 minutes)
            if (Date.now() - cachedListFromStorage.fetchTimestamp < 1000 * 60 * 5) {
                applicationCache.currentList = cachedListFromStorage.content;
                processCachedList(); // Update local data based on the loaded list
            }
        }
    };

    var saveTimeoutId = null; // Holds the timeout ID for delayed saving
    /**
     * Executes the actual saving of viewed records to persistent storage.
     * This function is typically called via a timeout.
     */
    var delayedSaveAction = function() {
        console.debug('Executing deferred persistence operation...');
        saveTimeoutId = null; // Clear the timeout ID
        window.appStore.setItem('viewed', viewHistory); // Store the current view history
    };
    /**
     * Initiates a delayed save operation for the view history.
     * Any subsequent calls within the delay period will reset the timer.
     */
    var saveViewHistory = function() {
        console.debug('Initiating delayed persistence for viewed records...');
        if (saveTimeoutId) {
            window.clearTimeout(saveTimeoutId); // Clear any existing timeout
            saveTimeoutId = null;
        }

        saveTimeoutId = window.setTimeout(delayedSaveAction, 1000); // Set a new timeout
    };

    /**
     * Marks an item as viewed with a specific access mode.
     * @param {string} itemId - The unique identifier of the item.
     * @param {string} accessMode - The type of access ('articleAccessed' or 'commentsAccessed').
     */
    var markItemAsViewed = function(itemId, accessMode) {
        if (!viewHistory[itemId]) {
            viewHistory[itemId] = {}; // Initialize entry if it doesn't exist
        }
        viewHistory[itemId][accessMode] = Date.now(); // Record the current timestamp

        saveViewHistory(); // Trigger a delayed save
    };
    loadApplicationState(); // Load initial state when script runs

    /**
     * Retrieves the current state of the application cache.
     * @returns {object} The application cache object.
     */
    var getAppCache = function() {
        return applicationCache;
    };

    /**
     * Fetches and processes the main listing of items.
     * @param {Function} onCompletion - Callback function to execute upon completion.
     */
    var fetchAndProcessListing = function(onCompletion) {
        onCompletion = onCompletion || function() {}; // Ensure callback is a function
        var handleSuccess = function(responsePayload) {
                initializeCache(); // Clear cache before populating
                $appContext.telemetry.logPerformance('listingQuery', 'dataFetch', Date.now() - requestStartTime);
                applicationCache.currentList = responsePayload;
                processCachedList(); // Update and normalize cached items
                onCompletion.apply(onCompletion, [applicationCache.currentList]); // Execute callback with the processed list

                window.appStore.setItem('currentListing', { content: applicationCache.currentList, timestamp: Date.now() }); // Persist the new listing
            },
            requestStartTime = Date.now(); // Record the start time of the AJAX request

        $appContext.network.makeRequest({
            url: getEndpointUrl('listingPath') + '?cacheBust=' + Date.now(), // Add cache busting parameter
            onSuccess: handleSuccess,
            onError: function(jqXHR, statusText) {
                console.error('Listing request error:', typeof statusText, statusText, jqXHR);
                // If request failed and we can switch API hosts, retry
                if ("ajaxFailure|requestAborted".indexOf(statusText) > -1 && switchApiHost()) {
                    fetchAndProcessListing(onCompletion); // Retry with the new host
                }
            }
        });
    };

    var retriesCounter = 0; // Counter for retry attempts
    /**
     * Retrieves the full text content of an article.
     * @param {string} articleIdentifier - The ID of the article.
     * @param {Function} contentCallback - Callback function to execute with the article content.
     */
    var retrieveArticleText = function(articleIdentifier, contentCallback) {
        contentCallback = contentCallback || function() {}; // Ensure callback is a function

        // If article content is not in cache and retry limit not reached, wait and retry
        if (!applicationCache.cachedItems[articleIdentifier] && retriesCounter++ < 3) {
            window.setTimeout(function() {
                retrieveArticleText(articleIdentifier, contentCallback);
            }, 400);
        }

        /**
         * Generates fallback HTML content for when article retrieval fails.
         * @returns {string} HTML string for the fallback message.
         */
        var createFallbackHtml = function() {
                return $appContext.templateEngine.render('<p>An unexpected problem occurred.</p><p>You can access the content directly via <a href="{displayUrl}">{displayUrl}</a>.</p><br><br>', { displayUrl: applicationCache.cachedItems[articleIdentifier].linkAddress });
            },
            /**
             * Handles successful retrieval of article content.
             * @param {object} retrievedData - The data returned from the content service.
             */
            contentSuccessHandler = function(retrievedData) {
                $appContext.telemetry.logPerformance(articleIdentifier, 'articleFetch', Date.now() - ajaxCallStart);

                // Wrap content in a div and remove any existing classes
                var htmlWrapper = jQuery('<div></div>').html(retrievedData.articleBody || createFallbackHtml());
                jQuery('*', htmlWrapper).each(function(elemIndex, domElement) {
                    if (domElement.className) {
                        domElement.className = '';
                    }
                });
                applicationCache.cachedItems[articleIdentifier].articleBody = htmlWrapper.html(); // Store processed HTML
                contentCallback.apply(contentCallback, [applicationCache.cachedItems[articleIdentifier]]); // Execute callback
            },
            /**
             * Handles errors during article content retrieval.
             * @param {object} errorData - Error data.
             */
            contentErrorHandler = function(errorData) {
                applicationCache.cachedItems[articleIdentifier].articleBody = createFallbackHtml(); // Set fallback content
                contentCallback.apply(contentCallback, [applicationCache.cachedItems[articleIdentifier]]); // Execute callback
            },
            ajaxCallStart = Date.now(); // Record start time of AJAX call

        $appContext.network.makeRequest({
            url: $appContext.templateEngine.render(apiEndpoints.textViewPath, { targetUrl: encodeURIComponent(applicationCache.cachedItems[articleIdentifier].linkAddress), dataFormat: 'jsonp' }),
            responseDataType: 'jsonp',
            onSuccess: contentSuccessHandler,
            onError: contentErrorHandler
        });
    };

    /**
     * Fetches and processes comment threads for a given article.
     * @param {string} commentTargetId - The ID of the article for which to fetch comments.
     * @param {Function} threadCallback - Callback function to execute with the comment data.
     */
    var fetchCommentThreads = function(commentTargetId, threadCallback) {

        threadCallback = threadCallback || function() {}; // Ensure callback is a function

        /**
         * Recursively finds the highest comment ID within a comment tree.
         * @param {Array<object>} commentTree - Array of comment objects.
         * @returns {number|undefined} The highest comment ID found.
         */
        var getDeepestCommentId = function(commentTree) {
            var maxCommentId;
            jQuery.each(commentTree, function(nodeIdx, commentNode) {
                var currentId;
                if (!maxCommentId || commentNode.nodeId > maxCommentId) {
                    maxCommentId = commentNode.nodeId;
                }

                // Recurse into child comments
                if (commentNode.childComments && (currentId = getDeepestCommentId(commentNode.childComments)) && currentId > maxCommentId) {
                    maxCommentId = currentId;
                }
            });
            return maxCommentId;
        };

        var threadSuccessHandler = function(threadData) {
            $appContext.telemetry.logPerformance(commentTargetId, 'commentsFetch', Date.now() - fetchStartTime);
            var targetEntry = applicationCache.cachedItems[commentTargetId];
            // If the article wasn't in cache, initialize it with the comment data
            targetEntry = applicationCache.cachedItems[commentTargetId] = threadData;

            // Remove URL if it's an internal item link, as it's not a true external URL
            if (targetEntry.sourceUrl && targetEntry.sourceUrl.indexOf('itemDetailsPath') === 0) {
                delete targetEntry.sourceUrl;
            }

            // Restore last read comment ID from view history
            if (viewHistory[commentTargetId] && viewHistory[commentTargetId].latestReadComment) {
                targetEntry.latestReadComment = viewHistory[commentTargetId].latestReadComment;
            }

            targetEntry.discussionLoadedTime = Date.now(); // Record when comments were fetched
            threadCallback.apply(threadCallback, [targetEntry]); // Execute callback with updated entry

            // Set a short delay before recording the deepest comment ID as read
            window.setTimeout(function() {
                if (viewHistory[commentTargetId]) { // Ensure entry still exists
                    viewHistory[commentTargetId].latestReadComment = getDeepestCommentId(targetEntry.comments);
                    saveViewHistory(); // Persist the updated view history
                }
            }, 300);
        },
        fetchStartTime = Date.now(); // Record the start time of the AJAX request


        $appContext.network.makeRequest({
            url: $appContext.templateEngine.render(getEndpointUrl('itemDetailsPath'), { itemId: commentTargetId }),
            responseDataType: 'jsonp',
            onSuccess: threadSuccessHandler,
            onError: function(reqObj, reqStatus) {
                console.warn('Primary server for comments failed, attempting fallback:', reqStatus, reqObj);
                // If request failed and we can switch API hosts, retry
                if ('failure|terminated'.indexOf(reqStatus) > -1 && switchApiHost()) {
                    fetchCommentThreads(commentTargetId, threadCallback); // Retry with the new host
                }
            }
        });
    };

    /**
     * Retrieves the main list of articles.
     * @param {Function} completionCb - Callback function for when the list is ready.
     * @param {boolean} [forceReload=false] - If true, forces a re-fetch of the list.
     * @returns {void|Array<object>} Returns cached list if not forcing reload, otherwise calls fetch.
     */
    var retrieveItemList = function(completionCb, forceReload) {
        forceReload = forceReload || false;
        completionCb = completionCb || function() {};

        // If not forcing reload and list is already in cache, return it immediately
        if (!forceReload && applicationCache.currentList) {
            return completionCb.apply(completionCb, [applicationCache.currentList]);
        }

        fetchAndProcessListing(completionCb); // Otherwise, fetch and process the listing
    };

    /**
     * Fetches metadata for a specific item.
     * @param {string} metadataItemId - The ID of the item.
     * @param {Function} metaCallback - Callback function to execute with the metadata.
     * @returns {void|object} Returns cached metadata if available, otherwise initiates fetch.
     */
    var getItemMetadata = function(metadataItemId, metaCallback) {
        metaCallback = metaCallback || function() {};

        var itemMeta = applicationCache.cachedItems[metadataItemId];
        // If metadata is already cached, return it
        if (itemMeta) {
            return metaCallback.apply(metaCallback, [itemMeta]);
        }

        var metaSuccess = function(metaData) {
                $appContext.telemetry.logPerformance(metadataItemId, 'metadataFetch', Date.now() - startTime);
                metaData.discussionLoadedTime = Date.now(); // Record fetch time
                // Remove URL if it's an internal item link
                if (metaData.sourceUrl && metaData.sourceUrl.indexOf('itemDetailsPath') === 0) {
                    delete metaData.sourceUrl;
                }
                applicationCache.cachedItems[metadataItemId] = metaData; // Cache the metadata
                metaCallback.apply(metaCallback, [metaData]); // Execute callback
            },
            startTime = Date.now(); // Record start time of AJAX request

        $appContext.network.makeRequest({
            url: $appContext.templateEngine.render(getEndpointUrl('itemDetailsPath'), { itemId: metadataItemId }),
            responseDataType: 'jsonp',
            onSuccess: metaSuccess,
            onError: function(reqObj, reqStatus) {
                console.warn('Metadata request failed, attempting failover:', reqStatus, reqObj);
                // If request failed and we can switch API hosts, retry
                if ('failure|terminated'.indexOf(reqStatus) > -1 && switchApiHost()) {
                    getItemMetadata(metadataItemId, metaCallback); // Retry with new host
                }
            }
        });
    };

    /**
     * Retrieves the content body of an item.
     * @param {string} contentItemId - The ID of the item.
     * @param {Function} contentHandler - Callback function for the item content.
     * @param {boolean} [forceReload=false] - If true, forces a re-fetch.
     * @returns {void|object} Returns cached content if not forcing reload, otherwise calls fetch.
     */
    var retrieveItemContent = function(contentItemId, contentHandler, forceReload) {
        forceReload = forceReload || false;
        contentHandler = contentHandler || function() {};

        markItemAsViewed(contentItemId, 'articleAccessed'); // Mark item as article-viewed
        var contentItem = applicationCache.cachedItems[contentItemId];
        // If not forcing reload and content is cached, return it
        if (!forceReload && contentItem && contentItem.articleBody) {
            return contentHandler.apply(contentHandler, [contentItem]);
        }

        retrieveArticleText(contentItemId, contentHandler); // Otherwise, fetch article text
    };

    /**
     * Retrieves comments for a specific item.
     * @param {string} commentsItemId - The ID of the item.
     * @param {Function} commentsHandler - Callback function for the item comments.
     * @param {boolean} [forceReload=false] - If true, forces a re-fetch.
     * @returns {void|object} Returns cached comments if not forcing reload, otherwise calls fetch.
     */
    var retrieveItemComments = function(commentsItemId, commentsHandler, forceReload) {
        forceReload = forceReload || false;
        commentsHandler = commentsHandler || function() {};

        markItemAsViewed(commentsItemId, 'commentsAccessed'); // Mark item as comments-viewed
        var commentsItem = applicationCache.cachedItems[commentsItemId];
        // If not forcing reload and comments are cached and fresh (within 5 minutes), return them
        if (!forceReload && commentsItem && commentsItem.comments && commentsItem.discussionLoadedTime && commentsItem.discussionLoadedTime < (Date.now() + (1000 * 60 * 5))) {
            return commentsHandler.apply(commentsHandler, [commentsItem]);
        }

        fetchCommentThreads(commentsItemId, commentsHandler); // Otherwise, fetch comment threads
    };

    /**
     * Normalizes raw data received from external APIs into a consistent format.
     * @param {object} inputData - The raw data to be reformatted.
     * @returns {Array<object>} An array of normalized entry objects.
     */
    var normalizeRawData = function(inputData) {
        var normalizationStart = Date.now(),
            normalizedList = [];

        jQuery.each(inputData.resultSet, function(itemIndex, rawEntry) {
            var innerEntry = rawEntry.individualItem; // Extract the actual item data
            var normalizedEntry = {
                uniqueIdentifier: innerEntry.uniqueId,
                commentCount: innerEntry.num_comments,
                sourceDomain: innerEntry.domain,
                scoreValue: innerEntry.points,
                timeSinceCreation: $appContext.timeUtils.formatRelativeTime(new Date(innerEntry.creationTimestamp)),
                itemHeadline: innerEntry.title,
                itemBody: innerEntry.text || '',
                entryKind: innerEntry.type,
                resourceLink: innerEntry.url,
                authorAlias: innerEntry.username,
                articleVisitStatus: '',
                commentVisitStatus: ''
            };
            // Set visit status based on historical data
            if (viewHistory[innerEntry.uniqueIdentifier]) {
                if (viewHistory[innerEntry.uniqueIdentifier].commentsAccessed) {
                    normalizedEntry.commentVisitStatus = 'hasBeenSeen';
                }
                if (viewHistory[innerEntry.uniqueIdentifier].articleAccessed) {
                    normalizedEntry.articleVisitStatus = 'hasBeenSeen';
                }
            }
            applicationCache.cachedItems[innerEntry.uniqueIdentifier] = normalizedEntry; // Cache the normalized entry
            normalizedList.push(normalizedEntry); // Add to the list of normalized entries
        });

        $appContext.telemetry.logPerformance('askHnList', 'dataNormalization', Date.now() - normalizationStart);
        return normalizedList;
    };

    /**
     * Fetches and updates a list of articles for a specific category type.
     * @param {string} categoryType - The type of category (e.g., 'AskHn', 'ShowHn').
     * @param {Function} completionHandler - Callback function to execute with the updated list.
     */
    var updateCategorizedItems = function(categoryType, completionHandler) {
        console.debug('Updating items for category:', categoryType);
        completionHandler = completionHandler || function() {};
        var fetchSuccess = function(categoryResponse) {
                $appContext.telemetry.logPerformance('list' + categoryType, 'fetchData', Date.now() - reqStart);
                applicationCache['categorizedList' + categoryType] = normalizeRawData(categoryResponse); // Normalize and cache
                completionHandler.apply(completionHandler, [applicationCache['categorizedList' + categoryType]]); // Execute callback
            },
            reqStart = Date.now(); // Record request start time

        $appContext.network.makeRequest({
            url: getEndpointUrl(categoryType),
            responseDataType: 'jsonp',
            onSuccess: fetchSuccess
        });
    };

    /**
     * Retrieves a list of articles for a specific category type.
     * @param {string} categoryType - The type of category.
     * @param {Function} completionHandler - Callback function.
     * @param {boolean} [forceReload=false] - If true, forces a re-fetch.
     * @returns {void|Array<object>} Returns cached list if not forcing reload, otherwise calls update.
     */
    var getCategoryItems = function(categoryType, completionHandler, forceReload) {
        forceReload = forceReload || false;
        completionHandler = completionHandler || function() {};

        // If not forcing reload and list is cached, return it
        if (!forceReload && applicationCache['categorizedList' + categoryType]) {
            return completionHandler.apply(completionHandler, [applicationCache['categorizedList' + categoryType]]);
        }

        updateCategorizedItems(categoryType, completionHandler); // Otherwise, fetch and update
    };

    // Expose data access methods via the application context
    $appContext.dataAccess = {
        retrieveAllListings: retrieveItemList,
        fetchItemMetadata: getItemMetadata,
        retrieveItemContent: retrieveItemContent,
        retrieveItemComments: retrieveItemComments,
        getCategoryItems: getCategoryItems,
        getAppCache: getAppCache
    };

}(window.$appContext));