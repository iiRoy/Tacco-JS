var  input   =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )
  . trim ( )
  . split ( "\n" ) ; /* Reads input from stdin, trims whitespace, and splits by newlines. */

/**
 * Custom object for managing input stream.
 * Mimics an iterator pattern to fetch lines one by one.
 */
var obj = {
  "list" : input , // The array of input lines
  "index" : 0 , // Current position in the input list
  "max" : input.length , // Total number of input lines
  "next" : function ( ) {
    // Checks if there are more elements before returning the next one.
    if ( ! this . hasNext ( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ; // Error if no more elements
    }
    var returnObj = this . list [ this.index ] ; // Get the current element
    this.index ++ ; // Increment the index for the next call
    return returnObj ; // Return the fetched element
  } ,
  "hasNext" : function ( ) {
    return ( this.index < this.max ) ; // True if there are more elements to read
  }
} ;

// Call the main execution function.
Main ( ) ;

/**
 * Wrapper for obj.next() to simplify input reading.
 * @returns {string} The next line from the input.
 */
function next ( ) {
  return obj . next ( ) ;
}

/**
 * Wrapper for obj.hasNext() to check for more input.
 * @returns {boolean} True if there are more lines, false otherwise.
 */
function hasNext ( ) {
  return obj . hasNext ( ) ;
}

/**
 * Custom output function for standard output.
 * @param {*} t - The value to print.
 */
function myout ( t ) {
  console . log ( t ) ; // Uses console.log for standard output
}

/**
 * Custom output function for standard error.
 * @param {*} t - The value to print as an error.
 */
function myerr ( t ) {
  console . error ( t ) ; // Uses console.error for standard error
}

/*
 * myconv function: Handles various conversions for input data.
 * i: The input value to convert.
 * no: Conversion type specifier.
 *
 * no values:
 *   - default/0: Returns input as is (no conversion).
 *   - 1: Converts to integer (parseInt).
 *   - 2: Splits string by half-width space into an array of strings.
 *   - 4: Splits string by half-width space and converts each part to Number (array of numbers).
 *   - 6: Splits string into an array of single characters.
 *   - 7: Splits string into an array of single characters and converts each to Number.
 *   - 8: Joins array elements with half-width space.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : // Convert to integer
        return parseInt ( i ) ;
      case 2 : // Split by space
        return i . split ( " " ) ;
      case 4 : // Split by space and map to numbers
        return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 : // Split by character
        return i . split ( "" ) ;
      case 7 : // Split by character and map to numbers
        return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 : // Join with space
        return i . join ( " " ) ;
      case 9 : // Join with newline
        return i . join ( "\n" ) ;
      case 0 : // Join without separator
        return i . join ( "" ) ;
      default : // No conversion, return as is
        return i ;
    }
  } catch ( e ) {
    return i ; // In case of error during conversion, return original input
  }
}

/**
 * Main function where the core logic of the program resides.
 * It reads two numbers, A and B, and calculates a specific XOR sum based on their parity.
 */
function Main ( ) {
  // Read the next line and convert it to an array of numbers (type 4 conversion).
  var one = myconv ( next ( ) , 4 ) ;

  var A = one [ 0 ] ; // First number from the input array.
  var B = one [ 1 ] ; // Second number from the input array.

  // Case 1: A and B are equal.
  if ( A == B ) {
    myout ( A ) ; // Output A (or B, they are the same).
    return ; // Exit the function.
  }

  // Case 2: A is odd, B is even.
  if ( A % 2 == 1 && B % 2 == 0 ) {
    // Calculate 'center' for this specific parity combination.
    var center = ( B - A - 1 ) / 2 ;
    // Calculate and output the XOR sum.
    myout ( A ^ B ^ ( center % 2 ) ) ;
  }
  // Case 3: A is odd, B is odd.
  else if ( A % 2 == 1 && B % 2 == 1 ) {
    // Calculate 'center' for this specific parity combination.
    var center = ( B - A ) / 2 ;
    // Calculate and output the XOR sum.
    myout ( A ^ ( center % 2 ) ) ;
  }
  // Case 4: A is even, B is even.
  else if ( A % 2 == 0 && B % 2 == 0 ) {
    // Calculate 'center' for this specific parity combination.
    var center = ( B - A ) / 2 ;
    // Calculate and output the XOR sum.
    myout ( B ^ ( center % 2 ) ) ;
  }
  // Case 5: A is even, B is odd (the remaining case).
  else {
    // Calculate 'center' for this specific parity combination.
    var center = ( B - A + 1 ) / 2 ;
    // Calculate and output the XOR sum.
    myout ( center % 2 ) ;
  }
}