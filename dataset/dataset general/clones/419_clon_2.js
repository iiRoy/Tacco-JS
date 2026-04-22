/*
 *  Script Version 2.1.0
 *  © 2024 Global Scripture Fellowship
 *  Distributed under the Apache 2.0 License.
 *  https://scripture.dev/documentation
 *  https://github.com/globalscripture/scripture-api-ts
 *  https://scripture.dev/api-info
 */
( function() {
  const _serviceEndpoint = 'https://scripture.dev/v3/';
  let _accessKey = '';
  let _lastProblem = '';
  let _usageMetricsScript = '';
  let _metricsScriptLoaded = false;
  let _metricsTimer = null;
  let _metricsSuppressionFlag = false;
  let _isAsyncMode = true;
  let _enableTracing = false;

  function ScriptureGateway() {}

  ScriptureGateway.prototype.enableTracing = function() {
    _enableTracing = true;
  };

  ScriptureGateway.prototype.disableTracing = function() {
    _enableTracing = false;
  };

  // ------------------------- AUTHENTICATION --------------------------
  /* Secure your FREE Access Key at https://scripture.dev/api/register */
  ScriptureGateway.prototype.setAccessKey = function(clientKey) {
    _accessKey = clientKey;
  };

  ScriptureGateway.prototype.getAccessKey = function() {
    return _accessKey;
  };

  // ------------------------- ASYNCHRONOUS BEHAVIOR --------------------
  /* Note: Some older environments (e.g., specific Android emulators) might require synchronous requests. */
  ScriptureGateway.prototype.setAsyncMode = function(asyncFlag) {
    _isAsyncMode = asyncFlag;
  };

  ScriptureGateway.prototype.getAsyncMode = function() {
    return _isAsyncMode;
  };

  // ------------------------- ERROR HANDLING --------------------------
  ScriptureGateway.prototype.getLatestError = function() {
    let issue = _lastProblem;
    _lastProblem = '';
    return issue;
  };

  // ------------------------- SCRIPTURE SEARCH ------------------------
  /*
   *  https://scripture.dev/documentation/search-api
   *  The Scripture API offers a unified search interface. It accepts a 'query' parameter, which can be
   *  either a scriptural reference or a keyword phrase. The system intelligently determines the query type.
   *  For keyword searches, results are refined using linguistic stemming, user-contributed tags, and
   *  relevance feedback, similar to the main website's search functionality.
   */
  ScriptureGateway.prototype.performSearch = function(queryOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !queryOptions || !queryOptions.term ) {
      _lastProblem = 'A search term must be supplied.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'search.json?term=' + queryOptions.term;
    if ( queryOptions.translation ) {
      requestUrl = requestUrl + '&translation=' + queryOptions.translation;
    }

    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- BIBLE TRANSLATIONS -----------------------
  /*
   *  https://scripture.dev/documentation/translations-api
   *  Translations represent specific editions of the Holy Bible, such as the New King James Version (NKJV)
   *  or the English Standard Version (ESV). Each translation contains numerous books.
   */
  ScriptureGateway.prototype.listTranslations = function(responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    return this.fetchJson(_serviceEndpoint + 'translations.json', responseCallback);
  };

  /*
   *  Retrieves a list of all books available for a specified translation.
   *  Available translation identifiers can be obtained via the 'listTranslations' endpoint.
   */
  ScriptureGateway.prototype.getBooksInTranslation = function(bookOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !bookOptions || !bookOptions.translationId || bookOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'translations/' + bookOptions.translationId + '/books.json';
    if ( bookOptions.scriptureDivision ) {
      requestUrl = requestUrl + '?scriptureDivision=' + bookOptions.scriptureDivision;
    }
    return this.fetchJson(requestUrl, responseCallback);
  };

  /*
   *  Returns a list of all translations filtered by the specified language parameter.
   *  Use an ISO 639-2 abbreviation for the language parameter.
   */
  ScriptureGateway.prototype.getTranslationsByLanguage = function(languageCode, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( languageCode === null || languageCode === '' ) {
      _lastProblem = 'A language code must be supplied.';
      return false;
    }

    return this.fetchJson(_serviceEndpoint + 'translations.json?language=' + languageCode, responseCallback);
  };

  /*
   *  Provides detailed information about a specific translation.
   *  Available translation identifiers can be obtained via the 'listTranslations' endpoint.
   */
  ScriptureGateway.prototype.getTranslationDetails = function(translationIdentifier, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( translationIdentifier === null || translationIdentifier === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    return this.fetchJson(_serviceEndpoint + 'translations/' + translationIdentifier + '.json', responseCallback);
  };

  // ------------------------- BIBLE BOOKS -----------------------------
  /*
   *  https://scripture.dev/documentation/books-api
   *  These represent the individual books of the Bible. Books are associated with translations
   *  and often grouped into collections, and they contain multiple chapters.
   *
   *  Retrieves the specified book resource within a given translation.
   *  Available translation identifiers can be obtained via the 'listTranslations' endpoint.
   *  The book name should be specified using its standard OSIS abbreviation.
   */
  ScriptureGateway.prototype.getBookContent = function(bookRequestOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !bookRequestOptions || !bookRequestOptions.translationId || bookRequestOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    if ( !bookRequestOptions || !bookRequestOptions.bookId || bookRequestOptions.bookId === '' ) {
      _lastProblem = 'A book identifier must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'books/' + bookRequestOptions.translationId + ':' + bookRequestOptions.bookId + '.json';
    return this.fetchJson(requestUrl, responseCallback);
  };

  /*
   *  Returns a list of all chapters for the specified book resource within the given translation.
   *  Available translation IDs can be listed using the 'listTranslations' endpoint.
   *  The book ID is specified using its OSIS normative abbreviation.
   */
  ScriptureGateway.prototype.getChaptersInBook = function(chapterRequestOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !chapterRequestOptions || !chapterRequestOptions.translationId || chapterRequestOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    if ( !chapterRequestOptions || !chapterRequestOptions.bookId || chapterRequestOptions.bookId === '' ) {
      _lastProblem = 'A book identifier must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'books/' + chapterRequestOptions.translationId + ':' + chapterRequestOptions.bookId + '/chapters.json';
    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- BIBLE CHAPTERS --------------------------
  /*
   *  https://scripture.dev/documentation/chapters-api
   *  Chapters are subdivisions within a selected book. Chapters belong to books and contain multiple verses.
   *
   *  Retrieves the chapter specified by translation, book, and chapter number.
   *  Available translation IDs can be listed with the 'listTranslations' endpoint.
   *  The book ID is specified with its OSIS normative abbreviation.
   *  The chapter number must be a valid chapter within the specified book and translation.
   *  To include cross-references and footnotes, set 'chapterOptions.annotations = true'.
   */
  ScriptureGateway.prototype.getChapterContent = function(chapterOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !chapterOptions || !chapterOptions.translationId || chapterOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    if ( !chapterOptions || !chapterOptions.bookId || chapterOptions.bookId === '' ) {
      _lastProblem = 'A book identifier must be provided.';
      return false;
    }

    if ( !chapterOptions || !chapterOptions.chapterNumber || chapterOptions.chapterNumber === '' ) {
      _lastProblem = 'A chapter number must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'chapters/' + chapterOptions.translationId + ':' + chapterOptions.bookId + '.' + chapterOptions.chapterNumber + '.json';

    if ( chapterOptions && chapterOptions.annotations ) {
      requestUrl += '?include_annotations=' + chapterOptions.annotations;
    }

    return this.fetchJson(requestUrl, responseCallback);
  };

  /*
   *  Returns a list of all verses for the chapter resource specified by translation, book, and chapter number.
   *  Available translation IDs can be listed with the 'listTranslations' endpoint.
   *  The book ID is specified with its OSIS normative abbreviation.
   *  The chapter number must be a valid chapter within the book and translation.
   */
  ScriptureGateway.prototype.getChapterVerses = function(verseListOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !verseListOptions || !verseListOptions.translationId || verseListOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    if ( !verseListOptions || !verseListOptions.bookId || verseListOptions.bookId === '' ) {
      _lastProblem = 'A book identifier must be provided.';
      return false;
    }

    if ( !verseListOptions || !verseListOptions.chapterNumber || verseListOptions.chapterNumber === '' ) {
      _lastProblem = 'A chapter number must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'chapters/' + verseListOptions.translationId + ':' + verseListOptions.bookId + '.' + verseListOptions.chapterNumber + '/verses.json';
    if ( verseListOptions.startVerse || verseListOptions.endVerse ) {
      requestUrl = requestUrl + '?';
    }
    if ( verseListOptions.startVerse && verseListOptions.startVerse !== '' ) {
      requestUrl = requestUrl + 'startVerse=' + verseListOptions.startVerse + '&';
    }
    if ( verseListOptions.endVerse && verseListOptions.endVerse !== '' ) {
      requestUrl = requestUrl + 'endVerse=' + verseListOptions.endVerse;
    }
    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- BIBLE VERSES ----------------------------
  /*
   *  https://scripture.dev/documentation/verses-api
   *  Verses are the smallest organizational unit within the Scripture text. Verses belong to chapters.
   *
   *  You can append several optional parameters to filter the verses returned. Only 'keyword' is required.
   *
   *  keyword: The word(s) you are searching for. This parameter is mandatory.
   *  precision: Can be "all" to return results containing all keywords, or "any" for results with any keyword.
   *  exclude: Any keywords that should not appear in the search results.
   *  spelling: Can be "yes" to search for keywords similar to your terms if no direct results are found.
   *  translation: Can be one or several translation "id" values.
   *  language: Can be one or several translation "language" values.
   *  scriptureDivision: Can be one or several book "scriptureDivision" values (e.g., Old Testament, New Testament).
   *  book: Can be one or several book "abbreviation" values.
   *  sortOrder: Can be either "canonical" (Bible order) or "relevance".
   *  offset: An integer to request records starting after this number of records.
   *          For example, an offset of 1000 will start with the 1001st record.
   *  limit: An integer to request a maximum number of records. If provided, limit must be <= 500.
   */
  ScriptureGateway.prototype.searchVersesByKeyword = function(keywordSearchOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !keywordSearchOptions || !keywordSearchOptions.keyword || keywordSearchOptions.keyword === '' ) {
      _lastProblem = 'A keyword must be supplied.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'verses.json?';
    for ( let optionKey in keywordSearchOptions ) {
      requestUrl = requestUrl + optionKey + '=' + keywordSearchOptions[optionKey] + '&';
    }
    requestUrl = requestUrl.substring(0, requestUrl.length - 1); // Remove trailing '&'
    return this.fetchJson(requestUrl, responseCallback);
  };

  /*
   *  Retrieves the specific verse resource with the given translation, book, chapter number, and verse number.
   *  Available translation IDs can be listed with the 'listTranslations' endpoint.
   *  The book ID is specified with its OSIS normative abbreviation.
   *  The chapter number must be a valid chapter in the book and translation.
   *  The verse number must be a valid verse in the chapter and translation.
   */
  ScriptureGateway.prototype.getVerseByReference = function(verseRefOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !verseRefOptions || !verseRefOptions.translationId || verseRefOptions.translationId === '' ) {
      _lastProblem = 'A translation identifier must be provided.';
      return false;
    }

    if ( !verseRefOptions || !verseRefOptions.bookId || verseRefOptions.bookId === '' ) {
      _lastProblem = 'A book identifier must be provided.';
      return false;
    }

    if ( !verseRefOptions || !verseRefOptions.chapterNumber || verseRefOptions.chapterNumber === '' ) {
      _lastProblem = 'A chapter number must be provided.';
      return false;
    }

    if ( !verseRefOptions || !verseRefOptions.verseNumber || verseRefOptions.verseNumber === '' ) {
      _lastProblem = 'A verse number must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'verses/' + verseRefOptions.translationId + ':' + verseRefOptions.bookId + '.' + verseRefOptions.chapterNumber + '.' + verseRefOptions.verseNumber + '.json';
    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- SCRIPTURE PASSAGES ----------------------
  /*
   *  https://scripture.dev/documentation/passages-api
   *  Returns a structured response containing a collection of references to passages specified by
   *  the 'references[]' query string parameter. One or more Bible translations may be specified
   *  by the 'translation' parameter. Misspelled book names or abbreviations will be corrected if possible.
   *
   *  Multiple passage specifiers can be included in a comma-separated list.
   *  Examples: 'John+3', 'John+3-5', 'John+3:12', 'John+3:12-15', 'John+3,Luke+2'.
   *
   *  The available translation IDs can be listed with the 'listTranslations' endpoint.
   *  Multiple translation IDs can be included in a comma-separated list.
   *  Examples: 'NKJV', 'ESV,NIV'.
   *
   *  It's important to note that the response only contains references to the passage(s) and
   *  a preview of the first three verses of each passage. To fetch the full Bible text of
   *  each passage, you will need to use the verse API.
   */
  ScriptureGateway.prototype.getPassages = function(passageOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !passageOptions || !passageOptions.references || passageOptions.references === '' ) {
      _lastProblem = 'Passage references must be supplied.';
      return false;
    }

    let requestUrl = _serviceEndpoint;
    if ( passageOptions.translation && passageOptions.translation !== '' ) {
      requestUrl = requestUrl + passageOptions.translation + '/';
    }
    requestUrl = requestUrl + 'passages.json?references[]=' + passageOptions.references;
    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- BOOK COLLECTIONS ------------------------
  /*
   *  https://scripture.dev/documentation/collections-api
   *  By convention, books of the Bible are often organized into groups, such as the Pentateuch or Gospels.
   *  Which books belong in a grouping can vary for different translations of the Bible, and may contain
   *  a different sequence than appears in a complete book list. Book collections have many books.
   */
  ScriptureGateway.prototype.getBookCollections = function(collectionOptions, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    let requestUrl = _serviceEndpoint + 'bookcollections';
    if ( collectionOptions && collectionOptions.groupId && collectionOptions.groupId !== '' ) {
      requestUrl = requestUrl + '/' + collectionOptions.groupId;
    }
    requestUrl = requestUrl + '.json';
    return this.fetchJson(requestUrl, responseCallback);
  };

  // ------------------------- NAVIGATION ------------------------------
  /*
   *  Occasionally, you might need to make a follow-up JSON call using a specific URL path
   *  provided in a prior API response.
   */
  ScriptureGateway.prototype.navigateToPath = function(resourcePath, responseCallback) {
    if ( _accessKey === '' ) {
      _lastProblem = 'Access Key must be provided.';
      return false;
    }

    if ( !resourcePath || resourcePath === '' ) {
      _lastProblem = 'No resource path specified';
      return false;
    }

    if ( resourcePath.substr(0, 1) === '/' ) {
      resourcePath = resourcePath.substr(1);
    }
    let requestUrl = _serviceEndpoint + resourcePath;
    return this.fetchJson(requestUrl, responseCallback);
  };

  /*
   *  Note: The following utility functions are internal to the API client.
   */

  // ------------------------- HELPER FUNCTIONS ------------------------
  ScriptureGateway.prototype.isNetworkAvailable = function() {
    // In a Cordova environment, check if connection information is available and indicates online status.
    if ( navigator.connection && ( navigator.connection.type === 'unknown' || navigator.connection.type === 'none' ) ) {
      if ( _enableTracing ) {
        console.log('ScriptureGateway - Network offline');
      }
      return false;
    } else {
      if ( _enableTracing ) {
        console.log('ScriptureGateway - Network online');
      }
      return true;
    }
  };

  // ------------------------- REQUEST TIMEOUT -------------------------
  ScriptureGateway.prototype.handleRequestTimeout = function() {
    console.log('ScriptureGateway request timed out');
  };

  // ------------------------- JSON DATA FETCH -------------------------
  ScriptureGateway.prototype.fetchJson = function(requestUrl, successCallback, timeoutHandler) {
    if ( _enableTracing ) {
      console.log('ScriptureGateway fetchJson - URL: ' + requestUrl);
    }

    successCallback = successCallback || function() {};

    if ( !this.isNetworkAvailable() ) {
      if ( _enableTracing ) {
        console.log('ScriptureGateway fetchJson failed. No network connection.');
      }
      _lastProblem = 'Network connection is unavailable.';
      return false;
    }

    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if ( _enableTracing ) {
        console.log('ScriptureGateway ready state: ' + httpRequest.readyState);
      }
      if ( _enableTracing && httpRequest.readyState === 4 ) {
        console.log('ScriptureGateway HTTP status: ' + httpRequest.status);
      }
      if ( httpRequest.readyState === 4 && httpRequest.status === 200 ) {
        if ( _enableTracing ) {
          console.log('ScriptureGateway response text: ' + httpRequest.responseText);
        }
        let parsedObject = window.plugins.scriptureGateway.parseJsonResponse(httpRequest.responseText + '');

        // FUMS - Fair Use Management System. Refer to https://scripture.dev/pages/api/documentation/fums
        window.plugins.scriptureGateway.setUsageMetricsScript(parsedObject.data.metadata.usage_script_include);
        window.plugins.scriptureGateway.injectUsageMetrics(parsedObject.data.metadata.usage_script);

        successCallback(parsedObject);
      }
    };

    // This ensures browser and iOS compatibility when the API issues a 302 redirect.
    requestUrl = requestUrl.replace('//', '//' + _accessKey + ':x@');
    httpRequest.open('GET', requestUrl, _isAsyncMode);
    // For Android compatibility, handle credentials slightly differently.
    if ( navigator.userAgent.match(/Android/) ) {
      httpRequest.setRequestHeader('Authorization', 'Basic ' + btoa(_accessKey + ':x'));
    }
    httpRequest.timeout = 15000; // Increased timeout for potentially slower networks
    httpRequest.ontimeout = timeoutHandler ? timeoutHandler : this.handleRequestTimeout;
    httpRequest.send(null);

    return true;
  };

  ScriptureGateway.prototype.parseJsonResponse = function(jsonString) {
    if ( !jsonString || typeof jsonString !== 'string' ) {
      return null;
    }

    // Adapted from jQuery 1.8.2 for robust JSON parsing.
    let trimRegex = new RegExp('^[\\x20\\t\\r\\n\\f]+|((?:^|[^\\\\])(?:\\\\.)*)[\\x20\\t\\r\\n\\f]+$', 'g');
    jsonString = (jsonString + '').replace(trimRegex, '');

    // Attempt to parse JSON string
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        if (_enableTracing) {
            console.error('ScriptureGateway - Failed to parse JSON response:', e);
        }
        _lastProblem = 'Invalid JSON response from server.';
        return null;
    }
  };

})();