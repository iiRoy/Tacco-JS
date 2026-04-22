/*
 * This section contains boilerplate code for input/output handling.
 * You can ignore this part for the main logic of the problem.
 * ----------------------------------------------------------------------------------------------------
 */

// Import the 'readline' module to handle standard input.
var read = require('readline').createInterface(
  {
    input:  process.stdin,   // Set input stream to standard input.
    output: process.stdout   // Set output stream to standard output.
  }
);

// Declare global variables for managing input data.
var obj;         // Object to hold the input processing utility.
var inLine = []; // Array to store each line read from input.

// Event listener for when a line of input is received.
read.on(
  'line',
  function (input) {
    inLine.push(input); // Add the received line to the 'inLine' array.
  }
);

// Event listener for when the input stream is closed.
read.on(
  'close',
  function () {
    // Initialize the input utility object with all collected lines.
    obj = init(inLine);

    // Debugging: Mark the start of the main execution.
    myerr("-----start-----");

    // Record the start time for performance measurement.
    var start = new Date();

    // Call the main function where the problem logic resides.
    Main();

    // Calculate the elapsed time.
    var end = new Date() - start;

    // Debugging: Mark the end of the main execution.
    myerr("----- end -----");
    // Debugging: Log the execution time.
    myerr("time : " + (end) + "ms");
    // Debugging: Log the memory usage.
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
  }
);

// Helper functions for parsing input data.

// Reads the next token and converts it to an integer.
function nextInt() {
  return myconv(next(), 1);
}

// Reads the next token and splits it into an array of strings.
function nextStrArray() {
  return myconv(next(), 2);
}

// Reads the next token, splits it, and converts elements to numbers.
function nextIntArray() {
  return myconv(next(), 4);
}

// Reads the next token and splits it into an array of characters.
function nextCharArray() {
  return myconv(next(), 6);
}

// Retrieves the next raw input token from the utility object.
function next() {
  return obj.next();
}

// Checks if there are more input tokens available.
function hasNext() {
  return obj.hasNext();
}

/**
 * Initializes an object for sequential input processing.
 *
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to access input lines.
 */
function init(input) {
  // Create and return an object with input handling capabilities.
  var returnObj = {
    list: input,             // Store the array of input lines.
    index: 0,                // Current index for accessing the 'list'.
    max: input.length,       // Total number of input lines.

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more input is available, false otherwise.
     */
    hasNext: function () {
      return (this.index < this.max);
    },

    /**
     * Retrieves the next line of input.
     * @returns {string} The next line from the input list.
     * @throws {string} "ArrayIndexOutOfBoundsException" if no more input is available.
     */
    next: function () {
      if (!this.hasNext()) {
        // If no more input, throw an error.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        // Get the current input line.
        var returnInput = this.list[this.index];
        this.index++; // Move to the next index.
        return returnInput; // Return the retrieved line.
      }
    }
  };
  return returnObj;
}

/**
 * Outputs a string to the console.
 * This is the standard output function for problem results.
 * @param {any} s - The value to be printed.
 */
function myout(s) {
  console.log(s);
}

/**
 * Outputs a debug message to the standard error stream.
 * Uses 'util.inspect' for detailed object inspection.
 * @param {any} s - The value to be inspected and printed.
 */
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
 * Utility function for type conversion and string manipulation.
 *
 * [no] parameter specifies the operation:
 *  - Default / Unknown: Returns the input 'i' as is.
 *  - 1: Converts 'i' to an integer.
 *  - 2: Splits 'i' by single spaces into an array of strings.
 *  - 4: Splits 'i' by single spaces and converts each part to a number, returning an array of numbers.
 *  - 6: Splits 'i' into an array of individual characters.
 *  - 7: Splits 'i' into individual characters and converts each character to a number, returning an array of numbers.
 *  - 8: Joins elements of array 'i' with a single space.
 *  - 9: Joins elements of array 'i' with a newline character.
 *  - 0: Joins elements of array 'i' with no separator.
 *
 *  Handles potential errors by returning the input 'i' in case of conversion failure.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:  // Convert to integer.
        return parseInt(i);
      case 2:  // Split by space.
        return i.split(" ");
      case 4:  // Split by space and map to Number.
        return i.split(" ").map(Number);
      case 6:  // Split into characters.
        return i.split("");
      case 7:  // Split into characters and map to Number.
        return i.split("").map(Number);
      case 8:  // Join with space.
        return i.join(" ");
      case 9:  // Join with newline.
        return i.join("\n");
      case 0:  // Join without separator.
        return i.join("");
      default: // Default case, return input as is.
        return i;
    }
  } catch (e) {
    // If any error occurs during conversion, return the original input.
    return i;
  }
}

/*
 * ----------------------------------------------------------------------------------------------------
 * End of boilerplate code.
 * The actual problem-solving logic begins below this line.
 */

/**
 * Main function containing the solution to the problem.
 * Reads an integer N and calculates how many times N must be added to itself
 * until the sum is a multiple of 360.
 */
function Main() {
  // Read the initial integer value N from input.
  var N = nextInt();

  // Initialize a counter for the number of additions.
  var count = 0;

  // Initialize the sum.
  var sum = 0;

  // Loop indefinitely until the condition is met.
  while (true) {
    // Add N to the current sum.
    sum += N;

    // Increment the counter.
    count++;

    // Check if the current sum is perfectly divisible by 360.
    if (sum % 360 == 0) {
      // If it is, output the count.
      myout(count);
      // Exit the function as the solution is found.
      return;
    }
  }
}