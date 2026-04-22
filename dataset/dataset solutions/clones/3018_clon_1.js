'use strict'// Enforce strict mode for better error handling and cleaner code.


class Main {
  /*
   * This is the primary method to solve the problem.
   * It processes input data and computes the final result.
   */
  solve( ) {
    // Read the integer 'n' from the input stream.
    const n = input.nextInt( );

    // Read a line of characters, convert each '#' to 1 and others to 0,
    // then store them in an array called 'list'.
    const list = Array.from( input.nextLine( ) ) . map( e => e === '#' ? 1 : 0 );

    // Initialize a boolean flag to skip leading zeros.
    let skip = true;

    // Create an empty array to store the processed list 'l1'.
    const l1 = [ ];

    // Iterate through the 'list' from index 0 to n-1.
    for ( let i = 0; i < n; ++i ) {

      // If a '1' is encountered, stop skipping.
      if ( list[ i ] == 1 ) {
        skip = false;
      }

      // If currently skipping, move to the next iteration.
      if ( skip ) {
        continue;
      }

      // Add the current element to 'l1'.
      l1.push( list[ i ] );
    }

    // Initialize 'size' with the current length of 'l1'.
    let size = l1.length;

    // Iterate backwards through 'l1' to find the effective end of the sequence.
    for ( let i = l1.length - 1; i >= 0; --i ) {
      // If a '0' is found, it marks the end of the relevant sequence.
      if ( l1[ i ] == 0 ) {
        break; // Exit the loop.
      }
      // Update 'size' to the current index.
      size = i;
    }

    // Create a new array 'l2' by slicing 'l1' from the beginning up to 'size'.
    const l2 = l1.slice( 0, size );

    // If 'l2' is empty, return 0 as there's nothing to process.
    if ( l2.length == 0 ) {
      return 0;
    }

    // 'black' represents the original 'l2' array.
    const black = l2;

    // 'white' is a transformed version of 'l2' where 1s become 0s and 0s become 1s.
    const white = l2.map( e => e == 1 ? 0 : 1 );

    // Calculate the cumulative sum of 'black' array.
    const blackSum = _.sumArray( black );

    // Calculate the cumulative sum of 'white' array.
    const whiteSum = _.sumArray( white );

    // Calculate the total sum of 'black' array.
    const blackMax = _.sum( black );

    // Calculate the total sum of 'white' array.
    const whiteMax = _.sum( white );

    // Initialize an array 'pre' to store intermediate results.
    const pre = [ ];

    // Add the total 'whiteMax' to the 'pre' array as the first element.
    pre.push( whiteMax );

    // Iterate through the 'black' array to compute subsequent elements for 'pre'.
    for ( let i = 0; i < black.length; ++i ) {
      // Calculate the value: (cumulative sum of black up to i) + (total white sum - cumulative sum of white up to i).
      pre.push( blackSum[ i ] + ( whiteMax - whiteSum[ i ] ) );
    }

    // Return the minimum value found in the 'pre' array.
    return _.min( pre );
  }
}


/*
 * The Mod class provides utilities for modular arithmetic operations.
 * It's useful for problems involving large numbers and specific moduli.
 */
class Mod {
  /**
   * Constructor for the Mod class.
   * @param {number} mod - The modulus to use for all operations.
   */
  constructor( mod ) {
    // If no modulus is provided, use a default from Combinatorics (if available).
    if ( mod == null ) {
      mod = Combinatorics.DefaultMod;
    }
    this.mod = mod;
  }

  /**
   * Performs modular multiplication (a * b) % this.mod.
   * This method uses binary multiplication to prevent overflow with large numbers.
   * @param {number} a - First operand.
   * @param {number} b - Second operand.
   * @returns {number} The result of (a * b) % this.mod.
   */
  mult( a, b ) {
    let ret = 0;
    a %= this.mod;
    b %= this.mod;

    while ( b ) {
      if ( b & 1 ) { // If b is odd, add 'a' to 'ret'.
        ret += a;
        if ( ret > this.mod ) {
          ret -= this.mod;
        }
      }
      a <<= 1; // Double 'a'.
      if ( a > this.mod ) {
        a -= this.mod;
      }
      b >>= 1; // Halve 'b'.
    }
    return ret;
  }

  /**
   * Performs modular exponentiation (a^b) % this.mod.
   * Uses the method of exponentiation by squaring.
   * @param {number} a - Base.
   * @param {number} b - Exponent.
   * @returns {number} The result of (a^b) % this.mod.
   */
  pow( a, b ) {
    let ret = 1;
    while ( b ) {
      if ( b & 1 ) {
        ret = this.mult( ret, a );
      }
      a = this.mult( a, a );
      b >>= 1;
    }
    return ret;
  }

