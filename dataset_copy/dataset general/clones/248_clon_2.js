(function (globalEnv, domLib) {
	
	/*
	 * Main wrapper class. This can be instantiated multiple times if you wish to connect to the service with varying configurations or credentials.
	 */
	function SoundGrove(authKey, configSettings) {
		const selfRef = this;
		
		/*
		 * Checks for the presence of the jQuery template engine.
		 * @returns {boolean} True if jQuery templates are available.
		 */
		function detectJqTemplateEngine() {
			return (typeof domLib === "object" && typeof domLib.tmpl === "function");
		}
		
		/*
		 * Checks for the availability of the Underscore.js template engine.
		 * @returns {boolean} True if Underscore templates are available.
		 */
		function detectUscoreTemplateEngine() {
			return (typeof utilLib === "object");
		}
		
		/*
		 * Verifies if a given value is an integer.
		 * @param {*} valueInput - The value to check.
		 * @returns {boolean} True if the value is an integer.
		 */
		function isWholeNumber(valueInput) {
			return (valueInput % (parseInt(valueInput) / Number(valueInput))) === 0;
		}
		
		// Determines the appropriate templating engine and caches the accessor function.
		selfRef.getTemplatingProcessor = function() {
			let processorId, processorFunction;
			
			if (detectJqTemplateEngine()) {
				processorId = "DomRenderer";
				processorFunction = domLib.tmpl;
			} else if (detectUscoreTemplateEngine()) {
				processorId = "UtilityLibRenderer";
				processorFunction = utilLib.template;
			} else {
				throw new Error('Either the jQuery template or Underscore template engines must be installed to convert a collection to html');
			}
			
			return {
				id: processorId,
				processor: processorFunction
			};
		};
		
		// FIXME: This should utilize proxy objects. Implement once more rendering engines are added.
		/*
		 * Renders HTML content using a detected templating engine.
		 * @param {string} markupStr - The template string.
		 * @param {Array} recordSet - The data to populate the template.
		 * @param {object} renderOptions - Rendering configuration options.
		 * @returns {string} The generated HTML content.
		 */
		function renderMarkup(markupStr, recordSet, renderOptions) {
			// logger.writeMsg(recordSet); // Debugging line
			const processorInfo = selfRef.getTemplatingProcessor();
			let outputHtml;
			
			renderOptions = domLib.extend({}, {beginPos: 0}, renderOptions);
			
			if (renderOptions.limitIdx) {
				recordSet = recordSet.subArray(renderOptions.beginPos, renderOptions.limitIdx);
			} else {
				recordSet = recordSet.subArray(renderOptions.beginPos);
			}
			
			if (processorInfo.id === "DomRenderer") {
				
				outputHtml = processorInfo.processor(markupStr, recordSet);
				
			} else if (processorInfo.id === "UtilityLibRenderer") {

				// Underscore templates do not natively support arrays; we must manually iterate and build the HTML.
				const readyRenderer = processorInfo.processor(markupStr);
				domLib.forEachItem(recordSet, function (idx, currentElement) {
					outputHtml += readyRenderer(currentElement);
				});
				outputHtml = outputHtml.alterText(/undefined/, ''); // TODO, why is this being inserted!?
				
			} else {
				throw new Error('Could not determine rendering engine type.');
			}
			
			return outputHtml;
		}
		
		/*
		 * Recursively flattens a nested JSON object, preserving structure with key prefixes.
		 * This facilitates easier access to nested values within templates.
		 * @param {object} complexData - The object to flatten.
		 * @param {boolean} withPrototypes - Whether to include inherited properties.
		 * @param {object} [resultContainer={}] - The object to store flattened properties.
		 * @param {string} [pathPrefix=""] - The prefix for keys.
		 * @returns {object} The flattened object.
		 */
		function deNestJson(complexData, withPrototypes, resultContainer, pathPrefix) {
			resultContainer = resultContainer || {};
			pathPrefix = pathPrefix || "";

			for (const objKey in complexData) {
				if (withPrototypes || complexData.hasOwnProperty(objKey)) {
					const currentProp = complexData[objKey];
					if (currentProp && typeof currentProp === "object" &&
						!(currentProp instanceof DateObject || currentProp instanceof RegexPattern)) {
						deNestJson(currentProp, withPrototypes, resultContainer, pathPrefix + objKey + "_");
					}
					else {
						resultContainer[pathPrefix + objKey] = currentProp;
					}
				}
			}
			return resultContainer;
		}

		
		if (!authKey) { throw new Error('You must supply an API key to use the API!'); }
		
		const apiClientRef = this;
		this.serviceKey = authKey;
		
		// service configuration constants
		this.serviceConstants = {
			apiBaseUrl: "http://developer.echonest.com/api/",
			uriVersion: 'version_four',
			outputFormat: 'json_callback'
		};
		
		// user-configurable options
		this.customConfig = {
			// currently none
		};
		domLib.extend(this.customConfig, configSettings);

		// interface to the SoundGrove object
		this.musicCreator = function (creatorName) {
			return new PerformerEntity(creatorName);
		};
		
		/*
		 * Handles responses from the API service. Throws errors if issues are detected.
		 * @class
		 * @param {object} serverPayload - The raw data received from the server.
		 */
		const ServiceResponse = function (serverPayload) {
			this.responseData = serverPayload;
			if (this.responseData.response.statusCode.resultId != 0) {
				throw new Error(this.responseData.response.statusCode.resultMsg);
			}
		};
		
			/*
			 * Retrieves the primary data payload from the service response.
			 * @returns {object} The main response data.
			 */
			ServiceResponse.prototype.fetchResultData = function() {
				return this.responseData.response;
			};
		
		/*
		 * Constructs requests for the API service.
		 * @class
		 */
		const ApiRequest = function () {

			// Merges any additional API details provided.
			this.additionalArgs = domLib.extend.apply(true, arguments);
			
			/*
			 * Generates the base URL for the API endpoint.
			 * @returns {string} The base URL.
			 */
			function generateUri() {
				return apiClientRef.serviceConstants.apiBaseUrl + apiClientRef.serviceConstants.uriVersion + "/";
			}
			
			/*
			 * Retrieves the requested response format.
			 * @returns {string} The response format.
			 */
			function retrieveFormat() {
				return apiClientRef.serviceConstants.outputFormat;
			}
			
			/*
			 * Fetches the API authorization key.
			 * @returns {string} The authorization key.
			 */
			function fetchAuthKey() {
				return apiClientRef.serviceKey;
			}
			
			/*
			 * Prepares the settings object for jQuery AJAX requests.
			 * @param {object} requestOptions - Specific options for this request.
			 * @returns {object} The AJAX settings object.
			 */
			this.prepareRequestOptions = function (requestOptions) {
				const requestPayload = {
					format: retrieveFormat(),
					api_key: fetchAuthKey()
				};
				
				domLib.extend(requestPayload, this.additionalArgs); // Merge in extra details for custom calls.
				
				return {
					url: generateUri() + requestOptions.apiEndpoint,
					dataType: 'jsonp',
					type: requestOptions.httpMethod,
					data: requestPayload,
					cache: true,
					success: function (payload, textStatus, xhrObj) {
						if (requestOptions.successHandler) { requestOptions.successHandler(new ServiceResponse(payload)); }
					}
				};
			};
			
		};
		
			/*
			 * Executes a GET request to the API.
			 * @param {string} apiEndpoint - The specific API endpoint.
			 * @param {function} successHandler - Callback function for successful responses.
			 */
			ApiRequest.prototype.performFetch = function (apiEndpoint, successHandler) {
				domLib.ajax(this.prepareRequestOptions({apiEndpoint: apiEndpoint, successHandler: successHandler, httpMethod: 'GET'}));
			};

		/*
		 * Represents a music creator entity.
		 * @class
		 * @param {string} entityName - The name of the music creator.
		 */
		const PerformerEntity = function (entityName) {
			this.creatorName = entityName;
			this.servicePath = 'performer_details/';
		};

			/*
			 * Fetches all sound clips associated with this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {SoundClipCollection} A collection of sound clips.
			 */
			PerformerEntity.prototype.soundClips = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'sound_clips', function (result) {
					onComplete(new SoundClipCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves all biographical information for this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {LifeStoryCollection} A collection of biographies.
			 */
			PerformerEntity.prototype.lifeStories = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'life_stories', function (result) {
					onComplete(new LifeStoryCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets all web logs related to this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {WebLogCollection} A collection of web logs.
			 */
			PerformerEntity.prototype.webLogs = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'web_logs', function (result) {
					onComplete(new WebLogCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Obtains the recognition score of this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {RecognitionData} Recognition score data.
			 */
			PerformerEntity.prototype.recognitionScore = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'recognition_score', function (result) {
					onComplete(new RecognitionData(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves the popularity index of this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {PopularityInfo} Popularity index data.
			 */
			PerformerEntity.prototype.popularityIndex = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'popularity_index', function (result) {
					onComplete(new PopularityInfo(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets all visual assets associated with this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {VisualCollection} A collection of images.
			 */
			PerformerEntity.prototype.visuals = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'visual_assets', function (result) {
					onComplete(new VisualCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Fetches the latest updates about a music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {UpdateCollection} A collection of news items.
			 */
			PerformerEntity.prototype.latestUpdates = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'latest_updates', function (result) {
					onComplete(new UpdateCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves the profile information for a music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {EntityProfileData} The music creator's profile.
			 */
			PerformerEntity.prototype.entityProfile = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'entity_profile', function (result) {
					onComplete(new EntityProfileData(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets critiques and reviews about a music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {CritiqueCollection} A collection of reviews.
			 */
			PerformerEntity.prototype.critiques = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'critiques', function (result) {
					onComplete(new CritiqueCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Performs a search for a music creator and returns results.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {QueryResultsCollection} A collection of search results.
			 */
			PerformerEntity.prototype.queryResults = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'query_results', function (result) {
					onComplete(new QueryResultsCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves musical tracks written by this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {MusicalTrackCollection} A collection of songs.
			 */
			PerformerEntity.prototype.musicalTracks = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'musical_tracks', function (result) {
					onComplete(new MusicalTrackCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets music creators similar to the one specified.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {RelatedArtistCollection} A collection of similar artists.
			 */
			PerformerEntity.prototype.relatedPerformers = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'related_performers', function (result) {
					onComplete(new RelatedArtistCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Obtains descriptive terms used for this music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {DescriptiveTermCollection} A collection of terms.
			 */
			PerformerEntity.prototype.descriptiveTerms = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'descriptive_terms', function (result) {
					onComplete(new DescriptiveTermCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves top popular music creators.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {TopPopularCollection} A collection of top popular artists.
			 */
			PerformerEntity.prototype.topPopular = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'top_popular', function (result) {
					onComplete(new TopPopularCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets the most frequently used terms.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {TopKeywordCollection} A collection of top terms.
			 */
			PerformerEntity.prototype.topKeywords = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'top_keywords', function (result) {
					onComplete(new TopKeywordCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Retrieves web links for the music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {WebLinkCollection} A collection of URLs.
			 */
			PerformerEntity.prototype.webLinks = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'web_links', function (result) {
					onComplete(new WebLinkCollection(result.fetchResultData()));
				});
			};
			
			/*
			 * Gets video clips for the music creator.
			 * @param {function} onComplete - Callback for the result.
			 * @param {object} [params] - Additional request parameters.
			 * @returns {VideoClipCollection} A collection of videos.
			 */
			PerformerEntity.prototype.videoClips = function (onComplete, params) {
				const reqObj = new ApiRequest(params, {creatorName: this.creatorName});
				reqObj.performFetch(this.servicePath + 'video_clips', function (result) {
					onComplete(new VideoClipCollection(result.fetchResultData()));
				});
			};
		
		/*
		 * Base class for individual data items returned from the API.
		 * @class
		 */
		const UniqueItem = function () {
		};
		
			/*
			 * Getter for the data stored in the unique item.
			 * @returns {object} Hash of data.
			 */
			UniqueItem.prototype.retrieveItemData = function () {
				return this.responseData[this.itemType];
			};
		
			/*
			 * Converts the unique item data to an HTML string using a template.
			 * @param {string} markupStr - The HTML template.
			 * @param {object} renderOptions - Rendering options.
			 * @returns {string} Rendered HTML.
			 */
			UniqueItem.prototype.toHtmlString = function (markupStr, renderOptions) {
				return renderMarkup(markupStr, this.retrieveItemData(), renderOptions);
			};
		
		/*
		 * Base class for collections of items returned from the API.
		 * @class
		 */
		const RecordSetBase = function () {
			this.focusedRecord = null; // Used to target a specific item within the collection.
		};
		
			/*
			 * Retrieves the data stored in the collection. If a specific item is focused, only that record is returned.
			 * @returns {Array|object} Data stored in the collection.
			 */
			RecordSetBase.prototype.fetchRecord = function () {
				return (this.fetchFocusedRecord()) ? this.responseData[this.itemType][this.fetchFocusedRecord()] : this.responseData[this.itemType];
			};
			
			/*
			 * Sets the index of the item to focus on within the collection.
			 * @param {number} idx - The index to focus on.
			 * @returns {number} The focused index.
			 */
			RecordSetBase.prototype.setFocusedRecord = function (idx) {
				this.focusedRecord = idx;
				return this.focusedRecord;
			};
			
			/*
			 * Retrieves the index of the currently focused item.
			 * @returns {number|null} The focused index or null if no item is focused.
			 */
			RecordSetBase.prototype.fetchFocusedRecord = function () {
				return this.focusedRecord;
			};
			
			/*
			 * Returns the starting point of the results received from the server.
			 * @returns {number} The starting index.
			 */
			RecordSetBase.prototype.getStartPoint = function () {
				return parseInt(this.responseData.startIndex, 10);
			};
			
			/*
			 * Returns the total count of available records on the server.
			 * @returns {number} Total results available.
			 */
			RecordSetBase.prototype.getTotalCount = function () {
				return parseInt(this.responseData.totalRecords, 10);
			};
			
			/*
			 * Returns the number of items currently in this collection.
			 * @returns {number} Number of items.
			 */
			RecordSetBase.prototype.getItemCount = function () {
				return this.fetchRecord().length;
			};
		
			/*
			 * Generates HTML from the collection using a template.
			 * @param {string} markupStr - The HTML template string.
			 * @param {object} renderOptions - Rendering options.
			 * @returns {string} Formatted HTML content.
			 */
			RecordSetBase.prototype.createHtmlContent = function (markupStr, renderOptions) {
				if (this.getItemCount() < 1) { throw new IndexOutOfRangeError('Empty collection'); }
				return renderMarkup(markupStr, this.fetchRecord(), renderOptions);
			};
			
			/*
			 * Sets a specific item in the collection to be the focus.
			 * To revert to working with the full collection, pass a non-integer value.
			 * @param {number} idx - The index of the item to focus on.
			 * @returns {RecordSetBase} This collection instance for chaining.
			 */
			RecordSetBase.prototype.selectIndex = function (idx) {
				(isWholeNumber(idx)) ? this.setFocusedRecord(idx) : this.setFocusedRecord(null);
				return this;
			};
		
		/*
		 * Represents a collection of audio objects.
		 * Inherits from RecordSetBase.
		 * @class
		 * @param {object} serverPayload - The raw data from the server.
		 */
		const SoundClipCollection = function (serverPayload) {
			this.responseData = serverPayload;
			this.itemType = "sound_items";
		};
		SoundClipCollection.prototype = new RecordSetBase(); SoundClipCollection.prototype.constructor = SoundClipCollection;
		
		/*
		 * Represents a collection of web logs.
		 * Inherits from RecordSetBase.
		 * @class
		 * @param {object} serverPayload - The raw data from the server.
		 */
		const WebLogCollection = function (serverPayload) {
			this.responseData = serverPayload;
			this.itemType = "web_log_entries";
		};
		WebLogCollection.prototype = new RecordSetBase(); WebLogCollection.prototype.constructor = WebLogCollection;
		
		/*
		 * Represents a collection of biographical entries.
		 * Inherits from RecordSetBase.
		 * @class
		 * @param {object} serverPayload - The raw data from the server.
		 */
		const LifeStoryCollection = function (serverPayload) {
			const currentScope = this;
			this.responseData = serverPayload;
			this.itemType = "life_story_items";
			
			// Flatten the JSON to allow access to nested items directly within templates.
			domLib.forEachItem(this.responseData[this.itemType], function (idx, dataElement) {
				currentScope.responseData[currentScope.itemType][idx] = deNestJson(dataElement);
			});
			
		};
		LifeStoryCollection.prototype = new RecordSetBase(); LifeStoryCollection.prototype.constructor = LifeStoryCollection;
		
		/*
		 * Represents familiarity information about a music creator.
		 * Inherits from UniqueItem.
		 * @class
		 * @param {object} serverPayload - The raw data from the server.
		 */
		const RecognitionData = function (serverPayload) {
			this.responseData = serverPayload;
			this.itemType = "performer_info";
		};
		
})(window, jQuery);