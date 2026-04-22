// This section initializes the standard input/output interface.
// It's a common setup for reading input in Node.js environments,
// particularly for competitive programming challenges.
var read = require('readline').createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);


// Declare global variables for managing input data.
var obj;
var inLine = []; // This array will store each line read from standard input.


// Register an event listener to capture each line of input.
// Every time a line is received, it's pushed into the 'inLine' array.
read.on('line', function (input) {
  inLine.push(input);
});


// Register an event listener for when the input stream closes.
// This signifies that all input has been received.
read.on('close', function () {

  // Once all lines are collected, initialize the custom input handler object.
  obj = init(inLine);

  // Output a debug message to stderr.
  // This is often used in competitive programming to visually separate
  // debug output from the actual program output.
  console.error('\n↑入力 ↓出力');

  // After setup, execute the main logic of the program.
  Main();

});


/**
 * Creates a deep clone of an object.
 * It handles Set objects specifically, creating a new Set from the elements.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 *
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep clone of the input object.
 */
function makeClone(obj) {
  return ( obj instanceof Set )
    ? new Set(Array.from(obj))
    : JSON.parse(JSON.stringify(obj));
}


// --- Input Reading Helper Functions ---

// Reads the next available input item and parses it as an integer.
function nextInt() {
  return myconv(next(), 1);
}

// Reads the next available input item and splits it into an array of strings by space.
function nextStrArray() {
  return myconv(next(), 2);
}

// Reads the next available input item, splits it by space, and converts each part to a number.
function nextIntArray() {
  return myconv(next(), 4);
}

// Reads the next available input item and splits it into an array of characters.
function nextCharArray() {
  return myconv(next(), 6);
}


// Retrieves the next raw input line from the custom input object.
function next() {
  return obj.next();
}

// Checks if there are more input lines available.
function hasNext() {
  return obj.hasNext();
}


/**
 * Initializes a custom input stream object.
 * This object provides methods to sequentially access lines from a predefined list.
 *
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object containing the list of inputs, current index, maximum length,
 *                   and methods to check for more input (`hasNext`) and get the next item (`next`).
 */
function init(input) {

  return {
    list:    input,
    index:   0,
    max:     input.length, // Total number of input lines.

    hasNext: function () {
      // Checks if the current index is within the bounds of the input list.
      return ( this.index < this.max );
    },

    next:    function () {
      // Retrieves the current line and increments the index.
      if ( this.hasNext() ) {
        return this.list[this.index++];
      } else {
        // Throws an error if there's an attempt to read beyond available input.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };

}


// Outputs a string 's' to the standard output console, followed by a newline.
function myout(s) {
  console.log(s);
}


// Outputs debug information to the standard error console.
// It uses Node.js's 'util.inspect' to provide a detailed string representation of 's'.
function myerr(s) {
  console.error(
    'debug:' + require('util').inspect(s, false, null)
  );
}


/*
 * This versatile function performs various conversions on input 'i' based on the 'no' parameter.
 * It acts as a central dispatcher for common parsing and formatting tasks.
 *
 * Parameter "no" mapping:
 * - 1: Parses input 'i' as an integer using `parseInt()`.
 * - 2: Splits input string 'i' by spaces into an array of strings.
 * - 4: Splits input string 'i' by spaces and then maps each resulting string to a Number.
 * - 6: Splits input string 'i' into an array of individual characters.
 * - 7: Splits input string 'i' into characters and then maps each character to a Number.
 * - 8: Joins an array 'i' of strings with a single space character as a separator.
 * - 9: Joins an array 'i' of strings with a newline character ('\n') as a separator.
 * - 0: Joins an array 'i' of strings with no separator (concatenates them).
 * - Default/Other: If 'no' does not match any defined case, the original input 'i' is returned unchanged.
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
        return i; // Return input as is for unknown 'no' values.
    }
  } catch (e) {
    // In case of any error during conversion, return the original input 'i'.
    // This provides a fallback mechanism.
    return i;
  }
}


// --- End of utility and boilerplate code ---


/**
 * The main function containing the core logic of the program.
 * It reads an integer N, then iterates through pairs (i, j)
 * and compares their binary representations to generate an output.
 */
function Main() {

  // Read the integer N from the input stream.
  var N = nextInt();

  // Initialize an empty array to store the results before final output.
  var output = [];

  // Outer loop: iterates from 0 up to N-2.
  for (var i = 0; i < N - 1; i++) {

    // Middle loop: iterates from (i+1) up to N-1.
    // This ensures that j is always greater than i, processing unique pairs.
    for (var j = i + 1; j < N; j++) {

      // Inner loop: iterates 10 times (for bits 0 through 9).
      // This is likely checking the first 10 bits of the numbers i and j.
      for (var k = 0; k < 10; k++) {

        // Check if the k-th bit of 'i' is different from the k-th bit of 'j'.
        // The expression `(value >> k & 1)` extracts the k-th bit (0 or 1).
        if ( ( i >> k & 1 ) != ( j >> k & 1 ) ) {

          // If the bits are different, add (k+1) to the output array.
          // (k+1) is used instead of k, possibly for 1-based indexing in the problem.
          output.push(k + 1);

        }

      }

    }

  }

  // After processing all pairs, convert the 'output' array into a newline-separated string
  // using `myconv` with mode 9, and then print it to standard output.
  myout(myconv(output, 9));

}