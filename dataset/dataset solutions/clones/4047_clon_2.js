moduleLoader = function ( sourceModules, loadedModules, entryPoints, globalExportName ) {
    // Variable to capture any loading error during module initialization.
    var loadError,
        // Reference to the original moduleLoader if it exists, for chaining.
        originalLoaderReference = ( "function" === typeof moduleLoader && moduleLoader ),
        // Reference to Node.js's native 'require' function, if available.
        nodeJsRequireReference = ( "function" === typeof require && require );

    /**
     * Core function to load and execute modules.
     * @param {string} moduleId - The unique identifier for the module to load.
     * @param {boolean} isParentRequired - Flag indicating if this is a parent module requirement.
     * @returns {object} The exports object of the loaded module.
     */
    function loadModule( moduleId, isParentRequired ) {
        // Check if the module is already in the cache of loaded modules.
        if ( !loadedModules[ moduleId ] ) {
            // If not in cache, check if its source definition exists.
            if ( !sourceModules[ moduleId ] ) {
                // If source not found, attempt to delegate to other loaders.
                var currentLoaderReference = ( "function" === typeof moduleLoader && moduleLoader );
                if ( !isParentRequired && currentLoaderReference ) {
                    return currentLoaderReference( moduleId, true );
                }
                if ( originalLoaderReference ) {
                    return originalLoaderReference( moduleId, true );
                }
                if ( nodeJsRequireReference && "string" === typeof moduleId ) {
                    return nodeJsRequireReference( moduleId );
                }

                // If all attempts fail, throw a module not found error.
                var moduleNotFoundException = new Error( "Cannot locate module '" + moduleId + "'" );
                throw ( moduleNotFoundException.code = "MODULE_NOT_FOUND", moduleNotFoundException );
            }

            // Define the local 'require' function for the current module.
            localModuleRequirement.resolve = function ( relativePath ) {
                // Resolve relative paths within the module's dependencies.
                return sourceModules[ moduleId ][ 1 ][ relativePath ] || relativePath;
            };
            localModuleRequirement.cache = {}; // Initialize a cache for this module's dependencies.

            // Create a new module instance and store it in the loaded modules cache.
            var currentModuleInstance = loadedModules[ moduleId ] = new loadModule.ModuleConstructor( moduleId );

            // Execute the module's source code.
            // The module function expects (require, module, exports, this).
            sourceModules[ moduleId ][ 0 ].call(
                currentModuleInstance.exports,
                localModuleRequirement,
                currentModuleInstance,
                currentModuleInstance.exports,
                this
            );
        }
        // Return the exports of the loaded module.
        return loadedModules[ moduleId ].exports;

        /**
         * Local 'require' function available within each module.
         * @param {string} dependencyId - The ID of the dependency to require.
         * @returns {object} The exports of the required dependency.
         */
        function localModuleRequirement( dependencyId ) {
            return loadModule( localModuleRequirement.resolve( dependencyId ) );
        }
    }

    // Set properties on the main module loader function.
    loadModule.isModuleLoader = true; // Mark as a module loader.
    loadModule.ModuleConstructor = function ( moduleIdentifier ) {
        this.id = moduleIdentifier;
        this.bundle = loadModule;
        this.exports = {};
    };
    loadModule.allSources = sourceModules;   // Store the map of all source modules.
    loadModule.moduleCache = loadedModules;   // Store the map of loaded modules.
    loadModule.parentLoader = originalLoaderReference; // Keep track of any parent loader.
    loadModule.registerSource = function ( registrationKey, moduleDefinition ) {
        // Method to dynamically register new module sources.
        sourceModules[ registrationKey ] = [
            function ( moduleContent, moduleData ) {
                moduleData.exports = moduleDefinition;
            },
            {},
        ];
    };

    // Iterate through entry points and attempt to load each.
    for ( var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++ ) {
        try {
            loadModule( entryPoints[ entryIndex ] );
        } catch ( currentException ) {
            // Store the first exception encountered during entry point loading.
            loadError = loadError || currentException;
        }
    }

    // Handle global export of the last entry point.
    if ( entryPoints.length ) {
        var lastModuleExport = loadModule( entryPoints[ entryPoints.length - 1 ] );
        // CommonJS export.
        if ( "object" === typeof exports && "undefined" !== typeof module ) {
            module.exports = lastModuleExport;
        }
        // AMD export.
        else if ( "function" === typeof define && define.amd ) {
            define( function () { return lastModuleExport; } );
        }
        // Global variable export.
        else if ( globalExportName ) {
            this[ globalExportName ] = lastModuleExport;
        }
    }

    // Assign this loader to the global 'moduleLoader' variable and rethrow any captured error.
    if ( ( moduleLoader = loadModule ), loadError ) {
        throw loadError;
    }

    return loadModule;
}(
    // Map of module sources:
    {
        "Focm": [
            function ( localModuleReq, currentModuleObj, moduleExportsObj ) {
                // Initialize a container for all parcel exports.
                var moduleExportsContainer = {};

                // --- Start of Control.Apply module ---
                (function( globalNamespace ) {
                    "use strict";
                    globalNamespace["Control.Apply"] = globalNamespace["Control.Apply"] || {};
                    var applyControlMethods = globalNamespace["Control.Apply"];
                    applyControlMethods.Apply = function( functorReference, applyFunction ) {
                        this.Functor0 = functorReference;
                        this.apply = applyFunction;
                    };
                    applyControlMethods.apply = function( applyInstance ) {
                        return applyInstance.apply;
                    };
                })( moduleExportsContainer );

                // --- Start of Control.Applicative module ---
                (function( topLevelNamespace ) {
                    "use strict";
                    topLevelNamespace["Control.Applicative"] = topLevelNamespace["Control.Applicative"] || {};
                    var applicativeControl = topLevelNamespace["Control.Applicative"],
                        applyControl = topLevelNamespace["Control.Apply"],
                        pureValueExtractor = function( applicativeInstance ) { return applicativeInstance.pure; };
                    applicativeControl.Applicative = function( applyInstance, pureMethod ) {
                        this.Apply0 = applyInstance;
                        this.pure = pureMethod;
                    };
                    applicativeControl.pure = pureValueExtractor;
                    applicativeControl.liftA1 = function( applicativeContext ) {
                        return function( valueToLift ) {
                            return function( initialArgument ) {
                                return applyControl.apply( applicativeContext.Apply0() )( pureValueExtractor( applicativeContext )( valueToLift ) )( initialArgument );
                            };
                        };
                    };
                })( moduleExportsContainer );

                // --- Start of Data.EuclideanRing (intDegree, intDiv, intMod) module ---
                (function( dataEuclidean ) {
                    "use strict";
                    dataEuclidean.intDegree = function( inputNumber ) {
                        return Math.min( Math.abs( inputNumber ), 2147483647 );
                    };
                    dataEuclidean.intDiv = function( dividendValue ) {
                        return function( divisorValue ) {
                            return 0 === divisorValue ? 0 : divisorValue > 0 ? Math.floor( dividendValue / divisorValue ) : -Math.floor( dividendValue / -divisorValue );
                        };
                    };
                    dataEuclidean.intMod = function( moduloDividend ) {
                        return function( moduloDivisor ) {
                            if ( 0 === moduloDivisor ) return 0;
                            var absoluteDivisor = Math.abs( moduloDivisor );
                            return ( moduloDividend % absoluteDivisor + absoluteDivisor ) % absoluteDivisor;
                        };
                    };
                })( moduleExportsContainer["Data.EuclideanRing"] = moduleExportsContainer["Data.EuclideanRing"] || {} );

                // --- Start of Data.Ring (intSub) module ---
                (function( dataRing ) {
                    "use strict";
                    ( moduleExportsContainer["Data.Ring"] = moduleExportsContainer["Data.Ring"] || {} ).intSub = function( firstOperand ) {
                        return function( secondOperand ) {
                            return firstOperand - secondOperand | 0;
                        };
                    };
                })(); // No `dataRing` passed, it uses `moduleExportsContainer` directly via closure.

                // --- Start of Data.Semiring (intAdd, intMul) module ---
                (function( semiringData ) {
                    "use strict";
                    semiringData.intAdd = function( addendOne ) {
                        return function( addendTwo ) {
                            return addendOne + addendTwo | 0;
                        };
                    };
                    semiringData.intMul = function( factorOne ) {
                        return function( factorTwo ) {
                            return factorOne * factorTwo | 0;
                        };
                    };
                })( moduleExportsContainer["Data.Semiring"] = moduleExportsContainer["Data.Semiring"] || {} );

                // --- Start of Data.Semiring (full) module ---
                (function( semiringNamespace ) {
                    "use strict";
                    semiringNamespace["Data.Semiring"] = semiringNamespace["Data.Semiring"] || {};
                    var semiringDefinition = semiringNamespace["Data.Semiring"],
                        semiringIntOps = semiringNamespace["Data.Semiring"],
                        semiringConstructor = function( addFn, mulFn, oneVal, zeroVal ) {
                            this.add = addFn;
                            this.mul = mulFn;
                            this.one = oneVal;
                            this.zero = zeroVal;
                        },
                        intSemiringInstance = new semiringConstructor( semiringIntOps.intAdd, semiringIntOps.intMul, 1, 0 );
                    semiringDefinition.Semiring = semiringConstructor;
                    semiringDefinition.add = function( semiringInstance ) { return semiringInstance.add; };
                    semiringDefinition.zero = function( semiringInstance ) { return semiringInstance.zero; };
                    semiringDefinition.mul = function( semiringInstance ) { return semiringInstance.mul; };
                    semiringDefinition.one = function( semiringInstance ) { return semiringInstance.one; };
                    semiringDefinition.semiringInt = intSemiringInstance;
                })( moduleExportsContainer );

                // --- Start of Data.Ring (full) module ---
                (function( ringNamespace ) {
                    "use strict";
                    ringNamespace["Data.Ring"] = ringNamespace["Data.Ring"] || {};
                    var ringDefinition = ringNamespace["Data.Ring"],
                        ringIntOps = ringNamespace["Data.Ring"],
                        semiringRef = ringNamespace["Data.Semiring"],
                        ringConstructor = function( semiringRef0, subFn ) {
                            this.Semiring0 = semiringRef0;
                            this.sub = subFn;
                        },
                        intRingInstance = new ringConstructor( function() { return semiringRef.semiringInt; }, ringIntOps.intSub );
                    ringDefinition.Ring = ringConstructor;
                    ringDefinition.sub = function( ringInstance ) { return ringInstance.sub; };
                    ringDefinition.ringInt = intRingInstance;
                })( moduleExportsContainer );

                // --- Start of Data.CommutativeRing module ---
                (function( commRingNamespace ) {
                    "use strict";
                    commRingNamespace["Data.CommutativeRing"] = commRingNamespace["Data.CommutativeRing"] || {};
                    var commRingDefinition = commRingNamespace["Data.CommutativeRing"],
                        ringRef = commRingNamespace["Data.Ring"],
                        commRingConstructor = function( ringRef0 ) { this.Ring0 = ringRef0; },
                        intCommRingInstance = new commRingConstructor( function() { return ringRef.ringInt; } );
                    commRingDefinition.CommutativeRing = commRingConstructor;
                    commRingDefinition.commutativeRingInt = intCommRingInstance;
                })( moduleExportsContainer );

                // --- Start of Data.EuclideanRing (full) module ---
                (function( euclideanNamespace ) {
                    "use strict";
                    euclideanNamespace["Data.EuclideanRing"] = euclideanNamespace["Data.EuclideanRing"] || {};
                    var euclideanDefinition = euclideanNamespace["Data.EuclideanRing"],
                        euclideanIntOps = euclideanNamespace["Data.EuclideanRing"],
                        commRingRef = euclideanNamespace["Data.CommutativeRing"],
                        euclideanConstructor = function( commRingRef0, degreeFn, divFn, modFn ) {
                            this.CommutativeRing0 = commRingRef0;
                            this.degree = degreeFn;
                            this.div = divFn;
                            this.mod = modFn;
                        },
                        intEuclideanRingInstance = new euclideanConstructor(
                            function() { return commRingRef.commutativeRingInt; },
                            euclideanIntOps.intDegree,
                            euclideanIntOps.intDiv,
                            euclideanIntOps.intMod
                        );
                    euclideanDefinition.EuclideanRing = euclideanConstructor;
                    euclideanDefinition.degree = function( euclideanInstance ) { return euclideanInstance.degree; };
                    euclideanDefinition.div = function( euclideanInstance ) { return euclideanInstance.div; };
                    euclideanDefinition.mod = function( euclideanInstance ) { return euclideanInstance.mod; };
                    euclideanDefinition.euclideanRingInt = intEuclideanRingInstance;
                })( moduleExportsContainer );

                // --- Start of Data.Int (fromStringAsImpl) module ---
                (function( integerDataNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Data.Int"] = moduleExportsContainer["Data.Int"] || {} ).fromStringAsImpl = function( justCreator ) {
                        return function( nothingValue ) {
                            return function( radixValue ) {
                                var regexCharacterRange;
                                regexCharacterRange = radixValue < 11 ? "[0-" + ( radixValue - 1 ).toString() + "]" :
                                                      11 === radixValue ? "[0-9a]" :
                                                      "[0-9a-" + String.fromCharCode( 86 + radixValue ) + "]";
                                var validationRegex = new RegExp( "^[\\+\\-]?" + regexCharacterRange + "+$", "i" );
                                return function( inputStringValue ) {
                                    if ( validationRegex.test( inputStringValue ) ) {
                                        var parsedInteger = parseInt( inputStringValue, radixValue );
                                        return ( 0 | parsedInteger ) === parsedInteger ? justCreator( parsedInteger ) : nothingValue;
                                    }
                                    return nothingValue;
                                };
                            };
                        };
                    };
                })();

                // --- Start of Data.Maybe module ---
                (function( maybeDataNamespace ) {
                    "use strict";
                    maybeDataNamespace["Data.Maybe"] = maybeDataNamespace["Data.Maybe"] || {};
                    var maybeDefinition = maybeDataNamespace["Data.Maybe"],
                        nothingConstructor = function() {
                            function NothingSingleton() {}
                            return NothingSingleton.value = new NothingSingleton(), NothingSingleton;
                        }(),
                        justConstructor = function() {
                            function JustWrapper( wrappedValue ) { this.value0 = wrappedValue; }
                            return JustWrapper.create = function( createValue ) { return new JustWrapper( createValue ); }, JustWrapper;
                        }();
                    maybeDefinition.Nothing = nothingConstructor;
                    maybeDefinition.Just = justConstructor;
                    maybeDefinition.fromJust = function( errorMsg ) {
                        return function( maybeValue ) {
                            if ( maybeValue instanceof justConstructor ) return maybeValue.value0;
                            throw new Error( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ maybeValue.constructor.name ] );
                        };
                    };
                })( moduleExportsContainer );

                // --- Start of Data.Int (full) module ---
                (function( intModuleScope ) {
                    "use strict";
                    intModuleScope["Data.Int"] = intModuleScope["Data.Int"] || {};
                    var intModule = intModuleScope["Data.Int"],
                        intInternal = intModuleScope["Data.Int"],
                        maybeInternal = intModuleScope["Data.Maybe"],
                        parseIntegerFunction = intInternal.fromStringAsImpl( maybeInternal.Just.create )( maybeInternal.Nothing.value ),
                        baseTenParser = parseIntegerFunction( 10 );
                    intModule.fromString = baseTenParser;
                    intModule.fromStringAs = parseIntegerFunction;
                })( moduleExportsContainer );

                // --- Start of Data.Show (showIntImpl) module ---
                (function( showDataNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Data.Show"] = moduleExportsContainer["Data.Show"] || {} ).showIntImpl = function( valueToShow ) {
                        return valueToShow.toString();
                    };
                })();

                // --- Start of Data.Show (full) module ---
                (function( showModuleScope ) {
                    "use strict";
                    showModuleScope["Data.Show"] = showModuleScope["Data.Show"] || {};
                    var showModule = showModuleScope["Data.Show"],
                        showConstructor = function( showMethod ) { this.show = showMethod; },
                        intShowInstance = new showConstructor( showModuleScope["Data.Show"].showIntImpl );
                    showModule.Show = showConstructor;
                    showModule.show = function( showInstance ) { return showInstance.show; };
                    showModule.showInt = intShowInstance;
                })( moduleExportsContainer );

                // --- Start of Data.String.Common (split, trim) module ---
                (function( stringUtilNamespace ) {
                    "use strict";
                    stringUtilNamespace.split = function( delimiterString ) {
                        return function( targetString ) {
                            return targetString.split( delimiterString );
                        };
                    };
                    stringUtilNamespace.trim = function( stringToTrim ) {
                        return stringToTrim.trim();
                    };
                })( moduleExportsContainer["Data.String.Common"] = moduleExportsContainer["Data.String.Common"] || {} );

                // --- Start of Data.String.Common (full) module ---
                (function( stringCommonNamespace ) {
                    "use strict";
                    stringCommonNamespace["Data.String.Common"] = stringCommonNamespace["Data.String.Common"] || {};
                    var stringCommonModule = stringCommonNamespace["Data.String.Common"],
                        stringCommonInternal = stringCommonNamespace["Data.String.Common"];
                    stringCommonModule.split = stringCommonInternal.split;
                    stringCommonModule.trim = stringCommonInternal.trim;
                })( moduleExportsContainer );

                // --- Start of Data.Unit (unit) module ---
                (function( unitDataNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Data.Unit"] = moduleExportsContainer["Data.Unit"] || {} ).unit = {};
                })();

                // --- Start of Data.Unit (full) module ---
                (function( unitModuleNamespace ) {
                    "use strict";
                    unitModuleNamespace["Data.Unit"] = unitModuleNamespace["Data.Unit"] || {};
                    var unitModule = unitModuleNamespace["Data.Unit"],
                        unitInternal = unitModuleNamespace["Data.Unit"];
                    unitModule.unit = unitInternal.unit;
                })( moduleExportsContainer );

                // --- Start of Effect (pureE, bindE) module ---
                (function( effectNamespace ) {
                    "use strict";
                    effectNamespace.pureE = function( returnValue ) {
                        return function() { return returnValue; };
                    };
                    effectNamespace.bindE = function( effectComputation ) {
                        return function( continuationFunction ) {
                            return function() { return continuationFunction( effectComputation() )(); };
                        };
                    };
                })( moduleExportsContainer.Effect = moduleExportsContainer.Effect || {} );

                // --- Start of Control.Bind module ---
                (function( bindNamespace ) {
                    "use strict";
                    bindNamespace["Control.Bind"] = bindNamespace["Control.Bind"] || {};
                    var bindControl = bindNamespace["Control.Bind"];
                    bindControl.Bind = function( applyRef, bindFunc ) {
                        this.Apply0 = applyRef;
                        this.bind = bindFunc;
                    };
                    bindControl.bind = function( bindInstance ) { return bindInstance.bind; };
                })( moduleExportsContainer );

                // --- Start of Control.Monad module ---
                (function( monadNamespace ) {
                    "use strict";
                    monadNamespace["Control.Monad"] = monadNamespace["Control.Monad"] || {};
                    var monadControl = monadNamespace["Control.Monad"],
                        applicativeRef = monadNamespace["Control.Applicative"],
                        bindRef = monadNamespace["Control.Bind"];
                    monadControl.Monad = function( applicativeRef0, bindRef1 ) {
                        this.Applicative0 = applicativeRef0;
                        this.Bind1 = bindRef1;
                    };
                    monadControl.ap = function( monadInstance ) {
                        return function( actionFn ) {
                            return function( actionArg ) {
                                return bindRef.bind( monadInstance.Bind1() )( actionFn )( function( resolvedFn ) {
                                    return bindRef.bind( monadInstance.Bind1() )( actionArg )( function( resolvedArg ) {
                                        return applicativeRef.pure( monadInstance.Applicative0() )( resolvedFn( resolvedArg ) );
                                    } );
                                } );
                            };
                        };
                    };
                })( moduleExportsContainer );

                // --- Start of Data.Functor module ---
                (function( functorNamespace ) {
                    "use strict";
                    functorNamespace["Data.Functor"] = functorNamespace["Data.Functor"] || {};
                    var functorData = functorNamespace["Data.Functor"];
                    functorData.Functor = function( mapMethod ) { this.map = mapMethod; };
                    functorData.map = function( functorInstance ) { return functorInstance.map; };
                })( moduleExportsContainer );

                // --- Start of Effect (full) module ---
                (function( effectModuleScope ) {
                    "use strict";
                    effectModuleScope.Effect = effectModuleScope.Effect || {};
                    var effectModule = effectModuleScope.Effect,
                        effectInternal = effectModuleScope.Effect,
                        applicativeControlRef = effectModuleScope["Control.Applicative"],
                        applyControlRef = effectModuleScope["Control.Apply"],
                        bindControlRef = effectModuleScope["Control.Bind"],
                        monadControlRef = effectModuleScope["Control.Monad"],
                        functorDataRef = effectModuleScope["Data.Functor"],
                        monadEffectInstance = new monadControlRef.Monad( function() { return applicativeEffectInstance; }, function() { return bindEffectInstance; } ),
                        bindEffectInstance = new bindControlRef.Bind( function() { return applyEffectInstance; }, effectInternal.bindE ),
                        applyEffectInstance = new applyControlRef.Apply( function() { return functorEffectInstance; }, monadControlRef.ap( monadEffectInstance ) ),
                        applicativeEffectInstance = new applicativeControlRef.Applicative( function() { return applyEffectInstance; }, effectInternal.pureE ),
                        functorEffectInstance = new functorDataRef.Functor( applicativeControlRef.liftA1( applicativeEffectInstance ) );
                    effectModule.functorEffect = functorEffectInstance;
                    effectModule.applyEffect = applyEffectInstance;
                    effectModule.applicativeEffect = applicativeEffectInstance;
                    effectModule.bindEffect = bindEffectInstance;
                    effectModule.monadEffect = monadEffectInstance;
                })( moduleExportsContainer );

                // --- Start of Node.Encoding module ---
                (function( nodeEncodingNamespace ) {
                    "use strict";
                    nodeEncodingNamespace["Node.Encoding"] = nodeEncodingNamespace["Node.Encoding"] || {};
                    var encodingModule = nodeEncodingNamespace["Node.Encoding"],
                        showDataRef = nodeEncodingNamespace["Data.Show"],
                        asciiEncoding = function() { function ASCII() {} return ASCII.value = new ASCII(), ASCII; }(),
                        utf8Encoding = function() { function UTF8() {} return UTF8.value = new UTF8(), UTF8; }(),
                        utf16leEncoding = function() { function UTF16LE() {} return UTF16LE.value = new UTF16LE(), UTF16LE; }(),
                        ucs2Encoding = function() { function UCS2() {} return UCS2.value = new UCS2(), UCS2; }(),
                        base64Encoding = function() { function Base64() {} return Base64.value = new Base64(), Base64; }(),
                        latin1Encoding = function() { function Latin1() {} return Latin1.value = new Latin1(), Latin1; }(),
                        binaryEncoding = function() { function Binary() {} return Binary.value = new Binary(), Binary; }(),
                        hexEncoding = function() { function Hex() {} return Hex.value = new Hex(), Hex; }(),
                        encodingShowInstance = new showDataRef.Show( function( encodingType ) {
                            if ( encodingType instanceof asciiEncoding ) return "ASCII";
                            if ( encodingType instanceof utf8Encoding ) return "UTF8";
                            if ( encodingType instanceof utf16leEncoding ) return "UTF16LE";
                            if ( encodingType instanceof ucs2Encoding ) return "UCS2";
                            if ( encodingType instanceof base64Encoding ) return "Base64";
                            if ( encodingType instanceof latin1Encoding ) return "Latin1";
                            if ( encodingType instanceof binaryEncoding ) return "Binary";
                            if ( encodingType instanceof hexEncoding ) return "Hex";
                            throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ encodingType.constructor.name ] );
                        } );
                    encodingModule.ASCII = asciiEncoding;
                    encodingModule.UTF8 = utf8Encoding;
                    encodingModule.UTF16LE = utf16leEncoding;
                    encodingModule.UCS2 = ucs2Encoding;
                    encodingModule.Base64 = base64Encoding;
                    encodingModule.Latin1 = latin1Encoding;
                    encodingModule.Binary = binaryEncoding;
                    encodingModule.Hex = hexEncoding;
                    encodingModule.showEncoding = encodingShowInstance;
                })( moduleExportsContainer );

                // --- Start of Node.FS.Internal (unsafeRequireFS) module ---
                (function( fileSystemInternalNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Node.FS.Internal"] = moduleExportsContainer["Node.FS.Internal"] || {} ).unsafeRequireFS = localModuleReq( "fs" );
                })();

                // --- Start of Unsafe.Coerce (unsafeCoerce) module ---
                (function( unsafeCoerceNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Unsafe.Coerce"] = moduleExportsNamespace["Unsafe.Coerce"] || {} ).unsafeCoerce = function( inputArgument ) {
                        return inputArgument;
                    };
                })();

                // --- Start of Unsafe.Coerce (full) module ---
                (function( unsafeCoerceModuleNamespace ) {
                    "use strict";
                    unsafeCoerceModuleNamespace["Unsafe.Coerce"] = unsafeCoerceModuleNamespace["Unsafe.Coerce"] || {};
                    var unsafeCoerceModule = unsafeCoerceModuleNamespace["Unsafe.Coerce"],
                        unsafeCoerceInternal = unsafeCoerceModuleNamespace["Unsafe.Coerce"];
                    unsafeCoerceModule.unsafeCoerce = unsafeCoerceInternal.unsafeCoerce;
                })( moduleExportsContainer );

                // --- Start of Node.FS.Internal (full) module ---
                (function( fileSystemInternalModuleNamespace ) {
                    "use strict";
                    fileSystemInternalModuleNamespace["Node.FS.Internal"] = fileSystemInternalModuleNamespace["Node.FS.Internal"] || {};
                    var fileSystemInternalModule = fileSystemInternalModuleNamespace["Node.FS.Internal"],
                        fileSystemInternalRef = fileSystemInternalModuleNamespace["Node.FS.Internal"],
                        coerceToEffect = fileSystemInternalModuleNamespace["Unsafe.Coerce"].unsafeCoerce;
                    fileSystemInternalModule.mkEffect = coerceToEffect;
                    fileSystemInternalModule.unsafeRequireFS = fileSystemInternalRef.unsafeRequireFS;
                })( moduleExportsContainer );

                // --- Start of Node.FS.Sync module ---
                (function( fileSystemSyncNamespace ) {
                    "use strict";
                    fileSystemSyncNamespace["Node.FS.Sync"] = fileSystemSyncNamespace["Node.FS.Sync"] || {};
                    var fileSystemSyncModule = fileSystemSyncNamespace["Node.FS.Sync"],
                        showDataRefFS = fileSystemSyncNamespace["Data.Show"],
                        encodingRefFS = fileSystemSyncNamespace["Node.Encoding"],
                        fileSystemInternalRefFS = fileSystemSyncNamespace["Node.FS.Internal"],
                        nativeFsModule = fileSystemInternalRefFS.unsafeRequireFS;
                    fileSystemSyncModule.readTextFile = function( encodingTypeParam ) {
                        return function( filePath ) {
                            return fileSystemInternalRefFS.mkEffect( function( callbackFunction ) {
                                return nativeFsModule.readFileSync( filePath, { encoding: showDataRefFS.show( encodingRefFS.showEncoding )( encodingTypeParam ) } );
                            } );
                        };
                    };
                })( moduleExportsContainer );

                // --- Start of Node.Process (process) module ---
                (function( nodeProcessNamespace ) {
                    "use strict";
                    ( moduleExportsContainer["Node.Process"] = moduleExportsContainer["Node.Process"] || {} ).process = process;
                })();

                // --- Start of Node.Process (full) module ---
                (function( processModuleNamespace ) {
                    "use strict";
                    processModuleNamespace["Node.Process"] = processModuleNamespace["Node.Process"] || {};
                    var processModule = processModuleNamespace["Node.Process"],
                        standardOutput = processModuleNamespace["Node.Process"].process.stdout;
                    processModule.stdout = standardOutput;
                })( moduleExportsContainer );

                // --- Start of Node.Stream (write, writeStringImpl) module ---
                (function( nodeStreamNamespace ) {
                    "use strict";
                    nodeStreamNamespace.write = function( streamHandle ) {
                        return function( dataToWrite ) {
                            return function( writeCallback ) {
                                return function() { return streamHandle.write( dataToWrite, null, writeCallback ); };
                            };
                        };
                    };
                    nodeStreamNamespace.writeStringImpl = function( streamObject ) {
                        return function( encodingName ) {
                            return function( stringContent ) {
                                return function( writeCompletionCallback ) {
                                    return function() { return streamObject.write( stringContent, encodingName, writeCompletionCallback ); };
                                };
                            };
                        };
                    };
                })( moduleExportsContainer["Node.Stream"] = moduleExportsContainer["Node.Stream"] || {} );

                // --- Start of Node.Stream (full) module ---
                (function( streamModuleNamespace ) {
                    "use strict";
                    streamModuleNamespace["Node.Stream"] = streamModuleNamespace["Node.Stream"] || {};
                    var streamModule = streamModuleNamespace["Node.Stream"],
                        streamInternal = streamModuleNamespace["Node.Stream"],
                        showDataRefStream = streamModuleNamespace["Data.Show"],
                        encodingRefStream = streamModuleNamespace["Node.Encoding"];
                    streamModule.writeString = function( outputStream ) {
                        return function( encodingOption ) {
                            return streamInternal.writeStringImpl( outputStream )( showDataRefStream.show( encodingRefStream.showEncoding )( encodingOption ) );
                        };
                    };
                })( moduleExportsContainer );

                // --- Start of ABC087A module (Main Application Logic) ---
                (function( problemNamespace ) {
                    "use strict";
                    problemNamespace.ABC087A = problemNamespace.ABC087A || {};
                    var problemModule = problemNamespace.ABC087A,
                        controlApplicative = problemNamespace["Control.Applicative"],
                        euclideanRingData = problemNamespace["Data.EuclideanRing"],
                        integerData = problemNamespace["Data.Int"],
                        maybeData = problemNamespace["Data.Maybe"],
                        showData = problemNamespace["Data.Show"],
                        stringCommonData = problemNamespace["Data.String.Common"],
                        unitData = problemNamespace["Data.Unit"],
                        effectRuntime = problemNamespace.Effect,
                        nodeEncoding = problemNamespace["Node.Encoding"],
                        fileSystemSync = problemNamespace["Node.FS.Sync"],
                        processNode = problemNamespace["Node.Process"],
                        streamNode = problemNamespace["Node.Stream"],
                        // Define the core calculation logic.
                        calculateResult = (
                            stringCommonData.split( " " ), // This is an unused expression in the original.
                            function( textInput ) {
                                var tempText,
                                    inputLines = ( tempText = textInput, stringCommonData.split( "\n" )( stringCommonData.trim( tempText ) ) ),
                                    amountA = maybeData.fromJust()( integerData.fromString( inputLines[ 0 ] ) ),
                                    amountC = maybeData.fromJust()( integerData.fromString( inputLines[ 2 ] ) ),
                                    amountB = maybeData.fromJust()( integerData.fromString( inputLines[ 1 ] ) );
                                return showData.show( showData.showInt )( euclideanRingData.mod( euclideanRingData.euclideanRingInt )( amountA - amountB | 0 )( amountC ) ) + "\n";
                            }
                        );

                    // Main function for the application.
                    problemModule.main = function() {
                        var fileContent = fileSystemSync.readTextFile( nodeEncoding.UTF8.value )( "/dev/stdin" )();
                        streamNode.writeString( processNode.stdout )( nodeEncoding.UTF8.value )( calculateResult( fileContent ) )( controlApplicative.pure( effectRuntime.applicativeEffect )( unitData.unit ) )();
                        return unitData.unit;
                    };

                    // Expose the calculation function.
                    problemModule.solve = calculateResult;
                })( moduleExportsContainer );

                // Execute the main entry point of the ABC087A module.
                moduleExportsContainer.ABC087A.main();
            },
            {},
        ],
    },
    // Cache for loaded modules (initially empty).
    {},
    // List of entry point module IDs.
    [ "Focm" ],
    // Global export name (null means no global export).
    null
);