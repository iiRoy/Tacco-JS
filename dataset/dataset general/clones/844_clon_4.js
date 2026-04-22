(function() {
  const ApplicationKernel = {};
  window.AppCore = ApplicationKernel;

  const ComponentManager = (function() {
    const componentMap = new Map();
    const loadedInstances = new Map();

    function registerComponent(componentIdentifier, requiredDependencies, componentInitializer) {
      componentMap.set(componentIdentifier, { requiredDependencies, componentInitializer });
    }

    function obtainComponent(componentIdentifier) {
      if (loadedInstances.has(componentIdentifier)) {
        return loadedInstances.get(componentIdentifier);
      }

      const componentDetails = componentMap.get(componentIdentifier);
      if (!componentDetails) {
        throw new Error(`Component '${componentIdentifier}' not found.`);
      }

      loadedInstances.set(componentIdentifier, {}); // Placeholder for circular dependencies

      const resolvedDependencies = componentDetails.requiredDependencies.map(depIdentifier => {
        if (depIdentifier === 'exports') {
          return loadedInstances.get(componentIdentifier);
        }
        return obtainComponent(depIdentifier);
      });

      const componentResult = componentDetails.componentInitializer.apply(null, resolvedDependencies);
      const finalExportedValue = resolvedDependencies.find(dep => dep === loadedInstances.get(componentIdentifier)) || componentResult;
      loadedInstances.set(componentIdentifier, finalExportedValue);
      return finalExportedValue;
    }

    return { registerComponent, obtainComponent };
  })();

  const modRegister = ComponentManager.registerComponent;
  const modRetrieve = ComponentManager.obtainComponent;

  modRegister("str-util/txt-case",
    ["exports"],
    function(modExports) {
      "use strict";

      function transformToCamelCase(textValue) {
        let transformed = '';
        let shouldCapitalizeNext = false;
        if (!textValue) return '';

        transformed += textValue.charAt(0).toLowerCase();

        for (let i = 1; i < textValue.length; i++) {
          const char = textValue[i];
          if (char === '-' || char === '_' || char === '.' || char === ' ') {
            shouldCapitalizeNext = true;
          } else {
            if (shouldCapitalizeNext) {
              transformed += char.toUpperCase();
              shouldCapitalizeNext = false;
            } else {
              transformed += char;
            }
          }
        }
        return transformed;
      }

      function transformToSnakeCase(textValue) {
        let transformed = '';
        if (!textValue) return '';

        for (let i = 0; i < textValue.length; i++) {
          const char = textValue[i];
          if (char >= 'A' && char <= 'Z') {
            if (i > 0 && transformed[transformed.length - 1] !== '_') {
              transformed += '_';
            }
            transformed += char.toLowerCase();
          } else {
            transformed += char;
          }
        }
        return transformed;
      }

      modExports.toCamel = transformToCamelCase;
      modExports.toSnake = transformToSnakeCase;
    });

  modRegister("obj-util/key-transform",
    ["str-util/txt-case", "exports"],
    function(stringProcessor, modExports) {
      "use strict";
      const { toCamel, toSnake } = stringProcessor;

      function traverseAndModify(inputObject, keyModifierCallback, context) {
        const outputObject = {};
        for (const currentKey in inputObject) {
          keyModifierCallback.call(context, outputObject, currentKey, inputObject[currentKey]);
        }
        return outputObject;
      }

      function convertKeysToCamelCase(inputObject) {
        return traverseAndModify(inputObject, function(accumulator, originalKey, value) {
          accumulator[toCamel(originalKey)] = value;
        });
      }

      function convertKeysToSnakeCase(inputObject) {
        return traverseAndModify(inputObject, function(accumulator, originalKey, value) {
          accumulator[toSnake(originalKey)] = value;
        });
      }

      modExports.alterKeys = traverseAndModify;
      modExports.camelCaseKeys = convertKeysToCamelCase;
      modExports.snakeCaseKeys = convertKeysToSnakeCase;
    });

  modRegister("data-struct/transformer",
    ["obj-util/key-transform", "exports"],
    function(objectKeyProcessor, modExports) {
      "use strict";
      const { camelCaseKeys } = objectKeyProcessor;

      class DataTransformer {
        constructor(initialData) {
          this.currentData = initialData;
        }

        applyCamelCaseToKeys() {
          this.currentData = camelCaseKeys(this.currentData);
          return this;
        }
      }

      modExports.DataTransformer = DataTransformer;
    });

  modRegister("data-struct/main-module",
    ["str-util/txt-case", "obj-util/key-transform", "data-struct/transformer", "exports"],
    function(stringProcessor, objectKeyProcessor, dataTransformer, modExports) {
      "use strict";
      modExports.camelizeStr = stringProcessor.toCamel;
      modExports.decamelizeStr = stringProcessor.toSnake;
      modExports.alterObjectKeys = objectKeyProcessor.alterKeys;
      modExports.camelizeObjectKeys = objectKeyProcessor.camelCaseKeys;
      modExports.decamelizeObjectKeys = objectKeyProcessor.snakeCaseKeys;
      modExports.DataProcessor = dataTransformer.DataTransformer;
    });
})();

