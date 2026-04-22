/*
 * This file contains utility functions for competitive programming
 * and the main logic for a specific problem.
 *
 * All functions are designed to handle input/output operations
 * and common data transformations.
 */

// Global object to manage input stream, initialized once.
var obj = init();


// Execute the primary function of the program.
Main();


// Helper function to read the next integer from input.
function nextInt()
{
  return myconv(next(), 1); /* Convert the next input token to an integer. */
}

// Helper function to read the next string array, split by spaces.
function nextStrArray() {
  return myconv(next(), 2); // Splits input by half-width spaces.
}

// Helper function to read the next integer array, split by spaces and parsed.
function nextIntArray() {
  return myconv(next(), 4); /* Splits by space then converts to numbers. */
}

// Helper function to read the next character array.
function nextCharArray() {
  return myconv(next(), 6); // Splits the input string into individual characters.
}

// Retrieves the next token from the input object.
function next() {
  return obj.next();
}

// Checks if there are more tokens available in the input.
function hasNext() {
  return obj.hasNext();
}

/**
 * Reads all input from standard input, trims it, and splits it into lines.
 * @returns {Array<string>} An array of strings, where each string is a line from the input.
 */
function myin()
{
  return require("fs") . readFileSync("/dev/stdin" , "utf8") . trim() . split("\n") ;
}


/*
 * Initializes the input object which manages reading lines and tokens.
 * This function sets up the state for input processing.
 */
function init() {
  var inputFile = myin(); // Read all lines from the input source.

  // The return object holds the input lines, current index, and utility methods.
  var returnObj = {
    "list": inputFile,
    "index": 0,
    "max": inputFile.length,

    // Method to check if more input is available.
    "hasNext": function() {
      return (this.index < this.max);
    },

    // Method to get the next input line.
    "next": function() {
      if (!this.hasNext()) {
        // If no more input, throw an error.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var returnInput = this.list[this.index]; // Get the current line.
        this.index++; // Move to the next line.
        return returnInput; // Return the fetched line.
      }
    }
  };

  return returnObj; // Hand back the fully configured input handler.
}


// Outputs a given value to the standard output stream.
function myout(t) {
  console.log(t); /* Prints to stdout. */
}

// Outputs a given value to the standard error stream.
function myerr(t) {
  console.error(t); // Prints to stderr.
}


/*
 * This function provides various conversion utilities based on the 'no' parameter.
 * It handles different ways of parsing and formatting input data.
 *
 * Conversion types (value of 'no'):
 * - Default / Error: Returns the input 'i' as is.
 * - 1: Converts 'i' to an integer.
 * - 2: Splits 'i' by half-width spaces into an array of strings.
 * - 4: Splits 'i' by half-width spaces and then converts each part to a number.
 * - 6: Splits 'i' into an array of individual characters.
 * - 7: Splits 'i' into individual characters and converts each to a number.
 * - 8: Joins an array 'i' with half-width spaces.
 * - 9: Joins an array 'i' with newline characters.
 * - 0: Joins an array 'i' without any separator.
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
        return i; // Fallback for unknown conversion types.
    }
  } catch (e) {
    // In case of any conversion error, return the original input.
    return i;
  }
}


/*
 * The main entry point of the program.
 * This function contains the core logic to solve the problem.
 * It reads a string, processes it based on specific rules, and prints the result.
 */
function Main() {
  var s = next(); // Read the input string.
  var output = 0; // Initialize the output counter.

  // Loop through each character of the input string.
  for (var i = 0; i < s.length; i++) {
    // Check for even index and not the last character.
    if (i % 2 == 0 && i != s.length - 1) {
      if (s[i] == "g") {
        output++; // Increment output if 'g' is found at an even index.
      }
    } else {
      // For odd indices or the last character if index is even.
      if (s[i] == "p") {
        output--; // Decrement output if 'p' is found.
      }
    }
  }

  myout(output); // Display the final calculated output.
}