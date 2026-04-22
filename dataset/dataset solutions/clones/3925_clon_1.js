'use strict' /* This directive enables strict mode for the entire script. */ ;

// Definition of the Main class, which encapsulates the primary logic.
class Main // Main application logic container.
{
  /*
   * Solves the problem by reading input, performing calculations,
   * and returning the result.
   */
  solve( )
  {
    // Read an integer 'n' from the input.
    const n = input.nextInt( );

    // Read 'n' lines of integer pairs into 'ab'.
    const ab = input.nextIntRange( n );

    // If all pairs in 'ab' have equal elements (e[0] == e[1]), return 0.
    // This is a base case or a specific condition for the problem.
    if  (  ab . every ( e => e [ 0 ] == e [ 1 ] )  )
    {
      return 0 ; // All elements are equal, special case.
    }

    // Filter 'ab' to find pairs where the first element is larger than the second.
    const larger = ab . filter ( e => e [ 0 ] > e [ 1 ] ) ;

    // Calculate the sum of the first elements of all pairs in 'ab'.
    // Then subtract either 0 (if 'larger' is empty) or the minimum
    // of the second elements from the 'larger' filtered array.
    return _ . sum ( ab . map ( e => e [ 0 ] ) ) - ( larger . length == 0 ? 0 : _ . min ( ab . filter ( e => e [ 0 ] > e [ 1 ] ) . map ( e => e [ 1 ] ) ) ) ;
  }
} // End of Main class definition.

// Modulo arithmetic utility class.
class Mod // Handles operations under a specified modulus.
{
  // Constructor for the Mod class.
  constructor ( mod )
  {
    // If 'mod' is not provided, use a default from Combinatorics (assumed global).
    if ( mod == null )
    {
      mod = Combinatorics . DefaultMod ;
    }
    this . mod = mod ; // Store the modulus.
  }

  // Multiplies two numbers 'a' and 'b' under the current modulus.
  mult ( a , b )
  {
    let ret = 0 ; // Initialize result.
    a %= this . mod ; // Reduce 'a' modulo mod.
    b %= this . mod ; // Reduce 'b' modulo mod.

    // Binary multiplication (similar to Egyptian multiplication) to handle large numbers.
    while ( b )
    {
      if ( b & 1 ) // If 'b' is odd.
      {
        ret += a ; // Add 'a' to result.
        if ( ret > this . mod )
        {
          ret -= this . mod ; // Keep result within modulus.
        }
      }
      a <<= 1 ; // Double 'a'.
      if ( a > this . mod )
      {
        a -= this . mod ; // Keep 'a' within modulus.
      }
      b >>= 1 ; // Halve 'b'.
    }
    return ret ; // Return the final product.
  }

  // Calculates 'a' raised to the power of 'b' under the current modulus (modular exponentiation).
  pow ( a , b )
  {
    let ret = 1 ; // Initialize result to 1.
    while ( b ) // Loop while 'b' is greater than 0.
    {
      if ( b & 1 ) // If 'b' is odd.
      {
        ret = this . mult ( ret , a ) ; // Multiply result by 'a'.
      }
      a = this . mult ( a , a ) ; // Square 'a'.
      b >>= 1 ; // Halve 'b'.
    }
    return ret ; // Return the modular power.
  }

  // Divides 'a' by 'b' under the current modulus (modular inverse multiplication).
  // Uses Fermat's Little Theorem: a/b = a * b^(mod-2) (mod mod).
  div ( a , b )
  {
    return this . mult ( a , this . pow ( b , this . mod - 2 ) ) ;
  }

  // Calculates combinations (nCk) under the current modulus.
  // Assumes 'factTable' and 'invFactTable' are precomputed global arrays.
  comb ( n , k )
  {
    return MOD . mult ( factTable [ n ] , MOD . mult ( invFactTable [ k ] , invFactTable [ n - k ] ) ) ;
  }
} // End of Mod class.

// Instantiate the Mod class with a common prime modulus (10^9 + 7).
const MOD = new Mod ( 1e9 + 7 ) ; // Global modulus instance.

// Underscore-like utility class for common array operations.
class Underscore
{
  // Calculates the sum of all elements in an array.
  sum ( arr )
  {
    return arr . reduce ( ( a , b ) => a + b ) ;
  }

