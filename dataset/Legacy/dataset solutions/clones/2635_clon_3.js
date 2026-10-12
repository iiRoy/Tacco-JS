(function(moduleDefinitions) {
  // A simple cache for storing loaded modules.
  // This helps avoid redundant execution and resolves circular dependencies.
  let loadedModulesCache = {};

  /**
   * Universal module loader function.
   * This function resolves and executes modules based on their ID.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function dynamicModuleLoader(moduleId) {
    // Check if the module is already in the cache. If so, return its exports.
    if (loadedModulesCache[moduleId]) {
      return loadedModulesCache[moduleId].exports;
    }

    // If not in cache, create a new module entry.
    // 'i' stores the module ID, 'l' indicates if the module has been loaded.
    let moduleEntry = loadedModulesCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module function, populating its exports.
    // The module function receives 'moduleEntry', 'moduleEntry.exports', and 'dynamicModuleLoader' itself.
    moduleDefinitions[moduleId].call(
      moduleEntry.exports,
      moduleEntry,
      moduleEntry.exports,
      dynamicModuleLoader
    );

    // Mark the module as loaded.
    moduleEntry.isLoaded = true;

    // Return the populated exports object.
    return moduleEntry.exports;
  }

  // Store the module definitions on the loader itself for external access (e.g., by webpack runtime).
  dynamicModuleLoader.allModules = moduleDefinitions;
  // Store the module cache on the loader.
  dynamicModuleLoader.moduleCache = loadedModulesCache;

  /**
   * Defines a getter function for a property on an object.
   * This is used for ES module interop to define named exports.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property.
   * @param {Function} getterFunction - The function that returns the property's value.
   */
  dynamicModuleLoader.defineGetter = function(targetObject, propertyName, getterFunction) {
    // Check if the property already exists. If not, define it using Object.defineProperty.
    if (!dynamicModuleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction // Set the getter function.
      });
    }
  };

  /**
   * Marks a module's exports as an ES Module.
   * This adds Symbol.toStringTag and __esModule properties for compatibility.
   * @param {object} exportsObject - The exports object to mark.
   */
  dynamicModuleLoader.markAsEsModule = function(exportsObject) {
    // If Symbol is available, set Symbol.toStringTag for better object identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set __esModule to true, a common flag for ES modules in bundlers.
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  /**
   * Creates a namespace object for a module, handling various export types.
   * This is essential for interoperability between CommonJS and ES modules.
   * @param {any} moduleValue - The value representing the module's exports.
   * @param {number} modeFlags - Flags indicating how to handle the module value.
   * @returns {object} A namespace object.
   */
  dynamicModuleLoader.createNamespaceObject = function(moduleValue, modeFlags) {
    // If bit 1 is set, it means the moduleValue is already a module ID, so load it.
    if (modeFlags & 1) {
      moduleValue = dynamicModuleLoader(moduleValue);
    }
    // If bit 8 is set, return the moduleValue directly (e.g., already a namespace).
    if (modeFlags & 8) {
      return moduleValue;
    }
    // If bit 4 is set and it's an object with __esModule, return it.
    if (modeFlags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Otherwise, create a new plain object as the namespace.
    let namespace = Object.create(null);
    dynamicModuleLoader.markAsEsModule(namespace); // Mark it as an ES module.
    // Define a 'default' export pointing to the moduleValue.
    Object.defineProperty(namespace, "default", {
      enumerable: true,
      value: moduleValue
    });
    // If bit 2 is set and it's not a string, copy all properties from moduleValue to namespace.
    if (modeFlags & 2 && typeof moduleValue !== "string") {
      for (let propKey in moduleValue) {
        // Ensure property is not already defined in namespace.
        if (!dynamicModuleLoader.hasOwn(namespace, propKey)) {
          dynamicModuleLoader.defineGetter(namespace, propKey, (() => moduleValue[propKey]).bind(null, propKey));
        }
      }
    }
    return namespace;
  };

  /**
   * Helper for getting the default export of a module.
   * @param {object} moduleExports - The exports object of a module.
   * @returns {Function} A getter for the default export.
   */
  dynamicModuleLoader.getDefaultExport = function(moduleExports) {
    // If it's an ES module, return a getter for its 'default' property.
    let defaultGetter = moduleExports && moduleExports.__esModule ?
      () => moduleExports.default :
      () => moduleExports; // Otherwise, return a getter for the moduleExports itself.
    dynamicModuleLoader.defineGetter(defaultGetter, "a", defaultGetter); // Also define 'a' as an alias for the default getter.
    return defaultGetter;
  };

  /**
   * Checks if an object has a specific property.
   * @param {object} targetObject - The object to check.
   * @param {string} propertyName - The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  dynamicModuleLoader.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Base public path for assets (empty string by default).
  dynamicModuleLoader.publicPath = "";

  // Set the entry point for the application and execute it.
  dynamicModuleLoader(dynamicModuleLoader.entryPoint = 133);

})([
  /* Module 0 */
  // This module provides a utility function for defining properties on objects,
  // often used for polyfills or extending built-in prototypes.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object (e.g., `window` or `global`).
    let descriptorGetter = localRequire(22).f; // Function to get property descriptors.
    let objectDefiner = localRequire(16); // Utility to define properties.
    let isObjectUtil = localRequire(23); // Utility to check if something is an object.
    let createGlobalProperty = localRequire(79); // Function to create a global property if it doesn't exist.
    let copyProperties = localRequire(100); // Function to copy properties from one object to another.
    let isForcedPolyfill = localRequire(62); // Checks if a polyfill is forced (e.g., due to bugs or lack of native support).

    module.exports = function(options) {
      let targetName = options.target; // The target object name (e.g., 'Array', 'String').
      let isGlobal = options.global; // Boolean indicating if the target is the global object.
      let isStatic = options.stat; // Boolean indicating if the property is static (on the constructor).

      let targetReference; // Reference to the actual target object.
      if (isGlobal) {
        targetReference = globalObject;
      } else if (isStatic) {
        targetReference = globalObject[targetName] || createGlobalProperty(targetName, {});
      } else {
        targetReference = (globalObject[targetName] || {}).prototype;
      }

      // Iterate through the properties to be defined.
      for (let propertyKey in options.properties) {
        let newProperty = options.properties[propertyKey]; // The new property value or function.
        let existingProperty; // The existing property value.

        // If 'noTargetGet' is true, directly check the descriptor. Otherwise, get the property.
        if (options.noTargetGet) {
          let descriptor = descriptorGetter(targetReference, propertyKey);
          existingProperty = descriptor && descriptor.value;
        } else {
          existingProperty = targetReference[propertyKey];
        }

        // If the polyfill is not forced and the existing property is compatible, skip.
        if (!isForcedPolyfill(isGlobal ? propertyKey : targetName + (isStatic ? "." : "#") + propertyKey, options.forced) && existingProperty !== undefined) {
          if (typeof newProperty === typeof existingProperty) {
            continue; // Skip if types match and no forced polyfill.
          }
          // If types don't match, copy properties from existing to new (e.g., for extending native functions).
          copyProperties(newProperty, existingProperty);
        }

        // If 'sham' flag is set or the existing property is a sham (placeholder),
        // mark the new property as non-native.
        if (options.sham || (existingProperty && existingProperty.sham)) {
          objectDefiner(newProperty, "sham", true);
        }

        // Define the new property on the target object.
        isObjectUtil(targetReference, propertyKey, newProperty, options);
      }
    };
  },

  /* Module 1 */
  // Utility to ensure a value is an object. Throws a TypeError if not.
  function(module, exports, localRequire) {
    let checkObject = localRequire(8); // Import the `isObject` utility.

    module.exports = function(value) {
      if (!checkObject(value)) {
        throw new TypeError(String(value) + " is not an object");
      }
      return value;
    };
  },

  /* Module 2 */
  // Flag indicating if core-js is running in "pure" mode (without polluting global namespace).
  function(module, exports) {
    module.exports = false;
  },

  /* Module 3 */
  // This module provides a generic iteration utility.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the argument is an object.
    let getIteratorMethod = localRequire(84); // Checks if an object has a 'Symbol.iterator' method.
    let createBoundFunction = localRequire(10); // Binds a function to a context.
    let toIntegerIndex = localRequire(13); // Converts a value to a valid array index.
    let getIterator = localRequire(52); // Retrieves an iterator from an iterable object.
    let consumeIterator = localRequire(108); // Utility to consume an iterator.

    // Helper class to signal early termination of iteration.
    let IterationStopSignal = function(stopped, result) {
      this.stopped = stopped;
      this.result = result;
    };

    IterationStopSignal.prototype = {}; // Ensure a prototype exists.

    module.exports = (function(iterable, callback, context, isArrayLike, allowEarlyExit) {
      let boundCallback, currentItem, iteratorResult, iteratorMethod, currentLength, index;

      // Create a bound callback function based on the 'isArrayLike' flag.
      if (isArrayLike) {
        boundCallback = createBoundFunction(callback, context, isArrayLike ? 2 : 1);
      } else {
        boundCallback = createBoundFunction(callback, context, 1);
      }

      if (allowEarlyExit) {
        currentItem = iterable; // If early exit is allowed, `currentItem` is the iterable itself.
      } else {
        // If not allowing early exit, get the iterator method.
        iteratorMethod = getIterator(iterable);
        if (typeof iteratorMethod !== "function") {
          throw new TypeError("Target is not iterable");
        }
        // If it's an array-like object, iterate by index.
        if (getIteratorMethod(iteratorMethod)) {
          for (index = 0, currentLength = toIntegerIndex(iterable.length); index < currentLength; index++) {
            currentItem = isArrayLike ? boundCallback(requireObject(iterable[index][0]), iterable[index][1]) : boundCallback(iterable[index]);
            if (currentItem instanceof IterationStopSignal) {
              return currentItem;
            }
          }
          return new IterationStopSignal(false);
        }
        currentItem = iteratorMethod.call(iterable); // Get the actual iterator.
      }

      // Iterate through the items using the iterator's next method.
      for (; !(iteratorResult = currentItem.next()).done;) {
        let processedValue = isArrayLike ? consumeIterator(currentItem, boundCallback, iteratorResult.value, true) : consumeIterator(currentItem, boundCallback, iteratorResult.value, false);
        if (processedValue instanceof IterationStopSignal) {
          return processedValue;
        }
      }
      return new IterationStopSignal(false);
    }).stop = function(resultValue) {
      return new IterationStopSignal(true, resultValue);
    };
  },

  /* Module 4 */
  // Utility to ensure a value is a function. Throws a TypeError if not.
  function(module, exports) {
    module.exports = function(value) {
      if (typeof value !== "function") {
        throw new TypeError(String(value) + " is not a function");
      }
      return value;
    };
  },

  /* Module 5 */
  // Safely gets the global object (window in browsers, global in Node.js).
  function(module, exports) {
    const objectType = "object";
    const getGlobalThis = (candidate) => candidate && candidate.Math === Math && candidate;
    // Check for globalThis, then window, self, global, and finally Function('return this')().
    module.exports = getGlobalThis(typeof globalThis === objectType && globalThis) ||
      getGlobalThis(typeof window === objectType && window) ||
      getGlobalThis(typeof self === objectType && self) ||
      getGlobalThis(typeof global === objectType && global) ||
      (function() {
        return this;
      })();
  },

  /* Module 6 */
  // Retrieves a well-known Symbol, or creates a new one if not available.
  function(module, exports, localRequire) {
    let globalScope = localRequire(5); // Get the global object.
    let sharedSymbolRegistry = localRequire(38); // Access the shared symbol registry.
    let isSymbolAvailable = localRequire(102); // Check if native Symbol is available.
    let generateSymbolId = localRequire(45); // Generates a unique string ID for a symbol.

    let symbolCache = sharedSymbolRegistry("wks"); // Use 'wks' (Well-Known Symbols) as the cache key.

    module.exports = function(symbolName) {
      // If the symbol is already in the cache, return it.
      // Otherwise, create a new Symbol (native or polyfilled) and store it.
      return symbolCache[symbolName] ||
        (symbolCache[symbolName] = isSymbolAvailable && globalScope.Symbol[symbolName] ||
          (isSymbolAvailable ? globalScope.Symbol : generateSymbolId)("Symbol." + symbolName));
    };
  },

  /* Module 7 */
  // Utility function to check if a given function throws an error.
  function(module, exports) {
    module.exports = function(testFunction) {
      try {
        return !!testFunction(); // Return true if it throws, false otherwise.
      } catch (error) {
        return true; // An error occurred, so it failed.
      }
    };
  },

  /* Module 8 */
  // Checks if a value is an object (non-null and typeof 'object' or 'function').
  function(module, exports) {
    module.exports = function(value) {
      const typeOfValue = typeof value;
      return value !== null && (typeOfValue === "object" || typeOfValue === "function");
    };
  },

  /* Module 9 */
  // Flag indicating if Object.defineProperty works correctly (i.e., native descriptors are reliable).
  function(module, exports, localRequire) {
    let testFails = localRequire(7); // Import the `fails` utility.

    module.exports = !testFails(function() {
      // Test by defining a getter and checking its value.
      return Object.defineProperty({}, "a", {
        get: function() {
          return 7;
        }
      }).a !== 7;
    });
  },

  /* Module 10 */
  // Converts a value to a valid length for array-like objects.
  function(module, exports, localRequire) {
    let toInteger = localRequire(24); // Converts a value to an integer.
    const MAX_SAFE_INTEGER = 9007199254740991; // 2^53 - 1

    module.exports = function(value) {
      let integerValue = toInteger(value);
      // Ensure the length is non-negative and within MAX_SAFE_INTEGER.
      return integerValue > 0 ? Math.min(integerValue, MAX_SAFE_INTEGER) : 0;
    };
  },

  /* Module 11 */
  // Wrapper for Object.defineProperty, handling non-enumerable properties and fallbacks.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Check if Object.defineProperty is reliable.
    let definePropertyInternal = Object.defineProperty; // Native Object.defineProperty.
    let requireObject = localRequire(1); // Ensures the value is an object.
    let toPrimitive = localRequire(29); // Converts value to a primitive.
    let checkDescriptor = localRequire(1); // Ensures the descriptor is an object.

    exports.f = descriptorsAvailable ?
      definePropertyInternal : // If descriptors are reliable, use native.
      function(object, property, descriptor) { // Fallback for environments without reliable descriptors.
        requireObject(object);
        property = toPrimitive(property, true);
        requireObject(descriptor);
        // If 'get' or 'set' are present, throw an error as accessors are not supported in fallback.
        if ("get" in descriptor || "set" in descriptor) {
          throw new TypeError("Accessors not supported");
        }
        // If 'value' is present, assign it directly.
        if ("value" in descriptor) {
          object[property] = descriptor.value;
        }
        return object;
      };
  },

  /* Module 12 */
  // Safely retrieves a global property or a property from a nested object.
  function(module, exports, localRequire) {
    let globalScope = localRequire(81); // Get the global object (potentially with polyfills).
    let originalGlobal = localRequire(5); // Get the original global object.

    // This function attempts to find a property, first in globalScope, then originalGlobal.
    // It can also handle nested properties (e.g., 'Object', 'defineProperty').
    let getProperty = function(key1, key2) {
      let value = globalScope[key1];
      if (value) {
        return value[key2] || originalGlobal[key1] && originalGlobal[key1][key2];
      }
      return undefined;
    };

    module.exports = function(key1, key2) {
      // If only one argument, assume it's a global property.
      // Otherwise, it's a nested property.
      return arguments.length < 2 ?
        (function(k) {
          return typeof k === "function" ? k : undefined;
        })(globalScope[key1]) ||
        (function(k) {
          return typeof k === "function" ? k : undefined;
        })(originalGlobal[key1]) :
        getProperty(key1, key2);
    };
  },

  /* Module 13 */
  // Creates a bound version of a function with a specific context and argument count.
  function(module, exports, localRequire) {
    let requireFunction = localRequire(4); // Ensures the value is a function.

    module.exports = function(targetFunction, context, argumentCount) {
      requireFunction(targetFunction); // Ensure the target is a function.
      if (context === undefined) {
        return targetFunction; // If no context, return the function as-is.
      }

      // Return a new function that calls the targetFunction with the specified context.
      switch (argumentCount) {
        case 0:
          return function() {
            return targetFunction.call(context);
          };
        case 1:
          return function(arg1) {
            return targetFunction.call(context, arg1);
          };
        case 2:
          return function(arg1, arg2) {
            return targetFunction.call(context, arg1, arg2);
          };
        case 3:
          return function(arg1, arg2, arg3) {
            return targetFunction.call(context, arg1, arg2, arg3);
          };
      }
      // For other argument counts, use apply.
      return function() {
        return targetFunction.apply(context, arguments);
      };
    };
  },

  /* Module 14 */
  // Polyfill for Object.prototype.hasOwnProperty.call.
  function(module, exports) {
    let objectHasOwnProperty = {}.hasOwnProperty;
    module.exports = function(object, property) {
      return objectHasOwnProperty.call(object, property);
    };
  },

  /* Module 15 */
  // Converts a value to an object (e.g., primitive values are wrapped).
  function(module, exports, localRequire) {
    let requireObjectCoercible = localRequire(17); // Ensures the value is not null or undefined.

    module.exports = function(value) {
      return Object(requireObjectCoercible(value));
    };
  },

  /* Module 16 */
  // Defines a non-enumerable, non-configurable property on an object.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Check for reliable descriptors.
    let defineProperty = localRequire(11); // Object.defineProperty wrapper.
    let createPropertyDescriptor = localRequire(35); // Creates a property descriptor object.

    module.exports = descriptorsAvailable ?
      function(object, property, value) {
        return defineProperty.f(object, property, createPropertyDescriptor(1, value));
      } :
      function(object, property, value) {
        object[property] = value;
        return object;
      };
  },

  /* Module 17 */
  // Ensures a value is not null or undefined (object coercible).
  function(module, exports) {
    module.exports = function(value) {
      if (value === null || value === undefined) {
        throw new TypeError("Cannot call method on " + value);
      }
      return value;
    };
  },

  /* Module 18 */
  // Internal state management using WeakMap or a fallback object.
  // This is used to store private data associated with objects.
  function(module, exports, localRequire) {
    let supportsWeakMap = localRequire(99); // Check if WeakMap is available and usable.
    let getGlobal = localRequire(5); // Get the global object.
    let isObject = localRequire(8); // Check if a value is an object.
    let defineProperty = localRequire(16); // Define a property.
    let hasOwnProperty = localRequire(14); // Check if an object has a property.
    let createUniqueKey = localRequire(59); // Generate a unique key.
    let hiddenKeys = localRequire(46); // Object to store keys that should be hidden.

    let internalState; // Variable to hold the internal state mechanism.
    let getState, setState, hasState; // Functions for getting, setting, and checking state.

    // If WeakMap is supported, use it for internal state.
    if (supportsWeakMap) {
      let weakMapInstance = getGlobal.WeakMap;
      let weakMapGet = weakMapInstance.prototype.get;
      let weakMapHas = weakMapInstance.prototype.has;
      let weakMapSet = weakMapInstance.prototype.set;

      internalState = {
        set: function(targetObject, data) {
          weakMapSet.call(weakMapInstance, targetObject, data);
          return data;
        },
        get: function(targetObject) {
          return weakMapGet.call(weakMapInstance, targetObject) || {};
        },
        has: function(targetObject) {
          return weakMapHas.call(weakMapInstance, targetObject);
        }
      };
    } else {
      // Fallback for environments without WeakMap.
      let privateKey = createUniqueKey("state");
      hiddenKeys[privateKey] = true; // Mark the key as hidden.

      internalState = {
        set: function(targetObject, data) {
          defineProperty(targetObject, privateKey, data);
          return data;
        },
        get: function(targetObject) {
          return hasOwnProperty(targetObject, privateKey) ? targetObject[privateKey] : {};
        },
        has: function(targetObject) {
          return hasOwnProperty(targetObject, privateKey);
        }
      };
    }

    module.exports = {
      set: internalState.set,
      get: internalState.get,
      has: internalState.has,
      enforce: function(targetObject) {
        // Enforce state presence: if it doesn't exist, create an empty one.
        return internalState.has(targetObject) ? internalState.get(targetObject) : internalState.set(targetObject, {});
      },
      getterFor: function(typeName) {
        // Creates a getter function that retrieves state for a specific type.
        return function(instance) {
          let state = internalState.get(instance);
          if (!isObject(instance) || state.type !== typeName) {
            throw new TypeError("Incompatible receiver, " + typeName + " required");
          }
          return state;
        };
      }
    };
  },

  /* Module 19 */
  // Defines a well-known symbol on the global Symbol object.
  function(module, exports, localRequire) {
    let getGlobal = localRequire(81); // Get the global object (with polyfills).
    let hasOwnProperty = localRequire(14); // Check for own property.
    let defineProperty = localRequire(11).f; // Object.defineProperty wrapper.

    module.exports = function(symbolName) {
      let symbolObject = getGlobal.Symbol || (getGlobal.Symbol = {});
      if (!hasOwnProperty(symbolObject, symbolName)) {
        defineProperty(symbolObject, symbolName, {
          value: localRequire(105).f(symbolName)
        });
      }
    };
  },

  /* Module 20 */
  // Creates a new instance of a constructor with the same species as the original object.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the argument is an object.
    let requireFunction = localRequire(4); // Ensures the value is a function.
    let speciesSymbol = localRequire(6)("species"); // Get the Symbol.species well-known symbol.

    module.exports = function(originalObject, defaultConstructor) {
      let constructor = requireObject(originalObject).constructor;
      let species;

      // Check if the constructor has a Symbol.species property.
      if (constructor !== undefined && constructor !== null) {
        species = requireObject(constructor)[speciesSymbol];
        if (species === undefined || species === null) {
          species = defaultConstructor; // Use default if no species is found.
        } else if (requireFunction(species)) {
          // If species is a function, use it as the constructor.
          // Otherwise, it's an object, and we use the default.
        } else {
          species = defaultConstructor;
        }
      } else {
        species = defaultConstructor; // If no constructor, use default.
      }
      return species;
    };
  },

  /* Module 21 */
  // Polyfill for Object.getPrototypeOf.
  function(module, exports, localRequire) {
    let hasOwnProperty = localRequire(14); // Check for own property.
    let toObject = localRequire(15); // Converts a value to an object.
    let uniqueKey = localRequire(59); // Generates a unique key.
    let getPrototypeOfPolyfill = localRequire(110); // Check if native Object.getPrototypeOf works.

    let ieProtoKey = uniqueKey("IE_PROTO"); // Key for IE's __proto__ emulation.
    let objectPrototype = Object.prototype;

    module.exports = getPrototypeOfPolyfill ?
      Object.getPrototypeOf :
      function(targetObject) {
        targetObject = toObject(targetObject);
        if (hasOwnProperty(targetObject, ieProtoKey)) {
          return targetObject[ieProtoKey];
        }
        // Fallback for older browsers or non-standard objects.
        if (typeof targetObject.constructor === "function" && targetObject instanceof targetObject.constructor) {
          return targetObject.constructor.prototype;
        }
        if (targetObject instanceof Object) {
          return objectPrototype;
        }
        return null;
      };
  },

  /* Module 22 */
  // Wrapper for Object.getOwnPropertyDescriptor.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Check for reliable descriptors.
    let isEnumerable = localRequire(58); // Check if a property is enumerable.
    let createPropertyDescriptor = localRequire(35); // Create a property descriptor.
    let toIndexedObject = localRequire(25); // Converts a value to an indexed object.
    let toPrimitive = localRequire(29); // Converts value to a primitive.
    let hasOwnProperty = localRequire(14); // Check for own property.
    let fails = localRequire(97); // Check if native functionality fails.

    let getOwnPropertyDescriptorNative = Object.getOwnPropertyDescriptor; // Native function.

    exports.f = descriptorsAvailable ?
      getOwnPropertyDescriptorNative : // Use native if reliable.
      function(object, property) { // Fallback implementation.
        object = toIndexedObject(object);
        property = toPrimitive(property, true);
        if (fails(function() {
            return getOwnPropertyDescriptorNative(object, property);
          })) {
          // If native fails, handle it.
        }
        if (hasOwnProperty(object, property)) {
          return createPropertyDescriptor(!isEnumerable.f.call(object, property), object[property]);
        }
        return undefined;
      };
  },

  /* Module 23 */
  // Defines a property on an object, handling name and source for functions.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let sharedSymbolRegistry = localRequire(38); // Shared symbol registry.
    let defineProperty = localRequire(16); // Define a property.
    let hasOwnProperty = localRequire(14); // Check for own property.
    let createGlobalProperty = localRequire(79); // Create a global property.
    let nativeFunctionToString = localRequire(98); // Native Function.prototype.toString.
    let internalState = localRequire(18); // Internal state management.

    let getInternalState = internalState.get;
    let enforceInternalState = internalState.enforce;

    // Split 'Function.prototype.toString' to get parts for source code reconstruction.
    let functionToStringParts = String(nativeFunctionToString).split("toString");

    // Store a reference to the inspectSource function in the shared registry.
    sharedSymbolRegistry("inspectSource", function(targetFunction) {
      return nativeFunctionToString.call(targetFunction);
    });

    /**
     * Defines a property on an object, handling function names and source code.
     * @param {object} object - The target object.
     * @param {string} property - The name of the property.
     * @param {Function} value - The function value.
     * @param {object} [options] - Configuration options.
     * @param {boolean} [options.unsafe=false] - If true, allows overwriting existing properties without checks.
     * @param {boolean} [options.enumerable=false] - If true, makes the property enumerable.
     * @param {boolean} [options.noTargetGet=false] - If true, avoids getting the property from the target before defining.
     */
    module.exports = (function(object, property, value, options) {
      let isUnsafe = !!options && !!options.unsafe;
      let isEnumerable = !!options && !!options.enumerable;
      let noTargetGet = !!options && !!options.noTargetGet;

      if (typeof value === "function") {
        // If it's a function, ensure it has a 'name' property and store its source.
        if (typeof property === "string" && !hasOwnProperty(value, "name")) {
          defineProperty(value, "name", property);
        }
        enforceInternalState(value).source = functionToStringParts.join(
          typeof property === "string" ? property : ""
        );
      }

      if (object !== globalObject) {
        if (isUnsafe && !noTargetGet && object[property] && isEnumerable) {
          // If unsafe and enumerable, delete the existing property before defining.
          delete object[property];
        }
        if (isEnumerable) {
          object[property] = value; // Direct assignment for enumerable properties.
        } else {
          defineProperty(object, property, value); // Define as non-enumerable.
        }
      } else {
        // If the target is the global object.
        if (isEnumerable) {
          object[property] = value;
        } else {
          createGlobalProperty(property, value);
        }
      }
    })(Function.prototype, "toString", function() {
      // Custom toString for functions, retrieving their stored source code.
      return (
        (typeof this === "function" && getInternalState(this).source) ||
        nativeFunctionToString.call(this)
      );
    });
  },

  /* Module 24 */
  // Converts a value to an integer, truncating decimals.
  function(module, exports) {
    const ceil = Math.ceil;
    const floor = Math.floor;

    module.exports = function(value) {
      // Handle NaN, Infinity, etc.
      if (isNaN(value = +value)) {
        return 0;
      }
      return (value > 0 ? floor : ceil)(value);
    };
  },

  /* Module 25 */
  // Converts a value to an indexed object (e.g., string to array-like object).
  function(module, exports, localRequire) {
    let toObjectCoercible = localRequire(77); // Ensure value is not null/undefined.
    let objectFromPrimitive = localRequire(17); // Convert primitive to object.

    module.exports = function(value) {
      return objectFromPrimitive(toObjectCoercible(value));
    };
  },

  /* Module 26 */
  // Sets the @@toStringTag property on an object's prototype.
  function(module, exports, localRequire) {
    let defineProperty = localRequire(11).f; // Object.defineProperty wrapper.
    let hasOwnProperty = localRequire(14); // Check for own property.
    let toStringTagSymbol = localRequire(6)("toStringTag"); // Symbol.toStringTag.

    module.exports = function(targetObject, tagName, isProto) {
      // If the targetObject or its prototype doesn't have Symbol.toStringTag, define it.
      if (targetObject && !hasOwnProperty(targetObject = isProto ? targetObject.prototype : targetObject, toStringTagSymbol)) {
        defineProperty(targetObject, toStringTagSymbol, {
          configurable: true,
          value: tagName
        });
      }
    };
  },

  /* Module 27 */
  // Retrieves an iterator for a Map object.
  function(module, exports, localRequire) {
    let isPure = localRequire(2); // Check if core-js is in pure mode.
    let mapIterator = localRequire(57); // Native Map.prototype.entries.

    module.exports = isPure ? mapIterator : function(mapInstance) {
      return Map.prototype.entries.call(mapInstance);
    };
  },

  /* Module 28 */
  // Returns the internal [[Class]] of an object (e.g., 'Array', 'Object').
  function(module, exports) {
    let objectToString = {}.toString;
    module.exports = function(value) {
      return objectToString.call(value).slice(8, -1);
    };
  },

  /* Module 29 */
  // Converts a value to a primitive (string, number, or symbol).
  function(module, exports, localRequire) {
    let isObject = localRequire(8); // Check if a value is an object.

    module.exports = function(value, hint) {
      if (!isObject(value)) {
        return value; // If already a primitive, return it.
      }
      let method, result;
      // Try valueOf, then toString, based on the hint.
      if (hint && typeof(method = value.valueOf) === "function" && !isObject(result = method.call(value))) {
        return result;
      }
      if (typeof(method = value.toString) === "function" && !isObject(result = method.call(value))) {
        return result;
      }
      // If no hint or both failed, try toString again.
      if (!hint && typeof(method = value.toString) === "function" && !isObject(result = method.call(value))) {
        return result;
      }
      throw new TypeError("Cannot convert object to primitive value");
    };
  },

  /* Module 30 */
  // Polyfill for Object.create.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the value is an object.
    let objectDefineProperties = localRequire(103); // Defines multiple properties.
    let iePropertyNames = localRequire(82); // List of properties for IE's __proto__ hack.
    let hiddenKeys = localRequire(46); // Object for hidden keys.
    let createUniqueKey = localRequire(59); // Generates a unique key.
    let documentCreateElement = localRequire(78); // Creates a DOM element.

    let ieProtoKey = createUniqueKey("IE_PROTO"); // Key for IE's __proto__ emulation.

    let EmptyConstructor = function() {}; // Empty constructor for prototype chain.

    // A hack for IE's Object.create behavior, creating an iframe to get a clean Object.
    let createIeObject = function() {
      let iframe, document, prototypeObject;
      iframe = documentCreateElement("iframe");
      iframe.style.display = "none";
      localRequire(104).appendChild(iframe); // Append to document body.
      iframe.src = String("javascript:"); // Set source for IE.
      document = iframe.contentWindow.document;
      document.open();
      document.write("<script>document.F=Object<\/script>"); // Define Object in iframe.
      document.close();
      prototypeObject = document.F;
      // Remove unwanted properties from the iframe's Object prototype.
      for (let i = iePropertyNames.length; i--;) {
        delete prototypeObject.prototype[iePropertyNames[i]];
      }
      return prototypeObject();
    };

    module.exports = Object.create || function(prototype, properties) {
      let newObject;
      if (prototype !== null) {
        EmptyConstructor.prototype = requireObject(prototype);
        newObject = new EmptyConstructor();
        EmptyConstructor.prototype = null; // Clean up.
        newObject[ieProtoKey] = prototype; // Store prototype for IE emulation.
      } else {
        newObject = createIeObject();
      }
      // Define additional properties if provided.
      return properties === undefined ? newObject : objectDefineProperties(newObject, properties);
    };

    hiddenKeys[ieProtoKey] = true; // Mark IE_PROTO as a hidden key.
  },

  /* Module 31 */
  // Utility for asserting correct `this` context in constructors.
  function(module, exports) {
    module.exports = function(instance, constructor, typeName) {
      if (!(instance instanceof constructor)) {
        throw new TypeError("Incorrect " + (typeName ? typeName + " " : "") + "invocation");
      }
      return instance;
    };
  },

  /* Module 32 */
  // This module is a factory for TypedArray constructors.
  function(module, exports, localRequire) {
    "use strict";
    let exportUtil = localRequire(0); // General export utility.
    let globalObject = localRequire(5); // Global object.
    let descriptorsAvailable = localRequire(9); // Check for reliable descriptors.
    let nativeTypedArrayChecks = localRequire(95); // Checks for native TypedArray behavior.
    let TypedArrayUtils = localRequire(33); // TypedArray-specific utilities.
    let checkInstance = localRequire(31); // Checks if an object is an instance of a constructor.
    let createPropertyDescriptor = localRequire(35); // Creates a property descriptor.
    let defineProperty = localRequire(16); // Defines a property.
    let toLength = localRequire(10); // Converts a value to a valid length.
    let toUint8Clamped = localRequire(124); // Converts a value to a Uint8Clamped value.
    let getByteOffset = localRequire(217); // Calculates byte offset, ensuring alignment.
    let toPrimitive = localRequire(29); // Converts a value to a primitive.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let isObject = localRequire(8); // Checks if a value is an object.
    let objectCreate = localRequire(30); // Object.create polyfill.
    let setPrototypeOf = localRequire(42); // Object.setPrototypeOf polyfill.
    let getOwnPropertyNames = localRequire(39).f; // Get object's own property names.
    let arrayForEach = localRequire(48).forEach; // Array.prototype.forEach utility.
    let arrayFrom = localRequire(125); // Array.from polyfill.
    let objectDefineProperty = localRequire(11); // Object.defineProperty.
    let objectGetOwnPropertyDescriptor = localRequire(22); // Object.getOwnPropertyDescriptor.
    let internalState = localRequire(18); // Internal state management.

    let getInternalState = internalState.get;
    let setInternalState = internalState.set;

    let round = Math.round;
    let RangeErrorConstructor = globalObject.RangeError;

    let ArrayBufferConstructor = TypedArrayUtils.ArrayBuffer;
    let DataViewConstructor = TypedArrayUtils.DataView;
    let NATIVE_TYPED_ARRAYS_VIEWS = TypedArrayUtils.NATIVE_ARRAY_BUFFER_VIEWS;
    let TYPED_ARRAY_TAG = TypedArrayUtils.TYPED_ARRAY_TAG;
    let getTypedArrayConstructor = TypedArrayUtils.aTypedArrayConstructor;
    let isTypedArray = TypedArrayUtils.isTypedArray;

    // Helper to create a new TypedArray from an iterable.
    let createTypedArrayFromIterable = function(TypedArrayCtor, iterable) {
      let result = [];
      for (let i = 0, len = iterable.length; i < len; i++) {
        result[i] = iterable[i];
      }
      return new(getTypedArrayConstructor(TypedArrayCtor))(result);
    };

    // Helper to define a getter for buffer, byteOffset, byteLength, length.
    let defineTypedArrayProperty = function(prototype, propertyName) {
      objectDefineProperty.f(prototype, propertyName, {
        get: function() {
          return getInternalState(this)[propertyName];
        }
      });
    };

    module.exports = function(typeName, elementSize, definitionCallback, isClamped) {
      let fullTypeName = typeName + (isClamped ? "Clamped" : "") + "Array";
      let getterName = "get" + typeName;
      let setterName = "set" + typeName;

      let NativeTypedArrayConstructor = globalObject[fullTypeName];
      let TypedArrayConstructor = NativeTypedArrayConstructor;
      let TypedArrayPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;

      let customMethods = {};

      // Function to define accessors for each index in the TypedArray.
      let defineIndexAccessors = function(target, index) {
        objectDefineProperty.f(target, index, {
          get: function() {
            return (function(instance, index) {
              let state = getInternalState(instance);
              return state.dataView[getterName](index * elementSize + state.byteOffset, true);
            })(this, index);
          },
          set: function(value) {
            return (function(instance, index, value) {
              let state = getInternalState(instance);
              // Apply clamping logic for ClampedArray.
              if (isClamped) {
                value = round(value);
                value = value < 0 ? 0 : value > 255 ? 255 : 255 & value;
              }
              state.dataView[setterName](index * elementSize + state.byteOffset, value, true);
            })(this, index, value);
          },
          enumerable: true
        });
      };

      // If native TypedArrays are available and behave correctly.
      if (descriptorsAvailable) {
        if (NATIVE_TYPED_ARRAYS_VIEWS) {
          // If native TypedArray views are supported, but possibly buggy.
          if (nativeTypedArrayChecks) {
            // Define a custom constructor that wraps the native one.
            TypedArrayConstructor = definitionCallback(function(instance, arg1, arg2, arg3) {
              checkInstance(instance, TypedArrayConstructor, fullTypeName);
              let buffer, offset, length, byteLength, dataView;

              if (isObject(arg1)) {
                if (TypedArrayUtils.isBuffer(arg1)) {
                  // Case: new TypedArray(buffer, byteOffset, length)
                  offset = getByteOffset(arg2, elementSize);
                  byteLength = arg1.byteLength;
                  if (arg3 === undefined) {
                    // If length is not provided, calculate it.
                    if (byteLength % elementSize) {
                      throw new RangeErrorConstructor("Wrong length");
                    }
                    length = (byteLength - offset) / elementSize;
                    if (length < 0) {
                      throw new RangeErrorConstructor("Wrong length");
                    }
                  } else {
                    // If length is provided, calculate byte length.
                    length = toLength(arg3);
                    byteLength = length * elementSize;
                    if (offset + byteLength > arg1.byteLength) {
                      throw new RangeErrorConstructor("Wrong length");
                    }
                  }
                  buffer = arg1;
                } else if (isTypedArray(arg1)) {
                  // Case: new TypedArray(typedArray)
                  return createTypedArrayFromIterable(TypedArrayConstructor, arg1);
                } else {
                  // Case: new TypedArray(iterable)
                  return arrayFrom.call(TypedArrayConstructor, arg1);
                }
              } else {
                // Case: new TypedArray(length)
                length = toUint8Clamped(arg1);
                buffer = new ArrayBufferConstructor(byteLength = length * elementSize);
              }

              setInternalState(instance, {
                buffer: buffer,
                byteOffset: offset,
                byteLength: byteLength,
                length: length,
                dataView: new DataViewConstructor(buffer)
              });
              // Return this, as the native constructor is called internally.
              return instance;
            });
            // Inherit prototype and static properties from native TypedArray.
            setPrototypeOf(TypedArrayConstructor, TypedArrayUtils.TypedArray);
            arrayForEach(getOwnPropertyNames(NativeTypedArrayConstructor), function(key) {
              if (!(key in TypedArrayConstructor)) {
                defineProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
              }
            });
            TypedArrayConstructor.prototype = TypedArrayPrototype; // Set prototype.
          }
        } else {
          // Fallback for non-native TypedArray views (simulated).
          TypedArrayConstructor = definitionCallback(function(instance, arg1, arg2, arg3) {
            checkInstance(instance, TypedArrayConstructor, fullTypeName);
            let buffer, offset, length, byteLength, dataView;
            let index = 0;

            if (isObject(arg1)) {
              if (!TypedArrayUtils.isBuffer(arg1)) {
                // Case: new TypedArray(iterable) or new TypedArray(typedArray)
                return isTypedArray(arg1) ?
                  createTypedArrayFromIterable(TypedArrayConstructor, arg1) :
                  arrayFrom.call(TypedArrayConstructor, arg1);
              }
              // Case: new TypedArray(buffer, byteOffset, length)
              buffer = arg1;
              offset = getByteOffset(arg2, elementSize);
              let bufferByteLength = arg1.byteLength;
              if (arg3 === undefined) {
                if (bufferByteLength % elementSize) {
                  throw new RangeErrorConstructor("Wrong length");
                }
                byteLength = bufferByteLength - offset;
                if (byteLength < 0) {
                  throw new RangeErrorConstructor("Wrong length");
                }
              } else {
                length = toLength(arg3);
                byteLength = length * elementSize;
                if (offset + byteLength > bufferByteLength) {
                  throw new RangeErrorConstructor("Wrong length");
                }
              }
              length = byteLength / elementSize;
            } else {
              // Case: new TypedArray(length)
              length = toUint8Clamped(arg1);
              buffer = new ArrayBufferConstructor(byteLength = length * elementSize);
            }
            setInternalState(instance, {
              buffer: buffer,
              byteOffset: offset,
              byteLength: byteLength,
              length: length,
              dataView: new DataViewConstructor(buffer)
            });
            // Define indexed accessors for each element.
            while (index < length) {
              defineIndexAccessors(instance, index++);
            }
          });
          // Inherit prototype from TypedArrayUtils.TypedArray.
          setPrototypeOf(TypedArrayConstructor, TypedArrayUtils.TypedArray);
          TypedArrayPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayUtils.TypedArrayPrototype);
        }

        // Ensure constructor property is correct.
        if (TypedArrayPrototype.constructor !== TypedArrayConstructor) {
          defineProperty(TypedArrayPrototype, "constructor", TypedArrayConstructor);
        }
        // Set @@toStringTag if supported.
        if (TYPED_ARRAY_TAG) {
          defineProperty(TypedArrayPrototype, TYPED_ARRAY_TAG, fullTypeName);
        }

        // Export the constructor.
        customMethods[fullTypeName] = TypedArrayConstructor;
        exportUtil({
          global: true,
          forced: TypedArrayConstructor !== NativeTypedArrayConstructor,
          sham: !NATIVE_TYPED_ARRAYS_VIEWS
        }, customMethods);

        // Define BYTES_PER_ELEMENT static and prototype properties.
        if (!("BYTES_PER_ELEMENT" in TypedArrayConstructor)) {
          defineProperty(TypedArrayConstructor, "BYTES_PER_ELEMENT", elementSize);
        }
        if (!("BYTES_PER_ELEMENT" in TypedArrayPrototype)) {
          defineProperty(TypedArrayPrototype, "BYTES_PER_ELEMENT", elementSize);
        }

        // Add to TypedArrayUtils for internal tracking.
        TypedArrayUtils.exportTypedArray(fullTypeName);
      } else {
        // If descriptors are not available, this module does nothing.
        module.exports = function() {};
      }
    };
  },

  /* Module 33 */
  // TypedArray utilities and definitions.
  function(module, exports, localRequire) {
    "use strict";
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let globalObject = localRequire(5); // Global object.
    let isObject = localRequire(8); // Checks if a value is an object.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let defineProperty = localRequire(16); // Defines a property.
    let setProperty = localRequire(23); // Sets a property (with source tracking for functions).
    let objectDefineProperty = localRequire(11).f; // Object.defineProperty.
    let getPrototypeOf = localRequire(21); // Object.getPrototypeOf.
    let setPrototypeOf = localRequire(42); // Object.setPrototypeOf.
    let wellKnownSymbol = localRequire(6); // Retrieves a well-known Symbol.
    let generateSymbolId = localRequire(45); // Generates a unique string ID.
    let getClassTag = localRequire(28); // Returns the internal [[Class]] tag.

    let DataViewConstructor = globalObject.DataView;
    let DataViewPrototype = DataViewConstructor && DataViewConstructor.prototype;
    let Int8ArrayConstructor = globalObject.Int8Array;
    let Int8ArrayPrototype = Int8ArrayConstructor && Int8ArrayConstructor.prototype;
    let Uint8ClampedArrayConstructor = globalObject.Uint8ClampedArray;
    let Uint8ClampedArrayPrototype = Uint8ClampedArrayConstructor && Uint8ClampedArrayConstructor.prototype;

    let getNativeTypedArrayPrototype = Int8ArrayConstructor && getPrototypeOf(Int8ArrayConstructor);
    let getNativeTypedArrayPrototypePrototype = Int8ArrayPrototype && getPrototypeOf(Int8ArrayPrototype);

    let objectPrototype = Object.prototype;
    let isPrototypeOf = objectPrototype.isPrototypeOf;
    let toStringTagSymbol = wellKnownSymbol("toStringTag");
    let typedArrayTagSymbol = generateSymbolId("TYPED_ARRAY_TAG");

    // Check for native ArrayBuffer and DataView support.
    let NATIVE_ARRAY_BUFFER = !!(globalObject.ArrayBuffer && DataViewConstructor);
    // Check for native TypedArray support (Int8Array, etc.).
    let NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!(Int8ArrayConstructor && Uint8ClampedArrayConstructor);

    let setPrototypeIfPossible = NATIVE_ARRAY_BUFFER && !!setPrototypeOf;
    let TypedArrayConstructorMissing = false; // Flag to check if any TypedArray constructor is missing.

    // Map of TypedArray names to their element sizes.
    const TypedArraySizes = {
      Int8Array: 1,
      Uint8Array: 1,
      Uint8ClampedArray: 1,
      Int16Array: 2,
      Uint16Array: 2,
      Int32Array: 4,
      Uint32Array: 4,
      Float32Array: 4,
      Float64Array: 8,
    };

    /**
     * Checks if a value is a TypedArray.
     * @param {any} value - The value to check.
     * @returns {boolean} True if it's a TypedArray, false otherwise.
     */
    let isTypedArrayValue = function(value) {
      return isObject(value) && hasOwnProperty(TypedArraySizes, getClassTag(value));
    };

    // Check if all native TypedArray constructors exist.
    for (let key in TypedArraySizes) {
      if (!globalObject[key]) {
        TypedArrayConstructorMissing = true;
        break;
      }
    }

    // Set up the base TypedArray constructor (polyfill or native).
    let TypedArrayBaseConstructor;
    if (setPrototypeIfPossible && !TypedArrayConstructorMissing) {
      // If native TypedArrays exist, use the prototype chain from Int8Array.
      TypedArrayBaseConstructor = getNativeTypedArrayPrototype;
      if (typeof TypedArrayBaseConstructor !== "function" || TypedArrayBaseConstructor === Function.prototype) {
        TypedArrayBaseConstructor = function() {
          throw new TypeError("Incorrect invocation");
        };
        // Set prototype chain for all existing TypedArrays to this polyfilled base.
        for (let key in TypedArraySizes) {
          if (globalObject[key]) {
            setPrototypeOf(globalObject[key], TypedArrayBaseConstructor);
          }
        }
      }
    } else {
      // Fallback if native TypedArrays are missing or setPrototypeOf is not available.
      TypedArrayBaseConstructor = function() {
        throw new TypeError("Incorrect invocation");
      };
    }

    // Set up the base TypedArray prototype (polyfill or native).
    let TypedArrayBasePrototype = TypedArrayBaseConstructor.prototype;
    if (setPrototypeIfPossible && TypedArrayBasePrototype && TypedArrayBasePrototype !== objectPrototype && getPrototypeOf(TypedArrayBasePrototype) !== objectPrototype) {
      // If native TypedArray prototype exists, use its prototype.
    } else {
      // Fallback: create a new object as the base prototype.
      TypedArrayBasePrototype = TypedArrayBaseConstructor.prototype = {};
    }

    // If Uint8ClampedArray prototype doesn't match the base, set its prototype.
    if (setPrototypeIfPossible && Uint8ClampedArrayPrototype && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayBasePrototype) {
      setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayBasePrototype);
    }

    let isTypedArrayTagMissing = false;
    if (descriptorsAvailable && !hasOwnProperty(TypedArrayBasePrototype, toStringTagSymbol)) {
      isTypedArrayTagMissing = true;
      // Define @@toStringTag on the base prototype.
      objectDefineProperty.f(TypedArrayBasePrototype, toStringTagSymbol, {
        get: function() {
          return isObject(this) ? this[typedArrayTagSymbol] : undefined;
        }
      });
    }

    // Define TypedArrayTag on all native TypedArray prototypes.
    if (isTypedArrayTagMissing) {
      for (let key in TypedArraySizes) {
        if (globalObject[key]) {
          defineProperty(globalObject[key], typedArrayTagSymbol, key);
        }
      }
    }

    // Set DataView prototype if necessary.
    if (NATIVE_ARRAY_BUFFER && setPrototypeIfPossible && DataViewPrototype && getPrototypeOf(DataViewPrototype) !== objectPrototype) {
      setPrototypeOf(DataViewPrototype, objectPrototype);
    }

    module.exports = {
      NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER,
      NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
      TYPED_ARRAY_TAG: isTypedArrayTagMissing && typedArrayTagSymbol,
      // Ensures the value is a TypedArray instance.
      aTypedArray: function(value) {
        if (isTypedArrayValue(value)) {
          return value;
        }
        throw new TypeError("Target is not a typed array");
      },
      // Ensures the value is a TypedArray constructor.
      aTypedArrayConstructor: function(value) {
        if (setPrototypeIfPossible) {
          if (isPrototypeOf.call(TypedArrayBaseConstructor, value)) {
            return value;
          }
        } else {
          for (let key in TypedArraySizes) {
            if (hasOwnProperty(TypedArraySizes, key)) {
              let TypedArrayCtor = globalObject[key];
              if (TypedArrayCtor && (value === TypedArrayCtor || isPrototypeOf.call(TypedArrayCtor, value))) {
                return value;
              }
            }
          }
        }
        throw new TypeError("Target is not a typed array constructor");
      },
      // Exports a method to TypedArray.prototype.
      exportProto: function(methodName, implementation, shouldOverwrite) {
        if (descriptorsAvailable) {
          if (shouldOverwrite) {
            for (let key in TypedArraySizes) {
              let Ctor = globalObject[key];
              if (Ctor && hasOwnProperty(Ctor.prototype, methodName)) {
                delete Ctor.prototype[methodName];
              }
            }
          }
          if (!(TypedArrayBasePrototype[methodName] && !shouldOverwrite)) {
            setProperty(TypedArrayBasePrototype, methodName, shouldOverwrite ? implementation : (NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[methodName]) || implementation);
          }
        }
      },
      // Exports a static method to TypedArray constructors.
      exportStatic: function(methodName, implementation, shouldOverwrite) {
        let Ctor;
        if (descriptorsAvailable) {
          if (shouldOverwrite) {
            for (let key in TypedArraySizes) {
              Ctor = globalObject[key];
              if (Ctor && hasOwnProperty(Ctor, methodName)) {
                delete Ctor[methodName];
              }
            }
          }
          if (!(TypedArrayBaseConstructor[methodName] && !shouldOverwrite)) {
            try {
              return setProperty(TypedArrayBaseConstructor, methodName, shouldOverwrite ? implementation : (NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayConstructor[methodName]) || implementation);
            } catch (error) {
              // Handle cases where properties cannot be set on the base constructor.
            }
          }
        }
        // Fallback for non-descriptors or specific cases.
        for (let key in TypedArraySizes) {
          Ctor = globalObject[key];
          if (Ctor && (!Ctor[methodName] || shouldOverwrite)) {
            setProperty(Ctor, methodName, implementation);
          }
        }
      },
      // Checks if a value is a DataView or a TypedArray.
      isView: function(value) {
        let tag = getClassTag(value);
        return tag === "DataView" || hasOwnProperty(TypedArraySizes, tag);
      },
      isTypedArray: isTypedArrayValue,
      TypedArray: TypedArrayBaseConstructor,
      TypedArrayPrototype: TypedArrayBasePrototype,
      ArrayBuffer: globalObject.ArrayBuffer, // Export ArrayBuffer directly.
      DataView: DataViewConstructor, // Export DataView directly.
    };
  },

  /* Module 34 */
  // Metadata API implementation (Reflect.metadata).
  function(module, exports, localRequire) {
    let MapConstructor = localRequire(88); // Use Map for storing metadata.
    let WeakMapConstructor = localRequire(96); // Use WeakMap for object keys.
    let sharedSymbolRegistry = localRequire(38); // Shared symbol registry.

    let metadataStore = sharedSymbolRegistry("metadata");
    metadataStore.store = metadataStore.store || new WeakMapConstructor(); // Main WeakMap for metadata.

    /**
     * Retrieves or creates a metadata map for a given object and key.
     * @param {object} object - The target object.
     * @param {any} key - The metadata key.
     * @param {boolean} createIfMissing - If true, creates the map if it doesn't exist.
     * @returns {Map|undefined} The metadata map or undefined.
     */
    let getMetadataMap = function(object, key, createIfMissing) {
      let objectMetadata = metadataStore.store.get(object);
      if (!objectMetadata) {
        if (!createIfMissing) return undefined;
        metadataStore.store.set(object, objectMetadata = new MapConstructor());
      }
      let keyMetadata = objectMetadata.get(key);
      if (!keyMetadata) {
        if (!createIfMissing) return undefined;
        objectMetadata.set(key, keyMetadata = new MapConstructor());
      }
      return keyMetadata;
    };

    module.exports = {
      store: metadataStore.store,
      getMap: getMetadataMap,
      has: function(metadataKey, targetObject, propertyKey) {
        let metadataMap = getMetadataMap(targetObject, propertyKey, false);
        return metadataMap !== undefined && metadataMap.has(metadataKey);
      },
      get: function(metadataKey, targetObject, propertyKey) {
        let metadataMap = getMetadataMap(targetObject, propertyKey, false);
        return metadataMap === undefined ? undefined : metadataMap.get(metadataKey);
      },
      set: function(metadataKey, metadataValue, targetObject, propertyKey) {
        getMetadataMap(targetObject, propertyKey, true).set(metadataKey, metadataValue);
      },
      keys: function(targetObject, propertyKey) {
        let metadataMap = getMetadataMap(targetObject, propertyKey, false);
        let keys = [];
        if (metadataMap) {
          metadataMap.forEach(function(value, key) {
            keys.push(key);
          });
        }
        return keys;
      },
      toKey: function(value) {
        return value === undefined || typeof value === "symbol" ? value : String(value);
      }
    };
  },

  /* Module 35 */
  // Creates a property descriptor object.
  function(module, exports) {
    module.exports = function(flags, value) {
      return {
        enumerable: !(flags & 1), // Bit 0: enumerable (true if 0)
        configurable: !(flags & 2), // Bit 1: configurable (true if 0)
        writable: !(flags & 4), // Bit 2: writable (true if 0)
        value: value // The property's value.
      };
    };
  },

  /* Module 36 */
  // Extends an object with new properties, similar to Object.assign.
  function(module, exports, localRequire) {
    let setProperty = localRequire(23); // Defines a property on an object.

    module.exports = function(targetObject, properties, options) {
      for (let key in properties) {
        setProperty(targetObject, key, properties[key], options);
      }
      return targetObject;
    };
  },

  /* Module 37 */
  // Retrieves an iterator for a Set object.
  function(module, exports, localRequire) {
    let isPure = localRequire(2); // Check if core-js is in pure mode.
    let setIterator = localRequire(57); // Native Set.prototype.values.

    module.exports = isPure ? setIterator : function(setInstance) {
      return Set.prototype.values.call(setInstance);
    };
  },

  /* Module 38 */
  // Manages a shared registry for internal core-js data.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let createGlobalProperty = localRequire(79); // Creates a global property.
    let isPure = localRequire(2); // Check if core-js is in pure mode.

    // Get or create the shared core-js object.
    let sharedGlobalRegistry = globalObject["__core-js_shared__"] || createGlobalProperty("__core-js_shared__", {});

    // This function acts as a getter/setter for shared data.
    module.exports = (function(key, defaultValue) {
      return sharedGlobalRegistry[key] || (sharedGlobalRegistry[key] = defaultValue !== undefined ? defaultValue : {});
    })("versions", []).push({
      version: "3.1.3",
      mode: isPure ? "pure" : "global",
      copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
    });
  },

  /* Module 39 */
  // Wrapper for Object.getOwnPropertyNames.
  function(module, exports, localRequire) {
    let getOwnPropertyNamesPolyfill = localRequire(101); // Polyfill for getting property names.
    let iePropertyNames = localRequire(82).concat("length", "prototype"); // IE-specific property names.

    exports.f = Object.getOwnPropertyNames || function(object) {
      return getOwnPropertyNamesPolyfill(object, iePropertyNames);
    };
  },

  /* Module 40 */
  // Defines a property on an object, handling symbol keys and existing properties.
  function(module, exports, localRequire) {
    "use strict";
    let toPrimitive = localRequire(29); // Converts a value to a primitive.
    let objectDefineProperty = localRequire(11); // Object.defineProperty wrapper.
    let createPropertyDescriptor = localRequire(35); // Creates a property descriptor.

    module.exports = function(object, property, value) {
      let primitiveProperty = toPrimitive(property);
      // If property already exists, update it. Otherwise, define it.
      if (primitiveProperty in object) {
        objectDefineProperty.f(object, primitiveProperty, createPropertyDescriptor(0, value));
      } else {
        object[primitiveProperty] = value;
      }
    };
  },

  /* Module 41 */
  // Removes a property from the Array.prototype[Symbol.unscopables] object.
  function(module, exports, localRequire) {
    let wellKnownSymbol = localRequire(6); // Get a well-known symbol.
    let objectCreate = localRequire(30); // Object.create polyfill.
    let defineProperty = localRequire(16); // Define a property.

    let unscopablesSymbol = wellKnownSymbol("unscopables"); // Symbol.unscopables.
    let arrayPrototype = Array.prototype;

    // If Array.prototype[Symbol.unscopables] doesn't exist, create it as a null object.
    if (arrayPrototype[unscopablesSymbol] === null || arrayPrototype[unscopablesSymbol] === undefined) {
      defineProperty(arrayPrototype, unscopablesSymbol, objectCreate(null));
    }

    module.exports = function(property) {
      // Mark the property as scopable by setting its value to true.
      arrayPrototype[unscopablesSymbol][property] = true;
    };
  },

  /* Module 42 */
  // Polyfill for Object.setPrototypeOf.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the value is an object.
    let checkProtoObject = localRequire(111); // Checks if the prototype is a valid object or null.

    // Feature detection for __proto__ support.
    // If __proto__ is supported, a setter function is created.
    let setPrototypeOfNative = Object.setPrototypeOf;
    let supportsProto = "__proto__" in {};
    let protoSetterFunction = undefined;

    if (supportsProto) {
      try {
        let testObject = {};
        // Attempt to get the setter for __proto__.
        protoSetterFunction = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
        protoSetterFunction.call(testObject, []); // Call it with an array.
        supportsProto = testObject instanceof Array; // Check if it correctly sets prototype.
      } catch (error) {
        supportsProto = false; // If an error, __proto__ is not reliable.
      }
    }

    module.exports = setPrototypeOfNative || (supportsProto ?
      function(object, prototype) {
        requireObject(object);
        checkProtoObject(prototype);
        protoSetterFunction.call(object, prototype);
        return object;
      } :
      undefined); // If no native or reliable __proto__, return undefined.
  },

  /* Module 43 */
  // Sets the Symbol.species property on a constructor.
  function(module, exports, localRequire) {
    "use strict";
    let getBuiltIn = localRequire(12); // Retrieves a built-in object.
    let objectDefineProperty = localRequire(11); // Object.defineProperty wrapper.
    let wellKnownSymbol = localRequire(6); // Symbol.species.
    let descriptorsAvailable = localRequire(9); // Check for reliable descriptors.

    let speciesSymbol = wellKnownSymbol("species"); // Get Symbol.species.

    module.exports = function(constructorName) {
      let Constructor = getBuiltIn(constructorName);
      let nativeDefineProperty = objectDefineProperty.f;

      // If descriptors are available and the constructor exists,
      // and it doesn't already have Symbol.species, define it.
      if (descriptorsAvailable && Constructor && !Constructor[speciesSymbol]) {
        nativeDefineProperty(Constructor, speciesSymbol, {
          configurable: true,
          get: function() {
            return this;
          }
        });
      }
    };
  },

  /* Module 44 */
  // Extracts the flags from a RegExp object.
  function(module, exports) {
    "use strict";
    module.exports = function() {
      let regexInstance = this;
      let flags = "";
      if (regexInstance.global) flags += "g";
      if (regexInstance.ignoreCase) flags += "i";
      if (regexInstance.multiline) flags += "m";
      if (regexInstance.dotAll) flags += "s";
      if (regexInstance.unicode) flags += "u";
      if (regexInstance.sticky) flags += "y";
      return flags;
    };
  },

  /* Module 45 */
  // Generates a unique string ID.
  function(module, exports) {
    let uniqueIdCounter = 0;
    let randomSeed = Math.random();

    module.exports = function(description) {
      return "Symbol(" + String(description === undefined ? "" : description) + ")_" +
        (++uniqueIdCounter + randomSeed).toString(36);
    };
  },

  /* Module 46 */
  // An object used to store keys that should be hidden from enumeration.
  function(module, exports) {
    module.exports = {};
  },

  /* Module 47 */
  // Checks if a value is an Array.
  function(module, exports, localRequire) {
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.

    module.exports = Array.isArray || function(value) {
      return getClassTag(value) === "Array";
    };
  },

  /* Module 48 */
  // Provides array iteration methods (forEach, map, filter, etc.).
  function(module, exports, localRequire) {
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let toIndexedObject = localRequire(77); // Converts a value to an indexed object.
    let toObject = localRequire(15); // Converts a value to an object.
    let toLength = localRequire(10); // Converts a value to a valid length.
    let createArraySpecies = localRequire(49); // Creates a new array using species constructor.

    let push = [].push;

    /**
     * Factory function for array iteration methods.
     * @param {number} operationType - 0: forEach, 1: map, 2: filter, 3: some, 4: every, 5: find, 6: findIndex.
     * @returns {Function} The generated array iteration method.
     */
    let createIterationMethod = function(operationType) {
      let isMap = operationType === 1;
      let isFilter = operationType === 2;
      let isSome = operationType === 3;
      let isEvery = operationType === 4;
      let isFind = operationType === 5;
      let isFindIndex = operationType === 6;
      let isPredicateOperation = isFind || isFindIndex || isSome; // Operations that use a predicate.

      return function(arrayLike, callbackFunction, thisArg) {
        let object = toObject(arrayLike);
        let indexedObject = toIndexedObject(object);
        let boundCallback = createBoundFunction(callbackFunction, thisArg, 3); // Bind callback to context.
        let length = toLength(indexedObject.length);
        let index = 0;
        let result = isMap ? createArraySpecies(arrayLike, length) : isFilter ? createArraySpecies(arrayLike, 0) : undefined;
        let currentValue, callbackResult;

        for (; index < length; index++) {
          if (index in indexedObject) { // Check if the index exists.
            currentValue = indexedObject[index];
            callbackResult = boundCallback(currentValue, index, object); // Execute callback.

            if (operationType === 0) { // forEach
              // Do nothing, just execute callback.
            } else if (isMap) { // map
              result[index] = callbackResult;
            } else if (isFilter) { // filter
              if (callbackResult) {
                push.call(result, currentValue);
              }
            } else if (isSome) { // some
              if (callbackResult) {
                return true;
              }
            } else if (isEvery) { // every
              if (!callbackResult) {
                return false;
              }
            } else if (isFind) { // find
              if (callbackResult) {
                return currentValue;
              }
            } else if (isFindIndex) { // findIndex
              if (callbackResult) {
                return index;
              }
            }
          }
        }
        return isFindIndex ? -1 : isSome ? false : isEvery ? true : result;
      };
    };

    module.exports = {
      forEach: createIterationMethod(0),
      map: createIterationMethod(1),
      filter: createIterationMethod(2),
      some: createIterationMethod(3),
      every: createIterationMethod(4),
      find: createIterationMethod(5),
      findIndex: createIterationMethod(6)
    };
  },

  /* Module 49 */
  // Creates a new array using the constructor's @@species.
  function(module, exports, localRequire) {
    let isObject = localRequire(8); // Checks if a value is an object.
    let isArray = localRequire(47); // Checks if a value is an array.
    let speciesSymbol = localRequire(6)("species"); // Symbol.species.

    module.exports = function(originalArray, length) {
      let constructor;

      // If it's an array, try to get its constructor's Symbol.species.
      if (isArray(originalArray)) {
        constructor = originalArray.constructor;
        if (typeof constructor === "function" && (constructor !== Array && !isArray(constructor.prototype))) {
          // If constructor is a function but not Array, check its species.
          if (isObject(constructor) && constructor[speciesSymbol] === null) {
            constructor = undefined; // If species is null, treat as no species.
          } else {
            constructor = constructor[speciesSymbol];
          }
        } else {
          constructor = undefined; // Not an array or no custom species.
        }
      }

      // If no species constructor is found, use Array.
      return new(constructor === undefined ? Array : constructor)(length === 0 ? 0 : length);
    };
  },

  /* Module 50 */
  // Tests if Array.prototype methods (like `concat`, `slice`) work correctly with species.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let speciesSymbol = localRequire(6)("species"); // Symbol.species.

    module.exports = function(methodName) {
      return !fails(function() {
        let testArray = [];
        let constructor = (testArray.constructor = {});
        constructor[speciesSymbol] = function() {
          return {
            foo: 1
          };
        };
        return testArray[methodName](Boolean).foo !== 1;
      });
    };
  },

  /* Module 51 */
  // A registry for iterator methods, mapping internal [[Class]] tags to iterators.
  function(module, exports) {
    module.exports = {};
  },

  /* Module 52 */
  // Retrieves the iterator method for an iterable object.
  function(module, exports, localRequire) {
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.
    let iteratorRegistry = localRequire(51); // Iterator registry.
    let iteratorSymbol = localRequire(6)("iterator"); // Symbol.iterator.

    module.exports = function(iterable) {
      if (iterable !== null && iterable !== undefined) {
        // First try Symbol.iterator, then @@iterator, then the registry.
        return iterable[iteratorSymbol] || iterable["@@iterator"] || iteratorRegistry[getClassTag(iterable)];
      }
      return undefined;
    };
  },

  /* Module 53 */
  // Returns the internal [[Class]] tag of an object, handling Arguments objects.
  function(module, exports, localRequire) {
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.
    let toStringTagSymbol = localRequire(6)("toStringTag"); // Symbol.toStringTag.

    let isArguments = getClassTag(function() {
      return arguments;
    }()) === "Arguments";

    module.exports = function(value) {
      let tag, customTag;
      // Handle null and undefined explicitly.
      if (value === undefined) return "Undefined";
      if (value === null) return "Null";
      // Try to get @@toStringTag if it's a string.
      customTag = (function(object, property) {
        try {
          return object[property];
        } catch (error) {
          // Ignore errors during property access.
        }
      })(Object(value), toStringTagSymbol);
      if (typeof customTag === "string") {
        return customTag;
      }
      // Fallback to internal [[Class]] tag.
      tag = getClassTag(value);
      if (isArguments) {
        return tag === "Object" && typeof value.callee === "function" ? "Arguments" : tag;
      }
      return tag;
    };
  },

  /* Module 54 */
  // Creates an iterator factory function and sets up its prototype chain.
  function(module, exports, localRequire) {
    "use strict";
    let IteratorPrototype = localRequire(109).IteratorPrototype; // Base Iterator.prototype.
    let objectCreate = localRequire(30); // Object.create polyfill.
    let createPropertyDescriptor = localRequire(35); // Creates a property descriptor.
    let setToStringTag = localRequire(26); // Sets @@toStringTag.
    let iteratorRegistry = localRequire(51); // Iterator registry.

    let noopNext = function() {
      return this;
    }; // Default `next` for Iterator.prototype.

    module.exports = function(IteratorConstructor, typeName, nextMethod) {
      let iteratorName = typeName + " Iterator";
      // Set prototype chain: IteratorConstructor.prototype -> IteratorPrototype.
      IteratorConstructor.prototype = objectCreate(IteratorPrototype, {
        next: createPropertyDescriptor(1, nextMethod)
      });
      setToStringTag(IteratorConstructor, iteratorName, false, true); // Set @@toStringTag.
      iteratorRegistry[iteratorName] = noopNext; // Add to iterator registry.
      return IteratorConstructor;
    };
  },

  /* Module 55 */
  // A factory for creating Promise capability objects.
  function(module, exports, localRequire) {
    "use strict";
    let requireFunction = localRequire(4); // Ensures the value is a function.

    /**
     * Represents a Promise capability object, holding resolve and reject functions.
     * @param {Function} PromiseConstructor - The Promise constructor to use.
     */
    let PromiseCapability = function(PromiseConstructor) {
      let resolveFunction, rejectFunction;
      // Create a new promise and capture its resolve/reject handlers.
      this.promise = new PromiseConstructor(function(resolve, reject) {
        if (resolveFunction !== undefined || rejectFunction !== undefined) {
          throw new TypeError("Bad Promise constructor");
        }
        resolveFunction = resolve;
        rejectFunction = reject;
      });
      // Store the captured handlers.
      this.resolve = requireFunction(resolveFunction);
      this.reject = requireFunction(rejectFunction);
    };

    module.exports.f = function(PromiseConstructor) {
      return new PromiseCapability(PromiseConstructor);
    };
  },

  /* Module 56 */
  // String character utilities (charAt, codeAt).
  function(module, exports, localRequire) {
    let requireObjectCoercible = localRequire(17); // Ensures value is not null/undefined.
    let toInteger = localRequire(24); // Converts value to an integer.

    /**
     * Factory function to create charAt or codeAt.
     * @param {boolean} isString - If true, returns a string character; otherwise, returns a character code.
     * @returns {Function} The generated utility function.
     */
    let createStringCharIterator = function(isString) {
      return function(targetString, index) {
        let stringValue = String(requireObjectCoercible(targetString));
        let charIndex = toInteger(index);
        let stringLength = stringValue.length;
        let charCode, nextCharCode;

        // Handle out-of-bounds index.
        if (charIndex < 0 || charIndex >= stringLength) {
          return isString ? "" : undefined;
        }

        charCode = stringValue.charCodeAt(charIndex);
        // Handle surrogate pairs (UTF-16).
        if (charCode < 0xD800 || charCode > 0xDBFF || // Not a high surrogate.
          charIndex + 1 === stringLength || // Last character.
          (nextCharCode = stringValue.charCodeAt(charIndex + 1)) < 0xDC00 || nextCharCode > 0xDFFF) { // Not a low surrogate.
          return isString ? stringValue.charAt(charIndex) : charCode;
        }

        // If it's a surrogate pair, return both characters or the code point.
        return isString ? stringValue.slice(charIndex, charIndex + 2) : nextCharCode - 0xDC00 + ((charCode - 0xD800) << 10) + 0x10000;
      };
    };

    module.exports = {
      codeAt: createStringCharIterator(false),
      charAt: createStringCharIterator(true)
    };
  },

  /* Module 57 */
  // Retrieves the native iterator for Map/Set.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the value is an object.
    let getIteratorMethod = localRequire(52); // Retrieves the iterator method.

    module.exports = function(iterable) {
      let iteratorMethod = getIteratorMethod(iterable);
      if (typeof iteratorMethod !== "function") {
        throw new TypeError(String(iterable) + " is not iterable");
      }
      return requireObject(iteratorMethod.call(iterable));
    };
  },

  /* Module 58 */
  // Wrapper for Object.prototype.propertyIsEnumerable.
  function(module, exports, localRequire) {
    "use strict";
    let nativePropertyIsEnumerable = {}.propertyIsEnumerable;
    let getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // Check for a bug in propertyIsEnumerable (e.g., IE < 9).
    // `Object.getOwnPropertyDescriptor({1:2}, 1)` might work, but `propertyIsEnumerable.call({1:2}, 1)` might fail.
    let buggyPropertyIsEnumerable = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
      1: 2
    }, 1);

    exports.f = buggyPropertyIsEnumerable ?
      function(property) {
        let descriptor = getOwnPropertyDescriptor(this, property);
        return !!descriptor && descriptor.enumerable;
      } :
      nativePropertyIsEnumerable;
  },

  /* Module 59 */
  // Generates a unique key for internal use.
  function(module, exports, localRequire) {
    let sharedSymbolRegistry = localRequire(38); // Access the shared symbol registry.
    let generateSymbolId = localRequire(45); // Generates a unique string ID.

    let keyCache = sharedSymbolRegistry("keys");

    module.exports = function(keyName) {
      // Return existing key or generate a new one and cache it.
      return keyCache[keyName] || (keyCache[keyName] = generateSymbolId(keyName));
    };
  },

  /* Module 60 */
  // Array.prototype.includes and Array.prototype.indexOf polyfills.
  function(module, exports, localRequire) {
    let toIndexedObject = localRequire(25); // Converts to an indexed object.
    let toLength = localRequire(10); // Converts to a valid length.
    let toAbsoluteIndex = localRequire(61); // Converts index to an absolute index.

    /**
     * Factory function for Array.prototype.includes/indexOf.
     * @param {boolean} isIncludes - If true, implements `includes`; otherwise, `indexOf`.
     * @returns {Function} The generated method.
     */
    let createSearchMethod = function(isIncludes) {
      return function(arrayLike, searchValue, fromIndex) {
        let object = toIndexedObject(arrayLike);
        let length = toLength(object.length);
        let index = toAbsoluteIndex(fromIndex, length);
        let currentItem;

        // Handle NaN values for `includes`.
        if (isIncludes && searchValue !== searchValue) {
          while (length > index) {
            currentItem = object[index++];
            if (currentItem !== currentItem) {
              return true;
            }
          }
        } else {
          for (; length > index; index++) {
            if ((isIncludes || index in object) && object[index] === searchValue) {
              return isIncludes || index || 0; // Return index or true.
            }
          }
        }
        return isIncludes ? false : -1;
      };
    };

    module.exports = {
      includes: createSearchMethod(true),
      indexOf: createSearchMethod(false)
    };
  },

  /* Module 61 */
  // Converts an index to an absolute, valid array index.
  function(module, exports, localRequire) {
    let toInteger = localRequire(24); // Converts to an integer.
    let max = Math.max;
    let min = Math.min;

    module.exports = function(index, length) {
      let integerIndex = toInteger(index);
      return integerIndex < 0 ? max(integerIndex + length, 0) : min(integerIndex, length);
    };
  },

  /* Module 62 */
  // Checks if a polyfill is "forced" for a specific feature.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.

    // Regex to match dot or prototype in feature names (e.g., 'Array.prototype.map').
    const featureNameRegex = /#|\.prototype\./;

    /**
     * Normalizes a feature name (e.g., "Array.prototype.map" -> "array.map").
     * @param {string} name - The original feature name.
     * @returns {string} The normalized name.
     */
    let normalizeFeatureName = function(name) {
      return String(name).replace(featureNameRegex, ".").toLowerCase();
    };

    let featureStatus = {}; // Cache for feature status.
    const NATIVE_STATUS = "N"; // Native implementation.
    const POLYFILL_STATUS = "P"; // Polyfill provided.

    /**
     * Checks if a polyfill is forced.
     * @param {string} feature - The feature name.
     * @param {boolean|Function} isForced - If true, force polyfill; if function, execute to determine.
     * @returns {boolean} True if the polyfill should be applied.
     */
    let checkForcePolyfill = function(feature, isForced) {
      let normalizedName = normalizeFeatureName(feature);
      let status = featureStatus[normalizedName];

      // If status is native, don't force. If polyfill, always force.
      if (status === NATIVE_STATUS) return false;
      if (status === POLYFILL_STATUS) return true;

      // If not cached, determine status.
      let shouldForce = typeof isForced === "function" ? fails(isForced) : !!isForced;
      featureStatus[normalizedName] = shouldForce ? POLYFILL_STATUS : NATIVE_STATUS;
      return shouldForce;
    };

    module.exports = checkForcePolyfill;
    module.exports.normalize = normalizeFeatureName;
    module.exports.data = featureStatus;
    module.exports.NATIVE = NATIVE_STATUS;
    module.exports.POLYFILL = POLYFILL_STATUS;
  },

  /* Module 63 */
  // Polyfill for Object.keys.
  function(module, exports, localRequire) {
    let getOwnPropertyNamesPolyfill = localRequire(101); // Polyfill for getting property names.
    let ignoredPropertyNames = localRequire(82); // Property names to ignore.

    module.exports = Object.keys || function(object) {
      return getOwnPropertyNamesPolyfill(object, ignoredPropertyNames);
    };
  },

  /* Module 64 */
  // Checks if a constructor (like ArrayBuffer or TypedArray) accepts a single argument.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let iteratorSymbol = localRequire(6)("iterator"); // Symbol.iterator.

    module.exports = function(Constructor, allowIteration) {
      if (!allowIteration && !fails(function() {
          var iterable = {
            next: function() {
              return {
                done: true
              };
            },
            return: function() {
              this.isClosed = true;
            }
          };
          iterable[iteratorSymbol] = function() {
            return this;
          };
          Array.from(iterable, function() {
            throw 2;
          });
          return iterable.isClosed;
        })) return true;

      let closed = false;
      try {
        let testObject = {};
        testObject[iteratorSymbol] = function() {
          return {
            next: function() {
              return {
                done: (closed = true)
              };
            }
          };
        };
        Constructor(testObject);
      } catch (error) {
        // Ignore.
      }
      return closed;
    };
  },

  /* Module 65 */
  // Generic factory for Map and Set constructors.
  function(module, exports, localRequire) {
    "use strict";
    let exportUtil = localRequire(0); // General export utility.
    let globalObject = localRequire(5); // Global object.
    let isForcedPolyfill = localRequire(62); // Checks if a polyfill is forced.
    let setProperty = localRequire(23); // Sets a property.
    let mapSetMethodWrapper = localRequire(66); // Wrapper for Map/Set methods.
    let iterateUtil = localRequire(3); // General iteration utility.
    let checkInstance = localRequire(31); // Checks for correct instance.
    let isObject = localRequire(8); // Checks if a value is an object.
    let fails = localRequire(7); // Checks if a function throws an error.
    let checkConstructorArgument = localRequire(64); // Checks constructor argument handling.
    let setToStringTag = localRequire(26); // Sets @@toStringTag.
    let setPrototypeOf = localRequire(113); // Sets prototype (used for inheritance).

    module.exports = function(typeName, constructorCallback, mapSetMethodHelper, isWeak, isMultiValue) {
      let NativeConstructor = globalObject[typeName];
      let NativePrototype = NativeConstructor && NativeConstructor.prototype;
      let ConstructorToExport = NativeConstructor;
      let methodName = isMultiValue ? "set" : "add"; // 'set' for Map, 'add' for Set.

      let customMethods = {};

      // Check if the native implementation is buggy or needs polyfilling.
      let needsPolyfill = isForcedPolyfill(typeName,
        typeof NativeConstructor !== "function" ||
        !(isWeak || NativePrototype.forEach && !fails(function() {
          (new NativeConstructor()).entries().next(); // Test iterator.
        }))
      );

      if (needsPolyfill) {
        // If polyfill is needed, create a new constructor.
        ConstructorToExport = mapSetMethodHelper.getConstructor(constructorCallback, typeName, isWeak, methodName);
        mapSetMethodWrapper.REQUIRED = true; // Mark that the wrapper is required.
      } else if (isForcedPolyfill(typeName, true)) {
        // If it's a forced polyfill for an existing constructor.
        let instance = new NativeConstructor();
        // Check for specific bugs (e.g., `set` returning `this`, `has` with -0, etc.).
        let methodReturnsThis = instance[methodName](isWeak ? {} : -0, 1) !== instance;
        let hasZeroBug = fails(function() {
          instance.has(1);
        });
        let acceptsIterator = checkConstructorArgument(function(it) {
          new NativeConstructor(it);
        });
        let hasNegativeZeroBug = !isWeak && fails(function() {
          let testSet = new NativeConstructor();
          for (let i = 5; i--;) testSet[methodName](i, i);
          return !testSet.has(-0);
        });

        // Apply method wrappers if bugs are detected.
        if (methodReturnsThis) mapSetMethodWrapper(NativePrototype, "delete");
        if (hasZeroBug) mapSetMethodWrapper(NativePrototype, "has");
        if (isWeak && mapSetMethodWrapper(NativePrototype, "get"));
        if (hasZeroBug || hasNegativeZeroBug) mapSetMethodWrapper(NativePrototype, methodName);
        if (isWeak && NativePrototype.clear) delete NativePrototype.clear;

        // If constructor argument handling is buggy, create a wrapper constructor.
        if (!acceptsIterator) {
          ConstructorToExport = constructorCallback(function(instance, iterable) {
            checkInstance(instance, ConstructorToExport, typeName);
            let newInstance = setPrototypeOf(new NativeConstructor(), instance, ConstructorToExport);
            if (iterable !== null && iterable !== undefined) {
              iterateUtil(iterable, newInstance[methodName], newInstance, isMultiValue);
            }
            return newInstance;
          });
          ConstructorToExport.prototype = NativePrototype;
          NativePrototype.constructor = ConstructorToExport;
        }
      }

      // Export the constructor.
      customMethods[typeName] = ConstructorToExport;
      exportUtil({
        global: true,
        forced: ConstructorToExport !== NativeConstructor
      }, customMethods);

      // Set @@toStringTag.
      setToStringTag(ConstructorToExport, typeName);

      // Set up strong mode if not weak.
      if (!isWeak) {
        mapSetMethodHelper.setStrong(ConstructorToExport, typeName, isMultiValue);
      }

      return ConstructorToExport;
    };
  },

  /* Module 66 */
  // Provides fast key generation and internal state management for Map/Set/WeakMap/WeakSet.
  function(module, exports, localRequire) {
    let hiddenKeys = localRequire(46); // Object for hidden keys.
    let isObject = localRequire(8); // Checks if a value is an object.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let objectDefineProperty = localRequire(11).f; // Object.defineProperty.
    let generateSymbolId = localRequire(45); // Generates a unique string ID.
    let objectIsExtensible = localRequire(112); // Object.isExtensible polyfill.

    let metaKey = generateSymbolId("meta"); // Unique symbol for metadata.
    let objectIdCounter = 0; // Counter for unique object IDs.

    // A polyfill for Object.isExtensible (if not available) that always returns true.
    let isExtensibleFallback = Object.isExtensible || function() {
      return true;
    };

    /**
     * Attaches metadata to an object if it doesn't have it.
     * @param {object} object - The target object.
     */
    let attachMetadata = function(object) {
      objectDefineProperty(object, metaKey, {
        value: {
          objectID: "O" + ++objectIdCounter, // Unique ID for the object.
          weakData: {} // Storage for weak data.
        }
      });
    };

    let metadataUtilities = (module.exports = {
      REQUIRED: false, // Flag indicating if this module's functionality is required.
      /**
       * Generates a fast key for an object or returns the primitive value.
       * @param {any} value - The value to get a key for.
       * @param {boolean} createIfMissing - If true, metadata will be created if missing.
       * @returns {string|symbol} The key.
       */
      fastKey: function(value, createIfMissing) {
        if (!isObject(value)) {
          return typeof value === "symbol" ? value : ("string" === typeof value ? "S" : "P") + value;
        }
        if (!hasOwnProperty(value, metaKey)) {
          if (!isExtensibleFallback(value)) return "F"; // Not extensible, cannot add metadata.
          if (!createIfMissing) return "E"; // Don't create if missing.
          attachMetadata(value);
        }
        return value[metaKey].objectID;
      },
      /**
       * Retrieves weak data associated with an object.
       * @param {object} object - The target object.
       * @param {boolean} createIfMissing - If true, metadata will be created if missing.
       * @returns {object|boolean} The weak data object or a boolean indicating success.
       */
      getWeakData: function(object, createIfMissing) {
        if (!hasOwnProperty(object, metaKey)) {
          if (!isExtensibleFallback(object)) return true; // Treat as if data exists for non-extensible objects.
          if (!createIfMissing) return false;
          attachMetadata(object);
        }
        return object[metaKey].weakData;
      },
      /**
       * Handles object freezing by adding metadata if required.
       * @param {object} object - The object being frozen.
       * @returns {object} The object.
       */
      onFreeze: function(object) {
        if (metadataUtilities.REQUIRED && isExtensibleFallback(object) && !hasOwnProperty(object, metaKey)) {
          attachMetadata(object);
        }
        return object;
      }
    });

    hiddenKeys[metaKey] = true; // Mark the metadata key as hidden.
  },

  /* Module 67 */
  // Checks for bugs in Object.prototype.__defineGetter__ and __defineSetter__.
  function(module, exports, localRequire) {
    let isPure = localRequire(2); // Check if core-js is in pure mode.
    let fails = localRequire(7); // Checks if a function throws an error.

    module.exports = isPure || !fails(function() {
      // Test by defining a setter on the global object and checking if it works.
      let testKey = Math.random();
      __defineSetter__.call(null, testKey, function() {});
      delete (globalThis || window)[testKey]; // Use globalThis for broader compatibility.
      return true; // If no error, it means it worked.
    });
  },

  /* Module 68 */
  // Executes a function and catches any errors, returning a result object.
  function(module, exports) {
    module.exports = function(callback) {
      try {
        return {
          error: false,
          value: callback()
        };
      } catch (error) {
        return {
          error: true,
          value: error
        };
      }
    };
  },

  /* Module 69 */
  // Checks if a value is a RegExp object.
  function(module, exports, localRequire) {
    let isObject = localRequire(8); // Checks if a value is an object.
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.
    let matchSymbol = localRequire(6)("match"); // Symbol.match.

    module.exports = function(value) {
      // If it's an object, check for Symbol.match.
      // Otherwise, fallback to internal [[Class]] tag.
      if (isObject(value)) {
        let matchProperty = value[matchSymbol];
        return matchProperty !== undefined ? !!matchProperty : getClassTag(value) === "RegExp";
      }
      return false;
    };
  },

  /* Module 70 */
  // Implements String.prototype methods that interact with RegExp (e.g., `match`, `replace`).
  function(module, exports, localRequire) {
    "use strict";
    let defineProperty = localRequire(16); // Defines a property.
    let setProperty = localRequire(23); // Sets a property (with source tracking).
    let fails = localRequire(7); // Checks if a function throws an error.
    let wellKnownSymbol = localRequire(6); // Retrieves a well-known Symbol.
    let getRegExpSpecies = localRequire(92); // Gets RegExp species constructor.

    let speciesSymbol = wellKnownSymbol("species"); // Symbol.species.

    // Test for bugs in replace method with custom RegExp.
    let replaceBug = !fails(function() {
      let regex = /./;
      regex.exec = function() {
        let result = [];
        result.groups = {
          a: "7"
        };
        return result;
      };
      return "".replace(regex, "$<a>") !== "7";
    });

    // Test for bugs in split method with empty RegExp.
    let splitBug = !fails(function() {
      let regex = /(?:)/;
      let nativeExec = regex.exec;
      regex.exec = function() {
        return nativeExec.apply(this, arguments);
      };
      let result = "ab".split(regex);
      return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
    });

    /**
     * Implements a String.prototype method that interacts with RegExp.
     * @param {string} methodKey - The name of the String.prototype method (e.g., 'match', 'replace').
     * @param {number} argsCount - The expected number of arguments for the method.
     * @param {Function} implementation - The actual implementation of the method.
     * @param {boolean} [forced=false] - If true, force polyfill even if native exists.
     */
    module.exports = function(methodKey, argsCount, implementation, forced) {
      let methodSymbol = wellKnownSymbol(methodKey); // Get the corresponding Symbol (e.g., Symbol.match).

      // Test if native method works with custom RegExp.
      let nativeMethodWorks = !fails(function() {
        let customRegExp = {};
        customRegExp[methodSymbol] = function() {
          return 7;
        };
        return "" [methodKey](customRegExp) !== 7;
      });

      let nativeMethodWorksWithSpecies = nativeMethodWorks && !fails(function() {
        // Test with RegExp species.
        let regex = /a/;
        if (methodKey === "split") {
          regex.constructor = {};
          regex.constructor[speciesSymbol] = function() {
            return regex;
          };
        }
        regex.exec = function() {
          this.isCalled = true;
          return null;
        };
        regex[methodSymbol]("");
        return !regex.isCalled;
      });

      // If native method is buggy or polyfill is forced, apply the polyfill.
      if (!nativeMethodWorks || !nativeMethodWorksWithSpecies || (methodKey === "replace" && !replaceBug) || (methodKey === "split" && !splitBug)) {
        let nativeMethod = /./ [methodSymbol]; // Original native method.

        // The polyfilled method.
        let polyfillMethod = implementation(
          methodSymbol,
          "" [methodKey],
          function(originalMethod, regex, targetString, argument2, argument3) {
            // Helper function to decide whether to call native or custom method.
            if (regex.exec === getRegExpSpecies) {
              if (nativeMethodWorks && !argument3) {
                // If native works and not forced, use native.
                return {
                  done: true,
                  value: nativeMethod.call(regex, targetString, argument2)
                };
              }
              // Otherwise, call the original method.
              return {
                done: true,
                value: originalMethod.call(targetString, regex, argument2)
              };
            }
            return {
              done: false
            };
          }
        );

        setProperty(String.prototype, methodKey, polyfillMethod[0]); // Polyfill String.prototype.method.
        setProperty(RegExp.prototype, methodSymbol, argsCount === 2 ?
          function(targetString, argument) {
            return polyfillMethod[1].call(targetString, this, argument);
          } :
          function(targetString) {
            return polyfillMethod[1].call(targetString, this);
          }
        );

        // Mark RegExp.prototype[methodSymbol] as sham if forced.
        if (forced) {
          defineProperty(RegExp.prototype[methodSymbol], "sham", true);
        }
      }
    };
  },

  /* Module 71 */
  // Adjusts a string index, handling surrogate pairs.
  function(module, exports, localRequire) {
    "use strict";
    let stringCharAt = localRequire(56).charAt; // Get charAt utility.

    module.exports = function(targetString, index, isUnicode) {
      return index + (isUnicode ? stringCharAt(targetString, index).length : 1);
    };
  },

  /* Module 72 */
  // Utility to execute a RegExp against a string.
  function(module, exports, localRequire) {
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.
    let nativeRegExpExec = localRequire(92); // Native RegExp.prototype.exec.

    module.exports = function(regex, targetString) {
      let execMethod = regex.exec;
      if (typeof execMethod === "function") {
        let result = execMethod.call(regex, targetString);
        if (typeof result !== "object" && result !== null) {
          throw new TypeError("RegExp exec method returned something other than an Object or null");
        }
        return result;
      }
      if (getClassTag(regex) !== "RegExp") {
        throw new TypeError("RegExp#exec called on incompatible receiver");
      }
      return nativeRegExpExec.call(regex, targetString);
    };
  },

  /* Module 73 */
  // String trim utilities (trimStart, trimEnd, trim).
  function(module, exports, localRequire) {
    let requireObjectCoercible = localRequire(17); // Ensures value is not null/undefined.
    let whitespaceChars = "[" + localRequire(93) + "]"; // Whitespace characters regex.

    // Regex for trimming start, end, or both.
    let startTrimRegex = RegExp("^" + whitespaceChars + whitespaceChars + "*");
    let endTrimRegex = RegExp(whitespaceChars + whitespaceChars + "*$");

    /**
     * Factory function for trim methods.
     * @param {number} trimType - 1: trimStart, 2: trimEnd, 3: trim (both).
     * @returns {Function} The generated trim method.
     */
    let createTrimMethod = function(trimType) {
      return function(stringValue) {
        let str = String(requireObjectCoercible(stringValue));
        if (trimType & 1) {
          str = str.replace(startTrimRegex, "");
        }
        if (trimType & 2) {
          str = str.replace(endTrimRegex, "");
        }
        return str;
      };
    };

    module.exports = {
      start: createTrimMethod(1),
      end: createTrimMethod(2),
      trim: createTrimMethod(3)
    };
  },

  /* Module 74 */
  // Generic utility for deleting multiple items from a collection (Map, Set, WeakMap, WeakSet).
  function(module, exports, localRequire) {
    "use strict";
    let requireObject = localRequire(1); // Ensures the value is an object.
    let requireFunction = localRequire(4); // Ensures the value is a function.

    module.exports = function() {
      let collection = requireObject(this);
      let deleteMethod = requireFunction(collection.delete);
      let allDeleted = true; // Flag to track if all deletions were successful.

      // Iterate through all arguments and attempt to delete each one.
      for (let i = 0, length = arguments.length; i < length; i++) {
        allDeleted = deleteMethod.call(collection, arguments[i]) && allDeleted;
      }
      return !!allDeleted; // Return true if all deletions succeeded.
    };
  },

  /* Module 75 */
  // Generic Array.from-like utility for collections (Map, Set).
  function(module, exports, localRequire) {
    "use strict";
    let requireFunction = localRequire(4); // Ensures the value is a function.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let iterateUtil = localRequire(3); // General iteration utility.

    module.exports = function(iterable) {
      let collectionConstructor = requireFunction(this); // The constructor (e.g., Map, Set).
      let numArgs = arguments.length;
      let mapFn = numArgs > 1 ? arguments[1] : undefined;

      let mappedValues = [];
      let instance;

      requireFunction(collectionConstructor); // Ensure constructor is a function.
      if (mapFn !== undefined) {
        requireFunction(mapFn); // Ensure mapFn is a function.
      }

      // If iterable is null or undefined, create an empty collection.
      if (iterable === null || iterable === undefined) {
        instance = new collectionConstructor();
      } else {
        let index = 0;
        let boundMapFn;

        if (mapFn !== undefined) {
          boundMapFn = createBoundFunction(mapFn, numArgs > 2 ? arguments[2] : undefined, 2);
          iterateUtil(iterable, function(value) {
            mappedValues.push(boundMapFn(value, index++));
          });
        } else {
          iterateUtil(iterable, mappedValues.push, mappedValues);
        }
        instance = new collectionConstructor(mappedValues);
      }
      return instance;
    };
  },

  /* Module 76 */
  // Generic factory for creating collections (Map, Set, WeakMap, WeakSet) from arguments.
  function(module, exports, localRequire) {
    "use strict";
    let requireObject = localRequire(1); // Ensures the value is an object.
    let requireFunction = localRequire(4); // Ensures the value is a function.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let iterateUtil = localRequire(3); // General iteration utility.
    let toLength = localRequire(10); // Converts to a valid length.
    let createArraySpecies = localRequire(49); // Creates a new array using species constructor.
    let iterateMethod = localRequire(57); // Retrieves the iterator method.
    let getIteratorMethod = localRequire(84); // Checks if an object has a 'Symbol.iterator' method.

    module.exports = function() {
      let collectionConstructor = requireFunction(this); // The constructor (e.g., Map, Set).
      let numArgs = arguments.length;
      let resultInstance = new collectionConstructor();
      let addMethod = requireFunction(resultInstance.add);

      for (let i = 0; i < numArgs; i++) {
        addMethod.call(resultInstance, arguments[i]);
      }
      return resultInstance;
    };
  },

  /* Module 77 */
  // Converts a value to an object coercible value (not null or undefined).
  function(module, exports, localRequire) {
    let requireObjectCoercible = localRequire(17); // Ensures value is not null/undefined.

    module.exports = function(value) {
      return requireObjectCoercible(value);
    };
  },

  /* Module 78 */
  // Safely creates a DOM element.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let isObject = localRequire(8); // Checks if a value is an object.

    let documentObject = globalObject.document;
    // Check if document exists and can create elements.
    let canCreateElement = isObject(documentObject) && isObject(documentObject.createElement);

    module.exports = function(tagName) {
      return canCreateElement ? documentObject.createElement(tagName) : {};
    };
  },

  /* Module 79 */
  // Defines a global property, safely handling existing properties.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let defineProperty = localRequire(16); // Defines a property.

    module.exports = function(propertyName, value) {
      try {
        defineProperty(globalObject, propertyName, value);
      } catch (error) {
        globalObject[propertyName] = value; // Fallback for environments where defineProperty fails.
      }
      return value;
    };
  },

  /* Module 80 */
  // Polyfill for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
  function(module, exports, localRequire) {
    let getOwnPropertyNamesPolyfill = localRequire(101); // Polyfill for getting property names.
    let getOwnPropertySymbolsPolyfill = localRequire(83); // Polyfill for getting symbol properties.
    let requireObject = localRequire(1); // Ensures the value is an object.

    module.exports = getOwnPropertySymbolsPolyfill("Reflect", "ownKeys") || function(object) {
      let names = getOwnPropertyNamesPolyfill.f(requireObject(object));
      let symbols = getOwnPropertySymbolsPolyfill.f;
      return symbols ? names.concat(symbols(object)) : names;
    };
  },

  /* Module 81 */
  // Retrieves the global object, potentially with polyfills applied.
  function(module, exports) {
    module.exports = globalThis;
  },

  /* Module 82 */
  // List of properties that should be ignored for internal use (e.g., Object.create polyfill).
  function(module, exports) {
    module.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
  },

  /* Module 83 */
  // Wrapper for Object.getOwnPropertySymbols.
  function(module, exports) {
    exports.f = Object.getOwnPropertySymbols;
  },

  /* Module 84 */
  // Checks if a value is an array-like iterable (e.g., has a native Symbol.iterator for arrays).
  function(module, exports, localRequire) {
    let wellKnownSymbol = localRequire(6); // Symbol.iterator.
    let iteratorRegistry = localRequire(51); // Iterator registry.

    let iteratorSymbol = wellKnownSymbol("iterator");
    let arrayPrototype = Array.prototype;

    module.exports = function(value) {
      return value !== undefined && (iteratorRegistry.Array === value || arrayPrototype[iteratorSymbol] === value);
    };
  },

  /* Module 85 */
  // Checks if a native Array.prototype method is buggy.
  function(module, exports, localRequire) {
    "use strict";
    let fails = localRequire(7); // Checks if a function throws an error.

    module.exports = function(methodName, argument) {
      let nativeMethod = [][methodName];
      return !nativeMethod || !fails(function() {
        // Test if the method works with `null` context or a specific argument.
        nativeMethod.call(null, argument || function() {
          throw 1;
        }, 1);
      });
    };
  },

  /* Module 86 */
  // Array.prototype.entries, keys, values polyfills.
  function(module, exports, localRequire) {
    "use strict";
    let toIndexedObject = localRequire(25); // Converts to an indexed object.
    let createUniqueKey = localRequire(41); // Creates a unique key.
    let iteratorRegistry = localRequire(51); // Iterator registry.
    let internalState = localRequire(18); // Internal state management.
    let createIteratorFactory = localRequire(87); // Factory for iterator objects.

    let setInternalState = internalState.set;
    let getIteratorState = internalState.getterFor("Array Iterator");

    // Create an iterator factory for Array objects.
    module.exports = createIteratorFactory(
      Array,
      "Array",
      function(arrayLike, kind) {
        setInternalState(this, {
          type: "Array Iterator",
          target: toIndexedObject(arrayLike),
          index: 0,
          kind: kind
        });
      },
      function() {
        let state = getIteratorState(this);
        let target = state.target;
        let kind = state.kind;
        let index = state.index++;

        if (target === undefined || index >= target.length) {
          state.target = undefined; // Clear target when iteration is done.
          return {
            value: undefined,
            done: true
          };
        }
        if (kind === "keys") {
          return {
            value: index,
            done: false
          };
        }
        if (kind === "values") {
          return {
            value: target[index],
            done: false
          };
        }
        return {
          value: [index, target[index]],
          done: false
        };
      },
      "values"
    );

    iteratorRegistry.Arguments = iteratorRegistry.Array; // Arguments object behaves like an Array.
    createUniqueKey("keys"); // Add 'keys' to unscopables.
    createUniqueKey("values"); // Add 'values' to unscopables.
    createUniqueKey("entries"); // Add 'entries' to unscopables.
  },

  /* Module 87 */
  // Generic factory for creating iterator objects for various collections.
  function(module, exports, localRequire) {
    "use strict";
    let exportUtil = localRequire(0); // General export utility.
    let createIteratorConstructor = localRequire(54); // Creates an iterator constructor.
    let getPrototypeOf = localRequire(21); // Object.getPrototypeOf.
    let setPrototypeOf = localRequire(42); // Object.setPrototypeOf.
    let setToStringTag = localRequire(26); // Sets @@toStringTag.
    let defineProperty = localRequire(16); // Defines a property.
    let wellKnownSymbol = localRequire(6); // Retrieves a well-known Symbol.
    let isPure = localRequire(2); // Checks if core-js is in pure mode.
    let iteratorRegistry = localRequire(51); // Iterator registry.
    let IteratorPrototypeWrapper = localRequire(109); // IteratorPrototype utilities.

    let nativeIteratorSymbol = wellKnownSymbol("iterator"); // Symbol.iterator.
    let defaultIteratorMethod = function() {
      return this;
    }; // Default iterator method.

    module.exports = function(
      CollectionConstructor,
      collectionName,
      internalIteratorConstructor,
      nextMethod,
      defaultIteratorKind,
      isEntriesIterator,
      isWeak
    ) {
      let IteratorConstructor = internalIteratorConstructor;
      let CollectionPrototype = CollectionConstructor.prototype;
      let CollectionIteratorName = collectionName + " Iterator";
      let isIteratorBuggy = IteratorPrototypeWrapper.BUGGY_SAFARI_ITERATORS;
      let isNativeIterator = CollectionPrototype[nativeIteratorSymbol] || CollectionPrototype["@@iterator"] || (defaultIteratorKind && CollectionPrototype[defaultIteratorKind]);
      let nativeIteratorPrototype;

      // Create a new iterator constructor with the specified `nextMethod`.
      createIteratorConstructor(IteratorConstructor, collectionName, nextMethod);

      // If native iterators exist, try to get their prototype.
      if (isNativeIterator && !isIteratorBuggy) {
        nativeIteratorPrototype = getPrototypeOf(getPrototypeOf(isNativeIterator.call(new CollectionConstructor())));
        if (nativeIteratorPrototype !== Object.prototype && nativeIteratorPrototype.next) {
          // If the native iterator prototype is not `Object.prototype` and has a `next` method,
          // it means it's a proper iterator prototype.
          if (!isPure) {
            // If not in pure mode, set its prototype to `IteratorPrototypeWrapper.IteratorPrototype`.
            if (setPrototypeOf) {
              setPrototypeOf(nativeIteratorPrototype, IteratorPrototypeWrapper.IteratorPrototype);
            } else if (typeof nativeIteratorPrototype[nativeIteratorSymbol] !== "function") {
              // Fallback: define Symbol.iterator if not a function.
              defineProperty(nativeIteratorPrototype, nativeIteratorSymbol, defaultIteratorMethod);
            }
          }
          setToStringTag(nativeIteratorPrototype, CollectionIteratorName, false, true); // Set @@toStringTag.
          if (isPure) {
            iteratorRegistry[CollectionIteratorName] = defaultIteratorMethod;
          }
        }
      }

      // Create a factory function to get iterators of different kinds.
      let createIteratorFactory = function(kind) {
        if (kind === defaultIteratorKind && isNativeIterator) {
          return isNativeIterator; // Use native if it matches the default kind.
        }
        if (!isIteratorBuggy && kind in CollectionPrototype) {
          return CollectionPrototype[kind]; // Use native method if it exists.
        }
        // Fallback: return a function that creates a new IteratorConstructor instance.
        return function() {
          return new IteratorConstructor(this, kind);
        };
      };

      let valuesMethod = createIteratorFactory("values");
      let keysMethod = isEntriesIterator ? valuesMethod : createIteratorFactory("keys");
      let entriesMethod = createIteratorFactory("entries");

      let isValuesMethodRenamed = false;
      if (isNativeIterator && defaultIteratorKind === "values" && isNativeIterator.name !== "values") {
        isValuesMethodRenamed = true;
        valuesMethod = function() {
          return isNativeIterator.call(this);
        };
      }

      // Set default iterator method on the prototype.
      if (!isPure && CollectionPrototype[nativeIteratorSymbol] !== valuesMethod) {
        defineProperty(CollectionPrototype, nativeIteratorSymbol, valuesMethod);
      }
      iteratorRegistry[collectionName] = valuesMethod; // Register in global iterator registry.

      // Export methods to the collection prototype.
      if (defaultIteratorKind) {
        let iteratorMethods = {
          values: valuesMethod,
          keys: keysMethod,
          entries: entriesMethod,
        };
        // If it's a weak collection or the values method was renamed, define all methods.
        if (isWeak || isValuesMethodRenamed) {
          for (let method in iteratorMethods) {
            if (!isIteratorBuggy && !(method in CollectionPrototype) || (isWeak && !isValuesMethodRenamed && !(method in CollectionPrototype))) {
              setProperty(CollectionPrototype, method, iteratorMethods[method]);
            }
          }
        } else {
          exportUtil({
            target: collectionName,
            proto: true,
            forced: isIteratorBuggy || isValuesMethodRenamed
          }, iteratorMethods);
        }
      }

      return iteratorMethods;
    };
  },

  /* Module 88 */
  // Polyfill for Map (ECMAScript 2015 Map).
  function(module, exports, localRequire) {
    "use strict";
    let implementCollection = localRequire(65); // Generic collection implementation factory.
    let MapMethodHelper = localRequire(114); // Map-specific method helper.

    module.exports = implementCollection("Map", function(constructor) {
      return function() {
        return constructor(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, MapMethodHelper, true); // True for isMultiValue (Map stores key-value pairs).
  },

  /* Module 89 */
  // Detects user agent string.
  function(module, exports, localRequire) {
    let getBuiltIn = localRequire(12); // Retrieves a built-in object.
    module.exports = getBuiltIn("navigator", "userAgent") || "";
  },

  /* Module 90 */
  // Ensures a value is not a RegExp object.
  function(module, exports, localRequire) {
    let isRegExp = localRequire(69); // Checks if a value is a RegExp.

    module.exports = function(value) {
      if (isRegExp(value)) {
        throw new TypeError("The method doesn't accept regular expressions");
      }
      return value;
    };
  },

  /* Module 91 */
  // Checks for bugs in String.prototype methods with custom RegExp.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let matchSymbol = localRequire(6)("match"); // Symbol.match.

    module.exports = function(methodName) {
      let regex = /./;
      try {
        "/./" [methodName](regex); // Try native method.
      } catch (error) {
        try {
          regex[matchSymbol] = false; // Disable Symbol.match.
          return "/./" [methodName](regex); // Try again.
        } catch (error) {
          // If still fails, it's buggy.
        }
      }
      return false;
    };
  },

  /* Module 92 */
  // Polyfill for RegExp.prototype.exec.
  function(module, exports, localRequire) {
    "use strict";
    let getRegExpFlags = localRequire(44); // Gets RegExp flags.
    let nativeRegExpExec = RegExp.prototype.exec; // Original native exec.
    let stringReplace = String.prototype.replace; // Original String.prototype.replace.

    let regexExec = nativeRegExpExec;

    // Test for bugs in lastIndex and capture groups.
    let testRegex = /a/;
    let testRegex2 = /b*/g;
    nativeRegExpExec.call(testRegex, "a");
    nativeRegExpExec.call(testRegex2, "a");
    let lastIndexBug = testRegex.lastIndex !== 0 || testRegex2.lastIndex !== 0;

    let emptyCaptureGroupBug = (RegExp("()??").exec("") || [])[1] !== undefined;

    // If bugs are present, provide a polyfilled exec.
    if (lastIndexBug || emptyCaptureGroupBug) {
      regexExec = function(targetString) {
        let regex = this;
        let result, currentIndex, matchLength, i;

        if (emptyCaptureGroupBug) {
          // If empty capture groups are buggy, create a new regex with start/end anchors.
          // This ensures correct capture group behavior.
          let anchoredRegex = new RegExp("^" + regex.source + "$(?!\\s)", getRegExpFlags.call(regex));
          result = nativeRegExpExec.call(anchoredRegex, targetString);
        }

        if (lastIndexBug) {
          currentIndex = regex.lastIndex; // Store original lastIndex.
        }

        result = nativeRegExpExec.call(regex, targetString);

        if (lastIndexBug && result) {
          // Reset lastIndex if global flag is not set.
          regex.lastIndex = regex.global ? result.index + result[0].length : currentIndex;
        }

        if (emptyCaptureGroupBug && result && result.length > 1) {
          // Fill undefined capture groups if buggy.
          stringReplace.call(result[0], anchoredRegex, function() {
            for (i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undefined) {
                result[i] = undefined;
              }
            }
          });
        }
        return result;
      };
    }

    module.exports = regexExec;
  },

  /* Module 93 */
  // String of common whitespace characters.
  function(module, exports) {
    module.exports = "\t\n\v\f\r \u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
  },

  /* Module 94 */
  // Checks for bugs in String.prototype.trim methods.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let whitespaceChars = localRequire(93); // Whitespace characters.

    module.exports = function(methodName) {
      // Test if the method correctly handles various whitespace characters.
      return fails(function() {
        return !!whitespaceChars[methodName]() || "\u200B\u0085\u180E"[methodName]() !== "\u200B\u0085\u180E" ||
          (globalThis.String.prototype[methodName] && globalThis.String.prototype[methodName].name !== methodName);
      });
    };
  },

  /* Module 95 */
  // Checks for various bugs and inconsistencies in native TypedArray implementations.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let checkConstructorArgument = localRequire(64); // Checks constructor argument handling.
    let TypedArrayUtils = localRequire(33); // TypedArray utilities.

    let ArrayBufferConstructor = globalThis.ArrayBuffer;
    let Int8ArrayConstructor = globalThis.Int8Array;

    module.exports = !TypedArrayUtils.NATIVE_ARRAY_BUFFER_VIEWS || // No native views.
      fails(function() {
        Int8ArrayConstructor(1); // Test constructor with length argument.
      }) ||
      fails(function() {
        new Int8ArrayConstructor(-1); // Test constructor with negative length.
      }) ||
      !checkConstructorArgument(function(iterator) {
        new Int8ArrayConstructor();
        new Int8ArrayConstructor(null);
        new Int8ArrayConstructor(1.5);
        new Int8ArrayConstructor(iterator);
      }, true) || // Test constructor with various arguments and iterators.
      fails(function() {
        // Test constructor with ArrayBuffer, byteOffset, and length.
        return new Int8ArrayConstructor(new ArrayBufferConstructor(2), 1, undefined).length !== 1;
      });
  },

  /* Module 96 */
  // Polyfill for WeakMap.
  function(module, exports, localRequire) {
    "use strict";
    let implementCollection = localRequire(65); // Generic collection implementation factory.
    let WeakMapMethodHelper = localRequire(126); // WeakMap-specific method helper.

    let globalObject = localRequire(5); // Global object.
    let defineProperties = localRequire(36); // Defines multiple properties.
    let metadataUtilities = localRequire(66); // Metadata utilities.
    let isObject = localRequire(8); // Checks if a value is an object.
    let internalState = localRequire(18); // Internal state management.

    let supportsWeakMap = localRequire(99); // Check for native WeakMap support.

    let activeXObjectBug = !globalObject.ActiveXObject && "ActiveXObject" in globalObject; // IE ActiveX bug.
    let objectIsExtensible = Object.isExtensible; // Native Object.isExtensible.

    // Factory for WeakMap-like collections.
    let WeakMapConstructor = module.exports = implementCollection("WeakMap", function(constructor) {
      return function() {
        return constructor(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, WeakMapMethodHelper, true, false); // isWeak: true, isMultiValue: false.

    // If native WeakMap is supported, but has bugs (e.g., IE ActiveX bug).
    if (supportsWeakMap && activeXObjectBug) {
      let BuggyWeakMap = WeakMapMethodHelper.getConstructor(function() {}, "WeakMap", true); // Create a new WeakMap constructor.
      metadataUtilities.REQUIRED = true; // Mark metadata utilities as required.

      let WeakMapPrototype = WeakMapConstructor.prototype;
      let nativeDelete = WeakMapPrototype.delete;
      let nativeHas = WeakMapPrototype.has;
      let nativeGet = WeakMapPrototype.get;
      let nativeSet = WeakMapPrototype.set;

      // Wrap native methods to handle non-extensible (frozen) objects.
      defineProperties(WeakMapPrototype, {
        delete: function(key) {
          if (isObject(key) && !objectIsExtensible(key)) {
            let state = internalState.enforce(this);
            state.frozen = state.frozen || new BuggyWeakMap(); // Use a separate WeakMap for frozen objects.
            return nativeDelete.call(this, key) || state.frozen.delete(key);
          }
          return nativeDelete.call(this, key);
        },
        has: function(key) {
          if (isObject(key) && !objectIsExtensible(key)) {
            let state = internalState.enforce(this);
            state.frozen = state.frozen || new BuggyWeakMap();
            return nativeHas.call(this, key) || state.frozen.has(key);
          }
          return nativeHas.call(this, key);
        },
        get: function(key) {
          if (isObject(key) && !objectIsExtensible(key)) {
            let state = internalState.enforce(this);
            state.frozen = state.frozen || new BuggyWeakMap();
            return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
          }
          return nativeGet.call(this, key);
        },
        set: function(key, value) {
          if (isObject(key) && !objectIsExtensible(key)) {
            let state = internalState.enforce(this);
            state.frozen = state.frozen || new BuggyWeakMap();
            if (nativeHas.call(this, key)) {
              nativeSet.call(this, key, value);
            } else {
              state.frozen.set(key, value);
            }
          } else {
            nativeSet.call(this, key, value);
          }
          return this;
        }
      });
    }
  },

  /* Module 97 */
  // Checks for a specific bug related to Object.defineProperty in IE.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let fails = localRequire(7); // Checks if a function throws an error.
    let documentCreateElement = localRequire(78); // Creates a DOM element.

    module.exports = !descriptorsAvailable && !fails(function() {
      // Test by defining a property on a DOM element and checking if it works.
      return Object.defineProperty(documentCreateElement("div"), "a", {
        get: function() {
          return 7;
        }
      }).a !== 7;
    });
  },

  /* Module 98 */
  // Polyfill for Function.prototype.toString.
  function(module, exports, localRequire) {
    let sharedSymbolRegistry = localRequire(38); // Shared symbol registry.

    module.exports = sharedSymbolRegistry("native-function-to-string", Function.toString);
  },

  /* Module 99 */
  // Checks if native WeakMap is available and its implementation is standard.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let nativeFunctionToString = localRequire(98); // Native Function.prototype.toString.

    let NativeWeakMap = globalObject.WeakMap;

    module.exports = typeof NativeWeakMap === "function" && /native code/.test(nativeFunctionToString.call(NativeWeakMap));
  },

  /* Module 100 */
  // Copies own property descriptors from source to target.
  function(module, exports, localRequire) {
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let getOwnPropertyNames = localRequire(80); // Gets all own property names/symbols.
    let getOwnPropertyDescriptor = localRequire(22); // Gets property descriptor.
    let objectDefineProperty = localRequire(11); // Object.defineProperty.

    module.exports = function(targetObject, sourceObject) {
      let propertyNames = getOwnPropertyNames(sourceObject);
      let defineProperty = objectDefineProperty.f;
      let getDescriptor = getOwnPropertyDescriptor.f;

      for (let i = 0; i < propertyNames.length; i++) {
        let property = propertyNames[i];
        if (!hasOwnProperty(targetObject, property)) {
          defineProperty(targetObject, property, getDescriptor(sourceObject, property));
        }
      }
    };
  },

  /* Module 101 */
  // Polyfill for Object.getOwnPropertyNames.
  function(module, exports, localRequire) {
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let toIndexedObject = localRequire(25); // Converts to an indexed object.
    let arrayIndexOf = localRequire(60).indexOf; // Array.prototype.indexOf.
    let hiddenKeys = localRequire(46); // Object for hidden keys.

    module.exports = function(object, ignoredKeys) {
      let indexedObject = toIndexedObject(object);
      let index = 0;
      let result = [];
      let property;

      // Iterate through all properties.
      for (property in indexedObject) {
        // If property is not in hiddenKeys and not in ignoredKeys, add it to result.
        if (!hasOwnProperty(hiddenKeys, property) && hasOwnProperty(indexedObject, property)) {
          result.push(property);
        }
      }

      // Add properties from ignoredKeys if they exist and are not already in result.
      while (ignoredKeys.length > index) {
        property = ignoredKeys[index++];
        if (hasOwnProperty(indexedObject, property) && arrayIndexOf(result, property) === -1) {
          result.push(property);
        }
      }
      return result;
    };
  },

  /* Module 102 */
  // Checks if native Symbol is available and reliable.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.

    module.exports = !!Object.getOwnPropertySymbols && !fails(function() {
      // Test by creating a Symbol and converting it to string.
      return String(Symbol()) === "";
    });
  },

  /* Module 103 */
  // Polyfill for Object.defineProperties.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let objectDefineProperty = localRequire(11); // Object.defineProperty wrapper.
    let requireObject = localRequire(1); // Ensures the value is an object.
    let objectKeys = localRequire(63); // Polyfill for Object.keys.

    module.exports = descriptorsAvailable ?
      Object.defineProperties : // Use native if reliable.
      function(object, properties) { // Fallback implementation.
        requireObject(object);
        let keys = objectKeys(properties);
        let defineProperty = objectDefineProperty.f;
        let i = 0;
        while (keys.length > i) {
          defineProperty(object, keys[i], properties[keys[i++]]);
        }
        return object;
      };
  },

  /* Module 104 */
  // Retrieves the document.documentElement (HTML element).
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    module.exports = globalObject.document && globalObject.document.documentElement;
  },

  /* Module 105 */
  // Generates a well-known symbol (Symbol.for-like behavior).
  function(module, exports, localRequire) {
    exports.f = localRequire(6);
  },

  /* Module 106 */
  // Utility for flattening arrays.
  function(module, exports, localRequire) {
    "use strict";
    let isArray = localRequire(47); // Checks if a value is an array.
    let toLength = localRequire(10); // Converts to a valid length.
    let createBoundFunction = localRequire(13); // Creates a bound function.

    /**
     * Recursive helper for flattening arrays.
     * @param {Array} result - The array to accumulate flattened elements.
     * @param {Array} array - The current array to flatten.
     * @param {any} thisArg - The context for the map function.
     * @param {number} length - The length of the array.
     * @param {number} start - The starting index for iteration.
     * @param {number} depth - The current flattening depth.
     * @param {Function} [mapFn] - An optional mapping function.
     * @param {any} [mapContext] - Context for the mapFn.
     * @returns {number} The new length of the result array.
     */
    let flattenIntoArray = function(result, array, thisArg, length, start, depth, mapFn, mapContext) {
      let currentResultLength = start;
      let index = 0;
      let boundMapFn = mapFn !== undefined ? createBoundFunction(mapFn, mapContext, 3) : undefined;
      let currentValue;

      while (index < length) {
        if (index in array) {
          currentValue = boundMapFn ? boundMapFn(array[index], index, thisArg) : array[index];
          if (depth > 0 && isArray(currentValue)) {
            // Recursively flatten if depth allows and it's an array.
            currentResultLength = flattenIntoArray(result, currentValue, thisArg, toLength(currentValue.length), currentResultLength, depth - 1) - 1;
          } else {
            if (currentResultLength >= 9007199254740991) { // MAX_SAFE_INTEGER
              throw new TypeError("Exceed the acceptable array length");
            }
            result[currentResultLength] = currentValue;
          }
          currentResultLength++;
        }
        index++;
      }
      return currentResultLength;
    };

    module.exports = flattenIntoArray;
  },

  /* Module 107 */
  // Polyfill for Array.from.
  function(module, exports, localRequire) {
    "use strict";
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let toObject = localRequire(15); // Converts to an object.
    let consumeIterator = localRequire(108); // Consumes an iterator.
    let getIteratorMethod = localRequire(84); // Checks for iterator method.
    let toLength = localRequire(10); // Converts to a valid length.
    let defineProperty = localRequire(40); // Defines a property.
    let getIterator = localRequire(52); // Retrieves an iterator.
    let getTypedArrayConstructor = localRequire(33).aTypedArrayConstructor; // Gets TypedArray constructor.

    module.exports = function(arrayLike) {
      let object = toObject(arrayLike);
      let constructor = typeof this === "function" ? this : Array; // Default to Array constructor.
      let numArgs = arguments.length;
      let mapFn = numArgs > 1 ? arguments[1] : undefined;
      let index = 0;
      let newArray;
      let iterator, iteratorResult;
      let boundMapFn;

      if (mapFn !== undefined) {
        boundMapFn = createBoundFunction(mapFn, numArgs > 2 ? arguments[2] : undefined, 2);
      }

      iterator = getIterator(object); // Get iterator method.

      if (iterator === null || getIteratorMethod(iterator)) {
        // If not iterable or it's an array-like object.
        let length = toLength(object.length);
        newArray = new constructor(length);
        for (; index < length; index++) {
          defineProperty(newArray, index, boundMapFn ? boundMapFn(object[index], index) : object[index]);
        }
      } else {
        // If it's a true iterable.
        newArray = new constructor();
        for (iterator = iterator.call(object); !(iteratorResult = iterator.next()).done; index++) {
          defineProperty(newArray, index, boundMapFn ? consumeIterator(iterator, boundMapFn, [iteratorResult.value, index], true) : iteratorResult.value);
        }
      }
      newArray.length = index;
      return newArray;
    };
  },

  /* Module 108 */
  // Utility to safely consume values from an iterator.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the value is an object.

    module.exports = function(iterator, callback, value, isArrayLike) {
      try {
        return isArrayLike ? callback(requireObject(value)[0], value[1]) : callback(value);
      } catch (error) {
        let returnMethod = iterator.return;
        if (returnMethod !== undefined) {
          requireObject(returnMethod.call(iterator));
        }
        throw error;
      }
    };
  },

  /* Module 109 */
  // Provides the base Iterator.prototype and checks for Safari iterator bugs.
  function(module, exports, localRequire) {
    "use strict";
    let getPrototypeOf = localRequire(21); // Object.getPrototypeOf.
    let defineProperty = localRequire(16); // Defines a property.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let wellKnownSymbol = localRequire(6)("iterator"); // Symbol.iterator.
    let isPure = localRequire(2); // Checks if core-js is in pure mode.

    let IteratorPrototype; // Base Iterator.prototype.
    let isBuggySafariIterators = false; // Flag for Safari iterator bugs.

    // Check if Array.prototype.keys().next() works and get its prototype.
    if ([].keys && "next" in [].keys()) {
      let testIterator = [].keys();
      IteratorPrototype = getPrototypeOf(getPrototypeOf(testIterator));
      if (IteratorPrototype !== Object.prototype) {
        // If it's a proper iterator prototype.
      } else {
        isBuggySafariIterators = true; // Safari bug detected.
      }
    } else {
      isBuggySafariIterators = true; // No native next method, so buggy.
    }

    // If no IteratorPrototype found, create a fallback.
    if (IteratorPrototype === null || IteratorPrototype === undefined) {
      IteratorPrototype = {};
    }

    // If not in pure mode and Symbol.iterator is not defined on IteratorPrototype, define it.
    if (!isPure && !hasOwnProperty(IteratorPrototype, wellKnownSymbol)) {
      defineProperty(IteratorPrototype, wellKnownSymbol, function() {
        return this;
      });
    }

    module.exports = {
      IteratorPrototype: IteratorPrototype,
      BUGGY_SAFARI_ITERATORS: isBuggySafariIterators
    };
  },

  /* Module 110 */
  // Checks if native Object.getPrototypeOf works correctly.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.

    module.exports = !fails(function() {
      function Test() {}
      Test.prototype.constructor = null; // Break constructor link.
      return Object.getPrototypeOf(new Test()) !== Test.prototype;
    });
  },

  /* Module 111 */
  // Checks if a value is a valid prototype (object or null).
  function(module, exports, localRequire) {
    let isObject = localRequire(8); // Checks if a value is an object.

    module.exports = function(value) {
      if (!isObject(value) && value !== null) {
        throw new TypeError("Cannot set " + String(value) + " as a prototype");
      }
      return value;
    };
  },

  /* Module 112 */
  // Checks if native Object.isExtensible works correctly.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.

    module.exports = !fails(function() {
      // Test by preventing extensions on an empty object.
      return Object.isExtensible(Object.preventExtensions({}));
    });
  },

  /* Module 113 */
  // Helper for setting prototype for collections (Map, Set).
  function(module, exports, localRequire) {
    let isObject = localRequire(8); // Checks if a value is an object.
    let setPrototypeOf = localRequire(42); // Object.setPrototypeOf polyfill.

    module.exports = function(instance, Constructor, collectionConstructor) {
      // If setPrototypeOf is available, use it.
      if (setPrototypeOf && isObject(Constructor.prototype) && Constructor.prototype !== collectionConstructor.prototype) {
        setPrototypeOf(instance, Constructor.prototype);
      }
      return instance;
    };
  },

  /* Module 114 */
  // Map-specific methods and internal state management.
  function(module, exports, localRequire) {
    "use strict";
    let objectDefineProperty = localRequire(11).f; // Object.defineProperty.
    let objectCreate = localRequire(30); // Object.create polyfill.
    let defineProperties = localRequire(36); // Defines multiple properties.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let checkInstance = localRequire(31); // Checks for correct instance.
    let iterateUtil = localRequire(3); // General iteration utility.
    let createIteratorFactory = localRequire(87); // Factory for iterator objects.
    let setToStringTag = localRequire(43); // Sets @@toStringTag.
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let metadataUtilities = localRequire(66); // Metadata utilities (fastKey).
    let internalState = localRequire(18); // Internal state management.

    let setInternalState = internalState.set;
    let getInternalState = internalState.getterFor("Map"); // Getter for Map state.

    /**
     * Internal data structure for Map entries.
     * Each entry is a linked list node: { key, value, previous, next, removed }.
     */
    let MapEntry = function(key, value) {
      this.key = key;
      this.value = value;
      this.previous = undefined;
      this.next = undefined;
      this.removed = false;
    };

    /**
     * Adds or updates an entry in the Map.
     * @param {object} mapInstance - The Map instance.
     * @param {any} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {object} The Map instance.
     */
    let addOrUpdateEntry = function(mapInstance, key, value) {
      let state = getInternalState(mapInstance);
      let existingEntry = getMapEntry(mapInstance, key);

      if (existingEntry) {
        existingEntry.value = value;
      } else {
        // Create a new entry and add it to the linked list.
        let newEntry = {
          key: key,
          value: value,
          previous: state.last,
          next: undefined,
          removed: false
        };
        if (state.last) {
          state.last.next = newEntry;
        } else {
          state.first = newEntry;
        }
        state.last = newEntry;
        state.size++;
      }
      return mapInstance;
    };

    /**
     * Retrieves an entry from the Map by key.
     * @param {object} mapInstance - The Map instance.
     * @param {any} key - The key to search for.
     * @returns {object|undefined} The Map entry or undefined.
     */
    let getMapEntry = function(mapInstance, key) {
      let state = getInternalState(mapInstance);
      let currentEntry = state.first;
      while (currentEntry) {
        if (currentEntry.key === key) {
          return currentEntry;
        }
        currentEntry = currentEntry.next;
      }
      return undefined;
    };

    module.exports = {
      /**
       * Returns a constructor for Map-like collections.
       * @param {Function} baseConstructor - The base constructor function.
       * @param {string} typeName - The name of the collection (e.g., "Map", "Set").
       * @param {boolean} isWeak - If true, it's a WeakMap/WeakSet.
       * @param {string} addMethodName - The name of the add method ("set" or "add").
       * @returns {Function} The new constructor.
       */
      getConstructor: function(baseConstructor, typeName, isWeak, addMethodName) {
        let Constructor = baseConstructor(function(instance, iterable) {
          checkInstance(instance, Constructor, typeName);
          setInternalState(instance, {
            type: typeName,
            first: undefined, // First entry in linked list.
            last: undefined, // Last entry in linked list.
            size: 0, // Number of entries.
          });
          if (descriptorsAvailable) {
            instance.size = 0; // Set size property if descriptors are available.
          }
          if (iterable !== null && iterable !== undefined) {
            iterateUtil(iterable, instance[addMethodName], instance, isWeak); // Populate with initial values.
          }
        });

        let getMapState = internalState.getterFor(typeName);

        defineProperties(Constructor.prototype, {
          clear: function() {
            let state = getMapState(this);
            let currentEntry = state.first;
            while (currentEntry) {
              currentEntry.removed = true; // Mark for removal.
              if (currentEntry.previous) {
                currentEntry.previous = undefined;
                currentEntry.next = undefined;
              }
              currentEntry = currentEntry.next; // Move to next.
            }
            state.first = state.last = undefined; // Reset linked list.
            state.size = 0; // Reset size.
          },
          delete: function(key) {
            let state = getMapState(this);
            let entryToRemove = getMapEntry(this, key);

            if (entryToRemove) {
              let prev = entryToRemove.previous;
              let next = entryToRemove.next;
              entryToRemove.removed = true; // Mark as removed.
              if (prev) {
                prev.next = next;
              } else {
                state.first = next;
              }
              if (next) {
                next.previous = prev;
              } else {
                state.last = prev;
              }
              state.size--; // Decrement size.
            }
            return !!entryToRemove; // Return true if an entry was deleted.
          },
          forEach: function(callback) {
            let state = getMapState(this);
            let boundCallback = createBoundFunction(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
            let currentEntry;
            while (currentEntry = (currentEntry ? currentEntry.next : state.first)) {
              // Iterate, skipping removed entries.
              while (currentEntry && currentEntry.removed) {
                currentEntry = currentEntry.previous;
              }
              if (currentEntry) {
                boundCallback(currentEntry.value, currentEntry.key, this);
              }
            }
          },
          has: function(key) {
            return !!getMapEntry(this, key);
          }
        });

        // Define specific methods for Map (get, set) or Set (add).
        if (isWeak) {
          defineProperties(Constructor.prototype, {
            get: function(key) {
              let entry = getMapEntry(this, key);
              return entry && entry.value;
            },
            set: function(key, value) {
              return addOrUpdateEntry(this, key, value);
            }
          });
        } else {
          defineProperties(Constructor.prototype, {
            add: function(key) {
              return addOrUpdateEntry(this, key, key);
            }
          });
        }

        // Define 'size' getter if descriptors are available.
        if (descriptorsAvailable) {
          objectDefineProperty.f(Constructor.prototype, "size", {
            get: function() {
              return getMapState(this).size;
            }
          });
        }

        return Constructor;
      },
      /**
       * Sets up strong mode iteration for collections.
       * @param {Function} Constructor - The collection constructor.
       * @param {string} typeName - The name of the collection.
       * @param {boolean} isMultiValue - If true, it's a Map; otherwise, Set.
       */
      setStrong: function(Constructor, typeName, isMultiValue) {
        let IteratorName = typeName + " Iterator";
        let getCollectionState = internalState.getterFor(typeName);
        let getIteratorState = internalState.getterFor(IteratorName);

        createIteratorFactory(
          Constructor,
          typeName,
          function(instance, kind) {
            setInternalState(this, {
              type: IteratorName,
              target: instance,
              state: getCollectionState(instance),
              kind: kind,
              last: undefined // Last returned entry.
            });
          },
          function() {
            let state = getIteratorState(this);
            let currentEntry = state.last;

            // Skip removed entries.
            while (currentEntry && currentEntry.removed) {
              currentEntry = currentEntry.previous;
            }

            if (state.target) {
              // Get the next entry.
              state.last = currentEntry = currentEntry ? currentEntry.next : state.state.first;
            }

            if (currentEntry) {
              // Return value based on iterator kind.
              if (state.kind === "keys") {
                return {
                  value: currentEntry.key,
                  done: false
                };
              }
              if (state.kind === "values") {
                return {
                  value: currentEntry.value,
                  done: false
                };
              }
              return {
                value: [currentEntry.key, currentEntry.value],
                done: false
              };
            }

            // End of iteration.
            state.target = undefined;
            return {
              value: undefined,
              done: true
            };
          },
          isMultiValue ? "entries" : "values", // Default iterator kind.
          isMultiValue, // Is entries iterator.
          true // Is weak.
        );

        setToStringTag(typeName); // Set @@toStringTag for the collection.
      }
    };
  },

  /* Module 115 */
  // Polyfill for Object.assign.
  function(module, exports, localRequire) {
    "use strict";
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let fails = localRequire(7); // Checks if a function throws an error.
    let objectKeys = localRequire(63); // Polyfill for Object.keys.
    let getOwnPropertySymbols = localRequire(83); // Get Symbol properties.
    let propertyIsEnumerable = localRequire(58); // Check if property is enumerable.
    let toObject = localRequire(15); // Converts to an object.
    let toIndexedObject = localRequire(77); // Converts to an indexed object.

    let nativeAssign = Object.assign; // Native Object.assign.

    // Test for bugs in native Object.assign.
    let assignBug = !nativeAssign || fails(function() {
      let target = {};
      let symbolKey = Symbol();
      let source1 = {};
      source1[symbolKey] = 7; // Add a symbol property.
      "abcdefghijklmnopqrst".split("").forEach(function(char) {
        target[char] = char;
      }); // Add string properties.
      return nativeAssign({}, source1)[symbolKey] !== 7 || objectKeys(nativeAssign({}, target)).join("") !== "abcdefghijklmnopqrst";
    });

    module.exports = assignBug ?
      function(target, source) {
        let object = toObject(target);
        let numArgs = arguments.length;
        let index = 1;
        let getSymbols = getOwnPropertySymbols.f;
        let isEnumerable = propertyIsEnumerable.f;

        while (numArgs > index) {
          let currentSource = toIndexedObject(arguments[index++]);
          let keys = getSymbols ? objectKeys(currentSource).concat(getSymbols(currentSource)) : objectKeys(currentSource);
          let len = keys.length;
          let i = 0;
          let key;

          while (len > i) {
            key = keys[i++];
            if (descriptorsAvailable ? isEnumerable.call(currentSource, key) : true) {
              object[key] = currentSource[key];
            }
          }
        }
        return object;
      } :
      nativeAssign;
  },

  /* Module 116 */
  // Utilities for Object.entries and Object.values.
  function(module, exports, localRequire) {
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let objectKeys = localRequire(63); // Polyfill for Object.keys.
    let toIndexedObject = localRequire(25); // Converts to an indexed object.
    let propertyIsEnumerable = localRequire(58); // Check if property is enumerable.

    /**
     * Factory function for Object.entries/values.
     * @param {boolean} isEntries - If true, returns [key, value] pairs; otherwise, just values.
     * @returns {Function} The generated method.
     */
    let createObjectIterator = function(isEntries) {
      return function(object) {
        let indexedObject = toIndexedObject(object);
        let keys = objectKeys(indexedObject);
        let length = keys.length;
        let index = 0;
        let result = [];
        let key;

        while (length > index) {
          key = keys[index++];
          if (descriptorsAvailable ? propertyIsEnumerable.f.call(indexedObject, key) : true) {
            result.push(isEntries ? [key, indexedObject[key]] : indexedObject[key]);
          }
        }
        return result;
      };
    };

    module.exports = {
      entries: createObjectIterator(true),
      values: createObjectIterator(false)
    };
  },

  /* Module 117 */
  // Asynchronous task scheduling utilities (setImmediate, queueMicrotask).
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let documentCreateElement = localRequire(78); // Creates a DOM element.
    let documentElement = localRequire(104); // document.documentElement.
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.

    let setImmediateNative = globalObject.setImmediate;
    let clearImmediateNative = globalObject.clearImmediate;

    let queueId = 0;
    let taskQueue = {};

    /**
     * Executes a task from the queue.
     * @param {number} id - The ID of the task.
     */
    let executeTask = function(id) {
      if (taskQueue.hasOwnProperty(id)) {
        let task = taskQueue[id];
        delete taskQueue[id];
        task();
      }
    };

    /**
     * Creates a function that executes a task.
     * @param {number} id - The ID of the task.
     * @returns {Function} The task execution function.
     */
    let createTaskExecutor = function(id) {
      return function() {
        executeTask(id);
      };
    };

    /**
     * MessageChannel handler for task scheduling.
     * @param {MessageEvent} event - The message event.
     */
    let messageChannelHandler = function(event) {
      executeTask(event.data);
    };

    let postMessageFunction; // Function to post messages.

    // If setImmediate/clearImmediate are not native, polyfill them.
    if (!setImmediateNative || !clearImmediateNative) {
      setImmediateNative = function(callback) {
        let args = [];
        for (let i = 1; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        taskQueue[++queueId] = function() {
          (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
        };
        postMessageFunction(queueId);
        return queueId;
      };

      clearImmediateNative = function(id) {
        delete taskQueue[id];
      };

      // Determine the best way to schedule tasks asynchronously.
      if (getClassTag(globalObject.process) === "process") {
        // Node.js: use process.nextTick.
        postMessageFunction = function(id) {
          globalObject.process.nextTick(createTaskExecutor(id));
        };
      } else if (globalObject.MessageChannel) {
        // Browsers with MessageChannel.
        let messageChannel = new globalObject.MessageChannel();
        let port1 = messageChannel.port1;
        let port2 = messageChannel.port2;
        port1.onmessage = messageChannelHandler;
        postMessageFunction = createBoundFunction(port2.postMessage, port2, 1);
      } else if (globalObject.addEventListener && typeof globalObject.postMessage === "function" && !globalObject.importScripts) {
        // Browsers with postMessage (but not importScripts).
        let messagePrefix = globalObject.location.protocol + "//" + globalObject.location.host;
        postMessageFunction = function(id) {
          globalObject.postMessage(id + "", messagePrefix);
        };
        globalObject.addEventListener("message", messageChannelHandler, false);
      } else if ("onreadystatechange" in documentCreateElement("script")) {
        // IE/legacy browsers: use script.onreadystatechange.
        postMessageFunction = function(id) {
          let script = documentCreateElement("script");
          script.onreadystatechange = function() {
            executeTask(id);
            documentElement.removeChild(this); // Clean up script tag.
          };
          documentElement.appendChild(script);
        };
      } else {
        // Fallback: setTimeout with 0 delay.
        postMessageFunction = function(id) {
          setTimeout(createTaskExecutor(id), 0);
        };
      }
    }

    module.exports = {
      set: setImmediateNative,
      clear: clearImmediateNative
    };
  },

  /* Module 118 */
  // Schedules a microtask (e.g., for Promise resolution).
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.
    let getOwnPropertyDescriptor = localRequire(22).f; // Get property descriptor.
    let getClassTag = localRequire(28); // Returns internal [[Class]] tag.
    let setImmediate = localRequire(117).set; // setImmediate polyfill.
    let userAgent = localRequire(89); // User agent string.

    let MutationObserver = globalObject.MutationObserver || globalObject.WebKitMutationObserver;
    let processObject = globalObject.process;
    let PromiseConstructor = globalObject.Promise;

    let isNode = getClassTag(processObject) === "process"; // Check if running in Node.js.
    let queueMicrotaskNative = getOwnPropertyDescriptor(globalObject, "queueMicrotask");
    let microtaskExecutor = queueMicrotaskNative && queueMicrotaskNative.value; // Native queueMicrotask.

    let currentQueueHead, currentQueueTail; // Linked list for microtasks.
    let isScheduling = false; // Flag to prevent re-scheduling.

    /**
     * Executes the microtask queue.
     */
    let runMicrotaskQueue = function() {
      let domain;
      // In Node.js, enter/exit domain for proper error handling.
      if (isNode && (domain = processObject.domain)) {
        domain.exit();
      }
      while (currentQueueHead) {
        let task = currentQueueHead.fn;
        currentQueueHead = currentQueueHead.next;
        try {
          task();
        } catch (error) {
          // If an error occurs, clear the queue and re-throw.
          if (currentQueueHead) {
            scheduleMicrotask();
          }
          throw error;
        }
      }
      currentQueueTail = undefined;
      isScheduling = false;
      if (domain) {
        domain.enter();
      }
    };

    let scheduleMicrotask; // Function to schedule microtasks.

    if (microtaskExecutor) {
      scheduleMicrotask = function(task) {
        microtaskExecutor.call(globalObject, task);
      };
    } else {
      // Polyfill for queueMicrotask.
      if (isNode) {
        scheduleMicrotask = function() {
          processObject.nextTick(runMicrotaskQueue);
        };
      } else if (MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test(userAgent)) {
        // Browsers with MutationObserver (excluding buggy Safari versions).
        let toggle = true;
        let textNode = globalObject.document.createTextNode("");
        new MutationObserver(runMicrotaskQueue).observe(textNode, {
          characterData: true
        });
        scheduleMicrotask = function() {
          textNode.data = (toggle = !toggle); // Trigger mutation.
        };
      } else if (PromiseConstructor && PromiseConstructor.resolve) {
        // Browsers with Promise: use Promise.resolve().then().
        let resolvedPromise = PromiseConstructor.resolve(undefined);
        scheduleMicrotask = function() {
          resolvedPromise.then(runMicrotaskQueue);
        };
      } else {
        // Fallback: use setImmediate.
        scheduleMicrotask = function() {
          setImmediate(runMicrotaskQueue);
        };
      }
    }

    module.exports = microtaskExecutor || function(task) {
      let newTask = {
        fn: task,
        next: undefined
      };
      if (currentQueueTail) {
        currentQueueTail.next = newTask;
      }
      if (!currentQueueHead) {
        currentQueueHead = newTask;
      }
      currentQueueTail = newTask;
      if (!isScheduling) {
        isScheduling = true;
        scheduleMicrotask();
      }
    };
  },

  /* Module 119 */
  // Creates a resolved Promise from a value.
  function(module, exports, localRequire) {
    let requireObject = localRequire(1); // Ensures the value is an object.
    let isObject = localRequire(8); // Checks if a value is an object.
    let promiseCapability = localRequire(55); // Promise capability factory.

    module.exports = function(PromiseConstructor, value) {
      if (requireObject(PromiseConstructor), isObject(value) && value.constructor === PromiseConstructor) {
        return value;
      }
      let capabilities = promiseCapability.f(PromiseConstructor);
      capabilities.resolve(value);
      return capabilities.promise;
    };
  },

  /* Module 120 */
  // Logs an unhandled promise rejection error to the console.
  function(module, exports, localRequire) {
    let globalObject = localRequire(5); // Get the global object.

    module.exports = function(error, argument) {
      let consoleObject = globalObject.console;
      if (consoleObject && consoleObject.error) {
        if (arguments.length === 1) {
          consoleObject.error(error);
        } else {
          consoleObject.error(error, argument);
        }
      }
    };
  },

  /* Module 121 */
  // Polyfill for Set (ECMAScript 2015 Set).
  function(module, exports, localRequire) {
    "use strict";
    let implementCollection = localRequire(65); // Generic collection implementation factory.
    let SetMethodHelper = localRequire(114); // Set-specific method helper.

    module.exports = implementCollection("Set", function(constructor) {
      return function() {
        return constructor(this, arguments.length > 0 ? arguments[0] : undefined);
      };
    }, SetMethodHelper, false); // False for isWeak, true for isMultiValue.
  },

  /* Module 122 */
  // String pad utilities (padStart, padEnd).
  function(module, exports, localRequire) {
    let toLength = localRequire(10); // Converts to a valid length.
    let stringRepeat = localRequire(204); // String.prototype.repeat polyfill.
    let requireObjectCoercible = localRequire(17); // Ensures value is not null/undefined.

    /**
     * Factory for string padding methods.
     * @param {boolean} padEnd - If true, pads at the end; otherwise, at the start.
     * @returns {Function} The generated padding method.
     */
    let createPadMethod = function(padEnd) {
      return function(targetString, maxLength, fillString) {
        let str = String(requireObjectCoercible(targetString));
        let len = toLength(maxLength);
        let paddingChar = fillString === undefined ? " " : String(fillString);
        let strLength = str.length;

        // If max length is less than or equal to string length, or padding char is empty, return original string.
        if (len <= strLength || paddingChar === "") {
          return str;
        }

        let paddingLength = len - strLength;
        let repeatedPadding = stringRepeat.call(paddingChar, Math.ceil(paddingLength / paddingChar.length));

        // Trim padding if it's too long.
        if (repeatedPadding.length > paddingLength) {
          repeatedPadding = repeatedPadding.slice(0, paddingLength);
        }

        return padEnd ? str + repeatedPadding : repeatedPadding + str;
      };
    };

    module.exports = {
      start: createPadMethod(false),
      end: createPadMethod(true)
    };
  },

  /* Module 123 */
  // Checks for bugs in String.prototype.padStart/padEnd (Safari).
  function(module, exports, localRequire) {
    let userAgent = localRequire(89); // User agent string.
    module.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);
  },

  /* Module 124 */
  // Converts a value to a Uint8Clamped value (0-255).
  function(module, exports, localRequire) {
    let toInteger = localRequire(24); // Converts to an integer.
    let toLength = localRequire(10); // Converts to a valid length.

    module.exports = function(value) {
      if (value === undefined) return 0;
      let integerValue = toInteger(value);
      let length = toLength(integerValue);
      if (integerValue !== length) {
        throw new RangeError("Wrong length or index");
      }
      return length;
    };
  },

  /* Module 125 */
  // Polyfill for Array.from. (Same as 107, but specifically for TypedArrays)
  function(module, exports, localRequire) {
    let toObject = localRequire(15); // Converts to an object.
    let toLength = localRequire(10); // Converts to a valid length.
    let getIterator = localRequire(52); // Retrieves an iterator.
    let getIteratorMethod = localRequire(84); // Checks for iterator method.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let getTypedArrayConstructor = localRequire(33).aTypedArrayConstructor; // Gets TypedArray constructor.

    module.exports = function(arrayLike) {
      let object = toObject(arrayLike);
      let length = toLength(object.length);
      let numArgs = arguments.length;
      let mapFn = numArgs > 1 ? arguments[1] : undefined;
      let boundMapFn;
      let newTypedArray;
      let index = 0;
      let iterator, iteratorResult;

      if (getIterator(object) !== null && !getIteratorMethod(getIterator(object))) {
        // If it's a true iterable (not array-like).
        let values = [];
        for (iterator = getIterator(object).call(object); !(iteratorResult = iterator.next()).done;) {
          values.push(iteratorResult.value);
        }
        object = values; // Use collected values as the arrayLike.
        length = toLength(object.length);
      }

      if (mapFn !== undefined) {
        boundMapFn = createBoundFunction(mapFn, numArgs > 2 ? arguments[2] : undefined, 2);
      }

      newTypedArray = new(getTypedArrayConstructor(this))(length); // Create new TypedArray.

      for (; index < length; index++) {
        newTypedArray[index] = boundMapFn ? boundMapFn(object[index], index) : object[index];
      }
      return newTypedArray;
    };
  },

  /* Module 126 */
  // WeakMap-specific methods and internal state management.
  function(module, exports, localRequire) {
    let defineProperties = localRequire(36); // Defines multiple properties.
    let getWeakData = localRequire(66).getWeakData; // Get weak data from metadata utilities.
    let requireObject = localRequire(1); // Ensures the value is an object.
    let isObject = localRequire(8); // Checks if a value is an object.
    let checkInstance = localRequire(31); // Checks for correct instance.
    let iterateUtil = localRequire(3); // General iteration utility.
    let arrayForEach = localRequire(48).forEach; // Array.prototype.forEach.
    let arrayFind = localRequire(48).find; // Array.prototype.find.
    let arrayFindIndex = localRequire(48).findIndex; // Array.prototype.findIndex.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let internalState = localRequire(18); // Internal state management.

    let setInternalState = internalState.set;
    let getInternalState = internalState.getterFor("WeakMap"); // Getter for WeakMap state.

    let nextObjectId = 0; // Counter for unique object IDs for internal Map fallback.

    /**
     * Internal Map-like fallback for frozen objects in WeakMap.
     * Stores entries as `[[key, value]]` pairs.
     * @constructor
     */
    let FrozenObjectMap = function() {
      this.entries = [];
    };

    FrozenObjectMap.prototype = {
      get: function(key) {
        let entry = arrayFind(this.entries, function(entry) {
          return entry[0] === key;
        });
        return entry && entry[1];
      },
      has: function(key) {
        return !!arrayFind(this.entries, function(entry) {
          return entry[0] === key;
        });
      },
      set: function(key, value) {
        let entry = arrayFind(this.entries, function(entry) {
          return entry[0] === key;
        });
        if (entry) {
          entry[1] = value;
        } else {
          this.entries.push([key, value]);
        }
      },
      delete: function(key) {
        let index = arrayFindIndex(this.entries, function(entry) {
          return entry[0] === key;
        });
        if (index > -1) {
          this.entries.splice(index, 1);
        }
        return index > -1;
      }
    };

    /**
     * Retrieves or creates a FrozenObjectMap for a given WeakMap instance.
     * @param {object} weakMapState - The internal state of the WeakMap.
     * @returns {FrozenObjectMap} The FrozenObjectMap.
     */
    let getFrozenObjectMap = function(weakMapState) {
      return weakMapState.frozen || (weakMapState.frozen = new FrozenObjectMap());
    };

    module.exports = {
      /**
       * Returns a constructor for WeakMap-like collections.
       * @param {Function} baseConstructor - The base constructor function.
       * @param {string} typeName - The name of the collection (e.g., "WeakMap", "WeakSet").
       * @param {boolean} isWeak - If true, it's a WeakMap/WeakSet.
       * @param {string} addMethodName - The name of the add method ("set" or "add").
       * @returns {Function} The new constructor.
       */
      getConstructor: function(baseConstructor, typeName, isWeak, addMethodName) {
        let Constructor = baseConstructor(function(instance, iterable) {
          checkInstance(instance, Constructor, typeName);
          setInternalState(instance, {
            type: typeName,
            id: nextObjectId++, // Unique ID for this WeakMap instance.
            frozen: undefined // Storage for frozen objects.
          });
          if (iterable !== null && iterable !== undefined) {
            iterateUtil(iterable, instance[addMethodName], instance, isWeak); // Populate with initial values.
          }
        });

        let getWeakMapState = internalState.getterFor(typeName);

        /**
         * Sets a value in the WeakMap, handling object extensibility.
         * @param {object} weakMapInstance - The WeakMap instance.
         * @param {object} key - The key (must be an object).
         * @param {any} value - The value to set.
         * @returns {object} The WeakMap instance.
         */
        let setWeakValue = function(weakMapInstance, key, value) {
          let state = getWeakMapState(weakMapInstance);
          let weakData = getWeakData(requireObject(key), true); // Get weak data from the key's metadata.

          if (weakData === true) {
            // If the key is not extensible, use the internal FrozenObjectMap.
            getFrozenObjectMap(state).set(key, value);
          } else {
            weakData[state.id] = value; // Store data using the WeakMap's unique ID.
          }
          return weakMapInstance;
        };

        defineProperties(Constructor.prototype, {
          delete: function(key) {
            let state = getWeakMapState(this);
            if (!isObject(key)) return false; // Key must be an object.
            let weakData = getWeakData(key); // Get weak data from key.

            if (weakData === true) {
              return getFrozenObjectMap(state).delete(key);
            }
            if (weakData && hasOwnProperty(weakData, state.id)) {
              delete weakData[state.id];
              return true;
            }
            return false;
          },
          has: function(key) {
            let state = getWeakMapState(this);
            if (!isObject(key)) return false;
            let weakData = getWeakData(key);

            if (weakData === true) {
              return getFrozenObjectMap(state).has(key);
            }
            return !!(weakData && hasOwnProperty(weakData, state.id));
          }
        });

        // Define specific methods for WeakMap (get, set) or WeakSet (add).
        if (isWeak) {
          defineProperties(Constructor.prototype, {
            get: function(key) {
              let state = getWeakMapState(this);
              if (isObject(key)) {
                let weakData = getWeakData(key);
                if (weakData === true) {
                  return getFrozenObjectMap(state).get(key);
                }
                return weakData ? weakData[state.id] : undefined;
              }
              return undefined;
            },
            set: function(key, value) {
              return setWeakValue(this, key, value);
            }
          });
        } else {
          defineProperties(Constructor.prototype, {
            add: function(key) {
              return setWeakValue(this, key, true); // Value is always true for WeakSet.
            }
          });
        }

        return Constructor;
      }
    };
  },

  /* Module 127 */
  // Implements composite keys for Map-like structures.
  function(module, exports, localRequire) {
    let MapConstructor = localRequire(88); // Map constructor.
    let WeakMapConstructor = localRequire(96); // WeakMap constructor.
    let objectCreate = localRequire(30); // Object.create polyfill.
    let isObject = localRequire(8); // Checks if a value is an object.

    /**
     * Represents a node in the composite key tree.
     * Stores references to child nodes for objects, symbols, and primitives.
     * @constructor
     */
    let CompositeKeyNode = function() {
      this.objectMap = null; // WeakMap for object keys.
      this.symbolMap = null; // Map for symbol keys.
      this.primitiveMap = null; // Map for primitive keys.
      this.objectIndexMap = objectCreate(null); // Map to store nodes by object reference.
    };

    CompositeKeyNode.prototype = {
      /**
       * Retrieves a child node for a given key type.
       * @param {string} keyType - 'object', 'symbol', or 'primitives'.
       * @param {Function} constructorFn - The constructor to use for the map (e.g., Map, WeakMap).
       * @returns {Map|WeakMap} The map for the specified key type.
       */
      getMap: function(keyType, constructorFn) {
        return this[keyType + "Map"] || (this[keyType + "Map"] = constructorFn());
      },
      /**
       * Navigates to the next node in the composite key tree.
       * @param {number} index - The index of the current key in the composite sequence.
       * @param {any} key - The current key value.
       * @param {boolean} isObjectKey - True if the key is an object.
       * @returns {CompositeKeyNode} The next node.
       */
      getNextNode: function(index, key, isObjectKey) {
        let keyMap;
        if (isObjectKey) {
          keyMap = this.objectIndexMap[index] || (this.objectIndexMap[index] = new WeakMapConstructor());
        } else {
          keyMap = this.primitiveMap || (this.primitiveMap = new MapConstructor());
        }

        let nextNode = keyMap.get(key);
        if (!nextNode) {
          keyMap.set(key, nextNode = new CompositeKeyNode());
        }
        return nextNode;
      }
    };

    let rootCompositeKeyNode = new CompositeKeyNode(); // The root of the composite key tree.

    module.exports = function() {
      let currentCompositeNode = rootCompositeKeyNode;
      let numArgs = arguments.length;
      let arg;
      let i;

      // First pass: Process object keys.
      for (i = 0; i < numArgs; i++) {
        arg = arguments[i];
        if (isObject(arg)) {
          currentCompositeNode = currentCompositeNode.getNextNode(i, arg, true);
        }
      }

      // If no object keys were provided and this is the main Object, throw an error.
      if (this === Object && currentCompositeNode === rootCompositeKeyNode) {
        throw new TypeError("Composite keys must contain a non-primitive component");
      }

      // Second pass: Process primitive keys.
      for (i = 0; i < numArgs; i++) {
        arg = arguments[i];
        if (!isObject(arg)) {
          currentCompositeNode = currentCompositeNode.getNextNode(i, arg, false);
        }
      }

      return currentCompositeNode;
    };
  },

  /* Module 128 */
  // Math.scale polyfill.
  function(module, exports) {
    module.exports = Math.scale || function(value, inMin, inMax, outMin, outMax) {
      // Handle edge cases (NaN, Infinity).
      if (arguments.length === 0 || value !== value || inMin !== inMin || inMax !== inMax || outMin !== outMin || outMax !== outMax) {
        return NaN;
      }
      if (value === Infinity || value === -Infinity) {
        return value;
      }
      // Linear interpolation formula.
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };
  },

  /* Module 129 */
  // Generic utility for adding multiple items to a collection (Set, WeakSet).
  function(module, exports, localRequire) {
    "use strict";
    let requireObject = localRequire(1); // Ensures the value is an object.
    let requireFunction = localRequire(4); // Ensures the value is a function.

    module.exports = function() {
      let collection = requireObject(this);
      let addMethod = requireFunction(collection.add);

      // Iterate through all arguments and attempt to add each one.
      for (let i = 0, length = arguments.length; i < length; i++) {
        addMethod.call(collection, arguments[i]);
      }
      return collection;
    };
  },

  /* Module 130 */
  // Checks for various URL constructor bugs.
  function(module, exports, localRequire) {
    let fails = localRequire(7); // Checks if a function throws an error.
    let isPure = localRequire(2); // Checks if core-js is in pure mode.
    let wellKnownSymbol = localRequire(6)("iterator"); // Symbol.iterator.

    module.exports = !fails(function() {
      let url = new URL("b?e=1", "http://a");
      let searchParams = url.searchParams;

      // Test URL properties and methods.
      url.pathname = "c%20d";
      return isPure && !url.toJSON || // Check toJSON if in pure mode.
        !searchParams.sort || // Check searchParams.sort.
        url.href !== "http://a/c%20d?e=1" || // Check href.
        searchParams.get("e") !== "1" || // Check searchParams.get.
        String(new URLSearchParams("?a=1")) !== "a=1" || // Check URLSearchParams toString.
        !searchParams[wellKnownSymbol] || // Check searchParams iterator.
        new URL("https://a@b").username !== "a" || // Check username.
        new URLSearchParams(new URLSearchParams("a=b")).get("a") !== "b" || // Check URLSearchParams constructor with another URLSearchParams.
        new URL("http://тест").host !== "xn--e1aybc" || // Check IDN support.
        new URL("http://a#б").hash !== "#%D0%B1"; // Check hash encoding.
    });
  },

  /* Module 131 */
  // Polyfill for URL and URLSearchParams.
  function(module, exports, localRequire) {
    "use strict";
    let exportUtil = localRequire(0); // General export utility.
    let globalObject = localRequire(5); // Global object.
    let descriptorsAvailable = localRequire(9); // Checks for reliable descriptors.
    let setProperty = localRequire(23); // Sets a property.
    let defineProperties = localRequire(36); // Defines multiple properties.
    let checkInstance = localRequire(31); // Checks for correct instance.
    let hasOwnProperty = localRequire(14); // Checks for own property.
    let createBoundFunction = localRequire(13); // Creates a bound function.
    let requireObject = localRequire(1); // Ensures the value is an object.
    let isObject = localRequire(8); // Checks if a value is an object.
    let getIteratorMethod = localRequire(57); // Retrieves the iterator method.
    let getIterator = localRequire(52); // Retrieves an iterator.
    let wellKnownSymbol = localRequire(6)("iterator"); // Symbol.iterator.
    let internalState = localRequire(18); // Internal state management.

    let setInternalState = internalState.set;
    let getUrlState = internalState.getterFor("URL"); // Getter for URL state.
    let getSearchParamsState = internalState.getterFor("URLSearchParams"); // Getter for URLSearchParams state.
    let getSearchParamsIteratorState = internalState.getterFor("URLSearchParamsIterator"); // Getter for URLSearchParamsIterator state.

    let round = Math.floor; // For integer operations.
    let power = Math.pow; // For numerical conversions.

    // Regular expressions for URL parsing.
    const ALPHA = /[A-Za-z]/;
    const ALPHANUMERIC_DASH_DOT = /[\d+\-.A-Za-z]/;
    const DIGIT = /\d/;
    const HEX_PREFIX = /^(0x|0X)/;
    const OCTAL_PREFIX = /^[0-7]+$/;
    const DECIMAL_DIGITS = /^\d+$/;
    const HEX_DIGITS = /^[\dA-Fa-f]+$/;
    const INVALID_URL_CHARS = /[\u0000\u0009\u000A\u000D #%\/:?@[\\]]/;
    const INVALID_HOST_CHARS = /[\u0000\u0009\u000A\u000D #\/:?@[\\]]/;
    const TRIM_WHITESPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
    const NEWLINE_TAB_CARRIAGE_RETURN = /[\u0009\u000A\u000D]/g;

    // Default ports for common schemes.
    const DEFAULT_PORTS = {
      ftp: 21,
      file: null,
      gopher: 70,
      http: 80,
      https: 443,
      ws: 80,
      wss: 443,
    };

    // Characters that need special encoding in URL components.
    const ENCODE_CHARS_FRAGMENT = {
      " ": 1,
      '"': 1,
      "<": 1,
      ">": 1,
      "`": 1
    };
    const ENCODE_CHARS_QUERY = { ...ENCODE_CHARS_FRAGMENT,
      "#": 1,
      "?": 1,
      "{": 1,
      "}": 1
    };
    const ENCODE_CHARS_PATH = { ...ENCODE_CHARS_QUERY,
      "/": 1,
      ":": 1,
      ";": 1,
      "=": 1,
      "@": 1,
      "[": 1,
      "\\": 1,
      "]": 1,
      "^": 1,
      "|": 1
    };

    /**
     * Percent-encodes a string character if it's in the forbidden set.
     * @param {string} char - The character to encode.
     * @param {object} forbiddenSet - Set of characters that should be encoded.
     * @returns {string} The encoded character or original char.
     */
    let percentEncode = function(char, forbiddenSet) {
      let code = char.charCodeAt(0);
      if (code > 32 && code < 127 && !hasOwnProperty(forbiddenSet, char)) {
        return char;
      }
      return encodeURIComponent(char);
    };

    /**
     * Checks if a scheme has a default port.
     * @param {object} urlState - The internal URL state.
     * @returns {boolean} True if the scheme has a default port.
     */
    let hasDefaultPort = function(urlState) {
      return hasOwnProperty(DEFAULT_PORTS, urlState.scheme);
    };

    /**
     * Checks if a URL's host is empty or cannot be a base URL.
     * @param {object} urlState - The internal URL state.
     * @returns {boolean} True if it's a special host.
     */
    let isSpecialHost = function(urlState) {
      return !urlState.host || urlState.cannotBeABaseURL || urlState.scheme === "file";
    };

    /**
     * Checks if a segment in a file URL path is a Windows drive letter.
     * @param {string} segment - The path segment.
     * @param {boolean} allowLeadingSlash - True if a leading slash is allowed.
     * @returns {boolean} True if it's a drive letter.
     */
    let isWindowsDriveLetter = function(segment, allowLeadingSlash) {
      return segment.length === 2 && ALPHA.test(segment.charAt(0)) && (segment.charAt(1) === ":" || (!allowLeadingSlash && segment.charAt(1) === "|"));
    };

    /**
     * Checks if a path starts with a Windows drive letter.
     * @param {string} path - The path string.
     * @returns {boolean} True if it starts with a drive letter.
     */
    let startsWithWindowsDriveLetter = function(path) {
      return path.length > 1 && isWindowsDriveLetter(path.slice(0, 2)) && (path.length === 2 || path.charAt(2) === "/" || path.charAt(2) === "\\" || path.charAt(2) === "?" || path.charAt(2) === "#");
    };

    /**
     * Removes the last segment from a URL's path.
     * @param {object} urlState - The internal URL state.
     */
    let popPathSegment = function(urlState) {
      let path = urlState.path;
      let pathLength = path.length;
      if (!pathLength || (urlState.scheme === "file" && pathLength === 1 && isWindowsDriveLetter(path[0], true))) {
        return;
      }
      path.pop();
    };

    /**
     * Checks if a path segment is a dot ('.') or encoded dot.
     * @param {string} segment - The path segment.
     * @returns {boolean} True if it's a dot segment.
     */
    let isDotSegment = function(segment) {
      return segment === "." || segment.toLowerCase() === "%2e";
    };

    /**
     * Host parsing utility.
     * @param {object} urlState - The internal URL state.
     * @param {string} hostString - The host string to parse.
     * @returns {string|undefined} Error message if parsing fails, undefined otherwise.
     */
    let parseHost = function(urlState, hostString) {
      let ipv6Host;
      if (hostString.charAt(0) === "[") {
        if (hostString.charAt(hostString.length - 1) !== "]") {
          return "Invalid host";
        }
        if (!(ipv6Host = parseIpv6Host(hostString.slice(1, -1)))) {
          return "Invalid host";
        }
        urlState.host = ipv6Host;
      } else if (hasDefaultPort(urlState)) {
        hostString = normalizeHost(hostString);
        if (!(ipv6Host = parseIpv4Host(hostString))) {
          return "Invalid host";
        }
        urlState.host = ipv6Host;
      } else {
        if (INVALID_HOST_CHARS.test(hostString)) {
          return "Invalid host";
        }
        let encodedHost = [];
        for (let i = 0, len = hostString.length; i < len; i++) {
          encodedHost.push(percentEncode(hostString[i], ENCODE_CHARS_PATH));
        }
        urlState.host = encodedHost.join("");
      }
    };

    /**
     * Parses an IPv4 host string.
     * @param {string} hostString - The IPv4 host string.
     * @returns {string|null} The parsed IPv4 address or null if invalid.
     */
    let parseIpv4Host = function(hostString) {
      let parts = hostString.split(".");
      if (parts.length && parts[parts.length - 1] === "") {
        parts.pop();
      }
      let numParts = parts.length;
      if (numParts > 4) {
        return hostString;
      }
      let numbers = [];
      for (let i = 0; i < numParts; i++) {
        let part = parts[i];
        if (part === "") return hostString;
        let base = 10;
        if (part.length > 1 && part.charAt(0) === "0") {
          base = HEX_PREFIX.test(part) ? 16 : 8;
          part = part.slice(base === 8 ? 1 : 2);
        }
        let value;
        if (part === "") {
          value = 0;
        } else {
          if (!(base === 10 ? DECIMAL_DIGITS : base === 8 ? OCTAL_PREFIX : HEX_DIGITS).test(part)) {
            return hostString;
          }
          value = parseInt(part, base);
        }
        numbers.push(value);
      }
      for (let i = 0; i < numParts; i++) {
        let value = numbers[i];
        if (i === numParts - 1) {
          if (value >= power(256, 5 - numParts)) {
            return null;
          }
        } else if (value > 255) {
          return null;
        }
      }
      let lastPart = numbers.pop();
      for (let i = 0; i < numbers.length; i++) {
        lastPart += numbers[i] * power(256, 3 - i);
      }
      return lastPart;
    };

    /**
     * Parses an IPv6 host string.
     * @param {string} hostString - The IPv6 host string.
     * @returns {string|null} The parsed IPv6 address or null if invalid.
     */
    let parseIpv6Host = function(hostString) {
      let parts = [0, 0, 0, 0, 0, 0, 0, 0];
      let partIndex = 0;
      let doubleColonIndex = null;
      let currentPosition = 0;

      let getChar = () => hostString.charAt(currentPosition);

      if (getChar() === ":") {
        if (hostString.charAt(1) !== ":") return null;
        currentPosition += 2;
        doubleColonIndex = ++partIndex;
      }

      while (getChar()) {
        if (partIndex === 8) return null; // Too many parts.
        if (getChar() === ":") {
          if (doubleColonIndex !== null) return null; // Only one double colon allowed.
          currentPosition++;
          doubleColonIndex = ++partIndex;
          continue;
        }

        let value = 0;
        let numHexDigits = 0;
        while (numHexDigits < 4 && HEX_DIGITS.test(getChar())) {
          value = value * 16 + parseInt(getChar(), 16);
          currentPosition++;
          numHexDigits++;
        }

        if (getChar() === ".") {
          if (numHexDigits === 0) return null; // No hex digits before dot.
          currentPosition -= numHexDigits; // Rewind to parse IPv4.
          if (partIndex > 6) return null; // IPv4 part can only be at end.

          let ipv4Parts = 0;
          while (getChar()) {
            let octetValue = null;
            if (ipv4Parts > 0) {
              if (!(getChar() === "." && ipv4Parts < 4)) return null;
              currentPosition++;
            }
            if (!DIGIT.test(getChar())) return null;

            while (DIGIT.test(getChar())) {
              let digit = parseInt(getChar(), 10);
              if (octetValue === null) octetValue = digit;
              else {
                if (octetValue === 0) return null; // Leading zero.
                octetValue = octetValue * 10 + digit;
              }
              if (octetValue > 255) return null; // Octet too large.
              currentPosition++;
            }
            parts[partIndex] = parts[partIndex] * 256 + octetValue;
            if (++ipv4Parts === 2 || ipv4Parts === 4) {
              partIndex++;
            }
          }
          if (ipv4Parts !== 4) return null;
          break; // Done with IPv6 parsing.
        } else if (getChar() === ":") {
          currentPosition++;
          if (!getChar()) return null; // Trailing colon.
        } else if (getChar()) {
          return null; // Invalid character.
        }
        parts[partIndex++] = value;
      }

      if (doubleColonIndex !== null) {
        let numMissingParts = partIndex - doubleColonIndex;
        let numExistingParts = 8 - numMissingParts;
        while (numMissingParts-- > 0) {
          parts[7 - numMissingParts] = parts[numExistingParts - 1 - numMissingParts];
          parts[numExistingParts - 1 - numMissingParts] = 0;
        }
      } else if (partIndex !== 8) {
        return null; // Not enough parts.
      }
      return parts;
    };

    /**
     * Normalizes a host string (e.g., converts IDN to Punycode).
     * @param {string} hostString - The host string.
     * @returns {string} The normalized host string.
     */
    let normalizeHost = function(hostString) {
      // This is a simplified version; full IDN conversion is complex.
      // For this clone, we'll assume a basic normalization or skip punycode.
      // The original `n(321)` module likely handles Punycode.
      // For now, let's keep it simple.
      return hostString.toLowerCase();
    };

    /**
     * Converts an IPv4 address (number) or IPv6 (array) to a display string.
     * @param {number|Array} address - The IP address.
     * @returns {string} The IP address string.
     */
    let ipAddressToString = function(address) {
      if (typeof address === "number") {
        let parts = [];
        for (let i = 0; i < 4; i++) {
          parts.unshift(address % 256);
          address = round(address / 256);
        }
        return parts.join(".");
      }
      if (typeof address === "object") {
        let result = "";
        let longestSequenceStart = null;
        let longestSequenceLength = 1;
        let currentSequenceStart = null;
        let currentSequenceLength = 0;

        // Find the longest sequence of zeros.
        for (let i = 0; i < 8; i++) {
          if (address[i] === 0) {
            if (currentSequenceStart === null) {
              currentSequenceStart = i;
            }
            currentSequenceLength++;
          } else {
            if (currentSequenceLength > longestSequenceLength) {
              longestSequenceLength = currentSequenceLength;
              longestSequenceStart = currentSequenceStart;
            }
            currentSequenceStart = null;
            currentSequenceLength = 0;
          }
        }
        if (currentSequenceLength > longestSequenceLength) {
          longestSequenceLength = currentSequenceLength;
          longestSequenceStart = currentSequenceStart;
        }

        let skipZeros = false;
        for (let i = 0; i < 8; i++) {
          if (skipZeros && address[i] === 0) {
            continue;
          }
          if (skipZeros && address[i] !== 0) {
            skipZeros = false;
          }
          if (longestSequenceStart === i) {
            result += i === 0 ? "::" : ":";
            skipZeros = true;
            continue;
          }
          if (i > 0) result += ":";
          result += address[i].toString(16);
        }
        return "[" + result + "]";
      }
      return String(address);
    };

    // URL parsing states.
    const State = {
      SCHEME_START: 0,
      SCHEME: 1,
      NO_SCHEME: 2,
      SPECIAL_RELATIVE_OR_AUTHORITY: 3,
      PATH_OR_AUTHORITY: 4,
      AUTHORITY: 5,
      HOST: 6,
      PORT: 7,
      FILE: 8,
      FILE_SLASH: 9,
      FILE_HOST: 10,
      PATH_START: 11,
      PATH: 12,
      OPAQUE_PATH: 13,
      QUERY: 14,
      FRAGMENT: 15,
    };

    /**
     * Parses a URL string and populates a URL state object.
     * @param {object} urlState - The internal URL state object.
     * @param {string} input - The URL string to parse.
     * @param {number} startState - The initial parsing state.
     * @param {object} [baseUrlState] - The base URL state for relative URLs.
     * @returns {string|undefined} Error message if parsing fails, undefined otherwise.
     */
    let parseUrl = function(urlState, input, startState, baseUrlState) {
      let character,
        currentBuffer = "",
        atSignSeen = false,
        squareBracketSeen = false,
        passwordSeen = false;

      // Initialize URL state if startState is SCHEME_START.
      if (startState === State.SCHEME_START) {
        urlState.scheme = "";
        urlState.username = "";
        urlState.password = "";
        urlState.host = null;
        urlState.port = null;
        urlState.path = [];
        urlState.query = null;
        urlState.fragment = null;
        urlState.cannotBeABaseURL = false;
        input = input.replace(TRIM_WHITESPACE, ""); // Trim leading/trailing whitespace.
      }
      input = input.replace(NEWLINE_TAB_CARRIAGE_RETURN, ""); // Remove newlines/tabs/carriage returns.

      let characters = [];
      for (let i = 0; i < input.length; i++) {
        characters.push(input[i]);
      }

      let index = 0;
      let currentState = startState;

      while (index <= characters.length) {
        character = characters[index]; // Current character.

        switch (currentState) {
          case State.SCHEME_START:
            if (character && ALPHA.test(character)) {
              currentBuffer += character.toLowerCase();
              currentState = State.SCHEME;
            } else {
              if (baseUrlState) {
                currentState = State.NO_SCHEME;
                continue; // Re-evaluate with new state.
              }
              return "Invalid scheme";
            }
            break;

          case State.SCHEME:
            if (character && (ALPHANUMERIC_DASH_DOT.test(character) || character === "+" || character === "-")) {
              currentBuffer += character.toLowerCase();
            } else if (character === ":") {
              if (baseUrlState && hasDefaultPort(urlState) !== hasOwnProperty(DEFAULT_PORTS, currentBuffer) && (urlState.scheme === "file" && (urlState.username !== "" || urlState.password !== "" || urlState.port !== null)) || (urlState.scheme === "file" && urlState.host === null)) {
                return "Invalid scheme"; // Edge case check.
              }
              urlState.scheme = currentBuffer;
              currentBuffer = "";
              if (hasDefaultPort(urlState)) {
                currentState = State.SPECIAL_RELATIVE_OR_AUTHORITY;
              } else if (urlState.scheme === "file") {
                currentState = State.FILE;
              } else if (characters[index + 1] === "/" && characters[index + 2] === "/") {
                currentState = State.PATH_OR_AUTHORITY;
                index++; // Skip one slash.
              } else {
                urlState.cannotBeABaseURL = true;
                urlState.path.push("");
                currentState = State.OPAQUE_PATH;
              }
            } else {
              if (baseUrlState) {
                currentBuffer = "";
                currentState = State.NO_SCHEME;
                index = -1; // Re-evaluate from beginning with new state.
                continue;
              }
              return "Invalid scheme";
            }
            break;

          case State.NO_SCHEME:
            if (!baseUrlState || (baseUrlState.cannotBeABaseURL && character !== "#")) {
              return "Invalid scheme";
            } else if (baseUrlState.cannotBeABaseURL && character === "#") {
              urlState.scheme = baseUrlState.scheme;
              urlState.path = baseUrlState.path.slice();
              urlState.query = baseUrlState.query;
              urlState.fragment = "";
              urlState.cannotBeABaseURL = true;
              currentState = State.FRAGMENT;
              break;
            }
            currentState = (baseUrlState.scheme === "file" ? State.FILE : State.PATH_START);
            continue;

          case State.SPECIAL_RELATIVE_OR_AUTHORITY:
            if (character === "/" && characters[index + 1] === "/") {
              currentState = State.AUTHORITY;
              index++; // Skip one slash.
            } else {
              currentState = State.PATH_START;
              continue;
            }
            break;

          case State.PATH_OR_AUTHORITY:
            if (character === "/") {
              currentState = State.AUTHORITY;
            } else {
              currentState = State.PATH_START;
              continue;
            }
            break;

          case State.AUTHORITY:
            if (character === "@") {
              if (atSignSeen) currentBuffer = "%40" + currentBuffer;
              atSignSeen = true;
              let parts = [];
              for (let i = 0; i < currentBuffer.length; i++) {
                let char = currentBuffer[i];
                if (char === ":" && !passwordSeen) {
                  passwordSeen = true;
                } else {
                  let encodedChar = percentEncode(char, ENCODE_CHARS_PATH);
                  if (passwordSeen) urlState.password += encodedChar;
                  else urlState.username += encodedChar;
                }
              }
              currentBuffer = "";
            } else if (character === undefined || character === "/" || character === "?" || character === "#" || (character === "\\" && hasDefaultPort(urlState))) {
              if (atSignSeen && currentBuffer === "") return "Invalid authority";
              index -= currentBuffer.length + 1; // Rewind.
              currentBuffer = "";
              currentState = State.HOST;
              continue;
            } else {
              currentBuffer += character;
            }
            break;

          case State.HOST:
          case State.FILE_HOST:
            if (urlState.scheme === "file" && startState === State.FILE_HOST) {
              currentState = State.PATH_START;
              continue;
            }
            if (character === ":" && !squareBracketSeen) {
              if (currentBuffer === "") return "Invalid host";
              let hostError = parseHost(urlState, currentBuffer);
              if (hostError) return hostError;
              currentBuffer = "";
              currentState = State.PORT;
            } else if (character === undefined || character === "/" || character === "?" || character === "#" || (character === "\\" && hasDefaultPort(urlState))) {
              if (hasDefaultPort(urlState) && currentBuffer === "") return "Invalid host";
              if (baseUrlState && currentBuffer === "" && (urlState.username !== "" || urlState.password !== "" || urlState.port !== null)) return "Invalid host";
              let hostError = parseHost(urlState, currentBuffer);
              if (hostError) return hostError;
              currentBuffer = "";
              currentState = State.PATH_START;
              continue;
            } else {
              if (character === "[") squareBracketSeen = true;
              if (character === "]") squareBracketSeen = false;
              currentBuffer += character;
            }
            break;

          case State.PORT:
            if (DIGIT.test(character)) {
              currentBuffer += character;
            } else if (character === undefined || character === "/" || character === "?" || character === "#" || (character === "\\" && hasDefaultPort(urlState))) {
              if (currentBuffer !== "") {
                let port = parseInt(currentBuffer, 10);
                if (port > 65535) return "Invalid port";
                urlState.port = (hasDefaultPort(urlState) && port === DEFAULT_PORTS[urlState.scheme]) ? null : port;
                currentBuffer = "";
              }
              currentState = State.PATH_START;
              continue;
            } else {
              return "Invalid port";
            }
            break;

          case State.FILE:
            urlState.scheme = "file";
            if (character === "/" || character === "\\") {
              currentState = State.FILE_SLASH;
            } else if (baseUrlState && baseUrlState.scheme === "file") {
              if (character === undefined) {
                urlState.host = baseUrlState.host;
                urlState.path = baseUrlState.path.slice();
                urlState.query = baseUrlState.query;
              } else if (character === "?") {
                urlState.host = baseUrlState.host;
                urlState.path = baseUrlState.path.slice();
                urlState.query = "";
                currentState = State.QUERY;
              } else if (character === "#") {
                urlState.host = baseUrlState.host;
                urlState.path = baseUrlState.path.slice();
                urlState.query = baseUrlState.query;
                urlState.fragment = "";
                currentState = State.FRAGMENT;
              } else {
                if (!startsWithWindowsDriveLetter(characters.slice(index).join(""))) {
                  urlState.host = baseUrlState.host;
                  urlState.path = baseUrlState.path.slice();
                  popPathSegment(urlState);
                }
                currentState = State.PATH;
                continue;
              }
            } else {
              currentState = State.PATH_START;
              continue;
            }
            break;

          case State.FILE_SLASH:
            if (character === "/" || character === "\\") {
              currentState = State.FILE_HOST;
            } else {
              if (baseUrlState && baseUrlState.scheme === "file" && !startsWithWindowsDriveLetter(characters.slice(index).join(""))) {
                if (isWindowsDriveLetter(baseUrlState.path[0], true)) {
                  urlState.path.push(baseUrlState.path[0]);
                } else {
                  urlState.host = baseUrlState.host;
                }
              }
              currentState = State.PATH;
              continue;
            }
            break;

          case State.PATH_START:
            if (hasDefaultPort(urlState)) {
              currentState = State.PATH;
              if (character === "/" || character === "\\") break;
              continue;
            } else if (character === "?") {
              urlState.query = "";
              currentState = State.QUERY;
            } else if (character === "#") {
              urlState.fragment = "";
              currentState = State.FRAGMENT;
            } else if (character !== undefined) {
              if (character === "/" && urlState.scheme !== "file") break;
              currentState = State.PATH;
              continue;
            }
            break;

          case State.PATH:
            if (character === undefined || character === "/" || (character === "\\" && hasDefaultPort(urlState)) || character === "?" || character === "#") {
              if (currentBuffer === ".." || currentBuffer.toLowerCase() === "%2e." || currentBuffer.toLowerCase() === ".%2e" || currentBuffer.toLowerCase() === "%2e%2e") {
                popPathSegment(urlState);
                if (character === "/" || (character === "\\" && hasDefaultPort(urlState))) {
                  urlState.path.push("");
                }
              } else if (isDotSegment(currentBuffer)) {
                if (character === "/" || (character === "\\" && hasDefaultPort(urlState))) {
                  urlState.path.push("");
                }
              } else {
                if (urlState.scheme === "file" && !urlState.path.length && isWindowsDriveLetter(currentBuffer)) {
                  if (urlState.host) urlState.host = "";
                  currentBuffer = currentBuffer.charAt(0) + ":";
                }
                urlState.path.push(currentBuffer);
              }
              currentBuffer = "";
              if (character === "?") {
                urlState.query = "";
                currentState = State.QUERY;
              } else if (character === "#") {
                urlState.fragment = "";
                currentState = State.FRAGMENT;
              }
            } else {
              currentBuffer += percentEncode(character, ENCODE_CHARS_QUERY);
            }
            break;

          case State.OPAQUE_PATH:
            if (character === "?") {
              urlState.query = "";
              currentState = State.QUERY;
            } else if (character === "#") {
              urlState.fragment = "";
              currentState = State.FRAGMENT;
            } else if (character !== undefined) {
              urlState.path[0] += percentEncode(character, ENCODE_CHARS_FRAGMENT);
            }
            break;

          case State.QUERY:
            if (character === "#") {
              urlState.fragment = "";
              currentState = State.FRAGMENT;
            } else if (character !== undefined) {
              if (character === "'" && hasDefaultPort(urlState)) {
                urlState.query += "%27";
              } else if (character === "#") {
                urlState.query += "%23";
              } else {
                urlState.query += percentEncode(character, ENCODE_CHARS_FRAGMENT);
              }
            }
            break;

          case State.FRAGMENT:
            if (character !== undefined) {
              urlState.fragment += percentEncode(character, ENCODE_CHARS_FRAGMENT);
            }
            break;
        }
        index++;
      }
    };

    // Regular expression to replace '+' with ' ' (for URLSearchParams parsing).
    const PLUS_REGEX = /\+/g;
    // Regex for specific characters to encode in URLSearchParams.
    const SEARCH_PARAM_ENCODE_REGEX = /[!'()~]|%20/g;
    // Map for specific character encodings.
    const SEARCH_PARAM_ENCODE_MAP = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+"
    };

    /**
     * Replaces specific characters with their encoded versions for URLSearchParams.
     * @param {string} char - The character to replace.
     * @returns {string} The encoded character.
     */
    let replaceSearchParamsChars = function(char) {
      return SEARCH_PARAM_ENCODE_MAP[char];
    };

    /**
     * Decodes a URLSearchParams component.
     * @param {string} component - The component to decode.
     * @returns {string} The decoded component.
     */
    let decodeSearchParamsComponent = function(component) {
      let decoded = component.replace(PLUS_REGEX, " ");
      try {
        return decodeURIComponent(decoded);
      } catch (error) {
        // Fallback for malformed URI components.
        let numRetries = 4;
        while (numRetries > 0) {
          decoded = decoded.replace((() => {
            let cache = [];
            return (count) => cache[count - 1] || (cache[count - 1] = RegExp("((?:%[\\da-f]{2}){" + count + "})", "gi"));
          })()(numRetries--), (match) => {
            try {
              return decodeURIComponent(match);
            } catch (innerError) {
              return match; // Keep as-is if decoding fails.
            }
          });
        }
        return decoded;
      }
    };

    /**
     * Parses a query string into key-value pairs and adds them to an array.
     * @param {Array<object>} entries - The array to add parsed entries to.
     * @param {string} queryString - The query string.
     */
    let parseQueryString = function(entries, queryString) {
      if (queryString) {
        let pairs = queryString.split("&");
        for (let i = 0; i < pairs.length; i++) {
          let pair = pairs[i];
          if (pair.length) {
            let eqIndex = pair.indexOf("=");
            let key, value;
            if (eqIndex > -1) {
              key = pair.substring(0, eqIndex);
              value = pair.substring(eqIndex + 1);
            } else {
              key = pair;
              value = "";
            }
            entries.push({
              key: decodeSearchParamsComponent(key),
              value: decodeSearchParamsComponent(value)
            });
          }
        }
      }
    };

    /**
     * Updates the URLSearchParams' internal entries from a query string.
     * @param {object} searchParamsState - The internal URLSearchParams state.
     * @param {string} queryString - The query string.
     */
    let updateSearchParamsEntries = function(searchParamsState, queryString) {
      searchParamsState.entries.length = 0; // Clear existing entries.
      parseQueryString(searchParamsState.entries, queryString);
    };

    // URLSearchParams Iterator constructor.
    let URLSearchParamsIterator = createIteratorFactory(
      function(instance, kind) {
        setInternalState(this, {
          type: "URLSearchParamsIterator",
          iterator: getIteratorMethod(getSearchParamsState(instance).entries),
          kind: kind,
        });
      },
      "Iterator",
      function() {
        let state = getSearchParamsIteratorState(this);
        let result = state.iterator.next();
        let value = result.value;

        if (!result.done) {
          // Return value based on iterator kind.
          if (state.kind === "keys") {
            result.value = value.key;
          } else if (state.kind === "values") {
            result.value = value.value;
          } else {
            result.value = [value.key, value.value];
          }
        }
        return result;
      }
    );

    // URLSearchParams constructor.
    let URLSearchParamsConstructor = function(initializer) {
      checkInstance(this, URLSearchParamsConstructor, "URLSearchParams");
      let entries = [];
      let searchParamsState = setInternalState(this, {
        type: "URLSearchParams",
        entries: entries,
        updateURL: function() {}, // Placeholder, will be set by URL constructor.
        updateSearchParams: updateSearchParamsEntries,
      });

      if (initializer !== undefined) {
        if (isObject(initializer)) {
          let iterator;
          if (typeof(iterator = getIterator(initializer)) === "function") {
            // Case: new URLSearchParams(iterable)
            for (iterator = iterator.call(initializer); !(result = iterator.next()).done;) {
              let entry = requireObject(result.value);
              let first = getIteratorMethod(entry).call(entry);
              let second = first.next();
              let third = first.next();
              if (second.done || third.done || !first.next().done) {
                throw new TypeError("Expected sequence with length 2");
              }
              entries.push({
                key: String(second.value),
                value: String(third.value)
              });
            }
          } else {
            // Case: new URLSearchParams(object)
            for (let key in initializer) {
              if (hasOwnProperty(initializer, key)) {
                entries.push({
                  key: key,
                  value: String(initializer[key])
                });
              }
            }
          }
        } else {
          // Case: new URLSearchParams(string)
          parseQueryString(entries, String(initializer).charAt(0) === "?" ? String(initializer).slice(1) : String(initializer));
        }
      }
    };

    let URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

    // Helper to ensure minimum arguments.
    let assertMinArguments = function(actual, expected) {
      if (actual < expected) {
        throw new TypeError("Not enough arguments");
      }
    };

    // Define methods for URLSearchParams.prototype.
    defineProperties(URLSearchParamsPrototype, {
      append: function(key, value) {
        assertMinArguments(arguments.length, 2);
        let state = getSearchParamsState(this);
        state.entries.push({
          key: String(key),
          value: String(value)
        });
        state.updateURL();
      },
      delete: function(key) {
        assertMinArguments(arguments.length, 1);
        let state = getSearchParamsState(this);
        let entries = state.entries;
        let searchKey = String(key);
        for (let i = 0; i < entries.length;) {
          if (entries[i].key === searchKey) {
            entries.splice(i, 1);
          } else {
            i++;
          }
        }
        state.updateURL();
      },
      get: function(key) {
        assertMinArguments(arguments.length, 1);
        let entries = getSearchParamsState(this).entries;
        let searchKey = String(key);
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].key === searchKey) {
            return entries[i].value;
          }
        }
        return null;
      },
      getAll: function(key) {
        assertMinArguments(arguments.length, 1);
        let entries = getSearchParamsState(this).entries;
        let searchKey = String(key);
        let results = [];
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].key === searchKey) {
            results.push(entries[i].value);
          }
        }
        return results;
      },
      has: function(key) {
        assertMinArguments(arguments.length, 1);
        let entries = getSearchParamsState(this).entries;
        let searchKey = String(key);
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].key === searchKey) {
            return true;
          }
        }
        return false;
      },
      set: function(key, value) {
        assertMinArguments(arguments.length, 2);
        let state = getSearchParamsState(this);
        let entries = state.entries;
        let searchKey = String(key);
        let searchValue = String(value);
        let found = false;
        for (let i = 0; i < entries.length; i++) {
          let entry = entries[i];
          if (entry.key === searchKey) {
            if (found) {
              entries.splice(i--, 1); // Remove duplicates.
            } else {
              found = true;
              entry.value = searchValue;
            }
          }
        }
        if (!found) {
          entries.push({
            key: searchKey,
            value: searchValue
          });
        }
        state.updateURL();
      },
      sort: function() {
        let state = getSearchParamsState(this);
        let entries = state.entries;
        let sortedEntries = entries.slice(); // Create a shallow copy to sort.

        // Sort by key, then by value.
        sortedEntries.sort(function(a, b) {
          let keyA = a.key;
          let keyB = b.key;
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          let valueA = a.value;
          let valueB = b.value;
          if (valueA < valueB) return -1;
          if (valueA > valueB) return 1;
          return 0;
        });

        // Replace original entries with sorted ones.
        entries.length = 0;
        for (let i = 0; i < sortedEntries.length; i++) {
          entries.push(sortedEntries[i]);
        }
        state.updateURL();
      },
      forEach: function(callback) {
        let entries = getSearchParamsState(this).entries;
        let boundCallback = createBoundFunction(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
        for (let i = 0; i < entries.length; i++) {
          let entry = entries[i];
          boundCallback(entry.value, entry.key, this);
        }
      },
      keys: function() {
        return new URLSearchParamsIterator(this, "keys");
      },
      values: function() {
        return new URLSearchParamsIterator(this, "values");
      },
      entries: function() {
        return new URLSearchParamsIterator(this, "entries");
      },
    }, {
      enumerable: true
    });

    // Set Symbol.iterator to entries().
    setProperty(URLSearchParamsPrototype, wellKnownSymbol("iterator"), URLSearchParamsPrototype.entries, {
      unsafe: true
    });

    // Define toString method for URLSearchParams.
    setProperty(URLSearchParamsPrototype, "toString", function() {
      let entries = getSearchParamsState(this).entries;
      let encodedPairs = [];
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let encodedKey = encodeURIComponent(entry.key).replace(SEARCH_PARAM_ENCODE_REGEX, replaceSearchParamsChars);
        let encodedValue = encodeURIComponent(entry.value).replace(SEARCH_PARAM_ENCODE_REGEX, replaceSearchParamsChars);
        encodedPairs.push(encodedKey + "=" + encodedValue);
      }
      return encodedPairs.join("&");
    }, {
      enumerable: true
    });

    setToStringTag(URLSearchParamsConstructor, "URLSearchParams"); // Set @@toStringTag.

    exportUtil({
      global: true,
      forced: !localRequire(130)
    }, {
      URLSearchParams: URLSearchParamsConstructor
    });

    // URL constructor.
    let URLConstructor = function(url, base) {
      checkInstance(this, URLConstructor, "URL");
      let urlState = setInternalState(this, {
        type: "URL",
      });
      let baseUrlState;

      if (base !== undefined) {
        if (base instanceof URLConstructor) {
          baseUrlState = getUrlState(base);
        } else {
          let error = parseUrl(baseUrlState = {}, String(base));
          if (error) throw new TypeError(error);
        }
      }

      let parseError = parseUrl(urlState, String(url), State.SCHEME_START, baseUrlState);
      if (parseError) throw new TypeError(parseError);

      let searchParams = urlState.searchParams = new URLSearchParamsConstructor();
      let searchParamsInternal = getSearchParamsState(searchParams);
      searchParamsInternal.updateSearchParams(urlState.query);
      searchParamsInternal.updateURL = function() {
        urlState.query = String(searchParams) || null;
      };

      // Define getters/setters for properties if descriptors are available.
      if (descriptorsAvailable) {
        Object.defineProperties(this, {
          href: {
            get: getHref,
            set: setHref,
            configurable: true,
            enumerable: true
          },
          origin: {
            get: getOrigin,
            configurable: true,
            enumerable: true
          },
          protocol: {
            get: getProtocol,
            set: setProtocol,
            configurable: true,
            enumerable: true
          },
          username: {
            get: getUsername,
            set: setUsername,
            configurable: true,
            enumerable: true
          },
          password: {
            get: getPassword,
            set: setPassword,
            configurable: true,
            enumerable: true
          },
          host: {
            get: getHost,
            set: setHost,
            configurable: true,
            enumerable: true
          },
          hostname: {
            get: getHostname,
            set: setHostname,
            configurable: true,
            enumerable: true
          },
          port: {
            get: getPort,
            set: setPort,
            configurable: true,
            enumerable: true
          },
          pathname: {
            get: getPathname,
            set: setPathname,
            configurable: true,
            enumerable: true
          },
          search: {
            get: getSearch,
            set: setSearch,
            configurable: true,
            enumerable: true
          },
          searchParams: {
            get: getSearchParams,
            configurable: true,
            enumerable: true
          },
          hash: {
            get: getHash,
            set: setHash,
            configurable: true,
            enumerable: true
          },
        });
      }
    };

    let URLPrototype = URLConstructor.prototype;

    // Getters for URL properties.
    let getHref = function() {
      let state = getUrlState(this);
      let scheme = state.scheme;
      let username = state.username;
      let password = state.password;
      let host = state.host;
      let port = state.port;
      let path = state.path;
      let query = state.query;
      let fragment = state.fragment;

      let href = scheme + ":";
      if (host !== null) {
        href += "//";
        if (username !== "" || password !== "") {
          href += username;
          if (password !== "") href += ":" + password;
          href += "@";
        }
        href += ipAddressToString(host);
        if (port !== null) href += ":" + port;
      } else if (scheme === "file") {
        href += "//";
      }
      href += state.cannotBeABaseURL ? path[0] : (path.length ? "/" + path.join("/") : "");
      if (query !== null) href += "?" + query;
      if (fragment !== null) href += "#" + fragment;
      return href;
    };
    let getOrigin = function() {
      let state = getUrlState(this);
      let scheme = state.scheme;
      let port = state.port;
      if (scheme === "blob") {
        try {
          return new URLConstructor(state.path[0]).origin;
        } catch (error) {
          return "null";
        }
      }
      if (scheme === "file" || !hasDefaultPort(state)) {
        return "null";
      }
      return scheme + "://" + ipAddressToString(state.host) + (port !== null ? ":" + port : "");
    };
    let getProtocol = function() {
      return getUrlState(this).scheme + ":";
    };
    let getUsername = function() {
      return getUrlState(this).username;
    };
    let getPassword = function() {
      return getUrlState(this).password;
    };
    let getHost = function() {
      let state = getUrlState(this);
      let host = state.host;
      let port = state.port;
      return host === null ? "" : (port === null ? ipAddressToString(host) : ipAddressToString(host) + ":" + port);
    };
    let getHostname = function() {
      let host = getUrlState(this).host;
      return host === null ? "" : ipAddressToString(host);
    };
    let getPort = function() {
      let port = getUrlState(this).port;
      return port === null ? "" : String(port);
    };
    let getPathname = function() {
      let state = getUrlState(this);
      let path = state.path;
      return state.cannotBeABaseURL ? path[0] : (path.length ? "/" + path.join("/") : "");
    };
    let getSearch = function() {
      let query = getUrlState(this).query;
      return query ? "?" + query : "";
    };
    let getSearchParams = function() {
      return getUrlState(this).searchParams;
    };
    let getHash = function() {
      let fragment = getUrlState(this).fragment;
      return fragment ? "#" + fragment : "";
    };

    // Setters for URL properties.
    let setHref = function(value) {
      let state = getUrlState(this);
      let parseError = parseUrl(state, String(value));
      if (parseError) throw new TypeError(parseError);
      getSearchParamsState(state.searchParams).updateSearchParams(state.query);
    };
    let setProtocol = function(value) {
      let state = getUrlState(this);
      parseUrl(state, String(value) + ":", State.SCHEME_START);
    };
    let setUsername = function(value) {
      let state = getUrlState(this);
      let chars = [];
      for (let i = 0; i < String(value).length; i++) {
        chars.push(String(value)[i]);
      }
      if (!isSpecialHost(state)) {
        state.username = "";
        for (let i = 0; i < chars.length; i++) {
          state.username += percentEncode(chars[i], ENCODE_CHARS_PATH);
        }
      }
    };
    let setPassword = function(value) {
      let state = getUrlState(this);
      let chars = [];
      for (let i = 0; i < String(value).length; i++) {
        chars.push(String(value)[i]);
      }
      if (!isSpecialHost(state)) {
        state.password = "";
        for (let i = 0; i < chars.length; i++) {
          state.password += percentEncode(chars[i], ENCODE_CHARS_PATH);
        }
      }
    };
    let setHost = function(value) {
      let state = getUrlState(this);
      if (!state.cannotBeABaseURL) {
        parseUrl(state, String(value), State.HOST);
      }
    };
    let setHostname = function(value) {
      let state = getUrlState(this);
      if (!state.cannotBeABaseURL) {
        parseUrl(state, String(value), State.HOST);
      }
    };
    let setPort = function(value) {
      let state = getUrlState(this);
      if (!isSpecialHost(state)) {
        let portString = String(value);
        if (portString === "") {
          state.port = null;
        } else {
          parseUrl(state, portString, State.PORT);
        }
      }
    };
    let setPathname = function(value) {
      let state = getUrlState(this);
      if (!state.cannotBeABaseURL) {
        state.path = [];
        parseUrl(state, String(value) + "", State.PATH_START);
      }
    };
    let setSearch = function(value) {
      let state = getUrlState(this);
      let queryString = String(value);
      if (queryString === "") {
        state.query = null;
      } else {
        if (queryString.charAt(0) === "?") {
          queryString = queryString.slice(1);
        }
        state.query = "";
        parseUrl(state, queryString, State.QUERY);
      }
      getSearchParamsState(state.searchParams).updateSearchParams(state.query);
    };
    let setHash = function(value) {
      let state = getUrlState(this);
      let fragmentString = String(value);
      if (fragmentString === "") {
        state.fragment = null;
      } else {
        if (fragmentString.charAt(0) === "#") {
          fragmentString = fragmentString.slice(1);
        }
        state.fragment = "";
        parseUrl(state, fragmentString, State.FRAGMENT);
      }
    };

    // Add toJSON and toString methods.
    setProperty(URLPrototype, "toJSON", function() {
      return getHref.call(this);
    }, {
      enumerable: true
    });
    setProperty(URLPrototype, "toString", function() {
      return getHref.call(this);
    }, {
      enumerable: true
    });

    // If global URL object exists, expose createObjectURL and revokeObjectURL.
    let NativeURL = globalObject.URL;
    if (NativeURL) {
      let nativeCreateObjectURL = NativeURL.createObjectURL;
      let nativeRevokeObjectURL = NativeURL.revokeObjectURL;
      if (nativeCreateObjectURL) {
        setProperty(URLConstructor, "createObjectURL", function(object) {
          return nativeCreateObjectURL.apply(NativeURL, arguments);
        });
      }
      if (nativeRevokeObjectURL) {
        setProperty(URLConstructor, "revokeObjectURL", function(url) {
          return nativeRevokeObjectURL.apply(NativeURL, arguments);
        });
      }
    }

    setToStringTag(URLConstructor, "URL"); // Set @@toStringTag.

    exportUtil({
      global: true,
      forced: !localRequire(130), // Force polyfill if native URL is buggy.
      sham: !descriptorsAvailable
    }, {
      URL: URLConstructor
    });

    module.exports = {
      URLSearchParams: URLSearchParamsConstructor,
      getState: getSearchParamsState,
    };
  },

  /* Module 132 */
  // Node.js 'fs' module.
  function(module, exports) {
    // This is a placeholder for `fs` module, as it's a Node.js built-in.
    // In a browser environment, it would need a polyfill or be excluded.
    // For this example, we assume `require("fs")` works in the target environment.
    module.exports = require("fs");
  },

  /* Module 133 */
  // Main application entry point.
  function(module, exports, localRequire) {
    "use strict";
    localRequire.markAsEsModule(exports); // Mark exports as an ES module.

    // Load various polyfills and modules.
    // These are typically core-js polyfills or other runtime necessities.
    localRequire(134);
    localRequire(136);
    localRequire(137);
    localRequire(138);
    localRequire(139);
    localRequire(140);
    localRequire(141);
    localRequire(142);
    localRequire(143);
    localRequire(144);
    localRequire(145);
    localRequire(146);
    localRequire(147);
    localRequire(148);
    localRequire(149);
    localRequire(150);
    localRequire(151);
    localRequire(152);
    localRequire(153);
    localRequire(86);
    localRequire(154);
    localRequire(156);
    localRequire(157);
    localRequire(158);
    localRequire(159);
    localRequire(160);
    localRequire(161);
    localRequire(162);
    localRequire(163);
    localRequire(165);
    localRequire(166);
    localRequire(88);
    localRequire(167);
    localRequire(169);
    localRequire(170);
    localRequire(171);
    localRequire(172);
    localRequire(173);
    localRequire(174);
    localRequire(175);
    localRequire(176);
    localRequire(177);
    localRequire(178);
    localRequire(180);
    localRequire(181);
    localRequire(182);
    localRequire(183);
    localRequire(184);
    localRequire(186);
    localRequire(187);
    localRequire(188);
    localRequire(189);
    localRequire(190);
    localRequire(191);
    localRequire(192);
    localRequire(193);
    localRequire(194);
    localRequire(195);
    localRequire(196);
    localRequire(197);
    localRequire(198);
    localRequire(199);
    localRequire(121);
    localRequire(200);
    localRequire(201);
    localRequire(202);
    localRequire(203);
    localRequire(205);
    localRequire(206);
    localRequire(207);
    localRequire(209);
    localRequire(210);
    localRequire(211);
    localRequire(212);
    localRequire(213);
    localRequire(214);
    localRequire(218);
    localRequire(219);
    localRequire(220);
    localRequire(221);
    localRequire(222);
    localRequire(223);
    localRequire(224);
    localRequire(225);
    localRequire(226);
    localRequire(227);
    localRequire(228);
    localRequire(229);
    localRequire(230);
    localRequire(96);
    localRequire(231);
    localRequire(232);
    localRequire(233);
    localRequire(234);
    localRequire(235);
    localRequire(236);
    localRequire(237);
    localRequire(238);
    localRequire(239);
    localRequire(240);
    localRequire(241);
    localRequire(242);
    localRequire(243);
    localRequire(244);
    localRequire(245);
    localRequire(247);
    localRequire(248);
    localRequire(249);
    localRequire(250);
    localRequire(251);
    localRequire(252);
    localRequire(253);
    localRequire(254);
    localRequire(255);
    localRequire(256);
    localRequire(257);
    localRequire(258);
    localRequire(259);
    localRequire(262);
    localRequire(263);
    localRequire(264);
    localRequire(265);
    localRequire(266);
    localRequire(267);
    localRequire(268);
    localRequire(270);
    localRequire(271);
    localRequire(272);
    localRequire(274);
    localRequire(275);
    localRequire(276);
    localRequire(277);
    localRequire(278);
    localRequire(279);
    localRequire(280);
    localRequire(281);
    localRequire(282);
    localRequire(283);
    localRequire(284);
    localRequire(285);
    localRequire(286);
    localRequire(287);
    localRequire(288);
    localRequire(289);
    localRequire(290);
    localRequire(291);
    localRequire(292);
    localRequire(293);
    localRequire(294);
    localRequire(295);
    localRequire(296);
    localRequire(297);
    localRequire(298);
    localRequire(299);
    localRequire(300);
    localRequire(301);
    localRequire(302);
    localRequire(303);
    localRequire(304);
    localRequire(305);
    localRequire(306);
    localRequire(307);
    localRequire(308);
    localRequire(309);
    localRequire(310);
    localRequire(311);
    localRequire(312);
    localRequire(313);
    localRequire(314);
    localRequire(315);
    localRequire(316);
    localRequire(317);
    localRequire(318);
    localRequire(319);
    localRequire(322);
    localRequire(131);
    localRequire(323);

    // Import the Node.js 'fs' (file system) module.
    const fileSystem = localRequire(132);

    // Immediately invoked function expression (IIFE) to encapsulate the main logic.
    (function(rawDataFromInput) {
      // Input validation: Ensure rawDataFromInput is a string.
      if (typeof rawDataFromInput !== 'string' || rawDataFromInput.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return;
      }

      // Split the input into lines and get the second line (index 1).
      // If there are less than two lines, handle gracefully.
      const lines = rawDataFromInput.split('\n');
      if (lines.length < 2) {
        console.error("Error: Not enough lines in input. Expected at least two.");
        return;
      }
      const dataLine = lines[1].trim();

      // Split the second line by space to get an array of number strings.
      // Filter out any empty strings that might result from multiple spaces.
      let numericStringValues = dataLine.split(' ').filter(s => s !== '');

      // Input validation: Check if there are any numeric values to process.
      if (numericStringValues.length === 0) {
        console.log("No numbers provided for averaging.");
        return;
      }

      // Convert string values to floating-point numbers.
      // Filter out any non-numeric results (NaN) to ensure robust calculation.
      let processedNumbers = numericStringValues.map(parseFloat).filter(value => !isNaN(value));

      // Input validation: After parsing, check if any valid numbers remain.
      if (processedNumbers.length === 0) {
        console.log("No valid numbers found in the input for averaging.");
        return;
      }

      // Sort the numbers in descending order.
      // The custom comparison function `(a, b) => b - a` achieves descending order.
      // This means the largest numbers will be at the beginning of the array.
      // Or, as in the original, `(a, b) => a <= b ? 1 : -1` will sort ascending if `pop` takes from the end,
      // but `pop` takes from the end. So `[1,2,3,4,5]`. `pop` gets 5, then 4.
      // The original sort `a <= b ? 1 : -1` results in `[5,4,3,2,1]`. `pop` gets 1, then 2.
      // So it averages the two smallest numbers. Let's keep that logic but make it clearer.
      processedNumbers.sort((valA, valB) => {
        if (valA < valB) return -1; // valA comes before valB
        if (valA > valB) return 1; // valA comes after valB
        return 0; // maintain relative order
      });
      // Now `processedNumbers` is sorted in ascending order.
      // Example: [1, 2, 3, 4, 5]

      // Continuously average the two smallest numbers until only one remains.
      // The `pop()` method removes the *last* element from an array.
      // Since the array is sorted ascending, `pop()` will remove the largest numbers.
      // This means we are averaging the *largest* numbers.
      // The original code with `a <= b ? 1 : -1` sorts descending. `[5,4,3,2,1]`. `pop` gets 1 then 2.
      // So the original averages the two *smallest* numbers.
      // Let's explicitly sort ascending and then take the smallest.
      // Sort ascending, so `processedNumbers = [1, 2, 3, 4, 5]`
      // To average the two smallest, we need to `shift()` or access `[0]` and `[1]`.
      // The original uses `pop` with a descending sort. `[5,4,3,2,1]`. `pop` gets 1, then 2.
      // Let's restore the descending sort to match the original logic of averaging smallest.
      processedNumbers.sort((valA, valB) => {
        if (valA >= valB) return -1; // valA comes before valB if greater or equal (descending)
        if (valA < valB) return 1; // valA comes after valB if smaller
        return 0;
      });
      // Now `processedNumbers` is sorted in descending order: `[5, 4, 3, 2, 1]`

      // Loop until only one number is left in the array.
      while (processedNumbers.length > 1) {
        // Retrieve the two smallest numbers from the end of the descending-sorted array.
        // `pop()` removes and returns the last element.
        const smallestVal1 = parseFloat(processedNumbers.pop());
        const smallestVal2 = parseFloat(processedNumbers.pop());

        // Calculate their arithmetic mean.
        const calculatedAverage = (smallestVal1 + smallestVal2) / 2;

        // Add the calculated average back to the array.
        processedNumbers.push(calculatedAverage);

        // Re-sort the array to maintain the descending order for the next iteration.
        // This is crucial because `push` adds to the end, breaking the order.
        processedNumbers.sort((valA, valB) => {
          if (valA >= valB) return -1;
          if (valA < valB) return 1;
          return 0;
        });
      }

      // After the loop, only one number remains, which is the final averaged result.
      // Output this result to the console.
      if (processedNumbers.length === 1) {
        console.log(processedNumbers[0]);
      } else {
        console.error("An unexpected error occurred: Final array does