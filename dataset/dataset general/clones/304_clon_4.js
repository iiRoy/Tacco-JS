const instanceCounter = 0;

const issueProblem = (statement) => {
  throw new Error(statement);
};

// Core utility functions
const CoreUtils = (() => {
  const checkType = (val, expectedType) => typeof val === expectedType;
  const isPlainObject = (val) => val !== null && checkType(val, 'object') && val.constructor === Object;

  const deepCompare = (obj1, obj2) => {
    if (Object.is(obj1, obj2)) return true;

    if (obj1 && obj2 && (isPlainObject(obj1) || Array.isArray(obj1)) && (isPlainObject(obj2) || Array.isArray(obj2))) {
      if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      for (let i = 0; i < keys1.length; i++) {
        const key = keys1[i];
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || !deepCompare(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }

    return obj1 === obj2;
  };

  const recursiveMerge = (target, ...sources) => {
    if (!isPlainObject(target)) return target;

    for (const source of sources) {
      if (isPlainObject(source)) {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            const descriptor = Object.getOwnPropertyDescriptor(source, key);
            if (descriptor && (descriptor.get || descriptor.set)) {
              Object.defineProperty(target, key, descriptor);
            } else if (isPlainObject(source[key])) {
              if (!isPlainObject(target[key])) {
                target[key] = {};
              }
              recursiveMerge(target[key], source[key]);
            } else if (Array.isArray(source[key])) {
              target[key] = source[key].map(item => isPlainObject(item) ? recursiveMerge({}, item) : item);
            } else {
              target[key] = source[key];
            }
          }
        }
      }
    }
    return target;
  };

  const getPredicateFn = (value) => {
    if (!value) return (v) => v; // angular.identity
    if (checkType(value, 'function')) {
      return (v, idx, coll) => value.call(null, v, idx, coll);
    }
    if (isPlainObject(value)) {
      const criteriaEntries = Object.entries(value);
      return (obj) => {
        if (!obj) return !criteriaEntries.length;
        for (const [k, v] of criteriaEntries) {
          if (obj[k] !== v || !Object.prototype.hasOwnProperty.call(obj, k)) return false;
        }
        return true;
      };
    }
    return (obj) => obj?.[value];
  };

  return {
    isText: (val) => checkType(val, 'string'),
    isNumeric: (val) => checkType(val, 'number') && !isNaN(val),
    isCompound: (val) => (checkType(val, 'object') && val !== null) || checkType(val, 'function'),
    isList: (val) => Array.isArray(val),
    isArgumentCollection: (val) => Object.prototype.toString.call(val) === '[object Arguments]',
    isCallable: (val) => checkType(val, 'function'),

    checkEquivalence: deepCompare,

    isEmptyCollection: (val) => {
      if (val === null || val === undefined) return true;
      if (Array.isArray(val) || CoreUtils.isText(val) || CoreUtils.isArgumentCollection(val)) return val.length === 0;
      if (CoreUtils.isCompound(val)) return Object.keys(val).length === 0;
      return true;
    },

    combineAndOverwrite: (initial, ...others) => {
      if (!CoreUtils.isCompound(initial)) return initial;
      let result = initial;
      for (const source of others) {
        if (CoreUtils.isCompound(source)) {
          for (const prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
              const targetDesc = Object.getOwnPropertyDescriptor(result, prop);
              if (targetDesc && targetDesc.get && !targetDesc.set) continue;

              const sourceDesc = Object.getOwnPropertyDescriptor(source, prop);
              if (sourceDesc && (sourceDesc.get || sourceDesc.set)) {
                Object.defineProperty(result, prop, sourceDesc);
              } else {
                result[prop] = source[prop];
              }
            }
          }
        }
      }
      return result;
    },

    hasProperty: (obj, propName) => obj && Object.prototype.hasOwnProperty.call(obj, propName),

    findPosition: (arr, item) => {
      if (!arr || !arr.length) return -1;
      return arr.indexOf(item);
    },

    retrieveKeys: (obj) => {
      if (!CoreUtils.isCompound(obj)) return [];
      return Object.keys(obj);
    },

    retrieveValues: (obj) => {
      const allKeys = CoreUtils.retrieveKeys(obj);
      return allKeys.map(k => obj[k]);
    },

    retrieveEntries: (obj) => {
      const allKeys = CoreUtils.retrieveKeys(obj);
      return allKeys.map(k => [k, obj[k]]);
    },

    includesItem: (collection, target) => {
      if (!collection) return false;
      const iterable = (Array.isArray(collection) || CoreUtils.isText(collection)) ? collection : CoreUtils.retrieveValues(collection);
      return CoreUtils.findPosition(iterable, target) >= 0;
    },

    deepFlatten: (inputList, superficial = false, strictType = false, storage = []) => {
      if (superficial && Array.isArray(inputList) && inputList.length > 0 && inputList.every(Array.isArray)) {
        return storage.concat(...inputList);
      }

      for (const item of inputList) {
        if (!Array.isArray(item) && !CoreUtils.isArgumentCollection(item)) {
          if (!strictType) storage.push(item);
        } else if (superficial) {
          storage.push(...item);
        } else {
          CoreUtils.deepFlatten(item, superficial, strictType, storage);
        }
      }
      return storage;
    },

    determineDifferences: (mainArr, ...otherArrs) => {
      const elementsToExclude = new Set(CoreUtils.deepFlatten(otherArrs, true, true, []));
      return mainArr.filter(item => !elementsToExclude.has(item));
    },

    excludeItems: (mainArr, ...itemsToExclude) => {
      return CoreUtils.determineDifferences(mainArr, itemsToExclude);
    },

    transformCollection: (collection, transformer) => {
      return Array.prototype.map.call(collection, transformer);
    },

    createPredicate: getPredicateFn,

    checkAny: (collection, predicate) => {
      if (!collection) return false;
      const fn = getPredicateFn(predicate);
      const keys = (Array.isArray(collection) || CoreUtils.isText(collection)) ? null : CoreUtils.retrieveKeys(collection);

      const iterable = keys ? keys.map(k => [collection[k], k, collection]) : Array.from(collection).map((v, i) => [v, i, collection]);

      return iterable.some(([value, key, coll]) => fn(value, key, coll));
    },

    findFirst: (collection, predicate) => {
      if (!collection) return undefined;
      const fn = getPredicateFn(predicate);
      const keys = (Array.isArray(collection) || CoreUtils.isText(collection)) ? null : CoreUtils.retrieveKeys(collection);

      const iterable = keys ? keys.map(k => [collection[k], k, collection]) : Array.from(collection).map((v, i) => [v, i, collection]);

      for (const [value, key, coll] of iterable) {
        if (fn(value, key, coll)) return value;
      }
      return undefined;
    },

    filterCollection: (collection, predicate) => {
      const results = [];
      if (!collection) return results;
      const fn = getPredicateFn(predicate);

      const keys = (Array.isArray(collection) || CoreUtils.isText(collection)) ? null : CoreUtils.retrieveKeys(collection);

      if (keys) {
        for (const key of keys) {
          const value = collection[key];
          if (fn(value, key, collection)) results.push(value);
        }
      } else {
        for (let i = 0; i < collection.length; i++) {
          const value = collection[i];
          if (fn(value, i, collection)) results.push(value);
        }
      }
      return results;
    },

    duplicateValue: (val) => {
      if (!CoreUtils.isCompound(val)) return val;
      if (Array.isArray(val)) return val.slice();
      return Object.assign({}, val);
    },

    generateUniqueKey: (prefix = '') => {
      CoreUtils.generateUniqueKey.counter = (CoreUtils.generateUniqueKey.counter || 0) + 1;
      return String(prefix) + CoreUtils.generateUniqueKey.counter;
    },

    // Custom deep cloning and merging
    deepCopy: (sourceValue) => {
      if (sourceValue === null || typeof sourceValue !== 'object') {
        return sourceValue;
      }
      if (Array.isArray(sourceValue)) {
        return sourceValue.map(item => CoreUtils.deepCopy(item));
      }
      if (CoreUtils.isCallable(sourceValue)) {
        return sourceValue; // Functions are returned as-is
      }

      const target = {};
      for (const key in sourceValue) {
        if (Object.prototype.hasOwnProperty.call(sourceValue, key)) {
          const descriptor = Object.getOwnPropertyDescriptor(sourceValue, key);
          if (descriptor && (descriptor.get || descriptor.set)) {
            Object.defineProperty(target, key, descriptor);
          } else {
            target[key] = CoreUtils.deepCopy(sourceValue[key]);
          }
        }
      }
      return target;
    },

    deepMerge: recursiveMerge,

    excludeProperties: (originalObject, ...propertyNames) => {
      if (!originalObject || !CoreUtils.isCompound(originalObject)) return originalObject;

      const newObject = {};
      const excludedSet = new Set(propertyNames);

      for (const key in originalObject) {
        if (CoreUtils.hasProperty(originalObject, key) && !excludedSet.has(key)) {
          const descriptor = Object.getOwnPropertyDescriptor(originalObject, key);
          if (descriptor && (descriptor.get || descriptor.set)) {
            Object.defineProperty(newObject, key, descriptor);
          } else {
            newObject[key] = originalObject[key];
          }
        }
      }
      return newObject;
    }
  };
})();


