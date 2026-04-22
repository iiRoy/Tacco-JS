/*
 * This is a utility script for competitive programming.
 * It handles input parsing and output operations, providing helper functions.
 */

// Global object for managing input stream.
var   obj   =   init ( ) ;

// Start the main program execution flow.
Main ( ) ;


/**
 * Helper function to read the next line from input and convert it to an integer.
 * This is useful for single integer inputs per line.
 * @returns {number} The integer value read from the input.
 */
function nextInt() {
  return myconv(next(), 1);
}


/*
 * Helper function to read the next line from input,
 * splitting it by half-width spaces into an array of strings.
 * This is ideal for lines containing multiple string tokens.
 */
function nextStrArray() {
  return myconv(next(), 2); // Conversion type 2: split by space
}


/**
 * Reads the next line from the input and converts it into an array of numbers.
 * The input line is expected to have numbers separated by half-width spaces.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray() {
  return myconv(next(), 4); // Conversion type 4: split by space and parse to int
}


// Reads the next line of input and splits it into an array of individual characters.
function nextCharArray() {
  return myconv(next(), 6); // Conversion type 6: split into characters
}


/**
 * Retrieves the raw next line from the initialized input object.
 * This function directly interacts with the input stream's 'next' method.
 * @returns {string} The next available line of input.
 */
function next()
{
  return obj.next();
}


/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext()
{
  return obj.hasNext();
}


/*
 * Function to read all standard input.
 * It uses Node.js 'fs' module to synchronously read from '/dev/stdin'.
 * The input is trimmed of leading/trailing whitespace and then split by newlines.
 * @returns {string[]} An array where each element is a line from the input.
 */
function myin() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}


/**
 * Initializes the input handling object.
 * This object provides methods to sequentially access lines of input.
 * It stores all input lines in a list and maintains a current index.
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function init() {
  var inputFile = myin(); // Read all input lines
  var returnObj = {
    "list": inputFile, // Array of all input lines
    "index": 0, // Current position in the input array
    "max": inputFile.length, // Total number of input lines

    // Method to check if there are more lines to read
    "hasNext": function() {
      return (this.index < this.max);
    },

    // Method to get the next line from input
    "next": function() {
      if (!this.hasNext()) {
        return ""; // Return an empty string if no more input is available
      } else {
        var returnInput = this.list[this.index];
        this.index++; // Advance the index for the next call
        return returnInput;
      }
    }
  };
  return returnObj; // Return the initialized input object
}


// Function for standard console output.
// It simply logs the provided argument 't' to the console.
function myout(t) {
  console.log(t);
}


// Function for standard error output.
// It logs the provided argument 't' to the console's error stream.
function myerr(t) {
  console.error(t);
}


/*
 * myconv: A versatile conversion utility function.
 * It performs various data transformations based on the 'no' parameter.
 *
 * Parameter 'i': The input data to be converted (can be string or array).
 * Parameter 'no': An integer specifying the type of conversion to perform.
 *
 * Conversion types:
 *   - Default / Unknown / Error: Returns 'i' unchanged.
 *   - 1: Converts 'i' to an integer using parseInt().
 *   - 2: Splits string 'i' by a single space (" ") into a string array.
 *   - 4: Splits string 'i' by space, then maps each element to a Number().
 *   - 6: Splits string 'i' into an array of individual characters.
 *   - 7: Splits string 'i' into characters, then maps each to a Number().
 *   - 8: Joins array 'i' elements with a single space (" ").
 *   - 9: Joins array 'i' elements with a newline character ("\n").
 *   - 0: Joins array 'i' elements without any separator (empty string).
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map((a) => Number(a));
      case 6:
        return i.split("");
      case 7:
        return i.split("").map((a) => Number(a));
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  } catch (e) {
    // If any error occurs during conversion, return the original input 'i'.
    return i;
  }
}


/**
 * The main function where the problem's logic resides.
 * This function orchestrates reading input, performing calculations, and outputting the result.
 */
function Main ( ) {
  // Read the first line of input, which contains N and T, as an array of integers.
  var one = nextIntArray ( ) ;
  var N = one [ 0 ] ; // Extract N (number of items) from the first element.
  var T = one [ 1 ] ; // Extract T (time duration) from the second element.

  // Read the next line, which contains the list of times, as an array of integers.
  var list = nextIntArray ( ) ;
  var output = 0 ; // Initialize the variable to store the final calculated output.

  // Loop through the list of times, starting from the second element (index 1).
  for ( var i = 1 ; i < N ; i ++ ) {
    // Calculate the time difference between the current item and the previous one.
    var timeDifference = list [ i ] - list [ i - 1 ] ;

    // Check if the calculated time difference exceeds the maximum allowed duration T.
    if ( timeDifference > T ) {
      // If it exceeds, only add T to the total output.
      output += T ;
    } else {
      // Otherwise, add the actual time difference to the total output.
      output += timeDifference ;
    }
  }

  // After the loop, add the final duration T.
  // This accounts for the last event's duration or a fixed ending period.
  output += T ;

  // Output the final calculated value using the custom output function.
  myout ( output ) ;
}