  /**
   * Performs modular division (a / b) % this.mod.
   * This is equivalent to (a * b^(mod-2)) % this.mod by Fermat's Little Theorem,
   * provided mod is a prime number.
   * @param {number} a - Numerator.
   * @param {number} b - Denominator.
   * @returns {number} The result of (a / b) % this.mod.
   */
  div( a, b ) {
    return this.mult( a, this.pow( b, this.mod - 2 ) );
  }

  /**
   * Calculates modular combinations (nCk) % this.mod.
   * Requires precomputed factorial and inverse factorial tables.
   * @param {number} n - Total items.
   * @param {number} k - Items to choose.
   * @returns {number} The result of (nCk) % this.mod.
   */
  comb( n, k ) {
    return MOD.mult( factTable[ n ], MOD.mult( invFactTable[ k ], invFactTable[ n - k ] ) );
  }
}
// Instantiate a Mod object with a common prime modulus.
const MOD = new Mod( 998244353 );


/**
 * The Underscore class provides a collection of utility functions
 * for array manipulation, aggregation, and other common operations.
 */
class Underscore {

  /**
   * Calculates the sum of all elements in an array.
   * @param {Array<number>} arr - The input array of numbers.
   * @returns {number} The sum of the array elements.
   */
  sum( arr ) {
    return arr.reduce( ( a, b ) => a + b );
  }

  /**
   * Calculates the modular sum of all elements in an array.
   * @param {Array<number>} arr - The input array of numbers.
   * @param {number} [mod] - The modulus. Defaults to MOD.mod if not provided.
   * @returns {number} The modular sum of the array elements.
   */
  modSum( arr, mod ) {
    if ( mod == null ) {
      mod = MOD.mod;
    }
    return arr.reduce( ( a, b ) => ( a + b ) % mod );
  }

  /**
   * Finds the minimum element in an array.
   * @param {Array<any>} arr - The input array.
   * @param {Function} [func] - An optional comparison function.
   *   Defaults to (a, b) => a - b for numeric comparison.
   * @returns {any} The minimum element.
   */
  min( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.reduce( ( a, b ) => func( a, b ) < 0 ? a : b );
  }

  /**
   * Finds the maximum element in an array.
   * @param {Array<any>} arr - The input array.
   * @param {Function} [func] - An optional comparison function.
   *   Defaults to (a, b) => a - b for numeric comparison.
   * @returns {any} The maximum element.
   */
  max( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.reduce( ( a, b ) => func( a, b ) > 0 ? a : b );
  }

  /**
   * Sorts an array in place and returns it.
   * @param {Array<any>} arr - The array to sort.
   * @param {Function} [func] - An optional comparison function.
   *   Defaults to (a, b) => a - b for numeric comparison.
   * @returns {Array<any>} The sorted array.
   */
  sort( arr, func ) {
    if ( func == null ) {
      func = ( a, b ) => a - b;
    }
    return arr.sort( func );
  }

  /**
   * Returns a new array with duplicate elements removed.
   * This function modifies the original array by sorting it first.
   * @param {Array<any>} arr - The input array.
   * @returns {Array<any>} A new array containing only unique elements.
   */
  uniq( arr ) {
    arr.sort( ); // Sort the array to easily find duplicates.
    for ( let i = 0; i < arr.length - 1; ++i ) {
      // If current element is same as next, mark it as null.
      arr[ i ] = arr[ i + 1 ] == arr[ i ] ? null : arr[ i ];
    }
    // Filter out all nulls (duplicates).
    return arr.filter( e => e != null );
  }

  /**
   * Generates an array of numbers within a specified range.
   * Similar to Python's `range()` function.
   * @param {number} start - The starting value (inclusive).
   * @param {number} [stop] - The stopping value (exclusive). If omitted, `start` becomes `stop` and `start` becomes 0.
   * @param {number} [step] - The increment/decrement step. Defaults to 1 or -1 based on start/stop.
   * @returns {Array<number>} An array of numbers in the specified range.
   */
  range( start, stop, step ) {
    if ( stop == null ) {
      stop = start || 0;
      start = 0;
    }
    if ( !step ) {
      step = stop < start ? -1 : 1;
    }
    const length = Math.max( Math.ceil( ( stop - start ) / step ), 0 );
    const range = Array( length );

    // Fill the range array.
    for ( var idx = 0; idx < length; idx++, start += step ) {
      range[ idx ] = start;
    }

    return range;
  }