(function() {
  window.AppCore = window.AppCore || {};
  window.AppCore.API_VERSION = 12;
})();

(function() {
  window.AppCore = window.AppCore || {};
  AppCore.DateTime = AppCore.DateTime || {};
  const originalDateParse = Date.parse;

  AppCore.DateTime.parseISO = function(inputString) {
    let year = 0, month = 0, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0;
    let tzOffsetMinutes = 0;

    // A simplified check for ISO-like format. Original uses a very specific regex.
    // This allows falling back to native parser for non-ISO or complex edge cases.
    if (!/^\d{4}(-\d{2}(-\d{2})?)?(T(\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?)?(Z|[+\-]\d{2}(:\d{2})?)?)?$/.test(inputString)) {
      return originalDateParse ? originalDateParse(inputString) : NaN;
    }

    const dateTimeParts = inputString.split('T');
    const dateSegment = dateTimeParts[0];
    const timeSegment = dateTimeParts[1];

    const dateComponents = dateSegment.split('-');
    year = parseInt(dateComponents[0], 10);
    if (isNaN(year)) return originalDateParse ? originalDateParse(inputString) : NaN;

    if (dateComponents.length > 1) {
      month = (parseInt(dateComponents[1], 10) || 1) - 1;
      if (isNaN(month)) return originalDateParse ? originalDateParse(inputString) : NaN;
    }
    if (dateComponents.length > 2) {
      day = parseInt(dateComponents[2], 10) || 1;
      if (isNaN(day)) return originalDateParse ? originalDateParse(inputString) : NaN;
    }

    if (timeSegment) {
      let timeAndTzString = timeSegment;
      let tzSpecifier = '';

      const zIndex = timeAndTzString.indexOf('Z');
      const plusIndex = timeAndTzString.indexOf('+');
      const minusIndex = timeAndTzString.indexOf('-', timeAndTzString.indexOf('T') + 1); // Ensure it's for TZ, not negative year

      let effectiveTzIndex = -1;
      if (zIndex !== -1) effectiveTzIndex = zIndex;
      else if (plusIndex !== -1 && (minusIndex === -1 || plusIndex < minusIndex)) effectiveTzIndex = plusIndex;
      else if (minusIndex !== -1) effectiveTzIndex = minusIndex;

      if (effectiveTzIndex !== -1) {
        tzSpecifier = timeAndTzString.substring(effectiveTzIndex);
        timeAndTzString = timeAndTzString.substring(0, effectiveTzIndex);

        if (tzSpecifier !== 'Z') {
          const tzSignMultiplier = (tzSpecifier.charAt(0) === '+') ? -1 : 1;
          const tzComponents = tzSpecifier.substring(1).split(':');
          const tzHours = parseInt(tzComponents[0], 10) || 0;
          const tzMins = (tzComponents.length > 1) ? (parseInt(tzComponents[1], 10) || 0) : 0;
          if (isNaN(tzHours) || isNaN(tzMins)) return originalDateParse ? originalDateParse(inputString) : NaN;
          tzOffsetMinutes = tzSignMultiplier * (tzHours * 60 + tzMins);
        }
      }

      const timeComponents = timeAndTzString.split(':');
      hour = parseInt(timeComponents[0], 10) || 0;
      if (isNaN(hour)) return originalDateParse ? originalDateParse(inputString) : NaN;

      if (timeComponents.length > 1) {
        minute = parseInt(timeComponents[1], 10) || 0;
        if (isNaN(minute)) return originalDateParse ? originalDateParse(inputString) : NaN;
      }
      if (timeComponents.length > 2) {
        const secAndMs = timeComponents[2].split('.');
        second = parseInt(secAndMs[0], 10) || 0;
        if (isNaN(second)) return originalDateParse ? originalDateParse(inputString) : NaN;
        if (secAndMs.length > 1) {
          millisecond = parseInt(secAndMs[1].substring(0, 3), 10) || 0;
          if (isNaN(millisecond)) return originalDateParse ? originalDateParse(inputString) : NaN;
        }
      }
    }

    const utcTimestamp = Date.UTC(year, month, day, hour, minute + tzOffsetMinutes, second, millisecond);
    return isNaN(utcTimestamp) ? (originalDateParse ? originalDateParse(inputString) : NaN) : utcTimestamp;
  };

  if (typeof AppCore.CONFIG_SETTINGS === 'undefined' || AppCore.CONFIG_SETTINGS.ENABLE_DATE_PARSE_OVERRIDE || AppCore.CONFIG_SETTINGS.EXTEND_NATIVE_TYPES) {
    Date.parse = AppCore.DateTime.parseISO;
  }
})();

