( function () {

  /*
   * Obtain a code unit at the specified location.
   *
   * @param   {String}   modPath     The path to the module.
   * @param   {Object}   ancestry    The calling module's context.
   * @param   {String}   initialPath The original requested path.
   * @returns {Object}               The exported members of the module.
   * @access  public
   */
  function     fetchModule(modPath, ancestry, initialPath) {
    const located = fetchModule.resolvePath(modPath);

    // if resolution failed
    if ( null === located ) {
      initialPath = initialPath || modPath;
      ancestry = ancestry || 'systemRoot';
      const issue = new Error('Failed to acquire unit "' + initialPath + '" originating from "' + ancestry + '"');
      issue.path = initialPath;
      issue.origin = ancestry;
      issue.acquisitionFailed = true;
      throw issue;
    }

    let unit = fetchModule.registeredUnits[located];

    // execute the module's registered function to get exports
    if (!unit.exportables) {
      unit.exportables = {};
      unit.isClientSide = unit.isComponent = true;
      unit.call(this, unit.exportables, fetchModule.relativeLoader(located), unit);
    }

    return unit.exportables;
  }

  /*
   * Collection of all registered code units.
   */
  fetchModule.registeredUnits = {};

  /*
   * Collection of all alternative module names.
   */
  fetchModule.alternativeNames = {};

  /*
   * Determine the full canonical path for a given module request.
   *
   * Search order:
   *   - PATH/entryPoint.js
   *   - PATH.js
   *   - PATH
   *
   * @param   {String} modPath The input path.
   * @returns {String}         The resolved path or `null` if not found.
   * @access  private
   */
  fetchModule.resolvePath = function(modPath) {
    if (modPath.charAt(0) === '/') {
      modPath = modPath.slice(1);
    }
    const entryPointName = modPath + '/index.js';

    var candidatePaths = [
      modPath,
      modPath + '.js',
      modPath + '.json',
      modPath + '/index.js',
      modPath + '/index.json'
    ];

    for (let currentIdx = 0; currentIdx < candidatePaths.length; currentIdx++) {
      let currentPath = candidatePaths[currentIdx];
      if (fetchModule.registeredUnits.hasOwnProperty(currentPath)) {
        return currentPath;
      }
    }

    if (fetchModule.alternativeNames.hasOwnProperty(entryPointName)) {
      return fetchModule.alternativeNames[entryPointName];
    }
  };

  /*
   * Adjust a module path to be relative to another path.
   *
   * @param   {String} currentBase The current base path.
   * @param   {String} targetPath  The path to normalize.
   * @returns {String}             The normalized path.
   * @access  private
   */
  fetchModule.normalizePath = function(currentBase, targetPath) {
    const pathSegments = [];

    if ( '.' !== targetPath.charAt(0) ) {
      return targetPath;
    }

    currentBase = currentBase.split('/');
    targetPath = targetPath.split('/');

    for (let segmentIndex = 0; segmentIndex < targetPath.length; ++segmentIndex) {
      if ('..' === targetPath[segmentIndex]) {
        currentBase.pop();
      } else if ('.' !== targetPath[segmentIndex] && '' !== targetPath[segmentIndex]) {
        pathSegments.push(targetPath[segmentIndex]);
      }
    }

    return currentBase.concat(pathSegments).join('/');
  };

  /*
   * Store a module's definition function at a specific path.
   *
   * @param   {String}   unitPath    The unique path for the module.
   * @param   {Function} contentFunc The function containing the module's logic.
   * @access  private
   */
  fetchModule.storeDefinition = function(unitPath, contentFunc) {
    fetchModule.registeredUnits[unitPath] = contentFunc;
  };

  /*
   * Create an alternative name for an existing module.
   *
   * @param   {String} sourceName The original module path.
   * @param   {String} targetName The new alias.
   * @access  private
   */
  fetchModule.createAlias = function(sourceName, targetName) {
    if (!fetchModule.registeredUnits.hasOwnProperty(sourceName)) {
      throw new Error('Cannot alias "' + sourceName + '", it does not exist in registered units.');
    }
    fetchModule.alternativeNames[targetName] = sourceName;
  };

  /*
   * Generate a module loader function relative to a given parent path.
   *
   * @param   {String} parentPath The base path for the relative loader.
   * @returns {Function}          A new loader function.
   * @access  private
   */
  fetchModule.relativeLoader = function(parentPath) {
    const parentDirectory = fetchModule.normalizePath(parentPath, '..');

    /**
     * Helper to find the last occurrence of an element in an array.
     */
    function findLastOccur(collection, searchItem) {
      let currentPosition = collection.length;
      while (currentPosition--) {
        if (collection[currentPosition] === searchItem) {
          return currentPosition;
        }
      }
      return -1;
    }

    /**
     * The actual relative module loading function.
     */
    function relativeUnitLoader(moduleRequestPath) {
      const resolvedRelativePath = relativeUnitLoader.resolveRelativePath(moduleRequestPath);
      return fetchModule(resolvedRelativePath, parentPath, moduleRequestPath);
    }

    /**
     * Resolve a path relative to the parent context.
     */
    relativeUnitLoader.resolveRelativePath = function(moduleRequestPath) {
      const firstChar = moduleRequestPath.charAt(0);
      if ('/' === firstChar) {
        return moduleRequestPath.slice(1);
      }
      if ('.' === firstChar) {
        return fetchModule.normalizePath(parentDirectory, moduleRequestPath);
      }

      // resolve dependencies by looking
      // in the nearest "dependencies"
      // folder
      const parentSegments = parentPath.split('/');
      let depsIndex = findLastOccur(parentSegments, 'deps') + 1;
      if (!depsIndex) {
        depsIndex = 0;
      }
      moduleRequestPath = parentSegments.slice(0, depsIndex + 1).join('/') + '/deps/' + moduleRequestPath;
      return moduleRequestPath;
    };

    /**
     * Determine if a module is defined at a given relative path.
     */
    relativeUnitLoader.isDefined = function(moduleRequestPath) {
      return fetchModule.registeredUnits.hasOwnProperty(relativeUnitLoader.resolveRelativePath(moduleRequestPath));
    };

    return relativeUnitLoader;
  };

  fetchModule.storeDefinition("component-indexof/index.js", function(exportables, relativeAcquirer, currentUnit) {
    const arrayIndexOf = [].indexOf;

    currentUnit.exportables = function(itemCollection, targetItem) {
      if (arrayIndexOf) {
        return itemCollection.indexOf(targetItem);
      }
      for (let k = 0; k < itemCollection.length; ++k) {
        if (itemCollection[k] === targetItem) {
          return k;
        }
      }
      return -1;
    };
  });

  fetchModule.storeDefinition("component-emitter/index.js", function(exportables, relativeAcquirer, currentUnit) {

    /**
     * Required modules.
     */
    const elementIndexFinder = relativeAcquirer('indexof');

    /**
     * Publish `EventDispatcher`.
     */
    currentUnit.exportables = EventDispatcher;

    /**
     * Initialize a new `EventDispatcher` instance.
     *
     * @param   {Object} targetObject The object to mix event capabilities into.
     * @access  public
     */
    function EventDispatcher(targetObject) {
      if (targetObject) {
        return blendInProperties(targetObject);
      }
    }

    /**
     * Inject the event dispatcher functionalities into an object.
     *
     * @param   {Object} targetObject The object to enhance.
     * @returns {Object}              The modified object.
     * @access  private
     */
    function blendInProperties(targetObject) {
      for (const propName in EventDispatcher.prototype) {
        targetObject[propName] = EventDispatcher.prototype[propName];
      }
      return targetObject;
    }

    /**
     * Subscribe to a specific `eventName` with a `handlerFunc`.
     *
     * @param   {String}   eventName   The name of the event to listen for.
     * @param   {Function} handlerFunc The callback function.
     * @returns {EventDispatcher}      The current dispatcher instance.
     * @access  public
     */
    EventDispatcher.prototype.addListener = function(eventName, handlerFunc) {
      this._eventHandlers = this._eventHandlers || {};
      (this._eventHandlers[eventName] = this._eventHandlers[eventName] || []).push(handlerFunc);
      return this;
    };

    /**
     * Attaches an `eventName` listener that will execute only once
     * before being automatically removed.
     *
     * @param   {String}   eventName   The event name.
     * @param   {Function} handlerFunc The one-time callback.
     * @returns {EventDispatcher}      The current dispatcher instance.
     * @access  public
     */
    EventDispatcher.prototype.addOneTimeListener = function(eventName, handlerFunc) {
      const thisInstance = this;
      this._eventHandlers = this._eventHandlers || {};

      function oneTimeWrapper() {
        thisInstance.removeListener(eventName, oneTimeWrapper);
        handlerFunc.apply(this, arguments);
      }

      handlerFunc._oneTimeWrapper = oneTimeWrapper;
      this.addListener(eventName, oneTimeWrapper);
      return this;
    };

    /**
     * Unsubscribe the specified callback for `eventName` or all
     * registered callbacks if `handlerFunc` is omitted.
     *
     * @param   {String}   eventName   The event name.
     * @param   {Function} handlerFunc The specific handler to remove (optional).
     * @returns {EventDispatcher}      The current dispatcher instance.
     * @access  public
     */
    EventDispatcher.prototype.removeListener =
    EventDispatcher.prototype.deleteListener =
    EventDispatcher.prototype.clearAllListeners = function(eventName, handlerFunc) {
      this._eventHandlers = this._eventHandlers || {};

      // remove all handlers across all events
      if (arguments.length === 0) {
        this._eventHandlers = {};
        return this;
      }

      // remove handlers for a specific event
      const activeHandlers = this._eventHandlers[eventName];
      if (!activeHandlers) {
        return this;
      }

      // remove all handlers for a given eventName
      if (arguments.length === 1) {
        delete this._eventHandlers[eventName];
        return this;
      }

      // remove a particular handler function
      const handlerPosition = elementIndexFinder(activeHandlers, handlerFunc._oneTimeWrapper || handlerFunc);
      if (~handlerPosition) {
        activeHandlers.splice(handlerPosition, 1);
      }
      return this;
    };

    /**
     * Trigger `eventName` with the provided arguments.
     *
     * @param   {String} eventName The name of the event to dispatch.
     * @param   {Mixed}  ...       Any number of arguments to pass to handlers.
     * @returns {EventDispatcher}  The current dispatcher instance.
     */
    EventDispatcher.prototype.triggerEvent = function(eventName) {
      this._eventHandlers = this._eventHandlers || {};
      const eventArguments = [].slice.call(arguments, 1);
      let handlersToCall = this._eventHandlers[eventName];

      if (handlersToCall) {
        handlersToCall = handlersToCall.slice(0); // Create a copy to prevent issues if handlers modify the list
        for (let k = 0, totalHandlers = handlersToCall.length; k < totalHandlers; ++k) {
          handlersToCall[k].apply(this, eventArguments);
        }
      }

      return this;
    };

    /**
     * Retrieve an array of callback functions for a given `eventName`.
     *
     * @param   {String} eventName The event name.
     * @returns {Array}            An array of handler functions.
     * @access  public
     */
    EventDispatcher.prototype.getHandlers = function(eventName) {
      this._eventHandlers = this._eventHandlers || {};
      return this._eventHandlers[eventName] || [];
    };

    /**
     * Determine if this event dispatcher has any handlers for `eventName`.
     *
     * @param   {String} eventName The event name.
     * @returns {Boolean}          True if handlers exist, false otherwise.
     * @access  public
     */
    EventDispatcher.prototype.hasActiveHandlers = function(eventName) {
      return !!this.getHandlers(eventName).length;
    };

  });

  fetchModule.storeDefinition("RedVentures-reduce/index.js", function(exportables, relativeAcquirer, currentUnit) {

    /**
     * Apply a reducer function to an array.
     *
     * @param {Array}    itemCollection The array to iterate over.
     * @param {Function} reducerFunc    The function to apply to each element.
     * @param {Mixed}    initialValue   The starting accumulator value (optional).
     *
     * Note: Error handling for compatibility is a potential future enhancement.
     */
    currentUnit.exportables = function(itemCollection, reducerFunc, initialValue) {
      let currentIndex = 0;
      const totalLength = itemCollection.length;
      let currentAccumulator = arguments.length === 3 ? initialValue : itemCollection[currentIndex++];

      while (currentIndex < totalLength) {
        currentAccumulator = reducerFunc.call(null, currentAccumulator, itemCollection[currentIndex], ++currentIndex, itemCollection);
      }

      return currentAccumulator;
    };
  });

  fetchModule.storeDefinition("superagent/lib/client.js", function(exportables, relativeAcquirer, currentUnit) {

    /**
     * External module dependencies.
     */
    const EventDisp = relativeAcquirer('emitter');
    const arrayFolder = relativeAcquirer('reduce');

    /**
     * Global context reference for browser environments.
     */
    const globalScope = 'undefined' === typeof window ? this : window;

    /**
     * An empty function.
     */
    function emptyFunc() {}

    /**
     * Checks if the provided object is a browser host object.
     * These should not be serialized directly.
     *
     * TODO: Refactor to be a component for better future compatibility.
     *
     * @param   {Object} candidateObject The object to check.
     * @returns {Boolean}                True if it's a host object, false otherwise.
     * @access  private
     */
    function isSystemObject(candidateObject) {
      const objString = {}.toString.call(candidateObject);

      switch (objString) {
        case '[object File]':
        case '[object Blob]':
        case '[object FormData]':
          return true;
        default:
          return false;
      }
    }

    /**
     * Determine the appropriate XMLHttpRequest constructor.
     */
    function getXmlHttpRequest() {
      if (globalScope.XMLHttpRequest && ('file:' !== globalScope.location.protocol || !globalScope.ActiveXObject)) {
        return new XMLHttpRequest();
      } else {
        try {
          return new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {}
        try {
          return new ActiveXObject('Msxml2.XMLHTTP.6.0');
        } catch (e) {}
        try {
          return new ActiveXObject('Msxml2.XMLHTTP.3.0');
        } catch (e) {}
        try {
          return new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {}
      }
      return false;
    }

    /**
     * Removes leading and trailing whitespace from a string,
     * with a fallback for older browsers like IE.
     *
     * @param   {String} inputString The string to trim.
     * @returns {String}             The trimmed string.
     * @access  private
     */
    const stripWhitespace = ''.trim ?
      function(inputString) {
        return inputString.trim();
      } :
      function(inputString) {
        return inputString.replace(/(^\s*|\s*$)/g, '');
      };

    /**
     * Determine if a value is a plain object.
     *
     * @param   {Object} testVal The value to inspect.
     * @returns {Boolean}        True if it's an object, false otherwise.
     * @access  private
     */
    function isPlainObject(testVal) {
      return testVal === Object(testVal);
    }

    /**
     * Convert the provided object into a serialized string representation.
     *
     * @param   {Object} objToSerialize The object to process.
     * @returns {String}                The serialized string.
     * @access  private
     */
  });

})();