var BaseConstructor = function (SuperClass, initializerFunc) {
  // If the initializer function is not provided, assume the first argument is the initializer
  // and the parent class is a default empty function.
  if (initializerFunc === null || initializerFunc === undefined) {
    initializerFunc = SuperClass;
    SuperClass = function () {}; // Default to an empty parent constructor
  }

  // Define the derived class constructor
  var DerivedClass = function (contextArg) {
    // If an 'init' method exists on the instance and the context is not the BaseConstructor itself,
    // invoke the 'init' method with the current instance's context and arguments.
    if (this.init && contextArg !== BaseConstructor) {
      this.init.apply(this, arguments);
    }
  };

  // Create an instance of the parent class for the prototype chain.
  // The 'BaseConstructor' argument is passed to the parent to signal internal use.
  var prototypeInstance = new SuperClass(BaseConstructor);

  // Set the prototype of the DerivedClass to the prototypeInstance,
  // effectively inheriting from SuperClass.
  DerivedClass.prototype = prototypeInstance;

  // Ensure the constructor property points back to DerivedClass.
  DerivedClass.prototype.constructor = DerivedClass;

  // Call the initializer function with the DerivedClass's prototype as 'this' context,
  // and pass the SuperClass's prototype as the first argument to the initializer.
  initializerFunc.call(DerivedClass.prototype, SuperClass.prototype);

  // Return the newly created derived constructor.
  return DerivedClass;
};

// Internal utility to check if an object has its own property (similar to Object.prototype.hasOwnProperty)
var _objectHasOwn = {}.hasOwnProperty;

// Internal utility to find the index of an item in an array (polyfills Array.prototype.indexOf)
var _arrayFindIndex = Array.prototype.indexOf ?
  function (arr, item) {
    return arr.indexOf(item);
  } :
  function (arr, item) {
    for (var k = 0, len = arr.length; k < len; k++) {
      if (_objectHasOwn.call(arr, k) && arr[k] === item) return k;
    }
    return -1;
  };

// Helper to ensure Knockout and jQuery utilities are available
var _ensureKoUtils = function () {
  if (typeof ko === 'undefined' || typeof ko.utils === 'undefined') {
    throw new Error("Knockout.js utilities (ko.utils) are not available.");
  }
  if (typeof $ === 'undefined' || typeof $.grep === 'undefined' || typeof $.extend === 'undefined') {
    throw new Error("jQuery ($.grep, $.extend) is not available.");
  }
};

// Redefine Knockout's IdentityMap for caching purposes
if (typeof ko !== 'undefined' && typeof ko.utils !== 'undefined') {
  ko.utils.CacheRegistry = function () {
    // A simple method to locate a cached entry based on an identifier and criteria.
    this.locateEntry = function (keyIdentifier, criteria) {
      var _this = this; // Capture 'this' for the filter callback
      // Use native filter for better performance, if available, or jQuery's grep.
      var matchingEntries = Array.prototype.filter ?
        Array.prototype.filter.call(this, function (entry) {
          return entry.id === keyIdentifier && ko.utils.stringifyJson(entry.params) === ko.utils.stringifyJson(criteria);
        }) :
        $.grep(this, function (entry) {
          return entry.id === keyIdentifier && ko.utils.stringifyJson(entry.params) === ko.utils.stringifyJson(criteria);
        });
      return matchingEntries[0]; // Return the first found entry or undefined
    };
    // Return the instance itself for chaining or direct use.
    return this;
  };

  // Inherit from Array.prototype to allow push/pop/length etc.
  ko.utils.CacheRegistry.prototype = Object.create(Array.prototype);
  ko.utils.CacheRegistry.prototype.constructor = ko.utils.CacheRegistry;

  // Utility to decode HTML entities in a string
  ko.utils.decodeHtmlEntities = function (encodedString) {
    // If the input is not a string or is empty, return it as is.
    if (typeof encodedString !== 'string' || encodedString.length === 0) {
      return encodedString;
    }

    // Create a temporary DOM element to leverage browser's HTML parsing.
    var domContainer = document.createElement("div");
    domContainer.innerHTML = encodedString;

    // Extract the text content.
    // Ensure there's a child node and it's a text node.
    var decodedContent = domContainer.firstChild && domContainer.firstChild.nodeValue ? domContainer.firstChild.nodeValue : encodedString;

    // Clean up the temporary DOM element.
    if (domContainer.firstChild) {
      domContainer.removeChild(domContainer.firstChild);
    }
    return decodedContent;
  };
}


