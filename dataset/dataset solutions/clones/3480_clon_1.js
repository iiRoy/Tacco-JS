/* This section contains utility functions for input/output processing.
 * It's generally boilerplate code for competitive programming environments.
 * You might not need to inspect this part closely for the main logic.
 */
var  read  =  require ( 'readline' ) . createInterface (
  {
    input  :  process . stdin ,
    output :  process . stdout
  }
) ;


var    obj    ;
var    inLine    =    [ ] ;


// Event listener for each line of input received.
read . on ( 'line' , function ( input ) {
  inLine . push ( input ) ;
} ) ;


// Event listener for when the input stream closes.
read . on ( 'close' , function ( ) {

  // Initialize the input object with all collected lines.
  obj  =  init ( inLine ) ;

  // Print a newline to stderr for visual separation in debug output.
  console . error ( "\n" ) ;

  // Record the start time for performance measurement.
  var start  =  Date . now ( ) ;

  // Execute the main program logic.
  Main ( ) ;

  // Calculate the elapsed time since 'start'.
  var end  =  Date . now ( )  -  start ;

  // Output execution time to standard error.
  myerr ( "time : "  +  ( end )  +  "ms" ) ;

  // Output memory usage to standard error, rounded to KB.
  myerr ( "memory : "  +  Math . round ( process . memoryUsage ( ) . heapTotal  /  1024 )  +  "KB" ) ;

} ) ;


/**
 * Creates a deep clone of an object using JSON serialization and deserialization.
 * This method is simple but has limitations (e.g., loses functions, Date objects, etc.).
 *
 * @param {object} obj - The object to be deeply cloned.
 * @returns {object} A new object that is a deep copy of the original.
 */
function makeClone ( obj ) {
  return JSON . parse ( JSON . stringify ( obj ) ) ;
}


/*
 * Helper functions to retrieve different types of input from the initialized 'obj'.
 * Each function calls 'next()' to get the raw string input and then uses 'myconv()'
 * with a specific type code for conversion.
 */

function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
}

function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
}

function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
}


function next ( ) {
  return obj . next ( ) ;
}

function hasNext ( ) {
  return obj . hasNext ( ) ;
}


/**
 * Initializes an input reader object that provides methods to consume input lines.
 * This creates a stateful reader for sequential access to input.
 *
 * @param {Array<string>} input - An array where each element is a line of input.
 * @returns {object} An object containing the input list, current index, max length,
 *                   and methods to check for and retrieve the next input line.
 */
function init ( input ) {
  return {
    list  :  input ,             // The complete list of input lines.
    index :  0 ,                 // The current zero-based index for reading.
    max   :  input . length ,    // The total number of input lines.

    /**
     * Checks if there are more lines available to read from the input list.
     * @returns {boolean} True if the current index is less than the total number of lines, false otherwise.
     */
    hasNext : function ( ) {
      return ( this . index  <  this . max ) ;
    } ,

    /**
     * Retrieves the next line of input and increments the internal index.
     * Throws an error if no more input is available.
     * @returns {string} The string content of the next input line.
     * @throws {string} "ArrayIndexOutOfBoundsException ‚There is no more input" if attempting to read past the end.
     */
    next : function ( ) {
      if ( this . hasNext ( ) ) {
        return this . list [ this . index ++ ] ;
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input" ;
      }
    }
  } ;
}


/**
 * Prints a given message or value to standard output, followed by a newline.
 * This is a wrapper around `console.log`.
 *
 * @param {*} s - The value to be printed. It can be a string, number, object, etc.
 */
function myout ( s ) {
  console . log ( s ) ;
}


/**
 * Prints a debug message to standard error.
 * Utilizes Node.js's `util.inspect` to provide detailed object representation.
 *
 * @param {*} s - The value to be debugged and printed.
 */
function myerr ( s ) {
  console . error ( "debug:"  +  require ( "util" ) . inspect ( s , false , null ) ) ;
}


/*
 * This function performs various type conversions or array manipulations on input data.
 * The behavior is controlled by the 'no' parameter, acting as a command code.
 *
 * Detailed mapping of the 'no' parameter:
 *   - Default (unknown or outlier 'no'): Returns the input 'i' as is, without modification.
 *   - 1: Parses 'i' into an integer using `parseInt()`.
 *   - 2: Splits string 'i' into an array of strings, using a space (" ") as the delimiter.
 *   - 4: Splits string 'i' by space and then converts each resulting string part into a Number.
 *   - 6: Splits string 'i' into an array of single-character strings.
 *   - 7: Splits string 'i' into an array of single-character strings and then converts each to a Number.
 *   - 8: Joins the elements of array 'i' into a single string, separated by spaces.
 *   - 9: Joins the elements of array 'i' into a single string, with each element separated by a newline character.
 *   - 0: Joins the elements of array 'i' into a single string, with no separator.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case  1 :
        return parseInt ( i ) ;

      case  2 :
        return i . split ( " " ) ;

      case  4 :
        return i . split ( " " ) . map ( Number ) ;

      case  6 :
        return i . split ( "" ) ;

      case  7 :
        return i . split ( "" ) . map ( Number ) ;

      case  8 :
        return i . join ( " " ) ;

      case  9 :
        return i . join ( "\n" ) ;

      case  0 :
        return i . join ( "" ) ;

      default :
        return i ;
    }
  } catch ( e ) {
    // In case of any conversion error, simply return the original input 'i'.
    return i ;
  }
}

/* End of utility section. The main program logic follows below. */

/**
 * The Main function serves as the entry point for the program's core logic.
 * It is called after all input processing utilities have been initialized.
 * This particular implementation prints a series of predefined outputs.
 */
function Main ( ) {

  // First output: a simple string "Yes".
  myout ( "Yes" ) ;

  // Second output: the integer 4.
  myout ( 4 ) ;

  // Third output: a string representing a space-separated sequence.
  myout ( "3 1 2 3" ) ;

  // Fourth output: another specific string sequence.
  myout ( "3 1 4 5" ) ;

  // Fifth output: yet another string sequence.
  myout ( "3 2 4 6" ) ;

  // Final output: the last string sequence for this execution.
  myout ( "3 3 5 6" ) ;

}