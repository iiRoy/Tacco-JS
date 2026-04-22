'use strict' /* This directive enables strict mode for the entire script. */

// Class definition for the main logic of the program.
class Main
{
  /**
   * Solves the problem.
   * @returns {number} The result of the computation.
   */
  solve( )
  {

    // Read an integer 'n' from the input.
    const n = input . nextInt( ) ;

    // Read 'n' lines of integer pairs into 'ab'.
    const ab = input . nextIntRange( n ) ;

    /*
     * Check if all pairs (e[0], e[1]) in 'ab' have e[0] equal to e[1].
     * If they do, the result is 0.
     */
    if ( ab . every ( e => e [ 0 ] == e [ 1 ] ) )
    {
      return 0 ;
    }

    // Filter 'ab' to get only pairs where the first element is greater than the second.
    const larger = ab . filter ( e => e [ 0 ] > e [ 1 ] ) ;

    // Calculate the sum of the first elements of all pairs in 'ab'.
    // Then subtract the count of 'larger' pairs.
    // If this sum is 0, return 0.
    // Otherwise, find the minimum of the second elements from the 'larger' pairs.
    return _ . sum ( ab . map ( e => e [ 0 ] ) ) - larger . length == 0 ? 0 : _ . min ( ab . filter ( e => e [ 0 ] > e [ 1 ] ) . map ( e => e [ 1 ] ) ) ;

  } // End of solve method.
} // End of Main class.



// Class definition for modular arithmetic operations.
class Mod
{

  /**
   * Constructs a new Mod instance.
   * @param {number} mod - The modulus value.
   */
  constructor ( mod )
  {
    // If mod is not provided, use a default value (e.g., from Combinatorics.DefaultMod if it existed).
    // For this example, we assume it's always provided or handled externally.
    if ( mod == null )
    {
      mod = 1e9 + 7 ; // Assuming a common default if Combinatorics.DefaultMod is not available
    }
    this . mod = mod ;
  }


  /**
   * Performs modular multiplication: (a * b) % mod.
   * Uses binary multiplication to prevent overflow with large numbers.
   * @param {number} a - First operand.
   * @param {number} b - Second operand.
   * @returns {number} The result of (a * b) % mod.
   */
  mult ( a , b )
  {
    let ret = 0 ; // Initialize result.
    a %= this . mod ; // Reduce a modulo mod.
    b %= this . mod ; // Reduce b modulo mod.

    // Loop while b is not zero.
    while ( b )
    {
      // If the least significant bit of b is 1, add a to ret.
      if ( b & 1 )
      {
        ret += a ;
        // If ret exceeds mod, subtract mod to keep it within range.
        if ( ret >= this . mod )
        {
          ret -= this . mod ;
        }
      }
      a <<= 1 ; // Left shift a by 1 (equivalent to a * 2).
      // If a exceeds mod, subtract mod.
      if ( a >= this . mod )
      {
        a -= this . mod ;
      }
      b >>= 1 ; // Right shift b by 1 (equivalent to b / 2).
    }
    return ret ; // Return the final modular product.
  }


  /**
   * Performs modular exponentiation: (a^b) % mod.
   * Uses binary exponentiation (exponentiation by squaring).
   * @param {number} a - Base.
   * @param {number} b - Exponent.
   * @returns {number} The result of (a^b) % mod.
   */
  pow ( a , b )
  {
    let ret = 1 ; // Initialize result to 1.
    // Loop while b is not zero.
    while ( b )
    {
      // If the least significant bit of b is 1, multiply ret by a.
      if ( b & 1 )
      {
        ret = this . mult ( ret , a ) ;
      }
      a = this . mult ( a , a ) ; // Square a.
      b >>= 1 ; // Right shift b by 1.
    }
    return ret ; // Return the final modular power.
  }


  /**
   * Performs modular division: (a / b) % mod using Fermat's Little Theorem.
   * Requires mod to be a prime number.
   * @param {number} a - Numerator.
   * @param {number} b - Denominator.
   * @returns {number} The result of (a * b^(mod-2)) % mod.
   */
  div ( a , b )
  {
    /*
     * Division a / b modulo m is equivalent to a * b^(m-2) modulo m
     * when m is a prime number, according to Fermat's Little Theorem.
     */
    return this . mult ( a , this . pow ( b , this . mod - 2 ) ) ;
  }