  // Calculates the sum of all elements in an array, applying a modulus.
  modSum ( arr , mod )
  {
    if ( mod == null )
    {
      mod = MOD . mod ; // Use the global MOD's modulus if none specified.
    }
    return arr . reduce ( ( a , b ) => ( a + b ) % mod ) ;
  }

  // Finds the minimum element in an array.
  // An optional comparison function can be provided.
  min ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ; // Default to numerical comparison.
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) < 0 ? a : b ) ;
  }

  // Finds the maximum element in an array.
  // An optional comparison function can be provided.
  max ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ; // Default to numerical comparison.
    }
    return arr . reduce ( ( a , b ) => func ( a , b ) > 0 ? a : b ) ;
  }

  // Sorts an array in-place.
  // An optional comparison function can be provided.
  sort ( arr , func )
  {
    if ( func == null )
    {
      func = ( a , b ) => a - b ; // Default to numerical sort.
    }
    return arr . sort ( func ) ;
  }

  // Returns a new array with unique elements.
  // Modifies the original array during the process (sorts it).
  uniq ( arr )
  {
    arr . sort ( ) ; // Sort the array to group duplicates.
    for ( let i = 0 ; i < arr . length - 1 ; ++ i )
    {
      // Mark duplicates as null.
      arr [ i ] = arr [ i + 1 ] == arr [ i ] ? null : arr [ i ] ;
    }
    return arr . filter ( e => e != null ) ; // Filter out the nulls.
  }

  // Generates a range of numbers.
  // Similar to Python's range function.
  range ( start , stop , step )
  {
    if ( stop == null )
    {
      stop = start || 0 ;
      start = 0 ;
    }
    if ( ! step )
    {
      step = stop < start ? - 1 : 1 ;
    }
    const length = Math . max ( Math . ceil ( ( stop - start ) / step ) , 0 ) ;
    const range = Array ( length ) ;
    for ( var idx = 0 ; idx < length ; idx ++ , start += step )
    {
      range [ idx ] = start ;
    }
    return range ;
  }

  // Retrieves the first element(s) of an array.
  first ( array , n )
  {
    // Handle empty or null arrays.
    if ( array == null || array . length < 1 ) return n == null ? void 0 : [ ] ;
    if ( n == null ) return array [ 0 ] ; // Return first element if 'n' is not specified.
    return this . initial ( array , array . length - n ) ; // Return first 'n' elements.
  }

  // Retrieves all but the last 'n' elements of an array.
  initial ( array , n )
  {
    return array . slice . call ( array , 0 , Math . max ( 0 , array . length - ( n == null ? 1 : n ) ) ) ;
  }

  // Retrieves all but the first 'n' elements of an array.
  tail ( array , n )
  {
    return array . slice . call ( array , n == null ? 1 : n ) ;
  }

  // Retrieves the last element(s) of an array.
  last ( array , n )
  {
    if ( n == null ) return array [ array . length - 1 ] ; // Return last element if 'n' is not specified.
    return this . tail ( array , Math . max ( 0 , array . length - n ) ) ; // Return last 'n' elements.
  }

  // Calculates a cumulative sum array.
  // The first element of the result is the first element of the input.
  sumArray ( arr )
  {
    return this . tail ( arr . reduce ( ( ( a , b , i ) => { a . push ( b + a [ i ] ) ; return a } ) , [ 0 ] ) ) ;
  }

  // Calculates the difference between adjacent elements in an array.
  diffArray ( arr )
  {
    const s = [ ] ;
    for ( let i = 1 ; i < arr . length ; ++ i )
    {
      s . push ( arr [ i ] - arr [ i - 1 ] ) ;
    }
    return s ;
  }

  // Performs a binary search to find the index of the greatest element
  // less than or equal to `key` in a sorted array.
  // `iteratee` can specify a property name if array elements are objects.
  binarySearch ( array , key , iteratee )
  {
    // Helper function to extract the value for comparison.
    const itr = ( obj ) => ( typeof obj === 'object' ) ? obj [ iteratee ] : obj ;
    const value = itr ( key ) ; // Get the comparison value from the key.

    let low = 0 , high = array . length ; // Initialize search bounds.
    while ( low < high )
    {
      let mid = Math . floor ( ( low + high ) / 2 ) ; // Calculate middle index.
      if ( itr ( array [ mid ] ) < value ) low = mid + 1 ; // Adjust low if mid is too small.
      else high = mid ; // Adjust high if mid is large enough.
    }
    return low ; // Return the found index.
  }
} // End of Underscore class.

