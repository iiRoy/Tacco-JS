/*! CommunicationFramework.js build:0.9.3, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

/**
 * comm-link core
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (targetExports, runtimeEnv) {

  /**
   * Main communication namespace.
   *
   * @namespace
   */

  var commLink = targetExports;

  /**
   * Current protocol version for the communication layer.
   *
   * @api public
   */

  commLink.protocolVersion = '0.9.3';

  /**
   * Implemented communication standard.
   *
   * @api public
   */

  commLink.commStandard = 1;

  /**
   * Supported connection channels. This array will be filled dynamically.
   *
   * @api public
   */

  commLink.connectionChannels = [];

  /**
   * Internal registry for JSONP callback functions.
   *
   * @api private
   */

  commLink.jsonpCallbacks = [];

  /**
   * Collection of currently active communication sessions.
   *
   * @api private
   */
  commLink.activeSessions = {};


  /**
   * Establishes a new connection to a remote host.
   *
   * @param {String} endpointAddress The full URI of the target host.
   * @Param {Object} configOptions Configuration options for the connection.
   * @api public
   */

  commLink.establishConnection = function (endpointAddress, configOptions) {
    console.log('Attempting to establish connection to: ' + endpointAddress);

    var parsedLocation = commLink.toolkit.dissectURI(endpointAddress);
    var connectionSettings = {};
    var sessionInstance;
    var uniqueSessionKey;

    if (runtimeEnv && runtimeEnv.currentLocation) {
      if (!parsedLocation.protocol) {
        parsedLocation.protocol = runtimeEnv.currentLocation.protocol.slice(0, -1);
      }

      if (!parsedLocation.host) {
        parsedLocation.host = (runtimeEnv.domHandle ? runtimeEnv.domHandle.domain : runtimeEnv.currentLocation.hostname);
      }

      if (!parsedLocation.port) {
        parsedLocation.port = runtimeEnv.currentLocation.port;
      }
    }

    uniqueSessionKey = commLink.toolkit.generateUniqueId(parsedLocation);

    connectionSettings.host = parsedLocation.host;
    connectionSettings.isSecure = (parsedLocation.protocol === 'https');
    connectionSettings.port = parsedLocation.port || (connectionSettings.isSecure ? 443 : 80);
    connectionSettings.query = parsedLocation.query || '';

    // Merge provided options into default settings
    commLink.toolkit.deepMergeObjects(connectionSettings, configOptions);

    var forceNew = connectionSettings['enforceNewSession'];
    var existingSession = commLink.activeSessions[uniqueSessionKey];

    if (forceNew || !existingSession) {
      sessionInstance = new commLink.Session(connectionSettings);
      if (!forceNew) { // Only cache if not explicitly forced to be new and discardable
        commLink.activeSessions[uniqueSessionKey] = sessionInstance;
      }
    } else {
        sessionInstance = existingSession; // Reuse existing if available and not forced new
    }

    // Ensure sessionInstance is always assigned, even if it was just retrieved from cache
    sessionInstance = sessionInstance || commLink.activeSessions[uniqueSessionKey];

    // Return a scoped session for the given path, if it's not the root.
    var sessionPath = parsedLocation.path;
    return sessionInstance.forPath(sessionPath.length > 1 ? sessionPath : '');
  };

})('object' === typeof module ? module.exports : (this.commLink = {}), this);
/**
 * comm-link core
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (targetExports, runtimeEnv) {

  /**
   * Collection of utility functions.
   *
   * @namespace
   */

  var toolkit = targetExports.toolkit = {};

  /**
   * Dissects a URI string into its constituent parts.
   * This implementation is based on work by Steven Levithan (MIT license).
   *
   * @author Steven Levithan <stevenlevithan.com>
   * @api public
   */

  var uriRegexPattern = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var uriComponents = ['completeSource', 'scheme', 'authority', 'userInfo', 'userIdentifier', 'passcode',
               'serverHost', 'serverPort', 'relativePart', 'resourcePath', 'directoryPath', 'fileName', 'queryParams',
               'urlAnchor'];

  toolkit.dissectURI = function (inputString) {
    if (typeof inputString !== 'string') {
      inputString = ''; // Ensure it's a string for regex matching
    }
    var matchResult = uriRegexPattern.exec(inputString);
    var dissectedURI = {};
    var idxCounter = uriComponents.length; // Start from end, as array is 0-indexed

    while (idxCounter--) {
      dissectedURI[uriComponents[idxCounter]] = matchResult[idxCounter] || '';
    }

    return dissectedURI;
  };

  /**
   * Generates a unique identifier string for a given URI object.
   * This ID is used to manage persistent connections.
   *
   * @param {Object} uriObj The parsed URI object.
   * @returns {String} A unique URI string.
   * @api public
   */

  toolkit.generateUniqueId = function (uriObj) {
    var scheme = uriObj.scheme;
    var serverHost = uriObj.serverHost;
    var serverPort = uriObj.serverPort;

    if (runtimeEnv && 'domHandle' in runtimeEnv && runtimeEnv.domHandle) { // Check for document presence
      serverHost = serverHost || runtimeEnv.domHandle.domain;
      if (!serverPort) {
        serverPort = (scheme === 'https' && runtimeEnv.domHandle.location.protocol !== 'https:') ? 443 : runtimeEnv.domHandle.location.port;
      }
    } else {
      serverHost = serverHost || 'localhost'; // Default for non-browser environments
      if (!serverPort && scheme === 'https') {
        serverPort = 443;
      }
    }

    var finalScheme = scheme || 'http';
    var finalPort = serverPort || 80;

    return finalScheme + '://' + serverHost + ':' + finalPort;
  };

  /**
   * Combines two query strings into a single, merged query string.
   * Handles duplicate parameters by overwriting with the second string's values.
   *
   * @param {String} primaryQuery The base query string.
   * @param {String} extraParams Additional query parameters.
   * @returns {String} The combined query string, prefixed with '?'.
   * @api public
   */

  toolkit.combineQueries = function (primaryQuery, extraParams) {
    var mergedQueryObject = toolkit.parseQueryString(primaryQuery || '');
    var paramList = [];

    // Merge the additional parameters, overwriting existing ones.
    toolkit.deepMergeObjects(mergedQueryObject, toolkit.parseQueryString(extraParams || ''));

    for (var keyName in mergedQueryObject) {
      if (Object.prototype.hasOwnProperty.call(mergedQueryObject, keyName)) {
        paramList.push(keyName + '=' + mergedQueryObject[keyName]);
      }
    }

    return paramList.length > 0 ? '?' + paramList.join('&') : '';
  };

  /**
   * Converts a URL query string into a key-value object.
   *
   * @param {String} queryString The query string to parse.
   * @returns {Object} An object representing the query parameters.
   * @api public
   */

  toolkit.parseQueryString = function (queryString) {
    var queryResult = {};
    var keyValuePairs = queryString.split('&');
    var len = keyValuePairs.length;
    var currentPair;

    for (var i = 0; i < len; ++i) {
      currentPair = keyValuePairs[i].split('=');
      if (currentPair[0]) {
        queryResult[currentPair[0]] = currentPair[1] || ''; // Assign empty string if value is missing
      }
    }

    return queryResult;
  };

  /**
   * Executes the given callback function when the page's DOM is fully loaded.
   *
   *     commLink.toolkit.onDocumentReady(function () { console.log('DOM ready!'); });
   *
   * @param {Function} callbackFn The function to execute.
   * @api public
   */

  var isPageFullyLoaded = false;

  toolkit.onDocumentReady = function (callbackFn) {
    if (runtimeEnv && runtimeEnv.domHandle && runtimeEnv.domHandle.readyState === 'complete' || isPageFullyLoaded) {
      callbackFn();
      return;
    }
    toolkit.attachEventHandler(runtimeEnv, 'load', callbackFn, false);
  };

  /**
   * Attaches an event handler to a specified element.
   * Uses appropriate method for browser compatibility.
   *
   * @api private
   */

  toolkit.attachEventHandler = function (targetElement, eventName, handlerFunction, useCapture) {
    if (targetElement.attachEvent) {
      targetElement.attachEvent('on' + eventName, handlerFunction);
    } else if (targetElement.addEventListener) {
      targetElement.addEventListener(eventName, handlerFunction, useCapture);
    }
  };

  /**
   * Generates the appropriate XMLHttpRequest object, supporting cross-domain requests.
   *
   * @param {Boolean} [crossDomainRequest] Flag to indicate if a cross-domain request is needed.
   * @returns {XMLHttpRequest|null} An XHR object or null if none can be created.
   * @api private
   */

  toolkit.createXHR = function (crossDomainRequest) {
    // Attempt to use XDomainRequest for IE cross-domain requests
    if (crossDomainRequest && typeof runtimeEnv.CrossOriginRequestObject !== 'undefined') {
      try {
        return new runtimeEnv.CrossOriginRequestObject();
      } catch (e) {
        console.warn('XDomainRequest creation failed: ', e);
        // Fall through to standard XHR if XDR fails
      }
    }

    // Use standard XMLHttpRequest if available and CORS is supported for cross-domain
    if (typeof runtimeEnv.XMLHttpRequest !== 'undefined' && (!crossDomainRequest || toolkit.browserInfo.supportsCORS)) {
      return new runtimeEnv.XMLHttpRequest();
    }

    // Fallback for older IE for same-domain requests
    if (!crossDomainRequest) {
      try {
        return new runtimeEnv[(['Active'].concat('XObject').join(''))]('Microsoft.XMLHTTP');
      } catch(e) {
        console.warn('ActiveXObject creation failed: ', e);
      }
    }

    return null; // No suitable XHR object could be created
  };

  /**
   * Placeholder for XHR based transport constructor.
   * (Original comment, kept for clone integrity, actual constructor is elsewhere)
   *
   * @constructor
   * @api public
   */

  /**
   * Updates the internal page loaded state.
   */

  if (typeof runtimeEnv !== 'undefined') {
    toolkit.onDocumentReady(function () {
      isPageFullyLoaded = true;
      console.info('DOM content fully loaded.');
    });
  }

  /**
   * Defers a function's execution to prevent browser UI blocking (e.g., spinner).
   *
   * @param {Function} handlerToDelay The function to execute after a delay.
   * @api public
   */

  toolkit.delayExecution = function (handlerToDelay) {
    if (!toolkit.browserInfo.isWebKit || typeof runtimeEnv.isWebWorkerEnv !== 'undefined') {
      return handlerToDelay(); // Execute immediately if not WebKit or in a Web Worker
    }

    toolkit.onDocumentReady(function () {
      // Use setTimeout to yield execution and allow browser to update UI
      setTimeout(handlerToDelay, 100);
    });
  };

  /**
   * Recursively merges properties from a secondary object into a primary object.
   *
   * @param {Object} primaryObj The target object to merge into.
   * @param {Object} secondaryObj The source object to merge from.
   * @param {Number} [recursionDepth=2] How deep to merge recursively.
   * @param {Array} [visitedProps] Internal array to prevent circular references.
   * @returns {Object} The modified primaryObj.
   * @api public
   */

  toolkit.deepMergeObjects = function mergeObjects (primaryObj, secondaryObj, recursionDepth, visitedProps) {
    var processedProperties = visitedProps || [];
    var currentDepth = typeof recursionDepth === 'undefined' ? 2 : recursionDepth;
    var propertyName;

    for (propertyName in secondaryObj) {
      // Ensure it's an own property and not already processed in this merge path
      if (Object.prototype.hasOwnProperty.call(secondaryObj, propertyName) && toolkit.findInArray(processedProperties, propertyName) === -1) {
        var sourceValue = secondaryObj[propertyName];
        var targetValue = primaryObj[propertyName];

        if (typeof targetValue !== 'object' || targetValue === null || !currentDepth) {
          primaryObj[propertyName] = sourceValue; // Direct assignment if not object or depth limit reached
        } else {
          // Recursive merge for nested objects
          toolkit.deepMergeObjects(targetValue, sourceValue, currentDepth - 1, processedProperties);
        }
        processedProperties.push(propertyName); // Mark property as processed for current merge
      }
    }

    return primaryObj;
  };

  /**
   * Copies prototype methods from a source constructor to a destination constructor.
   *
   * @api public
   */

  toolkit.applyPrototypeMixins = function (destinationCtor, sourceCtor) {
    toolkit.deepMergeObjects(destinationCtor.prototype, sourceCtor.prototype);
  };

  /**
   * Establishes classical inheritance between two constructors.
   *
   * @api private
   */

  toolkit.establishInheritance = function (childCtor, parentCtor) {
    function TempPrototype() {}
    TempPrototype.prototype = parentCtor.prototype;
    childCtor.prototype = new TempPrototype();
    childCtor.prototype.constructor = childCtor; // Correct the constructor reference
  };

  /**
   * Determines if the given object is an Array.
   *
   *     commLink.toolkit.isAnArray([]); // true
   *     commLink.toolkit.isAnArray({}); // false
   *
   * @param {Object} testObject The object to check.
   * @returns {boolean} True if the object is an array, false otherwise.
   * @api public
   */

  toolkit.isAnArray = Array.isArray || function (testObject) {
    return Object.prototype.toString.call(testObject) === '[object Array]';
  };

  /**
   * Finds common elements between two arrays and returns them in a new array.
   *
   * @param {Array} arrayOne The first array.
   * @param {Array} arrayTwo The second array.
   * @returns {Array} A new array containing only the intersecting elements.
   * @api public
   */

  toolkit.findCommonElements = function (arrayOne, arrayTwo) {
    var commonItems = [];
    var longerArrayRef;
    var shorterArrayRef;

    // Determine which array is shorter for optimization
    if (arrayOne.length > arrayTwo.length) {
      longerArrayRef = arrayOne;
      shorterArrayRef = arrayTwo;
    } else {
      longerArrayRef = arrayTwo;
      shorterArrayRef = arrayOne;
    }

    var limit = shorterArrayRef.length;
    for (var i = 0; i < limit; i++) {
      if (toolkit.findInArray(longerArrayRef, shorterArrayRef[i]) !== -1) {
        commonItems.push(shorterArrayRef[i]);
      }
    }

    return commonItems;
  };

  /**
   * Array indexOf compatibility method.
   * Searches for an element within an array.
   *
   * @see bit.ly/a5Dxa2 (Original link for reference)
   * @param {Array} targetArray The array to search within.
   * @param {any} searchElement The element to find.
   * @param {Number} [startIndex=0] The index at which to start the search.
   * @returns {Number} The index of the element, or -1 if not found.
   * @api public
   */

  toolkit.findInArray = function (targetArray, searchElement, startIndex) {
    var currentIdx = startIndex || 0;
    var arrayLength = targetArray.length;

    if (currentIdx < 0) {
      currentIdx = Math.max(0, arrayLength + currentIdx);
    }

    while (currentIdx < arrayLength) {
      if (targetArray[currentIdx] === searchElement) {
        return currentIdx;
      }
      currentIdx++;
    }

    return -1;
  };

  /**
   * Converts an enumerable collection (like arguments or NodeList) into a true Array.
   *
   * @param {Object} enumerableCollection The collection to convert.
   * @returns {Array} A new array containing the elements.
   * @api public
   */

  toolkit.convertCollectionToArray = function (enumerableCollection) {
    var resultArray = [];
    var collectionLength = enumerableCollection.length;

    for (var i = 0; i < collectionLength; i++) {
      resultArray.push(enumerableCollection[i]);
    }

    return resultArray;
  };

  /**
   * User Agent / Browser environment detection utilities.
   *
   * @namespace
   */

  toolkit.browserInfo = {};

  /**
   * Checks if the current User Agent supports CORS for XMLHttpRequest.
   *
   * @api public
   */

  toolkit.browserInfo.supportsCORS = (function () {
    if (typeof runtimeEnv.XMLHttpRequest === 'undefined') {
      return false;
    }
    try {
      var tempXHR = new runtimeEnv.XMLHttpRequest();
      return typeof tempXHR.withCredentials !== 'undefined';
    } catch (e) {
      console.warn('CORS detection failed due to XHR creation error:', e);
      return false;
    }
  })();

  /**
   * Detects if the current browser's rendering engine is WebKit.
   *
   * @api public
   */

  toolkit.browserInfo.isWebKit = typeof runtimeEnv.browserNavigator !== 'undefined'
    && /webkit/i.test(runtimeEnv.browserNavigator.userAgent);

})('undefined' != typeof commLink ? commLink : module.exports, this);

