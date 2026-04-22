/*!
 * File: calculation_processor.js
 * Source: atcoder/abc155/d
 * Original URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 * Type II Clone
 */
! function( moduleMap ) {
    // Cache for loaded modules
    var cacheMap = {};

    /**
     * Custom module loader function.
     * @param {string} modulePath - The path or ID of the module to load.
     * @returns {*} The exports of the loaded module.
     */
    function requireModule( modulePath ) {
        // If module is already in cache, return its exports
        if ( cacheMap[ modulePath ] ) {
            return cacheMap[ modulePath ].exports;
        }

        // Create a new module entry in the cache
        var moduleEntry = cacheMap[ modulePath ] = {
            id: modulePath,
            loaded: ! false,
            exports: {}
        };

        // Execute the module function with its exports, module object, and the local require function
        moduleMap[ modulePath ].call( moduleEntry.exports, moduleEntry, moduleEntry.exports, requireModule );

        // Mark module as loaded
        moduleEntry.loaded = ! true;

        // Return the module's exports
        return moduleEntry.exports;
    }

    // Store references to the module map and cache on the loader
    requireModule.modules = moduleMap;
    requireModule.cache = cacheMap;

    /**
     * Define a getter function for an export property.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property.
     * @param {Function} getterFunction - The function to call to get the property value.
     */
    requireModule.define = function( targetObject, propertyName, getterFunction ) {
        if ( ! requireModule.hasProperty( targetObject, propertyName ) ) {
            Object.defineProperty( targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            } );
        }
    };

    /**
     * Register a module as an ES module.
     * @param {object} moduleExports - The exports object of the module.
     */
    requireModule.register = function( moduleExports ) {
        if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
            Object.defineProperty( moduleExports, Symbol.toStringTag, {
                value: 'Module'
            } );
        }
        Object.defineProperty( moduleExports, '__esModule', {
            value: true
        } );
    };

    /**
     * Get module exports, handling different import types.
     * @param {*} inputModule - The module or its ID.
     * @param {number} importFlags - Flags indicating import type.
     * @returns {*} The module exports.
     */
    requireModule.getModuleExports = function( inputModule, importFlags ) {
        // Handle common JS import (1 & importFlags)
        if ( 0b1 & importFlags ) {
            inputModule = requireModule( inputModule );
        }
        // Handle namespace object creation (8 & importFlags)
        if ( 0x8 & importFlags ) {
            return inputModule;
        }
        // Handle ES module default export (4 & importFlags)
        if ( 0x4 & importFlags && typeof inputModule === 'object' && inputModule && inputModule.__esModule ) {
            return inputModule;
        }

        // Create a synthetic namespace object
        var syntheticNamespace = Object.create( null );
        requireModule.register( syntheticNamespace );
        Object.defineProperty( syntheticNamespace, 'default', {
            enumerable: ! false,
            value: inputModule
        } );

        // Copy properties for non-string default exports (2 & importFlags)
        if ( 0x2 & importFlags && typeof inputModule != 'string' ) {
            for ( var propName in inputModule ) {
                requireModule.define( syntheticNamespace, propName, ( function( propKey ) {
                    return inputModule[ propKey ];
                } ).bind( null, propName ) );
            }
        }
        return syntheticNamespace;
    };

    /**
     * Get a namespace object for a module, handling default export.
     * @param {*} moduleValue - The module's value.
     * @returns {Function} A getter function for the namespace.
     */
    requireModule.getNamespaceObject = function( moduleValue ) {
        var namespaceGetter = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue.default;
            } :
            function() {
                return moduleValue;
            };
        requireModule.define( namespaceGetter, 'a', namespaceGetter );
        return namespaceGetter;
    };

    /**
     * Check if an object has a property.
     * @param {object} obj - The object to check.
     * @param {string} key - The property key.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    requireModule.hasProperty = function( obj, key ) {
        return Object.prototype.hasOwnProperty.call( obj, key );
    };

    // Public path for assets (empty string for relative paths)
    requireModule.publicPath = '';

    // Start loading the main entry module (ID 0)
    requireModule( requireModule.startModule = 0 );
}( [
    /* Module 0: Main Application Entry Point */
    function( moduleExports, currentExports, localRequire ) {
        'use strict';
        // Helper to handle default imports from CommonJS modules
        var defaultImportHandler = ( this && this.__importDefault ) || function( inputModule ) {
            return ( inputModule && inputModule.__esModule ) ? inputModule : {
                default: inputModule
            };
        };
        currentExports.__esModule = ! false;

        // Import file system utility and problem solver components
        var fileSystemUtil = defaultImportHandler( localRequire( 0x1 ) );
        var problemSolver = localRequire( 0x2 ); // Renamed from module ID 2

        // Read input from standard input and process it
        fileSystemUtil.default.readFile( "/dev/stdin", "utf8", ( function( err, inputString ) {
            // If there's an error reading file, throw it
            if ( err ) {
                throw err;
            }

            // Function to encapsulate the solution process
            ! function( rawInput ) {
                var solutionProcessor = new problemSolver.Solver();
                var parsedData = solutionProcessor.parse( rawInput );
                var operationResult = solutionProcessor.solve( parsedData );
                solutionProcessor.print( operationResult );
            }( inputString );
        } ) );
    },

    /* Module 1: File System (fs) */
    function( moduleExports, currentExports ) {
        moduleExports.exports = require( "fs" );
    },

    /* Module 2: CalculationProcessor Class */
    function( moduleExports, currentExports, localRequire ) {
        'use strict';
        // TypeScript __extends helper function (renamed)
        var inheritFromBase = ( this && this.__extends ) || ( function() {
            var baseClassRef = function( derivedCtor, baseCtor ) {
                baseClassRef = Object.setPrototypeOf ||
                    ( {
                        __proto__: []
                    }
                    instanceof Array && function( d, b ) {
                        d.__proto__ = b;
                    } ) ||
                    function( d, b ) {
                        for ( var p in b )
                            if ( b.hasOwnProperty( p ) ) d[ p ] = b[ p ];
                    };
                return baseClassRef( derivedCtor, baseCtor );
            };
            return function( derivedCtor, baseCtor ) {
                function TempCtor() {
                    this.constructor = derivedCtor;
                }
                baseClassRef( derivedCtor, baseCtor );
                derivedCtor.prototype = baseCtor === null ? Object.create( baseCtor ) : ( TempCtor.prototype = baseCtor.prototype, new TempCtor() );
            };
        } )();

        // TypeScript __importDefault helper function (renamed)
        var handleDefaultImport = ( this && this.__importDefault ) || function( importedModule ) {
            return ( importedModule && importedModule.__esModule ) ? importedModule : {
                default: importedModule
            };
        };
        currentExports.__esModule = ! false;

        // Import necessary modules for the solver
        var baseProcessor = localRequire( 0x3 ); // BaseLogicComponent
        var inputParser = localRequire( 0x4 ); // spaceDelimitedIterator
        var bigIntLib = handleDefaultImport( localRequire( 0x5 ) ); // LargeInteger library

        // Define the main CalculationProcessor class
        var CalculationProcessor = ( function( baseCtor ) {
            inheritFromBase( CalculationProcessor, baseCtor );

            function CalculationProcessor() {
                // Call the base class constructor
                return baseCtor !== null && baseCtor.apply( this, arguments ) || this;
            }

            /**
             * Solves the problem based on the parsed input data.
             * @param {object} inputDetails - Object containing N, K, and A.
             * @returns {object} An object with the calculated answer.
             */
            CalculationProcessor.prototype.executeSolution = function( inputDetails ) {
                var numElements = inputDetails.N;
                var targetRank = inputDetails.K;
                var dataArray = inputDetails.A;

                // Sort the input array in ascending order
                dataArray.sort( ( function( valA, valB ) {
                    return valA - valB;
                } ) );

                // Convert all numbers in the array to LargeInteger objects
                var longDataArray = new Array( numElements );
                for ( var idx = 0x0; idx < numElements; idx++ ) {
                    longDataArray[ idx ] = bigIntLib.default.fromFloatingPoint( dataArray[ idx ] );
                }

                // Count negative, positive, and zero numbers
                var negativeCount = 0x0;
                var positiveCount = 0x0;
                var zeroCount = 0x0;
                for ( var idx = 0x0; idx < numElements; idx++ ) {
                    if ( dataArray[ idx ] < 0x0 ) {
                        negativeCount++;
                    } else if ( dataArray[ idx ] > 0x0 ) {
                        positiveCount++;
                    } else {
                        zeroCount++;
                    }
                }

                // Calculate initial product counts based on signs
                var negPosProducts = negativeCount * positiveCount;
                var zeroInvolvedProducts = zeroCount * ( positiveCount + negativeCount ) + zeroCount * ( zeroCount - 0x1 ) / 2.0;

                // Initialize LargeInteger constants
                var twoLong = bigIntLib.default.fromFloatingPoint( 0x2 );
                var lowerBound = bigIntLib.default.fromTextString( '-1000000000000000005' );
                var upperBound = bigIntLib.default.fromTextString( '1000000000000000005' );

                // Binary search for the K-th product
                while ( upperBound.subtract( lowerBound ).greaterThan( bigIntLib.default.ONE ) ) {
                    var currentMid = upperBound.add( lowerBound ).divide( twoLong );
                    var productCount = 0x0;

                    if ( currentMid.lessThan( bigIntLib.default.ZERO ) ) {
                        // Case 1: Mid value is negative. Count products less than currentMid.
                        // Iterate through negative numbers
                        for ( var idx = 0x0; idx < numElements && !( dataArray[ idx ] >= 0x0 ); idx++ ) {
                            // Find the rightmost element 'm' such that dataArray[idx] * dataArray[m] < currentMid
                            var leftPointer = negativeCount + zeroCount - 0x1;
                            var rightPointer = numElements;
                            while ( rightPointer - leftPointer > 0b1 ) {
                                var midPointer = ( leftPointer + rightPointer ) / 2.0 | 0x0;
                                if ( longDataArray[ idx ].multiply( longDataArray[ midPointer ] ).lessThan( currentMid ) ) {
                                    rightPointer = midPointer;
                                } else {
                                    leftPointer = midPointer;
                                }
                            }
                            productCount += numElements - rightPointer;
                        }
                    } else if ( currentMid.greaterThan( bigIntLib.default.ZERO ) ) {
                        // Case 2: Mid value is positive. Count products less than currentMid.
                        // Include all negative * positive and zero-involved products
                        productCount += negPosProducts + zeroInvolvedProducts;

                        // Iterate through all numbers to find pairs
                        for ( var idx = 0x0; idx < numElements; idx++ ) {
                            if ( dataArray[ idx ] < 0x0 ) {
                                // For negative numbers, find positive numbers to form products < currentMid
                                var leftPointer = idx;
                                var rightPointer = negativeCount;
                                while ( rightPointer - leftPointer > 0b1 ) {
                                    var midPointer = ( leftPointer + rightPointer ) / 2.0 | 0x0;
                                    if ( longDataArray[ idx ].multiply( longDataArray[ midPointer ] ).lessThan( currentMid ) ) {
                                        rightPointer = midPointer;
                                    } else {
                                        leftPointer = midPointer;
                                    }
                                }
                                productCount += negativeCount - rightPointer; // Count of negative * negative products
                            } else if ( dataArray[ idx ] > 0x0 ) {
                                // For positive numbers, find other numbers to form products < currentMid
                                var leftPointer = idx;
                                var rightPointer = numElements;
                                while ( rightPointer - leftPointer > 0b1 ) {
                                    var midPointer = ( leftPointer + rightPointer ) / 2.0 | 0x0;
                                    if ( longDataArray[ idx ].multiply( longDataArray[ midPointer ] ).lessThan( currentMid ) ) {
                                        leftPointer = midPointer;
                                    } else {
                                        rightPointer = midPointer;
                                    }
                                }
                                productCount += leftPointer - idx; // Count of positive * positive products
                            }
                        }
                    } else {
                        // Case 3: Mid value is zero. Count products less than zero.
                        productCount = negPosProducts;
                    }

                    // Adjust binary search bounds based on productCount
                    if ( productCount < targetRank ) {
                        lowerBound = currentMid;
                    } else {
                        upperBound = currentMid;
                    }
                }

                return {
                    answer: lowerBound
                };
            };

            /**
             * Parses the raw input string into structured data.
             * @param {string} rawInput - The raw input string from stdin.
             * @returns {object} An object containing N, K, and A array.
             */
            CalculationProcessor.prototype.processInput = function( rawInput ) {
                // Create an iterator for space-separated integer values
                var iteratorOutput = inputParser.getSpaceIterator( rawInput, ( function( textValue ) {
                    return parseInt( textValue, 10 );
                } ) );

                var elementCount = iteratorOutput.next().value; // N
                var rankValue = iteratorOutput.next().value; // K

                // Read the array A
                var parsedNumbers = [];
                for ( var itemIndex = 0x0; itemIndex < elementCount; itemIndex++ ) {
                    parsedNumbers.push( iteratorOutput.next().value );
                }

                return {
                    N: elementCount,
                    K: rankValue,
                    A: parsedNumbers
                };
            };

            /**
             * Prints the calculated result to console.
             * @param {object} outputData - Object containing the answer.
             */
            CalculationProcessor.prototype.displayResult = function( outputData ) {
                console.log( outputData.answer.toString() );
            };

            return CalculationProcessor;
        }( baseProcessor.SolverBase ) );
        currentExports.Solver = CalculationProcessor;
    },

    /* Module 3: BaseLogicComponent (SolverBase) */
    function( moduleExports, currentExports ) {
        'use strict';
        currentExports.__esModule = ! false;
        // A base class for problem solvers. Currently empty.
        var BaseLogicComponent = function() {};
        currentExports.SolverBase = BaseLogicComponent;
    },

    /* Module 4: spaceDelimitedIterator (getSpaceIterator) */
    function( moduleExports, currentExports, localRequire ) {
        'use strict';
        // TypeScript __generator helper function (renamed)
        var asyncGenerator = ( this && this.__generator ) || function( thisArg, body ) {
            var _ = {
                    label: 0x0,
                    sent: function() {
                        if ( 0b1 & _[ 0x0 ] ) throw _[ 0b1 ];
                        return _[ 0b1 ];
                    },
                    trys: [],
                    ops: []
                },
                f, y, z, g;
            return g = {
                next: verb( 0x0 ),
                "throw": verb( 0b1 ),
                "return": verb( 0x2 )
            }, typeof Symbol === "function" && ( g[ Symbol.iterator ] = function() {
                return this;
            } ), g;

            function verb( n ) {
                return function( v ) {
                    return step( [ n, v ] );
                };
            }

            function step( op ) {
                if ( f ) throw new TypeError( "Generator is already executing." );
                while ( _ ) try {
                    if ( f = 0b1, y && ( z = 0x2 & op[ 0x0 ] ? y[ "return" ] : op[ 0x0 ] ? y[ "throw" ] || ( ( z = y[ "return" ] ) && z.call( y ), 0x0 ) : y.next ) && !( z = z.call( y, op[ 0b1 ] ) ).done ) return z;
                    if ( f = 0x0, z ) op = [ 0x2 & op[ 0x0 ], z.value ];
                    switch ( op[ 0x0 ] ) {
                        case 0x0:
                        case 0b1:
                            z = op;
                            break;
                        case 0x4:
                            _.label++;
                            return {
                                value: op[ 0b1 ],
                                done: ! false
                            };
                        case 0x5:
                            _.label++;
                            f = op[ 0b1 ];
                            op = [ 0x0 ];
                            continue;
                        case 0x7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if ( !( z = _.trys, z = z.length > 0x0 && z[ z.length - 0b1 ] ) && ( 0x6 === op[ 0x0 ] || 0x2 === op[ 0x0 ] ) ) {
                                _ = 0x0;
                                continue;
                            }
                            if ( 0x3 === op[ 0x0 ] && ( !z || op[ 0b1 ] > z[ 0x0 ] && op[ 0b1 ] < z[ 0x3 ] ) ) {
                                _.label = op[ 0b1 ];
                                break;
                            }
                            if ( 0x6 === op[ 0x0 ] && _.label < z[ 0b1 ] ) {
                                _.label = z[ 0b1 ];
                                z = op;
                                break;
                            }
                            if ( z && _.label < z[ 0x2 ] ) {
                                _.label = z[ 0x2 ];
                                _.ops.push( op );
                                break;
                            }
                            z[ 0x2 ] && _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call( thisArg, _ );
                } catch ( e ) {
                    op = [ 0x6, e ];
                    f = 0x0;
                } finally {
                    z = f = 0x0;
                }
                if ( 0x5 & op[ 0x0 ] ) throw op[ 0b1 ];
                return {
                    value: op[ 0x0 ] ? op[ 0b1 ] : void 0x0,
                    done: ! true
                };
            }
        };
        currentExports.__esModule = ! false;

        /**
         * Creates an iterator that yields parsed values from a space-separated string.
         * @param {string} sourceString - The input string.
         * @param {Function} mapperFunction - Function to parse each part.
         * @returns {Generator<any>} An iterator yielding parsed values.
         */
        currentExports.getSpaceIterator = function( sourceString, mapperFunction ) {
            var currentIdx, processedParts;
            return asyncGenerator( this, ( function( generatorState ) {
                switch ( generatorState.label ) {
                    case 0x0:
                        currentIdx = 0x0;
                        processedParts = sourceString.split( /\s+/ ).map( ( function( part ) {
                            return mapperFunction( part );
                        } ) );
                        generatorState.label = 0b1;
                    case 0b1:
                        return currentIdx < processedParts.length ? [ 0x4, processedParts[ currentIdx ] ] : [ 0x3, 0x4 ];
                    case 0x2:
                        generatorState.sent();
                        generatorState.label = 0x3;
                    case 0x3:
                        currentIdx++;
                        return [ 0x3, 0b1 ];
                    case 0x4:
                        return [ 0x2, void 0x0 ];
                }
            } ) );
        };
    },

    /* Module 5: LargeInteger (Long.js) Library */
    function( moduleExports, currentExports ) {
        moduleExports.exports = LargeInteger;
        var wasmInstance = null;
        try {
            // Attempt to load WebAssembly module if available
            wasmInstance = new WebAssembly.Instance( new WebAssembly.Module( new Uint8Array( [ 0x0, 0x61, 0x73, 0x6d, 0x1, 0x0, 0x0, 0x0, 0x1, 0xd, 0x2, 0x60, 0x0, 0x1, 0x7f, 0x60, 0x4, 0x7f, 0x7f, 0x7f, 0x7f, 0x1, 0x7f, 0x3, 0x7, 0x6, 0x0, 0x1, 0x1, 0x1, 0x1, 0x1, 0x6, 0x6, 0x1, 0x7f, 0x1, 0x41, 0x0, 0xb, 0x7, 0x32, 0x6, 0x3, 0x6d, 0x75, 0x6c, 0x0, 0x1, 0x5, 0x64, 0x69, 0x76, 0x5f, 0x73, 0x0, 0x2, 0x5, 0x64, 0x69, 0x76, 0x5f, 0x75, 0x0, 0x3, 0x5, 0x72, 0x65, 0x6d, 0x5f, 0x73, 0x0, 0x4, 0x5, 0x72, 0x65, 0x6d, 0x5f, 0x75, 0x0, 0x5, 0x8, 0x67, 0x65, 0x74, 0x5f, 0x68, 0x69, 0x67, 0x68, 0x0, 0x0, 0xa, 0xbf, 0x1, 0x6, 0x4, 0x0, 0x23, 0x0, 0xb, 0x24, 0x1, 0x1, 0x7e, 0x20, 0x0, 0xad, 0x20, 0x1, 0xad, 0x42, 0x20, 0x86, 0x84, 0x20, 0x2, 0xad, 0x20, 0x3, 0xad, 0x42, 0x20, 0x86, 0x84, 0x7e, 0x24, 0x4, 0x42, 0x20, 0x87, 0xa7, 0x24, 0x0, 0x20, 0x4, 0xa7, 0xb, 0x24, 0x1, 0x1, 0x7e, 0x20, 0x0, 0xad, 0x20, 0x1, 0xad, 0x42, 0x20, 0x86, 0x84, 0x20, 0x2, 0xad, 0x20, 0x3, 0xad, 0x42, 0x20, 0x86, 0x84, 0x7f, 0x24, 0x4, 0x42, 0x20, 0x87, 0xa7, 0x24, 0x0, 0x20, 0x4, 0xa7, 0xb, 0x24, 0x1, 0x1, 0x7e, 0x20, 0x0, 0xad, 0x20, 0x1, 0xad, 0x42, 0x20, 0x86, 0x84, 0x20, 0x2, 0xad, 0x20, 0x3, 0xad, 0x42, 0x20, 0x86, 0x84, 0x80, 0x24, 0x4, 0x42, 0x20, 0x87, 0xa7, 0x24, 0x0, 0x20, 0x4, 0xa7, 0xb, 0x24, 0x1, 0x1, 0x7e, 0x20, 0x0, 0xad, 0x20, 0x1, 0xad, 0x42, 0x20, 0x86, 0x84, 0x20, 0x2, 0xad, 0x20, 0x3, 0xad, 0x42, 0x20, 0x86, 0x84, 0x81, 0x24, 0x4, 0x42, 0x20, 0x87, 0xa7, 0x24, 0x0, 0x20, 0x4, 0xa7, 0xb, 0x24, 0x1, 0x1, 0x7e, 0x20, 0x0, 0xad, 0x20, 0x1, 0xad, 0x42, 0x20, 0x86, 0x84, 0x20, 0x2, 0xad, 0x20, 0x3, 0xad, 0x42, 0x20, 0x86, 0x84, 0x82, 0x24, 0x4, 0x42, 0x20, 0x87, 0xa7, 0x24, 0x0, 0x20, 0x4, 0xa7, 0xb ] ) ), {} ).exports;
        } catch ( err ) {
            // WebAssembly not supported or failed to load, proceed without it
        }

        /**
         * Represents a 64-bit integer.
         * @constructor
         * @param {number} lowBits - The low 32 bits.
         * @param {number} highBits - The high 32 bits.
         * @param {boolean} isUnsigned - Whether the number is unsigned.
         */
        function LargeInteger( lowBits, highBits, isUnsigned ) {
            this.lowBits = lowBits | 0x0;
            this.highBits = highBits | 0x0;
            this.isUnsigned = Boolean( isUnsigned );
        }

        /**
         * Checks if a given object is a LargeInteger instance.
         * @param {*} value - The value to check.
         * @returns {boolean} True if it's a LargeInteger, false otherwise.
         */
        function isLargeInteger( value ) {
            return ! false === ( value && value.__isLargeInteger__ );
        }

        // Define a non-enumerable property to identify LargeInteger instances
        LargeInteger.prototype.__isLargeInteger__;
        Object.defineProperty( LargeInteger.prototype, '__isLargeInteger__', {
            value: ! false
        } );
        LargeInteger.isLargeInteger = isLargeInteger;

        // Caches for frequently used LargeInteger instances (signed and unsigned)
        var signedCache = {};
        var unsignedCache = {};

        /**
         * Creates a LargeInteger from a 32-bit integer.
         * @param {number} value - The integer value.
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        function fromInteger( value, isUnsigned ) {
            var newInt, cachedInt, isSmall;
            // Check cache for small integers
            if ( isUnsigned ) {
                isSmall = ( 0x0 <= ( value >>>= 0x0 ) && value < 0x100 );
                if ( isSmall && ( cachedInt = unsignedCache[ value ] ) ) {
                    return cachedInt;
                }
                newInt = fromBitFields( value, ( value | 0x0 ) < 0x0 ? -0b1 : 0x0, ! false );
                if ( isSmall ) {
                    unsignedCache[ value ] = newInt;
                }
                return newInt;
            } else {
                isSmall = ( -0x80 <= ( value |= 0x0 ) && value < 0x80 );
                if ( isSmall && ( cachedInt = signedCache[ value ] ) ) {
                    return cachedInt;
                }
                newInt = fromBitFields( value, value < 0x0 ? -0b1 : 0x0, ! true );
                if ( isSmall ) {
                    signedCache[ value ] = newInt;
                }
                return newInt;
            }
        }

        /**
         * Creates a LargeInteger from a JavaScript number.
         * @param {number} value - The number value.
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        function fromFloatingPoint( value, isUnsigned ) {
            if ( isNaN( value ) ) return isUnsigned ? zeroUnsigned : zeroSigned;
            if ( isUnsigned ) {
                if ( value < 0x0 ) return zeroUnsigned;
                if ( value >= doubleMagnitude ) return maxUnsignedValue;
            } else {
                if ( value <= -halfDoubleMagnitude ) return minSignedValue;
                if ( value + 0b1 >= halfDoubleMagnitude ) return maxSignedValue;
            }
            return value < 0x0 ? fromFloatingPoint( -value, isUnsigned ).negate() : fromBitFields( value % baseMagnitude | 0x0, value / baseMagnitude | 0x0, isUnsigned );
        }

        /**
         * Creates a LargeInteger from low and high 32-bit parts.
         * @param {number} lowBits - The low 32 bits.
         * @param {number} highBits - The high 32 bits.
         * @param {boolean} isUnsigned - Whether the number is unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        function fromBitFields( lowBits, highBits, isUnsigned ) {
            return new LargeInteger( lowBits, highBits, isUnsigned );
        }

        LargeInteger.fromInt = fromInteger;
        LargeInteger.fromNumber = fromFloatingPoint;
        LargeInteger.fromBits = fromBitFields;

        var powerFunction = Math.pow;

        /**
         * Creates a LargeInteger from a string representation.
         * @param {string} textValue - The string value.
         * @param {boolean|number} radixOrSigned - Radix or signed flag.
         * @param {number} radix - The base of the number string (2 to 36).
         * @returns {LargeInteger} The LargeInteger instance.
         */
        function fromTextString( textValue, radixOrSigned, radix ) {
            if ( textValue.length === 0x0 ) throw Error( "empty string" );
            if ( "NaN" === textValue || "Infinity" === textValue || "+Infinity" === textValue || "-Infinity" === textValue ) return zeroSigned;

            // Determine if unsigned and the radix
            if ( typeof radixOrSigned === 'number' ) {
                radix = radixOrSigned;
                radixOrSigned = ! false;
            } else {
                radixOrSigned = Boolean( radixOrSigned );
            }
            radix = radix || 0xa; // Default radix is 10

            if ( radix < 0x2 || radix > 0x24 ) throw RangeError( "radix" );

            var hyphenPosition;
            if ( ( hyphenPosition = textValue.indexOf( "-" ) ) > 0x0 ) throw Error( "interior hyphen" );
            if ( 0x0 === hyphenPosition ) return fromTextString( textValue.substring( 0b1 ), radixOrSigned, radix ).negate();

            // Use a base of 8 for efficient parsing
            for ( var baseEight = fromFloatingPoint( powerFunction( radix, 0x8 ) ), parsedInt = zeroSigned, offset = 0x0; offset < textValue.length; offset += 0x8 ) {
                var segmentLength = Math.min( 0x8, textValue.length - offset );
                var segmentValue = parseInt( textValue.substring( offset, offset + segmentLength ), radix );
                if ( segmentLength < 0x8 ) {
                    var segmentFactor = fromFloatingPoint( powerFunction( radix, segmentLength ) );
                    parsedInt = parsedInt.multiply( segmentFactor ).add( fromFloatingPoint( segmentValue ) );
                } else {
                    parsedInt = ( parsedInt = parsedInt.multiply( baseEight ) ).add( fromFloatingPoint( segmentValue ) );
                }
            }
            parsedInt.isUnsigned = radixOrSigned;
            return parsedInt;
        }

        /**
         * Creates a LargeInteger from various input types.
         * @param {*} value - The input value (number, string, or LargeInteger).
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        function fromAnyValue( value, isUnsigned ) {
            if ( typeof value === 'number' ) return fromFloatingPoint( value, isUnsigned );
            if ( typeof value === 'string' ) return fromTextString( value, isUnsigned );
            return fromBitFields( value.lowBits, value.highBits, typeof isUnsigned === 'boolean' ? isUnsigned : value.isUnsigned );
        }

        LargeInteger.fromString = fromTextString;
        LargeInteger.fromValue = fromAnyValue;

        // Constants for 64-bit arithmetic
        var baseMagnitude = 0x100000000; // 2^32
        var doubleMagnitude = baseMagnitude * baseMagnitude; // 2^64
        var halfDoubleMagnitude = doubleMagnitude / 2.0; // 2^63
        var twentyFourBitMask = fromInteger( 0x1 << 0x18 ); // 2^24

        // Predefined LargeInteger constants
        var zeroSigned = fromInteger( 0x0 );
        LargeInteger.ZERO = zeroSigned;
        var zeroUnsigned = fromInteger( 0x0, ! false );
        LargeInteger.UZERO = zeroUnsigned;
        var oneSigned = fromInteger( 0b1 );
        LargeInteger.ONE = oneSigned;
        var oneUnsigned = fromInteger( 0b1, ! false );
        LargeInteger.UONE = oneUnsigned;
        var negativeOne = fromInteger( -0b1 );
        LargeInteger.NEG_ONE = negativeOne;
        var maxSignedValue = fromBitFields( -0b1, 0x7FFFFFFF, ! true );
        LargeInteger.MAX_VALUE = maxSignedValue;
        var maxUnsignedValue = fromBitFields( -0b1, -0b1, ! false );
        LargeInteger.MAX_UNSIGNED_VALUE = maxUnsignedValue;
        var minSignedValue = fromBitFields( 0x0, -0x80000000, ! true );
        LargeInteger.MIN_VALUE = minSignedValue;

        var largeIntegerPrototype = LargeInteger.prototype;

        /**
         * Converts the LargeInteger to a 32-bit integer.
         * @returns {number} The 32-bit integer value.
         */
        largeIntegerPrototype.to32BitInteger = function() {
            return this.isUnsigned ? this.lowBits >>> 0x0 : this.lowBits;
        };

        /**
         * Converts the LargeInteger to a JavaScript number (double-precision float).
         * @returns {number} The numeric value.
         */
        largeIntegerPrototype.toFloatingPointNumber = function() {
            return this.isUnsigned ? ( this.highBits >>> 0x0 ) * baseMagnitude + ( this.lowBits >>> 0x0 ) : this.highBits * baseMagnitude + ( this.lowBits >>> 0x0 );
        };

        /**
         * Converts the LargeInteger to its string representation in a given radix.
         * @param {number} radix - The base for the string representation.
         * @returns {string} The string representation.
         */
        largeIntegerPrototype.toRadixString = function( radix ) {
            if ( ( radix = radix || 0xa ) < 0x2 || radix > 0x24 ) throw RangeError( "radix" );
            if ( this.isZero() ) return "0";
            if ( this.isNegative() ) {
                if ( this.equals( minSignedValue ) ) {
                    var divRadix = fromFloatingPoint( radix );
                    var quotient = this.divide( divRadix );
                    var remainder = quotient.multiply( divRadix ).subtract( this );
                    return quotient.toRadixString( radix ) + remainder.to32BitInteger().toString( radix );
                }
                return "-" + this.negate().toRadixString( radix );
            }
            for ( var segmentBase = fromFloatingPoint( powerFunction( radix, 0x6 ), this.isUnsigned ), currentNum = this, resultString = "";; ) {
                var divisionResult = currentNum.divide( segmentBase );
                var segmentPart = ( currentNum.subtract( divisionResult.multiply( segmentBase ) ).to32BitInteger() >>> 0x0 ).toString( radix );
                if ( ( currentNum = divisionResult ).isZero() ) return segmentPart + resultString;
                for ( ; segmentPart.length < 0x6; ) segmentPart = "0" + segmentPart;
                resultString = "" + segmentPart + resultString;
            }
        };
        largeIntegerPrototype.toString = largeIntegerPrototype.toRadixString;

        /**
         * Gets the high 32 bits (signed).
         * @returns {number} The high 32 bits.
         */
        largeIntegerPrototype.getHigh32Bits = function() {
            return this.highBits;
        };

        /**
         * Gets the high 32 bits (unsigned).
         * @returns {number} The high 32 bits as unsigned.
         */
        largeIntegerPrototype.getHigh32BitsUnsigned = function() {
            return this.highBits >>> 0x0;
        };

        /**
         * Gets the low 32 bits (signed).
         * @returns {number} The low 32 bits.
         */
        largeIntegerPrototype.getLow32Bits = function() {
            return this.lowBits;
        };

        /**
         * Gets the low 32 bits (unsigned).
         * @returns {number} The low 32 bits as unsigned.
         */
        largeIntegerPrototype.getLow32BitsUnsigned = function() {
            return this.lowBits >>> 0x0;
        };

        /**
         * Gets the number of bits required to represent the absolute value.
         * @returns {number} The number of bits.
         */
        largeIntegerPrototype.getAbsoluteBitCount = function() {
            if ( this.isNegative() ) {
                return this.equals( minSignedValue ) ? 0x40 : this.negate().getAbsoluteBitCount();
            }
            for ( var val = this.highBits !== 0x0 ? this.highBits : this.lowBits, bitPos = 0x1F; bitPos > 0x0 && 0x0 === ( val & ( 0x1 << bitPos ) ); bitPos-- );
            return this.highBits !== 0x0 ? bitPos + 0x21 : bitPos + 0b1;
        };

        /**
         * Checks if the LargeInteger is zero.
         * @returns {boolean} True if zero, false otherwise.
         */
        largeIntegerPrototype.isZero = function() {
            return 0x0 === this.highBits && 0x0 === this.lowBits;
        };
        largeIntegerPrototype.isEqualZero = largeIntegerPrototype.isZero;

        /**
         * Checks if the LargeInteger is negative.
         * @returns {boolean} True if negative, false otherwise.
         */
        largeIntegerPrototype.isNegative = function() {
            return ! this.isUnsigned && this.highBits < 0x0;
        };

        /**
         * Checks if the LargeInteger is positive.
         * @returns {boolean} True if positive, false otherwise.
         */
        largeIntegerPrototype.isPositive = function() {
            return this.isUnsigned || this.highBits >= 0x0;
        };

        /**
         * Checks if the LargeInteger is odd.
         * @returns {boolean} True if odd, false otherwise.
         */
        largeIntegerPrototype.isOdd = function() {
            return 0b1 === ( 0b1 & this.lowBits );
        };

        /**
         * Checks if the LargeInteger is even.
         * @returns {boolean} True if even, false otherwise.
         */
        largeIntegerPrototype.isEven = function() {
            return 0x0 === ( 0b1 & this.lowBits );
        };

        /**
         * Compares this LargeInteger with another for equality.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if equal, false otherwise.
         */
        largeIntegerPrototype.equals = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            // Optimization for signed/unsigned comparison
            return ( this.isUnsigned === other.isUnsigned || ( this.highBits >>> 0x1F ) !== 0b1 || ( other.highBits >>> 0x1F ) !== 0b1 ) && ( this.highBits === other.highBits && this.lowBits === other.lowBits );
        };
        largeIntegerPrototype.eq = largeIntegerPrototype.equals;

        /**
         * Compares this LargeInteger with another for inequality.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if not equal, false otherwise.
         */
        largeIntegerPrototype.notEquals = function( other ) {
            return ! this.equals( other );
        };
        largeIntegerPrototype.neq = largeIntegerPrototype.notEquals;
        largeIntegerPrototype.ne = largeIntegerPrototype.notEquals;

        /**
         * Checks if this LargeInteger is less than another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if less than, false otherwise.
         */
        largeIntegerPrototype.lessThan = function( other ) {
            return this.compareTo( other ) < 0x0;
        };
        largeIntegerPrototype.lt = largeIntegerPrototype.lessThan;

        /**
         * Checks if this LargeInteger is less than or equal to another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if less than or equal, false otherwise.
         */
        largeIntegerPrototype.lessThanOrEqual = function( other ) {
            return this.compareTo( other ) <= 0x0;
        };
        largeIntegerPrototype.lte = largeIntegerPrototype.lessThanOrEqual;
        largeIntegerPrototype.le = largeIntegerPrototype.lessThanOrEqual;

        /**
         * Checks if this LargeInteger is greater than another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if greater than, false otherwise.
         */
        largeIntegerPrototype.greaterThan = function( other ) {
            return this.compareTo( other ) > 0x0;
        };
        largeIntegerPrototype.gt = largeIntegerPrototype.greaterThan;

        /**
         * Checks if this LargeInteger is greater than or equal to another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {boolean} True if greater than or equal, false otherwise.
         */
        largeIntegerPrototype.greaterThanOrEqual = function( other ) {
            return this.compareTo( other ) >= 0x0;
        };
        largeIntegerPrototype.gte = largeIntegerPrototype.greaterThanOrEqual;
        largeIntegerPrototype.ge = largeIntegerPrototype.greaterThanOrEqual;

        /**
         * Compares this LargeInteger to another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {number} -1 if less, 0 if equal, 1 if greater.
         */
        largeIntegerPrototype.compareTo = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            if ( this.equals( other ) ) return 0x0;

            var thisIsNegative = this.isNegative();
            var otherIsNegative = other.isNegative();

            if ( thisIsNegative && ! otherIsNegative ) return -0b1;
            if ( ! thisIsNegative && otherIsNegative ) return 0b1;

            if ( this.isUnsigned ) {
                return ( other.highBits >>> 0x0 ) > ( this.highBits >>> 0x0 ) || ( other.highBits === this.highBits && ( other.lowBits >>> 0x0 ) > ( this.lowBits >>> 0x0 ) ) ? -0b1 : 0b1;
            }

            return this.subtract( other ).isNegative() ? -0b1 : 0b1;
        };
        largeIntegerPrototype.comp = largeIntegerPrototype.compareTo;

        /**
         * Negates this LargeInteger.
         * @returns {LargeInteger} The negated LargeInteger.
         */
        largeIntegerPrototype.negate = function() {
            return ! this.isUnsigned && this.equals( minSignedValue ) ? minSignedValue : this.not().add( oneSigned );
        };
        largeIntegerPrototype.neg = largeIntegerPrototype.negate;

        /**
         * Adds another LargeInteger to this one.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The sum.
         */
        largeIntegerPrototype.add = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }

            // Perform addition using 16-bit chunks to avoid overflow
            var thisHigh16 = this.highBits >>> 0x10;
            var thisLow16 = 0xFFFF & this.highBits;
            var thisLowLow16 = this.lowBits >>> 0x10;
            var thisLowLowLow16 = 0xFFFF & this.lowBits;

            var otherHigh16 = other.highBits >>> 0x10;
            var otherLow16 = 0xFFFF & other.highBits;
            var otherLowLow16 = other.lowBits >>> 0x10;
            var otherLowLowLow16 = 0xFFFF & other.lowBits;

            var carry1 = 0x0;
            var carry2 = 0x0;
            var carry3 = 0x0;
            var carry4 = 0x0;

            carry4 += ( carry3 += thisLowLowLow16 + otherLowLowLow16 ) >>> 0x10;
            carry3 = 0xFFFF & carry3;

            carry3 += ( carry2 += thisLowLow16 + otherLowLow16 ) >>> 0x10;
            carry2 = 0xFFFF & carry2;

            carry2 += ( carry1 += thisLow16 + otherLow16 ) >>> 0x10;
            carry1 = 0xFFFF & carry1;

            carry1 += thisHigh16 + otherHigh16;
            carry1 = 0xFFFF & carry1;

            return fromBitFields( ( carry2 << 0x10 ) | carry3, ( carry1 << 0x10 ) | carry4, this.isUnsigned );
        };

        /**
         * Subtracts another LargeInteger from this one.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The difference.
         */
        largeIntegerPrototype.subtract = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            return this.add( other.negate() );
        };
        largeIntegerPrototype.sub = largeIntegerPrototype.subtract;

        /**
         * Multiplies this LargeInteger by another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The product.
         */
        largeIntegerPrototype.multiply = function( other ) {
            if ( this.isZero() ) return zeroSigned;
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }

            // Use WebAssembly if available for performance
            if ( wasmInstance ) {
                return fromBitFields( wasmInstance.mul( this.lowBits, this.highBits, other.lowBits, other.highBits ), wasmInstance.get_high(), this.isUnsigned );
            }

            if ( other.isZero() ) return zeroSigned;
            if ( this.equals( minSignedValue ) ) return other.isOdd() ? minSignedValue : zeroSigned;
            if ( other.equals( minSignedValue ) ) return this.isOdd() ? minSignedValue : zeroSigned;

            // Handle signs for multiplication
            if ( this.isNegative() ) {
                return other.isNegative() ? this.negate().multiply( other.negate() ) : this.negate().multiply( other ).negate();
            }
            if ( other.isNegative() ) {
                return this.multiply( other.negate() ).negate();
            }

            // Short-circuit for small numbers
            if ( this.lessThan( twentyFourBitMask ) && other.lessThan( twentyFourBitMask ) ) {
                return fromFloatingPoint( this.toFloatingPointNumber() * other.toFloatingPointNumber(), this.isUnsigned );
            }

            // Multiply using 16-bit chunks
            var thisHigh16 = this.highBits >>> 0x10;
            var thisLow16 = 0xFFFF & this.highBits;
            var thisLowLow16 = this.lowBits >>> 0x10;
            var thisLowLowLow16 = 0xFFFF & this.lowBits;

            var otherHigh16 = other.highBits >>> 0x10;
            var otherLow16 = 0xFFFF & other.highBits;
            var otherLowLow16 = other.lowBits >>> 0x10;
            var otherLowLowLow16 = 0xFFFF & other.lowBits;

            var res0 = 0x0;
            var res1 = 0x0;
            var res2 = 0x0;
            var res3 = 0x0;

            res2 += ( res3 += thisLowLowLow16 * otherLowLowLow16 ) >>> 0x10;
            res3 = 0xFFFF & res3;

            res1 += ( res2 += thisLowLow16 * otherLowLowLow16 ) >>> 0x10;
            res2 = 0xFFFF & res2;

            res2 += ( res1 += thisLowLowLow16 * otherLow16 ) >>> 0x10;
            res1 = 0xFFFF & res1;

            res0 += ( res1 += thisLow16 * otherLowLowLow16 ) >>> 0x10;
            res1 = 0xFFFF & res1;

            res0 += ( res1 += thisLowLow16 * otherLowLow16 ) >>> 0x10;
            res1 = 0xFFFF & res1;

            res0 += ( res1 += thisLowLowLow16 * otherLow16 ) >>> 0x10;
            res1 = 0xFFFF & res1;

            res0 += thisHigh16 * otherLowLowLow16 + thisLow16 * otherLowLow16 + thisLowLow16 * otherLow16 + thisLowLowLow16 * otherHigh16;
            res0 = 0xFFFF & res0;

            return fromBitFields( ( res2 & 0xFFFF ) << 0x10 | ( res3 & 0xFFFF ), ( res0 & 0xFFFF ) << 0x10 | ( res1 & 0xFFFF ), this.isUnsigned );
        };
        largeIntegerPrototype.mul = largeIntegerPrototype.multiply;

        /**
         * Divides this LargeInteger by another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The quotient.
         */
        largeIntegerPrototype.divide = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            if ( other.isZero() ) throw Error( "division by zero" );

            // Use WebAssembly if available for performance
            var wasmDivResult, wasmHighResult;
            if ( wasmInstance ) {
                // Special case for MIN_VALUE / -1
                if ( ! this.isUnsigned && -0x80000000 === this.highBits && -0b1 === other.lowBits && -0b1 === other.highBits ) {
                    return this;
                }
                wasmDivResult = this.isUnsigned ? wasmInstance.div_u : wasmInstance.div_s;
                return fromBitFields( wasmDivResult( this.lowBits, this.highBits, other.lowBits, other.highBits ), wasmInstance.get_high(), this.isUnsigned );
            }

            if ( this.isZero() ) return this.isUnsigned ? zeroUnsigned : zeroSigned;

            // Handle unsigned division
            if ( this.isUnsigned ) {
                if ( ! other.isUnsigned ) other = other.toUnsigned();
                if ( other.greaterThan( this ) ) return zeroUnsigned;
                if ( other.greaterThan( this.shiftRightUnsigned( 0b1 ) ) ) return oneUnsigned;
                wasmDivResult = zeroUnsigned; // Placeholder for result
            } else {
                // Handle signed division special cases
                if ( this.equals( minSignedValue ) ) {
                    if ( other.equals( oneSigned ) || other.equals( negativeOne ) ) return minSignedValue;
                    if ( other.equals( minSignedValue ) ) return oneSigned;
                    // Approximation for MIN_VALUE / X
                    wasmDivResult = this.shiftRight( 0b1 ).divide( other ).shiftLeft( 0b1 );
                    if ( wasmDivResult.equals( zeroSigned ) ) return other.isNegative() ? oneSigned : negativeOne;
                    var remainder = this.subtract( other.multiply( wasmDivResult ) );
                    return wasmDivResult.add( remainder.divide( other ) );
                }
                if ( other.equals( minSignedValue ) ) return this.isUnsigned ? zeroUnsigned : zeroSigned;

                // Handle signs for division
                if ( this.isNegative() ) {
                    return other.isNegative() ? this.negate().divide( other.negate() ) : this.negate().divide( other ).negate();
                }
                if ( other.isNegative() ) {
                    return this.divide( other.negate() ).negate();
                }
                wasmDivResult = zeroSigned; // Placeholder for result
            }

            // General division algorithm
            var currentDividend = this;
            while ( currentDividend.greaterThanOrEqual( other ) ) {
                var factor = Math.max( 0b1, Math.floor( currentDividend.toFloatingPointNumber() / other.toFloatingPointNumber() ) );
                var logFactor = Math.ceil( Math.log( factor ) / Math.LN2 );
                var shiftAmount = logFactor <= 0x30 ? 0b1 : powerFunction( 0x2, logFactor - 0x30 );
                var approxFactor = fromFloatingPoint( factor );
                var product = approxFactor.multiply( other );

                while ( product.isNegative() || product.greaterThan( currentDividend ) ) {
                    product = ( approxFactor = fromFloatingPoint( factor -= shiftAmount, this.isUnsigned ) ).multiply( other );
                }
                if ( approxFactor.isZero() ) {
                    approxFactor = oneSigned;
                }
                wasmDivResult = wasmDivResult.add( approxFactor );
                currentDividend = currentDividend.subtract( product );
            }
            return wasmDivResult;
        };
        largeIntegerPrototype.div = largeIntegerPrototype.divide;

        /**
         * Calculates the remainder of division of this LargeInteger by another.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The remainder.
         */
        largeIntegerPrototype.modulo = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }

            // Use WebAssembly if available for performance
            if ( wasmInstance ) {
                var wasmRemResult = this.isUnsigned ? wasmInstance.rem_u : wasmInstance.rem_s;
                return fromBitFields( wasmRemResult( this.lowBits, this.highBits, other.lowBits, other.highBits ), wasmInstance.get_high(), this.isUnsigned );
            }

            return this.subtract( this.divide( other ).multiply( other ) );
        };
        largeIntegerPrototype.mod = largeIntegerPrototype.modulo;
        largeIntegerPrototype.rem = largeIntegerPrototype.modulo;

        /**
         * Performs a bitwise NOT operation.
         * @returns {LargeInteger} The result of the NOT operation.
         */
        largeIntegerPrototype.not = function() {
            return fromBitFields( ~this.lowBits, ~this.highBits, this.isUnsigned );
        };

        /**
         * Performs a bitwise AND operation with another LargeInteger.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The result of the AND operation.
         */
        largeIntegerPrototype.and = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            return fromBitFields( this.lowBits & other.lowBits, this.highBits & other.highBits, this.isUnsigned );
        };

        /**
         * Performs a bitwise OR operation with another LargeInteger.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The result of the OR operation.
         */
        largeIntegerPrototype.or = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            return fromBitFields( this.lowBits | other.lowBits, this.highBits | other.highBits, this.isUnsigned );
        };

        /**
         * Performs a bitwise XOR operation with another LargeInteger.
         * @param {LargeInteger} other - The other LargeInteger.
         * @returns {LargeInteger} The result of the XOR operation.
         */
        largeIntegerPrototype.xor = function( other ) {
            if ( ! isLargeInteger( other ) ) {
                other = fromAnyValue( other );
            }
            return fromBitFields( this.lowBits ^ other.lowBits, this.highBits ^ other.highBits, this.isUnsigned );
        };

        /**
         * Performs a left shift operation.
         * @param {number|LargeInteger} shiftAmount - The amount to shift by.
         * @returns {LargeInteger} The shifted LargeInteger.
         */
        largeIntegerPrototype.shiftLeft = function( shiftAmount ) {
            if ( isLargeInteger( shiftAmount ) ) {
                shiftAmount = shiftAmount.to32BitInteger();
            }
            shiftAmount &= 0x3F; // Only consider shifts up to 63 bits
            if ( 0x0 === shiftAmount ) return this;
            return shiftAmount < 0x20 ?
                fromBitFields( this.lowBits << shiftAmount, ( this.highBits << shiftAmount ) | ( this.lowBits >>> ( 0x20 - shiftAmount ) ), this.isUnsigned ) :
                fromBitFields( 0x0, this.lowBits << ( shiftAmount - 0x20 ), this.isUnsigned );
        };
        largeIntegerPrototype.shl = largeIntegerPrototype.shiftLeft;

        /**
         * Performs a signed right shift operation.
         * @param {number|LargeInteger} shiftAmount - The amount to shift by.
         * @returns {LargeInteger} The shifted LargeInteger.
         */
        largeIntegerPrototype.shiftRight = function( shiftAmount ) {
            if ( isLargeInteger( shiftAmount ) ) {
                shiftAmount = shiftAmount.to32BitInteger();
            }
            shiftAmount &= 0x3F; // Only consider shifts up to 63 bits
            if ( 0x0 === shiftAmount ) return this;
            return shiftAmount < 0x20 ?
                fromBitFields( ( this.lowBits >>> shiftAmount ) | ( this.highBits << ( 0x20 - shiftAmount ) ), this.highBits >> shiftAmount, this.isUnsigned ) :
                fromBitFields( this.highBits >> ( shiftAmount - 0x20 ), this.highBits >= 0x0 ? 0x0 : -0b1, this.isUnsigned );
        };
        largeIntegerPrototype.shr = largeIntegerPrototype.shiftRight;

        /**
         * Performs an unsigned right shift operation.
         * @param {number|LargeInteger} shiftAmount - The amount to shift by.
         * @returns {LargeInteger} The shifted LargeInteger.
         */
        largeIntegerPrototype.shiftRightUnsigned = function( shiftAmount ) {
            if ( isLargeInteger( shiftAmount ) ) {
                shiftAmount = shiftAmount.to32BitInteger();
            }
            if ( 0x0 === ( shiftAmount &= 0x3F ) ) return this; // Only consider shifts up to 63 bits
            var highPart = this.highBits;
            return shiftAmount < 0x20 ?
                fromBitFields( ( this.lowBits >>> shiftAmount ) | ( highPart << ( 0x20 - shiftAmount ) ), highPart >>> shiftAmount, this.isUnsigned ) :
                fromBitFields( 0x20 === shiftAmount ? highPart : ( highPart >>> ( shiftAmount - 0x20 ) ), 0x0, this.isUnsigned );
        };
        largeIntegerPrototype.shru = largeIntegerPrototype.shiftRightUnsigned;
        largeIntegerPrototype.unsignedShiftRight = largeIntegerPrototype.shiftRightUnsigned;

        /**
         * Converts this LargeInteger to a signed representation.
         * @returns {LargeInteger} The signed LargeInteger.
         */
        largeIntegerPrototype.toSigned = function() {
            return this.isUnsigned ? fromBitFields( this.lowBits, this.highBits, ! true ) : this;
        };

        /**
         * Converts this LargeInteger to an unsigned representation.
         * @returns {LargeInteger} The unsigned LargeInteger.
         */
        largeIntegerPrototype.toUnsigned = function() {
            return this.isUnsigned ? this : fromBitFields( this.lowBits, this.highBits, ! false );
        };

        /**
         * Converts this LargeInteger to a byte array.
         * @param {boolean} littleEndian - True for little-endian, false for big-endian.
         * @returns {number[]} The byte array.
         */
        largeIntegerPrototype.toBytes = function( littleEndian ) {
            return littleEndian ? this.toBytesLittleEndian() : this.toBytesBigEndian();
        };

        /**
         * Converts this LargeInteger to a little-endian byte array.
         * @returns {number[]} The byte array.
         */
        largeIntegerPrototype.toBytesLittleEndian = function() {
            var highPart = this.highBits;
            var lowPart = this.lowBits;
            return [ 0xFF & lowPart, lowPart >>> 0x8 & 0xFF, lowPart >>> 0x10 & 0xFF, lowPart >>> 0x18, 0xFF & highPart, highPart >>> 0x8 & 0xFF, highPart >>> 0x10 & 0xFF, highPart >>> 0x18 ];
        };

        /**
         * Converts this LargeInteger to a big-endian byte array.
         * @returns {number[]} The byte array.
         */
        largeIntegerPrototype.toBytesBigEndian = function() {
            var highPart = this.highBits;
            var lowPart = this.lowBits;
            return [ highPart >>> 0x18, highPart >>> 0x10 & 0xFF, highPart >>> 0x8 & 0xFF, 0xFF & highPart, lowPart >>> 0x18, lowPart >>> 0x10 & 0xFF, lowPart >>> 0x8 & 0xFF, 0xFF & lowPart ];
        };

        /**
         * Creates a LargeInteger from a byte array.
         * @param {number[]} byteArray - The byte array.
         * @param {boolean} littleEndian - True for little-endian, false for big-endian.
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        LargeInteger.fromBytes = function( byteArray, littleEndian, isUnsigned ) {
            return isUnsigned ? LargeInteger.fromBytesLittleEndian( byteArray, isUnsigned ) : LargeInteger.fromBytesBigEndian( byteArray, isUnsigned );
        };

        /**
         * Creates a LargeInteger from a little-endian byte array.
         * @param {number[]} byteArray - The byte array.
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        LargeInteger.fromBytesLittleEndian = function( byteArray, isUnsigned ) {
            return new LargeInteger( byteArray[ 0x0 ] | byteArray[ 0b1 ] << 0x8 | byteArray[ 0x2 ] << 0x10 | byteArray[ 0x3 ] << 0x18, byteArray[ 0x4 ] | byteArray[ 0x5 ] << 0x8 | byteArray[ 0x6 ] << 0x10 | byteArray[ 0x7 ] << 0x18, isUnsigned );
        };

        /**
         * Creates a LargeInteger from a big-endian byte array.
         * @param {number[]} byteArray - The byte array.
         * @param {boolean} isUnsigned - Whether the result should be unsigned.
         * @returns {LargeInteger} The LargeInteger instance.
         */
        LargeInteger.fromBytesBigEndian = function( byteArray, isUnsigned ) {
            return new LargeInteger( byteArray[ 0x4 ] << 0x18 | byteArray[ 0x5 ] << 0x10 | byteArray[ 0x6 ] << 0x8 | byteArray[ 0x7 ], byteArray[ 0x0 ] << 0x18 | byteArray[ 0b1 ] << 0x10 | byteArray[ 0x2 ] << 0x8 | byteArray[ 0x3 ], isUnsigned );
        };
    }
] );