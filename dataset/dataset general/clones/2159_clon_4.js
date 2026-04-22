;(function() {

  // --- Utility Replacements ---

  // Original: component-indexof/index.js
  // Strategy: Use Array.prototype.findIndex for a functional approach
  function searchElementPosition(collection, item) {
    if (Array.isArray(collection)) {
      return collection.findIndex(element => element === item);
    }
    return -1;
  }

  // Original: RedVentures-reduce/index.js
  // Strategy: Directly use Array.prototype.reduce, carefully replicating edge cases
  function collapseArray(collection, operation, initialValue) {
    if (!Array.isArray(collection)) {
      // The original code would proceed with `arr[idx++]` which would be `undefined` if `arr` is not an array.
      // The loop `while (idx < len)` would not run. The function would return `initial` or `undefined`.
      return (arguments.length === 3) ? initialValue : undefined;
    }

    if (collection.length === 0 && arguments.length < 3) {
      // Original returns undefined for empty array with no initial value.
      return undefined;
    }

    if (arguments.length === 3) {
      return collection.reduce(operation, initialValue);
    } else {
      // If no initial value and array is not empty, use first element as initial.
      // Array.prototype.reduce without initialValue starts from index 1.
      return collection.reduce(operation);
    }
  }

  // Original: component-emitter/index.js
  // Strategy: Use a class with Map for event handling and Set for listeners.
  class EventDispatcher {
    constructor(targetObject) {
      if (targetObject) {
        return this._blendInto(targetObject);
      }
    }

    _blendInto(targetObject) {
      for (const prop in EventDispatcher.prototype) {
        // Ensure we only copy own properties from the prototype, not inherited ones
        if (Object.prototype.hasOwnProperty.call(EventDispatcher.prototype, prop)) {
          targetObject[prop] = EventDispatcher.prototype[prop];
        }
      }
      return targetObject;
    }

    subscribe(eventName, listenerFunction) {
      this._eventListeners = this._eventListeners || new Map();
      if (!this._eventListeners.has(eventName)) {
        this._eventListeners.set(eventName, new Set());
      }
      this._eventListeners.get(eventName).add(listenerFunction);
      return this;
    }

    subscribeOnce(eventName, listenerFunction) {
      this._eventListeners = this._eventListeners || new Map();
      const oneTimeWrapper = (...args) => {
        this.unsubscribe(eventName, oneTimeWrapper);
        listenerFunction.apply(this, args);
      };
      listenerFunction._oneTimeRef = oneTimeWrapper; // Store ref for proper unsubscribe
      this.subscribe(eventName, oneTimeWrapper);
      return this;
    }

    unsubscribe(eventName, listenerFunction) {
      this._eventListeners = this._eventListeners || new Map();

      // No arguments: remove all listeners for all events
      if (arguments.length === 0) {
        this._eventListeners.clear();
        return this;
      }

      const listeners = this._eventListeners.get(eventName);
      if (!listeners) return this;

      // One argument: remove all listeners for specific event
      if (arguments.length === 1) {
        this._eventListeners.delete(eventName);
        return this;
      }

      // Two arguments: remove specific listener
      const targetListener = listenerFunction._oneTimeRef || listenerFunction;
      if (listeners.has(targetListener)) {
        listeners.delete(targetListener);
        if (listeners.size === 0) {
          this._eventListeners.delete(eventName); // Clean up empty set
        }
      }
      return this;
    }

    publish(eventName, ...args) {
      this._eventListeners = this._eventListeners || new Map();
      const listeners = this._eventListeners.get(eventName);
      if (listeners) {
        // Create a copy to avoid issues if listeners are removed during iteration
        Array.from(listeners).forEach(listener => {
          listener.apply(this, args);
        });
      }
      return this;
    }

    retrieveSubscribers(eventName) {
      this._eventListeners = this._eventListeners || new Map();
      return Array.from(this._eventListeners.get(eventName) || []);
    }

    hasSubscribers(eventName) {
      return this.retrieveSubscribers(eventName).length > 0;
    }
  }

  // --- Core Module System Replacement ---

  class ResourceHub {
    constructor() {
      this._assetMap = new Map(); // Stores module definitions and exports
      this._aliasMap = new Map(); // Stores path aliases
    }

    // Original: require(path, parent, orig)
    obtainResource(assetId, callerContext, initialAssetId) {
      const resolvedIdentifier = this.determineAssetPath(assetId);

      // lookup failed
      if (resolvedIdentifier === null) {
        initialAssetId = initialAssetId || assetId;
        callerContext = callerContext || 'root';
        const failure = new Error(`Failed to obtain "${initialAssetId}" from "${callerContext}"`);
        failure.path = initialAssetId;
        failure.parent = callerContext;
        failure.require = true; // Match original error property
        throw failure;
      }

      const componentData = this._assetMap.get(resolvedIdentifier);

      // perform real require()
      // by invoking the module's
      // registered function
      if (!componentData.exportObject) {
        componentData.exportObject = {};
        componentData.isClient = true;
        componentData.isComponent = true;
        
        // Capture the global `this` from the IIFE context, as per original's `module.call(this, ...)`
        const globalScope = (function() { return this; })(); 
        componentData.definitionFunction.call(globalScope, componentData.exportObject, this.createContextualObtainer(resolvedIdentifier), componentData);
      }

      return componentData.exportObject;
    }

    // Original: require.resolve = function(path) { ... }
    determineAssetPath(assetId) {
      let currentAssetId = assetId;
      if (currentAssetId.charAt(0) === '/') {
        currentAssetId = currentAssetId.slice(1);
      }

      const potentialPaths = [
        currentAssetId,
        currentAssetId + '.js',
        currentAssetId + '.json',
        currentAssetId + '/index.js',
        currentAssetId + '/index.json'
      ];

      // Functional check for existing modules
      const foundModulePath = potentialPaths.find(p => this._assetMap.has(p));
      if (foundModulePath) {
        return foundModulePath;
      }

      // Check aliases for the '/index.js' variant
      const indexAliasPath = currentAssetId + '/index.js';
      if (this._aliasMap.has(indexAliasPath)) {
        return this._aliasMap.get(indexAliasPath);
      }

      return null;
    }

    // Original: require.normalize = function(curr, path) { ... }
    standardizePath(basePath, relativePath) {
      if (relativePath.charAt(0) !== '.') {
        return relativePath;
      }

      const baseSegments = basePath.split('/');
      const relativeSegments = relativePath.split('/');

      let currentSegments = [...baseSegments]; // Start with a copy to simulate original's `curr` modification

      for (const segment of relativeSegments) {
        if (segment === '..') {
          currentSegments.pop();
        } else if (segment !== '.' && segment !== '') {
          currentSegments.push(segment);
        }
      }
      return currentSegments.join('/');
    }

    // Original: require.register = function(path, definition) { ... }
    catalogComponent(assetId, definitionFunction) {
      this._assetMap.set(assetId, { definitionFunction: definitionFunction, exportObject: null });
    }

    // Original: require.alias = function(from, to) { ... }
    designateAlias(sourceAssetId, targetAliasId) {
      if (!this._assetMap.has(sourceAssetId)) {
        throw new Error(`Failed to designate alias for "${sourceAssetId}", it does not exist`);
      }
      this._aliasMap.set(targetAliasId, sourceAssetId);
    }

    // Original: require.relative = function(parent) { ... }
    createContextualObtainer(parentPath) {
      const baseDirectory = this.standardizePath(parentPath, '..');
      const self = this; // Capture 'this' for the nested function

      function contextualObtainer(nestedAssetId) {
        const resolved = contextualObtainer.resolve(nestedAssetId);
        return self.obtainResource(resolved, parentPath, nestedAssetId);
      }

      contextualObtainer.resolve = function(nestedAssetId) {
        const firstChar = nestedAssetId.charAt(0);
        if (firstChar === '/') {
          return nestedAssetId.slice(1);
        }
        if (firstChar === '.') {
          return self.standardizePath(baseDirectory, nestedAssetId);
        }

        // Reimplement the original `lastIndexOf` helper for this specific case to ensure exact behavior.
        function findLastItemPosition(arr, item) {
          let currentIdx = arr.length;
          while (currentIdx--) {
            if (arr[currentIdx] === item) return currentIdx;
          }
          return -1;
        }

        const segments = parentPath.split('/');
        const effectiveIndexForDeps = findLastItemPosition(segments, 'deps');
        let calculatedIndex = effectiveIndexForDeps + 1;
        // The original `if (!i) i = 0;` (where `i` is `calculatedIndex`) is only true if `i` is 0.
        // If `effectiveIndexForDeps` is -1, `calculatedIndex` becomes 0. `!0` is true, so `calculatedIndex` remains 0.
        // This line is redundant in the original, but we replicate the logic.
        if (!calculatedIndex) calculatedIndex = 0; 

        // Original uses `i + 1` for slice end, so `calculatedIndex + 1` here.
        const prefixSegments = segments.slice(0, calculatedIndex + 1); 
        const prefix = prefixSegments.join('/');
        
        return prefix + '/deps/' + nestedAssetId;
      };

      contextualObtainer.exists = function(nestedAssetId) {
        return self._assetMap.has(contextualObtainer.resolve(nestedAssetId));
      };

      return contextualObtainer;
    }
  }

  // Instantiate the module system
  const assetManager = new ResourceHub();

  // Create the global `fetchComponent` function that acts as the entry point
  const globalObtainer = function(assetId, callerContext, initialAssetId) {
    return assetManager.obtainResource(assetId, callerContext, initialAssetId);
  };

  // Attach methods from `ResourceHub` instance to the `globalObtainer` function,
  // replicating the `require.property` structure.
  globalObtainer.componentDefinitions = assetManager._assetMap; // For direct access, though not directly used externally.
  globalObtainer.componentAliases = assetManager._aliasMap;
  globalObtainer.determineAssetPath = assetManager.determineAssetPath.bind(assetManager);
  globalObtainer.standardizePath = assetManager.standardizePath.bind(assetManager);
  globalObtainer.catalogComponent = assetManager.catalogComponent.bind(assetManager);
  globalObtainer.designateAlias = assetManager.designateAlias.bind(assetManager);
  globalObtainer.createContextualObtainer = assetManager.createContextualObtainer.bind(assetManager);

  // Expose the global obtainer, mimicking how the original `require` becomes global.
  const globalRef = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
  globalRef.fetchComponent = globalObtainer; // Renamed from `require`

  // --- Registering Modules (Cloning the module definitions) ---

  // Original: require.register("component-indexof/index.js", function(exports, require, module){ ... });
  globalObtainer.catalogComponent("component-indexof/index.js", function(output, contextualObtainer, moduleData) {
    // Our `searchElementPosition` is the functional equivalent.
    // The original directly assigns the function to `module.exports`.
    moduleData.exports = searchElementPosition;
  });

  // Original: require.register("component-emitter/index.js", function(exports, require, module){ ... });
  globalObtainer.catalogComponent("component-emitter/index.js", function(output, contextualObtainer, moduleData) {
    // Original: `var index = require('indexof');`
    const elementSearch = contextualObtainer('indexof'); // Using our contextual obtainer for dependencies

    // Original: `module.exports = Emitter;`
    // Our `EventDispatcher` class is the replacement for `Emitter`.
    moduleData.exports = EventDispatcher;
    // The Emitter constructor logic `if (obj) return mixin(obj);` is handled by EventDispatcher's constructor.
  });

  // Original: require.register("RedVentures-reduce/index.js", function(exports, require, module){ ... });
  globalObtainer.catalogComponent("RedVentures-reduce/index.js", function(output, contextualObtainer, moduleData) {
    // Original: `module.exports = function(arr, fn, initial){ ... };`
    // Our `collapseArray` is the replacement.
    moduleData.exports = collapseArray;
  });

  // Original: require.register("superagent/lib/client.js", function(exports, require, module){ ... });
  globalObtainer.catalogComponent("superagent/lib/client.js", function(output, contextualObtainer, moduleData) {
    // This part is incomplete in the original, so we just replicate the dependency loading and internal definitions.
    // Original: `var Emitter = require('emitter');`
    const Dispatcher = contextualObtainer('emitter'); // Using our contextual obtainer for dependencies
    // Original: `var reduce = require('reduce');`
    const arrayCollapser = contextualObtainer('reduce'); // Using our contextual obtainer for dependencies

    // Replicate the other functions/variables present in the original snippet for superagent
    // Noop
    function doNothing(){};

    // isHost
    function isExternalHost(item) {
      const itemType = {}.toString.call(item);
      const hostTypes = new Set(['[object File]', '[object Blob]', '[object FormData]']);
      return hostTypes.has(itemType);
    }

    // getXHR
    function acquireXHR() {
      const currentGlobal = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
      if (currentGlobal.XMLHttpRequest && (currentGlobal.location.protocol !== 'file:' || !currentGlobal.ActiveXObject)) {
        return new currentGlobal.XMLHttpRequest;
      } else {
        try { return new currentGlobal.ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
        try { return new currentGlobal.ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
        try { return new currentGlobal.ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
        try { return new currentGlobal.ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
      }
      return false;
    }

    // trim
    const trimWhitespace = String.prototype.trim
      ? s => s.trim()
      : s => s.replace(/(^\s*|\s*$)/g, '');

    // isObject
    function isPlainObject(item) {
      return item === Object(item);
    }

    // The original superagent snippet ends before any `module.exports` for its own functionality.
    // We just ensure its dependencies are resolved and internal variables are defined.
  });

})();