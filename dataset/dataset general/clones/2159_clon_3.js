;(function(){

  // A counter for tracking total module resolution attempts.
  var moduleResolutionCounter = 0;

  // Internal configuration flags.
  var configFlags = {
    enableVerboseLogs: false,
    useModernApis: false // If true, would use things like Array.from, etc.
  };

  /**
   * Utility to check if an object has its own property.
   * @param {Object} targetObject - The object to check.
   * @param {string} propName - The property name.
   * @returns {boolean}
   */
  function hasOwnPropertyCheck(targetObject, propName) {
    if (typeof targetObject !== 'object' || targetObject === null) return false;
    return Object.prototype.hasOwnProperty.call(targetObject, propName);
  }

  /**
   * Loads a module based on its identifier.
   * This is the core module loading mechanism.
   *
   * @param {string} moduleIdentifier The unique identifier for the module.
   * @param {string} [originContext] The identifier of the module requesting this load.
   * @param {string} [originalRequest] The exact string passed to the loader.
   * @returns {object} The public API (exports) of the loaded module.
   * @throws {Error} If the module cannot be found or fails to load.
   */
  function modLoader(moduleIdentifier, originContext, originalRequest) {
    moduleResolutionCounter++;
    if (configFlags.enableVerboseLogs) {
      console.log(`[ModLoader] Attempting to load: "${moduleIdentifier}" (from: ${originContext || 'global'})`);
    }

    if (typeof moduleIdentifier !== 'string' || moduleIdentifier.trim() === '') {
      throw new TypeError('Module identifier must be a non-empty string.');
    }

    var locatedResource = modLoader.findResource(moduleIdentifier);

    // If resource location failed, report an error.
    if (!locatedResource) {
      originalRequest = originalRequest || moduleIdentifier;
      originContext = originContext || 'application_root';
      var resolutionFailure = new Error(
        `Failed to locate requested resource: "${originalRequest}" originating from "${originContext}".`
      );
      resolutionFailure.resourceId = originalRequest;
      resolutionFailure.sourceContext = originContext;
      resolutionFailure.isModuleError = true;
      throw resolutionFailure;
    }

    var moduleRecord = modLoader.registry[locatedResource];

    // Execute the module's factory function if it hasn't been executed yet.
    if (!hasOwnPropertyCheck(moduleRecord, 'exportedAPI')) {
      moduleRecord.exportedAPI = {}; // Initialize exports object.
      try {
        moduleRecord.call(
          this,
          moduleRecord.exportedAPI,
          modLoader.contextualLoader(locatedResource), // Provide a scoped loader for relative paths.
          moduleRecord
        );
      } catch (executionErr) {
        var moduleExecutionError = new Error(
          `Error executing module "${locatedResource}": ${executionErr.message}`
        );
        moduleExecutionError.originalError = executionErr;
        moduleExecutionError.resourceId = locatedResource;
        throw moduleExecutionError;
      }
    }

    return moduleRecord.exportedAPI;
  }

  /**
   * Stores all registered module factory functions.
   */
  modLoader.registry = {};

  /**
   * Stores module identifier redirections (aliases).
   */
  modLoader.redirects = {};

  /**
   * Attempts to resolve a module identifier to a canonical path.
   * This function checks various file extensions and directory structures.
   *
   * Lookup precedence:
   *   - EXACT_PATH
   *   - EXACT_PATH.js
   *   - EXACT_PATH.json
   *   - EXACT_PATH/index.js
   *   - EXACT_PATH/index.json
   *   - EXACT_PATH/main.js (custom addition)
   *
   * @param {string} resourcePath The path or identifier to resolve.
   * @returns {string|null} The resolved canonical path or null if not found.
   */
  modLoader.findResource = function(resourcePath) {
    if (typeof resourcePath !== 'string') {
      return null; // Invalid input type
    }

    var normalizedPath = resourcePath;
    // Remove leading slash if present, assuming it's an internal path.
    if (normalizedPath.charAt(0) === '/') {
      normalizedPath = normalizedPath.slice(1);
    }

    // Define a set of potential candidate paths.
    var candidatePaths = [
      normalizedPath,
      normalizedPath + '.js',
      normalizedPath + '.json',
      normalizedPath + '/index.js',
      normalizedPath + '/index.json',
      normalizedPath + '/main.js' // Added common pattern.
    ];

    // Check if any of the candidates exist in the registry.
    for (var k = 0; k < candidatePaths.length; k++) {
      var currentCandidate = candidatePaths[k];
      if (hasOwnPropertyCheck(modLoader.registry, currentCandidate)) {
        return currentCandidate;
      }
    }

    // Check for aliases.
    var potentialAliasIndex = normalizedPath + '/index.js'; // Common alias target
    if (hasOwnPropertyCheck(modLoader.redirects, potentialAliasIndex)) {
      var aliasTarget = modLoader.redirects[potentialAliasIndex];
      // Ensure the alias target actually exists.
      if (hasOwnPropertyCheck(modLoader.registry, aliasTarget)) {
        return aliasTarget;
      }
    }

    return null; // Resource not found.
  };

  /**
   * Normalizes a relative path against a base directory.
   * Handles '.' and '..' segments.
   *
   * @param {string} currentDir The base directory path.
   * @param {string} relPath The relative path to normalize.
   * @returns {string} The normalized absolute-like path.
   */
  modLoader.adjustPath = function(currentDir, relPath) {
    if (typeof currentDir !== 'string' || typeof relPath !== 'string') {
      throw new TypeError('Path arguments must be strings for normalization.');
    }

    var outputSegments = [];

    // If it's an absolute path, return as-is (after initial cleanup).
    if (relPath.charAt(0) !== '.') {
      return relPath.charAt(0) === '/' ? relPath.slice(1) : relPath;
    }

    var baseSegments = currentDir.split('/');
    var relativeSegments = relPath.split('/');

    for (var segmentIndex = 0; segmentIndex < relativeSegments.length; ++segmentIndex) {
      var segment = relativeSegments[segmentIndex];
      if (segment === '..') {
        baseSegments.pop(); // Go up one level.
      } else if (segment !== '.' && segment !== '') {
        outputSegments.push(segment); // Add valid segment.
      }
    }

    // Combine base and output segments.
    var finalPathSegments = baseSegments.concat(outputSegments);
    // Filter out any empty segments that might result from concatenation or initial splits.
    return finalPathSegments.filter(Boolean).join('/');
  };

  /**
   * Registers a module's factory function with the loader.
   *
   * @param {string} moduleId The unique identifier for the module.
   * @param {Function} moduleFactory The function that defines the module's logic.
   */
  modLoader.define = function(moduleId, moduleFactory) {
    if (typeof moduleId !== 'string' || typeof moduleFactory !== 'function') {
      throw new TypeError('Module ID must be a string and factory must be a function.');
    }
    if (configFlags.enableVerboseLogs) {
      console.log(`[ModLoader] Registering module: "${moduleId}"`);
    }
    modLoader.registry[moduleId] = moduleFactory;
  };

  /**
   * Creates an alias (redirection) from one module ID to another.
   *
   * @param {string} originalId The module ID that will be redirected.
   * @param {string} aliasId The new ID that points to the original.
   */
  modLoader.mapResource = function(originalId, aliasId) {
    if (typeof originalId !== 'string' || typeof aliasId !== 'string') {
      throw new TypeError('Alias arguments must be strings.');
    }
    if (!hasOwnPropertyCheck(modLoader.registry, originalId)) {
      throw new Error(`Cannot create alias for "${originalId}", as it is not a registered module.`);
    }
    if (configFlags.enableVerboseLogs) {
      console.log(`[ModLoader] Mapping alias: "${aliasId}" -> "${originalId}"`);
    }
    modLoader.redirects[aliasId] = originalId;
  };

  /**
   * Creates a specialized module loader that resolves paths relative to a given base module.
   *
   * @param {string} baseModuleId The ID of the module from which relative paths should be resolved.
   * @returns {Function} A new loader function with contextual resolution.
   */
  modLoader.contextualLoader = function(baseModuleId) {
    if (typeof baseModuleId !== 'string') {
      throw new TypeError('Base module ID for contextual loader must be a string.');
    }

    var normalizedBase = modLoader.adjustPath(baseModuleId, '..');

    /**
     * Helper to find the last occurrence of an item in an array.
     * (A custom implementation, not relying on Array.prototype.lastIndexOf for wider compatibility).
     */
    function findLastOccurrence(collection, item) {
      var searchIndex = collection.length;
      while (searchIndex--) {
        if (collection[searchIndex] === item) return searchIndex;
      }
      return -1;
    }

    /**
     * The contextual loader function itself.
     * @param {string} requestedPath The path to load, relative to the baseModuleId.
     * @returns {object} The module's exports.
     */
    function scopedLoader(requestedPath) {
      var resolvedModuleIdentifier = scopedLoader.resolveId(requestedPath);
      return modLoader(resolvedModuleIdentifier, baseModuleId, requestedPath);
    }

    /**
     * Resolves a path relative to the contextual loader's base.
     * @param {string} relativePath The path to resolve.
     * @returns {string} The fully resolved module identifier.
     */
    scopedLoader.resolveId = function(relativePath) {
      var firstChar = relativePath.charAt(0);
      if (firstChar === '/') {
        return relativePath.slice(1); // Absolute path within the loader's scope.
      }
      if (firstChar === '.') {
        return modLoader.adjustPath(normalizedBase, relativePath); // Relative path.
      }

      // Special handling for "deps" directory convention (often used in component loaders).
      var moduleSegments = baseModuleId.split('/');
      var depDirIndex = findLastOccurrence(moduleSegments, 'deps');
      var adjustedIndex = (depDirIndex !== -1) ? (depDirIndex + 1) : 0;

      var depPathPrefix = moduleSegments.slice(0, adjustedIndex + 1).join('/');
      var finalDepPath = depPathPrefix + '/deps/' + relativePath;

      return finalDepPath;
    };

    /**
     * Checks if a resource exists relative to the contextual loader's base.
     * @param {string} relativePath The path to check.
     * @returns {boolean} True if the resource is registered, false otherwise.
     */
    scopedLoader.resourceExists = function(relativePath) {
      return hasOwnPropertyCheck(modLoader.registry, scopedLoader.resolveId(relativePath));
    };

    return scopedLoader;
  };

  // --- Start of Bundled Modules ---

  // Module: "component-indexof/index.js"
  modLoader.define("component-indexof/index.js", function(exportedAPI, localLoader, moduleObject){
    var nativeIndexOf = [].indexOf; // Cache native method for performance.

    /**
     * Finds the first index of an element within an array.
     * @param {Array} targetArray The array to search.
     * @param {*} searchElement The element to find.
     * @returns {number} The index of the element, or -1 if not found.
     */
    moduleObject.exportedAPI = function(targetArray, searchElement){
      if (!Array.isArray(targetArray)) {
        console.warn('`indexof` utility received a non-array input.');
        return -1;
      }

      // Prefer native `indexOf` if available and efficient.
      if (configFlags.useModernApis && nativeIndexOf) {
        return targetArray.indexOf(searchElement);
      }

      // Fallback for older environments or if `useModernApis` is false.
      for (var elementIdx = 0; elementIdx < targetArray.length; ++elementIdx) {
        if (targetArray[elementIdx] === searchElement) return elementIdx;
      }
      return -1;
    };
  });

  // Module: "component-emitter/index.js"
  modLoader.define("component-emitter/index.js", function(exportedAPI, localLoader, moduleObject){

    /**
     * Module dependency: custom index finding utility.
     */
    var arrayUtil = localLoader('indexof');

    /**
     * Expose the EventDispatcher class.
     */
    moduleObject.exportedAPI = EventDispatcher;

    /**
     * Initializes a new `EventDispatcher` instance.
     * If an object is provided, it will mixin event dispatcher capabilities.
     *
     * @param {Object} [targetObject] An optional object to extend with event methods.
     * @returns {EventDispatcher|Object} A new dispatcher or the extended object.
     */
    function EventDispatcher(targetObject) {
      if (targetObject) return extendWithEvents(targetObject);
      // Ensure private callback storage is initialized.
      this._eventHandlers_ = {};
    }

    /**
     * Extends a given object with `EventDispatcher`'s prototype methods.
     *
     * @param {Object} objToExtend The object to augment.
     * @returns {Object} The modified object.
     * @private
     */
    function extendWithEvents(objToExtend) {
      for (var methodName in EventDispatcher.prototype) {
        // Ensure it's a direct property, not inherited.
        if (hasOwnPropertyCheck(EventDispatcher.prototype, methodName)) {
          objToExtend[methodName] = EventDispatcher.prototype[methodName];
        }
      }
      // Initialize private storage for the extended object.
      objToExtend._eventHandlers_ = {};
      return objToExtend;
    }

    /**
     * Subscribes a callback function to a specific event.
     *
     * @param {string} eventName The name of the event to listen for.
     * @param {Function} callbackFn The function to execute when the event is triggered.
     * @returns {EventDispatcher} The current instance for chaining.
     */
    EventDispatcher.prototype.addListener = function(eventName, callbackFn){
      if (typeof eventName !== 'string' || typeof callbackFn !== 'function') {
        console.error('Invalid arguments for addListener: eventName must be string, callbackFn must be function.');
        return this;
      }
      this._eventHandlers_ = this._eventHandlers_ || {};
      var handlersForEvent = this._eventHandlers_[eventName] = this._eventHandlers_[eventName] || [];
      handlersForEvent.push(callbackFn);
      return this;
    };

    /**
     * Subscribes a callback function that will be invoked only once, then automatically removed.
     *
     * @param {string} eventName The name of the event.
     * @param {Function} callbackFn The function to execute once.
     * @returns {EventDispatcher} The current instance for chaining.
     */
    EventDispatcher.prototype.once = function(eventName, callbackFn){
      var currentInstance = this;
      this._eventHandlers_ = this._eventHandlers_ || {};

      function oneTimeWrapper() {
        currentInstance.removeListener(eventName, oneTimeWrapper); // Remove this wrapper.
        callbackFn.apply(this, arguments); // Execute original callback.
      }

      // Store a reference to the wrapper on the original function for removal.
      callbackFn._oneTimeWrapper_ = oneTimeWrapper;
      this.addListener(eventName, oneTimeWrapper);
      return this;
    };

    /**
     * Removes event listeners. Can remove specific handlers, all handlers for an event, or all handlers for all events.
     *
     * @param {string} [eventName] The event name. If omitted, all events are cleared.
     * @param {Function} [callbackFn] The specific handler to remove. If omitted, all handlers for `eventName` are cleared.
     * @returns {EventDispatcher} The current instance for chaining.
     */
    EventDispatcher.prototype.removeListener =
    EventDispatcher.prototype.off =
    EventDispatcher.prototype.clearAllHandlers = function(eventName, callbackFn){
      this._eventHandlers_ = this._eventHandlers_ || {};

      // Case 1: No arguments - clear all event handlers.
      if (arguments.length === 0) {
        this._eventHandlers_ = {};
        return this;
      }

      // Case 2: Specific event name provided.
      var handlersForEvent = this._eventHandlers_[eventName];
      if (!handlersForEvent) return this; // No handlers for this event.

      // Case 2a: Only event name provided - remove all handlers for this event.
      if (arguments.length === 1) {
        delete this._eventHandlers_[eventName];
        return this;
      }

      // Case 2b: Event name and specific callback function provided.
      // Find the correct function to remove (either original or its 'once' wrapper).
      var targetFunction = callbackFn._oneTimeWrapper_ || callbackFn;
      var handlerIndex = arrayUtil(handlersForEvent, targetFunction);
      if (handlerIndex !== -1) {
        handlersForEvent.splice(handlerIndex, 1);
      }
      return this;
    };

    /**
     * Triggers an event, invoking all registered handlers with provided arguments.
     *
     * @param {string} eventName The name of the event to trigger.
     * @param {...any} eventArgs Any additional arguments to pass to the handlers.
     * @returns {EventDispatcher} The current instance for chaining.
     */
    EventDispatcher.prototype.triggerEvent = function(eventName){
      this._eventHandlers_ = this._eventHandlers_ || {};
      var collectedArgs = Array.prototype.slice.call(arguments, 1); // Get args after eventName.
      var handlersForEvent = this._eventHandlers_[eventName];

      if (handlersForEvent && handlersForEvent.length > 0) {
        // Create a shallow copy to prevent issues if handlers modify the list during iteration.
        var handlersToExecute = handlersForEvent.slice(0);
        for (var hIdx = 0; hIdx < handlersToExecute.length; ++hIdx) {
          try {
            handlersToExecute[hIdx].apply(this, collectedArgs);
          } catch (handlerError) {
            console.error(`Error in event handler for "${eventName}":`, handlerError);
            // Optionally re-throw or emit an 'error' event.
          }
        }
      }

      return this;
    };

    /**
     * Retrieves all callback functions registered for a specific event.
     *
     * @param {string} eventName The name of the event.
     * @returns {Array<Function>} An array of registered callback functions. Returns an empty array if no handlers.
     */
    EventDispatcher.prototype.getHandlers = function(eventName){
      this._eventHandlers_ = this._eventHandlers_ || {};
      return this._eventHandlers_[eventName] || [];
    };

    /**
     * Checks if there are any listeners registered for a given event.
     *
     * @param {string} eventName The name of the event.
     * @returns {boolean} True if there are handlers, false otherwise.
     */
    EventDispatcher.prototype.hasActiveListeners = function(eventName){
      return this.getHandlers(eventName).length > 0;
    };

  });

  // Module: "RedVentures-reduce/index.js"
  modLoader.define("RedVentures-reduce/index.js", function(exportedAPI, localLoader, moduleObject){

    /**
     * Applies a reducer function against an accumulator and each element in the array (from left to right)
     * to reduce it to a single value.
     *
     * @param {Array} collection The array to iterate over.
     * @param {Function} reducerFn The reducer function (accumulator, currentValue, currentIndex, array).
     * @param {any} [initialAccumulator] The initial value of the accumulator.
     * @returns {any} The single value that results from the reduction.
     */
    moduleObject.exportedAPI = function(collection, reducerFn, initialAccumulator){
      if (!Array.isArray(collection)) {
        throw new TypeError('The first argument to reduce must be an array.');
      }
      if (typeof reducerFn !== 'function') {
        throw new TypeError('The reducer function must be a function.');
      }

      var currentIndex = 0;
      var collectionLength = collection.length;
      var currentAccumulator;

      // Determine initial accumulator value.
      var hasInitialValue = arguments.length === 3;
      if (hasInitialValue) {
        currentAccumulator = initialAccumulator;
      } else {
        if (collectionLength === 0) {
          throw new TypeError('Reduce of empty array with no initial value.');
        }
        currentAccumulator = collection[currentIndex++]; // Use first element as initial, then start from next.
      }

      // Iterate and apply reducer.
      while (currentIndex < collectionLength) {
        currentAccumulator = reducerFn.call(null, currentAccumulator, collection[currentIndex], currentIndex, collection);
        currentIndex++; // Move to the next element.
      }

      return currentAccumulator;
    };
  });

  // Module: "superagent/lib/client.js" (Partial, only up to `isObject`)
  modLoader.define("superagent/lib/client.js", function(exportedAPI, localLoader, moduleObject){

    /**
     * Module dependencies for request handling.
     */
    var EventDispatcher = localLoader('emitter');
    var arrayReducer = localLoader('reduce');

    /**
     * Determines the global context (window in browser, `this` in Node/WebWorker).
     */
    var globalScope = (typeof window === 'undefined' || typeof self === 'undefined')
      ? this
      : window; // Prefer window for browser, fall back to 'this' for others.

    /**
     * Simple no-operation function.
     */
    function noopFunc(){};

    /**
     * Checks if a given object is a host-provided object (e.g., File, Blob, FormData).
     * These objects have special serialization requirements.
     *
     * @param {Object} inputObj The object to check.
     * @returns {boolean} True if it's a host object, false otherwise.
     */
    function isPlatformObject(inputObj) {
      if (inputObj === null || typeof inputObj !== 'object') return false;
      var objTypeString = Object.prototype.toString.call(inputObj);

      switch (objTypeString) {
        case '[object File]':
        case '[object Blob]':
        case '[object FormData]':
        case '[object ArrayBuffer]': // Added another common host object type.
          return true;
        default:
          return false;
      }
    }

    /**
     * Determines the appropriate XMLHttpRequest constructor for the environment.
     * Handles different browser environments, including older IE versions.
     *
     * @returns {XMLHttpRequest|ActiveXObject|boolean} An XHR constructor or false if none available.
     */
    function getHttpClientInstance() {
      // Modern browsers and non-file protocol XHR.
      if (globalScope.XMLHttpRequest && (globalScope.location.protocol !== 'file:' || !globalScope.ActiveXObject)) {
        return new globalScope.XMLHttpRequest();
      } else {
        // Fallback for older IE versions using ActiveX.
        try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e1) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e2) {}
        try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e3) {}
        // Added a check for older MSXML versions.
        try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e4) {}
      }
      return false; // No suitable XHR found.
    }

    /**
     * Removes leading and trailing whitespace from a string.
     * Provides a fallback for environments without String.prototype.trim().
     *
     * @param {string} rawString The string to trim.
     * @returns {string} The trimmed string.
     */
    var cleanString = (function() {
      if (String.prototype.trim && configFlags.useModernApis) {
        return function(rawString) {
          if (typeof rawString !== 'string') return String(rawString); // Coerce to string.
          return rawString.trim();
        };
      } else {
        return function(rawString) {
          if (typeof rawString !== 'string') return String(rawString);
          return rawString.replace(/(^\s*|\s*$)/g, '');
        };
      }
    })();

    /**
     * Checks if a given value is a plain JavaScript object (not null, array, function, etc.).
     *
     * @param {any} valueToCheck The value to evaluate.
     * @returns {boolean} True if the value is a plain object, false otherwise.
     */
    function isPlainObject(valueToCheck) {
      if (valueToCheck === null || typeof valueToCheck !== 'object') {
        return false;
      }
      // A common way to check for plain objects is to compare constructor.
      // Another is to check Object.prototype.toString.call(obj) === '[object Object]'
      // For simplicity, we'll use the latter.
      return Object.prototype.toString.call(valueToCheck) === '[object Object]';
    }

    /**
     * Serializes a given object into a URL-encoded string.
     * (This is a placeholder, actual implementation would be complex).
     *
     * @param {Object} dataObject The object to serialize.
     * @returns {string} The serialized string.
     * @api private
     */
    function serializeData(dataObject) {
      if (!isPlainObject(dataObject)) {
        console.warn('Attempted to serialize a non-plain object. Returning empty string.');
        return '';
      }
      var parts = [];
      for (var key in dataObject) {
        if (hasOwnPropertyCheck(dataObject, key)) {
          var value = dataObject[key];
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
      }
      return parts.join('&');
    }

    // Exported utilities for superagent
    exportedAPI.isPlatformObject = isPlatformObject;
    exportedAPI.getHttpClientInstance = getHttpClientInstance;
    exportedAPI.cleanString = cleanString;
    exportedAPI.isPlainObject = isPlainObject;
    exportedAPI.serialize = serializeData; // Added this new function.

  });

  // End of Bundled Modules

})();