  /**
   * Retrieves the first element(s) of an array.
   * @param {Array<any>} array - The input array.
   * @param {number} [n] - The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>} The first element if `n` is not provided, or an array of the first `n` elements.
   */
  first( array, n ) {
    if ( array == null || array.length < 1 ) {
      return n == null ? void 0 : [ ];
    }
    if ( n == null ) {
      return array[ 0 ];
    }
    return this.initial( array, array.length - n );
  };

  /**
   * Retrieves all but the last element(s) of an array.
   * @param {Array<any>} array - The input array.
   * @param {number} [n] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} A new array containing all but the last `n` elements.
   */
  initial( array, n ) {
    return array.slice.call( array, 0, Math.max( 0, array.length - ( n == null ? 1 : n ) ) );
  }

  /**
   * Retrieves all but the first element(s) of an array.
   * @param {Array<any>} array - The input array.
   * @param {number} [n] - The number of elements to exclude from the beginning. Defaults to 1.
   * @returns {Array<any>} A new array containing all but the first `n` elements.
   */
  tail( array, n ) {
    return array.slice.call( array, n == null ? 1 : n );
  }

  /**
   * Retrieves the last element(s) of an array.
   * @param {Array<any>} array - The input array.
   * @param {number} [n] - The number of elements to retrieve from the end.
   * @returns {any|Array<any>} The last element if `n` is not provided, or an array of the last `n` elements.
   */
  last( array, n ) {
    if ( n == null ) {
      return array[ array.length - 1 ];
    }
    return this.tail( array, Math.max( 0, array.length - n ) );
  }

  /**
   * Calculates the cumulative sum (prefix sum) of an array.
   * @param {Array<number>} arr - The input array of numbers.
   * @returns {Array<number>} An array where each element is the sum of all preceding elements in the original array.
   *   The first element of the returned array corresponds to the sum of the first element of the input array.
   */
  sumArray( arr ) {
    // Uses reduce to build a prefix sum array, starting with 0.
    // Then, `tail` is used to remove the initial 0, so the first element is the first actual sum.
    return this.tail( arr.reduce( ( ( a, b, i ) => {
      a.push( b + a[ i ] );
      return a;
    } ), [ 0 ] ) );
  }

  /**
   * Calculates the difference between adjacent elements in an array.
   * @param {Array<number>} arr - The input array of numbers.
   * @returns {Array<number>} A new array where each element is the difference between
   *   the current and previous element of the original array.
   */
  diffArray( arr ) {
    const s = [ ];
    for ( let i = 1; i < arr.length; ++i ) {
      s.push( arr[ i ] - arr[ i - 1 ] );
    }
    return s;
  }

  // 配列の値以下の最大のindex (This comment was translated as: "Maximum index less than or equal to the array value")
  /**
   * Performs a binary search on a sorted array to find the index of the first element
   * that is greater than or equal to the given key.
   * If an iteratee is provided, it extracts the value from array elements and the key.
   * @param {Array<any>} array - The sorted array to search.
   * @param {any} key - The value to search for.
   * @param {string} [iteratee] - The property name to use if array elements are objects.
   * @returns {number} The index of the found element, or the insertion point if not found.
   */
  binarySearch( array, key, iteratee ) {
    // Helper function to extract the comparable value from an object or return the value itself.
    const itr = ( obj ) => ( typeof obj === 'object' ) ? obj[ iteratee ] : obj;

    const value = itr( key ); // Get the comparable value of the key.
    let low = 0;
    let high = array.length;

    // Standard binary search loop.
    while ( low < high ) {
      let mid = Math.floor( ( low + high ) / 2 );
      if ( itr( array[ mid ] ) < value ) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low; // Returns the insertion point or first matching index.
  };
}
// Create an instance of the Underscore utility class.
const _ = new Underscore( );


/**
 * The Input class handles reading data from standard input.
 * It provides methods to parse various data types and formats.
 */
class Input {
  constructor( ) {
    this.cursor = 0; // Current line number for reading.
    this.inputAll( ); // Load all input data upon instantiation.
  }

  /**
   * Reads all lines from standard input and stores them in `this.data`.
   * @returns {Array<string>} An array of input lines.
   */
  inputAll( ) {
    // Uses Node.js 'fs' module to read from /dev/stdin (standard input).
    this.data = ( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) . split( '\n' );
    return this.data;
  }

  /* 1行 or 複数行文字列 */ // (Translated: 1 line or multiple lines of strings)
  /**
   * Reads one or more lines from the input.
   * @param {number} [n] - The number of lines to read. If omitted, reads a single line.
   * @returns {string|Array<string>} A single string line or an array of string lines.
   */
  nextLine( n ) {
    if ( n ) {
      const ret = this.data.slice( this.cursor, this.cursor + n );
      this.cursor += n;
      return ret;
    }
    return this.data[ this.cursor++ ]; // Increment cursor after reading.
  }

