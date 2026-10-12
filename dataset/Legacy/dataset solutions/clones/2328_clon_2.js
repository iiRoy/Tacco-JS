!function(sourceModuleDefinitions) {
    // Module cache stores loaded modules
    var loadedModuleCache = {};

    /**
     * Loads a module by its ID.
     * If the module is already in cache, it returns the cached instance.
     * Otherwise, it creates a new module instance, executes its definition, and caches it.
     * @param {number} requestedModuleId - The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function loadModule(requestedModuleId) {
        // If module is in cache, return its exports
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // Create a new module instance and add it to cache
        var cachedModuleInstance = loadedModuleCache[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module function, passing module, exports, and the loader itself
        sourceModuleDefinitions[requestedModuleId].call(cachedModuleInstance.exports, cachedModuleInstance, cachedModuleInstance.exports, loadModule);

        // Mark module as loaded
        cachedModuleInstance.isLoaded = true;
        return cachedModuleInstance.exports;
    }

    // Store module definitions
    loadModule.definitions = sourceModuleDefinitions;

    // Store module cache
    loadModule.cache = loadedModuleCache;

    /**
     * Defines an export getter on a target object.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {function} getterFunction - The function to call to get the property value.
     */
    loadModule.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Check if property already exists on the target object
        if (!loadModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    /**
     * Marks a module exports object as an ES module.
     * This adds a Symbol.toStringTag property and __esModule flag.
     * @param {object} targetNamespace - The module exports object.
     */
    loadModule.markAsEsModule = function(targetNamespace) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetNamespace, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(targetNamespace, "__esModule", { value: true });
    };

    /**
     * Creates a module proxy for interop requiring a non-ES module.
     * @param {any} moduleContent - The original module content.
     * @param {number} transformationFlags - Flags for transformation.
     * @returns {object} The transformed module content or a proxy object.
     */
    loadModule.createModuleProxy = function(moduleContent, transformationFlags) {
        // If flag 1 is set, it means the module is already loaded, just return it.
        if (transformationFlags & 1) {
            return loadModule(moduleContent);
        }
        // If flag 8 is set, it's a direct module export (e.g., CommonJS), return as is.
        if (transformationFlags & 8) {
            return moduleContent;
        }
        // If flag 4 is set and it's an object and an ES module, return it.
        if (transformationFlags & 4 && typeof moduleContent === "object" && moduleContent && moduleContent.__esModule) {
            return moduleContent;
        }

        // Create a new namespace object
        var newNamespace = Object.create(null);
        // Mark it as an ES module
        loadModule.markAsEsModule(newNamespace);
        // Define the default export
        Object.defineProperty(newNamespace, "default", { enumerable: true, value: moduleContent });

        // If flag 2 is set and not a string, copy all properties from the original module.
        if (transformationFlags & 2 && typeof moduleContent !== "string") {
            for (var originalProperty in moduleContent) {
                loadModule.defineExportGetter(newNamespace, originalProperty, function(key) {
                    return moduleContent[key];
                }.bind(null, originalProperty));
            }
        }
        return newNamespace;
    };

    /**
     * Gets the default export of a module.
     * @param {object} moduleReference - The module reference.
     * @returns {any} The default export or the module itself.
     */
    loadModule.getDefaultExport = function(moduleReference) {
        var exportGetter = moduleReference && moduleReference.__esModule ?
            function() { return moduleReference["default"]; } :
            function() { return moduleReference; };
        loadModule.defineExportGetter(exportGetter, "a", exportGetter);
        return exportGetter;
    };

    /**
     * Checks if an object has a property directly on itself.
     * @param {object} checkObject - The object to check.
     * @param {string} checkProperty - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    loadModule.hasOwn = function(checkObject, checkProperty) {
        return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
    };

    // Public path (for asset loading, etc.)
    loadModule.publicPath = "";

    // Load the startup module (module 343)
    loadModule(loadModule.startupModuleId = 343);
}([
    function(currentModule, moduleExports, requestModule) { // Module 0: Feature polyfill helper
        const globalObject = requestModule(5); // Get global object
        const getDescriptor = requestModule(19).f; // Get property descriptor function
        const defineProperty = requestModule(18); // Function to define a property
        const patchProperty = requestModule(20); // Function to update a property/method
        const ensureGlobal = requestModule(79); // Function to register global variables
        const transferProps = requestModule(104); // Function to copy properties
        const isPolyfillNeeded = requestModule(63); // Function to check if feature needs polyfill

        currentModule.exports = function(featureConfig, methodsToApply) {
            let targetObject, propertyKey, existingProperty, polyfillMethod, descriptorResult;
            const targetScope = featureConfig.target;
            const isGlobalScope = featureConfig.global;
            const isStaticProp = featureConfig.stat;

            // Determine the object to modify (global, static on global[target], or prototype)
            if (targetObject = isGlobalScope ? globalObject : isStaticProp ? globalObject[targetScope] || ensureGlobal(targetScope, {}) : (globalObject[targetScope] || {}).prototype) {
                // Iterate over methods to polyfill
                for (propertyKey in methodsToApply) {
                    // Get the existing property descriptor or value
                    polyfillMethod = methodsToApply[propertyKey];
                    existingProperty = featureConfig.noTargetGet ? (descriptorResult = getDescriptor(targetObject, propertyKey)) && descriptorResult.value : targetObject[propertyKey];

                    // Check if polyfill is forced or if existing property is missing
                    if (!isPolyfillNeeded(isGlobalScope ? propertyKey : targetScope + (isStaticProp ? "." : "#") + propertyKey, featureConfig.forced) && void 0 !== existingProperty) {
                        // If types match, no need to polyfill, skip
                        if (typeof polyfillMethod === typeof existingProperty) continue;
                        // Otherwise, copy properties (e.g., Symbol properties)
                        transferProps(polyfillMethod, existingProperty);
                    }

                    // Apply 'sham' flag if needed
                    (featureConfig.sham || (existingProperty && existingProperty.sham)) && defineProperty(polyfillMethod, "sham", true);
                    // Update the property on the target object
                    patchProperty(targetObject, propertyKey, polyfillMethod, featureConfig);
                }
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 1: Object validation
        const isObjectUtil = requestModule(9); // Utility to check if a value is an object

        currentModule.exports = function(valueToCheck) {
            if (!isObjectUtil(valueToCheck)) {
                throw TypeError(String(valueToCheck) + " is not an object");
            }
            return valueToCheck;
        };
    },
    function(currentModule, moduleExports) { // Module 2: Pure flag
        currentModule.exports = false; // Indicates if the environment is "pure" (e.g., no global pollution)
    },
    function(currentModule, moduleExports, requestModule) { // Module 3: Iterator loop helper
        const validateObject = requestModule(1); // Utility to validate an object
        const wrapIterator = requestModule(87); // Utility to check if something is an iterable array
        const lengthUtil = requestModule(11); // Utility to get array-like length
        const bindFunction = requestModule(13); // Utility to bind a function to a context
        const getIteratorMethod = requestModule(51); // Utility to get the iterator method of an object
        const isIterableArray = requestModule(113); // Utility to check if iterable is an array

        // Custom class to signal early exit from iteration
        const IteratorResult = function(stopped, result) {
            this.isStopped = stopped;
            this.finalResult = result;
        };

        // Main iteration utility function
        currentModule.exports = function(iterableSource, iteratorCallback, callbackContext, isPredicate, earlyExit) {
            let iteratorInstance, methodToCall, currentValue, callbackResult, valueEntry;
            const bindedCallback = bindFunction(iteratorCallback, callbackContext, isPredicate ? 2 : 1);

            // If early exit is enabled, treat it as a predicate with a stop mechanism
            if (earlyExit) {
                iteratorInstance = iterableSource;
            } else {
                // Get the iterator method from the source
                if (typeof(methodToCall = getIteratorMethod(iterableSource)) !== "function") {
                    throw TypeError("Target is not iterable");
                }
                // If it's an array-like iterable, use a simple loop
                if (wrapIterator(methodToCall)) {
                    for (currentValue = 0, valueEntry = lengthUtil(iterableSource.length); valueEntry > currentValue; currentValue++) {
                        if ((callbackResult = isPredicate ? bindedCallback(validateObject(iterableSource[currentValue])[0], iterableSource[currentValue][1]) : bindedCallback(iterableSource[currentValue])) && callbackResult instanceof IteratorResult) {
                            return callbackResult;
                        }
                    }
                    return new IteratorResult(false);
                }
                iteratorInstance = methodToCall.call(iterableSource);
            }

            // Iterate through the values
            for (valueEntry = iteratorInstance.next; !(currentValue = valueEntry.call(iteratorInstance)).done;) {
                if ("object" === typeof(callbackResult = isIterableArray(iteratorInstance, bindedCallback, currentValue.value, isPredicate)) && callbackResult && callbackResult instanceof IteratorResult) {
                    return callbackResult;
                }
            }
            return new IteratorResult(false);
        };

        // Static method to create a stop signal
        currentModule.exports.stopExecution = function(result) {
            return new IteratorResult(true, result);
        };
    },
    function(currentModule, moduleExports) { // Module 4: Function validation
        currentModule.exports = function(inputFunction) {
            if (typeof inputFunction !== "function") {
                throw TypeError(String(inputFunction) + " is not a function");
            }
            return inputFunction;
        };
    },
    function(currentModule, moduleExports) { // Module 5: Get global object
        // Helper to find the global object across different environments
        const getGlobalObject = function(candidateObject) {
            return candidateObject && candidateObject.Math === Math && candidateObject;
        };

        // Try to get globalThis, then window, then self, then global (Node.js), fallback to Function("return this")()
        currentModule.exports = getGlobalObject(typeof globalThis === "object" && globalThis) ||
            getGlobalObject(typeof window === "object" && window) ||
            getGlobalObject(typeof self === "object" && self) ||
            getGlobalObject(typeof global === "object" && global) ||
            Function("return this")();
    },
    function(currentModule, moduleExports) { // Module 6: Execute safely utility
        currentModule.exports = function(callbackFn) {
            try {
                return !!callbackFn();
            } catch (error) {
                return true;
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 7: Well-known Symbol retriever
        const globalContext = requestModule(5); // Get global object
        const sharedSymbolRegistry = requestModule(60); // Shared registry for symbols
        const hasOwnProp = requestModule(14); // Object.prototype.hasOwnProperty check
        const supportsSymbol = requestModule(107); // Check if native Symbol is supported
        const customSymbolGenerator = requestModule(44); // Fallback symbol generator

        const wellKnownSymbolCache = sharedSymbolRegistry("wellKnownSymbols"); // Cache for well-known symbols
        const nativeSymbol = globalContext.Symbol; // Native Symbol constructor

        currentModule.exports = function(symbolKey) {
            // If symbol is already in cache, return it
            if (hasOwnProp(wellKnownSymbolCache, symbolKey)) {
                return wellKnownSymbolCache[symbolKey];
            }
            // If native Symbol is supported and symbol is well-known, use native Symbol
            if (supportsSymbol && hasOwnProp(nativeSymbol, symbolKey)) {
                return wellKnownSymbolCache[symbolKey] = nativeSymbol[symbolKey];
            }
            // Otherwise, generate a custom symbol
            return wellKnownSymbolCache[symbolKey] = customSymbolGenerator("Symbol." + symbolKey);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 8: Object.defineProperty feature detection
        const executeSafely = requestModule(6); // Utility to execute a function safely

        currentModule.exports = !executeSafely(function() {
            // Test if Object.defineProperty works as expected
            return 7 !== Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    },
    function(currentModule, moduleExports) { // Module 9: IsObject utility
        currentModule.exports = function(value) {
            return typeof value === "object" ? value !== null : typeof value === "function";
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 10: Object.defineProperty wrapper
        const hasDefineProperty = requestModule(8); // Feature detection for Object.defineProperty
        const validateObject = requestModule(1); // Utility to validate an object
        const createPropertyDescriptor = requestModule(30); // Utility to create a property descriptor
        const normalizeKey = requestModule(31); // Utility to normalize property keys

        const objectDefineProperty = Object.defineProperty; // Native Object.defineProperty

        // Exported function to define a property
        moduleExports.define = hasDefineProperty ? objectDefineProperty : function(targetObj, propName, propDescriptor) {
            validateObject(targetObj); // Ensure target is an object
            propName = normalizeKey(propName, true); // Normalize property key
            validateObject(propDescriptor); // Ensure descriptor is an object

            // Fallback for environments without full Object.defineProperty support
            if (requestModule(101)) { // If canThrowError is true (IE8 polyfill behavior)
                try {
                    return objectDefineProperty(targetObj, propName, propDescriptor);
                } catch (error) {
                    // Fall through if error occurs (e.g., non-configurable property)
                }
            }

            // Throw error if accessor properties are not supported
            if ("get" in propDescriptor || "set" in propDescriptor) {
                throw TypeError("Accessors not supported");
            }
            // Set value directly if it's a data property
            if ("value" in propDescriptor) {
                targetObj[propName] = propDescriptor.value;
            }
            return targetObj;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 11: Length coercion
        const coerceToNumber = requestModule(24); // Utility to coerce value to integer
        const mathMin = Math.min; // Math.min reference

        currentModule.exports = function(inputLength) {
            // Ensure length is a non-negative integer
            return inputLength > 0 ? mathMin(coerceToNumber(inputLength), 9007199254740991) : 0;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 12: Global lookup utility
        const sharedGlobalRegistry = requestModule(105); // Shared global registry
        const globalContext = requestModule(5); // Global object

        // Helper to get a function or undefined
        const getFunctionOrUndefined = function(func) {
            return typeof func === "function" ? func : undefined;
        };

        currentModule.exports = function(namespace, property) {
            // If two arguments, look up property within namespace in shared registry or global context
            return arguments.length < 2 ?
                getFunctionOrUndefined(sharedGlobalRegistry[namespace]) || getFunctionOrUndefined(globalContext[namespace]) :
                (sharedGlobalRegistry[namespace] && sharedGlobalRegistry[namespace][property]) || (globalContext[namespace] && globalContext[namespace][property]);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 13: Function binding utility
        const verifyFunction = requestModule(4); // Utility to validate a function

        currentModule.exports = function(targetFunction, thisArg, argCount) {
            verifyFunction(targetFunction); // Ensure target is a function

            // Return a bound function based on the number of arguments
            if (void 0 === thisArg) {
                return targetFunction;
            }
            switch (argCount) {
                case 0:
                    return function() {
                        return targetFunction.call(thisArg);
                    };
                case 1:
                    return function(param1) {
                        return targetFunction.call(thisArg, param1);
                    };
                case 2:
                    return function(param1, param2) {
                        return targetFunction.call(thisArg, param1, param2);
                    };
                case 3:
                    return function(param1, param2, param3) {
                        return targetFunction.call(thisArg, param1, param2, param3);
                    };
            }
            // For arbitrary arguments, use apply
            return function() {
                return targetFunction.apply(thisArg, arguments);
            };
        };
    },
    function(currentModule, moduleExports) { // Module 14: Object.prototype.hasOwnProperty shorthand
        const objectPrototype = {}.hasOwnProperty; // Reference to native hasOwnProperty

        currentModule.exports = function(targetObject, propertyKey) {
            return objectPrototype.call(targetObject, propertyKey);
        };
    },
    function(currentModule, moduleExports) { // Module 15: ToObject utility
        currentModule.exports = function(input) {
            if (null == input) {
                throw TypeError("Can't call method on " + input);
            }
            return Object(input);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 16: Internal state management (WeakMap based)
        const supportsWeakMap = requestModule(103); // Check if WeakMap is supported
        const globalObject = requestModule(5); // Global object
        const isObject = requestModule(9); // Utility to check if a value is an object
        const defineHiddenProperty = requestModule(18); // Define a hidden property
        const propertyExists = requestModule(14); // Check if property exists
        const generateUniqueKey = requestModule(59); // Generate a unique symbol-like key
        const hiddenDataStore = requestModule(45); // Object to store hidden properties

        const nativeWeakMap = globalObject.WeakMap; // Native WeakMap constructor

        let setter, getter, checker; // Functions for setting, getting, and checking internal state

        if (supportsWeakMap) {
            const weakMapInstance = new nativeWeakMap(); // Create a WeakMap instance
            const getWeakMapData = weakMapInstance.get; // Native WeakMap.prototype.get
            const hasWeakMapData = weakMapInstance.has; // Native WeakMap.prototype.has
            const setWeakMapData = weakMapInstance.set; // Native WeakMap.prototype.set

            setter = function(target, value) {
                setWeakMapData.call(weakMapInstance, target, value);
                return value;
            };
            getter = function(target) {
                return getWeakMapData.call(weakMapInstance, target) || {};
            };
            checker = function(target) {
                return hasWeakMapData.call(weakMapInstance, target);
            };
        } else {
            const internalKey = generateUniqueKey("state"); // Fallback key for state
            hiddenDataStore[internalKey] = true; // Mark key as internal

            setter = function(target, value) {
                defineHiddenProperty(target, internalKey, value);
                return value;
            };
            getter = function(target) {
                return propertyExists(target, internalKey) ? target[internalKey] : {};
            };
            checker = function(target) {
                return propertyExists(target, internalKey);
            };
        }

        currentModule.exports = {
            set: setter,
            get: getter,
            has: checker,
            // Enforces that an object has internal state, creating it if necessary
            enforce: function(target) {
                return checker(target) ? getter(target) : setter(target, {});
            },
            // Creates a getter function for a specific type of internal state
            getterFor: function(type) {
                return function(target) {
                    let state;
                    if (!isObject(target) || (state = getter(target)).type !== type) {
                        throw TypeError("Incompatible receiver, " + type + " required");
                    }
                    return state;
                };
            }
        };
    },
    function(currentModule, moduleExports) { // Module 17: RequireObjectCoercible utility
        currentModule.exports = function(value) {
            if (null == value) {
                throw TypeError("Can't call method on " + value);
            }
            return value;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 18: Define property utility
        const hasDefineProperty = requestModule(8); // Feature detection
        const objectDefineProperty = requestModule(10).define; // Wrapper for Object.defineProperty
        const createPropertyDescriptor = requestModule(30); // Utility to create property descriptor

        currentModule.exports = hasDefineProperty ? function(targetObject, propertyKey, propertyValue) {
            return objectDefineProperty(targetObject, propertyKey, createPropertyDescriptor(1, propertyValue));
        } : function(targetObject, propertyKey, propertyValue) {
            targetObject[propertyKey] = propertyValue;
            return targetObject;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 19: Object.getOwnPropertyDescriptor wrapper
        const hasDefineProperty = requestModule(8); // Feature detection
        const propertyIsEnumerable = requestModule(58).f; // Object.prototype.propertyIsEnumerable wrapper
        const createPropertyDescriptor = requestModule(30); // Utility to create property descriptor
        const toObject = requestModule(25); // Utility to convert to object
        const normalizeKey = requestModule(31); // Utility to normalize property keys
        const propertyExists = requestModule(14); // HasOwnProperty check
        const canThrowError = requestModule(101); // Check if Object.defineProperty can throw errors

        const nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Native function

        // Exported function to get a property descriptor
        moduleExports.get = hasDefineProperty ? nativeGetOwnPropertyDescriptor : function(targetObject, propertyKey) {
            targetObject = toObject(targetObject); // Ensure target is an object
            propertyKey = normalizeKey(propertyKey, true); // Normalize key

            // Handle IE8 bug with non-enumerable properties
            if (canThrowError) {
                try {
                    return nativeGetOwnPropertyDescriptor(targetObject, propertyKey);
                } catch (error) {
                    // Fall through
                }
            }
            // If property exists, create a descriptor
            if (propertyExists(targetObject, propertyKey)) {
                return createPropertyDescriptor(!propertyIsEnumerable.call(targetObject, propertyKey), targetObject[propertyKey]);
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 20: Patch property utility
        const globalContext = requestModule(5); // Global object
        const defineHiddenProperty = requestModule(18); // Define a hidden property
        const propertyExists = requestModule(14); // HasOwnProperty check
        const registerGlobalValue = requestModule(79); // Register global variable
        const getFunctionSource = requestModule(80); // Get function source code
        const internalState = requestModule(16); // Internal state management

        const getState = internalState.get; // Get internal state
        const enforceState = internalState.enforce; // Enforce internal state

        const splitString = String(String).split("String"); // Used to get function source for comments

        // Exported function to patch a property
        currentModule.exports = function(targetObject, propertyName, propertyValue, options) {
            const isUnsafe = !!options && !!options.unsafe; // Check for unsafe option
            const isEnumerable = !!options && !!options.enumerable; // Check for enumerable option
            const noTargetGet = !!options && !!options.noTargetGet; // Check for noTargetGet option

            // If not global context
            if (targetObject !== globalContext) {
                // Handle unsafe patches (delete existing property if present)
                if (isUnsafe && !noTargetGet && targetObject[propertyName]) {
                    isEnumerable = true; // Force enumerable if unsafe and property exists
                } else {
                    delete targetObject[propertyName]; // Delete existing property
                }
                // Set property on target object
                isEnumerable ? targetObject[propertyName] = propertyValue : defineHiddenProperty(targetObject, propertyName, propertyValue);
            } else {
                // Set property on global context
                isEnumerable ? targetObject[propertyName] = propertyValue : registerGlobalValue(propertyName, propertyValue);
            }

            // Store function source for debugging/toString purposes
            if (typeof propertyValue === "function") {
                if (typeof propertyName !== "string" || propertyExists(propertyValue, "name")) {
                    // Do nothing if name exists or propertyName is not a string
                } else {
                    defineHiddenProperty(propertyValue, "name", propertyName); // Set function name
                }
                enforceState(propertyValue).source = splitString.join(typeof propertyName === "string" ? propertyName : "");
            }
        };

        // Patch Function.prototype.toString to include source code from internal state
        patchProperty(Function.prototype, "toString", function() {
            return typeof this === "function" && getState(this).source || getFunctionSource(this);
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 21: Define well-known Symbol
        const globalSymbolRegistry = requestModule(105); // Global symbol registry
        const propertyExists = requestModule(14); // HasOwnProperty check
        const defineWellKnownSymbol = requestModule(110).f; // Function to define a well-known symbol

        currentModule.exports = function(symbolKey) {
            // Define the well-known symbol if it doesn't already exist in the global registry
            if (!propertyExists(globalSymbolRegistry, symbolKey)) {
                defineWellKnownSymbol(symbolKey);
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 22: Get prototype of object
        const getPrototype = requestModule(105); // Global lookup for Object.getPrototypeOf
        const globalObject = requestModule(5); // Global object
        const propertyExists = requestModule(14); // HasOwnProperty check
        const internalProtoKey = requestModule(59)("IE_PROTO"); // Key for IE's __proto__ polyfill
        const supportsProto = requestModule(115); // Check if __proto__ is supported natively
        const objectPrototype = Object.prototype; // Object.prototype reference

        currentModule.exports = supportsProto ? Object.getPrototypeOf : function(targetObject) {
            targetObject = requestModule(15)(targetObject); // Coerce to object
            // If IE's __proto__ exists, use it
            if (propertyExists(targetObject, internalProtoKey)) {
                return targetObject[internalProtoKey];
            }
            // If constructor is a function and instance of itself, use constructor.prototype
            if (typeof targetObject.constructor === "function" && targetObject instanceof targetObject.constructor) {
                return targetObject.constructor.prototype;
            }
            // If it's a plain object, return Object.prototype, otherwise null
            return targetObject instanceof Object ? objectPrototype : null;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 23: Species constructor getter
        const validateObject = requestModule(1); // Object validation utility
        const validateFunction = requestModule(4); // Function validation utility
        const symbolSpecies = requestModule(7)("species"); // Symbol.species well-known symbol

        currentModule.exports = function(originalConstructor, fallbackConstructor) {
            let constructorRef;
            // Get the constructor of the original object
            const baseConstructor = validateObject(originalConstructor).constructor;
            // If Symbol.species is defined on the base constructor, use that
            if (void 0 === baseConstructor || null == (constructorRef = validateObject(baseConstructor)[symbolSpecies])) {
                return fallbackConstructor; // Fallback if species is not found
            }
            return validateFunction(constructorRef); // Return the species constructor
        };
    },
    function(currentModule, moduleExports) { // Module 24: ToInteger utility
        const mathCeil = Math.ceil; // Math.ceil reference
        const mathFloor = Math.floor; // Math.floor reference

        currentModule.exports = function(value) {
            value = +value; // Coerce to number
            // If NaN, return 0; otherwise, floor for positive, ceil for negative
            return value !== value ? 0 : (value > 0 ? mathFloor : mathCeil)(value);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 25: ToIndexedObject utility
        const toIndexedObject = requestModule(77); // Utility to convert to indexed object
        const requireObjectCoercible = requestModule(17); // Utility to ensure object is coercible

        currentModule.exports = function(target) {
            return toIndexedObject(requireObjectCoercible(target));
        };
    },
    function(currentModule, moduleExports) { // Module 26: Object.prototype.toString slice
        const nativeToString = {}.toString; // Reference to native Object.prototype.toString

        currentModule.exports = function(value) {
            return nativeToString.call(value).slice(8, -1); // Extract tag from [object Tag]
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 27: Object.create polyfill
        const validateObject = requestModule(1); // Object validation utility
        const defineProperties = requestModule(108); // Object.defineProperties polyfill
        const hiddenProperties = requestModule(82); // List of hidden properties
        const globalContext = requestModule(5); // Global object
        const emptyObject = requestModule(45); // Empty object for hidden properties
        const internalProtoKey = requestModule(59)("IE_PROTO"); // Key for IE's __proto__ polyfill
        const noop = function() {}; // No-op function

        // Function to create a dummy iframe for IE's Object.create polyfill
        const iframeCreator = function() {
            let iframeDoc, iframeObject = requestModule(78)("iframe"); // Create iframe element
            for (iframeObject.style.display = "none", globalContext.document.body.appendChild(iframeObject), iframeObject.src = String("javascript:"), (iframeDoc = iframeObject.contentWindow.document).open(), iframeDoc.write("<script>document.F=Object<\/script>"), iframeDoc.close(), iframeCreator = iframeDoc.F; hiddenProperties.length--;) {
                delete iframeCreator.prototype[hiddenProperties[hiddenProperties.length]];
            }
            return iframeCreator();
        };

        // Exported Object.create polyfill
        currentModule.exports = Object.create || function(prototype, properties) {
            let newObject;
            // If prototype is not null, set it as the prototype of a new object
            if (prototype !== null) {
                noop.prototype = validateObject(prototype);
                newObject = new noop();
                noop.prototype = null;
                newObject[internalProtoKey] = prototype;
            } else {
                newObject = iframeCreator(); // Use iframe trick for null prototype
            }
            // If properties are provided, define them
            return void 0 === properties ? newObject : defineProperties(newObject, properties);
        };

        emptyObject[internalProtoKey] = true; // Mark internal proto key as hidden
    },
    function(currentModule, moduleExports, requestModule) { // Module 28: Set to string tag utility
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const propertyExists = requestModule(14); // HasOwnProperty check
        const symbolToStringTag = requestModule(7)("toStringTag"); // Symbol.toStringTag well-known symbol

        currentModule.exports = function(target, tagName, isProto) {
            // Set Symbol.toStringTag property on target (or its prototype)
            // if it doesn't already exist
            if (target && !propertyExists(target = isProto ? target : target.prototype, symbolToStringTag)) {
                objectDefineProperty(target, symbolToStringTag, { configurable: true, value: tagName });
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 29: Map.prototype.entries polyfill
        const isPure = requestModule(2); // Check if environment is pure
        const mapEntries = requestModule(57); // Map.prototype.entries implementation

        currentModule.exports = isPure ? mapEntries : function(targetMap) {
            return Map.prototype.entries.call(targetMap);
        };
    },
    function(currentModule, moduleExports) { // Module 30: Create property descriptor
        currentModule.exports = function(flags, value) {
            return {
                enumerable: !(flags & 1), // 1: non-enumerable
                configurable: !(flags & 2), // 2: non-configurable
                writable: !(flags & 4), // 4: non-writable
                value: value
            };
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 31: ToPrimitive utility
        const isObject = requestModule(9); // Utility to check if a value is an object

        currentModule.exports = function(value, hint) {
            if (!isObject(value)) {
                return value; // Return primitive as is
            }
            let method, result;
            // Try valueOf, then toString, based on hint
            if (hint && typeof(method = value.toString) === "function" && !isObject(result = method.call(value))) {
                return result;
            }
            if (typeof(method = value.valueOf) === "function" && !isObject(result = method.call(value))) {
                return result;
            }
            if (!hint && typeof(method = value.toString) === "function" && !isObject(result = method.call(value))) {
                return result;
            }
            throw TypeError("Can't convert object to primitive value");
        };
    },
    function(currentModule, moduleExports) { // Module 32: Instance check utility
        currentModule.exports = function(instance, constructor, className) {
            if (!(instance instanceof constructor)) {
                throw TypeError("Incorrect " + (className ? className + " " : "") + "invocation");
            }
            return instance;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 33: Typed Array generation
        "use strict";
        const polyfillMethod = requestModule(0); // Polyfill method from module 0
        const globalContext = requestModule(5); // Global object
        const hasDefineProperty = requestModule(8); // Feature detection for Object.defineProperty
        const supportsBabel = requestModule(99); // Check if Babel's typed array polyfill is used
        const typedArrayConfig = requestModule(34); // Typed array configuration module
        const checkInstance = requestModule(32); // Instance check utility
        const createPropertyDescriptor = requestModule(30); // Property descriptor utility
        const defineProperty = requestModule(18); // Define property utility
        const getArrayLength = requestModule(11); // Array length utility
        const createArrayBuffer = requestModule(130); // ArrayBuffer creation utility
        const getOffset = requestModule(224); // Offset calculation utility
        const normalizeKey = requestModule(31); // Key normalization utility
        const isPropertyPresent = requestModule(14); // HasOwnProperty check
        const isObject = requestModule(9); // IsObject utility
        const createObject = requestModule(27); // Object.create polyfill
        const getOwnKeys = requestModule(38).f; // Object.getOwnPropertyNames
        const arrayIteration = requestModule(131); // Array.from polyfill
        const getPrototype = requestModule(41); // Object.setPrototypeOf
        const setToStringTag = requestModule(28); // Set Symbol.toStringTag
        const getDescriptor = requestModule(10).define; // Object.defineProperty wrapper
        const getPropertyDescriptor = requestModule(19).f; // Object.getOwnPropertyDescriptor
        const internalState = requestModule(16); // Internal state management

        const getState = internalState.get; // Get internal state
        const setState = internalState.set; // Set internal state
        const roundNumber = Math.round; // Math.round reference
        const rangeError = globalContext.RangeError; // RangeError constructor

        const arrayBufferConstructor = typedArrayConfig.ArrayBuffer; // ArrayBuffer
        const dataViewConstructor = typedArrayConfig.DataView; // DataView
        const nativeArrayBufferViews = typedArrayConfig.NATIVE_ARRAY_BUFFER_VIEWS; // Native typed array views support
        const typedArrayTag = typedArrayConfig.TYPED_ARRAY_TAG; // Typed array tag symbol
        const baseTypedArray = typedArrayConfig.TypedArray; // Base TypedArray constructor
        const baseTypedArrayProto = typedArrayConfig.TypedArrayPrototype; // Base TypedArray prototype
        const typedArrayConstructor = typedArrayConfig.aTypedArrayConstructor; // TypedArray constructor validator
        const isTypedArrayCheck = typedArrayConfig.isTypedArray; // TypedArray check

        // Helper to create a new typed array from an iterable
        const createTypedArrayFrom = function(typedArrayConstructor, iterable) {
            for (let i = 0, len = iterable.length, newArray = new(typedArrayConstructor)(len); i < len;) {
                newArray[i] = iterable[i++];
            }
            return newArray;
        };

        // Helper to define accessors for typed array properties
        const setAccessor = function(targetObject, propertyName) {
            getDescriptor(targetObject, propertyName, {
                get: function() {
                    return getState(this)[propertyName];
                }
            });
        };

        // Helper to check if a value is ArrayBuffer-like
        const isBufferLike = function(value) {
            let typeName;
            return value instanceof arrayBufferConstructor || "ArrayBuffer" === (typeName = requestModule(52)(value)) || "SharedArrayBuffer" === typeName;
        };

        // Helper to check if property access is valid for a typed array
        const isTypedArrayLike = function(typedArrayInstance, propertyName) {
            return isTypedArrayCheck(typedArrayInstance) && "symbol" !== typeof propertyName && propertyName in typedArrayInstance && String(+propertyName) === String(propertyName);
        };

        // Custom getOwnPropertyDescriptor for typed arrays
        const getTypedArrayDescriptor = function(typedArrayInstance, propertyName) {
            return isTypedArrayLike(typedArrayInstance, propertyName = normalizeKey(propertyName, true)) ?
                createPropertyDescriptor(2, typedArrayInstance[propertyName]) :
                getPropertyDescriptor.f(typedArrayInstance, propertyName);
        };

        // Custom defineProperty for typed arrays
        const defineTypedArrayProperty = function(typedArrayInstance, propertyName, propertyDescriptor) {
            // If it's a valid typed array index and a data property
            if (isTypedArrayLike(typedArrayInstance, propertyName = normalizeKey(propertyName, true)) && isObject(propertyDescriptor) && isPropertyPresent(propertyDescriptor, "value")) {
                // If not configurable, enumerable, or writable, or if accessor properties are present, use default defineProperty
                if (isPropertyPresent(propertyDescriptor, "get") || isPropertyPresent(propertyDescriptor, "set") || propertyDescriptor.configurable || (isPropertyPresent(propertyDescriptor, "writable") && !propertyDescriptor.writable) || (isPropertyPresent(propertyDescriptor, "enumerable") && !propertyDescriptor.enumerable)) {
                    getDescriptor(typedArrayInstance, propertyName, propertyDescriptor);
                } else {
                    typedArrayInstance[propertyName] = propertyDescriptor.value; // Set value directly
                }
                return typedArrayInstance;
            }
            return getDescriptor(typedArrayInstance, propertyName, propertyDescriptor); // Use default defineProperty
        };

        // If Object.defineProperty is supported
        if (hasDefineProperty) {
            // If native typed array views are not fully supported or have issues
            if (!nativeArrayBufferViews) {
                // Patch Object.getOwnPropertyDescriptor and Object.defineProperty
                getPropertyDescriptor.f = getTypedArrayDescriptor;
                getDescriptor = defineTypedArrayProperty;

                // Define internal property accessors
                setAccessor(baseTypedArrayProto, "buffer");
                setAccessor(baseTypedArrayProto, "byteOffset");
                setAccessor(baseTypedArrayProto, "byteLength");
                setAccessor(baseTypedArrayProto, "length");
            }

            // Exported function to define a typed array constructor
            currentModule.exports = function(arrayTypeName, constructorFactory, isClamped) {
                const byteMultiplier = (arrayTypeName.match(/\d+$/)[0] / 8); // Calculate bytes per element
                const fullArrayTypeName = arrayTypeName + (isClamped ? "Clamped" : "") + "Array"; // Full typed array name
                const getMethodName = "get" + arrayTypeName; // Getter method name
                const setMethodName = "set" + arrayTypeName; // Setter method name

                let targetConstructor = globalContext[fullArrayTypeName]; // Native constructor
                let currentConstructor = targetConstructor; // Current constructor
                let currentPrototype = currentConstructor && currentConstructor.prototype; // Current prototype
                const tempObject = {}; // Temporary object for properties

                // Helper to define property accessors for typed array elements
                const defineTypedArrayPropertyAccessor = function(targetObject, index) {
                    getDescriptor(targetObject, index, {
                        get: function() {
                            // Get value from DataView
                            const state = getState(this);
                            return state.view[getMethodName](index * byteMultiplier + state.byteOffset, true);
                        },
                        set: function(value) {
                            // Set value in DataView, applying clamping if needed
                            const state = getState(this);
                            if (isClamped) {
                                value = roundNumber(value);
                                value = value < 0 ? 0 : value > 255 ? 255 : 255 & value;
                            }
                            state.view[setMethodName](index * byteMultiplier + state.byteOffset, value, true);
                        },
                        enumerable: true
                    });
                };

                // If native typed array views are supported
                if (nativeArrayBufferViews) {
                    // If Babel's polyfill is used, wrap the constructor
                    if (supportsBabel) {
                        currentConstructor = constructorFactory(function(instance, bufferArgument, offsetArgument, lengthArgument) {
                            checkInstance(instance, currentConstructor, fullArrayTypeName);
                            const newBuffer = isObject(bufferArgument) ? isBufferLike(bufferArgument) ? void 0 !== lengthArgument ? new targetConstructor(bufferArgument, getOffset(offsetArgument, byteMultiplier), lengthArgument) : void 0 !== offsetArgument ? new targetConstructor(bufferArgument, getOffset(offsetArgument, byteMultiplier)) : new targetConstructor(bufferArgument) : isTypedArrayCheck(bufferArgument) ? createTypedArrayFrom(currentConstructor, bufferArgument) : arrayIteration.call(currentConstructor, bufferArgument) : new targetConstructor(createArrayBuffer(bufferArgument));
                            setState(instance, newBuffer); // Set internal state
                            return instance;
                        });
                    }

                    // Set prototype and copy static properties
                    if (getPrototype) {
                        getPrototype(currentConstructor, baseTypedArray);
                    }
                    arrayIteration.forEach(getOwnKeys(targetConstructor), function(key) {
                        if (!isPropertyPresent(currentConstructor, key)) {
                            defineProperty(currentConstructor, key, targetConstructor[key]);
                        }
                    });
                    currentConstructor.prototype = currentPrototype;
                } else {
                    // Fallback for environments without native typed array views
                    currentConstructor = constructorFactory(function(instance, bufferArgument, offsetArgument, lengthArgument) {
                        checkInstance(instance, currentConstructor, fullArrayTypeName);
                        let bufferObject, bufferByteLength, calculatedLength, bufferView, indexCounter = 0,
                            byteOffset = 0;

                        if (isObject(bufferArgument)) {
                            if (!isBufferLike(bufferArgument)) {
                                return isTypedArrayCheck(bufferArgument) ? createTypedArrayFrom(currentConstructor, bufferArgument) : arrayIteration.call(currentConstructor, bufferArgument);
                            }
                            bufferObject = bufferArgument;
                            byteOffset = getOffset(offsetArgument, byteMultiplier);
                            bufferByteLength = bufferArgument.byteLength;

                            if (void 0 === lengthArgument) {
                                if (bufferByteLength % byteMultiplier) {
                                    throw rangeError("Wrong length");
                                }
                                if ((calculatedLength = bufferByteLength - byteOffset) < 0) {
                                    throw rangeError("Wrong length");
                                }
                            } else if ((calculatedLength = getArrayLength(lengthArgument) * byteMultiplier) + byteOffset > bufferByteLength) {
                                throw rangeError("Wrong length");
                            }
                            calculatedLength /= byteMultiplier;
                        } else {
                            calculatedLength = createArrayBuffer(bufferArgument);
                            bufferObject = new arrayBufferConstructor(bufferByteLength = calculatedLength * byteMultiplier);
                        }

                        // Set internal state
                        setState(instance, {
                            buffer: bufferObject,
                            byteOffset: byteOffset,
                            byteLength: bufferByteLength,
                            length: calculatedLength,
                            view: new dataViewConstructor(bufferObject)
                        });

                        // Define element accessors
                        for (; indexCounter < calculatedLength;) {
                            defineTypedArrayPropertyAccessor(instance, indexCounter++);
                        }
                    });

                    // Set prototype
                    if (getPrototype) {
                        getPrototype(currentConstructor, baseTypedArray);
                    }
                    currentPrototype = currentConstructor.prototype = createObject(baseTypedArrayProto);
                }

                // Ensure constructor property is set correctly
                if (currentPrototype.constructor !== currentConstructor) {
                    defineProperty(currentPrototype, "constructor", currentConstructor);
                }
                // Set Symbol.toStringTag
                if (typedArrayTag) {
                    defineProperty(currentPrototype, typedArrayTag, fullArrayTypeName);
                }

                tempObject[fullArrayTypeName] = currentConstructor;
                // Polyfill the constructor globally if needed
                polyfillMethod({ global: true, forced: currentConstructor !== targetConstructor, sham: !nativeArrayBufferViews }, tempObject);

                // Define BYTES_PER_ELEMENT
                if (!("BYTES_PER_ELEMENT" in currentConstructor)) {
                    defineProperty(currentConstructor, "BYTES_PER_ELEMENT", byteMultiplier);
                }
                if (!("BYTES_PER_ELEMENT" in currentPrototype)) {
                    defineProperty(currentPrototype, "BYTES_PER_ELEMENT", byteMultiplier);
                }

                setToStringTag(fullArrayTypeName);
            };
        } else {
            currentModule.exports = function() {}; // No-op if Object.defineProperty is not supported
        }
    },
    function(currentModule, moduleExports, requestModule) { // Module 34: Typed Array config
        "use strict";
        const typedArrayFlag = requestModule(8); // Feature detection for Object.defineProperty
        const globalContext = requestModule(5); // Global object
        const isObject = requestModule(9); // IsObject utility
        const isPropertyPresent = requestModule(14); // HasOwnProperty check
        const defineProperty = requestModule(18); // Define property utility
        const updateProperty = requestModule(20); // Patch property utility
        const getPrototype = requestModule(22); // Object.getPrototypeOf
        const setPrototype = requestModule(41); // Object.setPrototypeOf
        const symbolToStringTag = requestModule(7)("toStringTag"); // Symbol.toStringTag
        const generateSymbolId = requestModule(44); // Symbol generator

        const arrayBufferConstructor = globalContext.ArrayBuffer; // Native ArrayBuffer
        const dataViewConstructor = globalContext.DataView; // Native DataView
        const int8ArrayConstructor = globalContext.Int8Array; // Native Int8Array
        const int8ArrayPrototype = int8ArrayConstructor && int8ArrayConstructor.prototype; // Int8Array.prototype
        const uint8ClampedArrayConstructor = globalContext.Uint8ClampedArray; // Native Uint8ClampedArray
        const uint8ClampedArrayPrototype = uint8ClampedArrayConstructor && uint8ClampedArrayConstructor.prototype; // Uint8ClampedArray.prototype

        const baseTypedArrayConstructor = int8ArrayConstructor && getPrototype(int8ArrayConstructor); // Prototype of Int8Array (i.e., TypedArray)
        const baseTypedArrayPrototype = int8ArrayPrototype && getPrototype(int8ArrayPrototype); // Prototype of Int8Array.prototype (i.e., TypedArray.prototype)

        const objectPrototype = Object.prototype; // Object.prototype
        const isPrototypeOf = objectPrototype.isPrototypeOf; // Object.prototype.isPrototypeOf

        const typedArraySymbol = generateSymbolId("TYPED_ARRAY_TAG"); // Custom symbol for typed array tag

        const supportsArrayBuffer = !!arrayBufferConstructor && !!dataViewConstructor; // Check for ArrayBuffer and DataView support

        let supportsDataView = supportsArrayBuffer && !!setPrototype && "Opera" !== requestModule(52)(globalContext.opera); // Check for DataView support with setPrototype
        let isPolyfillRequired = false; // Flag if polyfill is required

        // Map of typed array types and their byte lengths
        const typeMap = {
            Int8Array: 1,
            Uint8Array: 1,
            Uint8ClampedArray: 1,
            Int16Array: 2,
            Uint16Array: 2,
            Int32Array: 4,
            Uint32Array: 4,
            Float32Array: 4,
            Float64Array: 8
        };

        // Utility to check if a value is a typed array
        const isTypedArrayCheck = function(value) {
            return isObject(value) && isPropertyPresent(typeMap, requestModule(52)(value));
        };

        // Check if native typed arrays are actually working as expected
        for (const arrayTypeName in typeMap) {
            if (!globalContext[arrayTypeName]) {
                supportsDataView = false; // If any typed array is missing, assume no full support
            }
        }

        // If TypedArray constructor doesn't exist or is not a function, create a dummy one
        if ((!supportsDataView || typeof baseTypedArrayConstructor !== "function" || baseTypedArrayConstructor === Function.prototype)) {
            // Dummy TypedArray constructor
            baseTypedArrayConstructor = function() {
                throw TypeError("Incorrect invocation");
            };
            if (supportsDataView) {
                // If DataView is supported but TypedArray isn't, patch TypedArray to be the dummy
                for (const arrayTypeName in typeMap) {
                    if (globalContext[arrayTypeName]) {
                        setPrototype(globalContext[arrayTypeName], baseTypedArrayConstructor);
                    }
                }
            }
        }

        // If TypedArray.prototype doesn't exist or is not Object.prototype, create a dummy one
        if ((!supportsDataView || !baseTypedArrayPrototype || baseTypedArrayPrototype === objectPrototype)) {
            baseTypedArrayPrototype = baseTypedArrayConstructor.prototype; // Set prototype to dummy constructor's prototype
            if (supportsDataView) {
                // Patch prototypes of existing typed arrays to the dummy prototype
                for (const arrayTypeName in typeMap) {
                    if (globalContext[arrayTypeName] && setPrototype) {
                        setPrototype(globalContext[arrayTypeName].prototype, baseTypedArrayPrototype);
                    }
                }
            }
        }

        // If Uint8ClampedArray.prototype is not the same as baseTypedArrayPrototype, patch it
        if (supportsDataView && getPrototype(uint8ClampedArrayPrototype) !== baseTypedArrayPrototype && setPrototype) {
            setPrototype(uint8ClampedArrayPrototype, baseTypedArrayPrototype);
        }

        // If Object.defineProperty is supported and Symbol.toStringTag is not set
        if (typedArrayFlag && !isPropertyPresent(baseTypedArrayPrototype, symbolToStringTag)) {
            isPolyfillRequired = true; // Polyfill is required for toStringTag
            // Define Symbol.toStringTag on TypedArray.prototype
            for (const arrayTypeName in typeMap) {
                if (globalContext[arrayTypeName]) {
                    defineProperty(baseTypedArrayPrototype, symbolToStringTag, {
                        get: function() {
                            return isObject(this) ? this[typedArraySymbol] : undefined;
                        }
                    });
                }
            }
        }

        // If ArrayBuffer is supported and prototypes are not correctly linked, link them
        if (supportsArrayBuffer && setPrototype && getPrototype(dataViewConstructor.prototype) !== objectPrototype) {
            setPrototype(dataViewConstructor.prototype, objectPrototype);
        }

        // Export utility functions and properties
        currentModule.exports = {
            NATIVE_ARRAY_BUFFER: supportsArrayBuffer,
            NATIVE_ARRAY_BUFFER_VIEWS: supportsDataView,
            TYPED_ARRAY_TAG: isPolyfillRequired && typedArraySymbol,
            // Validate a value as a typed array
            aTypedArray: function(value) {
                if (isTypedArrayCheck(value)) {
                    return value;
                }
                throw TypeError("Target is not a typed array");
            },
            // Validate a value as a typed array constructor
            aTypedArrayConstructor: function(constructor) {
                if (setPrototype) {
                    if (isPrototypeOf.call(baseTypedArrayConstructor, constructor)) {
                        return constructor;
                    }
                } else {
                    for (const arrayTypeName in typeMap) {
                        if (isPropertyPresent(typeMap, arrayTypeName)) {
                            const currentConstructor = globalContext[arrayTypeName];
                            if (currentConstructor && (constructor === currentConstructor || isPrototypeOf.call(currentConstructor, constructor))) {
                                return constructor;
                            }
                        }
                    }
                }
                throw TypeError("Target is not a typed array constructor");
            },
            // Export a method to TypedArray.prototype
            exportTypedArrayMethod: function(methodName, methodImplementation, forcePolyfill) {
                if (typedArrayFlag) {
                    if (forcePolyfill) {
                        for (const arrayTypeName in typeMap) {
                            const currentConstructor = globalContext[arrayTypeName];
                            if (currentConstructor && isPropertyPresent(currentConstructor.prototype, methodName)) {
                                delete currentConstructor.prototype[methodName];
                            }
                        }
                    }
                    if (!baseTypedArrayPrototype[methodName] || forcePolyfill) {
                        updateProperty(baseTypedArrayPrototype, methodName, forcePolyfill ? methodImplementation : supportsDataView && int8ArrayPrototype[methodName] || methodImplementation);
                    }
                }
            },
            // Export a static method to TypedArray
            exportTypedArrayStaticMethod: function(methodName, methodImplementation, forcePolyfill) {
                let currentConstructor;
                if (typedArrayFlag) {
                    if (setPrototype) {
                        if (forcePolyfill) {
                            for (const arrayTypeName in typeMap) {
                                if ((currentConstructor = globalContext[arrayTypeName])) {
                                    if (isPropertyPresent(currentConstructor, methodName)) {
                                        delete currentConstructor[methodName];
                                    }
                                }
                            }
                        }
                        if (!baseTypedArrayConstructor[methodName] || forcePolyfill) {
                            try {
                                return updateProperty(baseTypedArrayConstructor, methodName, forcePolyfill ? methodImplementation : supportsDataView && int8ArrayConstructor[methodName] || methodImplementation);
                            } catch (error) {
                                // Fall through
                            }
                        }
                    }
                    for (const arrayTypeName in typeMap) {
                        if ((currentConstructor = globalContext[arrayTypeName])) {
                            if (!currentConstructor[methodName] || forcePolyfill) {
                                updateProperty(currentConstructor, methodName, methodImplementation);
                            }
                        }
                    }
                }
            },
            // Check if a value is a DataView or typed array view
            isView: function(value) {
                const type = requestModule(52)(value);
                return "DataView" === type || isPropertyPresent(typeMap, type);
            },
            isTypedArray: isTypedArrayCheck,
            TypedArray: baseTypedArrayConstructor,
            TypedArrayPrototype: baseTypedArrayPrototype
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 35: Metadata API (Reflect.metadata)
        const weakMapConstructor = requestModule(92); // WeakMap for metadata storage
        const mapConstructor = requestModule(100); // Map for metadata storage
        const sharedKeyRegistry = requestModule(60)("metadata"); // Shared registry for metadata

        const metadataStore = sharedKeyRegistry.store || (sharedKeyRegistry.store = new mapConstructor()); // Global metadata store (WeakMap or Map)

        // Helper to get or create a metadata map for a specific target and key
        const getOrCreateMetadataMap = function(target, metadataKey, createIfMissing) {
            let targetMap = metadataStore.get(target);
            if (!targetMap) {
                if (!createIfMissing) return;
                metadataStore.set(target, targetMap = new weakMapConstructor());
            }
            let metadataMap = targetMap.get(metadataKey);
            if (!metadataMap) {
                if (!createIfMissing) return;
                targetMap.set(metadataKey, metadataMap = new weakMapConstructor());
            }
            return metadataMap;
        };

        currentModule.exports = {
            store: metadataStore,
            getMap: getOrCreateMetadataMap,
            has: function(metadataKey, target, propertyKey) {
                const metadataMap = getOrCreateMetadataMap(target, propertyKey, false);
                return void 0 !== metadataMap && metadataMap.has(metadataKey);
            },
            get: function(metadataKey, target, propertyKey) {
                const metadataMap = getOrCreateMetadataMap(target, propertyKey, false);
                return void 0 === metadataMap ? void 0 : metadataMap.get(metadataKey);
            },
            set: function(metadataKey, metadataValue, target, propertyKey) {
                getOrCreateMetadataMap(target, propertyKey, true).set(metadataKey, metadataValue);
            },
            keys: function(target, propertyKey) {
                const metadataMap = getOrCreateMetadataMap(target, propertyKey, false);
                const keysArray = [];
                if (metadataMap) {
                    metadataMap.forEach(function(value, key) {
                        keysArray.push(key);
                    });
                }
                return keysArray;
            },
            toKey: function(key) {
                return void 0 === key || typeof key === "symbol" ? key : String(key);
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 36: Patch properties on an object
        const patchProperty = requestModule(20); // Patch property utility

        currentModule.exports = function(targetObject, propertyMap, options) {
            for (const key in propertyMap) {
                patchProperty(targetObject, key, propertyMap[key], options);
            }
            return targetObject;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 37: Set.prototype.values polyfill
        const isPure = requestModule(2); // Check if environment is pure
        const setValues = requestModule(57); // Set.prototype.values implementation

        currentModule.exports = isPure ? setValues : function(targetSet) {
            return Set.prototype.values.call(targetSet);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 38: Object.getOwnPropertyNames wrapper
        const nativeGetOwnPropertyNames = requestModule(106); // Native Object.getOwnPropertyNames
        const ignoredObjectKeys = requestModule(82).concat("length", "prototype"); // Properties to ignore

        moduleExports.f = Object.getOwnPropertyNames || function(targetObject) {
            return nativeGetOwnPropertyNames(targetObject, ignoredObjectKeys);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 39: Define property on object literal
        const normalizeKey = requestModule(31); // Key normalization utility
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const createPropertyDescriptor = requestModule(30); // Property descriptor utility

        currentModule.exports = function(targetObject, propertyKey, propertyValue) {
            const normalizedKey = normalizeKey(propertyKey);
            if (normalizedKey in targetObject) {
                objectDefineProperty(targetObject, normalizedKey, createPropertyDescriptor(0, propertyValue));
            } else {
                targetObject[normalizedKey] = propertyValue;
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 40: Hide from enumeration (well-known symbols)
        const wellKnownSymbol = requestModule(7); // Well-known Symbol retriever
        const createObject = requestModule(27); // Object.create polyfill
        const defineProperty = requestModule(18); // Define property utility

        const symbolUnscopables = wellKnownSymbol("unscopables"); // Symbol.unscopables
        const arrayPrototype = Array.prototype; // Array.prototype

        // If Symbol.unscopables is not defined on Array.prototype, define it
        if (null == arrayPrototype[symbolUnscopables]) {
            defineProperty(arrayPrototype, symbolUnscopables, createObject(null));
        }

        currentModule.exports = function(propertyName) {
            arrayPrototype[symbolUnscopables][propertyName] = true;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 41: Object.setPrototypeOf polyfill
        const isObject = requestModule(9); // IsObject utility

        // Check if __proto__ is supported natively
        const supportsProto = Object.setPrototypeOf || ("__proto__" in {});

        currentModule.exports = supportsProto ? Object.setPrototypeOf : (function() {
            let testObject, isArrayProtoHack = false;
            const setProtoDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
            try {
                testObject = {};
                setProtoDescriptor.call(testObject, []);
                isArrayProtoHack = testObject instanceof Array;
            } catch (error) {
                // Ignore error
            }
            return function(targetObject, newPrototype) {
                requestModule(1)(targetObject); // Validate target object
                requestModule(116)(newPrototype); // Validate new prototype
                if (isArrayProtoHack) {
                    setProtoDescriptor.call(targetObject, newPrototype);
                } else {
                    targetObject.__proto__ = newPrototype;
                }
                return targetObject;
            };
        })();
    },
    function(currentModule, moduleExports, requestModule) { // Module 42: Set Symbol.species on constructor
        "use strict";
        const globalLookup = requestModule(12); // Global lookup utility
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const symbolSpecies = requestModule(7)("species"); // Symbol.species well-known symbol
        const hasDefineProperty = requestModule(8); // Feature detection

        currentModule.exports = function(constructor) {
            const nativeConstructor = globalLookup(constructor); // Get native constructor
            // If Object.defineProperty is supported and species is not defined
            if (hasDefineProperty && nativeConstructor && !nativeConstructor[symbolSpecies]) {
                objectDefineProperty(nativeConstructor, symbolSpecies, {
                    configurable: true,
                    get: function() {
                        return this;
                    }
                });
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 43: RegExp.prototype.flags getter
        "use strict";
        const validateObject = requestModule(1); // Object validation utility

        currentModule.exports = function() {
            const regexpInstance = validateObject(this); // Ensure it's an object
            let flagsString = "";
            if (regexpInstance.global) flagsString += "g";
            if (regexpInstance.ignoreCase) flagsString += "i";
            if (regexpInstance.multiline) flagsString += "m";
            if (regexpInstance.dotAll) flagsString += "s";
            if (regexpInstance.unicode) flagsString += "u";
            if (regexpInstance.sticky) flagsString += "y";
            return flagsString;
        };
    },
    function(currentModule, moduleExports) { // Module 44: Generate unique key
        let counter = 0; // Global counter
        const randomNumber = Math.random(); // Random number for uniqueness

        currentModule.exports = function(description) {
            return "Symbol(" + String(void 0 === description ? "" : description) + ")_" + (++counter + randomNumber).toString(36);
        };
    },
    function(currentModule, moduleExports) { // Module 45: Empty object
        currentModule.exports = {};
    },
    function(currentModule, moduleExports, requestModule) { // Module 46: IsArray utility
        const objectToString = requestModule(26); // Object.prototype.toString utility

        currentModule.exports = Array.isArray || function(value) {
            return "Array" === objectToString(value);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 47: Array iteration methods
        const bindFunction = requestModule(13); // Function binding utility
        const toIndexedObject = requestModule(77); // ToIndexedObject utility
        const coerceToObject = requestModule(15); // ToObject utility
        const getArrayLength = requestModule(11); // Array length utility
        const createArray = requestModule(48); // Array creation utility
        const arrayPush = [].push; // Array.prototype.push reference

        // Factory function to create array iteration methods
        const createIterationFunction = function(iterationType) {
            const isMap = iterationType === 1; // Map iteration
            const isFilter = iterationType === 2; // Filter iteration
            const isSome = iterationType === 3; // Some iteration
            const isEvery = iterationType === 4; // Every iteration
            const isFindIndex = iterationType === 6; // FindIndex iteration
            const isFindOrFindIndex = iterationType === 5 || isFindIndex; // Find or FindIndex iteration

            return function(targetArray, callbackFn, thisArg, useArrayConstructor) {
                const sourceObject = coerceToObject(targetArray); // Coerce target to object
                const indexedObject = toIndexedObject(sourceObject); // Convert to indexed object
                const boundCallback = bindFunction(callbackFn, thisArg, 3); // Bind callback
                const length = getArrayLength(indexedObject.length); // Get array length
                let index = 0; // Current index
                const resultArray = useArrayConstructor || createArray; // Array constructor to use
                const newArray = isMap ? resultArray(targetArray, length) : isFilter ? resultArray(targetArray, 0) : undefined; // New array for map/filter

                for (; index < length; index++) {
                    // Check if element exists at index
                    if (index in indexedObject) {
                        const currentValue = indexedObject[index]; // Current element value
                        const callbackResult = boundCallback(currentValue, index, sourceObject); // Call callback

                        if (iterationType) {
                            if (isMap) {
                                newArray[index] = callbackResult; // Store result for map
                            } else if (callbackResult) {
                                switch (iterationType) {
                                    case 3:
                                        return true; // For some, return true immediately
                                    case 5:
                                        return currentValue; // For find, return value
                                    case 6:
                                        return index; // For findIndex, return index
                                    case 2:
                                        arrayPush.call(newArray, currentValue); // For filter, push value
                                }
                            } else if (isEvery) {
                                return false; // For every, return false immediately
                            }
                        }
                    }
                }
                return isFindIndex ? -1 : isSome || isEvery ? isEvery : newArray; // Return appropriate result
            };
        };

        currentModule.exports = {
            forEach: createIterationFunction(0),
            map: createIterationFunction(1),
            filter: createIterationFunction(2),
            some: createIterationFunction(3),
            every: createIterationFunction(4),
            find: createIterationFunction(5),
            findIndex: createIterationFunction(6)
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 48: Create array utility
        const isObject = requestModule(9); // IsObject utility
        const isArray = requestModule(46); // IsArray utility
        const symbolSpecies = requestModule(7)("species"); // Symbol.species well-known symbol

        currentModule.exports = function(sourceArray, length) {
            let constructorReference;
            // If source is an array and has a species constructor
            if (isArray(sourceArray)) {
                constructorReference = sourceArray.constructor;
                // If constructor is not Array, check its species property
                if (typeof constructorReference === "function" && constructorReference !== Array && !isArray(constructorReference.prototype)) {
                    if (isObject(constructorReference) && null === (constructorReference = constructorReference[symbolSpecies])) {
                        constructorReference = undefined;
                    }
                } else {
                    constructorReference = undefined;
                }
            }
            // Return new array using species constructor or Array constructor
            return new(void 0 === constructorReference ? Array : constructorReference)(length === 0 ? 0 : length);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 49: Check array method polyfill
        const executeSafely = requestModule(6); // Execute safely utility
        const wellKnownSymbol = requestModule(7); // Well-known Symbol retriever
        const arrayMethodSpecies = wellKnownSymbol("species"); // Symbol.species

        currentModule.exports = function(methodName) {
            const arrayProtoMethod = [][methodName]; // Reference to array prototype method
            // Check if method exists and if it works correctly with Symbol.species
            return !arrayProtoMethod || !executeSafely(function() {
                var testArray = [];
                (testArray.constructor = {})[arrayMethodSpecies] = function() {
                    return { foo: 1 };
                };
                return 1 !== testArray[methodName](Boolean).foo;
            });
        };
    },
    function(currentModule, moduleExports) { // Module 50: Well-known iterators map
        currentModule.exports = {}; // Empty object to store well-known iterators
    },
    function(currentModule, moduleExports, requestModule) { // Module 51: Get iterator method
        const objectToString = requestModule(52); // Object.prototype.toString tag utility
        const wellKnownIterators = requestModule(50); // Map of well-known iterators
        const symbolIterator = requestModule(7)("iterator"); // Symbol.iterator well-known symbol

        currentModule.exports = function(target) {
            // If target is not null/undefined, return its iterator method
            if (null != target) {
                return target[symbolIterator] || target["@@iterator"] || wellKnownIterators[objectToString(target)];
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 52: Object.prototype.toString tag utility
        const nativeObjectToString = requestModule(88); // Native Object.prototype.toString implementation
        const objectToString = requestModule(26); // Basic Object.prototype.toString slice
        const symbolToStringTag = requestModule(7)("toStringTag"); // Symbol.toStringTag
        const isArguments = "Arguments" === objectToString(function() { return arguments; }()); // Check for arguments object

        currentModule.exports = nativeObjectToString ? objectToString : function(value) {
            let objectRef, tagValue, typeResult;
            // If value is undefined, return "Undefined"
            if (void 0 === value) return "Undefined";
            // If value is null, return "Null"
            if (null === value) return "Null";
            // If Symbol.toStringTag is present and is a string, use it
            return typeof(tagValue = function(object, property) {
                try {
                    return object[property];
                } catch (error) {
                    // Ignore error
                }
            }(objectRef = Object(value), symbolToStringTag)) === "string" ? tagValue :
                // For arguments object in old engines, return "Arguments"
                isArguments ? objectToString(objectRef) :
                // Fallback to basic object toString
                "Object" === (typeResult = objectToString(objectRef)) && typeof objectRef.callee === "function" ? "Arguments" : typeResult;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 53: Create iterator constructor
        "use strict";
        const iteratorPrototype = requestModule(114).IteratorPrototype; // Iterator.prototype
        const createObject = requestModule(27); // Object.create polyfill
        const createPropertyDescriptor = requestModule(30); // Property descriptor utility
        const setToStringTag = requestModule(28); // Set Symbol.toStringTag
        const wellKnownIterators = requestModule(50); // Map of well-known iterators

        const noop = function() { return this; }; // No-op function for default iterator

        currentModule.exports = function(constructor, name, nextMethod) {
            const iteratorName = name + " Iterator"; // Full iterator name
            constructor.prototype = createObject(iteratorPrototype, { next: createPropertyDescriptor(1, nextMethod) }); // Set prototype
            setToStringTag(constructor, iteratorName, false, true); // Set Symbol.toStringTag
            wellKnownIterators[iteratorName] = noop; // Register in well-known iterators
            return constructor;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 54: Promise capability factory
        "use strict";
        const validateFunction = requestModule(4); // Function validation utility

        // PromiseCapability class
        const createCapability = function(promiseConstructor) {
            let resolveFn, rejectFn;
            this.promise = new promiseConstructor(function(resolve, reject) {
                if (void 0 !== resolveFn || void 0 !== rejectFn) {
                    throw TypeError("Bad Promise constructor");
                }
                resolveFn = resolve;
                rejectFn = reject;
            });
            this.resolve = validateFunction(resolveFn);
            this.reject = validateFunction(rejectFn);
        };

        // Exported factory function
        moduleExports.f = function(promiseConstructor) {
            return new createCapability(promiseConstructor);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 55: IsRegExp utility
        const isObject = requestModule(9); // IsObject utility
        const objectToString = requestModule(26); // Object.prototype.toString utility
        const symbolMatch = requestModule(7)("match"); // Symbol.match well-known symbol

        currentModule.exports = function(value) {
            // Check if value is an object and has Symbol.match property (or is a RegExp)
            let matchSymbol;
            return isObject(value) && (void 0 !== (matchSymbol = value[symbolMatch]) ? !!matchSymbol : "RegExp" === objectToString(value));
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 56: String charAt/codeAt
        const coerceToInt = requestModule(24); // ToInteger utility
        const requireObjectCoercible = requestModule(17); // RequireObjectCoercible utility

        // Helper to get a character or its code point from a string
        const getStringChar = function(returnChar) {
            return function(targetString, position) {
                const stringValue = String(requireObjectCoercible(targetString)); // Coerce to string
                const index = coerceToInt(position); // Coerce position to integer
                const stringLength = stringValue.length; // String length

                // Handle out-of-bounds index
                if (index < 0 || index >= stringLength) {
                    return returnChar ? "" : undefined;
                }

                const charValue = stringValue.charCodeAt(index); // Code point of char at index
                // Handle surrogate pairs
                if (charValue < 0xD800 || charValue > 0xDBFF || index + 1 === stringLength || (requestModule(24)(stringValue.charCodeAt(index + 1)) < 0xDC00 || requestModule(24)(stringValue.charCodeAt(index + 1)) > 0xDFFF)) {
                    return returnChar ? stringValue.charAt(index) : charValue;
                }

                const nextCharValue = stringValue.charCodeAt(index + 1); // Code point of next char
                return returnChar ? stringValue.slice(index, index + 2) : nextCharValue - 0xDC00 + ((charValue - 0xD800) << 10) + 0x10000;
            };
        };

        currentModule.exports = {
            codeAt: getStringChar(false),
            charAt: getStringChar(true)
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 57: Map/Set entries iterator (pure version)
        "use strict";
        const isPure = requestModule(2); // Check if environment is pure

        currentModule.exports = isPure ? Map.prototype.entries : function(mapInstance) {
            return Map.prototype.entries.call(mapInstance);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 58: Object.prototype.propertyIsEnumerable wrapper
        "use strict";
        const nativePropertyIsEnumerable = {}.propertyIsEnumerable; // Native function
        const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Native function

        // Check for bug in IE <= 8 propertyIsEnumerable
        const ie8EnumerableBug = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

        // Exported propertyIsEnumerable function
        moduleExports.f = ie8EnumerableBug ? function(propertyKey) {
            const descriptor = getOwnPropertyDescriptor(this, propertyKey);
            return !!descriptor && descriptor.enumerable;
        } : nativePropertyIsEnumerable;
    },
    function(currentModule, moduleExports, requestModule) { // Module 59: Generate internal unique key
        const sharedKeyRegistry = requestModule(60); // Shared registry for keys
        const generateUniqueKey = requestModule(44); // Fallback symbol generator

        const keyMap = sharedKeyRegistry("keys"); // Get key map from shared registry

        currentModule.exports = function(keyName) {
            return keyMap[keyName] || (keyMap[keyName] = generateUniqueKey(keyName));
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 60: Shared object storage
        const globalContext = requestModule(5); // Global object
        const registerGlobalValue = requestModule(79); // Register global variable

        // Get or create a shared object in the global context
        const sharedObject = globalContext["__core-js_shared__"] || registerGlobalValue("__core-js_shared__", {});

        currentModule.exports = function(registryKey, defaultValue) {
            // Get or create a property in the shared object
            return sharedObject[registryKey] || (sharedObject[registryKey] = void 0 !== defaultValue ? defaultValue : {});
        };

        // Add core-js version info to shared object
        currentModule.exports("versions", []).push({
            version: "3.4.8",
            mode: requestModule(2) ? "pure" : "global",
            copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 61: Array includes/indexOf
        const toIndexedObject = requestModule(25); // ToIndexedObject utility
        const getArrayLength = requestModule(11); // Array length utility
        const coerceIndex = requestModule(62); // Index coercion utility

        // Factory function for includes/indexOf
        const createSearcher = function(isIncludes) {
            return function(targetArray, searchValue, fromIndex) {
                const indexedObject = toIndexedObject(targetArray); // Coerce to indexed object
                const length = getArrayLength(indexedObject.length); // Get length
                let index = coerceIndex(fromIndex, length); // Coerce start index

                // Iterate through array
                if (isIncludes) {
                    for (; length > index; index++) {
                        const currentValue = indexedObject[index];
                        // Handle NaN values for includes
                        if (searchValue !== searchValue ? currentValue !== currentValue : currentValue === searchValue) {
                            return true;
                        }
                    }
                } else {
                    for (; length > index; index++) {
                        // Check if value matches
                        if (index in indexedObject && indexedObject[index] === searchValue) {
                            return index || 0; // Return index or 0 if 0
                        }
                    }
                }
                return isIncludes ? false : -1; // Return false/-1 if not found
            };
        };

        currentModule.exports = {
            includes: createSearcher(true),
            indexOf: createSearcher(false)
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 62: Coerce index utility
        const coerceToInt = requestModule(24); // ToInteger utility
        const mathMax = Math.max; // Math.max reference
        const mathMin = Math.min; // Math.min reference

        currentModule.exports = function(index, length) {
            const integerIndex = coerceToInt(index); // Coerce to integer
            // If negative, calculate from end of array
            return integerIndex < 0 ? mathMax(integerIndex + length, 0) : mathMin(integerIndex, length);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 63: Check for polyfill necessity
        const executeSafely = requestModule(6); // Execute safely utility

        // Regex to normalize feature names
        const featureRegex = /#|\.prototype\./;
        const normalizeFeatureName = function(featureName) {
            return String(featureName).replace(featureRegex, ".").toLowerCase();
        };

        // Map to store feature status
        const featureMap = requestModule(60).featureData = {};

        // Constants for feature status
        const featureStatusNative = "native";
        const featureStatusPolyfill = "polyfill";

        // Main check function
        currentModule.exports = function(featureName, forced) {
            const normalizedName = normalizeFeatureName(featureName); // Normalize name
            const currentStatus = featureMap[normalizedName]; // Get current status

            // If status is native, no polyfill needed unless forced
            if (currentStatus === featureStatusNative) {
                return false;
            }
            // If status is polyfill, polyfill needed
            if (currentStatus === featureStatusPolyfill) {
                return true;
            }

            // If forced, polyfill needed
            if (forced) {
                return featureMap[normalizedName] = featureStatusPolyfill;
            }

            // Check if feature exists natively and works
            const isFunction = typeof forced === "function"; // Check if forced is a function
            if (isFunction) {
                // If it's a function, execute it safely to check
                return featureMap[normalizedName] = executeSafely(forced) ? featureStatusPolyfill : featureStatusNative;
            }

            // Default to native if no specific check or forced status
            return featureMap[normalizedName] = featureStatusNative;
        };

        // Expose normalization function
        currentModule.exports.normalize = normalizeFeatureName;
        // Expose status constants
        currentModule.exports.NATIVE = featureStatusNative;
        currentModule.exports.POLYFILL = featureStatusPolyfill;
    },
    function(currentModule, moduleExports, requestModule) { // Module 64: Object.keys polyfill
        const nativeGetOwnPropertyNames = requestModule(106); // GetOwnPropertyNames utility
        const ignoredObjectKeys = requestModule(82); // List of ignored properties

        currentModule.exports = Object.keys || function(targetObject) {
            return nativeGetOwnPropertyNames(targetObject, ignoredObjectKeys);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 65: Check for iterable constructor support
        const executeSafely = requestModule(6); // Execute safely utility
        const symbolIterator = requestModule(7)("iterator"); // Symbol.iterator

        let iteratorCheck = false; // Flag for iterator check

        try {
            let iteratorCount = 0; // Counter for iterator elements
            const testObject = {
                next: function() {
                    return { done: !!iteratorCount++ };
                },
                return: function() {
                    iteratorCheck = true;
                }
            };
            testObject[symbolIterator] = function() {
                return this;
            };
            Array.from(testObject, function() {
                throw 2;
            });
        } catch (error) {
            // Ignore error
        }

        currentModule.exports = function(callbackFn, checkIterator) {
            if (!checkIterator && !iteratorCheck) {
                return false;
            }
            let isIteratorWorking = false;
            try {
                const testObject = {};
                testObject[symbolIterator] = function() {
                    return {
                        next: function() {
                            return { done: isIteratorWorking = true };
                        }
                    };
                };
                callbackFn(testObject);
            } catch (error) {
                // Ignore error
            }
            return isIteratorWorking;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 66: Collection helper (Map, Set, WeakMap, WeakSet)
        "use strict";
        const polyfillMethod = requestModule(0); // Polyfill method
        const globalContext = requestModule(5); // Global object
        const isPolyfillNeeded = requestModule(63); // Check if polyfill is needed
        const updateProperty = requestModule(20); // Patch property
        const collectionConfig = requestModule(67); // Collection config for internal state
        const forEachIterator = requestModule(3); // Iterator loop helper
        const checkInstance = requestModule(32); // Instance check
        const isObject = requestModule(9); // IsObject utility
        const executeSafely = requestModule(6); // Execute safely utility
        const checkIterableConstructor = requestModule(65); // Check for iterable constructor
        const setToStringTag = requestModule(28); // Set Symbol.toStringTag
        const createCollection = requestModule(93); // NewTarget polyfill

        currentModule.exports = function(collectionName, constructorFactory, collectionHelper) {
            const isMap = -1 !== collectionName.indexOf("Map"); // Check if it's a Map
            const nativeConstructor = globalContext[collectionName]; // Native constructor
            let prototype = nativeConstructor && nativeConstructor.prototype; // Native prototype
            let currentConstructor = nativeConstructor; // Current constructor
            const constructorObject = {}; // Object to store constructor

            // Helper to patch methods for negative zero handling
            const patchMethodForNegativeZero = function(methodName) {
                const originalMethod = prototype[methodName];
                updateProperty(prototype, methodName, isMap ?
                    function(key) {
                        return originalMethod.call(this, key === 0 ? 0 : key);
                    } :
                    function(value) {
                        return originalMethod.call(this, value === 0 ? 0 : value);
                    }
                );
            };

            // If polyfill is needed for the collection
            if (isPolyfillNeeded(collectionName, typeof nativeConstructor !== "function" || !(collectionHelper || prototype.forEach && !executeSafely(function() {
                // Test if entries() works correctly (e.g., for Map)
                (new nativeConstructor()).entries().next();
            })))) {
                currentConstructor = collectionHelper.getConstructor(constructorFactory, collectionName, isMap, prototype);
                collectionConfig.REQUIRED = true;
            } else if (isPolyfillNeeded(collectionName, true)) {
                // If it's forced polyfill for existing native constructor
                const testInstance = new currentConstructor(); // Create test instance
                const addMethod = testInstance.add; // Reference to add method

                // Check for bug with adding negative zero
                const testConstructor = testInstance.add(isMap ? {} : -0, 1) !== testInstance; // Check if add returns `this`
                const testHasNegativeZero = executeSafely(function() { testInstance.has(1); }); // Check for has(1) bug
                const iterableCheckResult = checkIterableConstructor(function(iterable) { new nativeConstructor(iterable); }); // Check iterable constructor support

                const testNegativeZeroBug = !isMap && executeSafely(function() {
                    for (let i = 5, testSet = new nativeConstructor(); i--;) {
                        testSet.add(i);
                    }
                    return !testSet.has(-0);
                });

                // If iterable constructor is buggy
                if (!iterableCheckResult) {
                    const oldConstructor = currentConstructor; // Store old constructor
                    currentConstructor = constructorFactory(function(instance, iterable) {
                        checkInstance(instance, currentConstructor, collectionName);
                        const newInstance = createCollection(new oldConstructor(), instance, currentConstructor);
                        if (null != iterable) {
                            forEachIterator(iterable, newInstance[addMethod], newInstance, isMap);
                        }
                        return newInstance;
                    });
                    currentConstructor.prototype = prototype;
                    prototype.constructor = currentConstructor;
                }

                // If negative zero or add/set returns `this` is buggy, patch methods
                if (testHasNegativeZero || testNegativeZeroBug) {
                    patchMethodForNegativeZero("delete");
                    patchMethodForNegativeZero("has");
                    if (isMap) patchMethodForNegativeZero("get");
                }
                if (testNegativeZeroBug || testConstructor) {
                    patchMethodForNegativeZero(addMethod);
                }

                // If it's a Weak collection and has a clear method, delete it
                if (collectionHelper && prototype.clear) {
                    delete prototype.clear;
                }
            }

            constructorObject[collectionName] = currentConstructor;
            // Apply polyfill globally
            polyfillMethod({ global: true, forced: currentConstructor !== nativeConstructor }, constructorObject);

            setToStringTag(currentConstructor, collectionName);

            // If not a Weak collection, set strong methods
            if (!collectionHelper) {
                collectionHelper.setStrong(currentConstructor, collectionName, isMap);
            }

            return currentConstructor;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 67: WeakMap/WeakSet internal data store
        const hiddenDataStore = requestModule(45); // Object to store hidden properties
        const isObject = requestModule(9); // IsObject utility
        const isPropertyPresent = requestModule(14); // HasOwnProperty check
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const generateUniqueKey = requestModule(44); // Symbol generator
        const supportsObjectExtensibility = requestModule(117); // Check Object.isExtensible

        const internalKey = generateUniqueKey("meta"); // Unique key for internal data
        let objectCounter = 0; // Counter for object IDs

        const isExtensible = Object.isExtensible || function() { return true; }; // Fallback for Object.isExtensible

        // Helper to create a hidden property on an object
        const createHiddenProperty = function(targetObject) {
            objectDefineProperty(targetObject, internalKey, {
                value: {
                    objectID: "O" + ++objectCounter, // Unique object ID
                    weakData: {} // Weak data storage
                }
            });
        };

        currentModule.exports = {
            REQUIRED: false, // Flag if polyfill is required
            // Generates a fast key for an object (string or symbol)
            fastKey: function(targetObject, createIfMissing) {
                if (!isObject(targetObject)) {
                    return typeof targetObject === "symbol" ? targetObject : (typeof targetObject === "string" ? "S" : "P") + targetObject;
                }
                if (!isPropertyPresent(targetObject, internalKey)) {
                    if (!isExtensible(targetObject)) return "F"; // If not extensible, return "F"
                    if (!createIfMissing) return "E"; // If not creating, return "E"
                    createHiddenProperty(targetObject); // Create hidden property
                }
                return targetObject[internalKey].objectID;
            },
            // Gets weak data associated with an object
            getWeakData: function(targetObject, createIfMissing) {
                if (!isPropertyPresent(targetObject, internalKey)) {
                    if (!isExtensible(targetObject)) return true; // If not extensible, return true
                    if (!createIfMissing) return false; // If not creating, return false
                    createHiddenProperty(targetObject); // Create hidden property
                }
                return targetObject[internalKey].weakData;
            },
            // Handles object freezing (ensures internal key is present)
            onFreeze: function(targetObject) {
                if (supportsObjectExtensibility && currentModule.exports.REQUIRED && isExtensible(targetObject) && !isPropertyPresent(targetObject, internalKey)) {
                    createHiddenProperty(targetObject);
                }
                return targetObject;
            }
        };

        hiddenDataStore[internalKey] = true; // Mark internal key as hidden
    },
    function(currentModule, moduleExports, requestModule) { // Module 68: Check for __defineGetter__ support
        "use strict";
        const executeSafely = requestModule(6); // Execute safely utility
        const globalContext = requestModule(5); // Global object

        currentModule.exports = executeSafely(function() {
            // Test if __defineSetter__ can be called on null
            const testValue = Math.random();
            __defineSetter__.call(null, testValue, function() {});
            delete globalContext[testValue];
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 69: Safe execution wrapper
        "use strict";
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = function(callback) {
            try {
                return { error: false, value: callback() };
            } catch (error) {
                return { error: true, value: error };
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 70: RegExp method polyfill helper
        "use strict";
        const defineProperty = requestModule(18); // Define property utility
        const patchProperty = requestModule(20); // Patch property utility
        const executeSafely = requestModule(6); // Execute safely utility
        const wellKnownSymbol = requestModule(7); // Well-known Symbol retriever
        const isRegExp = requestModule(94); // IsRegExp utility
        const regexpExec = requestModule(96); // RegExp.prototype.exec polyfill

        const symbolSpecies = wellKnownSymbol("species"); // Symbol.species

        // Check if String.prototype.replace works correctly with custom RegExp.prototype.exec
        const checkReplace = !executeSafely(function() {
            const testRegExp = /./;
            testRegExp.exec = function() {
                const result = [];
                result.groups = { a: "7" };
                return result;
            };
            return "7" !== "".replace(testRegExp, "$<a>");
        });

        // Check if String.prototype.split works correctly with custom RegExp.prototype.exec
        const checkSplit = !executeSafely(function() {
            const testRegExp = /(?:)/;
            const originalExec = testRegExp.exec;
            testRegExp.exec = function() {
                return originalExec.apply(this, arguments);
            };
            const splitResult = "ab".split(testRegExp);
            return 2 !== splitResult.length || "a" !== splitResult[0] || "b" !== splitResult[1];
        });

        // Exported function to polyfill RegExp-related string methods
        currentModule.exports = function(methodName, argCount, implementation, applySham) {
            const symbolKey = wellKnownSymbol(methodName); // Get symbol key for method
            const isNative = !executeSafely(function() {
                const testObject = {};
                testObject[symbolKey] = function() { return 7; };
                return 7 !== ""[methodName](testObject);
            });

            // Check if native method is buggy
            const isNativeBuggy = isNative && !executeSafely(function() {
                let isCalled = false;
                const testRegExp = /a/;
                if (methodName === "split") {
                    (testRegExp.constructor = {}).constructor[symbolSpecies] = function() { return testRegExp; };
                    testRegExp.flags = "";
                    testRegExp[symbolKey] = /./[symbolKey];
                }
                testRegExp.exec = function() { isCalled = true; return null; };
                testRegExp[symbolKey]("");
                return !isCalled;
            });

            // If native method is buggy or doesn't exist, polyfill it
            if (!isNative || !isNativeBuggy || (methodName === "replace" && !checkReplace) || (methodName === "split" && !checkSplit)) {
                const originalMethod = /./[symbolKey]; // Original method
                const methodImpl = implementation(symbolKey, ""[methodName], function(targetMethod, regexp, targetString, args, isWrapped) {
                    // Check if the method is wrapped and if it's a direct call to RegExp.prototype.exec
                    if (isWrapped) {
                        return { done: true, value: originalMethod.call(regexp, targetString, args) };
                    }
                    // For other cases, use the provided implementation
                    return { done: false };
                });

                const wrappedMethod = methodImpl[0]; // Wrapped method for String.prototype
                const regexpMethod = methodImpl[1]; // Method for RegExp.prototype

                // Patch String.prototype
                patchProperty(String.prototype, methodName, wrappedMethod);
                // Patch RegExp.prototype
                patchProperty(RegExp.prototype, symbolKey, argCount === 2 ? function(targetString, args) {
                    return regexpMethod.call(targetString, this, args);
                } : function(targetString) {
                    return regexpMethod.call(targetString, this);
                });

                // Apply 'sham' flag if needed
                if (applySham) {
                    defineProperty(RegExp.prototype[symbolKey], "sham", true);
                }
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 71: String index adjustment
        "use strict";
        const getStringChar = requestModule(56).charAt; // String.prototype.charAt utility

        currentModule.exports = function(targetString, currentIndex, isUnicode) {
            // Adjust current index based on character length (1 for normal, 2 for surrogate pairs)
            return currentIndex + (isUnicode ? getStringChar(targetString, currentIndex).length : 1);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 72: RegExp.prototype.exec polyfill
        const objectToString = requestModule(26); // Object.prototype.toString utility
        const nativeExec = requestModule(96); // Original RegExp.prototype.exec

        currentModule.exports = function(regexpInstance, targetString) {
            const execMethod = regexpInstance.exec; // Get the exec method
            // If exec method is a function, call it
            if (typeof execMethod === "function") {
                const execResult = execMethod.call(regexpInstance, targetString);
                // Ensure result is an object or null
                if (typeof execResult !== "object") {
                    throw TypeError("RegExp exec method returned something other than an Object or null");
                }
                return execResult;
            }
            // If not a RegExp, throw error
            if ("RegExp" !== objectToString(regexpInstance)) {
                throw TypeError("RegExp#exec called on incompatible receiver");
            }
            return nativeExec.call(regexpInstance, targetString); // Fallback to native exec
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 73: String trim utilities
        const requireObjectCoercible = requestModule(17); // RequireObjectCoercible utility
        const whitespaceChars = "[" + requestModule(97) + "]"; // Whitespace characters regex part
        const startRegex = RegExp("^" + whitespaceChars + whitespaceChars + "*"); // Regex for leading whitespace
        const endRegex = RegExp(whitespaceChars + whitespaceChars + "*$"); // Regex for trailing whitespace

        // Factory function to create trim methods
        const createTrimmer = function(trimFlags) {
            return function(inputString) {
                let trimmedString = String(requireObjectCoercible(inputString)); // Coerce to string
                // Apply trimming based on flags
                if (trimFlags & 1) trimmedString = trimmedString.replace(startRegex, ""); // Trim start
                if (trimFlags & 2) trimmedString = trimmedString.replace(endRegex, ""); // Trim end
                return trimmedString;
            };
        };

        currentModule.exports = {
            start: createTrimmer(1), // Trim leading whitespace
            end: createTrimmer(2), // Trim trailing whitespace
            trim: createTrimmer(3) // Trim both leading and trailing whitespace
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 74: Collection.prototype.deleteAll
        "use strict";
        const validateFunction = requestModule(4); // Function validation utility
        const bindFunction = requestModule(13); // Function binding utility
        const iterable = requestModule(3); // Iterator loop helper

        currentModule.exports = function() {
            const collectionInstance = requestModule(1)(this); // Validate collection instance
            const deleteMethod = validateFunction(collectionInstance["delete"]); // Get delete method
            let successFlag = true; // Flag for overall success
            for (let index = 0, argumentsLength = arguments.length; index < argumentsLength; index++) {
                // Call delete for each argument and update success flag
                const deleteResult = deleteMethod.call(collectionInstance, arguments[index]);
                successFlag = successFlag && deleteResult;
            }
            return !!successFlag;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 75: Collection.from
        "use strict";
        const validateObject = requestModule(1); // Object validation utility
        const validateFunction = requestModule(4); // Function validation utility
        const iterate = requestModule(3); // Iterator loop helper

        currentModule.exports = function(sourceIterable, mapFn, thisArg, isMap) {
            const collectionConstructor = this; // Current collection constructor
            const resultCollection = new collectionConstructor(); // New collection instance
            const addMethod = validateFunction(resultCollection[isMap ? "set" : "add"]); // Get add/set method

            // Iterate over source iterable and add elements to the collection
            iterate(sourceIterable, function(value, index) {
                addMethod.call(resultCollection, isMap ? value : index, mapFn ? mapFn(value, index) : value);
            }, thisArg, isMap, false); // Pass isMap to iterate correctly

            return resultCollection;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 76: Collection.of
        "use strict";
        currentModule.exports = function() {
            const collectionConstructor = this; // Current collection constructor
            const argsLength = arguments.length; // Number of arguments
            const argArray = new Array(argsLength); // Array to hold arguments

            // Copy arguments to an array
            for (; argsLength--;) {
                argArray[argsLength] = arguments[argsLength];
            }
            // Create a new collection instance from the arguments
            return new collectionConstructor(argArray);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 77: ToIndexedObject utility
        const toIndexedObject = requestModule(25); // ToIndexedObject utility
        const requireObjectCoercible = requestModule(17); // RequireObjectCoercible utility

        currentModule.exports = function(target) {
            return toIndexedObject(requireObjectCoercible(target));
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 78: Create dummy iframe
        const globalContext = requestModule(5); // Global object
        const isObject = requestModule(9); // IsObject utility

        // Check if document exists and createElement is available
        const isElement = isObject(globalContext.document) && isObject(globalContext.document.createElement);

        currentModule.exports = function(tagName) {
            return isElement ? globalContext.document.createElement(tagName) : {};
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 79: Register global value
        const globalContext = requestModule(5); // Global object
        const setProperty = requestModule(18); // Define property utility

        currentModule.exports = function(propertyName, propertyValue) {
            try {
                setProperty(globalContext, propertyName, propertyValue);
            } catch (error) {
                globalContext[propertyName] = propertyValue; // Fallback to direct assignment
            }
            return propertyValue;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 80: Get function source
        const sharedObject = requestModule(102); // Shared object storage
        const functionToString = Function.toString; // Native Function.prototype.toString

        // If shared object doesn't have inspectSource, define it
        if (typeof sharedObject.inspectSource !== "function") {
            sharedObject.inspectSource = function(func) {
                return functionToString.call(func);
            };
        }
        currentModule.exports = sharedObject.inspectSource;
    },
    function(currentModule, moduleExports, requestModule) { // Module 81: Object.getOwnPropertyNames and Symbols
        const globalLookup = requestModule(12); // Global lookup utility
        const getOwnPropertyNames = requestModule(38); // Object.getOwnPropertyNames wrapper
        const getOwnPropertySymbols = requestModule(83); // Object.getOwnPropertySymbols wrapper
        const validateObject = requestModule(1); // Object validation utility

        currentModule.exports = globalLookup("Reflect", "ownKeys") || function(targetObject) {
            const names = getOwnPropertyNames.f(validateObject(targetObject)); // Get property names
            const symbols = getOwnPropertySymbols.f; // Get property symbols
            return symbols ? names.concat(symbols(targetObject)) : names; // Concatenate names and symbols
        };
    },
    function(currentModule, moduleExports) { // Module 82: Ignored property names (for Object.keys)
        currentModule.exports = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
    },
    function(currentModule, moduleExports) { // Module 83: Object.getOwnPropertySymbols wrapper
        moduleExports.f = Object.getOwnPropertySymbols; // Native function
    },
    function(currentModule, moduleExports, requestModule) { // Module 84: Check for native Symbol support
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = !!Object.getOwnPropertySymbols && !executeSafely(function() {
            // Test if Symbol() can be converted to string
            return !String(Symbol());
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 85: V8 version detection
        let currentVersion, globalContext = requestModule(5),
            userAgent = requestModule(86),
            processObject = globalContext.process,
            processVersions = processObject && processObject.versions,
            v8Version = processVersions && processVersions.v8;

        if (v8Version) {
            const versionParts = v8Version.split(".");
            currentVersion = versionParts[0] + versionParts[1];
        } else if (userAgent) {
            // Edge or Chrome detection
            const edgeMatch = userAgent.match(/Edge\/(\d+)/);
            if (edgeMatch) {
                if (edgeMatch[1] >= 74) {
                    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
                    if (chromeMatch) {
                        currentVersion = chromeMatch[1];
                    }
                }
            } else {
                const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
                if (chromeMatch) {
                    currentVersion = chromeMatch[1];
                }
            }
        }
        currentModule.exports = currentVersion && +currentVersion;
    },
    function(currentModule, moduleExports, requestModule) { // Module 86: User agent string
        const globalLookup = requestModule(12); // Global lookup utility

        currentModule.exports = globalLookup("navigator", "userAgent") || "";
    },
    function(currentModule, moduleExports, requestModule) { // Module 87: IsIterableArray utility
        const wellKnownSymbol = requestModule(7); // Well-known Symbol retriever
        const wellKnownIterators = requestModule(50); // Map of well-known iterators
        const symbolIterator = wellKnownSymbol("iterator"); // Symbol.iterator
        const arrayPrototype = Array.prototype; // Array.prototype

        currentModule.exports = function(value) {
            // Check if value is iterable via Array prototype or well-known iterators
            return void 0 !== value && (wellKnownIterators.Array === value || arrayPrototype[symbolIterator] === value);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 88: Object.prototype.toString tag support
        const supportsToStringTag = requestModule(6); // Execute safely utility

        // Check if Object.prototype.toString returns [object Tag]
        const testObject = {};
        testObject[requestModule(7)("toStringTag")] = "z";
        currentModule.exports = "[object z]" === String(testObject);
    },
    function(currentModule, moduleExports, requestModule) { // Module 89: Array method polyfill check (generic)
        "use strict";
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = function(methodName, callback) {
            const arrayProtoMethod = [][methodName]; // Reference to array prototype method
            // Check if method exists and if it works correctly with a test callback
            return !arrayProtoMethod || !executeSafely(function() {
                arrayProtoMethod.call(null, callback || function() { throw 1; }, 1);
            });
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 90: Array iterator
        "use strict";
        const toIndexedObject = requestModule(25); // ToIndexedObject utility
        const setToStringTag = requestModule(40); // Hide from enumeration
        const wellKnownIterators = requestModule(50); // Map of well-known iterators
        const internalState = requestModule(16); // Internal state management

        const setter = internalState.set; // Set internal state
        const getterFor = internalState.getterFor; // Get internal state getter

        // Create Array iterator
        currentModule.exports = requestModule(91)(Array, "Array", function(targetArray, kind) {
            setter(this, {
                type: "Array Iterator",
                target: toIndexedObject(targetArray),
                index: 0,
                kind: kind
            });
        }, function() {
            const state = getterFor(this);
            const target = state.target;
            const kind = state.kind;
            const index = state.index++;

            // If iterator is finished or target is null, return done
            if (!target || index >= target.length) {
                state.target = undefined;
                return { value: undefined, done: true };
            }

            // Return value based on kind
            if (kind === "keys") {
                return { value: index, done: false };
            }
            if (kind === "values") {
                return { value: target[index], done: false };
            }
            return { value: [index, target[index]], done: false }; // "entries"
        }, "values");

        wellKnownIterators.Arguments = wellKnownIterators.Array; // Arguments object behaves like Array
        setToStringTag("keys");
        setToStringTag("values");
        setToStringTag("entries");
    },
    function(currentModule, moduleExports, requestModule) { // Module 91: Iterator creation helper
        "use strict";
        const polyfillMethod = requestModule(0); // Polyfill method
        const globalContext = requestModule(5); // Global object
        const getPrototype = requestModule(22); // Object.getPrototypeOf
        const defineProperty = requestModule(18); // Define property utility
        const propertyExists = requestModule(14); // HasOwnProperty check
        const wellKnownIterator = requestModule(7); // Well-known Symbol retriever
        const symbolIterator = wellKnownIterator("iterator"); // Symbol.iterator
        const isPure = requestModule(2); // Check if environment is pure
        const iteratorPrototype = requestModule(114).IteratorPrototype; // Iterator.prototype
        const buggySafariIterators = requestModule(114).BUGGY_SAFARI_ITERATORS; // Safari iterator bug flag

        const noop = function() { return this; }; // No-op function for default iterator

        // Exported function to create and register an iterator
        currentModule.exports = function(constructor, iteratorName, createIteratorDefinition, nextMethod, iteratorKind, isOverride, forceSet) {
            const targetPrototype = constructor.prototype; // Target prototype
            let nativeIterator, wrappedIterator, iteratorObject;
            const iteratorSymbol = wellKnownIterator("iterator"); // Symbol.iterator

            // Helper to get iterator method based on kind
            const getIteratorMethod = function(kind) {
                if (kind === iteratorKind && wrappedIterator) return wrappedIterator;
                if (!buggySafariIterators && kind in targetPrototype) return targetPrototype[kind];
                switch (kind) {
                    case "keys":
                        return function() { return new createIteratorDefinition(this, kind); };
                    case "values":
                        return function() { return new createIteratorDefinition(this, kind); };
                    case "entries":
                        return function() { return new createIteratorDefinition(this, kind); };
                }
                return function() { return new createIteratorDefinition(this, kind); };
            };

            const fullIteratorName = iteratorName + " Iterator"; // Full iterator name
            let isOverrideNeeded = false; // Flag for override

            // Get native iterator if available
            const arrayEntries = targetPrototype.entries || targetPrototype[iteratorSymbol] || (isOverride && targetPrototype[iteratorKind]);
            if (arrayEntries && (iteratorObject = getPrototype(arrayEntries.call(new constructor()))) && iteratorObject.next) {
                if (isPure) {
                    // If pure mode, update prototype if needed
                    if (getPrototype(iteratorObject) !== iteratorPrototype) {
                        setPrototype(iteratorObject, iteratorPrototype);
                    }
                } else {
                    // If not pure, ensure prototype is correct and set Symbol.toStringTag
                    if (getPrototype(iteratorObject) !== iteratorPrototype) {
                        setPrototype(iteratorObject, iteratorPrototype);
                    }
                    if (typeof iteratorObject[symbolIterator] !== "function") {
                        defineProperty(iteratorObject, symbolIterator, noop);
                    }
                }
                requestModule(28)(iteratorObject, fullIteratorName, false, true); // Set Symbol.toStringTag
                wellKnownIterators[fullIteratorName] = noop; // Register in well-known iterators
            }

            // If "values" kind and native iterator exists but name is different, override
            if (iteratorKind === "values" && arrayEntries && arrayEntries.name !== "values") {
                isOverrideNeeded = true;
                wrappedIterator = function() { return arrayEntries.call(this); };
            }

            // If Symbol.iterator is not defined on prototype, define it
            if (isPure || targetPrototype[symbolIterator] === wrappedIterator || defineProperty(targetPrototype, symbolIterator, wrappedIterator)) {
                // Do nothing
            }

            wellKnownIterators[iteratorName] = wrappedIterator; // Register in well-known iterators

            // If kind is specified, define methods for keys, values, entries
            if (iteratorKind) {
                const iteratorMethods = {
                    values: getIteratorMethod("values"),
                    keys: isOverride ? wrappedIterator : getIteratorMethod("keys"),
                    entries: getIteratorMethod("entries")
                };
                if (forceSet) {
                    for (const methodKey in iteratorMethods) {
                        if (!buggySafariIterators && !isOverrideNeeded && methodKey in targetPrototype) {
                            // Do nothing if already exists and not buggy/override
                        } else {
                            patchProperty(targetPrototype, methodKey, iteratorMethods[methodKey]); // Patch property
                        }
                    }
                } else {
                    polyfillMethod({ target: iteratorName, proto: true, forced: buggySafariIterators || isOverrideNeeded }, iteratorMethods);
                }
            }

            return iteratorMethods;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 92: Map for metadata
        const mapConstructor = requestModule(100); // Map constructor
        const metadataMap = requestModule(60)("metadata"); // Shared registry for metadata

        const metadataRegistry = metadataMap.store || (metadataMap.store = new mapConstructor()); // Global metadata store

        currentModule.exports = mapConstructor;
    },
    function(currentModule, moduleExports, requestModule) { // Module 93: NewTarget polyfill
        const isObject = requestModule(9); // IsObject utility
        const setPrototype = requestModule(41); // Object.setPrototypeOf utility

        currentModule.exports = function(newTarget, originalConstructor, constructor) {
            let actualConstructor, prototype;
            if (setPrototype && typeof(actualConstructor = originalConstructor.constructor) === "function" && actualConstructor !== constructor && isObject(prototype = actualConstructor.prototype) && prototype !== constructor.prototype) {
                setPrototype(newTarget, prototype);
            }
            return newTarget;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 94: IsRegExp utility (for string methods)
        const isObject = requestModule(9); // IsObject utility
        const isRegExp = requestModule(55); // IsRegExp utility

        currentModule.exports = function(value) {
            if (isObject(value) && isRegExp(value)) {
                throw TypeError("The method doesn't accept regular expressions");
            }
            return value;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 95: String method polyfill check (generic)
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = function(methodName) {
            // Check if string method works with custom RegExp.prototype.exec
            let testRegExp = /./;
            try {
                "/./"[methodName](testRegExp);
            } catch (error) {
                try {
                    testRegExp[requestModule(7)("match")] = false; // Disable Symbol.match
                    return "/./"[methodName](testRegExp);
                } catch (error2) {
                    // Ignore
                }
            }
            return false;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 96: RegExp.prototype.exec polyfill
        "use strict";
        const bindFunction = requestModule(43); // RegExp.prototype.flags getter (bound)
        const regexpExec = RegExp.prototype.exec; // Native RegExp.prototype.exec
        const stringReplace = String.prototype.replace; // Native String.prototype.replace

        const nativeExec = regexpExec; // Store native exec

        // Check for bugs in native exec:
        // 1. lastIndex not reset after exec (IE/Edge)
        // 2. groups property not correctly handled (Firefox)
        const lastIndexBug = (function() {
            const re1 = /a/;
            const re2 = /b*/g;
            regexpExec.call(re1, "a");
            regexpExec.call(re2, "a");
            return re1.lastIndex !== 0 || re2.lastIndex !== 0;
        })();

        const groupsBug = void 0 !== /()??/.exec("")[1];

        // If bugs exist, create a polyfilled exec
        if (lastIndexBug || groupsBug) {
            nativeExec = function(targetString) {
                let matchResult, groupsProxy, originalLastIndex, originalRegExp = this;

                if (groupsBug) {
                    // If groups bug, create a new RegExp to handle it
                    groupsProxy = new RegExp("^" + originalRegExp.source + "$(?!\\s)", bindFunction.call(originalRegExp));
                }
                if (lastIndexBug) {
                    originalLastIndex = originalRegExp.lastIndex; // Store original lastIndex
                }

                matchResult = regexpExec.call(originalRegExp, targetString); // Call native exec

                if (lastIndexBug && matchResult) {
                    originalRegExp.lastIndex = originalRegExp.global ? matchResult.index + matchResult[0].length : originalLastIndex; // Restore/update lastIndex
                }
                if (groupsBug && matchResult && matchResult.length > 1) {
                    // If groups bug, patch undefined groups
                    stringReplace.call(matchResult[0], groupsProxy, function() {
                        for (let i = 1; i < arguments.length - 2; i++) {
                            if (void 0 === arguments[i]) {
                                matchResult[i] = undefined;
                            }
                        }
                    });
                }
                return matchResult;
            };
        }

        currentModule.exports = nativeExec;
    },
    function(currentModule, moduleExports) { // Module 97: Whitespace characters
        currentModule.exports = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";
    },
    function(currentModule, moduleExports, requestModule) { // Module 98: String trim polyfill check
        const executeSafely = requestModule(6); // Execute safely utility
        const whitespaceChars = requestModule(97); // Whitespace characters

        currentModule.exports = function(methodName) {
            return executeSafely(function() {
                // Test if trim method works correctly and doesn't return special characters
                return !!whitespaceChars[methodName]() || "​\u0085\u180e" !== "​\u0085\u180e"[methodName]() || (requestModule(73)[methodName].name !== methodName && requestModule(73)[methodName].name !== "trim");
            });
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 99: Check typed array support
        const executeSafely = requestModule(6); // Execute safely utility
        const typedArrayConfig = requestModule(34); // Typed array configuration
        const arrayBufferConstructor = typedArrayConfig.NATIVE_ARRAY_BUFFER; // Native ArrayBuffer support
        const int8ArrayConstructor = typedArrayConfig.Int8Array; // Native Int8Array constructor
        const checkIterableConstructor = requestModule(65); // Check for iterable constructor support

        currentModule.exports = arrayBufferConstructor && !executeSafely(function() {
            // Test if Int8Array construction with length works
            int8ArrayConstructor(1);
        }) && !executeSafely(function() {
            // Test if Int8Array construction with negative length throws error
            new int8ArrayConstructor(-1);
        }) && !checkIterableConstructor(function(iterable) {
            // Test various invalid constructors for TypedArray
            new int8ArrayConstructor();
            new int8ArrayConstructor(null);
            new int8ArrayConstructor(1.5);
            new int8ArrayConstructor(iterable);
        }, true) && !executeSafely(function() {
            // Test ArrayBuffer view length
            return 1 !== new int8ArrayConstructor(new arrayBufferConstructor(2), 1, undefined).length;
        });
    },
    function(currentModule, moduleExports) { // Module 100: Native Map constructor
        currentModule.exports = Map;
    },
    function(currentModule, moduleExports, requestModule) { // Module 101: Can Object.defineProperty throw error
        const hasDefineProperty = requestModule(8); // Feature detection for Object.defineProperty
        const executeSafely = requestModule(6); // Execute safely utility
        const createIFrame = requestModule(78); // Create dummy iframe

        currentModule.exports = !hasDefineProperty && !executeSafely(function() {
            // Test if Object.defineProperty on an iframe-created element throws error
            return 7 !== Object.defineProperty(createIFrame("div"), "a", {
                get: function() {
                    return 7;
                }
            }).a;
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 102: Shared object registry
        const sharedObject = requestModule(60); // Shared object storage

        currentModule.exports = sharedObject;
    },
    function(currentModule, moduleExports, requestModule) { // Module 103: WeakMap support check
        const globalContext = requestModule(5); // Global object
        const getFunctionSource = requestModule(80); // Get function source code

        const nativeWeakMap = globalContext.WeakMap; // Native WeakMap constructor

        currentModule.exports = typeof nativeWeakMap === "function" && /native code/.test(getFunctionSource(nativeWeakMap));
    },
    function(currentModule, moduleExports, requestModule) { // Module 104: Copy properties utility
        const propertyExists = requestModule(14); // HasOwnProperty check
        const getOwnPropertyNames = requestModule(38); // Object.getOwnPropertyNames
        const getOwnPropertyDescriptor = requestModule(19); // Object.getOwnPropertyDescriptor
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper

        currentModule.exports = function(targetObject, sourceObject) {
            const propertyNames = getOwnPropertyNames.f(sourceObject); // Get property names from source
            const defineProperty = objectDefineProperty; // Reference to defineProperty
            const getDescriptor = getOwnPropertyDescriptor.f; // Reference to getOwnPropertyDescriptor

            for (let index = 0; index < propertyNames.length; index++) {
                const key = propertyNames[index];
                // If property doesn't exist on target, define it
                if (!propertyExists(targetObject, key)) {
                    defineProperty(targetObject, key, getDescriptor(sourceObject, key));
                }
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 105: Global lookup utility (extended)
        const sharedGlobalRegistry = requestModule(102); // Shared global registry
        const globalContext = requestModule(5); // Global object

        // Helper to get a function or undefined
        const getFunctionOrUndefined = function(func) {
            return typeof func === "function" ? func : undefined;
        };

        currentModule.exports = function(namespace, property) {
            // If two arguments, look up property within namespace in shared registry or global context
            return arguments.length < 2 ?
                getFunctionOrUndefined(sharedGlobalRegistry[namespace]) || getFunctionOrUndefined(globalContext[namespace]) :
                (sharedGlobalRegistry[namespace] && sharedGlobalRegistry[namespace][property]) || (globalContext[namespace] && globalContext[namespace][property]);
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 106: Get enumerable properties
        const propertyExists = requestModule(14); // HasOwnProperty check
        const toIndexedObject = requestModule(25); // ToIndexedObject utility
        const indexOf = requestModule(61).indexOf; // Array.prototype.indexOf
        const hiddenProperties = requestModule(45); // Object for hidden properties

        currentModule.exports = function(targetObject, ignoredKeys) {
            const indexedObject = toIndexedObject(targetObject); // Coerce to indexed object
            let key, index = 0;
            const resultKeys = []; // Array to store keys

            // Iterate over own properties
            for (key in indexedObject) {
                // If not in hidden properties and not ignored, add to result
                if (!propertyExists(hiddenProperties, key) && propertyExists(indexedObject, key)) {
                    resultKeys.push(key);
                }
            }

            // Add ignored keys that are present in the object
            for (; ignoredKeys.length > index;) {
                key = ignoredKeys[index++];
                if (propertyExists(indexedObject, key) && !~indexOf(resultKeys, key)) {
                    resultKeys.push(key);
                }
            }
            return resultKeys;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 107: Check for native Symbol support
        const hasDefineProperty = requestModule(8); // Feature detection for Object.defineProperty

        currentModule.exports = hasDefineProperty && !Symbol.sham && typeof Symbol === "symbol";
    },
    function(currentModule, moduleExports, requestModule) { // Module 108: Object.defineProperties polyfill
        const hasDefineProperty = requestModule(8); // Feature detection
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const validateObject = requestModule(1); // Object validation utility
        const getOwnPropertyNames = requestModule(64); // Object.keys polyfill

        currentModule.exports = hasDefineProperty ? Object.defineProperties : function(targetObject, properties) {
            validateObject(targetObject); // Validate target object
            const keys = getOwnPropertyNames(properties); // Get enumerable property names
            const length = keys.length; // Number of properties
            for (let index = 0; index < length;) {
                const propName = keys[index++];
                objectDefineProperty(targetObject, propName, properties[propName]); // Define each property
            }
            return targetObject;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 109: Document.documentElement
        const globalLookup = requestModule(12); // Global lookup utility

        currentModule.exports = globalLookup("document", "documentElement");
    },
    function(currentModule, moduleExports, requestModule) { // Module 110: Well-known symbol factory
        const wellKnownSymbol = requestModule(7); // Well-known Symbol retriever

        moduleExports.f = wellKnownSymbol; // Export the retriever as 'f'
    },
    function(currentModule, moduleExports, requestModule) { // Module 111: Array flat/flatMap helper
        "use strict";
        const isArray = requestModule(46); // IsArray utility
        const getArrayLength = requestModule(11); // Array length utility
        const bindFunction = requestModule(13); // Function binding utility

        // Recursive function for flattening arrays
        const flattenArray = function(targetArray, sourceArray, arrayElements, currentLength, currentPosition, recursionDepth, callbackFn, callbackContext) {
            let currentElement, currentFlatLength;
            const boundCallback = void 0 === callbackFn ? undefined : bindFunction(callbackFn, callbackContext, 3); // Bind callback if present

            // Iterate through array elements
            for (; currentPosition < currentLength; currentPosition++) {
                if (currentPosition in arrayElements) {
                    currentElement = arrayElements[currentPosition];
                    // If recursion depth is positive and element is an array
                    if (recursionDepth > 0 && isArray(currentElement)) {
                        // Recursively flatten
                        if (recursionDepth > 9007199254740991) {
                            throw TypeError("Exceed the acceptable array length");
                        }
                        currentFlatLength = flattenArray(targetArray, sourceArray, currentElement, getArrayLength(currentElement.length), 0, recursionDepth - 1, boundCallback, callbackContext) - 1;
                    } else if (boundCallback) {
                        targetArray[currentFlatLength = targetArray.length] = boundCallback(currentElement, currentPosition, sourceArray); // Apply callback
                    } else {
                        targetArray[currentFlatLength = targetArray.length] = currentElement; // Add element directly
                    }
                    currentFlatLength++;
                }
            }
            return currentFlatLength;
        };

        currentModule.exports = flattenArray;
    },
    function(currentModule, moduleExports, requestModule) { // Module 112: Array.from polyfill
        "use strict";
        const bindFunction = requestModule(13); // Function binding utility
        const coerceToObject = requestModule(15); // ToObject utility
        const getIteratorMethod = requestModule(51); // Get iterator method
        const isIterableArray = requestModule(87); // IsIterableArray utility
        const getArrayLength = requestModule(11); // Array length utility
        const definePropertyOnObject = requestModule(39); // Define property on object literal

        currentModule.exports = function(source, mapFn, thisArg) {
            const targetObject = coerceToObject(source); // Coerce source to object
            const collectionConstructor = typeof this === "function" ? this : Array; // Get constructor
            const hasMapFn = void 0 !== mapFn; // Check if map function is provided
            const index = 0; // Current index
            let iterator, iteratorNext, iteratorResult, resultArray, length;

            // If map function is provided, bind it
            if (hasMapFn) {
                mapFn = bindFunction(mapFn, thisArg, 2);
            }

            // Get iterator method
            const iteratorProtocol = getIteratorMethod(targetObject);

            // If iterable array, use simple loop
            if (null == iteratorProtocol || isIterableArray(iteratorProtocol)) {
                length = getArrayLength(targetObject.length); // Get length
                resultArray = new collectionConstructor(length); // Create new array
                for (; length > index; index++) {
                    definePropertyOnObject(resultArray, index, hasMapFn ? mapFn(targetObject[index], index) : targetObject[index]);
                }
            } else {
                // Use iterator protocol
                iterator = iteratorProtocol.call(targetObject); // Get iterator
                iteratorNext = iterator.next; // Get next method
                resultArray = new collectionConstructor(); // Create new array
                for (; !(iteratorResult = iteratorNext.call(iterator)).done; index++) {
                    definePropertyOnObject(resultArray, index, hasMapFn ? mapFn(iteratorResult.value, index) : iteratorResult.value);
                }
            }

            resultArray.length = index; // Set final length
            return resultArray;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 113: Iterator return helper
        const validateObject = requestModule(1); // Object validation utility

        currentModule.exports = function(iterator, callback, value, isPredicate) {
            try {
                // If predicate, call callback with value[0] and value[1]
                return isPredicate ? callback(validateObject(value)[0], value[1]) : callback(value);
            } catch (error) {
                const iteratorReturn = iterator["return"]; // Get iterator return method
                if (void 0 !== iteratorReturn) {
                    validateObject(iteratorReturn.call(iterator)); // Call iterator return
                }
                throw error;
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 114: Iterator prototype setup
        "use strict";
        const getPrototype = requestModule(22); // Object.getPrototypeOf
        const defineHiddenProperty = requestModule(18); // Define hidden property
        const propertyExists = requestModule(14); // HasOwnProperty check
        const symbolIterator = requestModule(7)("iterator"); // Symbol.iterator
        const isPure = requestModule(2); // Check if environment is pure

        let iteratorPrototype, buggySafariIterators = false; // Iterator prototype and Safari bug flag

        // Check if native Array.prototype.keys() returns a valid iterator
        if ([].keys && ("next" in (iteratorPrototype = [].keys())) && (iteratorPrototype = getPrototype(getPrototype(iteratorPrototype))) !== Object.prototype) {
            // If native iterator exists, use it
            // No-op
        } else {
            // Fallback for missing/buggy iterators
            iteratorPrototype = {};
            buggySafariIterators = true;
        }

        // If not pure and Symbol.iterator is not defined on iteratorPrototype, define it
        if (!isPure && !propertyExists(iteratorPrototype, symbolIterator)) {
            defineHiddenProperty(iteratorPrototype, symbolIterator, function() { return this; }); // Default iterator method
        }

        currentModule.exports = {
            IteratorPrototype: iteratorPrototype,
            BUGGY_SAFARI_ITERATORS: buggySafariIterators
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 115: Check Object.getPrototypeOf
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = !executeSafely(function() {
            // Test if Object.getPrototypeOf works correctly with a null-prototype object
            function TestConstructor() {}
            TestConstructor.prototype.constructor = null;
            return Object.getPrototypeOf(new TestConstructor()) !== TestConstructor.prototype;
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 116: Validate prototype
        const isObject = requestModule(9); // IsObject utility

        currentModule.exports = function(prototype) {
            if (!isObject(prototype) && null !== prototype) {
                throw TypeError("Can't set " + String(prototype) + " as a prototype");
            }
            return prototype;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 117: Check Object.isExtensible
        const executeSafely = requestModule(6); // Execute safely utility

        currentModule.exports = !executeSafely(function() {
            // Test if Object.isExtensible works correctly with Object.preventExtensions
            return Object.isExtensible(Object.preventExtensions({}));
        });
    },
    function(currentModule, moduleExports, requestModule) { // Module 118: Collection constructor factory
        "use strict";
        const objectDefineProperty = requestModule(10).define; // Object.defineProperty wrapper
        const createObject = requestModule(27); // Object.create polyfill
        const patchProperties = requestModule(36); // Patch properties utility
        const bindFunction = requestModule(13); // Function binding utility
        const checkInstance = requestModule(32); // Instance check utility
        const forEachIterator = requestModule(3); // Iterator loop helper
        const isObject = requestModule(9); // IsObject utility
        const internalState = requestModule(16); // Internal state management

        const setter = internalState.set; // Set internal state
        const getterFor = internalState.getterFor; // Get internal state getter

        currentModule.exports = {
            // Factory to create collection constructors (Map, Set, WeakMap, WeakSet)
            getConstructor: function(baseConstructor, collectionName, isMap, isNativePrototype) {
                const constructorFunc = baseConstructor(function(instance, iterable) {
                    checkInstance(instance, constructorFunc, collectionName);
                    setter(instance, {
                        type: collectionName,
                        index: createObject(null), // Index for fast key lookup
                        firstEntry: undefined,
                        lastEntry: undefined,
                        currentSize: 0
                    });
                    // If not Object.defineProperty enabled, set size property directly
                    if (!requestModule(8)) {
                        instance.size = 0;
                    }
                    if (null != iterable) {
                        forEachIterator(iterable, instance[isMap ? "set" : "add"], instance, isMap);
                    }
                });

                const stateGetter = getterFor(collectionName); // Getter for collection's internal state

                // Helper to add/set an entry in the collection
                const addEntry = function(collectionInstance, key, value) {
                    let prevEntry, newEntry, entryKey = collectionConfig.fastKey(key, true); // Get fast key
                    const mapState = stateGetter(collectionInstance); // Get internal state

                    // If entry already exists, update its value
                    if (mapState.index[entryKey]) {
                        mapState.index[entryKey].value = value;
                    } else {
                        // Create new entry
                        mapState.lastEntry = newEntry = {
                            index: entryKey,
                            key: key,
                            value: value,
                            previous: prevEntry = mapState.lastEntry,
                            next: undefined,
                            removed: false
                        };
                        // If first entry, set it
                        if (!mapState.firstEntry) {
                            mapState.firstEntry = newEntry;
                        }
                        // Link previous entry
                        if (prevEntry) {
                            prevEntry.next = newEntry;
                        }
                        // Store in index and update size
                        mapState.index[entryKey] = newEntry;
                        if (!requestModule(8)) {
                            collectionInstance.size++;
                        } else {
                            mapState.currentSize++;
                        }
                    }
                    return collectionInstance;
                };

                // Helper to get an entry from the collection
                const getEntry = function(collectionInstance, key) {
                    const mapState = stateGetter(collectionInstance); // Get internal state
                    const entryKey = collectionConfig.fastKey(key); // Get fast key
                    // If fast key exists, return entry from index
                    if (entryKey !== "F") {
                        return mapState.index[entryKey];
                    }
                    // Otherwise, iterate to find
                    for (let currentEntry = mapState.firstEntry; currentEntry; currentEntry = currentEntry.next) {
                        if (currentEntry.key === key) {
                            return currentEntry;
                        }
                    }
                };

                patchProperties(constructorFunc.prototype, {
                    clear: function() {
                        const mapState = stateGetter(this); // Get internal state
                        const mapIndex = mapState.index; // Index map
                        for (let currentEntry = mapState.firstEntry; currentEntry;) {
                            currentEntry.removed = true; // Mark as removed
                            if (currentEntry.previous) {
                                currentEntry.previous = currentEntry.previous.next = undefined; // Unlink
                            }
                            delete mapIndex[currentEntry.index]; // Delete from index
                            currentEntry = currentEntry.next;
                        }
                        mapState.firstEntry = mapState.lastEntry = undefined; // Reset
                        if (!requestModule(8)) {
                            this.size = 0;
                        } else {
                            mapState.currentSize = 0;
                        }
                    },
                    delete: function(key) {
                        const mapState = stateGetter(this); // Get internal state
                        const currentEntry = getEntry(this, key); // Get entry
                        if (currentEntry) {
                            const nextEntry = currentEntry.next;
                            const prevEntry = currentEntry.previous;
                            delete mapState.index[currentEntry.index]; // Delete from index
                            currentEntry.removed = true; // Mark as removed
                            if (prevEntry) {
                                prevEntry.next = nextEntry;
                            }
                            if (nextEntry) {
                                nextEntry.previous = prevEntry;
                            }
                            if (mapState.firstEntry === currentEntry) {
                                mapState.firstEntry = nextEntry;
                            }
                            if (mapState.lastEntry === currentEntry) {
                                mapState.lastEntry = prevEntry;
                            }
                            if (!requestModule(8)) {
                                this.size--;
                            } else {
                                mapState.currentSize--;
                            }
                        }
                        return !!currentEntry;
                    },
                    forEach: function(callbackFn) {
                        for (let currentEntry, boundCallback = bindFunction(callbackFn, arguments.length > 1 ? arguments[1] : undefined, 3); currentEntry = currentEntry ? currentEntry.next : stateGetter(this).firstEntry;) {
                            boundCallback(currentEntry.value, currentEntry.key, this);
                            // If entry was removed during iteration, adjust pointer
                            for (; currentEntry && currentEntry.removed;) {
                                currentEntry = currentEntry.previous;
                            }
                        }
                    },
                    has: function(key) {
                        return !!getEntry(this, key);
                    }
                });

                // Add get and set methods for Map, or add method for Set
                patchProperties(constructorFunc.prototype, isMap ? {
                    get: function(key) {
                        const currentEntry = getEntry(this, key);
                        return currentEntry && currentEntry.value;
                    },
                    set: function(key, value) {
                        return addEntry(this, key === 0 ? 0 : key, value);
                    }
                } : {
                    add: function(value) {
                        return addEntry(this, value = value === 0 ? 0 : value, value);
                    }
                });

                // If Object.defineProperty is supported, define size accessor
                if (requestModule(8)) {
                    objectDefineProperty(constructorFunc.prototype, "size", {
                        get: function() {
                            return stateGetter(this).currentSize;
                        }
                    });
                }
                return constructorFunc;
            },
            // Helper to set up strong collection iterators
            setStrong: function(strongConstructor, collectionName, isMap) {
                const iteratorName = collectionName + " Iterator"; // Iterator name
                const collectionStateGetter = getterFor(collectionName); // Getter for collection state
                const iteratorStateGetter = getterFor(iteratorName); // Getter for iterator state

                requestModule(91)(strongConstructor, collectionName, function(instance, kind) {
                    setter(this, {
                        type: iteratorName,
                        target: instance,
                        state: collectionStateGetter(instance),
                        kind: kind,
                        lastEntry: undefined
                    });
                }, function() {
                    let iteratorEntry, state = iteratorStateGetter(this),
                        kind = state.kind;
                    // Skip removed entries
                    for (iteratorEntry = state.lastEntry; iteratorEntry && iteratorEntry.removed;) {
                        iteratorEntry = iteratorEntry.previous;
                    }
                    // If target exists and there's a next entry
                    if (state.target && (state.lastEntry = iteratorEntry = iteratorEntry ? iteratorEntry.next : state.state.firstEntry)) {
                        // Return value based on kind
                        if (kind === "keys") {
                            return { value: iteratorEntry.key, done: false };
                        }
                        if (kind === "values") {
                            return { value: iteratorEntry.value, done: false };
                        }
                        return { value: [iteratorEntry.key, iteratorEntry.value], done: false }; // "entries"
                    }
                    state.target = undefined; // Mark as done
                    return { value: undefined, done: true };
                }, isMap ? "entries" : "values", !isMap, true);

                requestModule(42)(collectionName); // Set Symbol.species
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 119: Object.assign polyfill
        const hasDefineProperty = requestModule(8); // Feature detection
        const executeSafely = requestModule(6); // Execute safely utility
        const getOwnPropertyNames = requestModule(64); // Object.keys polyfill
        const getOwnPropertySymbols = requestModule(83); // Object.getOwnPropertySymbols wrapper
        const propertyIsEnumerable = requestModule(58).f; // Object.prototype.propertyIsEnumerable wrapper
        const toObject = requestModule(15); // ToObject utility
        const toIndexedObject = requestModule(77); // ToIndexedObject utility

        const nativeAssign = Object.assign; // Native Object.assign
        const objectDefineProperty = Object.defineProperty; // Native Object.defineProperty

        // Check for bugs in native Object.assign
        const assignBug = !nativeAssign || executeSafely(function() {
            // IE bug: Object.assign with accessors and non-enumerable properties
            if (hasDefineProperty && 1 !== nativeAssign({ b: 1 }, nativeAssign(objectDefineProperty({}, "a", {
                enumerable: true,
                get: function() {
                    objectDefineProperty(this, "b", { value: 3, enumerable: false });
                }
            }), { b: 2 })).b) return true;
            // Safari bug: Symbol properties not copied
            const testObject = {};
            const symbolKey = Symbol();
            const charMap = {};
            testObject[symbolKey] = 7;
            "abcdefghijklmnopqrst".split("").forEach(function(char) { charMap[char] = char; });
            return 7 !== nativeAssign({}, testObject)[symbolKey] || "abcdefghijklmnopqrst" !== getOwnPropertyNames(nativeAssign({}, charMap)).join("");
        });

        // Exported Object.assign polyfill
        currentModule.exports = assignBug ? function(targetObject, sourceObject) {
            const target = toObject(targetObject); // Coerce target to object
            const argsLength = arguments.length; // Number of arguments
            const symbolGetter = getOwnPropertySymbols.f; // Reference to getOwnPropertySymbols
            const propIsEnumerable = propertyIsEnumerable; // Reference to propertyIsEnumerable

            for (let argIndex = 1; argIndex < argsLength; argIndex++) {
                const currentSource = toIndexedObject(arguments[argIndex]); // Coerce source to indexed object
                const allKeys = symbolGetter ? getOwnPropertyNames(currentSource).concat(symbolGetter(currentSource)) : getOwnPropertyNames(currentSource); // Get all own property keys
                const keysLength = allKeys.length; // Number of keys

                for (let keyIndex = 0; keyIndex < keysLength;) {
                    const currentKey = allKeys[keyIndex++];
                    // If native defineProperty is enabled and property is enumerable, assign it
                    if (hasDefineProperty && !propIsEnumerable.call(currentSource, currentKey)) {
                        // Do nothing
                    } else {
                        target[currentKey] = currentSource[currentKey];
                    }
                }
            }
            return target;
        } : nativeAssign;
    },
    function(currentModule, moduleExports, requestModule) { // Module 120: Object.entries/values polyfills
        const toIndexedObject = requestModule(25); // ToIndexedObject utility
        const getOwnPropertyNames = requestModule(64); // Object.keys polyfill
        const propertyIsEnumerable = requestModule(58).f; // Object.prototype.propertyIsEnumerable wrapper

        // Factory function to create entries/values iterators
        const createIterator = function(isEntry) {
            return function(targetObject) {
                const indexedObject = toIndexedObject(targetObject); // Coerce to indexed object
                const propKeys = getOwnPropertyNames(indexedObject); // Get own property names
                const keyLength = propKeys.length; // Number of keys
                const resultArray = []; // Array to store results

                for (let keyIndex = 0; keyIndex < keyLength;) {
                    const currentKey = propKeys[keyIndex++];
                    // If property is enumerable, add to result
                    if (propertyIsEnumerable.call(indexedObject, currentKey)) {
                        resultArray.push(isEntry ? [currentKey, indexedObject[currentKey]] : indexedObject[currentKey]);
                    }
                }
                return resultArray;
            };
        };

        moduleExports.entries = createIterator(true); // Object.entries
        moduleExports.values = createIterator(false); // Object.values
    },
    function(currentModule, moduleExports, requestModule) { // Module 121: Promise constructor reference
        const globalContext = requestModule(5); // Global object

        currentModule.exports = globalContext.Promise;
    },
    function(currentModule, moduleExports, requestModule) { // Module 122: SetImmediate polyfill
        const globalContext = requestModule(5); // Global object
        const executeSafely = requestModule(6); // Execute safely utility
        const objectToString = requestModule(26); // Object.prototype.toString utility
        const bindFunction = requestModule(13); // Function binding utility
        const documentFragment = requestModule(109); // Document.documentElement
        const createIFrame = requestModule(78); // Create dummy iframe

        let setImmediatePolyfill, clearImmediatePolyfill; // Polyfilled functions

        const taskIdCounter = 0; // Task ID counter
        const taskQueue = {}; // Queue for tasks

        // Helper to execute a task from the queue
        const executeTask = function(taskId) {
            if (taskQueue.hasOwnProperty(taskId)) {
                const task = taskQueue[taskId];
                delete taskQueue[taskId];
                task();
            }
        };

        // Helper to execute a message (for MessageChannel)
        const executeMessage = function(event) {
            executeTask(event.data);
        };

        // Helper to post message to global context
        const postMessageToGlobal = function(message) {
            globalContext.postMessage(message + "", globalContext.location.protocol + "//" + globalContext.location.host);
        };

        // If native setImmediate is available
        if (globalContext.setImmediate && globalContext.clearImmediate) {
            setImmediatePolyfill = globalContext.setImmediate;
            clearImmediatePolyfill = globalContext.clearImmediate;
        } else {
            const processObject = globalContext.process; // Node.js process object
            const messageChannel = globalContext.MessageChannel; // HTML5 MessageChannel
            const dispatchObject = globalContext.Dispatch; // WebKit Dispatch API

            // If Node.js process, use process.nextTick
            if (objectToString(processObject) === "process") {
                setImmediatePolyfill = function(task) {
                    for (var args = [], i = 1; arguments.length > i; i++) args.push(arguments[i]);
                    taskQueue[++taskIdCounter] = function() {
                        (typeof task === "function" ? task : Function(task)).apply(undefined, args);
                    };
                    processObject.nextTick(function() { executeTask(taskIdCounter); });
                    return taskIdCounter;
                };
                clearImmediatePolyfill = function(taskId) {
                    delete taskQueue[taskId];
                };
            } else if (dispatchObject && dispatchObject.now) {
                // If WebKit Dispatch API, use Dispatch.now
                setImmediatePolyfill = function(task) {
                    for (var args = [], i = 1; arguments.length > i; i++) args.push(arguments[i]);
                    taskQueue[++taskIdCounter] = function() {
                        (typeof task === "function" ? task : Function(task)).apply(undefined, args);
                    };
                    dispatchObject.now(function() { executeTask(taskIdCounter); });
                    return taskIdCounter;
                };
            } else if (messageChannel && !requestModule(123)) {
                // If MessageChannel is available and not iOS bug
                const portTwo = new messageChannel().port2;
                const portOne = new messageChannel().port1;
                portOne.onmessage = executeMessage; // Listen for messages on port1
                setImmediatePolyfill = bindFunction(portTwo.postMessage, portTwo, 1); // Post messages on port2
            } else if (globalContext.addEventListener && typeof globalContext.postMessage === "function" && !globalContext.importScripts && !executeSafely(postMessageToGlobal)) {
                // If postMessage is available and not buggy
                setImmediatePolyfill = postMessageToGlobal; // Use postMessage
                globalContext.addEventListener("message", executeMessage, false);
            } else {
                // Fallback to setTimeout with 0 delay (IE/old browsers)
                setImmediatePolyfill = "onreadystatechange" in createIFrame("script") ? function(task) {
                    for (var args = [], i = 1; arguments.length > i; i++) args.push(arguments[i]);
                    taskQueue[++taskIdCounter] = function() {
                        (typeof task === "function" ? task : Function(task)).apply(undefined, args);
                    };
                    documentFragment.appendChild(createIFrame("script")).onreadystatechange = function() {
                        documentFragment.removeChild(this);
                        executeTask(taskIdCounter);
                    };
                    return taskIdCounter;
                } : function(task) {
                    for (var args = [], i = 1; arguments.length > i; i++) args.push(arguments[i]);
                    taskQueue[++taskIdCounter] = function() {
                        (typeof task === "function" ? task : Function(task)).apply(undefined, args);
                    };
                    setTimeout(function() { executeTask(taskIdCounter); }, 0);
                    return taskIdCounter;
                };
            }
        }

        currentModule.exports = {
            set: setImmediatePolyfill,
            clear: clearImmediatePolyfill
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 123: IsIOS utility
        const userAgent = requestModule(86); // User agent string

        currentModule.exports = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);
    },
    function(currentModule, moduleExports, requestModule) { // Module 124: Queue microtask polyfill
        const globalContext = requestModule(5); // Global object
        const getDescriptor = requestModule(19).f; // Object.getOwnPropertyDescriptor
        const objectToString = requestModule(26); // Object.prototype.toString utility
        const setImmediatePolyfill = requestModule(122).set; // SetImmediate polyfill

        const processObject = globalContext.process; // Node.js process object
        const isProcess = objectToString(processObject) === "process"; // Check if it's Node.js
        const mutationObserver = globalContext.MutationObserver || globalContext.WebKitMutationObserver; // Native MutationObserver
        const promiseConstructor = globalContext.Promise; // Native Promise

        let headTask, tailTask, runTasks, taskScheduler; // Microtask queue variables

        // Get native queueMicrotask if available
        const queueMicrotaskDescriptor = getDescriptor(globalContext, "queueMicrotask");
        const nativeQueueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

        if (!nativeQueueMicrotask) {
            runTasks = function() {
                let currentDomain;
                // If Node.js and domain exists, exit it before running tasks
                if (isProcess && (currentDomain = processObject.domain)) {
                    currentDomain.exit();
                }
                // Execute tasks in the queue
                while (headTask) {
                    const taskCallback = headTask.fn;
                    headTask = headTask.next;
                    try {
                        taskCallback();
                    } catch (error) {
                        throw (headTask ? taskScheduler() : tailTask = undefined, error); // Schedule next task or reset queue
                    }
                }
                tailTask = undefined; // Reset tail task
                if (currentDomain) {
                    currentDomain.enter();
                }
            };

            if (isProcess) {
                // If Node.js, use process.nextTick
                taskScheduler = function() {
                    processObject.nextTick(runTasks);
                };
            } else if (mutationObserver && !requestModule(123)) {
                // If MutationObserver available and not iOS bug, use it
                let toggleFlag = true;
                const mutationTarget = document.createTextNode(""); // Dummy text node
                new mutationObserver(runTasks).observe(mutationTarget, { characterData: true }); // Observe changes
                taskScheduler = function() {
                    mutationTarget.data = toggleFlag = !toggleFlag; // Toggle data to trigger observer
                };
            } else if (promiseConstructor && promiseConstructor.resolve) {
                // If Promise available, use Promise.resolve().then()
                const resolvedPromise = promiseConstructor.resolve(undefined);
                const thenMethod = resolvedPromise.then;
                taskScheduler = function() {
                    thenMethod.call(resolvedPromise, runTasks);
                };
            } else {
                // Fallback to setImmediate
                taskScheduler = function() {
                    setImmediatePolyfill.call(globalContext, runTasks);
                };
            }
        }

        // Exported queueMicrotask function
        currentModule.exports = nativeQueueMicrotask || function(task) {
            const currentTask = { fn: task, next: undefined };
            if (tailTask) {
                tailTask.next = currentTask;
            }
            if (!headTask) {
                headTask = currentTask;
                taskScheduler(); // Schedule task execution
            }
            tailTask = currentTask;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 125: Promise resolve helper
        const validateObject = requestModule(1); // Object validation utility
        const isObject = requestModule(9); // IsObject utility
        const promiseCapability = requestModule(54); // Promise capability factory

        currentModule.exports = function(promiseConstructor, value) {
            if (validateObject(promiseConstructor), isObject(value) && value.constructor === promiseConstructor) {
                return value; // If value is already an instance of the promise, return it
            }
            const capability = promiseCapability.f(promiseConstructor); // Create new capability
            capability.resolve(value); // Resolve with the value
            return capability.promise;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 126: Console error utility
        const globalContext = requestModule(5); // Global object

        currentModule.exports = function(message, errorObject) {
            const consoleInstance = globalContext.console; // Console object
            if (consoleInstance && consoleInstance.error) {
                if (arguments.length === 1) {
                    consoleInstance.error(message);
                } else {
                    consoleInstance.error(message, errorObject);
                }
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 127: Set constructor
        "use strict";
        const collectionHelper = requestModule(66); // Collection helper
        const collectionConstructorFactory = requestModule(118); // Collection constructor factory

        currentModule.exports = collectionHelper("Set", function(instance) {
            return function() {
                return instance(this, arguments.length ? arguments[0] : undefined);
            };
        }, collectionConstructorFactory);
    },
    function(currentModule, moduleExports, requestModule) { // Module 128: String padStart/padEnd
        "use strict";
        const coerceToInt = requestModule(24); // ToInteger utility
        const stringRepeat = requestModule(209); // String.prototype.repeat polyfill
        const requireObjectCoercible = requestModule(17); // RequireObjectCoercible utility
        const mathCeil = Math.ceil; // Math.ceil reference

        // Factory function for padStart/padEnd
        const createPadder = function(isEnd) {
            return function(targetString, targetLength, padChar) {
                const inputString = String(requireObjectCoercible(targetString)); // Coerce to string
                const stringLength = inputString.length; // Original string length
                const length = coerceToInt(targetLength); // Coerce target length to integer

                // If target length is less than or equal to current length, no padding needed
                if (length <= stringLength) {
                    return inputString;
                }

                // Default pad character is space
                const paddingChar = void 0 === padChar ? " " : String(padChar);
                // If padding char is empty, return original string
                if (paddingChar === "") {
                    return inputString;
                }

                const remainingPad = length - stringLength; // Calculate needed padding length
                let paddedPart = stringRepeat.call(paddingChar, mathCeil(remainingPad / paddingChar.length)); // Repeat padding char

                // Trim padded part to exact length
                if (paddedPart.length > remainingPad) {
                    paddedPart = paddedPart.slice(0, remainingPad);
                }

                // Concatenate based on isEnd flag
                return isEnd ? inputString + paddedPart : paddedPart + inputString;
            };
        };

        currentModule.exports = {
            start: createPadder(false), // padStart
            end: createPadder(true) // padEnd
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 129: Check Safari string pad bug
        const userAgent = requestModule(86); // User agent string

        currentModule.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);
    },
    function(currentModule, moduleExports, requestModule) { // Module 130: Typed Array length check
        const coerceToInt = requestModule(24); // ToInteger utility
        const getArrayLength = requestModule(11); // Array length utility

        currentModule.exports = function(value) {
            const integerValue = coerceToInt(value); // Coerce to integer
            const arrayLength = getArrayLength(integerValue); // Get array-like length
            // If coerced value is not equal to array-like length, throw RangeError
            if (integerValue !== arrayLength) {
                throw RangeError("Wrong length or index");
            }
            return arrayLength;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 131: Typed Array from
        const coerceToObject = requestModule(15); // ToObject utility
        const getArrayLength = requestModule(11); // Array length utility
        const getIteratorMethod = requestModule(51); // Get iterator method
        const isIterableArray = requestModule(87); // IsIterableArray utility
        const bindFunction = requestModule(13); // Function binding utility
        const typedArrayConstructor = requestModule(34).aTypedArrayConstructor; // TypedArray constructor validator

        currentModule.exports = function(source, mapFn, thisArg) {
            const targetObject = coerceToObject(source); // Coerce source to object
            const collectionConstructor = typeof this === "function" ? this : Array; // Get constructor
            const hasMapFn = void 0 !== mapFn; // Check if map function is provided
            let length, targetArray, index = 0; // Length, target array, index
            let iterator, iteratorNext, iteratorResult; // Iterator variables

            // If map function is provided, bind it
            if (hasMapFn) {
                mapFn = bindFunction(mapFn, thisArg, 2);
            }

            // Get iterator method
            const iteratorProtocol = getIteratorMethod(targetObject);

            // If iterable array, use simple loop
            if (null != iteratorProtocol && !isIterableArray(iteratorProtocol)) {
                // Use iterator protocol
                iterator = iteratorProtocol.call(targetObject); // Get iterator
                iteratorNext = iterator.next; // Get next method
                targetArray = []; // Temporary array
                for (; !(iteratorResult = iteratorNext.call(iterator)).done;) {
                    targetArray.push(iteratorResult.value);
                }
            } else {
                targetArray = targetObject; // Use target object directly
            }

            length = getArrayLength(targetArray.length); // Get length
            const newTypedArray = new(typedArrayConstructor(collectionConstructor))(length); // Create new typed array

            for (; length > index; index++) {
                newTypedArray[index] = hasMapFn ? mapFn(targetArray[index], index) : targetArray[index];
            }
            return newTypedArray;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 132: WeakMap/WeakSet constructor helper
        "use strict";
        const patchProperties = requestModule(36); // Patch properties utility
        const internalStateGetter = requestModule(67).getWeakData; // Get weak data utility
        const validateObject = requestModule(1); // Object validation utility
        const isObject = requestModule(9); // IsObject utility
        const checkInstance = requestModule(32); // Instance check utility
        const forEachIterator = requestModule(3); // Iterator loop helper
        const isPropertyPresent = requestModule(14); // HasOwnProperty check
        const internalState = requestModule(16); // Internal state management

        const setter = internalState.set; // Set internal state
        const getterFor = internalState.getterFor; // Get internal state getter

        // Helper to store frozen objects data (fallback for WeakMap/Set)
        let frozenDataStore = 0;
        const createFrozenEntries = function(state) {
            return state.frozen || (state.frozen = new WeakMap());
        };

        // WeakMap/Set fallback class for frozen objects
        const FrozenEntries = function() {
            this.entries = [];
        };

        // Helper to find an entry in FrozenEntries
        const entryPredicate = function(entry) {
            return function(item) {
                return item[0] === entry;
            };
        };

        // Helper to find an entry in FrozenEntries
        const findEntry = function(entries, key) {
            return requestModule(47).find(entries.entries, entryPredicate(key));
        };

        // Helper to find index of an entry in FrozenEntries
        const findIndex = function(entries, key) {
            return requestModule(47).findIndex(entries.entries, entryPredicate(key));
        };

        FrozenEntries.prototype = {
            get: function(key) {
                const entry = findEntry(this, key);
                if (entry) return entry[1];
            },
            has: function(key) {
                return !!findEntry(this, key);
            },
            set: function(key, value) {
                const entry = findEntry(this, key);
                entry ? entry[1] = value : this.entries.push([key, value]);
            },
            delete: function(key) {
                const index = findIndex(this.entries, key);
                return ~index && this.entries.splice(index, 1), !!~index;
            }
        };

        currentModule.exports = {
            // Factory to create WeakMap/WeakSet constructors
            getConstructor: function(baseConstructor, constructorName, isMap, isNativePrototype) {
                const weakMapConstructor = baseConstructor(function(instance, iterable) {
                    checkInstance(instance, weakMapConstructor, constructorName);
                    setter(instance, {
                        type: constructorName,
                        id: frozenDataStore++, // Unique ID for weak map
                        frozen: undefined // Placeholder for frozen objects
                    });
                    if (null != iterable) {
                        forEachIterator(iterable, instance[isMap ? "set" : "add"], instance, isMap);
                    }
                });

                const stateGetter = getterFor(constructorName); // Getter for weak map state

                // Helper to set an entry in the weak map
                const setEntry = function(weakMapInstance, key, value) {
                    const weakMapState = stateGetter(weakMapInstance); // Get internal state
                    const weakData = internalStateGetter(validateObject(key), true); // Get weak data for key
                    if (weakData === true) {
                        createFrozenEntries(weakMapState).set(key, value); // Store in frozen data
                    } else {
                        weakData[weakMapState.id] = value; // Store in weak data
                    }
                    return weakMapInstance;
                };

                patchProperties(weakMapConstructor.prototype, {
                    delete: function(key) {
                        const weakMapState = stateGetter(this); // Get internal state
                        if (!isObject(key)) return false; // Only objects can be keys
                        const weakData = internalStateGetter(key); // Get weak data for key
                        if (weakData === true) {
                            return createFrozenEntries(weakMapState).delete(key); // Delete from frozen data
                        }
                        return weakData && isPropertyPresent(weakData, weakMapState.id) && delete weakData[weakMapState.id];
                    },
                    has: function(key) {
                        const weakMapState = stateGetter(this); // Get internal state
                        if (!isObject(key)) return false; // Only objects can be keys
                        const weakData = internalStateGetter(key); // Get weak data for key
                        if (weakData === true) {
                            return createFrozenEntries(weakMapState).has(key); // Check frozen data
                        }
                        return weakData && isPropertyPresent(weakData, weakMapState.id);
                    }
                });

                // Add get and set methods for WeakMap, or add method for WeakSet
                patchProperties(weakMapConstructor.prototype, isMap ? {
                    get: function(key) {
                        const weakMapState = stateGetter(this); // Get internal state
                        if (isObject(key)) {
                            const weakData = internalStateGetter(key); // Get weak data for key
                            if (weakData === true) {
                                return createFrozenEntries(weakMapState).get(key); // Get from frozen data
                            }
                            return weakData ? weakData[weakMapState.id] : undefined; // Get from weak data
                        }
                    },
                    set: function(key, value) {
                        return setEntry(this, key, value);
                    }
                } : {
                    add: function(key) {
                        return setEntry(this, key, true);
                    }
                });

                return weakMapConstructor;
            }
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 133: Composite key/symbol
        const mapConstructor = requestModule(92); // Map constructor (for metadata)
        const weakMapConstructor = requestModule(100); // WeakMap constructor
        const createObject = requestModule(27); // Object.create polyfill
        const isObject = requestModule(9); // IsObject utility

        // Node structure for composite keys
        const KeyNode = function() {
            this.object = null;
            this.symbol = null;
            this.primitives = null;
            this.objectsByIndex = createObject(null);
        };

        KeyNode.prototype.get = function(keyType, valueFactory) {
            return this[keyType] || (this[keyType] = valueFactory());
        };

        KeyNode.prototype.next = function(argIndex, currentArg, isObjectValue) {
            const nextMap = isObjectValue ? this.objectsByIndex[argIndex] || (this.objectsByIndex[argIndex] = new weakMapConstructor()) : this.primitives || (this.primitives = new mapConstructor());
            let nextNode = nextMap.get(currentArg);
            if (!nextNode) {
                nextMap.set(currentArg, nextNode = new KeyNode());
            }
            return nextNode;
        };

        const rootNode = new KeyNode(); // Root node for composite keys

        currentModule.exports = function() {
            let argIndex, currentArg, keyNode = rootNode;
            const argsLength = arguments.length;

            // First pass for objects
            for (argIndex = 0; argIndex < argsLength; argIndex++) {
                if (isObject(currentArg = arguments[argIndex])) {
                    keyNode = keyNode.next(argIndex, currentArg, true);
                }
            }
            // If only Object was passed and rootNode was requested, throw error
            if (this === Object && keyNode === rootNode) {
                throw TypeError("Composite keys must contain a non-primitive component");
            }

            // Second pass for primitives
            for (argIndex = 0; argIndex < argsLength; argIndex++) {
                if (!isObject(currentArg = arguments[argIndex])) {
                    keyNode = keyNode.next(argIndex, currentArg, false);
                }
            }
            return keyNode;
        };
    },
    function(currentModule, moduleExports) { // Module 134: Math.scale polyfill
        currentModule.exports = Math.scale || function(value, inMin, inMax, outMin, outMax) {
            // Handle NaN or invalid arguments
            if (arguments.length === 0 || value !== value || inMin !== inMin || inMax !== inMax || outMin !== outMin || outMax !== outMax) {
                return NaN;
            }
            // Handle +/-Infinity values
            if (value === 1 / 0 || value === -1 / 0) {
                return value;
            }
            // Linear scaling formula
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 135: Collection.prototype.addAll
        "use strict";
        const validateObject = requestModule(1); // Object validation utility
        const validateFunction = requestModule(4); // Function validation utility

        currentModule.exports = function() {
            const collectionInstance = validateObject(this); // Validate collection instance
            const addMethod = validateFunction(collectionInstance.add); // Get add method
            for (let index = 0, argumentsLength = arguments.length; index < argumentsLength; index++) {
                addMethod.call(collectionInstance, arguments[index]); // Call add for each argument
            }
            return collectionInstance;
        };
    },
    function(currentModule, moduleExports, requestModule) { // Module 136: URLSearchParams constructor
        "use strict";
        requestModule(90); // Load Array.prototype.entries polyfill

        const polyfillMethod = requestModule(0); // Polyfill method
        const globalContext = requestModule(5); // Global object
        const globalLookup = requestModule(12); // Global lookup utility
        const hasDefineProperty = requestModule(8); // Feature detection for Object.defineProperty
        const updateProperty = requestModule(20); // Patch property utility
        const patchProperties = requestModule(36); // Patch properties on an object
        const setToStringTag = requestModule(28); // Set Symbol.toStringTag
        const createIterator = requestModule(53); // Iterator creation helper
        const internalState = requestModule(16); // Internal state management
        const checkInstance = requestModule(32); // Instance check utility
        const isPropertyPresent = requestModule(14); // HasOwnProperty check
        const bindFunction = requestModule(13); // Function binding utility
        const objectToString = requestModule(52); // Object.prototype.toString tag utility
        const validateObject = requestModule(1); // Object validation utility
        const isObject = requestModule(9); // IsObject utility
        const createObject = requestModule(27); // Object.create polyfill
        const mapEntries = requestModule(57); // Map.prototype.entries
        const getIteratorMethod = requestModule(51); // Get iterator method
        const wellKnownSymbolIterator = requestModule(7)("iterator"); // Symbol.iterator

        const nativeFetch = globalLookup("fetch"); // Native fetch function
        const nativeHeaders = globalLookup("Headers"); // Native Headers constructor

        const internalStateSetter = internalState.set; // Set internal state
        const internalStateGetter = internalState.getterFor("URLSearchParams"); // Get internal state getter
        const iteratorStateGetter = internalState.getterFor("URLSearchParamsIterator"); // Get iterator state getter

        const plusRegex = /\+/g; // Regex for '+' character
        const decodeLengthCache = Array(4); // Cache for decode regexes

        // Helper to create decode regex for specific length
        const createDecodeRegex = function(length) {
            return decodeLengthCache[length - 1] || (decodeLengthCache[length - 1] = RegExp("((?:%[\\da-f]{2}){" + length + "})", "gi"));
        };

        // Safe decodeURIComponent (handles malformed URI sequences)
        const decodeURIComponentSafe = function(encodedString) {
            try {
                return decodeURIComponent(encodedString);
            } catch (error) {
                return encodedString;
            }
        };

        // Decodes a URL component, handling '+' and malformed sequences
        const decodeUrlComponent = function(encodedString) {
            let decoded = encodedString.replace(plusRegex, " "); // Replace '+' with space
            let attempts = 4;
            try {
                return decodeURIComponent(decoded);
            } catch (error) {
                // Try decoding with decreasing lengths of percent-encoded sequences
                for (; attempts;) {
                    decoded = decoded.replace(createDecodeRegex(attempts--), decodeURIComponentSafe);
                }
                return decoded;
            }
        };

        const encodeRegex = /[!'()~]|%20/g; // Characters to encode specially
        const encodeMap = { // Mapping for special encoding
            "!": "%21",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "~": "%7E",
            "%20": "+"
        };

        // Helper to get special encoded char
        const getEncodedChar = function(char) {
            return encodeMap[char];
        };

        // Encodes a URL component using specific rules
        const encodeUrlComponent = function(component) {
            return encodeURIComponent(component).replace(encodeRegex, getEncodedChar);
        };

        // Parses a query string and populates entries array
        const parseQueryString = function(entriesArray, queryString) {
            if (queryString) {
                const params = queryString.split("&"); // Split by '&'
                for (let i = 0; i < params.length;) {
                    const param = params[i++];
                    if (param.length) {
                        const parts = param.split("="); // Split by '='
                        entriesArray.push({
                            key: decodeUrlComponent(parts.shift()), // Decode key
                            value: decodeUrlComponent(parts.join("=")) // Decode value
                        });
                    }
                }
            }
        };

        // Updates the internal search params from a query string
        const updateSearchParams = function(state, queryString) {
            state.entries.length = 0; // Clear existing entries
            parseQueryString(state.entries, queryString); // Repopulate
        };

        // Checks if enough arguments are provided
        const checkArgumentsLength = function(provided, required) {
            if (provided < required) {
                throw TypeError("Not enough arguments");
            }
        };

        // URLSearchParams iterator constructor
        const urlSearchParamsIterator = createIterator(function(instance, kind) {
            internalStateSetter(instance, {
                type: "URLSearchParamsIterator",
                iterator: mapEntries(internalStateGetter(instance.target).entries), // Get entries iterator
                kind: kind
            });
        }, "Iterator", function() {
            const state = iteratorStateGetter(this); // Get iterator state
            const kind = state.kind; // Kind of iteration
            const nextResult = state.iterator.next(); // Get next entry
            const entryValue = nextResult.value;

            // If not done, return value based on kind
            if (!nextResult.done) {
                nextResult.value = kind === "keys" ? entryValue.key : kind === "values" ? entryValue.value : [entryValue.key, entryValue.value];
            }
            return nextResult;
        });

        /**
         * URLSearchParams Constructor
         * @param {string|Array|object} initializer - Initializer for parameters.
         */
        const urlSearchParamsConstructor = function(initializer) {
            checkInstance(this, urlSearchParamsConstructor, "URLSearchParams"); // Ensure correct instance
            let currentParam, paramEntry, nextEntry, originalModule, paramKey, paramValue, index, hasKey, isModified, targetKey, targetValue, sortedEntries, insertIndex;

            const instanceState = internalStateSetter(this, {
                type: "URLSearchParams",
                entries: [],
                updateURL: function() {}, // Placeholder for URL update logic
                updateSearchParams: updateSearchParams // Reference to update function
            });

            if (void 0 !== initializer) {
                if (isObject(initializer)) {
                    if (typeof(originalModule = getIteratorMethod(initializer)) === "function") {
                        // If iterable, iterate and add entries
                        for (paramEntry = originalModule.call(initializer).next; !(currentParam = paramEntry.call(originalModule)).done;) {
                            if ((nextEntry = (originalModule = mapEntries(validateObject(currentParam.value))).next()).done || (paramKey = originalModule.next()).done || !originalModule.next().done) {
                                throw TypeError("Expected sequence with length 2");
                            }
                            instanceState.entries.push({ key: nextEntry.value + "", value: paramKey.value + "" });
                        }
                    } else {
                        // If plain object, add properties as entries
                        for (paramKey in initializer) {
                            if (isPropertyPresent(initializer, paramKey)) {
                                instanceState.entries.push({ key: paramKey, value: initializer[paramKey] + "" });
                            }
                        }
                    }
                } else {
                    // If string, parse as query string
                    parseQueryString(instanceState.entries, typeof initializer === "string" ? "?" === initializer.charAt(0) ? initializer.slice(1) : initializer : initializer + "");
                }
            }
        };

        const urlSearchParamsPrototype = urlSearchParamsConstructor.prototype; // Prototype reference

        // Patch methods on URLSearchParams.prototype
        patchProperties(urlSearchParamsPrototype, {
            append: function(key, value) {
                checkArgumentsLength(arguments.length, 2);
                const state = internalStateGetter(this);
                state.entries.push({ key: key + "", value: value + "" });
                state.updateURL();
            },
            delete: function(key) {
                checkArgumentsLength(arguments.length, 1);
                const state = internalStateGetter(this);
                const entries = state.entries;
                const targetKey = key + "";
                for (let i = 0; i < entries.length;) {
                    if (entries[i].key === targetKey) {
                        entries.splice(i, 1); // Remove entry
                    } else {
                        i++;
                    }
                }
                state.updateURL();
            },
            get: function(key) {
                checkArgumentsLength(arguments.length, 1);
                const entries = internalStateGetter(this).entries;
                const targetKey = key + "";
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === targetKey) {
                        return entries[i].value;
                    }
                }
                return null;
            },
            getAll: function(key) {
                checkArgumentsLength(arguments.length, 1);
                const entries = internalStateGetter(this).entries;
                const targetKey = key + "";
                const values = [];
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === targetKey) {
                        values.push(entries[i].value);
                    }
                }
                return values;
            },
            has: function(key) {
                checkArgumentsLength(arguments.length, 1);
                const entries = internalStateGetter(this).entries;
                const targetKey = key + "";
                for (let i = 0; i < entries.length;) {
                    if (entries[i++].key === targetKey) {
                        return true;
                    }
                }
                return false;
            },
            set: function(key, value) {
                checkArgumentsLength(arguments.length, 1);
                const state = internalStateGetter(this);
                const entries = state.entries;
                let isModified = false;
                const targetKey = key + "";
                const targetValue = value + "";
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === targetKey) {
                        if (isModified) {
                            entries.splice(i--, 1); // Remove duplicate
                        } else {
                            isModified = true;
                            entries[i].value = targetValue; // Update value
                        }
                    }
                }
                if (!isModified) {
                    entries.push({ key: targetKey, value: targetValue }); // Add new entry
                }
                state.updateURL();
            },
            sort: function() {
                let currentEntry, insertIndex, sortedEntries = internalStateGetter(this);
                const originalEntries = sortedEntries.entries;
                const tempEntries = originalEntries.slice(); // Copy entries for sorting
                originalEntries.length = 0; // Clear original entries

                // Re-insert sorted entries
                for (insertIndex = 0; insertIndex < tempEntries.length; insertIndex++) {
                    currentEntry = tempEntries[insertIndex];
                    for (let j = 0; j < insertIndex; j++) {
                        if (originalEntries[j].key > currentEntry.key) {
                            originalEntries.splice(j, 0, currentEntry); // Insert at sorted position
                            break;
                        }
                    }
                    if (j === insertIndex) {
                        originalEntries.push(currentEntry); // Append if largest
                    }
                }
                sortedEntries.updateURL();
            },
            forEach: function(callbackFn) {
                const entries = internalStateGetter(this).entries;
                const boundCallback = bindFunction(callbackFn, arguments.length > 1 ? arguments[1] : undefined, 3); // Bind callback
                for (let i = 0; i < entries.length;) {
                    const entry = entries[i++];
                    boundCallback(entry.value, entry.key, this);
                }
            },
            keys: function() {
                return new urlSearchParamsIterator(this, "keys");
            },
            values: function() {
                return new urlSearchParamsIterator(this, "values");
            },
            entries: function() {
                return new urlSearchParamsIterator(this, "entries");
            }
        }, { enumerable: true });

        // Set Symbol.iterator and toString method
        updateProperty(urlSearchParamsPrototype, wellKnownSymbolIterator, urlSearchParamsPrototype.entries, { unsafe: true });
        update