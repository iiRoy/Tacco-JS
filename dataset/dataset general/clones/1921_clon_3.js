(function(appGlobal) {
    "use strict"; // Enforce stricter parsing and error handling

    // This module is responsible for tracking various performance metrics throughout the application.
    // It provides a centralized way to record timing and other operational data.
    let performanceMetrics = {
        nodeInsertCounter: 0 // Counter for tracking DOM node insertions, though not actively used with event listener.
    };

    /**
     * Records a performance metric. It can store a single numeric value or append to a comma-separated string
     * for metrics that might accumulate multiple readings (e.g., multiple timings for an event).
     *
     * @param {string} metricIdentifier - The primary key for the metric (e.g., 'localstorage', 'apiFetch').
     * @param {string|number} [detailKeyOrValue] - If a string, it's a sub-key (e.g., 'read', 'write'). If a number, it's the direct value for `metricIdentifier`.
     * @param {number} [metricValue] - The numeric value to record (e.g., time in milliseconds).
     */
    const recordPerformanceData = (metricIdentifier, detailKeyOrValue, metricValue) => {
        // Input validation: Ensure a valid identifier is provided.
        if (!metricIdentifier || typeof metricIdentifier !== 'string') {
            console.warn("Invalid performance metric identifier provided.");
            return;
        }

        // Initialize the entry for the primary metric identifier if it doesn't exist or isn't an object.
        if (!performanceMetrics[metricIdentifier] || typeof performanceMetrics[metricIdentifier] !== 'object') {
            performanceMetrics[metricIdentifier] = {};
        }

        // Determine how to store the value based on the arguments provided.
        if (typeof detailKeyOrValue === 'number' && metricValue === undefined) {
            // Case: recordPerformanceData('metricId', 123) -> stores 123 directly under 'metricId'
            performanceMetrics[metricIdentifier] = detailKeyOrValue;
        } else if (typeof detailKeyOrValue === 'string' && typeof metricValue === 'number') {
            // Case: recordPerformanceData('metricId', 'subType', 123) -> appends 123 to 'metricId.subType'
            const currentEntry = performanceMetrics[metricIdentifier][detailKeyOrValue];
            performanceMetrics[metricIdentifier][detailKeyOrValue] = currentEntry ? `${currentEntry},${metricValue}` : `${metricValue}`;
        } else {
            console.warn(`Attempted to record performance data with incorrect arguments for '${metricIdentifier}'.`);
        }
    };

    // Expose the performance tracking utilities to the global application object.
    appGlobal.performanceStats = {
        record: recordPerformanceData,
        // The raw data object is exposed for inspection or further processing.
        metrics: performanceMetrics
    };

    // The original DOMNodeInserted event listener was commented out and is considered non-essential for this clone.

}(window.$hn));


