( function underscore ( undefined ) {
  // This IIFE (Immediately Invoked Function Expression) defines core utility functions,
  // similar to a simplified Underscore.js or Lodash library.

  'use strict'
  // Enforce strict mode for cleaner code and fewer silent errors.

  /* Declare prototype references for common JavaScript objects. */
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

  // Cache frequently used methods from prototypes for performance.
  var push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // Cache native array methods, if available, for potential optimization.
  var nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;

  // Initialize the global underscore object.
  this._ = {};

  // Define `each` (or `forEach`) function, a fundamental iteration utility.
  var each = _.each = _.forEach = function ( obj, iterator, context ) {
    // If the object is null or undefined, do nothing.
    if ( obj == null ) return;

    // Use native forEach if available and the object supports it.
    if ( nativeForEach && obj.forEach === nativeForEach ) {
      obj.forEach( iterator, context );
    }
    // Handle array-like objects (e.g., NodeList, arguments).
    else if ( obj.length === +obj.length ) {
      for ( var i = 0, l = obj.length; i < l; i++ ) {
        // Call the iterator with (value, index, list).
        // If iterator returns `breaker`, stop iteration.
        if ( iterator.call( context, obj[i], i, obj ) === breaker ) return;
      }
    }
    // Handle plain objects, iterating over their enumerable properties.
    else {
      for ( var key in obj ) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if ( _.has( obj, key ) ) {
          // Call the iterator with (value, key, list).
          // If iterator returns `breaker`, stop iteration.
          if ( iterator.call( context, obj[key], key, obj ) === breaker ) return;
        }
      }
    }
  };

  // The `extend` function copies all of the properties in the source objects
  // over to the destination object, and returns the destination object.
  _.extend = function ( obj ) {
    // Iterate over all arguments starting from the second one (source objects).
    each( slice.call( arguments, 1 ), function ( source ) {
      // Only extend if the source object is not null or undefined.
      if ( source ) {
        for ( var prop in source ) {
          obj[prop] = source[prop];
        }
      }
    } );
    return obj; // Return the modified destination object.
  };
} ).call( global ); // Invoke the IIFE, passing `global` as `this` context.

( function utils ( undefined ) {
  // This IIFE provides general utility functions.

  'use strict';
  // Enable strict mode.

  /**
   * Formats a floating-point number into a string with specified precision and padding.
   *
   * @param {number} val  The floating-point number to format.
   * @param {number} base (Unused in this implementation, possibly for future base conversions)
   * @param {number} pad  (Unused in this implementation, possibly for future padding functionality)
   * @param {number} prec The number of decimal places to include.
   * @returns {string} The formatted float string.
   */
  this.print_float = function print_float ( val, base, pad, prec ) {
    // Calculate 10 to the power of precision for scaling.
    var p10 = Math.pow( 10, prec );
    // Round the scaled value and convert to string.
    var ival = "" + Math.round( val * p10 );

    // Special case for zero, ensuring it's formatted as "0.000" (or similar).
    if ( ival === '0' )
      return '0.000';

    // Calculate the length of the integer part.
    var ilen = ival.length - prec;

    // If integer part is zero, prefix with "0.".
    if ( ilen === 0 )
      return "0." + ival.substr( ilen, prec );

    // Otherwise, insert the decimal point at the calculated position.
    return ival.substr( 0, ilen ) + "." + ival.substr( ilen, prec );
  };
} ).call( global ); // Invoke the IIFE, setting `global` as `this`.

