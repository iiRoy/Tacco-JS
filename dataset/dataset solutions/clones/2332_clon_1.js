/*
 * This JavaScript code snippet is designed for competitive programming.
 * It includes a set of utility functions for input/output handling
 * and a main function that implements the core logic for a specific problem.
 * This file has been extensively modified for whitespace and comments
 * to demonstrate a Type I code clone.
 */
var    read    = require   (  'readline'   )
    .createInterface
  (
    {
       input : process.stdin
      ,output : process.stdout
    }
  )
; // End of readline interface creation

var obj  ; // Global object to store parsed input, initialized later.
var inLine = [ ] ; // Array to hold raw input lines as they are read.

read.on ( 'line' , function ( input ) {
    inLine.push(input);
  }
) ; // Event listener for each line of input, pushing it to inLine array.

read.on ( 'close' , function ( ) {
  // This block executes once the input stream has completely closed.
  obj = init(inLine); // Initialize the input parser object with all collected lines.
  console.error ( '\n' ) ; // Print a newline to stderr for visual separation in console output.

  var start = Date.now ( ) ; // Record the current timestamp to measure execution time.

  Main ( ) ; // Execute the main logic of the program, which solves the problem.

  var end = Date.now ( ) - start ; // Calculate the elapsed time in milliseconds.

  myerr ( 'time : ' + end + 'ms' ) ; // Log the execution time to standard error.
  myerr ( 'memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB' ) ; // Log memory usage statistics.
} ) ; // End of 'close' event handler for the readline interface.

// Utility function to create a deep clone of an object or a Set.
// It handles Sets specifically to ensure proper cloning, otherwise uses JSON serialization.
function makeClone ( obj ) {
  return ( obj instanceof Set )
           ? new Set ( Array.from ( obj ) ) // If it's a Set, create a new Set from its elements.
           : JSON.parse ( JSON.stringify ( obj ) ) // Otherwise, use JSON stringify/parse for deep cloning.
         ; // The ternary operator provides a concise way to handle two cases.
}

// Helper functions to retrieve the next input item in various processed formats.
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ; // Get next raw input, then convert to integer.
}

function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ; // Get next raw input, then split into string array.
}

function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ; // Get next raw input, split, then convert to integer array.
}

function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ; // Get next raw input, then split into character array.
}

// Core functions for iterating through the input data.
function next ( ) {
  return obj.next ( ) ; // Retrieves the next line from the initialized input object.
}

function hasNext ( ) {
  return obj.hasNext ( ) ; // Checks if there are more lines available in the input.
}

/**
 * Initializes an input parser object from an array of lines.
 * This object provides methods to check for next input and retrieve it sequentially.
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object containing the input list, current index, maximum length,
 *                   and utility methods `hasNext` and `next`.
 */
function init ( input )
{
  return {
    list : input , // Stores the original array of input lines.
    index : 0 , // The current zero-based index for reading from the 'list'.
    max : input.length , // The total number of lines in the input array.

    hasNext : function ( ) {
      return ( this.index < this.max ) ; // Checks if the current index is within bounds of the input list.
    } ,

    next : function ( ) {
      if ( this.hasNext ( ) ) {
        return this.list [ this.index++ ] ; // Returns the current line and then increments the index.
      }
      else
      {
        // If no more input lines are available, an exception is thrown.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ; // End of the input object literal definition.
}

// Custom output function for writing to standard output.
function myout ( s ) {
  console.log ( s ) ; // Simply logs the provided argument to the console.
}

// Custom error/debug output function, writing to standard error.
// It uses Node.js's 'util.inspect' for detailed object logging.
function myerr ( s ) {
  console.error ( 'debug:' + require ( 'util' ).inspect ( s , false , null ) ) ; // Prefixes with 'debug:' and inspects the object.
}

/*
 * This is a versatile conversion function, handling various input parsing and joining tasks.
 * The 'no' parameter acts as a switch to determine the specific conversion logic:
 *   - If 'no' is unknown or an outlier value, 'i' is returned without modification.
 *   - Case 1: Parses 'i' as an integer using `parseInt`.
 *   - Case 2: Splits the string 'i' by space characters into an array of strings.
 *   - Case 4: Splits 'i' by space, then maps each resulting string to a number using `Number`.
 *   - Case 6: Splits 'i' into an array of individual characters.
 *   - Case 7: Splits 'i' into an array of characters, then maps each character to a number.
 *   - Case 8: Joins elements of array 'i' with a single space character.
 *   - Case 9: Joins elements of array 'i' with a newline character ('\n').
 *   - Case 0: Joins elements of array 'i' with no character (concatenates them directly).
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ; // Convert to integer.
      case 2 :
        return i.split ( ' ' ) ; // Split by space.
      case 4 :
        return i.split ( ' ' ).map ( Number ) ; // Split by space and convert to numbers.
      case 6 :
        return i.split ( '' ) ; // Split into characters.
      case 7 :
        return i.split ( '' ).map ( Number ) ; // Split into characters and convert to numbers.
      case 8 :
        return i.join ( ' ' ) ; // Join array elements with space.
      case 9 :
        return i.join ( '\n' ) ; // Join array elements with newline.
      case 0 :
        return i.join ( '' ) ; // Join array elements without separator.
      default :
        return i ; // Default case: return input as is.
    }
  }
  catch ( e )
  {
    // If any error occurs during the conversion process, the original input 'i' is returned.
    return i ;
  }
}

// This marks the end of the common utility functions.
// Below is the main program logic, specific to the problem being solved.
function Main ( )
{
  var N = nextInt ( ) ; // Read the first integer from input, which represents N.
  var list = nextIntArray ( ) ; // Read the next line as an array of integers.
  var output = 0 ; // Initialize a counter to store the number of elements that do not match the sequence.
  var now = 1 ; // Initialize 'now' to 1, representing the expected number in the sequence (1, 2, 3...).

  // Iterate through the 'list' array from index 0 up to N-1.
  for ( var i = 0 ; i < N ; i++ )
  {
    // Check if the current element in the list matches the 'now' value.
    if ( list [ i ] == now )
    {
      now++ ; // If it matches, increment 'now' to expect the next number in the sequence.
    }
    else
    {
      output++ ; // If it does not match, increment the 'output' counter.
    }
  }

  // After iterating through the entire list, determine the final result.
  // If 'output' is equal to N, it means no element in the list matched the increasing sequence,
  // so the result is -1. Otherwise, the result is the value of 'output'.
  myout ( ( output == N ) ? -1 : output ) ;
}