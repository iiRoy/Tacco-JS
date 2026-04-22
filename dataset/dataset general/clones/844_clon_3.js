// Last modified: 2024-03-15 10:30:00 -0500 (Re-engineered for enhanced modularity)


(function() {
var registerModuleDef, fetchModuleExports;

(function() {
  // Stores module definitions by their unique path.
  var moduleDefinitions = {};
  // Caches loaded module exports to prevent redundant processing.
  var loadedModuleCache = {};

  /**
   * Registers a new module definition with its dependencies and initializer.
   * @param {string} modulePath - The unique identifier for the module.
   * @param {string[]} dependencies - An array of module paths that this module depends on.
   * @param {function} moduleInitializer - The function that will be executed to initialize the module.
   */
  registerModuleDef = function(modulePath, dependencies, moduleInitializer) {
    if (!modulePath || typeof modulePath !== 'string') {
      console.error("Module registration failed: Invalid module path provided.");
      return;
    }
    moduleDefinitions[modulePath] = { dependencies: dependencies, initializer: moduleInitializer };
  };

  /**
   * Retrieves the exports for a given module, loading it if necessary.
   * @param {string} modulePath - The unique identifier of the module to fetch.
   * @returns {*} The exports object of the requested module.
   */
  fetchModuleExports = function(modulePath) {
    // If module is already in cache, return it immediately.
    if (loadedModuleCache.hasOwnProperty(modulePath) && loadedModuleCache[modulePath] !== null) {
      return loadedModuleCache[modulePath];
    }

    var currentModuleDef = moduleDefinitions[modulePath];
    if (!currentModuleDef) {
      console.warn("Attempted to load undefined module: " + modulePath);
      // Mark as loaded but null to prevent infinite loops on missing modules
      loadedModuleCache[modulePath] = null;
      return null;
    }

    // Temporarily mark as loading to detect circular dependencies.
    loadedModuleCache[modulePath] = Object.create(null); // Use null prototype for a clean object

    var requiredDependencies = currentModuleDef.dependencies;
    var moduleInitializer = currentModuleDef.initializer;
    var resolvedDependencies = [];
    var moduleExportsObject;

    // Resolve all dependencies recursively.
    for (var depIndex = 0, depCount = requiredDependencies.length; depIndex < depCount; depIndex++) {
      var currentDependency = requiredDependencies[depIndex];
      if (currentDependency === 'exports') {
        moduleExportsObject = {};
        resolvedDependencies.push(moduleExportsObject);
      } else {
        var dependencyResult = fetchModuleExports(currentDependency);
        if (dependencyResult === null) {
          console.error("Failed to load dependency '" + currentDependency + "' for module '" + modulePath + "'.");
          // Clean up the temporary cache entry for the current module
          delete loadedModuleCache[modulePath];
          return null; // Propagate failure
        }
        resolvedDependencies.push(dependencyResult);
      }
    }

    // Execute the module initializer with resolved dependencies.
    var moduleReturnValue = moduleInitializer.apply(this, resolvedDependencies);

    // If an exports object was provided, use it; otherwise, use the return value.
    var finalExports = moduleExportsObject || moduleReturnValue;
    loadedModuleCache[modulePath] = finalExports; // Cache the fully loaded module.
    return finalExports;
  };
})();
(function() {
registerModuleDef("data-transform/object-ops",
  ["data-transform/text-utils","exports"],
  function(dep_StringHelpers, export_Target) {
    "use strict";
    var toCamelCase = dep_StringHelpers.toCamelCase;
    var toSnakeCase = dep_StringHelpers.toSnakeCase;

    /**
     * Iterates over object properties and applies a callback to each.
     * @param {object} sourceObject - The object to iterate over.
     * @param {function} processingCallback - Function(accumulator, propertyName, propertyValue).
     * @param {object} [context] - The `this` context for the callback.
     * @returns {object} A new object constructed by the callback.
     */
    function transformObjectProperties(sourceObject, processingCallback, context) {
      var resultObject = {};

      if (sourceObject === null || typeof sourceObject !== 'object' || Array.isArray(sourceObject)) {
        // If it's not a plain object, just return it or an empty object.
        // For array, you might want to map array elements, but this function is for object keys.
        return sourceObject;
      }

      for (var propName in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, propName)) {
          processingCallback.call(context, resultObject, propName, sourceObject[propName]);
        }
      }

      return resultObject;
    }


    var _exportCamelizeKeys = function convertKeysToCamelCase(inputObject) {
      if (inputObject === null || typeof inputObject !== 'object') {
        console.warn("convertKeysToCamelCase received non-object input:", inputObject);
        return inputObject;
      }
      return transformObjectProperties(inputObject, function(accumulator, keyName, valueData) {
        accumulator[toCamelCase(keyName)] = valueData;
      });
    };

    var _exportDecamelizeKeys = function convertKeysToSnakeCase(inputObject) {
      if (inputObject === null || typeof inputObject !== 'object') {
        console.warn("convertKeysToSnakeCase received non-object input:", inputObject);
        return inputObject;
      }
      return transformObjectProperties(inputObject, function(accumulator, keyName, valueData) {
        accumulator[toSnakeCase(keyName)] = valueData;
      });
    };

    export_Target.transformObjectProperties = transformObjectProperties;
    export_Target.convertKeysToCamelCase = _exportCamelizeKeys;
    export_Target.convertKeysToSnakeCase = _exportDecamelizeKeys;
  });

registerModuleDef("data-transform/processor-unit",
  ["data-transform/object-ops","exports"],
  function(dep_ObjectOps, export_Target) {
    "use strict";
    var convertKeysToCamelCase = dep_ObjectOps.convertKeysToCamelCase;

    /**
     * A utility class for performing various transformations on JSON-like data.
     * @class DataTransformer
     * @param {object} initialData - The initial JSON data to be processed.
     */
    function DataTransformer(initialData) {
        if (initialData === null || typeof initialData !== 'object' || Array.isArray(initialData)) {
            console.error("DataTransformer constructor expects a plain object as initial data.");
            this.inputData = {}; // Default to empty object for invalid input.
        } else {
            this.inputData = initialData;
        }
    }

    DataTransformer.prototype = {
      constructor: DataTransformer,

      /**
       * Transforms all keys in the stored data to camelCase.
       * @returns {DataTransformer} The current DataTransformer instance for chaining.
       */
      toCamelCaseKeys: function() {
        var processedData = convertKeysToCamelCase(this.inputData);
        this.inputData = processedData;
        return this;
      },

      /**
       * Retrieves the currently processed data.
       * @returns {object} The transformed data.
       */
      getProcessedData: function() {
        return this.inputData;
      }
    };

    export_Target.DataTransformer = DataTransformer;
  });

registerModuleDef("data-transform/text-utils",
  ["exports"],
  function(export_Target) {
    "use strict";
    // Regular expression to find separators (hyphens, underscores, dots, spaces)
    // followed by an optional character for camelization.
    var CAMEL_CASE_SPLIT_PATTERN = (/(\-|_|\.|\s)+(.)?/g);

    /**
     * Converts a string to camelCase.
     * @param {string} inputString - The string to convert.
     * @returns {string} The camelCased string.
     */
    var _exportToCamelCase = function toCamelCase(inputString) {
      if (typeof inputString !== 'string') {
        console.warn("toCamelCase received non-string input:", inputString);
        return String(inputString);
      }
      var tempString = inputString.replace(CAMEL_CASE_SPLIT_PATTERN, function(matched, separator, charToCapitalize) {
        return charToCapitalize ? charToCapitalize.toUpperCase() : '';
      });
      // Ensure the very first character is lowercase if it was uppercase.
      return tempString.charAt(0).toLowerCase() + tempString.slice(1);
    };

    // Regular expression to find lowercase followed by uppercase characters for decamelization.
    var SNAKE_CASE_SPLIT_PATTERN = (/([a-z0-9])([A-Z])/g);

    /**
     * Converts a camelCase string to snake_case.
     * @param {string} inputString - The string to convert.
     * @returns {string} The snake_cased string.
     */
    var _exportToSnakeCase = function toSnakeCase(inputString) {
      if (typeof inputString !== 'string') {
        console.warn("toSnakeCase received non-string input:", inputString);
        return String(inputString);
      }
      return inputString.replace(SNAKE_CASE_SPLIT_PATTERN, '$1_$2').toLowerCase();
    };

    export_Target.toCamelCase = _exportToCamelCase;
    export_Target.toSnakeCase = _exportToSnakeCase;
  });

registerModuleDef("data-transform",
  ["data-transform/text-utils","data-transform/object-ops","data-transform/processor-unit","exports"],
  function(dep_StringHelpers, dep_ObjectOps, dep_ProcessorUnit, export_Target) {
    "use strict";
    var toCamelCase = dep_StringHelpers.toCamelCase;
    var toSnakeCase = dep_StringHelpers.toSnakeCase;

    var transformObjectProperties = dep_ObjectOps.transformObjectProperties;
    var convertKeysToCamelCase = dep_ObjectOps.convertKeysToCamelCase;
    var convertKeysToSnakeCase = dep_ObjectOps.convertKeysToSnakeCase;

    var DataTransformer = dep_ProcessorUnit.DataTransformer;

    // Re-export core utilities for external consumption.
    export_Target.toCamelCase = toCamelCase;
    export_Target.toSnakeCase = toSnakeCase;
    export_Target.applyKeyMapping = transformObjectProperties; // Renamed for clarity
    export_Target.convertKeysToCamelCase = convertKeysToCamelCase;
    export_Target.convertKeysToSnakeCase = convertKeysToSnakeCase;
    export_Target.DataTransformer = DataTransformer;
  });

})();