/**
 * comm-link core
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (targetExports, commLink) {

  /**
   * Export the EventDispatcher constructor.
   */

  targetExports.EventDispatcher = EventDispatcher;

  /**
   * Constructor for a simple event dispatcher.
   * Allows objects to emit and listen for custom events.
   *
   * @api public.
   */

  function EventDispatcher () {
    // Initialize event handlers store if not present
    this._eventHandlers = this._eventHandlers || {};
  };

  /**
   * Registers a new event handler function for a specified event name.
   *
   * @param {String} eventName The name of the event to listen for.
   * @param {Function} handlerFunction The function to call when the event is triggered.
   * @returns {EventDispatcher} Returns `this` for chaining.
   * @api public
   */

  EventDispatcher.prototype.registerHandler = function (eventName, handlerFunction) {
    if (!eventName || typeof handlerFunction !== 'function') {
      console.warn('Invalid event name or handler function provided for registration.');
      return this;
    }

    // Ensure the event handlers object exists
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }

    var currentHandlers = this._eventHandlers[eventName];

    if (!currentHandlers) {
      // No handlers yet for this event, assign directly
      this._eventHandlers[eventName] = handlerFunction;
    } else if (commLink.toolkit.isAnArray(currentHandlers)) {
      // Already an array of handlers, push new one
      currentHandlers.push(handlerFunction);
    } else {
      // A single handler exists, convert to array and add new one
      this._eventHandlers[eventName] = [currentHandlers, handlerFunction];
    }

    return this;
  };