// Instantiate the Underscore utility class.
const _ = new Underscore ( ) ; // Global utility instance.

// Input handling class.
class Input // Manages reading data from standard input.
{
  // Constructor: Initializes cursor and reads all input.
  constructor ( )
  {
    this . cursor = 0 ; // Current position in input data.
    this . inputAll ( ) ; // Read all input upon instantiation.
  }

  // Reads all data from stdin and splits it by newlines.
  inputAll ( )
  {
    // Using Node.js 'fs' module to read synchronous file.
    this . data = ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) . split ( '\n' ) ;
    return this . data ;
  }

  /*
   * Reads one or multiple lines of input.
   * If 'n' is provided, reads 'n' lines. Otherwise, reads one line.
   */
  nextLine ( n )
  {
    if ( n )
    {
      const ret = this . data . slice ( this . cursor , this . cursor + n ) ;
      this . cursor += n ; // Advance cursor by 'n' lines.
      return ret ;
    }
    return this . data [ this . cursor ++ ] ; // Return current line and advance cursor.
  }

  /* Reads a single integer from the next line. */
  nextInt ( )
  {
    return parseInt ( this . nextLine ( ) ) ;
  }

  /* Reads a line and returns an array of strings (space-separated). */
  nextStrArr ( )
  {
    return this . nextLine ( ) . split ( ' ' ) ;
  }

  /* Reads a line and returns an array of integers. */
  nextIntArr ( )
  {
    return this . nextStrArr ( ) . map ( ( e ) => parseInt ( e ) ) ;
  }

  /* Reads a line and returns an array of floating-point numbers. */
  nextFloatArr ( )
  {
    return this . nextStrArr ( ) . map ( ( e ) => parseFloat ( e ) ) ;
  }

  /* Reads 'n' lines and returns an array of integers (one integer per line). */
  nextIntLine ( n )
  {
    return this . nextLine ( n ) . map ( ( e ) => parseInt ( e ) ) ;
  }

  /* Reads 'n' lines and returns an array of floating-point numbers (one per line). */
  nextFloatLine ( n )
  {
    return this . nextLine ( n ) . map ( ( e ) => parseFloat ( e ) ) ;
  }

  /* Reads 'n' lines and returns a 2D array of strings (space-separated). */
  nextStrRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) ) ;
  }

  /* Reads 'n' lines and returns a 2D array of integers. */
  nextIntRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseInt ( e ) ) ) ;
  }

  /* Reads 'n' lines and returns a 2D array of floating-point numbers. */
  nextFloatRange ( n )
  {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseFloat ( e ) ) ) ;
  }
} // End of Input class.

// Instantiate the Input class to manage reading from stdin.
const input = new Input ( ) ; // Global input instance.

// Output handling class.
class Out // Manages printing results to standard output.
{
  // Constructor: Initializes options for boolean output.
  constructor ( )
  {
    this . option = {
      'true' : 'Yes' , // Default string for true.
      'false' : 'No' , // Default string for false.
    } ;
  }

  // Writes the given output to the console.
  // Handles boolean conversion based on 'option' property.
  write ( output )
  {
    let ret ; // Variable to hold the final string to print.
    if ( output == null ) return ; // Do nothing if output is null or undefined.

    if ( output === true )
    {
      ret = this . option [ 'true' ] ; // Use configured string for true.
    }
    else if ( output === false )
    {
      ret = this . option [ 'false' ] ; // Use configured string for false.
    }
    else
    {
      ret = output ; // Print as is for other types.
    }
    console . log ( ret ) ; // Output to console.
  }

  // Sets custom strings for true/false boolean output.
  // Returns 'this' for method chaining.
  bool ( option )
  {
    this . option [ 'false' ] = option [ 0 ] ; // Set custom string for false.
    this . option [ 'true' ] = option [ 1 ] ; // Set custom string for true.
    return this ; // Allow chaining.
  }
} // End of Out class.

// Instantiate the Out class to manage writing to stdout.
const out = new Out ( ) ; // Global output instance.

// Execute the main logic and print the result.
out . write ( new Main ( ) . solve ( ) ) ; // Create a Main instance, solve, and output the result.