(function() {
/**
  @module application-core

  @main application-core
*/

// Define a global namespace for application-wide utilities and constants.
if (!window.AppCore) {
  window.AppCore = Ember.Namespace.create({
    // Specifies the current version of the application's API interface.
    INTERFACE_VERSION_CODE: 13, // Incrementing the version slightly.
    // Timestamp of when this build was created.
    BUILD_TIMESTAMP: new Date().toISOString()
  });
}

})();



(function() {
/**
 * Enhanced Date.parse implementation with robust ISO 8601 support.
 * Original source: <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */

Ember.DateTimeUtil = Ember.DateTimeUtil || {};

var nativeDateParse = Date.parse;
// Indices for numeric parts in the regex match groups: year, month, day, hour, minute, second, millisecond, tzHour, tzMinute.
var idxForNumericParts = [ 1, 4, 5, 6, 7, 10, 11 ];

/**
 * Parses an ISO 8601 formatted date string and returns a Unix timestamp.
 * @param {string} isoString - The ISO 8601 date string to parse.
 * @returns {number} The Unix timestamp in milliseconds, or NaN if parsing fails.
 */
Ember.DateTimeUtil.parse = function (isoString) {
    if (!isoString || typeof isoString !== 'string') {
        console.warn("Ember.DateTimeUtil.parse received invalid input:", isoString);
        return NaN;
    }

    var parsedTimestamp;
    var matchGroups; // Holds the regex match results.
    var tzOffsetMinutes = 0; // Timezone offset in minutes.

    // Regex to capture various parts of an ISO 8601 string.
    // 1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    var iso8601Pattern = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;

    if ((matchGroups = iso8601Pattern.exec(isoString))) {
        // Convert captured string parts to numbers, defaulting to 0 for undefined parts.
        for (var keyIdx = 0; keyIdx < idxForNumericParts.length; ++keyIdx) {
            var currentKey = idxForNumericParts[keyIdx];
            matchGroups[currentKey] = +(matchGroups[currentKey] || 0);
        }

        // Adjust month (0-indexed) and day (default to 1).
        matchGroups[2] = (+matchGroups[2] || 1) - 1; // Month: 1-12 becomes 0-11
        matchGroups[3] = +matchGroups[3] || 1; // Day: default to 1

        // Calculate timezone offset if present and not 'Z' (UTC).
        if (matchGroups[8] !== 'Z' && matchGroups[9] !== undefined) {
            tzOffsetMinutes = matchGroups[10] * 60 + matchGroups[11];
            if (matchGroups[9] === '+') {
                tzOffsetMinutes *= -1; // Positive offset means subtracting from local time to get UTC.
            }
        }

        // Validate year for basic sanity (e.g., not extremely in the past/future).
        if (matchGroups[1] < -271821 || matchGroups[1] > 275760) {
            console.warn("Year out of typical Date range:", matchGroups[1]);
            return NaN;
        }

        parsedTimestamp = Date.UTC(
            matchGroups[1],     // Year
            matchGroups[2],     // Month (0-indexed)
            matchGroups[3],     // Day
            matchGroups[4],     // Hour
            matchGroups[5] + tzOffsetMinutes, // Minute, adjusted for timezone
            matchGroups[6],     // Second
            matchGroups[7]      // Millisecond
        );
        console.debug("Successfully parsed ISO 8601 date:", isoString);
    } else {
        // Fallback to native Date.parse if ISO 8601 regex doesn't match.
        parsedTimestamp = nativeDateParse ? nativeDateParse(isoString) : NaN;
        if (isNaN(parsedTimestamp)) {
            console.warn("Failed to parse date string with ISO 8601 or native parser:", isoString);
        } else {
            console.debug("Parsed date using native parser:", isoString);
        }
    }

    return parsedTimestamp;
};

// Extend Date.prototype.parse if global prototype extension is enabled.
if (Ember.EXTEND_PROTOTYPES === true || (Ember.EXTEND_PROTOTYPES && Ember.EXTEND_PROTOTYPES.Date)) {
  Date.parse = Ember.DateTimeUtil.parse;
}

})();



