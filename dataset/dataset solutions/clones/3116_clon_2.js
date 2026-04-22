/*
 * This is a Type II clone of an original JavaScript module bundle.
 * The core logic and control flow are preserved, but identifiers,
 * whitespace, and comments have been thoroughly altered.
 */
!function( packageRegistry ) {
  // A cache for loaded modules, preventing redundant processing.
  var moduleCache = {};

  /**
   * Loads a module by its identifier.
   * @param {number} moduleId - The unique identifier of the module to load.
   * @returns {object} The exports object of the loaded module.
   */
  function loadModule( moduleId ) {
    // If the module is already in the cache, return its exports.
    if ( moduleCache[ moduleId ] ) {
      return moduleCache[ moduleId ].exports;
    }

    // Initialize a new module entry in the cache.
    // The 'modId' property stores the module's ID.
    // 'isLoaded' flag indicates if the module's function has been executed.
    // 'exports' is the object where the module's public API will be stored.
    var currentModule = moduleCache[ moduleId ] = {
      modId: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's function, passing necessary parameters.
    // 'packageRegistry[moduleId]' holds the actual module function.
    // 'currentModule.exports' is passed as 'this' and the 'exports' object.
    // 'currentModule' is passed as the module object itself.
    // 'loadModule' (this function) is passed as the 'require' function for internal dependencies.
    packageRegistry[ moduleId ].call( currentModule.exports, currentModule, currentModule.exports, loadModule );

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Store a reference to the collection of module functions.
  loadModule.modulesDict = packageRegistry;
  // Store a reference to the module cache.
  loadModule.cacheRef = moduleCache;

  /**
   * Defines an enumerable getter property on an object.
   * This is typically used for defining exports.
   * @param {object} targetObj - The object to define the property on.
   * @param {string} propName - The name of the property.
   * @param {Function} getterFunc - The getter function for the property.
   */
  loadModule.defineExport = function( targetObj, propName, getterFunc ) {
    if ( !loadModule.hasOwnProp( targetObj, propName ) ) {
      Object.defineProperty( targetObj, propName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunc   // Assign the getter function.
      } );
    }
  };

  /**
   * Marks a module as an ES module by adding a Symbol.toStringTag property
   * and an __esModule flag.
   * @param {object} targetObj - The module exports object.
   */
  loadModule.registerEsModule = function( targetObj ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( targetObj, Symbol.toStringTag, { value: "Module" } );
    }
    Object.defineProperty( targetObj, "__esModule", { value: true } );
  };

  /**
   * Retrieves the exports of a module, handling different module types (ESM, CJS).
   * @param {any} moduleVal - The module or its ID.
   * @param {number} modeFlags - Flags indicating how to interpret 'moduleVal'.
   * @returns {any} The module's exports.
   */
  loadModule.getModuleExports = function( moduleVal, modeFlags ) {
    // If flag 1 is set, 'moduleVal' is a module ID, so load it.
    if ( 1 & modeFlags ) {
      moduleVal = loadModule( moduleVal );
    }
    // If flag 8 is set, return the module value directly.
    if ( 8 & modeFlags ) {
      return moduleVal;
    }
    // If flag 4 is set and it's an object with __esModule, return it directly.
    if ( 4 & modeFlags && typeof moduleVal === "object" && moduleVal && moduleVal.__esModule ) {
      return moduleVal;
    }

    // Create a new object for the namespace.
    var namespaceObj = Object.create( null );
    // Register it as an ES module.
    loadModule.registerEsModule( namespaceObj );
    // Set the 'default' export.
    Object.defineProperty( namespaceObj, "default", { enumerable: true, value: moduleVal } );

    // If flag 2 is set and it's not a string, copy all properties from moduleVal.
    if ( 2 & modeFlags && typeof moduleVal !== "string" ) {
      for ( var propKey in moduleVal ) {
        loadModule.defineExport( namespaceObj, propKey, ( function( key ) {
          return moduleVal[ key ];
        } ).bind( null, propKey ) );
      }
    }
    return namespaceObj;
  };

  /**
   * Creates a namespace object for a given module, handling default exports.
   * @param {any} moduleVal - The module object.
   * @returns {Function} A getter function for the module's exports.
   */
  loadModule.getNamespaceObject = function( moduleVal ) {
    var exportGetter = moduleVal && moduleVal.__esModule ?
      function() { return moduleVal.default; } : // If ES module, return default.
      function() { return moduleVal; };       // Otherwise, return module itself.

    // Define a property 'a' (common webpack convention) that returns the exports.
    loadModule.defineExport( exportGetter, "a", exportGetter );
    return exportGetter;
  };

  /**
   * Checks if an object has a specific property as its own property.
   * @param {object} obj - The object to check.
   * @param {string} key - The property key.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadModule.hasOwnProp = function( obj, key ) {
    return Object.prototype.hasOwnProperty.call( obj, key );
  };

  // Initialize the public path (often used for dynamic imports).
  loadModule.publicPath = "";

  // Load the entry point module (module ID 17).
  loadModule( loadModule.startupModuleId = 17 );
}( {
  /* Module 0: Input Utilities and Async Helpers */
  0: function( currentMod, modExports, moduleLoader ) {
    "use strict";
    // Helper for async/await functionality (TypeScript transpilation).
    // This function wraps a generator function to provide async/await behavior.
    var awaitHelper = ( this && this.__awaiter ) || function( thisArg, _arguments, P, generator ) {
      // Return a new Promise that will resolve or reject based on the generator's execution.
      return new ( P || ( P = Promise ) )( function( fulfill, fail ) {
        /**
         * Processes the next step of the generator.
         * @param {any} genResult - The result of the previous generator yield/return.
         */
        function processStep( genResult ) {
          try {
            advanceGenerator( generator.next( genResult ) );
          } catch ( errorValue ) {
            fail( errorValue );
          }
        }

        /**
         * Handles errors thrown by the generator.
         * @param {any} errorValue - The error thrown.
         */
        function handleError( errorValue ) {
          try {
            advanceGenerator( generator.throw( errorValue ) );
          } catch ( errorValue ) {
            fail( errorValue );
          }
        }

        /**
         * Advances the generator based on its current state.
         * If the generator is done, it fulfills the promise with the final value.
         * Otherwise, it wraps the yielded value in a promise and continues.
         * @param {IteratorResult} iterResult - The result object from generator.next() or generator.throw().
         */
        function advanceGenerator( iterResult ) {
          iterResult.done ? fulfill( iterResult.value ) : new P( function( promiseResolve ) {
            promiseResolve( iterResult.value );
          } ).then( processStep, handleError );
        }

        // Start the generator execution.
        advanceGenerator( ( generator = generator.apply( thisArg, _arguments || [] ) ).next() );
      } );
    };

    // Helper for generator functions (TypeScript transpilation).
    // This function provides the structure for an iterable generator.
    var generatorHelper = ( this && this.__generator ) || function( thisArg, _arguments ) {
      var currentGen, lastYielded, currentOp, iteratorObj, // Internal state variables for the generator.
        genState = {
          label: 0, // Current state label within the generator.
          sent: function() {
            if ( 1 & currentOp[ 0 ] ) throw currentOp[ 1 ];
            return currentOp[ 1 ];
          },
          trys: [], // Stack for try/catch/finally blocks.
          ops: []   // Stack for operations.
        };

      iteratorObj = {
        next: makeStep( 0 ),
        throw: makeStep( 1 ),
        return: makeStep( 2 )
      };

      // If Symbol.iterator is available, make the generator object iterable.
      if ( typeof Symbol === "function" && ( iteratorObj[ Symbol.iterator ] = function() { return this; } ) ) {
        // No-op, assignment already done.
      }
      return iteratorObj;

      /**
       * Creates a step function for the generator.
       * @param {number} stepType - The type of step (next, throw, return).
       * @returns {Function} The step function.
       */
      function makeStep( stepType ) {
        return function( stepValue ) {
          return executeStep( [ stepType, stepValue ] );
        };
      }

      /**
       * Executes a step within the generator's state machine.
       * This is the core logic that simulates generator execution.
       * @param {Array} stepArray - An array containing the step type and value.
       * @returns {IteratorResult} An object with 'value' and 'done' properties.
       */
      function executeStep( stepArray ) {
        if ( currentGen ) throw new TypeError( "Generator is already executing." );

        while ( genState ) {
          try {
            // Mark generator as executing.
            if ( ( currentGen = 1 ) &&
              ( lastYielded = ( 2 & stepArray[ 0 ] ? currentGen.return : stepArray[ 0 ] ? currentGen.throw || ( ( currentOp = currentGen.return ) && currentOp.call( currentGen ), 0 ) : currentGen.next ) ) &&
              !( currentOp = lastYielded.call( currentGen, stepArray[ 1 ] ) ).done ) {
              return currentOp;
            }

            // Reset generator status.
            lastYielded = 0;

            // Update stepArray based on current operation.
            if ( currentOp ) {
              stepArray = [ 2 & stepArray[ 0 ], currentOp.value ];
            }

            switch ( stepArray[ 0 ] ) {
              case 0: // Initial state or after yield.
              case 1: // After an error.
                currentOp = stepArray;
                break;
              case 4: // Yield a value.
                genState.label++;
                return { value: stepArray[ 1 ], done: false };
              case 5: // Assign next state and break.
                genState.label++;
                lastYielded = stepArray[ 1 ];
                stepArray = [ 0 ];
                continue;
              case 7: // Pop from ops and trys stack.
                stepArray = genState.ops.pop();
                genState.trys.pop();
                continue;
              default:
                // Handle various try/catch/finally block transitions.
                if ( !( currentOp = ( currentOp = genState.trys ).length > 0 && currentOp[ currentOp.length - 1 ] ) && ( 6 === stepArray[ 0 ] || 2 === stepArray[ 0 ] ) ) {
                  genState = 0; // Exit generator.
                  continue;
                }
                if ( 3 === stepArray[ 0 ] && ( !currentOp || stepArray[ 1 ] > currentOp[ 0 ] && stepArray[ 1 ] < currentOp[ 3 ] ) ) {
                  genState.label = stepArray[ 1 ];
                  break;
                }
                if ( 6 === stepArray[ 0 ] && genState.label < currentOp[ 1 ] ) {
                  genState.label = currentOp[ 1 ];
                  currentOp = stepArray;
                  break;
                }
                if ( currentOp && genState.label < currentOp[ 2 ] ) {
                  genState.label = currentOp[ 2 ];
                  genState.ops.push( stepArray );
                  break;
                }
                // Default: Pop from ops and trys, then continue.
                currentOp[ 2 ] && genState.ops.pop();
                genState.trys.pop();
                continue;
            }
            stepArray = _arguments.call( thisArg, genState );
          } catch ( errorValue ) {
            stepArray = [ 6, errorValue ];
            lastYielded = 0;
          } finally {
            currentGen = currentOp = 0; // Clear generator state.
          }
        }
        if ( 5 & stepArray[ 0 ] ) throw stepArray[ 1 ];
        return { value: stepArray[ 0 ] ? stepArray[ 1 ] : void 0, done: true };
      }
    };

    // Helper for importing default exports from modules.
    var importDefaultHelper = ( this && this.__importDefault ) || function( inputModule ) {
      return inputModule && inputModule.__esModule ? inputModule : { default: inputModule };
    };

    // Store a reference to the 'this' context for use in helpers.
    var localContext = this;
    // Mark this module's exports as an ES module.
    modExports.isEsModule = true;

    // Import the 'fs' (file system) module.
    var fileSystemUtil = importDefaultHelper( moduleLoader( 1 ) );

    /**
     * Generator function that yields words from a string.
     * Splits the string by whitespace and yields each non-empty word.
     * @param {string} sourceString - The string to tokenize.
     * @yields {string} A single word from the input string.
     */
    function getInputWordIterator( sourceString ) {
      var wordParts, currentIndex;
      return generatorHelper( this, function( genState ) {
        switch ( genState.label ) {
          case 0:
            // Split the string by whitespace and filter out empty strings.
            wordParts = sourceString.split( /\s+/ ).filter( function( s ) { return s.length > 0; } );
            currentIndex = 0;
            genState.label = 1;
          case 1:
            // Loop through the word parts.
            return currentIndex < wordParts.length ? [ 4, wordParts[ currentIndex ] ] : [ 3, 4 ];
          case 2:
            // After yielding, continue to the next word.
            genState.sent();
            genState.label = 3;
          case 3:
            currentIndex++;
            return [ 3, 1 ]; // Go back to label 1 to check condition.
          case 4:
            return [ 2 ]; // Generator done.
        }
      } );
    }

    /**
     * Reads the entire input from /dev/stdin asynchronously.
     * @returns {Promise<string>} A promise that resolves with the input string or rejects with an error.
     */
    modExports.retrieveInput = function() {
      return new Promise( function( resolveHandler, errorHandler ) {
        fileSystemUtil.default.readFile( "/dev/stdin", "utf8", function( readError, inputData ) {
          if ( readError ) {
            errorHandler( readError );
          } else {
            resolveHandler( inputData );
          }
        } );
      } );
    };

    // Expose the word iterator function.
    modExports.createWordStream = getInputWordIterator;

    /**
     * Asynchronously gets a function that, when called, returns the next integer from input.
     * It reads the entire input once, then provides a closure for subsequent calls.
     * @returns {Promise<Function>} A promise resolving to a function that returns parsed integers.
     */
    modExports.getNextInteger = function() {
      return awaitHelper( localContext, void 0, void 0, function() {
        var rawInputText, wordStream;
        return generatorHelper( this, function( genState ) {
          switch ( genState.label ) {
            case 0:
              return [ 4, modExports.retrieveInput() ]; // Await input.
            case 1:
              rawInputText = genState.sent();
              wordStream = getInputWordIterator( rawInputText ); // Create iterator from input.
              return [ 2, function() {
                return parseInt( wordStream.next().value ); // Return a function to get next int.
              } ];
          }
        } );
      } );
    };

    /**
     * Asynchronously gets a function that, when called, returns the next token from input.
     * This version implements a more robust tokenization directly from the string.
     * It reads the entire input once, then provides a closure for subsequent calls.
     * @returns {Promise<Function>} A promise resolving to a function that returns string tokens.
     */
    modExports.getNextToken = function() {
      return awaitHelper( localContext, void 0, void 0, function() {
        var wholeInput, tokenGenerator;
        return generatorHelper( this, function( genState ) {
          switch ( genState.label ) {
            case 0:
              return [ 4, modExports.retrieveInput() ]; // Await input.
            case 1:
              wholeInput = genState.sent();
              // Define an inner generator to yield tokens from the 'wholeInput' string.
              tokenGenerator = function() {
                var startIdx, endIdx, tokenValue;
                return generatorHelper( this, function( genState ) {
                  switch ( genState.label ) {
                    case 0:
                      startIdx = -1; // Marks the start of a token.
                      endIdx = 0;    // Current position in the string.
                      genState.label = 1;
                    case 1:
                      // Loop until end of string.
                      return endIdx <= wholeInput.length ?
                        ( " " !== wholeInput[ endIdx ] && "\n" !== wholeInput[ endIdx ] && endIdx !== wholeInput.length ?
                          [ 3, 5 ] : // If not whitespace and not end, continue building token.
                          ( -1 !== startIdx ? [ 3, 2 ] : [ 3, 6 ] ) ) : // If whitespace or end, check if a token was being built.
                        [ 3, 7 ]; // End of string, exit.
                    case 2:
                      tokenValue = wholeInput.substring( startIdx, endIdx ); // Extract token.
                      startIdx = -1; // Reset start index.
                      return [ 4, tokenValue ]; // Yield the token.
                    case 3:
                      genState.sent();
                      genState.label = 4;
                    case 4:
                      return [ 3, 6 ]; // Continue loop.
                    case 5:
                      if ( -1 === startIdx ) {
                        startIdx = endIdx; // Mark start of new token.
                      }
                      genState.label = 6;
                    case 6:
                      endIdx++;
                      return [ 3, 1 ]; // Continue loop.
                    case 7:
                      return [ 2 ]; // Generator done.
                  }
                } );
              }(); // Immediately invoke the inner generator to get the iterator.
              return [ 2, function() {
                return tokenGenerator.next().value; // Return a function to get next token.
              } ];
          }
        } );
      } );
    };

    /**
     * Asynchronously gets a function that, when called, returns the next integer from input.
     * This uses the more robust tokenization method.
     * @returns {Promise<Function>} A promise resolving to a function that returns parsed integers.
     */
    modExports.getNextParsedInteger = function() {
      return awaitHelper( localContext, void 0, void 0, function() {
        var tokenFunc;
        return generatorHelper( this, function( genState ) {
          switch ( genState.label ) {
            case 0:
              return [ 4, modExports.getNextToken() ]; // Await the token getter function.
            case 1:
              tokenFunc = genState.sent();
              return [ 2, function() {
                return parseInt( tokenFunc() ); // Return a function to get next token and parse it.
              } ];
          }
        } );
      } );
    };
  },

  /* Module 1: Node.js File System (fs) Module */
  1: function( currentMod, modExports ) {
    // This module simply exports the Node.js built-in 'fs' module.
    currentMod.exports = require( "node:fs" );
  },

  /* Module 17: Main Application Logic */
  17: function( currentMod, modExports, moduleLoader ) {
    "use strict";
    // Reuse the awaiter and generator helpers from the boilerplate.
    var awaitHelper = ( this && this.__awaiter ) || function( thisArg, _arguments, P, generator ) {
      return new ( P || ( P = Promise ) )( function( fulfill, fail ) {
        function processStep( genResult ) { try { advanceGenerator( generator.next( genResult ) ); } catch ( errorValue ) { fail( errorValue ); } }
        function handleError( errorValue ) { try { advanceGenerator( generator.throw( errorValue ) ); } catch ( errorValue ) { fail( errorValue ); } }
        function advanceGenerator( iterResult ) { iterResult.done ? fulfill( iterResult.value ) : new P( function( promiseResolve ) { promiseResolve( iterResult.value ); } ).then( processStep, handleError ); }
        advanceGenerator( ( generator = generator.apply( thisArg, _arguments || [] ) ).next() );
      } );
    };
    var generatorHelper = ( this && this.__generator ) || function( thisArg, _arguments ) {
      var currentGen, lastYielded, currentOp, iteratorObj, genState = { label: 0, sent: function() { if ( 1 & currentOp[ 0 ] ) throw currentOp[ 1 ]; return currentOp[ 1 ]; }, trys: [], ops: [] };
      return iteratorObj = { next: makeStep( 0 ), throw: makeStep( 1 ), return: makeStep( 2 ) }, typeof Symbol === "function" && ( iteratorObj[ Symbol.iterator ] = function() { return this; } ), iteratorObj;
      function makeStep( stepType ) { return function( stepValue ) { return executeStep( [ stepType, stepValue ] ); }; }
      function executeStep( stepArray ) {
        if ( currentGen ) throw new TypeError( "Generator is already executing." );
        while ( genState ) try {
          if ( ( currentGen = 1 ) && ( lastYielded = ( 2 & stepArray[ 0 ] ? currentGen.return : stepArray[ 0 ] ? currentGen.throw || ( ( currentOp = currentGen.return ) && currentOp.call( currentGen ), 0 ) : currentGen.next ) ) && !( currentOp = lastYielded.call( currentGen, stepArray[ 1 ] ) ).done ) return currentOp;
          lastYielded = 0;
          if ( currentOp ) stepArray = [ 2 & stepArray[ 0 ], currentOp.value ];
          switch ( stepArray[ 0 ] ) {
            case 0: case 1: currentOp = stepArray; break;
            case 4: genState.label++; return { value: stepArray[ 1 ], done: false };
            case 5: genState.label++; lastYielded = stepArray[ 1 ]; stepArray = [ 0 ]; continue;
            case 7: stepArray = genState.ops.pop(); genState.trys.pop(); continue;
            default:
              if ( !( currentOp = ( currentOp = genState.trys ).length > 0 && currentOp[ currentOp.length - 1 ] ) && ( 6 === stepArray[ 0 ] || 2 === stepArray[ 0 ] ) ) { genState = 0; continue; }
              if ( 3 === stepArray[ 0 ] && ( !currentOp || stepArray[ 1 ] > currentOp[ 0 ] && stepArray[ 1 ] < currentOp[ 3 ] ) ) { genState.label = stepArray[ 1 ]; break; }
              if ( 6 === stepArray[ 0 ] && genState.label < currentOp[ 1 ] ) { genState.label = currentOp[ 1 ]; currentOp = stepArray; break; }
              if ( currentOp && genState.label < currentOp[ 2 ] ) { genState.label = currentOp[ 2 ]; genState.ops.push( stepArray ); break; }
              currentOp[ 2 ] && genState.ops.pop(); genState.trys.pop(); continue;
          }
          stepArray = _arguments.call( thisArg, genState );
        } catch ( errorValue ) { stepArray = [ 6, errorValue ]; lastYielded = 0; } finally { currentGen = currentOp = 0; }
        if ( 5 & stepArray[ 0 ] ) throw stepArray[ 1 ]; return { value: stepArray[ 0 ] ? stepArray[ 1 ] : void 0, done: true };
      }
    };

    // Store a reference to the 'this' context for use in helpers.
    var localContext = this;
    // Mark this module's exports as an ES module.
    modExports.isEsModule = true;

    // Import the input utilities module (Module 0).
    var inputUtilities = moduleLoader( 0 );

    // Main asynchronous execution block.
    awaitHelper( localContext, void 0, void 0, function() {
      var inputValue, parsedValue, counterA, counterB;
      return generatorHelper( this, function( genState ) {
        switch ( genState.label ) {
          case 0:
            // Obtain the function to get the next parsed integer from input.
            return [ 4, inputUtilities.getNextParsedInteger() ];
          case 1:
            inputValue = genState.sent(); // 'inputValue' is now a function.
            parsedValue = inputValue();   // Call it to get the actual integer.

            // Check if the parsed value is odd.
            if ( parsedValue % 2 === 1 ) {
              // If odd, iterate from 1 to parsedValue.
              for ( counterA = 1; counterA <= parsedValue; counterA++ ) {
                // Inner loop from counterA + 1 to parsedValue.
                for ( counterB = counterA + 1; counterB <= parsedValue; counterB++ ) {
                  // If the sum of counterA and counterB is NOT equal to parsedValue, print them.
                  if ( counterA + counterB !== parsedValue ) {
                    console.log( counterA + " " + counterB );
                  }
                }
              }
            } else {
              // If even, iterate from 1 to parsedValue.
              for ( counterA = 1; counterA <= parsedValue; counterA++ ) {
                // Inner loop from counterA + 1 to parsedValue.
                for ( counterB = counterA + 1; counterB <= parsedValue; counterB++ ) {
                  // If the sum of counterA and counterB is NOT equal to parsedValue + 1, print them.
                  if ( counterA + counterB !== parsedValue + 1 ) {
                    console.log( counterA + " " + counterB );
                  }
                }
              }
            }
            return [ 2 ]; // End of generator.
        }
      } );
    } );
  }
} );