(function(globalScope) {

    class PerformanceTracker {
        constructor() {
            this.activityRecords = new Map();
        }

        // Renamed from 'update'
        logEvent(processId, metricType, timestampValue) {
            if (!this.activityRecords.has(processId)) {
                this.activityRecords.set(processId, new Map());
            }

            const processMetrics = this.activityRecords.get(processId);

            if (arguments.length === 2) {
                // Mimicking original's behavior: if only two args, overwrite the whole processId entry
                this.activityRecords.set(processId, arguments[1]);
            } else {
                const existingValues = processMetrics.has(metricType)
                    ? processMetrics.get(metricType)
                    : [];
                existingValues.push(timestampValue);
                processMetrics.set(metricType, existingValues);
            }
        }

        // Renamed from 'data'
        getPerformanceSnapshot() {
            const snapshot = {};
            for (const [key, value] of this.activityRecords.entries()) {
                if (value instanceof Map) {
                    const innerObject = {};
                    for (const [innerKey, innerValue] of value.entries()) {
                        innerObject[innerKey] = innerValue.join(',');
                    }
                    snapshot[key] = innerObject;
                } else {
                    snapshot[key] = value;
                }
            }
            return snapshot;
        }
    }

    const systemPerformance = new PerformanceTracker();

    globalScope.telemetry = {
        capture: (id, type, time) => systemPerformance.logEvent(id, type, time),
        report: () => systemPerformance.getPerformanceSnapshot()
    };


    // Utility for simple string templating
    const formatString = (templateStr, replacements) => {
        return templateStr.replace(/\{(\w+)\}/g, (match, key) => replacements[key] !== undefined ? replacements[key] : match);
    };

    // Custom JSONP request handler (replacing jQuery.ajax for JSONP)
    let jsonpRequestCount = 0;
    const executeJsonp = (urlLink, timeoutDuration = 10000) => {
        return new Promise((resolve, reject) => {
            const callbackIdentifier = `jsonp_cb_${jsonpRequestCount++}`;
            const scriptElement = document.createElement('script');
            scriptElement.src = urlLink + (urlLink.includes('?') ? '&' : '?') + `callback=${callbackIdentifier}`;

            let responseTimer = setTimeout(() => {
                reject(new Error(`JSONP request to ${urlLink} timed out.`));
                document.head.removeChild(scriptElement);
                delete globalScope[callbackIdentifier];
            }, timeoutDuration);

            globalScope[callbackIdentifier] = (responsePayload) => {
                clearTimeout(responseTimer);
                resolve(responsePayload);
                document.head.removeChild(scriptElement);
                delete globalScope[callbackIdentifier];
            };

            scriptElement.onerror = (errorEvent) => {
                clearTimeout(responseTimer);
                reject(new Error(`JSONP request to ${urlLink} failed: ${errorEvent.message || 'Unknown error'}`));
                document.head.removeChild(scriptElement);
                delete globalScope[callbackIdentifier];
            };

            document.head.appendChild(scriptElement);
        });
    };

    // Main data handling system
    class RemoteDataGateway {
        constructor() {
            // Assume global config has these values, similar to original $hn.url
            this.mainServiceUrl = globalScope.appConfig.storyApi;
            this.failoverServiceUrl = globalScope.appConfig.backupStoryApi;
            this.serviceEndpoints = [this.mainServiceUrl, this.failoverServiceUrl];
            this.activeEndpointIndex = 0;
            this.lastEndpointChangeTime = null;

            this.endpointTemplates = {
                'storyList': '/news',
                'individualStory': '/item/{id}',
                'contentRenderer': globalScope.appConfig.readabilityApi,
                'askHnQuery': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="Ask+hn"&filter[fields][type]=submission&facet[queries][]=username:Ask&facet[queries][]=username:hn',
                'showHnQuery': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?limit=30&sortby=create_ts+desc&weights[username]=0.1&weights[text]=1&weights[type]=0&weights[domain]=2&weights[title]=1.2&weights[url]=1&boosts[fields][points]=0.07&boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]=200&q="show+hn"&filter[fields][type]=submission&facet[queries][]=username:show&facet[queries][]=username:hn',
                'topTenByDate': 'https://api.thriftdb.com/api.hnsearch.com/items/_search?filter[fields][type][]=submission&sortby=points+desc&filter[fields][create_ts][]=[{startDate}+TO+{endDate}]&limit=10'
            };

            this.itemDetailsCache = new Map(); // Stores individual story details
            this.masterStoryListCache = null; // Stores the main list of stories

            this.historyLog = new Map(); // Stores visited status, persisted
            this.historySaveTimer = null;

            this.initializeSystem();
        }

        initializeSystem() {
            this.purgeCache();
            this.loadPersistedState();
        }

        purgeCache() { // Renamed from resetCache
            this.itemDetailsCache.clear();
            this.masterStoryListCache = null;
        }

        // Renamed from getUrl
        generateApiLink(categoryType) {
            const currentBase = this.serviceEndpoints[this.activeEndpointIndex];

            if (['storyList', 'individualStory'].includes(categoryType)) {
                return currentBase + this.endpointTemplates[categoryType];
            } else if (['askHnQuery', 'showHnQuery'].includes(categoryType)) {
                return this.endpointTemplates[categoryType];
            } else if (['currentDayTop', 'previousDayTop', 'currentWeekTop'].includes(categoryType)) {
                let beginDate = new Date();
                let finalDate;

                beginDate.setHours(0, 0, 0, 0);

                finalDate = new Date(beginDate);
                if (categoryType === 'currentDayTop') {
                    finalDate.setHours(24);
                } else if (categoryType === 'previousDayTop') {
                    beginDate.setDate(beginDate.getDate() - 1);
                    finalDate = new Date(beginDate);
                    finalDate.setHours(24);
                } else if (categoryType === 'currentWeekTop') {
                    beginDate.setDate(beginDate.getDate() - 7);
                }

                return formatString(this.endpointTemplates.topTenByDate, {
                    'startDate': beginDate.toISOString(),
                    'endDate': finalDate.toISOString()
                });
            }
            return null;
        }

        // Renamed from changeServer
        switchEndpoint() {
            const cooldownPeriod = 1000 * 60 * 20; // 20 minutes
            const currentTime = Date.now();

            if (!this.lastEndpointChangeTime || (this.lastEndpointChangeTime + cooldownPeriod) < currentTime) {
                this.lastEndpointChangeTime = currentTime;
                this.activeEndpointIndex = (this.activeEndpointIndex + 1) % this.serviceEndpoints.length;
                console.log(`Service endpoint changed to: ${this.serviceEndpoints[this.activeEndpointIndex]}`);
                return true;
            }
            return false;
        }

        // Renamed from updateLocalData
        processRetrievedMasterList() {
            if (!this.masterStoryListCache) return;

            this.masterStoryListCache.forEach(storyItem => {
                const itemId = storyItem.id;
                let processedEntry = { ...storyItem }; // Create a shallow copy

                processedEntry.commentsMark = ''; // Renamed from visitedComments
                processedEntry.articleMark = ''; // Renamed from visitedArticle

                const historyEntry = this.historyLog.get(itemId);
                if (historyEntry) {
                    if (historyEntry.article) {
                        processedEntry.articleMark = 'visited';
                    }
                    if (historyEntry.comments) {
                        processedEntry.commentsMark = 'visited';
                    }
                }

                if (processedEntry.type === 'job') {
                    processedEntry.scoreDisplay = 'JOB'; // Renamed from points
                } else {
                    processedEntry.scoreDisplay = processedEntry.points;
                }

                if (!processedEntry.user) {
                    processedEntry.user = '';
                }
                processedEntry.titleText = processedEntry.title.replace(/</g, '&lt;'); // Sanitize title, renamed from title
                delete processedEntry.title; // Remove original identifier

                this.itemDetailsCache.set(itemId, processedEntry);
            });
        }

        // Renamed from readLocalData
        loadPersistedState() {
            const loadStartTime = Date.now();
            const storedVisitData = localStorage.getItem('user_view_history');
            const storedMasterList = localStorage.getItem('cached_master_list');

            globalScope.telemetry.capture('local_storage', 'read_operation', Date.now() - loadStartTime);

            if (storedVisitData) {
                try {
                    let parsedHistory = JSON.parse(storedVisitData);

                    // Version migration logic
                    if (!parsedHistory.version) {
                        for (const key in parsedHistory) {
                            if (key !== 'version') {
                                const item = parsedHistory[key];
                                if (item.a) item.article = item.d; delete item.a; delete item.d;
                                if (item.c) item.comments = item.d; delete item.c; delete item.d;
                            }
                        }
                    }
                    parsedHistory.version = 2;

                    // Prune old entries (7 days)
                    const sevenDaysInMs = 1000 * 60 * 60 * 24 * 7;
                    const cutoffTime = Date.now() - sevenDaysInMs;
                    for (const key in parsedHistory) {
                        if (key !== 'version') {
                            const item = parsedHistory[key];
                            if (item.article && item.article < cutoffTime) {
                                delete item.article;
                            }
                            if (item.comments && item.comments < cutoffTime) {
                                delete item.comments;
                            }
                            if (!item.article && !item.comments) {
                                delete parsedHistory[key];
                            }
                        }
                    }
                    this.historyLog = new Map(Object.entries(parsedHistory));
                    this.scheduleHistorySave(); // Schedule a save after pruning
                } catch (e) {
                    console.error("Failed to parse user view history:", e);
                    this.historyLog = new Map();
                }
            }

            if (storedMasterList) {
                try {
                    const parsedList = JSON.parse(storedMasterList);
                    const fiveMinutes = 1000 * 60 * 5;
                    if (Date.now() - parsedList.timestamp < fiveMinutes) {
                        this.masterStoryListCache = parsedList.data;
                        this.processRetrievedMasterList();
                    }
                } catch (e) {
                    console.error("Failed to parse cached master list:", e);
                    this.masterStoryListCache = null;
                }
            }
        }

        // Renamed from saveVisitedData
        scheduleHistorySave() {
            if (this.historySaveTimer) {
                cancelAnimationFrame(this.historySaveTimer);
                this.historySaveTimer = null;
            }
            this.historySaveTimer = requestAnimationFrame(() => this.commitHistoryToStorage());
        }

        // Renamed from saveVisitedDelayed
        commitHistoryToStorage() {
            this.historySaveTimer = null;
            localStorage.setItem('user_view_history', JSON.stringify(Object.fromEntries(this.historyLog)));
        }

        // Renamed from addVisited
        recordUserView(itemId, viewCategory) {
            if (!this.historyLog.has(itemId)) {
                this.historyLog.set(itemId, {});
            }
            this.historyLog.get(itemId)[viewCategory] = Date.now();
            this.scheduleHistorySave();
        }

        // Generic network request handler with retry logic
        async performNetworkRequest(link, isJsonpCall = false) {
            let currentAttempt = 0;
            const maxAttempts = 2;
            let lastErrorDetail = null;

            while (currentAttempt < maxAttempts) {
                try {
                    let response;
                    if (isJsonpCall) {
                        response = await executeJsonp(link);
                    } else {
                        response = await fetch(link);
                        if (!response.ok) {
                            throw new Error(`HTTP status not OK: ${response.status}`);
                        }
                        response = await response.json();
                    }
                    return response;
                } catch (error) {
                    lastErrorDetail = error;
                    console.warn(`Network request failed for ${link}. Attempt ${currentAttempt + 1}. Error:`, error);
                    if (this.switchEndpoint()) {
                        currentAttempt++;
                        // If endpoint switched, the next iteration will use the new one implicitly.
                    } else {
                        break; // No more retries if endpoint couldn't switch or cooldown active.
                    }
                }
            }
            throw new Error(`All network attempts failed after ${maxAttempts} tries. Last reported error: ${lastErrorDetail.message}`);
        }

        // Renamed from updateList
        async refreshMasterStoryList(completionHandler = () => {}) {
            const startFetchTime = Date.now();
            try {
                const data = await this.performNetworkRequest(this.generateApiLink('storyList') + `?ts=${Date.now()}`);
                globalScope.telemetry.capture('master_list', 'fetch_duration', Date.now() - startFetchTime);
                this.purgeCache();
                this.masterStoryListCache = data;
                this.processRetrievedMasterList();
                completionHandler(this.masterStoryListCache);

                localStorage.setItem('cached_master_list', JSON.stringify({ data: this.masterStoryListCache, timestamp: Date.now() }));
            } catch (error) {
                console.error("Failed to refresh master story list:", error);
                completionHandler([]);
            }
        }

        // Renamed from updateArticleContent
        async refreshStoryArticleContent(storyIdentification, completionHandler = () => {}, attemptNumber = 0) {
            const maxAttempts = 3;
            if (!this.itemDetailsCache.has(storyIdentification) && attemptNumber < maxAttempts) {
                setTimeout(() => this.refreshStoryArticleContent(storyIdentification, completionHandler, attemptNumber + 1), 400);
                return;
            }
            if (!this.itemDetailsCache.has(storyIdentification)) {
                console.warn(`Story details not available for ID: ${storyIdentification} after retries. Cannot fetch content.`);
                completionHandler({ id: storyIdentification, articleContentHTML: this.createErrorContent({ url: 'unknown' }) });
                return;
            }

            const currentStory = this.itemDetailsCache.get(storyIdentification);
            const startFetchTime = Date.now();

            const createErrorContent = (details) => { // Renamed from fallbackContent
                return formatString('<p>Apologies, content retrieval encountered an issue. </p><p>Please use this link <a href="{url}">{url}</a> to access the original article.</p><br><br>', details);
            };

            try {
                const apiLink = formatString(this.endpointTemplates.contentRenderer, {
                    url: encodeURIComponent(currentStory.url),
                    format: 'jsonp'
                });
                const data = await this.performNetworkRequest(apiLink, true);

                globalScope.telemetry.capture(storyIdentification, 'article_fetch_duration', Date.now() - startFetchTime);

                const temporaryDiv = document.createElement('div');
                temporaryDiv.innerHTML = data.content || createErrorContent({ url: currentStory.url });

                temporaryDiv.querySelectorAll('*').forEach(node => {
                    if (node.className) {
                        node.className = '';
                    }
                });
                currentStory.articleContentHTML = temporaryDiv.innerHTML; // Renamed from article
                this.itemDetailsCache.set(storyIdentification, currentStory);
                completionHandler(currentStory);
            } catch (error) {
                console.error(`Failed to refresh story content for ID ${storyIdentification}:`, error);
                currentStory.articleContentHTML = createErrorContent({ url: currentStory.url });
                this.itemDetailsCache.set(storyIdentification, currentStory);
                completionHandler(currentStory);
            }
        }

        // Renamed from getLastCommentId
        determineHighestCommentId(commentsArray) {
            let topId = 0;
            if (!commentsArray || !Array.isArray(commentsArray)) return topId;

            commentsArray.forEach(comment => {
                if (comment.id && comment.id > topId) {
                    topId = comment.id;
                }
                if (comment.comments && Array.isArray(comment.comments)) {
                    const nestedTopId = this.determineHighestCommentId(comment.comments);
                    if (nestedTopId > topId) {
                        topId = nestedTopId;
                    }
                }
            });
            return topId;
        }

        // Renamed from updateArticleComments
        async refreshStoryDiscussion(storyIdentification, completionHandler = () => {}) {
            const startFetchTime = Date.now();
            try {
                const apiLink = formatString(this.generateApiLink('individualStory'), { id: storyIdentification });
                const data = await this.performNetworkRequest(apiLink, true);

                globalScope.telemetry.capture(storyIdentification, 'comments_fetch_duration', Date.now() - startFetchTime);

                let storyRecord = this.itemDetailsCache.get(storyIdentification);
                if (!storyRecord) {
                    storyRecord = {};
                }

                Object.assign(storyRecord, data);

                if (storyRecord.url && storyRecord.url.startsWith('item')) {
                    delete storyRecord.url;
                }

                const historyRec = this.historyLog.get(storyIdentification);
                if (historyRec && historyRec.lastReadCommentId) {
                    storyRecord.lastSeenComment = historyRec.lastReadCommentId;
                }

                storyRecord.discussionFetchTimestamp = Date.now();
                this.itemDetailsCache.set(storyIdentification, storyRecord);
                completionHandler(storyRecord);

                setTimeout(() => {
                    if (!this.historyLog.has(storyIdentification)) {
                        this.historyLog.set(storyIdentification, {});
                    }
                    this.historyLog.get(storyIdentification).lastReadCommentId = this.determineHighestCommentId(storyRecord.comments);
                    this.scheduleHistorySave();
                }, 300);

            } catch (error) {
                console.error(`Failed to refresh story discussion for ID ${storyIdentification}:`, error);
                completionHandler(null);
            }
        }

        // Renamed from getArticles
        async retrieveAllStories(completionHandler = () => {}, forceRefresh = false) {
            if (!forceRefresh && this.masterStoryListCache) {
                completionHandler(this.masterStoryListCache);
                return;
            }
            await this.refreshMasterStoryList(completionHandler);
        }

        // Renamed from getArticleMeta
        async retrieveStoryDetails(storyIdentification, completionHandler = () => {}) {
            let storyRecord = this.itemDetailsCache.get(storyIdentification);
            if (storyRecord) {
                completionHandler(storyRecord);
                return;
            }

            const startFetchTime = Date.now();
            try {
                const apiLink = formatString(this.generateApiLink('individualStory'), { id: storyIdentification });
                const data = await this.performNetworkRequest(apiLink, true);

                globalScope.telemetry.capture(storyIdentification, 'metadata_fetch_duration', Date.now() - startFetchTime);
                data.discussionFetchTimestamp = Date.now();
                if (data.url && data.url.startsWith('item')) {
                    delete data.url;
                }
                this.itemDetailsCache.set(storyIdentification, data);
                completionHandler(data);
            } catch (error) {
                console.error(`Failed to retrieve story details for ID ${storyIdentification}:`, error);
                completionHandler(null);
            }
        }

        // Renamed from getArticleContent
        async fetchStoryArticle(storyIdentification, completionHandler = () => {}, forceRefresh = false) {
            this.recordUserView(storyIdentification, 'article');
            let storyRecord = this.itemDetailsCache.get(storyIdentification);
            if (!forceRefresh && storyRecord && storyRecord.articleContentHTML) {
                completionHandler(storyRecord);
                return;
            }
            await this.refreshStoryArticleContent(storyIdentification, completionHandler);
        }

        // Renamed from getArticleComments
        async fetchStoryComments(storyIdentification, completionHandler = () => {}, forceRefresh = false) {
            this.recordUserView(storyIdentification, 'comments');
            let storyRecord = this.itemDetailsCache.get(storyIdentification);
            const fiveMinutes = 1000 * 60 * 5;
            if (!forceRefresh && storyRecord && storyRecord.comments && storyRecord.discussionFetchTimestamp && (Date.now() - storyRecord.discussionFetchTimestamp < fiveMinutes)) {
                completionHandler(storyRecord);
                return;
            }
            await this.refreshStoryDiscussion(storyIdentification, completionHandler);
        }

        // Renamed from reformatData
        processExternalApiResponse(rawResponse) {
            const startProcessTime = Date.now();
            const reshapedData = [];

            if (!rawResponse || !rawResponse.results) {
                globalScope.telemetry.capture('api_data_transform', 'error', Date.now() - startProcessTime);
                return reshapedData;
            }

            rawResponse.results.forEach(apiResult => {
                const originalItem = apiResult.item;
                const newFormatItem = {
                    uniqueId: originalItem.id,
                    commentCount: originalItem.num_comments,
                    sourceDomain: originalItem.domain,
                    scoreValue: originalItem.points,
                    elapsedTime: globalScope.timeFormatter.getRelativeTime(new Date(originalItem.create_ts)),
                    mainTitle: originalItem.title,
                    storyBody: originalItem.text || '',
                    entryType: originalItem.type,
                    externalUrl: originalItem.url,
                    authorName: originalItem.username,
                    articleVisitedStatus: '',
                    commentsVisitedStatus: ''
                };

                const historyEntry = this.historyLog.get(originalItem.id);
                if (historyEntry) {
                    if (historyEntry.comments) {
                        newFormatItem.commentsVisitedStatus = 'visited';
                    }
                    if (historyEntry.article) {
                        newFormatItem.articleVisitedStatus = 'visited';
                    }
                }
                this.itemDetailsCache.set(originalItem.id, newFormatItem);
                reshapedData.push(newFormatItem);
            });

            globalScope.telemetry.capture('categorized_list_reformat', 'duration', Date.now() - startProcessTime);
            return reshapedData;
        }

        // Renamed from updateArticlesByType
        async refreshCategorizedStoryLists(categoryKey, completionHandler = () => {}) {
            console.log(`Updating category: ${categoryKey}`);
            const startFetchTime = Date.now();
            try {
                const apiLink = this.generateApiLink(categoryKey);
                const data = await this.performNetworkRequest(apiLink, true);
                globalScope.telemetry.capture(`list_${categoryKey}`, 'fetch_duration', Date.now() - startFetchTime);
                const processed = this.processExternalApiResponse(data);
                this.itemDetailsCache.set(`categorized_${categoryKey}`, processed);
                completionHandler(processed);
            } catch (error) {
                console.error(`Failed to refresh categorized stories for type ${categoryKey}:`, error);
                completionHandler([]);
            }
        }

        // Renamed from getArticlesByType
        async retrieveCategorizedStoryLists(categoryKey, completionHandler = () => {}, forceRefresh = false) {
            const cachedList = this.itemDetailsCache.get(`categorized_${categoryKey}`);
            if (!forceRefresh && cachedList) {
                completionHandler(cachedList);
                return;
            }
            await this.refreshCategorizedStoryLists(categoryKey, completionHandler);
        }

        // Renamed from getLocalData
        getInternalCacheState() {
            return {
                mainStories: this.masterStoryListCache,
                individualItems: Object.fromEntries(this.itemDetailsCache)
            };
        }
    }

    // Placeholder for global configuration and time utility functions
    globalScope.appConfig = globalScope.appConfig || {
        storyApi: 'https://api.example.com/stories', // Example base URL
        backupStoryApi: 'https://backup.example.com/stories', // Example backup URL
        readabilityApi: 'http://text-extractor.org/extract?url={url}&format={format}' // Example readability service
    };

    globalScope.timeFormatter = globalScope.timeFormatter || {
        getRelativeTime: (inputDate) => {
            const seconds = Math.floor((Date.now() - inputDate.getTime()) / 1000);
            if (seconds < 60) return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
            const days = Math.floor(hours / 24);
            return days === 1 ? '1 day ago' : `${days} days ago`;
        }
    };

    const dataSystemInstance = new RemoteDataGateway();

    // Expose the public API of the data system
    globalScope.ContentService = {
        retrieveAllStories: (cb, reload) => dataSystemInstance.retrieveAllStories(cb, reload),
        retrieveStoryDetails: (id, cb) => dataSystemInstance.retrieveStoryDetails(id, cb),
        fetchStoryArticle: (id, cb, reload) => dataSystemInstance.fetchStoryArticle(id, cb, reload),
        fetchStoryComments: (id, cb, reload) => dataSystemInstance.fetchStoryComments(id, cb, reload),
        retrieveCategorizedStoryLists: (type, cb, reload) => dataSystemInstance.retrieveCategorizedStoryLists(type, cb, reload),
        getInternalCacheState: () => dataSystemInstance.getInternalCacheState()
    };

}(window));