var DataEntity = BaseConstructor(function () {
  // Private closure-scoped variables for the DataEntity instances
  var _routeMap = {}; // Stores URL endpoints
  var _initialValues = {}; // Stores default values for properties
  var _volatileProps = []; // Properties to ignore during serialization (transient)
  var _postActionHooks = {}; // Callbacks to execute after certain requests
  var _dataCache = (typeof ko !== 'undefined' && ko.utils && ko.utils.CacheRegistry) ? new ko.utils.CacheRegistry() : []; // Cache for GET requests
  var _lastSnapshot = {}; // Stores a backup of the entity's state

  // Helper function to check if a value is a primitive type (for equality comparison)
  var _isPrimitiveType = function (value) {
    var primitiveIndicators = {
      'undefined': true,
      'boolean': true,
      'number': true,
      'string': true
    };
    return (value === null) || primitiveIndicators[typeof value] === true;
  };

  // Custom equality comparer for Knockout observables (used during transactions)
  var _primitiveValueComparer = function (valA, valB) {
    // Only compare if both values are primitive or null.
    // For non-primitive objects, always return false to trigger updates.
    if (_isPrimitiveType(valA) && _isPrimitiveType(valB)) {
      return valA === valB;
    }
    return false; // Objects are never considered equal by this comparer
  };

  // Helper to detect if a string contains HTML entities
  var _containsHtmlEntities = function (value) {
    return typeof value === "string" && value.match(/&[^\s]*;/) !== null;
  };

  // Helper to resolve the full URL for an endpoint
  var _resolveEndpointUrl = function (instanceContext, endpointKey, requestPayload) {
    var resolvedUrl;
    // Check if the endpointKey is already a full URL
    if (endpointKey.match(/^https?:\/\//) !== null) {
      resolvedUrl = endpointKey;
    } else {
      resolvedUrl = instanceContext._routeMap[endpointKey];
    }
    // Process URL path parameters
    return _processUrlPaths(resolvedUrl, requestPayload);
  };

  // Helper to process URL path parameters (e.g., /api/items/:id)
  var _processUrlPaths = function (rawUrl, pathParams) {
    if (!document) {
      console.warn("Document object not available, URL path processing might be limited.");
      return rawUrl;
    }
    var urlParserElement = document.createElement("a");
    urlParserElement.href = rawUrl;
    urlParserElement.pathname = urlParserElement.pathname.replace(/:([a-zA-Z0-9_]+)/g, function (match) {
      var attributeName = match.substring(1);
      var paramValue = pathParams[attributeName];
      // Remove the parameter from the payload as it's part of the URL path
      delete pathParams[attributeName];
      return paramValue || ''; // Return value or empty string if not found
    });
    var processedUrl = urlParserElement.href;
    urlParserElement = null; // Clean up
    return processedUrl;
  };

  // Helper to extract request parameters and callback from arguments
  var _extractRequestArguments = function (args) {
    var requestOptions = {};
    var requestCallback = null;

    if (args.length > 0) {
      var firstArg = args[0];
      var secondArg = args[1];

      if (typeof firstArg === "function") {
        requestCallback = firstArg;
      } else if (typeof firstArg === "object" && firstArg !== null) {
        requestOptions = $.extend({}, firstArg); // Clone to avoid modifying original
        if (typeof secondArg === "function") {
          requestCallback = secondArg;
        }
      }
    }
    return [requestOptions, requestCallback];
  };

  // Helper for handling validation errors
  var _handleValidationError = function (callback) {
    if (typeof callback === "function") {
      callback({
        status: "ERROR",
        message: "Invalid object state detected during validation."
      });
    }
  };

  // --- Internal AJAX request handlers ---

  var _sendPostRequest = function (instanceContext, endpointKey, requestPayload, completionHandler, dataType) {
    // Set default values if not provided
    requestPayload = requestPayload || {};
    completionHandler = completionHandler || null;
    dataType = dataType || "json";

    _ensureKoUtils(); // Ensure dependencies are met

    var targetUrl = _resolveEndpointUrl(instanceContext, endpointKey, requestPayload);
    var entityName = instanceContext.name || "unknownEntity";
    var postHooks = instanceContext._postActionHooks;

    // Add request to a global queue (RQ) if it exists
    if (typeof RQ !== 'undefined' && RQ.add) {
      return RQ.add($.post(targetUrl, requestPayload, function (responseData) {
        try {
          if (typeof postHooks[endpointKey] === "function") {
            postHooks[endpointKey](responseData);
          }
          if (typeof completionHandler === "function") {
            completionHandler(responseData);
          }
        } catch (error) {
          console.error("Error in post-request hook or callback for " + endpointKey + ":", error);
        }
      }, dataType), ("rq_" + entityName + "_") + new Date().getTime());
    } else {
      // Fallback if RQ is not available
      return $.post(targetUrl, requestPayload, function (responseData) {
        try {
          if (typeof postHooks[endpointKey] === "function") {
            postHooks[endpointKey](responseData);
          }
          if (typeof completionHandler === "function") {
            completionHandler(responseData);
          }
        } catch (error) {
          console.error("Error in post-request hook or callback (no RQ) for " + endpointKey + ":", error);
        }
      }, dataType);
    }
  };

  var _sendGetRequest = function (instanceContext, endpointKey, requestPayload, completionHandler, dataType) {
    // Set default values if not provided
    requestPayload = requestPayload || {};
    completionHandler = completionHandler || null;
    dataType = dataType || "json";

    _ensureKoUtils(); // Ensure dependencies are met

    var targetUrl = _resolveEndpointUrl(instanceContext, endpointKey, requestPayload);
    var entityName = instanceContext.name || "unknownEntity";
    var shouldCache = requestPayload["_cacheResponse"] === true;
    var cacheSystem = instanceContext._dataCache;
    var postHooks = instanceContext._postActionHooks;

    if (shouldCache) {
      delete requestPayload["_cacheResponse"]; // Remove internal cache flag
    }

    var cacheKey = "" + entityName + "#" + endpointKey;
    var cachedDataEntry;

    if (shouldCache) {
      cachedDataEntry = cacheSystem.locateEntry(cacheKey, requestPayload);
    }

    if (cachedDataEntry !== null && cachedDataEntry !== undefined) {
      if (typeof completionHandler === "function") {
        return completionHandler(cachedDataEntry.data);
      }
    } else {
      // Add cache-busting parameter for GET requests to ensure fresh data
      var actualRequestPayload = $.extend({}, requestPayload);
      actualRequestPayload["_no_cache_buster"] = new Date().getTime();

      if (typeof RQ !== 'undefined' && RQ.add) {
        return RQ.add($.get(targetUrl, actualRequestPayload, function (responseData) {
          if (shouldCache) {
            cacheSystem.push({
              id: cacheKey,
              params: requestPayload, // Use original params for cache key
              data: responseData
            });
          }
          try {
            if (typeof postHooks[endpointKey] === "function") {
              postHooks[endpointKey](responseData);
            }
            if (typeof completionHandler === "function") {
              completionHandler(responseData);
            }
          } catch (error) {
            console.error("Error in post-request hook or callback for " + endpointKey + ":", error);
          }
        }, dataType), ("rq_" + entityName + "_") + new Date().getTime());
      } else {
        // Fallback if RQ is not available
        return $.get(targetUrl, actualRequestPayload, function (responseData) {
          if (shouldCache) {
            cacheSystem.push({
              id: cacheKey,
              params: requestPayload,
              data: responseData
            });
          }
          try {
            if (typeof postHooks[endpointKey] === "function") {
              postHooks[endpointKey](responseData);
            }
            if (typeof completionHandler === "function") {
              completionHandler(responseData);
            }
          } catch (error) {
            console.error("Error in post-request hook or callback (no RQ) for " + endpointKey + ":", error);
          }
        }, dataType);
      }
    }
  };

  // --- Collection creation ---
  var _buildEntityCollection = function (modelConstructor, rawDataArray, itemProcessor) {
    var entityList = [];
    if (!Array.isArray(rawDataArray)) {
      console.warn("Expected an array for collection creation, received:", rawDataArray);
      return entityList;
    }
    for (var i = 0; i < rawDataArray.length; i++) {
      var rowData = rawDataArray[i];
      var newEntity = new modelConstructor();
      if (typeof itemProcessor === "function") {
        newEntity.assignValues(itemProcessor(rowData));
      } else {
        newEntity.assignValues(rowData);
      }
      entityList.push(newEntity);
    }
    return entityList;
  };

  // --- Instance Initialization ---
  this.init = function () {
    _ensureKoUtils(); // Ensure Knockout and jQuery are available

    // Initialize the instance's internal route map by copying the closure-scoped one.
    this._routeMap = _routeMap;

    // Loop through all properties of the instance to set up defaults and observable comparers.
    for (var propName in this) {
      if (_objectHasOwn.call(this, propName) && propName !== "_routeMap") {
        var propValue = this[propName];
        if (ko.isObservable(propValue)) {
          // Assign the custom equality comparer for observables to prevent unnecessary updates.
          propValue.equalityComparer = _primitiveValueComparer;
        }
        // Store the initial value of each property as a default.
        _initialValues[propName] = this.retrieveValue(propName);
      }
    }
  };

  // --- Public methods ---

  // Registers an API endpoint URL.
  this.registerEndpoint = function (endpointId, endpointUrl, isFixed) {
    isFixed = isFixed === undefined ? true : isFixed; // Default to true
    this._routeMap[endpointId] = endpointUrl;
    // Optionally, also store it in the closure-scoped map if it's considered static
    if (isFixed) {
      _routeMap[endpointId] = endpointUrl;
    }
  };

  // Retrieves the unwrapped value of a property.
  this.retrieveValue = function (propertyName) {
    _ensureKoUtils();
    return ko.utils.unwrapObservable(this[propertyName]);
  };

  // Assigns values to properties, handling observables and HTML unescaping.
  this.assignValues = function (valueMap) {
    _ensureKoUtils();
    var targetObject = this; // Use a consistent reference to 'this'

    for (var keyName in valueMap) {
      if (!_objectHasOwn.call(valueMap, keyName)) continue; // Ensure it's an own property

      var valueToSet = valueMap[keyName];
      var processedValue = valueToSet;

      // Unescape HTML entities if the value is a string containing them
      if (_containsHtmlEntities(valueToSet) && ko.utils.decodeHtmlEntities) {
        processedValue = ko.utils.decodeHtmlEntities(valueToSet);
      }

      if (ko.isWriteableObservable(targetObject[keyName])) {
        // If it's a writable observable, update its value.
        // Only update if the new value is different from the current unwrapped value.
        if (processedValue !== targetObject[keyName]()) {
          targetObject[keyName](processedValue);
        }
      } else if (targetObject[keyName] !== undefined && !ko.isObservable(targetObject[keyName])) {
        // If it's a plain property and not undefined, directly assign the value.
        // This check ensures we don't accidentally create new properties if not intended.
        targetObject[keyName] = processedValue;
      } else if (targetObject[keyName] === undefined) {
        // Allow setting new properties that weren't initially defined, but only if they don't conflict
        // with existing observable patterns (e.g., if we want to add a plain property).
        // This behavior can be refined based on strictness requirements.
        targetObject[keyName] = processedValue;
      }
    }
    return targetObject; // Return the modified instance for chaining
  };

  // Initiates an HTTP POST request.
  this.performPostRequest = function (endpointKey, requestPayload, completionHandler, dataType) {
    return _sendPostRequest(this, endpointKey, requestPayload, completionHandler, dataType);
  };

  // Initiates an HTTP GET request.
  this.performGetRequest = function (endpointKey, requestPayload, completionHandler, dataType) {
    return _sendGetRequest(this, endpointKey, requestPayload, completionHandler, dataType);
  };

  // Resets all properties to their initial default values.
  this.resetToDefaults = function () {
    return this.assignValues(_initialValues);
  };

  // Refreshes the entity's state by fetching it again from the server.
  this.reloadState = function (postLoadHandler) {
    var self = this; // Capture 'this' context for the callback
    return this.fetchRecord(function (response) {
      if (response && response.status === "SUCCESS") {
        self.assignValues(response);
      }
      if (typeof postLoadHandler === "function") {
        postLoadHandler(response);
      }
    });
  };

  // Serializes the entity's current state to a JSON string.
  this.serializeToJSON = function (exportOptions) {
    _ensureKoUtils();
    return ko.toJSON(this.createShallowCopy(exportOptions));
  };

  // Exports the entity's current state as a plain JavaScript object.
  this.exportPlainObject = function (exportOptions) {
    _ensureKoUtils();
    return ko.toJS(this.createShallowCopy(exportOptions));
  };

  // Creates a shallow copy of the entity's properties, respecting transient flags.
  this.createShallowCopy = function (exportOptions) {
    exportOptions = exportOptions || {};
    var copiedObject = {};

    // Define properties that should generally be ignored during serialization.
    var ignoredProperties = {
      '_routeMap': false,
      '_initialValues': false,
      '_volatileProps': false,
      '_postActionHooks': false,
      '_dataCache': false,
      '_lastSnapshot': false,
      'init': false, // Don't serialize the init function
      'constructor': false, // Don't serialize the constructor
      'name': false // Often internal
    };

    // Add user-defined volatile properties to the ignore list.
    _volatileProps.forEach(function (prop) {
      ignoredProperties[prop] = false;
    });

    // Merge custom export options, allowing users to override ignored properties.
    var finalExportOptions = $.extend({}, ignoredProperties, exportOptions);

    // Iterate over instance properties and copy them based on export options.
    for (var propKey in this) {
      if (_objectHasOwn.call(this, propKey)) {
        // Only copy if the property is explicitly allowed (true) or not explicitly ignored (undefined).
        if (finalExportOptions[propKey] === true || finalExportOptions[propKey] === undefined) {
          copiedObject[propKey] = this.retrieveValue(propKey);
        }
      }
    }
    return copiedObject;
  };

  // Creates a backup (snapshot) of the current entity state.
  this.snapshotState = function () {
    _lastSnapshot = this.exportPlainObject();
    return _lastSnapshot;
  };

  // Restores the entity's state from the last snapshot.
  this.revertToSnapshot = function () {
    if (Object.keys(_lastSnapshot).length > 0) {
      this.assignValues(_lastSnapshot);
      _lastSnapshot = {}; // Clear the snapshot after restoring
    } else {
      console.warn("No snapshot found to revert to.");
    }
    return this;
  };

  // Begins an update batch by temporarily disabling observable equality comparisons.
  this.beginUpdateBatch = function () {
    _ensureKoUtils();
    var self = this;
    Object.keys(this).forEach(function (propKey) {
      var propVal = self[propKey];
      if (ko.isObservable(propVal) && typeof propVal.equalityComparer === "function") {
        // Temporarily set equality comparer to always return true,
        // effectively forcing updates if value is set.
        propVal.equalityComparer = function () {
          return true;
        };
      }
    });
  };

  // Finalizes an update batch by re-enabling observable equality comparisons and notifying subscribers.
  this.finalizeUpdateBatch = function () {
    _ensureKoUtils();
    var self = this;
    Object.keys(this).forEach(function (propKey) {
      var propVal = self[propKey];
      if (ko.isObservable(propVal) && propVal.equalityComparer !== _primitiveValueComparer) {
        propVal.equalityComparer = _primitiveValueComparer; // Restore original comparer
        // Manually notify subscribers that the value might have changed
        if (typeof propVal.valueHasMutated === "function") {
          propVal.valueHasMutated();
        }
      }
    });
  };

  // Checks if the entity is considered "new" (i.e., has no ID).
  this.isTransientRecord = function () {
    var entityId = this.retrieveValue("id");
    return entityId === null || entityId === undefined || entityId === "";
  };

  // Placeholder for entity validation logic.
  this.isValidState = function () {
    // A simple validation example: check if 'name' property is not empty
    var nameValue = this.retrieveValue("name");
    if (typeof nameValue === 'string' && nameValue.trim() === '') {
      console.warn("Validation failed: 'name' cannot be empty.");
      return false;
    }
    // Add more complex validation rules here.
    return true; // Default to true if no specific rules are violated.
  };

  // Persists the entity (creates if new, updates if existing).
  this.persistRecord = function () {
    var args = Array.prototype.slice.call(arguments); // Convert arguments to array
    var requestArgs = _extractRequestArguments(args);
    var requestOptions = requestArgs[0];
    var completionCb = requestArgs[1];

    if (this.isValidState()) {
      if (this.isTransientRecord()) {
        return this.createRecord(requestOptions, completionCb);
      } else {
        return this.updateRecord(requestOptions, completionCb);
      }
    } else {
      _handleValidationError(completionCb);
    }
  };

  // Creates a new record on the server.
  this.createRecord = function () {
    var args = Array.prototype.slice.call(arguments);
    var requestArgs = _extractRequestArguments(args);
    var requestPayload = requestArgs[0];
    var completionCb = requestArgs[1];

    var fullPayload = $.extend({}, requestPayload, this.exportPlainObject());
    return this.performPostRequest("create", fullPayload, completionCb);
  };

  // Updates an existing record on the server.
  this.updateRecord = function () {
    var args = Array.prototype.slice.call(arguments);
    var requestArgs = _extractRequestArguments(args);
    var requestPayload = requestArgs[0];
    var completionCb = requestArgs[1];

    var fullPayload = $.extend({}, requestPayload, this.exportPlainObject());
    return this.performPostRequest("update", fullPayload, completionCb);
  };

  // Deletes a record from the server.
  this.deleteRecord = function () {
    var args = Array.prototype.slice.call(arguments);
    var requestArgs = _extractRequestArguments(args);
    var requestPayload = requestArgs[0];
    var completionCb = requestArgs[1];

    var fullPayload = $.extend({}, requestPayload, this.exportPlainObject());
    return this.performPostRequest("destroy", fullPayload, completionCb);
  };

  // Fetches a single record from the server.
  this.fetchRecord = function () {
    var args = Array.prototype.slice.call(arguments);
    var requestArgs = _extractRequestArguments(args);
    var requestPayload = requestArgs[0];
    var completionCb = requestArgs[1];

    // Ensure the 'id' parameter is included for fetching a specific record.
    var recordId = this.retrieveValue("id");
    if (recordId) {
      requestPayload = $.extend({}, requestPayload, {
        id: recordId
      });
    } else {
      console.warn("Attempted to fetch record without an 'id'.");
      if (typeof completionCb === 'function') {
        completionCb({
          status: "ERROR",
          message: "Cannot fetch record without an ID."
        });
      }
      return; // Exit if no ID
    }

    return this.performGetRequest("show", requestPayload, completionCb);
  };

  // Fetches a list of records from the server.
  this.listRecords = function () {
    var args = Array.prototype.slice.call(arguments);
    var requestArgs = _extractRequestArguments(args);
    var requestPayload = requestArgs[0];
    var completionCb = requestArgs[1];

    return this.performGetRequest("index", requestPayload, completionCb);
  };

  // Aborts all pending requests associated with this entity's name.
  var _abortPendingRequests = function (instanceContext) {
    if (typeof RQ !== 'undefined' && RQ.killByRegex && instanceContext.name) {
      // Use the instance's name to generate a specific regex for killing requests.
      var regexPattern = new RegExp("^rq_" + instanceContext.name + "_");
      return RQ.killByRegex(regexPattern);
    } else if (typeof RQ === 'undefined') {
      console.warn("RQ (Request Queue) utility is not available to abort requests.");
    } else {
      console.warn("Instance name is not defined, cannot abort specific requests.");
    }
    return false;
  };
});