  /**
   * Calculates nCk (n choose k) modulo mod.
   * Requires precomputed factorial and inverse factorial tables.
   * @param {number} n - Total items.
   * @param {number} k - Items to choose.
   * @returns {number} The result of nCk % mod.
   */
  comb ( n , k )
  {
    // Assumes `factTable` and `invFactTable` are globally available or passed.
    // This part might need context if `factTable` and `invFactTable` are not defined.
    // For this clone, we keep it as is.
    return MOD . mult ( factTable [ n ] , MOD . mult ( invFactTable [ k ] , invFactTable [ n - k ] ) ) ;
  }
} // End of Mod class.


// Instantiate a global Mod object with a common prime modulus.
const MOD = new Mod ( 1e9 + 7 ) ;



// Utility class for common array operations, similar to Lodash or Underscore.js.
class Underscore
{
  /**
   * Calculates the sum of all elements in an array.
   * @param {number[]} arr - The array of numbers.
   * @returns {number} The sum of the array elements.
   */
  sum ( arr )
  {
    return arr . reduce ( ( a , b ) => a + b ) ;
  }


  /**
   * Calculates the sum of array elements modulo a given number.
   * @param {number[]} arr - The array of numbers.
   * @param {number} mod - The modulus. If null, uses the global MOD.mod.
   * @returns {number} The modular sum.
   */
  modSum ( arr , mod )
  {
    if ( mod == null )
    {
      mod = MOD . mod ;
    }
    return arr . reduce ( ( a , b ) => ( a + b ) % mod ) ;
  }