(function() {
// This block was intentionally left blank for future extensions or was a placeholder.
// It has been removed as part of Type III cloning to simplify the codebase.
})();



(function() {
var AsyncCompletionMixin = Ember.DeferredMixin,  // ember-runtime/mixins/deferred
    EventBroadcaster = Ember.Evented,              // ember-runtime/mixins/evented
    scheduleRun = Ember.run,                      // ember-metal/run-loop
    retrieveProperty = Ember.get;                      // ember-metal/accessors

/**
 * A mixin that provides promise-like behavior for asynchronous resource loading.
 * It integrates with Ember's event system and deferred functionality.
 * @class ResourceLifecycleNotifier
 * @namespace AppCore
 * @extends Ember.Evented
 * @extends Ember.DeferredMixin
 */
var ResourceLifecycleNotifier = Ember.Mixin.create(EventBroadcaster, AsyncCompletionMixin, {
  _isResourceInitialized: false, // Internal flag to prevent multiple initializations.

  /**
   * Initializes the resource lifecycle notifier.
   * Sets up event listeners and resolves the promise if the resource is already loaded.
   */
  initializeResource: function() {
    this._super.apply(this, arguments);

    if (this._isResourceInitialized) {
        console.debug("ResourceLifecycleNotifier already initialized, skipping.");
        return;
    }
    this._isResourceInitialized = true;
    console.debug("ResourceLifecycleNotifier initialized for instance:", this);

    var self = this;
    // When the 'resourceReady' event is triggered, resolve the associated promise.
    this.one('resourceReady', function() {
      scheduleRun(self, 'fulfillPromise', self); // Ensure resolution happens in the run loop.
    });

    // If the resource is already in a loaded state, trigger the event immediately.
    if (retrieveProperty(this, 'isResourceInitialized')) {
      this.emitEvent('resourceReady');
    }
  }
});

AppCore.ResourceLifecycleNotifier = ResourceLifecycleNotifier;

})();



