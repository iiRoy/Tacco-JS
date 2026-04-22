/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical identity,
 * while extensively modifying whitespace and comments.
 * The original file path comment has been removed.
 */


( function ( modules ) {
  // This is the webpackBootstrap function, responsible for loading and managing modules.
  // It initializes the module system.

  // The module cache stores all loaded modules to prevent redundant loading.
  var installedModules = {};

  // The __webpack_require__ function is the core of the module system.
  // It's used to import modules within the bundle.
  function __webpack_require__ ( moduleId ) {

    // First, check if the requested module is already in the cache.
    if ( installedModules[ moduleId ] ) {
      return installedModules[ moduleId ] . exports;
    }

    // If not in cache, create a new module entry.
    // This new module object is then added to the installedModules cache.
    var module = installedModules[ moduleId ] = {
      i: moduleId, // The module ID.
      l: false,    // A flag indicating if the module has been loaded.
      exports: {}  // The exports object for the module.
    };

    // Execute the module function, passing in the module object,
    // its exports, and the __webpack_require__ function itself.
    modules[ moduleId ] . call ( module . exports, module, module . exports, __webpack_require__ );

    // After execution, mark the module as loaded.
    module . l = true;

    // Return the exports of the module.
    return module . exports;
  }


  // Expose the modules object to __webpack_modules__.
  // This contains all the module definitions.
  __webpack_require__ . m = modules;

  // Expose the module cache to __webpack_require__.c.
  // This allows external access to the cache if needed.
  __webpack_require__ . c = installedModules;

  // Define a getter function for harmony exports (ES modules compatibility).
  __webpack_require__ . d = function ( exports, name, getter ) {
    // Check if the property already exists on the exports object.
    if ( ! __webpack_require__ . o ( exports, name ) ) {
      // If not, define it with an enumerable getter.
      Object . defineProperty ( exports, name, { enumerable: true, get: getter } );
    }
  };

  // Define __esModule on exports for ES modules compatibility.
  __webpack_require__ . r = function ( exports ) {
    // If Symbol and Symbol.toStringTag are available, set the toStringTag.
    if ( typeof Symbol !== 'undefined' && Symbol . toStringTag ) {
      Object . defineProperty ( exports, Symbol . toStringTag, { value: 'Module' } );
    }
    // Always set __esModule to true for ES modules.
    Object . defineProperty ( exports, '__esModule', { value: true } );
  };

  // Create a fake namespace object for various module modes.
  // mode & 1: value is a module id, require it.
  // mode & 2: merge all properties of value into the ns (namespace).
  // mode & 4: return value when already a ns object.
  // mode & 8|1: behave like require.
  __webpack_require__ . t = function ( value, mode ) {
    // If mode 1 is set, require the module.
    if ( mode & 1 ) value = __webpack_require__ ( value );
    // If mode 8 is set, just return the value.
    if ( mode & 8 ) return value;
    // If mode 4 is set and value is an object and an ES module, return it directly.
    if ( ( mode & 4 ) && typeof value === 'object' && value && value . __esModule ) return value;

    // Otherwise, create a new namespace object.
    var ns = Object . create ( null );
    // Set __esModule on the new namespace.
    __webpack_require__ . r ( ns );
    // Define a 'default' export pointing to the value.
    Object . defineProperty ( ns, 'default', { enumerable: true, value: value } );
    // If mode 2 is set and value is not a string, merge its properties into the namespace.
    if ( mode & 2 && typeof value != 'string' ) {
      for ( var key in value ) {
        __webpack_require__ . d ( ns, key, function ( key ) {
          return value[ key ];
        } . bind ( null, key ) );
      }
    }
    return ns;
  };

  // getDefaultExport function for compatibility with non-harmony modules (CommonJS/AMD).
  __webpack_require__ . n = function ( module ) {
    // Determine the getter function based on whether it's an ES module or not.
    var getter = module && module . __esModule ?
      function getDefault () { return module[ 'default' ]; } :
      function getModuleExports () { return module; };
    // Define a 'a' property on the getter, pointing to itself.
    __webpack_require__ . d ( getter, 'a', getter );
    return getter;
  };

  // Object.prototype.hasOwnProperty.call wrapper.
  // Used for safe property checking.
  __webpack_require__ . o = function ( object, property ) {
    return Object . prototype . hasOwnProperty . call ( object, property );
  };

  // __webpack_public_path__ variable.
  // This is used for dynamically loaded chunks.
  __webpack_require__ . p = "";


  // Load the entry module and return its exports.
  // This is where the application's execution begins.
  return __webpack_require__ ( __webpack_require__ . s = "./src/contest/atcoder/msol2020/e.ts" );
} )
/************************************************************************/
( {

  /***/ "./node_modules/webpack/buildin/module.js":
  /*!***********************************!*\
    *** (webpack)/buildin/module.js ***!
    \***********************************/
  /*! no static exports found */
  /***/ ( function ( module, exports ) {

    // This is a polyfill for the 'module' object in webpack's build environment.
    // It ensures that certain properties and methods are available for modules.
    module . exports = function ( module ) {
      if ( ! module . webpackPolyfill ) {
        module . deprecate = function () {
        }; // Placeholder for deprecation warnings.
        module . paths = []; // Module search paths.
        // module.parent is undefined by default in webpack's module environment.
        if ( ! module . children ) {
          module . children = []; // Child modules.
        }
        Object . defineProperty ( module, "loaded", {
          enumerable: true,
          get: function () {
            return module . l;
          }
        } );
        Object . defineProperty ( module, "id", {
          enumerable: true,
          get: function () {
            return module . i;
          }
        } );
        module . webpackPolyfill = 1; // Mark as polyfilled.
      }
      return module;
    };


    /***/ } ),

  /***/ "./src/contest/atcoder/msol2020/e.ts":
  /*!*******************************************!*\
    *** ./src/contest/atcoder/msol2020/e.ts ***!
    \*******************************************/
  /*! no static exports found */
  /***/ ( function ( module, exports, __webpack_require__ ) {

    "use strict";
    /* WEBPACK VAR INJECTION */
    ( function ( module ) {
      var __importDefault = ( this && this . __importDefault ) || function ( mod ) {
        // Helper function for ES module interop, handling default exports.
        return ( mod && mod . __esModule ) ? mod : { "default": mod };
      };
      Object . defineProperty ( exports, "__esModule", { value: true } );
      exports . main = void 0; // Initialize exports for 'main'.

      const fs_1 = __importDefault ( __webpack_require__ ( /* fs */ "fs" ) ); // Import file system module.
      const io_1 = __webpack_require__ ( /* ../../common/io */ "./src/contest/common/io.ts" ); // Import custom I/O utilities.

      const INF = 1 << 30; // Define a large integer as infinity for cost calculations.

      // Enum to represent different axis choices or no choice.
      var Axis;
      ( function ( Axis ) {
        Axis[ "X" ] = "X"; // Represents choosing the X-axis for a point.
        Axis[ "Y" ] = "Y"; // Represents choosing the Y-axis for a point.
        Axis[ "N" ] = "N"; // Represents no specific axis chosen yet (or default behavior).
      } ) ( Axis || ( Axis = {} ) );

      // Calculates the final cost based on selected axis candidates for points.
      function calc ( { N, C, cand } ) {
        let finalCost = 0; // Initialize total cost.

        // Iterate through each point.
        for ( let i = 0; i < N; i++ ) {
          // If the point 'i' has an axis choice already, skip it for this specific calculation.
          if ( cand[ i ] != Axis . N ) {
            continue; // Move to the next point.
          }

          // Calculate initial cost for point 'i' if no specific axis is chosen.
          // This is the minimum of its absolute X or Y coordinate distance to origin, multiplied by its price.
          let cost = Math . min ( Math . abs ( C[ i ] . x ), Math . abs ( C[ i ] . y ) ) * C[ i ] . p;

          // Now, consider other points 'j' that *do* have an axis choice.
          for ( let j = 0; j < N; j++ ) {
            // If point 'j' chose the Y-axis, it affects point 'i's X-distance.
            if ( cand[ j ] == Axis . Y ) {
              // Update cost with the minimum of current cost and distance to point 'j' along X-axis.
              cost = Math . min ( cost, Math . abs ( C[ i ] . x - C[ j ] . x ) * C[ i ] . p );
            }
            // If point 'j' chose the X-axis, it affects point 'i's Y-distance.
            else if ( cand[ j ] == Axis . X ) {
              // Update cost with the minimum of current cost and distance to point 'j' along Y-axis.
              cost = Math . min ( cost, Math . abs ( C[ i ] . y - C[ j ] . y ) * C[ i ] . p );
            }
          }
          finalCost += cost; // Add the calculated minimum cost for point 'i' to the total.
        }
        return finalCost; // Return the accumulated total cost.
      }

      // Recursive function to explore all possible axis assignments for points.
      function rec ( i, k, sys ) {
        const { cand, N, C, ans } = sys; // Destructure system parameters.

        // Base case: If all points have been processed.
        if ( i === N ) {
          const res = calc ( { N, C, cand } ); // Calculate the cost for this specific configuration.
          ans[ k ] = Math . min ( ans[ k ], res ); // Update the minimum cost for 'k' chosen points.
          return; // End recursion for this branch.
        }

        // --- Recursive Step 1: Point 'i' is not assigned to any axis (Axis.N). ---
        cand[ i ] = Axis . N;
        rec ( i + 1, k, sys ); // Move to the next point 'i+1', 'k' remains the same.

        // --- Recursive Step 2: Point 'i' is assigned to the X-axis (Axis.X). ---
        cand[ i ] = Axis . X;
        rec ( i + 1, k + 1, sys ); // Move to the next point, increment 'k' (one more point chosen).

        // --- Recursive Step 3: Point 'i' is assigned to the Y-axis (Axis.Y). ---
        cand[ i ] = Axis . Y;
        rec ( i + 1, k + 1, sys ); // Move to the next point, increment 'k' (one more point chosen).
      }

      // Main solver function.
      function solve ( { N, C } ) {
        const ans = Array ( N + 1 ) . fill ( INF ); // Initialize answer array with infinity. ans[k] stores min cost for k chosen points.
        const cand = Array ( N ); // Array to store axis choices for each point.

        // System object to pass state to recursive function.
        const sys = {
          N, C, ans, cand,
        };

        rec ( 0, 0, sys ); // Start the recursion from the first point (index 0) with 0 chosen points.
        return ans; // Return the array of minimum costs.
      }

      // Entry point function to parse input and call the solver.
      function main ( line ) {
        const nextInt = io_1 . getNextInt ( line ); // Get a function to read integers from the input line.
        const N = nextInt (); // Read the number of points.
        const C = []; // Array to store point coordinates and prices.

        // Loop to read N points.
        for ( let i = 0; i < N; i++ ) {
          const x = nextInt (); // X-coordinate.
          const y = nextInt (); // Y-coordinate.
          const p = nextInt (); // Price/weight.
          C . push ( { x, y, p } ); // Add point object to the array.
        }
        // Solve the problem and print the results, each on a new line.
        console . log ( solve ( { N, C } ) . join ( '\n' ) );
      }
      exports . main = main; // Export the main function.

      // Check if this module is the main entry point (executed directly by webpack).
      if ( __webpack_require__ . c[ __webpack_require__ . s ] === module ) {
        const line = fs_1 . default . readFileSync ( "/dev/stdin", "utf8" ); // Read input from stdin.
        main ( line ); // Call the main function with the input.
      }

      /* WEBPACK VAR INJECTION */
    } . call ( this, __webpack_require__ ( /* ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js" ) ( module ) ) )

    /***/ } ),

  /***/ "./src/contest/common/io.ts":
  /*!**********************************!*\
    *** ./src/contest/common/io.ts ***!
    \**********************************/
  /*! no static exports found */
  /***/ ( function ( module, exports, __webpack_require__ ) {

    "use strict";

    Object . defineProperty ( exports, "__esModule", { value: true } );
    // Export functions for getting input:
    // getNextBigInt, getNextInt, getNext, getIteratorWithParser, getIterator.
    exports . getNextBigInt = exports . getNextInt = exports . getNext = exports . getIteratorWithParser = exports . getIterator = void 0;

    // Generator function to iterate over tokens in a line, split by whitespace.
    function* getIterator ( line ) {
      const tokens = line . split ( /\s+/ ); // Split the input line by one or more whitespace characters.
      for ( const token of tokens ) {
        yield token; // Yield each token.
      }
    }
    exports . getIterator = getIterator; // Export the getIterator function.

    // Generator function to iterate over tokens and parse them using a provided parser function.
    function* getIteratorWithParser ( line, parser ) {
      const tokens = line . split ( /\s+/ ); // Split the input line.
      for ( const token of tokens ) {
        yield parser ( token ); // Yield the parsed token.
      }
    }
    exports . getIteratorWithParser = getIteratorWithParser; // Export the getIteratorWithParser function.

    // Returns a function that, when called, provides the next token from the input line.
    function getNext ( line ) {
      const it = getIterator ( line ); // Create an iterator for the line.
      return () => it . next () . value; // Return a function that calls next() on the iterator.
    }
    exports . getNext = getNext; // Export the getNext function.

    // Returns a function that, when called, provides the next integer from the input line.
    function getNextInt ( line ) {
      const it = getIterator ( line ); // Create an iterator.
      return () => parseInt ( it . next () . value ); // Return a function that parses the next token as an integer.
    }
    exports . getNextInt = getNextInt; // Export the getNextInt function.

    // Returns a function that, when called, provides the next BigInt from the input line.
    function getNextBigInt ( line ) {
      const it = getIterator ( line ); // Create an iterator.
      return () => BigInt ( it . next () . value ); // Return a function that parses the next token as a BigInt.
    }
    exports . getNextBigInt = getNextBigInt; // Export the getNextBigInt function.


    /***/ } ),

  /***/ "fs":
  /*!*********************!*\
    *** external "fs" ***!
    \*********************/
  /*! no static exports found */
  /***/ ( function ( module, exports ) {

    // This module is an external dependency, typically provided by Node.js.
    // It's used for file system operations, like reading from stdin.
    module . exports = require ( "fs" );

    /***/ } )

} );