  /**
   * Finds the minimum element in an array.
   * @param {T[]} arr - The array.
   * @param {function(T, T): number} [func] - A comparison function. Defaults to numerical comparison.
   * @returns {T} The minimum element.
   */
  min ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ;
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) < 0 ? a : b ) ;
  }


  /**
   * Finds the maximum element in an array.
   * @param {T[]} arr - The array.
   * @param {function(T, T): number} [func] - A comparison function. Defaults to numerical comparison.
   * @returns {T} The maximum element.
   */
  max ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ;
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) > 0 ? a : b ) ;
  }


  /**
   * Sorts an array in place.
   * @param {T[]} arr - The array to sort.
   * @param {function(T, T): number} [func] - A comparison function. Defaults to numerical comparison.
   * @returns {T[]} The sorted array.
   */
  sort ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ;
    }
    return arr . sort ( func ) ;
  }


  /**
   * Removes duplicate elements from an array.
   * Modifies the original array by sorting it first.
   * @param {T[]} arr - The array.
   * @returns {T[]} A new array with unique elements.
   */
  uniq ( arr )
  {
    arr . sort ( ) ; // Sort the array to group duplicates.
    for ( let i = 0 ; i < arr . length - 1 ; ++ i )
    {
      // If current element is same as next, mark it for removal (set to null).
      arr [ i ] = arr [ i + 1 ] == arr [ i ] ? null : arr [ i ] ;
    }
    // Filter out the marked (null) elements.
    return arr . filter ( e => e != null ) ;
  }


  /**
   * Generates an array of numbers within a specified range.
   * @param {number} start - The starting value.
   * @param {number} stop - The ending value (exclusive).
   * @param {number} [step] - The increment/decrement step.
   * @returns {number[]} The generated range array.
   */
  range ( start , stop , step )
  {
    // Handle cases where stop is omitted (e.g., range(5) -> [0,1,2,3,4]).
    if ( stop == null )
    {
      stop = start || 0 ;
      start = 0 ;
    }
    // Determine step direction if not provided.
    if ( ! step )
    {
      step = stop < start ? - 1 : 1 ;
    }

    // Calculate the length of the array.
    const length = Math . max ( Math . ceil ( ( stop - start ) / step ) , 0 ) ;
    const range = Array ( length ) ; // Create an array of the calculated length.

    // Populate the array.
    for ( var idx = 0 ; idx < length ; idx ++ , start += step )
    {
      range [ idx ] = start ;
    }
    return range ;
  }


  /**
   * Retrieves the first element(s) of an array.
   * @param {T[]} array - The input array.
   * @param {number} [n] - The number of elements to retrieve.
   * @returns {T|T[]|undefined} The first element, an array of first 'n' elements, or undefined.
   */
  first ( array , n )
  {
    if ( array == null || array . length < 1 )
    {
      return n == null ? void 0 : [ ] ;
    }
    if ( n == null )
    {
      return array [ 0 ] ;
    }
    // Reuses initial method to get the first 'n' elements.
    return this . initial ( array , array . length - n ) ;
  }


  /**
   * Retrieves all but the last 'n' elements of an array.
   * @param {T[]} array - The input array.
   * @param {number} [n] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {T[]} A new array with elements from the beginning up to (length - n).
   */
  initial ( array , n )
  {
    return array . slice . call ( array , 0 , Math . max ( 0 , array . length - ( n == null ? 1 : n ) ) ) ;
  }


  /**
   * Retrieves all but the first 'n' elements of an array.
   * @param {T[]} array - The input array.
   * @param {number} [n] - The number of elements to exclude from the beginning. Defaults to 1.
   * @returns {T[]} A new array with elements from index 'n' to the end.
   */
  tail ( array , n )
  {
    return array . slice . call ( array , n == null ? 1 : n ) ;
  }


  /**
   * Retrieves the last element(s) of an array.
   * @param {T[]} array - The input array.
   * @param {number} [n] - The number of elements to retrieve.
   * @returns {T|T[]|undefined} The last element, an array of last 'n' elements, or undefined.
   */
  last ( array , n )
  {
    if ( n == null )
    {
      return array [ array . length - 1 ] ;
    }
    // Reuses tail method to get the last 'n' elements.
    return this . tail ( array , Math . max ( 0 , array . length - n ) ) ;
  }


  /**
   * Calculates a cumulative sum array (prefix sums).
   * @param {number[]} arr - The input array.
   * @returns {number[]} A new array where each element is the sum of all preceding elements plus itself.
   */
  sumArray ( arr )
  {
    /*
     * The reduce function generates an array including the initial 0.
     * `this.tail` then removes that initial 0 to give the true cumulative sum array.
     * Example: [1, 2, 3] -> [0, 1, 3, 6] -> [1, 3, 6]
     */
    return this . tail ( arr . reduce ( ( ( a , b , i ) => { a . push ( b + a [ i ] ) ; return a } ) , [ 0 ] ) ) ;
  }


  /**
   * Calculates the difference between adjacent elements in an array.
   * @param {number[]} arr - The input array.
   * @returns {number[]} A new array of differences.
   */
  diffArray ( arr )
  {
    const s = [ ] ;
    for ( let i = 1 ; i < arr . length ; ++ i )
    {
      s . push ( arr [ i ] - arr [ i - 1 ] ) ;
    }
    return s ;
  }


  /**
   * Performs a binary search on a sorted array to find the index of the largest element
   * less than or equal to a key (or the insertion point for the key).
   * @param {T[]} array - The sorted array.
   * @param {any} key - The value to search for.
   * @param {string} [iteratee] - If array elements are objects, the property name to compare.
   * @returns {number} The index where the key would be inserted to maintain sorted order,
   *                   or the index of the first element greater than the key.
   */
  binarySearch ( array , key , iteratee )
  {
    // Helper function to get the value for comparison, either directly or from an object property.
    const itr = ( obj ) => ( typeof obj === 'object' ) ? obj [ iteratee ] : obj ;

    const value = itr ( key ) ; // Get the comparable value of the key.
    let low = 0 , high = array . length ; // Initialize search range.

    // Standard binary search loop.
    while ( low < high )
    {
      let mid = Math . floor ( ( low + high ) / 2 ) ;
      if ( itr ( array [ mid ] ) < value )
      {
        low = mid + 1 ; // Key is in the upper half.
      }
      else
      {
        high = mid ; // Key is in the lower half or is mid.
      }
    }
    return low ; // Return the insertion point.
  }

} // End of Underscore class.


// Instantiate a global Underscore object for utility functions.
const _ = new Underscore ( ) ;



// Class for handling input operations, reading from standard input.
class Input
{
  /**
   * Constructor for the Input class.
   * Initializes cursor and reads all input.
   */
  constructor ( )
  {
    this . cursor = 0 ; // Keeps track of the current line being read.
    this . inputAll ( ) ; // Reads all input data at once.
  }


