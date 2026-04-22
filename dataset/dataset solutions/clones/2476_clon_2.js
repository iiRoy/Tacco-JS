module.exports = function( programUnits ) {

  // This object serves as a cache for loaded modules, mapping module IDs to their exports.
  var moduleRegistry = {};

  /**
   * The primary function responsible for loading modules.
   * It checks the cache first, and if a module is not found, it loads and caches it.
   * @param {number} unitId - The unique identifier of the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function importUnit( unitId ) {
    // If the module is already in our registry, return its exports immediately.
    if ( moduleRegistry[unitId] ) {
      return moduleRegistry[unitId].exports;
    }

    // If not cached, create a new module entry.
    var currentUnit = moduleRegistry[unitId] = {
      // Store the module's numerical identifier.
      identifier: unitId,
      // Flag indicating whether the module has completed loading.
      loaded: false,
      // The object that will hold the module's exported values.
      exports: {}
    };

    // Execute the module's code, passing in the module object, its exports, and the loader itself.
    programUnits[unitId].call( currentUnit.exports, currentUnit, currentUnit.exports, importUnit );

    // Mark the module as fully loaded after its code has run.
    currentUnit.loaded = true;

    // Return the exports of the newly loaded module.
    return currentUnit.exports;
  }

  // Attach the complete set of module functions to the loader for internal access.
  importUnit.modules = programUnits;

  // Make the module cache accessible via the loader function.
  importUnit.cache = moduleRegistry;

  /**
   * Defines a property on an object if it doesn't already exist, making it enumerable.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} propertyGetter - A function that returns the property's value.
   */
  importUnit.defineProp = function ( targetObject, propertyName, propertyGetter ) {
    if ( !importUnit.hasOwn( targetObject, propertyName ) ) {
      Object.defineProperty( targetObject, propertyName, {
        enumerable: true, // This property should show up during enumeration.
        get: propertyGetter // Use the provided function to retrieve the property's value.
      } );
    }
  };

  /**
   * Configures a module object to behave like an ES module.
   * This involves setting Symbol.toStringTag and __esModule properties.
   * @param {object} moduleObject - The module object to configure.
   */
  importUnit.registerEsModule = function ( moduleObject ) {
    // Set Symbol.toStringTag for better debugging and module identification.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( moduleObject, Symbol.toStringTag, { value: "Module" } );
    }
    // Indicate that this is an ES module.
    Object.defineProperty( moduleObject, "__esModule", { value: true } );
  };

  /**
   * Handles various module export formats to ensure compatibility.
   * It can load modules, return existing values, or create a new module object.
   * @param {*} moduleValue - The module's value or ID.
   * @param {number} flags - Bitmask flags indicating how to process the module.
   * @returns {*} The processed module exports.
   */
  importUnit.interopRequire = function ( moduleValue, flags ) {
    // Flag 1: If set, load the module by its ID.
    if ( 1 & flags ) {
      moduleValue = importUnit( moduleValue );
    }
    // Flag 8: If set, return the module value directly.
    if ( 8 & flags ) {
      return moduleValue;
    }
    // Flag 4: If set and it's an object marked as an ES module, return it directly.
    if ( 4 & flags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule ) {
      return moduleValue;
    }

    // Otherwise, create a new module object for interoperability.
    var newModuleObject = Object.create( null );
    importUnit.registerEsModule( newModuleObject ); // Mark as ES module.
    Object.defineProperty( newModuleObject, "default", { enumerable: true, value: moduleValue } ); // Set default export.

    // Flag 2: If set and not a string, copy all properties from the original moduleValue.
    if ( 2 & flags && typeof moduleValue !== "string" ) {
      for ( var memberKey in moduleValue ) {
        importUnit.defineProp( newModuleObject, memberKey, ( function ( prop ) {
          return moduleValue[prop];
        } ).bind( null, memberKey ) );
      }
    }
    return newModuleObject;
  };

  /**
   * Provides a getter for a module's default export, handling both ES modules and commonJS.
   * @param {object} moduleObject - The module object.
   * @returns {function} A function that returns the default export.
   */
  importUnit.getModuleDefault = function ( moduleObject ) {
    var defaultGetter = moduleObject && moduleObject.__esModule ?
      function () { return moduleObject.default; } : // If ES module, return .default.
      function () { return moduleObject; };          // Otherwise, return the module itself.
    importUnit.defineProp( defaultGetter, "a", defaultGetter ); // Attach the getter as property 'a'.
    return defaultGetter;
  };

  /**
   * Checks if an object has a specified property directly (not inherited).
   * @param {object} targetObject - The object to check.
   * @param {string} propertyKey - The name of the property.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  importUnit.hasOwn = function ( targetObject, propertyKey ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyKey );
  };

  // Sets the base path for loading assets, often used for dynamic imports or resources.
  importUnit.publicAssetPath = "";

  // Start the application by loading the designated entry module (ID 0).
  return importUnit( importUnit.startupUnit = 0 );

}( [ // This array contains all the individual module definitions.

  // Module 0: The main application entry point.
  function ( currentModule, moduleExports, requireUnit ) {
    "use strict";
    // Load the Node.js file system module.
    var fileSystemAccess = requireUnit( 1 );
    // Load the main processing logic module and immediately execute it with stdin content.
    requireUnit( 2 )( fileSystemAccess.readData( "/dev/stdin", "utf8" ) );
  },

  // Module 1: Exports the Node.js 'fs' module.
  function ( currentModule, moduleExports ) {
    currentModule.exports = require( "node:fs" );
  },

  // Module 2: Coordinates input parsing and problem solving.
  function ( currentModule, moduleExports, requireUnit ) {
    "use strict";
    // Fetch the custom class designed for processing input strings.
    var inputParserClass = requireUnit( 3 );
    // Fetch the core function that implements the solution algorithm.
    var problemSolverFunction = requireUnit( 5 );

    // This module exports a function that takes a raw data string.
    currentModule.exports = function ( rawDataString ) {
      // Create an instance of the input parser using the provided string.
      var parsedInputInstance = new inputParserClass( rawDataString );
      // Pass the prepared input data to the problem solver.
      problemSolverFunction( parsedInputInstance );
    };
  },

  // Module 3: Defines a class for handling structured input from a string.
  function ( currentModule, moduleExports, requireUnit ) {
    "use strict";
    // Retrieve the custom queue data structure.
    var dataQueueClass = requireUnit( 4 );

    currentModule.exports = class InputProcessor {
      /**
       * Initializes the InputProcessor with a raw string, splitting it into tokens.
       * @param {string} inputContentString - The raw string containing input data.
       */
      constructor ( inputContentString ) {
        // Trim leading/trailing whitespace and split the string by any sequence of whitespace characters.
        var tokenArray = inputContentString.trim().split( /\s+/g );
        // Create an internal queue to manage the stream of tokens.
        this.tokenStream = new dataQueueClass( tokenArray );
      }

      /**
       * Dequeues and returns the next token as a raw string.
       * @returns {string} The next string token from the input stream.
       */
      readNextRaw () {
        return this.tokenStream.dequeueElement();
      }

      /**
       * Dequeues the next token, parses it as an integer, and returns the value.
       * @returns {number} The next integer from the input stream.
       */
      readNextInteger () {
        return parseInt( this.tokenStream.dequeueElement(), 10 );
      }

      /**
       * Clears all remaining tokens from the internal input stream.
       */
      finalizeInput () {
        this.tokenStream.clearElements();
      }
    };
  },

  // Module 4: Provides a basic queue implementation using an array.
  function ( currentModule, moduleExports, requireUnit ) {
    "use strict";
    currentModule.exports = class SimpleQueue {
      /**
       * Constructs a new SimpleQueue instance.
       * @param {Array<*>} [initialElements=[]] - An optional array to initialize the queue with.
       */
      constructor () {
        var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.elementCount = initialElements.length; // Tracks the number of items currently in the queue.
        this.elementList = initialElements;         // The underlying array storing the queue's items.
        this.currentIndex = 0;                      // The index of the next item to be dequeued.
      }

      /**
       * Adds an item to the end of the queue.
       * @param {*} itemValue - The value to add to the queue.
       */
      enqueueElement ( itemValue ) {
        this.elementCount += 1;
        this.elementList.push( itemValue );
      }

      /**
       * Removes and returns the item at the front of the queue.
       * @returns {*} The item that was at the front of the queue.
       */
      dequeueElement () {
        var dequeuedItem = this.elementList[this.currentIndex];
        this.elementCount -= 1;
        this.currentIndex += 1;
        return dequeuedItem;
      }

      /**
       * Resets the queue, clearing all elements and resetting its state.
       */
      clearElements () {
        this.elementList = [];
        this.elementCount = 0;
        this.currentIndex = 0;
      }
    };
  },

  // Module 5: Contains the core algorithm to find the optimal factor pair.
  function ( currentModule, moduleExports, requireUnit ) {
    "use " + "strict"; // Explicitly enable strict mode for this module.
    // Obtain the utility function for calculating divisors.
    var divisorCalculator = requireUnit( 6 );

    // This module exports a function that takes an input reader object.
    currentModule.exports = function ( inputReaderObject ) {
      // Read the single integer that is the target for factorization.
      var targetNumber = inputReaderObject.readNextInteger();
      // Get a map containing all factor pairs for the target number.
      var factorPairsMap = divisorCalculator( targetNumber );

      // Initialize variables to keep track of the smallest difference between factors
      // and the factors themselves that yield this difference.
      var minDifference = targetNumber;     // Initial difference is the number itself (1 and number).
      var optimalFactorOne = 1;             // First factor of the optimal pair.
      var optimalFactorTwo = targetNumber;  // Second factor of the optimal pair.

      // Iterate through the factor pairs found by the divisor calculator.
      for ( var currentFactor in factorPairsMap ) {
        // Optimization: If the current factor is greater than its corresponding quotient,
        // we've already covered this pair (e.g., if we saw (2, 6) for 12, we don't need (6, 2)).
        if ( currentFactor > factorPairsMap[currentFactor] ) {
          break;
        }

        // Check if the current factor pair has a smaller difference than the current minimum.
        if ( minDifference > factorPairsMap[currentFactor] - currentFactor ) {
          optimalFactorOne = currentFactor;                     // Update the first optimal factor.
          optimalFactorTwo = factorPairsMap[currentFactor];     // Update the second optimal factor.
          minDifference = factorPairsMap[currentFactor] - currentFactor; // Update the minimum difference.
        }
      }

      // Print the final result, which is the sum of (optimalFactorOne - 1) and (optimalFactorTwo - 1).
      console.log( optimalFactorOne - 1 + optimalFactorTwo - 1 );
    };
  },

  // Module 6: Provides a function to find all divisors of a given number.
  function ( currentModule, moduleExports, requireUnit ) {
    "use strict";
    // This module exports a function that takes a number to factorize.
    currentModule.exports = function ( valueToFactorize ) {
      // An object to store the found factor pairs. Keys are factors, values are their quotients.
      var factorStorage = {};
      // Calculate the ceiling of the square root of the number. This optimizes the loop.
      var sqrtCeiling = Math.ceil( Math.sqrt( valueToFactorize ) );

      // Loop from 1 up to the calculated square root ceiling.
      for ( var candidateFactor = 1; candidateFactor < sqrtCeiling + 1; candidateFactor++ ) {
        // Check if the current candidateFactor divides the number evenly.
        if ( valueToFactorize % candidateFactor === 0 ) {
          // If it's a divisor, store both the factor and its corresponding quotient.
          factorStorage[candidateFactor] = valueToFactorize / candidateFactor;
          factorStorage[valueToFactorize / candidateFactor] = candidateFactor;
        }
      }
      // Return the object containing all found factor pairs.
      return factorStorage;
    };
  }
] );