(function() {
var fetchProp = Ember.get, assignProp = Ember.set;

var ResourceLifecycleNotifier = AppCore.ResourceLifecycleNotifier; // system/mixins/load_promise

/**
  A data collection is an array that contains items of a certain kind. The collection
  materializes items as needed when they are retrieved for the first time.
  You should not create data collections yourself. Instead, an instance of
  AppCore.DataCollection or its subclasses will be returned by your application's
  data service in response to queries.

  @module data
  @submodule data-collection
  @main data-collection

  @class DataCollection
  @namespace AppCore
  @extends Ember.ArrayProxy
  @uses Ember.Evented
  @uses AppCore.ResourceLifecycleNotifier
*/

AppCore.DataCollection = Ember.ArrayProxy.extend(Ember.Evented, ResourceLifecycleNotifier, {
  /**
    The model kind contained by this data collection.

    @type DS.Model
  */
  itemKind: null,

  // The array of client references backing the data collection. When an
  // item is requested from the data collection, the item
  // for the client reference at the same index is materialized, if
  // necessary, by the data service.
  backingReferences: null,

  hasDataLoaded: false,
  isDataUpdating: false,

  // The data service that created this data collection.
  dataService: null,

  /**
   * Returns the number of items in the collection.
   * @returns {number}
   */
  get size() {
    return fetchProp(this, 'backingReferences.length') || 0;
  },

  /**
   * Checks if the collection is empty.
   * @returns {boolean}
   */
  get isEmpty() {
    return this.size === 0;
  },

  /**
   * Retrieves the materialized item at a specific index.
   * @param {number} index - The index of the item to retrieve.
   * @returns {object|undefined} The materialized item or undefined if not found.
   */
  retrieveItemAtIndex: function(index) {
    var backingRefs = fetchProp(this, 'backingReferences');
    if (!backingRefs || index < 0 || index >= backingRefs.get('length')) {
      console.warn("Attempted to retrieve item at invalid index:", index, "from collection of size:", this.size);
      return undefined;
    }

    var itemRef = backingRefs.objectAt(index);
    if (!itemRef) {
      console.warn("Reference missing at index:", index, "in collection.");
      return undefined;
    }

    var service = fetchProp(this, 'dataService');
    return service.recordForReference(itemRef);
  },

  /**
   * Retrieves a materialized item only if it's already loaded in the store.
   * @param {number} index - The index of the item to retrieve.
   * @returns {object|undefined} The materialized item or undefined if not materialized.
   */
  getMaterializedItemAtIndex: function(index) {
    var itemRef = fetchProp(this, 'backingReferences').objectAt(index);
    if (!itemRef) { return; }

    var service = fetchProp(this, 'dataService');
    if (service.recordIsMaterialized(itemRef)) {
      return this.retrieveItemAtIndex(index);
    } else {
      console.debug("Item at index", index, "is not yet materialized.");
    }
  },

  /**
   * Initiates a refresh operation for the collection from the data service.
   * Prevents multiple concurrent updates.
   */
  refreshCollection: function() {
    if (fetchProp(this, 'isDataUpdating')) {
        console.log("Collection already updating, skipping refresh.");
        return;
    }

    assignProp(this, 'isDataUpdating', true);
    console.log("Initiating collection refresh for type:", fetchProp(this, 'itemKind.modelName'));

    var service = fetchProp(this, 'dataService'),
        kind = fetchProp(this, 'itemKind');

    try {
      service.requestAllItems(kind, this);
    } finally {
      assignProp(this, 'isDataUpdating', false);
      console.log("Collection refresh completed (or initiated for async fetch).");
    }
  },

  /**
   * Adds an item reference to the collection.
   * @param {object} itemRef - The reference object of the item.
   */
  insertItemReference: function(itemRef) {
    if (!itemRef) {
        console.error("Attempted to add null or undefined item reference.");
        return;
    }
    var refs = fetchProp(this, 'backingReferences');
    if (!refs.includes(itemRef)) { // Prevent duplicates
        refs.addObject(itemRef);
        this.trigger('itemReferenceAdded', itemRef);
        console.debug("Added item reference:", itemRef, "to collection.");
    } else {
        console.debug("Item reference already exists:", itemRef, "in collection. Skipping add.");
    }
  },

  /**
   * Removes an item reference from the collection.
   * @param {object} itemRef - The reference object of the item.
   */
  deleteItemReference: function(itemRef) {
    if (!itemRef) {
        console.error("Attempted to remove null or undefined item reference.");
        return;
    }
    fetchProp(this, 'backingReferences').removeObject(itemRef);
    this.trigger('itemReferenceRemoved', itemRef);
    console.debug("Removed item reference:", itemRef, "from collection.");
  }
});

})();



