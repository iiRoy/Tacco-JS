var    input = require("fs") . readFileSync(  "/dev/stdin", "utf8"  ) . trim() . split("\n") ;

/*
 * This 'obj' variable acts as an input iterator.
 * It holds the entire input as a list of strings and keeps track of the current position.
 */
var obj = {
  "list"  :  input ,                     // The array of input lines.
  "index" :  0 ,                         // Current position in the input array.
  "max"   :  input.length ,              // Total number of lines in the input.

  /**
   * Checks if there are more elements available in the input list.
   * @returns {boolean} True if there are more elements; otherwise, false.
   */
  "hasNext" : function ( ) {
    return ( this.index < this.max ) ;
  } ,

  /**
   * Retrieves the next element (line) from the input list.
   * Throws an error if no more elements are available.
   * @returns {string} The next line from the input.
   * @throws {string} "NoSuchElementException:次に要素は無いよ" if no next element exists.
   */
  "next" : function ( ) {
    if ( ! this.hasNext( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ; // Error message in Japanese.
    }
    var returnObj = this.list[ this.index ] ;
    this.index ++ ; // Advance the index to the next element.
    return returnObj ;
  }
} ;

// Call the main function to start program execution.
Main( ) ;


/*
 * Helper functions for reading various types of input.
 * These functions simplify input parsing throughout the main logic.
 */

/**
 * Gets the next raw string element from the input iterator.
 * @returns {string} The next input line.
 */
function next ( ) {
  return obj.next( ) ;
}

/**
 * Gets the next input element and converts it to an integer.
 * @returns {number} The next input line as an integer.
 */
function nextInt ( ) {
  return myconv( next( ) , 1 ) ;
}

/**
 * Gets the next input element, splits it by space, and returns a string array.
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
  return myconv( next( ) , 2 ) ; // Splits the input string by half-width spaces.
}

/**
 * Gets the next input element, splits it by space, and converts each part to a number.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) {
  return myconv( next( ) , 4 ) ; // Splits by half-width spaces and then converts each part to a number.
}

/**
 * Gets the next input element and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) {
  return myconv( next( ) , 6 ) ; // Splits the input string into a character array.
}

/**
 * Checks if there are more elements available in the input.
 * @returns {boolean} True if more elements are available; otherwise, false.
 */
function hasNext ( ) {
  return obj.hasNext( ) ;
}

/**
 * Outputs a value to the standard console.
 * @param {*} t - The value to be printed.
 */
function myout ( t ) {
  console.log( t ) ; // Uses console.log for standard output.
}

/**
 * Outputs a value to the standard error console.
 * @param {*} t - The value to be printed as an error.
 */
function myerr ( t ) {
  console.error( t ) ; // Uses console.error for standard error output.
}

/*
 * The 'myconv' function provides a versatile way to convert or process input data.
 * The 'no' parameter acts as a control code for different conversion types.
 *
 * Conversion Codes (for 'no' parameter):
 *   - 1: Convert to integer using parseInt().
 *   - 2: Split string by a single space (" ") into an array of strings.
 *   - 4: Split string by a single space (" ") and then map each element to a Number.
 *   - 6: Split string into an array of individual characters ("").
 *   - 7: Split string into an array of individual characters ("") and then map each element to a Number.
 *   - 8: Join an array of elements into a single string, separated by a single space (" ").
 *   - 9: Join an array of elements into a single string, separated by a newline character ("\n").
 *   - 0: Join an array of elements into a single string with no separator ("").
 *   - Default: If 'no' does not match any case, or an error occurs during conversion,
 *              the original input 'i' is returned without modification.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i.split( " " ) ;
      case 4 :
        return i.split( " " ) . map( ( a ) => Number( a ) ) ;
      case 6 :
        return i.split( "" ) ;
      case 7 :
        return i.split( "" ) . map( ( a ) => Number( a ) ) ;
      case 8 :
        return i.join( " " ) ;
      case 9 :
        return i.join( "\n" ) ;
      case 0 :
        return i.join( "" ) ;
      default :
        return i ; // Return original input if 'no' is unknown.
    }
  } catch ( e ) {
    return i ; // If any error occurs during conversion, return the original input.
  }
}

/**
 * Main function where the primary logic of the program resides.
 * It reads product prices and discount offers to calculate the minimum possible total cost.
 */
function Main ( ) {
  var   one   =   nextIntArray( ) ; // Reads the first line of input as an array of integers.

  var   A     =   one[ 0 ] ; // Number of items in category A.
  var   B     =   one[ 1 ] ; // Number of items in category B.
  var   M     =   one[ 2 ] ; // Number of discount offers.

  var alist   =   nextIntArray( ) ; // Reads prices for items in category A.
  var blist   =   nextIntArray( ) ; // Reads prices for items in category B.

  // Calculate the initial minimum cost: cheapest item from A + cheapest item from B.
  var min = Math.min.apply( null , alist ) + Math.min.apply( null , blist ) ;

  // Loop through each of the M discount offers.
  for ( var i = 0 ; i < M ; i ++ ) {
    var tmp = nextIntArray( ) ; // Reads a discount offer: [A_idx, B_idx, discount_amount].

    // Calculate the temporary minimum price using the current discount offer.
    // Note: Indices in tmp are 1-based, so we subtract 1 to get 0-based array indices.
    var tmpMin = alist[ tmp[ 0 ] - 1 ] + blist[ tmp[ 1 ] - 1 ] - tmp[ 2 ] ;

    // Update the overall minimum price if the current discounted price is lower.
    min = Math.min( tmpMin , min ) ;
  }

  myout( min ) ; // Output the final calculated minimum price.
}