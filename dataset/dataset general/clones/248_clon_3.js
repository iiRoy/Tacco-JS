((globalScope, jQueryUtil) => {

    /**
     * Core API client. Instantiate this to interact with the SoundForge API,
     * potentially with different authentication credentials or configurations.
     */
    function SoundForge(accessKey, clientConfig) {
        const selfRef = this; // Maintain a reference to the current instance.

        /**
         * Checks if the jQuery templating engine is available for use.
         * @returns {boolean} True if jQuery templates are detected.
         */
        function checkJQueryTemplatingSupport() {
            return (typeof jQueryUtil === "function" && typeof jQueryUtil.tmpl === "function");
        }

        /**
         * Checks if a common Underscore/Lo-Dash like templating engine is available.
         * Assumes '_' global for this check.
         * @returns {boolean} True if Underscore/Lo-Dash templates are detected.
         */
        function checkLoDashTemplatingSupport() {
            return (typeof globalScope._ === "function");
        }

        /**
         * Verifies if a given value represents a whole number (integer).
         * @param {*} value The value to check.
         * @returns {boolean} True if the value is an integer.
         */
        function isWholeNumber(value) {
            return (typeof value === 'number' && Number.isInteger(value));
        }

        // Determines the best available templating engine and provides its handler.
        // This function is memoized (assigned to `selfRef`) to avoid repeated checks.
        selfRef.retrieveTemplateProcessor = function() {
            let processorName, processorFn;
            if (checkJQueryTemplatingSupport()) {
                processorName = "jQueryTemplates";
                processorFn = jQueryUtil.tmpl;
            } else if (checkLoDashTemplatingSupport()) {
                processorName = "UnderscoreTemplates";
                processorFn = globalScope._.template;
            } else {
                throw new Error('No compatible templating engine found. Please include either jQuery Templates or Underscore/Lo-Dash.');
            }
            return {
                name: processorName,
                handler: processorFn
            };
        };

        /**
         * Renders provided data using a specified template into an HTML string.
         * @param {string} templateString The template content.
         * @param {Array|Object} dataItems The data to render.
         * @param {Object} [renderOptions] Options for rendering, e.g., startIndex, endIndex.
         * @returns {string} The generated HTML.
         */
        function renderDataToHtml(templateString, dataItems, renderOptions) {
            // console.log("Attempting to render data:", dataItems); // Removed for Type III, but could be replaced with advanced logging.

            const processorDetails = selfRef.retrieveTemplateProcessor();
            let generatedHtml = '';

            // Merge default rendering options with provided ones.
            const finalRenderOpts = jQueryUtil.extend(true, { startIndex: 0 }, renderOptions);

            let dataSubset = dataItems;
            if (Array.isArray(dataItems)) {
                if (finalRenderOpts.endIndex !== undefined) {
                    dataSubset = dataItems.slice(finalRenderOpts.startIndex, finalRenderOpts.endIndex);
                } else if (finalRenderOpts.startIndex > 0) {
                    dataSubset = dataItems.slice(finalRenderOpts.startIndex);
                }
            } else if (finalRenderOpts.startIndex > 0 || finalRenderOpts.endIndex !== undefined) {
                // If data is not an array, slicing doesn't make sense, log a warning or throw error
                // For Type III, let's add a guard clause.
                if (finalRenderOpts.startIndex > 0 || finalRenderOpts.endIndex !== undefined) {
                    console.warn("Attempted to slice non-array data. Slicing options ignored.");
                }
            }

            if (processorDetails.name === "jQueryTemplates") {
                generatedHtml = processorDetails.handler(templateString, dataSubset);
            } else if (processorDetails.name === "UnderscoreTemplates") {
                // Underscore/Lo-Dash templates typically expect a single object, so we manually iterate for arrays.
                const compiledTemplate = processorDetails.handler(templateString);
                const htmlParts = [];
                jQueryUtil.each(dataSubset, (idx, item) => {
                    htmlParts.push(compiledTemplate(item));
                });
                generatedHtml = htmlParts.join('');
            } else {
                // This case should ideally be caught by retrieveTemplateProcessor, but as a safeguard:
                throw new Error('Unknown template engine type encountered during HTML generation.');
            }

            return generatedHtml;
        }

        /**
         * Recursively flattens a nested JSON object, preserving structure via key naming.
         * Useful for making nested properties accessible in flat template contexts.
         * @param {Object} sourceObj The object to flatten.
         * @param {boolean} includePrototypeProps If true, includes properties from the prototype chain.
         * @param {Object} [accumulator] Internal accumulator object.
         * @param {string} [currentPrefix] Internal prefix for keys.
         * @returns {Object} The flattened object.
         */
        function deepFlattenObject(sourceObj, includePrototypeProps, accumulator, currentPrefix) {
            accumulator = accumulator || {};
            currentPrefix = currentPrefix || "";

            if (!sourceObj || typeof sourceObj !== 'object') {
                return sourceObj; // Return non-objects directly
            }

            for (const key in sourceObj) {
                // Ensure we only process own properties unless includePrototypeProps is true.
                if (includePrototypeProps || Object.prototype.hasOwnProperty.call(sourceObj, key)) {
                    const propertyValue = sourceObj[key];
                    const newKey = currentPrefix + key;

                    if (propertyValue && typeof propertyValue === "object" &&
                        !(propertyValue instanceof Date || propertyValue instanceof RegExp || Array.isArray(propertyValue))) {
                        // Recursively flatten nested objects
                        deepFlattenObject(propertyValue, includePrototypeProps, accumulator, newKey + "_");
                    } else {
                        // Assign primitive values or arrays/dates/regex directly
                        accumulator[newKey] = propertyValue;
                    }
                }
            }
            return accumulator;
        }

        // --- Instance Initialization ---

        if (!accessKey || typeof accessKey !== 'string' || accessKey.trim() === '') {
            throw new Error('An API access key (string) is mandatory to initialize the SoundForge API client!');
        }

        this.accessKey = accessKey;

        // API Configuration Constants
        this.apiSettings = {
            baseUri: "http://developer.echonest.com/api/",
            apiVersion: 'v4',
            responseFormat: 'jsonp',
            timeoutMs: 10000 // Added a new constant for request timeout
        };

        // User-defined preferences, merged with defaults
        this.userPreferences = {
            // Example: default language for responses
            defaultLanguage: 'en',
            // Added a new default preference
            enableCaching: true
        };
        jQueryUtil.extend(true, this.userPreferences, clientConfig); // Deep merge configuration

        /**
         * Factory method to create a client for a specific music entity (e.g., Artist).
         * @param {string} entityName The name of the music entity.
         * @returns {MusicEntity} An instance of the MusicEntity client.
         */
        this.createArtistClient = function(entityName) {
            return new MusicEntity(entityName);
        };

        /**
         * Handles and wraps API responses, throwing an error if the API indicates a problem.
         * @param {Object} rawPayload The raw data received from the API.
         */
        const ApiReply = function(rawPayload) {
            this.payload = rawPayload;
            // Check for API-specific error codes
            if (this.payload && this.payload.response && this.payload.response.status && this.payload.response.status.code !== 0) {
                const errorMessage = this.payload.response.status.message || 'An unspecified API error occurred.';
                throw new Error(`API Response Error: ${errorMessage} (Code: ${this.payload.response.status.code})`);
            }
            if (!this.payload || !this.payload.response) {
                 throw new Error('Invalid API response structure received.');
            }
        };

        ApiReply.prototype.extractResponseData = function() {
            return this.payload.response;
        };

        /**
         * Constructs and dispatches requests to the SoundForge API.
         * @param {...Object} requestParams Multiple objects containing parameters to be merged into the request.
         */
        const ApiRequest = function() {
            // Merge all provided arguments into additionalParameters.
            this.additionalParameters = jQueryUtil.extend(true, {}, ...arguments);

            const getBaseUrl = () => {
                return selfRef.apiSettings.baseUri + selfRef.apiSettings.apiVersion + "/";
            };

            const getResponseFormat = () => {
                return selfRef.apiSettings.responseFormat;
            };

            const getAuthorizationKey = () => {
                return selfRef.accessKey;
            };

            /**
             * Generates a configuration object suitable for jQuery's AJAX method.
             * @param {Object} requestOptions Options specific to this request (e.g., resourcePath, callbacks).
             * @returns {Object} jQuery AJAX settings object.
             */
            this.buildRequestConfig = function(requestOptions) {
                if (!requestOptions || !requestOptions.resourcePath) {
                    throw new Error('API request configuration must include a resourcePath.');
                }

                const requestDataPayload = {
                    format: getResponseFormat(),
                    api_key: getAuthorizationKey()
                };

                // Merge in any other details that customize the API call.
                jQueryUtil.extend(true, requestDataPayload, this.additionalParameters);

                return {
                    url: getBaseUrl() + requestOptions.resourcePath,
                    dataType: 'jsonp', // JSONP for cross-domain requests
                    type: requestOptions.httpMethod || 'GET', // Default to GET
                    data: requestDataPayload,
                    cache: selfRef.userPreferences.enableCaching, // Use user preference for caching
                    timeout: selfRef.apiSettings.timeoutMs, // Use configured timeout
                    success: (data, textStatus, jqXHR) => {
                        if (requestOptions.onSuccessCallback) {
                            try {
                                requestOptions.onSuccessCallback(new ApiReply(data));
                            } catch (e) {
                                // If the ApiReply constructor throws, handle it as an error.
                                if (requestOptions.onErrorCallback) {
                                    requestOptions.onErrorCallback(e);
                                } else {
                                    console.error("API Response Processing Error:", e.message, data);
                                }
                            }
                        }
                    },
                    error: (jqXHR, textStatus, errorThrown) => { // Added error callback
                        if (requestOptions.onErrorCallback) {
                            requestOptions.onErrorCallback(new Error(`AJAX Request Failed: ${textStatus} - ${errorThrown}`));
                        } else {
                            console.error(`AJAX Request to ${requestOptions.resourcePath} failed:`, textStatus, errorThrown);
                        }
                    }
                };
            };
        };

        ApiRequest.prototype.performGetRequest = function(resourcePath, successCallback, errorCallback) {
            jQueryUtil.ajax(this.buildRequestConfig({
                resourcePath: resourcePath,
                onSuccessCallback: successCallback,
                onErrorCallback: errorCallback,
                httpMethod: 'GET'
            }));
        };

        /**
         * Represents a specific musical entity (e.g., an artist) within the SoundForge system.
         * @param {string} entityName The name of the artist or entity.
         */
        const MusicEntity = function(entityName) {
            if (!entityName || typeof entityName !== 'string') {
                throw new Error('MusicEntity requires a valid string name.');
            }
            this.entityName = entityName;
            this.entityBasePath = 'artist/';
        };

        /**
         * Fetches audio tracks associated with this music entity.
         * @param {Function} callbackFn Callback to receive the SoundTrackSet.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.fetchAudioTracks = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'audio', (reply) => {
                callbackFn(new SoundTrackSet(reply.extractResponseData()));
            });
        };

        /**
         * Retrieves biographical information for this music entity.
         * @param {Function} callbackFn Callback to receive the BioParagraphSet.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getBiographies = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'biographies', (reply) => {
                callbackFn(new BioParagraphSet(reply.extractResponseData()));
            });
        };

        /**
         * Obtains blog entries related to this music entity.
         * @param {Function} callbackFn Callback to receive the WebLogEntries.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getBlogEntries = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'blogs', (reply) => {
                callbackFn(new WebLogEntries(reply.extractResponseData()));
            });
        };

        /**
         * Determines the familiarity score of this music entity.
         * @param {Function} callbackFn Callback to receive the ArtistFamiliarity.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.assessFamiliarity = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'familiarity', (reply) => {
                callbackFn(new ArtistFamiliarity(reply.extractResponseData()));
            });
        };

        /**
         * Retrieves the "hotttnesss" (popularity) rating of this music entity.
         * @param {Function} callbackFn Callback to receive the ArtistPopularityRating.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getPopularityRating = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'hotttnesss', (reply) => {
                callbackFn(new ArtistPopularityRating(reply.extractResponseData()));
            });
        };

        /**
         * Fetches visual assets (images) associated with this music entity.
         * @param {Function} callbackFn Callback to receive the VisualAssets.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.retrieveImages = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'images', (reply) => {
                callbackFn(new VisualAssets(reply.extractResponseData()));
            });
        };

        /**
         * Gets recent news updates about this music entity.
         * @param {Function} callbackFn Callback to receive the RecentNewsUpdates.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getNewsUpdates = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'news', (reply) => {
                callbackFn(new RecentNewsUpdates(reply.extractResponseData()));
            });
        };

        /**
         * Retrieves the comprehensive profile of this music entity.
         * @param {Function} callbackFn Callback to receive the ArtistProfileData.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.fetchProfile = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'profile', (reply) => {
                callbackFn(new ArtistProfileData(reply.extractResponseData()));
            });
        };

        /**
         * Obtains reviews and critiques for this music entity.
         * @param {Function} callbackFn Callback to receive the CritiqueStatements.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getReviews = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'reviews', (reply) => {
                callbackFn(new CritiqueStatements(reply.extractResponseData()));
            });
        };

        /**
         * Performs a search related to this music entity.
         * @param {Function} callbackFn Callback to receive the LookupResults.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.performSearch = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'search', (reply) => {
                callbackFn(new LookupResults(reply.extractResponseData()));
            });
        };

        /**
         * Gets a list of songs by this music entity.
         * @param {Function} callbackFn Callback to receive the MusicalWorks.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getSongs = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'songs', (reply) => {
                callbackFn(new MusicalWorks(reply.extractResponseData()));
            });
        };

        /**
         * Finds similar music entities.
         * @param {Function} callbackFn Callback to receive the RelatedEntities.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.findSimilar = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'similar', (reply) => {
                callbackFn(new RelatedEntities(reply.extractResponseData()));
            });
        };

        /**
         * Retrieves descriptive terms associated with this music entity.
         * @param {Function} callbackFn Callback to receive the DescriptiveTerms.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getDescriptiveTerms = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'terms', (reply) => {
                callbackFn(new DescriptiveTerms(reply.extractResponseData()));
            });
        };

        /**
         * Gets top popular artists (often a global context, but can be filtered).
         * @param {Function} callbackFn Callback to receive the LeadingPopularEntities.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getTopPopular = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'top_hottt', (reply) => {
                callbackFn(new LeadingPopularEntities(reply.extractResponseData()));
            });
        };

        /**
         * Retrieves the top terms associated with this music entity.
         * @param {Function} callbackFn Callback to receive the KeyTermRankings.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getTopTerms = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'top_terms', (reply) => {
                callbackFn(new KeyTermRankings(reply.extractResponseData()));
            });
        };

        /**
         * Gets external web links (URLs) for this music entity.
         * @param {Function} callbackFn Callback to receive the WebLinkReferences.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getWebLinks = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'urls', (reply) => {
                callbackFn(new WebLinkReferences(reply.extractResponseData()));
            });
        };

        /**
         * Fetches video content related to this music entity.
         * @param {Function} callbackFn Callback to receive the MotionPictureClips.
         * @param {Object} [queryOptions] Additional query parameters.
         */
        MusicEntity.prototype.getVideos = function(callbackFn, queryOptions) {
            const req = new ApiRequest(queryOptions, { name: this.entityName });
            req.performGetRequest(this.entityBasePath + 'video', (reply) => {
                callbackFn(new MotionPictureClips(reply.extractResponseData()));
            });
        };

        /**
         * Base class for API responses that represent a single item.
         */
        const SingleResult = function() {
            // Additional initialization logic for single results could go here.
        };

        /**
         * Retrieves the primary data content from this single result.
         * @returns {Object|Array} The core data structure.
         */
        SingleResult.prototype.fetchContainedData = function() {
            if (!this.collectionData || !this.collectionIdentifier) {
                console.warn("SingleResult instance missing collectionData or collectionIdentifier.");
                return null;
            }
            return this.collectionData[this.collectionIdentifier];
        };

        /**
         * Renders the single result into an HTML string using a template.
         * @param {string} templateStr The HTML template string.
         * @param {Object} [renderOpts] Options for rendering.
         * @returns {string} The generated HTML.
         */
        SingleResult.prototype.generateHtmlOutput = function(templateStr, renderOpts) {
            if (!templateStr || typeof templateStr !== 'string') {
                throw new Error('A valid template string is required for HTML output.');
            }
            const dataToRender = this.fetchContainedData();
            if (!dataToRender) {
                console.warn("No data available to render for SingleResult.");
                return '';
            }
            return renderDataToHtml(templateStr, dataToRender, renderOpts);
        };

        /**
         * Base class for API responses that contain a collection of items.
         */
        const ResultCollection = function() {
            this.activeItemIndex = null; // Stores the index of the currently "active" item in the collection.
        };

        /**
         * Retrieves the items within this collection. If an active item is set, returns only that item.
         * @returns {Array|Object} The collection items or a single item.
         */
        ResultCollection.prototype.retrieveCollectionItems = function() {
            if (!this.collectionData || !this.collectionIdentifier) {
                console.warn("ResultCollection instance missing collectionData or collectionIdentifier.");
                return [];
            }
            if (this.getActiveItem() !== null && Array.isArray(this.collectionData[this.collectionIdentifier])) {
                return this.collectionData[this.collectionIdentifier][this.getActiveItem()];
            }
            return this.collectionData[this.collectionIdentifier];
        };

        /**
         * Sets the index of the item to actively work with within the collection.
         * @param {number|null} index The zero-based index or null to clear.
         */
        ResultCollection.prototype.setActiveItem = function(index) {
            this.activeItemIndex = index;
        };

        /**
         * Gets the index of the currently active item.
         * @returns {number|null} The active item index.
         */
        ResultCollection.prototype.getActiveItem = function() {
            return this.activeItemIndex;
        };

        /**
         * Returns the starting offset of results from the server.
         * @returns {number} The start index.
         */
        ResultCollection.prototype.getStartOffset = function() {
            return parseInt(this.collectionData.start || 0, 10);
        };

        /**
         * Returns the total count of available results on the server for this collection.
         * @returns {number} The total count.
         */
        ResultCollection.prototype.getTotalCount = function() {
            return parseInt(this.collectionData.total || 0, 10);
        };

        /**
         * Returns the number of items currently loaded in this collection instance.
         * @returns {number} The size of the collection.
         */
        ResultCollection.prototype.getCurrentSize = function() {
            const items = this.retrieveCollectionItems();
            return Array.isArray(items) ? items.length : (items ? 1 : 0);
        };

        /**
         * Renders the collection data into an HTML string using a template.
         * @param {string} templateStr The HTML template string.
         * @param {Object} [renderOpts] Options for rendering, e.g., startIndex, endIndex.
         * @returns {string} The generated HTML.
         */
        ResultCollection.prototype.renderAsHtml = function(templateStr, renderOpts) {
            if (!templateStr || typeof templateStr !== 'string') {
                throw new Error('A valid template string is required for HTML output.');
            }
            if (this.getCurrentSize() < 1) {
                // Modified error type to be more specific.
                throw new RangeError('Cannot render an empty collection to HTML.');
            }
            return renderDataToHtml(templateStr, this.retrieveCollectionItems(), renderOpts);
        };

        /**
         * Sets a specific item in the collection to be the "active" one.
         * Subsequent calls to `retrieveCollectionItems` or `renderAsHtml` will only consider this item.
         * To revert to working with the full collection, call with a non-integer or null value.
         * @param {number|*} itemIndex The index of the item or any value to reset.
         * @returns {ResultCollection} The current collection instance for chaining.
         */
        ResultCollection.prototype.selectAtIndex = function(itemIndex) {
            this.setActiveItem(isWholeNumber(itemIndex) ? itemIndex : null);
            return this;
        };

        // --- Specific Collection Implementations ---

        /**
         * Represents a collection of audio objects.
         * @param {Object} data Raw API data.
         */
        const SoundTrackSet = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "audio";
        };
        SoundTrackSet.prototype = Object.create(ResultCollection.prototype);
        SoundTrackSet.prototype.constructor = SoundTrackSet;

        /**
         * Represents a collection of blog entries.
         * @param {Object} data Raw API data.
         */
        const WebLogEntries = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "blogs";
        };
        WebLogEntries.prototype = Object.create(ResultCollection.prototype);
        WebLogEntries.prototype.constructor = WebLogEntries;

        /**
         * Represents a collection of biographies. Flattens nested JSON for easier templating.
         * @param {Object} data Raw API data.
         */
        const BioParagraphSet = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "biographies";

            const currentInstance = this;
            if (Array.isArray(this.collectionData[this.collectionIdentifier])) {
                jQueryUtil.each(this.collectionData[this.collectionIdentifier], (idx, item) => {
                    // Flatten each biography object
                    currentInstance.collectionData[currentInstance.collectionIdentifier][idx] = deepFlattenObject(item);
                });
            } else {
                console.warn("Biography data is not an array, flattening might not be effective.");
            }
        };
        BioParagraphSet.prototype = Object.create(ResultCollection.prototype);
        BioParagraphSet.prototype.constructor = BioParagraphSet;

        /**
         * Represents familiarity information about an artist. This is a singular result.
         * @param {Object} data Raw API data.
         */
        const ArtistFamiliarity = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artist"; // The top-level key for familiarity data
        };
        ArtistFamiliarity.prototype = Object.create(SingleResult.prototype);
        ArtistFamiliarity.prototype.constructor = ArtistFamiliarity;

        // --- Additional Collection Types (renamed from original) ---

        const ArtistPopularityRating = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artist";
        };
        ArtistPopularityRating.prototype = Object.create(SingleResult.prototype);
        ArtistPopularityRating.prototype.constructor = ArtistPopularityRating;

        const VisualAssets = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "images";
        };
        VisualAssets.prototype = Object.create(ResultCollection.prototype);
        VisualAssets.prototype.constructor = VisualAssets;

        const RecentNewsUpdates = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "news";
        };
        RecentNewsUpdates.prototype = Object.create(ResultCollection.prototype);
        RecentNewsUpdates.prototype.constructor = RecentNewsUpdates;

        const ArtistProfileData = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artist";
        };
        ArtistProfileData.prototype = Object.create(SingleResult.prototype);
        ArtistProfileData.prototype.constructor = ArtistProfileData;

        const CritiqueStatements = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "reviews";
        };
        CritiqueStatements.prototype = Object.create(ResultCollection.prototype);
        CritiqueStatements.prototype.constructor = CritiqueStatements;

        const LookupResults = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artist"; // Search results for artists
        };
        LookupResults.prototype = Object.create(ResultCollection.prototype);
        LookupResults.prototype.constructor = LookupResults;

        const MusicalWorks = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "songs";
        };
        MusicalWorks.prototype = Object.create(ResultCollection.prototype);
        MusicalWorks.prototype.constructor = MusicalWorks;

        const RelatedEntities = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artists"; // Similar artists
        };
        RelatedEntities.prototype = Object.create(ResultCollection.prototype);
        RelatedEntities.prototype.constructor = RelatedEntities;

        const DescriptiveTerms = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "terms";
        };
        DescriptiveTerms.prototype = Object.create(ResultCollection.prototype);
        DescriptiveTerms.prototype.constructor = DescriptiveTerms;

        const LeadingPopularEntities = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "artists"; // Top popular artists
        };
        LeadingPopularEntities.prototype = Object.create(ResultCollection.prototype);
        LeadingPopularEntities.prototype.constructor = LeadingPopularEntities;

        const KeyTermRankings = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "terms";
        };
        KeyTermRankings.prototype = Object.create(ResultCollection.prototype);
        KeyTermRankings.prototype.constructor = KeyTermRankings;

        const WebLinkReferences = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "urls";
        };
        WebLinkReferences.prototype = Object.create(ResultCollection.prototype);
        WebLinkReferences.prototype.constructor = WebLinkReferences;

        const MotionPictureClips = function(data) {
            this.collectionData = data;
            this.collectionIdentifier = "video";
        };
        MotionPictureClips.prototype = Object.create(ResultCollection.prototype);
        MotionPictureClips.prototype.constructor = MotionPictureClips;

    }

    // Expose the main SoundForge client globally or as a jQuery plugin.
    // Let's attach it to the globalScope directly for broader access.
    globalScope.SoundForgeClient = SoundForge;

})(window, jQuery);