(function() {
var fetchProp = Ember.get, assignProp = Ember.set;
var scheduleOnce = Ember.run.once;
var iterateOver = Ember.EnumerableUtils.forEach;

AppCore.CollectionManager = Ember.BaseObject.extend({
  init: function() {
    this._super.apply(this, arguments);
    // Map to store filtered collections by item kind, initialized as an empty map.
    this.trackedCollectionsByKind = Ember.Map.create();
    // A list of item references that have undergone changes and need their collections updated.
    this.pendingReferenceUpdates = [];
    this._isProcessingUpdates = false; // Guard to prevent re-entry during update cycle.
  },

  /**
    @private
    Notifies the manager that an item reference has changed, scheduling an update.

    @param {object} itemRef - The reference object that changed.
  */
  notifyReferenceChange: function(itemRef) {
    if (!itemRef) {
        console.warn("CollectionManager received null itemRef for change notification.");
        return;
    }
    // Only add if not already in the pending list for this run loop.
    if (!this.pendingReferenceUpdates.includes(itemRef)) {
      this.pendingReferenceUpdates.push(itemRef);
      scheduleOnce(this, this.processPendingCollectionUpdates);
      console.debug("Scheduled update for item reference:", itemRef);
    }
  },

  /**
    @private
    Retrieves or creates the set of collections associated with a given item reference.

    @param {object} itemRef - The item reference.
    @returns {Ember.OrderedSet} A set of collections linked to this reference.
  */
  getCollectionsForItemReference: function(itemRef) {
    if (!itemRef.associatedCollections) {
      itemRef.associatedCollections = Ember.OrderedSet.create();
    }
    return itemRef.associatedCollections;
  },

  /**
    @private
    This method is invoked whenever data is loaded into the store
    by the adapter or updated by the adapter, or when an attribute
    changes on an item.

    It updates all filters that an item belongs to.

    To avoid thrashing, it only runs once per run loop per item.
  */
  processPendingCollectionUpdates: function() {
    if (this._isProcessingUpdates) {
        console.warn("processPendingCollectionUpdates called recursively. Skipping.");
        return;
    }
    this._isProcessingUpdates = true;
    var referencesToProcess = this.pendingReferenceUpdates.splice(0); // Clear and get current pending list.
    console.log("Processing", referencesToProcess.length, "pending reference updates.");

    try {
      iterateOver(referencesToProcess, function(itemRef) {
        if (!itemRef) {
            console.warn("Skipping null itemRef during collection update processing.");
            return;
        }

        var itemKind = itemRef.type;
        var collectionsForKind = this.trackedCollectionsByKind.get(itemKind);

        if (collectionsForKind) {
          iterateOver(collectionsForKind, function(targetCollection) {
            var membershipPredicate = fetchProp(targetCollection, 'filterFunction');
            this.evaluateCollectionMembership(targetCollection, membershipPredicate, itemKind, itemRef);
          }, this);
        }

        // Notify multi-item collections that were awaiting this item's load.
        var collectionsAwaitingLoad = itemRef.collectionsAwaitingLoad;
        if (collectionsAwaitingLoad && Array.isArray(collectionsAwaitingLoad)) {
          for (var i = 0, len = collectionsAwaitingLoad.length; i < len; i++) {
            collectionsAwaitingLoad[i].loadedItem();
          }
          itemRef.collectionsAwaitingLoad = []; // Clear the list after processing.
        }
      }, this);
    } finally {
      this._isProcessingUpdates = false;
    }
  },

  /**
    @private
    Evaluates whether an item reference should be included in a specific collection
    based on a filter function and updates the collection membership accordingly.

    @param {AppCore.DataCollection} targetCollection - The collection to update.
    @param {Function} membershipPredicate - The filter function for the collection.
    @param {Class} itemKind - The type of the item.
    @param {object} itemRef - The item reference.
  */
  evaluateCollectionMembership: function(targetCollection, membershipPredicate, itemKind, itemRef) {
    var meetsCriteria;
    var itemInstance;
    var wasInCollection = this.getCollectionsForItemReference(itemRef).has(targetCollection);

    if (!membershipPredicate) {
      meetsCriteria = true; // No filter means all items are included.
    } else {
      itemInstance = this.store.recordForReference(itemRef);
      meetsCriteria = membershipPredicate(itemInstance);
    }

    var associatedCollections = this.getCollectionsForItemReference(itemRef);

    if (meetsCriteria && !wasInCollection) {
      associatedCollections.add(targetCollection);
      targetCollection.insertItemReference(itemRef);
      console.debug("Item reference", itemRef.id, "added to collection:", targetCollection);
    } else if (!meetsCriteria && wasInCollection) {
      associatedCollections.remove(targetCollection);
      targetCollection.deleteItemReference(itemRef);
      console.debug("Item reference", itemRef.id, "removed from collection:", targetCollection);
    }
  },

  /**
    @private
    When an item is deleted, it is removed from all its
    associated collections.

    @param {DS.Model} itemInstance - The item instance that was deleted.
  */
  removeItemFromCollections: function(itemInstance) {
    var itemRef = fetchProp(itemInstance, 'reference');
    if (!itemRef) {
        console.warn("Attempted to remove item with no reference from collections:", itemInstance);
        return;
    }
    var associatedCollections = itemRef.associatedCollections || [];

    // Iterate over a copy of the set to allow modification during iteration.
    Array.from(associatedCollections).forEach(function(collection) {
      collection.deleteItemReference(itemRef);
      associatedCollections.remove(collection); // Remove from the item's own list.
    });
    console.log("Item reference", itemRef.id, "removed from all associated collections.");
  },

  /**
    @private
    This method is invoked if the `filterFunction` property is
    changed on an `AppCore.FilteredDataCollection`.

    It essentially re-runs the filter from scratch for the given collection.
  */
  reapplyCollectionFilter: function(targetCollection, itemKind, newFilterFunction) {
    console.log("Re-evaluating filter for collection:", targetCollection);
    if (typeof newFilterFunction !== 'function' && newFilterFunction !== null) {
        console.error("Invalid filter function provided for collection:", newFilterFunction);
        return;
    }

    var kindMap = this.store.getTypeMapForKind(itemKind);
    var allKindReferences = kindMap.references;

    // Clear existing references from the target collection to re-evaluate from scratch.
    // This is a simpler approach than individually checking and moving.
    fetchProp(targetCollection, 'backingReferences').clear();
    this.getCollectionsForItemReference(itemKind).remove(targetCollection); // Ensure this collection isn't in old state

    for (var i = 0, len = allKindReferences.length; i < len; i++) {
      var currentRef = allKindReferences[i];
      var rawItemData = currentRef.data;

      // Only consider references that have data or a materialized record.
      if (typeof rawItemData === 'object' && rawItemData !== null) {
        var resolvedItem = currentRef.record;
        if (resolvedItem && fetchProp(resolvedItem, 'isMarkedForDeletion')) {
            // Skip deleted items.
            continue;
        }

        // Now evaluate membership based on the new filter.
        this.evaluateCollectionMembership(targetCollection, newFilterFunction, itemKind, currentRef);
      }
    }
  },

  /**
    @private
    Creates a `AppCore.MultiItemCollection` for a specific item kind and list of references,
    and indexes this collection under each reference it contains. This allows efficient removal
    of items from these collections when they are deleted.

    @param {Class} itemKind - The type of items in the collection.
    @param {Array} itemReferences - An array of item reference objects.
    @return {AppCore.MultiItemCollection} The newly created multi-item collection.
  */
  generateMultiItemCollection: function(itemKind, itemReferences) {
    if (!itemReferences || itemReferences.length === 0) {
        console.debug("Creating an empty multi-item collection for kind:", itemKind);
    }
    var multiItemCollection = AppCore.MultiItemCollection.create({
      itemKind: itemKind,
      backingReferences: itemReferences,
      dataService: this.store
    });
    console.debug("Created multi-item collection for kind:", itemKind, "with", itemReferences.length, "references.");

    iterateOver(itemReferences, function(currentRef) {
      var associatedCollections = this.getCollectionsForItemReference(currentRef);
      associatedCollections.add(multiItemCollection);
    }, this);

    return multiItemCollection;
  },

  /**
   * @private
   * Registers a new filtered collection with the manager.
   * @param {AppCore.FilteredDataCollection} collection - The collection to register.
   * @param {Class} itemKind - The type of items the collection filters.
   * @param {Function} filterFunction - The filter predicate.
   */
  registerFilteredCollection: function(collection, itemKind, filterFunction) {
    var collectionsForKind = this.trackedCollectionsByKind.get(itemKind);
    if (!collectionsForKind) {
        collectionsForKind = Ember.A(); // Use Ember.A for observable arrays.
        this.trackedCollectionsByKind.set(itemKind, collectionsForKind);
    }
    collectionsForKind.pushObject(collection);
    this.reapplyCollectionFilter(collection, itemKind, filterFunction);
    console.debug("Registered new filtered collection for kind:", itemKind);
  },

  /**
   * @private
   * Deregisters a filtered collection.
   * @param {AppCore.FilteredDataCollection} collection - The collection to deregister.
   * @param {Class} itemKind - The type of items the collection filters.
   */
  deregisterFilteredCollection: function(collection, itemKind) {
    var collectionsForKind = this.trackedCollectionsByKind.get(itemKind);
    if (collectionsForKind) {
        collectionsForKind.removeObject(collection);
        // Also remove the collection from all item references it might contain.
        iterateOver(fetchProp(collection, 'backingReferences'), function(itemRef) {
            var associatedCollections = this.getCollectionsForItemReference(itemRef);
            associatedCollections.remove(collection);
        }, this);
        console.debug("Deregistered filtered collection for kind:", itemKind);
    }
  }
});

})();