(function() {
  class Dispatcher {
    constructor() {
      this.listeners = new Map();
    }

    on(eventName, callback) {
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, new Set());
      }
      this.listeners.get(eventName).add(callback);
    }

    off(eventName, callback) {
      if (this.listeners.has(eventName)) {
        this.listeners.get(eventName).delete(callback);
      }
    }

    once(eventName, callback) {
      const self = this;
      const oneTimeWrapper = function(...args) {
        callback.apply(this, args);
        self.off(eventName, oneTimeWrapper);
      };
      this.on(eventName, oneTimeWrapper);
    }

    emit(eventName, ...args) {
      if (this.listeners.has(eventName)) {
        this.listeners.get(eventName).forEach(callback => {
          callback.apply(this, args);
        });
      }
    }
  }

  class LoadStateManager extends Dispatcher {
    constructor() {
      super();
      this.dataLoaded = false;
      this.loadPromise = new Promise((resolve) => {
        this.resolveLoad = resolve;
      });

      this.once('contentAvailable', () => {
        setTimeout(() => this.resolveLoad(this), 0);
      });
    }

    get isDataLoaded() {
      return this.dataLoaded;
    }

    markDataAsLoaded() {
      if (!this.dataLoaded) {
        this.dataLoaded = true;
        this.emit('contentAvailable');
      }
    }

    get promiseForLoad() {
      return this.loadPromise;
    }
  }

  AppCore.LoadState = LoadStateManager;
})();

(function() {
  const { LoadState } = AppCore;

  class IdentifierCollection extends LoadState {
    constructor(collectionType, dataStore) {
      super();
      this.itemKind = collectionType;
      this.itemIdentifiers = [];
      this.dataStore = dataStore;
      this.isUpdatingCollection = false;

      if (this.isDataLoaded) {
        this.markDataAsLoaded();
      }
    }

    get length() {
      return this.itemIdentifiers.length;
    }

    retrieveItemAt(idx) {
      const idRef = this.itemIdentifiers[idx];
      if (idRef) {
        return this.dataStore.getObjectForId(idRef);
      }
      return undefined;
    }

    getMaterializedItemAt(idx) {
      const idRef = this.itemIdentifiers[idx];
      if (!idRef) { return undefined; }

      if (this.dataStore.isObjectMaterialized(idRef)) {
        return this.retrieveItemAt(idx);
      }
      return undefined;
    }

    refreshContents() {
      if (this.isUpdatingCollection) { return; }
      this.isUpdatingCollection = true;
      this.dataStore.fetchItemsOfType(this.itemKind, this)
        .finally(() => {
          this.isUpdatingCollection = false;
        });
    }

    appendIdentifier(idRef) {
      if (!this.itemIdentifiers.includes(idRef)) {
        this.itemIdentifiers.push(idRef);
        this.emit('contentChanged');
      }
    }

    removeIdentifier(idRef) {
      const initialLength = this.itemIdentifiers.length;
      this.itemIdentifiers = this.itemIdentifiers.filter(id => id !== idRef);
      if (this.itemIdentifiers.length < initialLength) {
        this.emit('contentChanged');
      }
    }
  }

  AppCore.IdentifierCollection = IdentifierCollection;
})();

