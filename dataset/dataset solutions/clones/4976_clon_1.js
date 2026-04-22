/*
 * This is a JavaScript file.
 * It contains various utility classes and functions.
 */

 'use strict' ; // Enable strict mode for better error handling.

 /*
  * The primary application logic resides in the Main class.
  * It processes input and produces an output.
  */
 class Main /* Main Application Logic */ {

   /**
    * Solves the main problem.
    * Reads a line of input, processes it, and prints the result.
    */
  solve ( ) {

    // Retrieve input, convert to array, and reverse it.
    const   list =   Array.from  ( input.nextLine ( ) ) . reverse ( ) ;
    let sum  =  0 ; // Initialize a variable to accumulate sum.

    /*
     * Iterate through all possible combinations.
     * The loop runs 2^(list.length-1) times.
     */
    for ( let i  =  0 ;   i < ( 1 << ( list.length - 1 ) ) ;   ++ i ) {
      let k = i ,   d = 1 ; // k is a temporary bitmask, d is a multiplier.

      // Process each element in the reversed list.
      for ( const e   of   list ) {
        sum  +=  e * d ; // Add the product to the total sum.

        // If the current bit in k is set, multiply d by 10; otherwise, reset to 1.
        d = ( k & 1 )  ?  ( d * 10 )  :  1 ;
        k >>= 1 ; // Shift k to the right by one bit.
      }


    }
    // Output the final calculated sum.
    console . log ( sum ) ;
  }
 }


 /**
  * Underscore-like utility class for common array operations.
  * Provides methods for sum, min, max, sort, range, and more.
  */
 class Underscore {

  // Computes the sum of all elements in an array.
  sum ( arr ) { return arr . reduce ( ( a , b ) => a + b ) ; }


  // Finds the minimum element in an array. An optional function can be provided for comparison.
  min ( arr ,   func ) {
   if ( func == null ) {
    func = ( a , b ) => a - b
   }
   return arr . reduce ( ( a , b ) => func ( a , b ) < 0 ? a : b ) ;
  }


  // Finds the maximum element in an array. An optional function can be provided for comparison.
  max ( arr ,   func ) {
   if ( func == null ) { func = ( a , b ) => a - b }
   return arr . reduce ( ( a , b ) => func ( a , b ) > 0 ? a : b ) ;
  }


  // Sorts an array using an optional comparison function.
  sort ( arr , func ) {
   if ( func == null ) {
    func = ( a , b ) => a - b
   }
   return arr . sort ( func )
  }


  // Generates a range of numbers.
  range ( start , stop , step ) {
    if ( stop == null ) {
      stop = start || 0 ;
      start = 0 ;
    }

    if ( ! step ) {
      step = stop < start ? -1 : 1 ;
    }
    const length = Math . max ( Math . ceil ( ( stop - start ) / step ) , 0 ) ;
    const range = Array ( length ) ;

    for ( var idx = 0 ; idx < length ; idx ++ , start += step ) {
      range [ idx ] = start ;
    }
    return range ;
  }


  first ( array , n ) {
    if ( array == null || array . length < 1 ) return n == null ? void 0 : [ ] ;
    if ( n == null ) return array [ 0 ] ;
    return this . initial ( array , array . length - n ) ;
  } ;


  initial ( array , n ) {
   return array . slice . call ( array , 0 , Math . max ( 0 , array . length - ( n == null ? 1 : n ) ) ) ;
  }


  tail ( array , n ) {
   return array . slice . call ( array , n == null ? 1 : n ) ;
  }


  last ( array , n ) {
    if ( n == null ) {
     return array [ array . length - 1 ] ;
    }
    return this . tail ( array , Math . max ( 0 , array . length - n ) ) ;
  }

  /*
   * Calculates the cumulative sum of an array.
   * Returns an array where each element is the sum of all preceding elements plus itself.
   */
  sumArray ( arr ) {
   return this . tail ( arr . reduce ( ( ( a , b , i ) => {
    a . push ( b + a [ i ] ) ;
    return a
   } ) , [ 0 ] ) ) ;
  }


  /**
   * Performs a binary search on a sorted array.
   * Finds the insertion point for a given key.
   * @param {Array} array - The array to search.
   * @param {*} key - The value to search for.
   * @param {string} iteratee - The property name to use for comparison if objects are in the array.
   * @returns {number} The index where the key should be inserted to maintain sorted order.
   */
  binarySearch ( array , key , iteratee ) {
    const itr = ( obj ) => ( ( typeof obj === 'object' ) ? obj [ iteratee ] : obj ) ;
    const value = itr ( obj ) ;
    let low = 0 ,   high = array . length ;
    while ( low < high ) {
      let mid = Math . floor ( ( low + high ) / 2 ) ;
      if ( itr ( array [ mid ] ) < value ) low = mid + 1 ;
      else high = mid ;
    }
    return low ;
  } ;
 }


 // Create a global instance of the Underscore utility class.
 const _ = new Underscore ( ) ;


 /**
  * Input utility class for reading data from stdin.
  * Provides methods for reading lines, integers, arrays, etc.
  */
 class Input {

  // Constructor: Initializes cursor and reads all input.
  constructor ( ) {
    this . cursor = 0 ;
    this . inputAll ( ) ;
  }


  // Reads all input from standard input and splits it by newlines.
  inputAll ( ) {
    this . data = ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) . split ( '\n' ) ;
    return this . data ;
  }


  /*
   * Reads one or multiple lines of input.
   * @param {number} [n] - Number of lines to read. If not provided, reads one line.
   * @returns {string|Array<string>} The line(s) read.
   */
  nextLine ( n ) {
    if ( n ) {
      const ret = this . data . slice ( this . cursor , this . cursor + n ) ;
      this . cursor += n ;
      return ret ;
    }
    return this . data [ this . cursor ++ ] ;
  }


  // Reads and parses a single integer from the next line.
  nextInt ( ) {
   return parseInt ( this . nextLine ( ) ) ;
  }


  // Reads a line and splits it into an array of strings.
  nextStrArr ( ) {
   return this . nextLine ( ) . split ( ' ' ) ;
  }


  // Reads a line, splits it, and parses each part into an integer.
  nextIntArr ( ) {
   return this . nextStrArr ( ) . map ( ( e ) => parseInt ( e ) ) ;
  }


  // Reads a line, splits it, and parses each part into a float.
  nextFloatArr ( ) {
   return this . nextStrArr ( ) . map ( ( e ) => parseFloat ( e ) ) ;
  }


  // Reads multiple lines and parses each into an integer.
  nextIntLine ( n ) {
   return this . nextLine ( n ) . map ( ( e ) => parseInt ( e ) )
  }


  // Reads multiple lines and parses each into a float.
  nextFloatLine ( n ) {
   return this . nextLine ( n ) . map ( ( e ) => parseFloat ( e ) )
  }


  // Reads multiple lines, splitting each line into an array of strings.
  nextStrRange ( n ) {
   return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) ) ;
  }


  // Reads multiple lines, splitting each line and parsing parts into integers.
  nextIntRange ( n ) {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseInt ( e ) ) ) ;
  }


  // Reads multiple lines, splitting each line and parsing parts into floats.
  nextFloatRange ( n ) {
    return this . nextLine ( n ) . map ( ( line ) => line . split ( ' ' ) . map ( ( e ) => parseFloat ( e ) ) ) ;
  }
 }


 // Create a global instance of the Input utility class.
 const input = new Input ( ) ;


 /**
  * Helper function for outputting results.
  * Converts boolean true/false to 'Yes'/'No' strings.
  * @param {*} output - The value to output.
  */
 const Out = ( output ) => {
  let ret ; // Declare a variable to hold the return value.
  if ( output == null ) {
   return ; // If output is null or undefined, do nothing.
  }
  if ( output === true ) {
   ret = 'Yes' ; // Convert true to 'Yes'.
  }
  else if ( output === false ) {
   ret = 'No' ; // Convert false to 'No'.
  }
  else {
   ret = output ; // Otherwise, use the output value as is.
  }
  console . log ( ret ) ; // Print the result to the console.
 } ;


 // Execute the main program logic and output its result.
 Out ( new Main ( ) . solve ( ) ) ;