// Path and URL resolution
const PathResolver = (() => {
  const detectUrlPattern = (str) => /[/\\-]/.test(str);
  const normalizeSlashes = (path) => path.replace(/(\/)\/+/g, '$1');
  const stripEdgeSlashes = (path) => path.replace(/^\/|\/$/g, '');

  return {
    looksLikeUrl: detectUrlPattern,

    formatAsUrl: (path) => {
      if (!path) return '';
      return normalizeSlashes('/' + path);
    },

    composePaths: (...segments) => {
      const validSegments = segments.filter(s => !!s);
      return PathResolver.formatAsUrl(validSegments.join('/'));
    },

    removeDoubleSlashes: normalizeSlashes,

    trimPathSlashes: stripEdgeSlashes,

    // This is the tricky one, needs a different approach for stripOverlap
    // Original: modifies arrays in place, shifts/pops, uses `indexOf` to cut string.
    // New: find common suffix of url and common prefix of overlapUrl, then remove.
    // Or, more simply, find the longest common sequence of segments from the end of url and start of overlapUrl.
    removeOverlap: (mainPath, segmentToRemove) => {
      if (!mainPath || !segmentToRemove) return mainPath;

      const mainSegments = stripEdgeSlashes(mainPath).split('/');
      const removeSegments = stripEdgeSlashes(segmentToRemove).split('/');

      let commonLength = 0;
      for (let i = 0; i < mainSegments.length; i++) {
        const mainSlice = mainSegments.slice(i).join('/');
        const removePrefix = removeSegments.slice(0, mainSegments.length - i).join('/');
        if (mainSlice === removePrefix && mainSlice.length > 0) {
          commonLength = mainSlice.length;
          break;
        }
      }

      if (commonLength > 0) {
        const cutIndex = mainPath.indexOf(stripEdgeSlashes(segmentToRemove));
        if (cutIndex !== -1) {
          return PathResolver.formatAsUrl(mainPath.substring(0, cutIndex));
        }
      }
      return mainPath;
    },

    substituteUrlTokens: (url, parameters, omitMissing = false) => {
      if (!url) return url;

      return url.replace(/\:\_*[A-Za-z]+/g, (token) => {
        const paramKey = token.replace(/\:*/, '');
        if (parameters[paramKey] === undefined && !omitMissing) {
          issueProblem(`Missing parameter "${paramKey}" for URL: ${url}`);
        }
        return parameters[paramKey];
      });
    }
  };
})();