(function() {
  const { IdentifierCollection } = AppCore;

  class ManyItemsCollection extends IdentifierCollection {
    constructor(config) {
      super(config.itemKind, config.dataStore);
      this.itemIdentifiers = config.itemIdentifiers || [];
      this.pendingLoadCount = this.itemIdentifiers.length;
      this.itemIdentifiers.forEach(idRef => {
        if (!idRef.loadingCollections) {
          idRef.loadingCollections = [];
        }
        idRef.loadingCollections.push(this);
      });
      if (this.pendingLoadCount === 0) {
        this.markDataAsLoaded();
      }
    }

    itemLoaded() {
      this.pendingLoadCount--;
      if (this.pendingLoadCount === 0) {
        this.markDataAsLoaded();
      }
    }
  }
  AppCore.ManyItemsCollection = ManyItemsCollection;

  class MockDataStore {
    constructor() {
      this.objectRegistry = new Map();
      this.typeMaps = new Map();
    }

    getObjectForId(idRef) {
      return this.objectRegistry.get(idRef.id);
    }

    isObjectMaterialized(idRef) {
      return this.objectRegistry.has(idRef.id);
    }

    fetchItemsOfType(kind, collection) {
      return Promise.resolve().then(() => {
        const items = [{ id: 'mock1', kind: kind, name: 'Mock Item 1' }, { id: 'mock2', kind: kind, name: 'Mock Item 2' }];
        items.forEach(item => {
          const idRef = { id: item.id, kind: kind, payload: item };
          this.registerObject(idRef, item);
          collection.appendIdentifier(idRef);
        });
        collection.markDataAsLoaded();
      });
    }

    getTypeMap(kind) {
      if (!this.typeMaps.has(kind)) {
        this.typeMaps.set(kind, { identifiers: new Set(), instances: new Map() });
      }
      return this.typeMaps.get(kind);
    }

    registerObject(idRef, itemInstance) {
      this.objectRegistry.set(idRef.id, itemInstance);
      idRef.instance = itemInstance;
      const typeMap = this.getTypeMap(idRef.kind);
      typeMap.identifiers.add(idRef);
      typeMap.instances.set(idRef.id, itemInstance);
    }
  }
  AppCore.DataStore = MockDataStore;

  class CollectionManager {
    constructor(dataStoreInstance) {
      this.dataStore = dataStoreInstance;
      this.categorizedCollections = new Map();
      this.pendingIdentifierChanges = new Set();
      this.updateScheduled = false;
    }

    notifyIdentifierChange(idReference) {
      this.pendingIdentifierChanges.add(idReference);
      if (!this.updateScheduled) {
        this.updateScheduled = true;
        setTimeout(() => this.processPendingUpdates(), 0);
      }
    }

    getCollectionsForIdentifier(idReference) {
      if (!idReference.associatedCollections) {
        idReference.associatedCollections = new Set();
      }
      return idReference.associatedCollections;
    }

    processPendingUpdates() {
      this.updateScheduled = false;
      const referencesToProcess = Array.from(this.pendingIdentifierChanges);
      this.pendingIdentifierChanges.clear();

      referencesToProcess.forEach(idReference => {
        const itemKind = idReference.kind;
        const collectionsOfType = this.categorizedCollections.get(itemKind) || [];

        collectionsOfType.forEach(collection => {
          const filterLogic = collection.filterCondition;
          this.evaluateCollectionMembership(collection, filterLogic, itemKind, idReference);
        });

        const loadingLists = idReference.loadingCollections;
        if (loadingLists) {
          loadingLists.forEach(list => list.itemLoaded());
          idReference.loadingCollections = [];
        }
      });
    }

    evaluateCollectionMembership(targetCollection, filterFn, itemKind, idReference) {
      let shouldInclude = false;
      let actualItem;

      if (!filterFn) {
        shouldInclude = true;
      } else {
        actualItem = this.dataStore.getObjectForId(idReference);
        shouldInclude = filterFn(actualItem);
      }

      const associatedCollectionSet = this.getCollectionsForIdentifier(idReference);

      if (shouldInclude) {
        associatedCollectionSet.add(targetCollection);
        targetCollection.appendIdentifier(idReference);
      } else {
        associatedCollectionSet.delete(targetCollection);
        targetCollection.removeIdentifier(idReference);
      }
    }

    removeItemFromCollections(itemInstance) {
      const idRef = itemInstance.identifier;
      const associatedCollectionSet = idRef.associatedCollections || new Set();

      associatedCollectionSet.forEach(collection => {
        collection.removeIdentifier(idRef);
      });
      associatedCollectionSet.clear();
    }

    reapplyFilterToCollection(collectionToFilter, itemKind, newFilterFn) {
      const kindMap = this.dataStore.getTypeMap(itemKind);
      const allReferencesOfType = kindMap.identifiers;

      for (const idRef of allReferencesOfType) {
        let shouldProcess = false;
        const itemData = idRef.payload;

        if (typeof itemData === 'object') {
          const itemObject = idRef.instance;
          if (itemObject) {
            if (!itemObject.isMarkedForDeletion) {
              shouldProcess = true;
            }
          } else {
            shouldProcess = true;
          }

          if (shouldProcess) {
            this.evaluateCollectionMembership(collectionToFilter, newFilterFn, itemKind, idRef);
          }
        }
      }
    }

    createLinkedCollection(itemKind, identifiersArray) {
      const linkedCollection = new AppCore.ManyItemsCollection({
        itemKind: itemKind,
        itemIdentifiers: identifiersArray,
        dataStore: this.dataStore
      });

      identifiersArray.forEach(idRef => {
        const associatedSet = this.getCollectionsForIdentifier(idRef);
        associatedSet.add(linkedCollection);
      });

      return linkedCollection;
    }
  }

  AppCore.CollectionManagementSystem = new CollectionManager(new AppCore.DataStore());
})();