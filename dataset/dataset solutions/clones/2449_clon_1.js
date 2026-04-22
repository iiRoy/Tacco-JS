/*
 * This script processes standard input using a custom utility object
 * and a set of helper functions for data conversion.
 *
 * It demonstrates basic file reading, object-oriented structure for
 * input handling, and various data transformation utilities.
 */

// Initialize input stream: read from /dev/stdin, decode as UTF-8,
// remove leading/trailing whitespace, and split into lines.
var input = require("fs").readFileSync("/dev/stdin"  , "utf8" ).trim( ) .split( "\n" );

// Define a global object 'obj' to manage input line access.
// This acts as a simple iterator for the input array.
var   obj  =  {
  // 'list': Stores the array of input lines.
  "list" : input,
  // 'index': Current position in the input list, initialized to 0.
  "index" : 0,
  // 'max': Total number of lines in the input list.
  "max" : input.length,

  // 'hasNext': A method to check if there are more lines to read.
  "hasNext" : function ( ) {
    return (this.index < this.max);
  },

  // 'next': A method to retrieve the next line from the input list.
  // It increments the index after returning the current line.
  "next" : function (  )  {
    // If there are no more lines, return an empty string.
    if  ( ! this.hasNext ( ) )  {
      return "";
    }

    // Get the current line.
    var returnObj = this.list[this.index];

    // Move to the next line for subsequent calls.
    this.index++;

    // Return the retrieved line.
    return returnObj;
  }
};


// Execute the main program logic.
Main ( );


// Helper function to get the next line using the 'obj' iterator.
function    next ( )   {
  return obj.next ( ) ;
}

// Helper function to get the next line and convert it to an integer.
function    nextInt ( )   {
  return myconv ( next ( ) , 1 ) ;
}

// Helper function to get the next line and split it by spaces into a string array.
function    nextStrArray ( )   {
  return myconv ( next ( ) , 2 ) ; // Splits by half-width space
}

// Helper function to get the next line, split by spaces, and convert to an array of integers.
function    nextIntArray ( )   {
  return myconv ( next ( ) , 4 ) ; // Splits by half-width space and converts to numbers
}

// Helper function to get the next line and split it into an array of characters.
function    nextCharArray ( )   {
  return myconv ( next ( ) , 6 ) ; // Splits by single character
}

// Helper function to check if there are more input lines available.
function    hasNext ( )   {
  return obj.hasNext ( ) ;
}

// Function for standard output (console.log).
function    myout ( t )   {
  console.log ( t ) ; // Prints to standard output
}

// Function for standard error output (console.error).
function    myerr ( t )   {
  console.error ( t ) ; // Prints to standard error output
}


/*
 * myconv function: A versatile conversion utility.
 * It takes an input 'i' and a 'no' parameter to specify the conversion type.
 *
 * Conversion types for 'no':
 *   - 1: Convert input 'i' to an integer.
 *   - 2: Split input 'i' by spaces into a string array.
 *   - 4: Split input 'i' by spaces and convert each element to a number,
 *        resulting in an array of numbers.
 *   - 6: Split input 'i' into an array of individual characters.
 *   - 7: Split input 'i' into individual characters and convert each to a number,
 *        resulting in an array of numbers.
 *   - 8: Join elements of input 'i' (assumed to be an array) with spaces.
 *   - 9: Join elements of input 'i' (assumed to be an array) with newline characters.
 *   - 0: Join elements of input 'i' (assumed to be an array) without any separator.
 *   - Default: If 'no' does not match any known type, return 'i' unchanged.
 *
 * Error handling: If any conversion fails, the original input 'i' is returned.
 */
function    myconv ( i , no )   {
  try  {
    switch  ( no )  {
      case  1 :
        return parseInt ( i ) ;
      case  2 :
        return i.split ( " " ) ;
      case  4 :
        return i.split ( " " ) .map ( ( a ) => Number ( a ) ) ;
      case  6 :
        return i.split ( "" ) ;
      case  7 :
        return i.split ( "" ) .map ( ( a ) => Number ( a ) ) ;
      case  8 :
        return i.join ( " " ) ;
      case  9 :
        return i.join ( "\n" ) ;
      case  0 :
        return i.join ( "" ) ;
      default :
        return i ;
    }
  }
  catch  ( e )  {
    // In case of any error during conversion, return the original input.
    return i ;
  }
}

// The main function where the program's primary logic resides.
function    Main ( )   {
  // Create an array of 10000 elements, each filled with "-1".
  // Then, join these elements with newline characters using myconv.
  var output = myconv ( new Array ( 10000 ) .fill ( "-1" ) , 9 ) ;

  // Print the resulting string to standard output.
  myout ( output ) ;
}