( function math ( namespace, undefined ) {
  // This IIFE defines mathematical helper functions and extends them into a global `Math` object.

  // Define a local Math object to hold custom functions.
  var Math = {
    /**
     * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
     * @param {number} a First number.
     * @param {number} b Second number.
     * @returns {number} The GCD of a and b.
     */
    gcd: function gcd ( a, b ) {
      // Base case: if b is 0, a is the GCD.
      return !b ? a : gcd( b, a % b );
    },

    /**
     * Calculates the Least Common Multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b)
     * @param {number} a First number.
     * @param {number} b Second number.
     * @returns {number} The LCM of a and b.
     */
    lcm: function lcm ( a, b ) {
      // Note: This implementation assumes positive numbers and does not handle absolute values.
      return a / gcd( a, b ) * b;
    },

    /**
     * Calculates the square of a number.
     * @param {number} x The number to square.
     * @returns {number} x squared.
     */
    sq: function sq ( x ) {
      return x * x;
    }
  };

  // Extend the global `this.Math` object (which is `global.Math` in Node.js)
  // with the custom math functions defined above.
  _.extend( this.Math, Math );
} ).call( global, 'Math' ); // Invoke the IIFE, passing `global` as `this` and 'Math' as `namespace`.

( function ( undefined ) {
  // This IIFE contains the main solver logic for a specific problem.

  'use strict';
  // Strict mode enabled.

  // Define the expected input type for parsing.
  var INPUT_TYPE = 'float';

  // The Solver object encapsulates the problem-solving logic.
  var Solver = {
    /**
     * Initiates the solver by scheduling the `solve` method to run asynchronously.
     * Uses `setTimeout` with a delay of 0 to defer execution.
     */
    fire: function () {
      setTimeout( Solver.solve, 0, this );
    },

    /**
     * The core solving routine. Reads input, performs calculations, and outputs results.
     * @param {object} context The `this` context from which `fire` was called.
     */
    solve: function solve ( context ) {
      // Read the number of test cases (n).
      var n = input_number();

      /**
       * Inner function that solves a single test case.
       * This function will be called `n` times.
       */
      function func () {
        // Define an array of coordinate names.
        var names = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];

        // Read the coordinate values using `input_float` and assign them to the current context.
        names.forEach( function ( name ) {
          this[name] = input_float();
        }, context ); // 'context' here refers to the outer `this` (global scope).

        // Destructure variables from the context for easier access.
        var x1 = context.x1, y1 = context.y1,
          x2 = context.x2, y2 = context.y2,
          x3 = context.x3, y3 = context.y3;

        // Calculate coefficients for two linear equations (2A + 2B + C = 0 form).
        // These equations represent the perpendicular bisectors of the lines (x1,y1)-(x2,y2)
        // and (x1,y1)-(x3,y3) respectively.
        var a = x1 - x2;
        var b = y1 - y2;
        // c = -(x1^2 - x2^2 + y1^2 - y2^2)
        var c = -1 * ( Math.sq( x1 ) - Math.sq( x2 ) + Math.sq( y1 ) - Math.sq( y2 ) );

        var d = x1 - x3;
        var e = y1 - y3;
        // f = -(x1^2 - x3^2 + y1^2 - y3^2)
        var f = -1 * ( Math.sq( x1 ) - Math.sq( x3 ) + Math.sq( y1 ) - Math.sq( y3 ) );

        // Solve the system of linear equations:
        // 2Ax + 2By + C = 0
        // 2Dx + 2Ey + F = 0
        // for x and y, which are the coordinates of the circumcenter (l/(-2), m/(-2)).
        // l and m are intermediate variables from the solution of the system.
        var l = ( c * e - b * f ) / ( e * a - b * d );
        var m = ( d * c - a * f ) / ( d * b - e * a );

        // This 'x' variable seems to be a placeholder or part of an incomplete calculation,
        // as its value is not directly used in the final output in a clear way.
        // It might be related to the radius calculation or a discarded approach.
        var x = -1 * ( Math.sq( x1 ) + Math.sq( y1 ) + l * x1 + m * y1 );

        // Output the circumcenter coordinates and the radius.
        // The circumcenter is ( -l/2, -m/2 ).
        // The radius R is sqrt( (l/2)^2 + (m/2)^2 - x ) or sqrt( (l/2)^2 + (m/2)^2 + C )
        // where C is the constant term in the general circle equation x^2 + y^2 + Dx + Ey + F = 0.
        // Here, the formula used is sqrt( (l)^2 + (m)^2 + 4*n ) / 2.0
        // This 'n' here is likely the `x` variable calculated above, not the initial `n` (number of test cases).
        // Let's assume 'n' in this line refers to the `x` variable calculated earlier, which makes it
        // sqrt( (l)^2 + (m)^2 + 4*(- (x1^2 + y1^2 + l*x1 + m*y1)) ) / 2.0
        // This is a common formula derived from the circumcircle equation.
        output( print_float( l / -2.0, 10, 3, 3 ),
          print_float( m / -2.0, 10, 3, 3 ),
          print_float( Math.sqrt( Math.sq( l ) + Math.sq( m ) + 4 * x ) / 2.0, 10, 3, 3 ) );
      }

      // Loop through `n` test cases, calling `func` for each.
      // The `n--` decrements `n` after each iteration.
      while ( n-- )
        func();

      // If there's no more input to process, schedule `solve` again.
      // This creates a continuous processing loop for streaming input.
      if ( !has_next() )
        setTimeout( Solver.solve, 0, context );
    }
  };

  /**
   * Initialization IIFE. Sets up global utility functions and input handling.
   */
  ( function init () {
    // Extend the current context (global scope) with input/output utilities.
    _.extend( this, {
      /**
       * Outputs arguments to the console.
       * @param {...any} arguments Values to log.
       */
      output: function () {
        console.log.apply( console, arguments );
      },

      // Reference to standard input stream.
      stdin: process.openStdin(),

      // Buffer for parsed input values.
      input_list: [],

      /**
       * Parses and returns an integer from the input list.
       * @returns {number} The parsed integer.
       */
      input_number: function () {
        return parseInt( input_list.splice( 0, 1 )[0] );
      },

      /**
       * Parses and returns a float from the input list.
       * @returns {number} The parsed float.
       */
      input_float: function () {
        return parseFloat( input_list.splice( 0, 1 )[0] );
      },

      /**
       * Returns a string from the input list.
       * @returns {string} The input string.
       */
      input_text: function () {
        return input_list.splice( 0, 1 )[0];
      },

      /**
       * Checks if there's more input available.
       * @returns {boolean} True if input_list is empty, false otherwise.
       * Note: The original logic `! input_list.length` means it returns TRUE if NO input,
       * and FALSE if there is input. This seems reversed for a `has_next` function.
       * It should probably be `input_list.length > 0`.
       * Let's keep it as is to maintain Type I clone definition.
       */
      has_next: function () {
        return !input_list.length;
      }
    } );

    // Define regular expressions for different input types.
    var INPUT_REGEXP_LIST = {};
    INPUT_REGEXP_LIST['string'] = /\w*/g;
    INPUT_REGEXP_LIST['number'] = /[-]?\d+/g;
    INPUT_REGEXP_LIST['float'] = /[-]?\d+(\.\d+)?/g;

    // Select the appropriate regex based on `INPUT_TYPE`.
    var INPUT_REGEXP = INPUT_REGEXP_LIST[INPUT_TYPE];

    // Store the current `this` context (global) for later use.
    var context = this;

    // Set encoding for stdin.
    stdin.setEncoding( 'utf8' );

    // Event listener for incoming data on stdin.
    stdin.on( 'data', function ( chunk ) {
      // Match the chunk against the selected regular expression.
      var result = chunk.match( INPUT_REGEXP );
      // Concatenate non-empty matches to the input list.
      input_list = input_list.concat( result.filter( function ( line ) {
        return line.length;
      } ) );
    } );

    // Event listener for stdin 'end' event.
    stdin.on( 'end', function () {
      // When input stream ends, fire the solver.
      Solver.fire.call( context );
    } );
  } ).call( this ); // Invoke the init IIFE, setting `this` to the current context (global).

} ).call( global ); // Invoke the main IIFE, setting `global` as `this`.