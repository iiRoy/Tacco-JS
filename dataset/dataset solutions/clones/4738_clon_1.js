/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the source.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered or added to create a visually distinct but functionally identical clone.
 */
var input = require( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) . trim ( ) . split ( "\n" ) ;


/**
 *  A custom object to manage input stream.
 *  It provides methods for sequential access to elements.
 */
var obj = {
  // The underlying list of input lines
  "list" : input,

  // Current index in the input list
  "index" : 0,

  // Maximum number of elements (length of the input list)
  "max" : input . length,

  /*
   * Retrieves the next element from the input list.
   * Throws an error if no more elements are available.
   */
  "next" : function ( ) {
    if ( ! this . hasNext ( ) ) {
      throw "NoSuchElementException:次に要素は無いよ"; /* Error message for no more elements */
    }

    // Get the current element
    var returnObj = this . list[ this . index ];

    // Move to the next index
    this . index ++;

    // Return the retrieved object
    return returnObj;
  }, /* End of 'next' method */

  /*
   * Checks if there are more elements in the input list.
   * Returns true if there are, false otherwise.
   */
  "hasNext" : function ( ) {
    return ( this . index < this . max );
  } /* End of 'hasNext' method */
}; /* End of 'obj' definition */


// Call the main function to start execution
Main ( ) ;


// Helper function to get the next input item as a raw string
function next ( ) {
  return obj . next ( ) ;
}


// Helper function to get the next input item as an integer
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}


// Helper function to get the next input item as an array of strings (space-separated)
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ; // Splits by half-width space
}


// Helper function to get the next input item as an array of integers (space-separated)
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ; // Splits by half-width space and converts to numbers
}


// Helper function to get the next input item as an array of characters (single-character split)
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ; // Splits by single character
}


// Helper function to check if there are more input items
function hasNext ( ) {
  return obj . hasNext ( ) ;
}


// Function for standard output (console.log)
function myout ( t ) {
  console . log ( t ) ; // Prints to standard output
}


// Function for standard error output (console.error)
function myerr ( t ) {
  console . error ( t ) ; // Prints to standard error output
}


/*
 *  myconv function: Handles various conversions based on the 'no' parameter.
 *
 *  [no] element handling. Numeric type.
 *
 *  - Unknown value, error: Returns the argument 'i' as is.
 *  - 1: Converts to a number (integer).
 *  - 2: Splits by half-width space.
 *  - 4: Splits by half-width space and converts each part to a number (array of numbers).
 *  - 6: Splits by single character (array of characters).
 *  - 7: Splits by single character and converts each part to a number (array of numbers).
 *  - 8: Joins array elements with a half-width space.
 *  - 9: Joins array elements with a newline character.
 *  - 0: Joins array elements with no character (empty string).
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ;
      case 2 :
        return i . split ( " " ) ;
      case 4 :
        return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 :
        return i . split ( "" ) ;
      case 7 :
        return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 :
        return i . join ( " " ) ;
      case 9 :
        return i . join ( "\n" ) ;
      case 0 :
        return i . join ( "" ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    // In case of an error during conversion, return the original input.
    return i ;
  }
}


/*
 *  Main function: Contains the core logic of the program.
 *  It reads an integer N, performs calculations, and prints the result.
 */
function Main ( ) {

  // Read an integer N from the input
  var N = nextInt ( ) ;

  // Calculate the base output value
  var output = Math . floor ( N / 11 ) * 2 ;

  // Calculate the remainder when N is divided by 11
  var tmp = N % 11 ;

  // Apply additional logic based on the remainder
  if ( tmp >= 7 ) {
    // If remainder is 7 or more, add 2 to output
    output += 2 ;
  } else if ( tmp > 0 ) {
    // If remainder is between 1 and 6 (inclusive), add 1 to output
    output ++ ;
  }

  // Output the final calculated value
  myout ( output ) ;
}