(function(allModuleDefinitions) {
  // A lookup table to cache already loaded modules.
  const loadedModuleCache = {};

  /**
   * The core module loading and resolution function.
   * @param {number} requestedModuleId - The unique identifier of the module to retrieve.
   * @returns {object} The exports object of the requested module.
   */
  function webpackModuleLoader(requestedModuleId) {
    // Check if the module is already in our cache. If so, return its exports immediately.
    if (Reflect.has(loadedModuleCache, requestedModuleId)) {
      return loadedModuleCache[requestedModuleId].exports;
    }

    // If not cached, prepare a new module object.
    const currentModuleInstance = loadedModuleCache[requestedModuleId] = {
      // Store the module's ID for debugging/tracking.
      id: requestedModuleId,
      // A flag indicating if the module has finished loading and executing.
      isLoaded: false,
      // The object that will hold all exports from this module.
      exports: {}
    };

    // Execute the module's definition function.
    // The 'this' context is set to currentModuleInstance.exports.
    // Arguments passed are: module, module.exports, and the loader function itself.
    Reflect.apply(
      allModuleDefinitions[requestedModuleId],
      currentModuleInstance.exports, // 'this' context for the module function
      [currentModuleInstance, currentModuleInstance.exports, webpackModuleLoader]
    );

    // After execution, mark the module as fully loaded.
    currentModuleInstance.isLoaded = true;

    // Return the populated exports object.
    return currentModuleInstance.exports;
  }

  // Attach module definitions and the cache to the loader for potential external access or introspection.
  webpackModuleLoader.moduleDefinitions = allModuleDefinitions;
  webpackModuleLoader.moduleCache = loadedModuleCache;

  /**
   * Defines a getter property on an object, ensuring it's enumerable.
   * This is used to expose module exports lazily.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} propertyGetter - The function to call when the property is accessed.
   */
  webpackModuleLoader.addExportGetter = function(targetObject, propertyName, propertyGetter) {
    // Only define the property if it doesn't already exist on the target object.
    const propertyExists = Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    if (propertyExists === false) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // The property should appear during enumeration (e.g., in for...in loops).
        get: propertyGetter // The function to retrieve the property's value.
      });
    }
  };

  /**
   * Marks a module's exports object as an ECMAScript Module (ESM).
   * This adds the `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} moduleExportsObject - The exports object to mark.
   */
  webpackModuleLoader.markAsEsModule = function(moduleExportsObject) {
    // If the Symbol global object exists and Symbol.toStringTag is supported,
    // define it for better module identification.
    const hasSymbolToStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag !== undefined;
    if (hasSymbolToStringTag) {
      Object.defineProperty(moduleExportsObject, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    // Always set the __esModule flag to true to indicate it's an ES module.
    Object.defineProperty(moduleExportsObject, '__esModule', {
      value: true
    });
  };

  /**
   * Creates a synthetic namespace object for a module, handling different module types.
   * This is crucial for interoperability between CommonJS and ES Modules.
   * @param {any} sourceModule - The raw module source (can be an ID, an object, etc.).
   * @param {number} processingFlags - A bitmask controlling how the source module is processed.
   *   - Bit 1 (0x1): If set, `sourceModule` is a module ID and must be loaded first.
   *   - Bit 8 (0x8): If set, `sourceModule` is already a namespace object; return it directly.
   *   - Bit 4 (0x4): If set, `sourceModule` is an object and potentially an ES module (`__esModule` check).
   *   - Bit 2 (0x2): If set, copy all properties from `sourceModule` to the new namespace object.
   * @returns {object} A namespace object representing the module's exports.
   */
  webpackModuleLoader.createNamespaceObject = function(sourceModule, processingFlags) {
    let resolvedModuleContent = sourceModule;

    // Process flag 1: If sourceModule is an ID, load it.
    const shouldResolveById = (processingFlags & 1) === 1;
    if (shouldResolveById) {
      resolvedModuleContent = webpackModuleLoader(sourceModule);
    }

    // Process flag 8 or 4: If it's already a namespace or an ES module, return it directly.
    const isObjectLike = typeof resolvedModuleContent === 'object' && resolvedModuleContent !== null;
    const isAlreadyEsModule = isObjectLike && Reflect.has(resolvedModuleContent, '__esModule');
    const shouldReturnDirectly = ((processingFlags & 8) === 8) || (((processingFlags & 4) === 4) && isAlreadyEsModule);

    if (shouldReturnDirectly) {
      return resolvedModuleContent;
    }

    // Create a new plain object to serve as the namespace.
    const newModuleNamespace = Object.create(null);

    // Mark the newly created object as an ES Module.
    webpackModuleLoader.markAsEsModule(newModuleNamespace);

    // Define the 'default' export property.
    Object.defineProperty(newModuleNamespace, 'default', {
      enumerable: true,
      value: resolvedModuleContent
    });

    // Process flag 2: If enabled and source is not a string, copy its properties.
    const shouldCopyProperties = (processingFlags & 2) === 2;
    const isSourceModuleString = typeof resolvedModuleContent === 'string';
    if (shouldCopyProperties && !isSourceModuleString) {
      for (const propKey in resolvedModuleContent) {
        // Ensure that the property is truly owned by resolvedModuleContent and not inherited.
        if (Object.prototype.hasOwnProperty.call(resolvedModuleContent, propKey)) {
            // Define a getter for each property on the new namespace.
            // Using a closure to correctly capture `propKey`.
            webpackModuleLoader.addExportGetter(newModuleNamespace, propKey, (function(keyToGet) {
                return resolvedModuleContent[keyToGet];
            }).bind(null, propKey));
        }
      }
    }
    return newModuleNamespace;
  };

  /**
   * Creates a getter function to provide a default export for non-ES modules.
   * This helps in scenarios where CommonJS modules are imported as ES modules.
   * @param {object} rawModuleExports - The raw exports object from a module.
   * @returns {function} A function that returns the module's default export.
   */
  webpackModuleLoader.interopDefault = function(rawModuleExports) {
    const isEsModule = rawModuleExports && Reflect.has(rawModuleExports, '__esModule') && rawModuleExports.__esModule === true;

    // The function to return the default export.
    const interopFunction = isEsModule ?
      function() {
        return rawModuleExports.default;
      } :
      function() {
        return rawModuleExports;
      };

    // Define an 'a' property as a getter for the interopFunction itself, a common webpack pattern.
    webpackModuleLoader.addExportGetter(interopFunction, 'a', interopFunction);
    return interopFunction;
  };

  /**
   * A utility function to check if an object has a directly owned property.
   * @param {object} candidateObject - The object to inspect.
   * @param {string} propertyIdentifier - The name of the property to check for.
   * @returns {boolean} True if the property is directly on the object, false otherwise.
   */
  webpackModuleLoader.hasOwn = function(candidateObject, propertyIdentifier) {
    // Using Object.prototype.hasOwnProperty.call for robust checking, especially with `null` prototypes.
    return Object.prototype.hasOwnProperty.call(candidateObject, propertyIdentifier);
  };

  // The base path for loading additional assets, typically an empty string for relative paths.
  webpackModuleLoader.assetPublicPath = '';

  // Initiate the application by loading the designated startup module.
  const entryModuleId = 133;
  webpackModuleLoader(entryModuleId);
})(
  // The array of all module definition functions.
  [
    /* Module 0: Feature Polyfill Utility */
    function(moduleContext, moduleExports, localRequire) {
      // Dependencies for the polyfill utility.
      const globalObjectRef = localRequire(5); // Reference to the global object (window, global, etc.)
      const getDescriptorForProperty = localRequire(22).f; // Function to get a property descriptor.
      const assignProperty = localRequire(16); // Function to assign a value to a property.
      const defineObjectProperty = localRequire(23); // Function to robustly define a property.
      const ensureGlobalObject = localRequire(79); // Utility to ensure a global object exists.
      const mergeProperties = localRequire(100); // Utility to merge properties from source to target.
      const shouldPolyfillFeature = localRequire(62); // Evaluates if a specific feature needs polyfilling.

      /**
       * A utility function to conditionally polyfill or extend JavaScript features.
       * This function is designed to work with various environments and targets.
       * @param {object} config - Configuration for the feature extension.
       * @param {string} config.target - The name of the target object (e.g., 'Array', 'String', 'Object').
       * @param {boolean} config.global - If true, the target is the global object itself.
       * @param {boolean} config.stat - If true, the feature is a static method of the target.
       * @param {boolean} config.noTargetGet - If true, do not attempt to read the existing method directly.
       * @param {boolean} config.sham - If true, indicates the polyfill is a 'sham' (mimics native behavior).
       * @param {object} methodsToImplement - An object where keys are method names and values are implementation functions.
       */
      moduleContext.exports = function(config, methodsToImplement) {
        let currentTargetObject;
        let methodKey;
        let existingValue;
        let newValue;
        const isGlobalTarget = config.global;
        const isStaticTarget = config.stat;

        // Determine the actual object where the methods should be applied.
        if (isGlobalTarget) {
          currentTargetObject = globalObjectRef;
        } else if (isStaticTarget) {
          // For static methods, get the constructor or create a new global object if it doesn't exist.
          const targetConstructor = globalObjectRef[config.target];
          currentTargetObject = targetConstructor || ensureGlobalObject(config.target, {});
        } else {
          // For prototype methods, get the prototype of the target constructor.
          const targetPrototype = (globalObjectRef[config.target] || {}).prototype;
          currentTargetObject = targetPrototype;
        }

        // Validate that a target object was successfully identified before proceeding.
        const isTargetValid = currentTargetObject !== undefined && currentTargetObject !== null;
        if (!isTargetValid) {
            console.warn(`Polyfill target '${config.target}' not found or invalid. Skipping.`);
            return;
        }

        // Iterate over each method provided for implementation.
        for (methodKey in methodsToImplement) {
          newValue = methodsToImplement[methodKey];

          // Attempt to retrieve the existing method's value or its descriptor.
          if (config.noTargetGet) {
            const descriptor = getDescriptorForProperty(currentTargetObject, methodKey);
            existingValue = descriptor ? descriptor.value : undefined;
          } else {
            existingValue = currentTargetObject[methodKey];
          }

          // Construct the full scope key for polyfill checking.
          const scopePrefix = isGlobalTarget ? '' : config.target + (isStaticTarget ? '.' : '#');
          const fullScopeKey = scopePrefix + methodKey;

          // Determine if a forced update is required or if the existing method is incompatible.
          const updateIsForced = shouldPolyfillFeature(fullScopeKey, config.forced);
          const existingMethodIsDefined = typeof existingValue !== 'undefined';
          const newMethodIsFunction = typeof newValue === 'function';
          const existingMethodIsFunction = typeof existingValue === 'function';
          const typesAreCompatible = newMethodIsFunction === existingMethodIsFunction;

          // If not forced and types are compatible, and existing method is defined, we might skip.
          if (!updateIsForced && existingMethodIsDefined && typesAreCompatible) {
              continue;
          }

          // If we reach here, an update or definition is needed.
          // If there's an existing value and it's a function, attempt to copy its properties.
          if (existingMethodIsDefined && existingMethodIsFunction && newMethodIsFunction) {
              mergeProperties(newValue, existingValue);
          }

          // Define the new method on the target object.
          defineObjectProperty(currentTargetObject, methodKey, newValue, config);

          // If it's a 'sham' polyfill or the existing one was a 'sham', ensure the new method is marked.
          const needsShamMarking = config.sham || (existingMethodIsDefined && existingValue.sham);
          if (needsShamMarking) {
            assignProperty(newValue, 'sham', true);
          }
        }
      };
    },

    /* Module 1: Object Validation */
    function(moduleContext, moduleExports, localRequire) {
      const isObjectUtil = localRequire(8); // Utility to check if a value is an object.

      // Type III: Added a helper function for consistent error messages.
      const createInvalidObjectTypeError = (value) => {
          const errorMessage = `Input value '${String(value)}' is not a valid object.`;
          return new TypeError(errorMessage);
      };

      /**
       * Validates that the provided input is a non-null object.
       * Throws a TypeError if the validation fails.
       * @param {any} inputValue - The value to validate.
       * @returns {object} The validated object.
       * @throws {TypeError} If `inputValue` is not an object or is null.
       */
      moduleContext.exports = function(inputValue) {
        if (isObjectUtil(inputValue) === false) {
          throw createInvalidObjectTypeError(inputValue);
        }
        return inputValue;
      };
    },

    /* Module 2: Pure Environment Flag */
    function(moduleContext, moduleExports) {
      // This module simply exports a boolean indicating whether the environment is considered "pure" (e.g., no polyfills).
      moduleContext.exports = false;
    },

    /* Module 3: Iterable Operation Utility */
    function(moduleContext, moduleExports, localRequire) {
        // Type II: Renamed variables and functions for clarity.
        const validateObject = localRequire(1); // Function to ensure a value is an object.
        const isArrayLike = localRequire(84); // Utility to check if an object is array-like (e.g., has `length` and `Symbol.iterator`).
        const getCollectionLength = localRequire(10); // Function to get a valid length from an object.
        const retrieveIteratorMethod = localRequire(52); // Function to get the iterator method for an object.
        const bindFunctionCallback = localRequire(13); // Function to bind 'this' to a callback.
        const processIteratorResult = localRequire(108); // Utility to handle iterator completion.

        // Type III: Introduced a class for iteration status, replacing the simple object literal.
        /**
         * Represents the status of an iteration, indicating if it was stopped prematurely.
         */
        class IterationControlStatus {
            constructor(hasStopped, finalResult) {
                this.hasStopped = hasStopped;
                this.finalResult = finalResult;
            }
        }

        /**
         * Iterates over a collection (iterable or array-like) and applies a callback function.
         * This function supports early termination of iteration.
         * @param {object} collectionTarget - The collection to iterate over.
         * @param {function} iterationCallback - The function to call for each element.
         * @param {any} bindingContext - The 'this' context for the iterationCallback.
         * @param {boolean} processAsEntries - If true, the callback receives [key, value] pairs.
         * @param {boolean} shouldStopEarly - If true, the iteration stops and returns the result of the callback if it yields an IterationControlStatus.
         * @returns {IterationControlStatus} An object indicating if the iteration stopped and its result.
         */
        const executeCollectionIteration = (collectionTarget, iterationCallback, bindingContext, processAsEntries, shouldStopEarly) => {
            let currentElementValue;
            let boundIterationCallback;
            let iteratorObject;
            let callbackExecutionResult;
            let loopIndex = 0;

            boundIterationCallback = bindFunctionCallback(iterationCallback, bindingContext, processAsEntries ? 2 : 1);

            let availableIteratorMethod;
            // Determine if the collection is iterable.
            if (!shouldStopEarly) {
                availableIteratorMethod = retrieveIteratorMethod(collectionTarget);
                if (typeof availableIteratorMethod !== 'function') {
                    throw new TypeError(`Collection target '${String(collectionTarget)}' does not have an iterable method.`);
                }
                iteratorObject = availableIteratorMethod.call(collectionTarget);
            } else {
                if (typeof (availableIteratorMethod = retrieveIteratorMethod(collectionTarget)) !== 'function') {
                    throw new TypeError(`Collection target '${String(collectionTarget)}' is not iterable when early stopping is enabled.`);
                }
                iteratorObject = availableIteratorMethod.call(collectionTarget);
            }

            if (isArrayLike(availableIteratorMethod)) {
                const arrayLength = getCollectionLength(collectionTarget.length);
                for (let arrayIdx = 0; arrayIdx < arrayLength; arrayIdx++) {
                    const elementToProcess = processAsEntries ? [collectionTarget[arrayIdx][0], collectionTarget[arrayIdx][1]] : collectionTarget[arrayIdx];
                    callbackExecutionResult = boundIterationCallback(elementToProcess, arrayIdx, collectionTarget);
                    if (callbackExecutionResult instanceof IterationControlStatus) {
                        return callbackExecutionResult;
                    }
                }
                return new IterationControlStatus(false, undefined);
            }

            let nextIterationItem;
            while (! (nextIterationItem = iteratorObject.next()).done) {
                callbackExecutionResult = processIteratorResult(iteratorObject, boundIterationCallback, nextIterationItem.value, processAsEntries);
                if (callbackExecutionResult instanceof IterationControlStatus) {
                    return callbackExecutionResult;
                }
            }
            return new IterationControlStatus(false, undefined);
        };

        moduleContext.exports = executeCollectionIteration;
        Reflect.set(executeCollectionIteration, 'stop', function(valueToStopWith) {
            return new IterationControlStatus(true, valueToStopWith);
        });
    },

    /* Module 4: Function Validation */
    function(moduleContext, moduleExports) {
      moduleContext.exports = function(inputFunction) {
        const isFunctionType = typeof inputFunction === 'function';
        if (inputFunction === null || inputFunction === undefined || !isFunctionType) {
          const errorMessage = `Argument must be a callable function. Received: ${String(inputFunction)}`;
          throw new TypeError(errorMessage);
        }
        return inputFunction;
      };
    },

    /* Module 5: Global Object Retrieval */
    function(moduleContext, moduleExports) {
      const objectLiteralString = 'object';

      const getGlobalObjectCandidate = function(scopeCandidate) {
        const isValidGlobalCandidate = scopeCandidate && Reflect.has(scopeCandidate, 'Math') && scopeCandidate.Math === Math;
        return isValidGlobalCandidate ? scopeCandidate : undefined;
      };

      function getRobustGlobalThisFallback() {
          if (typeof globalThis !== 'undefined') {
              return globalThis;
          }
          try {
              const funcGlobal = new Function('return this')();
              if (funcGlobal && Reflect.has(funcGlobal, 'Math') && funcGlobal.Math === Math) {
                return funcGlobal;
              }
          } catch (e) {
          }
          return undefined;
      }

      moduleContext.exports =
        getGlobalObjectCandidate(typeof globalThis === objectLiteralString && globalThis) ||
        getGlobalObjectCandidate(typeof window === objectLiteralString && window) ||
        getGlobalObjectCandidate(typeof self === objectLiteralString && self) ||
        getGlobalObjectCandidate(typeof global === objectLiteralString && global) ||
        getRobustGlobalThisFallback();
    },

    /* Module 6: Well-Known Symbol Retrieval */
    function(moduleContext, moduleExports, localRequire) {
        const globalReference = localRequire(5);
        const sharedSymbolStorage = localRequire(38);
        const definePropertyHelper = localRequire(16);
        const nativeSymbolAvailable = localRequire(102);
        const generateUniqueSymbolId = localRequire(45);

        const wellKnownSymbolsCache = sharedSymbolStorage('wellKnownSymbols');

        moduleContext.exports = function(symbolIdentifierKey) {
            if (Reflect.has(wellKnownSymbolsCache, symbolIdentifierKey)) {
                return wellKnownSymbolsCache[symbolIdentifierKey];
            }

            let symbolInstanceResult;
            const globalSymbolObject = globalReference.Symbol;
            const hasNativeWellKnownSymbol = nativeSymbolAvailable && globalSymbolObject !== undefined && Reflect.has(globalSymbolObject, symbolIdentifierKey);

            if (hasNativeWellKnownSymbol) {
                symbolInstanceResult = globalSymbolObject[symbolIdentifierKey];
            } else {
                symbolInstanceResult = generateUniqueSymbolId(`Symbol.${symbolIdentifierKey}`);
            }

            Reflect.set(wellKnownSymbolsCache, symbolIdentifierKey, symbolInstanceResult);
            return symbolInstanceResult;
        };
    },

    /* Module 7: Error Testing Utility */
    function(moduleContext, moduleExports) {
        moduleContext.exports = function(operationToTest) {
            try {
                Reflect.apply(operationToTest, undefined, []);
                return false;
            } catch (error) {
                return true;
            }
        };
    },

    /* Module 8: Object Type Check */
    function(moduleContext, moduleExports) {
        moduleContext.exports = function(valueToExamine) {
            const currentTypeOfValue = typeof valueToExamine;
            const isObjectNonNull = currentTypeOfValue === 'object' && valueToExamine !== null;
            const isFunctionType = currentTypeOfValue === 'function';
            return isObjectNonNull || isFunctionType;
        };
    },

    /* Module 9: Object.defineProperty Feature Test */
    function(moduleContext, moduleExports, localRequire) {
        const runTestFunction = localRequire(7);

        moduleContext.exports = runTestFunction(function() {
            const testTargetObject = {};
            Object.defineProperty(testTargetObject, 'a', {
                get: function() {
                    return 7;
                }
            });
            return testTargetObject.a === 7;
        }) === false;
    },

    /* Module 10: Array-Like Length Calculation */
    function(moduleContext, moduleExports, localRequire) {
        const convertToInteger = localRequire(24);
        const mathMinFunction = Math.min;

        moduleContext.exports = function(rawLengthValue) {
            const numericInput = Number(rawLengthValue);
            const maxSafeInteger = 9007199254740991;

            if (numericInput > 0) {
                const integerLength = convertToInteger(numericInput);
                return mathMinFunction(integerLength, maxSafeInteger);
            } else {
                return 0;
            }
        };
    },

    /* Module 11: Object.defineProperty Wrapper */
    function(moduleContext, moduleExports, localRequire) {
        const isDefinePropertyReliable = localRequire(9);
        const isDefinePropertySafe = localRequire(97);
        const ensureObject = localRequire(1);
        const toPrimitiveKey = localRequire(29);
        const ensurePropertyDescriptor = localRequire(1);

        const fallbackPropertyDefinition = function(target, propertyName, descriptor) {
          const hasAccessor = Reflect.has(descriptor, 'get') || Reflect.has(descriptor, 'set');
          if (hasAccessor) {
            throw new TypeError("Accessor properties (get/set) are not supported by the fallback defineProperty implementation.");
          }
          const hasValue = Reflect.has(descriptor, 'value');
          if (hasValue) {
            target[propertyName] = descriptor.value;
          }
          return target;
        };

        moduleExports.f = isDefinePropertyReliable ?
          Object.defineProperty :
          function(targetObject, propertyName, propertyDescriptor) {
            ensureObject(targetObject);
            const processedPropertyKey = toPrimitiveKey(propertyName, true);
            ensurePropertyDescriptor(propertyDescriptor);

            if (isDefinePropertySafe) {
              try {
                return Object.defineProperty(targetObject, processedPropertyKey, propertyDescriptor);
              } catch (error) {
                console.warn(`Object.defineProperty failed for '${String(propertyName)}'. Falling back to direct assignment.`, error);
              }
            }
            return fallbackPropertyDefinition(targetObject, processedPropertyKey, propertyDescriptor);
          };
    },

    /* Module 12: Global Property Accessor */
    function(moduleContext, moduleExports, localRequire) {
        const globalVarScope = localRequire(81);
        const rootGlobalScope = localRequire(5);

        const isFunctionCheck = function(value) {
            return typeof value === 'function';
        };

        moduleContext.exports = function(firstPropertyName, nestedPropertyName) {
            const hasNestedProperty = arguments.length >= 2;

            if (!hasNestedProperty) {
                const valueFromGlobalVar = Reflect.get(globalVarScope, firstPropertyName);
                if (isFunctionCheck(valueFromGlobalVar)) {
                    return valueFromGlobalVar;
                }
                const valueFromRootGlobal = Reflect.get(rootGlobalScope, firstPropertyName);
                if (isFunctionCheck(valueFromRootGlobal)) {
                    return valueFromRootGlobal;
                }
                return undefined;
            }

            const globalPropertyOne = Reflect.get(globalVarScope, firstPropertyName);
            const rootPropertyOne = Reflect.get(rootGlobalScope, firstPropertyName);

            const resultFromGlobalVar = globalPropertyOne && Reflect.get(globalPropertyOne, nestedPropertyName);
            if (resultFromGlobalVar !== undefined) {
                return resultFromGlobalVar;
            }

            const resultFromRootGlobal = rootPropertyOne && Reflect.get(rootPropertyOne, nestedPropertyName);
            if (resultFromRootGlobal !== undefined) {
                return resultFromRootGlobal;
            }

            return undefined;
        };
    },

    /* Module 13: Function Binding Utility */
    function(moduleContext, moduleExports, localRequire) {
        const validateAsFunction = localRequire(4);

        moduleContext.exports = function(originalFunction, contextValue, fixedArgumentCount) {
            validateAsFunction(originalFunction);

            if (contextValue === undefined) {
                return originalFunction;
            }

            if (fixedArgumentCount === 0) {
                return function() {
                    return Reflect.apply(originalFunction, contextValue, []);
                };
            } else if (fixedArgumentCount === 1) {
                return function(arg1) {
                    return Reflect.apply(originalFunction, contextValue, [arg1]);
                };
            } else if (fixedArgumentCount === 2) {
                return function(arg1, arg2) {
                    return Reflect.apply(originalFunction, contextValue, [arg1, arg2]);
                };
            } else if (fixedArgumentCount === 3) {
                return function(arg1, arg2, arg3) {
                    return Reflect.apply(originalFunction, contextValue, [arg1, arg2, arg3]);
                };
            } else {
                return function() {
                    return Reflect.apply(originalFunction, contextValue, Array.from(arguments));
                };
            }
        };
    },

    /* Module 14: Object.prototype.hasOwnProperty Wrapper */
    function(moduleContext, moduleExports) {
        const nativeHasOwnProperty = Object.prototype.hasOwnProperty;

        moduleContext.exports = function(targetObject, propertyIdentifier) {
            return Reflect.apply(nativeHasOwnProperty, targetObject, [propertyIdentifier]);
        };
    },

    /* Module 15: ToObject Conversion */
    function(moduleContext, moduleExports, localRequire) {
        const checkNullish = localRequire(17);

        moduleContext.exports = function(valueInput) {
            const nonNullishValue = checkNullish(valueInput);
            return Object(nonNullishValue);
        };
    },

    /* Module 16: Property Assignment Utility */
    function(moduleContext, moduleExports, localRequire) {
        const supportsDefineProperty = localRequire(9);
        const definePropertyFunction = localRequire(11);
        const createPropertyDescriptor = localRequire(35);

        moduleContext.exports = supportsDefineProperty ?
          function(targetObject, propertyName, assignedValue) {
            const descriptor = createPropertyDescriptor(1, assignedValue);
            Reflect.apply(definePropertyFunction.f, undefined, [targetObject, propertyName, descriptor]);
            return targetObject;
          } :
          function(targetObject, propertyName, assignedValue) {
            targetObject[propertyName] = assignedValue;
            return targetObject;
          };
    },

    /* Module 17: Null/Undefined Check Utility */
    function(moduleContext, moduleExports) {
        moduleContext.exports = function(valueToAssert) {
            if (valueToAssert === null || valueToAssert === undefined) {
                const errorMessage = `Attempted to call method on a nullish value: ${String(valueToAssert)}.`;
                throw new TypeError(errorMessage);
            }
            return valueToAssert;
        };
    },

    /* Module 18: Internal Data Storage (WeakMap/Fallback) */
    function(moduleContext, moduleExports, localRequire) {
        const hasNativeWeakMap = localRequire(99);
        const globalScopeRef = localRequire(5);
        const isAnObject = localRequire(8);
        const setObjectProperty = localRequire(16);
        const hasOwnObjectProperty = localRequire(14);
        const generateInternalKey = localRequire(59);
        const internalKeyRegistry = localRequire(46);

        const NativeWeakMapConstructor = globalScopeRef.WeakMap;

        let setInternalDataFn, getInternalDataFn, hasInternalDataFn;

        if (hasNativeWeakMap) {
            const internalStorageMap = new NativeWeakMapConstructor();
            const retrieveMapValue = internalStorageMap.get;
            const checkMapValue = internalStorageMap.has;
            const storeMapValue = internalStorageMap.set;

            setInternalDataFn = function(targetObject, dataValue) {
                Reflect.apply(storeMapValue, internalStorageMap, [targetObject, dataValue]);
                return dataValue;
            };
            getInternalDataFn = function(targetObject) {
                return Reflect.apply(retrieveMapValue, internalStorageMap, [targetObject]) || {};
            };
            hasInternalDataFn = function(targetObject) {
                return Reflect.apply(checkMapValue, internalStorageMap, [targetObject]);
            };
        } else {
            const uniqueDataKey = generateInternalKey('internalData');
            internalKeyRegistry[uniqueDataKey] = true;

            setInternalDataFn = function(targetObject, dataValue) {
                setObjectProperty(targetObject, uniqueDataKey, dataValue);
                return dataValue;
            };
            getInternalDataFn = function(targetObject) {
                return hasOwnObjectProperty(targetObject, uniqueDataKey) ? targetObject[uniqueDataKey] : {};
            };
            hasInternalDataFn = function(targetObject) {
                return hasOwnObjectProperty(targetObject, uniqueDataKey);
            };
        }

        moduleContext.exports = {
            set: setInternalDataFn,
            get: getInternalDataFn,
            has: hasInternalDataFn,
            enforce: function(targetObject) {
                const dataExists = hasInternalDataFn(targetObject);
                if (dataExists) {
                    return getInternalDataFn(targetObject);
                } else {
                    const newInternalData = {};
                    return setInternalDataFn(targetObject, newInternalData);
                }
            },
            getterFor: function(typeIdentifier) {
                return function(receiverObject) {
                    const isReceiverAnObject = isAnObject(receiverObject);
                    if (!isReceiverAnObject) {
                        throw new TypeError(`Invalid receiver: Expected an object for type '${typeIdentifier}', but received '${typeof receiverObject}'.`);
                    }
                    const internalData = getInternalDataFn(receiverObject);
                    const isInternalDataTypeCorrect = internalData && internalData.type === typeIdentifier;
                    if (!isInternalDataTypeCorrect) {
                        throw new TypeError(`Incompatible receiver: Expected an instance of '${typeIdentifier}', but received an incompatible object.`);
                    }
                    return internalData;
                };
            }
        };
    },

    /* Module 19: Well-Known Symbol Registration */
    function(moduleContext, moduleExports, localRequire) {
        const globalSymbolObject = localRequire(81);
        const checkPropertyExistence = localRequire(14);
        const getSymbolDefinition = localRequire(105);
        const objectDefinePropertyFn = localRequire(11).f;

        moduleContext.exports = function(symbolName) {
            let currentGlobalSymbol = globalSymbolObject.Symbol;
            if (currentGlobalSymbol === undefined) {
                currentGlobalSymbol = {};
                Reflect.set(globalSymbolObject, 'Symbol', currentGlobalSymbol);
            }

            if (!checkPropertyExistence(currentGlobalSymbol, symbolName)) {
                const symbolValue = getSymbolDefinition.f(symbolName);
                objectDefinePropertyFn(currentGlobalSymbol, symbolName, {
                    value: symbolValue
                });
            }
        };
    },

    /* Module 20: Collection Species Constructor Retrieval */
    function(moduleContext, moduleExports, localRequire) {
        const ensureIsObject = localRequire(1);
        const ensureIsFunction = localRequire(4);
        const speciesSymbol = localRequire(6)('species');

        moduleContext.exports = function(baseCollectionObject, fallbackConstructor) {
            const validatedObject = ensureIsObject(baseCollectionObject);
            const constructorOfObject = validatedObject.constructor;
            let speciesResultingConstructor;

            if (constructorOfObject === undefined || constructorOfObject === null) {
                return fallbackConstructor;
            }

            const hasSpeciesProperty = Reflect.has(constructorOfObject, speciesSymbol);
            if (hasSpeciesProperty) {
                speciesResultingConstructor = constructorOfObject[speciesSymbol];
            }

            const isSpeciesNullish = speciesResultingConstructor === undefined || speciesResultingConstructor === null;
            const isSpeciesNonFunctionObject = typeof speciesResultingConstructor === 'object' && speciesResultingConstructor !== null && typeof speciesResultingConstructor !== 'function';

            if (isSpeciesNullish || isSpeciesNonFunctionObject) {
                return fallbackConstructor;
            }

            return ensureIsFunction(speciesResultingConstructor);
        };
    },

    /* Module 21: Get Prototype Of */
    function(moduleContext, moduleExports, localRequire) {
        const checkDefineProperty = localRequire(9);
        const getPrototypePropertyDescriptor = localRequire(22).f;
        const ensureObject = localRequire(1);
        const createUniqueId = localRequire(29);
        const checkOwnProperty = localRequire(14);
        const getLegacyPrototype = localRequire(110);

        const internalProtoKey = createUniqueId('IE_PROTO');
        const objectPrototype = Object.prototype;

        moduleContext.exports = getLegacyPrototype ?
          Object.getPrototypeOf :
          function(targetObject) {
            const validatedObject = ensureObject(targetObject);
            const hasInternalProtoKey = checkOwnProperty(validatedObject, internalProtoKey);

            if (hasInternalProtoKey) {
                return validatedObject[internalProtoKey];
            }

            const constructorProperty = validatedObject.constructor;
            const isConstructorFunction = typeof constructorProperty === 'function';
            const isInstance = validatedObject instanceof constructorProperty;

            if (isConstructorFunction && isInstance) {
                return constructorProperty.prototype;
            }

            if (validatedObject instanceof Object) {
                return objectPrototype;
            }

            return null;
          };
    },

    /* Module 22: Object.getOwnPropertyDescriptor Wrapper */
    function(moduleContext, moduleExports, localRequire) {
        const supportsDefineProperty = localRequire(9);
        const isEnumerableProperty = localRequire(58);
        const createPropertyDescriptor = localRequire(35);
        const toObject = localRequire(25);
        const toPrimitiveKey = localRequire(29);
        const checkOwnProperty = localRequire(14);
        const allowTryCatch = localRequire(97);

        const getOwnPropertyDescriptorNative = Object.getOwnPropertyDescriptor;

        moduleExports.f = supportsDefineProperty ?
          getOwnPropertyDescriptorNative :
          function(targetObject, propertyKey) {
            const objectTarget = toObject(targetObject);
            const primitivePropertyKey = toPrimitiveKey(propertyKey, true);

            if (allowTryCatch) {
              try {
                return getOwnPropertyDescriptorNative(objectTarget, primitivePropertyKey);
              } catch (error) {
              }
            }

            if (checkOwnProperty(objectTarget, primitivePropertyKey)) {
              return createPropertyDescriptor(
                  !Reflect.apply(isEnumerableProperty.f, objectTarget, [primitivePropertyKey]),
                  objectTarget[primitivePropertyKey]
              );
            }
            return undefined;
          };
    },

    /* Module 23: Define Property Utility */
    function(moduleContext, moduleExports, localRequire) {
        const globalObject = localRequire(5);
        const internalSharedRegistry = localRequire(38);
        const setProperty = localRequire(16);
        const checkOwnProperty = localRequire(14);
        const createGlobalProperty = localRequire(79);
        const captureSource = localRequire(98);
        const internalDataStorage = localRequire(18);

        const getInternalData = internalDataStorage.get;
        const setInternalData = internalDataStorage.enforce;
        const originalToStringSplit = String(captureSource).split('toString');

        internalSharedRegistry('inspectSource', function(func) {
            return Reflect.apply(captureSource, func, []);
        });

        moduleContext.exports = function(targetObject, propertyName, propertyImplementation, options) {
            const configOptions = options || {};
            const isUnsafeOverwrite = configOptions.unsafe === true;
            let isEnumerable = configOptions.enumerable === true;
            const preventTargetGet = configOptions.noTargetGet === true;

            if (typeof propertyImplementation === 'function' &&
                (typeof propertyName !== 'string' || !checkOwnProperty(propertyImplementation, 'name') || !setProperty(propertyImplementation, 'name', propertyName))) {
                setInternalData(propertyImplementation).source = originalToStringSplit.join(
                    typeof propertyName === 'string' ? propertyName : ''
                );
            }

            if (targetObject !== globalObject) {
                if (isUnsafeOverwrite && !preventTargetGet && Reflect.has(targetObject, propertyName)) {
                    if (isEnumerable) {
                        delete targetObject[propertyName];
                    }
                }
                if (isEnumerable) {
                    targetObject[propertyName] = propertyImplementation;
                } else {
                    setProperty(targetObject, propertyName, propertyImplementation);
                }
            } else {
                if (isEnumerable) {
                    targetObject[propertyName] = propertyImplementation;
                } else {
                    createGlobalProperty(propertyName, propertyImplementation);
                }
            }
        };
    },

    /* Module 24: ToInteger Conversion */
    function(moduleContext, moduleExports) {
        const mathCeil = Math.ceil;
        const mathFloor = Math.floor;

        moduleContext.exports = function(value) {
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
                return 0;
            } else if (numericValue > 0) {
                return mathFloor(numericValue);
            } else {
                return mathCeil(numericValue);
            }
        };
    },

    /* Module 25: ToObject (Array-Like) */
    function(moduleContext, moduleExports, localRequire) {
        const toIndexedObject = localRequire(77);
        const checkNullish = localRequire(17);

        moduleContext.exports = function(value) {
            const nonNullishValue = checkNullish(value);
            return toIndexedObject(nonNullishValue);
        };
    },

    /* Module 26: Set `toStringTag` Property */
    function(moduleContext, moduleExports, localRequire) {
        const defineProperty = localRequire(11).f;
        const checkOwnProperty = localRequire(14);
        const symbolToStringTag = localRequire(6)('toStringTag');

        moduleContext.exports = function(targetObject, tagValue, isPrototype) {
            const actualTarget = isPrototype ? targetObject : targetObject.prototype;

            if (actualTarget && !checkOwnProperty(actualTarget, symbolToStringTag)) {
                defineProperty(actualTarget, symbolToStringTag, {
                    configurable: true,
                    value: tagValue
                });
            }
        };
    },

    /* Module 27: Map Entries Iterator */
    function(moduleContext, moduleExports, localRequire) {
        const isPureEnvironment = localRequire(2);
        const mapEntriesIterator = localRequire(57);

        moduleContext.exports = isPureEnvironment ?
          mapEntriesIterator :
          function(mapInstance) {
            return Reflect.apply(Map.prototype.entries, mapInstance, []);
          };
    },

    /* Module 28: Get Object Class Name */
    function(moduleContext, moduleExports) {
        const objectToString = Object.prototype.toString;

        moduleContext.exports = function(value) {
            return Reflect.apply(objectToString, value, []).slice(8, -1);
        };
    },

    /* Module 29: ToPrimitive Conversion */
    function(moduleContext, moduleExports, localRequire) {
        const isObject = localRequire(8);

        moduleContext.exports = function(inputObject, hintAsString) {
            if (!isObject(inputObject)) {
                return inputObject;
            }

            let methodCallResult;
            let valueOfMethod, toStringMethod;

            if (hintAsString) {
                toStringMethod = inputObject.toString;
                if (typeof toStringMethod === 'function') {
                    methodCallResult = Reflect.apply(toStringMethod, inputObject, []);
                    if (!isObject(methodCallResult)) {
                        return methodCallResult;
                    }
                }
                valueOfMethod = inputObject.valueOf;
                if (typeof valueOfMethod === 'function') {
                    methodCallResult = Reflect.apply(valueOfMethod, inputObject, []);
                    if (!isObject(methodCallResult)) {
                        return methodCallResult;
                    }
                }
            } else {
                valueOfMethod = inputObject.valueOf;
                if (typeof valueOfMethod === 'function') {
                    methodCallResult = Reflect.apply(valueOfMethod, inputObject, []);
                    if (!isObject(methodCallResult)) {
                        return methodCallResult;
                    }
                }
                toStringMethod = inputObject.toString;
                if (typeof toStringMethod === 'function') {
                    methodCallResult = Reflect.apply(toStringMethod, inputObject, []);
                    if (!isObject(methodCallResult)) {
                        return methodCallResult;
                    }
                }
            }

            throw new TypeError("Cannot convert object to primitive value.");
        };
    },

    /* Module 30: Object.create Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const ensureObject = localRequire(1);
        const objectDefineProperties = localRequire(103);
        const internalKeys = localRequire(82);
        const internalDataMap = localRequire(46);
        const appendElement = localRequire(104);
        const createIframe = localRequire(78);

        const internalProtoKey = localRequire(59)('IE_PROTO');
        const emptyConstructor = function() {};

        let iframeObjectCreate;

        if (Object.create) {
            moduleContext.exports = Object.create;
        } else {
            iframeObjectCreate = function() {
                const hiddenIframe = createIframe('iframe');
                hiddenIframe.style.display = 'none';
                appendElement.appendChild(hiddenIframe);
                hiddenIframe.src = String('javascript:');

                const iframeDocument = hiddenIframe.contentWindow.document;
                iframeDocument.open();
                iframeDocument.write("<script>document.F=Object<\/script>");
                iframeDocument.close();

                const iframeObjectRef = iframeDocument.F;
                const keyCount = internalKeys.length;

                for (let i = 0; i < keyCount; i++) {
                    delete iframeObjectRef.prototype[internalKeys[i]];
                }
                return iframeObjectRef();
            };

            moduleContext.exports = function(prototypeObject, propertyDescriptors) {
                let newObjectInstance;
                if (prototypeObject !== null) {
                    emptyConstructor.prototype = ensureObject(prototypeObject);
                    newObjectInstance = new emptyConstructor();
                    emptyConstructor.prototype = null;
                    Reflect.set(newObjectInstance, internalProtoKey, prototypeObject);
                } else {
                    newObjectInstance = iframeObjectCreate();
                }

                if (propertyDescriptors !== undefined) {
                    return objectDefineProperties(newObjectInstance, propertyDescriptors);
                }
                return newObjectInstance;
            };
        }
        internalDataMap[internalProtoKey] = true;
    },

    /* Module 31: Instance Type Check */
    function(moduleContext, moduleExports, localRequire) {
        const ensureInstance = localRequire(1);

        moduleContext.exports = function(instance, constructor, className) {
            if (!(instance instanceof constructor)) {
                const classLabel = className ? `${className} ` : '';
                throw new TypeError(`Incorrect ${classLabel}invocation of constructor.`);
            }
            return instance;
        };
    },

    /* Module 32: Typed Array Definition */
    function(moduleContext, moduleExports, localRequire) {
        const defineFeature = localRequire(0);
        const globalScope = localRequire(5);
        const isDefinePropertySupported = localRequire(9);
        const hasNativeTypedArrays = localRequire(95);
        const getPrototypeOf = localRequire(21);
        const createObject = localRequire(31);
        const createPropertyDescriptor = localRequire(35);
        const setProperty = localRequire(16);
        const getLength = localRequire(10);
        const allocateArrayBuffer = localRequire(124);
        const getOffset = localRequire(217);
        const toPrimitiveKey = localRequire(29);
        const hasOwnProperty = localRequire(14);
        const isObject = localRequire(8);
        const createNullObject = localRequire(30);
        const setPrototypeOf = localRequire(42);
        const getOwnPropertyNames = localRequire(39).f;
        const forEachArray = localRequire(48).forEach;
        const defineProperty = localRequire(11);
        const getOwnPropertyDescriptor = localRequire(22);
        const internalDataStorage = localRequire(18);

        const getInternalState = internalDataStorage.get;
        const setInternalState = internalDataStorage.set;
        const mathRound = Math.round;

        const rangeErrorConstructor = globalScope.RangeError;

        const typedArrayBuffer = localRequire(215).ArrayBuffer;
        const typedArrayDataView = localRequire(215).DataView;

        const typedArrayConfig = localRequire(33);
        const NATIVE_ARRAY_BUFFER_VIEWS = typedArrayConfig.NATIVE_ARRAY_BUFFER_VIEWS;
        const TYPED_ARRAY_TAG = typedArrayConfig.TYPED_ARRAY_TAG;
        const TypedArrayPrototypeBase = typedArrayConfig.TypedArray;
        const TypedArrayPrototype = typedArrayConfig.TypedArrayPrototype;
        const getTypedArrayConstructor = typedArrayConfig.aTypedArrayConstructor;
        const isTypedArrayInstance = typedArrayConfig.isTypedArray;

        const createTypedArrayFromSource = (TargetConstructor, sourceArray) => {
            const arrayLength = sourceArray.length;
            const newTypedArray = new (getTypedArrayConstructor(TargetConstructor))(arrayLength);
            for (let i = 0; i < arrayLength; i++) {
                newTypedArray[i] = sourceArray[i];
            }
            return newTypedArray;
        };

        const defineInternalGetter = (prototypeObject, propertyName) => {
            defineProperty.f(prototypeObject, propertyName, {
                get: function() {
                    return getInternalState(this)[propertyName];
                }
            });
        };

        const isBufferType = (value) => {
            const objectClass = localRequire(53)(value);
            return value instanceof typedArrayBuffer || objectClass === 'ArrayBuffer' || objectClass === 'SharedArrayBuffer';
        };

        const isValidTypedArrayIndex = (typedArrayInstance, propertyKey) => {
            const isSymbol = typeof propertyKey === 'symbol';
            const isNumeric = String(Number(propertyKey)) === String(propertyKey);
            return isTypedArrayInstance(typedArrayInstance) && !isSymbol && isNumeric;
        };

        const getTypedArrayPropertyDescriptor = (typedArrayInstance, propertyKey) => {
            const processedKey = toPrimitiveKey(propertyKey, true);
            if (isValidTypedArrayIndex(typedArrayInstance, processedKey)) {
                return createPropertyDescriptor(2, typedArrayInstance[processedKey]);
            }
            return getOwnPropertyDescriptor.f(typedArrayInstance, processedKey);
        };

        const defineTypedArrayProperty = (typedArrayInstance, propertyKey, descriptor) => {
            const processedKey = toPrimitiveKey(propertyKey, true);
            const isIndexValid = isValidTypedArrayIndex(typedArrayInstance, processedKey);
            const isDescriptorValid = isObject(descriptor) && hasOwnProperty(descriptor, 'value');
            const hasAccessor = hasOwnProperty(descriptor, 'get') || hasOwnProperty(descriptor, 'set');
            const isConfigurableOrWritable = hasOwnProperty(descriptor, 'configurable') || (hasOwnProperty(descriptor, 'writable') && !descriptor.writable);
            const isEnumerable = hasOwnProperty(descriptor, 'enumerable') && !descriptor.enumerable;

            if (isIndexValid && isDescriptorValid && !hasAccessor && !isConfigurableOrWritable && !isEnumerable) {
                typedArrayInstance[processedKey] = descriptor.value;
                return typedArrayInstance;
            }
            return defineProperty.f(typedArrayInstance, processedKey, descriptor);
        };

        if (isDefinePropertySupported) {
            if (!NATIVE_ARRAY_BUFFER_VIEWS) {
                getOwnPropertyDescriptor.f = getTypedArrayPropertyDescriptor;
                defineProperty.f = defineTypedArrayProperty;
                defineInternalGetter(TypedArrayPrototype, 'buffer');
                defineInternalGetter(TypedArrayPrototype, 'byteOffset');
                defineInternalGetter(TypedArrayPrototype, 'byteLength');
                defineInternalGetter(TypedArrayPrototype, 'length');
            }

            defineFeature({
                target: 'Object',
                stat: true,
                forced: !NATIVE_ARRAY_BUFFER_VIEWS
            }, {
                getOwnPropertyDescriptor: getTypedArrayPropertyDescriptor,
                defineProperty: defineTypedArrayProperty
            });

            moduleContext.exports = function(typeName, bytesPerElement, typeConstructorFactory, isClamped) {
                const fullTypeName = typeName + (isClamped ? 'Clamped' : '') + 'Array';
                const getterMethodName = 'get' + typeName;
                const setterMethodName = 'set' + typeName;

                const globalTypedArrayConstructor = globalScope[fullTypeName];
                let currentTypedArrayConstructor = globalTypedArrayConstructor;
                let typedArrayPrototype = currentTypedArrayConstructor && currentTypedArrayConstructor.prototype;
                const prototypeMethods = {};

                const defineIndexedAccessor = (prototype, index) => {
                    defineProperty.f(prototype, index, {
                        get: function() {
                            const state = getInternalState(this);
                            return Reflect.apply(state.view[getterMethodName], state.view, [index * bytesPerElement + state.byteOffset, true]);
                        },
                        set: function(value) {
                            const state = getInternalState(this);
                            let processedValue = value;
                            if (isClamped) {
                                processedValue = mathRound(processedValue);
                                processedValue = processedValue < 0 ? 0 : processedValue > 255 ? 255 : processedValue & 255;
                            }
                            Reflect.apply(state.view[setterMethodName], state.view, [index * bytesPerElement + state.byteOffset, processedValue, true]);
                        },
                        enumerable: true
                    });
                };

                if (NATIVE_ARRAY_BUFFER_VIEWS && hasNativeTypedArrays) {
                    currentTypedArrayConstructor = typeConstructorFactory(function(instance, bufferOrLength, byteOffset, length) {
                        createObject(instance, currentTypedArrayConstructor, fullTypeName);
                        if (isObject(bufferOrLength)) {
                            if (isBufferType(bufferOrLength)) {
                                const resolvedByteOffset = getOffset(byteOffset, bytesPerElement);
                                const bufferByteLength = bufferOrLength.byteLength;
                                let resolvedLength;

                                if (length === undefined) {
                                    if (bufferByteLength % bytesPerElement !== 0) {
                                        throw new rangeErrorConstructor("Wrong length: ArrayBuffer byteLength not divisible by bytesPerElement.");
                                    }
                                    resolvedLength = (bufferByteLength - resolvedByteOffset) / bytesPerElement;
                                    if (resolvedLength < 0) {
                                        throw new rangeErrorConstructor("Wrong length: Calculated length is negative.");
                                    }
                                } else {
                                    resolvedLength = getLength(length);
                                    if (resolvedLength * bytesPerElement + resolvedByteOffset > bufferByteLength) {
                                        throw new rangeErrorConstructor("Wrong length: Provided length exceeds ArrayBuffer bounds.");
                                    }
                                }
                                return new globalTypedArrayConstructor(bufferOrLength, resolvedByteOffset, resolvedLength);
                            } else if (isTypedArrayInstance(bufferOrLength)) {
                                return createTypedArrayFromSource(currentTypedArrayConstructor, bufferOrLength);
                            } else {
                                return localRequire(125).call(currentTypedArrayConstructor, bufferOrLength);
                            }
                        } else {
                            return new globalTypedArrayConstructor(allocateArrayBuffer(bufferOrLength));
                        }
                    });
                    setPrototypeOf(currentTypedArrayConstructor, TypedArrayPrototypeBase);
                    forEachArray(getOwnPropertyNames(globalTypedArrayConstructor), (prop) => {
                        if (!hasOwnProperty(currentTypedArrayConstructor, prop)) {
                            setProperty(currentTypedArrayConstructor, prop, globalTypedArrayConstructor[prop]);
                        }
                    });
                    typedArrayPrototype = currentTypedArrayConstructor.prototype;
                } else {
                    currentTypedArrayConstructor = typeConstructorFactory(function(instance, bufferOrLength, byteOffset, length) {
                        createObject(instance, currentTypedArrayConstructor, fullTypeName);
                        let bufferReference, currentByteOffset, currentByteLength, currentLength;
                        let elementIndex = 0;

                        if (isObject(bufferOrLength)) {
                            if (!isBufferType(bufferOrLength)) {
                                return isTypedArrayInstance(bufferOrLength) ?
                                    createTypedArrayFromSource(currentTypedArrayConstructor, bufferOrLength) :
                                    localRequire(125).call(currentTypedArrayConstructor, bufferOrLength);
                            }
                            bufferReference = bufferOrLength;
                            currentByteOffset = getOffset(byteOffset, bytesPerElement);
                            const bufferTotalLength = bufferOrLength.byteLength;

                            if (length === undefined) {
                                if (bufferTotalLength % bytesPerElement !== 0) {
                                    throw new rangeErrorConstructor("Wrong length: ArrayBuffer byteLength not divisible by bytesPerElement.");
                                }
                                currentByteLength = bufferTotalLength - currentByteOffset;
                                if (currentByteLength < 0) {
                                    throw new rangeErrorConstructor("Wrong length: Calculated byteLength is negative.");
                                }
                            } else {
                                currentByteLength = getLength(length) * bytesPerElement;
                                if (currentByteLength + currentByteOffset > bufferTotalLength) {
                                    throw new rangeErrorConstructor("Wrong length: Provided length exceeds ArrayBuffer bounds.");
                                }
                            }
                            currentLength = currentByteLength / bytesPerElement;
                        } else {
                            currentLength = allocateArrayBuffer(bufferOrLength);
                            bufferReference = new typedArrayBuffer(currentByteLength = currentLength * bytesPerElement);
                        }

                        setInternalState(instance, {
                            buffer: bufferReference,
                            byteOffset: currentByteOffset,
                            byteLength: currentByteLength,
                            length: currentLength,
                            view: new typedArrayDataView(bufferReference)
                        });

                        while (elementIndex < currentLength) {
                            defineIndexedAccessor(instance, elementIndex++);
                        }
                    });
                    setPrototypeOf(currentTypedArrayConstructor, TypedArrayPrototypeBase);
                    typedArrayPrototype = currentTypedArrayConstructor.prototype;
                    if (typedArrayPrototype.constructor !== currentTypedArrayConstructor) {
                        setProperty(typedArrayPrototype, 'constructor', currentTypedArrayConstructor);
                    }
                    if (TYPED_ARRAY_TAG) {
                        setProperty(typedArrayPrototype, TYPED_ARRAY_TAG, fullTypeName);
                    }
                }

                if (typedArrayPrototype.constructor !== currentTypedArrayConstructor) {
                    setProperty(typedArrayPrototype, 'constructor', currentTypedArrayConstructor);
                }
                if (TYPED_ARRAY_TAG) {
                    setProperty(typedArrayPrototype, TYPED_ARRAY_TAG, fullTypeName);
                }

                prototypeMethods[fullTypeName] = currentTypedArrayConstructor;
                defineFeature({
                    global: true,
                    forced: currentTypedArrayConstructor !== globalTypedArrayConstructor,
                    sham: !NATIVE_ARRAY_BUFFER_VIEWS
                }, prototypeMethods);

                if (!hasOwnProperty(currentTypedArrayConstructor, 'BYTES_PER_ELEMENT')) {
                    setProperty(currentTypedArrayConstructor, 'BYTES_PER_ELEMENT', bytesPerElement);
                }
                if (!hasOwnProperty(typedArrayPrototype, 'BYTES_PER_ELEMENT')) {
                    setProperty(typedArrayPrototype, 'BYTES_PER_ELEMENT', bytesPerElement);
                }

                localRequire(43)(fullTypeName);
            };
        } else {
            moduleContext.exports = function() {};
        }
    },

    /* Module 33: Typed Array Configuration */
    function(moduleContext, moduleExports, localRequire) {
        const isDefinePropertyReliable = localRequire(9);
        const globalScope = localRequire(5);
        const isObject = localRequire(8);
        const hasOwnProperty = localRequire(14);
        const getObjectClass = localRequire(53);
        const setProperty = localRequire(16);
        const defineProperty = localRequire(23);
        const getPrototypeOf = localRequire(21);
        const wellKnownSymbol = localRequire(6);
        const generateSymbol = localRequire(45);

        const globalDataView = globalScope.DataView;
        const globalInt8Array = globalScope.Int8Array;
        const int8ArrayPrototype = globalInt8Array && globalInt8Array.prototype;
        const globalUint8ClampedArray = globalScope.Uint8ClampedArray;
        const uint8ClampedArrayPrototype = globalUint8ClampedArray && globalUint8ClampedArray.prototype;

        let TypedArrayBaseConstructor = globalInt8Array && getPrototypeOf(globalInt8Array);
        let TypedArrayPrototype = int8ArrayPrototype && getPrototypeOf(int8ArrayPrototype);
        const objectPrototype = Object.prototype;
        const isPrototypeOfCheck = objectPrototype.isPrototypeOf;
        const toStringTagSymbol = wellKnownSymbol('toStringTag');
        const typedArrayTagSymbol = generateSymbol('TYPED_ARRAY_TAG');

        const hasNativeArrayBuffer = !!(globalScope.ArrayBuffer && globalDataView);
        let hasNativeArrayBufferViews = hasNativeArrayBuffer && !!getPrototypeOf;
        let isShimNeededForToStringTag = false;

        const typedArrayElementSizes = {
            Int8Array: 1, Uint8Array: 1, Uint8ClampedArray: 1,
            Int16Array: 2, Uint16Array: 2,
            Int32Array: 4, Uint32Array: 4,
            Float32Array: 4, Float64Array: 8
        };

        const isTypedArray = (value) => {
            return isObject(value) && hasOwnProperty(typedArrayElementSizes, getObjectClass(value));
        };

        for (const typeName in typedArrayElementSizes) {
            if (!globalScope[typeName]) {
                hasNativeArrayBufferViews = false;
                break;
            }
        }

        if (!hasNativeArrayBufferViews || typeof TypedArrayBaseConstructor !== 'function' || TypedArrayBaseConstructor === Function.prototype) {
            TypedArrayBaseConstructor = function() { throw new TypeError("Incorrect invocation of TypedArray base constructor"); };
            if (hasNativeArrayBufferViews) {
                for (const typeName in typedArrayElementSizes) {
                    if (globalScope[typeName]) {
                        setPrototypeOf(globalScope[typeName], TypedArrayBaseConstructor);
                    }
                }
            }
        }

        if (!hasNativeArrayBufferViews || !TypedArrayPrototype || TypedArrayPrototype === objectPrototype) {
            TypedArrayPrototype = TypedArrayBaseConstructor.prototype;
            if (hasNativeArrayBufferViews) {
                for (const typeName in typedArrayElementSizes) {
                    if (globalScope[typeName]) {
                        setPrototypeOf(globalScope[typeName].prototype, TypedArrayPrototype);
                    }
                }
            }
        }

        if (hasNativeArrayBufferViews && uint8ClampedArrayPrototype && getPrototypeOf(uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
            setPrototypeOf(uint8ClampedArrayPrototype, TypedArrayPrototype);
        }

        if (isDefinePropertyReliable && !hasOwnProperty(TypedArrayPrototype, toStringTagSymbol)) {
            isShimNeededForToStringTag = true;
            localRequire(11).f(TypedArrayPrototype, toStringTagSymbol, {
                get: function() {
                    return isObject(this) ? this[typedArrayTagSymbol] : undefined;
                }
            });
            for (const typeName in typedArrayElementSizes) {
                if (globalScope[typeName]) {
                    setProperty(globalScope[typeName], typedArrayTagSymbol, typeName);
                }
            }
        }

        if (hasNativeArrayBuffer && getPrototypeOf && getPrototypeOf(globalDataView.prototype) !== objectPrototype) {
            setPrototypeOf(globalDataView.prototype, objectPrototype);
        }

        moduleContext.exports = {
            NATIVE_ARRAY_BUFFER: hasNativeArrayBuffer,
            NATIVE_ARRAY_BUFFER_VIEWS: hasNativeArrayBufferViews,
            TYPED_ARRAY_TAG: isShimNeededForToStringTag && typedArrayTagSymbol,
            aTypedArray: function(typedArrayInstance) {
                if (isTypedArray(typedArrayInstance)) return typedArrayInstance;
                throw new TypeError("Target is not a typed array.");
            },
            aTypedArrayConstructor: function(constructorCandidate) {
                if (getPrototypeOf) {
                    if (isPrototypeOfCheck.call(TypedArrayBaseConstructor, constructorCandidate)) return constructorCandidate;
                } else {
                    for (const typeName in typedArrayElementSizes) {
                        if (hasOwnProperty(typedArrayElementSizes, typeName)) {
                            const nativeConstructor = globalScope[typeName];
                            if (nativeConstructor && (constructorCandidate === nativeConstructor || isPrototypeOfCheck.call(nativeConstructor, constructorCandidate))) {
                                return constructorCandidate;
                            }
                        }
                    }
                }
                throw new TypeError("Target is not a typed array constructor.");
            },
            exportProto: function(methodName, methodImplementation, forceOverwrite) {
                if (isDefinePropertyReliable) {
                    if (forceOverwrite) {
                        for (const typeName in typedArrayElementSizes) {
                            const nativeConstructor = globalScope[typeName];
                            if (nativeConstructor && hasOwnProperty(nativeConstructor.prototype, methodName)) {
                                delete nativeConstructor.prototype[methodName];
                            }
                        }
                    }
                    if (!TypedArrayPrototype[methodName] || forceOverwrite) {
                        defineProperty(TypedArrayPrototype, methodName, forceOverwrite ? methodImplementation : (hasNativeArrayBufferViews && int8ArrayPrototype[methodName]) || methodImplementation);
                    }
                }
            },
            exportStatic: function(methodName, methodImplementation, forceOverwrite) {
                let currentConstructor, typeName;
                if (isDefinePropertyReliable) {
                    if (getPrototypeOf) {
                        if (forceOverwrite) {
                            for (typeName in typedArrayElementSizes) {
                                currentConstructor = globalScope[typeName];
                                if (currentConstructor && hasOwnProperty(currentConstructor, methodName)) {
                                    delete currentConstructor[methodName];
                                }
                            }
                        }
                        if (!TypedArrayBaseConstructor[methodName] || forceOverwrite) {
                            try {
                                return defineProperty(TypedArrayBaseConstructor, methodName, forceOverwrite ? methodImplementation : (hasNativeArrayBufferViews && globalInt8Array[methodName]) || methodImplementation);
                            } catch (e) {
                                // Fallback for some non-configurable properties.
                            }
                        }
                    }
                    for (typeName in typedArrayElementSizes) {
                        currentConstructor = globalScope[typeName];
                        if (currentConstructor && (!currentConstructor[methodName] || forceOverwrite)) {
                            defineProperty(currentConstructor, methodName, methodImplementation);
                        }
                    }
                }
            },
            isView: function(value) {
                const objectClass = getObjectClass(value);
                return objectClass === 'DataView' || hasOwnProperty(typedArrayElementSizes, objectClass);
            },
            isTypedArray: isTypedArray,
            TypedArray: TypedArrayBaseConstructor,
            TypedArrayPrototype: TypedArrayPrototype
        };
    },

    /* Module 34: Metadata Utility */
    function(moduleContext, moduleExports, localRequire) {
        const createMap = localRequire(88); // Module 88 likely provides a Map-like structure.
        const createStrongMap = localRequire(96); // Module 96 likely provides a StrongMap or similar.
        const sharedData = localRequire(38); // Shared data registry.

        const metadataSymbol = sharedData('metadata');
        const metadataStore = metadataSymbol.store || (metadataSymbol.store = new createStrongMap());

        const getMetadataMap = (target, metadataKey, createIfMissing) => {
            let targetMetadata = metadataStore.get(target);
            if (!targetMetadata) {
                if (!createIfMissing) return undefined;
                metadataStore.set(target, targetMetadata = new createMap());
            }
            let keyMetadata = targetMetadata.get(metadataKey);
            if (!keyMetadata) {
                if (!createIfMissing) return undefined;
                targetMetadata.set(metadataKey, keyMetadata = new createMap());
            }
            return keyMetadata;
        };

        moduleContext.exports = {
            store: metadataStore,
            getMap: getMetadataMap,
            has: function(metadataKey, target, propertyKey) {
                const map = getMetadataMap(target, propertyKey, false);
                return map !== undefined && map.has(metadataKey);
            },
            get: function(metadataKey, target, propertyKey) {
                const map = getMetadataMap(target, propertyKey, false);
                return map === undefined ? undefined : map.get(metadataKey);
            },
            set: function(metadataKey, metadataValue, target, propertyKey) {
                getMetadataMap(target, propertyKey, true).set(metadataKey, metadataValue);
            },
            keys: function(target, propertyKey) {
                const map = getMetadataMap(target, propertyKey, false);
                const keysArray = [];
                if (map) {
                    map.forEach((value, key) => {
                        keysArray.push(key);
                    });
                }
                return keysArray;
            },
            toKey: function(value) {
                return value === undefined || typeof value === 'symbol' ? value : String(value);
            }
        };
    },

    /* Module 35: Property Descriptor Creator */
    function(moduleContext, moduleExports) {
        /**
         * Creates a property descriptor object with specified attributes.
         * @param {number} attributeFlags - A bitmask for property attributes (1=enumerable, 2=configurable, 4=writable).
         * @param {any} propertyValue - The value of the property.
         * @returns {object} A property descriptor object.
         */
        moduleContext.exports = function(attributeFlags, propertyValue) {
            return {
                enumerable: (attributeFlags & 1) === 0, // Not enumerable if bit 1 is set.
                configurable: (attributeFlags & 2) === 0, // Not configurable if bit 2 is set.
                writable: (attributeFlags & 4) === 0, // Not writable if bit 4 is set.
                value: propertyValue // The actual value.
            };
        };
    },

    /* Module 36: Object.assign Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const defineObjectProperty = localRequire(23); // Utility to define properties.

        /**
         * Assigns properties from source objects to a target object.
         * @param {object} target - The target object to which properties will be assigned.
         * @param {object} sourceMethods - An object containing methods to assign.
         * @param {object} [options] - Optional configuration for property definition.
         * @returns {object} The modified target object.
         */
        moduleContext.exports = function(target, sourceMethods, options) {
            for (const methodKey in sourceMethods) {
                defineObjectProperty(target, methodKey, sourceMethods[methodKey], options);
            }
            return target;
        };
    },

    /* Module 37: Set Values Iterator */
    function(moduleContext, moduleExports, localRequire) {
        const isPureEnvironment = localRequire(2); // Boolean indicating if environment is "pure".
        const setValuesIterator = localRequire(57); // Native Set.prototype.values.

        /**
         * Provides an iterator for the values of a Set.
         * This module might use a polyfilled version if the environment is not "pure".
         * @param {Set} setInstance - The Set instance to iterate.
         * @returns {Iterator} An iterator for the Set's values.
         */
        moduleContext.exports = isPureEnvironment ?
          setValuesIterator :
          function(setInstance) {
            return Reflect.apply(Set.prototype.values, setInstance, []);
          };
    },

    /* Module 38: Shared Data Registry */
    function(moduleContext, moduleExports, localRequire) {
        const globalObject = localRequire(5);
        const createGlobalProperty = localRequire(79); // Utility to create global property.
        const isPureEnvironment = localRequire(2);

        const sharedRegistry = globalObject['__core-js_shared__'] || createGlobalProperty('__core-js_shared__', {});

        moduleContext.exports = function(key, defaultValue) {
            return sharedRegistry[key] || (sharedRegistry[key] = defaultValue !== undefined ? defaultValue : {});
        };

        sharedRegistry('versions', []).push({
            version: '3.1.3',
            mode: isPureEnvironment ? 'pure' : 'global',
            copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
        });
    },

    /* Module 39: Object.getOwnPropertyNames Wrapper */
    function(moduleContext, moduleExports, localRequire) {
        const getEnumerableKeys = localRequire(101); // Utility to get enumerable keys.
        const internalKeysList = localRequire(82).concat('length', 'prototype'); // Internal keys to exclude.

        moduleExports.f = Object.getOwnPropertyNames || function(object) {
            return getEnumerableKeys(object, internalKeysList);
        };
    },

    /* Module 40: Define Data Property */
    function(moduleContext, moduleExports, localRequire) {
        const toPrimitiveKey = localRequire(29);
        const defineObjectProperty = localRequire(11);
        const createPropertyDescriptor = localRequire(35);

        moduleContext.exports = function(targetObject, propertyKey, propertyValue) {
            const primitiveKey = toPrimitiveKey(propertyKey);
            if (Reflect.has(targetObject, primitiveKey)) {
                defineProperty.f(targetObject, primitiveKey, createPropertyDescriptor(0, propertyValue));
            } else {
                targetObject[primitiveKey] = propertyValue;
            }
        };
    },

    /* Module 41: Array Unscopables */
    function(moduleContext, moduleExports, localRequire) {
        const wellKnownSymbol = localRequire(6);
        const createNullObject = localRequire(30);
        const setProperty = localRequire(16);

        const unscopablesSymbol = wellKnownSymbol('unscopables');
        const arrayPrototype = Array.prototype;

        if (arrayPrototype[unscopablesSymbol] === null || arrayPrototype[unscopablesSymbol] === undefined) {
            setProperty(arrayPrototype, unscopablesSymbol, createNullObject(null));
        }

        moduleContext.exports = function(propertyName) {
            arrayPrototype[unscopablesSymbol][propertyName] = true;
        };
    },

    /* Module 42: Object.setPrototypeOf Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const ensureObject = localRequire(1);
        const ensureObjectOrNull = localRequire(111);

        // Check for __proto__ support and define a setter.
        const hasProto = '__proto__' in {};
        const nativeSetPrototypeOf = Object.setPrototypeOf;

        if (nativeSetPrototypeOf) {
            moduleContext.exports = nativeSetPrototypeOf;
        } else if (hasProto) {
            moduleContext.exports = (function() {
                let protoSetter;
                let isArrayInheritanceWorking = false;
                const testObject = {};
                try {
                    protoSetter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
                    Reflect.apply(protoSetter, testObject, [[]]);
                    isArrayInheritanceWorking = testObject instanceof Array;
                } catch (e) {}

                return function(target, proto) {
                    ensureObject(target);
                    ensureObjectOrNull(proto);
                    if (isArrayInheritanceWorking) {
                        Reflect.apply(protoSetter, target, [proto]);
                    } else {
                        target.__proto__ = proto;
                    }
                    return target;
                };
            })();
        } else {
            moduleContext.exports = undefined; // No polyfill possible.
        }
    },

    /* Module 43: Set Symbol.species */
    function(moduleContext, moduleExports, localRequire) {
        const globalPropertyAccessor = localRequire(12);
        const defineProperty = localRequire(11);
        const wellKnownSymbol = localRequire(6);
        const isDefinePropertyReliable = localRequire(9);

        const speciesSymbol = wellKnownSymbol('species');

        moduleContext.exports = function(targetTypeName) {
            const targetConstructor = globalPropertyAccessor(targetTypeName);
            const definePropertyFn = defineProperty.f;

            if (isDefinePropertyReliable && targetConstructor && !targetConstructor[speciesSymbol]) {
                definePropertyFn(targetConstructor, speciesSymbol, {
                    configurable: true,
                    get: function() {
                        return this;
                    }
                });
            }
        };
    },

    /* Module 44: RegExp Flags Getter */
    function(moduleContext, moduleExports, localRequire) {
        const ensureObject = localRequire(1);

        moduleContext.exports = function() {
            const regexpInstance = ensureObject(this);
            let flags = '';
            if (regexpInstance.global) flags += 'g';
            if (regexpInstance.ignoreCase) flags += 'i';
            if (regexpInstance.multiline) flags += 'm';
            if (regexpInstance.dotAll) flags += 's';
            if (regexpInstance.unicode) flags += 'u';
            if (regexpInstance.sticky) flags += 'y';
            return flags;
        };
    },

    /* Module 45: Symbol ID Generator */
    function(moduleContext, moduleExports) {
        let symbolIdCounter = 0;
        const mathRandom = Math.random();

        moduleContext.exports = function(description) {
            const base = description === undefined ? '' : String(description);
            symbolIdCounter += 1;
            return `Symbol(${base})_${symbolIdCounter + mathRandom.toString(36)}`;
        };
    },

    /* Module 46: Hidden Keys Map */
    function(moduleContext, moduleExports) {
        moduleContext.exports = {};
    },

    /* Module 47: Array.isArray Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const getObjectClass = localRequire(28);

        moduleContext.exports = Array.isArray || function(value) {
            return getObjectClass(value) === 'Array';
        };
    },

    /* Module 48: Array Iteration Methods */
    function(moduleContext, moduleExports, localRequire) {
        const bindFunction = localRequire(13);
        const toIndexedObject = localRequire(77);
        const toObject = localRequire(15);
        const getLength = localRequire(10);
        const arraySpeciesConstructor = localRequire(49);

        const arrayPush = [].push;

        const createArrayMethod = (methodType) => {
            // methodType: 1 = map, 2 = filter, 3 = some, 4 = every, 5 = find, 6 = findIndex, 0 = forEach
            const isMap = methodType === 1;
            const isFilter = methodType === 2;
            const isSome = methodType === 3;
            const isEvery = methodType === 4;
            const isFind = methodType === 5;
            const isFindIndex = methodType === 6;
            const isPredicateMethod = isFind || isFindIndex || isSome;

            return function(target, callback, thisArg, extraArg) {
                const objectTarget = toObject(target);
                const indexedObject = toIndexedObject(objectTarget);
                const collectionLength = getLength(indexedObject.length);
                const boundCallback = bindFunction(callback, thisArg, isPredicateMethod ? 3 : 1);

                let resultCollection;
                if (isMap) {
                    resultCollection = arraySpeciesConstructor(objectTarget, collectionLength);
                } else if (isFilter) {
                    resultCollection = arraySpeciesConstructor(objectTarget, 0);
                }

                for (let index = 0; index < collectionLength; index++) {
                    if (Reflect.has(indexedObject, index)) { // Check if index exists to handle sparse arrays
                        const element = indexedObject[index];
                        const callbackResult = boundCallback(element, index, objectTarget);

                        if (methodType === 0) { // forEach
                            // No action needed for forEach here, callback is executed for side effects.
                        } else if (isMap) { // map
                            resultCollection[index] = callbackResult;
                        } else if (isFilter) { // filter
                            if (callbackResult) {
                                arrayPush.call(resultCollection, element);
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
                                return element;
                            }
                        } else if (isFindIndex) { // findIndex
                            if (callbackResult) {
                                return index;
                            }
                        }
                    }
                }
                return isSome ? false : isEvery ? true : isFindIndex ? -1 : resultCollection;
            };
        };

        moduleContext.exports = {
            forEach: createArrayMethod(0),
            map: createArrayMethod(1),
            filter: createArrayMethod(2),
            some: createArrayMethod(3),
            every: createArrayMethod(4),
            find: createArrayMethod(5),
            findIndex: createArrayMethod(6)
        };
    },

    /* Module 49: Array Species Constructor */
    function(moduleContext, moduleExports, localRequire) {
        const isObject = localRequire(8);
        const isArray = localRequire(47);
        const wellKnownSymbolSpecies = localRequire(6)('species');

        moduleContext.exports = function(originalArray, arrayLength) {
            let constructorFromSpecies;
            if (isArray(originalArray)) {
                const originalConstructor = originalArray.constructor;
                if (typeof originalConstructor === 'function' && originalConstructor !== Array && !isArray(originalConstructor.prototype)) {
                    if (isObject(originalConstructor)) {
                        constructorFromSpecies = originalConstructor[wellKnownSymbolSpecies];
                        if (constructorFromSpecies === null || constructorFromSpecies === undefined) {
                            constructorFromSpecies = undefined;
                        }
                    } else {
                        constructorFromSpecies = undefined;
                    }
                } else {
                    constructorFromSpecies = undefined;
                }
            }
            return new (constructorFromSpecies === undefined ? Array : constructorFromSpecies)(arrayLength === 0 ? 0 : arrayLength);
        };
    },

    /* Module 50: Array Method Tester */
    function(moduleContext, moduleExports, localRequire) {
        const errorTestingUtility = localRequire(7);
        const wellKnownSymbolSpecies = localRequire(6)('species');

        moduleContext.exports = function(methodName) {
            return !errorTestingUtility(function() {
                const testArray = [];
                const testConstructor = (testArray.constructor = {});
                testConstructor[wellKnownSymbolSpecies] = function() {
                    return { foo: 1 };
                };
                return testArray[methodName](Boolean).foo !== 1;
            });
        };
    },

    /* Module 51: Iterable Protocol Registry */
    function(moduleContext, moduleExports) {
        moduleContext.exports = {};
    },

    /* Module 52: Get Iterator Method */
    function(moduleContext, moduleExports, localRequire) {
        const getObjectClass = localRequire(53);
        const iterableRegistry = localRequire(51);
        const wellKnownSymbolIterator = localRequire(6)('iterator');

        moduleContext.exports = function(object) {
            if (object === null || object === undefined) return undefined;
            return object[wellKnownSymbolIterator] || object['@@iterator'] || iterableRegistry[getObjectClass(object)];
        };
    },

    /* Module 53: Get Object Type Tag */
    function(moduleContext, moduleExports, localRequire) {
        const getObjectClass = localRequire(28);
        const wellKnownSymbolToStringTag = localRequire(6)('toStringTag');
        const isArguments = getObjectClass(function() { return arguments; }()) === 'Arguments';

        moduleContext.exports = function(value) {
            let toStringTagProperty, objectValue, classTag;
            if (value === undefined) return 'Undefined';
            if (value === null) return 'Null';

            objectValue = Object(value);
            try {
                toStringTagProperty = objectValue[wellKnownSymbolToStringTag];
            } catch (e) { /* ignore */ }

            if (typeof toStringTagProperty === 'string') return toStringTagProperty;
            classTag = getObjectClass(objectValue);
            return isArguments ?
                (classTag === 'Object' && typeof objectValue.callee === 'function' ? 'Arguments' : classTag) :
                classTag;
        };
    },

    /* Module 54: Iterator Creator */
    function(moduleContext, moduleExports, localRequire) {
        const iteratorPrototype = localRequire(109).IteratorPrototype;
        const createObjectWithPrototype = localRequire(30);
        const createPropertyDescriptor = localRequire(35);
        const setToStringTag = localRequire(26);
        const iterableRegistry = localRequire(51);

        const iteratorNextMethod = function() { return this; }; // Default .next() for non-implemented iterators.

        moduleContext.exports = function(constructor, className, nextMethod) {
            const fullClassName = className + ' Iterator';
            constructor.prototype = createObjectWithPrototype(iteratorPrototype, {
                next: createPropertyDescriptor(1, nextMethod)
            });
            setToStringTag(constructor, fullClassName, false);
            iterableRegistry[fullClassName] = iteratorNextMethod;
            return constructor;
        };
    },

    /* Module 55: Promise Capability Creator */
    function(moduleContext, moduleExports, localRequire) {
        const ensureIsFunction = localRequire(4);

        const PromiseCapability = function(PromiseConstructor) {
            let resolveFn, rejectFn;
            this.promise = new PromiseConstructor(function(resolve, reject) {
                if (resolveFn !== undefined || rejectFn !== undefined) {
                    throw new TypeError("Bad Promise constructor - resolve/reject already defined");
                }
                resolveFn = resolve;
                rejectFn = reject;
            });
            this.resolve = ensureIsFunction(resolveFn);
            this.reject = ensureIsFunction(rejectFn);
        };

        moduleExports.f = function(PromiseConstructor) {
            return new PromiseCapability(PromiseConstructor);
        };
    },

    /* Module 56: String Character Access */
    function(moduleContext, moduleExports, localRequire) {
        const toLength = localRequire(24);
        const ensureNotNullish = localRequire(17);

        const getCharOrCode = function(returnChar) {
            return function(inputString, position) {
                const stringValue = String(ensureNotNullish(inputString));
                const charPosition = toLength(position);
                const stringLength = stringValue.length;

                if (charPosition < 0 || charPosition >= stringLength) {
                    return returnChar ? '' : undefined;
                }

                const firstCode = stringValue.charCodeAt(charPosition);
                // Check for surrogate pairs (high surrogate followed by low surrogate).
                if (firstCode < 0xD800 || firstCode > 0xDBFF || charPosition + 1 === stringLength) {
                    return returnChar ? stringValue.charAt(charPosition) : firstCode;
                }
                const secondCode = stringValue.charCodeAt(charPosition + 1);
                if (secondCode < 0xDC00 || secondCode > 0xDFFF) {
                    return returnChar ? stringValue.charAt(charPosition) : firstCode;
                }
                // If it's a surrogate pair, return both characters or the full code point.
                return returnChar ? stringValue.slice(charPosition, charPosition + 2) : (secondCode - 0xDC00 + ((firstCode - 0xD800) << 10) + 0x10000);
            };
        };

        moduleContext.exports = {
            codeAt: getCharOrCode(false),
            charAt: getCharOrCode(true)
        };
    },

    /* Module 57: Get Iterator */
    function(moduleContext, moduleExports, localRequire) {
        const ensureObject = localRequire(1);
        const getIteratorMethod = localRequire(52);

        moduleContext.exports = function(iterable) {
            const iteratorMethod = getIteratorMethod(iterable);
            if (typeof iteratorMethod !== 'function') {
                throw new TypeError(`Value '${String(iterable)}' is not iterable.`);
            }
            return ensureObject(iteratorMethod.call(iterable));
        };
    },

    /* Module 58: Object.prototype.propertyIsEnumerable Wrapper */
    function(moduleContext, moduleExports) {
        const nativePropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
        const testObject = { 1: 2 };
        const isEnumerableBroken = nativePropertyIsEnumerable.call(testObject, 1) === false; // IE<9 bug.

        moduleExports.f = isEnumerableBroken ?
          function(propertyKey) {
            const descriptor = Object.getOwnPropertyDescriptor(this, propertyKey);
            return !!descriptor && descriptor.enumerable;
          } :
          nativePropertyIsEnumerable;
    },

    /* Module 59: Unique ID Generator for Internal Use */
    function(moduleContext, moduleExports, localRequire) {
        const sharedRegistry = localRequire(38);
        const generateSymbolId = localRequire(45);

        const internalKeysRegistry = sharedRegistry('keys');

        moduleContext.exports = function(keyName) {
            return internalKeysRegistry[keyName] || (internalKeysRegistry[keyName] = generateSymbolId(keyName));
        };
    },

    /* Module 60: Array Search Methods */
    function(moduleContext, moduleExports, localRequire) {
        const toIndexedObject = localRequire(25);
        const getLength = localRequire(10);
        const toAbsoluteIndex = localRequire(61);

        const createSearchMethod = (isIncludes) => {
            return function(target, searchElement, startIndex) {
                const indexedObject = toIndexedObject(target);
                const objectLength = getLength(indexedObject.length);
                let currentIndex = toAbsoluteIndex(startIndex, objectLength);

                // Handle NaN values for `includes` method.
                if (isIncludes && searchElement !== searchElement) {
                    while (objectLength > currentIndex) {
                        if (Reflect.has(indexedObject, currentIndex) && indexedObject[currentIndex] !== indexedObject[currentIndex]) {
                            return true;
                        }
                        currentIndex++;
                    }
                } else {
                    for (; objectLength > currentIndex; currentIndex++) {
                        if (Reflect.has(indexedObject, currentIndex) && indexedObject[currentIndex] === searchElement) {
                            return isIncludes || currentIndex; // For indexOf, return index; for includes, return true.
                        }
                    }
                }
                return isIncludes ? false : -1;
            };
        };

        moduleContext.exports = {
            includes: createSearchMethod(true),
            indexOf: createSearchMethod(false)
        };
    },

    /* Module 61: ToAbsoluteIndex Conversion */
    function(moduleContext, moduleExports, localRequire) {
        const toInteger = localRequire(24);
        const mathMax = Math.max;
        const mathMin = Math.min;

        moduleContext.exports = function(index, length) {
            const intIndex = toInteger(index);
            const absoluteIndex = intIndex < 0 ? mathMax(intIndex + length, 0) : mathMin(intIndex, length);
            return absoluteIndex;
        };
    },

    /* Module 62: Feature Polyfill Check */
    function(moduleContext, moduleExports, localRequire) {
        const errorTestingUtility = localRequire(7);

        const featureRegistry = moduleContext.exports = function(featureName, isForced) {
            const featureData = featureRegistry.data[featureRegistry.normalize(featureName)];
            return featureData === featureRegistry.POLYFILL || (featureData !== featureRegistry.NATIVE && (typeof isForced === 'function' ? errorTestingUtility(isForced) : !!isForced));
        };

        featureRegistry.normalize = function(name) {
            return String(name).replace(/#|\.prototype\./, '.').toLowerCase();
        };

        featureRegistry.data = {};
        featureRegistry.NATIVE = 'N';
        featureRegistry.POLYFILL = 'P';
    },

    /* Module 63: Object.keys Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const getEnumerableKeys = localRequire(101);
        const internalKeys = localRequire(82);

        moduleContext.exports = Object.keys || function(object) {
            return getEnumerableKeys(object, internalKeys);
        };
    },

    /* Module 64: Iterable Check Utility */
    function(moduleContext, moduleExports, localRequire) {
        const wellKnownSymbolIterator = localRequire(6)('iterator');
        let iteratorWorks = false;

        try {
            let iterationCount = 0;
            const iterable = {
                next: function() { return { done: !!iterationCount++ }; },
                return: function() { iteratorWorks = true; return {}; }
            };
            iterable[wellKnownSymbolIterator] = function() { return this; };
            Array.from(iterable, function() { throw 2; });
        } catch (e) {}

        moduleContext.exports = function(testFunction, strictCheck) {
            if (!strictCheck && !iteratorWorks) return false;
            let result = false;
            try {
                const iterable = {};
                iterable[wellKnownSymbolIterator] = function() {
                    return {
                        next: function() { return { done: (result = true) }; }
                    };
                };
                testFunction(iterable);
            } catch (e) {}
            return result;
        };
    },

    /* Module 65: Collection Helper (Map/Set/WeakMap/WeakSet) */
    function(moduleContext, moduleExports, localRequire) {
        const defineFeature = localRequire(0);
        const globalScope = localRequire(5);
        const isPolyfillRequired = localRequire(62);
        const defineProperty = localRequire(23);
        const collectionHelper = localRequire(66);
        const executeIteration = localRequire(3);
        const createObjectInstance = localRequire(31);
        const isObject = localRequire(8);
        const errorTestingUtility = localRequire(7);
        const checkIterable = localRequire(64);
        const setToStringTag = localRequire(26);
        const inheritPrototype = localRequire(113);

        moduleContext.exports = function(collectionName, constructorFactory, collectionMethods, isWeak) {
            let globalCollection = globalScope[collectionName];
            let collectionPrototype = globalCollection && globalCollection.prototype;
            let currentCollection = globalCollection;
            const methodsToImplement = {};

            const addMethod = function(methodKey) {
                const originalMethod = collectionPrototype[methodKey];
                defineProperty(collectionPrototype, methodKey, methodKey === 'add' ?
                    function(value) {
                        return Reflect.apply(originalMethod, this, [value === 0 ? 0 : value]);
                    } :
                    methodKey === 'delete' ?
                    function(value) {
                        return !(isWeak && !isObject(value)) && Reflect.apply(originalMethod, this, [value === 0 ? 0 : value]);
                    } :
                    methodKey === 'get' ?
                    function(value) {
                        return (isWeak && !isObject(value)) ? undefined : Reflect.apply(originalMethod, this, [value === 0 ? 0 : value]);
                    } :
                    methodKey === 'has' ?
                    function(value) {
                        return !(isWeak && !isObject(value)) && Reflect.apply(originalMethod, this, [value === 0 ? 0 : value]);
                    } :
                    function(key, value) {
                        Reflect.apply(originalMethod, this, [key === 0 ? 0 : key, value]);
                        return this;
                    }
                );
            };

            if (isPolyfillRequired(collectionName, typeof globalCollection !== 'function' || !(isWeak || collectionPrototype.forEach && !errorTestingUtility(function() {
                (new globalCollection()).entries().next();
            })))) {
                currentCollection = collectionHelper.getConstructor(constructorFactory, collectionName, isWeak, isWeak ? 'set' : 'add');
                collectionHelper.REQUIRED = true;
            } else if (isPolyfillRequired(collectionName, true)) {
                const tempInstance = new currentCollection();
                const addReturnsThis = Reflect.apply(tempInstance[isWeak ? 'set' : 'add'], tempInstance, [isWeak ? {} : 0, 1]) === tempInstance;
                const hasNegativeZeroBug = errorTestingUtility(function() { tempInstance.has(1); });
                const iterableConstructorTest = checkIterable(function(iterable) { new globalCollection(iterable); });
                const hasNegativeZeroEntryBug = !isWeak && errorTestingUtility(function() {
                    for (let i = 5; i--;) tempInstance[isWeak ? 'set' : 'add'](i, i);
                    return !tempInstance.has(-0);
                });

                if (iterableConstructorTest || hasNegativeZeroEntryBug) {
                    currentCollection = constructorFactory(function(instance, iterable) {
                        createObjectInstance(instance, currentCollection, collectionName);
                        const newInstance = inheritPrototype(new globalCollection(), instance, currentCollection);
                        if (iterable !== null && iterable !== undefined) {
                            executeIteration(iterable, Reflect.apply(newInstance[isWeak ? 'set' : 'add'], newInstance, []), newInstance, isWeak);
                        }
                        return newInstance;
                    });
                    currentCollection.prototype = collectionPrototype;
                    collectionPrototype.constructor = currentCollection;
                }

                if (hasNegativeZeroBug || !addReturnsThis) {
                    addMethod('delete');
                    addMethod('has');
                    isWeak && addMethod('get');
                    addMethod(isWeak ? 'set' : 'add');
                }
                isWeak && collectionPrototype.clear && delete collectionPrototype.clear;
            }

            methodsToImplement[collectionName] = currentCollection;
            defineFeature({
                global: true,
                forced: currentCollection !== globalCollection
            }, methodsToImplement);

            setToStringTag(currentCollection, collectionName);
            !isWeak && collectionHelper.setStrong(currentCollection, collectionName, isWeak);
            return currentCollection;
        };
    },

    /* Module 66: Collection Helper (Internal Data Management) */
    function(moduleContext, moduleExports, localRequire) {
        const internalKeyRegistry = localRequire(46);
        const isObject = localRequire(8);
        const hasOwnProperty = localRequire(14);
        const defineProperty = localRequire(11).f;
        const generateSymbolId = localRequire(45);
        const isExtensible = localRequire(112); // Check if object is extensible.

        const internalMetaKey = generateSymbolId('meta');
        let uniqueIdCounter = 0;

        const makeNonExtensible = Object.isExtensible || function() { return true; }; // Fallback for Object.isExtensible

        const addInternalMeta = function(object) {
            defineProperty(object, internalMetaKey, {
                value: {
                    objectID: 'O' + (++uniqueIdCounter),
                    weakData: {}
                }
            });
        };

        const collectionHelper = moduleContext.exports = {
            REQUIRED: false,
            fastKey: function(object, createIfMissing) {
                if (!isObject(object)) {
                    return typeof object === 'symbol' ? object : (typeof object === 'string' ? 'S' : 'P') + object;
                }
                if (!hasOwnProperty(object, internalMetaKey)) {
                    if (!makeNonExtensible(object)) return 'F';
                    if (!createIfMissing) return 'E';
                    addInternalMeta(object);
                }
                return object[internalMetaKey].objectID;
            },
            getWeakData: function(object, createIfMissing) {
                if (!hasOwnProperty(object, internalMetaKey)) {
                    if (!makeNonExtensible(object)) return true;
                    if (!createIfMissing) return false;
                    addInternalMeta(object);
                }
                return object[internalMetaKey].weakData;
            },
            onFreeze: function(object) {
                if (isExtensible && collectionHelper.REQUIRED && makeNonExtensible(object) && !hasOwnProperty(object, internalMetaKey)) {
                    addInternalMeta(object);
                }
                return object;
            }
        };

        internalKeyRegistry[internalMetaKey] = true;
    },

    /* Module 67: Object.prototype.__defineGetter__ Feature Test */
    function(moduleContext, moduleExports, localRequire) {
        const isPureEnvironment = localRequire(2);
        const errorTestingUtility = localRequire(7);
        const globalScope = localRequire(5);

        moduleContext.exports = isPureEnvironment || !errorTestingUtility(function() {
            let testProperty = Math.random();
            // Use __defineSetter__ which is usually paired with __defineGetter__.
            // If it throws, it means these are not available or broken.
            Reflect.apply(globalScope.__defineSetter__, null, [testProperty, function() {}]);
            delete globalScope[testProperty];
            return true; // If no error, the test passes, so we return true for the 'forced' flag.
        });
    },

    /* Module 68: Safe Function Execution */
    function(moduleContext, moduleExports) {
        moduleContext.exports = function(func) {
            try {
                return { error: false, value: Reflect.apply(func, undefined, []) };
            } catch (error) {
                return { error: true, value: error };
            }
        };
    },

    /* Module 69: RegExp Check */
    function(moduleContext, moduleExports, localRequire) {
        const isObject = localRequire(8);
        const getObjectClass = localRequire(28);
        const wellKnownSymbolMatch = localRequire(6)('match');

        moduleContext.exports = function(value) {
            if (!isObject(value)) return false;
            const matchProperty = value[wellKnownSymbolMatch];
            return matchProperty !== undefined ? !!matchProperty : getObjectClass(value) === 'RegExp';
        };
    },

    /* Module 70: String.prototype Methods with RegExp */
    function(moduleContext, moduleExports, localRequire) {
        const setProperty = localRequire(16);
        const defineProperty = localRequire(23);
        const errorTestingUtility = localRequire(7);
        const wellKnownSymbol = localRequire(6);
        const isRegExp = localRequire(92);

        const speciesSymbol = wellKnownSymbol('species');

        const testReplaceWithGroups = !errorTestingUtility(function() {
            const regex = /./;
            regex.exec = function() {
                const result = [];
                result.groups = { a: '7' };
                return result;
            };
            return ''.replace(regex, '$<a>') !== '7';
        });

        const testSplitWithEmptyCapture = !errorTestingUtility(function() {
            const regex = /(?:)/;
            const originalExec = regex.exec;
            regex.exec = function() {
                return Reflect.apply(originalExec, this, arguments);
            };
            const splitResult = 'ab'.split(regex);
            return splitResult.length !== 2 || splitResult[0] !== 'a' || splitResult[1] !== 'b';
        });

        moduleContext.exports = function(methodName, argumentCount, nativeMethod, nativeImplementations) {
            const methodSymbol = wellKnownSymbol(methodName);

            const isMethodBroken = !errorTestingUtility(function() {
                const obj = {};
                obj[methodSymbol] = function() { return 7; };
                return ''[methodName](obj) !== 7;
            });

            const isMethodBrokenBySpecies = isMethodBroken && !errorTestingUtility(function() {
                const regex = /a/;
                regex.exec = function() {
                    let called = false;
                    return function() { called = true; return null; };
                }();
                if (methodName === 'split') {
                    regex.constructor = {};
                    regex.constructor[speciesSymbol] = function() { return regex; };
                }
                regex[methodSymbol]('');
                return called;
            });

            if (!isMethodBroken || !isMethodBrokenBySpecies || (methodName === 'replace' && !testReplaceWithGroups) || (methodName === 'split' && !testSplitWithEmptyCapture)) {
                const originalMethod = /./[methodSymbol];
                const newImplementations = nativeMethod(methodSymbol, ''[methodName], function(originalStringMethod, regexInstance, stringValue, args, fallback) {
                    if (regexInstance.exec === isRegExp) {
                        return isMethodBroken && !fallback ?
                            { done: true, value: Reflect.apply(originalMethod, regexInstance, [stringValue, args]) } :
                            { done: true, value: Reflect.apply(originalStringMethod, stringValue, [regexInstance, args]) };
                    }
                    return { done: false };
                });
                const newStringMethod = newImplementations[0];
                const newRegExpMethod = newImplementations[1];

                defineProperty(String.prototype, methodName, newStringMethod);
                defineProperty(RegExp.prototype, methodSymbol, argumentCount === 2 ?
                    function(stringValue, args) {
                        return Reflect.apply(newRegExpMethod, stringValue, [this, args]);
                    } :
                    function(stringValue) {
                        return Reflect.apply(newRegExpMethod, stringValue, [this]);
                    }
                );
                nativeImplementations && setProperty(RegExp.prototype[methodSymbol], 'sham', true);
            }
        };
    },

    /* Module 71: String Index Advancement */
    function(moduleContext, moduleExports) {
        const stringCharAt = localRequire(56).charAt;

        moduleContext.exports = function(targetString, currentPosition, isUnicode) {
            return currentPosition + (isUnicode ? stringCharAt(targetString, currentPosition).length : 1);
        };
    },

    /* Module 72: RegExp.prototype.exec Wrapper */
    function(moduleContext, moduleExports, localRequire) {
        const getObjectClass = localRequire(28);
        const nativeRegExpExec = localRequire(92);

        moduleContext.exports = function(regexInstance, inputString) {
            const execMethod = regexInstance.exec;
            if (typeof execMethod === 'function') {
                const result = Reflect.apply(execMethod, regexInstance, [inputString]);
                if (typeof result !== 'object' && result !== null) {
                    throw new TypeError("RegExp exec method returned something other than an Object or null.");
                }
                return result;
            }
            if (getObjectClass(regexInstance) !== 'RegExp') {
                throw new TypeError("RegExp#exec called on incompatible receiver.");
            }
            return Reflect.apply(nativeRegExpExec, regexInstance, [inputString]);
        };
    },

    /* Module 73: String Trimming Utilities */
    function(moduleContext, moduleExports, localRequire) {
        const ensureNotNullish = localRequire(17);
        const whitespaceChars = '[' + localRequire(93) + ']'; // Whitespace characters.
        const startWhitespaceRegex = new RegExp('^' + whitespaceChars + whitespaceChars + '*');
        const endWhitespaceRegex = new RegExp(whitespaceChars + whitespaceChars + '*$');

        const createTrimFunction = function(trimType) {
            return function(inputString) {
                let processedString = String(ensureNotNullish(inputString));
                if ((trimType & 1) === 1) { // Trim start
                    processedString = processedString.replace(startWhitespaceRegex, '');
                }
                if ((trimType & 2) === 2) { // Trim end
                    processedString = processedString.replace(endWhitespaceRegex, '');
                }
                return processedString;
            };
        };

        moduleContext.exports = {
            start: createTrimFunction(1),
            end: createTrimFunction(2),
            trim: createTrimFunction(3)
        };
    },

    /* Module 74: Collection.prototype.deleteAll */
    function(moduleContext, moduleExports, localRequire) {
        const ensureIsFunction = localRequire(4);
        const ensureObject = localRequire(1);

        moduleContext.exports = function() {
            const collectionInstance = ensureObject(this);
            const deleteMethod = ensureIsFunction(collectionInstance.delete);
            let allDeleted = true;
            for (let i = 0; i < arguments.length; i++) {
                allDeleted = Reflect.apply(deleteMethod, collectionInstance, [arguments[i]]) && allDeleted;
            }
            return allDeleted;
        };
    },

    /* Module 75: Collection.from Utility */
    function(moduleContext, moduleExports, localRequire) {
        const ensureIsFunction = localRequire(4);
        const bindFunction = localRequire(13);
        const executeIteration = localRequire(3);

        moduleContext.exports = function(sourceIterable) {
            let mapFunction, argumentCount = arguments.length;
            const context = argumentCount > 1 ? arguments[1] : undefined;

            ensureIsFunction(this); // Ensure the constructor is a function.
            if (context !== undefined) {
                ensureIsFunction(context);
            }

            if (sourceIterable === null || sourceIterable === undefined) {
                return new this();
            }

            const elements = [];
            if (context !== undefined) {
                let index = 0;
                mapFunction = bindFunction(context, argumentCount > 2 ? arguments[2] : undefined, 2);
                executeIteration(sourceIterable, function(value) {
                    elements.push(mapFunction(value, index++));
                });
            } else {
                executeIteration(sourceIterable, elements.push, elements);
            }
            return new this(elements);
        };
    },

    /* Module 76: Collection.of Utility */
    function(moduleContext, moduleExports) {
        moduleContext.exports = function() {
            const argumentCount = arguments.length;
            const elements = new Array(argumentCount);
            for (let i = 0; i < argumentCount; i++) {
                elements[i] = arguments[i];
            }
            return new this(elements);
        };
    },

    /* Module 77: ToIndexedObject Conversion */
    function(moduleContext, moduleExports, localRequire) {
        const stringToArray = localRequire(67); // Module 67 is `Object.prototype.__defineGetter__ Feature Test`. This is incorrect.
        // Module 67 is `isEnumerableBroken` and `__defineGetter__` test. This is likely a minifier error.
        // Original: var e=n(7),o=n(28),i="".split;t.exports=e(function(){return!Object("z").propertyIsEnumerable(0)})?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object
        // It's checking for `propertyIsEnumerable` bug in older engines and then converting string to array of chars.
        // It should be `isEnumerableBroken` (Module 67 is not the right one) and `getObjectClass` (Module 28).

        const errorTestingUtility = localRequire(7);
        const getObjectClass = localRequire(28);
        const nativeStringSplit = ''.split;

        // Test if `propertyIsEnumerable` is broken for strings (e.g., IE < 9).
        const isStringEnumerableBroken = errorTestingUtility(function() {
            return !Object('z').propertyIsEnumerable(0);
        });

        moduleContext.exports = isStringEnumerableBroken ?
          function(value) {
            // If string enumerable is broken, convert string to array of characters.
            return getObjectClass(value) === 'String' ? nativeStringSplit.call(value, '') : Object(value);
          } :
          Object; // Otherwise, just convert to object.
    },

    /* Module 78: Create Element Utility */
    function(moduleContext, moduleExports, localRequire) {
        const globalScope = localRequire(5);
        const isObject = localRequire(8);

        const documentRef = globalScope.document;
        const canCreateElement = isObject(documentRef) && isObject(documentRef.createElement);

        moduleContext.exports = function(tagName) {
            return canCreateElement ? documentRef.createElement(tagName) : {};
        };
    },

    /* Module 79: Create Global Object */
    function(moduleContext, moduleExports, localRequire) {
        const globalScope = localRequire(5);
        const setProperty = localRequire(16);

        moduleContext.exports = function(propertyName, value) {
            try {
                setProperty(globalScope, propertyName, value);
            } catch (error) {
                globalScope[propertyName] = value;
            }
            return value;
        };
    },

    /* Module 80: Reflect.ownKeys Polyfill */
    function(moduleContext, moduleExports, localRequire) {
        const globalPropertyAccessor = localRequire(12);
        const getOwnPropertyNames = localRequire(39);
        const getOwnPropertySymbols = localRequire(83);
        const ensureObject = localRequire(1);

        moduleContext.exports = globalPropertyAccessor('Reflect', 'ownKeys') || function(object) {
            const validatedObject = ensureObject(object);
            const propertyNames = getOwnPropertyNames.f(validated