(function(appGlobal) {
    "use strict";

    // --- API Service Configuration ---
    // Define the primary and fallback endpoints for story-related API requests.
    const PRIMARY_STORY_API_URL = appGlobal.config.apiUrls.stories;
    const FALLBACK_STORY_API_URL = appGlobal.config.apiUrls.storiesBackup;

    // The currently active API host, initially set to the primary.
    let currentActiveStoryHost = PRIMARY_STORY_API_URL;
    // Timestamp of the last time the API host was switched. Used to enforce a cooldown.
    let lastHostSwitchTimestamp = 0;
    // Cooldown period (20 minutes) during which the API host cannot be switched again.
    const API_HOST_COOLDOWN_MS = 1000 * 60 * 20;

    // --- API Resource Path Definitions ---
    // A mapping of logical resource names to their corresponding API path templates.
    const API_RESOURCE_PATHS = {
        'mainList': '/news',
        'singleEntry': '/item/{id}',
        'articleReadability': 'http://viewtext.org/api/text?url={url}&format={format}',
        // Specific search queries for Ask HN and Show HN categories.
        'askHnQuery': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="Ask+hn"&filter[fields][type]=submission&facet[queries][]=username:Ask&facet[queries][]=username:hn',
        'showHnQuery': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="show+hn"&filter[fields][type]=submission&facet[queries][]=username:show&facet[queries][]=username:hn',
        'dateRangeTop10': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type][]=submission&sortby=points+desc&filter[fields][create_ts][]=[{startDate}+TO+{endDate}]&limit=10'
    };

    // Override the default readability service URL with a potentially application-specific one.
    API_RESOURCE_PATHS.articleReadability = appGlobal.config.apiUrls.readability;

    /**
     * Helper function to safely adjust a Date object by a given number of days and hours.
     * @param {Date} baseDate - The date to adjust.
     * @param {number} [days=0] - Number of days to add or subtract.
     * @param {number} [hours=0] - Number of hours to add or subtract.
     * @returns {Date} A new Date object with the applied adjustments.
     */
    const getAdjustedDate = (baseDate, days = 0, hours = 0) => {
        const adjusted = new Date(baseDate.getTime()); // Create a copy to avoid modifying original
        if (days !== 0) adjusted.setDate(adjusted.getDate() + days);
        if (hours !== 0) adjusted.setHours(adjusted.getHours() + hours);
        return adjusted;
    };

    /**
     * Constructs the full API URL for a given resource type.
     *
     * @param {string} resourceType - The identifier for the desired API resource (e.g., 'mainList', 'askHnQuery').
     * @returns {string|null} The complete, interpolated URL, or null if the resource type is unknown.
     */
    const constructApiUrl = (resourceType) => {
        // Guard clause for unrecognized resource types.
        if (!resourceType || !API_RESOURCE_PATHS[resourceType]) {
            console.error(`Attempted to construct URL for an unknown resource type: ${resourceType}`);
            return null;
        }

        switch (resourceType) {
            case 'mainList':
            case 'singleEntry':
                return `${currentActiveStoryHost}${API_RESOURCE_PATHS[resourceType]}`;
            case 'askHnQuery':
            case 'showHnQuery':
                return API_RESOURCE_PATHS[resourceType];
            case 'todayTop10':
            case 'yesterdayTop10':
            case 'weekTop10':
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0); // Midnight today

                let periodStartDate = new Date(startOfToday);
                let periodEndDate = new Date(startOfToday);

                if (resourceType === 'todayTop10') {
                    periodEndDate = getAdjustedDate(startOfToday, 0, 24); // End of today
                } else if (resourceType === 'yesterdayTop10') {
                    periodStartDate = getAdjustedDate(startOfToday, -1); // Midnight yesterday
                    periodEndDate = new Date(startOfToday); // Midnight today (end of yesterday)
                } else if (resourceType === 'weekTop10') {
                    periodStartDate = getAdjustedDate(startOfToday, -7); // Midnight 7 days ago
                    periodEndDate = getAdjustedDate(startOfToday, 0, 24); // End of today
                }

                return appGlobal.templateFormatter(API_RESOURCE_PATHS.dateRangeTop10, {
                    'startDate': periodStartDate.toISOString(),
                    'endDate': periodEndDate.toISOString()
                });
            default:
                // For other specific static URLs like 'articleReadability'
                return API_RESOURCE_PATHS[resourceType];
        }
    };

    /**
     * Attempts to switch the active API host between the primary and fallback URLs.
     * A cooldown period is enforced to prevent rapid switching.
     *
     * @returns {boolean} True if the API host was successfully switched, false otherwise (e.g., due to cooldown).
     */
    const switchApiHost = () => {
        const currentTime = Date.now();
        // Allow switching if the cooldown period has elapsed or if it's the very first attempt.
        if (currentTime > lastHostSwitchTimestamp + API_HOST_COOLDOWN_MS) {
            const previousHost = currentActiveStoryHost;
            currentActiveStoryHost = (currentActiveStoryHost === PRIMARY_STORY_API_URL ? FALLBACK_STORY_API_URL : PRIMARY_STORY_API_URL);
            lastHostSwitchTimestamp = currentTime;
            console.info(`API host switched from ${previousHost} to ${currentActiveStoryHost}.`);
            return true;
        }
        console.warn(`API host switch attempt ignored. Cooldown active. Current host: ${currentActiveStoryHost}`);
        return false;
    };

    // --- Local Data Cache and User Engagement Tracking ---
    const ONE_WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;
    const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5;

    // The central cache for storing fetched articles and lists.
    let localContentCache;

    /**
     * Initializes or completely resets the application's local content cache.
     */
    const initializeLocalCache = () => {
        localContentCache = {
            articles: {} // Stores individual article details, keyed by ID.
        };
    };

    // Perform initial setup of the cache.
    initializeLocalCache();

    // Object to track user engagement with articles (e.g., visited articles, read comments).
    let userEngagementTracker = {
        // Example structure: { 'itemId': { 'c': timestamp, 'a': timestamp }, version: 2 }
    };

    /**
     * Enriches a list of raw article items with visited status and performs basic data sanitization.
     * Updates the `localContentCache.articles` with processed items.
     *
     * @param {Array<Object>} rawArticleList - The list of raw article objects from an API response.
     */
    const processAndCacheArticleMetadata = (rawArticleList) => {
        // Guard against invalid input.
        if (!rawArticleList || !Array.isArray(rawArticleList)) {
            console.warn("processAndCacheArticleMetadata received an invalid article list.");
            return;
        }

        rawArticleList.forEach(item => {
            // Ensure necessary properties exist and initialize visited status.
            item.visitedCommentsStatus = '';
            item.visitedArticleStatus = '';

            // Check against the user engagement tracker to set visited flags.
            const engagementEntry = userEngagementTracker[item.id];
            if (engagementEntry) {
                if (engagementEntry.a) {
                    item.visitedArticleStatus = 'visited';
                }
                if (engagementEntry.c) {
                    item.visitedCommentsStatus = 'visited';
                }
            }

            // Special handling for 'job' type items.
            if (item.type === 'job') {
                item.points = 'JOB';
            }

            // Ensure 'user' field is never null/undefined.
            if (!item.user) {
                item.user = '';
            }

            // Basic HTML entity encoding for article titles to prevent XSS.
            item.title = item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // Store the processed item in the article-specific cache.
            localContentCache.articles[item.id] = item;
        });
    };

    let deferredSaveTimeoutId = null;

    /**
     * Executes the actual saving of the `userEngagementTracker` to persistent storage.
     * This function is typically called after a short debounce period.
     */
    const performDeferredSave = () => {
        deferredSaveTimeoutId = null; // Clear the timer ID once the save operation begins.
        try {
            appGlobal.persistenceManager.set('userEngagement', userEngagementTracker);
            console.debug('User engagement data successfully saved to persistent storage.');
        } catch (error) {
            console.error('Failed to save user engagement data to persistent storage:', error);
        }
    };

    /**
     * Schedules a debounced save operation for the `userEngagementTracker`.
     * This prevents excessive writes to storage by waiting for a period of inactivity.
     */
    const scheduleUserEngagementSave = () => {
        if (deferredSaveTimeoutId) {
            clearTimeout(deferredSaveTimeoutId); // Clear any existing pending save operations.
        }
        // Schedule the save to occur after 1 second.
        deferredSaveTimeoutId = setTimeout(performDeferredSave, 1000);
        console.debug('User engagement data save scheduled.');
    };

    /**
     * Cleans up outdated entries within the `userEngagementTracker`.
     * Entries older than `ONE_WEEK_IN_MILLISECONDS` or entirely empty entries are removed.
     */
    const purgeStaleEngagementEntries = () => {
        const currentTime = Date.now();
        let changesMade = false;

        Object.keys(userEngagementTracker).forEach(key => {
            if (key === 'version') return; // Skip the schema version property.

            const entry = userEngagementTracker[key];
            if (!entry) return; // Skip if entry is somehow null/undefined.

            // Remove article visit timestamps older than one week.
            if (entry.a && entry.a < currentTime - ONE_WEEK_IN_MILLISECONDS) {
                delete entry.a;
                changesMade = true;
            }
            // Remove comment visit timestamps older than one week.
            if (entry.c && entry.c < currentTime - ONE_WEEK_IN_MILLISECONDS) {
                delete entry.c;
                changesMade = true;
            }

            // If an entry becomes completely empty after cleanup, remove the entire entry.
            if (!entry.a && !entry.c) {
                delete userEngagementTracker[key];
                changesMade = true;
            }
        });

        // Ensure the version is consistently set after cleanup.
        userEngagementTracker.version = 2;
        if (changesMade) {
            console.debug('Stale user engagement entries purged. Scheduling save.');
            scheduleUserEngagementSave(); // Save changes if any cleanup occurred.
        }
    };

    /**
     * Loads the application's persistent state (user engagement and cached article list) from storage.
     * Includes logic for migrating older data schemas for user engagement.
     */
    const loadApplicationState = () => {
        console.log('Attempting to load application state from persistent storage...');
        const readOperationStartTime = Date.now();
        let storedEngagementData = null;
        let storedArticleList = null;

        try {
            storedEngagementData = appGlobal.persistenceManager.get('userEngagement');
            storedArticleList = appGlobal.persistenceManager.get('listCache');
        } catch (error) {
            console.error('Error encountered while reading from persistent storage:', error);
        }

        appGlobal.performanceStats.record('localstorage', 'read', Date.now() - readOperationStartTime);

        if (storedEngagementData) {
            // Use jQuery's deep extend if available, otherwise fall back to a shallow merge.
            if (typeof appGlobal.jquery !== 'undefined' && appGlobal.jquery.extend) {
                appGlobal.jquery.extend(true, userEngagementTracker, storedEngagementData);
            } else {
                // For a basic setup without jQuery, a shallow merge might suffice, but deep merge for nested objects would need a custom implementation.
                Object.assign(userEngagementTracker, storedEngagementData);
                console.warn('jQuery not available for deep merge; performing shallow merge for user engagement data.');
            }

            // Schema migration for older versions of engagement data.
            if (!userEngagementTracker.version) {
                console.info('Migrating older user engagement data schema...');
                Object.keys(userEngagementTracker).forEach(id => {
                    const entry = userEngagementTracker[id];
                    if (entry && entry.d) { // 'd' was the old single timestamp key.
                        if (entry.a) entry.a = entry.d; // Update article timestamp.
                        if (entry.c) entry.c = entry.d; // Update comments timestamp.
                        delete entry.d; // Remove the old key.
                    }
                });
                userEngagementTracker.version = 2; // Mark as updated to current schema.
                scheduleUserEngagementSave(); // Save the migrated data.
            }
            purgeStaleEngagementEntries(); // Clean up old entries after loading.
        }

        // Load cached article list if it's not stale.
        if (storedArticleList && Date.now() - storedArticleList.timestamp < FIVE_MINUTES_IN_MILLISECONDS) {
            localContentCache.list = storedArticleList.data;
            processAndCacheArticleMetadata(localContentCache.list);
            console.log('Recent article list successfully loaded from cache.');
        } else if (storedArticleList) {
            console.log('Cached article list is stale; a fresh fetch will be initiated.');
        } else {
            console.log('No article list found in cache.');
        }
    };

    // Defer the loading of application state until the current execution context is clear.
    setTimeout(loadApplicationState, 0);

    /**
     * Marks a specific article or its comments as visited in the `userEngagementTracker`.
     *
     * @param {string} itemId - The unique identifier of the article.
     * @param {'a'|'c'} visitType - 'a' to mark article as visited, 'c' for comments.
     */
    const recordUserEngagement = (itemId, visitType) => {
        // Validate input parameters.
        if (!itemId || (visitType !== 'a' && visitType !== 'c')) {
            console.warn(`Invalid arguments for recordUserEngagement: ID='${itemId}', Type='${visitType}'.`);
            return;
        }

        if (!userEngagementTracker[itemId]) {
            userEngagementTracker[itemId] = {};
        }
        userEngagementTracker[itemId][visitType] = Date.now(); // Record the current timestamp.

        scheduleUserEngagementSave(); // Schedule a debounced save.
        console.debug(`Recorded engagement for item ${itemId}: ${visitType === 'a' ? 'article viewed' : 'comments viewed'}.`);
    };

    /**
     * Retrieves the current state of the local content cache.
     *
     * @returns {Object} The `localContentCache` object.
     */
    const getLocalCacheState = () => localContentCache;

    // --- Core Data Fetching and Processing ---
    const MAX_API_RETRY_ATTEMPTS = 3;
    let articleContentFetchRetryCounter = 0; // Tracks retries for article content fetches.

    /**
     * Handles common AJAX error scenarios, specifically focusing on network issues that might
     * necessitate switching to a fallback API host.
     *
     * @param {Object} xhr - The XMLHttpRequest object from the failed request.
     * @param {string} status - The status string of the error (e.g., 'error', 'abort', 'timeout').
     * @param {Function} retryAction - A callback function to re-attempt the original request.
     * @returns {boolean} True if a server switch occurred and the request was retried, false otherwise.
     */
    const handleApiErrorAndRetry = (xhr, status, retryAction) => {
        console.warn(`API request failed: Status='${status}', XHR:`, xhr);
        // Only attempt a server switch if the error indicates a potential host issue.
        if (['error', 'abort', 'timeout'].includes(status) && switchApiHost()) {
            console.info('API host switched. Retrying the failed request...');
            retryAction(); // Re-invoke the original function to retry with the new host.
            return true;
        }
        console.error('API request could not be retried via host switch or error was non-recoverable.');
        return false;
    };

    /**
     * Fetches and updates the main list of articles.
     *
     * @param {Function} [onCompletion] - Callback function to execute upon successful fetch, receives the article list.
     */
    const fetchAndRefreshArticleList = (onCompletion = () => {}) => {
        const fetchStartTimestamp = Date.now();

        appGlobal.apiClient.sendRequest({
            url: `${constructApiUrl('mainList')}?_cacheBuster=${Date.now()}`, // Add a cache-busting parameter.
            success: (responsePayload) => {
                initializeLocalCache(); // Clear previous cache before populating.
                appGlobal.performanceStats.record('mainList', 'fetch', Date.now() - fetchStartTimestamp);
                localContentCache.list = responsePayload;
                processAndCacheArticleMetadata(localContentCache.list);
                onCompletion(localContentCache.list);

                // Persist the fetched list to local storage with a timestamp.
                try {
                    appGlobal.persistenceManager.set('listCache', { data: localContentCache.list, timestamp: Date.now() });
                } catch (error) {
                    console.error('Failed to save article list to persistent storage:', error);
                }
            },
            error: (xhr, status) => {
                handleApiErrorAndRetry(xhr, status, () => fetchAndRefreshArticleList(onCompletion));
            }
        });
    };

    /**
     * Generates a fallback HTML message to display when article content cannot be loaded.
     *
     * @param {string} originalArticleUrl - The URL of the article that failed to load.
     * @returns {string} An HTML string containing a user-friendly error message and a direct link.
     */
    const createContentFallbackHtml = (originalArticleUrl) => {
        return appGlobal.templateFormatter(
            `<p>Sorry, the article content could not be retrieved.</p>
             <p>Please try visiting the original source directly: <a href="{url}" target="_blank" rel="noopener noreferrer">{url}</a></p>`,
            { url: originalArticleUrl }
        );
    };

    /**
     * Fetches and processes the full body content of a specific article.
     *
     * @param {string} articleId - The ID of the article.
     * @param {Function} [onCompletion] - Callback function to execute on success, receives the updated article object.
     */
    const fetchAndProcessArticleBody = (articleId, onCompletion = () => {}) => {
        let articleEntry = localContentCache.articles[articleId];

        // Guard clause: If article metadata is missing, attempt to retry a few times.
        if (!articleEntry) {
            if (articleContentFetchRetryCounter < MAX_API_RETRY_ATTEMPTS) {
                articleContentFetchRetryCounter++;
                console.warn(`Article metadata not found for ID ${articleId}. Retrying content fetch in 400ms (Attempt ${articleContentFetchRetryCounter}).`);
                setTimeout(() => fetchAndProcessArticleBody(articleId, onCompletion), 400);
            } else {
                console.error(`Failed to fetch article content for ID ${articleId}: Metadata unavailable after ${MAX_API_RETRY_ATTEMPTS} retries.`);
                // Provide a basic fallback even if metadata is not fully loaded.
                articleEntry = articleEntry || { sourceUrl: '#' };
                articleEntry.fullArticleHtml = createContentFallbackHtml(articleEntry.sourceUrl);
                onCompletion(articleEntry);
                articleContentFetchRetryCounter = 0; // Reset retry counter.
            }
            return;
        }
        articleContentFetchRetryCounter = 0; // Reset counter on successful metadata retrieval.

        const fetchStartTimestamp = Date.now();

        appGlobal.apiClient.sendRequest({
            url: appGlobal.templateFormatter(constructApiUrl('articleReadability'), {
                url: encodeURIComponent(articleEntry.sourceUrl),
                format: 'jsonp'
            }),
            dataType: 'jsonp',
            success: (responsePayload) => {
                appGlobal.performanceStats.record(articleId, 'article-content-fetch', Date.now() - fetchStartTimestamp);

                // Create a temporary DOM element to parse and clean the fetched HTML content.
                const tempDivElement = document.createElement('div');
                tempDivElement.innerHTML = responsePayload.content || createContentFallbackHtml(articleEntry.sourceUrl);

                // Remove all class attributes from child elements to ensure consistent styling.
                Array.from(tempDivElement.querySelectorAll('*')).forEach(node => {
                    if (node.hasAttribute('class')) {
                        node.removeAttribute('class');
                    }
                });

                articleEntry.fullArticleHtml = tempDivElement.innerHTML;
                onCompletion(articleEntry);
            },
            error: () => {
                // On error, store a fallback message in the article entry.
                articleEntry.fullArticleHtml = createContentFallbackHtml(articleEntry.sourceUrl);
                onCompletion(articleEntry);
            }
        });
    };

    /**
     * Recursively traverses a comment tree to identify the highest (latest) comment ID.
     *
     * @param {Array<Object>} commentsCollection - An array of comment objects, potentially nested.
     * @returns {number|null} The maximum comment ID found, or null if the collection is empty or invalid.
     */
    const findHighestCommentId = (commentsCollection) => {
        if (!Array.isArray(commentsCollection) || commentsCollection.length === 0) {
            return null;
        }

        let currentMaxId = 0;
        for (const comment of commentsCollection) {
            if (comment.id && comment.id > currentMaxId) {
                currentMaxId = comment.id;
            }
            // Recursively check child comments.
            if (comment.comments && Array.isArray(comment.comments) && comment.comments.length > 0) {
                const childMax = findHighestCommentId(comment.comments);
                if (childMax && childMax > currentMaxId) {
                    currentMaxId = childMax;
                }
            }
        }
        return currentMaxId > 0 ? currentMaxId : null;
    };

    /**
     * Fetches and processes comments for a specific article.
     *
     * @param {string} articleId - The ID of the article for which to fetch comments.
     * @param {Function} [onCompletion] - Callback function to execute on success, receives the updated article object.
     */
    const fetchAndProcessArticleComments = (articleId, onCompletion = () => {}) => {
        const fetchStartTimestamp = Date.now();

        appGlobal.apiClient.sendRequest({
            url: appGlobal.templateFormatter(constructApiUrl('singleEntry'), { id: articleId }),
            dataType: 'jsonp',
            success: (responsePayload) => {
                appGlobal.performanceStats.record(articleId, 'comments-fetch', Date.now() - fetchStartTimestamp);
                let articleData = localContentCache.articles[articleId] || {}; // Use existing or create new entry.
                Object.assign(articleData, responsePayload); // Merge fetched data into the article cache.
                localContentCache.articles[articleId] = articleData; // Ensure the updated object is referenced.

                // If the URL is an internal 'item' link, it's not a true external URL, so remove it.
                if (articleData.url && articleData.url.startsWith('item')) {
                    delete articleData.url;
                }

                // Restore the last read comment ID from the user engagement tracker if available.
                if (userEngagementTracker[articleId] && userEngagementTracker[articleId].lastReadComment) {
                    articleData.lastReadComment = userEngagementTracker[articleId].lastReadComment;
                }

                articleData.commentsFetchTimestamp = Date.now(); // Record when comments were last fetched.
                onCompletion(articleData);

                // Schedule saving the highest comment ID as 'last read' after a short delay.
                setTimeout(() => {
                    const latestCommentId = findHighestCommentId(articleData.comments);
                    if (latestCommentId) {
                        if (!userEngagementTracker[articleId]) userEngagementTracker[articleId] = {};
                        userEngagementTracker[articleId].lastReadComment = latestCommentId;
                        scheduleUserEngagementSave();
                        console.debug(`Updated lastReadComment for item ${articleId}: ${latestCommentId}`);
                    }
                }, 300);
            },
            error: (xhr, status) => {
                handleApiErrorAndRetry(xhr, status, () => fetchAndProcessArticleComments(articleId, onCompletion));
            }
        });
    };

    /**
     * Requests a list of articles, either from the local cache or by performing a fresh API fetch.
     *
     * @param {Function} [onCompletion] - Callback function, receives the article list.
     * @param {boolean} [forceRefresh=false] - If true, bypasses the cache and always fetches new data.
     */
    const requestArticleList = (onCompletion = () => {}, forceRefresh = false) => {
        if (!forceRefresh && localContentCache.list) {
            console.debug('Returning main article list from cache.');
            return onCompletion(localContentCache.list);
        }
        console.debug('Initiating fetch for a new main article list...');
        fetchAndRefreshArticleList(onCompletion);
    };

    /**
     * Requests metadata for a single article.
     *
     * @param {string} articleId - The ID of the article.
     * @param {Function} [onCompletion] - Callback function, receives the article metadata object.
     */
    const requestSingleArticleMetadata = (articleId, onCompletion = () => {}) => {
        const cachedArticle = localContentCache.articles[articleId];
        // If metadata is present (indicated by commentsFetchTimestamp), return from cache.
        if (cachedArticle && cachedArticle.commentsFetchTimestamp) {
            console.debug(`Returning metadata for article ${articleId} from cache.`);
            return onCompletion(cachedArticle);
        }

        const fetchStartTimestamp = Date.now();
        appGlobal.apiClient.sendRequest({
            url: appGlobal.templateFormatter(constructApiUrl('singleEntry'), { id: articleId }),
            dataType: 'jsonp',
            success: (responsePayload) => {
                appGlobal.performanceStats.record(articleId, 'metadata-fetch', Date.now() - fetchStartTimestamp);
                let articleData = localContentCache.articles[articleId] || {};
                Object.assign(articleData, responsePayload);
                localContentCache.articles[articleId] = articleData;

                if (articleData.url && articleData.url.startsWith('item')) {
                    delete articleData.url;
                }
                articleData.commentsFetchTimestamp = Date.now(); // Mark as metadata successfully loaded.
                onCompletion(articleData);
            },
            error: (xhr, status) => {
                handleApiErrorAndRetry(xhr, status, () => requestSingleArticleMetadata(articleId, onCompletion));
            }
        });
    };

    /**
     * Requests the full content body of an article. Marks the article as visited.
     *
     * @param {string} articleId - The ID of the article.
     * @param {Function} [onCompletion] - Callback function, receives the article object with content.
     * @param {boolean} [forceRefresh=false] - If true, bypasses content cache and fetches new.
     */
    const requestArticleContent = (articleId, onCompletion = () => {}, forceRefresh = false) => {
        recordUserEngagement(articleId, 'a'); // Mark article as viewed.

        const article = localContentCache.articles[articleId];
        if (!forceRefresh && article && article.fullArticleHtml) {
            console.debug(`Returning article content for ${articleId} from cache.`);
            return onCompletion(article);
        }
        console.debug(`Fetching article content for ${articleId}...`);
        fetchAndProcessArticleBody(articleId, onCompletion);
    };

    /**
     * Requests comments for an article. Marks the comments as visited.
     *
     * @param {string} articleId - The ID of the article.
     * @param {Function} [onCompletion] - Callback function, receives the article object with comments.
     * @param {boolean} [forceRefresh=false] - If true, bypasses comments cache and fetches new.
     */
    const requestArticleComments = (articleId, onCompletion = () => {}, forceRefresh = false) => {
        recordUserEngagement(articleId, 'c'); // Mark comments as viewed.

        const article = localContentCache.articles[articleId];
        // Check if comments are cached and not stale (fetched within the last 5 minutes).
        if (!forceRefresh && article && article.comments && article.commentsFetchTimestamp &&
            (Date.now() - article.commentsFetchTimestamp < FIVE_MINUTES_IN_MILLISECONDS)) {
            console.debug(`Returning comments for ${articleId} from fresh cache.`);
            return onCompletion(article);
        }
        console.debug(`Fetching comments for ${articleId}...`);
        fetchAndProcessArticleComments(articleId, onCompletion);
    };

    /**
     * Transforms raw search API results into a standardized, application-specific article format.
     * Also updates the `localContentCache.articles` with the transformed items.
     *
     * @param {Object} rawSearchResults - The raw data payload from the search API.
     * @returns {Array<Object>} An array of formatted article objects.
     */
    const formatRawApiSearchResults = (rawSearchResults) => {
        const transformationStartTime = Date.now();
        // Guard against invalid input.
        if (!rawSearchResults || !Array.isArray(rawSearchResults.results)) {
            console.warn("formatRawApiSearchResults received invalid raw search results.");
            return [];
        }

        const formattedEntries = rawSearchResults.results.map(result => {
            const item = result.item;
            const entryId = item.id;

            const transformedEntry = {
                id: entryId,
                commentCount: item.num_comments,
                domainName: item.domain,
                scorePoints: item.points,
                timeAgo: appGlobal.utility.timeDifferenceString(new Date(item.create_ts)),
                headlineText: item.title,
                contentSnippet: item.text || '',
                entryType: item.type,
                sourceLink: item.url,
                submitterUser: item.username,
                visitedArticleStatus: '',
                visitedCommentsStatus: ''
            };

            // Apply visited status based on user engagement.
            const engagement = userEngagementTracker[entryId];
            if (engagement) {
                if (engagement.c) {
                    transformedEntry.visitedCommentsStatus = 'visited';
                }
                if (engagement.a) {
                    transformedEntry.visitedArticleStatus = 'visited';
                }
            }

            // Cache the individual transformed article.
            localContentCache.articles[entryId] = transformedEntry;
            return transformedEntry;
        });

        appGlobal.performanceStats.record('categoryList', 'reformat', Date.now() - transformationStartTime);
        return formattedEntries;
    };

    /**
     * Fetches and updates articles for a specific category (e.g., 'Ask HN', 'Show HN', 'Top 10 by Date').
     *
     * @param {string} categoryKey - The identifier for the category (e.g., 'askHnQuery', 'todayTop10').
     * @param {Function} [onCompletion] - Callback function, receives the list of formatted articles.
     */
    const fetchArticlesForCategory = (categoryKey, onCompletion = () => {}) => {
        console.log(`Initiating fetch for category: ${categoryKey}`);
        const fetchStartTimestamp = Date.now();
        const requestUrl = constructApiUrl(categoryKey);

        // Guard against failure to compose a valid URL.
        if (!requestUrl) {
            console.error(`Failed to construct URL for category: ${categoryKey}. Aborting fetch.`);
            return onCompletion([]);
        }

        appGlobal.apiClient.sendRequest({
            url: requestUrl,
            dataType: 'jsonp',
            success: (responsePayload) => {
                appGlobal.performanceStats.record(`list_${categoryKey}`, 'fetch', Date.now() - fetchStartTimestamp);
                const formattedData = formatRawApiSearchResults(responsePayload);
                localContentCache[`list_${categoryKey}`] = formattedData; // Cache the category-specific list.
                onCompletion(formattedData);
            },
            error: (xhr, status) => {
                console.error(`Failed to fetch articles for category '${categoryKey}': ${status}.`);
                // For category-specific search APIs (like HN Search API), server switching might not be relevant
                // as they are typically fixed third-party endpoints. No retry logic via server switch here.
                onCompletion([]); // Return an empty array on error.
            }
        });
    };

    /**
     * Requests articles for a specific category, either from the local cache or by fetching new data.
     *
     * @param {string} categoryKey - The identifier for the category.
     * @param {Function} [onCompletion] - Callback function, receives the list of formatted articles.
     * @param {boolean} [forceRefresh=false] - If true, bypasses the cache and always fetches new data.
     */
    const requestArticlesByCategory = (categoryKey, onCompletion = () => {}, forceRefresh = false) => {
        const cachedCategoryList = localContentCache[`list_${categoryKey}`];
        if (!forceRefresh && cachedCategoryList) {
            console.debug(`Returning articles for category '${categoryKey}' from cache.`);
            return onCompletion(cachedCategoryList);
        }
        console.debug(`Fetching new articles for category '${categoryKey}'...`);
        fetchArticlesForCategory(categoryKey, onCompletion);
    };

    // Expose the data service functions to the global application object.
    appGlobal.dataServices = {
        getArticleList: requestArticleList,
        getArticleMetadata: requestSingleArticleMetadata,
        getArticleContent: requestArticleContent,
        getArticleComments: requestArticleComments,
        getArticlesByCategory: requestArticlesByCategory,
        getCurrentCacheState: getLocalCacheState // Renamed for clarity.
    };

}(window.$hn));