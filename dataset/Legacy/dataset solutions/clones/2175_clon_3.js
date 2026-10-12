let moduleDefinitions = ((moduleExports) => {
    // A cache for loaded modules
    let moduleCache = {};

    // The main module loading function (mimics webpack's __webpack_require__)
    function requireModule(moduleId) {
        // Check if module is already in cache
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Create a new module entry in the cache
        let currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        // Execute the module function, populating its exports
        moduleExports[moduleId].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            requireModule
        );

        // Mark the module as loaded
        currentModule.loaded = true;

        // Return the module's exports
        return currentModule.exports;
    }

    // Assign internal module definitions to the loader
    requireModule.moduleSources = moduleExports;
    // Assign the module cache to the loader
    requireModule.moduleInstances = moduleCache;

    // Helper to define a property on an object (for exports)
    requireModule.defineExportProperty = function (targetObject, propertyName, getterFunction) {
        // Ensure property doesn't already exist or isn't enumerable
        if (!requireModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Helper to register an object as an ES Module
    requireModule.registerESModule = function (targetExports) {
        // Check for Symbol availability and toStringTag for module naming
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetExports, '__esModule', { value: true });
    };

    // Helper for interop requiring, creating a namespace object from a module
    requireModule.createModuleNamespace = function (importedModule, mode) {
        // If mode indicates module is already loaded or should be loaded
        if (mode & 1) {
            importedModule = requireModule(importedModule);
        }

        // If mode indicates raw module should be returned
        if (mode & 8) {
            return importedModule;
        }

        // If mode indicates it's an ES module object
        if (mode & 4 && typeof importedModule === 'object' && importedModule && importedModule.__esModule) {
            return importedModule;
        }

        // Otherwise, create a new namespace object
        let namespaceObject = Object.create(null);
        requireModule.registerESModule(namespaceObject); // Mark as ES Module
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: importedModule });

        // If mode includes 2 and it's not a string, copy all properties
        if ((mode & 2) && typeof importedModule !== 'string') {
            for (const exportKey in importedModule) {
                // Define getters for each export to link to the original module's properties
                requireModule.defineExportProperty(namespaceObject, exportKey, () => importedModule[exportKey]);
            }
        }
        return namespaceObject;
    };

    // Helper to create a getter for default exports
    requireModule.createDefaultExportAccessor = function (moduleObject) {
        const defaultExportGetter = moduleObject && moduleObject.__esModule ?
            () => moduleObject.default :
            () => moduleObject;
        // Also add a 'a' property pointing to the getter for compatibility
        requireModule.defineExportProperty(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    // Polyfill for Object.prototype.hasOwnProperty.call
    requireModule.hasOwn = function (targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path (empty string in this configuration)
    requireModule.publicPath = "";

    // Set the entry point module ID and start execution
    const entryModuleId = 133;
    requireModule.startupModuleId = entryModuleId;
    return requireModule(entryModuleId);

})([
    // Module 0
    function (module, exports, requireModule) {
        // This module defines a utility for common module operations, similar to core-js's `_export`
        let globalScope = requireModule(5); // Global object (window, global, etc.)
        let getOwnPropertyDesc = requireModule(22).f; // Object.getOwnPropertyDescriptor
        let defineNonEnumerable = requireModule(16); // Define a non-enumerable property
        let hasProperty = requireModule(14); // Check if an object has a property
        let createNamedProperty = requireModule(23); // Define a property with a name and value
        let createObjectFromValue = requireModule(79); // Create an object from a value
        let copyProperties = requireModule(100); // Copy properties from one object to another
        let checkCondition = requireModule(62); // Check if a condition is met

        module.exports = function (exportConfig, propertyMap) {
            let target = exportConfig.target;
            let isGlobal = exportConfig.global;
            let isStatic = exportConfig.stat;
            let currentTarget;

            if (isGlobal) {
                currentTarget = globalScope;
            } else if (isStatic) {
                currentTarget = globalScope[target] || createObjectFromValue(target, {});
            } else {
                currentTarget = (globalScope[target] || {}).prototype;
            }

            if (currentTarget) {
                for (let propName in propertyMap) {
                    let newValue = propertyMap[propName];
                    let existingValue;
                    let descriptor;

                    // Get existing property descriptor or value
                    if (exportConfig.noTargetGet) {
                        descriptor = getOwnPropertyDesc(currentTarget, propName);
                        existingValue = descriptor && descriptor.value;
                    } else {
                        existingValue = currentTarget[propName];
                    }

                    // Check if forced update is needed
                    let isForced = checkCondition(
                        isGlobal ? propName : target + (isStatic ? "." : "#") + propName,
                        exportConfig.forced
                    );

                    if (!isForced && typeof newValue === typeof existingValue) {
                        // If not forced and types match, skip unless sham is needed
                        // continue; // Original code had 'continue', but the logic below also handles it.
                    } else {
                        // If types don't match or forced, apply changes
                        if (typeof newValue !== typeof existingValue) {
                            // If types are different, copy properties from existing to new
                            copyProperties(newValue, existingValue);
                        }
                    }

                    // Handle 'sham' property (for polyfills)
                    if ((exportConfig.sham || (existingValue && existingValue.sham)) && defineNonEnumerable) {
                        defineNonEnumerable(newValue, "sham", true);
                    }

                    // Apply the new property
                    createNamedProperty(currentTarget, propName, newValue, exportConfig);
                }
            }
        };
    },
    // Module 1
    function (module, exports, requireModule) {
        // Utility to check if a value is an object; throws TypeError if not
        let isObjectCheck = requireModule(8);
        module.exports = function (value) {
            if (!isObjectCheck(value)) {
                throw TypeError(String(value) + " is not an object");
            }
            return value;
        };
    },
    // Module 2
    function (module, exports) {
        // Flag indicating if the environment is 'pure' (no global pollution)
        module.exports = false;
    },
    // Module 3
    function (module, exports, requireModule) {
        // This module provides an iterator helper function `iterateOver`
        let validateObject = requireModule(1); // Ensures value is an object
        let getBoundFunction = requireModule(84); // Binds a function to a context
        let getIteratorMethod = requireModule(10); // Gets the @@iterator method
        let isCallable = requireModule(13); // Checks if value is callable
        let getIterator = requireModule(52); // Gets an iterator from a value
        let consumeIterator = requireModule(108); // Consumes an iterator
        let checkArrayLike = requireModule(4); // Checks if an object is array-like

        // Internal class to signal early termination of iteration
        let StopIterationSignal = function (stopped, result) {
            this.stopped = stopped;
            this.result = result;
        };

        // The main iteration function
        let iterateOver = function (iterable, callback, context, isArrayLike, earlyReturn) {
            let boundCallback, iterableIterator, iterationResult, currentItem, internalIterator;
            let index = 0;

            // Bind the callback function to the provided context
            boundCallback = isCallable(callback, context, isArrayLike ? 2 : 1);

            if (earlyReturn) {
                iterableIterator = iterable;
            } else {
                // Get the iterator method for the iterable
                let iteratorMethod = getIterator(iterable);
                if (typeof iteratorMethod !== "function") {
                    throw TypeError("Target is not iterable");
                }
                internalIterator = iteratorMethod(iterable);

                // If it's an array-like object and we have a native iterator, use a simple loop
                if (getBoundFunction(internalIterator)) {
                    for (let i = 0; i < getIteratorMethod(iterable.length); i++) {
                        currentItem = isArrayLike ? boundCallback(validateObject(iterable[i])[0], iterable[i][1]) : boundCallback(iterable[i]);
                        if (currentItem instanceof StopIterationSignal) {
                            return currentItem;
                        }
                    }
                    return new StopIterationSignal(false);
                }
                iterableIterator = internalIterator;
            }

            // Iterate through the items
            while (!(iterationResult = iterableIterator.next()).done) {
                currentItem = consumeIterator(iterableIterator, boundCallback, iterationResult.value, isArrayLike);
                if (currentItem instanceof StopIterationSignal) {
                    return currentItem;
                }
            }
            return new StopIterationSignal(false);
        };

        iterateOver.stop = function (result) {
            return new StopIterationSignal(true, result);
        };

        module.exports = iterateOver;
    },
    // Module 4
    function (module, exports) {
        // Utility to ensure a value is a function; throws TypeError if not
        module.exports = function (func) {
            if (typeof func !== "function") {
                throw TypeError(String(func) + " is not a function");
            }
            return func;
        };
    },
    // Module 5
    function (module, exports) {
        // Get the global object (window in browsers, global in Node.js)
        let determineGlobal = function (candidate) {
            return candidate && candidate.Math === Math && candidate;
        };
        module.exports = determineGlobal(typeof globalThis === "object" && globalThis) ||
            determineGlobal(typeof window === "object" && window) ||
            determineGlobal(typeof self === "object" && self) ||
            determineGlobal(typeof global === "object" && global) ||
            Function("return this")();
    },
    // Module 6
    function (module, exports, requireModule) {
        // This module provides a way to get well-known symbols (WKS)
        let globalScope = requireModule(5);
        let sharedSymbols = requireModule(38); // Shared symbol registry
        let defineBuiltinSymbol = requireModule(45); // Define a new symbol
        let useNativeSymbols = requireModule(102); // Check if native Symbols are available
        let nativeSymbol = globalScope.Symbol;

        module.exports = function (symbolName) {
            // Retrieve symbol from shared registry or create a new one
            let symbol = sharedSymbols("wks");
            return symbol[symbolName] ||
                (symbol[symbolName] = useNativeSymbols && nativeSymbol[symbolName] ||
                    (useNativeSymbols ? nativeSymbol : defineBuiltinSymbol)("Symbol." + symbolName));
        };
    },
    // Module 7
    function (module, exports) {
        // Utility to check if an operation throws an error
        module.exports = function (operation) {
            try {
                return !!operation();
            } catch (error) {
                return true;
            }
        };
    },
    // Module 8
    function (module, exports) {
        // Utility to check if a value is an object (non-null and not a primitive)
        module.exports = function (value) {
            return typeof value === "object" ? value !== null : typeof value === "function";
        };
    },
    // Module 9
    function (module, exports, requireModule) {
        // Check if Object.defineProperty is working correctly (detects IE8 and older)
        let testError = requireModule(7);
        module.exports = !testError(function () {
            return Object.defineProperty({}, "a", {
                get: function () {
                    return 7;
                }
            }).a !== 7;
        });
    },
    // Module 10
    function (module, exports, requireModule) {
        // Utility to convert a value to a valid array length (non-negative integer)
        let toInteger = requireModule(24);
        let mathMin = Math.min;
        module.exports = function (value) {
            let result = toInteger(value);
            return result > 0 ? mathMin(result, 9007199254740991) : 0; // Max safe integer
        };
    },
    // Module 11
    function (module, exports, requireModule) {
        // Define an object property, handling non-configurable properties for older environments
        let supportsDefineProperty = requireModule(9);
        let getObject = requireModule(97); // Checks if Object.defineProperty is reliable
        let validateObject = requireModule(1);
        let toPropertyKey = requireModule(29);
        let createPropertyDescriptor = requireModule(35);
        let definePropertyNative = Object.defineProperty;

        exports.f = supportsDefineProperty ? definePropertyNative : function (target, property, descriptor) {
            validateObject(target);
            property = toPropertyKey(property, true);
            validateObject(descriptor);

            // Handle potential errors with Object.defineProperty (e.g., in IE8)
            if (getObject) {
                try {
                    return definePropertyNative(target, property, descriptor);
                } catch (e) {
                    // Fallback if native defineProperty fails
                }
            }

            // If accessors are not supported or failed, directly assign value
            if ("get" in descriptor || "set" in descriptor) {
                throw TypeError("Accessors not supported");
            }
            if ("value" in descriptor) {
                target[property] = descriptor.value;
            }
            return target;
        };
    },
    // Module 12
    function (module, exports, requireModule) {
        // Get a global or specific object from the environment
        let getBuiltIn = requireModule(81); // Get a global object by name
        let globalScope = requireModule(5); // The global object

        let isFunction = function (value) {
            return typeof value === "function" ? value : undefined;
        };

        module.exports = function (namespace, property) {
            let result;
            if (arguments.length < 2) {
                // If only one argument, try to get it from global or built-in
                result = isFunction(getBuiltIn[namespace]) || isFunction(globalScope[namespace]);
            } else {
                // If two arguments, try to get it from the specified namespace
                result = (getBuiltIn[namespace] && getBuiltIn[namespace][property]) ||
                    (globalScope[namespace] && globalScope[namespace][property]);
            }
            return result;
        };
    },
    // Module 13
    function (module, exports, requireModule) {
        // Utility to create a bound function with a specified argument count
        let validateFunction = requireModule(4);
        module.exports = function (originalFunction, bindContext, argCount) {
            validateFunction(originalFunction);
            if (bindContext === undefined) {
                return originalFunction;
            }
            switch (argCount) {
                case 0:
                    return function () {
                        return originalFunction.call(bindContext);
                    };
                case 1:
                    return function (arg1) {
                        return originalFunction.call(bindContext, arg1);
                    };
                case 2:
                    return function (arg1, arg2) {
                        return originalFunction.call(bindContext, arg1, arg2);
                    };
                case 3:
                    return function (arg1, arg2, arg3) {
                        return originalFunction.call(bindContext, arg1, arg2, arg3);
                    };
            }
            // Fallback for arbitrary argument count
            return function () {
                return originalFunction.apply(bindContext, arguments);
            };
        };
    },
    // Module 14
    function (module, exports) {
        // Simple hasOwnProperty check
        let objectHasOwnProperty = {}.hasOwnProperty;
        module.exports = function (obj, prop) {
            return objectHasOwnProperty.call(obj, prop);
        };
    },
    // Module 15
    function (module, exports, requireModule) {
        // Converts a value to an object, throwing an error if it's null or undefined
        let requireObjectCoercible = requireModule(17);
        module.exports = function (value) {
            return Object(requireObjectCoercible(value));
        };
    },
    // Module 16
    function (module, exports, requireModule) {
        // Defines a non-enumerable property on an object
        let supportsDefineProperty = requireModule(9);
        let defineProperty = requireModule(11);
        let createPropertyDescriptor = requireModule(35);

        module.exports = supportsDefineProperty ?
            function (obj, key, value) {
                return defineProperty.f(obj, key, createPropertyDescriptor(1, value));
            } :
            function (obj, key, value) {
                obj[key] = value;
                return obj;
            };
    },
    // Module 17
    function (module, exports) {
        // Ensures a value is not null or undefined; throws TypeError if it is
        module.exports = function (value) {
            if (value === null || value === undefined) {
                throw TypeError("Cannot call method on " + value);
            }
            return value;
        };
    },
    // Module 18
    function (module, exports, requireModule) {
        // Internal state management using WeakMap or fallback objects
        let isWeakMapAvailable = requireModule(99); // Check if WeakMap is natively available
        let globalScope = requireModule(5);
        let isObject = requireModule(8);
        let defineNonEnumerable = requireModule(16);
        let hasProperty = requireModule(14);
        let getPrivateSymbol = requireModule(59); // Generate a unique symbol for private data
        let privateDataMap = requireModule(46); // Map for private data (fallback if no WeakMap)

        let internalWeakMap;
        let getInternalData;
        let hasInternalData;
        let setInternalData;

        if (isWeakMapAvailable) {
            internalWeakMap = new globalScope.WeakMap();
            getInternalData = internalWeakMap.get;
            hasInternalData = internalWeakMap.has;
            setInternalData = internalWeakMap.set;

            module.exports = {
                set: function (target, value) {
                    setInternalData.call(internalWeakMap, target, value);
                    return value;
                },
                get: function (target) {
                    return getInternalData.call(internalWeakMap, target) || {};
                },
                has: function (target) {
                    return hasInternalData.call(internalWeakMap, target);
                },
                enforce: function (target) {
                    return hasInternalData.call(internalWeakMap, target) ?
                        getInternalData.call(internalWeakMap, target) :
                        setInternalData.call(internalWeakMap, target, {});
                },
                getterFor: function (instanceType) {
                    return function (target) {
                        let data;
                        if (!isObject(target) || (data = getInternalData.call(internalWeakMap, target)).type !== instanceType) {
                            throw TypeError("Incompatible receiver, " + instanceType + " required");
                        }
                        return data;
                    };
                }
            };
        } else {
            // Fallback for environments without WeakMap
            let privateKey = getPrivateSymbol("state");
            privateDataMap[privateKey] = true;

            module.exports = {
                set: function (target, value) {
                    defineNonEnumerable(target, privateKey, value);
                    return value;
                },
                get: function (target) {
                    return hasProperty(target, privateKey) ? target[privateKey] : {};
                },
                has: function (target) {
                    return hasProperty(target, privateKey);
                },
                enforce: function (target) {
                    return hasProperty(target, privateKey) ?
                        target[privateKey] :
                        defineNonEnumerable(target, privateKey, {});
                },
                getterFor: function (instanceType) {
                    return function (target) {
                        let data;
                        if (!isObject(target) || (data = hasProperty(target, privateKey) ? target[privateKey] : undefined).type !== instanceType) {
                            throw TypeError("Incompatible receiver, " + instanceType + " required");
                        }
                        return data;
                    };
                }
            };
        }
    },
    // Module 19
    function (module, exports, requireModule) {
        // Utility to define a well-known symbol (WKS) in the global Symbol object
        let globalSymbols = requireModule(81);
        let hasProperty = requireModule(14);
        let defineProperty = requireModule(11).f;
        let getWellKnownSymbol = requireModule(105);

        module.exports = function (symbolName) {
            let symbolRegistry = globalSymbols.Symbol || (globalSymbols.Symbol = {});
            if (!hasProperty(symbolRegistry, symbolName)) {
                defineProperty(symbolRegistry, symbolName, { value: getWellKnownSymbol.f(symbolName) });
            }
        };
    },
    // Module 20
    function (module, exports, requireModule) {
        // Helper to get the species constructor for a given object
        let validateObject = requireModule(1);
        let validateFunction = requireModule(4);
        let getWellKnownSymbol = requireModule(6)("species");

        module.exports = function (originalObject, defaultConstructor) {
            let objectConstructor = validateObject(originalObject).constructor;
            let speciesConstructor;
            // If constructor is undefined or null, use default
            if (objectConstructor === undefined || objectConstructor === null) {
                return defaultConstructor;
            }
            // Check for @@species symbol
            speciesConstructor = validateObject(objectConstructor)[getWellKnownSymbol];
            if (speciesConstructor === undefined || speciesConstructor === null) {
                return defaultConstructor;
            }
            // Ensure species constructor is a function
            return validateFunction(speciesConstructor);
        };
    },
    // Module 21
    function (module, exports, requireModule) {
        // Helper to get the prototype of an object
        let hasProperty = requireModule(14);
        let toObject = requireModule(15);
        let getPrivateSymbol = requireModule(59);
        let supportsGetPrototypeOf = requireModule(110); // Check for native Object.getPrototypeOf
        let privateProtoSymbol = getPrivateSymbol("IE_PROTO"); // Fallback for IE's __proto__ emulation
        let objectPrototype = Object.prototype;

        module.exports = supportsGetPrototypeOf ? Object.getPrototypeOf : function (obj) {
            obj = toObject(obj);
            if (hasProperty(obj, privateProtoSymbol)) {
                return obj[privateProtoSymbol];
            }
            // Fallback for objects created via `new Constructor()`
            if (typeof obj.constructor === "function" && obj instanceof obj.constructor) {
                return obj.constructor.prototype;
            }
            // Default to Object.prototype for plain objects
            return obj instanceof Object ? objectPrototype : null;
        };
    },
    // Module 22
    function (module, exports, requireModule) {
        // Get the descriptor of an object property
        let supportsDefineProperty = requireModule(9);
        let isPropertyEnumerable = requireModule(58); // Check if a property is enumerable
        let createPropertyDescriptor = requireModule(35);
        let toIndexedObject = requireModule(25);
        let toPropertyKey = requireModule(29);
        let supportsTryCatch = requireModule(97); // Check if try-catch is reliable
        let getOwnPropertyDescriptorNative = Object.getOwnPropertyDescriptor;

        exports.f = supportsDefineProperty ? getOwnPropertyDescriptorNative : function (obj, property) {
            obj = toIndexedObject(obj);
            property = toPropertyKey(property, true);
            if (supportsTryCatch) {
                try {
                    return getOwnPropertyDescriptorNative(obj, property);
                } catch (e) {
                    // Fallback if native method fails
                }
            }
            if (requireModule(14)(obj, property)) {
                return createPropertyDescriptor(!isPropertyEnumerable.f.call(obj, property), obj[property]);
            }
            return undefined;
        };
    },
    // Module 23
    function (module, exports, requireModule) {
        // Defines a property on an object, handling `name` property for functions
        let globalScope = requireModule(5);
        let sharedData = requireModule(38); // Shared data registry
        let defineNonEnumerable = requireModule(16);
        let hasProperty = requireModule(14);
        let createObjectFromValue = requireModule(79);
        let getSourceCode = requireModule(98); // Get source code of a function
        let internalState = requireModule(18); // Internal state management
        let getInternalState = internalState.get;
        let enforceInternalState = internalState.enforce;

        let sourceCodeParts = String(getSourceCode).split("toString");

        // Store source code for debugging/inspection
        sharedData("inspectSource", function (func) {
            return getSourceCode.call(func);
        });

        // The main utility function
        module.exports = function (obj, property, value, options) {
            options = options || {};
            let isUnsafe = !!options.unsafe;
            let isEnumerable = !!options.enumerable;
            let noTargetGet = !!options.noTargetGet;

            if (typeof value === "function") {
                // If it's a function, set its 'name' property if not already present
                if (typeof property === "string" && !hasProperty(value, "name")) {
                    defineNonEnumerable(value, "name", property);
                }
                // Store function source code in internal state
                enforceInternalState(value).source = sourceCodeParts.join(typeof property === "string" ? property : "");
            }

            // Apply the property to the target object
            if (obj !== globalScope) {
                if (isUnsafe) {
                    if (!noTargetGet && obj[property]) {
                        // If unsafe and property exists, delete it first if enumerable
                        if (isEnumerable) {
                            delete obj[property];
                        }
                    }
                } else {
                    // If not unsafe, delete existing property if it exists
                    delete obj[property];
                }
                // Define the property, making it enumerable if specified
                if (isEnumerable) {
                    obj[property] = value;
                } else {
                    defineNonEnumerable(obj, property, value);
                }
            } else {
                // If target is global, directly assign or create
                if (isEnumerable) {
                    obj[property] = value;
                } else {
                    createObjectFromValue(property, value);
                }
            }
        };
    },
    // Module 24
    function (module, exports) {
        // Utility to convert a value to an integer
        let mathCeil = Math.ceil;
        let mathFloor = Math.floor;
        module.exports = function (value) {
            let num = +value; // Convert to number
            return num !== num ? 0 : (num > 0 ? mathFloor : mathCeil)(num);
        };
    },
    // Module 25
    function (module, exports, requireModule) {
        // Converts a value to an object that can be indexed like an array
        let toObject = requireModule(17);
        let indexedObject = requireModule(77); // Handles string indexing
        module.exports = function (value) {
            return indexedObject(toObject(value));
        };
    },
    // Module 26
    function (module, exports, requireModule) {
        // Sets the `Symbol.toStringTag` for an object
        let defineProperty = requireModule(11).f;
        let hasProperty = requireModule(14);
        let toStringTagSymbol = requireModule(6)("toStringTag");

        module.exports = function (obj, tagName, isProto) {
            if (obj && !hasProperty(obj = isProto ? obj.prototype : obj, toStringTagSymbol)) {
                defineProperty(obj, toStringTagSymbol, { configurable: true, value: tagName });
            }
        };
    },
    // Module 27
    function (module, exports, requireModule) {
        // Returns an iterator for a Map instance
        let isPure = requireModule(2);
        let mapIterator = requireModule(57);
        module.exports = isPure ? mapIterator : function (map) {
            return Map.prototype.entries.call(map);
        };
    },
    // Module 28
    function (module, exports) {
        // Returns the internal [[Class]] of an object (e.g., "Array", "Object")
        let objectToString = {}.toString;
        module.exports = function (value) {
            return objectToString.call(value).slice(8, -1);
        };
    },
    // Module 29
    function (module, exports, requireModule) {
        // Converts a value to a property key (string or symbol)
        let isObject = requireModule(8);
        module.exports = function (value, isPrimitive) {
            if (!isObject(value)) {
                return value;
            }
            let toStringMethod, valueOfMethod, result;
            if (isPrimitive && typeof (toStringMethod = value.toString) === "function" && !isObject(result = toStringMethod.call(value))) {
                return result;
            }
            if (typeof (valueOfMethod = value.valueOf) === "function" && !isObject(result = valueOfMethod.call(value))) {
                return result;
            }
            if (!isPrimitive && typeof (toStringMethod = value.toString) === "function" && !isObject(result = toStringMethod.call(value))) {
                return result;
            }
            throw TypeError("Cannot convert object to primitive value");
        };
    },
    // Module 30
    function (module, exports, requireModule) {
        // Creates a new object with the specified prototype
        let validateObject = requireModule(1);
        let defineProperties = requireModule(103); // Define multiple properties
        let getPropertyNames = requireModule(82); // Get property names (for IE_PROTO)
        let internalPropertyMap = requireModule(46); // Internal property map for IE_PROTO
        let createObjectShim = requireModule(104); // Shim for Object.create
        let privateProtoSymbol = requireModule(59)("IE_PROTO"); // Symbol for IE_PROTO

        let EmptyConstructor = function () {
        };
        let createObjectIE = function () {
            // Emulate Object.create for IE
            let iframe = createObjectShim("iframe");
            iframe.style.display = "none";
            createObjectShim.appendChild(iframe);
            iframe.src = String("javascript:");
            let iframeDocument = iframe.contentWindow.document;
            iframeDocument.open();
            iframeDocument.write("<script>document.F=Object<\/script>");
            iframeDocument.close();
            let objectFromIframe = iframeDocument.F;
            let propertyNames = getPropertyNames;
            let i = propertyNames.length;
            while (i--) {
                delete objectFromIframe.prototype[propertyNames[i]];
            }
            return objectFromIframe();
        };

        module.exports = Object.create || function (proto, properties) {
            let newObject;
            if (proto !== null) {
                EmptyConstructor.prototype = validateObject(proto);
                newObject = new EmptyConstructor();
                EmptyConstructor.prototype = null;
                newObject[privateProtoSymbol] = proto;
            } else {
                newObject = createObjectIE();
            }
            return properties === undefined ? newObject : defineProperties(newObject, properties);
        };

        internalPropertyMap[privateProtoSymbol] = true;
    },
    // Module 31
    function (module, exports) {
        // Utility to ensure an object is an instance of a specific constructor
        module.exports = function (instance, constructor, name) {
            if (!(instance instanceof constructor)) {
                throw TypeError("Incorrect " + (name ? name + " " : "") + "invocation");
            }
            return instance;
        };
    },
    // Module 32
    function (module, exports, requireModule) {
        "use strict";
        // This module provides a polyfill for Typed Arrays
        let exportHelper = requireModule(0);
        let globalScope = requireModule(5);
        let supportsDefineProperty = requireModule(9);
        let supportsTypedArrays = requireModule(95); // Check if typed arrays are natively supported
        let typedArrayUtil = requireModule(33); // Typed array utility functions
        let validateInstance = requireModule(31);
        let createPropertyDescriptor = requireModule(35);
        let defineNonEnumerable = requireModule(16);
        let toLength = requireModule(10);
        let getArrayLikeLength = requireModule(124); // Get length of array-like object
        let getTypedArrayIterator = requireModule(217); // Get an iterator for typed array
        let toPropertyKey = requireModule(29);
        let hasProperty = requireModule(14);
        let isObject = requireModule(8);
        let createObject = requireModule(30);
        let setPrototypeOf = requireModule(42);
        let getOwnPropertyNames = requireModule(39).f;
        let arrayForEach = requireModule(48).forEach;
        let defineProperty = requireModule(11);
        let getOwnPropertyDescriptor = requireModule(22);
        let mathRound = Math.round;
        let rangeError = globalScope.RangeError;

        let ArrayBufferConstructor = typedArrayUtil.ArrayBuffer;
        let DataViewConstructor = typedArrayUtil.DataView;
        let nativeTypedArrayBufferViews = typedArrayUtil.NATIVE_ARRAY_BUFFER_VIEWS;
        let typedArrayTag = typedArrayUtil.TYPED_ARRAY_TAG;
        let TypedArrayBase = typedArrayUtil.TypedArray;
        let TypedArrayPrototype = typedArrayUtil.TypedArrayPrototype;
        let validateTypedArrayConstructor = typedArrayUtil.aTypedArrayConstructor;
        let isTypedArray = typedArrayUtil.isTypedArray;

        // Helper to create a new typed array from an array-like object
        let createTypedArrayFromArrayLike = function (Constructor, arrayLike) {
            let length = arrayLike.length;
            let newArray = new (validateTypedArrayConstructor(Constructor))(length);
            for (let i = 0; i < length; i++) {
                newArray[i] = arrayLike[i];
            }
            return newArray;
        };

        // Helper to define getter for internal properties like 'buffer', 'byteOffset', etc.
        let defineInternalPropertyGetter = function (prototype, propertyName) {
            defineProperty.f(prototype, propertyName, {
                get: function () {
                    return requireModule(18).get(this)[propertyName];
                }
            });
        };

        // Helper to check if a value is an ArrayBuffer or similar
        let isArrayBufferView = function (value) {
            let objectClass = requireModule(53)(value);
            return value instanceof ArrayBufferConstructor ||
                objectClass === "ArrayBuffer" ||
                objectClass === "SharedArrayBuffer";
        };

        // Check if an object is a typed array and has a valid index
        let isValidTypedArrayIndex = function (obj, index) {
            return isTypedArray(obj) && typeof index !== 'symbol' && index in obj && String(+index) === String(index);
        };

        // Get property descriptor for typed arrays, handling internal properties
        let getTypedArrayPropertyDescriptor = function (obj, propertyName) {
            propertyName = toPropertyKey(propertyName, true);
            return isValidTypedArrayIndex(obj, propertyName) ?
                createPropertyDescriptor(2, obj[propertyName]) :
                getOwnPropertyDescriptor.f(obj, propertyName);
        };

        // Define property for typed arrays, handling internal properties
        let defineTypedArrayProperty = function (obj, propertyName, descriptor) {
            // Check if it's a valid index and descriptor doesn't contain accessors or non-configurable flags
            if (isValidTypedArrayIndex(obj, propertyName = toPropertyKey(propertyName, true)) &&
                isObject(descriptor) && hasProperty(descriptor, "value") &&
                !hasProperty(descriptor, "get") && !hasProperty(descriptor, "set") &&
                !descriptor.configurable && !hasProperty(descriptor, "writable") || descriptor.writable &&
                !hasProperty(descriptor, "enumerable") || descriptor.enumerable) {
                obj[propertyName] = descriptor.value;
                return obj;
            }
            return defineProperty.f(obj, propertyName, descriptor);
        };

        if (supportsDefineProperty) {
            // If native typed array views are not fully supported, shim Object.getOwnPropertyDescriptor and defineProperty
            if (!nativeTypedArrayBufferViews) {
                getOwnPropertyDescriptor.f = getTypedArrayPropertyDescriptor;
                defineProperty.f = defineTypedArrayProperty;
                defineInternalPropertyGetter(TypedArrayPrototype, "buffer");
                defineInternalPropertyGetter(TypedArrayPrototype, "byteOffset");
                defineInternalPropertyGetter(TypedArrayPrototype, "byteLength");
                defineInternalPropertyGetter(TypedArrayPrototype, "length");
            }

            module.exports = function (typeName, elementSize, constructorCallback, isClamped) {
                let arrayTypeName = typeName + (isClamped ? "Clamped" : "") + "Array";
                let getMethodName = "get" + typeName;
                let setMethodName = "set" + typeName;
                let NativeTypedArray = globalScope[arrayTypeName];
                let TypedArrayCtor = NativeTypedArray;
                let TypedArrayProto = TypedArrayCtor && TypedArrayCtor.prototype;
                let newTypedArrayProto = {};

                let defineElementAccessors = function (prototype, index) {
                    defineProperty.f(prototype, index, {
                        get: function () {
                            let internalData = requireModule(18).get(this);
                            return internalData.view[getMethodName](index * elementSize + internalData.byteOffset, true);
                        },
                        set: function (value) {
                            let internalData = requireModule(18).get(this);
                            if (isClamped) {
                                // Clamp value for Uint8ClampedArray
                                value = (value = mathRound(value)) < 0 ? 0 : value > 255 ? 255 : value & 255;
                            }
                            internalData.view[setMethodName](index * elementSize + internalData.byteOffset, value, true);
                        },
                        enumerable: true
                    });
                };

                if (nativeTypedArrayBufferViews) {
                    if (supportsTypedArrays) {
                        // If native typed arrays are available and reliable
                        TypedArrayCtor = constructorCallback(function (instance, lengthOrBuffer, byteOffset, length) {
                            validateInstance(instance, TypedArrayCtor, arrayTypeName);
                            if (isObject(lengthOrBuffer)) {
                                if (isArrayBufferView(lengthOrBuffer)) {
                                    return length !== undefined ?
                                        new NativeTypedArray(lengthOrBuffer, getTypedArrayIterator(byteOffset, elementSize), length) :
                                        byteOffset !== undefined ?
                                            new NativeTypedArray(lengthOrBuffer, getTypedArrayIterator(byteOffset, elementSize)) :
                                            new NativeTypedArray(lengthOrBuffer);
                                }
                                if (isTypedArray(lengthOrBuffer)) {
                                    return createTypedArrayFromArrayLike(TypedArrayCtor, lengthOrBuffer);
                                }
                                return requireModule(125).call(TypedArrayCtor, lengthOrBuffer);
                            }
                            return new NativeTypedArray(getArrayLikeLength(lengthOrBuffer));
                        });
                        setPrototypeOf(TypedArrayCtor, TypedArrayBase); // Inherit from TypedArrayBase
                        arrayForEach(getOwnPropertyNames(NativeTypedArray), function (prop) {
                            if (!(prop in TypedArrayCtor)) {
                                defineNonEnumerable(TypedArrayCtor, prop, NativeTypedArray[prop]);
                            }
                        });
                        TypedArrayCtor.prototype = TypedArrayProto;
                    }
                } else {
                    // Fallback for environments without native typed arrays
                    TypedArrayCtor = constructorCallback(function (instance, lengthOrBuffer, byteOffset, length) {
                        validateInstance(instance, TypedArrayCtor, arrayTypeName);
                        let buffer, byteLength, currentLength;
                        let offset = 0;
                        let dataLength = 0;

                        if (isObject(lengthOrBuffer)) {
                            if (!isArrayBufferView(lengthOrBuffer)) {
                                return isTypedArray(lengthOrBuffer) ?
                                    createTypedArrayFromArrayLike(TypedArrayCtor, lengthOrBuffer) :
                                    requireModule(125).call(TypedArrayCtor, lengthOrBuffer);
                            }
                            buffer = lengthOrBuffer;
                            offset = getTypedArrayIterator(byteOffset, elementSize);
                            let bufferByteLength = lengthOrBuffer.byteLength;
                            if (length === undefined) {
                                if (bufferByteLength % elementSize) {
                                    throw rangeError("Wrong length");
                                }
                                byteLength = bufferByteLength - offset;
                                if (byteLength < 0) {
                                    throw rangeError("Wrong length");
                                }
                            } else {
                                byteLength = toLength(length) * elementSize;
                                if (byteLength + offset > bufferByteLength) {
                                    throw rangeError("Wrong length");
                                }
                            }
                            currentLength = byteLength / elementSize;
                        } else {
                            currentLength = getArrayLikeLength(lengthOrBuffer);
                            buffer = new ArrayBufferConstructor(byteLength = currentLength * elementSize);
                        }

                        requireModule(18).set(instance, {
                            buffer: buffer,
                            byteOffset: offset,
                            byteLength: byteLength,
                            length: currentLength,
                            view: new DataViewConstructor(buffer)
                        });

                        while (dataLength < currentLength) {
                            defineElementAccessors(instance, dataLength++);
                        }
                    });
                    setPrototypeOf(TypedArrayCtor, TypedArrayBase);
                    newTypedArrayProto = TypedArrayCtor.prototype = createObject(TypedArrayPrototype);
                }

                // Ensure constructor property is set
                if (TypedArrayProto.constructor !== TypedArrayCtor) {
                    defineNonEnumerable(newTypedArrayProto, "constructor", TypedArrayCtor);
                }
                // Set @@toStringTag if needed
                if (typedArrayTag) {
                    defineNonEnumerable(newTypedArrayProto, typedArrayTag, arrayTypeName);
                }

                // Export the new Typed Array constructor
                let exportOptions = { global: true, forced: TypedArrayCtor !== NativeTypedArray, sham: !nativeTypedArrayBufferViews };
                let exportObject = {};
                exportObject[arrayTypeName] = TypedArrayCtor;
                exportHelper(exportOptions, exportObject);

                // Define BYTES_PER_ELEMENT static and prototype properties
                if (!("BYTES_PER_ELEMENT" in TypedArrayCtor)) {
                    defineNonEnumerable(TypedArrayCtor, "BYTES_PER_ELEMENT", elementSize);
                }
                if (!("BYTES_PER_ELEMENT" in TypedArrayProto)) {
                    defineNonEnumerable(newTypedArrayProto, "BYTES_PER_ELEMENT", elementSize);
                }
                requireModule(43)(arrayTypeName); // Register for species lookup
            };
        } else {
            // If Object.defineProperty is not supported, Typed Arrays cannot be polyfilled effectively
            module.exports = function () { };
        }
    },
    // Module 33
    function (module, exports, requireModule) {
        "use strict";
        // Typed Array Utilities and Definitions
        let supportsDefineProperty = requireModule(9);
        let globalScope = requireModule(5);
        let isObject = requireModule(8);
        let hasProperty = requireModule(14);
        let defineNonEnumerable = requireModule(16);
        let createNamedProperty = requireModule(23);
        let getPrototypeOf = requireModule(21);
        let setPrototypeOf = requireModule(42);
        let getWellKnownSymbol = requireModule(6);
        let createUniqueId = requireModule(45); // Generate unique ID
        let DataView = globalScope.DataView;
        let Int8Array = globalScope.Int8Array;
        let Int8ArrayPrototype = Int8Array && Int8Array.prototype;
        let Uint8ClampedArray = globalScope.Uint8ClampedArray;
        let Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
        let getPrototypeOfNative = getPrototypeOf(Int8Array); // Get prototype of native TypedArray
        let getPrototypeOfProto = getPrototypeOf(Int8ArrayPrototype); // Get prototype of native TypedArray prototype
        let objectPrototype = Object.prototype;
        let isPrototypeOf = objectPrototype.isPrototypeOf;
        let toStringTagSymbol = getWellKnownSymbol("toStringTag");
        let typedArrayTagSymbol = createUniqueId("TYPED_ARRAY_TAG"); // Unique symbol for typed array identification
        let supportsArrayBuffer = !!(globalScope.ArrayBuffer && DataView); // Check for ArrayBuffer and DataView
        let supportsSetPrototypeOf = !!setPrototypeOf;
        let isTypedArrayPolyfillRequired = false; // Flag if polyfill is actively used

        // Map of Typed Array names to their element sizes
        const ELEMENT_SIZES = {
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

        // Check if an object is a known Typed Array instance
        let isTypedArrayInstance = function (value) {
            return isObject(value) && hasProperty(ELEMENT_SIZES, requireModule(53)(value));
        };

        // Check if all native typed arrays are available and correctly prototyped
        let allNativeTypedArraysExist = true;
        for (let typeName in ELEMENT_SIZES) {
            if (!globalScope[typeName]) {
                allNativeTypedArraysExist = false;
                break;
            }
        }

        // If native TypedArrays are not fully supported or prototyped correctly, use a polyfill base
        if (!allNativeTypedArraysExist || typeof getPrototypeOfNative !== "function" || getPrototypeOfNative === Function.prototype) {
            getPrototypeOfNative = function () {
                throw TypeError("Incorrect invocation");
            };
            if (supportsSetPrototypeOf) {
                // Set prototype for all TypedArray constructors
                for (let typeName in ELEMENT_SIZES) {
                    if (globalScope[typeName]) {
                        setPrototypeOf(globalScope[typeName], getPrototypeOfNative);
                    }
                }
            }
        }

        if (!allNativeTypedArraysExist || !getPrototypeOfProto || getPrototypeOfProto === objectPrototype) {
            getPrototypeOfProto = getPrototypeOfNative.prototype;
            if (supportsSetPrototypeOf) {
                // Set prototype for all TypedArray prototypes
                for (let typeName in ELEMENT_SIZES) {
                    if (globalScope[typeName]) {
                        setPrototypeOf(globalScope[typeName].prototype, getPrototypeOfProto);
                    }
                }
            }
        }

        // Handle Uint8ClampedArray prototype for Safari bug
        if (supportsSetPrototypeOf && getPrototypeOf(Uint8ClampedArrayPrototype) !== getPrototypeOfProto) {
            setPrototypeOf(Uint8ClampedArrayPrototype, getPrototypeOfProto);
        }

        // If Object.defineProperty is supported, set @@toStringTag for TypedArray prototypes
        if (supportsDefineProperty && !hasProperty(getPrototypeOfProto, toStringTagSymbol)) {
            isTypedArrayPolyfillRequired = true;
            defineNonEnumerable(getPrototypeOfProto, toStringTagSymbol, {
                get: function () {
                    return isObject(this) ? this[typedArrayTagSymbol] : undefined;
                }
            });
            for (let typeName in ELEMENT_SIZES) {
                if (globalScope[typeName]) {
                    defineNonEnumerable(globalScope[typeName].prototype, typedArrayTagSymbol, typeName);
                }
            }
        }

        // If ArrayBuffer and DataView are supported, and prototype chain is correct
        if (supportsArrayBuffer && supportsSetPrototypeOf && getPrototypeOf(DataView.prototype) !== objectPrototype) {
            setPrototypeOf(DataView.prototype, objectPrototype);
        }

        module.exports = {
            NATIVE_ARRAY_BUFFER: supportsArrayBuffer,
            NATIVE_ARRAY_BUFFER_VIEWS: allNativeTypedArraysExist,
            TYPED_ARRAY_TAG: isTypedArrayPolyfillRequired && typedArrayTagSymbol,

            // Ensures a value is a Typed Array instance
            aTypedArray: function (value) {
                if (isTypedArrayInstance(value)) {
                    return value;
                }
                throw TypeError("Target is not a typed array");
            },

            // Ensures a value is a Typed Array constructor
            aTypedArrayConstructor: function (constructor) {
                if (supportsSetPrototypeOf) {
                    if (isPrototypeOf.call(getPrototypeOfNative, constructor)) {
                        return constructor;
                    }
                } else {
                    for (let typeName in ELEMENT_SIZES) {
                        if (hasProperty(ELEMENT_SIZES, typeName)) {
                            let nativeCtor = globalScope[typeName];
                            if (nativeCtor && (constructor === nativeCtor || isPrototypeOf.call(nativeCtor, constructor))) {
                                return constructor;
                            }
                        }
                    }
                }
                throw TypeError("Target is not a typed array constructor");
            },

            // Exports a method to TypedArray.prototype
            exportProto: function (methodName, methodImpl, force) {
                if (supportsDefineProperty) {
                    if (force) {
                        for (let typeName in ELEMENT_SIZES) {
                            let ctor = globalScope[typeName];
                            if (ctor && hasProperty(ctor.prototype, methodName)) {
                                delete ctor.prototype[methodName];
                            }
                        }
                    }
                    if (!getPrototypeOfProto[methodName] || force) {
                        createNamedProperty(getPrototypeOfProto, methodName, force ? methodImpl : allNativeTypedArraysExist && Int8ArrayPrototype[methodName] || methodImpl);
                    }
                }
            },

            // Exports a static method to TypedArray constructors
            exportStatic: function (methodName, methodImpl, force) {
                let ctor;
                if (supportsDefineProperty) {
                    if (supportsSetPrototypeOf) {
                        if (force) {
                            for (let typeName in ELEMENT_SIZES) {
                                if ((ctor = globalScope[typeName]) && hasProperty(ctor, methodName)) {
                                    delete ctor[methodName];
                                }
                            }
                        }
                        if (!getPrototypeOfNative[methodName] || force) {
                            try {
                                createNamedProperty(getPrototypeOfNative, methodName, force ? methodImpl : allNativeTypedArraysExist && Int8Array[methodName] || methodImpl);
                            } catch (error) {
                                // Safari throws error on defining static methods on Function.prototype
                            }
                        }
                    }
                    for (let typeName in ELEMENT_SIZES) {
                        if ((ctor = globalScope[typeName]) && (!ctor[methodName] || force)) {
                            createNamedProperty(ctor, methodName, methodImpl);
                        }
                    }
                }
            },

            // Checks if a value is a DataView instance
            isView: function (value) {
                let objectClass = requireModule(53)(value);
                return objectClass === "DataView" || hasProperty(ELEMENT_SIZES, objectClass);
            },

            isTypedArray: isTypedArrayInstance,
            TypedArray: getPrototypeOfNative,
            TypedArrayPrototype: getPrototypeOfProto
        };
    },
    // Module 34
    function (module, exports, requireModule) {
        // Metadata API implementation (for Reflect.metadata)
        let MapConstructor = requireModule(88); // Map implementation
        let sharedRegistry = requireModule(38); // Shared registry for metadata
        let toPropertyKey = requireModule(127); // Converts value to property key

        let metadataStore = sharedRegistry("metadata");
        if (!metadataStore.store) {
            metadataStore.store = new MapConstructor();
        }

        let getMetadataMap = function (target, propertyName, createIfMissing) {
            let targetMetadata = metadataStore.store.get(target);
            if (!targetMetadata) {
                if (!createIfMissing) return undefined;
                metadataStore.store.set(target, targetMetadata = new MapConstructor());
            }
            let propertyMetadata = targetMetadata.get(propertyName);
            if (!propertyMetadata) {
                if (!createIfMissing) return undefined;
                targetMetadata.set(propertyName, propertyMetadata = new MapConstructor());
            }
            return propertyMetadata;
        };

        module.exports = {
            store: metadataStore.store,
            getMap: getMetadataMap,
            has: function (metadataKey, target, propertyName) {
                let metadataMap = getMetadataMap(target, propertyName, false);
                return metadataMap !== undefined && metadataMap.has(metadataKey);
            },
            get: function (metadataKey, target, propertyName) {
                let metadataMap = getMetadataMap(target, propertyName, false);
                return metadataMap === undefined ? undefined : metadataMap.get(metadataKey);
            },
            set: function (metadataKey, metadataValue, target, propertyName) {
                getMetadataMap(target, propertyName, true).set(metadataKey, metadataValue);
            },
            keys: function (target, propertyName) {
                let metadataMap = getMetadataMap(target, propertyName, false);
                let keys = [];
                if (metadataMap) {
                    metadataMap.forEach(function (value, key) {
                        keys.push(key);
                    });
                }
                return keys;
            },
            toKey: toPropertyKey
        };
    },
    // Module 35
    function (module, exports) {
        // Creates a property descriptor object
        module.exports = function (flags, value) {
            return {
                enumerable: !(flags & 1),
                configurable: !(flags & 2),
                writable: !(flags & 4),
                value: value
            };
        };
    },
    // Module 36
    function (module, exports, requireModule) {
        // Defines multiple properties on an object
        let createNamedProperty = requireModule(23);
        module.exports = function (obj, properties, options) {
            for (let key in properties) {
                createNamedProperty(obj, key, properties[key], options);
            }
            return obj;
        };
    },
    // Module 37
    function (module, exports, requireModule) {
        // Returns an iterator for a Set instance
        let isPure = requireModule(2);
        let setIterator = requireModule(57);
        module.exports = isPure ? setIterator : function (set) {
            return Set.prototype.values.call(set);
        };
    },
    // Module 38
    function (module, exports, requireModule) {
        // Shared global registry for internal data
        let globalScope = requireModule(5);
        let createObjectFromValue = requireModule(79);
        let isPure = requireModule(2);
        let sharedRegistry = globalScope["__core-js_shared__"] || createObjectFromValue("__core-js_shared__", {});

        // Store version information
        (module.exports = function (key, value) {
            return sharedRegistry[key] || (sharedRegistry[key] = value !== undefined ? value : {});
        })("versions", []).push({
            version: "3.1.3",
            mode: isPure ? "pure" : "global",
            copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
        });
    },
    // Module 39
    function (module, exports, requireModule) {
        // Get all own property names of an object
        let getOwnPropertyNamesShim = requireModule(101); // Shim for Object.getOwnPropertyNames
        let excludedPropertyNames = requireModule(82).concat("length", "prototype");

        exports.f = Object.getOwnPropertyNames || function (obj) {
            return getOwnPropertyNamesShim(obj, excludedPropertyNames);
        };
    },
    // Module 40
    function (module, exports, requireModule) {
        // Defines a property on an object (similar to Object.defineProperty, but simpler)
        "use strict";
        let toPropertyKey = requireModule(29);
        let defineProperty = requireModule(11);
        let createPropertyDescriptor = requireModule(35);

        module.exports = function (obj, property, value) {
            let key = toPropertyKey(property);
            if (key in obj) {
                defineProperty.f(obj, key, createPropertyDescriptor(0, value));
            } else {
                obj[key] = value;
            }
        };
    },
    // Module 41
    function (module, exports, requireModule) {
        // Defines an unscopable property on Array.prototype
        let getWellKnownSymbol = requireModule(6);
        let createObject = requireModule(30);
        let defineNonEnumerable = requireModule(16);
        let unscopablesSymbol = getWellKnownSymbol("unscopables");
        let arrayPrototype = Array.prototype;

        if (arrayPrototype[unscopablesSymbol] === null || arrayPrototype[unscopablesSymbol] === undefined) {
            defineNonEnumerable(arrayPrototype, unscopablesSymbol, createObject(null));
        }

        module.exports = function (property) {
            arrayPrototype[unscopablesSymbol][property] = true;
        };
    },
    // Module 42
    function (module, exports, requireModule) {
        // Sets the prototype of an object
        let validateObject = requireModule(1);
        let validatePrototype = requireModule(111); // Validates prototype value
        let testSetPrototypeOf = requireModule(7);

        // Check if `__proto__` is available and reliable
        let supportsProto = "__proto__" in {};
        let nativeSetPrototypeOf = Object.setPrototypeOf;

        let setPrototypeOfShim = supportsProto ? (function () {
            let testObj = {};
            let isArrayPrototype = false;
            try {
                // Test if setPrototypeOf works correctly and handles arrays
                let descriptor = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
                let setter = descriptor && descriptor.set;
                if (setter) {
                    setter.call(testObj, []);
                    isArrayPrototype = testObj instanceof Array;
                }
            } catch (e) {
                // Ignore errors
            }
            return function (obj, proto) {
                validateObject(obj);
                validatePrototype(proto);
                if (isArrayPrototype) {
                    setter.call(obj, proto);
                } else {
                    obj.__proto__ = proto;
                }
                return obj;
            };
        })() : undefined;

        module.exports = nativeSetPrototypeOf || setPrototypeOfShim;
    },
    // Module 43
    function (module, exports, requireModule) {
        "use strict";
        // Defines the @@species property for a constructor
        let getBuiltIn = requireModule(12);
        let defineProperty = requireModule(11);
        let getWellKnownSymbol = requireModule(6);
        let supportsDefineProperty = requireModule(9);
        let speciesSymbol = getWellKnownSymbol("species");

        module.exports = function (constructorName) {
            let constructor = getBuiltIn(constructorName);
            let definePropertyF = defineProperty.f;
            if (supportsDefineProperty && constructor && !constructor[speciesSymbol]) {
                definePropertyF(constructor, speciesSymbol, {
                    configurable: true,
                    get: function () {
                        return this;
                    }
                });
            }
        };
    },
    // Module 44
    function (module, exports, requireModule) {
        "use strict";
        // Get RegExp flags string
        let validateObject = requireModule(1);
        module.exports = function () {
            let regex = validateObject(this);
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
    // Module 45
    function (module, exports) {
        // Generate a unique ID string
        let counter = 0;
        let randomFactor = Math.random();
        module.exports = function (description) {
            return "Symbol(" + String(description === undefined ? "" : description) + ")_" +
                (++counter + randomFactor).toString(36);
        };
    },
    // Module 46
    function (module, exports) {
        // Empty object used as a registry for internal properties that should not be enumerated
        module.exports = {};
    },
    // Module 47
    function (module, exports, requireModule) {
        // Checks if a value is an Array
        let objectClass = requireModule(28);
        module.exports = Array.isArray || function (value) {
            return objectClass(value) === "Array";
        };
    },
    // Module 48
    function (module, exports, requireModule) {
        // Array iteration methods (forEach, map, filter, some, every, find, findIndex)
        let getBoundFunction = requireModule(13);
        let toIndexedObject = requireModule(77);
        let toObject = requireModule(15);
        let toLength = requireModule(10);
        let createArrayFromSpecies = requireModule(49);

        let arrayMethods = function (callbackType) {
            let isMap = callbackType === 1; // map
            let isFilter = callbackType === 2; // filter
            let isSome = callbackType === 3; // some
            let isEvery = callbackType === 4; // every
            let isFind = callbackType === 5; // find
            let isFindIndex = callbackType === 6; // findIndex
            let isPredicate = isFind || isFindIndex;
            let isMutating = isMap || isFilter || isFind || isFindIndex;

            return function (arrayLike, callback, thisArg, createNewArray) {
                let obj = toObject(arrayLike);
                let indexed = toIndexedObject(obj);
                let length = toLength(indexed.length);
                let boundCallback = getBoundFunction(callback, thisArg, 3);
                let result = createNewArray || createArrayFromSpecies(obj, length);
                let k = 0;
                let mappedIndex = 0;

                for (; k < length; k++) {
                    if (k in indexed) {
                        let element = indexed[k];
                        let callbackResult = boundCallback(element, k, obj);

                        if (isMap) {
                            result[mappedIndex++] = callbackResult;
                        } else if (isFilter) {
                            if (callbackResult) {
                                result[mappedIndex++] = element;
                            }
                        } else if (isSome) {
                            if (callbackResult) {
                                return true;
                            }
                        } else if (isEvery) {
                            if (!callbackResult) {
                                return false;
                            }
                        } else if (isFind) {
                            if (callbackResult) {
                                return element;
                            }
                        } else if (isFindIndex) {
                            if (callbackResult) {
                                return k;
                            }
                        }
                    }
                }

                if (isFindIndex) {
                    return -1;
                }
                if (isSome || isEvery) {
                    return isEvery; // every returns true if no false found, some returns false if no true found
                }
                return result;
            };
        };

        module.exports = {
            forEach: arrayMethods(0),
            map: arrayMethods(1),
            filter: arrayMethods(2),
            some: arrayMethods(3),
            every: arrayMethods(4),
            find: arrayMethods(5),
            findIndex: arrayMethods(6)
        };
    },
    // Module 49
    function (module, exports, requireModule) {
        // Creates a new array using the original array's species constructor
        let isObject = requireModule(8);
        let isArray = requireModule(47);
        let getWellKnownSymbol = requireModule(6)("species");

        module.exports = function (originalArray, length) {
            let constructor;
            if (isArray(originalArray)) {
                // Get the constructor from the original array
                constructor = originalArray.constructor;
                // If it's Array or doesn't have @@species, use Array constructor
                if (typeof constructor !== "function" || constructor === Array || !isArray(constructor.prototype)) {
                    constructor = undefined;
                } else {
                    // Otherwise, get constructor[@@species]
                    constructor = isObject(constructor) && constructor[getWellKnownSymbol];
                    if (constructor === null) {
                        constructor = undefined;
                    }
                }
            }
            // Use Array constructor if no species constructor found
            return new (constructor === undefined ? Array : constructor)(length === 0 ? 0 : length);
        };
    },
    // Module 50
    function (module, exports, requireModule) {
        // Check if an array method is properly implemented (species-friendly)
        let testError = requireModule(7);
        let getWellKnownSymbol = requireModule(6)("species");

        module.exports = function (methodName) {
            return !testError(function () {
                let array = [];
                let constructor = (array.constructor = {});
                constructor[getWellKnownSymbol] = function () {
                    return { foo: 1 };
                };
                return array[methodName](Boolean).foo !== 1;
            });
        };
    },
    // Module 51
    function (module, exports) {
        // Map of built-in iterators for various types
        module.exports = {};
    },
    // Module 52
    function (module, exports, requireModule) {
        // Gets the @@iterator method for an object
        let getObjectClass = requireModule(53);
        let iteratorRegistry = requireModule(51);
        let iteratorSymbol = requireModule(6)("iterator");

        module.exports = function (obj) {
            if (obj !== null && obj !== undefined) {
                return obj[iteratorSymbol] || obj["@@iterator"] || iteratorRegistry[getObjectClass(obj)];
            }
            return undefined;
        };
    },
    // Module 53
    function (module, exports, requireModule) {
        // Get the internal [[Class]] of an object (e.g., "Array", "Object", "Map")
        let getObjectClass = requireModule(28);
        let toStringTagSymbol = requireModule(6)("toStringTag");
        let isArgumentsObject = (function () {
            return arguments;
        })() instanceof Object ? getObjectClass : function (value) {
            return getObjectClass(value) === "Object" && typeof value.callee === "function" ? "Arguments" : getObjectClass(value);
        };

        module.exports = function (value) {
            let result;
            let toStringTagProperty;
            // Handle null and undefined explicitly
            if (value === undefined) {
                return "Undefined";
            }
            if (value === null) {
                return "Null";
            }
            // Check for @@toStringTag
            toStringTagProperty = function (obj, prop) {
                try {
                    return obj[prop];
                } catch (e) {
                    // Ignore errors
                }
            }(Object(value), toStringTagSymbol);

            if (typeof toStringTagProperty === "string") {
                return toStringTagProperty;
            }
            return isArgumentsObject(value);
        };
    },
    // Module 54
    function (module, exports, requireModule) {
        "use strict";
        // Create an Iterator prototype and register it
        let iteratorPrototype = requireModule(109).IteratorPrototype;
        let createObject = requireModule(30);
        let createPropertyDescriptor = requireModule(35);
        let setToStringTag = requireModule(26);
        let iteratorRegistry = requireModule(51);

        let dummyNext = function () {
            return this;
        };

        module.exports = function (Constructor, typeName, nextMethod) {
            let iteratorConstructor = function () {
                return this;
            };
            iteratorConstructor.prototype = createObject(iteratorPrototype, {
                next: createPropertyDescriptor(1, nextMethod)
            });
            setToStringTag(iteratorConstructor, typeName + " Iterator", false, true);
            iteratorRegistry[typeName + " Iterator"] = dummyNext;
            return iteratorConstructor;
        };
    },
    // Module 55
    function (module, exports, requireModule) {
        "use strict";
        // Promise capabilities constructor
        let validateFunction = requireModule(4);

        let PromiseCapabilities = function (Executor) {
            let resolve, reject;
            this.promise = new Executor(function (res, rej) {
                if (resolve !== undefined || reject !== undefined) {
                    throw TypeError("Bad Promise constructor");
                }
                resolve = res;
                reject = rej;
            });
            this.resolve = validateFunction(resolve);
            this.reject = validateFunction(reject);
        };

        exports.f = function (Executor) {
            return new PromiseCapabilities(Executor);
        };
    },
    // Module 56
    function (module, exports, requireModule) {
        // String character and code point accessors
        let toInteger = requireModule(24);
        let requireObjectCoercible = requireModule(17);

        let stringAccessor = function (isChar) {
            return function (string, index) {
                let str = String(requireObjectCoercible(string));
                let intIndex = toInteger(index);
                let stringLength = str.length;
                let charCode;

                if (intIndex < 0 || intIndex >= stringLength) {
                    return isChar ? "" : undefined;
                }
                charCode = str.charCodeAt(intIndex);
                if (charCode < 0xD800 || charCode > 0xDBFF || intIndex + 1 === stringLength ||
                    (charCode = str.charCodeAt(intIndex + 1)) < 0xDC00 || charCode > 0xDFFF) {
                    return isChar ? str.charAt(intIndex) : charCode;
                }
                // Handle surrogate pairs
                return isChar ? str.slice(intIndex, intIndex + 2) : charCode - 0xDC00 + ((charCode - 0xD800) << 10) + 0x10000;
            };
        };

        module.exports = {
            codeAt: stringAccessor(false),
            charAt: stringAccessor(true)
        };
    },
    // Module 57
    function (module, exports, requireModule) {
        // Get an iterator for an iterable object
        let validateObject = requireModule(1);
        let getIteratorMethod = requireModule(52);

        module.exports = function (iterable) {
            let iteratorMethod = getIteratorMethod(iterable);
            if (typeof iteratorMethod !== "function") {
                throw TypeError(String(iterable) + " is not iterable");
            }
            return validateObject(iteratorMethod.call(iterable));
        };
    },
    // Module 58
    function (module, exports, requireModule) {
        "use strict";
        // Object.prototype.propertyIsEnumerable polyfill
        let nativePropertyIsEnumerable = {}.propertyIsEnumerable;
        let getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        let isBuggy = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

        exports.f = isBuggy ? function (property) {
            let descriptor = getOwnPropertyDescriptor(this, property);
            return !!descriptor && descriptor.enumerable;
        } : nativePropertyIsEnumerable;
    },
    // Module 59
    function (module, exports, requireModule) {
        // Get a shared unique symbol key
        let sharedRegistry = requireModule(38);
        let generateUniqueId = requireModule(45);
        let symbolKeys = sharedRegistry("keys");

        module.exports = function (key) {
            return symbolKeys[key] || (symbolKeys[key] = generateUniqueId(key));
        };
    },
    // Module 60
    function (module, exports, requireModule) {
        // Array.prototype.includes and Array.prototype.indexOf implementations
        let toIndexedObject = requireModule(25);
        let toLength = requireModule(10);
        let toAbsoluteIndex = requireModule(61);

        let arraySearch = function (isIncludes) {
            return function (array, searchElement, fromIndex) {
                let obj = toIndexedObject(array);
                let len = toLength(obj.length);
                let index = toAbsoluteIndex(fromIndex, len);
                let currentElement;

                if (isIncludes && searchElement !== searchElement) { // NaN check
                    while (len > index) {
                        currentElement = obj[index++];
                        if (currentElement !== currentElement) {
                            return true;
                        }
                    }
                } else {
                    for (; len > index; index++) {
                        if ((isIncludes || index in obj) && obj[index] === searchElement) {
                            return isIncludes || index;
                        }
                    }
                }
                return !isIncludes && -1;
            };
        };

        module.exports = {
            includes: arraySearch(true),
            indexOf: arraySearch(false)
        };
    },
    // Module 61
    function (module, exports, requireModule) {
        // Converts a value to a valid array index
        let toInteger = requireModule(24);
        let mathMax = Math.max;
        let mathMin = Math.min;
        module.exports = function (value, length) {
            let index = toInteger(value);
            return index < 0 ? mathMax(index + length, 0) : mathMin(index, length);
        };
    },
    // Module 62
    function (module, exports, requireModule) {
        // Checks if a feature should be polyfilled based on its native implementation
        let testError = requireModule(7);
        const featureRegistry = {}; // Store feature statuses

        let checkFeature = function (path, isForced) {
            let normalizedPath = checkFeature.normalize(path);
            let status = featureRegistry[normalizedPath];

            if (status === 'N' /* NATIVE */ || status === 'P' /* POLYFILL */) {
                // If status is already known, return if it's a polyfill and forced, or if it's native
                return status === 'P' ? isForced : !!isForced;
            }

            // Determine status based on force flag
            if (typeof isForced === 'function') {
                return testError(isForced);
            }
            return !!isForced;
        };

        // Normalize feature path (e.g., "Array.prototype.forEach" -> "array.prototype.foreach")
        checkFeature.normalize = function (path) {
            return String(path).replace(/#|\.prototype\./g, ".").toLowerCase();
        };

        checkFeature.data = featureRegistry;
        checkFeature.NATIVE = "N";
        checkFeature.POLYFILL = "P";

        module.exports = checkFeature;
    },
    // Module 63
    function (module, exports, requireModule) {
        // Get all own enumerable property keys of an object
        let getOwnPropertyNames = requireModule(39);
        let toIndexedObject = requireModule(25);
        let getOwnEnumerablePropertyNames = requireModule(58).f;

        module.exports = Object.keys || function (obj) {
            let indexedObj = toIndexedObject(obj);
            let propertyNames = [];
            for (let key in indexedObj) {
                if (requireModule(14)(indexedObj, key)) {
                    propertyNames.push(key);
                }
            }
            return propertyNames;
        };
    },
    // Module 64
    function (module, exports, requireModule) {
        // Checks if an iterable is correctly implemented
        let getWellKnownSymbol = requireModule(6)("iterator");
        let isSafariBuggy = false; // Flag for Safari's buggy iterator implementation

        try {
            let iteratorCount = 0;
            let mockIterable = {
                next: function () {
                    return { done: !!iteratorCount++ };
                },
                return: function () {
                    isSafariBuggy = true;
                }
            };
            mockIterable[getWellKnownSymbol] = function () {
                return this;
            };
            Array.from(mockIterable, function () {
                throw 2;
            });
        } catch (e) {
            // Ignore error
        }

        module.exports = function (testFunction, isPure) {
            if (!isPure && !isSafariBuggy) {
                return false;
            }
            let testResult = false;
            try {
                let mockIterable = {};
                mockIterable[getWellKnownSymbol] = function () {
                    return {
                        next: function () {
                            return { done: (testResult = true) };
                        }
                    };
                };
                testFunction(mockIterable);
            } catch (e) {
                // Ignore error
            }
            return testResult;
        };
    },
    // Module 65
    function (module, exports, requireModule) {
        // Abstract class for Map, Set, WeakMap, WeakSet implementations
        "use strict";
        let exportHelper = requireModule(0);
        let globalScope = requireModule(5);
        let isFeatureForced = requireModule(62);
        let createNamedProperty = requireModule(23);
        let internalState = requireModule(66); // Internal state management for collections
        let isPure = requireModule(2);
        let validateInstance = requireModule(31);
        let isObject = requireModule(8);
        let testError = requireModule(7);
        let checkIterable = requireModule(64); // Check if iterable is correctly implemented
        let setToStringTag = requireModule(26);
        let enforceCollectionType = requireModule(113); // Enforce collection type

        module.exports = function (collectionName, constructorFactory, collectionMethods, isStrong, isWeak) {
            let NativeCollection = globalScope[collectionName];
            let CollectionConstructor = NativeCollection;
            let CollectionPrototype = NativeCollection && NativeCollection.prototype;
            let addOrSetMethod = isStrong ? "set" : "add";

            let wrapCollectionMethod = function (methodName) {
                let originalMethod = CollectionPrototype[methodName];
                createNamedProperty(CollectionPrototype, methodName, (methodName === "add") ?
                    function (value) {
                        return originalMethod.call(this, value === 0 ? 0 : value);
                    } :
                    (methodName === "delete") ?
                        function (value) {
                            return !(isWeak && !isObject(value)) && originalMethod.call(this, value === 0 ? 0 : value);
                        } :
                        (methodName === "get") ?
                            function (value) {
                                return (isWeak && !isObject(value)) ? undefined : originalMethod.call(this, value === 0 ? 0 : value);
                            } :
                            (methodName === "has") ?
                                function (value) {
                                    return !(isWeak && !isObject(value)) && originalMethod.call(this, value === 0 ? 0 : value);
                                } :
                                function (key, value) {
                                    return originalMethod.call(this, key === 0 ? 0 : key, value), this;
                                });
            };

            // If the native collection is not working correctly or needs polyfill
            if (isFeatureForced(collectionName, typeof NativeCollection !== "function" ||
                !(isWeak || (CollectionPrototype.forEach && !testError(function () {
                    (new NativeCollection()).entries().next();
                }))))) {
                CollectionConstructor = constructorFactory(function (instance, iterable) {
                    validateInstance(instance, CollectionConstructor, collectionName);
                    let newCollection = enforceCollectionType(new NativeCollection(), instance, CollectionConstructor);
                    if (iterable !== null && iterable !== undefined) {
                        requireModule(3)(iterable, newCollection[addOrSetMethod], newCollection, isStrong);
                    }
                    return newCollection;
                });
                internalState.REQUIRED = true;
            } else if (isFeatureForced(collectionName, true)) {
                // Check if collection methods need patching
                let testInstance = new CollectionConstructor();
                let hasZero = testInstance[addOrSetMethod](isWeak ? {} : -0, 1) !== testInstance;
                let hasOne = testError(function () {
                    testInstance.has(1);
                });
                let isIterableBroken = checkIterable(function (iterable) {
                    new NativeCollection(iterable);
                });
                let hasNegativeZeroBug = !isWeak && testError(function () {
                    for (let i = 5; i--;) testInstance[addOrSetMethod](i, i);
                    return !testInstance.has(-0);
                });

                // Patch methods if bugs detected
                if (isIterableBroken || hasNegativeZeroBug) {
                    CollectionConstructor = constructorFactory(function (instance, iterable) {
                        validateInstance(instance, CollectionConstructor, collectionName);
                        let newCollection = enforceCollectionType(new NativeCollection(), instance, CollectionConstructor);
                        if (iterable !== null && iterable !== undefined) {
                            requireModule(3)(iterable, newCollection[addOrSetMethod], newCollection, isStrong);
                        }
                        return newCollection;
                    });
                    CollectionConstructor.prototype = CollectionPrototype;
                    CollectionPrototype.constructor = CollectionConstructor;
                }

                if (hasOne || hasNegativeZeroBug) {
                    wrapCollectionMethod("delete");
                    wrapCollectionMethod("has");
                    if (isStrong) wrapCollectionMethod("get");
                }
                if (hasNegativeZeroBug || hasZero) {
                    wrapCollectionMethod(addOrSetMethod);
                }
                if (isWeak && CollectionPrototype.clear) {
                    delete CollectionPrototype.clear;
                }
            }

            let exportObject = {};
            exportObject[collectionName] = CollectionConstructor;
            exportHelper({ global: true, forced: CollectionConstructor !== NativeCollection }, exportObject);
            setToStringTag(CollectionConstructor, collectionName);
            if (!isWeak) internalState.setStrong(CollectionConstructor, collectionName, isStrong);

            return CollectionConstructor;
        };
    },
    // Module 66
    function (module, exports, requireModule) {
        // Internal state management for collections (WeakMap fallback)
        let internalPropertyMap = requireModule(46);
        let isObject = requireModule(8);
        let hasProperty = requireModule(14);
        let defineProperty = requireModule(11).f;
        let generateUniqueId = requireModule(45);
        let getPrivateSymbol = generateUniqueId("meta");
        let objectIdCounter = 0;
        let isExtensible = Object.isExtensible || function () {
            return true;
        };

        let setPrivateData = function (obj) {
            defineProperty(obj, getPrivateSymbol, {
                value: {
                    objectId: "O" + (++objectIdCounter),
                    weakData: {}
                }
            });
        };

        module.exports = {
            REQUIRED: false,
            // Get a fast key for an object (either symbol or string)
            fastKey: function (obj, createIfMissing) {
                if (!isObject(obj)) {
                    return typeof obj === "symbol" ? obj : ("string" === typeof obj ? "S" : "P") + obj;
                }
                if (!hasProperty(obj, getPrivateSymbol)) {
                    if (!isExtensible(obj)) {
                        return "F"; // Frozen object
                    }
                    if (!createIfMissing) {
                        return "E"; // Extensible but no key requested
                    }
                    setPrivateData(obj);
                }
                return obj[getPrivateSymbol].objectId;
            },
            // Get weak data for an object
            getWeakData: function (obj, createIfMissing) {
                if (!hasProperty(obj, getPrivateSymbol)) {
                    if (!isExtensible(obj)) {
                        return true; // Indicate frozen object
                    }
                    if (!createIfMissing) {
                        return false;
                    }
                    setPrivateData(obj);
                }
                return obj[getPrivateSymbol].weakData;
            },
            // On object freeze, ensure it has a meta key if required
            onFreeze: function (obj) {
                if (requireModule(112) && module.exports.REQUIRED && isExtensible(obj) && !hasProperty(obj, getPrivateSymbol)) {
                    setPrivateData(obj);
                }
                return obj;
            }
        };

        internalPropertyMap[getPrivateSymbol] = true;
    },
    // Module 67
    function (module, exports, requireModule) {
        // Check if `__defineGetter__` and `__defineSetter__` are buggy
        let isPure = requireModule(2);
        let testError = requireModule(7);
        let globalScope = requireModule(5);

        module.exports = isPure || !testError(function () {
            let randomProp = Math.random();
            __defineSetter__.call(null, randomProp, function () { });
            delete globalScope[randomProp];
            return true;
        });
    },
    // Module 68
    function (module, exports, requireModule) {
        // Utility to execute a function and catch potential errors
        module.exports = function (operation) {
            try {
                return { error: false, value: operation() };
            } catch (e) {
                return { error: true, value: e };
            }
        };
    },
    // Module 69
    function (module, exports, requireModule) {
        // Checks if a value is a RegExp instance
        let isObject = requireModule(8);
        let getObjectClass = requireModule(28);
        let matchSymbol = requireModule(6)("match");

        module.exports = function (value) {
            let isRegExpMatchMethod;
            return isObject(value) && (isRegExpMatchMethod = value[matchSymbol]) !== undefined ?
                !!isRegExpMatchMethod :
                getObjectClass(value) === "RegExp";
        };
    },
    // Module 70
    function (module, exports, requireModule) {
        "use strict";
        // Abstract class for String/RegExp methods that depend on @@match, @@replace, etc.
        let defineNonEnumerable = requireModule(16);
        let createNamedProperty = requireModule(23);
        let testError = requireModule(7);
        let getWellKnownSymbol = requireModule(6);
        let nativeRegExpExec = requireModule(92); // Native RegExp.prototype.exec
        let speciesSymbol = getWellKnownSymbol("species");

        // Test for bugs in String.prototype.replace with RegExp groups
        let replaceGroupsBug = !testError(function () {
            let regex = /./;
            regex.exec = function () {
                let arr = [];
                arr.groups = { a: "7" };
                return arr;
            };
            return "".replace(regex, "$<a>") !== "7";
        });

        // Test for bugs in String.prototype.split with empty regex
        let splitEmptyRegexBug = !testError(function () {
            let regex = /(?:)/;
            let nativeExec = regex.exec;
            regex.exec = function () {
                return nativeExec.apply(this, arguments);
            };
            let result = "ab".split(regex);
            return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
        });

        module.exports = function (methodName, argCount, implementation) {
            let symbol = getWellKnownSymbol(methodName);
            let isNative = !testError(function () {
                let obj = {};
                obj[symbol] = function () {
                    return 7;
                };
                return ""[methodName](obj) !== 7;
            });
            let isSafe = isNative && !testError(function () {
                let regex = /a/;
                regex.exec = function () {
                    return false;
                };
                // Test for specific bugs with 'split' and 'replace'
                if (methodName === "split") {
                    regex.constructor = {};
                    regex.constructor[speciesSymbol] = function () {
                        return regex;
                    };
                }
                regex[symbol]("");
                return true;
            });

            if (!isNative || !isSafe ||
                (methodName === "replace" && !replaceGroupsBug) ||
                (methodName === "split" && !splitEmptyRegexBug)
            ) {
                let nativeMethod = /./[symbol];
                let polyfillMethod = implementation(symbol, ""[methodName], function (originalMethod, regex, string, options, isNativeCall) {
                    if (regex.exec === nativeRegExpExec) {
                        return isNative && !isNativeCall ?
                            { done: true, value: originalMethod.call(regex, string, options) } :
                            { done: true, value: string[methodName](regex, options) };
                    }
                    return { done: false };
                });

                createNamedProperty(String.prototype, methodName, polyfillMethod[0]);
                createNamedProperty(RegExp.prototype, symbol, argCount === 2 ? function (string, options) {
                    return polyfillMethod[1].call(string, this, options);
                } : function (string) {
                    return polyfillMethod[1].call(string, this);
                });
                if (implementation.sham) {
                    defineNonEnumerable(RegExp.prototype[symbol], "sham", true);
                }
            }
        };
    },
    // Module 71
    function (module, exports, requireModule) {
        "use strict";
        // Adjusts RegExp.lastIndex for unicode
        let validateObject = requireModule(1);
        module.exports = function (string, index, isUnicode) {
            return index + (isUnicode ? requireModule(56).charAt(string, index).length : 1);
        };
    },
    // Module 72
    function (module, exports, requireModule) {
        // RegExp.prototype.exec polyfill (handling sticky and unicode flags)
        let getObjectClass = requireModule(28);
        let nativeRegExpExec = requireModule(92);

        module.exports = function (regex, string) {
            let execMethod = regex.exec;
            if (typeof execMethod === "function") {
                let result = execMethod.call(regex, string);
                if (typeof result !== "object") {
                    throw TypeError("RegExp exec method returned something other than an Object or null");
                }
                return result;
            }
            if (getObjectClass(regex) !== "RegExp") {
                throw TypeError("RegExp#exec called on incompatible receiver");
            }
            return nativeRegExpExec.call(regex, string);
        };
    },
    // Module 73
    function (module, exports, requireModule) {
        // String.prototype.trim polyfills
        let requireObjectCoercible = requireModule(17);
        let whitespaceChars = "[" + requireModule(93) + "]";
        let leadingWhitespaceRegex = RegExp("^" + whitespaceChars + whitespaceChars + "*");
        let trailingWhitespaceRegex = RegExp(whitespaceChars + whitespaceChars + "*$");

        let createTrimFunction = function (trimType) {
            return function (string) {
                let str = String(requireObjectCoercible(string));
                // 1 = trimStart, 2 = trimEnd, 3 = trimBoth
                if (trimType & 1) {
                    str = str.replace(leadingWhitespaceRegex, "");
                }
                if (trimType & 2) {
                    str = str.replace(trailingWhitespaceRegex, "");
                }
                return str;
            };
        };

        module.exports = {
            start: createTrimFunction(1),
            end: createTrimFunction(2),
            trim: createTrimFunction(3)
        };
    },
    // Module 74
    function (module, exports, requireModule) {
        "use strict";
        // Collection.prototype.deleteAll polyfill
        let validateFunction = requireModule(4);
        let validateObject = requireModule(1);

        module.exports = function () {
            let collection = validateObject(this);
            let deleteMethod = validateFunction(collection.delete);
            let allDeleted = true;
            for (let i = 0; i < arguments.length; i++) {
                allDeleted = allDeleted && deleteMethod.call(collection, arguments[i]);
            }
            return !!allDeleted;
        };
    },
    // Module 75
    function (module, exports, requireModule) {
        "use strict";
        // Collection.from method (Map.from, Set.from)
        let validateFunction = requireModule(4);
        let getBoundFunction = requireModule(13);
        let iterateOver = requireModule(3);

        module.exports = function (iterable) {
            let Constructor = this;
            let argsLength = arguments.length;
            let mapFn = argsLength > 1 ? arguments[1] : undefined;
            let thisArg = argsLength > 2 ? arguments[2] : undefined;
            let result = [];
            let index = 0;

            validateFunction(Constructor); // Ensure 'this' is a constructor

            // If a map function is provided, bind it
            if (mapFn !== undefined) {
                validateFunction(mapFn);
                mapFn = getBoundFunction(mapFn, thisArg, 2);
            }

            // If iterable is null or undefined, create an empty collection
            if (iterable === null || iterable === undefined) {
                return new Constructor();
            }

            // Iterate and populate the result array
            iterateOver(iterable, function (value) {
                result.push(mapFn ? mapFn(value, index++) : value);
            }, undefined, true, false);

            // Create a new collection from the results
            return new Constructor(result);
        };
    },
    // Module 76
    function (module, exports, requireModule) {
        "use strict";
        // Collection.of method (Map.of, Set.of)
        module.exports = function () {
            let Constructor = this;
            let argsLength = arguments.length;
            let argsArray = new Array(argsLength);
            for (let i = argsLength; i--;) {
                argsArray[i] = arguments[i];
            }
            return new Constructor(argsArray);
        };
    },
    // Module 77
    function (module, exports, requireModule) {
        // Converts a string or primitive to an indexed object for array-like operations
        let testError = requireModule(7);
        let getObjectClass = requireModule(28);
        let stringSplit = "".split;

        // Bug in IE8 where Object("z").propertyIsEnumerable(0) returns false
        let isBuggy = testError(function () {
            return !Object("z").propertyIsEnumerable(0);
        });

        module.exports = isBuggy ? function (value) {
            return getObjectClass(value) === "String" ? stringSplit.call(value, "") : Object(value);
        } : Object;
    },
    // Module 78
    function (module, exports, requireModule) {
        // Creates a DOM element (for testing purposes, e.g., in IE)
        let globalScope = requireModule(5);
        let isObject = requireModule(8);
        let documentInstance = globalScope.document;
        let createElementCached = isObject(documentInstance) && isObject(documentInstance.createElement);

        module.exports = function (tagName) {
            return createElementCached ? documentInstance.createElement(tagName) : {};
        };
    },
    // Module 79
    function (module, exports, requireModule) {
        // Defines a non-enumerable property on the global object
        let globalScope = requireModule(5);
        let defineNonEnumerable = requireModule(16);

        module.exports = function (key, value) {
            try {
                defineNonEnumerable(globalScope, key, value);
            } catch (e) {
                globalScope[key] = value;
            }
            return value;
        };
    },
    // Module 80
    function (module, exports, requireModule) {
        // Get all own property keys (names + symbols) of an object
        let getBuiltIn = requireModule(12);
        let getOwnPropertyNames = requireModule(39);
        let getOwnPropertySymbols = requireModule(83);
        let validateObject = requireModule(1);

        module.exports = getBuiltIn("Reflect", "ownKeys") || function (obj) {
            let names = getOwnPropertyNames.f(validateObject(obj));
            let symbols = getOwnPropertySymbols.f;
            return symbols ? names.concat(symbols(obj)) : names;
        };
    },
    // Module 81
    function (module, exports, requireModule) {
        // Get a global object from the shared registry
        module.exports = requireModule(5);
    },
    // Module 82
    function (module, exports) {
        // List of properties to exclude from Object.getOwnPropertyNames (for internal use)
        module.exports = [
            "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable",
            "toLocaleString", "toString", "valueOf"
        ];
    },
    // Module 83
    function (module, exports) {
        // Get own property symbols of an object
        exports.f = Object.getOwnPropertySymbols;
    },
    // Module 84
    function (module, exports, requireModule) {
        // Checks if an object is iterable (has @@iterator)
        let iteratorSymbol = requireModule(6)("iterator");
        let iteratorRegistry = requireModule(51); // Map of iterators
        let arrayPrototype = Array.prototype;

        module.exports = function (value) {
            return value !== undefined &&
                (iteratorRegistry.Array === value || arrayPrototype[iteratorSymbol] === value);
        };
    },
    // Module 85
    function (module, exports, requireModule) {
        "use strict";
        // Checks if an array method is properly implemented (handles sparse arrays and thisArg)
        let testError = requireModule(7);
        module.exports = function (methodName, args) {
            let nativeMethod = [][methodName];
            return !nativeMethod || !testError(function () {
                nativeMethod.call(null, args || function () {
                    throw 1;
                }, 1);
            });
        };
    },
    // Module 86
    function (module, exports, requireModule) {
        "use strict";
        // Array.prototype.entries, keys, values polyfills
        requireModule(87)(
            Array,
            "Array",
            function (array, type) {
                // Set internal state for the iterator
                requireModule(18).set(this, {
                    type: "Array Iterator",
                    target: requireModule(25)(array), // The array being iterated
                    index: 0,
                    kind: type // "keys", "values", "entries"
                });
            },
            function () {
                // The next method for the iterator
                let internalState = requireModule(18).get(this);
                let targetArray = internalState.target;
                let kind = internalState.kind;
                let index = internalState.index++;

                if (!targetArray || index >= targetArray.length) {
                    internalState.target = undefined; // Mark as finished
                    return { value: undefined, done: true };
                }

                if (kind === "keys") {
                    return { value: index, done: false };
                }
                if (kind === "values") {
                    return { value: targetArray[index], done: false };
                }
                // "entries"
                return { value: [index, targetArray[index]], done: false };
            },
            "values"
        );

        // Alias for Arguments object
        requireModule(51).Arguments = requireModule(51).Array;
        // Mark these methods as unscopable
        requireModule(41)("keys");
        requireModule(41)("values");
        requireModule(41)("entries");
    },
    // Module 87
    function (module, exports, requireModule) {
        "use strict";
        // Abstract class for iterators
        let exportHelper = requireModule(0);
        let createIteratorPrototype = requireModule(54);
        let getPrototypeOf = requireModule(21);
        let setPrototypeOf = requireModule(42);
        let defineNonEnumerable = requireModule(16);
        let createNamedProperty = requireModule(23);
        let getWellKnownSymbol = requireModule(6);
        let isPure = requireModule(2);
        let iteratorRegistry = requireModule(51);
        let iteratorPrototype = requireModule(109).IteratorPrototype;
        let isSafariBuggyIterators = requireModule(109).BUGGY_SAFARI_ITERATORS;
        let iteratorSymbol = getWellKnownSymbol("iterator");

        // Dummy function for iterator method
        let dummyIteratorMethod = function () {
            return this;
        };

        module.exports = function (Constructor, typeName, iteratorPrototypeFactory, nextMethod, defaultIteratorKind, forceStaticMethods, bypassPrototypeCheck) {
            createIteratorPrototype(iteratorPrototypeFactory, typeName, nextMethod);
            let getIteratorMethod = function (kind) {
                if (kind === defaultIteratorKind && nativeIterator === iterator) {
                    return iterator;
                }
                if (!isSafariBuggyIterators && kind in methods) {
                    return methods[kind];
                }
                switch (kind) {
                    case "keys":
                        return function () {
                            return new iteratorPrototypeFactory(this, kind);
                        };
                    case "values":
                        return function () {
                            return new iteratorPrototypeFactory(this, kind);
                        };
                    case "entries":
                        return function () {
                            return new iteratorPrototypeFactory(this, kind);
                        };
                }
                return function () {
                    return new iteratorPrototypeFactory(this, kind);
                };
            };

            let typePrototype = Constructor.prototype;
            let methods = {
                keys: getIteratorMethod("keys"),
                values: getIteratorMethod("values"),
                entries: getIteratorMethod("entries")
            };
            let isIteratorRegistered = typeName + " Iterator";
            let isArrayIterator = typeName === "Array" && typePrototype.entries;
            let nativeIterator = isArrayIterator || typePrototype[iteratorSymbol] || typePrototype["@@iterator"] || (forceStaticMethods && typePrototype[defaultIteratorKind]);
            let iterator = !isSafariBuggyIterators && nativeIterator || getIteratorMethod(defaultIteratorKind);
            let needToDefineIterator = !isPure && !bypassPrototypeCheck && typePrototype[iteratorSymbol] !== iterator;

            // If native iterator is present and its prototype is not the common iterator prototype
            if (nativeIterator && (nativeIterator = getPrototypeOf(nativeIterator.call(new Constructor()))) && iteratorPrototype !== Object.prototype &&
                nativeIterator.next && (isPure || getPrototypeOf(nativeIterator) !== iteratorPrototype || setPrototypeOf)) {
                if (setPrototypeOf) {
                    setPrototypeOf(nativeIterator, iteratorPrototype);
                }
                if (!isPure && !hasProperty(nativeIterator, iteratorSymbol)) {
                    defineNonEnumerable(nativeIterator, iteratorSymbol, dummyIteratorMethod);
                }
            }

            // Register iterator in the registry
            if (!isPure) {
                iteratorRegistry[isIteratorRegistered] = dummyIteratorMethod;
            }

            // If 'values' is the default and native iterator name is different, wrap it
            if (defaultIteratorKind === "values" && nativeIterator && nativeIterator.name !== "values") {
                if (!isPure) {
                    iterator = function () {
                        return nativeIterator.call(this);
                    };
                }
            }

            // Define @@iterator on the prototype
            if (isPure || needToDefineIterator || typePrototype[iteratorSymbol] !== iterator) {
                defineNonEnumerable(typePrototype, iteratorSymbol, iterator);
            }
            iteratorRegistry[typeName] = iterator;

            // Define static methods (keys, values, entries)
            if (forceStaticMethods) {
                for (let methodKey in methods) {
                    let method = methods[methodKey];
                    if (!isSafariBuggyIterators && !isPure && methodKey in typePrototype || createNamedProperty(typePrototype, methodKey, method)) {
                        // Safely define property
                    }
                }
            }
            return methods;
        };
    },
    // Module 88
    function (module, exports, requireModule) {
        "use strict";
        // Map implementation (for polyfill)
        let collectionTemplate = requireModule(65);
        let collectionUtils = requireModule(114); // Utilities for Map/Set

        module.exports = collectionTemplate("Map", function (getConstructor) {
            return function () {
                return getConstructor(this, arguments.length > 0 ? arguments[0] : undefined);
            };
        }, collectionUtils, true);
    },
    // Module 89
    function (module, exports, requireModule) {
        // User agent string
        let getBuiltIn = requireModule(12);
        module.exports = getBuiltIn("navigator", "userAgent") || "";
    },
    // Module 90
    function (module, exports, requireModule) {
        // Ensures a value is not a RegExp
        let isRegExp = requireModule(69);
        module.exports = function (value) {
            if (isRegExp(value)) {
                throw TypeError("The method doesn't accept regular expressions");
            }
            return value;
        };
    },
    // Module 91
    function (module, exports, requireModule) {
        // Check for String method bugs with RegExp
        let getWellKnownSymbol = requireModule(6)("match");
        module.exports = function (methodName) {
            let regex = /./;
            try {
                "/./"[methodName](regex);
            } catch (e) {
                try {
                    regex[getWellKnownSymbol] = false;
                    return "/./"[methodName](regex);
                } catch (error) {
                    // Ignore
                }
            }
            return true;
        };
    },
    // Module 92
    function (module, exports, requireModule) {
        "use strict";
        // Native RegExp.prototype.exec with fixes for sticky and lastIndex bugs
        let getRegExpFlags = requireModule(44);
        let nativeExec = RegExp.prototype.exec;
        let stringReplace = String.prototype.replace;
        let fixedExec = nativeExec;

        let lastIndexBug = (function () {
            let regex = /a/;
            let emptyRegex = /b*/g;
            nativeExec.call(regex, "a");
            nativeExec.call(emptyRegex, "a");
            // Check if lastIndex is correctly reset
            return regex.lastIndex !== 0 || emptyRegex.lastIndex !== 0;
        })();

        let namedCapturesBug = (function () {
            // Test for named capture groups bug
            return typeof /()??/.exec("")[1] === "undefined";
        })();

        if (lastIndexBug || namedCapturesBug) {
            fixedExec = function (string) {
                let currentRegex = this;
                let result;
                let matchLength;
                let i;

                if (namedCapturesBug) {
                    result = new RegExp("^" + currentRegex.source + "$(?!\\s)", getRegExpFlags.call(currentRegex));
                }

                if (lastIndexBug) {
                    matchLength = currentRegex.lastIndex;
                }

                result = nativeExec.call(currentRegex, string);

                if (lastIndexBug && result) {
                    currentRegex.lastIndex = currentRegex.global ? result.index + result[0].length : matchLength;
                }

                if (namedCapturesBug && result && result.length > 1) {
                    stringReplace.call(result[0], result, function () {
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

        module.exports = fixedExec;
    },
    // Module 93
    function (module, exports) {
        // Whitespace characters for String.prototype.trim
        module.exports = "\t\n\v\f\r \u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    },
    // Module 94
    function (module, exports, requireModule) {
        // Checks for String.prototype.trim bugs
        let testError = requireModule(7);
        let whitespaceChars = requireModule(93);

        module.exports = function (methodName) {
            return testError(function () {
                return !!whitespaceChars[methodName]() || "\u200B\u0085\u180E" !== "\u200B\u0085\u180E"[methodName]() || String.prototype[methodName].name !== methodName;
            });
        };
    },
    // Module 95
    function (module, exports, requireModule) {
        // Checks if Typed Arrays are natively supported and functional
        let testError = requireModule(7);
        let globalScope = requireModule(5);
        let checkIterable = requireModule(64); // Check if iterable is correctly implemented
        let ArrayBuffer = globalScope.ArrayBuffer;
        let Int8Array = globalScope.Int8Array;

        module.exports = !ArrayBuffer || !testError(function () {
            Int8Array(1); // Test basic construction
        }) || !testError(function () {
            new Int8Array(-1); // Test negative length
        }) || !checkIterable(function (iterable) {
            new Int8Array();
            new Int8Array(null);
            new Int8Array(1.5);
            new Int8Array(iterable);
        }, true) || testError(function () {
            // Test ArrayBuffer view creation with offset and length
            return new Int8Array(new ArrayBuffer(2), 1, undefined).length !== 1;
        });
    },
    // Module 96
    function (module, exports, requireModule) {
        "use strict";
        // WeakMap implementation (for polyfill)
        let collectionTemplate = requireModule(65);
        let globalScope = requireModule(5);
        let internalState = requireModule(66);
        let hasProperty = requireModule(14);
        let isObject = requireModule(8);
        let validateInstance = requireModule(31);
        let iterateOver = requireModule(3);
        let arrayFilter = requireModule(48).filter;
        let arrayFindIndex = requireModule(48).findIndex;

        // Fallback for environments without native WeakMap
        let internalMapFallback = 0; // Unique ID for each WeakMap instance
        let EntryStore = function () {
            this.entries = [];
        };
        EntryStore.prototype = {
            get: function (key) {
                let entry = arrayFilter(this.entries, function (entry) {
                    return entry[0] === key;
                })[0];
                return entry ? entry[1] : undefined;
            },
            has: function (key) {
                return !!arrayFilter(this.entries, function (entry) {
                    return entry[0] === key;
                })[0];
            },
            set: function (key, value) {
                let entry = arrayFilter(this.entries, function (entry) {
                    return entry[0] === key;
                })[0];
                if (entry) {
                    entry[1] = value;
                } else {
                    this.entries.push([key, value]);
                }
            },
            delete: function (key) {
                let index = arrayFindIndex(this.entries, function (entry) {
                    return entry[0] === key;
                });
                if (~index) {
                    this.entries.splice(index, 1);
                }
                return !!~index;
            }
        };

        module.exports = collectionTemplate("WeakMap", function (getConstructor) {
            return function () {
                return getConstructor(this, arguments.length > 0 ? arguments[0] : undefined);
            };
        }, {
            getConstructor: function (Constructor, typeName, isWeak, addOrSetMethod) {
                let WeakCollection = Constructor(function (instance, iterable) {
                    validateInstance(instance, WeakCollection, typeName);
                    requireModule(18).set(instance, { type: typeName, id: internalMapFallback++, frozen: undefined });
                    if (iterable !== null && iterable !== undefined) {
                        iterateOver(iterable, instance[addOrSetMethod], instance, isWeak);
                    }
                });

                let getInternalState = requireModule(18).getterFor(typeName);
                let setWeakEntry = function (collection, key, value) {
                    let state = getInternalState(collection);
                    let weakData = internalState.getWeakData(requireModule(1)(key), true);
                    if (weakData === true) {
                        // Frozen object fallback
                        if (state.frozen === undefined) {
                            state.frozen = new EntryStore();
                        }
                        state.frozen.set(key, value);
                    } else {
                        weakData[state.id] = value;
                    }
                    return collection;
                };

                requireModule(36)(WeakCollection.prototype, {
                    delete: function (key) {
                        let state = getInternalState(this);
                        if (!isObject(key)) {
                            return false;
                        }
                        let weakData = internalState.getWeakData(key);
                        if (weakData === true) {
                            return state.frozen === undefined ? false : state.frozen.delete(key);
                        }
                        return weakData && hasProperty(weakData, state.id) && delete weakData[state.id];
                    },
                    has: function (key) {
                        let state = getInternalState(this);
                        if (!isObject(key)) {
                            return false;
                        }
                        let weakData = internalState.getWeakData(key);
                        if (weakData === true) {
                            return state.frozen === undefined ? false : state.frozen.has(key);
                        }
                        return weakData && hasProperty(weakData, state.id);
                    }
                });

                requireModule(36)(WeakCollection.prototype, isStrong ? {
                    get: function (key) {
                        let state = getInternalState(this);
                        if (isObject(key)) {
                            let weakData = internalState.getWeakData(key);
                            if (weakData === true) {
                                return state.frozen === undefined ? undefined : state.frozen.get(key);
                            }
                            return weakData ? weakData[state.id] : undefined;
                        }
                    },
                    set: function (key, value) {
                        return setWeakEntry(this, key, value);
                    }
                } : {
                    add: function (value) {
                        return setWeakEntry(this, value, true);
                    }
                });
                return WeakCollection;
            }
        }, true, true);
    },
    // Module 97
    function (module, exports, requireModule) {
        // Check for Object.defineProperty reliability (IE8 bug)
        let supportsDefineProperty = requireModule(9);
        let testError = requireModule(7);
        let createElement = requireModule(78);

        module.exports = !supportsDefineProperty && !testError(function () {
            return Object.defineProperty(createElement("div"), "a", {
                get: function () {
                    return 7;
                }
            }).a !== 7;
        });
    },
    // Module 98
    function (module, exports, requireModule) {
        // Get the source code of a native function
        let globalScope = requireModule(5);
        let sharedRegistry = requireModule(38);
        module.exports = sharedRegistry("native-function-to-string", Function.toString);
    },
    // Module 99
    function (module, exports, requireModule) {
        // Check if native WeakMap is available and usable
        let globalScope = requireModule(5);
        let getSourceCode = requireModule(98);
        let NativeWeakMap = globalScope.WeakMap;
        module.exports = typeof NativeWeakMap === "function" && /native code/.test(getSourceCode.call(NativeWeakMap));
    },
    // Module 100
    function (module, exports, requireModule) {
        // Copies properties from a source object to a target object
        let hasProperty = requireModule(14);
        let getPropertyKeys = requireModule(80); // Get all property keys (names + symbols)
        let getOwnPropertyDescriptor = requireModule(22);
        let defineProperty = requireModule(11);

        module.exports = function (target, source) {
            let keys = getPropertyKeys(source);
            let definePropertyF = defineProperty.f;
            let getOwnPropertyDescriptorF = getOwnPropertyDescriptor.f;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (!hasProperty(target, key)) {
                    definePropertyF(target, key, getOwnPropertyDescriptorF(source, key));
                }
            }
        };
    },
    // Module 101
    function (module, exports, requireModule) {
        // Shim for Object.getOwnPropertyNames (excludes properties from an array)
        let hasProperty = requireModule(14);
        let toIndexedObject = requireModule(25);
        let arrayIndexOf = requireModule(60).indexOf;
        let internalPropertyMap = requireModule(46);

        module.exports = function (obj, excluded) {
            let indexedObj = toIndexedObject(obj);
            let result = [];
            let key;
            for (key in indexedObj) {
                // Exclude internal properties and properties in the 'excluded' array
                if (!hasProperty(internalPropertyMap, key) && hasProperty(indexedObj, key)) {
                    result.push(key);
                }
            }
            let i = excluded.length;
            while (i--) {
                key = excluded[i];
                if (hasProperty(indexedObj, key) && arrayIndexOf(result, key) < 0) {
                    result.push(key);
                }
            }
            return result;
        };
    },
    // Module 102
    function (module, exports, requireModule) {
        // Check if native Symbol is available and usable
        let testError = requireModule(7);
        module.exports = !!Object.getOwnPropertySymbols && !testError(function () {
            return !String(Symbol());
        });
    },
    // Module 103
    function (module, exports, requireModule) {
        // Defines multiple properties on an object using descriptors
        let supportsDefineProperty = requireModule(9);
        let defineProperty = requireModule(11);
        let validateObject = requireModule(1);
        let getOwnPropertyKeys = requireModule(63); // Get own enumerable property names

        module.exports = supportsDefineProperty ? Object.defineProperties : function (obj, properties) {
            validateObject(obj);
            let keys = getOwnPropertyKeys(properties);
            let definePropertyF = defineProperty.f;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                definePropertyF(obj, key, properties[key]);
            }
            return obj;
        };
    },
    // Module 104
    function (module, exports, requireModule) {
        // Get the documentElement (for creating script elements in IE)
        let globalScope = requireModule(5);
        module.exports = globalScope.document && globalScope.document.documentElement;
    },
    // Module 105
    function (module, exports, requireModule) {
        // Returns a Symbol for a well-known symbol name
        exports.f = requireModule(6);
    },
    // Module 106
    function (module, exports, requireModule) {
        "use strict";
        // Recursive helper for Array.prototype.flat and flatMap
        let isArray = requireModule(47);
        let toLength = requireModule(10);
        let getBoundFunction = requireModule(13);

        let flattenIntoArray = function (targetArray, originalArray, sourceArray, length, start, depth, mapFn, thisArg) {
            let k = start;
            let currentElement, mappedElement;
            let targetIndex = 0;
            let mappedCallback = mapFn !== undefined ? getBoundFunction(mapFn, thisArg, 3) : undefined;

            while (k < length) {
                if (k in sourceArray) {
                    currentElement = sourceArray[k];
                    if (mappedCallback) {
                        mappedElement = mappedCallback(currentElement, k, originalArray);
                    } else {
                        mappedElement = currentElement;
                    }

                    if (depth > 0 && isArray(mappedElement)) {
                        if (targetIndex + toLength(mappedElement.length) > 9007199254740991) {
                            throw TypeError("Exceed the acceptable array length");
                        }
                        targetIndex = flattenIntoArray(targetArray, originalArray, mappedElement, toLength(mappedElement.length), 0, depth - 1, mapFn, thisArg);
                    } else {
                        if (targetIndex >= 9007199254740991) {
                            throw TypeError("Exceed the acceptable array length");
                        }
                        targetArray[targetIndex++] = mappedElement;
                    }
                }
                k++;
            }
            return targetIndex;
        };

        module.exports = flattenIntoArray;
    },
    // Module 107
    function (module, exports, requireModule) {
        "use strict";
        // Array.from implementation
        let getBoundFunction = requireModule(13);
        let toObject = requireModule(15);
        let consumeIterator = requireModule(108);
        let isArrayLike = requireModule(84); // Check if iterable is array-like
        let toLength = requireModule(10);
        let createProperty = requireModule(40);
        let getIteratorMethod = requireModule(52);

        module.exports = function (arrayLike) {
            let obj = toObject(arrayLike);
            let Constructor = typeof this === "function" ? this : Array; // Use current constructor or Array
            let argsLength = arguments.length;
            let mapFn = argsLength > 1 ? arguments[1] : undefined;
            let mapContext = argsLength > 2 ? arguments[2] : undefined;
            let index = 0;
            let newArray;
            let iterator;

            // Bind map function if provided
            if (mapFn !== undefined) {
                mapFn = getBoundFunction(mapFn, mapContext, 2);
            }

            // Get iterator or treat as array-like
            let iteratorMethod = getIteratorMethod(obj);
            if (iteratorMethod === null || iteratorMethod === undefined || Constructor === Array && isArrayLike(iteratorMethod)) {
                let length = toLength(obj.length);
                newArray = new Constructor(length);
                for (; index < length; index++) {
                    createProperty(newArray, index, mapFn ? mapFn(obj[index], index) : obj[index]);
                }
            } else {
                iterator = iteratorMethod.call(obj);
                newArray = new Constructor();
                let iterationResult;
                while (!(iterationResult = iterator.next()).done) {
                    createProperty(newArray, index, mapFn ? consumeIterator(iterator, mapFn, [iterationResult.value, index], true) : iterationResult.value);
                    index++;
                }
            }
            newArray.length = index;
            return newArray;
        };
    },
    // Module 108
    function (module, exports, requireModule) {
        // Helper to consume an iterator and handle early termination
        let validateObject = requireModule(1);
        module.exports = function (iterator, callback, value, isArrayLike) {
            try {
                return isArrayLike ? callback(validateObject(value)[0], value[1]) : callback(value);
            } catch (e) {
                let returnMethod = iterator.return;
                if (returnMethod !== undefined) {
                    validateObject(returnMethod.call(iterator));
                }
                throw e;
            }
        };
    },
    // Module 109
    function (module, exports, requireModule) {
        "use strict";
        // Iterator prototype and Safari bug detection
        let getPrototypeOf = requireModule(21);
        let defineNonEnumerable = requireModule(16);
        let hasProperty = requireModule(14);
        let getWellKnownSymbol = requireModule(6)("iterator");
        let isPure = requireModule(2);

        let iteratorPrototype = {};
        let isSafariBuggy = false;

        // Detect Safari's buggy iterator prototype
        if ([].keys && !("next" in [].keys())) {
            isSafariBuggy = true;
        }

        // If not pure and no native iterator prototype, create one
        if (!isPure && !hasProperty(iteratorPrototype, getWellKnownSymbol)) {
            defineNonEnumerable(iteratorPrototype, getWellKnownSymbol, function () {
                return this;
            });
        }

        module.exports = {
            IteratorPrototype: iteratorPrototype,
            BUGGY_SAFARI_ITERATORS: isSafariBuggy
        };
    },
    // Module 110
    function (module, exports, requireModule) {
        // Check for native Object.getPrototypeOf reliability
        let testError = requireModule(7);
        module.exports = !testError(function () {
            function TestConstructor() {
            }

            TestConstructor.prototype.constructor = null;
            return Object.getPrototypeOf(new TestConstructor()) !== TestConstructor.prototype;
        });
    },
    // Module 111
    function (module, exports, requireModule) {
        // Ensures a value is a valid prototype (object or null)
        let isObject = requireModule(8);
        module.exports = function (value) {
            if (!isObject(value) && value !== null) {
                throw TypeError("Cannot set " + String(value) + " as a prototype");
            }
            return value;
        };
    },
    // Module 112
    function (module, exports, requireModule) {
        // Check for Object.isExtensible bug
        let testError = requireModule(7);
        module.exports = !testError(function () {
            return Object.isExtensible(Object.preventExtensions({}));
        });
    },
    // Module 113
    function (module, exports, requireModule) {
        // Enforce collection type for new instances
        let isObject = requireModule(8);
        let setPrototypeOf = requireModule(42);
        module.exports = function (target, instance, Constructor) {
            let instanceProto, constructorProto;
            if (setPrototypeOf && typeof (instanceProto = Constructor.constructor) === "function" &&
                instanceProto !== Constructor && isObject(constructorProto = instanceProto.prototype) &&
                constructorProto !== Constructor.prototype) {
                setPrototypeOf(target, constructorProto);
            }
            return target;
        };
    },
    // Module 114
    function (module, exports, requireModule) {
        // Map/Set collection utilities (getConstructor, setStrong)
        let defineProperty = requireModule(11).f;
        let createObject = requireModule(30);
        let defineMultipleProperties = requireModule(36);
        let getBoundFunction = requireModule(13);
        let validateInstance = requireModule(31);
        let iterateOver = requireModule(3);
        let setToStringTag = requireModule(26);
        let supportsDefineProperty = requireModule(9);
        let internalState = requireModule(66);
        let setInternal = requireModule(18).set;
        let getInternal = requireModule(18).getterFor;

        module.exports = {
            getConstructor: function (CollectionConstructor, collectionName, isStrong, addOrSetMethod) {
                let NewCollection = CollectionConstructor(function (instance, iterable) {
                    validateInstance(instance, NewCollection, collectionName);
                    setInternal(instance, {
                        type: collectionName,
                        index: createObject(null), // For fast key lookup
                        first: undefined,
                        last: undefined,
                        size: 0
                    });
                    if (supportsDefineProperty) {
                        instance.size = 0;
                    }
                    if (iterable !== null && iterable !== undefined) {
                        iterateOver(iterable, instance[addOrSetMethod], instance, isStrong);
                    }
                });

                let getCollectionState = getInternal(collectionName);

                let addOrSetEntry = function (collection, key, value) {
                    let state = getCollectionState(collection);
                    let existingEntry = getEntry(collection, key);

                    if (existingEntry) {
                        existingEntry.value = value;
                    } else {
                        // Create a new entry
                        let newEntry = {
                            index: internalState.fastKey(key, true),
                            key: key,
                            value: value,
                            previous: state.last,
                            next: undefined,
                            removed: false
                        };
                        if (state.first === undefined) {
                            state.first = newEntry;
                        }
                        if (state.last !== undefined) {
                            state.last.next = newEntry;
                        }
                        state.last = newEntry;
                        if (newEntry.index !== "F") { // If not a frozen object
                            state.index[newEntry.index] = newEntry;
                        }
                        state.size++;
                    }
                    return collection;
                };

                let getEntry = function (collection, key) {
                    let state = getCollectionState(collection);
                    let fastKey = internalState.fastKey(key);

                    if (fastKey !== "F") {
                        return state.index[fastKey];
                    }

                    // Fallback for frozen objects
                    let currentEntry = state.first;
                    while (currentEntry) {
                        if (currentEntry.key === key) {
                            return currentEntry;
                        }
                        currentEntry = currentEntry.next;
                    }
                };

                defineMultipleProperties(NewCollection.prototype, {
                    clear: function () {
                        let state = getCollectionState(this);
                        let indexMap = state.index;
                        let currentEntry = state.first;
                        while (currentEntry) {
                            currentEntry.removed = true;
                            if (currentEntry.previous) {
                                currentEntry.previous = currentEntry.previous.next = undefined;
                            }
                            delete indexMap[currentEntry.index];
                            currentEntry = currentEntry.next;
                        }
                        state.first = state.last = undefined;
                        state.size = 0;
                    },
                    delete: function (key) {
                        let state = getCollectionState(this);
                        let entryToDelete = getEntry(this, key);

                        if (entryToDelete) {
                            let nextEntry = entryToDelete.next;
                            let prevEntry = entryToDelete.previous;
                            delete state.index[entryToDelete.index];
                            entryToDelete.removed = true;
                            if (prevEntry) {
                                prevEntry.next = nextEntry;
                            }
                            if (nextEntry) {
                                nextEntry.previous = prevEntry;
                            }
                            if (state.first === entryToDelete) {
                                state.first = nextEntry;
                            }
                            if (state.last === entryToDelete) {
                                state.last = prevEntry;
                            }
                            state.size--;
                        }
                        return !!entryToDelete;
                    },
                    forEach: function (callback) {
                        let state = getCollectionState(this);
                        let boundCallback = getBoundFunction(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
                        let currentEntry;
                        while (currentEntry = (currentEntry ? currentEntry.next : state.first)) {
                            while (currentEntry && currentEntry.removed) {
                                currentEntry = currentEntry.previous; // Go back if current was removed
                                if (currentEntry) currentEntry = currentEntry.next; // Then move forward again
                            }
                            if (!currentEntry) break; // If we ran out of entries
                            boundCallback(currentEntry.value, currentEntry.key, this);
                        }
                    },
                    has: function (key) {
                        return !!getEntry(this, key);
                    }
                });

                defineMultipleProperties(NewCollection.prototype, isStrong ? {
                    get: function (key) {
                        let entry = getEntry(this, key);
                        return entry && entry.value;
                    },
                    set: function (key, value) {
                        return addOrSetEntry(this, key === 0 ? 0 : key, value);
                    }
                } : {
                    add: function (value) {
                        return addOrSetEntry(this, value = value === 0 ? 0 : value, value);
                    }
                });

                if (supportsDefineProperty) {
                    defineProperty(NewCollection.prototype, "size", {
                        get: function () {
                            return getCollectionState(this).size;
                        }
                    });
                }
                return NewCollection;
            },

            setStrong: function (CollectionConstructor, collectionName, isStrong) {
                let IteratorTypeName = collectionName + " Iterator";
                let getCollectionState = getInternal(collectionName);
                let getIteratorState = getInternal(IteratorTypeName);

                requireModule(87)(
                    CollectionConstructor,
                    collectionName,
                    function (collection, kind) {
                        setInternal(this, {
                            type: IteratorTypeName,
                            target: collection,
                            state: getCollectionState(collection),
                            kind: kind,
                            lastVisitedEntry: undefined
                        });
                    },
                    function () {
                        let iteratorState = getIteratorState(this);
                        let kind = iteratorState.kind;
                        let lastEntry = iteratorState.lastVisitedEntry;
                        let nextEntry;

                        // Find the next valid entry
                        while (lastEntry && lastEntry.removed) {
                            lastEntry = lastEntry.previous;
                        }
                        nextEntry = lastEntry ? lastEntry.next : iteratorState.state.first;

                        // Skip removed entries
                        while (nextEntry && nextEntry.removed) {
                            nextEntry = nextEntry.next;
                        }

                        if (iteratorState.target && nextEntry) {
                            iteratorState.lastVisitedEntry = nextEntry;
                            if (kind === "keys") {
                                return { value: nextEntry.key, done: false };
                            }
                            if (kind === "values") {
                                return { value: nextEntry.value, done: false };
                            }
                            // "entries"
                            return { value: [nextEntry.key, nextEntry.value], done: false };
                        } else {
                            iteratorState.target = undefined; // Mark as finished
                            return { value: undefined, done: true };
                        }
                    },
                    isStrong ? "entries" : "values",
                    !isStrong,
                    true
                );
                setToStringTag(CollectionConstructor, collectionName);
            }
        };
    },
    // Module 115
    function (module, exports, requireModule) {
        "use strict";
        // Object.assign polyfill
        let supportsDefineProperty = requireModule(9);
        let testError = requireModule(7);
        let getOwnPropertyKeys = requireModule(63);
        let getOwnPropertySymbols = requireModule(83);
        let isPropertyEnumerable = requireModule(58);
        let toObject = requireModule(15);
        let toIndexedObject = requireModule(77);
        let nativeAssign = Object.assign;

        // Check for bugs in native Object.assign
        let isBuggy = !nativeAssign || testError(function () {
            let obj1 = {};
            let sym = Symbol();
            let obj2 = {};
            obj1[sym] = 7;
            "abcdefghijklmnopqrst".split("").forEach(function (char) {
                obj2[char] = char;
            });
            return nativeAssign({}, obj1)[sym] !== 7 || getOwnPropertyKeys(nativeAssign({}, obj2)).join("") !== "abcdefghijklmnopqrst";
        });

        module.exports = isBuggy ? function (target, source) {
            let to = toObject(target);
            let i = 1;
            let argsLength = arguments.length;
            let getSymbols = getOwnPropertySymbols.f;
            let isEnumerable = isPropertyEnumerable.f;

            while (i < argsLength) {
                let nextSource = toIndexedObject(arguments[i++]);
                let keys = getOwnPropertyKeys(nextSource);
                let symbols = getSymbols ? getSymbols(nextSource) : [];
                let j = 0;
                let key;

                // Copy string keys
                while (j < keys.length) {
                    key = keys[j++];
                    if (supportsDefineProperty ? isEnumerable.call(nextSource, key) : true) {
                        to[key] = nextSource[key];
                    }
                }
                // Copy symbol keys
                j = 0;
                while (j < symbols.length) {
                    key = symbols[j++];
                    if (supportsDefineProperty ? isEnumerable.call(nextSource, key) : true) {
                        to[key] = nextSource[key];
                    }
                }
            }
            return to;
        } : nativeAssign;
    },
    // Module 116
    function (module, exports, requireModule) {
        // Object.entries and Object.values polyfills
        let supportsDefineProperty = requireModule(9);
        let getOwnPropertyKeys = requireModule(63);
        let toIndexedObject = requireModule(25);
        let isPropertyEnumerable = requireModule(58).f;

        let createEntriesOrValues = function (isEntries) {
            return function (obj) {
                let indexedObj = toIndexedObject(obj);
                let keys = getOwnPropertyKeys(indexedObj);
                let result = [];
                let key;
                for (let i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (supportsDefineProperty ? isPropertyEnumerable.call(indexedObj, key) : true) {
                        result.push(isEntries ? [key, indexedObj[key]] : indexedObj[key]);
                    }
                }
                return result;
            };
        };

        module.exports = {
            entries: createEntriesOrValues(true),
            values: createEntriesOrValues(false)
        };
    },
    // Module 117
    function (module, exports, requireModule) {
        // SetImmediate polyfill and microtask queue
        let globalScope = requireModule(5);
        let testError = requireModule(7);
        let getObjectClass = requireModule(28);
        let getBoundFunction = requireModule(13);
        let getDocumentElement = requireModule(104);
        let createElement = requireModule(78);

        let nextTickQueue = [];
        let nextTickId = 0;
        let nextTickCallbacks = {};
        let isProcessing = false;

        let executeNextTick = function (id) {
            if (nextTickCallbacks.hasOwnProperty(id)) {
                let callback = nextTickCallbacks[id];
                delete nextTickCallbacks[id];
                callback();
            }
        };

        let createNextTickHandler = function (id) {
            return function () {
                executeNextTick(id);
            };
        };

        let setImmediatePolyfill;
        let clearImmediatePolyfill;

        if (globalScope.setImmediate && globalScope.clearImmediate) {
            setImmediatePolyfill = globalScope.setImmediate;
            clearImmediatePolyfill = globalScope.clearImmediate;
        } else {
            let channel, port1, port2;
            let process = globalScope.process;
            let MessageChannel = globalScope.MessageChannel;
            let Dispatch = globalScope.Dispatch;
            let postMessage = globalScope.postMessage;
            let addEventListener = globalScope.addEventListener;

            let handleMessage = function (event) {
                executeNextTick(event.data);
            };
            let postMessageToGlobal = function (data) {
                postMessage(data + "", globalScope.location.protocol + "//" + globalScope.location.host);
            };

            if (getObjectClass(process) === "process") {
                // Node.js
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    process.nextTick(createNextTickHandler(nextTickId));
                    return nextTickId;
                };
            } else if (Dispatch && Dispatch.now) {
                // IE old Edge
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    Dispatch.now(createNextTickHandler(nextTickId));
                    return nextTickId;
                };
            } else if (MessageChannel) {
                // Modern browsers
                channel = new MessageChannel();
                port1 = channel.port1;
                port2 = channel.port2;
                port2.onmessage = handleMessage;
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    port1.postMessage(nextTickId);
                    return nextTickId;
                };
            } else if (addEventListener && typeof postMessage === "function" && !globalScope.importScripts && !testError(postMessageToGlobal)) {
                // Web Workers
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    addEventListener("message", handleMessage, false);
                    postMessageToGlobal(nextTickId);
                    return nextTickId;
                };
            } else if ("onreadystatechange" in createElement("script")) {
                // Old IE/Opera
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    let script = createElement("script");
                    script.onreadystatechange = function () {
                        script.onreadystatechange = null;
                        getDocumentElement.removeChild(script);
                        executeNextTick(nextTickId);
                    };
                    getDocumentElement.appendChild(script);
                    return nextTickId;
                };
            } else {
                // Fallback (setTimeout)
                setImmediatePolyfill = function (callback) {
                    let args = [];
                    for (let i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                    nextTickCallbacks[++nextTickId] = function () {
                        (typeof callback === "function" ? callback : Function(callback)).apply(undefined, args);
                    };
                    setTimeout(createNextTickHandler(nextTickId), 0);
                    return nextTickId;
                };
            }

            clearImmediatePolyfill = function (id) {
                delete nextTickCallbacks[id];
            };
        }

        module.exports = {
            set: setImmediatePolyfill,
            clear: clearImmediatePolyfill
        };
    },
    // Module 118
    function (module, exports, requireModule) {
        // Microtask queue implementation (MutationObserver or process.nextTick)
        let globalScope = requireModule(5);
        let getOwnPropertyDescriptor = requireModule(22).f;
        let getObjectClass = requireModule(28);
        let setImmediate = requireModule(117).set;
        let userAgent = requireModule(89);

        let MutationObserver = globalScope.MutationObserver || globalScope.WebKitMutationObserver;
        let process = globalScope.process;
        let Promise = globalScope.Promise;
        let isNode = getObjectClass(process) === "process";

        let microtaskExecutionQueue;
        let currentMicrotask;
        let lastMicrotask;

        let microtaskHandler = function () {
            let domain;
            if (isNode) {
                domain = process.domain;
                if (domain) domain.exit();
            }
            while (currentMicrotask) {
                let task = currentMicrotask.fn;
                currentMicrotask = currentMicrotask.next;
                try {
                    task();
                } catch (e) {
                    throw (lastMicrotask = undefined, e);
                }
            }
            lastMicrotask = undefined;
            if (domain) domain.enter();
        };

        // Try to use native queueMicrotask if available
        let nativeQueueMicrotask = getOwnPropertyDescriptor(globalScope, "queueMicrotask");
        let microtaskRunner = nativeQueueMicrotask && nativeQueueMicrotask.value;

        if (!microtaskRunner) {
            // Fallback microtask implementation
            if (isNode) {
                microtaskRunner = function () {
                    process.nextTick(microtaskHandler);
                };
            } else if (MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test(userAgent)) {
                // MutationObserver for browsers
                let isToggle = true;
                let textNode = document.createTextNode("");
                new MutationObserver(microtaskHandler).observe(textNode, { characterData: true });
                microtaskRunner = function () {
                    textNode.data = (isToggle = !isToggle);
                };
            } else if (Promise && Promise.resolve) {
                // Promise.resolve for browsers
                let resolvedPromise = Promise.resolve(undefined);
                microtaskRunner = function () {
                    resolvedPromise.then(microtaskHandler);
                };
            } else {
                // Fallback to setImmediate (not a true microtask)
                microtaskRunner = function () {
                    setImmediate(microtaskHandler);
                };
            }
        }

        module.exports = microtaskRunner || function (task) {
            let newTask = { fn: task, next: undefined };
            if (lastMicrotask) {
                lastMicrotask.next = newTask;
            } else {
                currentMicrotask = newTask;
            }
            lastMicrotask = newTask;
            microtaskRunner();
        };
    },
    // Module 119
    function (module, exports, requireModule) {
        // Resolves a promise with a given value or promise
        let validateObject = requireModule(1);
        let isObject = requireModule(8);
        let getPromiseCapabilities = requireModule(55);

        module.exports = function (PromiseConstructor, value) {
            if (validateObject(PromiseConstructor), isObject(value) && value.constructor === PromiseConstructor) {
                return value;
            }
            let capabilities = getPromiseCapabilities.f(PromiseConstructor);
            capabilities.resolve(value);
            return capabilities.promise;
        };
    },
    // Module 120
    function (module, exports, requireModule) {
        // Console error logging utility
        let globalScope = requireModule(5);
        module.exports = function (message, value) {
            let console = globalScope.console;
            if (console && console.error) {
                if (arguments.length === 1) {
                    console.error(message);
                } else {
                    console.error(message, value);
                }
            }
        };
    },
    // Module 121
    function (module, exports, requireModule) {
        "use strict";
        // Set implementation (for polyfill)
        let collectionTemplate = requireModule(65);
        let collectionUtils = requireModule(114); // Utilities for Map/Set

        module.exports = collectionTemplate("Set", function (getConstructor) {
            return function () {
                return getConstructor(this, arguments.length > 0 ? arguments[0] : undefined);
            };
        }, collectionUtils, false);
    },
    // Module 122
    function (module, exports, requireModule) {
        // String.prototype.padStart and padEnd polyfills
        let toInteger = requireModule(24);
        let toLength = requireModule(10);
        let requireObjectCoercible = requireModule(17);
        let stringRepeat = requireModule(204); // String.prototype.repeat polyfill
        let mathCeil = Math.ceil;

        let createPadFunction = function (isEnd) {
            return function (string, maxLength, fillString) {
                let str = String(requireObjectCoercible(string));
                let len = toLength(maxLength);
                let currentLength = str.length;
                let padding = fillString === undefined ? " " : String(fillString);
                let paddingLength;

                if (len <= currentLength || padding === "") {
                    return str;
                }

                paddingLength = len - currentLength;
                // Repeat padding string until it's long enough
                padding = stringRepeat.call(padding, mathCeil(paddingLength / padding.length));
                // Truncate if too long
                if (padding.length > paddingLength) {
                    padding = padding.slice(0, paddingLength);
                }
                return isEnd ? str + padding : padding + str;
            };
        };

        module.exports = {
            start: createPadFunction(false),
            end: createPadFunction(true)
        };
    },
    // Module 123
    function (module, exports, requireModule) {
        // Check for String.prototype.padStart/padEnd bugs (Safari 10.x)
        let userAgent = requireModule(89);
        module.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent);
    },
    // Module 124
    function (module, exports, requireModule) {
        // Converts a value to a valid array-like length
        let toInteger = requireModule(24);
        let toLength = requireModule(10);

        module.exports = function (value) {
            if (value === undefined) {
                return 0;
            }
            let intValue = toInteger(value);
            let length = toLength(intValue);
            if (intValue !== length) {
                throw RangeError("Wrong length or index");
            }
            return length;
        };
    },
    // Module 125
    function (module, exports, requireModule) {
        // TypedArray.from implementation
        let toObject = requireModule(15);
        let toLength = requireModule(10);
        let getIteratorMethod = requireModule(52);
        let isArrayLike = requireModule(84);
        let getBoundFunction = requireModule(13);
        let validateTypedArrayConstructor = requireModule(33).aTypedArrayConstructor;

        module.exports = function (arrayLike) {
            let obj = toObject(arrayLike);
            let Constructor = validateTypedArrayConstructor(this);
            let argsLength = arguments.length;
            let mapFn = argsLength > 1 ? arguments[1] : undefined;
            let mapContext = argsLength > 2 ? arguments[2] : undefined;
            let newArray;
            let index = 0;
            let iterator;

            if (mapFn !== undefined) {
                mapFn = getBoundFunction(mapFn, mapContext, 2);
            }

            let iteratorMethod = getIteratorMethod(obj);
            if (iteratorMethod !== null && iteratorMethod !== undefined && !isArrayLike(iteratorMethod)) {
                iterator = iteratorMethod.call(obj);
                let iterationResult;
                let tempArray = [];
                while (!(iterationResult = iterator.next()).done) {
                    tempArray.push(iterationResult.value);
                }
                obj = tempArray;
            }

            let length = toLength(obj.length);
            newArray = new Constructor(length);
            for (; index < length; index++) {
                newArray[index] = mapFn ? mapFn(obj[index], index) : obj[index];
            }
            return newArray;
        };
    },
    // Module 126
    function (module, exports, requireModule) {
        // WeakMap/WeakSet collection utilities (getConstructor)
        let defineMultipleProperties = requireModule(36);
        let internalState = requireModule(66);
        let validateObject = requireModule(1);
        let isObject = requireModule(8);
        let validateInstance = requireModule(31);
        let iterateOver = requireModule(3);
        let hasProperty = requireModule(14);
        let setInternal = requireModule(18).set;
        let getInternal = requireModule(18).getterFor;
        let arrayFind = requireModule(48).find;
        let arrayFindIndex = requireModule(48).findIndex;

        // Fallback for frozen objects in WeakMap/WeakSet
        let EntryStore = function () {
            this.entries = [];
        };
        EntryStore.prototype = {
            get: function (key) {
                let entry = arrayFind(this.entries, function (entry) {
                    return entry[0] === key;
                });
                return entry ? entry[1] : undefined;
            },
            has: function (key) {
                return !!arrayFind(this.entries, function (entry) {
                    return entry[0] === key;
                });
            },
            set: function (key, value) {
                let entry = arrayFind(this.entries, function (entry) {
                    return entry[0] === key;
                });
                if (entry) {
                    entry[1] = value;
                } else {
                    this.entries.push([key, value]);
                }
            },
            delete: function (key) {
                let index = arrayFindIndex(this.entries, function (entry) {
                    return entry[0] === key;
                });
                if (~index) {
                    this.entries.splice(index, 1);
                }
                return !!~index;
            }
        };

        module.exports = {
            getConstructor: function (Constructor, typeName, isStrong, addOrSetMethod) {
                let WeakCollection = Constructor(function (instance, iterable) {
                    validateInstance(instance, WeakCollection, typeName);
                    setInternal(instance, { type: typeName, id: internalState.objectIdCounter++, frozen: undefined });
                    if (iterable !== null && iterable !== undefined) {
                        iterateOver(iterable, instance[addOrSetMethod], instance, isStrong);
                    }
                });

                let getCollectionState = getInternal(typeName);
                let getFrozenObjectStore = function (state) {
                    return state.frozen || (state.frozen = new EntryStore());
                };

                let setWeakEntry = function (collection, key, value) {
                    let state = getCollectionState(collection);
                    let weakData = internalState.getWeakData(validateObject(key), true);
                    if (weakData === true) {
                        getFrozenObjectStore(state).set(key, value);
                    } else {
                        weakData[state.id] = value;
                    }
                    return collection;
                };

                defineMultipleProperties(WeakCollection.prototype, {
                    delete: function (key) {
                        let state = getCollectionState(this);
                        if (!isObject(key)) {
                            return false;
                        }
                        let weakData = internalState.getWeakData(key);
                        if (weakData === true) {
                            return state.frozen === undefined ? false : state.frozen.delete(key);
                        }
                        return weakData && hasProperty(weakData, state.id) && delete weakData[state.id];
                    },
                    has: function (key) {
                        let state = getCollectionState(this);
                        if (!isObject(key)) {
                            return false;
                        }
                        let weakData = internalState.getWeakData(key);
                        if (weakData === true) {
                            return state.frozen === undefined ? false : state.frozen.has(key);
                        }
                        return weakData && hasProperty(weakData, state.id);
                    }
                });

                defineMultipleProperties(WeakCollection.prototype, isStrong ? {
                    get: function (key) {
                        let state = getCollectionState(this);
                        if (isObject(key)) {
                            let weakData = internalState.getWeakData(key);
                            if (weakData === true) {
                                return state.frozen === undefined ? undefined : state.frozen.get(key);
                            }
                            return weakData ? weakData[state.id] : undefined;
                        }
                    },
                    set: function (key, value) {
                        return setWeakEntry(this, key, value);
                    }
                } : {
                    add: function (value) {
                        return setWeakEntry(this, value, true);
                    }
                });
                return WeakCollection;
            }
        };
    },
    // Module 127
    function (module, exports, requireModule) {
        // Composite Key/Symbol generation for Reflect.metadata
        let MapConstructor = requireModule(88); // Map implementation
        let createObject = requireModule(30);
        let isObject = requireModule(8);

        // Internal cache structure for composite keys
        let CompositeKeyCache = function () {
            this.objectMap = null; // Stores maps for objects
            this.symbolMap = null; // Stores maps for symbols
            this.primitivesMap = null; // Stores maps for primitives
            this.objectByIndex = createObject(null); // Map for objects by argument index
        };

        CompositeKeyCache.prototype.get = function (keyType, createFn) {
            // Get or create the map for the given keyType
            return this[keyType + "Map"] || (this[keyType + "Map"] = createFn());
        };

        CompositeKeyCache.prototype.next = function (argIndex, argValue, isObjectKey) {
            let nextCache;
            if (isObjectKey) {
                // If it's an object, get from objectByIndex cache
                nextCache = this.objectByIndex[argIndex] || (this.objectByIndex[argIndex] = new MapConstructor());
            } else {
                // If it's a primitive, get from primitivesMap
                nextCache = this.primitivesMap || (this.primitivesMap = new MapConstructor());
            }

            let valueCache = nextCache.get(argValue);
            if (!valueCache) {
                nextCache.set(argValue, valueCache = new CompositeKeyCache());
            }
            return valueCache;
        };

        let rootCache = new CompositeKeyCache();

        module.exports = function () {
            let currentCache = rootCache;
            let arg;
            let argsLength = arguments.length;
            let i;

            // First pass for objects
            for (i = 0; i < argsLength; i++) {
                arg = arguments[i];
                if (isObject(arg)) {
                    currentCache = currentCache.next(i, arg, true);
                }
            }

            // Validate if a non-primitive component is present for Object composite keys
            if (this === Object && currentCache === rootCache) {
                throw TypeError("Composite keys must contain a non-primitive component");
            }

            // Second pass for primitives
            for (i = 0; i < argsLength; i++) {
                arg = arguments[i];
                if (!isObject(arg)) {
                    currentCache = currentCache.next(i, arg, false);
                }
            }
            return currentCache;
        };
    },
    // Module 128
    function (module, exports) {
        // Math.scale polyfill
        module.exports = Math.scale || function (value, inputMin, inputMax, outputMin, outputMax) {
            // Handle NaN and infinite values
            if (arguments.length === 0 || value !== value || inputMin !== inputMin || inputMax !== inputMax ||
                outputMin !== outputMin || outputMax !== outputMax) {
                return NaN;
            }
            if (value === Infinity || value === -Infinity) {
                return value;
            }
            // Linear scaling formula
            return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
        };
    },
    // Module 129
    function (module, exports, requireModule) {
        "use strict";
        // Collection.prototype.addAll polyfill
        let validateFunction = requireModule(4);
        let validateObject = requireModule(1);

        module.exports = function () {
            let collection = validateObject(this);
            let addMethod = validateFunction(collection.add);
            for (let i = 0; i < arguments.length; i++) {
                addMethod.call(collection, arguments[i]);
            }
            return collection;
        };
    },
    // Module 130
    function (module, exports, requireModule) {
        // URLSearchParams API polyfill and URL API integration
        "use strict";
        let exportHelper = requireModule(0);
        let globalScope = requireModule(5);
        let defineNamedProperty = requireModule(23);
        let defineMultipleProperties = requireModule(36);
        let setToStringTag = requireModule(26);
        let createIterator = requireModule(54);
        let internalState = requireModule(18);
        let validateInstance = requireModule(31);
        let hasProperty = requireModule(14);
        let getBoundFunction = requireModule(13);
        let validateObject = requireModule(1);
        let isObject = requireModule(8);
        let getIterator = requireModule(57);
        let getIteratorMethod = requireModule(52);
        let getWellKnownSymbol = requireModule(6)("iterator");

        let setInternal = internalState.set;
        let getInternal = internalState.getterFor("URLSearchParams");
        let getIteratorInternal = internalState.getterFor("URLSearchParamsIterator");

        let plusRegex = /\+/g;
        let decodeURIMap = Array(4); // Cache for decodeURIComponent regexes

        let getDecodeURIComponentRegex = function (count) {
            return decodeURIMap[count - 1] || (decodeURIMap[count - 1] = RegExp("((?:%[\\da-f]{2}){"+count+"})", "gi"));
        };

        // Custom decoder to handle malformed URI components
        let customDecodeURIComponent = function (encodedString) {
            try {
                return decodeURIComponent(encodedString);
            } catch (e) {
                return encodedString;
            }
        };

        // Robust decoder to handle various encoding issues
        let robustDecodeURIComponent = function (encodedString) {
            let decoded = encodedString.replace(plusRegex, " ");
            let retryCount = 4;
            try {
                return decodeURIComponent(decoded);
            } catch (e) {
                while (retryCount--) {
                    decoded = decoded.replace(getDecodeURIComponentRegex(retryCount), customDecodeURIComponent);
                }
                return decoded;
            }
        };

        let encodeURIMap = {
            "!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+"
        };
        let encodeURIReplaceRegex = /[!'()~]|%20/g;
        let encodeURIReplaceCallback = function (match) {
            return encodeURIMap[match];
        };

        // Custom URI encoder for URLSearchParams
        let customEncodeURIComponent = function (value) {
            return encodeURIComponent(value).replace(encodeURIReplaceRegex, encodeURIReplaceCallback);
        };

        // Populate URLSearchParams entries from a string
        let populateEntriesFromString = function (entriesArray, queryString) {
            if (queryString) {
                let pairs = queryString.split("&");
                for (let i = 0; i < pairs.length; i++) {
                    let pair = pairs[i];
                    if (pair.length) {
                        let parts = pair.split("=");
                        entriesArray.push({
                            key: robustDecodeURIComponent(parts.shift()),
                            value: robustDecodeURIComponent(parts.join("="))
                        });
                    }
                }
            }
        };

        // Update internal search params from a query string
        let updateSearchParamsFromQuery = function (internalState, queryString) {
            internalState.entries.length = 0;
            populateEntriesFromString(internalState.entries, queryString);
        };

        // URLSearchParams Iterator
        let URLSearchParamsIterator = createIterator(function (iteratorInstance, kind) {
            setInternal(iteratorInstance, {
                type: "URLSearchParamsIterator",
                iterator: getIterator(getInternal(iteratorInstance.params).entries),
                kind: kind
            });
        }, "Iterator", function () {
            let iteratorState = getIteratorInternal(this);
            let kind = iteratorState.kind;
            let nextEntry = iteratorState.iterator.next();
            let entryValue = nextEntry.value;

            if (!nextEntry.done) {
                if (kind === "keys") {
                    nextEntry.value = entryValue.key;
                } else if (kind === "values") {
                    nextEntry.value = entryValue.value;
                } else { // "entries"
                    nextEntry.value = [entryValue.key, entryValue.value];
                }
            }
            return nextEntry;
        });

        // Ensure minimum arguments for a method
        let ensureMinArguments = function (count, expected) {
            if (count < expected) {
                throw TypeError("Not enough arguments");
            }
        };

        // URLSearchParams constructor
        let URLSearchParamsConstructor = function URLSearchParams(init) {
            validateInstance(this, URLSearchParamsConstructor, "URLSearchParams");
            let internalData = setInternal(this, {
                type: "URLSearchParams",
                entries: [],
                updateURL: function () {
                }, // Placeholder, will be set by URL constructor
                updateSearchParams: updateSearchParamsFromQuery
            });

            if (init !== undefined && init !== null) {
                if (isObject(init)) {
                    let iteratorMethod = getIteratorMethod(init);
                    if (typeof iteratorMethod === "function") {
                        // If iterable
                        let initIterator = iteratorMethod.call(init);
                        let nextItem;
                        while (!(nextItem = initIterator.next()).done) {
                            let pair = validateObject(nextItem.value);
                            let pairIterator = getIterator(pair);
                            let keyPart = pairIterator.next();
                            let valuePart = pairIterator.next();
                            if (keyPart.done || valuePart.done || !pairIterator.next().done) {
                                throw TypeError("Expected sequence with length 2");
                            }
                            internalData.entries.push({ key: String(keyPart.value), value: String(valuePart.value) });
                        }
                    } else {
                        // If object
                        for (let key in init) {
                            if (hasProperty(init, key)) {
                                internalData.entries.push({ key: key, value: String(init[key]) });
                            }
                        }
                    }
                } else {
                    // If string
                    populateEntriesFromString(internalData.entries, typeof init === "string" ? (init.charAt(0) === "?" ? init.slice(1) : init) : String(init));
                }
            }
        };

        let URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

        defineMultipleProperties(URLSearchParamsPrototype, {
            append: function (name, value) {
                ensureMinArguments(arguments.length, 2);
                let internalData = getInternal(this);
                internalData.entries.push({ key: String(name), value: String(value) });
                internalData.updateURL();
            },
            delete: function (name) {
                ensureMinArguments(arguments.length, 1);
                let internalData = getInternal(this);
                let entries = internalData.entries;
                let keyToDelete = String(name);
                for (let i = 0; i < entries.length;) {
                    if (entries[i].key === keyToDelete) {
                        entries.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                internalData.updateURL();
            },
            get: function (name) {
                ensureMinArguments(arguments.length, 1);
                let entries = getInternal(this).entries;
                let keyToFind = String(name);
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === keyToFind) {
                        return entries[i].value;
                    }
                }
                return null;
            },
            getAll: function (name) {
                ensureMinArguments(arguments.length, 1);
                let entries = getInternal(this).entries;
                let keyToFind = String(name);
                let results = [];
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === keyToFind) {
                        results.push(entries[i].value);
                    }
                }
                return results;
            },
            has: function (name) {
                ensureMinArguments(arguments.length, 1);
                let entries = getInternal(this).entries;
                let keyToFind = String(name);
                for (let i = 0; i < entries.length; i++) {
                    if (entries[i].key === keyToFind) {
                        return true;
                    }
                }
                return false;
            },
            set: function (name, value) {
                ensureMinArguments(arguments.length, 1);
                let internalData = getInternal(this);
                let entries = internalData.entries;
                let keyToSet = String(name);
                let valueToSet = String(value);
                let replaced = false;

                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i];
                    if (entry.key === keyToSet) {
                        if (replaced) {
                            entries.splice(i--, 1);
                        } else {
                            entry.value = valueToSet;
                            replaced = true;
                        }
                    }
                }
                if (!replaced) {
                    entries.push({ key: keyToSet, value: valueToSet });
                }
                internalData.updateURL();
            },
            sort: function () {
                let internalData = getInternal(this);
                let entries = internalData.entries;
                let sortedCopy = entries.slice(); // Create a shallow copy

                // Clear original entries and re-insert in sorted order
                entries.length = 0;
                for (let i = 0; i < sortedCopy.length; i++) {
                    let currentEntry = sortedCopy[i];
                    let inserted = false;
                    for (let j = 0; j < entries.length; j++) {
                        if (entries[j].key > currentEntry.key) {
                            entries.splice(j, 0, currentEntry);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted) {
                        entries.push(currentEntry);
                    }
                }
                internalData.updateURL();
            },
            forEach: function (callback) {
                let entries = getInternal(this).entries;
                let boundCallback = getBoundFunction(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
                for (let i = 0; i < entries.length; i++) {
                    let entry = entries[i];
                    boundCallback(entry.value, entry.key, this);
                }
            },
            keys: function () {
                return new URLSearchParamsIterator(this, "keys");
            },
            values: function () {
                return new URLSearchParamsIterator(this, "values");
            },
            entries: function () {
                return new URLSearchParamsIterator(this, "entries");
            }
        });

        // Set @@iterator to point to entries
        defineNamedProperty(URLSearchParamsPrototype, getWellKnownSymbol, URLSearchParamsPrototype.entries, { enumerable: true });
        // Set toString method
        defineNamedProperty(URLSearchParamsPrototype, "toString", function () {
            let entries = getInternal(this).entries;
            let encodedPairs = [];
            for (let i = 0; i < entries.length; i++) {
                let entry = entries[i];
                encodedPairs.push(customEncodeURIComponent(entry.key) + "=" + customEncodeURIComponent(entry.value));
            }
            return encodedPairs.join("&");
        }, { enumerable: true });

        setToStringTag(URLSearchParamsConstructor, "URLSearchParams");

        let isURLSearchParamsBuggy = requireModule(131); // Check for URLSearchParams bugs
        exportHelper({ global: true, forced: !isURLSearchParamsBuggy }, { URLSearchParams: URLSearchParamsConstructor });

        module.exports = {
            URLSearchParams: URLSearchParamsConstructor,
            getState: getInternal
        };
    },
    // Module 131
    function (module, exports, requireModule) {
        // Check for URLSearchParams bugs
        let testError = requireModule(7);
        let getWellKnownSymbol = requireModule(6)("iterator");

        module.exports = testError(function () {
            let url = new URL("b?e=1", "http://a");
            let params = url.searchParams;

            // Test pathname mutation
            url.pathname = "c%20d";
            // Test toJSON and sort
            return !url.toJSON || !params.sort ||
                url.href !== "http://a/c%20d?e=1" ||
                params.get("e") !== "1" ||
                String(new URLSearchParams("?a=1")) !== "a=1" ||
                !params[getWellKnownSymbol] ||
                new URL("https://a@b").username !== "a" ||
                new URLSearchParams(new URLSearchParams("a=b")).get("a") !== "b" ||
                new URL("http://тест").host !== "xn--e1aybc" ||
                new URL("http://a#б").hash !== "#%D0%B1";
        });
    },
    // Module 132
    function (module, exports, requireModule) {
        // Node.js 'fs' module
        module.exports = require("fs");
    },
    // Module 133 (Entry Module)
    function (module, exports, requireModule) {
        "use strict";
        // Apply all polyfills and then execute the main application logic
        requireModule.registerESModule(exports);

        // Import all required polyfills/modules
        requireModule(134); // Symbol polyfill part 1
        requireModule(136); // Symbol polyfill part 2
        requireModule(137); // Symbol.asyncIterator
        requireModule(138); // Symbol.hasInstance
        requireModule(139); // Symbol.isConcatSpreadable
        requireModule(140); // Symbol.match
        requireModule(141); // Symbol.replace
        requireModule(142); // Symbol.search
        requireModule(143); // Symbol.species
        requireModule(144); // Symbol.split
        requireModule(145); // Symbol.toPrimitive
        requireModule(146); // Symbol.toStringTag
        requireModule(147); // Array.prototype.concat
        requireModule(148); // Array.prototype.filter
        requireModule(149); // Array.prototype.flat
        requireModule(150); // Array.prototype.flatMap
        requireModule(151); // Array.from
        requireModule(152); // Array.prototype.includes
        requireModule(153); // Array.prototype.indexOf
        requireModule(86);  // Array.prototype.entries, keys, values iterators
        requireModule(154); // Array.prototype.lastIndexOf
        requireModule(156); // Array.prototype.map
        requireModule(157); // Array.prototype.slice
        requireModule(158); // Array.prototype.sort
        requireModule(159); // Array species
        requireModule(160); // Array.prototype.splice
        requireModule(161); // Array.prototype.flat (unscopables)
        requireModule(162); // Array.prototype.flatMap (unscopables)
        requireModule(163); // Date.prototype[Symbol.toPrimitive]
        requireModule(165); // Function.prototype[Symbol.hasInstance]
        requireModule(166); // JSON global
        requireModule(88);  // Map
        requireModule(167); // Math.acosh
        requireModule(169); // Math global
        requireModule(170); // Object.assign
        requireModule(171); // Object.prototype.__defineGetter__
        requireModule(172); // Object.prototype.__defineSetter__
        requireModule(173); // Object.entries
        requireModule(174); // Object.fromEntries
        requireModule(175); // Object.getOwnPropertyDescriptors
        requireModule(176); // Object.prototype.__lookupGetter__
        requireModule(177); // Object.prototype.__lookupSetter__
        requireModule(178); // Object.prototype.toString
        requireModule(180); // Object.values
        requireModule(181); // Promise
        requireModule(182); // Promise.prototype.finally
        requireModule(183); // Reflect.apply
        requireModule(184); // Reflect.construct
        requireModule(186); // Reflect.defineProperty
        requireModule(187); // Reflect.deleteProperty
        requireModule(188); // Reflect.get
        requireModule(189); // Reflect.getOwnPropertyDescriptor
        requireModule(190); // Reflect.getPrototypeOf
        requireModule(191); // Reflect.has
        requireModule(192); // Reflect.isExtensible
        requireModule(193); // Reflect.ownKeys
        requireModule(194); // Reflect.preventExtensions
        requireModule(195); // Reflect.set
        requireModule(196); // Reflect.setPrototypeOf
        requireModule(197); // RegExp
        requireModule(198); // RegExp.prototype.flags
        requireModule(199); // RegExp.prototype.toString
        requireModule(121); // Set
        requireModule(200); // String.prototype.endsWith
        requireModule(201); // String.prototype.includes
        requireModule(202); // String.prototype.match
        requireModule(203); // String.prototype.padEnd
        requireModule(205); // String.prototype.padStart
        requireModule(206); // String.prototype.replace
        requireModule(207); // String.prototype.search
        requireModule(209); // String.prototype.split
        requireModule(210); // String.prototype.startsWith
        requireModule(211); // String.prototype.trim
        requireModule(212); // String.prototype.trimEnd
        requireModule(213); // String.prototype.trimStart
        requireModule(214); // Float32Array
        requireModule(218); // Float64Array
        requireModule(219); // Int8Array
        requireModule(220); // Int16Array
        requireModule(221); // Int32Array
        requireModule(222); // Uint8Array
        requireModule(223); // Uint8ClampedArray
        requireModule(224); // Uint16Array
        requireModule(225); // Uint32Array
        requireModule(226); // TypedArray.from
        requireModule(227); // TypedArray.prototype.includes
        requireModule(228); // TypedArray iterators
        requireModule(229); // TypedArray.of
        requireModule(230); // TypedArray.prototype.toString
        requireModule(96);  // WeakMap
        requireModule(231); // WeakSet
        requireModule(232); // AggregateError
        requireModule(233); // Array.prototype.lastIndex
        requireModule(234); // Array.prototype.lastItem
        requireModule(235); // compositeKey
        requireModule(236); // compositeSymbol
        requireModule(237); // globalThis
        requireModule(238); // Map.prototype.deleteAll
        requireModule(239); // Map.prototype.every
        requireModule(240); // Map.prototype.filter
        requireModule(241); // Map.prototype.find
        requireModule(242); // Map.prototype.findKey
        requireModule(243); // Map.from
        requireModule(244); // Map.groupBy
        requireModule(245); // Map.prototype.includes
        requireModule(247); // Map.keyBy
        requireModule(248); // Map.prototype.keyOf
        requireModule(249); // Map.prototype.mapKeys
        requireModule(250); // Map.prototype.mapValues
        requireModule(251); // Map.prototype.merge
        requireModule(252); // Map.of
        requireModule(253); // Map.prototype.reduce
        requireModule(254); // Map.prototype.some
        requireModule(255); // Map.prototype.update
        requireModule(256); // Math.clamp
        requireModule(257); // Math.DEG_PER_RAD
        requireModule(258); // Math.degrees
        requireModule(259); // Math.fscale
        requireModule(262); // Math.iaddh
        requireModule(263); // Math.imulh
        requireModule(264); // Math.isubh
        requireModule(265); // Math.RAD_PER_DEG
        requireModule(266); // Math.radians
        requireModule(267); // Math.scale
        requireModule(268); // Math.seededPRNG
        requireModule(270); // Math.signbit
        requireModule(271); // Math.umulh
        requireModule(272); // Number.fromString
        requireModule(274); // Observable
        requireModule(275); // Promise.allSettled
        requireModule(276); // Promise.any
        requireModule(277); // Promise.try
        requireModule(278); // Reflect.defineMetadata
        requireModule(279); // Reflect.deleteMetadata
        requireModule(280); // Reflect.getMetadata
        requireModule(281); // Reflect.getMetadataKeys
        requireModule(282); // Reflect.getOwnMetadata
        requireModule(283); // Reflect.getOwnMetadataKeys
        requireModule(284); // Reflect.hasMetadata
        requireModule(285); // Reflect.hasOwnMetadata
        requireModule(286); // Reflect.metadata
        requireModule(287); // Set.prototype.addAll
        requireModule(288); // Set.prototype.deleteAll
        requireModule(289); // Set.prototype.difference
        requireModule(290); // Set.prototype.every
        requireModule(291); // Set.prototype.filter
        requireModule(292); // Set.prototype.find
        requireModule(293); // Set.from
        requireModule(294); // Set.prototype.intersection
        requireModule(295); // Set.prototype.isDisjointFrom
        requireModule(296); // Set.prototype.isSubsetOf
        requireModule(297); // Set.prototype.isSupersetOf
        requireModule(298); // Set.prototype.join
        requireModule(299); // Set.prototype.map
        requireModule(300); // Set.of
        requireModule(301); // Set.prototype.reduce
        requireModule(302); // Set.prototype.some
        requireModule(303); // Set.prototype.symmetricDifference
        requireModule(304); // Set.prototype.union
        requireModule(305); // String.prototype.at
        requireModule(306); // String.prototype.codePoints
        requireModule(307); // String.prototype.replaceAll
        requireModule(308); // Symbol.dispose
        requireModule(309); // Symbol.observable
        requireModule(310); // Symbol.patternMatch
        requireModule(311); // WeakMap.prototype.deleteAll
        requireModule(312); // WeakMap.from
        requireModule(313); // WeakMap.of
        requireModule(314); // WeakSet.prototype.addAll
        requireModule(315); // WeakSet.prototype.deleteAll
        requireModule(316); // WeakSet.from
        requireModule(317); // WeakSet.of
        requireModule(318); // queueMicrotask
        requireModule(319); // URL and URLSearchParams
        requireModule(322); // String.prototype[Symbol.matchAll]
        requireModule(323); // URL.prototype.toJSON

        // Actual application logic (from the original module 133)
        const fileSystemModule = requireModule(132); // Import the 'fs' module
        let rawInputData;
        let lineOfNumbers;
        let processedNumbers;
        let uniqueNumbersCollection;

        try {
            // Read input from /dev/stdin
            rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

            // Basic validation for input data
            if (!rawInputData || rawInputData.trim().length === 0) {
                console.log("NO"); // Treat empty input as no unique numbers
                return;
            }

            // Split the input by newline, get the second line, and then split by space
            const inputLines = rawInputData.split("\n");
            if (inputLines.length < 2) {
                console.log("NO"); // Not enough lines
                return;
            }

            lineOfNumbers = inputLines[1].split(" ");

            // Convert array of strings to array of numbers (or keep as strings if comparison is string-based)
            // The original code compares toString() of arrays, so keeping as strings is equivalent.
            processedNumbers = lineOfNumbers;

            // Create a collection of unique numbers using Set
            uniqueNumbersCollection = new Set(processedNumbers);
            const uniqueNumbersArray = Array.from(uniqueNumbersCollection);

            // Compare the string representation of the original array and the unique array
            if (processedNumbers.toString() === uniqueNumbersArray.toString()) {
                console.log("YES");
            } else {
                console.log("NO");
            }
        } catch (error) {
            // Log any errors that occur during file reading or processing
            console.error("An error occurred during processing:", error.message);
            console.log("NO"); // Output NO on error
        }
    }
]);