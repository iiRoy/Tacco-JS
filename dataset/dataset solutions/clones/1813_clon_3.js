// Self-executing anonymous function to encapsulate the Webpack runtime and application logic.
!function(moduleDefinitions) {
    // Cache for loaded modules. Keys are module IDs, values are module objects.
    var loadedModuleCache = {};

    /**
     * Custom implementation of a module loader.
     * @param {string|number} moduleId - The ID of the module to load.
     * @returns {*} The exports of the loaded module.
     */
    function loadModule(moduleId) {
        // If module is already in cache, return its exports.
        if (loadedModuleCache[moduleId]) {
            return loadedModuleCache[moduleId].exports;
        }

        // Create a new module object and add it to the cache.
        // i: module ID, l: loaded flag, exports: module exports object.
        var currentModule = loadedModuleCache[moduleId] = {
            moduleId: moduleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module function, passing the module object, its exports, and the loader itself.
        moduleDefinitions[moduleId].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            loadModule
        );

        // Mark the module as loaded.
        currentModule.isLoaded = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Store module definitions in the loader for later access.
    loadModule.moduleDefinitions = moduleDefinitions;
    // Store the module cache in the loader for later access.
    loadModule.moduleCache = loadedModuleCache;

    /**
     * Define a getter function for an export on an object.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {Function} getterFunction - The function to call to get the property value.
     */
    loadModule.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Check if the property already exists on the target object.
        // If not, define it using Object.defineProperty.
        if (!loadModule.hasOwnExport(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Set the getter function.
            });
        }
    };

    /**
     * Mark a module's exports as an ES module.
     * @param {object} exportsObject - The exports object to mark.
     */
    loadModule.markAsEsModule = function(exportsObject) {
        // If Symbol is available and Symbol.toStringTag is defined, set the toStringTag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Define __esModule property to true.
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    /**
     * Create a namespace object for a module.
     * This handles interop between ES modules and CommonJS.
     * @param {*} moduleValue - The module's value.
     * @param {number} mode - Flags indicating the type of module.
     * @returns {object} The namespace object.
     */
    loadModule.createNamespaceObject = function(moduleValue, mode) {
        // Flag 1: If it's a module ID, load it.
        if (mode & 1) {
            moduleValue = loadModule(moduleValue);
        }
        // Flag 8: If it's already a namespace object, return it.
        if (mode & 8) {
            return moduleValue;
        }
        // Flag 4: If it's an object and has __esModule, return it.
        if (mode & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Otherwise, create a new namespace object.
        var namespace = Object.create(null);
        // Mark it as an ES module.
        loadModule.markAsEsModule(namespace);
        // Set the default export.
        Object.defineProperty(namespace, 'default', {
            enumerable: true,
            value: moduleValue
        });
        // Flag 2: If it's not a string, copy all properties from the original module.
        if (mode & 2 && typeof moduleValue !== 'string') {
            for (var key in moduleValue) {
                loadModule.defineExportGetter(namespace, key, (function(k) {
                    return function() { return moduleValue[k]; };
                })(key));
            }
        }
        return namespace;
    };

    /**
     * Create a getter function for `default` export or the module itself.
     * @param {*} moduleValue - The module's value.
     * @returns {Function} A getter for the module.
     */
    loadModule.getDefaultExportGetter = function(moduleValue) {
        var getter = moduleValue && moduleValue.__esModule ?
            function() { return moduleValue['default']; } :
            function() { return moduleValue; };
        loadModule.defineExportGetter(getter, 'a', getter); // Add a convenience getter 'a'
        return getter;
    };

    /**
     * Check if an object has a given property.
     * @param {object} obj - The object to check.
     * @param {string} prop - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    loadModule.hasOwnExport = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Public path for assets (empty in this case).
    loadModule.publicPath = "";

    // Load the entry point module (module ID 78).
    loadModule(loadModule.moduleEntry = 78);
})([
    /* Module 0 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object (e.g., window or globalThis)
        var getOwnPropertyDescriptor = moduleLoader(50).f; // Object.getOwnPropertyDescriptor
        var definePropertyUtil = moduleLoader(16); // Utility to define properties
        var isObjectUtil = moduleLoader(26); // Utility to check if something is an object
        var assignGlobalProperty = moduleLoader(40); // Utility to assign a global property
        var copyProperties = moduleLoader(81); // Utility to copy properties
        var checkForceUpdate = moduleLoader(60); // Utility to check if a feature is forced

        moduleRef.exports = function(options, properties) {
            var targetProp = options.target;
            var isGlobalTarget = options.global;
            var isStaticTarget = options.stat;
            var targetHost;

            if (isGlobalTarget) {
                targetHost = globalObject;
            } else if (isStaticTarget) {
                targetHost = globalObject[targetProp] || assignGlobalProperty(targetProp, {});
            } else {
                targetHost = (globalObject[targetProp] || {}).prototype;
            }

            for (var propKey in properties) {
                var newPropValue = properties[propKey];
                var existingPropValue;

                if (options.noTargetGet) {
                    var descriptor = getOwnPropertyDescriptor(targetHost, propKey);
                    existingPropValue = descriptor && descriptor.value;
                } else {
                    existingPropValue = targetHost[propKey];
                }

                // Check if the property should be forced or if the existing value is undefined.
                if (!checkForceUpdate(isGlobalTarget ? propKey : targetProp + (isStaticTarget ? "." : "#") + propKey, options.forced) &&
                    existingPropValue !== undefined) {
                    // If types match, skip. Otherwise, copy properties.
                    if (typeof newPropValue === typeof existingPropValue) {
                        continue;
                    }
                    copyProperties(newPropValue, existingPropValue);
                }

                // If sham or existing value is sham, define property.
                if ((options.sham || (existingPropValue && existingPropValue.sham)) &&
                    definePropertyUtil) { // Ensure definePropertyUtil is available
                    definePropertyUtil(newPropValue, "sham", true);
                }
                isObjectUtil(targetHost, propKey, newPropValue, options);
            }
        };
    },

    /* Module 1 */
    function(moduleRef, exportsRef, moduleLoader) {
        var isObjectCheck = moduleLoader(9); // Utility to check if a value is an object
        moduleRef.exports = function(value) {
            if (!isObjectCheck(value)) {
                throw TypeError(String(value) + " is not an object or null");
            }
            return value;
        };
    },

    /* Module 2 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = false; // Indicates non-pure mode (global polyfills)
    },

    /* Module 3 */
    function(moduleRef, exportsRef, moduleLoader) {
        var validateObject = moduleLoader(1); // Utility to validate an object
        var getIteratorMethod = moduleLoader(93); // Utility to get an iterator method
        var getLength = moduleLoader(21); // Utility to get length
        var createBoundFunction = moduleLoader(7); // Utility to create a bound function
        var getIterator = moduleLoader(62); // Utility to get an iterator from a value
        var checkCompletion = moduleLoader(97); // Utility to check iterator completion

        /**
         * Represents a completion state of an iteration.
         * @param {boolean} stopped - True if the iteration was stopped early.
         * @param {*} result - The result of the iteration (if stopped).
         */
        var IterationCompletion = function(stopped, result) {
            this.stopped = stopped;
            this.result = result;
        };

        /**
         * Iterates over a collection.
         * @param {Iterable} iterable - The collection to iterate.
         * @param {Function} callback - The callback function for each item.
         * @param {*} [thisArg] - The 'this' context for the callback.
         * @param {boolean} [isEntries] - True if iterating entries (key-value pairs).
         * @param {boolean} [isEarlyExit] - True if the iteration can exit early.
         * @returns {IterationCompletion} The completion state.
         */
        (moduleRef.exports = function(iterable, callback, thisArg, isEntries, isEarlyExit) {
            var iteratorInstance,
                iterationResult,
                currentItem,
                boundCallback = createBoundFunction(callback, thisArg, isEntries ? 2 : 1);

            if (isEarlyExit) {
                iteratorInstance = iterable;
            } else {
                var iteratorCreator = getIterator(iterable);
                if (typeof iteratorCreator !== 'function') {
                    throw TypeError("Target is not iterable");
                }
                if (getIteratorMethod(iteratorCreator)) { // If it's a native array iterator
                    for (var i = 0, len = getLength(iterable.length); i < len; i++) {
                        var item = isEntries ?
                            boundCallback(validateObject(iterable[i])[0], iterable[i][1]) :
                            boundCallback(iterable[i]);
                        if (item && item instanceof IterationCompletion) {
                            return item;
                        }
                    }
                    return new IterationCompletion(false);
                }
                iteratorInstance = iteratorCreator.call(iterable);
            }

            for (var nextItemMethod = iteratorInstance.next; !(iterationResult = nextItemMethod.call(iteratorInstance)).done;) {
                var processedItem = checkCompletion(iteratorInstance, boundCallback, iterationResult.value, isEntries);
                if (typeof processedItem === 'object' && processedItem && processedItem instanceof IterationCompletion) {
                    return processedItem;
                }
            }
            return new IterationCompletion(false);
        }).stop = function(result) {
            return new IterationCompletion(true, result);
        };
    },

    /* Module 4 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(func) {
            if (typeof func !== 'function') {
                throw TypeError(String(func) + " is not a function");
            }
            return func;
        };
    },

    /* Module 5 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalScope = moduleLoader(8); // Global object
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var symbolRegistry = moduleLoader(42); // Symbol registry
        var symbolPolyfill = moduleLoader(43); // Symbol polyfill utility
        var supportsNativeSymbols = moduleLoader(61); // Check for native Symbol support
        var hasNativeSymbolSupport = moduleLoader(94); // Check for native Symbol support (different check)

        var wellKnownSymbols = symbolRegistry("wks");
        var nativeSymbol = globalScope.Symbol;
        var symbolCreator = hasNativeSymbolSupport ? nativeSymbol : (nativeSymbol && nativeSymbol.withoutSetter || symbolPolyfill);

        moduleRef.exports = function(symbolName) {
            // If the symbol is already in the registry, return it.
            // Otherwise, create a new symbol and store it.
            if (!hasProperty(wellKnownSymbols, symbolName)) {
                wellKnownSymbols[symbolName] = supportsNativeSymbols && hasProperty(nativeSymbol, symbolName) ?
                    nativeSymbol[symbolName] :
                    symbolCreator("Symbol." + symbolName);
            }
            return wellKnownSymbols[symbolName];
        };
    },

    /* Module 6 */
    function(moduleRef, exportsRef, moduleLoader) {
        var sharedStore = moduleLoader(58); // Shared store
        var globalRef = moduleLoader(8); // Global object

        /**
         * Safely retrieve a value from either the shared store or the global object.
         * @param {string} key - The top-level key (e.g., "Map").
         * @param {string} [subKey] - An optional sub-key (e.g., "prototype").
         * @returns {*} The retrieved value or undefined.
         */
        var safeGetGlobal = function(key, subKey) {
            var valueGetter = function(obj) {
                return typeof obj === 'function' ? obj : undefined;
            };
            return arguments.length < 2 ?
                valueGetter(sharedStore[key]) || valueGetter(globalRef[key]) :
                (sharedStore[key] && sharedStore[key][subKey] || globalRef[key] && globalRef[key][subKey]);
        };

        moduleRef.exports = safeGetGlobal;
    },

    /* Module 7 */
    function(moduleRef, exportsRef, moduleLoader) {
        var requireFunction = moduleLoader(4); // Utility to require a function

        /**
         * Creates a bound version of a function with a specific `this` context and argument count.
         * @param {Function} func - The function to bind.
         * @param {*} bindContext - The `this` context for the bound function.
         * @param {number} [argCount] - The number of arguments the bound function should accept.
         * @returns {Function} The bound function.
         */
        moduleRef.exports = function(func, bindContext, argCount) {
            requireFunction(func); // Ensure `func` is a function
            if (bindContext === undefined) {
                return func; // No binding needed if context is undefined
            }
            switch (argCount) {
                case 0:
                    return function() {
                        return func.call(bindContext);
                    };
                case 1:
                    return function(a) {
                        return func.call(bindContext, a);
                    };
                case 2:
                    return function(a, b) {
                        return func.call(bindContext, a, b);
                    };
                case 3:
                    return function(a, b, c) {
                        return func.call(bindContext, a, b, c);
                    };
            }
            // Fallback for arbitrary number of arguments
            return function() {
                return func.apply(bindContext, arguments);
            };
        };
    },

    /* Module 8 */
    function(moduleRef, exportsRef, moduleLoader) {
        // Find the global object (window, globalThis, self, global).
        var getGlobalObject = function(potentialGlobal) {
            return potentialGlobal && potentialGlobal.Math === Math && potentialGlobal;
        };
        moduleRef.exports =
            getGlobalObject(typeof globalThis === 'object' && globalThis) ||
            getGlobalObject(typeof window === 'object' && window) ||
            getGlobalObject(typeof self === 'object' && self) ||
            getGlobalObject(typeof global === 'object' && global) ||
            (function() {
                return this;
            })(); // Fallback to `this` in non-strict mode
    },

    /* Module 9 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(value) {
            return typeof value === 'object' ? value !== null : typeof value === 'function';
        };
    },

    /* Module 10 */
    function(moduleRef, exportsRef, moduleLoader) {
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported
        var definePropertyNative = Object.defineProperty; // Native Object.defineProperty
        var validateObject = moduleLoader(1); // Utility to validate an object
        var toPrimitive = moduleLoader(52); // Utility to convert to primitive
        var isIE8 = moduleLoader(53); // Check for IE8 compatibility

        // Export defineProperty for use in other modules.
        exportsRef.f = supportsDefineProperty ? definePropertyNative : function(target, prop, descriptor) {
            validateObject(target);
            prop = toPrimitive(prop, true);
            validateObject(descriptor);

            // In IE8, try to use native defineProperty if available and no errors.
            if (isIE8) {
                try {
                    return definePropertyNative(target, prop, descriptor);
                } catch (error) {
                    // Fallback if native defineProperty fails
                }
            }

            // If it's a getter/setter, it's not supported in older environments.
            if ('get' in descriptor || 'set' in descriptor) {
                throw TypeError("Accessors not supported");
            }
            // If it has a value, just assign it.
            if ('value' in descriptor) {
                target[prop] = descriptor.value;
            }
            return target;
        };
    },

    /* Module 11 */
    function(moduleRef, exportsRef, moduleLoader) {
        var hasOwnProperty = {}.hasOwnProperty; // Native hasOwnProperty method
        moduleRef.exports = function(obj, prop) {
            return hasOwnProperty.call(obj, prop);
        };
    },

    /* Module 12 */
    function(moduleRef, exportsRef, moduleLoader) {
        var testFunction = moduleLoader(15); // Utility to test a function for errors
        moduleRef.exports = !testFunction(function() {
            // Test if Object.defineProperty works as expected.
            return Object.defineProperty({}, 1, {
                get: function() {
                    return 7;
                }
            })[1] !== 7;
        });
    },

    /* Module 13 */
    function(moduleRef, exportsRef, moduleLoader) {
        var isGlobalPure = moduleLoader(2); // Check if the environment is pure (no polyfills)
        var getMapEntries = moduleLoader(36); // Get Map.prototype.entries
        moduleRef.exports = isGlobalPure ? getMapEntries : function(mapInstance) {
            return Map.prototype.entries.call(mapInstance);
        };
    },

    /* Module 14 */
    function(moduleRef, exportsRef, moduleLoader) {
        var validateObject = moduleLoader(1); // Utility to validate an object
        var requireFunction = moduleLoader(4); // Utility to require a function
        var wellKnownSymbolSpecies = moduleLoader(5)("species"); // Symbol.species

        moduleRef.exports = function(instance, defaultConstructor) {
            var instanceConstructor = validateObject(instance).constructor;
            var speciesConstructor;

            // Check if the constructor has a Symbol.species property.
            if (instanceConstructor === undefined || instanceConstructor === null ||
                (speciesConstructor = validateObject(instanceConstructor)[wellKnownSymbolSpecies]) === undefined) {
                return defaultConstructor;
            }

            // If Symbol.species exists, it must be a function.
            requireFunction(speciesConstructor);
            return speciesConstructor;
        };
    },

    /* Module 15 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(testFunction) {
            try {
                return !!testFunction();
            } catch (error) {
                return true;
            }
        };
    },

    /* Module 16 */
    function(moduleRef, exportsRef, moduleLoader) {
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported
        var definePropertyModule = moduleLoader(10); // Module for Object.defineProperty
        var createPropertyDescriptor = moduleLoader(25); // Utility to create property descriptors

        moduleRef.exports = supportsDefineProperty ?
            function(target, prop, value) {
                return definePropertyModule.f(target, prop, createPropertyDescriptor(1, value));
            } :
            function(target, prop, value) {
                target[prop] = value;
                return target;
            };
    },

    /* Module 17 */
    function(moduleRef, exportsRef, moduleLoader) {
        var checkWeakMapSupport = moduleLoader(57); // Check for native WeakMap support
        var globalRef = moduleLoader(8); // Global object
        var isObject = moduleLoader(9); // Utility to check if value is an object
        var defineProperty = moduleLoader(16); // Utility to define properties
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var uniquePropertyKey = moduleLoader(41); // Utility to create unique property keys
        var internalState = moduleLoader(27); // Internal state storage

        var nativeWeakMap = globalRef.WeakMap;
        var internalStateKey,
            getState,
            setState,
            hasState;

        if (checkWeakMapSupport) {
            var privateWeakMap = new nativeWeakMap();
            var weakMapGet = privateWeakMap.get;
            var weakMapHas = privateWeakMap.has;
            var weakMapSet = privateWeakMap.set;

            setState = function(target, state) {
                weakMapSet.call(privateWeakMap, target, state);
                return state;
            };
            getState = function(target) {
                return weakMapGet.call(privateWeakMap) || {};
            };
            hasState = function(target) {
                return weakMapHas.call(privateWeakMap, target);
            };
        } else {
            internalStateKey = uniquePropertyKey("state");
            internalState[internalStateKey] = true; // Mark as internal

            setState = function(target, state) {
                defineProperty(target, internalStateKey, state);
                return state;
            };
            getState = function(target) {
                return hasProperty(target, internalStateKey) ? target[internalStateKey] : {};
            };
            hasState = function(target) {
                return hasProperty(target, internalStateKey);
            };
        }

        moduleRef.exports = {
            set: setState,
            get: getState,
            has: hasState,
            enforce: function(target) {
                return hasState(target) ? getState(target) : setState(target, {});
            },
            getterFor: function(typeName) {
                return function(instance) {
                    var state;
                    if (!isObject(instance) || (state = getState(instance)).type !== typeName) {
                        throw TypeError("Incompatible receiver, " + typeName + " required");
                    }
                    return state;
                };
            }
        };
    },

    /* Module 18 */
    function(moduleRef, exportsRef, moduleLoader) {
        var metadataMap = moduleLoader(65); // Map for metadata storage
        var weakMapPolyfill = moduleLoader(69); // WeakMap polyfill
        var wellKnownSymbolMetadata = moduleLoader(42)("metadata"); // Well-known symbol for metadata
        var metadataStore = wellKnownSymbolMetadata.store || (wellKnownSymbolMetadata.store = new weakMapPolyfill());

        /**
         * Get or create a metadata map for a specific target and property key.
         * @param {object} target - The target object.
         * @param {*} propertyKey - The key for the property (can be undefined).
         * @param {boolean} [createIfMissing=false] - Whether to create the map if it doesn't exist.
         * @returns {Map|undefined} The metadata map or undefined.
         */
        var getOrCreateMetadataMap = function(target, propertyKey, createIfMissing) {
            var targetMetadata = metadataStore.get(target);
            if (!targetMetadata) {
                if (!createIfMissing) return;
                metadataStore.set(target, targetMetadata = new metadataMap());
            }
            var propertyMetadata = targetMetadata.get(propertyKey);
            if (!propertyMetadata) {
                if (!createIfMissing) return;
                targetMetadata.set(propertyKey, propertyMetadata = new metadataMap());
            }
            return propertyMetadata;
        };

        moduleRef.exports = {
            store: metadataStore,
            getMap: getOrCreateMetadataMap,
            has: function(metadataKey, target, propertyKey) {
                var map = getOrCreateMetadataMap(target, propertyKey, false);
                return map !== undefined && map.has(metadataKey);
            },
            get: function(metadataKey, target, propertyKey) {
                var map = getOrCreateMetadataMap(target, propertyKey, false);
                return map === undefined ? undefined : map.get(metadataKey);
            },
            set: function(metadataKey, metadataValue, target, propertyKey) {
                getOrCreateMetadataMap(target, propertyKey, true).set(metadataKey, metadataValue);
            },
            keys: function(target, propertyKey) {
                var map = getOrCreateMetadataMap(target, propertyKey, false);
                var keysArray = [];
                if (map) {
                    map.forEach(function(value, key) {
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

    /* Module 19 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(value) {
            if (value == null) { // Check for null or undefined
                throw TypeError("Can't call method on " + value);
            }
            return value;
        };
    },

    /* Module 20 */
    function(moduleRef, exportsRef, moduleLoader) {
        var isGlobalPure = moduleLoader(2); // Check if the environment is pure
        var getSetValues = moduleLoader(36); // Get Set.prototype.values
        moduleRef.exports = isGlobalPure ? getSetValues : function(setInstance) {
            return Set.prototype.values.call(setInstance);
        };
    },

    /* Module 21 */
    function(moduleRef, exportsRef, moduleLoader) {
        var toInteger = moduleLoader(28); // Utility to convert to integer
        var mathMin = Math.min; // Math.min

        var MAX_SAFE_INTEGER = 9007199254740991; // 2^53 - 1

        moduleRef.exports = function(value) {
            var num = toInteger(value);
            return num > 0 ? mathMin(num, MAX_SAFE_INTEGER) : 0;
        };
    },

    /* Module 22 */
    function(moduleRef, exportsRef, moduleLoader) {
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var toObject = moduleLoader(29); // Utility to convert to object
        var internalKey = moduleLoader(41); // Utility to create unique internal keys
        var nativeGetPrototypeOf = moduleLoader(88); // Native Object.getPrototypeOf

        var IE_PROTO = internalKey("IE_PROTO"); // Key for IE's __proto__ workaround
        var objectPrototype = Object.prototype;

        moduleRef.exports = nativeGetPrototypeOf ? Object.getPrototypeOf : function(obj) {
            obj = toObject(obj);
            if (hasProperty(obj, IE_PROTO)) {
                return obj[IE_PROTO];
            }
            // Fallback for standard objects and functions
            if (typeof obj.constructor === 'function' && obj instanceof obj.constructor) {
                return obj.constructor.prototype;
            }
            if (obj instanceof Object) {
                return objectPrototype;
            }
            return null; // For primitives or objects with no prototype
        };
    },

    /* Module 23 */
    function(moduleRef, exportsRef, moduleLoader) {
        var validateObject = moduleLoader(1); // Utility to validate an object
        var defineProperties = moduleLoader(90); // Utility to define multiple properties
        var emptyObject = moduleLoader(44); // Array of common object properties
        var internalState = moduleLoader(27); // Internal state storage
        var createHTMLFile = moduleLoader(92); // Utility to create an HTML file for IE workaround
        var createUniqueKey = moduleLoader(54); // Utility to create unique keys

        var IE_PROTO_KEY = createUniqueKey("IE_PROTO"); // Key for IE's __proto__ workaround
        var dummyPrototype = function() {}; // Dummy constructor for prototype chain
        var htmlFileObject; // ActiveXObject for IE

        var createIEObject = function() {
            // This is an IE-specific workaround to create an object without a prototype chain.
            // It involves creating an HTML file in memory and using its object context.
            try {
                htmlFileObject = document.domain && new ActiveXObject("htmlfile");
            } catch (error) {
                // Ignore errors
            }
            var result;
            var doc;
            createIEObject = htmlFileObject ?
                function(htmlFile) {
                    htmlFile.write("<script></script>"); // Write empty script to activate document
                    htmlFile.close();
                    var obj = htmlFile.parentWindow.Object; // Get the Object constructor from the new context
                    htmlFile = null; // Prevent memory leak
                    return obj;
                }(htmlFileObject) :
                (function() {
                    var iframe = createHTMLFile("iframe");
                    iframe.style.display = "none";
                    createHTMLFile.appendChild(iframe); // Append to document to activate
                    iframe.src = String("javascript:"); // Set src to javascript: for document access
                    doc = iframe.contentWindow.document;
                    doc.open();
                    doc.write("<script>document.F=Object</script>"); // Define Object in iframe context
                    doc.close();
                    return doc.F;
                })();

            // Remove common properties from the prototype to ensure a truly empty object.
            for (var i = emptyObject.length; i--;) {
                delete createIEObject.prototype[emptyObject[i]];
            }
            return createIEObject();
        };

        internalState[IE_PROTO_KEY] = true; // Mark IE_PROTO_KEY as internal

        moduleRef.exports = Object.create || function(prototype, properties) {
            var newObject;
            if (prototype !== null) {
                dummyPrototype.prototype = validateObject(prototype);
                newObject = new dummyPrototype();
                dummyPrototype.prototype = null; // Reset prototype
                newObject[IE_PROTO_KEY] = prototype; // Store prototype for IE workaround
            } else {
                newObject = createIEObject();
            }
            return properties === undefined ? newObject : defineProperties(newObject, properties);
        };
    },

    /* Module 24 */
    function(moduleRef, exportsRef, moduleLoader) {
        var objectToString = {}.toString; // Native Object.prototype.toString
        moduleRef.exports = function(value) {
            return objectToString.call(value).slice(8, -1); // Extract type name (e.g., "Array", "Object")
        };
    },

    /* Module 25 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(flags, value) {
            return {
                enumerable: !(flags & 1), // 1: non-enumerable
                configurable: !(flags & 2), // 2: non-configurable
                writable: !(flags & 4), // 4: non-writable
                value: value
            };
        };
    },

    /* Module 26 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object
        var defineProperty = moduleLoader(16); // Utility to define properties
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var assignGlobalProperty = moduleLoader(40); // Utility to assign global property
        var inspectSource = moduleLoader(55); // Utility to inspect function source
        var internalState = moduleLoader(17); // Internal state storage

        var getInternalState = internalState.get;
        var setInternalState = internalState.enforce;
        var stringSplitter = String(String).split("String"); // Used to hide source of polyfills

        /**
         * Defines a property on an object, handling various options.
         * @param {object} target - The object to modify.
         * @param {string} propertyName - The name of the property.
         * @param {Function} propertyValue - The value (function) to assign.
         * @param {object} [options] - Configuration options.
         * @param {boolean} [options.unsafe] - If true, overwrite existing property directly.
         * @param {boolean} [options.enumerable] - If true, make the property enumerable.
         * @param {boolean} [options.noTargetGet] - If true, skip target property lookup.
         */
        (moduleRef.exports = function(target, propertyName, propertyValue, options) {
            var isUnsafe = !!options && !!options.unsafe;
            var isEnumerable = !!options && !!options.enumerable;
            var skipTargetGet = !!options && !!options.noTargetGet;

            // If it's a function, store its source code for inspection.
            if (typeof propertyValue === 'function') {
                if (typeof propertyName !== 'string' || !hasProperty(propertyValue, "name")) {
                    defineProperty(propertyValue, "name", propertyName);
                }
                setInternalState(propertyValue).source = stringSplitter.join(typeof propertyName === 'string' ? propertyName : "");
            }

            if (target !== globalObject) {
                if (isUnsafe) {
                    // Unsafe mode: delete existing property if it exists, then assign.
                    if (!skipTargetGet && target[propertyName]) {
                        isEnumerable = true; // Always enumerable in unsafe mode if property existed
                    }
                    delete target[propertyName];
                }
                // Assign property based on enumerable flag.
                if (isEnumerable) {
                    target[propertyName] = propertyValue;
                } else {
                    defineProperty(target, propertyName, propertyValue);
                }
            } else {
                // Global object: assign property based on enumerable flag.
                if (isEnumerable) {
                    target[propertyName] = propertyValue;
                } else {
                    assignGlobalProperty(propertyName, propertyValue);
                }
            }
        })(Function.prototype, "toString", function() {
            // Custom toString for functions to show original source if available.
            return (typeof this === 'function' && getInternalState(this).source) || inspectSource(this);
        });
    },

    /* Module 27 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = {}; // Used as a registry for internal properties
    },

    /* Module 28 */
    function(moduleRef, exportsRef, moduleLoader) {
        var mathCeil = Math.ceil; // Math.ceil
        var mathFloor = Math.floor; // Math.floor

        moduleRef.exports = function(value) {
            var num = +value; // Convert to number
            // Return 0 for NaN, otherwise floor or ceil depending on sign.
            return num !== num ? 0 : (num > 0 ? mathFloor : mathCeil)(num);
        };
    },

    /* Module 29 */
    function(moduleRef, exportsRef, moduleLoader) {
        var requireObjectCoercible = moduleLoader(19); // Utility to ensure an object is coercible
        moduleRef.exports = function(value) {
            return Object(requireObjectCoercible(value));
        };
    },

    /* Module 30 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = {}; // Registry for well-known iterators
    },

    /* Module 31 */
    function(moduleRef, exportsRef, moduleLoader) {
        var internalStateRegistry = moduleLoader(27); // Registry for internal state
        var isObject = moduleLoader(9); // Utility to check if a value is an object
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var definePropertyModule = moduleLoader(10); // Module for Object.defineProperty
        var createUniqueId = moduleLoader(43); // Utility to create unique IDs
        var objectIsExtensible = Object.isExtensible || function() {
            return true;
        }; // Fallback for Object.isExtensible

        var objectMetaKey = createUniqueId("meta"); // Key for object metadata
        var objectIdCounter = 0; // Counter for unique object IDs

        /**
         * Attach metadata to an object if it doesn't have it.
         * @param {object} obj - The object to attach metadata to.
         */
        var attachObjectMetadata = function(obj) {
            definePropertyModule.f(obj, objectMetaKey, {
                value: {
                    objectId: "O" + ++objectIdCounter,
                    weakData: {}
                }
            });
        };

        var objectMetadata = moduleRef.exports = {
            REQUIRED: false, // Flag indicating if metadata is required
            fastKey: function(obj, createIfMissing) {
                // If not an object, return it directly.
                if (!isObject(obj)) {
                    return typeof obj === 'symbol' ? obj : ("string" === typeof obj ? "S" : "P") + obj;
                }
                // If it already has metadata, return its object ID.
                if (hasProperty(obj, objectMetaKey)) {
                    return obj[objectMetaKey].objectId;
                }
                // If not extensible, cannot add metadata.
                if (!objectIsExtensible(obj)) {
                    return "F"; // Frozen
                }
                // If createIfMissing is false, indicate that metadata is missing.
                if (!createIfMissing) {
                    return "E"; // Not extensible
                }
                // Attach metadata and return ID.
                attachObjectMetadata(obj);
                return obj[objectMetaKey].objectId;
            },
            getWeakData: function(obj, createIfMissing) {
                // If not extensible, cannot get weak data.
                if (!objectIsExtensible(obj)) {
                    return true; // Indicate that it's frozen
                }
                // If it doesn't have metadata, create it if requested.
                if (!hasProperty(obj, objectMetaKey)) {
                    if (!createIfMissing) {
                        return false;
                    }
                    attachObjectMetadata(obj);
                }
                return obj[objectMetaKey].weakData;
            },
            onFreeze: function(obj) {
                // If metadata is required and object is extensible but lacks metadata, attach it.
                if (objectMetadata.REQUIRED && objectIsExtensible(obj) && !hasProperty(obj, objectMetaKey)) {
                    attachObjectMetadata(obj);
                }
                return obj;
            }
        };

        internalStateRegistry[objectMetaKey] = true; // Mark as internal
    },

    /* Module 32 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = function(instance, Constructor, name) {
            if (!(instance instanceof Constructor)) {
                throw TypeError("Incorrect " + (name ? name + " " : "") + "invocation");
            }
            return instance;
        };
    },

    /* Module 33 */
    function(moduleRef, exportsRef, moduleLoader) {
        var defineProperties = moduleLoader(26); // Utility to define properties
        moduleRef.exports = function(target, properties, options) {
            for (var key in properties) {
                defineProperties(target, key, properties[key], options);
            }
            return target;
        };
    },

    /* Module 34 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var createObject = moduleLoader(23); // Utility to create an object with a given prototype
        var createPropertyDescriptor = moduleLoader(25); // Utility to create property descriptors
        var defineProperty = moduleLoader(47); // Utility to define property on object, setting toStringTag

        /**
         * Creates an iterator constructor.
         * @param {Function} Constructor - The constructor function for the iterator.
         * @param {string} name - The name of the iterator.
         * @param {Function} nextMethod - The `next` method for the iterator.
         * @returns {Function} The iterator constructor.
         */
        moduleRef.exports = function(Constructor, name, nextMethod) {
            var iteratorPrototype = moduleLoader(67).IteratorPrototype; // Base iterator prototype
            var prototype = Constructor.prototype;
            var descriptor = createPropertyDescriptor(1, nextMethod);

            // Set the prototype of the iterator constructor.
            prototype = createObject(iteratorPrototype, {
                next: descriptor
            });

            // Set the toStringTag for the iterator.
            defineProperty(prototype, name, false, true);

            // Add the prototype to the iterator registry.
            moduleLoader(30)[name + " Iterator"] = function() {
                return this;
            };

            return Constructor;
        };
    },

    /* Module 35 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var requireFunction = moduleLoader(4); // Utility to require a function
        var validateObject = moduleLoader(1); // Utility to validate an object

        moduleRef.exports = function() {
            var instance = validateObject(this); // Ensure 'this' is an object
            var deleteMethod = requireFunction(instance['delete']); // Get the 'delete' method

            var allDeleted = true;
            for (var i = 0, len = arguments.length; i < len; i++) {
                // Call delete for each argument and update 'allDeleted' status.
                var deleted = deleteMethod.call(instance, arguments[i]);
                allDeleted = allDeleted && deleted;
            }
            return allDeleted;
        };
    },

    /* Module 36 */
    function(moduleRef, exportsRef, moduleLoader) {
        var validateObject = moduleLoader(1); // Utility to validate an object
        var getIterator = moduleLoader(62); // Utility to get an iterator

        moduleRef.exports = function(iterable) {
            var iterator = getIterator(iterable);
            if (typeof iterator !== 'function') {
                throw TypeError(String(iterable) + " is not iterable");
            }
            return validateObject(iterator.call(iterable));
        };
    },

    /* Module 37 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var requireFunction = moduleLoader(4); // Utility to require a function
        var bindFunction = moduleLoader(7); // Utility to create a bound function
        var iterateOverCollection = moduleLoader(3); // Utility to iterate over a collection

        moduleRef.exports = function(iterable) {
            var instance = requireFunction(this); // Ensure 'this' is a constructor
            var mapFunction = arguments.length > 1 ? arguments[1] : undefined;
            var mapFunctionExists = mapFunction !== undefined;

            requireFunction(instance); // Ensure constructor is a function
            if (mapFunctionExists) {
                requireFunction(mapFunction); // Ensure map function is a function
            }

            if (iterable == null) { // If iterable is null or undefined, create an empty instance
                return new instance();
            }

            var elements = [];
            if (mapFunctionExists) {
                var index = 0;
                var boundMapFunction = bindFunction(mapFunction, arguments.length > 2 ? arguments[2] : undefined, 2);
                iterateOverCollection(iterable, function(value) {
                    elements.push(boundMapFunction(value, index++));
                });
            } else {
                iterateOverCollection(iterable, elements.push, elements);
            }

            return new instance(elements);
        };
    },

    /* Module 38 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        moduleRef.exports = function() {
            var args = new Array(arguments.length);
            for (var i = arguments.length; i--;) {
                args[i] = arguments[i];
            }
            return new this(args);
        };
    },

    /* Module 39 */
    function(moduleRef, exportsRef, moduleLoader) {
        var toObject = moduleLoader(29); // Utility to convert to object
        var stringToArray = moduleLoader(51); // Utility to convert string to array-like object

        moduleRef.exports = function(value) {
            return stringToArray(toObject(value));
        };
    },

    /* Module 40 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object
        var defineProperty = moduleLoader(16); // Utility to define properties

        moduleRef.exports = function(key, value) {
            try {
                defineProperty(globalObject, key, value);
            } catch (error) {
                globalObject[key] = value;
            }
            return value;
        };
    },

    /* Module 41 */
    function(moduleRef, exportsRef, moduleLoader) {
        var sharedStore = moduleLoader(42); // Shared store
        var createUniqueId = moduleLoader(43); // Utility to create unique IDs
        var keysRegistry = sharedStore("keys"); // Registry for unique keys

        moduleRef.exports = function(key) {
            return keysRegistry[key] || (keysRegistry[key] = createUniqueId(key));
        };
    },

    /* Module 42 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object
        var assignGlobalProperty = moduleLoader(40); // Utility to assign global property
        var sharedData = globalObject["__core-js_shared__"] || assignGlobalProperty("__core-js_shared__", {});

        moduleRef.exports = sharedData;
    },

    /* Module 43 */
    function(moduleRef, exportsRef, moduleLoader) {
        var counter = 0; // Unique ID counter
        var randomNumber = Math.random(); // Random number for uniqueness

        moduleRef.exports = function(prefix) {
            return "Symbol(" + String(prefix === undefined ? "" : prefix) + ")_" +
                (++counter + randomNumber).toString(36);
        };
    },

    /* Module 44 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
    },

    /* Module 45 */
    function(moduleRef, exportsRef, moduleLoader) {
        var validateObject = moduleLoader(1); // Utility to validate an object
        var setPrototypeOf = moduleLoader(89); // Utility to set object prototype

        moduleRef.exports = Object.setPrototypeOf || ("__proto__" in {} ? (function() {
            var prototypeSetter;
            var isArrayPrototypeModifiable = false;
            var testObject = {};
            try {
                prototypeSetter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
                prototypeSetter.call(testObject, []);
                isArrayPrototypeModifiable = testObject instanceof Array;
            } catch (error) {
                // Ignore errors
            }
            return function(target, proto) {
                validateObject(target);
                setPrototypeOf(proto); // Validate prototype
                if (isArrayPrototypeModifiable) {
                    prototypeSetter.call(target, proto);
                } else {
                    target.__proto__ = proto;
                }
                return target;
            };
        })() : undefined);
    },

    /* Module 46 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var definePropertyFeature = moduleLoader(0); // Utility to define properties on global object
        var globalObject = moduleLoader(8); // Global object
        var checkForceUpdate = moduleLoader(60); // Utility to check if a feature is forced
        var defineProperty = moduleLoader(26); // Utility to define properties (using definePropertyFeature)
        var collectionHelper = moduleLoader(31); // Collection helper utilities
        var iterateOverCollection = moduleLoader(3); // Utility to iterate over collection
        var checkIsObject = moduleLoader(9); // Utility to check if value is an object
        var testFunction = moduleLoader(15); // Utility to test a function for errors
        var checkConstructorIntegrity = moduleLoader(102); // Utility to check constructor integrity
        var setToStringTag = moduleLoader(47); // Utility to set toStringTag
        var createInstance = moduleLoader(103); // Utility to create an instance

        /**
         * Polyfills or extends Map/Set/WeakMap/WeakSet functionality.
         * @param {string} collectionName - The name of the collection (e.g., "Map", "Set").
         * @param {Function} constructorCreator - A function that creates the collection constructor.
         * @param {object} collectionImplementations - Object containing implementation details.
         * @returns {Function} The collection constructor.
         */
        moduleRef.exports = function(collectionName, constructorCreator, collectionImplementations) {
            var isMap = -1 !== collectionName.indexOf("Map");
            var isWeak = -1 !== collectionName.indexOf("Weak");
            var addMethodName = isMap ? "set" : "add";

            var NativeCollection = globalObject[collectionName];
            var CollectionPrototype = NativeCollection && NativeCollection.prototype;
            var CollectionConstructor = NativeCollection; // The constructor to potentially replace
            var newCollectionImplementations = {};

            // Check if the native collection needs polyfilling or forcing.
            var needsPolyfill = checkForceUpdate(
                collectionName,
                !NativeCollection ||
                !(isWeak || (CollectionPrototype && CollectionPrototype.forEach && !testFunction(function() {
                    new NativeCollection().entries().next();
                })))
            );

            if (needsPolyfill) {
                // If polyfill is needed, create a new constructor.
                CollectionConstructor = collectionImplementations.getConstructor(constructorCreator, collectionName, isMap, addMethodName);
                collectionHelper.REQUIRED = true; // Mark collection helper as required
            } else if (checkForceUpdate(collectionName, true)) { // Even if not polyfilled, check for forced updates
                var testInstance = new NativeCollection();
                var testResult = testInstance[addMethodName](isWeak ? {} : -0, 1) !== testInstance; // Test add/set method return value
                var testHas = testFunction(function() {
                    testInstance.has(1);
                });
                var testConstructor = checkConstructorIntegrity(function(iter) {
                    new NativeCollection(iter);
                });
                var testNegativeZero = !isWeak && testFunction(function() {
                    for (var i = 5; i--;) new NativeCollection()[addMethodName](i, i);
                    return !new NativeCollection().has(-0);
                });

                // If any test fails, means native implementation is buggy.
                if (!testConstructor || testNegativeZero || testResult) {
                    // Create a new constructor that wraps the native one.
                    CollectionConstructor = constructorCreator(function(target, iterable) {
                        collectionHelper.enforceInstance(target, CollectionConstructor, collectionName);
                        var newCollection = createInstance(new NativeCollection(), target, CollectionConstructor);
                        if (iterable != null) {
                            iterateOverCollection(iterable, newCollection[addMethodName], newCollection, isMap);
                        }
                        return newCollection;
                    });
                    CollectionConstructor.prototype = CollectionPrototype;
                    CollectionPrototype.constructor = CollectionConstructor;
                }

                // Apply fixes for specific methods if buggy.
                if (testHas || testNegativeZero) {
                    collectionImplementations.fixMethod(CollectionPrototype, "delete");
                    collectionImplementations.fixMethod(CollectionPrototype, "has");
                    if (isMap) collectionImplementations.fixMethod(CollectionPrototype, "get");
                }
                if (testNegativeZero || testResult) {
                    collectionImplementations.fixMethod(CollectionPrototype, addMethodName);
                }
                // If it's a Weak collection and has clear, delete it.
                if (isWeak && CollectionPrototype.clear) {
                    delete CollectionPrototype.clear;
                }
            }

            // Add the new constructor to the implementations object.
            newCollectionImplementations[collectionName] = CollectionConstructor;
            // Define the feature on the global object.
            definePropertyFeature({
                global: true,
                forced: CollectionConstructor !== NativeCollection
            }, newCollectionImplementations);
            // Set toStringTag for the new constructor.
            setToStringTag(CollectionConstructor, collectionName);

            // If not a Weak collection, set strong (non-weak) implementation.
            if (!isWeak) {
                collectionImplementations.setStrong(CollectionConstructor, collectionName, isMap);
            }

            return CollectionConstructor;
        };
    },

    /* Module 47 */
    function(moduleRef, exportsRef, moduleLoader) {
        var definePropertyModule = moduleLoader(10); // Module for Object.defineProperty
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var wellKnownSymbol = moduleLoader(5)("toStringTag"); // Symbol.toStringTag

        moduleRef.exports = function(target, tagName, isDescriptor) {
            // Set toStringTag if it doesn't exist.
            if (target && !hasProperty(target = isDescriptor ? target : target.prototype, wellKnownSymbol)) {
                definePropertyModule.f(target, wellKnownSymbol, {
                    configurable: true,
                    value: tagName
                });
            }
        };
    },

    /* Module 48 */
    function(moduleRef, exportsRef, moduleLoader) {
        var toInteger = moduleLoader(28); // Utility to convert to integer
        var requireObjectCoercible = moduleLoader(19); // Utility to ensure an object is coercible

        var createCharGetter = function(isChar) {
            return function(string, index) {
                var str = String(requireObjectCoercible(string));
                var pos = toInteger(index);
                var length = str.length;
                var charCode, nextCharCode;

                if (pos < 0 || pos >= length) {
                    return isChar ? "" : undefined;
                }

                charCode = str.charCodeAt(pos);
                // Handle surrogate pairs for Unicode characters.
                if (charCode < 0xD800 || charCode > 0xDBFF || pos + 1 === length ||
                    (nextCharCode = str.charCodeAt(pos + 1)) < 0xDC00 || nextCharCode > 0xDFFF) {
                    return isChar ? str.charAt(pos) : charCode;
                }
                return isChar ? str.slice(pos, pos + 2) : nextCharCode - 0xDC00 + ((charCode - 0xD800) << 10) + 0x10000;
            };
        };

        moduleRef.exports = {
            codeAt: createCharGetter(false), // Get Unicode code point
            charAt: createCharGetter(true) // Get character(s)
        };
    },

    /* Module 49 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(58); // Global object
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var definePropertyModule = moduleLoader(10).f; // Object.defineProperty.f

        moduleRef.exports = function(symbolName) {
            var globalSymbol = globalObject.Symbol || (globalObject.Symbol = {});
            if (!hasProperty(globalSymbol, symbolName)) {
                definePropertyModule(globalSymbol, symbolName, {
                    value: moduleLoader(186).f(symbolName)
                });
            }
        };
    },

    /* Module 50 */
    function(moduleRef, exportsRef, moduleLoader) {
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported
        var isPropertyEnumerable = moduleLoader(80); // Utility to check if property is enumerable
        var createPropertyDescriptor = moduleLoader(25); // Utility to create property descriptors
        var toIndexedObject = moduleLoader(39); // Utility to convert to indexed object
        var toPrimitive = moduleLoader(52); // Utility to convert to primitive
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var isIE8 = moduleLoader(53); // Check for IE8 compatibility
        var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

        exportsRef.f = supportsDefineProperty ? nativeGetOwnPropertyDescriptor : function(target, property) {
            target = toIndexedObject(target);
            property = toPrimitive(property, true);

            // In IE8, try native getOwnPropertyDescriptor if it doesn't throw.
            if (isIE8) {
                try {
                    return nativeGetOwnPropertyDescriptor(target, property);
                } catch (error) {
                    // Fallback if native fails
                }
            }
            // If property exists, create a descriptor.
            if (hasProperty(target, property)) {
                return createPropertyDescriptor(!isPropertyEnumerable.f.call(target, property), target[property]);
            }
        };
    },

    /* Module 51 */
    function(moduleRef, exportsRef, moduleLoader) {
        var testFunction = moduleLoader(15); // Utility to test a function for errors
        var objectToString = moduleLoader(24); // Object.prototype.toString
        var stringSplit = "".split; // Native String.prototype.split

        moduleRef.exports = testFunction(function() {
            // Test if Object("z").propertyIsEnumerable(0) is false, indicating string indexing issues.
            return !Object("z").propertyIsEnumerable(0);
        }) ? function(object) {
            // If buggy, convert string to array of characters.
            return objectToString(object) === "String" ? stringSplit.call(object, "") : Object(object);
        } : Object;
    },

    /* Module 52 */
    function(moduleRef, exportsRef, moduleLoader) {
        var isObject = moduleLoader(9); // Utility to check if value is an object

        moduleRef.exports = function(value, hint) {
            if (!isObject(value)) {
                return value;
            }
            var primitiveMethod;
            // Try valueOf, then toString, based on hint.
            if (hint && typeof(primitiveMethod = value.toString) === 'function' && !isObject(primitiveMethod = primitiveMethod.call(value))) {
                return primitiveMethod;
            }
            if (typeof(primitiveMethod = value.valueOf) === 'function' && !isObject(primitiveMethod = primitiveMethod.call(value))) {
                return primitiveMethod;
            }
            if (!hint && typeof(primitiveMethod = value.toString) === 'function' && !isObject(primitiveMethod = primitiveMethod.call(value))) {
                return primitiveMethod;
            }
            throw TypeError("Can't convert object to primitive value");
        };
    },

    /* Module 53 */
    function(moduleRef, exportsRef, moduleLoader) {
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported
        var testFunction = moduleLoader(15); // Utility to test a function for errors
        var createElement = moduleLoader(54); // Utility to create a DOM element

        moduleRef.exports = !supportsDefineProperty && !testFunction(function() {
            // Test if defining a property on a DOM element fails in IE8.
            return Object.defineProperty(createElement("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a !== 7;
        });
    },

    /* Module 54 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object
        var isObject = moduleLoader(9); // Utility to check if value is an object
        var documentRef = globalObject.document; // Document object
        var isDocumentObject = isObject(documentRef) && isObject(documentRef.createElement); // Check if createElement exists

        moduleRef.exports = function(tagName) {
            return isDocumentObject ? documentRef.createElement(tagName) : {};
        };
    },

    /* Module 55 */
    function(moduleRef, exportsRef, moduleLoader) {
        var sharedData = moduleLoader(56); // Shared data store
        var nativeFunctionToString = Function.toString; // Native Function.prototype.toString

        // Cache the inspectSource function.
        if (typeof sharedData.inspectSource !== 'function') {
            sharedData.inspectSource = function(func) {
                return nativeFunctionToString.call(func);
            };
        }

        moduleRef.exports = sharedData.inspectSource;
    },

    /* Module 56 */
    function(moduleRef, exportsRef, moduleLoader) {
        var sharedData = moduleLoader(42); // Shared data store
        var assignGlobalProperty = moduleLoader(40); // Utility to assign global property

        var sharedModule = sharedData["__core-js_shared__"] || assignGlobalProperty("__core-js_shared__", {});
        moduleRef.exports = sharedModule;
    },

    /* Module 57 */
    function(moduleRef, exportsRef, moduleLoader) {
        var globalObject = moduleLoader(8); // Global object
        var inspectSource = moduleLoader(55); // Utility to inspect function source
        var nativeWeakMap = globalObject.WeakMap;

        moduleRef.exports = typeof nativeWeakMap === 'function' && /native code/.test(inspectSource(nativeWeakMap));
    },

    /* Module 58 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = moduleLoader(8); // Re-export global object
    },

    /* Module 59 */
    function(moduleRef, exportsRef, moduleLoader) {
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var toIndexedObject = moduleLoader(39); // Utility to convert to indexed object
        var arrayIndexOf = moduleLoader(84).indexOf; // Array.prototype.indexOf
        var internalState = moduleLoader(27); // Internal state registry

        moduleRef.exports = function(target, hiddenKeys) {
            var indexedTarget = toIndexedObject(target);
            var counter = 0;
            var resultKeys = [];
            var propName;

            // Iterate over all properties of the target object.
            for (propName in indexedTarget) {
                // If it's not an internal key and is owned by the object, add to results.
                if (!hasProperty(internalState, propName) && hasProperty(indexedTarget, propName)) {
                    resultKeys.push(propName);
                }
            }

            // Iterate over hidden keys and add any that are also on the target object
            // and not already in the results.
            while (hiddenKeys.length > counter) {
                propName = hiddenKeys[counter++];
                if (hasProperty(indexedTarget, propName) && !~arrayIndexOf(resultKeys, propName)) {
                    resultKeys.push(propName);
                }
            }
            return resultKeys;
        };
    },

    /* Module 60 */
    function(moduleRef, exportsRef, moduleLoader) {
        var testFunction = moduleLoader(15); // Utility to test a function for errors

        var forceCheckRegex = /#|\.prototype\./; // Regex to check for prototype or hash in feature name
        var featureCheck = function(featureName, isForced) {
            var storedStatus = featureCheck.data[featureCheck.normalize(featureName)];
            return storedStatus === featureCheck.NATIVE ||
                (storedStatus === featureCheck.POLYFILL ? testFunction(isForced) : !!isForced);
        };

        featureCheck.normalize = function(featureName) {
            return String(featureName).replace(forceCheckRegex, ".").toLowerCase();
        };
        featureCheck.data = {}; // Cache for feature status
        featureCheck.NATIVE = "N"; // Status for native implementation
        featureCheck.POLYFILL = "P"; // Status for polyfilled implementation

        moduleRef.exports = featureCheck;
    },

    /* Module 61 */
    function(moduleRef, exportsRef, moduleLoader) {
        var testFunction = moduleLoader(15); // Utility to test a function for errors
        moduleRef.exports = !!Object.getOwnPropertySymbols && !testFunction(function() {
            // Test if Symbol() can be converted to string without error.
            return !String(Symbol());
        });
    },

    /* Module 62 */
    function(moduleRef, exportsRef, moduleLoader) {
        var wellKnownSymbolIterator = moduleLoader(5)("iterator"); // Symbol.iterator
        var iteratorRegistry = moduleLoader(30); // Registry for well-known iterators
        moduleRef.exports = function(value) {
            if (value != null) { // Check for null or undefined
                return value[wellKnownSymbolIterator] || value["@@iterator"] || iteratorRegistry[moduleLoader(95)(value)];
            }
        };
    },

    /* Module 63 */
    function(moduleRef, exportsRef, moduleLoader) {
        var wellKnownSymbolUnscopables = moduleLoader(5)("unscopables"); // Symbol.unscopables
        var arrayPrototype = Array.prototype;

        // Ensure Array.prototype has Symbol.unscopables defined.
        if (arrayPrototype[wellKnownSymbolUnscopables] == null) {
            moduleLoader(10).f(arrayPrototype, wellKnownSymbolUnscopables, {
                configurable: true,
                value: moduleLoader(23)(null)
            });
        }

        moduleRef.exports = function(property) {
            arrayPrototype[wellKnownSymbolUnscopables][property] = true;
        };
    },

    /* Module 64 */
    function(moduleRef, exportsRef, moduleLoader) {
        var metadataMap = moduleLoader(65); // Map for metadata storage
        var weakMapPolyfill = moduleLoader(69); // WeakMap polyfill
        var createObject = moduleLoader(23); // Utility to create an object with a given prototype
        var isObject = moduleLoader(9); // Utility to check if value is an object

        /**
         * Represents a node in the composite key structure.
         * Stores references to objects and primitives used as parts of the key.
         */
        var CompositeKeyNode = function() {
            this.objectReferences = null; // Map for object components
            this.primitiveReferences = null; // Map for primitive components
            this.objectByIndex = createObject(null); // Map for object components by index
        };

        /**
         * Retrieves or creates a sub-node for a given component.
         * @param {string} type - "object" or "primitive".
         * @param {function} creator - Function to create the map if it doesn't exist.
         * @returns {Map} The map for the given type.
         */
        CompositeKeyNode.prototype.get = function(type, creator) {
            return this[type] || (this[type] = creator());
        };

        /**
         * Navigates to the next node in the composite key path.
         * @param {number} index - The index of the current component in the key.
         * @param {*} component - The current component of the key.
         * @param {boolean} isObjectComponent - True if the component is an object.
         * @returns {CompositeKeyNode} The next node.
         */
        CompositeKeyNode.prototype.next = function(index, component, isObjectComponent) {
            var map = isObjectComponent ?
                this.objectByIndex[index] || (this.objectByIndex[index] = new weakMapPolyfill()) :
                this.primitiveReferences || (this.primitiveReferences = new metadataMap());
            var nextNode = map.get(component);
            if (!nextNode) {
                map.set(component, nextNode = new CompositeKeyNode());
            }
            return nextNode;
        };

        var rootCompositeKeyNode = new CompositeKeyNode();

        /**
         * Generates a composite key based on multiple arguments.
         * @returns {CompositeKeyNode} The final node representing the composite key.
         */
        moduleRef.exports = function() {
            var currentCompositeNode = rootCompositeKeyNode;
            var argCount = arguments.length;
            var currentArgument;
            var i;

            // Process object components first to leverage WeakMap for garbage collection.
            for (i = 0; i < argCount; i++) {
                currentArgument = arguments[i];
                if (isObject(currentArgument)) {
                    currentCompositeNode = currentCompositeNode.next(i, currentArgument, true);
                }
            }

            // If only Object was passed and no actual objects, throw an error.
            if (this === Object && currentCompositeNode === rootCompositeKeyNode) {
                throw TypeError("Composite keys must contain a non-primitive component");
            }

            // Process primitive components.
            for (i = 0; i < argCount; i++) {
                currentArgument = arguments[i];
                if (!isObject(currentArgument)) {
                    currentCompositeNode = currentCompositeNode.next(i, currentArgument, false);
                }
            }

            return currentCompositeNode;
        };
    },

    /* Module 65 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var definePropertyFeature = moduleLoader(0); // Utility to define properties on global object
        var collectionConstructor = moduleLoader(46); // Generic collection constructor helper

        moduleRef.exports = collectionConstructor("Map", function(getConstructor) {
            return function Map(iterable) {
                return getConstructor(this, arguments.length ? iterable : undefined);
            };
        }, moduleLoader(66));
    },

    /* Module 66 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var definePropertyModule = moduleLoader(10).f; // Object.defineProperty.f
        var createObject = moduleLoader(23); // Utility to create an object with a given prototype
        var addProperties = moduleLoader(33); // Utility to add multiple properties
        var createBoundFunction = moduleLoader(7); // Utility to create a bound function
        var enforceInstance = moduleLoader(32); // Utility to enforce constructor instance
        var iterateOverCollection = moduleLoader(3); // Utility to iterate over collection
        var defineIterator = moduleLoader(104); // Utility to define an iterator
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported
        var collectionHelper = moduleLoader(31); // Collection helper utilities
        var internalState = moduleLoader(17); // Internal state storage

        var setInternalState = internalState.set;
        var getInternalState = internalState.getterFor;

        moduleRef.exports = {
            /**
             * Provides a generic constructor for Map-like and Set-like collections.
             * @param {Function} baseConstructor - The base constructor function.
             * @param {string} collectionName - The name of the collection (e.g., "Map", "Set").
             * @param {boolean} isMap - True if it's a Map, false if a Set.
             * @param {string} addMethodName - The name of the method to add elements ("set" or "add").
             * @returns {Function} The new collection constructor.
             */
            getConstructor: function(baseConstructor, collectionName, isMap, addMethodName) {
                var Collection = baseConstructor(function(instance, iterable) {
                    enforceInstance(instance, Collection, collectionName);
                    // Store internal state: type, index (for fast key lookup), first/last nodes, size.
                    setInternalState(instance, {
                        type: collectionName,
                        index: createObject(null), // Object to store fast keys
                        first: undefined, // First node in linked list
                        last: undefined, // Last node in linked list
                        size: 0
                    });
                    // If native Object.defineProperty is not supported, manually add 'size' property.
                    if (!supportsDefineProperty) {
                        instance.size = 0;
                    }
                    if (iterable != null) {
                        iterateOverCollection(iterable, instance[addMethodName], instance, isMap);
                    }
                });

                var getCollectionState = getInternalState(collectionName);

                /**
                 * Helper function to add/set an element into the collection.
                 * Manages both the linked list and the fast key index.
                 * @param {object} instance - The collection instance.
                 * @param {*} key - The key of the element.
                 * @param {*} value - The value of the element.
                 * @returns {object} The collection instance.
                 */
                var addOrSetElement = function(instance, key, value) {
                    var state = getCollectionState(instance);
                    var existingNode = getElementNode(instance, key);

                    if (existingNode) {
                        existingNode.value = value;
                    } else {
                        var newNode = {
                            key: key,
                            value: value,
                            previous: state.last, // Link to previous node
                            next: undefined,
                            removed: false // Flag for deletion
                        };
                        // Link the new node into the linked list.
                        if (state.last) {
                            state.last.next = newNode;
                        } else {
                            state.first = newNode;
                        }
                        state.last = newNode;

                        // Add to fast key index if key is not frozen.
                        var fastKey = collectionHelper.fastKey(key, true);
                        if (fastKey !== "F") {
                            state.index[fastKey] = newNode;
                        }

                        // Increment size.
                        if (supportsDefineProperty) {
                            state.size++;
                        } else {
                            instance.size++;
                        }
                    }
                    return instance;
                };

                /**
                 * Helper function to find a node by key.
                 * @param {object} instance - The collection instance.
                 * @param {*} key - The key to search for.
                 * @returns {object|undefined} The node if found, otherwise undefined.
                 */
                var getElementNode = function(instance, key) {
                    var state = getCollectionState(instance);
                    var fastKey = collectionHelper.fastKey(key);

                    // If fast key exists, use it for direct lookup.
                    if (fastKey !== "F") {
                        return state.index[fastKey];
                    }

                    // Otherwise, iterate through the linked list.
                    for (var node = state.first; node; node = node.next) {
                        if (node.key === key) {
                            return node;
                        }
                    }
                };

                addProperties(Collection.prototype, {
                    clear: function() {
                        var state = getCollectionState(this);
                        var index = state.index;
                        var node = state.first;

                        // Iterate through nodes and mark as removed, clear references.
                        while (node) {
                            node.removed = true;
                            if (node.previous) {
                                node.previous = node.previous.next = undefined;
                            }
                            delete index[collectionHelper.fastKey(node.key)]; // Delete from fast key index
                            node = node.next;
                        }
                        state.first = state.last = undefined; // Reset linked list
                        if (supportsDefineProperty) {
                            state.size = 0;
                        } else {
                            this.size = 0;
                        }
                    },
                    delete: function(key) {
                        var state = getCollectionState(this);
                        var node = getElementNode(this, key);

                        if (node) {
                            var nextNode = node.next;
                            var previousNode = node.previous;

                            delete state.index[collectionHelper.fastKey(key)]; // Delete from fast key index
                            node.removed = true; // Mark as removed

                            // Update linked list pointers.
                            if (previousNode) {
                                previousNode.next = nextNode;
                            }
                            if (nextNode) {
                                nextNode.previous = previousNode;
                            }
                            if (state.first === node) {
                                state.first = nextNode;
                            }
                            if (state.last === node) {
                                state.last = previousNode;
                            }

                            // Decrement size.
                            if (supportsDefineProperty) {
                                state.size--;
                            } else {
                                this.size--;
                            }
                        }
                        return !!node; // Return true if element was found and deleted
                    },
                    forEach: function(callback) {
                        var state = getCollectionState(this);
                        var boundCallback = createBoundFunction(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
                        var node = state.first;

                        // Iterate through the linked list, skipping removed nodes.
                        while (node) {
                            boundCallback(node.value, node.key, this);
                            // If node was removed during callback, continue from its previous node.
                            while (node && node.removed) {
                                node = node.previous;
                            }
                            if (node) node = node.next;
                        }
                    },
                    has: function(key) {
                        return !!getElementNode(this, key);
                    }
                });

                // Add Map-specific methods (get, set) or Set-specific methods (add).
                if (isMap) {
                    addProperties(Collection.prototype, {
                        get: function(key) {
                            var node = getElementNode(this, key);
                            return node && node.value;
                        },
                        set: function(key, value) {
                            return addOrSetElement(this, key === 0 ? 0 : key, value);
                        }
                    });
                } else {
                    addProperties(Collection.prototype, {
                        add: function(value) {
                            return addOrSetElement(this, value === 0 ? 0 : value, value);
                        }
                    });
                }

                // Define 'size' getter if Object.defineProperty is supported.
                if (supportsDefineProperty) {
                    definePropertyModule(Collection.prototype, "size", {
                        get: function() {
                            return getCollectionState(this).size;
                        }
                    });
                }

                return Collection;
            },

            /**
             * Sets up the iterator methods for the collection.
             * @param {Function} CollectionConstructor - The collection constructor.
             * @param {string} collectionName - The name of the collection.
             * @param {boolean} isMap - True if it's a Map.
             */
            setStrong: function(CollectionConstructor, collectionName, isMap) {
                var iteratorName = collectionName + " Iterator";
                var getCollectionState = getInternalState(collectionName);
                var getIteratorState = getInternalState(iteratorName);

                defineIterator(
                    CollectionConstructor,
                    collectionName,
                    function(instance, kind) {
                        setInternalState(this, {
                            type: iteratorName,
                            target: instance,
                            state: getCollectionState(instance),
                            kind: kind,
                            lastNode: undefined // Last returned node
                        });
                    },
                    function() {
                        var state = getIteratorState(this);
                        var kind = state.kind;
                        var currentNode = state.lastNode;

                        // Skip removed nodes.
                        while (currentNode && currentNode.removed) {
                            currentNode = currentNode.previous;
                        }

                        // Get the next node.
                        if (state.target) {
                            currentNode = currentNode ? currentNode.next : state.state.first;
                            state.lastNode = currentNode;

                            if (currentNode) {
                                // Return based on iterator kind.
                                if (kind === "keys") {
                                    return {
                                        value: currentNode.key,
                                        done: false
                                    };
                                }
                                if (kind === "values") {
                                    return {
                                        value: currentNode.value,
                                        done: false
                                    };
                                }
                                return {
                                    value: [currentNode.key, currentNode.value],
                                    done: false
                                };
                            }
                        }
                        // End of iteration.
                        state.target = undefined; // Clear reference to collection
                        return {
                            value: undefined,
                            done: true
                        };
                    },
                    isMap ? "entries" : "values", // Default iterator kind
                    !isMap, // Not for keys if it's a Set
                    true // Is a strong iterator
                );
            }
        };
    },

    /* Module 67 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var getPrototypeOf = moduleLoader(22); // Utility to get object prototype
        var defineProperty = moduleLoader(16); // Utility to define properties
        var hasProperty = moduleLoader(11); // Object.prototype.hasOwnProperty.call
        var wellKnownSymbolIterator = moduleLoader(5)("iterator"); // Symbol.iterator
        var isGlobalPure = moduleLoader(2); // Check if pure (no polyfills)

        var iteratorPrototype;
        var arrayIteratorTest = [].keys(); // Test array iterator
        var hasNextMethod = "next" in arrayIteratorTest;
        var buggySafariIterators = false;

        // Check if array iterators are buggy in Safari.
        if (hasNextMethod) {
            var proto = getPrototypeOf(getPrototypeOf(arrayIteratorTest));
            if (proto !== Object.prototype) {
                iteratorPrototype = proto;
            } else {
                buggySafariIterators = true;
            }
        }

        // Fallback if iteratorPrototype is null.
        if (iteratorPrototype == null) {
            iteratorPrototype = {};
        }

        // Ensure Symbol.iterator is defined on the prototype.
        if (!isGlobalPure && !hasProperty(iteratorPrototype, wellKnownSymbolIterator)) {
            defineProperty(iteratorPrototype, wellKnownSymbolIterator, function() {
                return this;
            });
        }

        moduleRef.exports = {
            IteratorPrototype: iteratorPrototype,
            BUGGY_SAFARI_ITERATORS: buggySafariIterators
        };
    },

    /* Module 68 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var getGlobalProperty = moduleLoader(6); // Utility to get global property
        var definePropertyModule = moduleLoader(10); // Module for Object.defineProperty
        var wellKnownSymbolSpecies = moduleLoader(5)("species"); // Symbol.species
        var supportsDefineProperty = moduleLoader(12); // Check if Object.defineProperty is supported

        moduleRef.exports = function(constructorName) {
            var constructorRef = getGlobalProperty(constructorName);
            var descriptor = definePropertyModule.f;

            // If supports defineProperty and constructor exists and doesn't have Symbol.species, add it.
            if (supportsDefineProperty && constructorRef && !constructorRef[wellKnownSymbolSpecies]) {
                descriptor(constructorRef, wellKnownSymbolSpecies, {
                    configurable: true,
                    get: function() {
                        return this;
                    }
                });
            }
        };
    },

    /* Module 69 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var globalObject = moduleLoader(8); // Global object
        var collectionImplementations = moduleLoader(33); // Utility to add multiple properties
        var collectionHelper = moduleLoader(31); // Collection helper utilities
        var collectionCreator = moduleLoader(46); // Generic collection constructor helper
        var weakCollectionHandler = moduleLoader(105); // Handler for Weak collections
        var isObject = moduleLoader(9); // Utility to check if value is an object
        var internalState = moduleLoader(17); // Internal state storage

        var getInternalState = internalState.enforce;
        var hasInternalState = internalState.has;
        var nativeWeakMap = globalObject.WeakMap;
        var isNativeWeakMap = moduleLoader(57); // Check for native WeakMap support
        var isIEActiveX = !globalObject.ActiveXObject && "ActiveXObject" in globalObject; // Check for IE ActiveXObject
        var objectIsExtensible = Object.isExtensible; // Native Object.isExtensible

        /**
         * Creates a WeakMap-like constructor.
         * @param {function} getConstructor - Function to get the actual constructor.
         * @returns {function} The WeakMap constructor.
         */
        var WeakMapConstructorCreator = function(getConstructor) {
            return function WeakMap(iterable) {
                return getConstructor(this, arguments.length ? iterable : undefined);
            };
        };

        var WeakMap = moduleRef.exports = collectionCreator("WeakMap", WeakMapConstructorCreator, weakCollectionHandler);

        // If native WeakMap exists and IE ActiveX is detected, apply workarounds for frozen objects.
        if (isNativeWeakMap && isIEActiveX) {
            var IEWeakMap = weakCollectionHandler.getConstructor(WeakMapConstructorCreator, "WeakMap", true); // Create a fallback IE-compatible WeakMap
            collectionHelper.REQUIRED = true; // Mark collection helper as required

            var weakMapPrototype = WeakMap.prototype;
            var originalDelete = weakMapPrototype['delete'];
            var originalHas = weakMapPrototype.has;
            var originalGet = weakMapPrototype.get;
            var originalSet = weakMapPrototype.set;

            collectionImplementations(weakMapPrototype, {
                delete: function(key) {
                    if (isObject(key) && !objectIsExtensible(key)) {
                        var state = getInternalState(this);
                        return state.frozen || (state.frozen = new IEWeakMap()), originalDelete.call(this, key) || state.frozen['delete'](key);
                    }
                    return originalDelete.call(this, key);
                },
                has: function(key) {
                    if (isObject(key) && !objectIsExtensible(key)) {
                        var state = getInternalState(this);
                        return state.frozen || (state.frozen = new IEWeakMap()), originalHas.call(this, key) || state.frozen.has(key);
                    }
                    return originalHas.call(this, key);
                },
                get: function(key) {
                    if (isObject(key) && !objectIsExtensible(key)) {
                        var state = getInternalState(this);
                        return state.frozen || (state.frozen = new IEWeakMap()), originalHas.call(this, key) ? originalGet.call(this, key) : state.frozen.get(key);
                    }
                    return originalGet.call(this, key);
                },
                set: function(key, value) {
                    if (isObject(key) && !objectIsExtensible(key)) {
                        var state = getInternalState(this);
                        state.frozen || (state.frozen = new IEWeakMap()), originalHas.call(this, key) ? originalSet.call(this, key, value) : state.frozen.set(key, value);
                    } else {
                        originalSet.call(this, key, value);
                    }
                    return this;
                }
            });
        }
    },

    /* Module 70 */
    function(moduleRef, exportsRef, moduleLoader) {
        // Polyfill for Math.scale
        moduleRef.exports = Math.scale || function(value, inMin, inMax, outMin, outMax) {
            // Return NaN if any argument is NaN or if too few arguments.
            if (arguments.length === 0 || value !== value || inMin !== inMin || inMax !== inMax || outMin !== outMin || outMax !== outMax) {
                return NaN;
            }
            // Handle infinity cases.
            if (value === Infinity || value === -Infinity) {
                return value;
            }
            // Linear interpolation.
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        };
    },

    /* Module 71 */
    function(moduleRef, exportsRef, moduleLoader) {
        // Whitespace characters (used for trimming).
        moduleRef.exports = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";
    },

    /* Module 72 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var requireFunction = moduleLoader(4); // Utility to require a function

        /**
         * Creates a deferred object with a promise and its resolve/reject methods.
         * @param {Function} PromiseConstructor - The Promise constructor to use.
         * @returns {object} An object containing the promise and its resolver functions.
         */
        var Deferred = function(PromiseConstructor) {
            var resolveFunc, rejectFunc;
            this.promise = new PromiseConstructor(function(resolve, reject) {
                // Ensure resolve/reject are only set once.
                if (resolveFunc !== undefined || rejectFunc !== undefined) {
                    throw TypeError("Bad Promise constructor");
                }
                resolveFunc = resolve;
                rejectFunc = reject;
            });
            this.resolve = requireFunction(resolveFunc);
            this.reject = requireFunction(rejectFunc);
        };

        exportsRef.f = function(PromiseConstructor) {
            return new Deferred(PromiseConstructor);
        };
    },

    /* Module 73 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        moduleRef.exports = function(func) {
            try {
                return {
                    error: false,
                    value: func()
                };
            } catch (error) {
                return {
                    error: true,
                    value: error
                };
            }
        };
    },

    /* Module 74 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var validateObject = moduleLoader(1); // Utility to validate an object
        var requireFunction = moduleLoader(4); // Utility to require a function

        moduleRef.exports = function() {
            var instance = validateObject(this); // Ensure 'this' is an object
            var addMethod = requireFunction(instance.add); // Get the 'add' method

            for (var i = 0, len = arguments.length; i < len; i++) {
                addMethod.call(instance, arguments[i]); // Call add for each argument
            }
            return instance;
        };
    },

    /* Module 75 */
    function(moduleRef, exportsRef, moduleLoader) {
        var isObject = moduleLoader(9); // Utility to check if value is an object
        var objectToString = moduleLoader(24); // Object.prototype.toString
        var wellKnownSymbolMatch = moduleLoader(5)("match"); // Symbol.match

        moduleRef.exports = function(value) {
            var matchSymbol;
            return isObject(value) &&
                ((matchSymbol = value[wellKnownSymbolMatch]) !== undefined ? !!matchSymbol : objectToString(value) === "RegExp");
        };
    },

    /* Module 76 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        var validateObject = moduleLoader(1); // Utility to validate an object

        moduleRef.exports = function() {
            var regex = validateObject(this);
            var flags = "";
            if (regex.global) flags += "g";
            if (regex.ignoreCase) flags += "i";
            if (regex.multiline) flags += "m";
            if (regex.dotAll) flags += "s";
            if (regex.unicode) flags += "u";
            if (regex.sticky) flags += "y";
            return flags;
        };
    },

    /* Module 77 */
    function(moduleRef, exportsRef, moduleLoader) {
        moduleRef.exports = require("fs"); // Node.js 'fs' module
    },

    /* Module 78 */
    function(moduleRef, exportsRef, moduleLoader) {
        "use strict";
        // Mark as an ES module.
        moduleLoader.markAsEsModule(exportsRef);

        // Load various polyfills and extensions.
        moduleLoader(79); // Math.hypot
        moduleLoader(87); // AggregateError
        moduleLoader(98); // Array.prototype.lastIndex
        moduleLoader(99); // Array.prototype.lastItem
        moduleLoader(100); // compositeKey
        moduleLoader(109); // Map.prototype.deleteAll
        moduleLoader(110); // Map.prototype.every
        moduleLoader(111); // Map.prototype.filter
        moduleLoader(112); // Map.prototype.find
        moduleLoader(113); // Map.prototype.findKey
        moduleLoader(114); // Map.from
        moduleLoader(115); // Map.groupBy
        moduleLoader(116); // Map.prototype.includes
        moduleLoader(119); // Map.keyBy
        moduleLoader(120); // Map.prototype.keyOf
        moduleLoader(121); // Map.prototype.mapKeys
        moduleLoader(122); // Map.prototype.mapValues
        moduleLoader(123); // Map.prototype.merge
        moduleLoader(124); // Map.of
        moduleLoader(125); // Map.prototype.reduce
        moduleLoader(126); // Map.prototype.some
        moduleLoader(127); // Map.prototype.update
        moduleLoader(128); // Math.clamp
        moduleLoader(129); // Math.DEG_PER_RAD
        moduleLoader(130); // Math.degrees
        moduleLoader(131); // Math.fscale
        moduleLoader(134); // Math.iaddh
        moduleLoader(135); // Math.imulh
        moduleLoader(136); // Math.isubh
        moduleLoader(137); // Math.RAD_PER_DEG
        moduleLoader(138); // Math.radians
        moduleLoader(139); // Math.scale
        moduleLoader(140); // Math.seededPRNG
        moduleLoader(142); // Math.signbit
        moduleLoader(143); // Math.umulh
        moduleLoader(144); // Number.fromString
        moduleLoader(147); // Observable
        moduleLoader(149); // Promise.any
        moduleLoader(150); // Promise.try
        moduleLoader(151); // Reflect.defineMetadata
        moduleLoader(152); // Reflect.deleteMetadata
        moduleLoader(153); // Reflect.getMetadata
        moduleLoader(154); // Reflect.getMetadataKeys
        moduleLoader(156); // Reflect.getOwnMetadata
        moduleLoader(157); // Reflect.getOwnMetadataKeys
        moduleLoader(158); // Reflect.hasMetadata
        moduleLoader(159); // Reflect.hasOwnMetadata
        moduleLoader(160); // Reflect.metadata
        moduleLoader(161); // Set.prototype.addAll
        moduleLoader(162); // Set.prototype.deleteAll
        moduleLoader(163); // Set.prototype.difference
        moduleLoader(164); // Set.prototype.every
        moduleLoader(165); // Set.prototype.filter
        moduleLoader(166); // Set.prototype.find
        moduleLoader(167); // Set.from
        moduleLoader(168); // Set.prototype.intersection
        moduleLoader(169); // Set.prototype.isDisjointFrom
        moduleLoader(170); // Set.prototype.isSubsetOf
        moduleLoader(171); // Set.prototype.isSupersetOf
        moduleLoader(172); // Set.prototype.join
        moduleLoader(173); // Set.prototype.map
        moduleLoader(174); // Set.of
        moduleLoader(175); // Set.prototype.reduce
        moduleLoader(176); // Set.prototype.some
        moduleLoader(177); // Set.prototype.symmetricDifference
        moduleLoader(178); // Set.prototype.union
        moduleLoader(179); // String.prototype.at
        moduleLoader(180); // String.prototype.codePoints
        moduleLoader(181); // String.prototype.matchAll (dependency)
        moduleLoader(184); // String.prototype.replaceAll
        moduleLoader(185); // Symbol.dispose
        moduleLoader(187); // Symbol.observable
        moduleLoader(188); // Symbol.patternMatch
        moduleLoader(189); // WeakMap.prototype.deleteAll
        moduleLoader(190); // WeakMap.from
        moduleLoader(191); // WeakMap.of
        moduleLoader(192); // WeakSet.prototype.addAll
        moduleLoader(193); // WeakSet.prototype.deleteAll
        moduleLoader(194); // WeakSet.from
        moduleLoader(195); // WeakSet.of

        // Load the 'fs' module for file system operations.
        var fileSystemModule = moduleLoader(77);

        /**
         * Main application logic.
         * Reads input from /dev/stdin, performs a calculation, and prints the result.
         * @param {string} rawInput - The raw string input from stdin.
         */
        (function processInputAndCalculate(rawInput) {
            // Define constants for calculation.
            const SCALING_FACTOR = 100;
            const MIN_OUTPUT_THRESHOLD = 100n; // Using BigInt for comparison

            // Input validation: ensure rawInput is a string.
            if (typeof rawInput !== 'string') {
                console.error("Error: Input must be a string.");
                return;
            }

            // Clean and split the input string.
            const cleanedParts = rawInput.trim().split(" ");

            // Input validation: ensure there are at least two parts.
            if (cleanedParts.length < 2) {
                console.error("Error: Insufficient input parts. Expected at least two numbers.");
                return;
            }

            // Extract numeric parts as strings.
            const firstNumericString = cleanedParts[0];
            const secondNumericString = cleanedParts[1];

            // Parse the second number and apply scaling.
            const parsedSecondNumber = parseFloat(secondNumericString);
            // Input validation: check if parsedSecondNumber is a valid number.
            if (isNaN(parsedSecondNumber)) {
                console.error("Error: Second input part is not a valid number.");
                return;
            }

            const scaledSecondNumber = Math.floor(SCALING_FACTOR * parsedSecondNumber);

            // Perform the BigInt multiplication.
            let resultBigInt;
            try {
                const bigIntFirst = BigInt(firstNumericString);
                const bigIntScaledSecond = BigInt(scaledSecondNumber);
                resultBigInt = bigIntFirst * bigIntScaledSecond;
            } catch (e) {
                console.error("Error converting numbers to BigInt or during multiplication:", e.message);
                return;
            }

            // Determine the final output based on the threshold.
            let finalOutput;
            if (resultBigInt < MIN_OUTPUT_THRESHOLD) {
                finalOutput = 0;
            } else {
                // Convert BigInt to string and remove the last two characters (representing cents).
                finalOutput = resultBigInt.toString().substring(0, resultBigInt.toString().length - 2);
            }

            // Print the calculated result to the console.
            console.log(finalOutput);
        })(fileSystemModule.readFileSync("/dev/stdin", "utf8")); // Read input from stdin
    }
]);