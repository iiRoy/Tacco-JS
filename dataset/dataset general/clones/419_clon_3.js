// This file contains a revised and re-engineered API client for accessing
// a hypothetical online scripture service.
// Version: 2.1.0 (Clone)
// Copyright (c) 2024, Fictional Devs
// Licensed under a custom permissive license.

(function() {
  // Internal configuration and state variables
  let serviceBaseUrl = 'https://bibles.org/v2/'; // The foundational endpoint for API requests.
  let clientAccessKey = ''; // Holds the API key required for authentication.
  let recentErrorMessage = ''; // Stores the last encountered error message.
  let fumsPayloadScript = ''; // Script content related to Fair Use Management System (FUMS).
  let fumsScriptLoadedStatus = false; // Flag indicating if the FUMS script has been injected.
  let fumsPollingTimer = null; // Timer ID for FUMS related periodic tasks. (Not actively used in this clone, but kept for conceptual mapping)
  let suppressFumsInjection = false; // Controls whether FUMS script injection is active.
  let isAsyncRequest = true; // Determines if AJAX requests are asynchronous.
  let enableVerboseLogging = false; // Activates detailed console logging for debugging.
  let requestCounter = 0; // Tracks the number of API requests made.

  // Helper function for logging messages when verbose logging is enabled.
  const logDebugMessage = (message) => {
    if (enableVerboseLogging) {
      console.log(`[ScriptureLookup] ${message}`);
    }
  };

  /**
   * Represents a client for interacting with a scripture lookup service.
   * Provides methods to search, retrieve versions, books, chapters, and verses.
   * @class
   */
  function ScriptureLookupService() {
    logDebugMessage('Service client initialized.');
  }

  // --- Configuration and Utility Methods ---

  /**
   * Activates verbose logging to the console for debugging purposes.
   */
  ScriptureLookupService.prototype.activateVerboseLogging = function() {
    enableVerboseLogging = true;
    logDebugMessage('Verbose logging activated.');
  };

  /**
   * Deactivates verbose logging.
   */
  ScriptureLookupService.prototype.deactivateVerboseLogging = function() {
    enableVerboseLogging = false;
  };

  /**
   * Configures the API access key for authentication.
   * @param {string} key - The API key string.
   */
  ScriptureLookupService.prototype.configureAccessKey = function(key) {
    if (typeof key === 'string' && key.trim() !== '') {
      clientAccessKey = key;
      logDebugMessage('API access key configured.');
    } else {
      recentErrorMessage = 'Invalid or empty API key provided.';
      logDebugMessage(recentErrorMessage);
    }
  };

  /**
   * Retrieves the currently configured API access key.
   * @returns {string} The API key.
   */
  ScriptureLookupService.prototype.retrieveAccessKey = function() {
    return clientAccessKey;
  };

  /**
   * Sets the asynchronous mode for API requests.
   * @param {boolean} shouldBeAsync - True for asynchronous, false for synchronous.
   */
  ScriptureLookupService.prototype.setAsynchronousMode = function(shouldBeAsync) {
    isAsyncRequest = Boolean(shouldBeAsync);
    logDebugMessage(`Asynchronous mode set to: ${isAsyncRequest}`);
  };

  /**
   * Gets the current asynchronous mode setting.
   * @returns {boolean} True if requests are asynchronous, false otherwise.
   */
  ScriptureLookupService.prototype.getAsynchronousMode = function() {
    return isAsyncRequest;
  };

  /**
   * Retrieves the most recent error message and clears it.
   * @returns {string} The last error message.
   */
  ScriptureLookupService.prototype.getLatestError = function() {
    const currentError = recentErrorMessage;
    recentErrorMessage = ''; // Clear the error after retrieval
    return currentError;
  };

  // --- Internal Helper Functions ---

  /**
   * Validates the presence of an API key and sets an error if missing.
   * @returns {boolean} True if API key is present, false otherwise.
   */
  const validateApiKey = () => {
    if (!clientAccessKey || clientAccessKey === '') {
      recentErrorMessage = 'An API Key must be supplied for this operation.';
      logDebugMessage(recentErrorMessage);
      return false;
    }
    return true;
  };

  /**
   * Validates the presence of a required option property.
   * @param {object} options - The options object.
   * @param {string} propName - The name of the required property.
   * @param {string} errorMessage - The error message to set if validation fails.
   * @returns {boolean} True if the property is present and not empty, false otherwise.
   */
  const validateOption = (options, propName, errorMessage) => {
    if (!options || !options[propName] || options[propName] === '') {
      recentErrorMessage = errorMessage;
      logDebugMessage(recentErrorMessage);
      return false;
    }
    return true;
  };

  /**
   * Encodes URL parameters from an object. Filters out empty/null/undefined values.
   * @param {object} params - Object of key-value pairs to encode.
   * @returns {string} URL-encoded string.
   */
  const encodeUrlParams = (params) => {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  };

  /**
   * Checks the current network connectivity status.
   * @returns {boolean} True if network appears to be up, false otherwise.
   */
  ScriptureLookupService.prototype.checkNetworkConnectivity = function() {
    // This check is primarily for Cordova/mobile environments where `navigator.connection` is available.
    // In a standard browser, it might not be present or `type` might be 'unknown'.
    if (typeof navigator !== 'undefined' && navigator.connection &&
      (navigator.connection.type === 'unknown' || navigator.connection.type === 'none')) {
      logDebugMessage('Network appears to be down.');
      return false;
    }
    logDebugMessage('Network appears to be up.');
    return true;
  };

  /**
   * Default handler for request timeouts. Logs a warning and sets an error message.
   */
  ScriptureLookupService.prototype.handleRequestTimeout = function() {
    console.warn('ScriptureLookupService: Request timed out.');
    recentErrorMessage = 'API request timed out.';
  };

  // --- Core API Request Method ---

  /**
   * Executes an AJAX JSON request to the API endpoint.
   * @param {string} endpointUrl - The full URL for the API request.
   * @param {Function} responseCallback - Callback function to handle the JSON response.
   *                                      Expected signature: `(data: object|null, error: Error|null)`.
   * @param {Function} [timeoutHandler] - Optional callback for request timeout.
   * @returns {boolean} True if the request was successfully initiated, false otherwise.
   */
  ScriptureLookupService.prototype.makeJsonRequest = function(endpointUrl, responseCallback, timeoutHandler) {
    if (!validateApiKey()) {
      responseCallback(null, new Error(recentErrorMessage)); // Pass error to callback
      return false;
    }

    if (typeof responseCallback !== 'function') {
      logDebugMessage('No valid callback function provided for JSON request. Using a no-op.');
      responseCallback = () => {}; // Ensure it's callable to prevent errors
    }

    if (!this.checkNetworkConnectivity()) {
      recentErrorMessage = 'Cannot complete request: Network is currently unavailable.';
      responseCallback(null, new Error(recentErrorMessage));
      return false;
    }

    if (typeof XMLHttpRequest === 'undefined') {
      recentErrorMessage = 'XMLHttpRequest is not supported in this environment.';
      responseCallback(null, new Error(recentErrorMessage));
      return false;
    }

    const httpRequest = new XMLHttpRequest();
    requestCounter++;
    logDebugMessage(`Initiating request #${requestCounter} to: ${endpointUrl}`);

    const handleReadyStateChange = () => {
      logDebugMessage(`Request #${requestCounter} state: ${httpRequest.readyState}`);
      if (httpRequest.readyState === 4) { // DONE
        logDebugMessage(`Request #${requestCounter} status: ${httpRequest.status}`);
        if (httpRequest.status === 200) {
          logDebugMessage(`Request #${requestCounter} response received.`);
          try {
            const parsedData = this.safelyParseJson(httpRequest.responseText);

            // FUMS integration (simplified for clone context)
            if (parsedData && parsedData.response && parsedData.response.meta) {
                // Assuming a global instance exists for FUMS script management
                // In a real scenario, this would be more tightly coupled or a separate module.
                if (typeof window.scriptureServiceInstance !== 'undefined' && !suppressFumsInjection) {
                    const fumsInclude = parsedData.response.meta.fums_js_include;
                    const fumsContent = parsedData.response.meta.fums_js;
                    if (fumsInclude && fumsInclude !== '' && !fumsScriptLoadedStatus) {
                        window.scriptureServiceInstance.injectFumsScript(fumsInclude);
                    }
                    if (fumsContent && fumsContent !== '') {
                        window.scriptureServiceInstance.processFumsData(fumsContent);
                    }
                }
            }
            responseCallback(parsedData, null); // Success: data, no error
          } catch (parseError) {
            recentErrorMessage = `Failed to parse JSON response: ${parseError.message}`;
            logDebugMessage(recentErrorMessage);
            responseCallback(null, parseError); // Error: no data, error object
          }
        } else {
          recentErrorMessage = `API request failed with status: ${httpRequest.status} - ${httpRequest.statusText}`;
          logDebugMessage(recentErrorMessage);
          responseCallback(null, new Error(recentErrorMessage)); // Error: no data, error object
        }
      }
    };

    httpRequest.onreadystatechange = handleReadyStateChange;

    // Apply basic authentication directly in the URL for compatibility with some environments
    // or use Authorization header. The original code did both.
    // Let's stick to the URL modification for `open` call as it's more direct for this clone.
    let authenticatedUrl = endpointUrl.replace('//', `//${clientAccessKey}:x@`);

    httpRequest.open('GET', authenticatedUrl, isAsyncRequest);

    // If running on Android, explicitly set Authorization header as well.
    // This is a specific workaround from the original code.
    if (typeof navigator !== 'undefined' && navigator.userAgent.match(/Android/i)) {
      httpRequest.setRequestHeader('Authorization', 'Basic ' + btoa(`${clientAccessKey}:x`));
    }

    httpRequest.timeout = 15000; // Increased default timeout to 15 seconds
    httpRequest.ontimeout = timeoutHandler || this.handleRequestTimeout;
    httpRequest.onerror = (e) => { // Catch network errors like DNS resolution failure, connection refused, etc.
        recentErrorMessage = `Network error during request: ${e.type}`;
        logDebugMessage(recentErrorMessage);
        responseCallback(null, new Error(recentErrorMessage));
    };

    httpRequest.send(null);

    return true;
  };

  /**
   * Safely parses a JSON string.
   * @param {string} jsonString - The JSON string to parse.
   * @returns {object|null} The parsed JSON object, or null if parsing fails or input is invalid.
   */
  ScriptureLookupService.prototype.safelyParseJson = function(jsonString) {
    if (typeof jsonString !== 'string' || jsonString.trim() === '') {
      logDebugMessage('Attempted to parse empty or non-string JSON data.');
      // Store the specific parsing error.
      recentErrorMessage = 'JSON parsing failed: Input was empty or not a string.';
      return null;
    }
    try {
      // Modern JSON.parse handles leading/trailing whitespace well,
      // so the `rtrim` regex from the original is no longer strictly necessary.
      return JSON.parse(jsonString);
    } catch (e) {
      logDebugMessage(`Error parsing JSON: ${e.message}`);
      recentErrorMessage = `JSON parsing failed: ${e.message}`;
      return null;
    }
  };

  // --- API Endpoints ---

  /**
   * Performs a general search for passages or keywords across scripture.
   * @param {object} searchOptions - Options for the search.
   * @param {string} searchOptions.query - The search query (passage or keyword).
   * @param {string} [searchOptions.version] - Optional version ID to restrict the search.
   * @param {Function} resultCallback - Callback function to receive the search results.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.performTextSearch = function(searchOptions, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(searchOptions, 'query', 'A search query must be provided.')) return false;

    let requestUrl = `${serviceBaseUrl}search.js?query=${encodeURIComponent(searchOptions.query)}`;
    if (searchOptions.version) {
      requestUrl += `&version=${encodeURIComponent(searchOptions.version)}`;
    }

    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Retrieves a list of all available Bible versions.
   * @param {Function} resultCallback - Callback function to receive the list of versions.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.listAvailableVersions = function(resultCallback) {
    if (!validateApiKey()) return false;
    return this.makeJsonRequest(`${serviceBaseUrl}versions.js`, resultCallback);
  };

  /**
   * Fetches a list of books for a specified Bible version.
   * @param {object} options - Options object.
   * @param {string} options.version - The ID of the version (e.g., 'KJV').
   * @param {string} [options.testament] - Optional filter by testament (e.g., 'OT', 'NT').
   * @param {Function} resultCallback - Callback function to receive the book list.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.getBooksForVersion = function(options, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(options, 'version', 'A version identifier is required.')) return false;

    let requestUrl = `${serviceBaseUrl}versions/${encodeURIComponent(options.version)}/books.js`;
    if (options.testament) {
      requestUrl += `?testament=${encodeURIComponent(options.testament)}`;
    }
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Finds Bible versions available in a specific language.
   * @param {string} langCode - ISO 639-2 language abbreviation (e.g., 'eng', 'spa').
   * @param {Function} resultCallback - Callback function for the list of versions.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.findVersionsByLanguage = function(langCode, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption({ langCode }, 'langCode', 'A language code must be provided.')) return false;

    return this.makeJsonRequest(`${serviceBaseUrl}versions.js?language=${encodeURIComponent(langCode)}`, resultCallback);
  };

  /**
   * Retrieves detailed information about a specific Bible version.
   * @param {string} versionId - The ID of the version (e.g., 'NIV').
   * @param {Function} resultCallback - Callback function for version details.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.fetchVersionDetails = function(versionId, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption({ versionId }, 'versionId', 'A version identifier is required.')) return false;

    return this.makeJsonRequest(`${serviceBaseUrl}versions/${encodeURIComponent(versionId)}.js`, resultCallback);
  };

  /**
   * Retrieves information about a specific book within a version.
   * @param {object} options - Options object.
   * @param {string} options.version - The ID of the version.
   * @param {string} options.book - The OSIS normative abbreviation for the book (e.g., 'Gen', 'Rev').
   * @param {Function} resultCallback - Callback function for book information.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.retrieveBookInfo = function(options, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(options, 'version', 'A version ID is required.')) return false;
    if (!validateOption(options, 'book', 'A book ID (OSIS abbreviation) is required.')) return false;

    const requestUrl = `${serviceBaseUrl}books/${encodeURIComponent(options.version)}:${encodeURIComponent(options.book)}.js`;
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Lists all chapters for a given book in a specific version.
   * @param {object} options - Options object.
   * @param {string} options.version - The ID of the version.
   * @param {string} options.book - The OSIS normative abbreviation for the book.
   * @param {Function} resultCallback - Callback function for the list of chapters.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.listChaptersInBook = function(options, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(options, 'version', 'A version ID is required.')) return false;
    if (!validateOption(options, 'book', 'A book ID is required.')) return false;

    const requestUrl = `${serviceBaseUrl}books/${encodeURIComponent(options.version)}:${encodeURIComponent(options.book)}/chapters.js`;
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Fetches the content of a specific chapter.
   * @param {object} options - Options for fetching chapter content.
   * @param {string} options.version - The ID of the version.
   * @param {string} options.book - The OSIS normative abbreviation for the book.
   * @param {number|string} options.chapter - The chapter number.
   * @param {boolean} [options.marginalia] - Set to true to include cross-references and footnotes.
   * @param {Function} resultCallback - Callback for chapter content.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.fetchChapterContent = function(options, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(options, 'version', 'A version identifier is required.')) return false;
    if (!validateOption(options, 'book', 'A book identifier is required.')) return false;
    if (!validateOption(options, 'chapter', 'A chapter number is required.')) return false;

    let requestUrl = `${serviceBaseUrl}chapters/${encodeURIComponent(options.version)}:${encodeURIComponent(options.book)}.${encodeURIComponent(options.chapter)}.js`;

    if (options.marginalia) {
      requestUrl += `?include_marginalia=${encodeURIComponent(options.marginalia)}`;
    }
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Retrieves a list of verses within a specific chapter, with optional start/end verse filtering.
   * @param {object} options - Options for fetching verses.
   * @param {string} options.version - The ID of the version.
   * @param {string} options.book - The OSIS normative abbreviation for the book.
   * @param {number|string} options.chapter - The chapter number.
   * @param {number|string} [options.start] - Optional starting verse number.
   * @param {number|string} [options.end] - Optional ending verse number.
   * @param {Function} resultCallback - Callback for the list of verses.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.getVersesInChapter = function(options, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(options, 'version', 'A version identifier is required.')) return false;
    if (!validateOption(options, 'book', 'A book identifier is required.')) return false;
    if (!validateOption(options, 'chapter', 'A chapter number is required.')) return false;

    const queryParams = {};
    if (options.start) queryParams.start = options.start;
    if (options.end) queryParams.end = options.end;

    let requestUrl = `${serviceBaseUrl}chapters/${encodeURIComponent(options.version)}:${encodeURIComponent(options.book)}.${encodeURIComponent(options.chapter)}/verses.js`;

    const queryString = encodeUrlParams(queryParams);
    if (queryString) {
        requestUrl += `?${queryString}`;
    }

    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Searches for verses based on keywords and various filtering options.
   * @param {object} searchCriteria - Object containing keyword and other search parameters.
   * @param {string} searchCriteria.keyword - The primary keyword(s) to search for.
   * @param {string} [searchCriteria.precision] - 'all' or 'any'.
   * @param {string} [searchCriteria.exclude] - Keywords to exclude.
   * @param {string} [searchCriteria.spelling] - 'yes' to search for similar spellings.
   * @param {string} [searchCriteria.version] - One or more version IDs.
   * @param {Function} resultCallback - Callback for search results.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.searchVersesByKeywords = function(searchCriteria, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(searchCriteria, 'keyword', 'A keyword is mandatory for verse search.')) return false;

    const queryString = encodeUrlParams(searchCriteria);
    const requestUrl = `${serviceBaseUrl}verses.js?${queryString}`;

    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Retrieves a specific verse by its full reference (version, book, chapter, verse).
   * @param {object} referenceOptions - Options with full verse reference.
   * @param {string} referenceOptions.version - The ID of the version.
   * @param {string} referenceOptions.book - The OSIS normative abbreviation for the book.
   * @param {number|string} referenceOptions.chapter - The chapter number.
   * @param {number|string} referenceOptions.verse - The verse number.
   * @param {Function} resultCallback - Callback for the specific verse.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.getVerseByReference = function(referenceOptions, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(referenceOptions, 'version', 'A version ID is required.')) return false;
    if (!validateOption(referenceOptions, 'book', 'A book ID is required.')) return false;
    if (!validateOption(referenceOptions, 'chapter', 'A chapter number is required.')) return false;
    if (!validateOption(referenceOptions, 'verse', 'A verse number is required.')) return false;

    const requestUrl = `${serviceBaseUrl}verses/${encodeURIComponent(referenceOptions.version)}:${encodeURIComponent(referenceOptions.book)}.${encodeURIComponent(referenceOptions.chapter)}.${encodeURIComponent(referenceOptions.verse)}.js`;
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Queries for references to passages based on user input.
   * @param {object} passageOptions - Options with passage specifiers.
   * @param {string} passageOptions.passages - Comma-separated list of passage specifiers (e.g., 'John+3:12-15,Luke+2').
   * @param {string} [passageOptions.version] - Optional single version ID.
   * @param {Function} resultCallback - Callback for passage references.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.queryPassageReferences = function(passageOptions, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption(passageOptions, 'passages', 'Passage specifiers are required.')) return false;

    let requestUrl = serviceBaseUrl;
    if (passageOptions.version && passageOptions.version !== '') {
      requestUrl += `${encodeURIComponent(passageOptions.version)}/`;
    }
    requestUrl += `passages.js?q[]=${encodeURIComponent(passageOptions.passages)}`;

    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Browses book groups, optionally for a specific group ID.
   * @param {object} [groupOptions] - Optional object with 'id' for a specific book group.
   * @param {Function} resultCallback - Callback for book group data.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.browseBookGroups = function(groupOptions, resultCallback) {
    if (!validateApiKey()) return false;

    let requestUrl = `${serviceBaseUrl}bookgroups`;
    if (groupOptions && groupOptions.id && groupOptions.id !== '') {
      requestUrl += `/${encodeURIComponent(groupOptions.id)}`;
    }
    requestUrl += '.js';

    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  /**
   * Follows a given API path, useful for pagination or related resource links provided by the API.
   * @param {string} relativePath - The path to follow (e.g., '/verses/next', or a full path provided by API response).
   * @param {Function} resultCallback - Callback for the fetched data.
   * @returns {boolean} True if the request was sent, false otherwise.
   */
  ScriptureLookupService.prototype.followApiLink = function(relativePath, resultCallback) {
    if (!validateApiKey()) return false;
    if (!validateOption({ relativePath }, 'relativePath', 'A path must be specified to follow.')) return false;

    // Ensure path doesn't start with a slash if it's meant to be appended to base URL.
    // The original code explicitly removed a leading slash.
    let cleanedPath = relativePath;
    if (cleanedPath.startsWith('/')) {
      cleanedPath = cleanedPath.substring(1);
    }
    const requestUrl = `${serviceBaseUrl}${cleanedPath}`;
    return this.makeJsonRequest(requestUrl, resultCallback);
  };

  // --- FUMS (Fair Use Management System) Related Methods ---
  // These methods are specific to the original library's FUMS integration
  // and are adapted to fit the new class structure.

  /**
   * Injects the FUMS JavaScript content into the document head.
   * @param {string} scriptUrl - The URL of the JavaScript file for FUMS.
   */
  ScriptureLookupService.prototype.injectFumsScript = function(scriptUrl) {
    if (fumsScriptLoadedStatus || !scriptUrl || suppressFumsInjection) {
        logDebugMessage('FUMS script already loaded, content is empty, or injection suppressed. Skipping.');
        return;
    }
    fumsPayloadScript = scriptUrl; // Storing the URL, not the content directly
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = scriptUrl;
    scriptTag.async = true;
    scriptTag.onload = () => {
        fumsScriptLoadedStatus = true;
        logDebugMessage('FUMS script injected successfully.');
    };
    scriptTag.onerror = (e) => {
        logDebugMessage(`Failed to inject FUMS script from ${scriptUrl}: ${e.message || e}`);
    };
    document.head.appendChild(scriptTag);
  };

  /**
   * Processes FUMS data, typically a JavaScript snippet provided by the API.
   * This method directly executes the provided string as JavaScript.
   * WARNING: Executing arbitrary JavaScript from an external source (`eval`) can be a security risk.
   * This implementation mirrors the likely intent of the original library.
   * @param {string} fumsDataString - The FUMS data string (often a JS snippet).
   */
  ScriptureLookupService.prototype.processFumsData = function(fumsDataString) {
    if (suppressFumsInjection || !fumsDataString || fumsDataString === '') {
        logDebugMessage('FUMS data processing suppressed or data is empty.');
        return;
    }
    try {
        eval(fumsDataString); // DANGEROUS IN PRODUCTION, but mimicking the original's intent.
        logDebugMessage('FUMS data processed (evaled).');
    } catch (e) {
        logDebugMessage(`Error processing FUMS data snippet: ${e.message}`);
    }
  };

  /**
   * Toggles the suppression of FUMS script injection and processing.
   * @param {boolean} suppress - True to suppress FUMS, false to allow.
   */
  ScriptureLookupService.prototype.setFumsSuppression = function(suppress) {
      suppressFumsInjection = Boolean(suppress);
      logDebugMessage(`FUMS injection suppression set to: ${suppressFumsInjection}`);
  };

  // Expose the ScriptureLookupService globally or within a specific namespace.
  // The original used `window.plugins.absBiblesearch`. We'll create a similar pattern
  // but with the new class name and a unique instance name to avoid conflicts.
  if (typeof window !== 'undefined') {
    // Ensure 'window.plugins' exists for compatibility with original design
    if (!window.plugins) {
      window.plugins = {};
    }
    // Expose a singleton instance of the service
    window.plugins.scriptureServiceInstance = new ScriptureLookupService();
    // Also expose the constructor directly for advanced usage or custom instantiation
    window.ScriptureLookupService = ScriptureLookupService;
  }
})();