  /**
   * Reads all lines from standard input and stores them in `this.data`.
   * @returns {string[]} An array of strings, each representing a line of input.
   */
  inputAll ( )
  {
    // Requires 'fs' module to read from /dev/stdin (standard input).
    this . data = ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) . split ( '\n' ) ;
    return this . data ;
  }


  /**
   * Reads one or more lines of input as raw strings.
   * @param {number} [n] - The number of lines to read. If not provided, reads one line.
   * @returns {string|string[]} A single string or an array of strings.
   */
  nextLine ( n )
  {
    if ( n )
    {
      const ret = this . data . slice ( this . cursor , this . cursor + n ) ;
      this . cursor += n ;
      return ret ;
    }
    return this . data [ this . cursor ++ ] ;
  }


  /**
   * Reads a single line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  nextInt ( )
  {
    return parseInt ( this . nextLine ( ) ) ;
  }


  /**
   * Reads a single line, splits it by space, and returns an array of strings.
   * @returns {string[]} An array of string tokens.
   */
  nextStrArr ( )
  {
    return this . nextLine ( ) . split ( ' ' ) ;
  }


  /**
   * Reads a single line, splits it by space, and parses each token as an integer.
   * @returns {number[]} An array of integers.
   */
  nextIntArr ( )
  {
    return this . nextStrArr ( ) . map ( ( e ) => parseInt ( e ) ) ;
  }


  /**
   * Reads a single line, splits it by space, and parses each token as a float.
   * @returns {number[]} An array of floating-point numbers.
   */
  nextFloatArr ( )
  {
    return this . nextStrArr ( ) . map ( ( e ) => parseFloat ( e ) ) ;
  }


  /**
   * Reads 'n' lines and parses each line as an integer.
   * @param {number} n - The number of lines to read.
   * @returns {number[]} An array of integers.
   */
  nextIntLine ( n )
  {
    return this . nextLine ( n ) . map ( ( e ) => parseInt ( e ) ) ;
  }


  /**
   * Reads 'n' lines and parses each line as a float.
   * @param {number} n - The number of lines to read.
   * @returns {number[]} An array of floating-point numbers.
   */
  nextFloatLine ( n )
  {
    return this . nextLine ( n ) . map ( ( e ) => parseFloat ( e ) ) ;
  }


  /**
   * Reads 'n' lines, splits each line by space, and returns a 2D array of strings.
   * @param {number} n - The number of lines to read.
   * @returns {string[][]} A 2D array of string tokens.
   */
  nextStrRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) ) ;
  }


  /**
   * Reads 'n' lines, splits each line by space, and parses each token as an integer,
   * returning a 2D array of integers.
   * @param {number} n - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  nextIntRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseInt ( e ) ) ) ;
  }


  /**
   * Reads 'n' lines, splits each line by space, and parses each token as a float,
   * returning a 2D array of floats.
   * @param {number} n - The number of lines to read.
   * @returns {number[][]} A 2D array of floating-point numbers.
   */
  nextFloatRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseFloat ( e ) ) ) ;
  }

} // End of Input class.


// Instantiate a global Input object to handle reading data.
const input = new Input ( ) ;



// Class for handling output operations.
class Out
{
  /**
   * Constructor for the Out class.
   * Initializes default options for boolean output.
   */
  constructor ( )
  {
    // Default mappings for boolean true/false to strings.
    this . option = {
      'true' : 'Yes' ,
      'false' : 'No' ,
    } ;
  }


  /**
   * Writes the given output to the console.
   * Handles boolean values by mapping them to custom strings.
   * @param {any} output - The value to write.
   */
  write ( output )
  {
    let ret ; // Variable to store the final output string.
    if ( output == null )
    {
      return ; // Do nothing if output is null or undefined.
    }

    if ( output === true )
    {
      ret = this . option [ 'true' ] ; // Map true to 'Yes' or custom setting.
    }
    else if ( output === false )
    {
      ret = this . option [ 'false' ] ; // Map false to 'No' or custom setting.
    }
    else
    {
      ret = output ; // For other types, output as is.
    }
    console . log ( ret ) ; // Print the result to standard output.
  }


  /**
   * Sets custom string representations for boolean true/false.
   * @param {string[]} option - An array where option[0] is for false, option[1] for true.
   * @returns {Out} The current Out instance for chaining.
   */
  bool ( option )
  {
    this . option [ 'false' ] = option [ 0 ] ; // Set custom string for false.
    this . option [ 'true' ] = option [ 1 ] ; // Set custom string for true.
    return this ; // Allow method chaining.
  }

} // End of Out class.


// Instantiate a global Out object for output operations.
const out = new Out ( ) ;


// Main execution line: Create a Main instance, call its solve method, and print the result.
out . write ( new Main ( ) . solve ( ) ) ;