  /* 1整数 */ // (Translated: 1 integer)
  /**
   * Reads a single line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  nextInt( ) {
    return parseInt( this.nextLine( ) );
  }

  /* 一行文字配列 */ // (Translated: One line character array)
  /**
   * Reads a single line, splits it by space, and returns an array of strings.
   * @returns {Array<string>} An array of strings from the line.
   */
  nextStrArr( ) {
    return this.nextLine( ) . split( ' ' );
  }

  /* 一行整数配列 */ // (Translated: One line integer array)
  /**
   * Reads a single line, splits it by space, and parses each part as an integer.
   * @returns {Array<number>} An array of integers from the line.
   */
  nextIntArr( ) {
    return this.nextStrArr( ) . map( ( e ) => parseInt( e ) );
  }

  /* 一行浮動小数点配列 */ // (Translated: One line float array)
  /**
   * Reads a single line, splits it by space, and parses each part as a float.
   * @returns {Array<number>} An array of floating-point numbers from the line.
   */
  nextFloatArr( ) {
    return this.nextStrArr( ) . map( ( e ) => parseFloat( e ) );
  }

  /* 複数行整数配列 */ // (Translated: Multiple lines integer array)
  /**
   * Reads 'n' lines and parses each line as a single integer.
   * @param {number} n - The number of lines to read.
   * @returns {Array<number>} An array of integers, one for each line.
   */
  nextIntLine( n ) {
    return this.nextLine( n ) . map( ( e ) => parseInt( e ) );
  }

  /* 複数行浮動小数点配列 */ // (Translated: Multiple lines float array)
  /**
   * Reads 'n' lines and parses each line as a single float.
   * @param {number} n - The number of lines to read.
   * @returns {Array<number>} An array of floating-point numbers, one for each line.
   */
  nextFloatLine( n ) {
    return this.nextLine( n ) . map( ( e ) => parseFloat( e ) );
  }

  /* 複数行文字列二次元配列 */ // (Translated: Multiple lines 2D string array)
  /**
   * Reads 'n' lines, splits each line by space, and returns a 2D array of strings.
   * @param {number} n - The number of lines to read.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  nextStrRange( n ) {
    return this.nextLine( n ) . map( ( line ) => line.split( ' ' ) );
  }

  /* 複数行整数二次元配列 */ // (Translated: Multiple lines 2D integer array)
  /**
   * Reads 'n' lines, splits each line by space, and parses each part as an integer,
   * returning a 2D array of integers.
   * @param {number} n - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  nextIntRange( n ) {
    return this.nextLine( n ) . map( ( line ) => line.split( ' ' ) . map( ( e ) => parseInt( e ) ) );
  }

  /* 複数行浮動小数点数二次元配列 */ // (Translated: Multiple lines 2D float array)
  /**
   * Reads 'n' lines, splits each line by space, and parses each part as a float,
   * returning a 2D array of floats.
   * @param {number} n - The number of lines to read.
   * @returns {Array<Array<number>>} A 2D array of floating-point numbers.
   */
  nextFloatRange( n ) {
    return this.nextLine( n ) . map( ( line ) => line.split( ' ' ) . map( ( e ) => parseFloat( e ) ) );
  }
}
// Create a global instance of the Input class to handle all input operations.
const input = new Input( );


/**
 * The Out class handles writing output to the console.
 * It can customize boolean output strings.
 */
class Out {
  constructor( ) {
    // Default options for boolean output.
    this.option = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  /**
   * Writes the given output to the console.
   * Handles special cases for boolean values based on configured options.
   * @param {any} output - The value to be written.
   */
  write( output ) {
    let ret;
    if ( output == null ) {
      return; // Do nothing if output is null or undefined.
    }
    if ( output === true ) {
      ret = this.option[ 'true' ]; // Use custom 'true' string.
    } else if ( output === false ) {
      ret = this.option[ 'false' ]; // Use custom 'false' string.
    } else {
      ret = output; // For other types, use the value directly.
    }
    console.log( ret ); // Print to console.
  }

  /**
   * Sets custom strings for boolean output.
   * @param {Array<string>} option - An array where option[0] is for 'false' and option[1] is for 'true'.
   * @returns {Out} The current Out instance for chaining.
   */
  bool( option ) {
    this.option[ 'false' ] = option[ 0 ];
    this.option[ 'true' ] = option[ 1 ];
    return this; // Enable method chaining.
  }
}
// Create a global instance of the Out class for all output operations.
const out = new Out( );

// The main execution block:
// Create a new Main object, call its solve method, and print the result using the global 'out' object.
out.write( new Main( ) . solve( ) );