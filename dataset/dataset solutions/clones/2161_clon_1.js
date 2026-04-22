/*
 * This JavaScript code processes input from standard input.
 * It's designed to solve a specific algorithmic problem.
 * The script reads lines, performs numerical transformations,
 * and calculates a final output based on a specific logic.
 */

/*
 * Utility for reading input from the standard input stream.
 * It uses Node.js 'fs' module to synchronously read file content.
 */
var input = require("fs")
  .readFileSync("/dev/stdin", "utf8") /* Reads the entire file content from /dev/stdin as UTF-8 */
  .trim()                             /* Removes any leading or trailing whitespace (like a final newline) */
  .split("\n")                        /* Splits the content into an array of strings, one for each line */;


/**
 * @typedef {object} InputBuffer
 * @property {string[]} list - The array containing all input lines.
 * @property {number} index - The current position (index) within the input list.
 * @property {number} max - The total number of lines available in the input list.
 * @property {function(): string} next - A method to retrieve the next line from the input.
 * @property {function(): boolean} hasNext - A method to check if there are more lines to read.
 */
var obj = {

  "list"  : input, /* Stores the array of processed input lines. */

  "index" : 0,     /* Initializes the current reading index to the very beginning of the list. */

  "max"   : input.length, /* Stores the total count of lines for efficient boundary checking. */


  // Defines the 'next' method for the input object.
  // It returns the next available input line and advances the internal index.
  "next"  : function () {
              // First, check if there are any elements left to retrieve.
              if ( !this.hasNext() ) {
                // If not, throw an error indicating no more elements are available.
                throw "NoSuchElementException:次に要素は無いよ"; // Error message indicating no next element.
              }

              // Retrieve the element at the current index.
              var returnObj = this.list[this.index];
              // Increment the index to point to the subsequent element for the next call.
              this.index = this.index + 1;
              // Return the retrieved element.
              return returnObj;
            },


  // Defines the 'hasNext' method for the input object.
  // It checks if there are more elements to be read from the input list.
  "hasNext" : function () {
                // Returns true if the current index is less than the total number of elements.
                return ( this.index < this.max );
              }

}; // End of the input object definition.


// Immediately call the main function to start program execution.
Main();


// Global helper function to retrieve the next input line.
// This delegates to the 'obj.next()' method.
function next() {
  return obj.next();
}


// Global helper function to check for more input lines.
// This delegates to the 'obj.hasNext()' method.
function hasNext() {
  return obj.hasNext();
}


// Function for standard output: prints a value to the console.
function myout ( t ) {
  console.log( t );
}


// Function for standard error output: prints an error value to the console.
function myerr ( t ) {
  console.error( t );
}


/*
 * This 'myconv' function provides a versatile way to convert or manipulate input data.
 * It takes an input 'i' and a conversion mode 'no'.
 *
 * Detailed Conversion Modes ('no' parameter):
 * ------------------------------------------
 *  - Default (or any unhandled 'no'): Returns the input 'i' without modification.
 *  - 1: Attempts to parse 'i' as an integer using `parseInt()`.
 *  - 2: Splits the string 'i' into an array of substrings using a single space (" ") as a delimiter.
 *  - 4: Splits the string 'i' by spaces, then maps each resulting substring to a `Number` type,
 *       returning an array of numbers.
 *  - 6: Splits the string 'i' into an array of individual characters.
 *  - 7: Splits the string 'i' into an array of individual characters, then maps each character
 *       to a `Number` type, returning an array of numbers.
 *  - 8: Assumes 'i' is an array and joins its elements into a single string, separated by spaces.
 *  - 9: Assumes 'i' is an array and joins its elements into a single string, separated by newline characters.
 *  - 0: Assumes 'i' is an array and joins its elements into a single string, with no separator.
 *
 * Error Handling:
 *   If any operation within the 'try' block throws an exception (e.g., calling `split` on a non-string
 *   when 'no' expects a string, or `join` on a non-array), the original input 'i' is returned.
 */
function myconv ( i, no ) {
  try {
    switch ( no ) {
      case 1: // Convert to integer.
        return parseInt( i );
      case 2: // Split string by space.
        return i.split( " " );
      case 4: // Split by space and convert parts to numbers.
        return i.split( " " ).map( ( a ) => Number( a ) );
      case 6: // Split string into individual characters.
        return i.split( "" );
      case 7: // Split into characters and convert each to a number.
        return i.split( "" ).map( ( a ) => Number( a ) );
      case 8: // Join array elements with spaces.
        return i.join( " " );
      case 9: // Join array elements with newlines.
        return i.join( "\n" );
      case 0: // Join array elements without any separator.
        return i.join( "" );
      default: // Default case: return input as is.
        return i;
    }
  } catch ( e ) {
    // If an error occurs during conversion, return the original input 'i'.
    return i;
  }
}

/**
 * The primary function that orchestrates the program's logic.
 * It reads input, performs a specific calculation involving
 * digit manipulation and carries, then outputs the final result.
 */
function Main () {

  // Read the next line of input and convert it to an array of numbers.
  // Conversion mode 7 means: split by character, then map each to a Number.
  var list = myconv( next(), 7 );

  // Store the length of the resulting numeric list for loop iteration.
  var len = list.length;

  // Initialize the accumulator for the final output value.
  var output = 0;

  // Iterate through the list from the last element to the first.
  for ( var i = len - 1; i >= 0; i-- ) {

    // Check if the current digit requires a "carry-over" operation (i.e., if it's 6 or greater).
    if ( list[i] >= 6 ) {

      // If it's 6 or greater, add its "complement to 10" to the output.
      // E.g., if list[i] is 7, add (10 - 7 = 3) to output.
      output = output + ( 10 - list[i] );

      // Reset the current digit to 0, as its value has been processed and carried.
      list[i] = 0;

      // If this is not the very first digit in the list...
      if ( i !== 0 ) {
        // ...increment the previous digit to simulate a carry.
        list[i - 1] = list[i - 1] + 1;
      } else {
        // If it *is* the first digit and a carry is needed,
        // increment the overall output directly as there's no preceding digit.
        output = output + 1;
      }

    } else {
      // If the digit is less than 6 (no carry needed), simply add its value to the output.
      output = output + list[i];
    }

  } // End of the for loop iterating through the list.

  // Output the final calculated result using the custom output function.
  myout( output );

} // End of the Main function.