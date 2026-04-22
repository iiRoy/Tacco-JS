/*
 * This section handles input/output operations and utility functions.
 * It's generally boilerplate for competitive programming setups.
 */
// Start of the auxiliary code block.
// This part is for setting up the environment and should not be modified by the main logic.
var read = require('readline').createInterface(
  {
    input:  process.stdin,    // Standard input stream for reading data
    output: process.stdout    // Standard output stream for writing data
  }
);

// Declare variables to hold the processed input object and raw input lines.
var obj;
var inLine = [];

// Event listener for each line of input received.
read.on(
  'line',
  function (input) {
    inLine.push(input); // Store each input line in the 'inLine' array.
  }
);

// Event listener for when the input stream closes.
read.on(
  'close',
  function () {
    // Initialize the input object with all collected lines.
    obj = init(inLine);

    // Output a newline to stderr for visual separation in debug logs.
    console.error('\n');

    // Record the start time of the main execution.
    var start = Date.now();

    // Call the main function where the problem-solving logic resides.
    Main();

    // Calculate the elapsed time for Main() execution.
    var end = Date.now() - start;

    // Log the execution time to stderr.
    myerr('time : ' + end + 'ms');

    // Log the memory usage to stderr.
    myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
  }
);


/*
 * Helper function to create a deep clone of an object.
 * Supports Set objects specifically, otherwise uses JSON serialization.
 */
function makeClone(obj) {
  // Check if the object is an instance of Set.
  // If it is, create a new Set from its elements.
  // Otherwise, use JSON.parse(JSON.stringify(obj)) for a deep copy.
  return (obj instanceof Set)
           ? new Set(Array.from(obj))
           : JSON.parse(JSON.stringify(obj));
}


/*
 * Functions for parsing different types of input from the 'obj' input stream.
 * These functions wrap 'myconv' for specific parsing needs.
 */
function nextInt() {
  return myconv(next(), 1); // Reads next token and converts to integer.
}

function nextStrArray() {
  return myconv(next(), 2); // Reads next token and splits by space into string array.
}

function nextIntArray() {
  return myconv(next(), 4); // Reads next token, splits by space, and converts to integer array.
}

function nextCharArray() {
  return myconv(next(), 6); // Reads next token and splits into character array.
}

function next() {
  return obj.next();    // Retrieves the next token from the input object.
}

function hasNext() {
  return obj.hasNext(); // Checks if there are more tokens available in the input.
}


/*
 * Initializes the input object structure with methods to navigate through input lines.
 * @param {Array<string>} input - An array of raw input strings.
 * @returns {object} An object with methods to access input tokens.
 */
function init(input) {
  return {
    list:  input,           // The array holding all input lines.
    index: 0,               // Current index for reading input lines.
    max:   input.length,    // Total number of input lines.

    /**
     * Checks if there are more input lines to read.
     * @returns {boolean} True if more input exists, false otherwise.
     */
    hasNext: function () {
      return (this.index < this.max);
    },

    /**
     * Retrieves the next input line and advances the index.
     * @returns {string} The next input line.
     * @throws {string} If no more input lines are available.
     */
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        // Error message for out-of-bounds access.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


/*
 * Outputs a string to the standard console.
 * @param {string} s - The string to be printed.
 */
function myout(s) {
  console.log(s);
}


/*
 * Outputs a debug message to the standard error console.
 * Uses 'util.inspect' for detailed object inspection.
 * @param {any} s - The data to be debugged.
 */
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}


/*
 * Universal conversion function based on a 'no' parameter.
 * This function handles various input parsing and joining operations.
 * @param {any} i - The input to be converted or joined.
 * @param {number} no - The conversion type indicator.
 * @returns {any} The converted or joined result.
 */
// Parameter "no" defines the conversion type:
// unknown or outlier : return original input 'i'.
// 1 : parseInt(i) - converts string to integer.
// 2 : i.split(' ') - splits string by space into an array of strings.
// 4 : i.split(' ').map(Number) - splits by space and converts each part to a number.
// 6 : i.split('') - splits string into an array of individual characters.
// 7 : i.split('').map(Number) - splits by character and converts each character to a number.
// 8 : i.join(' ') - joins array elements with spaces.
// 9 : i.join('\n') - joins array elements with newlines.
// 0 : i.join('') - joins array elements without any separator.
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i); // Convert to integer.
      case 2:
        return i.split(' '); // Split string by spaces.
      case 4:
        return i.split(' ').map(Number); // Split by spaces and map to numbers.
      case 6:
        return i.split(''); // Split string into individual characters.
      case 7:
        return i.split('').map(Number); // Split by characters and map to numbers.
      case 8:
        return i.join(' '); // Join array elements with spaces.
      case 9:
        return i.join('\n'); // Join array elements with newlines.
      case 0:
        return i.join(''); // Join array elements without a separator.
      default:
        return i; // Default case: return the input as is.
    }
  } catch (e) {
    return i; // In case of any error during conversion, return original input.
  }
}

// End of the auxiliary code block.
// Don't have to see. end------------------------------------------


/**
 * Main function containing the core logic to solve the problem.
 * It reads N and K, calculates a sum based on combinations, and outputs the result modulo a large prime.
 */
function Main() {
  // Read the first line of input as an array of integers.
  var one = nextIntArray();

  // Extract N from the first element of the array.
  var N = one[0];

  // Extract K from the second element of the array.
  var K = one[1];

  // Define the modulo value for calculations.
  var mod = 1000000007;

  // Initialize the output variable.
  var output = 0;

  // Loop from K up to N + 1 (inclusive).
  // 'i' represents the number of elements chosen for a segment.
  for (var i = K; i <= N + 1; i++) {
    // Calculate the minimum possible sum for 'i' elements.
    // This is the sum of an arithmetic progression from 0 to i-1.
    // min = 0 + 1 + ... + (i-1) = i * (i - 1) / 2
    var min = i * (i - 1) / 2;

    // Calculate the maximum possible sum for 'i' elements.
    // This is the sum of an arithmetic progression from N-i+1 to N.
    // max = N + (N-1) + ... + (N-i+1)
    // Alternatively, it can be seen as (sum of i largest numbers up to N)
    // or (sum of i numbers from 0 to N-1) where each number is shifted by (N - (i-1) - 1)
    // Simplified: (N * i) - (sum of first i-1 numbers starting from 0)
    // max = N * i - (0 + 1 + ... + (i-1)) = N * i - min
    var max = N * i - min;

    // The number of possible sums for 'i' elements is (max - min + 1).
    // Add this count to the total output.
    output += max - min + 1;

    // Apply modulo operation to keep the output within bounds.
    output %= mod;
  }

  // Print the final calculated output.
  myout(output);
}