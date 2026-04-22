(function(moduleDefinitions) {
    // This is a self-executing anonymous function that acts as a module bundler runtime.
    // It manages module loading, caching, and export definitions for a set of JavaScript modules.

    // Cache for already loaded modules.
    const loadedModules = {};

    /**
     * Custom module loader function, analogous to 'require' in Node.js or Webpack.
     * It loads a module by its ID, caches it, and returns its exports.
     * @param {number} requestedModuleId - The unique identifier of the module to load.
     * @returns {*} The exports object of the loaded module.
     */
    function loadModule(requestedModuleId) {
        // If the module is already in the cache, return its existing exports.
        if (loadedModules[requestedModuleId]) {
            return loadedModules[requestedModuleId].exports;
        }

        // If not cached, create a new module entry.
        const moduleEntry = loadedModules[requestedModuleId] = {
            id: requestedModuleId,         // Store the module ID.
            isLoaded: false,               // Flag to indicate if the module has finished loading.
            exports: {}                    // The exports object for this module.
        };

        // Execute the module function, passing module.exports, module, and the loadModule function itself.
        // The 'this' context inside the module function will be module.exports.
        moduleDefinitions[requestedModuleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, loadModule);

        // Mark the module as loaded after its function has executed.
        moduleEntry.isLoaded = true;

        // Return the module's exports.
        return moduleEntry.exports;
    }

    // Store module definitions and cache on the loader function itself.
    // This allows the loader to access its own internal state and methods.
    loadModule.moduleDefinitions = moduleDefinitions;
    loadModule.loadedModules = loadedModules;

    /**
     * Defines a getter property on an object, typically used for module exports.
     * This method ensures that a property is defined only if it doesn't already exist.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The function to call when the property is accessed.
     */
    loadModule.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!loadModule.hasOwnExport(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Set the getter function.
            });
        }
    };

    /**
     * Configures a module's exports object for ES module compatibility.
     * This involves setting the `Symbol.toStringTag` and `__esModule` properties.
     * @param {object} moduleExportsObject - The exports object of the module.
     */
    loadModule.setupEsModuleCompatibility = function(moduleExportsObject) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set the __esModule flag to true.
        Object.defineProperty(moduleExportsObject, "__esModule", {
            value: true
        });
    };

    /**
     * Handles interoperability for different module types (e.g., CommonJS vs. ES Modules).
     * It can load a module, get its default export, or create a namespace object.
     * @param {*} moduleValue - The raw module value or ID.
     * @param {number} interopFlags - Bitmask flags indicating how to process the module.
     * @returns {*} The processed module value or a namespace object.
     */
    loadModule.interopModule = function(moduleValue, interopFlags) {
        // Flag 1: If set, the moduleValue is a module ID, so load it first.
        if (interopFlags & 1) {
            moduleValue = loadModule(moduleValue);
        }
        // Flag 8: If set, return the moduleValue directly.
        if (interopFlags & 8) {
            return moduleValue;
        }
        // Flag 4: If set and moduleValue is an object with __esModule, return it directly.
        if (interopFlags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new namespace object for non-ES modules.
        const namespaceObject = Object.create(null);
        loadModule.setupEsModuleCompatibility(namespaceObject); // Set ES module compatibility flags.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        // Flag 2: If set and moduleValue is not a string, iterate and expose its properties.
        if (interopFlags & 2 && typeof moduleValue !== "string") {
            for (const propKey in moduleValue) {
                // Ensure the property is directly on the moduleValue, not its prototype.
                if (loadModule.hasOwnExport(moduleValue, propKey)) {
                    loadModule.defineExportGetter(namespaceObject, propKey, (function(key) {
                        return moduleValue[key];
                    }).bind(null, propKey));
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Utility function to get the default export from a module.
     * @param {*} moduleObject - The module object.
     * @returns {function} A function that returns the default export.
     */
    loadModule.retrieveDefaultExport = function(moduleObject) {
        const defaultExportAccess = moduleObject && moduleObject.__esModule ?
            function() {
                return moduleObject.default;
            } :
            function() {
                return moduleObject;
            };
        // Also define a property 'a' pointing to the same getter, a common Webpack pattern.
        loadModule.defineExportGetter(defaultExportAccess, "a", defaultExportAccess);
        return defaultExportAccess;
    };

    /**
     * Checks if an object has a specific property as its own property.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey - The name of the property to check.
     * @returns {boolean} True if the property exists as an own property, false otherwise.
     */
    loadModule.hasOwnExport = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets or resources (often an empty string in simple bundles).
    loadModule.publicPath = "";

    // Execute the entry module (module ID 343) to start the application.
    loadModule(loadModule.startupModule = 343);
})([
/* 0 */
function(moduleRef, moduleExports, localRequire) {
    const commonUtils = localRequire(5); // Access global object
    const propertyDefiner = localRequire(19).f; // Object.getOwnPropertyDescriptor
    const objectPropertyUtil = localRequire(18); // Object.defineProperty
    const propertyExtender = localRequire(20); // extend object with property
    const utilityForPolyfills = localRequire(79); // Assign to global scope
    const objectAssigner = localRequire(104); // Object.assign
    const featureChecker = localRequire(63); // Check if feature is forced polyfill

    moduleRef.exports = function(configObj, implFunctions) {
        const targetGlobal = configObj.global;
        const targetName = configObj.target;
        const isStatic = configObj.stat;

        let targetObject;
        let functionName;
        let currentImpl;
        let polyfillImpl;
        let descriptor;

        if (targetGlobal) {
            targetObject = commonUtils;
        } else if (isStatic) {
            targetObject = commonUtils[targetName] || utilityForPolyfills(targetName, {});
        } else {
            targetObject = (commonUtils[targetName] || {}).prototype;
        }

        for (functionName in implFunctions) {
            polyfillImpl = implFunctions[functionName];
            // Check if the current implementation needs to be polyfilled or updated.
            const needsUpdate = featureChecker(
                targetGlobal ? functionName : targetName + (isStatic ? "." : "#") + functionName,
                configObj
            );

            if (needsUpdate) {
                descriptor = configObj.noTargetGet ?
                    (propertyDefiner(targetObject, functionName)) :
                    targetObject[functionName];

                // If the existing implementation is not undefined.
                if (descriptor !== undefined) {
                    // If types are different, or it's forced, proceed with update.
                    if (typeof polyfillImpl == typeof descriptor) {
                        continue;
                    }
                    objectAssigner(polyfillImpl, descriptor); // Copy properties if types differ.
                }
            }

            // Apply the new implementation.
            if (configObj.sham || (descriptor && descriptor.sham)) {
                objectPropertyUtil(polyfillImpl, "sham", true);
            }
            propertyExtender(targetObject, functionName, polyfillImpl, configObj);
        }
    };
},
/* 1 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);
    moduleRef.exports = function(value) {
        if (!isObject(value)) {
            throw TypeError(String(value) + " is not an object");
        }
        return value;
    };
},
/* 2 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = false;
},
/* 3 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const getIteratorMethod = localRequire(87);
    const bindCallable = localRequire(13);
    const isArray = localRequire(11);
    const getIterator = localRequire(51);
    const stopIteration = localRequire(113);

    // Helper class to signal early termination of iteration.
    const IterationResult = function(stoppedStatus, resultValue) {
        this.stopped = stoppedStatus;
        this.result = resultValue;
    };

    IterationResult.stop = function(value) {
        return new IterationResult(true, value);
    };

    /**
     * Iterates over a collection, applying a callback function to each element.
     * Supports various iterable types and provides early exit functionality.
     * @param {Iterable} iterable - The collection to iterate over.
     * @param {function} callback - The function to call for each element.
     * @param {*} [context] - The 'this' context for the callback.
     * @param {boolean} [isKeyValue] - If true, callback receives (key, value) or (value, index).
     * @param {boolean} [returnEarly] - If true, iteration can be stopped early by returning a IterationResult.stop.
     * @returns {IterationResult} An object indicating if iteration stopped early and its result.
     */
    moduleRef.exports = function(iterable, callback, context, isKeyValue, returnEarly) {
        let boundCallback = bindCallable(callback, context, isKeyValue ? 2 : 1);
        let iteratorInstance;
        let iterationValue;
        let iteratorMethod;
        let index = 0;

        if (returnEarly) { // Handle early termination scenario.
            if (isArray(iterable)) {
                for (iterationValue = iterable.length; iterationValue > index; index++) {
                    const currentItem = isKeyValue ? [iterable[index], index] : iterable[index];
                    const result = boundCallback(currentItem);
                    if (result && result instanceof IterationResult) return result;
                }
            } else if (getIteratorMethod(iterable)) {
                for (iteratorInstance = getIterator(iterable); !(iterationValue = iteratorInstance.next()).done;) {
                    const result = boundCallback(iterationValue.value, index++);
                    if (result && result instanceof IterationResult) return result;
                }
            } else {
                throw TypeError("Target is not iterable");
            }
        } else if (isArray(iterable)) { // Optimized path for arrays without early termination.
            for (iterationValue = iterable.length; iterationValue > index; index++) {
                const currentItem = isKeyValue ? [iterable[index], index] : iterable[index];
                boundCallback(currentItem);
            }
        } else if (getIteratorMethod(iterable)) { // Optimized path for iterables without early termination.
            for (iteratorInstance = getIterator(iterable); !(iterationValue = iteratorInstance.next()).done;) {
                boundCallback(iterationValue.value, index++);
            }
        } else {
            // Fallback for objects that might have an iterable method (e.g., Map.prototype.entries).
            // This path is less common but handles cases where `getIteratorMethod` might return a function.
            if (typeof (iteratorMethod = getIterator(iterable)) !== "function") {
                throw TypeError("Target is not iterable");
            }
            if (getIteratorMethod(iteratorMethod)) { // If it's an array-like iterable.
                for (let j = 0, len = isArray(iterable) ? iterable.length : 0; j < len; j++) {
                    if ((iterationValue = isKeyValue ? boundCallback(ensureObject(iterable[j])[0], iterable[j][1]) : boundCallback(iterable[j])) && iterationValue instanceof IterationResult) {
                        return iterationValue;
                    }
                }
                return new IterationResult(false);
            }
            iteratorInstance = iteratorMethod.call(iterable);
            while (!(iterationValue = iteratorInstance.next()).done) {
                const result = stopIteration(iteratorInstance, boundCallback, iterationValue.value, isKeyValue);
                if (typeof result === "object" && result && result instanceof IterationResult) return result;
            }
        }
        return new IterationResult(false);
    };
},
/* 4 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(func) {
        if (typeof func != "function") {
            throw TypeError(String(func) + " is not a function");
        }
        return func;
    };
},
/* 5 */
function(moduleRef, moduleExports, localRequire) {
    // Determine the global object (window in browsers, global in Node.js, or self in Web Workers).
    const getGlobalObject = function(env) {
        return env && env.Math === Math && env;
    };

    moduleRef.exports =
        getGlobalObject(typeof globalThis === "object" && globalThis) ||
        getGlobalObject(typeof window === "object" && window) ||
        getGlobalObject(typeof self === "object" && self) ||
        getGlobalObject(typeof global === "object" && global) ||
        (function() {
            return this;
        })(); // Fallback to 'this' in strict mode or Function constructor.
},
/* 6 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(callback) {
        try {
            return !!callback();
        } catch (error) {
            return true;
        }
    };
},
/* 7 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const symbolRegistry = localRequire(60);
    const hasOwn = localRequire(14);
    const uidGenerator = localRequire(44);
    const assignSymbolPolyfill = localRequire(84);
    const symbolApiCheck = localRequire(107);

    const wellKnownSymbols = symbolRegistry("wks");
    const nativeSymbol = globalObject.Symbol;

    moduleRef.exports = function(symbolName) {
        // If the symbol is already in the registry, return it.
        // Otherwise, create a new symbol.
        if (hasOwn(wellKnownSymbols, symbolName)) {
            return wellKnownSymbols[symbolName];
        }
        // If native Symbol is available and it has the symbol, use that.
        if (assignSymbolPolyfill && hasOwn(nativeSymbol, symbolName)) {
            return (wellKnownSymbols[symbolName] = nativeSymbol[symbolName]);
        }
        // Fallback: create a unique string as a symbol.
        return (wellKnownSymbols[symbolName] = uidGenerator("Symbol." + symbolName));
    };
},
/* 8 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    // Check if Object.defineProperty is working correctly.
    moduleRef.exports = !isError(function() {
        return (
            7 !=
            Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                },
            }).a
        );
    });
},
/* 9 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(value) {
        return typeof value === "object" ? value !== null : typeof value === "function";
    };
},
/* 10 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8);
    const objectDefineProperty = localRequire(101);
    const ensureObject = localRequire(1);
    const toPropertyKey = localRequire(31);
    const checkTypeError = localRequire(1); // Redundant, but follows pattern

    const nativeDefineProperty = Object.defineProperty;

    moduleRef.exports = supportsDescriptors ?
        nativeDefineProperty :
        function(target, property, descriptor) {
            ensureObject(target);
            property = toPropertyKey(property, true);
            ensureObject(descriptor);

            // If objectDefineProperty (for IE8) exists and works, try to use it.
            if (objectDefineProperty) {
                try {
                    return nativeDefineProperty(target, property, descriptor);
                } catch (error) {
                    // Fallback to direct assignment if error.
                }
            }

            // If descriptor has a getter or setter, it's not supported.
            if ("get" in descriptor || "set" in descriptor) {
                throw TypeError("Accessors not supported");
            }
            // If it's a value property, assign it directly.
            if ("value" in descriptor) {
                target[property] = descriptor.value;
            }
            return target;
        };
},
/* 11 */
function(moduleRef, moduleExports, localRequire) {
    const toInteger = localRequire(24);
    const mathMin = Math.min;

    moduleRef.exports = function(value) {
        // Convert to a valid length, capping at 2^53 - 1 (JS max safe integer).
        const length = toInteger(value);
        return length > 0 ? mathMin(length, 9007199254740991) : 0;
    };
},
/* 12 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const sharedData = localRequire(105); // Access shared global object.

    const getBuiltin = function(namespace) {
        return typeof namespace === "function" ? namespace : undefined;
    };

    moduleRef.exports = function(key, subKey) {
        // If only one argument, try to get from sharedData then global.
        if (arguments.length < 2) {
            return getBuiltin(sharedData[key]) || getBuiltin(globalObject[key]);
        }
        // If two arguments, try to get from sharedData[key][subKey] then global[key][subKey].
        return (sharedData[key] && sharedData[key][subKey]) || (globalObject[key] && globalObject[key][subKey]);
    };
},
/* 13 */
function(moduleRef, moduleExports, localRequire) {
    const ensureFunction = localRequire(4);

    /**
     * Binds a function to a specific 'this' context and partially applies arguments.
     * @param {function} func - The function to bind.
     * @param {*} context - The 'this' context for the function.
     * @param {number} [argCount] - Number of arguments to expect (0, 1, 2, 3) for optimized binding.
     * @returns {function} The bound function.
     */
    moduleRef.exports = function(func, context, argCount) {
        ensureFunction(func); // Ensure func is a valid function.

        if (context === undefined) {
            return func; // If no context, return original function.
        }

        switch (argCount) {
            case 0:
                return function() {
                    return func.call(context);
                };
            case 1:
                return function(arg1) {
                    return func.call(context, arg1);
                };
            case 2:
                return function(arg1, arg2) {
                    return func.call(context, arg1, arg2);
                };
            case 3:
                return function(arg1, arg2, arg3) {
                    return func.call(context, arg1, arg2, arg3);
                };
        }

        // Fallback for arbitrary number of arguments.
        return function() {
            return func.apply(context, arguments);
        };
    };
},
/* 14 */
function(moduleRef, moduleExports, localRequire) {
    const hasOwnProperty = {}.hasOwnProperty;
    moduleRef.exports = function(object, property) {
        return hasOwnProperty.call(object, property);
    };
},
/* 15 */
function(moduleRef, moduleExports, localRequire) {
    const requireObjectCoercible = localRequire(17);
    moduleRef.exports = function(value) {
        return Object(requireObjectCoercible(value));
    };
},
/* 16 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(103); // Check for WeakMap support
    const isObject = localRequire(5);
    const defineProperty = localRequire(9); // Check for WeakMap support
    const hasProperty = localRequire(18); // Define property
    const hasOwn = localRequire(14); // Check own property
    const uniqueKeyGenerator = localRequire(59); // Generate unique key
    const wellKnownSymbols = localRequire(45); // Well-known symbols registry

    const nativeWeakMap = isObject.WeakMap; // Get native WeakMap constructor

    let stateSetter;
    let stateGetter;
    let stateHas;

    if (globalObject) { // If WeakMap is available
        const internalWeakMap = new nativeWeakMap();
        const getWeakMap = internalWeakMap.get;
        const hasWeakMap = internalWeakMap.has;
        const setWeakMap = internalWeakMap.set;

        stateSetter = function(target, value) {
            setWeakMap.call(internalWeakMap, target, value);
            return value;
        };
        stateGetter = function(target) {
            return getWeakMap.call(internalWeakMap, target) || {};
        };
        stateHas = function(target) {
            return hasWeakMap.call(internalWeakMap, target);
        };
    } else { // Fallback for environments without WeakMap (using simple objects)
        const secretKey = uniqueKeyGenerator("state");
        wellKnownSymbols[secretKey] = true; // Mark as internal property

        stateSetter = function(target, value) {
            hasProperty(target, secretKey, value);
            return value;
        };
        stateGetter = function(target) {
            return hasOwn(target, secretKey) ? target[secretKey] : {};
        };
        stateHas = function(target) {
            return hasOwn(target, secretKey);
        };
    }

    moduleRef.exports = {
        set: stateSetter,
        get: stateGetter,
        has: stateHas,
        // Ensures an object has internal state, creating it if necessary.
        enforce: function(target) {
            return stateHas(target) ? stateGetter(target) : stateSetter(target, {});
        },
        // Creates a getter function for state specific to a 'type'.
        getterFor: function(type) {
            return function(instance) {
                const state = stateGetter(instance);
                if (!isObject(instance) || state.type !== type) {
                    throw TypeError("Incompatible receiver, " + type + " required");
                }
                return state;
            };
        },
    };
},
/* 17 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(value) {
        if (value == null) { // Check for null or undefined
            throw TypeError("Can't call method on " + value);
        }
        return value;
    };
},
/* 18 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8);
    const objectDefineProperty = localRequire(10); // getOwnPropertyDescriptor for IE8
    const createProperty = localRequire(30); // property descriptor factory

    moduleRef.exports = supportsDescriptors ?
        function(object, property, value) {
            return objectDefineProperty.f(object, property, createProperty(1, value));
        } :
        function(object, property, value) {
            object[property] = value;
            return object;
        };
},
/* 19 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8);
    const isPropertyEnumerable = localRequire(58);
    const createPropertyDescriptor = localRequire(30);
    const toObject = localRequire(25);
    const toPropertyKey = localRequire(31);
    const objectDefineProperty = localRequire(101); // IE8 bug workaround

    const nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    moduleRef.exports = supportsDescriptors ?
        nativeGetOwnPropertyDescriptor :
        function(object, property) {
            object = toObject(object);
            property = toPropertyKey(property, true);

            // Handle IE8 bug with `Object.getOwnPropertyDescriptor` on DOM elements.
            if (objectDefineProperty) {
                try {
                    return nativeGetOwnPropertyDescriptor(object, property);
                } catch (error) {
                    // Fallback to checking hasOwnProperty if an error occurs (e.g., on DOM elements in IE).
                }
            }

            // If property exists, return a basic descriptor.
            if (isPropertyEnumerable.f.call(object, property)) {
                return createPropertyDescriptor(true, object[property]);
            }
            return undefined;
        };
},
/* 20 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const defineProperty = localRequire(18); // Object.defineProperty helper
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const assignToGlobal = localRequire(79); // Assign global properties safely
    const getSourceOfFunction = localRequire(80); // Get source code of function
    const stateManagement = localRequire(16); // Internal state management
    const getState = stateManagement.get; // Get internal state
    const enforceState = stateManagement.enforce; // Enforce internal state presence

    // Split 'String' to avoid issues with minifiers renaming 'String'.
    const stringSplitter = String(String).split("String");

    /**
     * Defines a property on an object, optionally making it non-enumerable or unsafe.
     * @param {object} objectToExtend - The object to modify.
     * @param {string} propertyName - The name of the property.
     * @param {function|*} propertyValue - The value of the property (function or other).
     * @param {object} [options] - Configuration options.
     * @param {boolean} [options.unsafe=false] - If true, overwrite existing non-configurable properties.
     * @param {boolean} [options.enumerable=false] - If true, make the property enumerable.
     * @param {boolean} [options.noTargetGet=false] - If true, don't attempt to get existing value from target.
     */
    moduleRef.exports = function(objectToExtend, propertyName, propertyValue, options) {
        options = options || {};
        const isUnsafe = !!options.unsafe;
        const isEnumerable = !!options.enumerable;
        const noTargetGet = !!options.noTargetGet;

        // For functions, store their source code in internal state for toString() polyfills.
        if (typeof propertyValue === "function") {
            if (typeof propertyName !== "string" || !hasOwn(propertyValue, "name")) {
                defineProperty(propertyValue, "name", propertyName);
            }
            enforceState(propertyValue).source = stringSplitter.join(
                typeof propertyName === "string" ? propertyName : ""
            );
        }

        // If it's not the global object, handle existing properties.
        if (objectToExtend !== globalObject) {
            if (isUnsafe) {
                // If unsafe, and property exists, delete it unless noTargetGet is true.
                if (!noTargetGet && objectToExtend[propertyName]) {
                    isEnumerable = true; // Force enumerable if existing property deleted.
                }
                delete objectToExtend[propertyName];
            }
            // Define the property.
            if (isEnumerable) {
                objectToExtend[propertyName] = propertyValue;
            } else {
                defineProperty(objectToExtend, propertyName, propertyValue);
            }
        } else {
            // For global object, either assign directly or use assignToGlobal.
            if (isEnumerable) {
                objectToExtend[propertyName] = propertyValue;
            } else {
                assignToGlobal(propertyName, propertyValue);
            }
        }
    };
},
/* 21 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(105); // Shared global object
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const defineProperty = localRequire(10).f; // Object.defineProperty.f

    moduleRef.exports = function(symbolName) {
        const symbolRegistry = globalObject.Symbol || (globalObject.Symbol = {});
        // If the symbol is not already defined in the registry, define it.
        if (!hasOwn(symbolRegistry, symbolName)) {
            defineProperty(symbolRegistry, symbolName, {
                value: localRequire(110).f(symbolName) // Use the symbol factory
            });
        }
    };
},
/* 22 */
function(moduleRef, moduleExports, localRequire) {
    const hasOwn = localRequire(14);
    const toObject = localRequire(15);
    const uniqueKey = localRequire(59);
    const getPrototypeOfPolyfill = localRequire(115);

    const IE_PROTO_KEY = uniqueKey("IE_PROTO");
    const objectPrototype = Object.prototype;

    moduleRef.exports =
        getPrototypeOfPolyfill ||
        function(object) {
            object = toObject(object);
            // Check for the custom IE_PROTO_KEY first.
            if (hasOwn(object, IE_PROTO_KEY)) {
                return object[IE_PROTO_KEY];
            }
            // If the object's constructor prototype is equal to the object, return that.
            if (
                typeof object.constructor === "function" &&
                object instanceof object.constructor
            ) {
                return object.constructor.prototype;
            }
            // If it's an instance of Object, return Object.prototype.
            return object instanceof Object ? objectPrototype : null;
        };
},
/* 23 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const ensureFunction = localRequire(4);
    const wellKnownSymbol = localRequire(7)("species");

    moduleRef.exports = function(originalObject, defaultConstructor) {
        const constructor = ensureObject(originalObject).constructor;
        let species;

        // If the constructor exists, and it's not undefined or null.
        if (constructor !== undefined && constructor !== null) {
            // Check for the @@species symbol, which allows derived objects to specify their preferred constructor.
            species = ensureObject(constructor)[wellKnownSymbol];
            if (species === undefined) {
                // If @@species is not defined, check if constructor is Array and its prototype is not Array.prototype.
                // If so, use the constructor itself. Otherwise, use undefined.
                // This is a complex check for array subclasses.
                if (isArray(constructor) && !(constructor === Array || (constructor.prototype && isArray(constructor.prototype)))) {
                    species = undefined;
                } else {
                    species = undefined; // Default to undefined if no species.
                }
            }
        }
        // If species is undefined or null, use the defaultConstructor.
        // Otherwise, ensure species is a function before returning it.
        return species === undefined || species === null ?
            defaultConstructor :
            ensureFunction(species);
    };
},
/* 24 */
function(moduleRef, moduleExports, localRequire) {
    const mathCeil = Math.ceil;
    const mathFloor = Math.floor;

    moduleRef.exports = function(value) {
        // Convert to number, then floor/ceil. Handle NaN.
        const numValue = +value;
        return numValue !== numValue ? 0 : numValue > 0 ? mathFloor(numValue) : mathCeil(numValue);
    };
},
/* 25 */
function(moduleRef, moduleExports, localRequire) {
    const indexedObject = localRequire(77);
    const requireObjectCoercible = localRequire(17);

    // Convert an object to an indexed object (e.g., string to array-like).
    moduleRef.exports = function(value) {
        return indexedObject(requireObjectCoercible(value));
    };
},
/* 26 */
function(moduleRef, moduleExports, localRequire) {
    const objectToString = {}.toString;
    moduleRef.exports = function(value) {
        // Returns the internal [[Class]] property of an object, e.g., "[object Array]".
        return objectToString.call(value).slice(8, -1);
    };
},
/* 27 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(1);
    const objectCreate = localRequire(108); // Object.create polyfill
    const getOwnPropertyNames = localRequire(82); // Get own property names
    const internalObjectProperties = localRequire(45); // IE_PROTO symbol
    const htmlCreateElement = localRequire(109); // Create HTML element
    const internalProtoKey = localRequire(59)("IE_PROTO");

    const objectPrototype = Object.prototype;
    const noopConstructor = function() {};

    // Polyfill for Object.create in environments where it's not fully supported.
    const createObjectPolyfill = function() {
        // Create an iframe to get a clean Object constructor for IE.
        const iframe = htmlCreateElement("iframe");
        let docRef;
        let i = getOwnPropertyNames.length;
        iframe.style.display = "none"; // Hide the iframe.
        internalObjectProperties.appendChild(iframe); // Append to document.
        iframe.src = String("javascript:"); // Set source to prevent security issues.
        docRef = iframe.contentWindow.document;
        docRef.open();
        docRef.write("<script>document.F=Object<\/script>"); // Create a new Object constructor.
        docRef.close();
        // Use the new Object constructor from the iframe.
        createObjectPolyfill = docRef.F;
        // Remove properties from the prototype to avoid pollution.
        while (i--) {
            delete createObjectPolyfill.prototype[getOwnPropertyNames[i]];
        }
        return createObjectPolyfill();
    };

    moduleRef.exports =
        Object.create ||
        function(proto, descriptors) {
            let instance;
            if (proto !== null) {
                noopConstructor.prototype = isObject(proto);
                instance = new noopConstructor();
                noopConstructor.prototype = null; // Clear prototype to avoid memory leaks.
                instance[internalProtoKey] = proto; // Store prototype link for IE.
            } else {
                instance = createObjectPolyfill(); // Use IE workaround for null proto.
            }
            // If property descriptors are provided, define them.
            return descriptors === undefined ?
                instance :
                objectCreate(instance, descriptors);
        };

    // Mark the internal proto key as not enumerable.
    internalObjectProperties[internalProtoKey] = true;
},
/* 28 */
function(moduleRef, moduleExports, localRequire) {
    const defineProperty = localRequire(10).f;
    const hasOwn = localRequire(14);
    const wellKnownSymbol = localRequire(7)("toStringTag");

    /**
     * Sets the `Symbol.toStringTag` property for an object or its prototype.
     * This affects the output of `Object.prototype.toString`.
     * @param {object} targetObject - The object or constructor function.
     * @param {string} tagName - The desired string tag (e.g., "Array", "Promise").
     * @param {boolean} [isInstance=false] - If true, set on the object itself; otherwise, on its prototype.
     */
    moduleRef.exports = function(targetObject, tagName, isInstance) {
        const target = isInstance ? targetObject : targetObject.prototype;
        if (target && !hasOwn(target, wellKnownSymbol)) {
            defineProperty(target, wellKnownSymbol, {
                configurable: true,
                value: tagName
            });
        }
    };
},
/* 29 */
function(moduleRef, moduleExports, localRequire) {
    const isPure = localRequire(2);
    const mapIterator = localRequire(57); // Get Map iterator (pure or native)

    moduleRef.exports = isPure ? mapIterator : function(mapInstance) {
        return Map.prototype.entries.call(mapInstance);
    };
},
/* 30 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(flags, value) {
        return {
            enumerable: !(flags & 1), // 1 means not enumerable
            configurable: !(flags & 2), // 2 means not configurable
            writable: !(flags & 4), // 4 means not writable
            value: value, // The value of the property
        };
    };
},
/* 31 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);

    /**
     * Converts an object to a primitive value (string or number).
     * @param {*} value - The value to convert.
     * @param {boolean} [hintAsString=false] - If true, prefer string conversion; otherwise, prefer number.
     * @returns {string|number|symbol} The primitive representation of the value.
     */
    moduleRef.exports = function(value, hintAsString) {
        if (!isObject(value)) {
            return value; // If already primitive, return as is.
        }

        let method;
        let result;

        // Try `toPrimitive` method if available.
        if (typeof (method = value.Symbol && Symbol.toPrimitive) === "function") {
            result = method.call(value, hintAsString ? "string" : "default");
            if (isObject(result)) {
                throw TypeError("Can't convert object to primitive value");
            }
            return result;
        }

        // Try `valueOf` method.
        if (!hintAsString && typeof (method = value.valueOf) === "function") {
            result = method.call(value);
            if (isObject(result)) {
                throw TypeError("Can't convert object to primitive value");
            }
            return result;
        }

        // Try `toString` method.
        if (typeof (method = value.toString) === "function") {
            result = method.call(value);
            if (isObject(result)) {
                throw TypeError("Can't convert object to primitive value");
            }
            return result;
        }

        throw TypeError("Can't convert object to primitive value");
    };
},
/* 32 */
function(moduleRef, moduleExports, localRequire) {
    moduleRef.exports = function(instance, constructor, classHint) {
        if (!(instance instanceof constructor)) {
            throw TypeError("Incorrect " + (classHint ? classHint + " " : "") + "invocation");
        }
        return instance;
    };
},
/* 33 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0); // Main function to define built-ins
    const globalObject = localRequire(5); // Global object (window, global)
    const supportsDescriptors = localRequire(8); // Feature detection for Object.defineProperty
    const checkPure = localRequire(99); // Check if pure (non-standard) module
    const typedArrayUtil = localRequire(34); // Typed Array utility functions
    const constructorChecker = localRequire(32); // Constructor invocation check
    const propertyDescriptor = localRequire(30); // Property descriptor factory
    const defineProperty = localRequire(18); // Helper to define properties
    const arrayLength = localRequire(11); // Get valid array length
    const typedArrayCreate = localRequire(130); // Typed Array construction
    const offsetCalculator = localRequire(224); // Calculate byte offset
    const toPropertyKey = localRequire(31); // Convert value to property key
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const objectGetPrototypeOf = localRequire(52); // Get prototype of object
    const isObject = localRequire(9); // Check if value is an object
    const createObject = localRequire(27); // Object.create polyfill
    const extendPrototype = localRequire(41); // Extend prototype chain
    const getOwnPropertyNames = localRequire(38).f; // Get own property names
    const forEach = localRequire(47).forEach; // Array.prototype.forEach
    const objectDefineProperty = localRequire(10); // Object.defineProperty
    const objectGetOwnPropertyDescriptor = localRequire(19); // Object.getOwnPropertyDescriptor
    const stateManagement = localRequire(16); // Internal state management
    const getState = stateManagement.get; // Get internal state
    const setState = stateManagement.set; // Set internal state

    const mathRound = Math.round;
    const rangeError = globalObject.RangeError;
    const arrayBuffer = typedArrayUtil.ArrayBuffer;
    const dataView = typedArrayUtil.DataView;
    const nativeArrayBufferViews = typedArrayUtil.NATIVE_ARRAY_BUFFER_VIEWS;
    const typedArrayTag = typedArrayUtil.TYPED_ARRAY_TAG;
    const typedArrayBase = typedArrayUtil.TypedArray;
    const typedArrayPrototype = typedArrayUtil.TypedArrayPrototype;
    const getTypedArrayConstructor = typedArrayUtil.aTypedArrayConstructor;
    const isTypedArray = typedArrayUtil.isTypedArray;

    // Helper to create a new typed array from another array-like.
    const createTypedArrayFromArray = function(Constructor, sourceArray) {
        const length = sourceArray.length;
        const newArray = new Constructor(length);
        let i = 0;
        while (i < length) {
            newArray[i] = sourceArray[i++];
        }
        return newArray;
    };

    // Helper to determine if an object is an ArrayBuffer or SharedArrayBuffer.
    const isArrayBuffer = function(value) {
        return (
            value instanceof arrayBuffer ||
            objectGetPrototypeOf(value) === "ArrayBuffer" ||
            objectGetPrototypeOf(value) === "SharedArrayBuffer"
        );
    };

    // Helper to check if a property key is valid for a typed array (numeric index).
    const isValidTypedArrayIndex = function(target, property) {
        return isTypedArray(target) && typeof property !== "symbol" && property in target && String(+property) === String(property);
    };

    // Custom getOwnPropertyDescriptor for typed arrays.
    const getTypedArrayDescriptor = function(target, property) {
        property = toPropertyKey(property, true);
        return isValidTypedArrayIndex(target, property) ?
            propertyDescriptor(2, target[property]) :
            objectGetOwnPropertyDescriptor.f(target, property);
    };

    // Custom defineProperty for typed arrays.
    const defineTypedArrayProperty = function(target, property, descriptor) {
        property = toPropertyKey(property, true);
        // If it's a valid index and the descriptor is for a value, set it directly.
        if (isValidTypedArrayIndex(target, property) && isObject(descriptor) && hasOwn(descriptor, "value") &&
            !hasOwn(descriptor, "get") && !hasOwn(descriptor, "set") && !descriptor.configurable &&
            (hasOwn(descriptor, "writable") ? descriptor.writable : true) &&
            (hasOwn(descriptor, "enumerable") ? descriptor.enumerable : true)
        ) {
            target[property] = descriptor.value;
            return target;
        }
        // Otherwise, use the native defineProperty.
        return objectDefineProperty.f(target, property, descriptor);
    };

    // If descriptor support is available, modify global Object.getOwnPropertyDescriptor/defineProperty.
    if (supportsDescriptors) {
        // If native typed array views are not supported, then override Object.getOwnPropertyDescriptor and defineProperty.
        if (!nativeArrayBufferViews) {
            objectGetOwnPropertyDescriptor.f = getTypedArrayDescriptor;
            objectDefineProperty.f = defineTypedArrayProperty;
            defineProperty(typedArrayPrototype, "buffer", {
                get: function() {
                    return getState(this).buffer;
                }
            });
            defineProperty(typedArrayPrototype, "byteOffset", {
                get: function() {
                    return getState(this).byteOffset;
                }
            });
            defineProperty(typedArrayPrototype, "byteLength", {
                get: function() {
                    return getState(this).byteLength;
                }
            });
            defineProperty(typedArrayPrototype, "length", {
                get: function() {
                    return getState(this).length;
                }
            });
        }

        // The main module.exports function to define a specific Typed Array.
        moduleRef.exports = function(typeName, constructorCallback, isClamped) {
            const bytesPerElement = typeName.match(/\d+$/)[0] / 8;
            const fullTypeName = typeName + (isClamped ? "Clamped" : "") + "Array";
            const getterMethodName = "get" + typeName;
            const setterMethodName = "set" + typeName;

            const nativeTypedArrayConstructor = globalObject[fullTypeName];
            let TypedArrayConstructor = nativeTypedArrayConstructor;
            let typedArrayPrototypeInstance = TypedArrayConstructor && TypedArrayConstructor.prototype;
            const namedExports = {};

            const propertyAccessor = function(instance, index) {
                objectDefineProperty.f(instance, index, {
                    get: function() {
                        const state = getState(this);
                        return state.view[getterMethodName](
                            index * bytesPerElement + state.byteOffset,
                            true
                        );
                    },
                    set: function(value) {
                        const state = getState(this);
                        let val = value;
                        if (isClamped) {
                            val = mathRound(val);
                            val = val < 0 ? 0 : val > 255 ? 255 : 255 & val;
                        }
                        state.view[setterMethodName](
                            index * bytesPerElement + state.byteOffset,
                            val,
                            true
                        );
                    },
                    enumerable: true,
                });
            };

            // If native typed array views are available and not pure.
            if (nativeArrayBufferViews) {
                if (checkPure) {
                    // In pure mode, we define a wrapper constructor.
                    TypedArrayConstructor = constructorCallback(function(instance, buffer, byteOffset, length) {
                        constructorChecker(instance, TypedArrayConstructor, fullTypeName);
                        // Handle different constructor overloads.
                        if (isObject(buffer)) {
                            // If buffer is an ArrayBuffer or TypedArray.
                            if (isArrayBuffer(buffer)) {
                                const offset = offsetCalculator(byteOffset, bytesPerElement);
                                const viewLength = length === undefined ? undefined : arrayLength(length);
                                return new nativeTypedArrayConstructor(buffer, offset, viewLength);
                            }
                            // If buffer is another TypedArray, create from it.
                            if (isTypedArray(buffer)) {
                                return createTypedArrayFromArray(TypedArrayConstructor, buffer);
                            }
                        }
                        // Fallback to S.call(this, buffer) for other cases (e.g., length).
                        return typedArrayCreate.call(TypedArrayConstructor, buffer);
                    });
                }
                // Extend the prototype chain.
                if (extendPrototype) {
                    extendPrototype(TypedArrayConstructor, typedArrayBase);
                }
                // Copy static methods and properties from the native constructor.
                forEach(getOwnPropertyNames(nativeTypedArrayConstructor), function(key) {
                    if (!(key in TypedArrayConstructor)) {
                        defineProperty(TypedArrayConstructor, key, nativeTypedArrayConstructor[key]);
                    }
                });
                TypedArrayConstructor.prototype = typedArrayPrototypeInstance; // Set prototype.
            } else {
                // Polyfill implementation for environments without native typed arrays.
                TypedArrayConstructor = constructorCallback(function(instance, buffer, byteOffset, length) {
                    constructorChecker(instance, TypedArrayConstructor, fullTypeName);
                    let internalBuffer, internalByteOffset, internalByteLength, internalLength;
                    let currentOffset = 0;
                    let currentLength = 0;

                    if (isObject(buffer)) {
                        if (!isArrayBuffer(buffer)) {
                            return isTypedArray(buffer) ?
                                createTypedArrayFromArray(TypedArrayConstructor, buffer) :
                                typedArrayCreate.call(TypedArrayConstructor, buffer);
                        }
                        internalBuffer = buffer;
                        internalByteOffset = offsetCalculator(byteOffset, bytesPerElement);
                        const bufferByteLength = buffer.byteLength;
                        if (length === undefined) {
                            if (bufferByteLength % bytesPerElement) {
                                throw rangeError("Wrong length");
                            }
                            internalByteLength = bufferByteLength - internalByteOffset;
                            if (internalByteLength < 0) {
                                throw rangeError("Wrong length");
                            }
                        } else {
                            internalByteLength = arrayLength(length) * bytesPerElement;
                            if (internalByteOffset + internalByteLength > bufferByteLength) {
                                throw rangeError("Wrong length");
                            }
                        }
                        internalLength = internalByteLength / bytesPerElement;
                    } else {
                        internalLength = typedArrayCreate(buffer); // Treat buffer as length.
                        internalBuffer = new arrayBuffer(internalByteLength = internalLength * bytesPerElement);
                    }

                    // Store internal state.
                    setState(instance, {
                        buffer: internalBuffer,
                        byteOffset: internalByteOffset,
                        byteLength: internalByteLength,
                        length: internalLength,
                        view: new dataView(internalBuffer)
                    });

                    // Define indexed properties.
                    while (currentOffset < internalLength) {
                        propertyAccessor(instance, currentOffset++);
                    }
                });
                if (extendPrototype) {
                    extendPrototype(TypedArrayConstructor, typedArrayBase);
                }
                typedArrayPrototypeInstance = TypedArrayConstructor.prototype = createObject(typedArrayPrototype);
            }

            // Ensure constructor property is correct.
            if (typedArrayPrototypeInstance.constructor !== TypedArrayConstructor) {
                defineProperty(typedArrayPrototypeInstance, "constructor", TypedArrayConstructor);
            }
            // Set Symbol.toStringTag if available.
            if (typedArrayTag) {
                defineProperty(typedArrayPrototypeInstance, typedArrayTag, fullTypeName);
            }
            // Export the constructor.
            namedExports[fullTypeName] = TypedArrayConstructor;
            defineBuiltin({
                global: true,
                forced: TypedArrayConstructor !== nativeTypedArrayConstructor,
                sham: !nativeArrayBufferViews
            }, namedExports);

            // Define BYTES_PER_ELEMENT static and instance properties.
            if (!("BYTES_PER_ELEMENT" in TypedArrayConstructor)) {
                defineProperty(TypedArrayConstructor, "BYTES_PER_ELEMENT", bytesPerElement);
            }
            if (!("BYTES_PER_ELEMENT" in typedArrayPrototypeInstance)) {
                defineProperty(typedArrayPrototypeInstance, "BYTES_PER_ELEMENT", bytesPerElement);
            }

            // Register the typed array type.
            typedArrayUtil.registerTypedArray(fullTypeName);
        };
    } else {
        // If descriptors are not supported, Typed Arrays cannot be polyfilled robustly.
        moduleRef.exports = function() {};
    }
},
/* 34 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const globalObject = localRequire(5); // Global object (window, global)
    const isObject = localRequire(9); // Check if value is an object
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const defineProperty = localRequire(18); // Helper for Object.defineProperty
    const extendObject = localRequire(20); // Helper to extend objects
    const objectGetPrototypeOf = localRequire(22); // Get prototype of an object
    const extendPrototype = localRequire(41); // Set prototype of an object
    const wellKnownSymbol = localRequire(7)("toStringTag"); // Symbol.toStringTag
    const uidGenerator = localRequire(44); // Generate unique IDs

    const nativeDataView = globalObject.DataView;
    const nativeInt8Array = globalObject.Int8Array;
    const nativeUint8ClampedArray = globalObject.Uint8ClampedArray;

    const nativeInt8ArrayPrototype = nativeInt8Array && nativeInt8Array.prototype;
    const nativeUint8ClampedArrayPrototype = nativeUint8ClampedArray && nativeUint8ClampedArray.prototype;

    const typedArrayBasePrototype = nativeInt8Array && objectGetPrototypeOf(nativeInt8Array);
    const typedArrayPrototype = nativeInt8ArrayPrototype && objectGetPrototypeOf(nativeInt8ArrayPrototype);
    const objectPrototype = Object.prototype;

    const typedArrayTagSymbol = uidGenerator("TYPED_ARRAY_TAG"); // Unique symbol for typed arrays

    // Check if ArrayBuffer and DataView are natively supported.
    const nativeArrayBuffer = !!globalObject.ArrayBuffer && !!nativeDataView;

    // Check if native typed array views are properly implemented and usable.
    const nativeArrayBufferViews =
        nativeArrayBuffer &&
        !!extendPrototype &&
        "Opera" !== objectGetPrototypeOf(globalObject.opera); // Opera specific check

    let isPolyfillRequired = false; // Flag to indicate if polyfill is needed.

    // Map of typed array names to their BYTES_PER_ELEMENT.
    const typedArrayTypes = {
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

    // Helper to check if a value is a known typed array type.
    const isKnownTypedArrayType = function(value) {
        return isObject(value) && hasOwn(typedArrayTypes, objectGetPrototypeOf(value));
    };

    // Check if all known typed array types are available natively.
    for (const typeName in typedArrayTypes) {
        if (!globalObject[typeName]) {
            isPolyfillRequired = true; // Polyfill is needed if any type is missing.
            break;
        }
    }

    // If polyfill is required or native implementations are not fully standard.
    if (
        !nativeArrayBufferViews ||
        typeof typedArrayBasePrototype !== "function" ||
        typedArrayBasePrototype === Function.prototype
    ) {
        // Define a dummy TypedArray base constructor if native one is missing or broken.
        typedArrayBasePrototype = function() {
            throw TypeError("Incorrect invocation");
        };
        if (nativeArrayBufferViews) {
            // If native views exist but base prototype is broken, extend native constructors.
            for (const typeName in typedArrayTypes) {
                if (globalObject[typeName]) {
                    extendPrototype(globalObject[typeName], typedArrayBasePrototype);
                }
            }
        }
    }

    // If native prototype is broken, fix it.
    if (
        !nativeArrayBufferViews ||
        !typedArrayPrototype ||
        typedArrayPrototype === objectPrototype
    ) {
        typedArrayPrototype = typedArrayBasePrototype.prototype; // Use our dummy prototype.
        if (nativeArrayBufferViews) {
            // Fix prototypes of native typed arrays if needed.
            for (const typeName in typedArrayTypes) {
                if (globalObject[typeName]) {
                    extendPrototype(globalObject[typeName].prototype, typedArrayPrototype);
                }
            }
        }
    }

    // Fix prototype of Uint8ClampedArray if it's different.
    if (
        nativeArrayBufferViews &&
        objectGetPrototypeOf(nativeUint8ClampedArrayPrototype) !== typedArrayPrototype &&
        extendPrototype
    ) {
        extendPrototype(nativeUint8ClampedArrayPrototype, typedArrayPrototype);
    }

    // If descriptor support is available and Symbol.toStringTag is not set on typedArrayPrototype.
    if (supportsDescriptors && !hasOwn(typedArrayPrototype, wellKnownSymbol)) {
        isPolyfillRequired = true; // Polyfill is needed.
        defineProperty(typedArrayPrototype, wellKnownSymbol, {
            get: function() {
                return isObject(this) ? this[typedArrayTagSymbol] : undefined;
            },
        });
        // Set the internal tag for each typed array constructor.
        for (const typeName in typedArrayTypes) {
            if (globalObject[typeName]) {
                defineProperty(globalObject[typeName], typedArrayTagSymbol, typeName);
            }
        }
    }

    moduleRef.exports = {
        NATIVE_ARRAY_BUFFER: nativeArrayBuffer,
        NATIVE_ARRAY_BUFFER_VIEWS: nativeArrayBufferViews,
        TYPED_ARRAY_TAG: isPolyfillRequired && typedArrayTagSymbol,

        // Ensures the given value is a typed array.
        aTypedArray: function(value) {
            if (isKnownTypedArrayType(value)) {
                return value;
            }
            throw TypeError("Target is not a typed array");
        },
        // Ensures the given value is a typed array constructor.
        aTypedArrayConstructor: function(constructor) {
            if (extendPrototype) {
                if (Object.prototype.isPrototypeOf.call(typedArrayBasePrototype, constructor)) {
                    return constructor;
                }
            } else {
                // Fallback for no extendPrototype: check against all known constructors.
                for (const typeName in typedArrayTypes) {
                    if (hasOwn(typedArrayTypes, typeName)) {
                        const nativeConstructor = globalObject[typeName];
                        if (constructor === nativeConstructor || Object.prototype.isPrototypeOf.call(nativeConstructor, constructor)) {
                            return constructor;
                        }
                    }
                }
            }
            throw TypeError("Target is not a typed array constructor");
        },

        // Exports a method to TypedArray.prototype.
        exportTypedArrayMethod: function(methodName, implementation, forcePolyfill) {
            if (supportsDescriptors) {
                // If forced, delete existing methods.
                if (forcePolyfill) {
                    for (const typeName in typedArrayTypes) {
                        const Constructor = globalObject[typeName];
                        if (Constructor && hasOwn(Constructor.prototype, methodName)) {
                            delete Constructor.prototype[methodName];
                        }
                    }
                }
                // Define the method on the TypedArray prototype.
                if (!(typedArrayPrototype[methodName] && !forcePolyfill)) {
                    extendObject(typedArrayPrototype, methodName, forcePolyfill ? implementation : (nativeArrayBufferViews && nativeInt8ArrayPrototype[methodName]) || implementation);
                }
            }
        },
        // Exports a static method to TypedArray constructors.
        exportTypedArrayStaticMethod: function(methodName, implementation, forcePolyfill) {
            let Constructor;
            if (supportsDescriptors) {
                // If forced, delete existing static methods.
                if (forcePolyfill) {
                    for (const typeName in typedArrayTypes) {
                        if (hasOwn(typedArrayTypes, typeName) && (Constructor = globalObject[typeName]) && hasOwn(Constructor, methodName)) {
                            delete Constructor[methodName];
                        }
                    }
                }
                // Define the static method on the TypedArray base constructor.
                if (!(typedArrayBasePrototype[methodName] && !forcePolyfill)) {
                    try {
                        extendObject(typedArrayBasePrototype, methodName, forcePolyfill ? implementation : (nativeArrayBufferViews && nativeInt8Array[methodName]) || implementation);
                    } catch (e) {
                        // Fallback for some environments.
                    }
                }
                // Also define on individual constructors.
                for (const typeName in typedArrayTypes) {
                    if (hasOwn(typedArrayTypes, typeName) && (Constructor = globalObject[typeName]) && !Constructor[methodName]) {
                        extendObject(Constructor, methodName, implementation);
                    }
                }
            }
        },

        // Checks if a value is a DataView or a typed array.
        isView: function(value) {
            const classTag = objectGetPrototypeOf(value);
            return classTag === "DataView" || hasOwn(typedArrayTypes, classTag);
        },
        // Checks if a value is a typed array.
        isTypedArray: isKnownTypedArrayType,

        TypedArray: typedArrayBasePrototype,
        TypedArrayPrototype: typedArrayPrototype,

        // Dummy function for registering typed array types (used internally).
        registerTypedArray: function(typeName) {
            // This function intentionally left blank for external use in this clone.
            // Original code likely used it for internal registry.
        }
    };
},
/* 35 */
function(moduleRef, moduleExports, localRequire) {
    const mapConstructor = localRequire(92); // Map constructor.
    const sharedGlobal = localRequire(100); // Shared global object.
    const createObject = localRequire(27); // Object.create.
    const isObject = localRequire(9); // Check if value is an object.

    // Store for all metadata.
    const metadataStore = sharedGlobal.store || (sharedGlobal.store = new mapConstructor());

    /**
     * Gets or creates a Map for a given target and property.
     * @param {object} target - The object whose metadata is being accessed.
     * @param {string|symbol} property - The property key (e.g., method name).
     * @param {boolean} [createIfMissing=false] - If true, creates the map if it doesn't exist.
     * @returns {Map|undefined} The metadata Map or undefined.
     */
    const getTargetPropertyMetadataMap = function(target, property, createIfMissing) {
        let targetMetadataMap = metadataStore.get(target);
        if (!targetMetadataMap) {
            if (!createIfMissing) return undefined;
            metadataStore.set(target, targetMetadataMap = new mapConstructor());
        }
        let propertyMetadataMap = targetMetadataMap.get(property);
        if (!propertyMetadataMap) {
            if (!createIfMissing) return undefined;
            targetMetadataMap.set(property, propertyMetadataMap = new mapConstructor());
        }
        return propertyMetadataMap;
    };

    moduleRef.exports = {
        store: metadataStore,
        getMap: getTargetPropertyMetadataMap,
        // Checks if metadata exists.
        has: function(key, target, property) {
            const map = getTargetPropertyMetadataMap(target, property, false);
            return map !== undefined && map.has(key);
        },
        // Gets metadata.
        get: function(key, target, property) {
            const map = getTargetPropertyMetadataMap(target, property, false);
            return map === undefined ? undefined : map.get(key);
        },
        // Sets metadata.
        set: function(key, value, target, property) {
            getTargetPropertyMetadataMap(target, property, true).set(key, value);
        },
        // Gets all metadata keys for a target and property.
        keys: function(target, property) {
            const map = getTargetPropertyMetadataMap(target, property, false);
            const keys = [];
            if (map) {
                map.forEach(function(value, key) {
                    keys.push(key);
                });
            }
            return keys;
        },
        // Converts a value to a metadata key.
        toKey: function(value) {
            return value === undefined || typeof value === "symbol" ? value : String(value);
        },
    };
},
/* 36 */
function(moduleRef, moduleExports, localRequire) {
    const defineProperty = localRequire(20); // Helper for Object.defineProperty
    moduleRef.exports = function(target, properties, options) {
        for (const key in properties) {
            defineProperty(target, key, properties[key], options);
        }
        return target;
    };
},
/* 37 */
function(moduleRef, moduleExports, localRequire) {
    const isPure = localRequire(2);
    const setIterator = localRequire(57); // Get Set iterator (pure or native)

    moduleRef.exports = isPure ? setIterator : function(setInstance) {
        return Set.prototype.values.call(setInstance);
    };
},
/* 38 */
function(moduleRef, moduleExports, localRequire) {
    const getOwnPropertyNames = localRequire(106); // Get property names helper
    const blockedKeys = localRequire(82).concat("length", "prototype"); // Keys to ignore

    // Export the function to get property names, filtering out certain keys.
    moduleRef.exports = {
        f: Object.getOwnPropertyNames || function(object) {
            return getOwnPropertyNames(object, blockedKeys);
        },
    };
},
/* 39 */
function(moduleRef, moduleExports, localRequire) {
    const toPropertyKey = localRequire(31);
    const objectDefineProperty = localRequire(10); // Object.defineProperty.f
    const createPropertyDescriptor = localRequire(30); // Property descriptor factory

    moduleRef.exports = function(target, property, value) {
        const key = toPropertyKey(property);
        // If the key already exists on the target, use objectDefineProperty to set it.
        // Otherwise, directly assign the value.
        if (key in target) {
            objectDefineProperty.f(target, key, createPropertyDescriptor(0, value));
        } else {
            target[key] = value;
        }
    };
},
/* 40 */
function(moduleRef, moduleExports, localRequire) {
    const wellKnownSymbol = localRequire(7)("unscopables"); // Symbol.unscopables
    const objectCreate = localRequire(27); // Object.create
    const arrayPrototype = Array.prototype;

    // If Array.prototype[Symbol.unscopables] is null or undefined, initialize it.
    if (arrayPrototype[wellKnownSymbol] == null) {
        objectDefineProperty(arrayPrototype, wellKnownSymbol, objectCreate(null));
    }

    /**
     * Adds a property to Array.prototype[Symbol.unscopables].
     * This makes the property's name not be looked up in the 'with' statement scope.
     * @param {string} propertyName - The name of the property to add.
     */
    moduleRef.exports = function(propertyName) {
        arrayPrototype[wellKnownSymbol][propertyName] = true;
    };
},
/* 41 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const isObject = localRequire(9);
    const setPrototypeOf = Object.setPrototypeOf; // Get native Object.setPrototypeOf

    moduleRef.exports =
        setPrototypeOf ||
        // Polyfill for Object.setPrototypeOf.
        ("__proto__" in {} ?
            (function() {
                let testObject;
                let prototypeSetSuccess = false;
                try {
                    // Test if __proto__ can be used to set prototype on an array.
                    (testObject = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set).call([], []);
                    prototypeSetSuccess = testObject instanceof Array;
                } catch (error) {
                    // Error occurred, __proto__ is not reliable.
                }
                return function(object, prototype) {
                    ensureObject(object);
                    localRequire(116)(prototype); // Ensure prototype is valid.
                    if (prototypeSetSuccess) {
                        testObject.call(object, prototype);
                    } else {
                        object.__proto__ = prototype; // Fallback to direct __proto__ assignment.
                    }
                    return object;
                };
            })() :
            undefined); // If __proto__ not in {}, no polyfill.
},
/* 42 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const getBuiltIn = localRequire(12);
    const defineProperty = localRequire(10); // Object.defineProperty.f
    const wellKnownSymbol = localRequire(7)("species"); // Symbol.species
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support

    /**
     * Defines `Symbol.species` on a constructor if it's not already present.
     * `Symbol.species` allows subclasses to define their preferred constructor
     * for methods that return new instances (e.g., `Array.prototype.map`).
     * @param {function} constructor - The constructor function.
     */
    moduleRef.exports = function(constructor) {
        const nativeConstructor = getBuiltIn(constructor);
        if (supportsDescriptors && nativeConstructor && !nativeConstructor[wellKnownSymbol]) {
            defineProperty.f(nativeConstructor, wellKnownSymbol, {
                configurable: true,
                get: function() {
                    return this; // Return the constructor itself as the species.
                },
            });
        }
    };
},
/* 43 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureObject = localRequire(1);

    // Returns the flags of a RegExp object as a string.
    moduleRef.exports = function() {
        const regex = ensureObject(this);
        let flags = "";
        if (regex.global) flags += "g";
        if (regex.ignoreCase) flags += "i";
        if (regex.multiline) flags += "m";
        if (regex.dotAll) flags += "s";
        if (regex.unicode) flags += "u";
        if (regex.sticky) flags += "y";
        return flags;
    };
},
/* 44 */
function(moduleRef, moduleExports, localRequire) {
    let counter = 0;
    const mathRandom = Math.random;

    /**
     * Generates a unique string identifier.
     * @param {string} [description] - An optional description to include in the ID.
     * @returns {string} A unique string ID.
     */
    moduleRef.exports = function(description) {
        // Increment a global counter and combine with a random number for uniqueness.
        return (
            "Symbol(" +
            String(description === undefined ? "" : description) +
            ")_" +
            (++counter + mathRandom).toString(36)
        );
    };
},
/* 45 */
function(moduleRef, moduleExports, localRequire) {
    // This module exports an empty object, often used as a registry for well-known symbols
    // or internal properties that should not be iterated.
    moduleRef.exports = {};
},
/* 46 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);
    const getObjectClass = localRequire(26); // Object.prototype.toString
    moduleRef.exports =
        Array.isArray ||
        function(value) {
            return getObjectClass(value) == "Array";
        };
},
/* 47 */
function(moduleRef, moduleExports, localRequire) {
    const bindCallable = localRequire(13);
    const indexedObject = localRequire(77);
    const toObject = localRequire(15);
    const toLength = localRequire(11);
    const arrayPush = [].push;
    const arraySpeciesCreate = localRequire(48);

    /**
     * Factory function for various Array iteration methods (forEach, map, filter, some, every, find, findIndex).
     * @param {number} mode - The mode of iteration:
     *   0 = forEach (no return)
     *   1 = map (returns new array)
     *   2 = filter (returns new array with filtered elements)
     *   3 = some (returns true if any element passes test)
     *   4 = every (returns true if all elements pass test)
     *   5 = find (returns the first element that passes test)
     *   6 = findIndex (returns the index of the first element that passes test)
     * @returns {function} The array iteration method.
     */
    const createIteratorMethod = function(mode) {
        const isMap = mode == 1;
        const isFilter = mode == 2;
        const isSome = mode == 3;
        const isEvery = mode == 4;
        const isFind = mode == 5;
        const isFindIndex = mode == 6;
        const isPredicated = isSome || isEvery || isFind || isFindIndex;
        const isNonMutating = isMap || isFilter || isPredicated;

        return function(collection, callback, context, ...rest) {
            const object = toObject(collection);
            const indexed = indexedObject(object);
            const length = toLength(indexed.length);
            const boundCallback = bindCallable(callback, context, 3); // Callback receives (value, index, collection)
            let index = 0;
            const result = isMap ?
                arraySpeciesCreate(collection, length) :
                isFilter ?
                arraySpeciesCreate(collection, 0) :
                undefined;

            let currentItem;
            let callbackResult;

            while (length > index) {
                if (index in indexed) {
                    currentItem = indexed[index];
                    callbackResult = boundCallback(currentItem, index, object);

                    if (mode === 0) { // forEach
                        // No specific action, just execute callback.
                    } else if (isMap) { // map
                        result[index] = callbackResult;
                    } else if (isFilter) { // filter
                        if (callbackResult) {
                            arrayPush.call(result, currentItem);
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
                            return currentItem;
                        }
                    } else if (isFindIndex) { // findIndex
                        if (callbackResult) {
                            return index;
                        }
                    }
                }
                index++;
            }

            // Return values based on mode.
            if (isFindIndex) return -1;
            if (isEvery) return true;
            if (isSome) return false;
            return result;
        };
    };

    moduleRef.exports = {
        forEach: createIteratorMethod(0),
        map: createIteratorMethod(1),
        filter: createIteratorMethod(2),
        some: createIteratorMethod(3),
        every: createIteratorMethod(4),
        find: createIteratorMethod(5),
        findIndex: createIteratorMethod(6),
    };
},
/* 48 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);
    const isArray = localRequire(46);
    const wellKnownSymbol = localRequire(7)("species");

    /**
     * Creates a new Array instance using the species constructor of the original array.
     * This ensures that methods like `map` and `filter` return instances of the correct subclass.
     * @param {Array} originalArray - The original array instance.
     * @param {number} length - The desired length of the new array.
     * @returns {Array} A new array instance.
     */
    moduleRef.exports = function(originalArray, length) {
        let constructor;
        // Check if the original array is an actual Array.
        if (isArray(originalArray)) {
            constructor = originalArray.constructor;
            // If the constructor is not Array, and it's not a subclass that explicitly defines Symbol.species,
            // then check for Symbol.species.
            if (
                typeof constructor === "function" &&
                constructor !== Array &&
                !isArray(constructor.prototype)
            ) {
                if (isObject(constructor) && constructor === null) {
                    constructor = undefined; // Null species means use default Array.
                } else {
                    constructor = constructor[wellKnownSymbol]; // Get the species constructor.
                }
            } else {
                constructor = undefined; // Use default Array if no special species handling.
            }
        }
        // If no species constructor is found, use Array directly.
        // Otherwise, use the determined constructor.
        return new(constructor === undefined ? Array : constructor)(length === 0 ? 0 : length);
    };
},
/* 49 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const wellKnownSymbol = localRequire(7)("species"); // Symbol.species

    /**
     * Checks if a native Array method is broken due to incorrect species handling.
     * @param {string} methodName - The name of the array method (e.g., "map", "filter").
     * @returns {boolean} True if the method is broken, false otherwise.
     */
    moduleRef.exports = function(methodName) {
        // Test if the current environment's Array implementation correctly handles Symbol.species.
        // This is done by creating a custom Array subclass with a modified `@@species` property
        // and checking if the native method uses it.
        return (
            localRequire(85) >= 51 ||
            !isError(function() {
                const customArray = [];
                // Define a custom constructor with a `@@species` that returns an object with `foo: 1`.
                (customArray.constructor = {})[wellKnownSymbol] = function() {
                    return {
                        foo: 1
                    };
                };
                // If the native method (e.g., `map`) doesn't return an instance of our custom species,
                // it means the species handling is broken.
                return customArray[methodName](Boolean).foo !== 1;
            })
        );
    };
},
/* 50 */
function(moduleRef, moduleExports, localRequire) {
    // This module exports an empty object.
    // It's typically used as a registry for built-in iterators or other internal mappings.
    moduleRef.exports = {};
},
/* 51 */
function(moduleRef, moduleExports, localRequire) {
    const objectGetPrototypeOf = localRequire(52); // Get object's prototype's class tag
    const wellKnownSymbol = localRequire(7)("iterator"); // Symbol.iterator

    /**
     * Gets the iterator method for an iterable object.
     * It first checks for `Symbol.iterator`, then `@@iterator`, then a fallback based on the object's class tag.
     * @param {*} value - The value to get the iterator for.
     * @returns {function|undefined} The iterator method, or undefined if not iterable.
     */
    moduleRef.exports = function(value) {
        if (value != null) {
            return (
                value[wellKnownSymbol] ||
                value["@@iterator"] ||
                localRequire(50)[objectGetPrototypeOf(value)]
            );
        }
        return undefined;
    };
},
/* 52 */
function(moduleRef, moduleExports, localRequire) {
    const objectGetPrototype = localRequire(88); // Get prototype's class tag
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const wellKnownSymbol = localRequire(7)("toStringTag"); // Symbol.toStringTag

    const isArguments = getObjectClass(function() {
        return arguments;
    }) == "Arguments";

    moduleRef.exports = objectGetPrototype ?
        getObjectClass :
        function(value) {
            let tag;
            // Handle null and undefined values.
            if (value === undefined) {
                return "Undefined";
            }
            if (value === null) {
                return "Null";
            }

            // Try to get Symbol.toStringTag first.
            tag = (function(obj, key) {
                try {
                    return obj[key];
                } catch (e) {
                    // Fallback if property access throws error.
                }
            })(Object(value), wellKnownSymbol);

            if (typeof tag === "string") {
                return tag;
            }
            // Fallback for Arguments object.
            if (isArguments) {
                return getObjectClass(value);
            }
            // Generic Object.prototype.toString.
            tag = getObjectClass(value);
            return tag == "Object" && typeof value.callee == "function" ?
                "Arguments" :
                tag;
        };
},
/* 53 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const iteratorPrototype = localRequire(114).IteratorPrototype;
    const objectCreate = localRequire(27); // Object.create
    const createPropertyDescriptor = localRequire(30); // Property descriptor factory
    const setToStringTag = localRequire(28); // Set Symbol.toStringTag
    const iteratorRegistry = localRequire(50); // Iterator registry

    // Default 'next' method for iterators.
    const defaultIteratorNext = function() {
        return this;
    };

    /**
     * Creates an iterator constructor and sets up its prototype chain.
     * @param {function} IteratorConstructor - The constructor function for the iterator.
     * @param {string} className - The name of the iterator class (for Symbol.toStringTag).
     * @param {function} nextMethod - The 'next' method implementation for the iterator.
     * @returns {function} The IteratorConstructor.
     */
    moduleRef.exports = function(IteratorConstructor, className, nextMethod) {
        // Set the prototype of the IteratorConstructor to an object inheriting from IteratorPrototype.
        IteratorConstructor.prototype = objectCreate(iteratorPrototype, {
            next: createPropertyDescriptor(1, nextMethod),
        });
        // Set Symbol.toStringTag for the iterator.
        setToStringTag(IteratorConstructor, className, false, true);
        // Register the iterator in the global iterator registry.
        iteratorRegistry[className] = defaultIteratorNext;
        return IteratorConstructor;
    };
},
/* 54 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureFunction = localRequire(4);

    /**
     * Creates a deferred Promise, returning an object with the promise itself,
     * and its resolve and reject functions.
     * @param {function} PromiseConstructor - The Promise constructor to use.
     * @returns {{promise: Promise, resolve: function, reject: function}} The deferred object.
     */
    const createDeferredPromise = function(PromiseConstructor) {
        let resolveFn, rejectFn;
        const promise = new PromiseConstructor(function(resolve, reject) {
            // Ensure resolve/reject are only assigned once.
            if (resolveFn !== undefined || rejectFn !== undefined) {
                throw TypeError("Bad Promise constructor");
            }
            resolveFn = resolve;
            rejectFn = reject;
        });
        // Ensure resolve/reject are functions.
        return {
            promise: promise,
            resolve: ensureFunction(resolveFn),
            reject: ensureFunction(rejectFn)
        };
    };

    moduleRef.exports = {
        f: createDeferredPromise
    };
},
/* 55 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const wellKnownSymbol = localRequire(7)("match"); // Symbol.match

    /**
     * Checks if a value is a RegExp object or an object that behaves like one (has Symbol.match).
     * @param {*} value - The value to check.
     * @returns {boolean} True if it's a RegExp-like object, false otherwise.
     */
    moduleRef.exports = function(value) {
        if (!isObject(value)) {
            return false;
        }
        let matchSymbol = value[wellKnownSymbol];
        // If Symbol.match exists, use its boolean value.
        // Otherwise, check if its [[Class]] is "RegExp".
        return matchSymbol !== undefined ? !!matchSymbol : getObjectClass(value) == "RegExp";
    };
},
/* 56 */
function(moduleRef, moduleExports, localRequire) {
    const toInteger = localRequire(24);
    const requireObjectCoercible = localRequire(17);

    /**
     * Creates a function to get a character or its code point from a string at a given position.
     * @param {boolean} getChar - If true, returns the character; if false, returns the code point.
     * @returns {function} The character/code point retrieval function.
     */
    const createStringAccessor = function(getChar) {
        return function(targetString, position) {
            const stringValue = String(requireObjectCoercible(targetString));
            const integerPosition = toInteger(position);
            const stringLength = stringValue.length;

            // Handle out-of-bounds positions.
            if (integerPosition < 0 || integerPosition >= stringLength) {
                return getChar ? "" : undefined;
            }

            const charCode = stringValue.charCodeAt(integerPosition);
            // Handle surrogate pairs for Unicode characters.
            if (
                charCode < 0xd800 || // Not a leading surrogate
                charCode > 0xdbff || // Not a leading surrogate
                integerPosition + 1 === stringLength || // Last character
                (stringValue.charCodeAt(integerPosition + 1) < 0xdc00 || stringValue.charCodeAt(integerPosition + 1) > 0xdfff) // Not a trailing surrogate
            ) {
                return getChar ? stringValue.charAt(integerPosition) : charCode;
            }

            // If it's a surrogate pair.
            const trailingSurrogate = stringValue.charCodeAt(integerPosition + 1);
            return getChar ?
                stringValue.slice(integerPosition, integerPosition + 2) :
                trailingSurrogate - 0xdc00 + ((charCode - 0xd800) << 10) + 0x10000;
        };
    };

    moduleRef.exports = {
        codeAt: createStringAccessor(false),
        charAt: createStringAccessor(true),
    };
},
/* 57 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const getIteratorMethod = localRequire(51);

    /**
     * Returns an iterator for a given iterable object.
     * Throws an error if the object is not iterable.
     * @param {*} iterable - The object to get an iterator for.
     * @returns {Iterator} The iterator object.
     */
    moduleRef.exports = function(iterable) {
        const iterator = getIteratorMethod(iterable);
        if (typeof iterator !== "function") {
            throw TypeError(String(iterable) + " is not iterable");
        }
        return ensureObject(iterator.call(iterable));
    };
},
/* 58 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const nativePropertyIsEnumerable = {}.propertyIsEnumerable;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // Check for a bug in IE that causes propertyIsEnumerable to fail for non-enumerable properties.
    const ieBug = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
        1: 2
    }, 1);

    moduleRef.exports = {
        f: ieBug ?
            function(property) {
                const descriptor = getOwnPropertyDescriptor(this, property);
                return !!descriptor && descriptor.enumerable;
            } :
            nativePropertyIsEnumerable,
    };
},
/* 59 */
function(moduleRef, moduleExports, localRequire) {
    const sharedData = localRequire(60); // Access shared global data
    const uidGenerator = localRequire(44); // Generate unique IDs

    const uniqueKeyRegistry = sharedData("keys"); // Get or create unique key registry

    /**
     * Generates a unique string key, or retrieves an existing one from a registry.
     * This is useful for creating "private" properties on objects without Symbol support.
     * @param {string} keyName - The base name for the key.
     * @returns {string} A unique string key.
     */
    moduleRef.exports = function(keyName) {
        return uniqueKeyRegistry[keyName] || (uniqueKeyRegistry[keyName] = uidGenerator(keyName));
    };
},
/* 60 */
function(moduleRef, moduleExports, localRequire) {
    const isPure = localRequire(2);
    const sharedGlobal = localRequire(102); // Get or create shared global object

    /**
     * Accesses or creates a shared global object, optionally initializing it.
     * This is used to store data that needs to persist across different modules
     * or even different versions of the library in a global-like scope.
     * @param {string} key - The key for the shared data.
     * @param {*} [defaultValue] - The default value to set if the key doesn't exist.
     * @returns {*} The shared data.
     */
    const getSharedData = (key, defaultValue) => {
        return sharedGlobal[key] || (sharedGlobal[key] = defaultValue !== undefined ? defaultValue : {});
    };

    // Store version information.
    getSharedData("versions", []).push({
        version: "3.4.8", // Current library version.
        mode: isPure ? "pure" : "global", // Mode of the library.
        copyright: "© 2019 Denis Pushkarev (zloirock.ru)",
    });

    moduleRef.exports = getSharedData;
},
/* 61 */
function(moduleRef, moduleExports, localRequire) {
    const toObject = localRequire(25);
    const toLength = localRequire(11);
    const toAbsoluteIndex = localRequire(62); // Clamp index to array bounds

    /**
     * Creates a function to check for the inclusion of an element in an array-like object.
     * @param {boolean} isStrict - If true, use strict equality (===); otherwise, use loose equality.
     * @returns {function} The inclusion checking function.
     */
    const createIncludesIndex = function(isStrict) {
        return function(collection, searchElement, fromIndex) {
            const object = toObject(collection);
            const length = toLength(object.length);
            let index = toAbsoluteIndex(fromIndex, length);
            let currentItem;

            // Iterate from the calculated index to the end.
            if (isStrict) {
                while (length > index) {
                    currentItem = object[index++];
                    if (currentItem === searchElement) {
                        return true;
                    }
                }
            } else {
                // Loose equality (NaN === NaN is false, so handle NaN specifically).
                while (length > index) {
                    currentItem = object[index++];
                    if (currentItem == searchElement || (currentItem !== currentItem && searchElement !== searchElement)) {
                        return true;
                    }
                }
            }
            return false;
        };
    };

    moduleRef.exports = {
        includes: createIncludesIndex(true), // Strict inclusion
        indexOf: createIncludesIndex(false), // Loose inclusion
    };
},
/* 62 */
function(moduleRef, moduleExports, localRequire) {
    const toInteger = localRequire(24);
    const mathMax = Math.max;
    const mathMin = Math.min;

    /**
     * Converts an index to an absolute, non-negative index within a given length.
     * Handles negative indices (counting from the end) and clamps to valid bounds.
     * @param {number} index - The raw index.
     * @param {number} length - The length of the collection.
     * @returns {number} The absolute, clamped index.
     */
    moduleRef.exports = function(index, length) {
        const integerIndex = toInteger(index);
        return integerIndex < 0 ? mathMax(integerIndex + length, 0) : mathMin(integerIndex, length);
    };
},
/* 63 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const regexChecker = /#|\.prototype\./; // Regex to detect prototype methods.

    /**
     * Checks if a polyfill for a given feature is forced or if the native implementation is broken.
     * @param {string} path - The path to the feature (e.g., "Array.prototype.map", "Object.assign").
     * @param {object} options - Configuration options for the feature.
     * @returns {boolean} True if the polyfill should be applied, false otherwise.
     */
    const checkFeatureForcing = function(path, options) {
        // Get stored data for the feature.
        const featureData = checkFeatureForcing.data[checkFeatureForcing.normalize(path)];
        // If the feature is marked as 'NATIVE' and not forced, or if it's a function and it doesn't throw.
        return featureData == checkFeatureForcing.NATIVE ?
            !options.forced :
            options.forced || (typeof options.forced === "function" ? isError(options.forced) : !!options.forced);
    };

    /**
     * Normalizes a feature path (e.g., "Array.prototype.map" -> "array.map").
     * @param {string} path - The feature path.
     * @returns {string} The normalized path.
     */
    checkFeatureForcing.normalize = function(path) {
        return String(path).replace(regexChecker, ".").toLowerCase();
    };

    // Store feature data (NATIVE/POLYFILL status).
    checkFeatureForcing.data = {};
    checkFeatureForcing.NATIVE = "N"; // Native implementation is present.
    checkFeatureForcing.POLYFILL = "P"; // Polyfill is being applied.

    moduleRef.exports = checkFeatureForcing;
},
/* 64 */
function(moduleRef, moduleExports, localRequire) {
    const getPropertyNames = localRequire(106); // Get property names helper
    const blockedKeys = localRequire(82); // Keys to ignore

    /**
     * Returns an array of enumerable own property names of an object.
     * This is a polyfill for `Object.keys`.
     * @param {object} object - The object whose enumerable own property names are to be returned.
     * @returns {Array<string>} An array of property names.
     */
    moduleRef.exports =
        Object.keys ||
        function(object) {
            return getPropertyNames(object, blockedKeys);
        };
},
/* 65 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const wellKnownSymbol = localRequire(7)("iterator"); // Symbol.iterator

    let globalIteratorCheck = false;

    // Test if iterators are being used correctly and can be stopped.
    try {
        let iterationCount = 0;
        const testIterable = {
            next: function() {
                return {
                    done: !!iterationCount++
                };
            },
            return: function() {
                globalIteratorCheck = true; // Set flag if return method is called.
            },
        };
        testIterable[wellKnownSymbol] = function() {
            return this;
        };
        Array.from(testIterable, function() {
            throw 2;
        }); // Use Array.from to trigger iteration.
    } catch (error) {
        // Ignore the thrown error, we only care about globalIteratorCheck.
    }

    /**
     * Checks if an iterable is properly implemented and can be iterated without errors.
     * @param {function} testFunction - A function that attempts to iterate over an object.
     * @param {boolean} [allowGlobalCheck=false] - If true, also checks the globalIteratorCheck flag.
     * @returns {boolean} True if the iterable is working correctly, false otherwise.
     */
    moduleRef.exports = function(testFunction, allowGlobalCheck) {
        if (!allowGlobalCheck && !globalIteratorCheck) {
            return false;
        }
        let iterationFailed = false;
        try {
            const tempIterable = {};
            tempIterable[wellKnownSymbol] = function() {
                return {
                    next: function() {
                        return {
                            done: (iterationFailed = true)
                        };
                    },
                };
            };
            testFunction(tempIterable); // Execute the test function.
        } catch (error) {
            // Error indicates a problem with iteration.
        }
        return iterationFailed;
    };
},
/* 66 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0); // Main function to define built-ins
    const globalObject = localRequire(5); // Global object (window, global)
    const featureChecker = localRequire(63); // Check if feature is forced polyfill
    const defineProperty = localRequire(20); // Helper to define properties
    const collectionHelper = localRequire(67); // Collection helper utilities
    const iterateCollection = localRequire(3); // Iterator utility
    const constructorChecker = localRequire(32); // Constructor invocation check
    const isObject = localRequire(9); // Check if value is an object
    const isError = localRequire(6); // Error handling utility
    const defineToStringTag = localRequire(28); // Set Symbol.toStringTag
    const stateManagement = localRequire(16); // Internal state management

    // Get the native constructor (e.g., Map, Set, WeakMap).
    moduleRef.exports = function(collectionName, constructorFactory, collectionSetStrong) {
        const isMap = collectionName.indexOf("Map") !== -1;
        const isWeak = collectionName.indexOf("Weak") !== -1;
        const addMethodName = isMap ? "set" : "add"; // Method to add elements

        const NativeCollection = globalObject[collectionName];
        let CollectionConstructor = NativeCollection;
        const nativeCollectionPrototype = NativeCollection && NativeCollection.prototype;
        const collectionExports = {};

        // Helper to modify native collection methods.
        const modifyMethod = function(methodName) {
            const originalMethod = nativeCollectionPrototype[methodName];
            defineProperty(nativeCollectionPrototype, methodName, isMap ?
                function(key, value) {
                    return originalMethod.call(this, key === 0 ? 0 : key, value);
                } :
                function(value) {
                    return originalMethod.call(this, value === 0 ? 0 : value);
                }
            );
        };

        // Check if the native collection needs polyfilling.
        if (
            featureChecker(
                collectionName,
                typeof NativeCollection !== "function" ||
                !(isWeak || (nativeCollectionPrototype && nativeCollectionPrototype.forEach && !isError(function() {
                    new NativeCollection().entries().next();
                })))
            )
        ) {
            CollectionConstructor = constructorFactory(function(instance, iterable) {
                constructorChecker(instance, CollectionConstructor, collectionName);
                // Initialize internal state using collectionHelper.
                stateManagement.set(instance, {
                    type: collectionName,
                    index: collectionHelper.objectCreate(null), // For fast key lookup
                    first: undefined,
                    last: undefined,
                    size: 0,
                });
                // Initialize size property for non-descriptor environments.
                if (!supportsDescriptors) {
                    instance.size = 0;
                }
                // Populate from iterable if provided.
                if (iterable != null) {
                    iterateCollection(iterable, instance[addMethodName], instance, isMap);
                }
                return instance;
            });
            collectionHelper.REQUIRED = true; // Indicate that collection polyfills are required.
        } else if (featureChecker(collectionName, true)) {
            // Test cases for native collection behavior.
            const testInstance = new CollectionConstructor();
            const addResult = testInstance[addMethodName](isWeak ? {} : -0, 1) != testInstance; // Test chaining
            const hasZero = isError(function() {
                testInstance.has(1);
            }); // Test has method (e.g., for -0)
            const fromIterableTest = collectionHelper.checkConstructorFromIterable(function(iterable) {
                new NativeCollection(iterable);
            }); // Test constructor with iterables
            const hasNegativeZeroBug = !isWeak && isError(function() {
                for (let i = 5; i--;) testInstance[addMethodName](i, i);
                return !testInstance.has(-0);
            }); // Test -0 handling

            // If constructor from iterable is broken or has negative zero bug, fix constructor.
            if (!fromIterableTest || hasNegativeZeroBug) {
                CollectionConstructor = constructorFactory(function(instance, iterable) {
                    constructorChecker(instance, CollectionConstructor, collectionName);
                    const newInstance = iterateCollection(
                        new NativeCollection(),
                        instance[addMethodName],
                        instance,
                        isMap
                    );
                    return newInstance;
                });
                CollectionConstructor.prototype = nativeCollectionPrototype; // Maintain prototype chain.
                nativeCollectionPrototype.constructor = CollectionConstructor; // Fix constructor link.
            }

            // Fix delete, has, get, add/set methods if they have bugs.
            if (hasZero || hasNegativeZeroBug) {
                modifyMethod("delete");
                modifyMethod("has");
                if (isMap) modifyMethod("get");
            }
            if (hasNegativeZeroBug || addResult) {
                modifyMethod(addMethodName);
            }
            // If it's a Weak collection and clear method exists, delete it (not part of spec).
            if (isWeak && nativeCollectionPrototype.clear) {
                delete nativeCollectionPrototype.clear;
            }
        }

        // Export the constructor.
        collectionExports[collectionName] = CollectionConstructor;
        defineBuiltin({
            global: true,
            forced: CollectionConstructor !== NativeCollection
        }, collectionExports);

        // Set Symbol.toStringTag for the collection.
        defineToStringTag(CollectionConstructor, collectionName);

        // If not a Weak collection, set up strong iteration methods.
        if (!isWeak) {
            collectionSetStrong(CollectionConstructor, collectionName, isMap);
        }

        return CollectionConstructor;
    };
},
/* 67 */
function(moduleRef, moduleExports, localRequire) {
    const registry = localRequire(45); // Internal registry for symbols
    const isObject = localRequire(9); // Check if value is an object
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const defineProperty = localRequire(10).f; // Object.defineProperty.f
    const uidGenerator = localRequire(44); // Generate unique IDs
    const objectIsExtensible = Object.isExtensible; // Native Object.isExtensible
    const supportsObjectIsExtensible = objectIsExtensible && !localRequire(117); // Check if Object.isExtensible works reliably.

    let objectIdCounter = 0; // Counter for unique object IDs.

    // Helper to assign a unique metadata object to an extensible object.
    const assignMetadata = function(object) {
        defineProperty(object, uidGenerator("meta"), {
            value: {
                objectID: "O" + ++objectIdCounter, // Unique ID for the object.
                weakData: {}, // Storage for weak map/set data.
            },
        });
    };

    moduleRef.exports = {
        REQUIRED: false, // Flag indicating if polyfills are required.

        /**
         * Generates a unique key for an object, or retrieves an existing one.
         * Used for fast lookups in collections.
         * @param {*} object - The object to get a key for.
         * @param {boolean} [createIfMissing=false] - If true, creates a key if none exists.
         * @returns {string|symbol} The unique key.
         */
        fastKey: function(object, createIfMissing) {
            // If not an object, return as is (symbols are their own keys).
            if (!isObject(object)) {
                return typeof object === "symbol" ? object : ("string" == typeof object ? "S" : "P") + object;
            }
            // If object cannot be extended, return "F" (frozen).
            if (!supportsObjectIsExtensible && !objectIsExtensible(object)) {
                return "F";
            }
            // If metadata already exists, return its objectID.
            if (hasOwn(object, uidGenerator("meta"))) { // Using generated string 'meta'
                return object[uidGenerator("meta")].objectID;
            }
            // If createIfMissing is false, return "E" (extensible but no ID yet).
            if (!createIfMissing) {
                return "E";
            }
            // Assign metadata and return its objectID.
            assignMetadata(object);
            return object[uidGenerator("meta")].objectID;
        },

        /**
         * Retrieves the weak data associated with an object.
         * @param {object} object - The object to retrieve weak data from.
         * @param {boolean} [createIfMissing=false] - If true, creates weak data if none exists.
         * @returns {object|boolean} The weak data object, or true/false if object is not extensible.
         */
        getWeakData: function(object, createIfMissing) {
            if (!hasOwn(object, uidGenerator("meta"))) {
                if (!supportsObjectIsExtensible && !objectIsExtensible(object)) {
                    return true; // Indicate object is not extensible.
                }
                if (!createIfMissing) {
                    return false; // No weak data and not creating it.
                }
                assignMetadata(object); // Assign metadata if missing.
            }
            return object[uidGenerator("meta")].weakData;
        },

        // Hook for Object.freeze, ensuring metadata is assigned before freezing.
        onFreeze: function(object) {
            if (supportsObjectIsExtensible && moduleRef.exports.REQUIRED && objectIsExtensible(object) && !hasOwn(object, uidGenerator("meta"))) {
                assignMetadata(object);
            }
            return object;
        },

        // Check if a constructor can be created from an iterable.
        checkConstructorFromIterable: function(constructorFunction) {
            return !localRequire(6)(function() {
                // Try constructing with an iterable.
                new constructorFunction(function() {});
            });
        },

        // Helper to create an object without a prototype.
        objectCreate: Object.create || function(proto) {
            const F = function() {};
            F.prototype = proto;
            return new F();
        },
    };

    // Mark the internal meta key as not enumerable.
    registry[uidGenerator("meta")] = true;
},
/* 68 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const globalObject = localRequire(5);

    // Check if Object.prototype.__defineGetter__ and __defineSetter__ are broken
    // by testing if they can be used to define a property on `null`.
    moduleRef.exports = localRequire(2) || !isError(function() {
        const testValue = Math.random();
        __defineSetter__.call(null, testValue, function() {});
        delete globalObject[testValue];
    });
},
/* 69 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const isError = localRequire(6);

    /**
     * Executes a function and captures any error it throws, returning an object
     * indicating success/failure and the value/error.
     * @param {function} callback - The function to execute.
     * @returns {{error: boolean, value: *}} An object with 'error' flag and 'value'/'error' result.
     */
    moduleRef.exports = function(callback) {
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
/* 70 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineProperty = localRequire(18); // Object.defineProperty helper
    const extendObject = localRequire(20); // Helper to extend objects
    const isError = localRequire(6); // Error handling utility
    const wellKnownSymbol = localRequire(7); // Symbol helper
    const checkRegExp = localRequire(96); // Check if value is a RegExp

    const speciesSymbol = wellKnownSymbol("species");

    /**
     * Defines a RegExp method on String.prototype and RegExp.prototype, handling various compatibility issues.
     * This is used for methods like `String.prototype.replace`, `String.prototype.split`, etc.
     * @param {string} methodName - The name of the method (e.g., "replace", "split").
     * @param {number} argsCount - The expected number of arguments for the method.
     * @param {function} callback - The implementation function for the method.
     * @param {boolean} [force=false] - Whether to force the polyfill even if native is present.
     */
    moduleRef.exports = function(methodName, argsCount, callback, force) {
        // Get Symbol for the method (e.g., Symbol.replace).
        const methodSymbol = wellKnownSymbol(methodName);

        // Check for specific bugs in native implementations.
        const hasReplaceBug = !isError(function() {
            const regExp = /./;
            regExp.exec = function() {
                const arr = [];
                arr.groups = {
                    a: "7"
                };
                return arr;
            };
            return "7" !== "".replace(regExp, "$<a>");
        });

        const hasSplitBug = !isError(function() {
            const regExp = /(?:)/;
            const originalExec = regExp.exec;
            regExp.exec = function() {
                return originalExec.apply(this, arguments);
            };
            const result = "ab".split(regExp);
            return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
        });

        // Check if the method is natively available and if it handles Symbol.species correctly.
        const isNativeMethodValid = !isError(function() {
            const obj = {};
            obj[methodSymbol] = function() {
                return 7;
            };
            return 7 != ""[methodName](obj);
        });

        const isSpeciesCorrect =
            isNativeMethodValid &&
            !isError(function() {
                // Test if the method uses Symbol.species to create new RegExp instances.
                let regexCalled = false;
                const testRegex = {
                    exec: function() {
                        regexCalled = true;
                        return null;
                    },
                };
                testRegex.constructor = {};
                testRegex.constructor[speciesSymbol] = function() {
                    return testRegex;
                };
                // For "split", set flags to empty string to avoid issues.
                if (methodName === "split") {
                    testRegex.flags = "";
                    testRegex[methodSymbol] = /./[methodSymbol];
                }
                ""[methodName](testRegex); // Call the method.
                return !regexCalled;
            });

        // If the native method is valid and doesn't have specific bugs, and not forced, skip polyfill.
        if (
            !isNativeMethodValid ||
            !isSpeciesCorrect ||
            (methodName === "replace" && !hasReplaceBug) ||
            (methodName === "split" && !hasSplitBug) ||
            force
        ) {
            const originalMethod = /./[methodSymbol]; // Original RegExp method.
            const [stringImpl, regExpImpl] = callback(
                methodSymbol,
                ""[methodName],
                function(method, regExp, string, args, useOriginal) {
                    if (regExp.exec === checkRegExp) {
                        // If it's a native RegExp and not forced to use original,
                        // return a wrapped result for RegExp.prototype[methodSymbol].
                        if (isNativeMethodValid && !useOriginal) {
                            return {
                                done: true,
                                value: originalMethod.call(regExp, string, args),
                            };
                        }
                    }
                    // Otherwise, return a normal result.
                    return {
                        done: false
                    };
                }
            );

            // Extend String.prototype with the new implementation.
            extendObject(String.prototype, methodName, stringImpl);
            // Extend RegExp.prototype with the new implementation for Symbol.method.
            extendObject(RegExp.prototype, methodSymbol, argsCount === 2 ?
                function(string, args) {
                    return regExpImpl.call(string, this, args);
                } :
                function(string) {
                    return regExpImpl.call(string, this);
                }
            );
            // If not forced, mark the RegExp method as non-sham.
            if (regExpImpl && !force) {
                defineProperty(RegExp.prototype[methodSymbol], "sham", true);
            }
        }
    };
},
/* 71 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const charAt = localRequire(56).charAt;

    /**
     * Calculates the next index in a string, accounting for Unicode surrogate pairs.
     * @param {string} string - The string.
     * @param {number} index - The current index.
     * @param {boolean} isUnicode - If true, handle Unicode characters (surrogate pairs).
     * @returns {number} The next index.
     */
    moduleRef.exports = function(string, index, isUnicode) {
        return index + (isUnicode ? charAt(string, index).length : 1);
    };
},
/* 72 */
function(moduleRef, moduleExports, localRequire) {
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const nativeRegExpExec = localRequire(96); // Native RegExp.prototype.exec

    /**
     * Executes a RegExp on a string and returns the match result.
     * @param {RegExp} regExp - The RegExp object.
     * @param {string} string - The string to search.
     * @returns {Array|null} The match array or null.
     */
    moduleRef.exports = function(regExp, string) {
        const execMethod = regExp.exec;
        if (typeof execMethod === "function") {
            const result = execMethod.call(regExp, string);
            if (typeof result !== "object") {
                throw TypeError("RegExp exec method returned something other than an Object or null");
            }
            return result;
        }
        // Fallback to native RegExp.prototype.exec if custom exec is not a function.
        if (getObjectClass(regExp) !== "RegExp") {
            throw TypeError("RegExp#exec called on incompatible receiver");
        }
        return nativeRegExpExec.call(regExp, string);
    };
},
/* 73 */
function(moduleRef, moduleExports, localRequire) {
    const requireObjectCoercible = localRequire(17);
    const whitespaceChars = "[" + localRequire(97) + "]"; // Whitespace characters regex.

    const trimStartRegex = RegExp("^" + whitespaceChars + whitespaceChars + "*"); // Regex to trim leading whitespace.
    const trimEndRegex = RegExp(whitespaceChars + whitespaceChars + "*$"); // Regex to trim trailing whitespace.

    /**
     * Creates a function to trim whitespace from a string.
     * @param {number} mode - 1 for trim start, 2 for trim end, 3 for both.
     * @returns {function} The trimming function.
     */
    const createTrimFunction = function(mode) {
        return function(string) {
            let result = String(requireObjectCoercible(string));
            if (mode & 1) {
                result = result.replace(trimStartRegex, "");
            }
            if (mode & 2) {
                result = result.replace(trimEndRegex, "");
            }
            return result;
        };
    };

    moduleRef.exports = {
        start: createTrimFunction(1), // Trim leading whitespace.
        end: createTrimFunction(2), // Trim trailing whitespace.
        trim: createTrimFunction(3), // Trim both leading and trailing whitespace.
    };
},
/* 74 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureObject = localRequire(1);
    const ensureFunction = localRequire(4);

    /**
     * Deletes multiple elements from a collection (Map or Set).
     * @param {...*} keys - The keys or values to delete.
     * @returns {boolean} True if all deletions were successful, false otherwise.
     */
    moduleRef.exports = function() {
        const collection = ensureObject(this);
        const deleteMethod = ensureFunction(collection.delete);
        let allDeletedSuccessfully = true;
        let i = 0;
        const argCount = arguments.length;

        // Iterate through all provided keys/values and attempt to delete them.
        while (i < argCount) {
            const deleted = deleteMethod.call(collection, arguments[i++]);
            allDeletedSuccessfully = allDeletedSuccessfully && deleted;
        }
        return !!allDeletedSuccessfully;
    };
},
/* 75 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureObject = localRequire(1);
    const ensureFunction = localRequire(4);
    const iterateCollection = localRequire(3);

    /**
     * Creates a new Map or Set from an iterable source.
     * @param {Iterable} source - The source iterable (e.g., an array of [key, value] pairs for Map).
     * @param {function} [mapFunction] - An optional mapping function to transform elements.
     * @param {*} [mapContext] - The 'this' context for the mapFunction.
     * @returns {Map|Set} A new Map or Set instance.
     */
    moduleRef.exports = function(source, mapFunction, mapContext) {
        const constructor = ensureFunction(this);
        const hasMapping = mapFunction !== undefined;
        const mappedCallback = hasMapping ? localRequire(13)(mapFunction, mapContext, 2) : undefined;
        const collection = new constructor();
        const addMethod = ensureFunction(collection.add); // For Set
        const setMethod = ensureFunction(collection.set); // For Map

        let index = 0;
        // Iterate over the source and add/set elements to the new collection.
        iterateCollection(
            source,
            function(value) {
                const element = hasMapping ? mappedCallback(value, index++) : value;
                if (setMethod) {
                    setMethod.call(collection, element[0], element[1]);
                } else {
                    addMethod.call(collection, element);
                }
            },
            undefined, // No specific context for iterateCollection
            true // Assume key-value pairs for Map construction
        );
        return collection;
    };
},
/* 76 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureFunction = localRequire(4);

    /**
     * Creates a new Map or Set instance from a variable number of arguments.
     * @param {...*} elements - The elements to add to the new collection.
     * @returns {Map|Set} A new Map or Set instance.
     */
    moduleRef.exports = function() {
        const constructor = ensureFunction(this);
        const argCount = arguments.length;
        const collection = new constructor();
        const addMethod = ensureFunction(collection.add); // For Set
        const setMethod = ensureFunction(collection.set); // For Map

        let i = 0;
        // Add each argument to the collection.
        while (i < argCount) {
            const element = arguments[i++];
            if (setMethod) {
                setMethod.call(collection, element[0], element[1]);
            } else {
                addMethod.call(collection, element);
            }
        }
        return collection;
    };
},
/* 77 */
function(moduleRef, moduleExports, localRequire) {
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const stringSplit = "".split;

    // Check for a bug in `Object("z").propertyIsEnumerable(0)` (IE).
    const ieBug = localRequire(6)(function() {
        return !Object("z").propertyIsEnumerable(0);
    });

    /**
     * Converts a value to an object that can be indexed like an array.
     * Strings are treated as array-like objects.
     * @param {*} value - The value to convert.
     * @returns {object} The indexed object.
     */
    moduleRef.exports = ieBug ?
        function(value) {
            // If it's a string, split it into an array of characters.
            return getObjectClass(value) == "String" ? stringSplit.call(value, "") : Object(value);
        } :
        Object;
},
/* 78 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const isObject = localRequire(9);

    let htmlCreateElement;
    // Check if document and createElement are available in the global object.
    if (isObject(globalObject.document) && isObject(globalObject.document.createElement)) {
        htmlCreateElement = globalObject.document.createElement;
    }

    /**
     * Creates an HTML element.
     * @param {string} tagName - The tag name of the element to create.
     * @returns {HTMLElement|object} The created HTML element or a plain object if DOM is unavailable.
     */
    moduleRef.exports = function(tagName) {
        return htmlCreateElement ? htmlCreateElement(tagName) : {};
    };
},
/* 79 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const defineProperty = localRequire(18); // Object.defineProperty helper

    /**
     * Safely assigns a property to the global object.
     * If Object.defineProperty is available, it uses that; otherwise, it assigns directly.
     * @param {string} property - The name of the property to assign.
     * @param {*} value - The value to assign.
     * @returns {*} The assigned value.
     */
    moduleRef.exports = function(property, value) {
        try {
            defineProperty(globalObject, property, value);
        } catch (error) {
            // Fallback for environments where defineProperty fails (e.g., read-only globals).
            globalObject[property] = value;
        }
        return value;
    };
},
/* 80 */
function(moduleRef, moduleExports, localRequire) {
    const sharedData = localRequire(102); // Shared global object.
    const functionToString = Function.toString; // Native Function.prototype.toString.

    // Cache the source code of functions in the shared global object.
    // This prevents repeated calls to Function.toString for the same function.
    if (typeof sharedData.inspectSource !== "function") {
        sharedData.inspectSource = function(func) {
            return functionToString.call(func);
        };
    }

    moduleRef.exports = sharedData.inspectSource;
},
/* 81 */
function(moduleRef, moduleExports, localRequire) {
    const getBuiltIn = localRequire(12);
    const getOwnPropertyNames = localRequire(38); // Object.getOwnPropertyNames.f
    const getOwnPropertySymbols = localRequire(83); // Object.getOwnPropertySymbols.f
    const ensureObject = localRequire(1);

    /**
     * Returns an array of all own property keys (both string and symbol) of an object.
     * This is a polyfill for `Reflect.ownKeys`.
     * @param {object} object - The object to inspect.
     * @returns {Array<string|symbol>} An array of property keys.
     */
    moduleRef.exports =
        getBuiltIn("Reflect", "ownKeys") ||
        function(object) {
            const stringKeys = getOwnPropertyNames.f(ensureObject(object));
            const symbolKeys = getOwnPropertySymbols.f;
            return symbolKeys ? stringKeys.concat(symbolKeys(object)) : stringKeys;
        };
},
/* 82 */
function(moduleRef, moduleExports, localRequire) {
    // Standard properties of Object.prototype that are often filtered out
    // when enumerating properties of an object.
    moduleRef.exports = [
        "constructor",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "toLocaleString",
        "toString",
        "valueOf",
    ];
},
/* 83 */
function(moduleRef, moduleExports, localRequire) {
    // Export the native Object.getOwnPropertySymbols.
    moduleRef.exports = {
        f: Object.getOwnPropertySymbols,
    };
},
/* 84 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    // Check if Object.getOwnPropertySymbols is available and works without errors.
    moduleRef.exports = !!Object.getOwnPropertySymbols && !isError(function() {
        // String(Symbol()) should not throw an error.
        return !String(Symbol());
    });
},
/* 85 */
function(moduleRef, moduleExports, localRequire) {
    let navigator;
    let browserVersion;
    const globalObject = localRequire(5);
    const userAgent = localRequire(86); // User agent string

    // Detect V8 engine version from process or navigator.
    if (globalObject.process && globalObject.process.versions && globalObject.process.versions.v8) {
        browserVersion = globalObject.process.versions.v8.split(".")[0] + globalObject.process.versions.v8.split(".")[1];
    } else if (userAgent) {
        // Edge (Chromium-based) or Chrome.
        const edgeMatch = userAgent.match(/Edge\/(\d+)/);
        if (edgeMatch && edgeMatch[1] >= 74) {
            browserVersion = userAgent.match(/Chrome\/(\d+)/)[1];
        } else {
            const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
            if (chromeMatch) {
                browserVersion = chromeMatch[1];
            }
        }
    }

    // Convert to number if a version was found.
    moduleRef.exports = browserVersion && +browserVersion;
},
/* 86 */
function(moduleRef, moduleExports, localRequire) {
    const getBuiltIn = localRequire(12);
    // Get the user agent string from navigator.
    moduleRef.exports = getBuiltIn("navigator", "userAgent") || "";
},
/* 87 */
function(moduleRef, moduleExports, localRequire) {
    const wellKnownSymbol = localRequire(7)("iterator"); // Symbol.iterator
    const iteratorRegistry = localRequire(50); // Iterator registry
    const arrayPrototype = Array.prototype;

    /**
     * Checks if a value is an Array or has an Array-like iterator.
     * @param {*} value - The value to check.
     * @returns {boolean} True if it's an Array or has an Array-like iterator, false otherwise.
     */
    moduleRef.exports = function(value) {
        return (
            value !== undefined && // Not null or undefined
            (iteratorRegistry.Array === value || arrayPrototype[wellKnownSymbol] === value)
        );
    };
},
/* 88 */
function(moduleRef, moduleExports, localRequire) {
    const objectGetPrototypeOf = localRequire(6);
    const getObjectClass = localRequire(26); // Object.prototype.toString

    // Check for a bug where Object.prototype.toString returns "[object z]" for an object
    // with Symbol.toStringTag set to "z". This indicates a broken implementation.
    const toStringTagBug = (function() {
        const obj = {};
        obj[localRequire(7)("toStringTag")] = "z";
        return "[object z]" === String(obj);
    })();

    moduleRef.exports = toStringTagBug;
},
/* 89 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const isError = localRequire(6);

    /**
     * Checks if a native Array method is broken because it doesn't correctly handle
     * `this` context or other specifics.
     * @param {string} methodName - The name of the array method (e.g., "indexOf", "forEach").
     * @param {function} [testCallback] - An optional callback to use for the test.
     * @returns {boolean} True if the method is broken, false otherwise.
     */
    moduleRef.exports = function(methodName, testCallback) {
        const nativeMethod = [][methodName];
        return (
            !nativeMethod ||
            !isError(function() {
                // Test by calling the method with a `null` context and a dummy callback.
                nativeMethod.call(null, testCallback || function() {
                    throw 1;
                }, 1);
            })
        );
    };
},
/* 90 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const toObject = localRequire(25);
    const createToStringTagIterator = localRequire(40); // Add to unscopables for 'keys', 'values', 'entries'
    const iteratorRegistry = localRequire(50); // Iterator registry
    const stateManagement = localRequire(16); // Internal state management
    const setState = stateManagement.set; // Set internal state
    const getState = stateManagement.getterFor("Array Iterator"); // Get state for Array Iterator

    // Create an iterator factory for Arrays.
    moduleRef.exports = localRequire(91)(
        Array,
        "Array",
        function(collection, kind) {
            setState(this, {
                type: "Array Iterator",
                target: toObject(collection),
                index: 0,
                kind: kind,
            });
        },
        function() {
            const state = getState(this);
            const target = state.target;
            const kind = state.kind;
            const index = state.index++;

            // If iteration is complete or target is null, set target to undefined and return done.
            if (!target || index >= target.length) {
                state.target = undefined;
                return {
                    value: undefined,
                    done: true
                };
            }

            // Return value based on kind ("keys", "values", "entries").
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
            }; // "entries"
        },
        "values"
    );

    // Aliases for Arguments object.
    iteratorRegistry.Arguments = iteratorRegistry.Array;

    // Add iterator methods to Symbol.unscopables.
    createToStringTagIterator("keys");
    createToStringTagIterator("values");
    createToStringTagIterator("entries");
},
/* 91 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0); // Main function to define built-ins
    const globalObject = localRequire(53); // Create iterator constructor
    const objectGetPrototypeOf = localRequire(22); // Get prototype of object
    const extendPrototype = localRequire(41); // Set prototype of an object
    const defineToStringTag = localRequire(28); // Set Symbol.toStringTag
    const defineProperty = localRequire(18); // Helper to define properties
    const wellKnownSymbol = localRequire(7)("iterator"); // Symbol.iterator
    const isPure = localRequire(2); // Check if pure (non-standard) module
    const iteratorRegistry = localRequire(50); // Iterator registry
    const iteratorPrototype = localRequire(114).IteratorPrototype;
    const safariBug = localRequire(114).BUGGY_SAFARI_ITERATORS; // Safari iterator bug check

    // Default 'next' method for iterators.
    const defaultIteratorNext = function() {
        return this;
    };

    /**
     * Creates an iterator for a given collection type.
     * @param {object} collectionType - The constructor function for the collection (e.g., Array, String).
     * @param {string} className - The name of the collection class (for Symbol.toStringTag).
     * @param {function} iteratorFactory - A function that creates an iterator instance.
     * @param {function} nextMethod - The 'next' method implementation for the iterator.
     * @param {string} defaultKind - The default kind of iteration ("keys", "values", "entries").
     * @param {boolean} [isEntries=false] - If true, the defaultKind is "entries".
     * @param {boolean} [isForced=false] - If true, force the polyfill even if native exists.
     * @returns {object} An object containing iterator methods.
     */
    moduleRef.exports = function(
        collectionType,
        className,
        iteratorFactory,
        nextMethod,
        defaultKind,
        isEntries,
        isForced
    ) {
        // Create the iterator constructor.
        const IteratorConstructor = globalObject(iteratorFactory, className, nextMethod);

        let collectionPrototype = collectionType.prototype;
        let iteratorProperty = collectionPrototype[wellKnownSymbol] || collectionPrototype["@@iterator"];
        let nativeIterator = defaultKind && iteratorProperty;
        let nativeIteratorPrototype =
            !safariBug && nativeIterator && objectGetPrototypeOf(nativeIterator.call(new collectionType()));

        // Helper to get the iterator method for a specific kind.
        const getIteratorForKind = function(kind) {
            if (kind === defaultKind && nativeIterator) {
                return nativeIterator; // Use native iterator if it matches default kind.
            }
            if (!safariBug && kind in collectionPrototype) {
                return collectionPrototype[kind]; // Use native method if available.
            }
            // Fallback: return a function that creates an iterator for the specified kind.
            return function() {
                return new IteratorConstructor(this, kind);
            };
        };

        // If nativeIteratorPrototype exists and is not Object.prototype, and next method is available.
        if (
            nativeIteratorPrototype &&
            nativeIteratorPrototype.next &&
            objectGetPrototypeOf(nativeIteratorPrototype) !== Object.prototype
        ) {
            // If not pure mode, and prototype chain is not correct, fix it.
            if (!isPure && objectGetPrototypeOf(nativeIteratorPrototype) !== iteratorPrototype) {
                if (extendPrototype) {
                    extendPrototype(nativeIteratorPrototype, iteratorPrototype);
                } else {
                    defineProperty(nativeIteratorPrototype, wellKnownSymbol, defaultIteratorNext);
                }
            }
            // Set Symbol.toStringTag for the native iterator prototype.
            defineToStringTag(nativeIteratorPrototype, className + " Iterator", true, true);
            iteratorRegistry[className + " Iterator"] = defaultIteratorNext; // Register in global iterator registry.
        }

        // If 'values' is the default kind, and nativeIterator exists but its name is not 'values',
        // then consider the native iterator as potentially buggy and polyfill it.
        if (
            defaultKind === "values" &&
            nativeIterator &&
            nativeIterator.name !== "values" &&
            nativeIterator.name !== "next"
        ) {
            isForced = true;
            nativeIterator = function() {
                return nativeIterator.call(this);
            };
        }

        // If not pure mode, and no native iterator, or if forced, define the iterator on the prototype.
        if ((!isPure || isForced) && collectionPrototype[wellKnownSymbol] !== nativeIterator) {
            defineProperty(collectionPrototype, wellKnownSymbol, nativeIterator);
        }
        iteratorRegistry[className] = nativeIterator; // Register in global iterator registry.

        // If defaultKind is specified, define the specific iterator methods.
        if (defaultKind) {
            const iteratorMethods = {
                values: getIteratorForKind("values"),
                keys: isEntries ? nativeIterator : getIteratorForKind("keys"),
                entries: getIteratorForKind("entries"),
            };

            // If isForced, or if methods are missing, extend the prototype with these.
            if (isForced) {
                for (const key in iteratorMethods) {
                    if (
                        !(
                            !safariBug &&
                            !isForced &&
                            key in collectionPrototype &&
                            (!(key === "values" && defaultKind === "values") || nativeIterator)
                        )
                    ) {
                        extendObject(collectionPrototype, key, iteratorMethods[key]);
                    }
                }
            } else {
                defineBuiltin({
                    target: className,
                    proto: true,
                    forced: safariBug || isForced
                }, iteratorMethods);
            }
        }

        return iteratorMethods;
    };
},
/* 92 */
function(moduleRef, moduleExports, localRequire) {
    const defineBuiltin = localRequire(0);
    const collectionConstructor = localRequire(66); // Generic collection constructor (Map, Set, WeakMap, WeakSet)
    const mapCollectionSetStrong = localRequire(118); // Strong collection helpers for Map

    // Define the Map constructor.
    moduleRef.exports = collectionConstructor(
        "Map",
        function(initCallback) {
            return function() {
                return initCallback(this, arguments.length ? arguments[0] : undefined);
            };
        },
        mapCollectionSetStrong
    );
},
/* 93 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);
    const setPrototypeOf = localRequire(41); // Object.setPrototypeOf

    /**
     * Sets the prototype of an object, if Object.setPrototypeOf is available.
     * This is used to maintain correct inheritance chains for polyfilled classes.
     * @param {object} object - The object whose prototype is to be set.
     * @param {object} prototype - The new prototype object.
     * @param {function} constructor - The constructor function for the object.
     * @returns {object} The modified object.
     */
    moduleRef.exports = function(object, prototype, constructor) {
        // If setPrototypeOf is available, and the prototype is different from the constructor's prototype,
        // and the prototype itself is an object, then set the prototype.
        if (
            setPrototypeOf &&
            typeof constructor === "function" &&
            constructor !== object &&
            isObject(prototype) &&
            prototype !== constructor.prototype
        ) {
            setPrototypeOf(object, prototype);
        }
        return object;
    };
},
/* 94 */
function(moduleRef, moduleExports, localRequire) {
    const isRegExp = localRequire(55); // Check if value is a RegExp
    moduleRef.exports = function(value) {
        if (isRegExp(value)) {
            throw TypeError("The method doesn't accept regular expressions");
        }
        return value;
    };
},
/* 95 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const wellKnownSymbol = localRequire(7)("match"); // Symbol.match

    /**
     * Checks if a native String method (e.g., `startsWith`, `endsWith`, `includes`)
     * is broken due to incorrect handling of RegExp as arguments.
     * @param {string} methodName - The name of the String method.
     * @returns {boolean} True if the method is broken, false otherwise.
     */
    moduleRef.exports = function(methodName) {
        const testRegex = /./;
        try {
            "/./"[methodName](testRegex); // Try calling the method with a RegExp.
        } catch (error) {
            try {
                testRegex[wellKnownSymbol] = false; // Disable Symbol.match for the test regex.
                return "/./"[methodName](testRegex); // Try again.
            } catch (error2) {
                // If it still fails, the method is broken.
            }
        }
        return false; // Method is not broken.
    };
},
/* 96 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const regExpFlags = localRequire(43); // Get RegExp flags
    const nativeRegExpExec = RegExp.prototype.exec; // Native RegExp.prototype.exec
    const stringReplace = String.prototype.replace; // Native String.prototype.replace

    // Test for `exec` method bugs:
    // 1. `lastIndex` not resetting when `global` or `sticky` flags are not used.
    // 2. `exec` returning `undefined` for non-participating capturing groups.
    const hasLastIndexBug = (function() {
        const regex1 = /a/;
        const regex2 = /b*/g; // Global regex
        nativeRegExpExec.call(regex1, "a");
        nativeRegExpExec.call(regex2, "a");
        return regex1.lastIndex !== 0 || regex2.lastIndex !== 0;
    })();

    const hasEmptyStringMatchBug = (function() {
        // Test for `exec` returning `undefined` for non-participating groups in empty string matches.
        return !/()??/.exec("")[1];
    })();

    // If bugs are present, polyfill RegExp.prototype.exec.
    moduleRef.exports =
        hasLastIndexBug || hasEmptyStringMatchBug ?
        function(inputString) {
            let matchResult;
            let tempRegex;
            let currentLastIndex;
            const regexInstance = this;

            // If hasEmptyStringMatchBug, create a new RegExp to handle empty string matches correctly.
            if (hasEmptyStringMatchBug) {
                tempRegex = new RegExp(
                    "^" + regexInstance.source + "$(?!\\s)",
                    regExpFlags.call(regexInstance)
                );
            }

            // If hasLastIndexBug, save and restore `lastIndex`.
            if (hasLastIndexBug) {
                currentLastIndex = regexInstance.lastIndex;
            }

            matchResult = nativeRegExpExec.call(regexInstance, inputString);

            // If hasLastIndexBug, update `lastIndex` for global regexes.
            if (hasLastIndexBug && matchResult) {
                regexInstance.lastIndex = regexInstance.global ?
                    matchResult.index + matchResult[0].length :
                    currentLastIndex;
            }

            // If hasEmptyStringMatchBug, fix `undefined` groups.
            if (hasEmptyStringMatchBug && matchResult && matchResult.length > 1) {
                stringReplace.call(matchResult[0], tempRegex, function() {
                    for (let i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined) {
                            matchResult[i] = undefined;
                        }
                    }
                });
            }

            return matchResult;
        } :
        nativeRegExpExec;
},
/* 97 */
function(moduleRef, moduleExports, localRequire) {
    // List of common whitespace characters.
    moduleRef.exports = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";
},
/* 98 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);
    const whitespaceChars = localRequire(97); // Common whitespace characters.

    /**
     * Checks if a native String.prototype.trim method is broken.
     * @param {string} methodName - The name of the trim method (e.g., "trim", "trimStart").
     * @returns {boolean} True if the method is broken, false otherwise.
     */
    moduleRef.exports = function(methodName) {
        // Test if the method incorrectly removes non-whitespace characters,
        // or if its name is not correct.
        return isError(function() {
            return (
                !!whitespaceChars[methodName]() || // Should not trim empty string.
                " \u200b\u0085"[methodName]() !== "\u0085" || // Should not trim non-standard whitespace.
                String.prototype[methodName].name !== methodName
            ); // Check method name.
        });
    };
},
/* 99 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const isError = localRequire(6);
    const constructorFromIterable = localRequire(65); // Check constructor from iterable
    const typedArrayUtil = localRequire(34).NATIVE_ARRAY_BUFFER_VIEWS; // Native typed array views
    const nativeArrayBuffer = globalObject.ArrayBuffer;
    const nativeInt8Array = globalObject.Int8Array;

    /**
     * Checks if the environment's typed array implementations are buggy or need polyfilling.
     * This module essentially determines if the typed array polyfills should be enabled.
     * @returns {boolean} True if typed array polyfills are needed, false otherwise.
     */
    moduleRef.exports =
        !typedArrayUtil || // If native views are not supported.
        isError(function() {
            new nativeInt8Array(1); // Test basic construction.
        }) ||
        isError(function() {
            new nativeInt8Array(-1); // Test negative length construction.
        }) ||
        isError(function() {
            // Test constructor from iterable (e.g., new Int8Array(iterable)).
            return (
                new nativeInt8Array(),
                new nativeInt8Array(1.5), // Test fractional length.
                new nativeInt8Array(constructorFromIterable(function(iterable) {
                    new nativeInt8Array(iterable);
                }, true))
            ); // Test constructor with iterable, expecting error.
        }) ||
        isError(function() {
            // Test ArrayBuffer view creation with offset and length.
            return 1 !== new nativeInt8Array(new nativeArrayBuffer(2), 1, undefined).length;
        });
},
/* 100 */
function(moduleRef, moduleExports, localRequire) {
    const mapConstructor = localRequire(92); // Map constructor.
    const weakMapConstructor = localRequire(92); // Map constructor. (Used for weakmap polyfill)
    const objectCreate = localRequire(27); // Object.create.
    const isObject = localRequire(9); // Check if value is an object.

    // A specialized Map implementation for internal metadata storage.
    // It stores metadata in a hierarchical structure:
    //   globalStore -> target -> property -> metadataKey -> metadataValue
    // This allows associating metadata with specific objects and their properties.
    const MetadataMap = function() {
        this.objectMap = null; // Map for object keys.
        this.symbolMap = null; // Map for symbol keys.
        this.primitiveMap = null; // Map for primitive keys.
        this.objectsByIndex = objectCreate(null); // Map for objects by index (for composite keys).
    };

    MetadataMap.prototype.get = function(keyType, factory) {
        // If a map for keyType doesn't exist, create it using the factory.
        return this[keyType] || (this[keyType] = factory());
    };

    MetadataMap.prototype.next = function(keyIndex, key, isObjectKey) {
        let currentMap;
        if (isObjectKey) {
            // If it's an object key, use objectsByIndex map.
            currentMap = this.objectsByIndex[keyIndex] || (this.objectsByIndex[keyIndex] = new weakMapConstructor());
        } else {
            // If it's a primitive key, use primitiveMap.
            currentMap = this.primitiveMap || (this.primitiveMap = new mapConstructor());
        }
        let nextMap = currentMap.get(key);
        if (!nextMap) {
            currentMap.set(key, (nextMap = new MetadataMap()));
        }
        return nextMap;
    };

    const globalMetadataStore = new MetadataMap();

    // Export the global metadata store.
    moduleRef.exports = globalMetadataStore;
},
/* 101 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const isError = localRequire(6); // Error handling utility

    /**
     * Polyfill for Object.defineProperty in environments that partially support it (e.g., IE8).
     * It attempts to use the native defineProperty within a try-catch block.
     * @returns {boolean} True if the polyfill is active and successful, false otherwise.
     */
    moduleRef.exports =
        !supportsDescriptors &&
        !isError(function() {
            return (
                7 !=
                Object.defineProperty(localRequire(78)("div"), "a", {
                    get: function() {
                        return 7;
                    },
                }).a
            );
        });
},
/* 102 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const assignToGlobal = localRequire(79); // Assign to global scope

    const sharedGlobalVariable = globalObject["__core-js_shared__"] || assignToGlobal("__core-js_shared__", {});

    /**
     * Accesses or creates a shared global object, storing it in `__core-js_shared__`.
     * This is used for internal state that needs to persist across different modules
     * or even different versions of the library in a global-like scope.
     * @param {string} key - The key for the shared data.
     * @param {*} [defaultValue] - The default value to set if the key doesn't exist.
     * @returns {*} The shared data.
     */
    moduleRef.exports = sharedGlobalVariable;
},
/* 103 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const getSourceOfFunction = localRequire(80); // Get source code of function

    const nativeWeakMap = globalObject.WeakMap;

    /**
     * Checks if the native `WeakMap` implementation is available and reliable.
     * @returns {boolean} True if `WeakMap` is available and appears native, false otherwise.
     */
    moduleRef.exports = typeof nativeWeakMap === "function" && /native code/.test(getSourceOfFunction(nativeWeakMap));
},
/* 104 */
function(moduleRef, moduleExports, localRequire) {
    const hasOwn = localRequire(14);
    const toObject = localRequire(25);
    const objectDefineProperty = localRequire(10); // Object.defineProperty.f
    const objectGetOwnPropertyDescriptor = localRequire(19); // Object.getOwnPropertyDescriptor.f

    /**
     * Copies properties from a source object to a target object.
     * This is used to transfer properties when an existing implementation is replaced by a polyfill,
     * ensuring that original properties (like `name` or `length`) are preserved.
     * @param {object} target - The target object to receive properties.
     * @param {object} source - The source object from which to copy properties.
     */
    moduleRef.exports = function(target, source) {
        const sourceObject = toObject(source);
        const propertyDescriptor = objectGetOwnPropertyDescriptor.f(sourceObject, "name");

        // If the source has a 'name' property and it's not configurable, we can't redefine it.
        // In such cases, we might need a workaround for the 'name' property.
        if (propertyDescriptor && propertyDescriptor.configurable && hasOwn(sourceObject, "name")) {
            objectDefineProperty.f(target, "name", propertyDescriptor);
        }
    };
},
/* 105 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    // Export the global object itself. This is often used to access built-in constructors
    // or global variables.
    moduleRef.exports = globalObject;
},
/* 106 */
function(moduleRef, moduleExports, localRequire) {
    const hasOwn = localRequire(14);
    const toObject = localRequire(25);
    const arrayIndexOf = localRequire(61).indexOf;
    const internalRegistry = localRequire(45); // Internal property registry

    /**
     * Returns an array of an object's own enumerable and non-enumerable property names,
     * excluding those specified in a `blockedKeys` array.
     * This is a polyfill helper for `Object.getOwnPropertyNames`.
     * @param {object} object - The object to inspect.
     * @param {Array<string>} [blockedKeys=[]] - An array of property names to exclude.
     * @returns {Array<string>} An array of property names.
     */
    moduleRef.exports = function(object, blockedKeys) {
        const targetObject = toObject(object);
        const propertyNames = [];
        let property;
        let i = 0;

        // Iterate over all properties (including inherited ones) and add own, non-blocked properties.
        for (property in targetObject) {
            // Check if it's an own property and not in the internal registry.
            if (!hasOwn(internalRegistry, property) && hasOwn(targetObject, property)) {
                propertyNames.push(property);
            }
        }

        // Add properties from the blockedKeys array if they exist and are not already in propertyNames.
        while (blockedKeys.length > i) {
            property = blockedKeys[i++];
            if (hasOwn(targetObject, property) && arrayIndexOf(propertyNames, property) === -1) {
                propertyNames.push(property);
            }
        }

        return propertyNames;
    };
},
/* 107 */
function(moduleRef, moduleExports, localRequire) {
    const hasOwn = localRequire(14);
    // Check if the Symbol constructor is available and if `Symbol.sham` is set to `true`.
    // `Symbol.sham` is a non-standard flag used by some polyfills to indicate a simulated Symbol.
    moduleRef.exports = localRequire(84) && !Symbol.sham && typeof Symbol === "function";
},
/* 108 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const objectDefineProperty = localRequire(10); // Object.defineProperty.f
    const ensureObject = localRequire(1);
    const getPropertyNames = localRequire(64); // Object.keys

    /**
     * Polyfill for Object.defineProperties, which defines multiple new or modifies existing
     * properties directly on an object.
     * @param {object} target - The object on which to define or modify properties.
     * @param {object} descriptors - An object whose own enumerable properties are property descriptors.
     * @returns {object} The modified object.
     */
    moduleRef.exports = supportsDescriptors ?
        Object.defineProperties :
        function(target, descriptors) {
            ensureObject(target);
            const keys = getPropertyNames(descriptors);
            let i = 0;
            const length = keys.length;
            let key;

            while (i < length) {
                key = keys[i++];
                objectDefineProperty.f(target, key, descriptors[key]);
            }
            return target;
        };
},
/* 109 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    const defineProperty = localRequire(18); // Object.defineProperty helper

    let documentElement;
    // Check if document and documentElement are available in the global object.
    if (globalObject.document && globalObject.document.documentElement) {
        documentElement = globalObject.document.documentElement;
    }

    /**
     * Safely retrieves or creates the documentElement.
     * @returns {HTMLElement|undefined} The documentElement or undefined.
     */
    moduleRef.exports = documentElement;
},
/* 110 */
function(moduleRef, moduleExports, localRequire) {
    const wellKnownSymbol = localRequire(7); // Symbol helper
    // Export a factory function for well-known symbols.
    moduleRef.exports = {
        f: wellKnownSymbol,
    };
},
/* 111 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const isArray = localRequire(46);
    const toLength = localRequire(11);
    const bindCallable = localRequire(13);

    /**
     * Recursively flattens an array up to a specified depth.
     * @param {Array} targetArray - The array to flatten into.
     * @param {Array} sourceArray - The array being flattened.
     * @param {object} originalSource - The original array (for context).
     * @param {number} sourceLength - The length of the source array.
     * @param {number} startIndex - The starting index for processing.
     * @param {number} depth - The maximum flattening depth.
     * @param {function} [mapFunction] - Optional mapping function.
     * @param {*} [mapContext] - Context for the mapping function.
     * @returns {number} The new length of the targetArray.
     */
    const arrayFlatten = function(
        targetArray,
        sourceArray,
        originalSource,
        sourceLength,
        startIndex,
        depth,
        mapFunction,
        mapContext
    ) {
        let currentElement;
        let newLength = startIndex;
        const mappedCallback = mapFunction ? bindCallable(mapFunction, mapContext, 3) : undefined;
        let currentDepth = depth > 0 ? depth : 0; // Ensure depth is non-negative.

        let i = 0;
        while (i < sourceLength) {
            if (i in sourceArray) {
                currentElement = mapFunction ? mappedCallback(sourceArray[i], i, originalSource) : sourceArray[i];

                if (currentDepth > 0 && isArray(currentElement)) {
                    // Recursively flatten if element is an array and depth allows.
                    newLength = arrayFlatten(
                        targetArray,
                        currentElement,
                        originalSource,
                        toLength(currentElement.length),
                        newLength,
                        currentDepth - 1,
                        mapFunction,
                        mapContext
                    );
                } else {
                    // Otherwise, add the element to the target array.
                    if (newLength >= 9007199254740991) {
                        throw TypeError("Exceed the acceptable array length");
                    }
                    targetArray[newLength++] = currentElement;
                }
            }
            i++;
        }
        return newLength;
    };

    moduleRef.exports = arrayFlatten;
},
/* 112 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureObject = localRequire(1);
    const ensureFunction = localRequire(4);
    const bindCallable = localRequire(13);
    const toObject = localRequire(15);
    const iterateCollection = localRequire(3);
    const getIteratorMethod = localRequire(87); // Check if it's an array-like iterable
    const toLength = localRequire(11); // Get valid array length
    const setProperty = localRequire(39); // Define property on object
    const typedArrayConstructor = localRequire(34).aTypedArrayConstructor; // Get TypedArray constructor

    /**
     * Creates a new Array or TypedArray instance from an iterable or array-like object.
     * This is a polyfill for `Array.from`.
     * @param {Iterable|ArrayLike} source - The source to convert.
     * @param {function} [mapFunction] - An optional mapping function.
     * @param {*} [mapContext] - The 'this' context for the mapFunction.
     * @returns {Array|TypedArray} A new array instance.
     */
    moduleRef.exports = function(source, mapFunction, mapContext) {
        const constructor = typeof this === "function" ? this : Array; // Get constructor.
        const isTypedArray = typedArrayConstructor(constructor); // Check if it's a TypedArray constructor.
        const hasMapping = mapFunction !== undefined;
        const mappedCallback = hasMapping ? bindCallable(mapFunction, mapContext, 2) : undefined;
        const object = toObject(source);
        const iteratorMethod = getIteratorMethod(object);
        let arrayInstance;
        let length;
        let index = 0;
        let currentElement;

        // If iterable, use iterator.
        if (iteratorMethod && !getIteratorMethod(iteratorMethod)) {
            const iterator = iteratorMethod.call(object);
            arrayInstance = isTypedArray ? new constructor(0) : [];
            for (; !(currentElement = iterator.next()).done; index++) {
                const value = hasMapping ? mappedCallback(currentElement.value, index) : currentElement.value;
                if (isTypedArray) {
                    setProperty(arrayInstance, index, value);
                } else {
                    arrayInstance.push(value);
                }
            }
        } else {
            // If array-like.
            length = toLength(object.length);
            arrayInstance = isTypedArray ? new constructor(length) : new constructor(length);
            for (; length > index; index++) {
                const value = hasMapping ? mappedCallback(object[index], index) : object[index];
                if (isTypedArray) {
                    setProperty(arrayInstance, index, value);
                } else {
                    arrayInstance[index] = value;
                }
            }
        }
        if (isTypedArray) {
            arrayInstance.length = index; // Ensure length is correct for TypedArray.
        }
        return arrayInstance;
    };
},
/* 113 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);

    /**
     * Handles early termination of an iterator. If the callback throws an error,
     * it calls the iterator's `return` method (if available) to clean up resources.
     * @param {Iterator} iterator - The iterator object.
     * @param {function} callback - The callback function that might throw.
     * @param {*} value - The current value from the iterator.
     * @param {boolean} [isKeyValue=false] - If true, passes value as `[key, value]`.
     * @returns {*} The result of the callback.
     */
    moduleRef.exports = function(iterator, callback, value, isKeyValue) {
        try {
            return isKeyValue ? callback(ensureObject(value)[0], value[1]) : callback(value);
        } catch (error) {
            const returnMethod = iterator.return;
            if (returnMethod !== undefined) {
                ensureObject(returnMethod.call(iterator)); // Call return method if available.
            }
            throw error; // Re-throw the original error.
        }
    };
},
/* 114 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const objectGetPrototypeOf = localRequire(22); // Get prototype of object
    const defineProperty = localRequire(18); // Object.defineProperty helper
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const wellKnownSymbol = localRequire(7)("iterator"); // Symbol.iterator
    const isPure = localRequire(2); // Check if pure (non-standard) module

    let iteratorPrototype;
    let safariBug = false; // Flag for Safari's buggy iterators.

    // Try to get the native IteratorPrototype.
    if ([].keys && "next" in (iteratorPrototype = [].keys())) {
        const proto = objectGetPrototypeOf(objectGetPrototypeOf(iteratorPrototype));
        if (proto !== Object.prototype) {
            iteratorPrototype = proto; // Found native IteratorPrototype.
        } else {
            safariBug = true; // Safari has a bug where IteratorPrototype is Object.prototype.
        }
    } else {
        iteratorPrototype = {}; // Fallback to an empty object.
    }

    // If not pure mode and Symbol.iterator is not defined on the prototype, define it.
    if (!isPure && !hasOwn(iteratorPrototype, wellKnownSymbol)) {
        defineProperty(iteratorPrototype, wellKnownSymbol, function() {
            return this;
        });
    }

    moduleRef.exports = {
        IteratorPrototype: iteratorPrototype,
        BUGGY_SAFARI_ITERATORS: safariBug,
    };
},
/* 115 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);

    // Test for a bug in Object.getPrototypeOf where it returns incorrect prototype
    // for objects whose constructor.prototype is null.
    moduleRef.exports = !isError(function() {
        function TestConstructor() {}
        TestConstructor.prototype.constructor = null;
        return Object.getPrototypeOf(new TestConstructor()) !== TestConstructor.prototype;
    });
},
/* 116 */
function(moduleRef, moduleExports, localRequire) {
    const isObject = localRequire(9);

    /**
     * Ensures that a value is a valid object or null for use as a prototype.
     * Throws a TypeError if the value is a primitive that cannot be a prototype.
     * @param {*} value - The value to check.
     * @returns {object|null} The valid prototype value.
     */
    moduleRef.exports = function(value) {
        if (!isObject(value) && value !== null) {
            throw TypeError("Can't set " + String(value) + " as a prototype");
        }
        return value;
    };
},
/* 117 */
function(moduleRef, moduleExports, localRequire) {
    const isError = localRequire(6);

    // Check if Object.isExtensible behaves correctly for frozen objects.
    moduleRef.exports = !isError(function() {
        return Object.isExtensible(Object.preventExtensions({}));
    });
},
/* 118 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const objectDefineProperty = localRequire(10).f; // Object.defineProperty.f
    const objectCreate = localRequire(27); // Object.create
    const extendObject = localRequire(36); // Extend object with properties
    const bindCallable = localRequire(13); // Function.prototype.bind
    const constructorChecker = localRequire(32); // Constructor invocation check
    const iterateCollection = localRequire(3); // Iterator utility
    const iteratorFactory = localRequire(91); // Iterator factory
    const setToStringTag = localRequire(28); // Set Symbol.toStringTag
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const collectionHelper = localRequire(67); // Collection helper utilities
    const fastKey = collectionHelper.fastKey; // Get unique key for object
    const stateManagement = localRequire(16); // Internal state management
    const setState = stateManagement.set; // Set internal state
    const getState = stateManagement.getterFor; // Get state for a type

    moduleRef.exports = {
        /**
         * Creates a constructor for strong collections (Map, Set) that manage their elements
         * using a linked list and a hash map for fast lookups.
         * @param {function} BaseConstructor - The base constructor function.
         * @param {string} collectionName - The name of the collection (e.g., "Map", "Set").
         * @param {boolean} isMap - True if it's a Map, false if it's a Set.
         * @param {string} addMethodName - The name of the method to add elements ("set" or "add").
         * @returns {function} The new collection constructor.
         */
        getConstructor: function(BaseConstructor, collectionName, isMap, addMethodName) {
            const NewCollection = BaseConstructor(function(instance, iterable) {
                constructorChecker(instance, NewCollection, collectionName);
                setState(instance, {
                    type: collectionName,
                    index: objectCreate(null), // Hash map for fast key lookups.
                    first: undefined, // Head of the linked list.
                    last: undefined, // Tail of the linked list.
                    size: 0, // Current size of the collection.
                });
                if (!supportsDescriptors) {
                    instance.size = 0; // Initialize size for non-descriptor environments.
                }
                if (iterable != null) {
                    iterateCollection(iterable, instance[addMethodName], instance, isMap);
                }
            });

            const collectionState = getState(collectionName); // Getter for internal state.

            /**
             * Adds or updates an element in the collection.
             * @param {object} collectionInstance - The collection instance.
             * @param {*} key - The key of the element.
             * @param {*} value - The value of the element.
             * @returns {object} The collection instance.
             */
            const addOrUpdateElement = function(collectionInstance, key, value) {
                const state = collectionState(collectionInstance);
                let entry = findEntry(collectionInstance, key);

                if (entry) {
                    entry.value = value; // Update existing entry.
                } else {
                    // Create new entry and add to linked list.
                    const newEntry = (state.last = {
                        index: fastKey(key, true), // Get unique key for fast lookup.
                        key: key,
                        value: value,
                        previous: state.last,
                        next: undefined,
                        removed: false,
                    });
                    if (state.first === undefined) {
                        state.first = newEntry; // If first element.
                    }
                    if (newEntry.previous) {
                        newEntry.previous.next = newEntry; // Link previous element.
                    }
                    state.index[newEntry.index] = newEntry; // Add to hash map.
                    supportsDescriptors ? state.size++ : collectionInstance.size++; // Increment size.
                }
                return collectionInstance;
            };

            /**
             * Finds an entry in the collection by its key.
             * @param {object} collectionInstance - The collection instance.
             * @param {*} key - The key to search for.
             * @returns {object|undefined} The entry object or undefined if not found.
             */
            const findEntry = function(collectionInstance, key) {
                const state = collectionState(collectionInstance);
                const keyIndex = fastKey(key); // Get key for hash map lookup.
                if (keyIndex !== "F") { // If not a frozen object.
                    return state.index[keyIndex];
                }
                // Fallback to linear search for frozen objects.
                for (let entry = state.first; entry; entry = entry.next) {
                    if (entry.key == key) {
                        return entry;
                    }
                }
                return undefined;
            };

            extendObject(NewCollection.prototype, {
                clear: function() {
                    const state = collectionState(this);
                    const indexMap = state.index;
                    let entry = state.first;
                    // Iterate and mark all entries as removed.
                    while (entry) {
                        entry.removed = true;
                        if (entry.previous) {
                            entry.previous.next = undefined;
                            entry.previous = undefined;
                        }
                        delete indexMap[entry.index];
                        entry = entry.next;
                    }
                    state.first = state.last = undefined; // Reset linked list.
                    supportsDescriptors ? state.size = 0 : this.size = 0; // Reset size.
                },
                delete: function(key) {
                    const state = collectionState(this);
                    const entry = findEntry(this, key);

                    if (entry) {
                        const nextEntry = entry.next;
                        const previousEntry = entry.previous;
                        delete state.index[entry.index]; // Remove from hash map.
                        entry.removed = true; // Mark as removed.
                        if (previousEntry) {
                            previousEntry.next = nextEntry; // Update links.
                        }
                        if (nextEntry) {
                            nextEntry.previous = previousEntry; // Update links.
                        }
                        if (state.first == entry) {
                            state.first = nextEntry; // Update head.
                        }
                        if (state.last == entry) {
                            state.last = previousEntry; // Update tail.
                        }
                        supportsDescriptors ? state.size-- : this.size--; // Decrement size.
                    }
                    return !!entry; // Return true if an entry was deleted.
                },
                forEach: function(callback, context) {
                    const state = collectionState(this);
                    const boundCallback = bindCallable(callback, context, 3); // (value, key, collection)
                    let entry = state.first;
                    // Iterate through linked list, skipping removed entries.
                    while (entry) {
                        if (!entry.removed) {
                            boundCallback(entry.value, entry.key, this);
                        }
                        entry = entry.next;
                    }
                },
                has: function(key) {
                    return !!findEntry(this, key); // Check if an entry exists for the key.
                },
            });

            extendObject(
                NewCollection.prototype,
                isMap ?
                {
                    get: function(key) {
                        const entry = findEntry(this, key);
                        return entry && entry.value;
                    },
                    set: function(key, value) {
                        return addOrUpdateElement(this, key === 0 ? 0 : key, value);
                    },
                } :
                {
                    add: function(value) {
                        return addOrUpdateElement(this, (value = value === 0 ? 0 : value), value);
                    },
                }
            );

            // If descriptors are supported, define a getter for 'size'.
            if (supportsDescriptors) {
                objectDefineProperty(NewCollection.prototype, "size", {
                    get: function() {
                        return collectionState(this).size;
                    },
                });
            }

            return NewCollection;
        },

        /**
         * Sets up iteration methods (entries, keys, values) for strong collections.
         * @param {function} CollectionConstructor - The collection constructor (Map or Set).
         * @param {string} collectionName - The name of the collection.
         * @param {boolean} isMap - True if it's a Map, false if it's a Set.
         */
        setStrong: function(CollectionConstructor, collectionName, isMap) {
            const iteratorTypeName = collectionName + " Iterator";
            const collectionState = getState(collectionName);
            const iteratorState = getState(iteratorTypeName);

            // Create iterator factory.
            iteratorFactory(
                CollectionConstructor,
                collectionName,
                function(collectionInstance, kind) {
                    setState(this, {
                        type: iteratorTypeName,
                        target: collectionInstance,
                        state: collectionState(collectionInstance), // Reference to collection's internal state.
                        kind: kind,
                        last: undefined, // Last returned entry.
                    });
                },
                function() {
                    let state = iteratorState(this);
                    let entry = state.last;
                    // Find the next valid entry in the linked list.
                    while (entry && entry.removed) {
                        entry = entry.previous;
                    }
                    if (state.target && (state.last = entry = entry ? entry.next : state.state.first)) {
                        // Return value based on kind.
                        if (state.kind === "keys") {
                            return {
                                value: entry.key,
                                done: false
                            };
                        }
                        if (state.kind === "values") {
                            return {
                                value: entry.value,
                                done: false
                            };
                        }
                        return {
                            value: [entry.key, entry.value],
                            done: false
                        }; // "entries"
                    }
                    state.target = undefined; // Mark iteration as done.
                    return {
                        value: undefined,
                        done: true
                    };
                },
                isMap ? "entries" : "values",
                isMap,
                true // Force polyfill for iterators.
            );

            // Set Symbol.toStringTag for the collection.
            setToStringTag(CollectionConstructor, collectionName, true, true);
        },
    };
},
/* 119 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const isError = localRequire(6); // Error handling utility
    const getPropertyNames = localRequire(64); // Object.keys
    const getOwnPropertySymbols = localRequire(83); // Object.getOwnPropertySymbols.f
    const isPropertyEnumerable = localRequire(58).f; // Object.prototype.propertyIsEnumerable.f
    const toObject = localRequire(15); // Convert to object
    const indexedObject = localRequire(77); // Convert to indexed object
    const objectAssign = Object.assign; // Native Object.assign

    // Check for various bugs in native Object.assign.
    const hasAssignBugs =
        !objectAssign ||
        isError(function() {
            // Bug 1: Enumerable property descriptor issues.
            if (supportsDescriptors && 1 !== objectAssign({
                    b: 1
                }, objectAssign(localRequire(10).f({}, "a", {
                    enumerable: true,
                    get: function() {
                        localRequire(10).f(this, "b", {
                            value: 3,
                            enumerable: false
                        });
                    },
                }), {
                    b: 2
                })).b) {
                return true;
            }
            // Bug 2: Symbol properties not copied.
            const target = {};
            const source = {};
            const symbolKey = Symbol();
            target[symbolKey] = 7;
            "abcdefghijklmnopqrst".split("").forEach(function(char) {
                source[char] = char;
            });
            return (
                objectAssign({}, target)[symbolKey] != 7 ||
                getPropertyNames(objectAssign({}, source)).join("") !=
                "abcdefghijklmnopqrst"
            );
        });

    /**
     * Polyfill for Object.assign.
     * It merges enumerable own properties from one or more source objects to a target object.
     * @param {object} target - The target object to merge into.
     * @param {...object} sources - The source objects.
     * @returns {object} The target object.
     */
    moduleRef.exports = hasAssignBugs ?
        function(target, source1) {
            const object = toObject(target);
            let i = 1;
            const argCount = arguments.length;
            const getSymbols = getOwnPropertySymbols;
            const isEnumerable = isPropertyEnumerable;

            // Iterate through all source objects.
            while (i < argCount) {
                const currentSource = indexedObject(arguments[i++]);
                const keys = getSymbols ?
                    getPropertyNames(currentSource).concat(getSymbols(currentSource)) :
                    getPropertyNames(currentSource);
                let j = 0;
                const keyCount = keys.length;
                let key;

                // Copy enumerable properties from source to target.
                while (j < keyCount) {
                    key = keys[j++];
                    if (supportsDescriptors ? isEnumerable.call(currentSource, key) : hasOwn(currentSource, key)) {
                        object[key] = currentSource[key];
                    }
                }
            }
            return object;
        } :
        objectAssign;
},
/* 120 */
function(moduleRef, moduleExports, localRequire) {
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const getPropertyNames = localRequire(64); // Object.keys
    const toObject = localRequire(25); // Convert to object
    const isPropertyEnumerable = localRequire(58).f; // Object.prototype.propertyIsEnumerable.f

    /**
     * Creates a function to return an array of an object's enumerable own properties.
     * @param {boolean} isEntries - If true, returns [key, value] pairs; otherwise, returns values only.
     * @returns {function} The function to get properties.
     */
    const createPropertyExtractor = function(isEntries) {
        return function(object) {
            const targetObject = toObject(object);
            const keys = getPropertyNames(targetObject);
            const result = [];
            let key;
            let i = 0;
            const length = keys.length;

            // Iterate through enumerable own properties.
            while (i < length) {
                key = keys[i++];
                if (supportsDescriptors ? isPropertyEnumerable.call(targetObject, key) : hasOwn(targetObject, key)) {
                    result.push(isEntries ? [key, targetObject[key]] : targetObject[key]);
                }
            }
            return result;
        };
    };

    moduleRef.exports = {
        entries: createPropertyExtractor(true), // Returns [key, value] pairs.
        values: createPropertyExtractor(false), // Returns values only.
    };
},
/* 121 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);
    // Export the native Promise constructor.
    moduleRef.exports = globalObject.Promise;
},
/* 122 */
function(moduleRef, moduleExports, localRequire) {
    let microtaskQueue;
    let microtaskClearer;
    const globalObject = localRequire(5);
    const isError = localRequire(6);
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const bindCallable = localRequire(13); // Function.prototype.bind
    const htmlCreateElement = localRequire(78); // Create HTML element
    const appendChild = localRequire(109); // Append to document

    const microtaskCounter = 0;
    const microtaskCallbacks = {};

    // Helper to execute a microtask callback.
    const executeMicrotask = function(id) {
        if (microtaskCallbacks.hasOwnProperty(id)) {
            const callback = microtaskCallbacks[id];
            delete microtaskCallbacks[id];
            callback();
        }
    };

    // Helper to trigger microtask execution.
    const triggerMicrotask = function(id) {
        executeMicrotask(id);
    };

    // Helper for MessageChannel event.
    const handleMessageChannel = function(event) {
        executeMicrotask(event.data);
    };

    // Helper for postMessage fallback.
    const postMessageFallback = function(id) {
        globalObject.postMessage(id + "", globalObject.location.protocol + "//" + globalObject.location.host);
    };

    // Determine the most efficient microtask scheduler.
    if (globalObject.setImmediate && globalObject.clearImmediate) {
        // Option 1: setImmediate (Node.js/IE).
        microtaskQueue = globalObject.setImmediate;
        microtaskClearer = globalObject.clearImmediate;
    } else {
        // Option 2: process.nextTick (Node.js).
        if (getObjectClass(globalObject.process) == "process") {
            microtaskQueue = function(callback) {
                globalObject.process.nextTick(triggerMicrotask.bind(null, ++microtaskCounter));
            };
        }
        // Option 3: MessageChannel (modern browsers).
        else if (globalObject.MessageChannel && !localRequire(123)) {
            const messageChannel = new globalObject.MessageChannel();
            const port2 = messageChannel.port2;
            messageChannel.port1.onmessage = handleMessageChannel;
            microtaskQueue = bindCallable(port2.postMessage, port2, 1);
        }
        // Option 4: script.onreadystatechange (IE).
        else if (
            "onreadystatechange" in htmlCreateElement("script") &&
            !(globalObject.addEventListener && typeof globalObject.postMessage === "function" && !globalObject.importScripts && isError(postMessageFallback))
        ) {
            microtaskQueue = function(callback) {
                const script = htmlCreateElement("script");
                script.onreadystatechange = function() {
                    appendChild.removeChild(this); // Clean up the script tag.
                    executeMicrotask(++microtaskCounter);
                };
                appendChild.appendChild(script);
            };
        }
        // Option 5: setTimeout (fallback).
        else {
            microtaskQueue = function(callback) {
                globalObject.setTimeout(triggerMicrotask.bind(null, ++microtaskCounter), 0);
            };
        }

        microtaskClearer = function(id) {
            delete microtaskCallbacks[id];
        };
    }

    moduleRef.exports = {
        set: microtaskQueue,
        clear: microtaskClearer,
    };
},
/* 123 */
function(moduleRef, moduleExports, localRequire) {
    const userAgent = localRequire(86); // User agent string
    // Check if the user agent indicates iOS device (iPhone, iPod, iPad).
    moduleRef.exports = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent);
},
/* 124 */
function(moduleRef, moduleExports, localRequire) {
    let microtaskQueueFn;
    let currentMicrotask;
    let microtaskHead;
    const globalObject = localRequire(5);
    const getObjectClass = localRequire(26); // Object.prototype.toString
    const setMicrotask = localRequire(122).set; // Set microtask using various methods
    const isIOS = localRequire(123); // Check for iOS
    const nativeMutationObserver = globalObject.MutationObserver || globalObject.WebKitMutationObserver;
    const nativeProcess = globalObject.process;
    const nativePromise = globalObject.Promise;

    const isNode = getObjectClass(nativeProcess) == "process";

    let nativeQueueMicrotask = globalObject.queueMicrotask;
    const nativeQueueMicrotaskValue = nativeQueueMicrotask && nativeQueueMicrotask.value;

    // If native queueMicrotask is available, use it.
    if (nativeQueueMicrotaskValue) {
        microtaskQueueFn = nativeQueueMicrotaskValue;
    } else {
        // Otherwise, polyfill queueMicrotask.
        const executeAllMicrotasks = function() {
            let domain;
            // If in Node.js, enter/exit domain for error handling.
            if (isNode && (domain = nativeProcess.domain)) {
                domain.exit();
            }
            // Execute all queued microtasks.
            while (microtaskHead) {
                const callback = microtaskHead.fn;
                microtaskHead = microtaskHead.next;
                try {
                    callback();
                } catch (error) {
                    throw error; // Re-throw errors.
                }
            }
            currentMicrotask = undefined; // Clear current microtask.
            if (domain) {
                domain.enter();
            }
        };

        // Determine the best way to schedule microtasks.
        if (isNode) {
            microtaskQueueFn = function() {
                nativeProcess.nextTick(executeAllMicrotasks);
            };
        } else if (nativeMutationObserver && !isIOS) {
            // MutationObserver for browsers.
            let toggle = true;
            const textNode = document.createTextNode("");
            new nativeMutationObserver(executeAllMicrotasks).observe(textNode, {
                characterData: true
            });
            microtaskQueueFn = function() {
                textNode.data = toggle = !toggle; // Toggle data to trigger observer.
            };
        } else if (nativePromise && nativePromise.resolve) {
            // Promise.resolve().then() for browsers.
            const resolvedPromise = nativePromise.resolve(undefined);
            const thenMethod = resolvedPromise.then;
            microtaskQueueFn = function() {
                thenMethod.call(resolvedPromise, executeAllMicrotasks);
            };
        } else {
            // Fallback to setImmediate/setTimeout.
            microtaskQueueFn = function() {
                setMicrotask.call(globalObject, executeAllMicrotasks);
            };
        }
    }

    moduleRef.exports =
        nativeQueueMicrotaskValue ||
        function(callback) {
            const task = {
                fn: callback,
                next: undefined
            };
            if (currentMicrotask) {
                currentMicrotask.next = task;
            } else {
                microtaskHead = task;
                microtaskQueueFn(); // Schedule execution.
            }
            currentMicrotask = task;
        };
},
/* 125 */
function(moduleRef, moduleExports, localRequire) {
    const ensureObject = localRequire(1);
    const isObject = localRequire(9);
    const createDeferredPromise = localRequire(54); // Create deferred promise

    /**
     * Resolves a value into a Promise, handling cases where the value is already a Promise
     * or needs to be wrapped in one.
     * @param {function} PromiseConstructor - The Promise constructor to use.
     * @param {*} value - The value to resolve.
     * @returns {Promise} A Promise resolved with the given value.
     */
    moduleRef.exports = function(PromiseConstructor, value) {
        // If value is an object and its constructor is the same PromiseConstructor, return it.
        if (isObject(value) && value.constructor === PromiseConstructor) {
            return value;
        }
        // Otherwise, create a new deferred promise and resolve it with the value.
        const deferred = createDeferredPromise.f(PromiseConstructor);
        deferred.resolve(value);
        return deferred.promise;
    };
},
/* 126 */
function(moduleRef, moduleExports, localRequire) {
    const globalObject = localRequire(5);

    /**
     * Logs an unhandled error to the console.
     * This is typically used for errors that occur within promise chains or microtasks
     * and are not explicitly caught.
     * @param {*} error - The error to log.
     * @param {*} [context] - Optional context for the error (e.g., the promise).
     */
    moduleRef.exports = function(error, context) {
        const consoleObject = globalObject.console;
        if (consoleObject && consoleObject.error) {
            if (arguments.length === 1) {
                consoleObject.error(error);
            } else {
                consoleObject.error(error, context);
            }
        }
    };
},
/* 127 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0);
    const collectionConstructor = localRequire(66); // Generic collection constructor (Map, Set, WeakMap, WeakSet)
    const setCollectionSetStrong = localRequire(118); // Strong collection helpers for Set

    // Define the Set constructor.
    moduleRef.exports = collectionConstructor(
        "Set",
        function(initCallback) {
            return function() {
                return initCallback(this, arguments.length ? arguments[0] : undefined);
            };
        },
        setCollectionSetStrong
    );
},
/* 128 */
function(moduleRef, moduleExports, localRequire) {
    const toLength = localRequire(11);
    const stringCoercible = localRequire(17); // Require object coercible
    const mathCeil = Math.ceil;

    /**
     * Creates a function for padding a string to a specific length.
     * @param {boolean} padStart - If true, pad from the start; otherwise, pad from the end.
     * @returns {function} The padding function.
     */
    const createPadder = function(padStart) {
        return function(targetString, targetLength, padString) {
            const stringValue = String(stringCoercible(targetString));
            const desiredLength = toLength(targetLength);
            const currentLength = stringValue.length;
            const paddingChar = padString === undefined ? " " : String(padString);

            // If desired length is less than or equal to current length, no padding needed.
            if (desiredLength <= currentLength || paddingChar === "") {
                return stringValue;
            }

            const paddingRepeatCount = mathCeil((desiredLength - currentLength) / paddingChar.length);
            let padding = Array(paddingRepeatCount + 1).join(paddingChar); // Repeat padding char.

            // Trim padding if it's too long.
            if (padding.length > desiredLength - currentLength) {
                padding = padding.slice(0, desiredLength - currentLength);
            }

            return padStart ? padding + stringValue : stringValue + padding;
        };
    };

    moduleRef.exports = {
        start: createPadder(true), // Pad at the start.
        end: createPadder(false), // Pad at the end.
    };
},
/* 129 */
function(moduleRef, moduleExports, localRequire) {
    const userAgent = localRequire(86); // User agent string
    // Check if the user agent indicates Safari browser (Version/10.x Safari/).
    moduleRef.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);
},
/* 130 */
function(moduleRef, moduleExports, localRequire) {
    const toInteger = localRequire(24);
    const toLength = localRequire(11);

    /**
     * Converts a value to a valid array length or index.
     * Throws a RangeError if the value is negative or exceeds the maximum safe integer.
     * @param {*} value - The value to convert.
     * @returns {number} The valid length/index.
     */
    moduleRef.exports = function(value) {
        if (value === undefined) {
            return 0; // Default to 0 for undefined.
        }
        const integerValue = toInteger(value);
        const length = toLength(integerValue);
        if (integerValue !== length) {
            throw RangeError("Wrong length or index");
        }
        return length;
    };
},
/* 131 */
function(moduleRef, moduleExports, localRequire) {
    const toObject = localRequire(15);
    const toAbsoluteIndex = localRequire(62); // Clamp index to array bounds
    const toLength = localRequire(11);
    const typedArrayConstructor = localRequire(34).aTypedArrayConstructor; // Get TypedArray constructor

    /**
     * Fills an array-like object with a given value.
     * This is a polyfill for `Array.prototype.fill`.
     * @param {*} valueToFill - The value to fill the array with.
     * @param {number} [startIndex=0] - The starting index (inclusive).
     * @param {number} [endIndex=length] - The ending index (exclusive).
     * @returns {object} The modified array-like object.
     */
    moduleRef.exports = function(valueToFill, startIndex, endIndex) {
        const object = toObject(this);
        const length = toLength(object.length);
        const start = toAbsoluteIndex(startIndex === undefined ? 0 : startIndex, length);
        const end = toAbsoluteIndex(endIndex === undefined ? length : endIndex, length);

        // Fill the array from start to end.
        while (end > start) {
            object[start++] = valueToFill;
        }
        return object;
    };
},
/* 132 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const extendObject = localRequire(36); // Extend object with properties
    const collectionHelper = localRequire(67); // Collection helper utilities
    const getWeakData = collectionHelper.getWeakData; // Get weak data for object
    const ensureObject = localRequire(1); // Ensure value is an object
    const isObject = localRequire(9); // Check if value is an object
    const constructorChecker = localRequire(32); // Constructor invocation check
    const iterateCollection = localRequire(3); // Iterator utility
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const stateManagement = localRequire(16); // Internal state management
    const setState = stateManagement.set; // Set internal state
    const getState = stateManagement.getterFor; // Get state for a type

    let objectIdCounter = 0; // Counter for unique object IDs.

    // A simple polyfill for WeakMap/WeakSet data when native is not available or buggy.
    // It stores data in an array of [key, value] pairs and performs linear search.
    const SimpleWeakCollection = function() {
        this.entries = [];
    };

    SimpleWeakCollection.prototype = {
        get: function(key) {
            const entry = this.findEntry(key);
            if (entry) {
                return entry[1];
            }
            return undefined;
        },
        has: function(key) {
            return !!this.findEntry(key);
        },
        set: function(key, value) {
            const entry = this.findEntry(key);
            if (entry) {
                entry[1] = value;
            } else {
                this.entries.push([key, value]);
            }
        },
        delete: function(key) {
            const index = this.findIndex(key);
            if (index > -1) {
                this.entries.splice(index, 1);
                return true;
            }
            return false;
        },
        // Helper to find an entry by key.
        findEntry: function(key) {
            for (let i = 0; i < this.entries.length; i++) {
                if (this.entries[i][0] === key) {
                    return this.entries[i];
                }
            }
            return undefined;
        },
        // Helper to find the index of an entry by key.
        findIndex: function(key) {
            for (let i = 0; i < this.entries.length; i++) {
                if (this.entries[i][0] === key) {
                    return i;
                }
            }
            return -1;
        },
    };

    moduleRef.exports = {
        /**
         * Creates a constructor for Weak collections (WeakMap, WeakSet).
         * @param {function} BaseConstructor - The base constructor function.
         * @param {string} collectionName - The name of the collection (e.g., "WeakMap", "WeakSet").
         * @param {boolean} isMap - True if it's a WeakMap, false if it's a WeakSet.
         * @param {string} addMethodName - The name of the method to add elements ("set" or "add").
         * @returns {function} The new Weak collection constructor.
         */
        getConstructor: function(BaseConstructor, collectionName, isMap, addMethodName) {
            const NewCollection = BaseConstructor(function(instance, iterable) {
                constructorChecker(instance, NewCollection, collectionName);
                setState(instance, {
                    type: collectionName,
                    id: objectIdCounter++, // Unique ID for each WeakMap/WeakSet instance.
                    frozenObjects: undefined, // Stores a SimpleWeakCollection for frozen objects.
                });
                if (iterable != null) {
                    iterateCollection(iterable, instance[addMethodName], instance, isMap);
                }
            });

            const collectionState = getState(collectionName); // Getter for internal state.

            /**
             * Adds or updates an element in the Weak collection.
             * @param {object} collectionInstance - The collection instance.
             * @param {object} key - The key (must be an object).
             * @param {*} value - The value.
             * @returns {object} The collection instance.
             */
            const addOrUpdateElement = function(collectionInstance, key, value) {
                const state = collectionState(collectionInstance);
                const weakData = getWeakData(ensureObject(key), true); // Get weak data from the key object.

                if (weakData === true) { // If key is not extensible (frozen).
                    if (!state.frozenObjects) {
                        state.frozenObjects = new SimpleWeakCollection();
                    }
                    state.frozenObjects.set(key, value);
                } else {
                    weakData[state.id] = value; // Store data on the key object using WeakMap's ID.
                }
                return collectionInstance;
            };

            extendObject(NewCollection.prototype, {
                delete: function(key) {
                    const state = collectionState(this);
                    if (!isObject(key)) {
                        return false; // Keys must be objects.
                    }
                    const weakData = getWeakData(key);
                    if (weakData === true) { // If key is not extensible.
                        return state.frozenObjects && state.frozenObjects.delete(key);
                    }
                    return weakData && delete weakData[state.id];
                },
                has: function(key) {
                    const state = collectionState(this);
                    if (!isObject(key)) {
                        return false; // Keys must be objects.
                    }
                    const weakData = getWeakData(key);
                    if (weakData === true) { // If key is not extensible.
                        return state.frozenObjects && state.frozenObjects.has(key);
                    }
                    return weakData && hasOwn(weakData, state.id);
                },
            });

            extendObject(
                NewCollection.prototype,
                isMap ?
                {
                    get: function(key) {
                        const state = collectionState(this);
                        if (isObject(key)) {
                            const weakData = getWeakData(key);
                            if (weakData === true) { // If key is not extensible.
                                return state.frozenObjects && state.frozenObjects.get(key);
                            }
                            return weakData ? weakData[state.id] : undefined;
                        }
                        return undefined;
                    },
                    set: function(key, value) {
                        return addOrUpdateElement(this, key, value);
                    },
                } :
                {
                    add: function(value) {
                        return addOrUpdateElement(this, value, true); // For Set, value is always true.
                    },
                }
            );

            return NewCollection;
        },
    };
},
/* 133 */
function(moduleRef, moduleExports, localRequire) {
    const mapConstructor = localRequire(92); // Map constructor.
    const sharedGlobal = localRequire(100); // Shared global object.
    const objectCreate = localRequire(27); // Object.create.
    const isObject = localRequire(9); // Check if value is an object.

    // A specialized Map implementation for internal metadata storage.
    // It stores metadata in a hierarchical structure:
    //   globalStore -> target -> property -> metadataKey -> metadataValue
    // This allows associating metadata with specific objects and their properties.
    const CompositeKeyMap = function() {
        this.objectMap = null; // Map for object keys.
        this.symbolMap = null; // Map for symbol keys.
        this.primitiveMap = null; // Map for primitive keys.
        this.objectsByIndex = objectCreate(null); // Map for objects by index (for composite keys).
    };

    CompositeKeyMap.prototype.get = function(keyType, factory) {
        // If a map for keyType doesn't exist, create it using the factory.
        return this[keyType] || (this[keyType] = factory());
    };

    CompositeKeyMap.prototype.next = function(keyIndex, key, isObjectKey) {
        let currentMap;
        if (isObjectKey) {
            // If it's an object key, use objectsByIndex map.
            currentMap = this.objectsByIndex[keyIndex] || (this.objectsByIndex[keyIndex] = new mapConstructor());
        } else {
            // If it's a primitive key, use primitiveMap.
            currentMap = this.primitiveMap || (this.primitiveMap = new mapConstructor());
        }
        let nextMap = currentMap.get(key);
        if (!nextMap) {
            currentMap.set(key, (nextMap = new CompositeKeyMap()));
        }
        return nextMap;
    };

    const globalCompositeKeyStore = new CompositeKeyMap();

    /**
     * Gets a composite key store based on a sequence of arguments.
     * This allows associating data with multiple keys simultaneously.
     * @param {...*} keys - The keys forming the composite key.
     * @returns {CompositeKeyMap} The composite key store for the given keys.
     */
    moduleRef.exports = function() {
        let currentStore = globalCompositeKeyStore;
        let key;
        let i = 0;
        const argCount = arguments.length;

        // First pass: process object keys.
        for (; i < argCount; i++) {
            key = arguments[i];
            if (isObject(key)) {
                currentStore = currentStore.next(i, key, true);
            }
        }

        // Check for special case: if only Object is passed and no other keys, it's an error.
        if (this === Object && currentStore === globalCompositeKeyStore) {
            throw TypeError("Composite keys must contain a non-primitive component");
        }

        // Second pass: process primitive keys.
        for (i = 0; i < argCount; i++) {
            key = arguments[i];
            if (!isObject(key)) {
                currentStore = currentStore.next(i, key, false);
            }
        }

        return currentStore;
    };
},
/* 134 */
function(moduleRef, moduleExports, localRequire) {
    // This module exports Math.scale, or a polyfill if it's not available.
    // Math.scale(x, inLow, inHigh, outLow, outHigh) maps a value from one range to another.
    moduleRef.exports =
        Math.scale ||
        function(value, inLow, inHigh, outLow, outHigh) {
            // Handle edge cases and invalid inputs.
            if (
                arguments.length === 0 ||
                value !== value ||
                inLow !== inLow ||
                inHigh !== inHigh ||
                outLow !== outLow ||
                outHigh !== outHigh
            ) {
                return NaN;
            }
            // Handle infinity values.
            if (value === 1 / 0 || value === -1 / 0) {
                return value;
            }
            // Perform the linear scaling.
            return (value - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
        };
},
/* 135 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const ensureObject = localRequire(1);
    const ensureFunction = localRequire(4);

    /**
     * Adds multiple elements to a collection (Map or Set).
     * @param {...*} elements - The elements to add.
     * @returns {object} The collection instance.
     */
    moduleRef.exports = function() {
        const collection = ensureObject(this);
        const addMethod = ensureFunction(collection.add);
        let i = 0;
        const argCount = arguments.length;

        // Iterate through all provided elements and add them.
        while (i < argCount) {
            addMethod.call(collection, arguments[i++]);
        }
        return collection;
    };
},
/* 136 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0); // Main function to define built-ins
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const globalObject = localRequire(5); // Global object (window, global)
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const isObject = localRequire(9); // Check if value is an object
    const defineProperty = localRequire(10).f; // Object.defineProperty.f
    const assignProperties = localRequire(104); // Object.assign for property descriptors
    const commonUtils = localRequire(1); // ensureObject
    const getSourceOfFunction = localRequire(80); // Get source code of function
    const isWeakMapSupported = localRequire(103); // Check for WeakMap support

    const nativeSymbol = globalObject.Symbol;
    const isSymbolPolyfilled = localRequire(107); // Check if Symbol is polyfilled
    const symbolIdGenerator = localRequire(44); // Generate unique IDs for symbols

    const symbolRegistry = localRequire(60)("symbols"); // Global symbol registry
    const objectSymbolRegistry = localRequire(60)("op-symbols"); // Registry for object symbols
    const stringToSymbolRegistry = localRequire(60)("string-to-symbol-registry"); // Registry for string to symbol
    const symbolToStringRegistry = localRequire(60)("symbol-to-string-registry"); // Registry for symbol to string

    const objectPrototype = Object.prototype;

    // Check if Object.defineProperty works correctly for symbols, especially in IE.
    const ieSymbolBug = localRequire(6)(function() {
        return (
            7 !=
            localRequire(27)(
                defineProperty({}, "a", {
                    get: function() {
                        defineProperty(this, "a", {
                            value: 7
                        });
                    },
                })
            ).a
        );
    });

    // Custom defineProperty for symbols, handling IE bugs.
    const customDefineProperty = ieSymbolBug ?
        function(target, property, descriptor) {
            const existingDescriptor = defineProperty(objectPrototype, property);
            if (existingDescriptor && existingDescriptor.configurable) {
                delete objectPrototype[property]; // Delete existing property if configurable.
            }
            defineProperty(target, property, descriptor);
            if (existingDescriptor && target !== objectPrototype) {
                defineProperty(objectPrototype, property, existingDescriptor); // Restore if needed.
            }
        } :
        defineProperty;

    // Helper to create a new Symbol instance.
    const createSymbol = function(tag, description) {
        const symbolInstance = (symbolRegistry[tag] = localRequire(27)(nativeSymbol.prototype));
        localRequire(16).set(symbolInstance, {
            type: "Symbol",
            tag: tag,
            description: description,
        });
        if (!supportsDescriptors) {
            symbolInstance.description = description; // For non-descriptor environments.
        }
        return symbolInstance;
    };

    /**
     * Defines a property on an object, handling Symbol properties correctly.
     * @param {object} target - The object on which to define the property.
     * @param {string|symbol} property - The name or Symbol of the property.
     * @param {object} descriptor - The property descriptor.
     */
    const defineSymbolProperty = function(target, property, descriptor) {
        // If property is a Symbol, store it in the symbol registry.
        if (target === objectPrototype) {
            defineSymbolProperty(objectSymbolRegistry, property, descriptor);
        }
        localRequire(1)(target); // Ensure target is an object.
        const key = localRequire(31)(property, true); // Convert to primitive key.
        localRequire(1)(descriptor); // Ensure descriptor is an object.

        if (hasOwn(symbolRegistry, key)) {
            // If it's a known symbol, handle its enumerability and define it.
            if (descriptor.enumerable) {
                if (hasOwn(target, symbolIdGenerator("hidden")) && target[symbolIdGenerator("hidden")][key]) {
                    target[symbolIdGenerator("hidden")][key] = false;
                }
                descriptor = localRequire(30)(0, descriptor.value); // Make non-enumerable for internal storage.
            } else {
                if (!hasOwn(target, symbolIdGenerator("hidden"))) {
                    defineProperty(target, symbolIdGenerator("hidden"), localRequire(30)(1, {}));
                }
                target[symbolIdGenerator("hidden")][key] = true;
            }
            customDefineProperty(target, key, descriptor);
        } else {
            defineProperty(target, key, descriptor); // Use native defineProperty.
        }
    };

    /**
     * Copies all own properties (string and symbol) from source to target.
     * @param {object} target - The target object.
     * @param {object} source - The source object.
     * @returns {object} The modified target object.
     */
    const copyAllProperties = function(target, source) {
        localRequire(1)(target); // Ensure target is an object.
        const sourceObject = localRequire(25)(source);
        const allKeys = localRequire(64)(sourceObject).concat(localRequire(83).f(sourceObject)); // Get all keys.

        localRequire(47).forEach(allKeys, function(key) {
            // Copy properties if they are enumerable or if it's a symbol.
            if (supportsDescriptors ? localRequire(58).f.call(sourceObject, key) : hasOwn(sourceObject, key)) {
                defineSymbolProperty(target, key, sourceObject[key]);
            }
        });
        return target;
    };

    /**
     * Custom propertyIsEnumerable for Symbols.
     * @param {*} property - The property to check.
     * @returns {boolean} True if enumerable, false otherwise.
     */
    const symbolPropertyIsEnumerable = function(property) {
        const key = localRequire(31)(property, true);
        const isSymbol = hasOwn(symbolRegistry, key);
        return !(this === objectPrototype && isSymbol && !hasOwn(objectSymbolRegistry, key)) &&
            (!(isSymbol && !hasOwn(this, key) && !hasOwn(this, symbolIdGenerator("hidden"))[key]) ||
                localRequire(58).f.call(this, key));
    };

    /**
     * Custom getOwnPropertyDescriptor for Symbols.
     * @param {object} target - The object.
     * @param {string|symbol} property - The property.
     * @returns {object|undefined} The property descriptor.
     */
    const getSymbolOwnPropertyDescriptor = function(target, property) {
        const targetObject = localRequire(25)(target);
        const key = localRequire(31)(property, true);
        const descriptor = localRequire(19).f(targetObject, key);
        // If it's a symbol, and it exists, ensure enumerable is true.
        if (descriptor && hasOwn(symbolRegistry, key) && !(hasOwn(targetObject, symbolIdGenerator("hidden")) && targetObject[symbolIdGenerator("hidden")][key])) {
            descriptor.enumerable = true;
        }
        return descriptor;
    };

    /**
     * Custom getOwnPropertyNames for Symbols.
     * @param {object} target - The object.
     * @returns {Array<string>} Array of property names.
     */
    const getSymbolOwnPropertyNames = function(target) {
        const result = localRequire(38).f(localRequire(25)(target));
        const symbols = [];
        localRequire(47).forEach(result, function(key) {
            if (!hasOwn(symbolRegistry, key) && !hasOwn(localRequire(45), key)) {
                symbols.push(key);
            }
        });
        return symbols;
    };

    /**
     * Custom getOwnPropertySymbols for Symbols.
     * @param {object} target - The object.
     * @returns {Array<symbol>} Array of symbol properties.
     */
    const getObjectSymbols = function(target) {
        const isPrototype = target === objectPrototype;
        const keys = localRequire(38).f(isPrototype ? objectSymbolRegistry : localRequire(25)(target));
        const result = [];
        localRequire(47).forEach(keys, function(key) {
            if (hasOwn(symbolRegistry, key) && !(isPrototype && !hasOwn(objectPrototype, key))) {
                result.push(symbolRegistry[key]);
            }
        });
        return result;
    };

    // If native Symbol is not supported or needs polyfilling.
    if (!isSymbolPolyfilled) {
        // Polyfill Symbol constructor.
        globalObject.Symbol = function Symbol(description) {
            if (this instanceof Symbol) {
                throw TypeError("Symbol is not a constructor");
            }
            const symbolDesc = arguments.length && description !== undefined ? String(description) : undefined;
            const symbolKey = symbolIdGenerator(symbolDesc); // Generate unique internal key.
            // Define a getter for the symbol on Object.prototype to emulate native behavior.
            const symbolGetter = function(target) {
                if (target === objectPrototype) {
                    symbolGetter.call(objectSymbolRegistry, target);
                }
                if (hasOwn(target, symbolIdGenerator("hidden")) && hasOwn(target[symbolIdGenerator("hidden")], symbolKey)) {
                    target[symbolIdGenerator("hidden")][symbolKey] = false;
                }
                customDefineProperty(target, symbolKey, localRequire(30)(1, target));
            };
            // If descriptors are supported and no WeakMap, set a getter on Object.prototype.
            if (supportsDescriptors && !isWeakMapSupported) {
                customDefineProperty(objectPrototype, symbolKey, {
                    configurable: true,
                    set: symbolGetter,
                });
            }
            return createSymbol(symbolKey, symbolDesc);
        };

        // Extend Symbol.prototype.
        localRequire(20)(globalObject.Symbol.prototype, "toString", function() {
            return localRequire(16).get(this).tag;
        });

        // Override Object.prototype.propertyIsEnumerable.
        localRequire(58).f = symbolPropertyIsEnumerable;
        // Override Object.defineProperty.
        localRequire(10).f = defineSymbolProperty;
        // Override Object.getOwnPropertyDescriptor.
        localRequire(19).f = getSymbolOwnPropertyDescriptor;
        // Override Object.getOwnPropertyNames.
        localRequire(38).f = getSymbolOwnPropertyNames;
        // Override Object.getOwnPropertySymbols.
        localRequire(83).f = getObjectSymbols;

        // If descriptors are supported, define a 'description' getter for Symbol.prototype.
        if (supportsDescriptors) {
            defineProperty(globalObject.Symbol.prototype, "description", {
                configurable: true,
                get: function() {
                    return localRequire(16).get(this).description;
                },
            });
        }
        // If not pure mode, and no Symbol.sham, override Object.prototype.propertyIsEnumerable.
        if (!localRequire(2) && !localRequire(107)) {
            localRequire(20)(objectPrototype, "propertyIsEnumerable", symbolPropertyIsEnumerable, {
                unsafe: true
            });
        }
    }

    // If Symbol.sham is not available, provide a polyfill for Symbol.
    defineBuiltin({
        global: true,
        wrap: true,
        forced: !isSymbolPolyfilled,
        sham: !isSymbolPolyfilled
    }, {
        Symbol: globalObject.Symbol
    });

    // Register well-known symbols.
    localRequire(47).forEach(localRequire(64)(localRequire(60)("wks")), function(symbolName) {
        localRequire(21)(symbolName);
    });

    // Define static methods for Symbol.
    defineBuiltin({
        target: "Symbol",
        stat: true,
        forced: !isSymbolPolyfilled
    }, {
        for: function(key) {
            const stringKey = String(key);
            if (hasOwn(stringToSymbolRegistry, stringKey)) {
                return stringToSymbolRegistry[stringKey];
            }
            const symbol = globalObject.Symbol(stringKey);
            stringToSymbolRegistry[stringKey] = symbol;
            symbolToStringRegistry[symbol] = stringKey;
            return symbol;
        },
        keyFor: function(symbol) {
            if (!localRequire(136).isSymbol(symbol)) {
                throw TypeError(symbol + " is not a symbol");
            }
            if (hasOwn(symbolToStringRegistry, symbol)) {
                return symbolToStringRegistry[symbol];
            }
            return undefined;
        },
        // Non-standard methods for controlling Symbol behavior.
        useSetter: function() {
            isWeakMapSupported = true;
        },
        useSimple: function() {
            isWeakMapSupported = false;
        },
    });

    // Define Object static methods for Symbols.
    defineBuiltin({
        target: "Object",
        stat: true,
        forced: !isSymbolPolyfilled,
        sham: !supportsDescriptors
    }, {
        create: function(proto, descriptors) {
            return descriptors === undefined ?
                localRequire(27)(proto) :
                copyAllProperties(localRequire(27)(proto), descriptors);
        },
        defineProperty: defineSymbolProperty,
        defineProperties: copyAllProperties,
        getOwnPropertyDescriptor: getSymbolOwnPropertyDescriptor,
    });

    // Define Object static methods for Symbol properties.
    defineBuiltin({
        target: "Object",
        stat: true,
        forced: !isSymbolPolyfilled
    }, {
        getOwnPropertyNames: getSymbolOwnPropertyNames,
        getOwnPropertySymbols: getObjectSymbols,
    });

    // Polyfill JSON.stringify for Symbols.
    const nativeJSONStringify = globalObject.JSON && globalObject.JSON.stringify;
    defineBuiltin({
        target: "JSON",
        stat: true,
        forced: !isSymbolPolyfilled || localRequire(6)(function() {
            const sym = globalObject.Symbol();
            return (
                "[null]" != nativeJSONStringify([sym]) ||
                "{}" != nativeJSONStringify({
                    a: sym
                }) ||
                "{}" != nativeJSONStringify(Object(sym))
            );
        }),
    }, {
        stringify: function(value, replacer, space) {
            const args = [value];
            let i = 1;
            const argCount = arguments.length;
            let currentReplacer = replacer;

            while (i < argCount) {
                args.push(arguments[i++]);
            }

            // If replacer is a function and value is not a Symbol, apply custom replacer.
            if (isObject(replacer) || value !== undefined && !localRequire(136).isSymbol(value)) {
                if (!localRequire(46)(replacer)) {
                    currentReplacer = function(key, val) {
                        if (typeof currentReplacer === "function") {
                            val = currentReplacer.call(this, key, val);
                        }
                        if (!localRequire(136).isSymbol(val)) {
                            return val;
                        }
                    };
                }
                args[1] = currentReplacer;
            }

            return nativeJSONStringify.apply(null, args);
        },
    });

    // Define Symbol.prototype[Symbol.toPrimitive].
    if (!globalObject.Symbol.prototype[localRequire(7)("toPrimitive")]) {
        localRequire(18)(globalObject.Symbol.prototype, localRequire(7)("toPrimitive"), globalObject.Symbol.prototype.valueOf);
    }

    // Set Symbol.toStringTag for Symbol constructor.
    localRequire(28)(globalObject.Symbol, "Symbol");

    localRequire(45)[symbolIdGenerator("hidden")] = true; // Mark internal symbol key as hidden.

    moduleRef.exports = {
        isSymbol: function(value) {
            return Object(value) instanceof globalObject.Symbol;
        },
    };
},
/* 137 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0); // Main function to define built-ins
    const supportsDescriptors = localRequire(8); // Check for Object.defineProperty support
    const globalObject = localRequire(5); // Global object (window, global)
    const defineProperties = localRequire(108); // Define multiple properties
    const defineProperty = localRequire(20); // Helper to define properties
    const constructorChecker = localRequire(32); // Constructor invocation check
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const bindCallable = localRequire(13); // Function.prototype.bind
    const toObject = localRequire(15); // Convert to object
    const isObject = localRequire(9); // Check if value is an object
    const createObject = localRequire(27); // Object.create
    const createPropertyDescriptor = localRequire(30); // Property descriptor factory
    const setToStringTag = localRequire(28); // Set Symbol.toStringTag
    const iterateCollection = localRequire(3); // Iterator utility
    const isError = localRequire(65); // Check for constructor from iterable
    const getBuiltIn = localRequire(12); // Get built-in objects
    const resolvePromise = localRequire(125); // Resolve a promise
    const logError = localRequire(126); // Log errors to console
    const stateManagement = localRequire(16); // Internal state management
    const setState = stateManagement.set; // Set internal state
    const getState = stateManagement.getterFor; // Get state for a type
    const featureChecker = localRequire(63); // Check if feature is forced polyfill
    const wellKnownSymbol = localRequire(7); // Symbol helper
    const userAgent = localRequire(86); // User agent string

    const speciesSymbol = wellKnownSymbol("species");
    const nativePromise = globalObject.Promise;
    const isNode = typeof globalObject.process === "object" && globalObject.process.versions && globalObject.process.versions.v8;
    const isEdge = /Edge\/(\d+)/.test(userAgent);
    const isChrome = /Chrome\/(\d+)/.test(userAgent);
    const isSafari = /Safari\/(\d+)/.test(userAgent) && !isChrome && !isEdge;
    const v8Version = isNode ? (globalObject.process.versions.v8.split(".")[0] + globalObject.process.versions.v8.split(".")[1]) : (isChrome ? userAgent.match(/Chrome\/(\d+)/)[1] : (isEdge ? userAgent.match(/Edge\/(\d+)/)[1] : null));

    let promiseConstructor = nativePromise;
    let promisePrototype = nativePromise && nativePromise.prototype;
    const promiseProtoThen = promisePrototype && promisePrototype.then;

    // Check if Promise needs polyfilling or has bugs.
    const isPromiseBuggy = featureChecker(
        "Promise",
        !globalObject.Promise ||
        isError(function() {
            // Test if Promise.resolve().then() works.
            if (String(nativePromise) !== String(nativePromise)) {
                // Check V8 version for specific bugs.
                if (v8Version === 66) {
                    return true;
                }
                if (!isNode && typeof PromiseRejectionEvent === "function") {
                    return true;
                }
            }
            // If Symbol.species is broken.
            if (localRequire(2) && !nativePromise.prototype.finally) {
                return true;
            }
            if (v8Version >= 51 && /native code/.test(nativePromise)) {
                return false; // Native is good.
            }
            // Test if Promise.all handles species correctly.
            const p = nativePromise.resolve(1);
            const C = function(executor) {
                executor(function() {}, function() {});
            };
            const customPromise = (p.constructor = {})[speciesSymbol] = C;
            return !(p.then(function() {}) instanceof customPromise);
        })
    );

    // If Promise is buggy or needs polyfilling.
    if (isPromiseBuggy) {
        // Internal state for promises.
        const PENDING = 0;
        const FULFILLED = 1;
        const REJECTED = 2;

        const ASYNC = 0; // Async execution mode.

        // Microtask queue for promise jobs.
        const microtaskScheduler = localRequire(124);

        // Event for unhandled rejections.
        const isBrowser = typeof document === "object" && document.createEvent && globalObject.dispatchEvent;

        const notifySubscribers = function(promiseInstance, promiseState, triggerUnhandledRejection) {
            if (!promiseState.notified) {
                promiseState.notified = true;
                const subscribers = promiseState.reactions;
                microtaskScheduler(function() {
                    const value = promiseState.value;
                    const status = promiseState.status === FULFILLED; // True for fulfilled.
                    let i = 0;
                    while (subscribers.length > i) {
                        const subscriber = subscribers[i++];
                        const onFulfilled = status ? subscriber.onFulfilled : subscriber.onRejected;
                        const resolve = subscriber.resolve;
                        const reject = subscriber.reject;
                        const domain = subscriber.domain; // Node.js domain support.

                        try {
                            // Execute callback in domain if available.
                            if (domain) domain.enter();
                            const result = onFulfilled === true ? value : onFulfilled(value);
                            if (domain) domain.exit();

                            // Handle promise-chain cycles.
                            if (result === subscriber.promise) {
                                reject(TypeError("Promise-chain cycle"));
                            } else {
                                // Resolve or reject the next promise in the chain.
                                const thenable = getThenable(result);
                                if (thenable) {
                                    thenable.call(result, resolve, reject);
                                } else {
                                    resolve(result);
                                }
                            }
                        } catch (error) {
                            if (domain) domain.exit();
                            reject(error);
                        }
                    }
                    promiseState.reactions = []; // Clear reactions.
                    promiseState.notified = false;
                    if (triggerUnhandledRejection && !promiseState.rejectionHandled) {
                        handleUnhandledRejection(promiseInstance, promiseState);
                    }
                });
            }
        };

        const handleUnhandledRejection = function(promiseInstance, promiseState) {
            microtaskScheduler(function() {
                const error = promiseState.value;
                if (isUnhandledRejection(promiseState)) {
                    // Node.js specific unhandledRejection event.
                    if (isNode) {
                        globalObject.process.emit("unhandledRejection", error, promiseInstance);
                    } else if (isBrowser) {
                        // Browser specific unhandledrejection event.
                        const event = document.createEvent("Event");
                        event.promise = promiseInstance;
                        event.reason = error;
                        event.initEvent("unhandledrejection", false, true);
                        globalObject.dispatchEvent(event);
                    } else {
                        logError("Unhandled promise rejection", error);
                    }
                    promiseState.rejectionStatus = isNode || isUnhandledRejection(promiseState) ? 2 : 1;
                }
            });
        };

        const isUnhandledRejection = function(promiseState) {
            return promiseState.rejectionStatus !== FULFILLED && !promiseState.parent;
        };

        const handleRejectionHandled = function(promiseInstance, promiseState) {
            microtaskScheduler(function() {
                if (isNode) {
                    globalObject.process.emit("rejectionHandled", promiseInstance);
                } else if (isBrowser) {
                    const event = document.createEvent("Event");
                    event.promise = promiseInstance;
                    event.reason = promiseState.value;
                    event.initEvent("rejectionhandled", false, true);
                    globalObject.dispatchEvent(event);
                }
            });
        };

        const createCallback = function(resolveReject, promiseInstance, promiseState, isFinal) {
            return function(value) {
                // If the promise is already settled, do nothing.
                if (promiseState.status !== PENDING) {
                    return;
                }
                promiseState.status = resolveReject; // Set status (fulfilled or rejected).
                promiseState.value = value; // Set value.
                notifySubscribers(promiseInstance, promiseState, isFinal); // Notify subscribers.
            };
        };

        const resolvePromiseInternal = function(promiseInstance, promiseState, value) {
            // If the promise is already settled, do nothing.
            if (promiseState.status !== PENDING) {
                return;
            }
            promiseState.status = FULFILLED;
            promiseState.value = value;
            notifySubscribers(promiseInstance, promiseState, false);
        };

        const rejectPromiseInternal = function(promiseInstance, promiseState, reason) {
            // If the promise is already settled, do nothing.
            if (promiseState.status !== PENDING) {
                return;
            }
            promiseState.status = REJECTED;
            promiseState.value = reason;
            notifySubscribers(promiseInstance, promiseState, true);
        };

        const getThenable = function(value) {
            let then;
            return isObject(value) && typeof (then = value.then) === "function" ? then : undefined;
        };

        const PromisePolyfill = function Promise(executor) {
            constructorChecker(this, PromisePolyfill, "Promise");
            localRequire(4)(executor); // Ensure executor is a function.

            const promiseState = {
                type: "Promise",
                status: PENDING, // 0: pending, 1: fulfilled, 2: rejected
                value: undefined,
                reactions: [], // Callbacks to be executed when settled.
                notified: false, // Flag to prevent multiple notifications.
                parent: false, // Flag for parent promise in chain.
                rejectionHandled: false, // Flag for unhandled rejections.
            };
            setState(this, promiseState);

            try {
                executor(
                    createCallback(FULFILLED, this, promiseState, false),
                    createCallback(REJECTED, this, promiseState, true)
                );
            } catch (error) {
                createCallback(REJECTED, this, promiseState, true)(error);
            }
        };

        // Create a base constructor for the polyfilled Promise.
        const BasePromiseConstructor = function(promiseInstance) {
            setState(this, {
                type: "Promise",
                status: PENDING,
                value: undefined,
                reactions: [],
                notified: false,
                parent: false,
                rejectionHandled: false,
            });
        };

        BasePromiseConstructor.prototype = defineProperties(promisePrototype, {
            then: createPropertyDescriptor(1, function(onFulfilled, onRejected) {
                const state = getState("Promise")(this);
                const nextPromise = createDeferredPromise.f(localRequire(23)(this, PromisePolyfill)); // Create a new promise for the chain.

                nextPromise.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : true;
                nextPromise.onRejected = typeof onRejected === "function" ? onRejected : undefined;
                nextPromise.domain = isNode ? globalObject.process.domain : undefined; // Capture domain.

                state.parent = true; // Mark as parent in chain.
                state.reactions.push(nextPromise);

                if (state.status !== PENDING) {
                    notifySubscribers(this, state, false); // Notify if already settled.
                }
                return nextPromise.promise;
            }),
            catch: createPropertyDescriptor(1, function(onRejected) {
                return this.then(undefined, onRejected);
            }),
        });

        // Initialize the deferred promise factory.
        const createDeferredPromise = localRequire(54); // Get deferred promise factory.

        // Override the factory to use our polyfilled Promise.
        createDeferredPromise.f = function(PromiseConstructor) {
            return PromiseConstructor === PromisePolyfill || PromiseConstructor === nativePromise ?
                new DeferredPromise(PromiseConstructor) :
                createDeferredPromise.f(PromiseConstructor);
        };

        const DeferredPromise = function(PromiseConstructor) {
            let resolveFn, rejectFn;
            this.promise = new PromiseConstructor(function(resolve, reject) {
                if (resolveFn !== undefined || rejectFn !== undefined) {
                    throw TypeError("Bad Promise constructor");
                }
                resolveFn = resolve;
                rejectFn = reject;
            });
            this.resolve = localRequire(4)(resolveFn);
            this.reject = localRequire(4)(rejectFn);
        };

        // If not pure mode, and native Promise.prototype.then exists, override it.
        if (!localRequire(2) && typeof promiseProtoThen === "function") {
            defineProperty(nativePromise.prototype, "then", function(onFulfilled, onRejected) {
                const promise = this;
                return new PromisePolyfill(function(resolve, reject) {
                    promiseProtoThen.call(promise, resolve, reject);
                }).then(onFulfilled, onRejected);
            }, {
                unsafe: true
            });

            // If fetch API is available, polyfill it to use our Promise.
            const nativeFetch = getBuiltIn("fetch");
            if (typeof nativeFetch === "function") {
                defineBuiltin({
                    global: true,
                    enumerable: true,
                    forced: true
                }, {
                    fetch: function(input) {
                        const args = [input];
                        let options;
                        if (arguments.length > 1 && (options = arguments[1]) && isObject(options)) {
                            // Handle URLSearchParams in fetch body.
                            if (localRequire(52)(options.body) === "URLSearchParams") {
                                const headers = options.headers ? new (getBuiltIn("Headers"))(options.headers) : new (getBuiltIn("Headers"));
                                if (!headers.has("content-type")) {
                                    headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
                                }
                                options = localRequire(27)(options, {
                                    body: localRequire(30)(0, String(options.body)),
                                    headers: localRequire(30)(0, headers),
                                });
                            }
                            args.push(options);
                        }
                        return nativeFetch.apply(this, args);
                    },
                });
            }
        }
        promiseConstructor = PromisePolyfill; // Use our polyfilled constructor.
    }

    // Define the Promise constructor globally.
    defineBuiltin({
        global: true,
        wrap: true,
        forced: isPromiseBuggy
    }, {
        Promise: promiseConstructor
    });

    // Set Symbol.toStringTag for Promise.
    setToStringTag(promiseConstructor, "Promise", false, true);
    localRequire(42)("Promise"); // Register Promise for species.

    // Get the actual Promise constructor (could be native or polyfilled).
    const CurrentPromise = getBuiltIn("Promise");

    // Define static methods for Promise.
    defineBuiltin({
        target: "Promise",
        stat: true,
        forced: isPromiseBuggy
    }, {
        reject: function(reason) {
            const deferred = createDeferredPromise.f(this);
            deferred.reject.call(undefined, reason);
            return deferred.promise;
        },
    });

    defineBuiltin({
        target: "Promise",
        stat: true,
        forced: localRequire(2) || isPromiseBuggy
    }, {
        resolve: function(value) {
            return resolvePromise(localRequire(2) && this === CurrentPromise ? promiseConstructor : this, value);
        },
    });

    defineBuiltin({
        target: "Promise",
        stat: true,
        forced: isPromiseBuggy || !isError(function(iterable) {
            // Test if Promise.all handles iterables correctly.
            CurrentPromise.all(iterable).catch(function() {});
        }),
    }, {
        all: function(iterable) {
            const PromiseConstructor = this;
            const deferred = createDeferredPromise.f(PromiseConstructor);
            const resolve = deferred.resolve;
            const reject = deferred.reject;
            const capturedResult = localRequire(69)(function() {
                const values = [];
                let counter = 0;
                let pending = 1; // Start with 1 to account for the main promise.
                iterateCollection(iterable, function(value) {
                    const index = counter++;
                    let settled = false;
                    values.push(undefined); // Pre-allocate space.
                    pending++;
                    PromiseConstructor.resolve(value).then(function(item) {
                        if (!settled) {
                            settled = true;
                            values[index] = item;
                            if (!--pending) {
                                resolve(values);
                            }
                        }
                    }, reject);
                });
                if (!--pending) {
                    resolve(values);
                }
            });
            if (capturedResult.error) {
                reject(capturedResult.value);
            }
            return deferred.promise;
        },
        race: function(iterable) {
            const PromiseConstructor = this;
            const deferred = createDeferredPromise.f(PromiseConstructor);
            const reject = deferred.reject;
            const capturedResult = localRequire(69)(function() {
                const resolve = localRequire(4)(PromiseConstructor.resolve);
                iterateCollection(iterable, function(value) {
                    resolve.call(PromiseConstructor, value).then(deferred.resolve, reject);
                });
            });
            if (capturedResult.error) {
                reject(capturedResult.value);
            }
            return deferred.promise;
        },
    });

    moduleRef.exports = {
        URLSearchParams: localRequire(137).URLSearchParams,
        getState: localRequire(137).getState,
    };
},
/* 138 */
function(moduleRef, moduleExports, localRequire) {
    // This module exports the native Node.js 'fs' (file system) module.
    // In a browser environment, this would likely be an empty object or a polyfill.
    moduleRef.exports = localRequire("fs");
},
/* 139 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(0)({
        target: "Array",
        proto: true
    }, {
        at: localRequire(56).charAt
    });
},
/* 140 */
function(moduleRef, moduleExports, localRequire) {
    const toObject = localRequire(25);
    const getOwnPropertyNames = localRequire(38).f; // Object.getOwnPropertyNames.f
    const globalObject = localRequire(5); // Global object (window, global)

    const windowPropertyNames = typeof window === "object" && window && Object.getOwnPropertyNames ?
        Object.getOwnPropertyNames(window) :
        [];

    const objectToString = {}.toString;

    moduleRef.exports = {
        /**
         * Returns an array of an object's own enumerable and non-enumerable property names.
         * This is a polyfill helper for `Object.getOwnPropertyNames`.
         * @param {object} object - The object to inspect.
         * @returns {Array<string>} An array of property names.
         */
        f: function(object) {
            // Special handling for the window object in browsers.
            if (windowPropertyNames && objectToString.call(object) === "[object Window]") {
                return (function(windowObject) {
                    try {
                        return getOwnPropertyNames(windowObject); // Try native getOwnPropertyNames.
                    } catch (error) {
                        return windowPropertyNames.slice(); // Fallback to cached names.
                    }
                })(object);
            }
            return getOwnPropertyNames(toObject(object));
        },
    };
},
/* 141 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(136); // Load Symbol polyfills.
    localRequire(140); // Load Object.getOwnPropertyNames polyfills.
},
/* 142 */
function(moduleRef, moduleExports, localRequire) {
    const defineBuiltin = localRequire(0);
    const globalObject = localRequire(5);
    const defineProperty = localRequire(10).f; // Object.defineProperty.f
    const isError = localRequire(6); // Error handling utility
    const hasOwn = localRequire(14); // Object.prototype.hasOwnProperty.call
    const isObject = localRequire(9); // Check if value is an object
    const assignProperties = localRequire(104); // Object.assign for property descriptors

    const nativeSymbol = globalObject.Symbol;

    // Check if the native Symbol constructor has a 'description' property on its prototype,
    // and if the description of a newly created symbol is undefined.
    const symbolDescriptionBug =
        !supportsDescriptors ||
        typeof nativeSymbol !== "function" ||
        !("description" in nativeSymbol.prototype) ||
        nativeSymbol().description !== undefined;

    // If Symbol has description bug, polyfill it.
    if (symbolDescriptionBug) {
        const SymbolPolyfill = function Symbol(description) {
            const sym = arguments.length < 1 || description === undefined ?
                nativeSymbol() :
                nativeSymbol(description); // Call native Symbol.
            // Store description in a private registry if empty.
            if (String(description) === "") {
                symbolDescriptionRegistry[sym] = true;
            }
            return sym;
        };

        // Copy static methods from native Symbol.
        assignProperties(SymbolPolyfill, nativeSymbol);

        const symbolDescriptionRegistry = {}; // Registry for empty descriptions.

        const nativeSymbolPrototype = nativeSymbol.prototype;
        const nativeSymbolToString = nativeSymbolPrototype.toString;
        const testSymbol = nativeSymbol("test");
        const isNativeToStringCorrect = String(testSymbol) === "Symbol(test)"; // Check native toString output.
        const symbolRegex = /^Symbol\((.*)\)[^)]+$/; // Regex to extract description.

        // Define 'description' getter on Symbol.prototype.
        defineProperty(nativeSymbolPrototype, "description", {
            configurable: true,
            get: function() {
                const sym = isObject(this) ? this.valueOf() : this;
                const str = nativeSymbolToString.call(sym);
                if (hasOwn(symbolDescriptionRegistry, sym)) {
                    return ""; // Return empty string if registered as empty.
                }
                const descriptionMatch = isNativeToStringCorrect ?
                    str.slice(7, -1) :
                    str.replace(symbolRegex, "$1");
                return descriptionMatch === "" ? undefined : descriptionMatch;
            },
        });

        // Define the polyfilled Symbol globally.
        defineBuiltin({
            global: true,
            forced: true
        }, {
            Symbol: SymbolPolyfill
        });
    }
},
/* 143 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("asyncIterator");
},
/* 144 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("hasInstance");
},
/* 145 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("isConcatSpreadable");
},
/* 146 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("match");
},
/* 147 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("replace");
},
/* 148 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("search");
},
/* 149 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("species");
},
/* 150 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("split");
},
/* 151 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("toPrimitive");
},
/* 152 */
function(moduleRef, moduleExports, localRequire) {
    localRequire(21)("toStringTag");
},
/* 153 */
function(moduleRef, moduleExports, localRequire) {
    "use strict";
    const defineBuiltin = localRequire(0);
    const isError = localRequire(6);
    const isArray = localRequire(46);
    const isObject = localRequire(9);
    const toObject = localRequire(15);
    const toLength = localRequire(11);
    const setProperty = localRequire(39); // Define property on object
    const arraySpeciesCreate = localRequire(48); // Create array using species constructor
    const arraySpeciesSupport = localRequire(49)("concat"); // Check for species support in concat