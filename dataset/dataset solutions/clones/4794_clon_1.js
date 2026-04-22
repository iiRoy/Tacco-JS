/*
 * This file contains a JavaScript program designed to solve a specific
 * problem, potentially related to competitive programming or a similar
 * algorithmic challenge.
 *
 * It includes a custom input handling mechanism using `readline`
 * and several utility functions for parsing input and debugging.
 *
 * The core logic is encapsulated within the `Main` function.
 */

// --- Input Handling Setup ---
// This section initializes the input/output streams for reading from stdin
// and writing to stdout, using Node.js's 'readline' module.
var read = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

// Global variables to store processed input lines and the input iterator object.
var obj;
var inLine = []; // Array to accumulate all input lines.

// Event listener for each line of input received.
read.on(
  'line',
  function (input) {
    inLine.push(input); // Add the current line to the input array.
  }
);


// Event listener for when the input stream closes.
// This is where the main processing logic is triggered.
read.on(
  'close',
  function () {
    obj = init(inLine); // Initialize the custom input iterator.
    console.error('\n↑入力 ↓出力'); // Japanese message: "↑Input ↓Output"
    Main(); // Execute the main program logic.
  }
);


/*
 * Utility function to create a deep clone of an object or a Set.
 * Supports cloning Sets and plain JSON-serializable objects.
 *
 * @param {any} obj - The object to be cloned.
 * @returns {any} A deep clone of the input object.
 */
function makeClone(obj) {
  return (obj instanceof Set)
    ? new Set(Array.from(obj)) // If it's a Set, create a new Set from its elements.
    : JSON.parse(JSON.stringify(obj)); // Otherwise, use JSON serialization for deep cloning.
}


// --- Input Parsing Helper Functions ---

// Parses the next input token as an integer.
function nextInt() {
  return myconv(next(), 1);
}

// Parses the next input token as an array of strings (space-separated).
function nextStrArray() {
  return myconv(next(), 2);
}

// Parses the next input token as an array of integers (space-separated).
function nextIntArray() {
  return myconv(next(), 4);
}

// Parses the next input token as an array of characters.
function nextCharArray() {
  return myconv(next(), 6);
}


// Retrieves the next token from the input stream.
function next() {
  return obj.next();
}

// Checks if there are more tokens available in the input stream.
function hasNext() {
  return obj.hasNext();
}


/*
 * Initializes the custom input iterator object.
 * This object provides methods to check for more input and retrieve the next line.
 *
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init(input) {
  return {
    list: input, // The array of input lines.
    index: 0, // Current index for reading input.
    max: input.length, // Total number of input lines.

    // Checks if there are more lines to read.
    hasNext: function () {
      return (this.index < this.max);
    },

    // Retrieves the next line of input and advances the index.
    // Throws an error if no more input is available.
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


// --- Output and Debugging Helper Functions ---

// Prints a value to standard output, followed by a newline.
function myout(s) {
  console.log(s);
}

// Prints a debug message to standard error.
// Uses `util.inspect` for detailed object inspection.
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}


/*
 * Universal input converter function.
 * Converts input `i` based on the specified `no` parameter.
 *
 * @param {string|string[]} i - The input to convert (a string or an array of strings).
 * @param {number} no - Conversion type:
 *   - 1: Parse as integer (parseInt).
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and map to numbers.
 *   - 6: Split string into an array of characters.
 *   - 7: Split string into characters and map to numbers.
 *   - 8: Join array elements with space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements with no character (concatenate).
 *   - default: Return input as is.
 * @returns {any} The converted value.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(' ');
      case 4:
        return i.split(' ').map(Number);
      case 6:
        return i.split('');
      case 7:
        return i.split('').map(Number);
      case 8:
        return i.join(' ');
      case 9:
        return i.join('\n');
      case 0:
        return i.join('');
      default:
        return i;
    }
  } catch (e) {
    // In case of conversion error, return the original input.
    return i;
  }
}

// --- Main Program Logic ---
// This is the entry point for the problem's solution.
function Main() {

  // Read the first line of input as an array of integers.
  var one = nextIntArray();

  // Deconstruct the array into individual variables.
  // These likely represent counts or values for different categories (e.g., 'a', 'o', 't', 'j', 'l', 's', 'z').
  var ai = one[0];
  var ao = one[1];
  var at = one[2];
  var aj = one[3];
  var al = one[4];
  var as = one[5];
  var az = one[6];


  // Calculate `output1`: Sum of even parts of ai, aj, and al.
  // This might represent pairs or blocks of certain items.
  var output1 = Math.floor(ai / 2) * 2
    + Math.floor(aj / 2) * 2
    + Math.floor(al / 2) * 2;


  var output2; // Declare output2 without initialization.


  // Conditional logic to calculate `output2`.
  // This path is taken if there's at least one of 'ai', 'aj', and 'al'.
  if (ai >= 1 && aj >= 1 && al >= 1) {
    // If conditions met, calculate `output2` based on (ai-1), (aj-1), (al-1)
    // and add 3, suggesting a special combination.
    output2 = Math.floor((ai - 1) / 2) * 2
      + Math.floor((aj - 1) / 2) * 2
      + Math.floor((al - 1) / 2) * 2
      + 3;
  }
  else {
    // If conditions not met, `output2` is zero.
    output2 = 0;
  }


  // The final result is the maximum of `output1` and `output2`,
  // plus the value of `ao`.
  myout(Math.max(output1, output2) + ao);
}