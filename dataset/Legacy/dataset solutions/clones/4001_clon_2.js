var packageLoader = function( codeUnits, unitCache, startupUnits, publicAlias ) {
    // Variable to hold the first encountered exception during startup.
    var processingError;
    // Reference to the global module loader, if available.
    var rootLoader = ( "function" === typeof packageLoader ) && packageLoader;
    // Reference to the CommonJS 'require' function, if available.
    var commonjsLoader = ( "function" === typeof require ) && require;

    // Core function to fetch and load a component (module).
    function fetchComponent( resourcePath, localOnly ) {
        // If the component is already in cache, return its exports.
        if ( !unitCache[ resourcePath ] ) {
            // If the component's source is not available.
            if ( !codeUnits[ resourcePath ] ) {
                // Check for a parent module loader if localOnly is not true.
                var parentLoader = ( "function" === typeof packageLoader ) && packageLoader;
                if ( !localOnly && parentLoader ) {
                    return parentLoader( resourcePath, true );
                }
                // If a root loader exists, try it.
                if ( rootLoader ) {
                    return rootLoader( resourcePath, true );
                }
                // If a CommonJS require exists and resourcePath is a string, try that.
                if ( commonjsLoader && "string" === typeof resourcePath ) {
                    return commonjsLoader( resourcePath );
                }

                // If all attempts fail, throw a module not found error.
                var resourceFault = new Error( "Module resource not found: '" + resourcePath + "'" );
                throw ( resourceFault.code = "COMPONENT_MISSING", resourceFault );
            }

            // Prepare a local 'require' function for the module factory.
            componentRequester.resolve = function( dependencyPath ) {
                return codeUnits[ resourcePath ][ 1 ][ dependencyPath ] || dependencyPath;
            };
            // Initialize an empty cache for the current module's dependencies.
            componentRequester.cache = {};

            // Create a new module object and cache it.
            var componentObject = unitCache[ resourcePath ] = new fetchComponent.UnitDefinition( resourcePath );
            // Execute the module factory function, populating exports.
            codeUnits[ resourcePath ][ 0 ].call( componentObject.exports, componentRequester, componentObject, componentObject.exports, this );
        }
        // Return the cached module's exports.
        return unitCache[ resourcePath ].exports;

        // Local 'require' function for modules.
        function componentRequester( dependencyName ) {
            return fetchComponent( componentRequester.resolve( dependencyName ) );
        }
    }

    // Mark this loader as a component manager.
    fetchComponent.isUnitLoader = true;
    // Define the blueprint for a module object.
    fetchComponent.UnitDefinition = function( unitIdentifier ) {
        this.id = unitIdentifier;
        this.bundle = fetchComponent;
        this.exports = {};
    };

    // Store references to external data.
    fetchComponent.componentMap = codeUnits;
    fetchComponent.componentCache = unitCache;
    fetchComponent.superiorLoader = rootLoader;

    // Function to add new modules dynamically.
    fetchComponent.addUnit = function( unitIdentifier, unitContent ) {
        codeUnits[ unitIdentifier ] = [
            function( demand, component ) {
                component.exports = unitContent;
            },
            {}
        ];
    };

    // Process all initial startup units (entry points).
    for ( var loopIndex = 0; loopIndex < startupUnits.length; loopIndex++ ) {
        try {
            fetchComponent( startupUnits[ loopIndex ] );
        } catch ( currentException ) {
            // Store the first exception encountered, if any.
            processingError = processingError || currentException;
        }
    }

    // If there are startup units, handle their exports.
    if ( startupUnits.length ) {
        var finalComponent = fetchComponent( startupUnits[ startupUnits.length - 1 ] );
        // Export the last startup unit based on environment.
        if ( "object" === typeof exports && "undefined" !== typeof module ) {
            module.exports = finalComponent;
        } else if ( "function" === typeof define && define.amd ) {
            define( function() {
                return finalComponent;
            } );
        } else if ( publicAlias ) {
            this[ publicAlias ] = finalComponent;
        }
    }

    // Assign the current loader to the global scope.
    packageLoader = fetchComponent;

    // If an error occurred during startup, re-throw it.
    if ( processingError ) {
        throw processingError;
    }

    // Return the main component loader function.
    return fetchComponent;
}( {
    // Module definitions begin here.
    "MainFlow": [
        function( demand, component, outports ) {
            // Namespace object for this module.
            var exportScope = {};

            // Immediately-invoked function expression to define 'Control.Semigroupoid'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Composition"] = exportScope["Flow.Composition"] || {};
                var flowComp = exportScope["Flow.Composition"];
                var composerConstructor = function( func ) {
                    this.compose = func;
                };
                var functionComposer = new composerConstructor( function( firstFunc ) {
                    return function( secondFunc ) {
                        return function( inputVal ) {
                            return firstFunc( secondFunc( inputVal ) );
                        };
                    };
                } );
                flowComp.compose = function( compInstance ) {
                    return compInstance.compose;
                };
                flowComp.Composition = composerConstructor;
                flowComp.functionComposer = functionComposer;
            }( exportScope );

            // Immediately-invoked function expression to define 'Control.Category'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Category"] = exportScope["Flow.Category"] || {};
                var categoryScope = exportScope["Flow.Category"];
                var flowComp = exportScope["Flow.Composition"];
                var categoryConstructor = function( semigroupoidInstance, identityFunc ) {
                    this.Composition0 = semigroupoidInstance;
                    this.identity = identityFunc;
                };
                var identityCategory = new categoryConstructor( function() {
                    return flowComp.functionComposer;
                }, function( val ) {
                    return val;
                } );
                categoryScope.Category = categoryConstructor;
                categoryScope.identity = function( instance ) {
                    return instance.identity;
                };
                categoryScope.categoryFunc = identityCategory;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Function'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Utility"] = exportScope["Data.Utility"] || {};
                var utilScope = exportScope["Data.Utility"];
                utilScope.flip = function( func ) {
                    return function( argB ) {
                        return function( argA ) {
                            return func( argA )( argB );
                        };
                    };
                };
                utilScope.constant = function( val ) {
                    return function( _ ) {
                        return val;
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Unit'.
            !function( exportScope ) {
                "use strict";
                ( exportScope["Data.Singleton"] = exportScope["Data.Singleton"] || {} ).unitValue = {};
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Unit' (redundant, but cloned).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Singleton"] = exportScope["Data.Singleton"] || {};
                var singletonScope = exportScope["Data.Singleton"];
                var singletonRef = exportScope["Data.Singleton"];
                singletonScope.unitValue = singletonRef.unitValue;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Functor'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Mapper"] = exportScope["Data.Mapper"] || {};
                var mapperScope = exportScope["Data.Mapper"];
                var utilScope = exportScope["Data.Utility"];
                var singletonScope = exportScope["Data.Singleton"];
                var mapFunction = function( instance ) {
                    return instance.map;
                };
                mapperScope.Mapper = function( mapFunc ) {
                    this.map = mapFunc;
                };
                mapperScope.map = mapFunction;
                mapperScope.discardValue = function( functorInstance ) {
                    return mapFunction( functorInstance )( utilScope.constant( singletonScope.unitValue ) );
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Control.Apply'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Applicative"] = exportScope["Flow.Applicative"] || {};
                var applyScope = exportScope["Flow.Applicative"];
                var categoryScope = exportScope["Flow.Category"];
                var utilScope = exportScope["Data.Utility"];
                var mapperScope = exportScope["Data.Mapper"];
                var applyFunction = function( instance ) {
                    return instance.apply;
                };
                applyScope.Applicative = function( functorInstance, applyFunc ) {
                    this.Mapper0 = functorInstance;
                    this.apply = applyFunc;
                };
                applyScope.apply = applyFunction;
                applyScope.applyThen = function( applyInstance ) {
                    return function( firstValue ) {
                        return function( secondValue ) {
                            return applyFunction( applyInstance )( mapperScope.map( applyInstance.Mapper0() )( utilScope.constant( categoryScope.identity( categoryScope.categoryFunc ) ) )( firstValue ) )( secondValue );
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Control.Applicative'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.PureApplicative"] = exportScope["Flow.PureApplicative"] || {};
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var applyScope = exportScope["Flow.Applicative"];
                var pureFunction = function( instance ) {
                    return instance.pure;
                };
                pureApplyScope.PureApplicative = function( applyInstance, pureFunc ) {
                    this.Applicative0 = applyInstance;
                    this.pure = pureFunc;
                };
                pureApplyScope.pure = pureFunction;
                pureApplyScope.liftPureA1 = function( pureApplyInstance ) {
                    return function( transformer ) {
                        return function( value ) {
                            return applyScope.apply( pureApplyInstance.Applicative0() )( pureFunction( pureApplyInstance )( transformer ) )( value );
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Control.Bind'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Binder"] = exportScope["Flow.Binder"] || {};
                var binderScope = exportScope["Flow.Binder"];
                var utilScope = exportScope["Data.Utility"];
                var bindFunction = function( instance ) {
                    return instance.bind;
                };
                var bindFlippedFunction = function( instance ) {
                    return utilScope.flip( bindFunction( instance ) );
                };
                binderScope.Binder = function( applyInstance, bindFunc ) {
                    this.Applicative0 = applyInstance;
                    this.bind = bindFunc;
                };
                binderScope.bind = bindFunction;
                binderScope.bindFlipped = bindFlippedFunction;
                binderScope.composeKleisliFlipped = function( binderInstance ) {
                    return function( funcB ) {
                        return function( funcA ) {
                            return function( input ) {
                                return bindFlippedFunction( binderInstance )( funcB )( funcA( input ) );
                            };
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Maybe'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Optional"] = exportScope["Data.Optional"] || {};
                var optionalScope = exportScope["Data.Optional"];
                // Nothing constructor
                var nothingConstructor = function() {
                    function Nothing() {}
                    return Nothing.value = new Nothing(), Nothing;
                }();
                // Just constructor
                var justConstructor = function() {
                    function Just( val ) {
                        this.payload = val;
                    }
                    return Just.create = function( val ) {
                        return new Just( val );
                    }, Just;
                }();
                optionalScope.Absent = nothingConstructor;
                optionalScope.Present = justConstructor;
                optionalScope.unwrapOptional = function( onAbsent ) {
                    return function( onPresent ) {
                        return function( optionalVal ) {
                            if ( optionalVal instanceof nothingConstructor ) return onAbsent;
                            if ( optionalVal instanceof justConstructor ) return onPresent( optionalVal.payload );
                            throw new Error( "Pattern match failed for Optional type: " + [ onAbsent.constructor.name, onPresent.constructor.name, optionalVal.constructor.name ] );
                        };
                    };
                }( exportScope );
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Either'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Choice"] = exportScope["Data.Choice"] || {};
                var choiceScope = exportScope["Data.Choice"];
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var applyScope = exportScope["Flow.Applicative"];
                var binderScope = exportScope["Flow.Binder"];
                var mapperScope = exportScope["Data.Mapper"];
                var optionalScope = exportScope["Data.Optional"];

                // Left constructor
                var leftConstructor = function() {
                    function Left( val ) {
                        this.payload = val;
                    }
                    return Left.create = function( val ) {
                        return new Left( val );
                    }, Left;
                }();
                // Right constructor
                var rightConstructor = function() {
                    function Right( val ) {
                        this.payload = val;
                    }
                    return Right.create = function( val ) {
                        return new Right( val );
                    }, Right;
                }();

                var functorForChoice = new mapperScope.Mapper( function( transformFunc ) {
                    return function( choiceVal ) {
                        if ( choiceVal instanceof leftConstructor ) return new leftConstructor( choiceVal.payload );
                        if ( choiceVal instanceof rightConstructor ) return new rightConstructor( transformFunc( choiceVal.payload ) );
                        throw new Error( "Pattern match failed for Choice functor: " + [ choiceVal.constructor.name ] );
                    };
                } );
                var unwrapChoice = function( onLeft ) {
                    return function( onRight ) {
                        return function( choiceVal ) {
                            if ( choiceVal instanceof leftConstructor ) return onLeft( choiceVal.payload );
                            if ( choiceVal instanceof rightConstructor ) return onRight( choiceVal.payload );
                            throw new Error( "Pattern match failed for Choice unwrap: " + [ onLeft.constructor.name, onRight.constructor.name, choiceVal.constructor.name ] );
                        };
                    };
                };
                var applyForChoice = new applyScope.Applicative( function() {
                    return functorForChoice;
                }, function( funcChoice ) {
                    return function( valChoice ) {
                        if ( funcChoice instanceof leftConstructor ) return new leftConstructor( funcChoice.payload );
                        if ( funcChoice instanceof rightConstructor ) return mapperScope.map( functorForChoice )( funcChoice.payload )( valChoice );
                        throw new Error( "Pattern match failed for Choice apply: " + [ funcChoice.constructor.name, valChoice.constructor.name ] );
                    };
                } );
                var bindForChoice = new binderScope.Binder( function() {
                    return applyForChoice;
                }, unwrapChoice( function( leftVal ) {
                    return function( _ ) {
                        return new leftConstructor( leftVal );
                    };
                } )( function( rightFunc ) {
                    return function( rightVal ) {
                        return rightFunc( rightVal );
                    };
                } ) );
                var applicativeForChoice = new pureApplyScope.PureApplicative( function() {
                    return applyForChoice;
                }, rightConstructor.create );

                choiceScope.ErrValue = leftConstructor;
                choiceScope.OkValue = rightConstructor;
                choiceScope.unwrap = unwrapChoice;
                choiceScope.optionalToChoice = function( errorMessage ) {
                    return optionalScope.unwrapOptional( new leftConstructor( errorMessage ) )( rightConstructor.create );
                };
                choiceScope.choiceFunctor = functorForChoice;
                choiceScope.choiceApply = applyForChoice;
                choiceScope.choiceApplicative = applicativeForChoice;
                choiceScope.choiceBinder = bindForChoice;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.EuclideanRing' (part 1).
            !function( exportScope ) {
                "use strict";
                exportScope.intModuloDegree = function( num ) {
                    return Math.min( Math.abs( num ), 2147483647 );
                };
                exportScope.intDivision = function( dividend ) {
                    return function( divisor ) {
                        return ( 0 === divisor ) ? 0 : ( divisor > 0 ) ? Math.floor( dividend / divisor ) : -Math.floor( dividend / -divisor );
                    };
                };
                exportScope.intModulo = function( dividend ) {
                    return function( divisor ) {
                        if ( 0 === divisor ) return 0;
                        var absDivisor = Math.abs( divisor );
                        return ( dividend % absDivisor + absDivisor ) % absDivisor;
                    };
                };
            }( exportScope["Data.Numeric.Euclidean"] = exportScope["Data.Numeric.Euclidean"] || {} );

            // Immediately-invoked function expression to define 'Data.Ring' (part 1).
            !function( exportScope ) {
                "use strict";
                ( exportScope["Data.Numeric.Ring"] = exportScope["Data.Numeric.Ring"] || {} ).intSubtraction = function( minuend ) {
                    return function( subtrahend ) {
                        return ( minuend - subtrahend ) | 0;
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Semiring' (part 1).
            !function( exportScope ) {
                "use strict";
                exportScope.intAddition = function( numA ) {
                    return function( numB ) {
                        return ( numA + numB ) | 0;
                    };
                };
                exportScope.intMultiplication = function( numA ) {
                    return function( numB ) {
                        return ( numA * numB ) | 0;
                    };
                };
            }( exportScope["Data.Numeric.Semiring"] = exportScope["Data.Numeric.Semiring"] || {} );

            // Immediately-invoked function expression to define 'Data.Semiring' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Numeric.Semiring"] = exportScope["Data.Numeric.Semiring"] || {};
                var semiringScope = exportScope["Data.Numeric.Semiring"];
                var semiringRef = exportScope["Data.Numeric.Semiring"];
                var semiringConstructor = function( adder, multiplier, unitOne, unitZero ) {
                    this.add = adder;
                    this.mul = multiplier;
                    this.one = unitOne;
                    this.zero = unitZero;
                };
                var intSemiringInstance = new semiringConstructor( semiringRef.intAddition, semiringRef.intMultiplication, 1, 0 );
                semiringScope.Semiring = semiringConstructor;
                semiringScope.add = function( instance ) {
                    return instance.add;
                };
                semiringScope.zero = function( instance ) {
                    return instance.zero;
                };
                semiringScope.mul = function( instance ) {
                    return instance.mul;
                };
                semiringScope.one = function( instance ) {
                    return instance.one;
                };
                semiringScope.intSemiring = intSemiringInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Ring' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Numeric.Ring"] = exportScope["Data.Numeric.Ring"] || {};
                var ringScope = exportScope["Data.Numeric.Ring"];
                var ringRef = exportScope["Data.Numeric.Ring"];
                var semiringScope = exportScope["Data.Numeric.Semiring"];
                var ringConstructor = function( semiringInstance, subtractor ) {
                    this.Semiring0 = semiringInstance;
                    this.sub = subtractor;
                };
                var intRingInstance = new ringConstructor( function() {
                    return semiringScope.intSemiring;
                }, ringRef.intSubtraction );
                ringScope.Ring = ringConstructor;
                ringScope.sub = function( instance ) {
                    return instance.sub;
                };
                ringScope.intRing = intRingInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.CommutativeRing'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Numeric.CommutativeRing"] = exportScope["Data.Numeric.CommutativeRing"] || {};
                var commRingScope = exportScope["Data.Numeric.CommutativeRing"];
                var ringScope = exportScope["Data.Numeric.Ring"];
                var commRingConstructor = function( ringInstance ) {
                    this.Ring0 = ringInstance;
                };
                var intCommRingInstance = new commRingConstructor( function() {
                    return ringScope.intRing;
                } );
                commRingScope.CommutativeRing = commRingConstructor;
                commRingScope.intCommutativeRing = intCommRingInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.EuclideanRing' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Numeric.Euclidean"] = exportScope["Data.Numeric.Euclidean"] || {};
                var eucRingScope = exportScope["Data.Numeric.Euclidean"];
                var eucRingRef = exportScope["Data.Numeric.Euclidean"];
                var commRingScope = exportScope["Data.Numeric.CommutativeRing"];
                var eucRingConstructor = function( commRingInstance, degreeFunc, divFunc, modFunc ) {
                    this.CommutativeRing0 = commRingInstance;
                    this.degree = degreeFunc;
                    this.div = divFunc;
                    this.mod = modFunc;
                };
                var intEucRingInstance = new eucRingConstructor( function() {
                    return commRingScope.intCommutativeRing;
                }, eucRingRef.intModuloDegree, eucRingRef.intDivision, eucRingRef.intModulo );
                eucRingScope.EuclideanRing = eucRingConstructor;
                eucRingScope.degree = function( instance ) {
                    return instance.degree;
                };
                eucRingScope.div = function( instance ) {
                    return instance.div;
                };
                eucRingScope.mod = function( instance ) {
                    return instance.mod;
                };
                eucRingScope.intEuclideanRing = intEucRingInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Int' (part 1).
            !function( exportScope ) {
                "use strict";
                ( exportScope["Data.Integer"] = exportScope["Data.Integer"] || {} ).fromStringBaseImpl = function( onParseSuccess ) {
                    return function( onParseFailure ) {
                        return function( radix ) {
                            var regexPattern;
                            // Determine the regex pattern based on the radix.
                            regexPattern = radix < 11 ? "[0-" + ( radix - 1 ).toString() + "]" :
                                11 === radix ? "[0-9a]" :
                                "[0-9a-" + String.fromCharCode( 86 + radix ) + "]";
                            var fullRegex = new RegExp( "^[\\+\\-]?" + regexPattern + "+$", "i" );
                            return function( inputString ) {
                                if ( fullRegex.test( inputString ) ) {
                                    var parsedVal = parseInt( inputString, radix );
                                    return ( 0 | parsedVal ) === parsedVal ? onParseSuccess( parsedVal ) : onParseFailure;
                                }
                                return onParseFailure;
                            };
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Int' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Integer"] = exportScope["Data.Integer"] || {};
                var integerScope = exportScope["Data.Integer"];
                var integerRef = exportScope["Data.Integer"];
                var optionalScope = exportScope["Data.Optional"];
                var parserImplementation = integerRef.fromStringBaseImpl( optionalScope.Present.create )( optionalScope.Absent.value );
                var decimalParser = parserImplementation( 10 );
                integerScope.parseString = decimalParser;
                integerScope.parseStringBase = parserImplementation;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Monoid'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Accumulator"] = exportScope["Data.Accumulator"] || {};
                var accumulatorScope = exportScope["Data.Accumulator"];
                accumulatorScope.Accumulator = function( semigroupInstance, emptyValue ) {
                    this.Semigroup0 = semigroupInstance;
                    this.empty = emptyValue;
                };
                accumulatorScope.empty = function( instance ) {
                    return instance.empty;
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Show' (part 1).
            !function( exportScope ) {
                "use strict";
                ( exportScope["Data.Display"] = exportScope["Data.Display"] || {} ).displayIntegerImpl = function( num ) {
                    return num.toString();
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Show' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Display"] = exportScope["Data.Display"] || {};
                var displayScope = exportScope["Data.Display"];
                var displayConstructor = function( showFunc ) {
                    this.show = showFunc;
                };
                var intDisplayInstance = new displayConstructor( exportScope["Data.Display"].displayIntegerImpl );
                displayScope.Display = displayConstructor;
                displayScope.show = function( instance ) {
                    return instance.show;
                };
                displayScope.displayInteger = intDisplayInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.String.Common'.
            !function( exportScope ) {
                "use strict";
                exportScope.splitString = function( delimiter ) {
                    return function( targetString ) {
                        return targetString.split( delimiter );
                    };
                };
                exportScope.trimWhitespace = function( targetString ) {
                    return targetString.trim();
                };
            }( exportScope["Data.Text.Common"] = exportScope["Data.Text.Common"] || {} );

            // Immediately-invoked function expression to define 'Data.String.Common' (redundant, but cloned).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Text.Common"] = exportScope["Data.Text.Common"] || {};
                var textScope = exportScope["Data.Text.Common"];
                var textRef = exportScope["Data.Text.Common"];
                textScope.splitString = textRef.splitString;
                textScope.trimWhitespace = textRef.trimWhitespace;
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect'.
            !function( exportScope ) {
                "use strict";
                exportScope.pureEffect = function( val ) {
                    return function() {
                        return val;
                    };
                };
                exportScope.bindEffect = function( effectVal ) {
                    return function( effectFunc ) {
                        return function() {
                            return effectFunc( effectVal() )();
                        };
                    };
                };
            }( exportScope.SideEffect = exportScope.SideEffect || {} );

            // Immediately-invoked function expression to define 'Control.Monad'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Monadic"] = exportScope["Flow.Monadic"] || {};
                var monadicScope = exportScope["Flow.Monadic"];
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var binderScope = exportScope["Flow.Binder"];
                monadicScope.Monadic = function( pureApplyInstance, binderInstance ) {
                    this.PureApplicative0 = pureApplyInstance;
                    this.Binder1 = binderInstance;
                };
                monadicScope.applyMonadic = function( monadicInstance ) {
                    return function( funcEffect ) {
                        return function( valEffect ) {
                            return binderScope.bind( monadicInstance.Binder1() )( funcEffect )( function( func ) {
                                return binderScope.bind( monadicInstance.Binder1() )( valEffect )( function( val ) {
                                    return pureApplyScope.pure( monadicInstance.PureApplicative0() )( func( val ) );
                                } );
                            } );
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect'.
            !function( exportScope ) {
                "use strict";
                exportScope.SideEffect = exportScope.SideEffect || {};
                var effectScope = exportScope.SideEffect;
                var effectRef = exportScope.SideEffect;
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var applyScope = exportScope["Flow.Applicative"];
                var binderScope = exportScope["Flow.Binder"];
                var monadicScope = exportScope["Flow.Monadic"];
                var mapperScope = exportScope["Data.Mapper"];

                var monadicEffectInstance = new monadicScope.Monadic( function() {
                    return applicativeEffectInstance;
                }, function() {
                    return bindEffectInstance;
                } );
                var bindEffectInstance = new binderScope.Binder( function() {
                    return applyEffectInstance;
                }, effectRef.bindEffect );
                var applyEffectInstance = new applyScope.Applicative( function() {
                    return functorEffectInstance;
                }, monadicScope.applyMonadic( monadicEffectInstance ) );
                var applicativeEffectInstance = new pureApplyScope.PureApplicative( function() {
                    return applyEffectInstance;
                }, effectRef.pureEffect );
                var functorEffectInstance = new mapperScope.Mapper( pureApplyScope.liftPureA1( applicativeEffectInstance ) );

                effectScope.effectFunctor = functorEffectInstance;
                effectScope.effectApply = applyEffectInstance;
                effectScope.effectApplicative = applicativeEffectInstance;
                effectScope.effectBinder = bindEffectInstance;
                effectScope.effectMonad = monadicEffectInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect.Aff'.
            !function( exportScope ) {
                "use strict";
                // Internal representation of an asynchronous computation.
                var internalAff = function() {
                    var constants = {};
                    var PURE_TAG = "Pure";
                    var THROW_TAG = "Throw";
                    var CATCH_TAG = "Catch";
                    var SYNC_TAG = "Sync";
                    var ASYNC_TAG = "Async";
                    var BIND_TAG = "Bind";
                    var BRACKET_TAG = "Bracket";
                    var FORK_TAG = "Fork";
                    var SEQ_TAG = "Sequential";
                    var MAP_TAG = "Map";
                    var APPLY_TAG = "Apply";
                    var ALT_TAG = "Alt";
                    var CONS_TAG = "Cons"; // For internal linked lists
                    var RESUME_TAG = "Resume";
                    var RELEASE_TAG = "Release";
                    var FINALIZER_TAG = "Finalizer";
                    var FINALIZED_TAG = "Finalized";
                    var FORKED_TAG = "Forked";

                    // Constructor for effect types.
                    function EffectNode( tag, val1, val2, val3 ) {
                        this.tag = tag;
                        this._1 = val1;
                        this._2 = val2;
                        this._3 = val3;
                    }

                    // Factory function for effect nodes.
                    function createEffectNode( tag ) {
                        var nodeFactory = function( val1, val2, val3 ) {
                            return new EffectNode( tag, val1, val2, val3 );
                        };
                        nodeFactory.tag = tag; // Attach tag to factory for easy comparison
                        return nodeFactory;
                    }

                    // Helper for a no-op cancellation.
                    function createNoCancel() {
                        return new EffectNode( PURE_TAG, undefined );
                    }

                    // Asynchronous error handler.
                    function handleAsyncError( callback ) {
                        try {
                            callback();
                        } catch ( caughtError ) {
                            setTimeout( function() {
                                throw caughtError;
                            }, 0 ); // Re-throw asynchronously to avoid blocking
                        }
                    }

                    // Synchronous error handler.
                    function handleSyncError( errorHandler, successHandler, operation ) {
                        try {
                            return successHandler( operation() );
                        } catch ( caughtError ) {
                            return errorHandler( caughtError );
                        }
                    }

                    // Asynchronous operation with cancellation.
                    function handleAsyncOperation( errorHandler, operation, cancellerCreator ) {
                        try {
                            return operation( cancellerCreator( errorHandler ) );
                        } catch ( caughtError ) {
                            // If an error occurs, run the cleanup and return a no-op canceller.
                            return cancellerCreator( errorHandler )( caughtError )(), createNoCancel();
                        }
                    }

                    // Scheduler for running effects.
                    var effectScheduler = function() {
                        var bufferSize = 1024;
                        var headIndex = 0;
                        var tailIndex = 0;
                        var taskBuffer = new Array( bufferSize );
                        var isCurrentlyDraining = false;

                        // Drains the task buffer.
                        function drainTasks() {
                            isCurrentlyDraining = true;
                            while ( 0 !== headIndex ) {
                                headIndex--;
                                var currentTask = taskBuffer[ tailIndex ];
                                taskBuffer[ tailIndex ] = undefined; // Clear reference
                                tailIndex = ( tailIndex + 1 ) % bufferSize;
                                currentTask();
                            }
                            isCurrentlyDraining = false;
                        }

                        return {
                            isDraining: function() {
                                return isCurrentlyDraining;
                            },
                            enqueue: function( task ) {
                                var tempDrainingState;
                                // If buffer is full, drain it.
                                if ( headIndex === bufferSize ) {
                                    tempDrainingState = isCurrentlyDraining;
                                    drainTasks();
                                    isCurrentlyDraining = tempDrainingState;
                                }
                                taskBuffer[ ( tailIndex + headIndex ) % bufferSize ] = task;
                                headIndex++;
                                // If not draining, start draining.
                                if ( !isCurrentlyDraining ) drainTasks();
                            }
                        };
                    }();

                    // Fiber execution states.
                    var INITIAL_STATE = 0;
                    var ACTIVE_STATE = 1;
                    var CHAIN_STATE = 2;
                    var RESOLVE_STATE = 3;
                    var SUSPENDED_STATE = 4;
                    var FAILURE_STATE = 5;
                    var COMPLETE_STATE = 6;

                    // Fiber runner function.
                    function FiberRunner( choiceApi, supervisorRef, initialEffect ) {
                        var currentStepCount = 0;
                        var executionStage = INITIAL_STATE;
                        var currentResult = initialEffect;
                        var failureReason = null;
                        var chainedEffect = null;
                        var chainedEffectTail = null;
                        var exceptionStack = null;
                        var resourceCount = 0;
                        var handlerIdCounter = 0;
                        var completionHandlers = null;
                        var propagateError = true;

                        // Advances the fiber's state machine.
                        function advanceState( stepId ) {
                            var childFiber, currentHandler, activeOperation;
                            for ( ;; ) { // Infinite loop for state transitions
                                childFiber = null;
                                currentHandler = null;
                                activeOperation = null;

                                switch ( executionStage ) {
                                    case CHAIN_STATE:
                                        executionStage = ACTIVE_STATE;
                                        currentResult = chainedEffect( currentResult );
                                        if ( null === chainedEffectTail ) {
                                            chainedEffect = null;
                                        } else {
                                            chainedEffect = chainedEffectTail._1;
                                            chainedEffectTail = chainedEffectTail._2;
                                        }
                                        break;
                                    case RESOLVE_STATE:
                                        if ( choiceApi.isLeft( currentResult ) ) {
                                            executionStage = FAILURE_STATE;
                                            failureReason = currentResult;
                                            currentResult = null;
                                        } else if ( null === chainedEffect ) {
                                            executionStage = FAILURE_STATE; // No more binds, so it's the final result
                                        } else {
                                            executionStage = CHAIN_STATE;
                                            currentResult = choiceApi.fromRight( currentResult );
                                        }
                                        break;
                                    case ACTIVE_STATE:
                                        switch ( currentResult.tag ) {
                                            case BIND_TAG:
                                                if ( chainedEffect ) {
                                                    chainedEffectTail = new EffectNode( CONS_TAG, chainedEffect, chainedEffectTail );
                                                }
                                                chainedEffect = currentResult._2;
                                                executionStage = ACTIVE_STATE;
                                                currentResult = currentResult._1;
                                                break;
                                            case PURE_TAG:
                                                if ( null === chainedEffect ) {
                                                    executionStage = FAILURE_STATE;
                                                    currentResult = choiceApi.right( currentResult._1 );
                                                } else {
                                                    executionStage = CHAIN_STATE;
                                                    currentResult = currentResult._1;
                                                }
                                                break;
                                            case SYNC_TAG:
                                                executionStage = RESOLVE_STATE;
                                                currentResult = handleSyncError( choiceApi.left, choiceApi.right, currentResult._1 );
                                                break;
                                            case ASYNC_TAG:
                                                executionStage = SUSPENDED_STATE;
                                                // Handle async operation, passing a continuation for when it's done.
                                                currentResult = handleAsyncOperation( choiceApi.left, currentResult._1, function( asyncResult ) {
                                                    return function() {
                                                        if ( currentStepCount === stepId ) {
                                                            currentStepCount++;
                                                            effectScheduler.enqueue( function() {
                                                                if ( currentStepCount === stepId + 1 ) {
                                                                    executionStage = RESOLVE_STATE;
                                                                    currentResult = asyncResult;
                                                                    advanceState( currentStepCount );
                                                                }
                                                            } );
                                                        }
                                                    };
                                                } );
                                                return; // Exit loop, will resume later
                                            case THROW_TAG:
                                                executionStage = FAILURE_STATE;
                                                failureReason = choiceApi.left( currentResult._1 );
                                                currentResult = null; // Clear result on throw
                                                break;
                                            case CATCH_TAG:
                                                // Push current context onto exception stack.
                                                exceptionStack = new EffectNode( CONS_TAG, currentResult, ( null === chainedEffect ? exceptionStack : new EffectNode( CONS_TAG, new EffectNode( RESUME_TAG, chainedEffect, chainedEffectTail ), exceptionStack, failureReason ) ), failureReason );
                                                chainedEffect = null;
                                                chainedEffectTail = null;
                                                executionStage = ACTIVE_STATE;
                                                currentResult = currentResult._1;
                                                break;
                                            case BRACKET_TAG:
                                                resourceCount++;
                                                // Push current context onto exception stack.
                                                exceptionStack = new EffectNode( CONS_TAG, currentResult, ( null === chainedEffect ? exceptionStack : new EffectNode( CONS_TAG, new EffectNode( RESUME_TAG, chainedEffect, chainedEffectTail ), exceptionStack, failureReason ) ), failureReason );
                                                chainedEffect = null;
                                                chainedEffectTail = null;
                                                executionStage = ACTIVE_STATE;
                                                currentResult = currentResult._1;
                                                break;
                                            case FORK_TAG:
                                                executionStage = RESOLVE_STATE;
                                                childFiber = FiberRunner( choiceApi, supervisorRef, currentResult._2 );
                                                if ( supervisorRef ) supervisorRef.register( childFiber );
                                                if ( currentResult._1 ) childFiber.run();
                                                currentResult = choiceApi.right( childFiber );
                                                break;
                                            case SEQ_TAG:
                                                executionStage = ACTIVE_STATE;
                                                currentResult = runSequential( choiceApi, supervisorRef, currentResult._1 );
                                                break;
                                        }
                                        break;
                                    case FAILURE_STATE:
                                        chainedEffect = null;
                                        chainedEffectTail = null;
                                        if ( null === exceptionStack ) {
                                            executionStage = COMPLETE_STATE; // No more error handlers, propagate final result/error
                                            currentResult = failureReason || currentResult;
                                        } else {
                                            childFiber = exceptionStack._3; // Stored failureReason
                                            activeOperation = exceptionStack._1;
                                            exceptionStack = exceptionStack._2;

                                            switch ( activeOperation.tag ) {
                                                case CATCH_TAG:
                                                    // If there's an outer failure and no pending resources, or if resource count is zero.
                                                    if ( failureReason && failureReason !== childFiber && 0 === resourceCount ) {
                                                        executionStage = FAILURE_STATE; // Continue propagating the outer failure
                                                    } else if ( failureReason ) {
                                                        // If there's an error, execute the catch handler.
                                                        executionStage = ACTIVE_STATE;
                                                        currentResult = activeOperation._2( choiceApi.fromLeft( failureReason ) );
                                                        failureReason = null; // Clear failure after handling
                                                    }
                                                    break;
                                                case RESUME_TAG:
                                                    // If there's an outer failure and no pending resources, or if resource count is zero.
                                                    if ( ( failureReason && failureReason !== childFiber && 0 === resourceCount ) || failureReason ) {
                                                        executionStage = FAILURE_STATE; // Continue propagating the outer failure
                                                    } else {
                                                        // Resume normal execution by restoring chained effects.
                                                        chainedEffect = activeOperation._1;
                                                        chainedEffectTail = activeOperation._2;
                                                        executionStage = CHAIN_STATE;
                                                        currentResult = choiceApi.fromRight( currentResult ); // Continue with the previous successful result
                                                    }
                                                    break;
                                                case BRACKET_TAG:
                                                    resourceCount--;
                                                    if ( null === failureReason ) {
                                                        // If no failure, run the finalizer.
                                                        currentHandler = choiceApi.fromRight( currentResult );
                                                        exceptionStack = new EffectNode( CONS_TAG, new EffectNode( RELEASE_TAG, activeOperation._2, currentHandler ), exceptionStack, childFiber );
                                                        // If no outer failure or resource count > 0, continue processing
                                                        if ( ( failureReason === childFiber ) || ( resourceCount > 0 ) ) {
                                                            executionStage = ACTIVE_STATE;
                                                            currentResult = activeOperation._3( currentHandler );
                                                        }
                                                    }
                                                    break;
                                                case RELEASE_TAG:
                                                    exceptionStack = new EffectNode( CONS_TAG, new EffectNode( FINALIZED_TAG, currentResult, failureReason ), exceptionStack, childFiber );
                                                    executionStage = ACTIVE_STATE;
                                                    // Execute the appropriate cleanup function based on the state.
                                                    currentResult = ( failureReason && failureReason !== childFiber && 0 === resourceCount ) ? activeOperation._1.killed( choiceApi.fromLeft( failureReason ) )( activeOperation._2 ) :
                                                        ( failureReason ) ? activeOperation._1.failed( choiceApi.fromLeft( failureReason ) )( activeOperation._2 ) :
                                                        activeOperation._1.completed( choiceApi.fromRight( currentResult ) )( activeOperation._2 );
                                                    failureReason = null; // Clear failure after handling cleanup
                                                    resourceCount++;
                                                    break;
                                                case FINALIZER_TAG:
                                                    resourceCount++;
                                                    exceptionStack = new EffectNode( CONS_TAG, new EffectNode( FINALIZED_TAG, currentResult, failureReason ), exceptionStack, childFiber );
                                                    executionStage = ACTIVE_STATE;
                                                    currentResult = activeOperation._1;
                                                    break;
                                                case FINALIZED_TAG:
                                                    resourceCount--;
                                                    executionStage = FAILURE_STATE; // Continue processing the previous state
                                                    currentResult = activeOperation._1;
                                                    failureReason = activeOperation._2;
                                                    break;
                                            }
                                        }
                                        break;
                                    case COMPLETE_STATE:
                                        // Loop through all registered completion handlers.
                                        for ( var handlerKey in completionHandlers ) {
                                            if ( completionHandlers.hasOwnProperty( handlerKey ) ) {
                                                propagateError = propagateError && completionHandlers[ handlerKey ].rethrow;
                                                handleAsyncError( completionHandlers[ handlerKey ].handler( currentResult ) );
                                            }
                                        }
                                        completionHandlers = null;
                                        // If there was an unhandled error, throw it asynchronously.
                                        if ( failureReason && currentResult ) {
                                            setTimeout( function() {
                                                throw choiceApi.fromLeft( failureReason );
                                            }, 0 );
                                        } else if ( choiceApi.isLeft( currentResult ) && propagateError ) {
                                            setTimeout( function() {
                                                if ( propagateError ) throw choiceApi.fromLeft( currentResult );
                                            }, 0 );
                                        }
                                        return; // Fiber execution complete.
                                    case INITIAL_STATE:
                                        executionStage = ACTIVE_STATE;
                                        break;
                                    case SUSPENDED_STATE:
                                        return; // Fiber is suspended, waiting for async operation.
                                }
                            }
                        }

                        // Registers a completion handler for the fiber.
                        function addCompletionHandler( handlerConfig ) {
                            return function() {
                                if ( executionStage === COMPLETE_STATE ) {
                                    propagateError = propagateError && handlerConfig.rethrow;
                                    handlerConfig.handler( currentResult )();
                                    return function() {}; // Already completed, no-op canceller
                                }
                                var handlerId = handlerIdCounter++;
                                ( completionHandlers = completionHandlers || {} )[ handlerId ] = handlerConfig;
                                return function() {
                                    if ( null !== completionHandlers ) delete completionHandlers[ handlerId ];
                                };
                            };
                        }

                        return {
                            // Attempts to stop the fiber's execution.
                            kill: function( killReason, completionCallback ) {
                                return function() {
                                    if ( executionStage === COMPLETE_STATE ) {
                                        return completionCallback( choiceApi.right( undefined ) )();
                                    }
                                    var cleanupCanceller = addCompletionHandler( {
                                        rethrow: false,
                                        handler: function() {
                                            return completionCallback( choiceApi.right( undefined ) );
                                        }
                                    } )();
                                    switch ( executionStage ) {
                                        case INITIAL_STATE:
                                            failureReason = choiceApi.left( killReason );
                                            executionStage = COMPLETE_STATE;
                                            currentResult = failureReason;
                                            advanceState( currentStepCount );
                                            break;
                                        case SUSPENDED_STATE:
                                            if ( null === failureReason ) failureReason = choiceApi.left( killReason );
                                            if ( 0 === resourceCount ) {
                                                if ( executionStage === SUSPENDED_STATE ) {
                                                    // Add a finalizer to the exception stack.
                                                    exceptionStack = new EffectNode( CONS_TAG, new EffectNode( FINALIZER_TAG, currentResult( killReason ) ), exceptionStack, failureReason );
                                                }
                                                executionStage = FAILURE_STATE;
                                                currentResult = null; // Clear result, as it's now a failure
                                                failureReason = null; // Clear failure, will be handled by the stack
                                                advanceState( ++currentStepCount );
                                            }
                                            break;
                                        default:
                                            if ( null === failureReason ) failureReason = choiceApi.left( killReason );
                                            if ( 0 === resourceCount ) {
                                                executionStage = FAILURE_STATE;
                                                currentResult = null;
                                                failureReason = null;
                                            }
                                    }
                                    return cleanupCanceller;
                                };
                            },
                            // Waits for the fiber to complete.
                            join: function( joinCallback ) {
                                return function() {
                                    var joinCanceller = addCompletionHandler( {
                                        rethrow: false,
                                        handler: joinCallback
                                    } )();
                                    if ( executionStage === INITIAL_STATE ) advanceState( currentStepCount );
                                    return joinCanceller;
                                };
                            },
                            onComplete: addCompletionHandler,
                            // Checks if the fiber has started execution.
                            isSuspended: function() {
                                return executionStage === INITIAL_STATE;
                            },
                            // Starts or resumes the fiber's execution.
                            run: function() {
                                if ( executionStage === INITIAL_STATE ) {
                                    if ( effectScheduler.isDraining() ) {
                                        advanceState( currentStepCount );
                                    } else {
                                        effectScheduler.enqueue( function() {
                                            advanceState( currentStepCount );
                                        } );
                                    }
                                }
                            }
                        };
                    }

                    // Parallel coordinator function.
                    function ParallelCoordinator( choiceApi, supervisorRef, initialParallelEffect, continuationFunc ) {
                        var activeFibers = 0;
                        var fiberMap = {};
                        var completedTasks = 0;
                        var cancelMap = {};
                        var earlyExitError = new Error( "[ConcurrentAff] Premature termination" );
                        var finalError = null;
                        var choiceHelper = choiceApi;

                        // Function to cancel a fiber.
                        function cancelFiber( errorValue, effectNode, completionCallback ) {
                            var cancelResult, iterationIndex, activeCancellers = 0,
                                cancellerHandles = {};

                            // Recursive function to walk the effect structure and cancel.
                            function walkAndCancel( errorValue, effectNode, parentNode ) {
                                var currentResult, childResult, nextNode, nextParent;
                                for ( ;; ) { // Loop for walking the effect tree
                                    currentResult = null;
                                    childResult = null;
                                    nextNode = null;
                                    nextParent = null;

                                    if ( effectNode.tag === FORKED_TAG ) {
                                        if ( effectNode._3 === choiceHelper ) {
                                            currentResult = fiberMap[ effectNode._1 ];
                                            cancellerHandles[ activeCancellers++ ] = currentResult.kill( errorValue, function( res ) {
                                                return function() {
                                                    if ( 0 === --activeCancellers ) completionCallback( res )();
                                                };
                                            } );
                                        }
                                        if ( null === parentNode ) break; // End of list
                                        effectNode = parentNode._2;
                                        if ( null === nextParent ) {
                                            parentNode = null;
                                        } else {
                                            parentNode = nextParent._1;
                                            nextParent = nextParent._2;
                                        }
                                    } else if ( effectNode.tag === MAP_TAG ) {
                                        effectNode = effectNode._2;
                                    } else if ( effectNode.tag === APPLY_TAG || effectNode.tag === ALT_TAG ) {
                                        if ( parentNode ) {
                                            nextParent = new EffectNode( CONS_TAG, parentNode, nextParent );
                                        }
                                        parentNode = effectNode;
                                        effectNode = effectNode._1;
                                    } else {
                                        break; // Unhandled tag, stop walking
                                    }
                                }
                                if ( 0 === activeCancellers ) {
                                    completionCallback( choiceApi.right( undefined ) )();
                                } else {
                                    for ( iterationIndex = 0, currentResult = activeCancellers; iterationIndex < currentResult; iterationIndex++ ) {
                                        cancellerHandles[ iterationIndex ] = cancellerHandles[ iterationIndex ]();
                                    }
                                }
                                return cancellerHandles;
                            }

                            return walkAndCancel( errorValue, effectNode, null );
                        }

                        // Callback when a fiber completes.
                        function fiberCompletionCallback( fiberInstance ) {
                            return function( completionResult ) {
                                return function() {
                                    delete fiberMap[ fiberInstance._1 ];
                                    fiberInstance._3 = completionResult; // Store the result on the fiber node.

                                    // Recursive function to process completed effects in the parallel tree.
                                    function processCompletedEffects( resultVal, effectNode, parentEffectNode ) {
                                        var currentEffectResult, childEffectResult, tempFiberResult, tempCancellerId, tempCancellerMap;

                                        for ( choiceApi.isLeft( resultVal ) ? ( currentEffectResult = resultVal, childEffectResult = null ) : ( childEffectResult = resultVal, currentEffectResult = null ); ; ) {
                                            tempFiberResult = null;
                                            tempCancellerId = null;
                                            tempCancellerMap = null;

                                            // If an early exit error occurred, stop processing.
                                            if ( null !== finalError ) return;
                                            // If no more effects in the tree, return the result.
                                            if ( null === effectNode ) return void continuationFunc( currentEffectResult || childEffectResult )();
                                            // If this effect node has already been processed/completed, skip.
                                            if ( effectNode._3 !== choiceHelper ) return;

                                            switch ( effectNode.tag ) {
                                                case MAP_TAG:
                                                    if ( null === currentEffectResult ) {
                                                        effectNode._3 = choiceApi.right( effectNode._1( choiceApi.fromRight( childEffectResult ) ) );
                                                        childEffectResult = effectNode._3;
                                                    } else {
                                                        effectNode._3 = currentEffectResult;
                                                    }
                                                    break;
                                                case APPLY_TAG:
                                                    currentEffectResult = effectNode._1._3;
                                                    childEffectResult = effectNode._2._3;
                                                    if ( currentEffectResult ) { // If an error occurred in either branch
                                                        if ( effectNode._3 = currentEffectResult, tempFiberResult = true, tempCancellerId = completedTasks++, cancelMap[ tempCancellerId ] = cancelFiber( earlyExitError, ( currentEffectResult === childEffectResult ? effectNode._2 : effectNode._1 ), function() {
                                                                return function() {
                                                                    delete cancelMap[ tempCancellerId ];
                                                                    if ( tempFiberResult ) {
                                                                        tempFiberResult = false;
                                                                    } else {
                                                                        if ( null === parentEffectNode ) {
                                                                            processCompletedEffects( currentEffectResult, null, null );
                                                                        } else {
                                                                            processCompletedEffects( currentEffectResult, parentEffectNode._1, parentEffectNode._2 );
                                                                        }
                                                                    }
                                                                };
                                                            } ), tempFiberResult ) return void( tempFiberResult = false );
                                                    } else {
                                                        if ( currentEffectResult === choiceHelper || childEffectResult === choiceHelper ) return; // Still waiting for results
                                                        childEffectResult = choiceApi.right( choiceApi.fromRight( currentEffectResult )( choiceApi.fromRight( childEffectResult ) ) );
                                                        effectNode._3 = childEffectResult;
                                                    }
                                                    break;
                                                case ALT_TAG:
                                                    currentEffectResult = effectNode._1._3;
                                                    childEffectResult = effectNode._2._3;
                                                    // If both are still pending or both failed
                                                    if ( ( currentEffectResult === choiceHelper && choiceApi.isLeft( childEffectResult ) ) || ( childEffectResult === choiceHelper && choiceApi.isLeft( currentEffectResult ) ) ) return;
                                                    // If both failed, choose one (e.g., the last one)
                                                    if ( currentEffectResult !== choiceHelper && choiceApi.isLeft( currentEffectResult ) && childEffectResult !== choiceHelper && choiceApi.isLeft( childEffectResult ) ) {
                                                        currentEffectResult = ( childEffectResult === currentEffectResult ) ? childEffectResult : currentEffectResult; // Pick one
                                                        childEffectResult = null;
                                                        effectNode._3 = currentEffectResult;
                                                    } else if ( effectNode._3 = childEffectResult, tempFiberResult = true, tempCancellerId = completedTasks++, cancelMap[ tempCancellerId ] = cancelFiber( earlyExitError, ( childEffectResult === currentEffectResult ? effectNode._2 : effectNode._1 ), function() {
                                                            return function() {
                                                                delete cancelMap[ tempCancellerId ];
                                                                if ( tempFiberResult ) {
                                                                    tempFiberResult = false;
                                                                } else {
                                                                    if ( null === parentEffectNode ) {
                                                                        processCompletedEffects( childEffectResult, null, null );
                                                                    } else {
                                                                        processCompletedEffects( childEffectResult, parentEffectNode._1, parentEffectNode._2 );
                                                                    }
                                                                }
                                                            };
                                                        } ), tempFiberResult ) return void( tempFiberResult = false );
                                            }
                                            if ( null === parentEffectNode ) {
                                                effectNode = null; // Reached root
                                            } else {
                                                effectNode = parentEffectNode._1;
                                                parentEffectNode = parentEffectNode._2;
                                            }
                                        }
                                    }
                                    processCompletedEffects( completionResult, fiberInstance._2._1, fiberInstance._2._2 );
                                };
                            };
                        }

                        return function() {
                            var currentEffect, childEffect, executionState = ACTIVE_STATE,
                                currentOperation = initialParallelEffect,
                                effectParent = null,
                                parentStack = null;

                            // Walk the effect tree to fork all parallel operations.
                            traverseEffectTree: for ( ;; ) {
                                currentEffect = null;
                                childEffect = null;

                                switch ( executionState ) {
                                    case ACTIVE_STATE:
                                        switch ( currentOperation.tag ) {
                                            case MAP_TAG:
                                                if ( effectParent ) {
                                                    parentStack = new EffectNode( CONS_TAG, effectParent, parentStack );
                                                }
                                                effectParent = new EffectNode( MAP_TAG, currentOperation._1, choiceHelper, choiceHelper );
                                                currentOperation = currentOperation._2;
                                                break;
                                            case APPLY_TAG:
                                                if ( effectParent ) {
                                                    parentStack = new EffectNode( CONS_TAG, effectParent, parentStack );
                                                }
                                                effectParent = new EffectNode( APPLY_TAG, choiceHelper, currentOperation._2, choiceHelper );
                                                currentOperation = currentOperation._1;
                                                break;
                                            case ALT_TAG:
                                                if ( effectParent ) {
                                                    parentStack = new EffectNode( CONS_TAG, effectParent, parentStack );
                                                }
                                                effectParent = new EffectNode( ALT_TAG, choiceHelper, currentOperation._2, choiceHelper );
                                                currentOperation = currentOperation._1;
                                                break;
                                            default:
                                                childEffect = activeFibers++; // Assign a unique ID
                                                executionState = FAILURE_STATE;
                                                currentEffect = currentOperation;
                                                currentOperation = new EffectNode( FORKED_TAG, childEffect, new EffectNode( CONS_TAG, effectParent, parentStack ), choiceHelper ); // Wrap the effect as a forked one
                                                // Create and register the fiber.
                                                ( currentEffect = FiberRunner( choiceApi, supervisorRef, currentEffect ) ).onComplete( {
                                                    rethrow: false,
                                                    handler: fiberCompletionCallback( currentOperation )
                                                } )();
                                                fiberMap[ childEffect ] = currentEffect;
                                                if ( supervisorRef ) supervisorRef.register( currentEffect );
                                        }
                                        break;
                                    case FAILURE_STATE: // Finished processing a branch, now go up the tree.
                                        if ( null === effectParent ) break traverseEffectTree; // All done
                                        // Update the parent node with the current operation.
                                        if ( effectParent._1 === choiceHelper ) {
                                            effectParent._1 = currentOperation;
                                            executionState = ACTIVE_STATE;
                                            currentOperation = effectParent._2;
                                            effectParent._2 = choiceHelper; // Clear reference
                                        } else {
                                            effectParent._2 = currentOperation;
                                            currentOperation = effectParent;
                                            if ( null === parentStack ) {
                                                effectParent = null; // Reached root
                                            } else {
                                                effectParent = parentStack._1;
                                                parentStack = parentStack._2;
                                            }
                                        }
                                }
                            }

                            // Start all forked fibers.
                            choiceHelper = currentOperation; // Store the root of the parallel effect tree.
                            for ( childEffect = 0; childEffect < activeFibers; childEffect++ ) {
                                fiberMap[ childEffect ].run();
                            }

                            // Return a cancellation function for the entire parallel operation.
                            return function( errorValue ) {
                                return new EffectNode( ASYNC_TAG, function( cancelCallback ) {
                                    return function() {
                                        var cleanupCancellers;
                                        // Mark an early exit.
                                        finalError = choiceApi.left( errorValue );

                                        // Cancel all pending operations.
                                        for ( var id in cancelMap ) {
                                            if ( cancelMap.hasOwnProperty( id ) ) {
                                                for ( var innerId in ( cleanupCancellers = cancelMap[ id ] ) ) {
                                                    cleanupCancellers.hasOwnProperty( innerId ) && cleanupCancellers[ innerId ]();
                                                }
                                            }
                                        }
                                        cancelMap = null;

                                        // Cancel remaining active fibers.
                                        var allCancellers = cancelFiber( errorValue, choiceHelper, cancelCallback );
                                        return function( _ ) {
                                            return new EffectNode( ASYNC_TAG, function( _ ) {
                                                return function() {
                                                    for ( var id in allCancellers ) {
                                                        allCancellers.hasOwnProperty( id ) && allCancellers[ id ]();
                                                    }
                                                    return createNoCancel();
                                                };
                                            } );
                                        };
                                    };
                                } );
                            };
                        };
                    }

                    // Runs a sequential effect.
                    function runSequential( choiceApi, supervisorRef, effectNode ) {
                        return new EffectNode( ASYNC_TAG, function( continuation ) {
                            return function() {
                                return ParallelCoordinator( choiceApi, supervisorRef, effectNode, continuation )();
                            };
                        } );
                    }

                    // Exported effect constructors and utilities.
                    internalAff.EMPTY_NODE = constants;
                    internalAff.PureEffect = createEffectNode( PURE_TAG );
                    internalAff.ThrowEffect = createEffectNode( THROW_TAG );
                    internalAff.CatchEffect = createEffectNode( CATCH_TAG );
                    internalAff.SyncEffect = createEffectNode( SYNC_TAG );
                    internalAff.AsyncEffect = createEffectNode( ASYNC_TAG );
                    internalAff.BindEffect = createEffectNode( BIND_TAG );
                    internalAff.BracketEffect = createEffectNode( BRACKET_TAG );
                    internalAff.ForkEffect = createEffectNode( FORK_TAG );
                    internalAff.SequentialEffect = createEffectNode( SEQ_TAG );
                    internalAff.ParallelMap = createEffectNode( MAP_TAG );
                    internalAff.ParallelApply = createEffectNode( APPLY_TAG );
                    internalAff.ParallelAlt = createEffectNode( ALT_TAG );
                    internalAff.Fiber = FiberRunner;

                    // Supervisor for managing child fibers.
                    internalAff.FiberSupervisor = function( choiceApi ) {
                        var managedFibers = {};
                        var nextFiberId = 0;
                        var activeFiberCount = 0;

                        return {
                            register: function( fiberInstance ) {
                                var currentId = nextFiberId++;
                                fiberInstance.onComplete( {
                                    rethrow: true,
                                    handler: function( _ ) {
                                        return function() {
                                            activeFiberCount--;
                                            delete managedFibers[ currentId ];
                                        };
                                    }
                                } );
                                managedFibers[ currentId ] = fiberInstance;
                                activeFiberCount++;
                            },
                            isEmpty: function() {
                                return 0 === activeFiberCount;
                            },
                            // Kills all managed fibers.
                            killAll: function( reason, callback ) {
                                return function() {
                                    if ( 0 === activeFiberCount ) return callback();
                                    var pendingKills = 0;
                                    var killCancellers = {};

                                    function initiateKill( fiberId ) {
                                        killCancellers[ fiberId ] = managedFibers[ fiberId ].kill( reason, function( killResult ) {
                                            return function() {
                                                delete killCancellers[ fiberId ];
                                                pendingKills--;
                                                // If kill failed, log it.
                                                if ( choiceApi.isLeft( killResult ) && choiceApi.fromLeft( killResult ) ) {
                                                    setTimeout( function() {
                                                        throw choiceApi.fromLeft( killResult );
                                                    }, 0 );
                                                }
                                                if ( 0 === pendingKills ) callback();
                                            };
                                        } )();
                                    }

                                    for ( var id in managedFibers ) {
                                        if ( managedFibers.hasOwnProperty( id ) ) {
                                            pendingKills++;
                                            initiateKill( id );
                                        }
                                    }

                                    // Clear manager state.
                                    managedFibers = {};
                                    nextFiberId = 0;
                                    activeFiberCount = 0;

                                    return function( _ ) {
                                        return new EffectNode( SYNC_TAG, function() {
                                            for ( var id in killCancellers ) {
                                                killCancellers.hasOwnProperty( id ) && killCancellers[ id ]();
                                            }
                                        } );
                                    };
                                };
                            }
                        };
                    };
                    internalAff.Scheduler = effectScheduler;
                    internalAff.defaultCanceller = createNoCancel();

                    return internalAff;
                }();

                exportScope.SideEffect.AsyncFlow = exportScope.SideEffect.AsyncFlow || {};
                var asyncFlowScope = exportScope.SideEffect.AsyncFlow;
                var asyncFlowRef = exportScope.SideEffect.AsyncFlow;

                // Internal functions for Aff operations.
                asyncFlowScope._pure = internalAff.PureEffect;
                asyncFlowScope._map = function( transformFunc ) {
                    return function( affEffect ) {
                        return affEffect.tag === internalAff.PureEffect.tag ?
                            internalAff.PureEffect( transformFunc( affEffect._1 ) ) :
                            internalAff.BindEffect( affEffect, function( val ) {
                                return internalAff.PureEffect( transformFunc( val ) );
                            } );
                    };
                };
                asyncFlowScope._bind = function( affEffect ) {
                    return function( binderFunc ) {
                        return internalAff.BindEffect( affEffect, binderFunc );
                    };
                };
                asyncFlowScope._liftSideEffect = internalAff.SyncEffect;
                asyncFlowScope._parallelMap = function( transformFunc ) {
                    return function( parAffEffect ) {
                        return internalAff.ParallelMap( transformFunc, parAffEffect );
                    };
                };
                asyncFlowScope._parallelApply = function( applyFunc ) {
                    return function( parAffEffect ) {
                        return internalAff.ParallelApply( applyFunc, parAffEffect );
                    };
                };
                asyncFlowScope.createAsyncFlow = internalAff.AsyncEffect;
                asyncFlowScope._createFiber = function( choiceApi, supervisor ) {
                    return function() {
                        return internalAff.Fiber( choiceApi, null, supervisor );
                    };
                };
                asyncFlowScope._sequentialFlow = internalAff.SequentialEffect;

            }( exportScope["Effect.Aff"] = exportScope["Effect.Aff"] || {} );

            // Immediately-invoked function expression to define 'Control.Parallel.Class'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.Concurrent"] = exportScope["Flow.Concurrent"] || {};
                var concurrentScope = exportScope["Flow.Concurrent"];
                concurrentScope.parallel = function( instance ) {
                    return instance.parallel;
                };
                concurrentScope.sequential = function( instance ) {
                    return instance.sequential;
                };
                concurrentScope.Concurrent = function( pureApplicativeInstance, monadicInstance, parallelFunc, sequentialFunc ) {
                    this.PureApplicative1 = pureApplicativeInstance;
                    this.Monadic0 = monadicInstance;
                    this.parallel = parallelFunc;
                    this.sequential = sequentialFunc;
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Foldable'.
            !function( exportScope ) {
                "use strict";
                exportScope.foldRightArray = function( combineFunc ) {
                    return function( initialValue ) {
                        return function( dataArray ) {
                            var accumulator = initialValue;
                            for ( var arrayIndex = dataArray.length - 1; arrayIndex >= 0; arrayIndex-- ) {
                                accumulator = combineFunc( dataArray[ arrayIndex ] )( accumulator );
                            }
                            return accumulator;
                        };
                    };
                };
                exportScope.foldLeftArray = function( combineFunc ) {
                    return function( initialValue ) {
                        return function( dataArray ) {
                            var accumulator = initialValue;
                            for ( var arrayLength = dataArray.length, arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++ ) {
                                accumulator = combineFunc( accumulator )( dataArray[ arrayIndex ] );
                            }
                            return accumulator;
                        };
                    };
                };
            }( exportScope["Data.Collection.Foldable"] = exportScope["Data.Collection.Foldable"] || {} );

            // Immediately-invoked function expression to define 'Data.Semigroup'.
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Combinable"] = exportScope["Data.Combinable"] || {};
                var combinableScope = exportScope["Data.Combinable"];
                combinableScope.Combinable = function( appendFunc ) {
                    this.append = appendFunc;
                };
                combinableScope.append = function( instance ) {
                    return instance.append;
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Data.Foldable' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Data.Collection.Foldable"] = exportScope["Data.Collection.Foldable"] || {};
                var foldableScope = exportScope["Data.Collection.Foldable"];
                var foldableRef = exportScope["Data.Collection.Foldable"];
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var applyScope = exportScope["Flow.Applicative"];
                var accumulatorScope = exportScope["Data.Accumulator"];
                var combinableScope = exportScope["Data.Combinable"];
                var singletonScope = exportScope["Data.Singleton"];

                var foldableConstructor = function( foldMapFunc, foldlFunc, foldrFunc ) {
                    this.foldMap = foldMapFunc;
                    this.foldl = foldlFunc;
                    this.foldr = foldrFunc;
                };
                var foldRightFunction = function( instance ) {
                    return instance.foldr;
                };
                var defaultFoldMapRight = function( foldableInstance ) {
                    return function( accumulatorInstance ) {
                        return function( transformFunc ) {
                            return foldRightFunction( foldableInstance )( function( item ) {
                                return function( accumulated ) {
                                    return combinableScope.append( accumulatorInstance.Semigroup0() )( transformFunc( item ) )( accumulated );
                                };
                            } )( accumulatorScope.empty( accumulatorInstance ) );
                        };
                    };
                };
                var arrayFoldableInstance = new foldableConstructor( function( accumulatorInstance ) {
                    return defaultFoldMapRight( arrayFoldableInstance )( accumulatorInstance );
                }, foldableRef.foldLeftArray, foldableRef.foldRightArray );

                foldableScope.Foldable = foldableConstructor;
                foldableScope.foldRight = foldRightFunction;
                foldableScope.foldLeft = function( instance ) {
                    return instance.foldl;
                };
                foldableScope.foldMap = function( instance ) {
                    return instance.foldMap;
                };
                foldableScope.defaultFoldMapRight = defaultFoldMapRight;
                foldableScope.traverseAndDiscard = function( pureApplyInstance ) {
                    return function( foldableInstance ) {
                        return function( transformFunc ) {
                            return foldRightFunction( foldableInstance )( function( item ) {
                                return applyScope.applyThen( pureApplyInstance.Applicative0() )( transformFunc( item ) );
                            } )( pureApplyScope.pure( pureApplyInstance )( singletonScope.unitValue ) );
                        };
                    };
                };
                foldableScope.arrayFoldable = arrayFoldableInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Control.Parallel'.
            !function( exportScope ) {
                "use strict";
                exportScope["Flow.ConcurrentOps"] = exportScope["Flow.ConcurrentOps"] || {};
                var concurrentOpsScope = exportScope["Flow.ConcurrentOps"];
                var categoryScope = exportScope["Flow.Category"];
                var concurrentScope = exportScope["Flow.Concurrent"];
                var foldableScope = exportScope["Data.Collection.Foldable"];

                var parallelTraverseFunc = function( concurrentInstance ) {
                    return function( foldableInstance ) {
                        return function( transformFunc ) {
                            return function( inputCollection ) {
                                return concurrentScope.sequential( concurrentInstance )( foldableScope.traverseAndDiscard( concurrentInstance.PureApplicative1() )( foldableInstance )( function( item ) {
                                    return concurrentScope.parallel( concurrentInstance )( transformFunc( item ) );
                                } )( inputCollection ) );
                            };
                        };
                    };
                };
                concurrentOpsScope.parallelTraverse_ = parallelTraverseFunc;
                concurrentOpsScope.parallelSequence_ = function( concurrentInstance ) {
                    return function( foldableInstance ) {
                        return parallelTraverseFunc( concurrentInstance )( foldableInstance )( categoryScope.identity( categoryScope.categoryFunc ) );
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect.Class'.
            !function( exportScope ) {
                "use strict";
                exportScope["SideEffect.Class"] = exportScope["SideEffect.Class"] || {};
                var effectClassScope = exportScope["SideEffect.Class"];
                effectClassScope.liftSideEffect = function( instance ) {
                    return instance.liftSideEffect;
                };
                effectClassScope.MonadSideEffect = function( monadicInstance, liftEffectFunc ) {
                    this.Monadic0 = monadicInstance;
                    this.liftSideEffect = liftEffectFunc;
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Partial.Unsafe'.
            !function( exportScope ) {
                "use strict";
                ( exportScope["Partial.Unsafe"] = exportScope["Partial.Unsafe"] || {} ).unsafeRunPartial = function( func ) {
                    return func();
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Partial'.
            !function( exportScope ) {
                "use strict";
                ( exportScope["Partial"] = exportScope["Partial"] || {} ).triggerCrashWith = function() {
                    return function( message ) {
                        throw new Error( message );
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Partial' (redundant, but cloned).
            !function( exportScope ) {
                "use strict";
                exportScope.Partial = exportScope.Partial || {};
                var partialScope = exportScope.Partial;
                var partialRef = exportScope.Partial;
                partialScope.triggerCrashWith = partialRef.triggerCrashWith;
            }( exportScope );

            // Immediately-invoked function expression to define 'Partial.Unsafe' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Partial.Unsafe"] = exportScope["Partial.Unsafe"] || {};
                var unsafePartialScope = exportScope["Partial.Unsafe"];
                var unsafePartialRef = exportScope["Partial.Unsafe"];
                var partialScope = exportScope.Partial;
                unsafePartialScope.unsafeCrashWithMessage = function( message ) {
                    return unsafePartialRef.unsafeRunPartial( function( _ ) {
                        return partialScope.triggerCrashWith( _ )( message );
                    } );
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Unsafe.Coerce'.
            !function( exportScope ) {
                "use strict";
                ( exportScope["Unsafe.TypeCoercion"] = exportScope["Unsafe.TypeCoercion"] || {} ).unsafeCast = function( val ) {
                    return val;
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Unsafe.Coerce' (redundant, but cloned).
            !function( exportScope ) {
                "use strict";
                exportScope["Unsafe.TypeCoercion"] = exportScope["Unsafe.TypeCoercion"] || {};
                var typeCoercionScope = exportScope["Unsafe.TypeCoercion"];
                var typeCoercionRef = exportScope["Unsafe.TypeCoercion"];
                typeCoercionScope.unsafeCast = typeCoercionRef.unsafeCast;
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect.Aff' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Effect.Aff"] = exportScope["Effect.Aff"] || {};
                var affScope = exportScope["Effect.Aff"];
                var affRef = exportScope["Effect.Aff"];
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var applyScope = exportScope["Flow.Applicative"];
                var binderScope = exportScope["Flow.Binder"];
                var monadicScope = exportScope["Flow.Monadic"];
                var concurrentOpsScope = exportScope["Flow.ConcurrentOps"];
                var concurrentClassScope = exportScope["Flow.Concurrent"];
                var choiceScope = exportScope["Data.Choice"];
                var foldableScope = exportScope["Data.Collection.Foldable"];
                var utilScope = exportScope["Data.Utility"];
                var mapperScope = exportScope["Data.Mapper"];
                var accumulatorScope = exportScope["Data.Accumulator"];
                var combinableScope = exportScope["Data.Combinable"];
                var singletonScope = exportScope["Data.Singleton"];
                var effectScope = exportScope.SideEffect;
                var effectClassScope = exportScope["SideEffect.Class"];
                var unsafePartialScope = exportScope["Partial.Unsafe"];
                var typeCoercionScope = exportScope["Unsafe.TypeCoercion"];

                // Functor for parallel asynchronous computations.
                var parAffFunctor = new mapperScope.Mapper( asyncFlowRef._parallelMap );
                // Functor for sequential asynchronous computations.
                var seqAffFunctor = new mapperScope.Mapper( asyncFlowRef._map );

                // Helper object for Either operations within Aff.
                var affChoiceHelpers = {
                    isLeft: function( result ) {
                        if ( result instanceof choiceScope.ErrValue ) return true;
                        if ( result instanceof choiceScope.OkValue ) return false;
                        throw new Error( "Unexpected result type in Aff (isLeft check): " + [ result.constructor.name ] );
                    },
                    fromLeft: function( result ) {
                        if ( result instanceof choiceScope.ErrValue ) return result.payload;
                        if ( result instanceof choiceScope.OkValue ) return unsafePartialScope.unsafeCrashWithMessage( "fromLeft: Right value encountered" );
                        throw new Error( "Unexpected result type in Aff (fromLeft conversion): " + [ result.constructor.name ] );
                    },
                    fromRight: function( result ) {
                        if ( result instanceof choiceScope.OkValue ) return result.payload;
                        if ( result instanceof choiceScope.ErrValue ) return unsafePartialScope.unsafeCrashWithMessage( "fromRight: Left value encountered" );
                        throw new Error( "Unexpected result type in Aff (fromRight conversion): " + [ result.constructor.name ] );
                    },
                    left: choiceScope.ErrValue.create,
                    right: choiceScope.OkValue.create
                };

                // Function to launch an asynchronous computation in a new fiber.
                var launchFiber = function( affComputation ) {
                    return function() {
                        var newFiber = ( function( comp ) {
                            return asyncFlowRef._createFiber( affChoiceHelpers, comp );
                        } )( affComputation )();
                        newFiber.run();
                        return newFiber;
                    };
                };

                // Apply instance for parallel asynchronous computations.
                var parAffApply = new applyScope.Applicative( function() {
                    return parAffFunctor;
                }, asyncFlowRef._parallelApply );
                // Monad instance for sequential asynchronous computations.
                var seqAffMonad = new monadicScope.Monadic( function() {
                    return seqAffPureApplicative;
                }, function() {
                    return seqAffBinder;
                } );
                // Bind instance for sequential asynchronous computations.
                var seqAffBinder = new binderScope.Binder( function() {
                    return seqAffApply;
                }, asyncFlowRef._bind );
                // Apply instance for sequential asynchronous computations.
                var seqAffApply = new applyScope.Applicative( function() {
                    return seqAffFunctor;
                }, monadicScope.applyMonadic( seqAffMonad ) );
                // PureApplicative instance for sequential asynchronous computations.
                var seqAffPureApplicative = new pureApplyScope.PureApplicative( function() {
                    return seqAffApply;
                }, asyncFlowRef._pure );
                // MonadEffect instance for Aff.
                var affMonadEffect = new effectClassScope.MonadSideEffect( function() {
                    return seqAffMonad;
                }, asyncFlowRef._liftSideEffect );
                // Parallel instance for Aff.
                var affParallel = new concurrentClassScope.Concurrent( function() {
                    return parAffPureApplicative;
                }, function() {
                    return seqAffMonad;
                }, typeCoercionScope.unsafeCast, asyncFlowRef._sequentialFlow );
                // PureApplicative instance for parallel asynchronous computations.
                var parAffPureApplicative = new pureApplyScope.PureApplicative( function() {
                    return parAffApply;
                }, function( val ) {
                    return concurrentClassScope.parallel( affParallel )( pureApplyScope.pure( seqAffPureApplicative )( val ) );
                } );

                // Semigroup for cancellers.
                var cancellerSemigroup = new combinableScope.Combinable( function( firstCanceller ) {
                    return function( secondCanceller ) {
                        return function( errorVal ) {
                            return concurrentOpsScope.parallelSequence_( affParallel )( foldableScope.arrayFoldable )( [ firstCanceller( errorVal ), secondCanceller( errorVal ) ] );
                        };
                    };
                } );

                // A non-cancelling canceller.
                var noOpCanceller = utilScope.constant( pureApplyScope.pure( seqAffPureApplicative )( singletonScope.unitValue ) );
                // Monoid for cancellers.
                var cancellerMonoid = new accumulatorScope.Accumulator( function() {
                    return cancellerSemigroup;
                }, noOpCanceller );

                affScope.launchAsyncFlow = launchFiber;
                affScope.launchAsyncFlowDiscard = function( affComputation ) {
                    return mapperScope.discardValue( effectScope.effectFunctor )( launchFiber( affComputation ) );
                };
                affScope.noOpCanceller = noOpCanceller;
                affScope.affFunctor = seqAffFunctor;
                affScope.affApply = seqAffApply;
                affScope.affPureApplicative = seqAffPureApplicative;
                affScope.affBinder = seqAffBinder;
                affScope.affMonad = seqAffMonad;
                affScope.affMonadEffect = affMonadEffect;
                affScope.parAffFunctor = parAffFunctor;
                affScope.parAffApply = parAffApply;
                affScope.parAffPureApplicative = parAffPureApplicative;
                affScope.affParallel = affParallel;
                affScope.cancellerCombinable = cancellerSemigroup;
                affScope.cancellerAccumulator = cancellerMonoid;
                affScope.createAsyncFlow = asyncFlowRef.createAsyncFlow;
            }( exportScope );

            // Immediately-invoked function expression to define 'Effect.Ref'.
            !function( exportScope ) {
                "use strict";
                exportScope.newRef = function( initialValue ) {
                    return function() {
                        return {
                            value: initialValue
                        };
                    };
                };
                exportScope.readRef = function( refObject ) {
                    return function() {
                        return refObject.value;
                    };
                };
                exportScope.writeRef = function( newValue ) {
                    return function( refObject ) {
                        return function() {
                            refObject.value = newValue;
                            return {};
                        };
                    };
                };
            }( exportScope["SideEffect.Ref"] = exportScope["SideEffect.Ref"] || {} );

            // Immediately-invoked function expression to define 'Effect.Ref' (redundant, but cloned).
            !function( exportScope ) {
                "use strict";
                exportScope["SideEffect.Ref"] = exportScope["SideEffect.Ref"] || {};
                var refScope = exportScope["SideEffect.Ref"];
                var refRef = exportScope["SideEffect.Ref"];
                refScope.newRef = refRef.newRef;
                refScope.readRef = refRef.readRef;
                refScope.writeRef = refRef.writeRef;
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Encoding'.
            !function( exportScope ) {
                "use strict";
                exportScope["Node.DataEncoding"] = exportScope["Node.DataEncoding"] || {};
                var dataEncodingScope = exportScope["Node.DataEncoding"];
                var displayScope = exportScope["Data.Display"];

                // ASCII encoding type.
                var asciiEncoding = function() {
                    function Ascii() {}
                    return Ascii.value = new Ascii(), Ascii;
                }();
                // UTF8 encoding type.
                var utf8Encoding = function() {
                    function Utf8() {}
                    return Utf8.value = new Utf8(), Utf8;
                }();
                // UTF16LE encoding type.
                var utf16leEncoding = function() {
                    function Utf16le() {}
                    return Utf16le.value = new Utf16le(), Utf16le;
                }();
                // UCS2 encoding type.
                var ucs2Encoding = function() {
                    function Ucs2() {}
                    return Ucs2.value = new Ucs2(), Ucs2;
                }();
                // Base64 encoding type.
                var base64Encoding = function() {
                    function Base64() {}
                    return Base64.value = new Base64(), Base64;
                }();
                // Latin1 encoding type.
                var latin1Encoding = function() {
                    function Latin1() {}
                    return Latin1.value = new Latin1(), Latin1;
                }();
                // Binary encoding type.
                var binaryEncoding = function() {
                    function Binary() {}
                    return Binary.value = new Binary(), Binary;
                }();
                // Hex encoding type.
                var hexEncoding = function() {
                    function Hex() {}
                    return Hex.value = new Hex(), Hex;
                }();

                var encodingDisplayInstance = new displayScope.Display( function( encodingType ) {
                    if ( encodingType instanceof asciiEncoding ) return "ASCII";
                    if ( encodingType instanceof utf8Encoding ) return "UTF8";
                    if ( encodingType instanceof utf16leEncoding ) return "UTF16LE";
                    if ( encodingType instanceof ucs2Encoding ) return "UCS2";
                    if ( encodingType instanceof base64Encoding ) return "Base64";
                    if ( encodingType instanceof latin1Encoding ) return "Latin1";
                    if ( encodingType instanceof binaryEncoding ) return "Binary";
                    if ( encodingType instanceof hexEncoding ) return "Hex";
                    throw new Error( "Unknown encoding type in display: " + [ encodingType.constructor.name ] );
                } );

                dataEncodingScope.Ascii = asciiEncoding;
                dataEncodingScope.Utf8 = utf8Encoding;
                dataEncodingScope.Utf16LE = utf16leEncoding;
                dataEncodingScope.Ucs2 = ucs2Encoding;
                dataEncodingScope.Base64 = base64Encoding;
                dataEncodingScope.Latin1 = latin1Encoding;
                dataEncodingScope.Binary = binaryEncoding;
                dataEncodingScope.Hex = hexEncoding;
                dataEncodingScope.convertEncodingToNode = function( encodingType ) {
                    if ( encodingType instanceof asciiEncoding ) return "ascii";
                    if ( encodingType instanceof utf8Encoding ) return "utf8";
                    if ( encodingType instanceof utf16leEncoding ) return "utf16le";
                    if ( encodingType instanceof ucs2Encoding ) return "ucs2";
                    if ( encodingType instanceof base64Encoding ) return "base64";
                    if ( encodingType instanceof latin1Encoding ) return "latin1";
                    if ( encodingType instanceof binaryEncoding ) return "binary";
                    if ( encodingType instanceof hexEncoding ) return "hex";
                    throw new Error( "Unknown encoding type for Node conversion: " + [ encodingType.constructor.name ] );
                };
                dataEncodingScope.displayEncoding = encodingDisplayInstance;
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Process' (part 1).
            !function( exportScope ) {
                "use strict";
                ( exportScope["Node.Environment"] = exportScope["Node.Environment"] || {} ).processObject = process;
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Process' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Node.Environment"] = exportScope["Node.Environment"] || {};
                var environmentScope = exportScope["Node.Environment"];
                var environmentRef = exportScope["Node.Environment"];
                var stdoutStream = environmentRef.processObject.stdout;
                var stdinStream = environmentRef.processObject.stdin;
                environmentScope.inputStream = stdinStream;
                environmentScope.outputStream = stdoutStream;
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Stream'.
            !function( exportScope ) {
                "use strict";
                exportScope.readChunkAsEither = function( onString ) {
                    return function( onBuffer ) {
                        return function( chunk ) {
                            if ( chunk instanceof Buffer ) return onBuffer( chunk );
                            if ( "string" === typeof chunk ) return onString( chunk );
                            throw new Error( "Node.Stream.readChunkAsEither: Unrecognized chunk type; expected String or Buffer, got: " + chunk );
                        };
                    };
                };
                exportScope.onDataEventEither = function( chunkHandler ) {
                    return function( streamObject ) {
                        return function( callback ) {
                            return function() {
                                streamObject.on( "data", function( data ) {
                                    callback( chunkHandler( data ) )();
                                } );
                            };
                        };
                    };
                };
                exportScope.onEndEvent = function( streamObject ) {
                    return function( callback ) {
                        return function() {
                            streamObject.on( "end", callback );
                        };
                    };
                };
                exportScope.writeToStream = function( streamObject ) {
                    return function( data ) {
                        return function( encoding ) {
                            return function() {
                                return streamObject.write( data, null, encoding );
                            };
                        };
                    };
                };
                exportScope.writeStringWithEncoding = function( streamObject ) {
                    return function( encoding ) {
                        return function( text ) {
                            return function( callback ) {
                                return function() {
                                    return streamObject.write( text, encoding, callback );
                                };
                            };
                        };
                    };
                };
            }( exportScope["Node.IO.Stream"] = exportScope["Node.IO.Stream"] || {} );

            // Immediately-invoked function expression to define 'Effect.Exception'.
            !function( exportScope ) {
                "use strict";
                exportScope.createErrorObject = function( message ) {
                    return new Error( message );
                };
                exportScope.throwNativeException = function( errorObject ) {
                    return function() {
                        throw errorObject;
                    };
                };
            }( exportScope["SideEffect.Error"] = exportScope["SideEffect.Error"] || {} );

            // Immediately-invoked function expression to define 'Effect.Exception' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["SideEffect.Error"] = exportScope["SideEffect.Error"] || {};
                var errorScope = exportScope["SideEffect.Error"];
                var errorRef = exportScope["SideEffect.Error"];
                errorScope.throwError = function( message ) {
                    return errorRef.throwNativeException( errorRef.createErrorObject( message ) );
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Buffer' (part 1).
            !function( exportScope ) {
                "use strict";
                ( exportScope["Node.BinaryData"] = exportScope["Node.BinaryData"] || {} ).bufferToStringImpl = function( encoding ) {
                    return function( bufferObject ) {
                        return function() {
                            return bufferObject.toString( encoding );
                        };
                    };
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Buffer' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Node.BinaryData"] = exportScope["Node.BinaryData"] || {};
                var binaryDataScope = exportScope["Node.BinaryData"];
                var binaryDataRef = exportScope["Node.BinaryData"];
                var dataEncodingScope = exportScope["Node.DataEncoding"];
                binaryDataScope.bufferToString = function( encodingType ) {
                    return binaryDataRef.bufferToStringImpl( dataEncodingScope.convertEncodingToNode( encodingType ) );
                };
            }( exportScope );

            // Immediately-invoked function expression to define 'Node.Stream' (part 2).
            !function( exportScope ) {
                "use strict";
                exportScope["Node.IO.Stream"] = exportScope["Node.IO.Stream"] || {};
                var streamScope = exportScope["Node.IO.Stream"];
                var streamRef = exportScope["Node.IO.Stream"];
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var binderScope = exportScope["Flow.Binder"];
                var choiceScope = exportScope["Data.Choice"];
                var displayScope = exportScope["Data.Display"];
                var effectScope = exportScope.SideEffect;
                var errorScope = exportScope["SideEffect.Error"];
                var binaryDataScope = exportScope["Node.BinaryData"];
                var dataEncodingScope = exportScope["Node.DataEncoding"];

                // Implementation for reading stream chunks, converting to Either.
                var chunkReader = streamRef.readChunkAsEither( choiceScope.ErrValue.create )( choiceScope.OkValue.create );
                // Handler for data events, producing Either.
                var onDataEitherHandler = function( streamObj ) {
                    return function( callback ) {
                        return streamRef.onDataEventEither( chunkReader )( streamObj )( callback );
                    };
                };
                // Handler for data events, processing the result.
                var onDataHandler = function( streamObj ) {
                    return function( callback ) {
                        return onDataEitherHandler( streamObj )( binderScope.composeKleisliFlipped( effectScope.effectBinder )( callback )( function( result ) {
                            if ( result instanceof choiceScope.ErrValue ) return errorScope.throwError( "Stream encoding should not be set" );
                            if ( result instanceof choiceScope.OkValue ) return pureApplyScope.pure( effectScope.effectApplicative )( result.payload );
                            throw new Error( "Pattern match failed for onDataHandler: " + [ result.constructor.name ] );
                        } ) );
                    };
                };

                streamScope.onData = onDataHandler;
                streamScope.onDataAsString = function( streamObj ) {
                    return function( encoding ) {
                        return function( callback ) {
                            return onDataHandler( streamObj )( binderScope.composeKleisliFlipped( effectScope.effectBinder )( callback )( binaryDataScope.bufferToString( encoding ) ) );
                        };
                    };
                };
                streamScope.onDataAsEither = onDataEitherHandler;
                streamScope.writeText = function( streamObj ) {
                    return function( encoding ) {
                        return streamRef.writeStringWithEncoding( streamObj )( displayScope.show( dataEncodingScope.displayEncoding )( encoding ) );
                    };
                };
                streamScope.onStreamEnd = streamRef.onEndEvent;
            }( exportScope );

            // Immediately-invoked function expression to define 'ABC089A'.
            !function( exportScope ) {
                "use strict";
                exportScope.ProblemA = exportScope.ProblemA || {};
                var problemAScope = exportScope.ProblemA;
                var pureApplyScope = exportScope["Flow.PureApplicative"];
                var binderScope = exportScope["Flow.Binder"];
                var categoryScope = exportScope["Flow.Category"];
                var choiceScope = exportScope["Data.Choice"];
                var eucRingScope = exportScope["Data.Numeric.Euclidean"];
                var mapperScope = exportScope["Data.Mapper"];
                var integerScope = exportScope["Data.Integer"];
                var accumulatorScope = exportScope["Data.Accumulator"];
                var displayScope = exportScope["Data.Display"];
                var textCommonScope = exportScope["Data.Text.Common"];
                var singletonScope = exportScope["Data.Singleton"];
                var effectScope = exportScope.SideEffect;
                var affScope = exportScope["Effect.Aff"];
                var effectClassScope = exportScope["SideEffect.Class"];
                var refScope = exportScope["SideEffect.Ref"];
                var dataEncodingScope = exportScope["Node.DataEncoding"];
                var environmentScope = exportScope["Node.Environment"];
                var streamScope = exportScope["Node.IO.Stream"];
                var unsafePartialScope = exportScope["Partial.Unsafe"];

                // The core logic to solve the problem.
                var problemSolver = function( inputString ) {
                    return choiceScope.unwrap( function( err ) {
                        return unsafePartialScope.unsafeCrashWithMessage( err );
                    } )( categoryScope.identity( categoryScope.categoryFunc ) )( binderScope.bind( choiceScope.choiceBinder )( choiceScope.optionalToChoice( "Input value 'n' is missing or invalid" )( integerScope.parseString( textCommonScope.trimWhitespace( inputString ) ) ) )( function( parsedInt ) {
                        return pureApplyScope.pure( choiceScope.choiceApplicative )( displayScope.show( displayScope.displayInteger )( eucRingScope.div( eucRingScope.intEuclideanRing )( parsedInt )( 3 ) ) + "\n" );
                    } ) );
                };

                // Asynchronous flow to read input, process, and write output.
                var ioFlow = affScope.createAsyncFlow( function( completionCallback ) {
                    return function() {
                        var inputBufferRef = refScope.newRef( "" )();
                        streamScope.onDataAsString( environmentScope.inputStream )( dataEncodingScope.Utf8.value )( function( chunkData ) {
                            return function() {
                                var currentContent = refScope.readRef( inputBufferRef )();
                                return refScope.writeRef( currentContent + chunkData )( inputBufferRef )();
                            };
                        } )();
                        streamScope.onStreamEnd( environmentScope.inputStream )( function() {
                            var finalContent = refScope.readRef( inputBufferRef )();
                            return completionCallback( pureApplyScope.pure( choiceScope.choiceApplicative )( finalContent ) )();
                        } )();
                        return accumulatorScope.empty( affScope.cancellerAccumulator );
                    };
                } );

                // Main entry point for the application.
                var appEntry = affScope.launchAsyncFlowDiscard( binderScope.bind( affScope.affBinder )( ioFlow )( function( rawInput ) {
                    return binderScope.bind( affScope.affBinder )( pureApplyScope.pure( affScope.affPureApplicative )( problemSolver( rawInput ) ) )( function( processedOutput ) {
                        var tempOutput = processedOutput;
                        return effectClassScope.liftSideEffect( affScope.affMonadEffect )( mapperScope.discardValue( effectScope.effectFunctor )( streamScope.writeText( environmentScope.outputStream )( dataEncodingScope.Utf8.value )( tempOutput )( pureApplyScope.pure( effectScope.effectApplicative )( singletonScope.unitValue ) ) ) );
                    } );
                } ) );

                problemAScope.main = appEntry;
                problemAScope.solve = problemSolver;
            }( exportScope );

            // Execute the main function of the entry module.
            exportScope.ProblemA.main();

        }, {}
    ]
}, {}, [ "MainFlow" ], null );