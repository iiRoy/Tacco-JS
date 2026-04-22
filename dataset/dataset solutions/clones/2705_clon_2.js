/*
 * This is a simulated module system loader,
 * similar to what a bundler like Webpack might generate.
 */
module.exports = function( allModuleDefinitions ) {
  // Cache for already loaded modules.
  var cachedLoadedModules = {};

  /**
   * The core module loading function.
   * @param {number} moduleIdentifier - The ID of the module to load.
   * @returns {object} The exports of the requested module.
   */
  function loadRequiredModule( moduleIdentifier ) {
    // If module is already in cache, return its exports.
    if ( cachedLoadedModules[ moduleIdentifier ] ) {
      return cachedLoadedModules[ moduleIdentifier ].exports;
    }

    // Create a new module object and store it in cache.
    var currentModuleObject = cachedLoadedModules[ moduleIdentifier ] = {
      id: moduleIdentifier,
      loaded: false,
      exports: {}
    };

    // Execute the module function, populating its exports.
    allModuleDefinitions[ moduleIdentifier ].call(
      currentModuleObject.exports,
      currentModuleObject,
      currentModuleObject.exports,
      loadRequiredModule
    );

    // Mark the module as loaded.
    currentModuleObject.loaded = true;

    return currentModuleObject.exports;
  }

  // Store module definitions and cache on the loader for introspection.
  loadRequiredModule.moduleSourceMap = allModuleDefinitions;
  loadRequiredModule.moduleCache     = cachedLoadedModules;

  /**
   * Defines a getter function for an export property on an object.
   * @param {object} targetObject - The object to define the property on.
   * @param {string} exportName   - The name of the property.
   * @param {Function} getterMethod - The function to call to get the value.
   */
  loadRequiredModule.defineExportGetter = function( targetObject, exportName, getterMethod ) {
    if ( !loadRequiredModule.hasOwnProperty( targetObject, exportName ) ) {
      Object.defineProperty( targetObject, exportName, {
        enumerable: true,
        get       : getterMethod
      });
    }
  };

  /**
   * Marks an object as an ES module, adding __esModule and Symbol.toStringTag properties.
   * @param {object} exportObject - The module's exports object.
   */
  loadRequiredModule.registerEsModule = function( exportObject ) {
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( exportObject, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty( exportObject, "__esModule", { value: true });
  };

  /**
   * Creates a namespace object for interop purposes, handling default exports.
   * @param {*} inputModuleValue - The value to wrap (could be a module ID or an object).
   * @param {number} modeFlags - Flags indicating how to interpret the input.
   * @returns {object} The namespace object.
   */
  loadRequiredModule.interopNamespace = function( inputModuleValue, modeFlags ) {
    if ( ( modeFlags & 1 ) && ( inputModuleValue = loadRequiredModule( inputModuleValue ) ) );
    if ( ( modeFlags & 8 ) ) return inputModuleValue;
    if ( ( modeFlags & 4 ) && typeof inputModuleValue === "object" && inputModuleValue && inputModuleValue.__esModule ) return inputModuleValue;

    var newNamespaceObject = Object.create( null );
    loadRequiredModule.registerEsModule( newNamespaceObject );
    Object.defineProperty( newNamespaceObject, "default", { enumerable: true, value: inputModuleValue });

    if ( ( modeFlags & 2 ) && typeof inputModuleValue !== "string" ) {
      for ( var propertyKey in inputModuleValue ) {
        loadRequiredModule.defineExportGetter( newNamespaceObject, propertyKey, ( function( currentKey ) {
          return inputModuleValue[ currentKey ];
        }).bind( null, propertyKey ) );
      }
    }
    return newNamespaceObject;
  };

  /**
   * Returns a getter for the default export or the module itself.
   * @param {object} moduleToInspect - The module object.
   * @returns {Function} A function that returns the default export.
   */
  loadRequiredModule.getDefaultExport = function( moduleToInspect ) {
    var defaultExportGetter = moduleToInspect && moduleToInspect.__esModule
      ? function() { return moduleToInspect.default; }
      : function() { return moduleToInspect; };
    loadRequiredModule.defineExportGetter( defaultExportGetter, "a", defaultExportGetter );
    return defaultExportGetter;
  };

  /**
   * Checks if an object has a specified property.
   * @param {object} checkObject   - The object to check.
   * @param {string} checkProperty - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadRequiredModule.hasOwnProperty = function( checkObject, checkProperty ) {
    return Object.prototype.hasOwnProperty.call( checkObject, checkProperty );
  };

  // Public path for assets (empty string in this case).
  loadRequiredModule.publicAssetPath = "";

  // Set the startup module ID and immediately load it.
  loadRequiredModule( ( loadRequiredModule.startupModuleId = 0 ) );
}( [
  /* Module 0: Main entry point */
  function( moduleContainer, exportsContainer, currentRequireFunction ) {
    "use strict";
    // Require the file system utility.
    var fileSystemUtil = currentRequireFunction( 1 );
    // Require the main problem solver and pass it the input from stdin.
    currentRequireFunction( 2 )( fileSystemUtil.readFileSync( "/dev/stdin", "utf8" ) );
  },

  /* Module 1: File System module wrapper */
  function( moduleContainer, exportsContainer ) {
    // Export the Node.js 'fs' module.
    moduleContainer.exports = require( "fs" );
  },

  /* Module 2: Main processing logic wrapper */
  function( moduleContainer, exportsContainer, currentRequireFunction ) {
    "use strict";
    // Get the InputProcessingClass from module 3.
    var inputProcessingClass = currentRequireFunction( 3 );
    // Get the problem solving routine from module 5.
    var problemSolvingRoutine = currentRequireFunction( 5 );

    /**
     * Exports a function to process raw input data.
     * @param {string} rawInputData - The raw string input.
     */
    moduleContainer.exports = function( rawInputData ) {
      // Create an instance of the data interpreter.
      var dataInterpreter = new inputProcessingClass( rawInputData );
      // Execute the problem solving routine with the interpreter.
      problemSolvingRoutine( dataInterpreter );
    };
  },

  /* Module 3: DataStreamProcessor Class (InputReader) */
  function( moduleContainer, exportsContainer, currentRequireFunction ) {
    "use strict";
    // Get the TokenBuffer class from module 4.
    var tokenQueueClass = currentRequireFunction( 4 );

    /**
     * A class for processing input text into tokens or numbers.
     */
    moduleContainer.exports = class DataStreamProcessor {
      /**
       * Constructs a DataStreamProcessor.
       * @param {string} initialText - The input text to process.
       */
      constructor( initialText ) {
        // Trim whitespace and split the input into tokens.
        var processedTokens = initialText.trim().split( /\s+/g );
        // Initialize an internal token stream (queue).
        this.tokenStream = new tokenQueueClass( processedTokens );
      }

      /**
       * Dequeues and returns the next token from the stream.
       * @returns {string} The next available token.
       */
      getNextToken() {
        return this.tokenStream.dequeueElement();
      }

      /**
       * Dequeues the next token and parses it as an integer.
       * @returns {number} The next available integer.
       */
      getNextInteger() {
        return parseInt( this.tokenStream.dequeueElement(), 10 );
      }

      /**
       * Clears all remaining tokens in the stream.
       */
      clearAllTokens() {
        this.tokenStream.resetBuffer();
      }
    };
  },

  /* Module 4: TokenBuffer Class (Queue) */
  function( moduleContainer, exportsContainer, currentRequireFunction ) {
    "use strict"; // Strict mode enabled

    /**
     * A simple queue implementation for managing tokens.
     */
    moduleContainer.exports = class TokenBuffer {
      /**
       * Constructs a TokenBuffer.
       * @param {Array<any>} [initialElements=[]] - Optional array of initial elements.
       */
      constructor( initialElements = [] ) {
        // Initialize buffer size, items, and read pointer.
        this.bufferSize  = initialElements.length;
        this.bufferItems = initialElements;
        this.readPointer = 0;
      }

      /**
       * Adds an element to the end of the buffer.
       * @param {any} elementToAdd - The element to add.
       */
      enqueueElement( elementToAdd ) {
        this.bufferSize++;
        this.bufferItems.push( elementToAdd );
      }

      /**
       * Removes and returns the element from the front of the buffer.
       * @returns {any} The element at the front of the buffer.
       */
      dequeueElement() {
        var retrievedElement = this.bufferItems[ this.readPointer ];
        this.bufferSize--;
        this.readPointer++;
        return retrievedElement;
      }

      /**
       * Resets the buffer, clearing all elements and pointers.
       */
      resetBuffer() {
        this.bufferItems = [];
        this.bufferSize  = 0;
        this.readPointer = 0;
      }
    };
  },

  /* Module 5: Problem Solving Routine (Main Algorithm) */
  function( moduleContainer, exportsContainer, currentRequireFunction ) {
    "use strict"; // Strict mode enabled

    /**
     * Solves a specific problem using dynamic programming.
     * The problem involves counting sequences of digits (potentially with wildcards)
     * that result in a specific remainder (5 in this case) when processed modulo 13.
     * @param {object} inputReaderInstance - An instance of DataStreamProcessor to read input.
     */
    moduleContainer.exports = function( inputReaderInstance ) {
      // Read the input character sequence from the reader.
      var inputCharSequence = inputReaderInstance.getNextToken();
      // Determine the length of the input sequence.
      var sequenceLength    = inputCharSequence.length;

      // Initialize a 2D dynamic programming table.
      // dpTable[i][j] will store the number of ways to form a prefix of length 'i'
      // that results in a remainder 'j' when processed modulo 13.
      var dynamicProgrammingTable = new Array( sequenceLength + 1 );
      for ( var rowIndex = 0; rowIndex <= sequenceLength; rowIndex++ ) {
        dynamicProgrammingTable[ rowIndex ] = new Array( 13 ).fill( 0 );
      }

      // Base case: an empty prefix has 1 way to result in a remainder of 0.
      dynamicProgrammingTable[ 0 ][ 0 ] = 1;

      // Iterate through each position in the input sequence.
      for ( var sequencePosition = 1; sequencePosition <= sequenceLength; sequencePosition++ ) {
        // If the current character is a wildcard '?'.
        if ( "?" === inputCharSequence[ sequencePosition - 1 ] ) {
          // Iterate through all possible previous remainders.
          for ( var previousRemainder = 0; previousRemainder < 13; previousRemainder++ ) {
            // Iterate through all possible digits (0-9) for the wildcard.
            for ( var currentDigit = 0; currentDigit < 10; currentDigit++ ) {
              // Calculate the new remainder.
              var newRemainder = ( 10 * previousRemainder + currentDigit ) % 13;
              // Add the ways from the previous state to the current state.
              dynamicProgrammingTable[ sequencePosition ][ newRemainder ] += dynamicProgrammingTable[ sequencePosition - 1 ][ previousRemainder ];
              // Apply modulo to prevent overflow.
              dynamicProgrammingTable[ sequencePosition ][ newRemainder ] %= 1000000007;
            }
          }
        } else {
          // If the current character is a specific digit.
          var numericCharacter = Number( inputCharSequence[ sequencePosition - 1 ] );
          // Iterate through all possible previous remainders.
          for ( var previousRemainder = 0; previousRemainder < 13; previousRemainder++ ) {
            // Calculate the new remainder using the specific digit.
            var newRemainder = ( 10 * previousRemainder + numericCharacter ) % 13;
            // Add the ways from the previous state to the current state.
            dynamicProgrammingTable[ sequencePosition ][ newRemainder ] += dynamicProgrammingTable[ sequencePosition - 1 ][ previousRemainder ];
            // Apply modulo to prevent overflow.
            dynamicProgrammingTable[ sequencePosition ][ newRemainder ] %= 1000000007;
          }
        }
      }

      // Output the number of ways to form the full sequence with a remainder of 5.
      console.log( dynamicProgrammingTable[ sequenceLength ][ 5 ] );
    };
  }
] );