// Module definition, adapting the original's UMD-like structure
((globalScope, moduleFactory) => {
  if (typeof define === 'function' && define.amd) {
    define(['angular'], (angularRef) => {
      return moduleFactory(angularRef, document);
    });
  } else {
    /* global angular */
    moduleFactory(globalScope.angular, globalScope.document);
  }
})(window, (angularRef, doc) => {
  // This is where the original's functionality would be exposed.
  // For a Type IV clone, we're not exposing the internal `_` object,
  // but rather the functionality it provides, possibly under a different
  // namespace or directly integrated into the module's exposed API.

  // Since the original was building up a global `_` object,
  // and then later defining `angular.module('modelizer')`,
  // we'll assume this internal utility set is meant to be used
  // by the modelizer itself, not necessarily exported as `_`.

  // Here, `CoreUtils` and `PathResolver` are the new internal utilities.
  // The actual "modelizer" logic would consume these.
  // The request is to clone the *provided code*, which is mainly the `_` object
  // and `urlHelper`. So, the output should reflect the structure of these utilities.

  // For the purpose of this clone, we'll create a single object
  // that encompasses all these utilities, making it similar to how
  // `_` was a single point of access, but with different names.

  // The original has `defaultModelClass` and other modelizer specific logic later.
  // The request is specifically for the provided code block, which ends before
  // the modelizer's core definitions begin. So, we clone the utility part.

  // A placeholder for the actual module export, mimicking the original's flow.
  // In a real scenario, this would be consumed by the angular-modelizer.
  const UtilityBelt = {
    // Expose CoreUtils methods under new names
    stringCheck: CoreUtils.isText,
    numberCheck: CoreUtils.isNumeric,
    objectCheck: CoreUtils.isCompound,
    arrayCheck: CoreUtils.isList,
    argsCheck: CoreUtils.isArgumentCollection,
    functionCheck: CoreUtils.isCallable,
    equalityCheck: CoreUtils.checkEquivalence,
    emptyCheck: CoreUtils.isEmptyCollection,
    objectMerge: CoreUtils.combineAndOverwrite,
    propertyExists: CoreUtils.hasProperty,
    arrayIndexOf: CoreUtils.findPosition,
    objectKeys: CoreUtils.retrieveKeys,
    objectValues: CoreUtils.retrieveValues,
    objectEntries: CoreUtils.retrieveEntries,
    collectionContains: CoreUtils.includesItem,
    deepArrayFlatten: CoreUtils.deepFlatten,
    arrayDifference: CoreUtils.determineDifferences,
    arrayExclude: CoreUtils.excludeItems,
    collectionMap: CoreUtils.transformCollection,
    createFilterPredicate: CoreUtils.createPredicate,
    collectionAny: CoreUtils.checkAny,
    collectionFind: CoreUtils.findFirst,
    collectionFilter: CoreUtils.filterCollection,
    shallowCopy: CoreUtils.duplicateValue,
    generateId: CoreUtils.generateUniqueKey,
    deepObjectCopy: CoreUtils.deepCopy,
    deepObjectMerge: CoreUtils.deepMerge,
    omitObjectProperties: CoreUtils.excludeProperties,

    // Expose PathResolver methods under new names
    pathIsUrl: PathResolver.looksLikeUrl,
    pathAsUrl: PathResolver.formatAsUrl,
    pathCombine: PathResolver.composePaths,
    pathNormalizeSlashes: PathResolver.removeDoubleSlashes,
    pathTrimSlashes: PathResolver.trimPathSlashes,
    pathRemoveOverlap: PathResolver.removeOverlap,
    pathSubstituteTokens: PathResolver.substituteUrlTokens,

    // Internal error helper for consistency with original's usage
    signalError: issueProblem
  };

  // This would typically be assigned to a global or used internally.
  // Since the original was defining `var _ = {};` inside the factory,
  // we simulate that by making `UtilityBelt` available.
  // In a real Angular module, this would be a service.
  // For the clone, we'll just return it from the factory.
  return UtilityBelt;
});