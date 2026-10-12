/* This is a self-executing anonymous function, typical for JavaScript module bundling. */
!function( allProgramUnits ) {

    // A cache for already loaded program units (modules).
    var unitCacheStore = {};

    /*
     * The core unit loader function, analogous to 'require' in CommonJS.
     * It handles fetching, caching, and execution of individual code units.
     */
    function obtainCodeUnit( unitIdKey ) {
        // If the code unit is already present in the cache, return its exported values.
        if ( unitCacheStore[unitIdKey] ) {
            return unitCacheStore[unitIdKey].unitPayload;
        }

        /*
         * Create a fresh code unit object and register it within the cache.
         * internalId: The unique identifier for this code unit.
         * loadComplete: A boolean flag indicating if this unit has finished processing.
         * unitPayload: The object that will hold all exports from this unit.
         */
        var currentUnitInstance = unitCacheStore[unitIdKey] = {
            internalId: unitIdKey,
            loadComplete: false,
            unitPayload: {}
        };

        // Execute the code unit's function, passing its own module object, exports, and the loader itself.
        allProgramUnits[unitIdKey].call( currentUnitInstance.unitPayload, currentUnitInstance, currentUnitInstance.unitPayload, obtainCodeUnit );

        // Mark this code unit as fully loaded.
        currentUnitInstance.loadComplete = true;

        // Return the collected exports from this code unit.
        return currentUnitInstance.unitPayload;
    }

    // Attach the entire collection of program units to the loader for internal access.
    obtainCodeUnit.allUnitDefinitions = allProgramUnits;

    // Attach the unit cache store to the loader.
    obtainCodeUnit.unitCacheRegister = unitCacheStore;

    /*
     * Helper method to define an export property on a target object.
     * This ensures the property is enumerable if not already present.
     */
    obtainCodeUnit.registerExportProperty = function( targetObject, propertyIdentifier, valueGetterFunction ) {
        if ( !obtainCodeUnit.checkOwnProperty( targetObject, propertyIdentifier ) ) {
            Object.defineProperty( targetObject, propertyIdentifier, {
                enumerable: true,
                get: valueGetterFunction
            } );
        }
    };

    /*
     * Modifies a module object to adhere to ES Module conventions,
     * typically by setting the `Symbol.toStringTag` and `__esModule` properties.
     */
    obtainCodeUnit.flagAsESModule = function( moduleObject ) {
        if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
            Object.defineProperty( moduleObject, Symbol.toStringTag, {
                value: "Module"
            } );
        }
        Object.defineProperty( moduleObject, "__esModule", {
            value: true
        } );
    };

    /*
     * Creates a synthetic namespace object for ES module interoperability.
     * It handles different loading scenarios and export modes.
     */
    obtainCodeUnit.synthesizeNamespace = function( sourceModule, behaviorFlags ) {
        // If the 'behaviorFlags' indicate this is already a loaded unit, load it directly.
        if ( 0x1 & behaviorFlags ) {
            sourceModule = obtainCodeUnit( sourceModule );
        }

        // If 'behaviorFlags' indicate it's already a complete namespace object, return it.
        if ( 0x8 & behaviorFlags ) {
            return sourceModule;
        }

        // If 'behaviorFlags' indicate it's a plain object with the ESModule flag, return it.
        if ( 0x4 & behaviorFlags && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule ) {
            return sourceModule;
        }

        // Initialize a new empty object to serve as the namespace.
        var newNamespaceObject = Object.create( null );

        // Flag the newly created object as an ES Module.
        obtainCodeUnit.flagAsESModule( newNamespaceObject );

        // Define the 'default' export property, pointing to the original source module.
        Object.defineProperty( newNamespaceObject, "default", {
            enumerable: true,
            value: sourceModule
        } );

        /*
         * If 'behaviorFlags' indicate copying all properties and the source isn't a string,
         * iterate and define getters for all properties from the source module.
         */
        if ( 0x2 & behaviorFlags && typeof sourceModule !== "string" ) {
            for ( var propertyName in sourceModule ) {
                obtainCodeUnit.registerExportProperty( newNamespaceObject, propertyName, ( function( keyToBind ) {
                    return function() {
                        return sourceModule[keyToBind];
                    };
                } ).bind( null, propertyName ) );
            }
        }
        return newNamespaceObject;
    };

    /*
     * Provides a compatibility getter for a module's default export.
     * This handles both native ES modules and CommonJS-like modules.
     */
    obtainCodeUnit.getCompatibleExport = function( moduleObject ) {
        var exportAccessorFunction = moduleObject && moduleObject.__esModule ?
            function() {
                return moduleObject["default"];
            } :
            function() {
                return moduleObject;
            };
        // Define an 'a' property on the accessor function itself, returning the function.
        obtainCodeUnit.registerExportProperty( exportAccessorFunction, "a", exportAccessorFunction );
        return exportAccessorFunction;
    };

    /*
     * Checks if a target object possesses a specific property directly on itself,
     * utilizing `Object.prototype.hasOwnProperty.call` for robustness.
     */
    obtainCodeUnit.checkOwnProperty = function( targetObject, propertyKey ) {
        return Object.prototype.hasOwnProperty.call( targetObject, propertyKey );
    };

    // Sets the public path for asset loading (an empty string in this configuration).
    obtainCodeUnit.publicAssetPath = "";

    // Load the designated entry point program unit (module 133, represented here as 0x85).
    obtainCodeUnit( obtainCodeUnit.startingUnit = 0x85 );

}( [
    /* Program Unit 0: Core module definition utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var appGlobal = unitLoader( 0x5 ); /* Retrieve the global object (e.g., window or global) */
        var propertyDescriptorAccessor = unitLoader( 0x16 ).f; /* Access the function to get property descriptors */
        var writeProperty = unitLoader( 0x10 ); /* Utility to define a non-enumerable property */
        var defineTargetMethod = unitLoader( 0x17 ); /* Utility to define methods on target objects */
        var setupGlobalValue = unitLoader( 0x4F ); /* Utility to assign values to the global scope */
        var integrateProperties = unitLoader( 0x64 ); /* Utility to merge properties from one object to another */
        var checkFeatureForce = unitLoader( 0x3E ); /* Utility to determine if a feature polyfill should be forced */

        currentModule.unitPayload = function( configuration, implementMethods ) {
            var actualTarget, methodKeyName, existingMethodImpl, newMethodImpl, descriptorContainer;
            var targetAPI = configuration.target;
            var isGlobalScope = configuration.global;
            var isStaticProperty = configuration.stat;

            // Determine the object where methods should be defined.
            if ( actualTarget = isGlobalScope ?
                    appGlobal :
                    isStaticProperty ?
                    appGlobal[targetAPI] || setupGlobalValue( targetAPI, {} ) :
                    ( appGlobal[targetAPI] || {} ).prototype
            ) {
                // Iterate through each method to be implemented.
                for ( methodKeyName in implementMethods ) {
                    newMethodImpl = implementMethods[methodKeyName];

                    // Retrieve the existing method implementation or its value from its descriptor.
                    existingMethodImpl = configuration.noTargetGet ?
                        ( ( descriptorContainer = propertyDescriptorAccessor( actualTarget, methodKeyName ) ) && descriptorContainer.value ) :
                        actualTarget[methodKeyName];

                    /*
                     * Check if the feature is explicitly forced or if the existing method is present
                     * and of the same type as the new implementation. If so, skip modification.
                     */
                    if ( !checkFeatureForce(
                            isGlobalScope ? methodKeyName : targetAPI + ( isStaticProperty ? ". " : "# " ) + methodKeyName,
                            configuration.forced
                        ) && void 0x0 !== existingMethodImpl
                    ) {
                        if ( typeof newMethodImpl == typeof existingMethodImpl ) {
                            continue; // Skip if types match and no forcing.
                        }
                        // If types differ, integrate existing method's properties into the new one.
                        integrateProperties( newMethodImpl, existingMethodImpl );
                    }

                    // If 'sham' flag is set or inherited, apply it to the new method.
                    if ( ( configuration.sham || ( existingMethodImpl && existingMethodImpl.sham ) ) && writeProperty( newMethodImpl, "sham", !0x0 ) ) {
                        // This condition ensures the writeProperty call happens.
                    }

                    // Finally, define the method on the target object.
                    defineTargetMethod( actualTarget, methodKeyName, newMethodImpl, configuration );
                }
            }
        };
    },

    /* Program Unit 1: Object validation utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        // Exports a function that ensures a given value is a non-null object.
        currentModule.unitPayload = function( inputVal ) {
            if ( !unitLoader( 0x8 )( inputVal ) ) { /* Check if the input is NOT an object */
                throw TypeError( String( inputVal ) + " is not an object" );
            }
            return inputVal;
        };
    },

    /* Program Unit 2: Environment purity flag */
    function( currentModule, moduleOutputs ) {
        // Exports a boolean indicating if the current environment is considered "pure" (e.g., polyfills don't pollute globals).
        currentModule.unitPayload = !0x1;
    },

    /* Program Unit 3: Iteration utility for various collections */
    function( currentModule, moduleOutputs, unitLoader ) {
        var validateInputObject = unitLoader( 0x1 ); /* Load utility to assert a value is an object */
        var retrieveIteratorMethod = unitLoader( 0x34 ); /* Load utility to get an object's iterator method */
        var bindTargetFunction = unitLoader( 0xD ); /* Load utility to bind a function to a context */
        var isArrayLikeIterator = unitLoader( 0x52 ); /* Load utility to check if an iterator is array-like */
        var getCollectionLength = unitLoader( 0xA ); /* Load utility to get the length of a collection */
        var signalIterationStop = unitLoader( 0x6C ); /* Load utility to signal early iteration termination */

        // Internal class representing the outcome of an iteration, allowing early termination.
        var IterationResult = function( stoppedState, finalResult ) {
            this.stopped = stoppedState;
            this.result = finalResult;
        };

        // Exported function to iterate over collections, supporting various types and early stopping.
        ( currentModule.unitPayload = function( collectionData, iterationCallback, contextObject, processAsPairs, earlyBreak ) {
            var currentDataElement, iteratorMethodRef, activeIterator, currentEntry, processingOutcome, elementIndex = 0;
            var boundIterationCallback = bindTargetFunction( iterationCallback, contextObject, processAsPairs ? 0x2 : 0x1 ); // Bind callback with correct argument count.

            // If 'earlyBreak' is true, assume collectionData is already an iterator.
            if ( earlyBreak ) {
                currentDataElement = collectionData;
            } else {
                // Obtain the iterator method from the collection.
                if ( typeof ( iteratorMethodRef = retrieveIteratorMethod( collectionData ) ) !== "function" ) {
                    throw TypeError( "Target is not iterable" );
                }
                // If the iterator method indicates an array-like structure, iterate by index.
                if ( isArrayLikeIterator( iteratorMethodRef ) ) {
                    for ( elementIndex = 0; elementIndex < getCollectionLength( collectionData.length ); elementIndex++ ) {
                        if ( ( processingOutcome = processAsPairs ? boundIterationCallback( validateInputObject( collectionData[elementIndex] )[0], collectionData[elementIndex][0x1] ) : boundIterationCallback( collectionData[elementIndex] ) ) && processingOutcome instanceof IterationResult ) {
                            return processingOutcome;
                        }
                    }
                    return new IterationResult( !0x1 ); // Not stopped.
                }
                currentDataElement = iteratorMethodRef.call( collectionData ); // Get the actual iterator instance.
            }

            // Iterate through the collection using the obtained iterator.
            for ( ; !( currentEntry = currentDataElement.next() ).done; ) {
                if ( ( processingOutcome = signalIterationStop( currentDataElement, boundIterationCallback, currentEntry.value, processAsPairs ) ) && processingOutcome instanceof IterationResult ) {
                    return processingOutcome;
                }
            }
            return new IterationResult( !0x1 ); // Not stopped.
        } ).stop = function( resultValue ) {
            return new IterationResult( !0x0, resultValue ); // Stopped with a result.
        };
    },

    /* Program Unit 4: Function validation utility */
    function( currentModule, moduleOutputs ) {
        // Exports a function that asserts a given value is indeed a function.
        currentModule.unitPayload = function( valueToValidate ) {
            if ( typeof valueToValidate !== "function" ) {
                throw TypeError( String( valueToValidate ) + " is not a function" );
            }
            return valueToValidate;
        };
    },

    /* Program Unit 5: Global object retriever */
    function( currentModule, moduleOutputs ) {
        // Defines the string literal for 'object' type.
        var objectTypeName = "object";

        // Helper function to check if a context looks like a global object.
        var inspectGlobalContext = function( candidateContext ) {
            return candidateContext && candidateContext.Math === Math && candidateContext;
        };

        // Exports the global object, trying various common global contexts.
        currentModule.unitPayload = inspectGlobalContext( typeof globalThis == objectTypeName && globalThis ) ||
            inspectGlobalContext( typeof window == objectTypeName && window ) ||
            inspectGlobalContext( typeof self == objectTypeName && self ) ||
            inspectGlobalContext( typeof global == objectTypeName && global ) ||
            Function( "return this" )(); // Fallback for strict environments.
    },

    /* Program Unit 6: Well-known Symbol retriever */
    function( currentModule, moduleOutputs, unitLoader ) {
        var applicationGlobal = unitLoader( 0x5 ); /* Load the global object */
        var sharedSymbolRepository = unitLoader( 0x26 ); /* Load the shared symbol registry */
        var assignProperty = unitLoader( 0x10 ); /* Load utility to assign properties */
        var symbolPolyfillAvailable = unitLoader( 0x67 ); /* Check if Symbol polyfill is active */
        var nativeSymbolConstructor = applicationGlobal.Symbol; /* Get the native Symbol constructor */
        var wellknownSymbolCache = sharedSymbolRepository( "wks" ); /* Access the cache for well-known symbols */

        // Exports a function to retrieve or create a well-known Symbol.
        currentModule.unitPayload = function( symbolKeyName ) {
            return wellknownSymbolCache[symbolKeyName] ||
                ( wellknownSymbolCache[symbolKeyName] = symbolPolyfillAvailable && nativeSymbolConstructor[symbolKeyName] || ( symbolPolyfillAvailable ? nativeSymbolConstructor : assignProperty )( "Symbol." + symbolKeyName ) );
        };
    },

    /* Program Unit 7: Exception testing utility */
    function( currentModule, moduleOutputs ) {
        // Exports a function that executes an operation and returns true if it throws an error, false otherwise.
        currentModule.unitPayload = function( operationFunction ) {
            try {
                return !!operationFunction();
            } catch ( caughtError ) {
                return !0x0;
            }
        };
    },

    /* Program Unit 8: Object type checker */
    function( currentModule, moduleOutputs ) {
        // Exports a function to determine if a value is a non-null object or a function.
        currentModule.unitPayload = function( valueToCheck ) {
            return typeof valueToCheck === "object" ? valueToCheck !== void 0x0 : typeof valueToCheck === "function";
        };
    },

    /* Program Unit 9: Object.defineProperty support detection */
    function( currentModule, moduleOutputs, unitLoader ) {
        // Exports a boolean indicating the reliable support for `Object.defineProperty`.
        var testForError = unitLoader( 0x7 ); /* Load error testing utility */
        currentModule.unitPayload = !testForError( function() {
            return 0x7 != Object.defineProperty( {}, "a", {
                get: function() {
                    return 0x7;
                }
            } ).a;
        } );
    },

    /* Program Unit 10: Length normalization utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertToInteger = unitLoader( 0x18 ); /* Load integer conversion utility */
        var mathMinimum = Math.min;

        // Exports a function that converts a value into a valid, non-negative integer length.
        currentModule.unitPayload = function( inputValue ) {
            return inputValue > 0x0 ? mathMinimum( convertToInteger( inputValue ), 0x1FFFFFFFFFFFFF ) : 0x0; /* Maximum safe integer */
        };
    },

    /* Program Unit 11: Property definition utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var hasPropertyDefineSupport = unitLoader( 0x9 ); /* Check for robust defineProperty support */
        var getBuggyDefinePropertyStatus = unitLoader( 0x61 ); /* Check for IE defineProperty bug */
        var assertInputObject = unitLoader( 0x1 ); /* Validate input is an object */
        var transformToPrimitive = unitLoader( 0x1D ); /* Convert property key to primitive */
        var makePropertyAttributes = unitLoader( 0x23 ); /* Create property descriptor object */

        // Exports a function for defining properties, with a fallback for older environments.
        moduleOutputs.f = hasPropertyDefineSupport ?
            Object.defineProperty :
            function( targetObject, propertyKey, propertyAttributes ) {
                assertInputObject( targetObject );
                propertyKey = transformToPrimitive( propertyKey, !0x0 ); // Prefer string conversion for keys.
                assertInputObject( propertyAttributes );

                if ( getBuggyDefinePropertyStatus ) { // If the IE defineProperty bug is present.
                    try {
                        return Object.defineProperty( targetObject, propertyKey, propertyAttributes );
                    } catch ( err ) {
                        // Fallback logic in case of error.
                    }
                }

                // If accessors (get/set) are involved, and defineProperty is not supported.
                if ( "get" in propertyAttributes || "set" in propertyAttributes ) {
                    throw TypeError( "Accessors are not supported in this environment" );
                }
                // If a 'value' is provided, assign it directly.
                if ( "value" in propertyAttributes ) {
                    targetObject[propertyKey] = propertyAttributes.value;
                }
                return targetObject;
            };
    },

    /* Program Unit 12: Global property access utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var appGlobalReference = unitLoader( 0x5 ); /* Get the global object reference */
        var isFunctionType = function( value ) {
            return typeof value === "function" ? value : void 0x0;
        };

        // Exports a function to safely retrieve a global variable or a nested property.
        currentModule.unitPayload = function( topLevelKey, nestedKey ) {
            return arguments.length < 0x2 ?
                isFunctionType( appGlobalReference[topLevelKey] ) || isFunctionType( unitLoader( 0x51 )[topLevelKey] ) : /* Check global or internal symbol registry */
                ( unitLoader( 0x51 )[topLevelKey] && unitLoader( 0x51 )[topLevelKey][nestedKey] ) || ( appGlobalReference[topLevelKey] && appGlobalReference[topLevelKey][nestedKey] );
        };
    },

    /* Program Unit 13: Function binding utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertFunctionArgument = unitLoader( 0x4 ); /* Ensure the first argument is a function */

        // Exports a function that binds a given function to a specific context, optionally with a fixed number of arguments.
        currentModule.unitPayload = function( funcToBind, bindingContext, argumentCount ) {
            assertFunctionArgument( funcToBind );
            if ( void 0x0 === bindingContext ) {
                return funcToBind;
            }
            switch ( argumentCount ) {
                case 0x0:
                    return function() {
                        return funcToBind.call( bindingContext );
                    };
                case 0x1:
                    return function( arg1 ) {
                        return funcToBind.call( bindingContext, arg1 );
                    };
                case 0x2:
                    return function( arg1, arg2 ) {
                        return funcToBind.call( bindingContext, arg1, arg2 );
                    };
                case 0x3:
                    return function( arg1, arg2, arg3 ) {
                        return funcToBind.call( bindingContext, arg1, arg2, arg3 );
                    };
            }
            return function() {
                return funcToBind.apply( bindingContext, arguments );
            };
        };
    },

    /* Program Unit 14: Own property checker */
    function( currentModule, moduleOutputs ) {
        // Get a reference to Object.prototype.hasOwnProperty for direct call.
        var objectHasOwnProperty = {}.hasOwnProperty;

        // Exports a function that checks if an object has a specific property as its own (not inherited).
        currentModule.unitPayload = function( targetObject, propertyName ) {
            return objectHasOwnProperty.call( targetObject, propertyName );
        };
    },

    /* Program Unit 15: Object conversion utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var ensureNotNullOrUndefined = unitLoader( 0x11 ); /* Load utility to ensure value is not null/undefined */

        // Exports a function that converts a value into an object.
        currentModule.unitPayload = function( inputValue ) {
            return Object( ensureNotNullOrUndefined( inputValue ) );
        };
    },

    /* Program Unit 16: Non-enumerable property assignment */
    function( currentModule, moduleOutputs, unitLoader ) {
        var definePropertySupported = unitLoader( 0x9 ); /* Check if Object.defineProperty is supported */
        var propertyDefinitionFunc = unitLoader( 0xB ); /* Get the property definition function */
        var createPropertyAttributes = unitLoader( 0x23 ); /* Get the function to create property attributes */

        // Exports a function to define a non-enumerable property on an object.
        currentModule.unitPayload = definePropertySupported ?
            function( targetObject, propertyName, propertyValue ) {
                return propertyDefinitionFunc.f( targetObject, propertyName, createPropertyAttributes( 0x1, propertyValue ) );
            } :
            function( targetObject, propertyName, propertyValue ) {
                targetObject[propertyName] = propertyValue;
                return targetObject;
            };
    },

    /* Program Unit 17: Null/Undefined assertion */
    function( currentModule, moduleOutputs ) {
        // Exports a function that throws a TypeError if the input value is null or undefined.
        currentModule.unitPayload = function( inputValue ) {
            if ( inputValue == void 0x0 ) { // Using == to catch both null and undefined.
                throw TypeError( "Cannot invoke method on " + inputValue );
            }
            return inputValue;
        };
    },

    /* Program Unit 18: Internal state management for objects */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isWeakMapAvailable = unitLoader( 0x63 ); /* Check for native WeakMap support */
        var globalEnvironment = unitLoader( 0x5 ); /* Get the global object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var assignHiddenProperty = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var generateUniqueSymbol = unitLoader( 0x3B ); /* Create a unique symbol */
        var internalMapFallback = unitLoader( 0x2E ); /* Fallback map for non-WeakMap environments */
        var NativeWeakMap = globalEnvironment.WeakMap;

        var assignInternalState, retrieveInternalState, checkInternalState;

        // If WeakMap is natively supported, use it for efficient internal state management.
        if ( isWeakMapAvailable ) {
            var weakMapInstance = new NativeWeakMap();
            var weakMapGetter = weakMapInstance.get;
            var weakMapChecker = weakMapInstance.has;
            var weakMapSetter = weakMapInstance.set;

            assignInternalState = function( targetObject, statePayload ) {
                weakMapSetter.call( weakMapInstance, targetObject, statePayload );
                return statePayload;
            };
            retrieveInternalState = function( targetObject ) {
                return weakMapGetter.call( weakMapInstance, targetObject ) || {};
            };
            checkInternalState = function( targetObject ) {
                return weakMapChecker.call( weakMapInstance, targetObject );
            };
        } else {
            // Fallback mechanism for environments without native WeakMap support.
            var stateSymbolKey = generateUniqueSymbol( "state" );
            internalMapFallback[stateSymbolKey] = !0x0; // Mark this symbol as an internal state key.

            assignInternalState = function( targetObject, statePayload ) {
                assignHiddenProperty( targetObject, stateSymbolKey, statePayload );
                return statePayload;
            };
            retrieveInternalState = function( targetObject ) {
                return objectHasOwn( targetObject, stateSymbolKey ) ? targetObject[stateSymbolKey] : {};
            };
            checkInternalState = function( targetObject ) {
                return objectHasOwn( targetObject, stateSymbolKey );
            };
        }

        // Exports utilities for setting, getting, checking, enforcing, and creating getters for internal object state.
        currentModule.unitPayload = {
            set: assignInternalState,
            get: retrieveInternalState,
            has: checkInternalState,
            enforce: function( targetObject ) {
                return checkInternalState( targetObject ) ? retrieveInternalState( targetObject ) : assignInternalState( targetObject, {} );
            },
            getterFor: function( expectedStateType ) {
                return function( targetObject ) {
                    var objectState;
                    if ( !isAnObject( targetObject ) || ( ( objectState = retrieveInternalState( targetObject ) ).type !== expectedStateType ) ) {
                        throw TypeError( "Incompatible receiver, " + expectedStateType + " required" );
                    }
                    return objectState;
                };
            }
        };
    },

    /* Program Unit 19: Well-known Symbol registration */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalSymbolRegistry = unitLoader( 0x51 ); /* Access the global Symbol registry */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var getPropertyDescriptor = unitLoader( 0x69 ).f; /* Retrieve a property descriptor */
        var defineObjectProperty = unitLoader( 0xB ).f; /* Define a property on an object */

        // Exports a function to ensure a well-known Symbol exists in the global registry.
        currentModule.unitPayload = function( symbolKeyName ) {
            var symbolNamespace = globalSymbolRegistry.Symbol || ( globalSymbolRegistry.Symbol = {} );
            if ( !objectHasOwn( symbolNamespace, symbolKeyName ) ) {
                defineObjectProperty( symbolNamespace, symbolKeyName, {
                    value: getPropertyDescriptor( symbolKeyName )
                } );
            }
        };
    },

    /* Program Unit 20: Constructor species resolution */
    function( currentModule, moduleOutputs, unitLoader ) {
        var validateObjectInput = unitLoader( 0x1 ); /* Validate input is an object */
        var validateFunctionInput = unitLoader( 0x4 ); /* Validate input is a function */
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */

        // Exports a function to resolve the constructor to use for derived objects, respecting @@species.
        currentModule.unitPayload = function( baseObjectInstance, defaultConstructorFunction ) {
            var instanceConstructor = validateObjectInput( baseObjectInstance ).constructor;
            var speciesSymbol = obtainWellKnownSymbol( "species" );
            var resolvedSpeciesConstructor;

            // If a constructor exists and is an object, check for the @@species symbol.
            if ( instanceConstructor && typeof instanceConstructor === "object" ) {
                resolvedSpeciesConstructor = instanceConstructor[speciesSymbol];
                if ( void 0x0 === resolvedSpeciesConstructor ) {
                    return defaultConstructorFunction;
                }
            }

            // If @@species is null or undefined, revert to the default constructor.
            if ( resolvedSpeciesConstructor == null ) {
                return defaultConstructorFunction;
            }

            // Otherwise, use the resolved species constructor, ensuring it's a function.
            validateFunctionInput( resolvedSpeciesConstructor );
            return resolvedSpeciesConstructor;
        };
    },

    /* Program Unit 21: Object prototype retrieval */
    function( currentModule, moduleOutputs, unitLoader ) {
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var convertValueToObject = unitLoader( 0xF ); /* Convert a value to an object */
        var internalPrototypeSymbol = unitLoader( 0x3B )( "IE_PROTO" ); /* Internal symbol for IE prototype fallback */
        var getPrototypePolyfillStatus = unitLoader( 0x6E ); /* Check for getPrototypeOf polyfill necessity */
        var ObjectProtoReference = Object.prototype;

        // Exports a function to retrieve the prototype of an object.
        currentModule.unitPayload = getPrototypePolyfillStatus ?
            Object.getPrototypeOf :
            function( inputObject ) {
                inputObject = convertValueToObject( inputObject );
                // Check for internal IE_PROTO property.
                if ( objectHasOwn( inputObject, internalPrototypeSymbol ) ) {
                    return inputObject[internalPrototypeSymbol];
                }
                // Check if the constructor's prototype matches.
                if ( typeof inputObject.constructor === "function" && inputObject instanceof inputObject.constructor ) {
                    return inputObject.constructor.prototype;
                }
                // Fallback for plain objects.
                return inputObject instanceof Object ? ObjectProtoReference : void 0x0; // null is represented as void 0x0.
            };
    },

    /* Program Unit 22: Property descriptor accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var definePropertyAvailable = unitLoader( 0x9 ); /* Check for defineProperty support */
        var propertyIsEnumerableCheck = unitLoader( 0x3A ); /* Check if a property is enumerable */
        var createDescriptorObject = unitLoader( 0x23 ); /* Create a property descriptor object */
        var convertToIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var transformToPrimitive = unitLoader( 0x1D ); /* Convert property key to primitive */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var IE_DEFINE_PROPERTY_BUG_CHECK = unitLoader( 0x61 ); /* Check for IE defineProperty bug */
        var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

        // Exports a function to retrieve a property descriptor for a given object and key.
        moduleOutputs.f = definePropertyAvailable ?
            nativeGetOwnPropertyDescriptor :
            function( targetObject, propertyKey ) {
                targetObject = convertToIndexedObject( targetObject );
                propertyKey = transformToPrimitive( propertyKey, !0x0 ); // Prefer string conversion.

                if ( IE_DEFINE_PROPERTY_BUG_CHECK ) {
                    try {
                        return nativeGetOwnPropertyDescriptor( targetObject, propertyKey );
                    } catch ( error ) {
                        // Handle IE bug gracefully.
                    }
                }
                if ( objectHasOwn( targetObject, propertyKey ) ) {
                    return createDescriptorObject( !propertyIsEnumerableCheck.f.call( targetObject, propertyKey ), targetObject[propertyKey] );
                }
            };
    },

    /* Program Unit 23: Method definition and source tracking */
    function( currentModule, moduleOutputs, unitLoader ) {
        var applicationGlobal = unitLoader( 0x5 ); /* Get the global object */
        var sharedDataStore = unitLoader( 0x26 ); /* Access shared data store */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var setupGlobalEntry = unitLoader( 0x4F ); /* Register a global entry */
        var internalObjectState = unitLoader( 0x12 ); /* Internal state manager */
        var getObjectState = internalObjectState.get;
        var enforceObjectState = internalObjectState.enforce;
        var nativeFunctionToString = unitLoader( 0x62 ); /* Native Function.prototype.toString */
        var sourceCodeSplitPoint = String( nativeFunctionToString ).split( "toString" );

        // Store a utility to inspect function source code in the shared data store.
        sharedDataStore( "inspectSource", function( funcToInspect ) {
            return nativeFunctionToString.call( funcToInspect );
        } );

        // Exports a function to define a method on an object, optionally tracking its source code.
        ( currentModule.unitPayload = function( targetObject, methodName, methodImplementation, options ) {
            var isUnsafeOverride = !!options && !!options.unsafe;
            var shouldBeEnumerable = !!options && !!options.enumerable;
            var preventTargetGet = !!options && !!options.noTargetGet;

            if ( typeof methodImplementation === "function" ) {
                // If method name is not a string or 'name' property is missing, define it.
                if ( typeof methodName !== "string" || !objectHasOwn( methodImplementation, "name" ) ) {
                    defineNonEnumerable( methodImplementation, "name", methodName );
                }
                // Store the function's source code for inspection.
                enforceObjectState( methodImplementation ).source = sourceCodeSplitPoint.join( typeof methodName === "string" ? methodName : "" );
            }

            // Apply method definition based on target and options.
            if ( targetObject !== applicationGlobal ) {
                if ( isUnsafeOverride ) {
                    if ( !preventTargetGet && targetObject[methodName] ) {
                        shouldBeEnumerable = !0x0; // If unsafe and existing, make enumerable.
                    }
                    delete targetObject[methodName];
                }
                if ( shouldBeEnumerable ) {
                    targetObject[methodName] = methodImplementation;
                } else {
                    defineNonEnumerable( targetObject, methodName, methodImplementation );
                }
            } else {
                if ( shouldBeEnumerable ) {
                    targetObject[methodName] = methodImplementation;
                } else {
                    setupGlobalEntry( methodName, methodImplementation );
                }
            }
        } )( Function.prototype, "toString", function() {
            return typeof this === "function" && getObjectState( this ).source || nativeFunctionToString.call( this );
        } );
    },

    /* Program Unit 24: Integer conversion function */
    function( currentModule, moduleOutputs ) {
        var mathCeiling = Math.ceil;
        var mathFloor = Math.floor;

        // Exports a function to convert a value to an integer, handling NaN and signs.
        currentModule.unitPayload = function( inputValue ) {
            var numericValue = +inputValue; // Convert to number.
            return numericValue !== numericValue ? 0x0 : ( numericValue > 0x0 ? mathFloor : mathCeiling )( numericValue );
        };
    },

    /* Program Unit 25: ToIndexedObject utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertStrictlyToIndexedObject = unitLoader( 0x4D ); /* Convert to indexed object */
        var assertNonNullValue = unitLoader( 0x11 ); /* Assert value is not null/undefined */

        // Exports a function that converts a value to an indexed object, ensuring it's not null/undefined.
        currentModule.unitPayload = function( inputValue ) {
            return convertStrictlyToIndexedObject( assertNonNullValue( inputValue ) );
        };
    },

    /* Program Unit 26: @@toStringTag setter */
    function( currentModule, moduleOutputs, unitLoader ) {
        var defineObjectProperty = unitLoader( 0xB ).f; /* Define an object property */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */

        // Exports a function to set the `Symbol.toStringTag` property on an object's prototype.
        currentModule.unitPayload = function( targetObject, tagString, isNativeConstructor ) {
            var toStringTagKey = obtainWellKnownSymbol( "toStringTag" );
            if ( targetObject && !objectHasOwn( targetObject = isNativeConstructor ? targetObject : targetObject.prototype, toStringTagKey ) ) {
                defineObjectProperty( targetObject, toStringTagKey, {
                    configurable: !0x0,
                    value: tagString
                } );
            }
        };
    },

    /* Program Unit 27: Map entries iterator accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isPureEnvironment = unitLoader( 0x2 ); /* Check if environment is pure */
        var getMapNativeEntries = unitLoader( 0x39 ); /* Get native or polyfilled Map.prototype.entries */

        // Exports a function to retrieve the entries iterator for a Map instance.
        currentModule.unitPayload = isPureEnvironment ? getMapNativeEntries : function( mapInstance ) {
            return Map.prototype.entries.call( mapInstance );
        };
    },

    /* Program Unit 28: Object class name retriever */
    function( currentModule, moduleOutputs ) {
        // Get a reference to the native Object.prototype.toString.
        var nativeObjectStringifier = {}.toString;

        // Exports a function that extracts the internal [[Class]] (e.g., "Array", "Object") from a value.
        currentModule.unitPayload = function( valueToInspect ) {
            return nativeObjectStringifier.call( valueToInspect ).slice( 0x8, -0x1 );
        };
    },

    /* Program Unit 29: ToPrimitive conversion utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */

        // Exports a function to convert an object to a primitive value, with a preference for string or number.
        currentModule.unitPayload = function( inputObject, preferStringType ) {
            if ( !isAnObject( inputObject ) ) {
                return inputObject;
            }
            var primitiveOutcome, valueOfMethod, toStringMethod;

            if ( preferStringType && typeof ( valueOfMethod = inputObject.toString ) === "function" && !isAnObject( primitiveOutcome = valueOfMethod.call( inputObject ) ) ) {
                return primitiveOutcome;
            }
            if ( typeof ( valueOfMethod = inputObject.valueOf ) === "function" && !isAnObject( primitiveOutcome = valueOfMethod.call( inputObject ) ) ) {
                return primitiveOutcome;
            }
            if ( !preferStringType && typeof ( toStringMethod = inputObject.toString ) === "function" && !isAnObject( primitiveOutcome = toStringMethod.call( inputObject ) ) ) {
                return primitiveOutcome;
            }
            throw TypeError( "Unable to convert object to primitive value" );
        };
    },

    /* Program Unit 30: Object.create polyfill/utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertValidObject = unitLoader( 0x1 ); /* Assert the input is a valid object */
        var createPropertyDescriptor = unitLoader( 0x23 ); /* Create a property descriptor (n(35) is 0x23) */
        var getPropertyNames = unitLoader( 0x51 ); /* Get object property names (n(82) is 0x51) */
        var internalProtoKey = unitLoader( 0x3B )( "IE_PROTO" ); /* Custom symbol for IE prototype emulation */
        var noopFunction = function() {};

        // Helper function to create a truly plain object (without Object.prototype) using an iframe.
        var createCleanObject = function() {
            var docFrame, frameDoc, keyCount = getPropertyNames.length;
            docFrame = unitLoader( 0x4E )( "iframe" ); // Create an iframe element.
            docFrame.style.display = "none";
            unitLoader( 0x68 ).appendChild( docFrame ); // Append to document.documentElement.
            docFrame.src = String( "javascript:" ); // Prevent external content loading.

            ( frameDoc = docFrame.contentWindow.document ).open();
            frameDoc.write( "<script>document.F=Object</" + "script>" ); // Inject script to access Object.
            frameDoc.close();

            createCleanObject = frameDoc.F; // Get the Object constructor from the iframe.
            while ( keyCount-- ) {
                delete createCleanObject.prototype[getPropertyNames[keyCount]];
            }
            return createCleanObject();
        };

        // Exports Object.create or a polyfill.
        currentModule.unitPayload = Object.create || function( prototypeValue, propertyDescriptors ) {
            var newInstance;
            if ( prototypeValue !== void 0x0 ) { // null prototype is handled differently.
                noopFunction.prototype = assertValidObject( prototypeValue );
                newInstance = new noopFunction();
                noopFunction.prototype = void 0x0; // Clear prototype to prevent leakage.
                newInstance[internalProtoKey] = prototypeValue;
            } else {
                newInstance = createCleanObject();
            }
            return void 0x0 === propertyDescriptors ? newInstance : unitLoader( 0x67 )( newInstance, propertyDescriptors ); // n(103) is defineProperties.
        };

        unitLoader( 0x2E )[internalProtoKey] = !0x0; // Mark this internal key as handled by the fallback map.
    },

    /* Program Unit 31: Instance type assertion */
    function( currentModule, moduleOutputs ) {
        // Exports a function to assert that an object is an instance of a specific constructor.
        currentModule.unitPayload = function( instanceObject, ConstructorType, typeDescription ) {
            if ( !( instanceObject instanceof ConstructorType ) ) {
                throw TypeError( "Improper " + ( typeDescription ? typeDescription + " " : "" ) + "invocation" );
            }
            return instanceObject;
        };
    },

    /* Program Unit 32: TypedArray factory and polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var applyPolyfillConfig = unitLoader( 0x0 ); /* Load utility to apply polyfill configurations */
        var globalObjectRef = unitLoader( 0x5 ); /* Get the global object reference */
        var definePropertySupported = unitLoader( 0x9 ); /* Check for Object.defineProperty support */
        var checkSymbolPolyfill = unitLoader( 0x5F ); /* Check if Symbol polyfill is active */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var defineTargetMethod = unitLoader( 0x17 ); /* Define methods on target objects */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var validateInstance = unitLoader( 0x24 ); /* Assert value is an instance of a constructor */
        var convertToInteger = unitLoader( 0x18 ); /* Convert value to integer */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var calculateValidLength = unitLoader( 0x7C ); /* Calculate valid length for TypedArrays */
        var getOwnPropertyNames = unitLoader( 0x27 ).f; /* Get all own property names */
        var definePropertyAccessor = unitLoader( 0xB ); /* Define a property accessor */
        var getPropertyDescriptor = unitLoader( 0x16 ); /* Get a property descriptor */
        var arrayBufferUtils = unitLoader( 0xD7 ); /* TypedArray buffer utilities */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag property */
        var objectInternalState = unitLoader( 0x12 ); /* Internal state manager */
        var getState = objectInternalState.get;
        var setState = objectInternalState.set;
        var roundToNearest = Math.round;
        var RangeErrorConstructor = globalObjectRef.RangeError;

        var NATIVE_BUFFER_VIEWS = arrayBufferUtils.NATIVE_ARRAY_BUFFER_VIEWS;
        var TYPED_ARRAY_TAG_KEY = arrayBufferUtils.TYPED_ARRAY_TAG;
        var BaseTypedArrayConstructor = arrayBufferUtils.TypedArray;
        var BaseTypedArrayPrototype = arrayBufferUtils.TypedArrayPrototype;
        var AssertTypedArrayConstructor = arrayBufferUtils.aTypedArrayConstructor;
        var IsTypedArrayInstance = arrayBufferUtils.isTypedArray;

        var ArrayBufferImpl = arrayBufferUtils.ArrayBuffer;
        var DataViewImpl = arrayBufferUtils.DataView;

        // Helper function to create a new TypedArray instance by copying an existing one.
        var duplicateTypedArray = function( TargetConstructor, sourceTypedArray ) {
            var currentIdx = 0x0;
            var arrayLength = sourceTypedArray.length;
            var newTypedArray = new ( AssertTypedArrayConstructor( TargetConstructor ) )( arrayLength );
            while ( arrayLength > currentIdx ) {
                newTypedArray[currentIdx] = sourceTypedArray[currentIdx++];
            }
            return newTypedArray;
        };

        // Helper function to define a getter for an internal buffer property.
        var defineBufferPropertyGetter = function( prototypeObject, propertyName ) {
            definePropertyAccessor.f( prototypeObject, propertyName, {
                get: function() {
                    return getState( this )[propertyName];
                }
            } );
        };

        // Helper to check if a value is an ArrayBuffer or SharedArrayBuffer.
        var isBufferView = function( value ) {
            var valueClass;
            return value instanceof ArrayBufferImpl ||
                ( "ArrayBuffer" === ( valueClass = unitLoader( 0x35 )( value ) ) ) || /* n(53) is `classof` */
                "SharedArrayBuffer" === valueClass;
        };

        // Helper to validate and access properties on TypedArray instances, handling numerical indices.
        var validateTypedArrayProperty = function( typedArray, propKey ) {
            return IsTypedArrayInstance( typedArray ) &&
                typeof propKey !== "symbol" &&
                propKey in typedArray &&
                String( +propKey ) === String( propKey );
        };

        // Custom `getOwnPropertyDescriptor` for TypedArrays, prioritizing numerical properties.
        var getTypedArrayPropertyDescriptor = function( typedArray, propKey ) {
            propKey = unitLoader( 0x1D )( propKey, !0x0 ); /* Convert to primitive */
            return validateTypedArrayProperty( typedArray, propKey ) ?
                createPropertyDescriptor( 0x2, typedArray[propKey] ) :
                getPropertyDescriptor.f( typedArray, propKey );
        };

        // Custom `defineProperty` for TypedArrays, allowing direct value assignment for numerical properties.
        var setTypedArrayPropertyDescriptor = function( typedArray, propKey, descriptorObj ) {
            propKey = unitLoader( 0x1D )( propKey, !0x0 ); /* Convert to primitive */
            // If it's a valid numerical property and the descriptor is simple (just a value).
            if ( validateTypedArrayProperty( typedArray, propKey ) &&
                unitLoader( 0x8 )( descriptorObj ) && /* Check if descriptorObj is an object */
                unitLoader( 0xE )( descriptorObj, "value" ) && /* Check for 'value' property */
                !unitLoader( 0xE )( descriptorObj, "get" ) && /* No 'get' accessor */
                !unitLoader( 0xE )( descriptorObj, "set" ) && /* No 'set' accessor */
                descriptorObj.configurable &&
                descriptorObj.writable &&
                descriptorObj.enumerable
            ) {
                typedArray[propKey] = descriptorObj.value;
                return typedArray;
            }
            // Otherwise, use the standard property definition.
            return definePropertyAccessor.f( typedArray, propKey, descriptorObj );
        };

        // If `Object.defineProperty` is supported, patch the descriptor and definition methods.
        if ( definePropertySupported ) {
            if ( !NATIVE_BUFFER_VIEWS ) {
                getPropertyDescriptor.f = getTypedArrayPropertyDescriptor;
                definePropertyAccessor.f = setTypedArrayPropertyDescriptor;
                defineBufferPropertyGetter( BaseTypedArrayPrototype, "buffer" );
                defineBufferPropertyGetter( BaseTypedArrayPrototype, "byteOffset" );
                defineBufferPropertyGetter( BaseTypedArrayPrototype, "byteLength" );
                defineBufferPropertyGetter( BaseTypedArrayPrototype, "length" );
            }
            applyPolyfillConfig( {
                target: "Object",
                stat: !0x0,
                forced: !NATIVE_BUFFER_VIEWS
            }, {
                getOwnPropertyDescriptor: getTypedArrayPropertyDescriptor,
                defineProperty: setTypedArrayPropertyDescriptor
            } );
        }

        // The main factory function for generating TypedArray constructors.
        currentModule.unitPayload = function( arrayTypeName, elementSizeInBytes, constructorFactory, isClampedArray ) {
            var fullTypeName = arrayTypeName + ( isClampedArray ? "Clamped" : "" ) + "Array";
            var getterFunctionName = "get" + arrayTypeName;
            var setterFunctionName = "set" + arrayTypeName;
            var GlobalNativeTypedArray = globalObjectRef[fullTypeName];
            var CurrentTypedArrayImpl = GlobalNativeTypedArray;
            var CurrentTypedArrayProto = CurrentTypedArrayImpl && CurrentTypedArrayImpl.prototype;
            var generatedProperties = {};

            // Helper to define indexed property accessors for TypedArray instances.
            var defineIndexedPropertyAccessors = function( instanceRef, indexValue ) {
                definePropertyAccessor.f( instanceRef, indexValue, {
                    get: function() {
                        var instanceState = getState( this );
                        return instanceState.view[getterFunctionName]( indexValue * elementSizeInBytes + instanceState.byteOffset, !0x0 );
                    },
                    set: function( newValue ) {
                        var instanceState = getState( this );
                        if ( isClampedArray ) {
                            newValue = roundToNearest( newValue );
                            newValue = newValue < 0x0 ? 0x0 : newValue > 0xFF ? 0xFF : 0xFF & newValue;
                        }
                        instanceState.view[setterFunctionName]( indexValue * elementSizeInBytes + instanceState.byteOffset, newValue, !0x0 );
                    },
                    enumerable: !0x0
                } );
            };

            if ( NATIVE_BUFFER_VIEWS ) {
                if ( checkSymbolPolyfill ) { // Check for symbol polyfill (n(95))
                    CurrentTypedArrayImpl = constructorFactory( function( instanceRef, dataSource, byteOffsetValue, elementLength ) {
                        validateInstance( instanceRef, CurrentTypedArrayImpl, fullTypeName );
                        // Handle various constructor input types (ArrayBuffer, TypedArray, Array, length).
                        if ( unitLoader( 0x8 )( dataSource ) ) { // If dataSource is an object.
                            return isBufferView( dataSource ) ?
                                void 0x0 !== elementLength ?
                                new GlobalNativeTypedArray( dataSource, calculateValidLength( byteOffsetValue, elementSizeInBytes ), elementLength ) :
                                void 0x0 !== byteOffsetValue ?
                                new GlobalNativeTypedArray( dataSource, calculateValidLength( byteOffsetValue, elementSizeInBytes ) ) :
                                new GlobalNativeTypedArray( dataSource ) :
                                IsTypedArrayInstance( dataSource ) ?
                                duplicateTypedArray( CurrentTypedArrayImpl, dataSource ) :
                                unitLoader( 0x7B ).call( CurrentTypedArrayImpl, dataSource ); // Array.from
                        }
                        return new GlobalNativeTypedArray( calculateValidLength( dataSource ) );
                    } );
                    unitLoader( 0x2A )( CurrentTypedArrayImpl, BaseTypedArrayConstructor ); // setPrototypeOf
                    unitLoader( 0x30 ).forEach( getOwnPropertyNames( GlobalNativeTypedArray ), function( propKey ) { // Array.prototype.forEach
                        if ( !unitLoader( 0xE )( CurrentTypedArrayImpl, propKey ) ) { // hasOwnProperty
                            defineNonEnumerable( CurrentTypedArrayImpl, propKey, GlobalNativeTypedArray[propKey] );
                        }
                    } );
                    CurrentTypedArrayImpl.prototype = CurrentTypedArrayProto;
                }
            } else {
                CurrentTypedArrayImpl = constructorFactory( function( instanceRef, dataInput, byteOffsetInput, elementCount ) {
                    validateInstance( instanceRef, CurrentTypedArrayImpl, fullTypeName );
                    var internalBuffer, totalLength, calculatedCount, currentByteOffset = 0x0,
                        currentByteLength = 0x0;

                    if ( unitLoader( 0x8 )( dataInput ) ) { // If dataInput is an object.
                        if ( !isBufferView( dataInput ) ) {
                            return IsTypedArrayInstance( dataInput ) ?
                                duplicateTypedArray( CurrentTypedArrayImpl, dataInput ) :
                                unitLoader( 0x7B ).call( CurrentTypedArrayImpl, dataInput ); // Array.from
                        }
                        internalBuffer = dataInput;
                        currentByteLength = calculateValidLength( byteOffsetInput, elementSizeInBytes );
                        var sourceBufferByteLength = dataInput.byteLength;
                        if ( void 0x0 === elementCount ) {
                            if ( sourceBufferByteLength % elementSizeInBytes ) {
                                throw RangeErrorConstructor( "Wrong length" );
                            }
                            if ( ( totalLength = sourceBufferByteLength - currentByteLength ) < 0x0 ) {
                                throw RangeErrorConstructor( "Wrong length" );
                            }
                        } else if ( ( totalLength = normalizeLength( elementCount ) * elementSizeInBytes ) + currentByteLength > sourceBufferByteLength ) {
                            throw RangeErrorConstructor( "Wrong length" );
                        }
                        calculatedCount = totalLength / elementSizeInBytes;
                    } else {
                        calculatedCount = calculateValidLength( dataInput );
                        internalBuffer = new ArrayBufferImpl( totalLength = calculatedCount * elementSizeInBytes );
                    }

                    setState( instanceRef, {
                        buffer: internalBuffer,
                        byteOffset: currentByteLength,
                        byteLength: totalLength,
                        length: calculatedCount,
                        view: new DataViewImpl( internalBuffer )
                    } );
                    while ( currentByteOffset < calculatedCount ) {
                        defineIndexedPropertyAccessors( instanceRef, currentByteOffset++ );
                    }
                } );
                unitLoader( 0x2A )( CurrentTypedArrayImpl, BaseTypedArrayConstructor ); // setPrototypeOf
                CurrentTypedArrayProto = CurrentTypedArrayImpl.prototype = unitLoader( 0x1E )( BaseTypedArrayPrototype ); // Object.create
            }

            // Ensure the constructor property on the prototype points to the correct constructor.
            if ( CurrentTypedArrayProto.constructor !== CurrentTypedArrayImpl ) {
                defineNonEnumerable( CurrentTypedArrayProto, "constructor", CurrentTypedArrayImpl );
            }

            // If `TYPED_ARRAY_TAG_KEY` is enabled, set the @@toStringTag property.
            if ( TYPED_ARRAY_TAG_KEY ) {
                defineNonEnumerable( CurrentTypedArrayProto, TYPED_ARRAY_TAG_KEY, fullTypeName );
            }

            // Add the created constructor to the `generatedProperties` object.
            generatedProperties[fullTypeName] = CurrentTypedArrayImpl;

            // Apply the polyfill configuration.
            applyPolyfillConfig( {
                global: !0x0,
                forced: CurrentTypedArrayImpl !== GlobalNativeTypedArray,
                sham: !NATIVE_BUFFER_VIEWS
            }, generatedProperties );

            // Define `BYTES_PER_ELEMENT` as a static and prototype property.
            if ( !( "BYTES_PER_ELEMENT" in CurrentTypedArrayImpl ) ) {
                defineNonEnumerable( CurrentTypedArrayImpl, "BYTES_PER_ELEMENT", elementSizeInBytes );
            }
            if ( !( "BYTES_PER_ELEMENT" in CurrentTypedArrayProto ) ) {
                defineNonEnumerable( CurrentTypedArrayProto, "BYTES_PER_ELEMENT", elementSizeInBytes );
            }

            // Mark the TypedArray for @@toStringTag.
            arrayBufferUtils.exportTag( fullTypeName );
        };
    },

    /* Program Unit 33: TypedArray definitions and helpers */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var definePropertySupported = unitLoader( 0x9 ); /* Check for Object.defineProperty support */
        var globalObjectRef = unitLoader( 0x5 ); /* Get the global object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var defineTargetMethod = unitLoader( 0x17 ); /* Define methods on target objects */
        var getPrototype = unitLoader( 0x15 ); /* Get object prototype */
        var setPrototype = unitLoader( 0x2A ); /* Set object prototype */
        var generateUniqueSymbol = unitLoader( 0x3B ); /* Create a unique symbol */
        var toClassTag = unitLoader( 0x1C ); /* Get internal class tag (e.g., "Array") */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag property */
        var getOwnPropertyNames = unitLoader( 0x27 ).f; /* Get all own property names */
        var definePropertyAccessor = unitLoader( 0xB ).f; /* Define a property accessor */
        var getPropertyDescriptor = unitLoader( 0x16 ).f; /* Get a property descriptor */
        var isStrict = unitLoader( 0x2 ); /* Check if environment is strict/pure */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var getGlobalObject = unitLoader( 0x5 ); /* Get the global object */
        var nativeInt8Array = globalObjectRef.Int8Array;
        var nativeInt8ArrayPrototype = nativeInt8Array && nativeInt8Array.prototype;
        var nativeUint8ClampedArray = globalObjectRef.Uint8ClampedArray;
        var nativeUint8ClampedArrayPrototype = nativeUint8ClampedArray && nativeUint8ClampedArray.prototype;
        var getNativePrototype = nativeInt8Array && getPrototype( nativeInt8Array );
        var getNativeProtoPrototype = nativeInt8ArrayPrototype && getPrototype( nativeInt8ArrayPrototype );
        var ObjectPrototypeReference = Object.prototype;
        var isPrototypeOfMethod = ObjectPrototypeReference.isPrototypeOf;
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var TYPED_ARRAY_TAG_SYMBOL = generateUniqueSymbol( "TYPED_ARRAY_TAG" ); /* Custom symbol for TypedArray tag */

        var NATIVE_ARRAY_BUFFER_SUPPORT = !!( globalObjectRef.ArrayBuffer && globalObjectRef.DataView );
        var NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT = NATIVE_ARRAY_BUFFER_SUPPORT && !!unitLoader( 0x2A ); /* Check for setPrototypeOf support */
        var TypedArraySupportBroken = !0x1; // Flag to check if TypedArray support is broken.

        var arrayBufferTypes = {
            Int8Array: 0x1,
            Uint8Array: 0x1,
            Uint8ClampedArray: 0x1,
            Int16Array: 0x2,
            Uint16Array: 0x2,
            Int32Array: 0x4,
            Uint32Array: 0x4,
            Float32Array: 0x4,
            Float64Array: 0x8
        };

        // Helper to check if a value is a known TypedArray type.
        var isKnownTypedArray = function( value ) {
            return isAnObject( value ) && objectHasOwn( arrayBufferTypes, toClassTag( value ) );
        };

        // Check if all TypedArray constructors exist.
        for ( var typeName in arrayBufferTypes ) {
            if ( !globalObjectRef[typeName] ) {
                TypedArraySupportBroken = !0x1;
            }
        }

        /*
         * If TypedArray support is broken or setPrototypeOf is not reliable,
         * define a generic TypedArray constructor.
         */
        if ( !NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT || typeof getNativePrototype !== "function" || getNativePrototype === Function.prototype ) {
            getNativePrototype = function() {
                throw TypeError( "Incorrect invocation" );
            };
            if ( NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT ) {
                for ( typeName in arrayBufferTypes ) {
                    if ( globalObjectRef[typeName] ) {
                        setPrototype( globalObjectRef[typeName], getNativePrototype );
                    }
                }
            }
        }

        /*
         * If TypedArray prototype chain is broken, fix it.
         */
        if ( !NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT || !getNativeProtoPrototype || getNativeProtoPrototype === ObjectPrototypeReference ) {
            getNativeProtoPrototype = getNativePrototype.prototype;
            if ( NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT ) {
                for ( typeName in arrayBufferTypes ) {
                    if ( globalObjectRef[typeName] && globalObjectRef[typeName].prototype ) {
                        setPrototype( globalObjectRef[typeName].prototype, getNativeProtoPrototype );
                    }
                }
            }
        }

        // Fix Uint8ClampedArray prototype if needed.
        if ( NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT && getPrototype( nativeUint8ClampedArrayPrototype ) !== getNativeProtoPrototype ) {
            setPrototype( nativeUint8ClampedArrayPrototype, getNativeProtoPrototype );
        }

        // If defineProperty is supported and @@toStringTag is not on prototype, add it.
        if ( definePropertySupported && !objectHasOwn( getNativeProtoPrototype, wellKnownSymbol( "toStringTag" ) ) ) {
            TypedArraySupportBroken = !0x0; // Mark as broken, force polyfill logic.
            definePropertyAccessor.f( getNativeProtoPrototype, wellKnownSymbol( "toStringTag" ), {
                get: function() {
                    return isAnObject( this ) ? this[TYPED_ARRAY_TAG_SYMBOL] : void 0x0;
                }
            } );
            for ( typeName in arrayBufferTypes ) {
                if ( globalObjectRef[typeName] ) {
                    defineNonEnumerable( globalObjectRef[typeName], TYPED_ARRAY_TAG_SYMBOL, typeName );
                }
            }
        }

        // If native ArrayBuffer is supported and setPrototypeOf is supported, fix DataView prototype.
        if ( NATIVE_ARRAY_BUFFER_SUPPORT && NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT && getPrototype( globalObjectRef.DataView.prototype ) !== ObjectPrototypeReference ) {
            setPrototype( globalObjectRef.DataView.prototype, ObjectPrototypeReference );
        }

        // Exports various TypedArray-related utilities and properties.
        currentModule.unitPayload = {
            NATIVE_ARRAY_BUFFER: NATIVE_ARRAY_BUFFER_SUPPORT,
            NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT,
            TYPED_ARRAY_TAG: TypedArraySupportBroken && TYPED_ARRAY_TAG_SYMBOL,
            aTypedArray: function( typedArrayInstance ) {
                if ( isKnownTypedArray( typedArrayInstance ) ) {
                    return typedArrayInstance;
                }
                throw TypeError( "Target is not a typed array" );
            },
            aTypedArrayConstructor: function( constructorFunc ) {
                if ( NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT ) {
                    if ( isPrototypeOfMethod.call( getNativePrototype, constructorFunc ) ) {
                        return constructorFunc;
                    }
                } else {
                    for ( var typeKey in arrayBufferTypes ) {
                        if ( objectHasOwn( arrayBufferTypes, typeKey ) ) {
                            var specificTypedArray = globalObjectRef[typeKey];
                            if ( specificTypedArray && ( constructorFunc === specificTypedArray || isPrototypeOfMethod.call( specificTypedArray, constructorFunc ) ) ) {
                                return constructorFunc;
                            }
                        }
                    }
                }
                throw TypeError( "Target is not a typed array constructor" );
            },
            exportProto: function( methodName, methodImpl, forceOverride ) {
                if ( definePropertySupported ) {
                    if ( forceOverride ) {
                        for ( var typeKey in arrayBufferTypes ) {
                            var specificTypedArray = globalObjectRef[typeKey];
                            if ( specificTypedArray && objectHasOwn( specificTypedArray.prototype, methodName ) ) {
                                delete specificTypedArray.prototype[methodName];
                            }
                        }
                    }
                    if ( getNativeProtoPrototype[methodName] && !forceOverride ) {
                        return;
                    }
                    defineTargetMethod( getNativeProtoPrototype, methodName, forceOverride ? methodImpl : NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT && nativeInt8ArrayPrototype[methodName] || methodImpl );
                }
            },
            exportStatic: function( methodName, methodImpl, forceOverride ) {
                var specificTypedArray, typeKey;
                if ( definePropertySupported ) {
                    if ( NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT ) {
                        if ( forceOverride ) {
                            for ( typeKey in arrayBufferTypes ) {
                                ( specificTypedArray = globalObjectRef[typeKey] ) && objectHasOwn( specificTypedArray, methodName ) && delete specificTypedArray[methodName];
                            }
                        }
                        if ( getNativePrototype[methodName] && !forceOverride ) {
                            return;
                        }
                        try {
                            return defineTargetMethod( getNativePrototype, methodName, forceOverride ? methodImpl : NATIVE_ARRAY_BUFFER_VIEWS_SUPPORT && nativeInt8Array[methodName] || methodImpl );
                        } catch ( err ) {
                            // Handle error.
                        }
                    }
                    for ( typeKey in arrayBufferTypes ) {
                        !( specificTypedArray = globalObjectRef[typeKey] ) || ( specificTypedArray[methodName] && !forceOverride ) || defineTargetMethod( specificTypedArray, methodName, methodImpl );
                    }
                }
            },
            isView: function( value ) {
                var valueClass = toClassTag( value );
                return "DataView" === valueClass || objectHasOwn( arrayBufferTypes, valueClass );
            },
            isTypedArray: isKnownTypedArray,
            TypedArray: getNativePrototype,
            TypedArrayPrototype: getNativeProtoPrototype,
            exportTag: setToStringTag
        };
    },

    /* Program Unit 34: Metadata API (for Reflect metadata) */
    function( currentModule, moduleOutputs, unitLoader ) {
        var createWeakMap = unitLoader( 0x60 ); /* Load WeakMap polyfill/utility (n(96)) */
        var sharedData = unitLoader( 0x26 )( "metadata" ); /* Get shared metadata store */
        var metadataStore = sharedData.store || ( sharedData.store = new createWeakMap() ); /* Initialize global metadata WeakMap */

        // Helper to get or create a Map for a specific metadata key and object.
        var getOrCreateMetadataMap = function( targetObject, metadataKey, createIfMissing ) {
            var objectMetadata = metadataStore.get( targetObject );
            if ( !objectMetadata ) {
                if ( !createIfMissing ) return;
                metadataStore.set( targetObject, objectMetadata = new createWeakMap() ); // Use WeakMap for object-specific metadata
            }
            var keySpecificMetadata = objectMetadata.get( metadataKey );
            if ( !keySpecificMetadata ) {
                if ( !createIfMissing ) return;
                objectMetadata.set( metadataKey, keySpecificMetadata = new createWeakMap() ); // Use WeakMap for key-specific metadata
            }
            return keySpecificMetadata;
        };

        // Exports utilities for managing metadata.
        currentModule.unitPayload = {
            store: metadataStore,
            getMap: getOrCreateMetadataMap,
            has: function( metadataKey, targetObject, propertyKey ) {
                var specificMap = getOrCreateMetadataMap( targetObject, propertyKey, !0x1 );
                return void 0x0 !== specificMap && specificMap.has( metadataKey );
            },
            get: function( metadataKey, targetObject, propertyKey ) {
                var specificMap = getOrCreateMetadataMap( targetObject, propertyKey, !0x1 );
                return void 0x0 === specificMap ? void 0x0 : specificMap.get( metadataKey );
            },
            set: function( metadataKey, metadataValue, targetObject, propertyKey ) {
                getOrCreateMetadataMap( targetObject, propertyKey, !0x0 ).set( metadataKey, metadataValue );
            },
            keys: function( targetObject, propertyKey ) {
                var specificMap = getOrCreateMetadataMap( targetObject, propertyKey, !0x1 );
                var keysList = [];
                if ( specificMap ) {
                    specificMap.forEach( function( value, key ) {
                        keysList.push( key );
                    } );
                }
                return keysList;
            },
            toKey: function( key ) {
                return void 0x0 === key || typeof key === "symbol" ? key : String( key );
            }
        };
    },

    /* Program Unit 35: Property descriptor creator */
    function( currentModule, moduleOutputs ) {
        // Exports a function that creates a property descriptor object with configurable, enumerable, writable, and value properties.
        currentModule.unitPayload = function( flags, value ) {
            return {
                enumerable: !( flags & 0x1 ),
                configurable: !( flags & 0x2 ),
                writable: !( flags & 0x4 ),
                value: value
            };
        };
    },

    /* Program Unit 36: Object method batch definition */
    function( currentModule, moduleOutputs, unitLoader ) {
        var defineMethod = unitLoader( 0x17 ); /* Load method definition utility */

        // Exports a function that defines multiple methods on an object.
        currentModule.unitPayload = function( targetObject, methodsObject, options ) {
            for ( var propName in methodsObject ) {
                defineMethod( targetObject, propName, methodsObject[propName], options );
            }
            return targetObject;
        };
    },

    /* Program Unit 37: Set entries iterator accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isPureEnvironment = unitLoader( 0x2 ); /* Check if environment is pure */
        var getSetNativeValues = unitLoader( 0x39 ); /* Get native or polyfilled Set.prototype.values */

        // Exports a function to retrieve the values iterator for a Set instance.
        currentModule.unitPayload = isPureEnvironment ? getSetNativeValues : function( setInstance ) {
            return Set.prototype.values.call( setInstance );
        };
    },

    /* Program Unit 38: Shared data utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var registerGlobalValue = unitLoader( 0x4F ); /* Register a global value */
        var isPure = unitLoader( 0x2 ); /* Check if environment is pure */
        var sharedGlobalStore = globalObject["__core-js_shared__"] || registerGlobalValue( "__core-js_shared__", {} );

        // Exports a function to access a shared global storage, optionally with an initial value.
        ( currentModule.unitPayload = function( key, defaultValue ) {
            return sharedGlobalStore[key] || ( sharedGlobalStore[key] = void 0x0 !== defaultValue ? defaultValue : {} );
        } )( "versions", [] ).push( {
            version: "3.1.3",
            mode: isPure ? "pure" : "global",
            copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
        } );
    },

    /* Program Unit 39: Object property name retriever */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getPropertyNames = unitLoader( 0x65 ); /* Get property names utility (n(101)) */
        var excludedPropertyNames = unitLoader( 0x51 ).concat( "length", "prototype" ); /* Excluded well-known properties */

        // Exports a function to get all own enumerable and non-enumerable property names of an object.
        moduleOutputs.f = Object.getOwnPropertyNames || function( targetObject ) {
            return getPropertyNames( targetObject, excludedPropertyNames );
        };
    },

    /* Program Unit 40: Define property on object */
    function( currentModule, moduleOutputs, unitLoader ) {
        var toPrimitive = unitLoader( 0x1D ); /* Convert property key to primitive */
        var defineObjectProperty = unitLoader( 0xB ); /* Define an object property */
        var createPropertyDescriptor = unitLoader( 0x23 ); /* Create a property descriptor */

        // Exports a function to define a property on an object, either by direct assignment or using defineProperty.
        currentModule.unitPayload = function( targetObject, propertyKey, propertyValue ) {
            var keyAsPrimitive = toPrimitive( propertyKey );
            if ( keyAsPrimitive in targetObject ) {
                defineObjectProperty.f( targetObject, keyAsPrimitive, createPropertyDescriptor( 0x0, propertyValue ) );
            } else {
                targetObject[keyAsPrimitive] = propertyValue;
            }
        };
    },

    /* Program Unit 41: Array unscopables setup */
    function( currentModule, moduleOutputs, unitLoader ) {
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var createCleanObject = unitLoader( 0x1E ); /* Create a clean object (n(30)) */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var unscopablesSymbol = obtainWellKnownSymbol( "unscopables" );
        var ArrayPrototype = Array.prototype;

        // If Array.prototype[unscopablesSymbol] is null or undefined, initialize it with a clean object.
        if ( ArrayPrototype[unscopablesSymbol] == void 0x0 ) {
            defineNonEnumerable( ArrayPrototype, unscopablesSymbol, createCleanObject( void 0x0 ) ); // Object.create(null)
        }

        // Exports a function to mark a property as unscopable for Array.prototype.
        currentModule.unitPayload = function( propertyName ) {
            ArrayPrototype[unscopablesSymbol][propertyName] = !0x0;
        };
    },

    /* Program Unit 42: SetPrototypeOf polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertInputObject = unitLoader( 0x1 ); /* Assert input is an object */
        var validatePrototypeObject = unitLoader( 0x6F ); /* Validate prototype object */

        // Exports Object.setPrototypeOf or a polyfill.
        currentModule.unitPayload = Object.setPrototypeOf || ( "__proto__" in {} ? ( function() {
            var testObject, isArrayProto, testProto = {};
            try {
                // Test if __proto__ setter works and if it makes an Array.
                ( testObject = Object.getOwnPropertyDescriptor( Object.prototype, "__proto__" ).set ).call( testProto, [] );
                isArrayProto = testProto instanceof Array;
            } catch ( error ) {
                // Ignore errors.
            }
            return function( targetObject, prototypeObject ) {
                assertInputObject( targetObject );
                validatePrototypeObject( prototypeObject );
                if ( isArrayProto ) {
                    testObject.call( targetObject, prototypeObject );
                } else {
                    targetObject.__proto__ = prototypeObject;
                }
                return targetObject;
            };
        } )() : void 0x0 );
    },

    /* Program Unit 43: Set species constructor for built-ins */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var defineObjectProperty = unitLoader( 0xB ); /* Define an object property */
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var definePropertySupport = unitLoader( 0x9 ); /* Check for defineProperty support */
        var speciesSymbol = obtainWellKnownSymbol( "species" );

        // Exports a function to set the @@species getter on a constructor's prototype.
        currentModule.unitPayload = function( constructorName ) {
            var constructorRef = unitLoader( 0xC )( constructorName ); /* Get constructor from global or internal registry */
            var propertyDefinitionFunc = defineObjectProperty.f;
            if ( definePropertySupport && constructorRef && !constructorRef[speciesSymbol] ) {
                propertyDefinitionFunc( constructorRef, speciesSymbol, {
                    configurable: !0x0,
                    get: function() {
                        return this;
                    }
                } );
            }
        };
    },

    /* Program Unit 44: RegExp flags getter */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */

        // Exports a function to extract flags from a RegExp instance.
        currentModule.unitPayload = function() {
            var regexInstance = assertObject( this );
            var flagsString = "";
            if ( regexInstance.global ) {
                flagsString += "g";
            }
            if ( regexInstance.ignoreCase ) {
                flagsString += "i";
            }
            if ( regexInstance.multiline ) {
                flagsString += "m";
            }
            if ( regexInstance.dotAll ) {
                flagsString += "s";
            }
            if ( regexInstance.unicode ) {
                flagsString += "u";
            }
            if ( regexInstance.sticky ) {
                flagsString += "y";
            }
            return flagsString;
        };
    },

    /* Program Unit 45: Unique ID generator */
    function( currentModule, moduleOutputs ) {
        var uniqueIdCounter = 0x0;
        var randomSeed = Math.random();

        // Exports a function to generate a unique string ID, useful for symbols or internal keys.
        currentModule.unitPayload = function( prefix ) {
            return "Symbol(" + String( void 0x0 === prefix ? "" : prefix ) + ")_" + ( ++uniqueIdCounter + randomSeed ).toString( 0x24 );
        };
    },

    /* Program Unit 46: Internal map for special properties */
    function( currentModule, moduleOutputs ) {
        // Exports an empty object used as an internal map for special properties or symbols.
        currentModule.unitPayload = {};
    },

    /* Program Unit 47: Array.isArray polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */

        // Exports Array.isArray or a polyfill using internal [[Class]] tag.
        currentModule.unitPayload = Array.isArray || function( value ) {
            return "Array" === getClassTag( value );
        };
    },

    /* Program Unit 48: Array iteration methods (forEach, map, filter, etc.) */
    function( currentModule, moduleOutputs, unitLoader ) {
        var bindTargetFunction = unitLoader( 0xD ); /* Bind function to a context */
        var toIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var convertValueToObject = unitLoader( 0xF ); /* Convert value to object */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var createArrayFromConstructor = unitLoader( 0x31 ); /* Create array from constructor (n(49)) */
        var ArrayPush = [].push; // Reference to native Array.prototype.push.

        // Helper function factory for various array iteration methods.
        var createArrayMethod = function( methodType ) {
            var isMap = 0x1 == methodType;
            var isFilter = 0x2 == methodType;
            var isSome = 0x3 == methodType;
            var isEvery = 0x4 == methodType;
            var isFind = 0x5 == methodType || 0x6 == methodType; // Includes find and findIndex.
            var isFindIndex = 0x6 == methodType;

            return function( collection, callbackFunc, contextObject, resultConstructor ) {
                var currentCollection, collectionRef, boundCallback, collectionLength, loopIndex = 0;
                var finalConstructor = resultConstructor || createArrayFromConstructor;
                var resultCollection = isMap ? finalConstructor( collection, normalizeLength( collection.length ) ) :
                    isFilter ? finalConstructor( collection, 0x0 ) : void 0x0;

                collectionRef = convertValueToObject( collection );
                currentCollection = toIndexedObject( collectionRef );
                boundCallback = bindTargetFunction( callbackFunc, contextObject, 0x3 );
                collectionLength = normalizeLength( currentCollection.length );

                for ( ; loopIndex < collectionLength; loopIndex++ ) {
                    // Check if index exists and call callback.
                    if ( ( isFind || loopIndex in currentCollection ) && ( dataValue = boundCallback( ( elementValue = currentCollection[loopIndex] ), loopIndex, collectionRef ) ) ) {
                        if ( methodType === 0x1 ) { // Map
                            resultCollection[loopIndex] = dataValue;
                        } else if ( isFilter ) { // Filter
                            ArrayPush.call( resultCollection, elementValue );
                        } else if ( isSome ) { // Some
                            return !0x0;
                        } else if ( isFind ) { // Find
                            return elementValue;
                        } else if ( isFindIndex ) { // FindIndex
                            return loopIndex;
                        }
                    } else if ( isEvery ) { // Every
                        return !0x1;
                    }
                }
                return isFindIndex ? -0x1 : isSome ? !0x1 : isEvery ? !0x0 : resultCollection;
            };
        };

        // Exports various array iteration methods.
        currentModule.unitPayload = {
            forEach: createArrayMethod( 0x0 ),
            map: createArrayMethod( 0x1 ),
            filter: createArrayMethod( 0x2 ),
            some: createArrayMethod( 0x3 ),
            every: createArrayMethod( 0x4 ),
            find: createArrayMethod( 0x5 ),
            findIndex: createArrayMethod( 0x6 )
        };
    },

    /* Program Unit 49: Array constructor species utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isObject = unitLoader( 0x8 ); /* Check if value is an object */
        var isArray = unitLoader( 0x2F ); /* Check if value is an array */
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var speciesSymbol = obtainWellKnownSymbol( "species" );

        // Exports a function to create a new array instance, respecting the @@species symbol.
        currentModule.unitPayload = function( baseArray, initialLength ) {
            var constructorRef;
            return isArray( baseArray ) &&
                ( typeof ( constructorRef = baseArray.constructor ) !== "function" ||
                    constructorRef === Array ||
                    !isArray( constructorRef.prototype ) ?
                    isObject( constructorRef ) && ( constructorRef = constructorRef[speciesSymbol] ) == void 0x0 && ( constructorRef = void 0x0 ) : // Check for null/undefined species.
                    constructorRef = void 0x0 ), // Reset constructor if it's the Array constructor or its prototype.
                new ( void 0x0 === constructorRef ? Array : constructorRef )( initialLength === 0x0 ? 0x0 : initialLength );
        };
    },

    /* Program Unit 50: Array method species compatibility check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var speciesSymbol = obtainWellKnownSymbol( "species" );

        // Exports a function to check if a native Array method respects the @@species symbol.
        currentModule.unitPayload = function( methodName ) {
            return !testForError( function() {
                var testArray = [];
                var customConstructor = ( testArray.constructor = {} );
                customConstructor[speciesSymbol] = function() {
                    return {
                        foo: 0x1
                    };
                };
                return 0x1 !== testArray[methodName]( Boolean ).foo;
            } );
        };
    },

    /* Program Unit 51: Iterable object registry */
    function( currentModule, moduleOutputs ) {
        // Exports an empty object used to register iterators for different types.
        currentModule.unitPayload = {};
    },

    /* Program Unit 52: Iterator method accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var iteratorRegistry = unitLoader( 0x33 ); /* Get the iterator registry (n(51)) */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var iteratorSymbol = wellKnownSymbol( "iterator" );

        // Exports a function to retrieve the iterator method for an object.
        currentModule.unitPayload = function( inputObject ) {
            if ( inputObject != void 0x0 ) { // If not null or undefined.
                return inputObject[iteratorSymbol] || inputObject["@@iterator"] || iteratorRegistry[getClassTag( inputObject )];
            }
        };
    },

    /* Program Unit 53: Class tag retriever */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var toStringTagSymbol = wellKnownSymbol( "toStringTag" );
        var isArgumentsObject = "Arguments" === getClassTag( ( function() {
            return arguments;
        } )() );

        // Exports a function to get the "class" tag of an object for `Object.prototype.toString`.
        currentModule.unitPayload = function( inputValue ) {
            var tagValue, valuePrototype, customTag;
            if ( void 0x0 === inputValue ) {
                return "Undefined";
            }
            if ( inputValue === void 0x0 ) { // Check for null (void 0x0 is undefined, so this should be `null === inputValue`)
                return "Null";
            }

            // Attempt to get custom @@toStringTag.
            customTag = ( function( object, prop ) {
                try {
                    return object[prop];
                } catch ( error ) {
                    // Ignore errors.
                }
            } )( ( valuePrototype = Object( inputValue ) ), toStringTagSymbol );

            if ( typeof customTag === "string" ) {
                return customTag;
            }
            // Fallback for Arguments object.
            if ( isArgumentsObject ) {
                return getClassTag( valuePrototype );
            }
            // Default to internal [[Class]] tag.
            if ( "Object" === ( tagValue = getClassTag( valuePrototype ) ) && typeof valuePrototype.callee === "function" ) {
                return "Arguments";
            }
            return tagValue;
        };
    },

    /* Program Unit 54: Iterator prototype setup */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var IteratorPrototype = unitLoader( 0x6D ).IteratorPrototype; /* Get IteratorPrototype */
        var createObject = unitLoader( 0x1E ); /* Create an object with specified prototype */
        var createPropertyDescriptor = unitLoader( 0x23 ); /* Create a property descriptor */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag */
        var iteratorRegistry = unitLoader( 0x33 ); /* Iterator registry */
        var emptyIteratorFunction = function() {
            return this;
        };

        // Exports a function to set up a constructor and its prototype as an iterator.
        currentModule.unitPayload = function( IteratorConstructor, constructorName, nextMethod ) {
            var fullIteratorName = constructorName + " Iterator";
            IteratorConstructor.prototype = createObject( IteratorPrototype, {
                next: createPropertyDescriptor( 0x1, nextMethod )
            } );
            setToStringTag( IteratorConstructor, fullIteratorName, !0x1 );
            iteratorRegistry[fullIteratorName] = emptyIteratorFunction;
            return IteratorConstructor;
        };
    },

    /* Program Unit 55: Promise capability factory */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var assertFunction = unitLoader( 0x4 ); /* Assert input is a function */

        // Internal class to create Promise capabilities (resolve/reject functions).
        var PromiseCapability = function( PromiseConstructor ) {
            var resolveFunc, rejectFunc;
            this.promise = new PromiseConstructor( function( resolve, reject ) {
                if ( void 0x0 !== resolveFunc || void 0x0 !== rejectFunc ) {
                    throw TypeError( "Bad Promise constructor" );
                }
                resolveFunc = resolve;
                rejectFunc = reject;
            } );
            this.resolve = assertFunction( resolveFunc );
            this.reject = assertFunction( rejectFunc );
        };

        // Exports a factory function to create new Promise capabilities.
        moduleOutputs.f = function( PromiseConstructor ) {
            return new PromiseCapability( PromiseConstructor );
        };
    },

    /* Program Unit 56: String character access utilities */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertToInteger = unitLoader( 0x18 ); /* Convert value to integer */
        var ensureNotNull = unitLoader( 0x11 ); /* Ensure value is not null/undefined */

        // Helper function factory for character access (char at index or char code at index).
        var createCharAccessor = function( returnCharacter ) {
            return function( inputString, charIndex ) {
                var stringRef, indexVal, stringLength, charCode, nextCharCode;
                stringRef = String( ensureNotNull( inputString ) );
                indexVal = convertToInteger( charIndex );
                stringLength = stringRef.length;

                if ( indexVal < 0x0 || indexVal >= stringLength ) {
                    return returnCharacter ? "" : void 0x0; // Return empty string or undefined.
                }

                charCode = stringRef.charCodeAt( indexVal );
                // Handle surrogate pairs for full Unicode characters.
                if ( charCode < 0xD800 || charCode > 0xDBFF || // Not a high surrogate.
                    indexVal + 0x1 === stringLength || // Last character.
                    ( nextCharCode = stringRef.charCodeAt( indexVal + 0x1 ) ) < 0xDC00 || nextCharCode > 0xDFFF ) { // Not a low surrogate.
                    return returnCharacter ? stringRef.charAt( indexVal ) : charCode;
                }
                return returnCharacter ? stringRef.slice( indexVal, indexVal + 0x2 ) : nextCharCode - 0xDC00 + ( charCode - 0xD800 << 0xA ) + 0x10000;
            };
        };

        // Exports utilities for accessing characters and their codes from strings.
        currentModule.unitPayload = {
            codeAt: createCharAccessor( !0x1 ), // Returns character code.
            charAt: createCharAccessor( !0x0 ) // Returns character string.
        };
    },

    /* Program Unit 57: Iterable assertion utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var getIteratorMethod = unitLoader( 0x34 ); /* Get iterator method */

        // Exports a function that asserts a value is iterable and returns its iterator.
        currentModule.unitPayload = function( inputValue ) {
            var iteratorFunction = getIteratorMethod( inputValue );
            if ( typeof iteratorFunction !== "function" ) {
                throw TypeError( String( inputValue ) + " is not iterable" );
            }
            return assertObject( iteratorFunction.call( inputValue ) );
        };
    },

    /* Program Unit 58: Object.prototype.propertyIsEnumerable polyfill */
    function( currentModule, moduleOutputs ) {
        "use strict";
        // Get a reference to the native Object.prototype.propertyIsEnumerable.
        var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
        // Check for a bug where `propertyIsEnumerable` incorrectly returns true for non-enumerable properties.
        var IE_ENUMERABLE_BUG = Object.getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call( {
            0x1: 0x2
        }, 0x1 );

        // Exports a polyfilled `propertyIsEnumerable` function.
        moduleOutputs.f = IE_ENUMERABLE_BUG ?
            function( propertyKey ) {
                var descriptor = Object.getOwnPropertyDescriptor( this, propertyKey );
                return !!descriptor && descriptor.enumerable;
            } :
            nativePropertyIsEnumerable;
    },

    /* Program Unit 59: Shared keys utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var sharedDataStore = unitLoader( 0x26 ); /* Get shared data store */
        var generateUniqueId = unitLoader( 0x2D ); /* Generate a unique ID */
        var sharedKeyCache = sharedDataStore( "keys" );

        // Exports a function that returns a unique key for a given string, caching it globally.
        currentModule.unitPayload = function( keyName ) {
            return sharedKeyCache[keyName] || ( sharedKeyCache[keyName] = generateUniqueId( keyName ) );
        };
    },

    /* Program Unit 60: Array.prototype.includes and indexOf polyfills */
    function( currentModule, moduleOutputs, unitLoader ) {
        var toIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var calculateIndex = unitLoader( 0x3D ); /* Calculate a valid index */

        // Helper function factory for `includes` and `indexOf`.
        var createSearchMethod = function( isIncludes ) {
            return function( collection, searchElement, startIndex ) {
                var currentCollection = toIndexedObject( collection );
                var collectionLength = normalizeLength( currentCollection.length );
                var startingIndex = calculateIndex( startIndex, collectionLength );
                var currentElement;

                // If `isIncludes` is true and `searchElement` is NaN, check for NaN values.
                if ( isIncludes && searchElement !== searchElement ) {
                    while ( collectionLength > startingIndex ) {
                        currentElement = currentCollection[startingIndex++];
                        if ( currentElement !== currentElement ) return !0x0;
                    }
                } else {
                    // Otherwise, perform standard equality check.
                    for ( ; collectionLength > startingIndex; startingIndex++ ) {
                        if ( ( isIncludes || startingIndex in currentCollection ) && currentCollection[startingIndex] === searchElement ) {
                            return isIncludes || startingIndex; // Return true for includes, index for indexOf.
                        }
                    }
                }
                return !isIncludes && -0x1; // Return false for includes, -1 for indexOf.
            };
        };

        // Exports `includes` and `indexOf` methods.
        currentModule.unitPayload = {
            includes: createSearchMethod( !0x0 ),
            indexOf: createSearchMethod( !0x1 )
        };
    },

    /* Program Unit 61: Index calculation utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertToInteger = unitLoader( 0x18 ); /* Convert value to integer */
        var mathMax = Math.max;
        var mathMin = Math.min;

        // Exports a function to calculate a valid index within a given length, handling negative indices.
        currentModule.unitPayload = function( indexValue, lengthValue ) {
            var intIndex = convertToInteger( indexValue );
            return intIndex < 0x0 ? mathMax( intIndex + lengthValue, 0x0 ) : mathMin( intIndex, lengthValue );
        };
    },

    /* Program Unit 62: Feature forcing check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        // Regular expressions to match common patterns in feature paths.
        var featurePathRegex = /#|\.prototype\./;

        // Helper function to normalize a feature path string.
        var normalizeFeaturePath = function( featurePath ) {
            return String( featurePath ).replace( featurePathRegex, "." ).toLowerCase();
        };

        // Main function to determine if a feature polyfill should be forced.
        var shouldForceFeature = function( featurePath, forcedFlag ) {
            var resolvedStatus = featureStatusMap[normalizeFeaturePath( featurePath )];
            return resolvedStatus == FeatureStatus.POLYFILL || ( resolvedStatus != FeatureStatus.NATIVE && ( typeof forcedFlag === "function" ? testForError( forcedFlag ) : !!forcedFlag ) );
        };

        // Internal map to store feature statuses.
        var featureStatusMap = shouldForceFeature.normalize = normalizeFeaturePath;
        var FeatureStatus = shouldForceFeature.featureData = {};
        FeatureStatus.NATIVE = "N"; // Native implementation available.
        FeatureStatus.POLYFILL = "P"; // Polyfill is being applied.

        // Exports the feature forcing check utility.
        currentModule.unitPayload = shouldForceFeature;
    },

    /* Program Unit 63: Object.keys polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getPropertyNames = unitLoader( 0x65 ); /* Get property names utility (n(101)) */
        var excludedProperties = unitLoader( 0x51 ); /* List of excluded properties (n(82)) */

        // Exports Object.keys or a polyfill that filters out excluded properties.
        currentModule.unitPayload = Object.keys || function( targetObject ) {
            return getPropertyNames( targetObject, excludedProperties );
        };
    },

    /* Program Unit 64: Iterable constructor species check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var iteratorSymbol = wellKnownSymbol( "iterator" );
        var isIteratorBroken = !0x1; // Flag indicating if iterator implementation is broken.

        try {
            var iteratorCounter = 0x0;
            var testIterable = {
                next: function() {
                    return {
                        done: !!iteratorCounter++
                    };
                },
                return: function() {
                    isIteratorBroken = !0x0;
                }
            };
            testIterable[iteratorSymbol] = function() {
                return this;
            };
            Array.from( testIterable, function() {
                throw 0x2;
            } );
        } catch ( error ) {
            // Catch and ignore the thrown error from the test.
        }

        // Exports a function to check if an iterable constructor correctly handles species.
        currentModule.unitPayload = function( constructorTest, shouldPreserveBroken ) {
            if ( !shouldPreserveBroken && !isIteratorBroken ) {
                return !0x1; // If not preserving and iterator is not broken, return false.
            }
            var testFlag = !0x1;
            try {
                var testObject = {};
                testObject[iteratorSymbol] = function() {
                    return {
                        next: function() {
                            return {
                                done: testFlag = !0x0
                            };
                        }
                    };
                };
                constructorTest( testObject );
            } catch ( error ) {
                // Ignore errors.
            }
            return testFlag;
        };
    },

    /* Program Unit 65: Collection (Map/Set) polyfill factory */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var applyPolyfillConfig = unitLoader( 0x0 ); /* Apply polyfill configurations */
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var checkFeatureForce = unitLoader( 0x3E ); /* Check if a feature polyfill should be forced */
        var defineTargetMethod = unitLoader( 0x17 ); /* Define methods on target objects */
        var internalCollectionUtils = unitLoader( 0x70 ); /* Internal collection utilities (n(114)) */
        var applyIteration = unitLoader( 0x3 ); /* Apply iteration over collections */
        var validateInstance = unitLoader( 0x24 ); /* Assert value is an instance of a constructor */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var checkIterableConstructor = unitLoader( 0x40 ); /* Check iterable constructor species */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag property */
        var setPrototype = unitLoader( 0x6F ); /* Set prototype utility (n(113)) */

        // Exports a factory function for creating polyfills for Map and Set.
        currentModule.unitPayload = function( collectionName, constructorWrapper, internalUtils, isKeyedCollection, isWeakCollection ) {
            var GlobalCollection = globalObject[collectionName];
            var CollectionImpl = GlobalCollection;
            var CollectionPrototype = GlobalCollection && GlobalCollection.prototype;
            var addMethodName = isKeyedCollection ? "set" : "add";
            var collectionProps = {};

            // Helper function to wrap collection methods, handling special cases like -0.
            var wrapCollectionMethod = function( methodName ) {
                var originalMethod = CollectionPrototype[methodName];
                defineTargetMethod( CollectionPrototype, methodName,
                    methodName === "add" ? function( value ) {
                        return originalMethod.call( this, value === 0x0 ? 0x0 : value );
                    } :
                    methodName === "delete" ? function( value ) {
                        return !( isWeakCollection && !isAnObject( value ) ) && originalMethod.call( this, value === 0x0 ? 0x0 : value );
                    } :
                    methodName === "get" ? function( value ) {
                        return ( isWeakCollection && !isAnObject( value ) ) ? void 0x0 : originalMethod.call( this, value === 0x0 ? 0x0 : value );
                    } :
                    methodName === "has" ? function( value ) {
                        return !( isWeakCollection && !isAnObject( value ) ) && originalMethod.call( this, value === 0x0 ? 0x0 : value );
                    } :
                    function( value, key ) {
                        return originalMethod.call( this, value === 0x0 ? 0x0 : value, key );
                    }
                );
            };

            /*
             * If native implementation is missing or buggy, create a custom constructor.
             */
            if ( checkFeatureForce( collectionName, typeof GlobalCollection !== "function" || !( isWeakCollection || CollectionPrototype.forEach && !testForError( function() {
                        ( new GlobalCollection() ).entries().next();
                    } ) ) ) ) {
                CollectionImpl = internalUtils.getConstructor( constructorWrapper, collectionName, isKeyedCollection, addMethodName );
                internalCollectionUtils.REQUIRED = !0x0;
            } else if ( checkFeatureForce( collectionName, !0x0 ) ) {
                var testInstance = new CollectionImpl();
                var testMethodEffect = testInstance[addMethodName]( isWeakCollection ? {} : -0x0, 0x1 ) !== testInstance;
                var testHasMethod = testForError( function() {
                    testInstance.has( 0x1 );
                } );
                var testConstructorSpecies = checkIterableConstructor( function( iterable ) {
                    new GlobalCollection( iterable );
                } );
                var testNegativeZero = !isWeakCollection && testForError( function() {
                    for ( var i = 0x5; i--; ) testInstance[addMethodName]( i, i );
                    return !testInstance.has( -0x0 );
                } );

                // If constructor species or negative zero handling is broken, fix it.
                if ( !testConstructorSpecies || ( ( CollectionImpl = constructorWrapper( function( instanceRef, iterable ) {
                            validateInstance( instanceRef, CollectionImpl, collectionName );
                            var newInstance = setPrototype( new GlobalCollection(), instanceRef, CollectionImpl );
                            if ( iterable != void 0x0 ) {
                                applyIteration( iterable, newInstance[addMethodName], newInstance, isKeyedCollection );
                            }
                            return newInstance;
                        } ) ).prototype = CollectionPrototype, CollectionPrototype.constructor = CollectionImpl ),
                    ( testHasMethod || testNegativeZero ) && ( wrapCollectionMethod( "delete" ), wrapCollectionMethod( "has" ), isKeyedCollection && wrapCollectionMethod( "get" ) ),
                    ( testNegativeZero || testMethodEffect ) && wrapCollectionMethod( addMethodName ),
                    isWeakCollection && CollectionPrototype.clear && delete CollectionPrototype.clear
                );
            }

            // Assign the final collection implementation to the properties object.
            collectionProps[collectionName] = CollectionImpl;

            // Apply polyfill configuration.
            applyPolyfillConfig( {
                global: !0x0,
                forced: CollectionImpl !== GlobalCollection
            }, collectionProps );

            // Set @@toStringTag for the collection.
            setToStringTag( CollectionImpl, collectionName );

            // If not a weak collection, set up strong model (internal state management).
            if ( !isWeakCollection ) {
                internalUtils.setStrong( CollectionImpl, collectionName, isKeyedCollection );
            }
            return CollectionImpl;
        };
    },

    /* Program Unit 66: Internal state management for WeakMap/WeakSet */
    function( currentModule, moduleOutputs, unitLoader ) {
        var internalMapFallback = unitLoader( 0x2E ); /* Fallback map for non-WeakMap environments */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var defineObjectProperty = unitLoader( 0xB ).f; /* Define an object property */
        var generateUniqueId = unitLoader( 0x2D ); /* Generate a unique ID */
        var internalStateId = unitLoader( 0x70 ); /* Internal state ID (n(112)) */
        var objectIsExtensible = Object.isExtensible || function() {
            return !0x0;
        };

        // Helper to assign an internal ID for non-extensible objects.
        var assignInternalId = function( targetObject ) {
            defineObjectProperty( targetObject, internalStateId, {
                value: {
                    objectID: "O" + ++internalIdCounter,
                    weakData: {}
                }
            } );
        };

        var internalIdCounter = 0x0;

        // Exports utilities for managing internal data for weak collections.
        moduleOutputs.f = {
            REQUIRED: !0x1, // Flag indicating if polyfill is required.
            fastKey: function( targetObject, createIfMissing ) {
                if ( !isAnObject( targetObject ) ) {
                    return typeof targetObject === "symbol" ? targetObject : ( typeof targetObject === "string" ? "S" : "P" ) + targetObject;
                }
                if ( !objectHasOwn( targetObject, internalStateId ) ) {
                    if ( !objectIsExtensible( targetObject ) ) return "F"; // Frozen object, cannot add ID.
                    if ( !createIfMissing ) return "E"; // Don't create ID if not requested.
                    assignInternalId( targetObject );
                }
                return targetObject[internalStateId].objectID;
            },
            getWeakData: function( targetObject, createIfMissing ) {
                if ( !objectHasOwn( targetObject, internalStateId ) ) {
                    if ( !objectIsExtensible( targetObject ) ) return !0x0; // Frozen object, treated as global WeakMap.
                    if ( !createIfMissing ) return !0x1; // Don't create ID if not requested.
                    assignInternalId( targetObject );
                }
                return targetObject[internalStateId].weakData;
            },
            onFreeze: function( targetObject ) {
                return internalStateId && moduleOutputs.f.REQUIRED && objectIsExtensible( targetObject ) && !objectHasOwn( targetObject, internalStateId ) && assignInternalId( targetObject ), targetObject;
            }
        };

        internalMapFallback[internalStateId] = !0x0; // Mark internal state ID as handled.
    },

    /* Program Unit 67: __defineGetter__ and __defineSetter__ polyfills */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var isPureEnvironment = unitLoader( 0x2 ); /* Check if environment is pure */
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */

        // Exports a boolean indicating if `__defineSetter__` (and `__defineGetter__`) are supported natively.
        currentModule.unitPayload = isPureEnvironment || !testForError( function() {
            var testValue = Math.random();
            __defineSetter__.call( void 0x0, testValue, function() {} );
            delete globalObject[testValue];
        } );
    },

    /* Program Unit 68: Safe call utility */
    function( currentModule, moduleOutputs ) {
        // Exports a function that executes an operation within a try-catch block and returns its outcome.
        currentModule.unitPayload = function( operationFunction ) {
            try {
                return {
                    error: !0x1,
                    value: operationFunction()
                };
            } catch ( caughtError ) {
                return {
                    error: !0x0,
                    value: caughtError
                };
            }
        };
    },

    /* Program Unit 69: RegExp object check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var matchSymbol = wellKnownSymbol( "match" );

        // Exports a function to determine if a value is a RegExp object.
        currentModule.unitPayload = function( inputValue ) {
            var matchMethod;
            return isAnObject( inputValue ) && ( void 0x0 !== ( matchMethod = inputValue[matchSymbol] ) ? !!matchMethod : "RegExp" === getClassTag( inputValue ) );
        };
    },

    /* Program Unit 70: String method polyfill factory (for RegExp interaction) */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var writeProperty = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var defineTargetMethod = unitLoader( 0x17 ); /* Define methods on target objects */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var regexExecMethod = unitLoader( 0x5C ); /* RegExp.prototype.exec polyfill (n(92)) */
        var speciesSymbol = wellKnownSymbol( "species" );

        // Check for RegExp.prototype.replace bug with groups.
        var replaceGroupsBug = !testForError( function() {
            var regex = /./;
            regex.exec = function() {
                var groups = [];
                groups.groups = {
                    a: "7"
                };
                return groups;
            };
            return "7" !== "".replace( regex, "$<a>" );
        } );

        // Check for String.prototype.split bug with empty regex.
        var splitEmptyRegexBug = !testForError( function() {
            var regex = /(?:)/;
            var originalExec = regex.exec;
            regex.exec = function() {
                return originalExec.apply( this, arguments );
            };
            var splitResult = "ab".split( regex );
            return 0x2 !== splitResult.length || "a" !== splitResult[0] || "b" !== splitResult[0x1];
        } );

        // Exports a factory function to polyfill String methods that interact with RegExp.
        currentModule.unitPayload = function( stringMethodName, argCount, implementationFunc, forceOverride ) {
            var symbolKey = wellKnownSymbol( stringMethodName );
            var nativeMethodExists = !testForError( function() {
                var testObj = {};
                testObj[symbolKey] = function() {
                    return 0x7;
                };
                return 0x7 !== "" [stringMethodName]( testObj );
            } );
            var polyfillRequired = nativeMethodExists && !testForError( function() {
                var regex = /a/;
                regex.exec = function() {
                    var flag = !0x0;
                    return flag = !0x1, void 0x0;
                }; // This seems to be a test for side effects of exec.
                if ( stringMethodName === "split" ) {
                    regex.constructor = {};
                    regex.constructor[speciesSymbol] = function() {
                        return regex;
                    };
                }
                return regex[symbolKey]( "" ), flag;
            } );

            // If polyfill is required, apply the custom implementation.
            if ( !nativeMethodExists || !polyfillRequired || ( stringMethodName === "replace" && !replaceGroupsBug ) || ( stringMethodName === "split" && !splitEmptyRegexBug ) ) {
                var defaultMethod = /./[symbolKey]; // Native method.
                var customImplementation = implementationFunc( symbolKey, "" [stringMethodName], function( stringRef, regexRef, stringValue, valueIndex, originalCall ) {
                    // Check if regexRef.exec is the polyfilled one, if so, use the default.
                    return regexRef.exec === regexExecMethod ?
                        nativeMethodExists && !originalCall ?
                        {
                            done: !0x0,
                            value: defaultMethod.call( regexRef, stringValue, valueIndex )
                        } : {
                            done: !0x0,
                            value: stringRef.call( stringValue, regexRef, valueIndex )
                        } : {
                            done: !0x1
                        };
                } );
                var customMethod = customImplementation[0x0];
                var customHandler = customImplementation[0x1];

                defineTargetMethod( String.prototype, stringMethodName, customMethod );
                defineTargetMethod( RegExp.prototype, symbolKey,
                    argCount === 0x2 ? function( stringValue, replaceValue ) {
                        return customHandler.call( stringValue, this, replaceValue );
                    } : function( stringValue ) {
                        return customHandler.call( stringValue, this );
                    }
                );
                if ( forceOverride ) {
                    writeProperty( RegExp.prototype[symbolKey], "sham", !0x0 );
                }
            }
        };
    },

    /* Program Unit 71: String character index adjustment */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var stringCharAccessor = unitLoader( 0x38 ).charAt; /* Get string charAt utility */

        // Exports a function to adjust a string index based on character length (for Unicode).
        currentModule.unitPayload = function( inputString, indexValue, isUnicode ) {
            return indexValue + ( isUnicode ? stringCharAccessor( inputString, indexValue ).length : 0x1 );
        };
    },

    /* Program Unit 72: RegExp.prototype.exec polyfill (internal) */
    function( currentModule, moduleOutputs, unitLoader ) {
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var regexExecMethod = unitLoader( 0x5C ); /* RegExp.prototype.exec polyfill (n(92)) */

        // Exports an internal function to execute a RegExp against a string.
        currentModule.unitPayload = function( regexInstance, targetString ) {
            var nativeExec = regexInstance.exec;
            if ( typeof nativeExec === "function" ) {
                var result = nativeExec.call( regexInstance, targetString );
                if ( typeof result !== "object" ) {
                    throw TypeError( "RegExp exec method returned something other than an Object or null" );
                }
                return result;
            }
            if ( "RegExp" !== getClassTag( regexInstance ) ) {
                throw TypeError( "RegExp#exec called on incompatible receiver" );
            }
            return regexExecMethod.call( regexInstance, targetString );
        };
    },

    /* Program Unit 73: String trim utilities */
    function( currentModule, moduleOutputs, unitLoader ) {
        var ensureNotNull = unitLoader( 0x11 ); /* Ensure value is not null/undefined */
        // Characters considered whitespace for trimming.
        var whitespaceChars = "[" + unitLoader( 0x5D ) + "]"; /* n(93) is whitespace string */
        var leadingWhitespaceRegex = RegExp( "^" + whitespaceChars + whitespaceChars + "*" );
        var trailingWhitespaceRegex = RegExp( whitespaceChars + whitespaceChars + "*$" );

        // Helper function factory for trimming leading, trailing, or both.
        var createTrimMethod = function( trimFlags ) {
            return function( inputString ) {
                var stringRef = String( ensureNotNull( inputString ) );
                if ( trimFlags & 0x1 ) {
                    stringRef = stringRef.replace( leadingWhitespaceRegex, "" );
                }
                if ( trimFlags & 0x2 ) {
                    stringRef = stringRef.replace( trailingWhitespaceRegex, "" );
                }
                return stringRef;
            };
        };

        // Exports utilities for trimming strings.
        currentModule.unitPayload = {
            start: createTrimMethod( 0x1 ), // Trim leading whitespace.
            end: createTrimMethod( 0x2 ), // Trim trailing whitespace.
            trim: createTrimMethod( 0x3 ) // Trim both.
        };
    },

    /* Program Unit 74: Collection.prototype.deleteAll polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var assertFunction = unitLoader( 0x4 ); /* Assert input is a function */

        // Exports a function to delete multiple entries from a collection (Map/Set).
        currentModule.unitPayload = function() {
            var collectionInstance = assertObject( this );
            var deleteMethod = assertFunction( collectionInstance["delete"] );
            var allDeleted = !0x0;
            var currentArgIndex = 0x0;
            var totalArgs = arguments.length;

            while ( currentArgIndex < totalArgs ) {
                allDeleted = allDeleted && deleteMethod.call( collectionInstance, arguments[currentArgIndex++] );
            }
            return !!allDeleted;
        };
    },

    /* Program Unit 75: Collection.from polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var assertFunction = unitLoader( 0x4 ); /* Assert input is a function */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var applyIteration = unitLoader( 0x3 ); /* Apply iteration over collections */

        // Exports a function to create a new collection from an iterable, similar to Array.from.
        currentModule.unitPayload = function( iterableSource ) {
            var collectionConstructor = assertFunction( this );
            var argumentsLength = arguments.length;
            var mapFunction = argumentsLength > 0x1 ? arguments[0x1] : void 0x0;
            var mappedValues = [];
            var elementIndex = 0x0;

            // If iterableSource is null or undefined, return an empty instance.
            if ( iterableSource == void 0x0 ) {
                return new collectionConstructor();
            }

            // If a map function is provided, bind it.
            if ( void 0x0 !== mapFunction ) {
                assertFunction( mapFunction );
                applyIteration( iterableSource, function( element ) {
                    mappedValues.push( mapFunction( element, elementIndex++ ) );
                }, void 0x0, !0x0 ); // Use mapFunction with element and index.
            } else {
                applyIteration( iterableSource, mappedValues.push, mappedValues, !0x0 ); // Push elements directly.
            }

            // Create a new instance with the collected values.
            return new collectionConstructor( mappedValues );
        };
    },

    /* Program Unit 76: Collection.of polyfill */
    function( currentModule, moduleOutputs ) {
        "use strict";
        // Exports a function to create a new collection instance from a variable number of arguments.
        currentModule.unitPayload = function() {
            var argumentCount = arguments.length;
            var newArray = new Array( argumentCount );
            while ( argumentCount-- ) {
                newArray[argumentCount] = arguments[argumentCount];
            }
            return new this( newArray );
        };
    },

    /* Program Unit 77: String conversion to indexed object */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var stringSplitMethod = "".split;

        // Exports a function that converts a value to an indexed object, handling strings.
        currentModule.unitPayload = testForError( function() {
            return !Object( "z" ).propertyIsEnumerable( 0x0 );
        } ) ? function( inputValue ) {
            return "String" === getClassTag( inputValue ) ? stringSplitMethod.call( inputValue, "" ) : Object( inputValue );
        } : Object;
    },

    /* Program Unit 78: HTML element creator */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var documentReference = globalObject.document;
        var createElementAvailable = isAnObject( documentReference ) && isAnObject( documentReference.createElement );

        // Exports a function that creates an HTML element if in a browser environment.
        currentModule.unitPayload = function( tagName ) {
            return createElementAvailable ? documentReference.createElement( tagName ) : {};
        };
    },

    /* Program Unit 79: Global value registration */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */

        // Exports a function to safely register a value on the global object.
        currentModule.unitPayload = function( propertyName, propertyValue ) {
            try {
                defineNonEnumerable( globalObject, propertyName, propertyValue );
            } catch ( error ) {
                globalObject[propertyName] = propertyValue;
            }
            return propertyValue;
        };
    },

    /* Program Unit 80: Own property keys retriever */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalPropertyAccessor = unitLoader( 0xC ); /* Global property accessor */
        var getOwnPropertyNames = unitLoader( 0x27 ); /* Get own property names utility */
        var getOwnPropertySymbols = unitLoader( 0x53 ); /* Get own property symbols utility */
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */

        // Exports a function to retrieve all own property keys (strings and symbols) of an object.
        currentModule.unitPayload = globalPropertyAccessor( "Reflect", "ownKeys" ) || function( targetObject ) {
            var stringKeys = getOwnPropertyNames.f( assertObject( targetObject ) );
            var symbolKeys = getOwnPropertySymbols.f;
            return symbolKeys ? stringKeys.concat( symbolKeys( targetObject ) ) : stringKeys;
        };
    },

    /* Program Unit 81: Global symbol registry */
    function( currentModule, moduleOutputs ) {
        // Exports the global object itself, often used for accessing global symbols or polyfills.
        currentModule.unitPayload = global;
    },

    /* Program Unit 82: Excluded object property names */
    function( currentModule, moduleOutputs ) {
        // Exports an array of property names that are typically excluded or handled specially.
        currentModule.unitPayload = [
            "constructor",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "toLocaleString",
            "toString",
            "valueOf"
        ];
    },

    /* Program Unit 83: Object.getOwnPropertySymbols polyfill */
    function( currentModule, moduleOutputs ) {
        // Exports the native Object.getOwnPropertySymbols function.
        moduleOutputs.f = Object.getOwnPropertySymbols;
    },

    /* Program Unit 84: Array iterator method checker */
    function( currentModule, moduleOutputs, unitLoader ) {
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var iteratorSymbol = wellKnownSymbol( "iterator" );
        var ArrayPrototype = Array.prototype;

        // Exports a function to check if a value has an array-like iterator.
        currentModule.unitPayload = function( inputValue ) {
            return void 0x0 !== inputValue && ( unitLoader( 0x33 ).Array === inputValue || ArrayPrototype[iteratorSymbol] === inputValue );
        };
    },

    /* Program Unit 85: Array method species check */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */

        // Exports a function to check if a native Array method works correctly with its 'this' context.
        currentModule.unitPayload = function( methodName, checkCallback ) {
            var nativeMethod = [] [methodName];
            return !nativeMethod || !testForError( function() {
                nativeMethod.call( void 0x0, checkCallback || function() {
                    throw 0x1;
                }, 0x1 );
            } );
        };
    },

    /* Program Unit 86: URLSearchParams polyfill and utilities */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var applyPolyfillConfig = unitLoader( 0x0 ); /* Apply polyfill configurations */
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var urlCheck = unitLoader( 0x7A ); /* Check for URL API support (n(130)) */
        var defineTargetMethod = unitLoader( 0x17 ); /* Define methods on target objects */
        var batchDefineMethods = unitLoader( 0x24 ); /* Batch define methods (n(36)) */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag property */
        var objectInternalState = unitLoader( 0x12 ); /* Internal state manager */
        var validateInstance = unitLoader( 0x24 ); /* Assert value is an instance of a constructor */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var getMapIterator = unitLoader( 0x1B ); /* Get Map entries iterator (n(27)) */
        var getIteratorMethod = unitLoader( 0x34 ); /* Get iterator method */
        var getState = objectInternalState.get;
        var setState = objectInternalState.set;
        var getIteratorState = objectInternalState.getterFor( "URLSearchParams" );
        var getParamIteratorState = objectInternalState.getterFor( "URLSearchParamsIterator" );
        var plusSignRegex = /\+/g;
        var percentEncodedGroups = Array( 0x4 );

        // Helper to generate regex for percent-encoded groups.
        var getPercentEncodedRegex = function( count ) {
            return percentEncodedGroups[count - 0x1] || ( percentEncodedGroups[count - 0x1] = RegExp( "((?:%[\\da-f]{2}){" + count + "})", "gi" ) );
        };

        // Helper to safely decodeURIComponent.
        var safeDecodeURIComponent = function( encodedString ) {
            try {
                return decodeURIComponent( encodedString );
            } catch ( error ) {
                return encodedString;
            }
        };

        // Helper to decode URL parameter values, handling plus signs and percent encoding.
        var decodeURLParam = function( encodedString ) {
            var decoded = encodedString.replace( plusSignRegex, " " );
            var currentCount = 0x4;
            try {
                return decodeURIComponent( decoded );
            } catch ( error ) {
                // Fallback for malformed percent-encoding.
                while ( currentCount-- ) {
                    decoded = decoded.replace( getPercentEncodedRegex( currentCount ), safeDecodeURIComponent );
                }
                return decoded;
            }
        };

        // Characters to be percent-encoded in URLSearchParams.
        var specialCharsRegex = /[!'()~]|%20/g;
        var charEncodingMap = {
            "!": "%21",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "~": "%7E",
            "%20": "+"
        };

        // Helper to encode URL parameter values.
        var encodeURLParam = function( decodedString ) {
            return encodeURIComponent( decodedString ).replace( specialCharsRegex, function( char ) {
                return charEncodingMap[char];
            } );
        };

        // Helper to parse a query string into key-value pairs.
        var parseQueryString = function( entriesArray, queryString ) {
            if ( queryString ) {
                for ( var params = queryString.split( "&" ), i = 0x0; i < params.length; ) {
                    var param = params[i++];
                    if ( param.length ) {
                        var keyValue = param.split( "=" );
                        entriesArray.push( {
                            key: decodeURLParam( keyValue.shift() ),
                            value: decodeURLParam( keyValue.join( "=" ) )
                        } );
                    }
                }
            }
        };

        // Helper to update the internal search params state from a query string.
        var updateSearchParamsState = function( internalParams, queryString ) {
            internalParams.entries.length = 0x0; // Clear existing entries.
            parseQueryString( internalParams.entries, queryString );
        };

        // Helper to assert minimum argument count.
        var assertArgumentCount = function( actual, expected ) {
            if ( actual < expected ) {
                throw TypeError( "Not enough arguments" );
            }
        };

        // URLSearchParams iterator implementation.
        var URLSearchParamsIterator = unitLoader( 0x36 )( function( instanceRef, iteratorKind ) {
            setState( instanceRef, {
                type: "URLSearchParamsIterator",
                iterator: getMapIterator( getIteratorState( instanceRef ).entries ),
                kind: iteratorKind
            } );
        }, "Iterator", function() {
            var iteratorState = getParamIteratorState( this );
            var iteratorKind = iteratorState.kind;
            var nextResult = iteratorState.iterator.next();
            var entry = nextResult.value;

            if ( !nextResult.done ) {
                nextResult.value = iteratorKind === "keys" ? entry.key :
                    iteratorKind === "values" ? entry.value :
                    [entry.key, entry.value];
            }
            return nextResult;
        } );

        // URLSearchParams constructor implementation.
        var URLSearchParamsConstructor = function URLSearchParams( initialValue ) {
            validateInstance( this, URLSearchParamsConstructor, "URLSearchParams" );
            var entriesList = [];
            var internalState = setState( this, {
                type: "URLSearchParams",
                entries: entriesList,
                updateURL: function() {}, // Placeholder, will be set by URL constructor.
                updateSearchParams: updateSearchParamsState
            } );

            if ( void 0x0 !== initialValue ) {
                if ( isAnObject( initialValue ) ) {
                    // Handle iterable (e.g., Array of arrays) or plain object.
                    if ( typeof ( getIteratorMethod( initialValue ) ) === "function" ) {
                        for ( var iter = getIteratorMethod( initialValue ).call( initialValue ); !( item = iter.next() ).done; ) {
                            var pairIterator = getMapIterator( assertObject( item.value ) );
                            var keyPart = pairIterator.next();
                            var valuePart = pairIterator.next();
                            if ( keyPart.done || valuePart.done || !pairIterator.next().done ) {
                                throw TypeError( "Expected sequence with length 2" );
                            }
                            entriesList.push( {
                                key: String( keyPart.value ),
                                value: String( valuePart.value )
                            } );
                        }
                    } else {
                        for ( var prop in initialValue ) {
                            if ( objectHasOwn( initialValue, prop ) ) {
                                entriesList.push( {
                                    key: prop,
                                    value: String( initialValue[prop] )
                                } );
                            }
                        }
                    }
                } else {
                    // Handle string input.
                    parseQueryString( entriesList, typeof initialValue === "string" ? ( initialValue.charAt( 0x0 ) === "?" ? initialValue.slice( 0x1 ) : initialValue ) : String( initialValue ) );
                }
            }
        };

        var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

        // Batch define methods on URLSearchParams prototype.
        batchDefineMethods( URLSearchParamsPrototype, {
            append: function( name, value ) {
                assertArgumentCount( arguments.length, 0x2 );
                var paramsState = getIteratorState( this );
                paramsState.entries.push( {
                    key: String( name ),
                    value: String( value )
                } );
                paramsState.updateURL();
            },
            "delete": function( name ) {
                assertArgumentCount( arguments.length, 0x1 );
                var paramsState = getIteratorState( this );
                var entries = paramsState.entries;
                var keyToDelete = String( name );
                for ( var i = 0x0; i < entries.length; ) {
                    if ( entries[i].key === keyToDelete ) {
                        entries.splice( i, 0x1 );
                    } else {
                        i++;
                    }
                }
                paramsState.updateURL();
            },
            get: function( name ) {
                assertArgumentCount( arguments.length, 0x1 );
                var entries = getIteratorState( this ).entries;
                var keyToFind = String( name );
                for ( var i = 0x0; i < entries.length; i++ ) {
                    if ( entries[i].key === keyToFind ) {
                        return entries[i].value;
                    }
                }
                return void 0x0; // null is represented as void 0x0.
            },
            getAll: function( name ) {
                assertArgumentCount( arguments.length, 0x1 );
                var entries = getIteratorState( this ).entries;
                var keyToFind = String( name );
                var result = [];
                for ( var i = 0x0; i < entries.length; i++ ) {
                    if ( entries[i].key === keyToFind ) {
                        result.push( entries[i].value );
                    }
                }
                return result;
            },
            has: function( name ) {
                assertArgumentCount( arguments.length, 0x1 );
                var entries = getIteratorState( this ).entries;
                var keyToFind = String( name );
                for ( var i = 0x0; i < entries.length; ) {
                    if ( entries[i++].key === keyToFind ) {
                        return !0x0;
                    }
                }
                return !0x1;
            },
            set: function( name, value ) {
                assertArgumentCount( arguments.length, 0x1 );
                var paramsState = getIteratorState( this );
                var entries = paramsState.entries;
                var isFound = !0x1;
                var keyToSet = String( name );
                var valueToSet = String( value );
                for ( var i = 0x0; i < entries.length; i++ ) {
                    var entry = entries[i];
                    if ( entry.key === keyToSet ) {
                        if ( isFound ) {
                            entries.splice( i--, 0x1 );
                        } else {
                            isFound = !0x0;
                            entry.value = valueToSet;
                        }
                    }
                }
                if ( !isFound ) {
                    entries.push( {
                        key: keyToSet,
                        value: valueToSet
                    } );
                }
                paramsState.updateURL();
            },
            sort: function() {
                var currentEntry, sortIndex, paramsState = getIteratorState( this );
                var entries = paramsState.entries;
                var sortedEntries = entries.slice();
                entries.length = 0x0; // Clear original array.

                for ( sortIndex = 0x0; sortIndex < sortedEntries.length; sortIndex++ ) {
                    currentEntry = sortedEntries[sortIndex];
                    for ( var insertIndex = 0x0; insertIndex < sortIndex; insertIndex++ ) {
                        if ( entries[insertIndex].key > currentEntry.key ) {
                            entries.splice( insertIndex, 0x0, currentEntry );
                            break;
                        }
                    }
                    if ( insertIndex === sortIndex ) {
                        entries.push( currentEntry );
                    }
                }
                paramsState.updateURL();
            },
            forEach: function( callback ) {
                var currentEntry, entries = getIteratorState( this ).entries;
                var boundCallback = bindFunction( callback, arguments.length > 0x1 ? arguments[0x1] : void 0x0, 0x3 );
                for ( var i = 0x0; i < entries.length; ) {
                    currentEntry = entries[i++];
                    boundCallback( currentEntry.value, currentEntry.key, this );
                }
            },
            keys: function() {
                return new URLSearchParamsIterator( this, "keys" );
            },
            values: function() {
                return new URLSearchParamsIterator( this, "values" );
            },
            entries: function() {
                return new URLSearchParamsIterator( this, "entries" );
            }
        }, {
            enumerable: !0x0
        } );

        // Set @@iterator symbol to entries method.
        defineTargetMethod( URLSearchParamsPrototype, unitLoader( 0x6 )( "iterator" ), URLSearchParamsPrototype.entries );

        // Define toString method.
        defineTargetMethod( URLSearchParamsPrototype, "toString", function() {
            var currentEntry, entries = getIteratorState( this ).entries;
            var encodedParts = [];
            for ( var i = 0x0; i < entries.length; ) {
                currentEntry = entries[i++];
                encodedParts.push( encodeURLParam( currentEntry.key ) + "=" + encodeURLParam( currentEntry.value ) );
            }
            return encodedParts.join( "&" );
        }, {
            enumerable: !0x0
        } );

        // Apply polyfill configuration for URLSearchParams.
        applyPolyfillConfig( {
            global: !0x0,
            forced: !urlCheck
        }, {
            URLSearchParams: URLSearchParamsConstructor
        } );

        // Exports the URLSearchParams constructor and its internal state getter.
        currentModule.unitPayload = {
            URLSearchParams: URLSearchParamsConstructor,
            getState: getIteratorState
        };
    },

    /* Program Unit 87: Array iterator polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var toIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var iteratorRegistry = unitLoader( 0x33 ); /* Iterator registry */
        var objectInternalState = unitLoader( 0x12 ); /* Internal state manager */
        var iteratorPrototypeSetup = unitLoader( 0x36 ); /* Iterator prototype setup (n(54)) */
        var setState = objectInternalState.set;
        var getIteratorState = objectInternalState.getterFor( "Array Iterator" );

        // Exports an Array iterator constructor and sets up Array.prototype iteration methods.
        currentModule.unitPayload = iteratorPrototypeSetup( Array, "Array", function( instanceRef, iteratorKind ) {
            setState( instanceRef, {
                type: "Array Iterator",
                target: toIndexedObject( instanceRef ),
                index: 0x0,
                kind: iteratorKind
            } );
        }, function() {
            var iteratorState = getIteratorState( this );
            var targetArray = iteratorState.target;
            var iteratorKind = iteratorState.kind;
            var currentIndex = iteratorState.index++;

            if ( !targetArray || currentIndex >= normalizeLength( targetArray.length ) ) {
                iteratorState.target = void 0x0; // Clear target to mark as done.
                return {
                    value: void 0x0,
                    done: !0x0
                };
            }

            if ( iteratorKind === "keys" ) {
                return {
                    value: currentIndex,
                    done: !0x1
                };
            }
            if ( iteratorKind === "values" ) {
                return {
                    value: targetArray[currentIndex],
                    done: !0x1
                };
            }
            return {
                value: [currentIndex, targetArray[currentIndex]],
                done: !0x1
            };
        }, "values" );

        iteratorRegistry.Arguments = iteratorRegistry.Array; // Alias Arguments iterator to Array iterator.
        unitLoader( 0x29 )( "keys" ); // Mark 'keys' as unscopable.
        unitLoader( 0x29 )( "values" ); // Mark 'values' as unscopable.
        unitLoader( 0x29 )( "entries" ); // Mark 'entries' as unscopable.
    },

    /* Program Unit 88: Map polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var collectionPolyfillFactory = unitLoader( 0x41 ); /* Collection polyfill factory (n(65)) */
        var internalCollectionUtils = unitLoader( 0x70 ); /* Internal collection utilities (n(114)) */

        // Exports the Map constructor, potentially polyfilled.
        currentModule.unitPayload = collectionPolyfillFactory( "Map", function( instanceRef ) {
            return function() {
                return instanceRef( this, arguments.length ? arguments[0x0] : void 0x0 );
            };
        }, internalCollectionUtils, !0x0 );
    },

    /* Program Unit 89: User agent string accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalPropertyAccessor = unitLoader( 0xC ); /* Global property accessor */

        // Exports the navigator.userAgent string.
        currentModule.unitPayload = globalPropertyAccessor( "navigator", "userAgent" ) || "";
    },

    /* Program Unit 90: RegExp argument validation for string methods */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isRegExpObject = unitLoader( 0x45 ); /* Check if value is a RegExp object */

        // Exports a function that asserts a value is NOT a RegExp object.
        currentModule.unitPayload = function( inputValue ) {
            if ( isRegExpObject( inputValue ) ) {
                throw TypeError( "The method doesn't accept regular expressions" );
            }
            return inputValue;
        };
    },

    /* Program Unit 91: String method compatibility check for RegExp */
    function( currentModule, moduleOutputs, unitLoader ) {
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var matchSymbol = wellKnownSymbol( "match" );

        // Exports a function to check if a String method correctly handles RegExp arguments.
        currentModule.unitPayload = function( methodName ) {
            var testRegex = /./;
            try {
                "/./"[methodName]( testRegex );
            } catch ( error ) {
                try {
                    testRegex[matchSymbol] = !0x1;
                    return "/./"[methodName]( testRegex );
                } catch ( err ) {
                    // Ignore errors, return false.
                }
            }
            return !0x1;
        };
    },

    /* Program Unit 92: RegExp.prototype.exec polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var regexFlagsGetter = unitLoader( 0x3C ); /* Get RegExp flags utility */
        var nativeRegExpExec = RegExp.prototype.exec;
        var stringReplaceMethod = String.prototype.replace;
        var polyfilledRegExpExec = nativeRegExpExec;

        // Test for lastIndex bug in older engines.
        var lastIndexBug = ( function() {
            var regexA = /a/;
            var regexB = /b*/g;
            nativeRegExpExec.call( regexA, "a" );
            nativeRegExpExec.call( regexB, "a" );
            return 0x0 !== regexA.lastIndex || 0x0 !== regexB.lastIndex;
        } )();

        // Test for `undefined` capture groups bug.
        var undefinedCaptureGroupsBug = void 0x0 !== /()??/.exec( "" )[0x1];

        // If bugs are present, provide a polyfilled `exec` method.
        if ( lastIndexBug || undefinedCaptureGroupsBug ) {
            polyfilledRegExpExec = function( inputString ) {
                var regexInstance, matchResult, indexOffset, matchLength, currentRegex = this;

                if ( undefinedCaptureGroupsBug ) {
                    regexInstance = new RegExp( "^" + currentRegex.source + "$(?!\\s)", regexFlagsGetter.call( currentRegex ) );
                }
                if ( lastIndexBug ) {
                    indexOffset = currentRegex.lastIndex;
                }

                matchResult = nativeRegExpExec.call( currentRegex, inputString );

                if ( lastIndexBug && matchResult ) {
                    currentRegex.lastIndex = currentRegex.global ? matchResult.index + matchResult[0x0].length : indexOffset;
                }
                if ( undefinedCaptureGroupsBug && matchResult && matchResult.length > 0x1 ) {
                    stringReplaceMethod.call( matchResult[0x0], regexInstance, function() {
                        for ( var i = 0x1; i < arguments.length - 0x2; i++ ) {
                            if ( void 0x0 === arguments[i] ) {
                                matchResult[i] = void 0x0;
                            }
                        }
                    } );
                }
                return matchResult;
            };
        }

        // Exports the polyfilled or native RegExp.prototype.exec.
        currentModule.unitPayload = polyfilledRegExpExec;
    },

    /* Program Unit 93: Whitespace character definitions */
    function( currentModule, moduleOutputs ) {
        // Exports a string containing various whitespace characters.
        currentModule.unitPayload = "\t\n\v\f\r \u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    },

    /* Program Unit 94: String trim method compatibility check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var whitespaceChars = unitLoader( 0x5D ); /* Whitespace character string */

        // Exports a function to check if a String trim method is buggy or needs polyfill.
        currentModule.unitPayload = function( methodName ) {
            return testForError( function() {
                return !!whitespaceChars[methodName]() || " \u0085\u180E" != " \u0085\u180E" [methodName]() || unitLoader( 0x5D )[methodName].name !== methodName;
            } );
        };
    },

    /* Program Unit 95: Symbol polyfill status */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var checkIterableConstructor = unitLoader( 0x40 ); /* Check iterable constructor species */
        var NATIVE_ARRAY_BUFFER_VIEWS = unitLoader( 0x21 ); /* Check native ArrayBuffer views (n(33)) */
        var ArrayBufferConstructor = globalObject.ArrayBuffer;
        var Int8ArrayConstructor = globalObject.Int8Array;

        // Exports a boolean indicating if the Symbol polyfill is active or required due to bugs.
        currentModule.unitPayload = !NATIVE_ARRAY_BUFFER_VIEWS || !testForError( function() {
            new Int8ArrayConstructor( 0x1 );
        } ) || !testForError( function() {
            new Int8ArrayConstructor( -0x1 );
        } ) || !checkIterableConstructor( function( iterable ) {
            new Int8ArrayConstructor();
            new Int8ArrayConstructor( void 0x0 ); // null is represented as void 0x0.
            new Int8ArrayConstructor( 0x1.5 ); // Float.
            new Int8ArrayConstructor( iterable );
        }, !0x0 ) || testForError( function() {
            return 0x1 !== new Int8ArrayConstructor( new ArrayBufferConstructor( 0x2 ), 0x1, void 0x0 ).length;
        } );
    },

    /* Program Unit 96: WeakMap polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var batchDefineMethods = unitLoader( 0x24 ); /* Batch define methods */
        var internalWeakData = unitLoader( 0x42 ).getWeakData; /* Get weak data utility */
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var validateInstance = unitLoader( 0x24 ); /* Assert value is an instance of a constructor */
        var applyIteration = unitLoader( 0x3 ); /* Apply iteration over collections */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var internalState = unitLoader( 0x12 ); /* Internal state manager */
        var setState = internalState.set;
        var getState = internalState.getterFor;
        var isWeakMapSupported = unitLoader( 0x63 ); /* Check for native WeakMap support */
        var ActiveXObjectPresent = !globalObject.ActiveXObject && "ActiveXObject" in globalObject;
        var objectIsExtensible = Object.isExtensible;

        // Helper function for WeakMap/WeakSet constructors, handling arguments.
        var createWeakCollectionConstructor = function( constructorFunc ) {
            return function() {
                return constructorFunc( this, arguments.length ? arguments[0x0] : void 0x0 );
            };
        };

        // Exports the WeakMap constructor, potentially polyfilled.
        var WeakMapImpl = currentModule.unitPayload = unitLoader( 0x41 )( "WeakMap", createWeakCollectionConstructor, unitLoader( 0x7E ), !0x0, !0x0 ); /* n(126) is the WeakMap/WeakSet internal utils */

        // If WeakMap is supported but ActiveXObject is present (IE bug), patch it.
        if ( isWeakMapSupported && ActiveXObjectPresent ) {
            var WeakMapBugFixConstructor = unitLoader( 0x7E ).getConstructor( createWeakCollectionConstructor, "WeakMap", !0x0 );
            unitLoader( 0x42 ).REQUIRED = !0x0; // Mark internal WeakData utility as required.

            var WeakMapPrototype = WeakMapImpl.prototype;
            var originalDelete = WeakMapPrototype["delete"];
            var originalHas = WeakMapPrototype.has;
            var originalGet = WeakMapPrototype.get;
            var originalSet = WeakMapPrototype.set;

            // Patch WeakMap methods to handle frozen objects in IE.
            batchDefineMethods( WeakMapPrototype, {
                "delete": function( key ) {
                    if ( isAnObject( key ) && !objectIsExtensible( key ) ) {
                        var internal = getState( this );
                        return internal.frozen || ( internal.frozen = new WeakMapBugFixConstructor() ), originalDelete.call( this, key ) || internal.frozen["delete"]( key );
                    }
                    return originalDelete.call( this, key );
                },
                has: function( key ) {
                    if ( isAnObject( key ) && !objectIsExtensible( key ) ) {
                        var internal = getState( this );
                        return internal.frozen || ( internal.frozen = new WeakMapBugFixConstructor() ), originalHas.call( this, key ) || internal.frozen.has( key );
                    }
                    return originalHas.call( this, key );
                },
                get: function( key ) {
                    if ( isAnObject( key ) && !objectIsExtensible( key ) ) {
                        var internal = getState( this );
                        return internal.frozen || ( internal.frozen = new WeakMapBugFixConstructor() ), originalHas.call( this, key ) ? originalGet.call( this, key ) : internal.frozen.get( key );
                    }
                    return originalGet.call( this, key );
                },
                set: function( key, value ) {
                    if ( isAnObject( key ) && !objectIsExtensible( key ) ) {
                        var internal = getState( this );
                        internal.frozen || ( internal.frozen = new WeakMapBugFixConstructor() ), originalHas.call( this, key ) ? originalSet.call( this, key, value ) : internal.frozen.set( key, value );
                    } else {
                        originalSet.call( this, key, value );
                    }
                    return this;
                }
            } );
        }
    },

    /* Program Unit 97: IE defineProperty bug check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var definePropertySupported = unitLoader( 0x9 ); /* Check for defineProperty support */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var createElement = unitLoader( 0x4E ); /* Create an HTML element */

        // Exports a boolean indicating if there's a specific IE bug with defineProperty.
        currentModule.unitPayload = !definePropertySupported && !testForError( function() {
            return 0x7 != Object.defineProperty( createElement( "div" ), "a", {
                get: function() {
                    return 0x7;
                }
            } ).a;
        } );
    },

    /* Program Unit 98: Native Function.prototype.toString */
    function( currentModule, moduleOutputs, unitLoader ) {
        var sharedData = unitLoader( 0x26 ); /* Get shared data store */

        // Exports the native Function.prototype.toString, retrieved from shared data.
        currentModule.unitPayload = sharedData( "native-function-to-string", Function.toString );
    },

    /* Program Unit 99: WeakMap support detection */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var nativeFunctionToString = unitLoader( 0x62 ); /* Native Function.prototype.toString */
        var NativeWeakMap = globalObject.WeakMap;

        // Exports a boolean indicating if native WeakMap is supported and has native code.
        currentModule.unitPayload = typeof NativeWeakMap === "function" && /native code/.test( nativeFunctionToString.call( NativeWeakMap ) );
    },

    /* Program Unit 100: Property copying utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var getOwnPropertyKeys = unitLoader( 0x50 ); /* Get all own property keys (n(80)) */
        var getPropertyDescriptor = unitLoader( 0x16 ); /* Get a property descriptor */
        var defineObjectProperty = unitLoader( 0xB ); /* Define an object property */

        // Exports a function that copies properties from a source object to a target object.
        currentModule.unitPayload = function( targetObject, sourceObject ) {
            for ( var propertyKey, allKeys = getOwnPropertyKeys( sourceObject ), defineProp = defineObjectProperty.f, getDesc = getPropertyDescriptor.f, i = 0x0; i < allKeys.length; i++ ) {
                propertyKey = allKeys[i];
                if ( !objectHasOwn( targetObject, propertyKey ) ) {
                    defineProp( targetObject, propertyKey, getDesc( sourceObject, propertyKey ) );
                }
            }
        };
    },

    /* Program Unit 101: Filtered property names retriever */
    function( currentModule, moduleOutputs, unitLoader ) {
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var toIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var arrayIndexOf = unitLoader( 0x3C ).indexOf; /* Array.prototype.indexOf utility */
        var internalMap = unitLoader( 0x2E ); /* Internal map for special properties */

        // Exports a function to retrieve property names, optionally excluding some.
        currentModule.unitPayload = function( targetObject, excludedKeys ) {
            var currentObject, currentKey, filteredKeys = [],
                idx = 0x0;
            currentObject = toIndexedObject( targetObject );

            // Collect keys that are not in the internal map and are own properties.
            for ( currentKey in currentObject ) {
                if ( !objectHasOwn( internalMap, currentKey ) && objectHasOwn( currentObject, currentKey ) ) {
                    filteredKeys.push( currentKey );
                }
            }

            // Add keys from excludedKeys if they are own properties and not already in filteredKeys.
            while ( excludedKeys.length > idx ) {
                currentKey = excludedKeys[idx++];
                if ( objectHasOwn( currentObject, currentKey ) && !~arrayIndexOf( filteredKeys, currentKey ) ) {
                    filteredKeys.push( currentKey );
                }
            }
            return filteredKeys;
        };
    },

    /* Program Unit 102: Symbol support detection */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */

        // Exports a boolean indicating if native Symbol support is available and functional.
        currentModule.unitPayload = !!Object.getOwnPropertySymbols && !testForError( function() {
            return !String( Symbol() );
        } );
    },

    /* Program Unit 103: Object.defineProperties polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var definePropertySupported = unitLoader( 0x9 ); /* Check for defineProperty support */
        var defineObjectProperty = unitLoader( 0xB ); /* Define an object property */
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var getObjectKeys = unitLoader( 0x3F ); /* Get object keys utility */

        // Exports Object.defineProperties or a polyfill.
        currentModule.unitPayload = definePropertySupported ?
            Object.defineProperties :
            function( targetObject, propertyDescriptors ) {
                assertObject( targetObject );
                for ( var propertyKey, allKeys = getObjectKeys( propertyDescriptors ), i = 0x0; i < allKeys.length; ) {
                    defineObjectProperty.f( targetObject, propertyKey = allKeys[i++], propertyDescriptors[propertyKey] );
                }
                return targetObject;
            };
    },

    /* Program Unit 104: Document.documentElement accessor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalPropertyAccessor = unitLoader( 0xC ); /* Global property accessor */

        // Exports the document.documentElement object.
        currentModule.unitPayload = globalPropertyAccessor( "document", "documentElement" );
    },

    /* Program Unit 105: Well-known Symbol property descriptor */
    function( currentModule, moduleOutputs, unitLoader ) {
        var obtainWellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */

        // Exports a function to create a property descriptor for a well-known Symbol.
        moduleOutputs.f = obtainWellKnownSymbol;
    },

    /* Program Unit 106: Array.prototype.flat / flatMap internal utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var isArray = unitLoader( 0x2F ); /* Check if value is an array */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */

        // Recursive helper for flattening arrays.
        var flattenArrayRecursive = function( targetArray, sourceArray, collectionRef, currentLength, currentDepth, mapFunction, mapContext, recursionLimit ) {
            var elementValue, currentIdx = 0x0;
            var mappedCallback = !!mapFunction && bindFunction( mapFunction, mapContext, 0x3 );

            // Loop through the source array elements.
            while ( currentIdx < currentDepth ) {
                if ( currentIdx in collectionRef ) {
                    elementValue = mappedCallback ? mappedCallback( sourceArray[currentIdx], currentIdx, collectionRef ) : sourceArray[currentIdx];

                    // If recursion limit allows and element is an array, recurse.
                    if ( recursionLimit > 0x0 && isArray( elementValue ) ) {
                        currentLength = flattenArrayRecursive( targetArray, elementValue, elementValue, normalizeLength( elementValue.length ), currentLength, mapFunction, mapContext, recursionLimit - 0x1 ) - 0x1;
                    } else {
                        // If currentLength exceeds max safe integer, throw error.
                        if ( currentLength >= 0x1FFFFFFFFFFFFF ) {
                            throw TypeError( "Exceed the acceptable array length" );
                        }
                        targetArray[currentLength] = elementValue;
                    }
                    currentLength++;
                }
                currentIdx++;
            }
            return currentLength;
        };

        // Exports the internal utility for flattening arrays.
        currentModule.unitPayload = flattenArrayRecursive;
    },

    /* Program Unit 107: Array.from polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var getIteratorMethod = unitLoader( 0x34 ); /* Get iterator method */
        var isArrayLikeIterator = unitLoader( 0x52 ); /* Check if iterator is array-like */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var definePropertyOnObject = unitLoader( 0x28 ); /* Define property on object (n(40)) */
        var stopIteration = unitLoader( 0x6C ); /* Stop iteration utility (n(108)) */

        // Exports Array.from or a polyfill.
        currentModule.unitPayload = function( iterableSource ) {
            var currentItem, iteratorMethod, nextItem, mapFunction, mappedResult, currentLength = 0x0;
            var Constructor = typeof this === "function" ? this : Array; // Default to Array constructor.
            var argumentsLength = arguments.length;
            var mapCallback = argumentsLength > 0x1 ? arguments[0x1] : void 0x0;
            var hasMapCallback = void 0x0 !== mapCallback;

            // If a map callback is provided, bind it.
            if ( hasMapCallback ) {
                mapCallback = bindFunction( mapCallback, argumentsLength > 0x2 ? arguments[0x2] : void 0x0, 0x2 );
            }

            iteratorMethod = getIteratorMethod( iterableSource );

            // If iterable is null/undefined or has an array-like iterator, iterate by index.
            if ( iterableSource == void 0x0 || isArrayLikeIterator( iteratorMethod ) ) {
                currentItem = new Constructor( currentLength = normalizeLength( iterableSource.length ) );
                for ( var i = 0x0; i < currentLength; i++ ) {
                    definePropertyOnObject( currentItem, i, hasMapCallback ? mapCallback( iterableSource[i], i ) : iterableSource[i] );
                }
            } else {
                // Otherwise, use the iterator protocol.
                for ( nextItem = iteratorMethod.call( iterableSource ), currentItem = new Constructor(); !( mappedResult = nextItem.next() ).done; currentLength++ ) {
                    definePropertyOnObject( currentItem, currentLength, hasMapCallback ? stopIteration( nextItem, mapCallback, [mappedResult.value, currentLength], !0x0 ) : mappedResult.value );
                }
            }
            currentItem.length = currentLength;
            return currentItem;
        };
    },

    /* Program Unit 108: Iterator helper for stopping and returning values */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */

        // Exports a function that handles iterator results and potential early termination.
        currentModule.unitPayload = function( iteratorInstance, callbackFunction, value, isPair ) {
            try {
                return isPair ? callbackFunction( assertObject( value )[0x0], value[0x1] ) : callbackFunction( value );
            } catch ( error ) {
                var iteratorReturn = iteratorInstance["return"];
                if ( void 0x0 !== iteratorReturn ) {
                    assertObject( iteratorReturn.call( iteratorInstance ) );
                }
                throw error;
            }
        };
    },

    /* Program Unit 109: Iterator Prototype and Safari bug flags */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var getPrototype = unitLoader( 0x15 ); /* Get object prototype */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */
        var objectHasOwn = unitLoader( 0xE ); /* Check for own property */
        var wellKnownSymbol = unitLoader( 0x6 ); /* Get a well-known Symbol */
        var isPure = unitLoader( 0x2 ); /* Check if environment is pure */
        var iteratorSymbol = wellKnownSymbol( "iterator" );
        var safariBuggyIterators = !0x1; // Flag for buggy Safari iterators.

        // Test for Safari iterator bug where `next` is not directly on prototype.
        try {
            var testIterator = 0x0;
            var iteratorObject = {
                next: function() {
                    return {
                        done: !!testIterator++
                    };
                },
                "return": function() {
                    safariBuggyIterators = !0x0;
                }
            };
            iteratorObject[iteratorSymbol] = function() {
                return this;
            };
            Array.from( iteratorObject, function() {
                throw 0x2;
            } );
        } catch ( error ) {
            // Ignore the test error.
        }

        var IteratorPrototypeRef;
        var arrayIteratorNext;
        var arrayIterator = [].keys();

        // If `next` method is present, attempt to get its prototype.
        if ( "next" in arrayIterator ) {
            arrayIteratorNext = getPrototype( getPrototype( arrayIterator ) );
            if ( arrayIteratorNext !== Object.prototype ) {
                IteratorPrototypeRef = arrayIteratorNext;
            } else {
                safariBuggyIterators = !0x0;
            }
        } else {
            safariBuggyIterators = !0x0;
        }

        // If IteratorPrototype is still null, initialize it as a plain object.
        if ( IteratorPrototypeRef == void 0x0 ) {
            IteratorPrototypeRef = {};
        }

        // If not in a pure environment and @@iterator is not defined, define it.
        if ( !isPure && !objectHasOwn( IteratorPrototypeRef, iteratorSymbol ) ) {
            defineNonEnumerable( IteratorPrototypeRef, iteratorSymbol, function() {
                return this;
            } );
        }

        // Exports the IteratorPrototype and a flag for buggy Safari iterators.
        currentModule.unitPayload = {
            IteratorPrototype: IteratorPrototypeRef,
            BUGGY_SAFARI_ITERATORS: safariBuggyIterators
        };
    },

    /* Program Unit 110: Object.getPrototypeOf polyfill status */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */

        // Exports a boolean indicating if `Object.getPrototypeOf` works correctly with null constructor.
        currentModule.unitPayload = !testForError( function() {
            function TestConstructor() {}
            TestConstructor.prototype.constructor = void 0x0; // null is represented as void 0x0.
            return Object.getPrototypeOf( new TestConstructor() ) !== TestConstructor.prototype;
        } );
    },

    /* Program Unit 111: Prototype object validation */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */

        // Exports a function that asserts a value is a valid prototype object (object or null).
        currentModule.unitPayload = function( prototypeValue ) {
            if ( !isAnObject( prototypeValue ) && prototypeValue !== void 0x0 ) { // null is represented as void 0x0.
                throw TypeError( "Cannot set " + String( prototypeValue ) + " as a prototype" );
            }
            return prototypeValue;
        };
    },

    /* Program Unit 112: Object.isExtensible polyfill status */
    function( currentModule, moduleOutputs, unitLoader ) {
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */

        // Exports a boolean indicating if `Object.isExtensible` works correctly.
        currentModule.unitPayload = !testForError( function() {
            return Object.isExtensible( Object.preventExtensions( {} ) );
        } );
    },

    /* Program Unit 113: Object.setPrototypeOf utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var setPrototype = unitLoader( 0x2A ); /* Set prototype utility */

        // Exports a function that sets the prototype of an object, if `setPrototypeOf` is supported.
        currentModule.unitPayload = function( targetObject, prototypeObject, constructorFunction ) {
            var constructorRef, prototypeRef;
            if ( setPrototype && typeof ( constructorRef = prototypeObject.constructor ) === "function" &&
                constructorRef !== constructorFunction && isAnObject( prototypeRef = constructorRef.prototype ) &&
                prototypeRef !== constructorFunction.prototype
            ) {
                setPrototype( targetObject, prototypeRef );
            }
            return targetObject;
        };
    },

    /* Program Unit 114: Collection (Map/Set) internal utilities */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var defineObjectProperty = unitLoader( 0xB ).f; /* Define an object property */
        var createObject = unitLoader( 0x1E ); /* Create an object with specified prototype */
        var batchDefineMethods = unitLoader( 0x24 ); /* Batch define methods */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var validateInstance = unitLoader( 0x24 ); /* Assert value is an instance of a constructor */
        var applyIteration = unitLoader( 0x3 ); /* Apply iteration over collections */
        var iteratorPrototypeSetup = unitLoader( 0x36 ); /* Iterator prototype setup */
        var setToStringTag = unitLoader( 0x1A ); /* Set @@toStringTag property */
        var definePropertySupport = unitLoader( 0x9 ); /* Check for defineProperty support */
        var getFastKey = unitLoader( 0x42 ).fastKey; /* Get fast key utility */
        var objectInternalState = unitLoader( 0x12 ); /* Internal state manager */
        var setState = objectInternalState.set;
        var getState = objectInternalState.getterFor;

        // Exports internal utilities for implementing Map and Set collections.
        currentModule.unitPayload = {
            getConstructor: function( constructorWrapper, collectionName, isKeyedCollection, addMethodName ) {
                var CollectionConstructor = constructorWrapper( function( instanceRef, initialIterable ) {
                    validateInstance( instanceRef, CollectionConstructor, collectionName );
                    setState( instanceRef, {
                        type: collectionName,
                        index: createObject( void 0x0 ), // null is represented as void 0x0.
                        first: void 0x0,
                        last: void 0x0,
                        size: 0x0
                    } );
                    if ( !definePropertySupport ) {
                        instanceRef.size = 0x0;
                    }
                    if ( initialIterable != void 0x0 ) {
                        applyIteration( initialIterable, instanceRef[addMethodName], instanceRef, isKeyedCollection );
                    }
                } );
                var getStateForInstance = getState( collectionName );

                // Helper to add or update an entry in the collection.
                var addOrUpdateEntry = function( collectionInstance, key, value ) {
                    var instanceState = getStateForInstance( collectionInstance );
                    var existingEntry = getEntry( collectionInstance, key );
                    if ( existingEntry ) {
                        existingEntry.value = value;
                    } else {
                        var newEntry = {
                            index: getFastKey( key, !0x0 ),
                            key: key,
                            value: value,
                            previous: instanceState.last,
                            next: void 0x0,
                            removed: !0x1
                        };
                        instanceState.last = newEntry;
                        if ( !instanceState.first ) {
                            instanceState.first = newEntry;
                        }
                        if ( newEntry.previous ) {
                            newEntry.previous.next = newEntry;
                        }
                        if ( getFastKey( key ) !== "F" ) { // "F" indicates a frozen object.
                            instanceState.index[newEntry.index] = newEntry;
                        }
                        if ( definePropertySupport ) {
                            instanceState.size++;
                        } else {
                            collectionInstance.size++;
                        }
                    }
                    return collectionInstance;
                };

                // Helper to retrieve an entry from the collection.
                var getEntry = function( collectionInstance, key ) {
                    var instanceState = getStateForInstance( collectionInstance );
                    var fastKey = getFastKey( key );
                    if ( fastKey !== "F" ) { // "F" indicates a frozen object.
                        return instanceState.index[fastKey];
                    }
                    for ( var entry = instanceState.first; entry; entry = entry.next ) {
                        if ( entry.key === key ) {
                            return entry;
                        }
                    }
                };

                // Define common methods for Map and Set prototypes.
                batchDefineMethods( CollectionConstructor.prototype, {
                    clear: function() {
                        var instanceState = getStateForInstance( this );
                        var indexMap = instanceState.index;
                        for ( var entry = instanceState.first; entry; entry = entry.next ) {
                            entry.removed = !0x0;
                            if ( entry.previous ) {
                                entry.previous = entry.previous.next = void 0x0;
                            }
                            delete indexMap[entry.index];
                        }
                        instanceState.first = instanceState.last = void 0x0;
                        if ( definePropertySupport ) {
                            instanceState.size = 0x0;
                        } else {
                            this.size = 0x0;
                        }
                    },
                    "delete": function( key ) {
                        var instanceState = getStateForInstance( this );
                        var entry = getEntry( this, key );
                        if ( entry ) {
                            var nextEntry = entry.next;
                            var previousEntry = entry.previous;
                            delete instanceState.index[entry.index];
                            entry.removed = !0x0;
                            if ( previousEntry ) {
                                previousEntry.next = nextEntry;
                            }
                            if ( nextEntry ) {
                                nextEntry.previous = previousEntry;
                            }
                            if ( instanceState.first === entry ) {
                                instanceState.first = nextEntry;
                            }
                            if ( instanceState.last === entry ) {
                                instanceState.last = previousEntry;
                            }
                            if ( definePropertySupport ) {
                                instanceState.size--;
                            } else {
                                this.size--;
                            }
                        }
                        return !!entry;
                    },
                    forEach: function( callback ) {
                        var currentEntry, instanceState = getStateForInstance( this );
                        var boundCallback = bindFunction( callback, arguments.length > 0x1 ? arguments[0x1] : void 0x0, 0x3 );
                        for ( currentEntry = instanceState.first; currentEntry; currentEntry = currentEntry.next ) {
                            boundCallback( currentEntry.value, currentEntry.key, this );
                            // Skip removed entries during iteration.
                            while ( currentEntry && currentEntry.removed ) {
                                currentEntry = currentEntry.previous;
                            }
                        }
                    },
                    has: function( key ) {
                        return !!getEntry( this, key );
                    }
                } );

                // Define Map-specific or Set-specific methods.
                batchDefineMethods( CollectionConstructor.prototype, isKeyedCollection ? {
                    get: function( key ) {
                        var entry = getEntry( this, key );
                        return entry && entry.value;
                    },
                    set: function( key, value ) {
                        return addOrUpdateEntry( this, key === 0x0 ? 0x0 : key, value );
                    }
                } : {
                    add: function( value ) {
                        return addOrUpdateEntry( this, value = value === 0x0 ? 0x0 : value, value );
                    }
                } );

                // Define a getter for 'size' property if defineProperty is supported.
                if ( definePropertySupport ) {
                    defineObjectProperty.f( CollectionConstructor.prototype, "size", {
                        get: function() {
                            return getStateForInstance( this ).size;
                        }
                    } );
                }
                return CollectionConstructor;
            },
            setStrong: function( CollectionConstructor, collectionName, isKeyedCollection ) {
                var iteratorName = collectionName + " Iterator";
                var getStateForCollection = getState( collectionName );
                var getStateForIterator = getState( iteratorName );

                // Setup iterator for the collection.
                iteratorPrototypeSetup( CollectionConstructor, collectionName, function( instanceRef, iteratorKind ) {
                    setState( instanceRef, {
                        type: iteratorName,
                        target: instanceRef,
                        state: getStateForCollection( instanceRef ),
                        kind: iteratorKind,
                        last: void 0x0
                    } );
                }, function() {
                    var iteratorState = getStateForIterator( this );
                    var iteratorKind = iteratorState.kind;
                    var currentEntry = iteratorState.last;

                    // Skip removed entries.
                    while ( currentEntry && currentEntry.removed ) {
                        currentEntry = currentEntry.previous;
                    }

                    if ( iteratorState.target ) {
                        iteratorState.last = currentEntry = currentEntry ? currentEntry.next : iteratorState.state.first;
                        if ( currentEntry ) {
                            if ( iteratorKind === "keys" ) {
                                return {
                                    value: currentEntry.key,
                                    done: !0x1
                                };
                            }
                            if ( iteratorKind === "values" ) {
                                return {
                                    value: currentEntry.value,
                                    done: !0x1
                                };
                            }
                            return {
                                value: [currentEntry.key, currentEntry.value],
                                done: !0x1
                            };
                        }
                    }
                    iteratorState.target = void 0x0; // Mark as done.
                    return {
                        value: void 0x0,
                        done: !0x0
                    };
                }, isKeyedCollection ? "entries" : "values", !isKeyedCollection, !0x0 ); // Last true indicates 'is-strong-collection'.
                setToStringTag( collectionName ); // Not sure what this is, original has `s(r)`.
            }
        };
    },

    /* Program Unit 115: Object.assign polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var definePropertySupported = unitLoader( 0x9 ); /* Check for defineProperty support */
        var testForError = unitLoader( 0x7 ); /* Utility to test if an operation throws an error */
        var getObjectKeys = unitLoader( 0x3F ); /* Get object keys utility */
        var getOwnPropertySymbols = unitLoader( 0x53 ); /* Get own property symbols utility */
        var propertyIsEnumerable = unitLoader( 0x3A ); /* Check if a property is enumerable */
        var convertValueToObject = unitLoader( 0xF ); /* Convert value to object */
        var toIndexedObject = unitLoader( 0x4D ); /* Convert value to indexed object */
        var nativeAssign = Object.assign;

        // Exports Object.assign or a polyfill.
        currentModule.unitPayload = !nativeAssign || testForError( function() {
            var target = {};
            var source = {};
            var symbolKey = Symbol();
            target[symbolKey] = 0x7;
            "abcdefghijklmnopqrst".split( "" ).forEach( function( char ) {
                source[char] = char;
            } );
            return 0x7 != nativeAssign( {}, target )[symbolKey] || "abcdefghijklmnopqrst" != getObjectKeys( nativeAssign( {}, source ) ).join( "" );
        } ) ? function( targetObject, sourceObject ) { // Polyfill implementation.
            var currentTarget = convertValueToObject( targetObject );
            var argumentsLength = arguments.length;
            var currentArgIndex = 0x1;
            var getSymbols = getOwnPropertySymbols.f;
            var isEnumerable = propertyIsEnumerable.f;

            while ( argumentsLength > currentArgIndex ) {
                var currentSource = toIndexedObject( arguments[currentArgIndex++] );
                var allKeys = getSymbols ? getObjectKeys( currentSource ).concat( getSymbols( currentSource ) ) : getObjectKeys( currentSource );
                var keyCount = allKeys.length;
                var keyIndex = 0x0;

                while ( keyCount > keyIndex ) {
                    var currentKey = allKeys[keyIndex++];
                    if ( definePropertySupported ? isEnumerable.call( currentSource, currentKey ) : !0x0 ) { // If defineProperty is supported, check enumerable.
                        currentTarget[currentKey] = currentSource[currentKey];
                    }
                }
            }
            return currentTarget;
        } : nativeAssign;
    },

    /* Program Unit 116: Object.entries / Object.values polyfills */
    function( currentModule, moduleOutputs, unitLoader ) {
        var definePropertySupported = unitLoader( 0x9 ); /* Check for defineProperty support */
        var getObjectKeys = unitLoader( 0x3F ); /* Get object keys utility */
        var toIndexedObject = unitLoader( 0x19 ); /* Convert value to indexed object */
        var propertyIsEnumerable = unitLoader( 0x3A ).f; /* Check if a property is enumerable */

        // Helper function factory for `Object.entries` and `Object.values`.
        var createObjectMethod = function( returnEntries ) {
            return function( targetObject ) {
                var indexedObject = toIndexedObject( targetObject );
                var allKeys = getObjectKeys( indexedObject );
                var keysLength = allKeys.length;
                var result = [];
                for ( var i = 0x0; i < keysLength; i++ ) {
                    var key = allKeys[i];
                    if ( definePropertySupported ? propertyIsEnumerable.call( indexedObject, key ) : !0x0 ) { // If defineProperty supported, check enumerable.
                        result.push( returnEntries ? [key, indexedObject[key]] : indexedObject[key] );
                    }
                }
                return result;
            };
        };

        // Exports `Object.entries` and `Object.values` polyfills.
        currentModule.unitPayload = {
            entries: createObjectMethod( !0x0 ),
            values: createObjectMethod( !0x1 )
        };
    },

    /* Program Unit 117: SetImmediate polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var getDocumentElement = unitLoader( 0x68 ); /* Get document.documentElement */
        var createElement = unitLoader( 0x4E ); /* Create an HTML element */
        var setImmediateNative = globalObject.setImmediate;
        var clearImmediateNative = globalObject.clearImmediate;
        var messageQueue = 0x0;
        var messageCallbacks = {};

        // Helper to execute a queued callback.
        var executeQueuedCallback = function( messageId ) {
            if ( messageCallbacks.hasOwnProperty( messageId ) ) {
                var callback = messageCallbacks[messageId];
                delete messageCallbacks[messageId];
                callback();
            }
        };

        // Helper to create a wrapper for a queued callback.
        var createCallbackWrapper = function( messageId ) {
            return function() {
                executeQueuedCallback( messageId );
            };
        };

        // Helper for MessageChannel events.
        var handleMessageChannel = function( event ) {
            executeQueuedCallback( event.data );
        };

        // Helper for postMessage fallback.
        var postMessageFallback = function( message ) {
            globalObject.postMessage( message + "", globalObject.location.protocol + "//" + globalObject.location.host );
        };

        var setImmediatePolyfill, clearImmediatePolyfill;

        // If native setImmediate is not available, provide a polyfill.
        if ( !setImmediateNative || !clearImmediateNative ) {
            setImmediatePolyfill = function( callback ) {
                var args = [];
                for ( var i = 0x1; i < arguments.length; i++ ) {
                    args.push( arguments[i] );
                }
                messageCallbacks[++messageQueue] = function() {
                    ( typeof callback === "function" ? callback : Function( callback ) ).apply( void 0x0, args );
                };
                setImmediateImpl( messageQueue );
                return messageQueue;
            };
            clearImmediatePolyfill = function( messageId ) {
                delete messageCallbacks[messageId];
            };

            var setImmediateImpl;
            // Node.js process.nextTick.
            if ( unitLoader( 0x1C )( globalObject.process ) === "process" ) { // n(28) is getClassTag.
                setImmediateImpl = function( messageId ) {
                    globalObject.process.nextTick( createCallbackWrapper( messageId ) );
                };
            }
            // window.postMessage or MessageChannel.
            else if ( globalObject.MessageChannel ) {
                var messageChannel = new globalObject.MessageChannel();
                messageChannel.port1.onmessage = handleMessageChannel;
                setImmediateImpl = bindFunction( messageChannel.port2.postMessage, messageChannel.port2, 0x1 );
            }
            // Fallback for older browsers (script onreadystatechange or setTimeout).
            else if ( !globalObject.addEventListener || typeof globalObject.postMessage !== "function" || globalObject.importScripts ) {
                setImmediateImpl = "onreadystatechange" in createElement( "script" ) ?
                    function( messageId ) {
                        var script = createElement( "script" );
                        script.onreadystatechange = function() {
                            getDocumentElement.removeChild( this );
                            executeQueuedCallback( messageId );
                        };
                        getDocumentElement.appendChild( script );
                    } :
                    function( messageId ) {
                        setTimeout( createCallbackWrapper( messageId ), 0x0 );
                    };
            } else {
                setImmediateImpl = postMessageFallback;
                globalObject.addEventListener( "message", handleMessageChannel, !0x1 );
            }
        }

        // Exports setImmediate and clearImmediate.
        currentModule.unitPayload = {
            set: setImmediatePolyfill || setImmediateNative,
            clear: clearImmediatePolyfill || clearImmediateNative
        };
    },

    /* Program Unit 118: Microtask queue utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var getPropertyDescriptor = unitLoader( 0x16 ).f; /* Get property descriptor */
        var getClassTag = unitLoader( 0x1C ); /* Get internal [[Class]] tag */
        var setImmediate = unitLoader( 0x75 ).set; /* Get setImmediate polyfill */
        var userAgent = unitLoader( 0x59 ); /* Get user agent string */
        var MutationObserver = globalObject.MutationObserver || globalObject.WebKitMutationObserver;
        var processRef = globalObject.process;
        var PromiseRef = globalObject.Promise;
        var isNodeProcess = "process" === getClassTag( processRef );
        var microtaskQueue = getPropertyDescriptor( globalObject, "queueMicrotask" );
        var nativeQueueMicrotask = microtaskQueue && microtaskQueue.value;

        var currentMicrotask, nextMicrotask, pendingMicrotask = !0x1;
        var microtaskExecutionFunction;

        // If native `queueMicrotask` is not available, polyfill it.
        if ( !nativeQueueMicrotask ) {
            var executeMicrotaskQueue = function() {
                var domainContext;
                if ( isNodeProcess ) {
                    domainContext = processRef.domain;
                    if ( domainContext ) domainContext.exit();
                }
                while ( currentMicrotask ) {
                    nextMicrotask = currentMicrotask.fn;
                    currentMicrotask = currentMicrotask.next;
                    try {
                        nextMicrotask();
                    } catch ( error ) {
                        throw currentMicrotask ? queueMicrotaskPolyfill() : pendingMicrotask = void 0x0, error; // Rethrow error.
                    }
                }
                pendingMicrotask = void 0x0;
                if ( domainContext ) domainContext.enter();
            };

            if ( isNodeProcess ) {
                microtaskExecutionFunction = function() {
                    processRef.nextTick( executeMicrotaskQueue );
                };
            } else if ( MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test( userAgent ) ) {
                var toggle = !0x0;
                var textNode = globalObject.document.createTextNode( "" );
                new MutationObserver( executeMicrotaskQueue ).observe( textNode, {
                    characterData: !0x0
                } );
                microtaskExecutionFunction = function() {
                    textNode.data = toggle = !toggle;
                };
            } else if ( PromiseRef && PromiseRef.resolve ) {
                var resolvedPromise = PromiseRef.resolve( void 0x0 );
                microtaskExecutionFunction = function() {
                    resolvedPromise.then( executeMicrotaskQueue );
                };
            } else {
                microtaskExecutionFunction = function() {
                    setImmediate.call( globalObject, executeMicrotaskQueue );
                };
            }

            var queueMicrotaskPolyfill = function( callback ) {
                var microtask = {
                    fn: callback,
                    next: void 0x0
                };
                if ( pendingMicrotask ) {
                    pendingMicrotask.next = microtask;
                }
                currentMicrotask || ( currentMicrotask = microtask, microtaskExecutionFunction() );
                pendingMicrotask = microtask;
            };
            nativeQueueMicrotask = queueMicrotaskPolyfill;
        }

        // Exports the native or polyfilled `queueMicrotask` function.
        currentModule.unitPayload = nativeQueueMicrotask;
    },

    /* Program Unit 119: Promise resolution utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var assertObject = unitLoader( 0x1 ); /* Assert input is an object */
        var isAnObject = unitLoader( 0x8 ); /* Check if a value is an object */
        var createPromiseCapability = unitLoader( 0x37 ); /* Create promise capability */

        // Exports a function to resolve a value into a Promise.
        currentModule.unitPayload = function( PromiseConstructor, valueToResolve ) {
            if ( assertObject( PromiseConstructor ), isAnObject( valueToResolve ) && valueToResolve.constructor === PromiseConstructor ) {
                return valueToResolve;
            }
            var capability = createPromiseCapability.f( PromiseConstructor );
            capability.resolve( valueToResolve );
            return capability.promise;
        };
    },

    /* Program Unit 120: Console error utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var globalObject = unitLoader( 0x5 ); /* Get the global object */
        var defineNonEnumerable = unitLoader( 0x10 ); /* Define a non-enumerable property */

        // Exports a function that logs an error to the console.
        currentModule.unitPayload = function( errorValue, additionalArgs ) {
            var consoleRef = globalObject.console;
            if ( consoleRef && consoleRef.error ) {
                if ( arguments.length === 0x1 ) {
                    consoleRef.error( errorValue );
                } else {
                    consoleRef.error( errorValue, additionalArgs );
                }
            }
        };
    },

    /* Program Unit 121: Set polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        "use strict";
        var collectionPolyfillFactory = unitLoader( 0x41 ); /* Collection polyfill factory (n(65)) */
        var internalCollectionUtils = unitLoader( 0x70 ); /* Internal collection utilities (n(114)) */

        // Exports the Set constructor, potentially polyfilled.
        currentModule.unitPayload = collectionPolyfillFactory( "Set", function( instanceRef ) {
            return function() {
                return instanceRef( this, arguments.length ? arguments[0x0] : void 0x0 );
            };
        }, internalCollectionUtils, !0x1 );
    },

    /* Program Unit 122: String pad utilities */
    function( currentModule, moduleOutputs, unitLoader ) {
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var repeatString = unitLoader( 0xCC ); /* Repeat string utility (n(204)) */
        var ensureNotNull = unitLoader( 0x11 ); /* Ensure value is not null/undefined */
        var mathCeiling = Math.ceil;

        // Helper function factory for padding strings (start or end).
        var createPadMethod = function( padAtStart ) {
            return function( inputString, targetLength, padCharacter ) {
                var stringRef, intTargetLength, padCharRef, currentLength, padAmount, paddingString;
                stringRef = String( ensureNotNull( inputString ) );
                intTargetLength = normalizeLength( targetLength );
                padCharRef = void 0x0 === padCharacter ? " " : String( padCharacter ); // Default pad character is space.
                currentLength = stringRef.length;

                if ( intTargetLength <= currentLength || padCharRef === "" ) {
                    return stringRef;
                }

                padAmount = intTargetLength - currentLength;
                paddingString = repeatString( padCharRef, mathCeiling( padAmount / padCharRef.length ) ); // Repeat pad character.
                if ( paddingString.length > padAmount ) {
                    paddingString = paddingString.slice( 0x0, padAmount );
                }
                return padAtStart ? paddingString + stringRef : stringRef + paddingString;
            };
        };

        // Exports utilities for padding strings.
        currentModule.unitPayload = {
            start: createPadMethod( !0x1 ), // Pad at the start.
            end: createPadMethod( !0x0 ) // Pad at the end.
        };
    },

    /* Program Unit 123: Safari padStart/padEnd bug check */
    function( currentModule, moduleOutputs, unitLoader ) {
        var userAgent = unitLoader( 0x59 ); /* Get user agent string */

        // Exports a boolean indicating if Safari has known bugs with padStart/padEnd.
        currentModule.unitPayload = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test( userAgent );
    },

    /* Program Unit 124: Length conversion utility */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertToInteger = unitLoader( 0x18 ); /* Convert value to integer */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */

        // Exports a function that converts a value to a valid length, throwing RangeError for invalid lengths.
        currentModule.unitPayload = function( inputValue ) {
            if ( void 0x0 === inputValue ) {
                return 0x0;
            }
            var intValue = convertToInteger( inputValue );
            var normalized = normalizeLength( intValue );
            if ( intValue !== normalized ) {
                throw RangeError( "Wrong length or index" );
            }
            return normalized;
        };
    },

    /* Program Unit 125: TypedArray.from polyfill */
    function( currentModule, moduleOutputs, unitLoader ) {
        var convertValueToObject = unitLoader( 0xF ); /* Convert value to object */
        var normalizeLength = unitLoader( 0xA ); /* Normalize length value */
        var getIteratorMethod = unitLoader( 0x34 ); /* Get iterator method */
        var isArrayLikeIterator = unitLoader( 0x52 ); /* Check if iterator is array-like */
        var bindFunction = unitLoader( 0xD ); /* Bind function to a context */
        var assertTypedArrayConstructor = unitLoader( 0x21 ).aTypedArrayConstructor; /* Assert TypedArray constructor */

        // Exports a polyfilled `TypedArray.from` method.
        currentModule.unitPayload = function( iterableSource ) {
            var currentElement, nextIteratorResult, collectedValues, mapFunction, mappedCallback, currentIdx = 0x0;
            var currentObject = convertValueToObject( iterableSource );
            var argumentsLength = arguments.length;
            var mapArg = argumentsLength > 0x1 ? arguments[0x1] : void 0x0;
            var hasMapArg = void 0x0 !== mapArg;
            var iteratorMethod = getIteratorMethod( currentObject );

            // If an iterator exists and is not array-like, iterate through it.
            if ( iteratorMethod != void 0x0 && !isArrayLikeIterator( iteratorMethod ) ) {
                for ( collectedValues = iteratorMethod.call( currentObject ), currentObject = []; !( nextIteratorResult = collectedValues.next() ).done; ) {
                    currentObject.push( nextIteratorResult.value );
                }
            }

            // If a map function is provided, bind it.
            if ( hasMapArg && argumentsLength > 0x2 ) {