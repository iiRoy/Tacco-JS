/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered or added to create a visually distinct but functionally identical
 * version.
 */

// Initialize input stream from standard input.
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

// Define a custom object 'obj' to manage input reading.
var obj = {
  // 'list' holds all input lines.
  "list" : input ,
  // 'index' tracks the current position in the input list.
  "index" : 0 ,
  // 'max' stores the total number of input lines.
  "max" : input . length ,

  // Method to retrieve the next element from the input list.
  "next" : function ( ) {
    // Check if there are more elements available.
    if ( ! this . hasNext ( ) ) {
      // If not, throw an error indicating no more elements.
      throw "NoSuchElementException:次に要素は無いよ" ;
    }

    // Get the current element.
    var returnObj = this . list [ this . index ] ;

    // Move to the next element for subsequent calls.
    this . index ++ ;

    // Return the retrieved element.
    return returnObj ;
  } , // End of 'next' method.

  // Method to check if there are more elements in the input list.
  "hasNext" : function ( ) {
    return ( this . index < this . max ) ;
  } // End of 'hasNext' method.

} ; // End of 'obj' object definition.


// Call the main function to start program execution.
Main ( ) ;


// Helper function to get the next input item using the 'obj' reader.
function next ( ) {
  return obj . next ( ) ;
}


// Helper function to check if more input items are available.
function hasNext ( ) {
  return obj . hasNext ( ) ;
}


// Function for standard output (console.log).
function myout ( t ) {
  console . log ( t ) ;
} // End of myout function.


// Function for standard error output (console.error).
function myerr ( t ) {
  console . error ( t ) ;
} // End of myerr function.


/*
 * This 'myconv' function is a versatile converter for input data.
 * It handles various transformations based on the 'no' parameter.
 *
 * [no] parameter explanation for handling elements and types:
 * - Default: Returns the input 'i' unchanged.
 * - 1: Converts 'i' to an integer (parseInt).
 * - 2: Splits 'i' by half-width spaces into a string array.
 * - 4: Splits 'i' by half-width spaces and converts each part to a number array.
 * - 6: Splits 'i' into a character array.
 * - 7: Splits 'i' into a character array and converts each character to a number.
 * - 8: Joins 'i' (assumed to be an array) with half-width spaces.
 * - 9: Joins 'i' (assumed to be an array) with newlines.
 * - 0: Joins 'i' (assumed to be an array) with no separator (empty string).
 *
 * Error handling: If any conversion fails, it returns the original input 'i'.
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
    return i ;
  }
} // End of myconv function.


// The primary logic of the program resides in the Main function.
function Main ( ) {
  // Read the next line of input and convert it to a number array (each character as a number).
  var list = myconv ( next ( ) , 7 ) ;

  // Get the length of the converted list.
  var len = list . length ;

  // Initialize the output variable, which will store the final result.
  var output = 0 ;

  // Initialize an empty object to count occurrences of numbers (for debugging/analysis).
  var count = { } ;

  // Iterate through the list from the end to the beginning.
  for ( var i = len - 1 ; i >= 0 ; i -- ) {
    // Check if the current number has been seen before.
    if ( count [ list [ i ] ] == null ) {
      // If not, initialize its count to 1.
      count [ list [ i ] ] = 1 ;
    } else {
      // If seen, increment its count.
      count [ list [ i ] ] ++ ;
    }

    // Special handling for the number 10 (for debugging purposes).
    if ( list [ i ] == 10 ) {
      myerr ( "10が出てきた:" + i ) ;
      // The original code had a commented-out line here: `output--;`
      // It remains commented out as per Type I clone rules.
      // output--;
    }

    // Logic based on whether the current number is 5 or greater.
    if ( list [ i ] >= 5 ) {
      // If 5 or greater, add the difference from 10 to the output.
      output += ( 10 - list [ i ] ) ;

      // Set the current number to 0 after processing.
      list [ i ] = 0 ;

      // If it's not the first element, increment the previous element.
      if ( i != 0 ) {
        list [ i - 1 ] ++ ;
      } else {
        // If it's the first element, increment the output directly.
        output ++ ;
      }
    } else {
      // If the number is less than 5, simply add it to the output.
      output += list [ i ] ;
    }
  } // End of the for loop.

  // Output the final calculated result.
  myout ( output ) ;

  // Debugging comment from original code.
  //なぜか6回分足しすぎてる

  // Output the frequency count of numbers encountered (for debugging/analysis).
  myerr ( count ) ;
} // End of Main function.