/*
 * This section handles the input/output setup.
 * It uses the 'readline' module to process lines from standard input.
 * The core logic is encapsulated within the 'Main' function.
 */

var read = require('readline')
  .createInterface(
    {
      input:  process.stdin,
      output: process.stdout
    }
  );

// Global variables for storing parsed input and managing the input stream.
var obj;
var inLine = [];

// Event listener for each line of input received.
read.on('line',
  function (input) {
    // Pushes the received input line into the inLine array.
    inLine.push(input);
  }
);

// Event listener for when the input stream is closed.
read.on('close',
  function () {
    // Initializes the 'obj' reader object with all collected input lines.
    obj = init(inLine);

    // Displays a debug message indicating the direction of I/O.
    console.error('\n↑入力 ↓出力');

    // Invokes the primary application logic.
    Main();
  }
);

/**
 * Creates a deep clone of an object.
 * Handles Sets specifically, otherwise uses JSON serialization for generic objects.
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone( obj )
{
  // Check if the object is an instance of Set.
  return (obj instanceof Set)
    ? new Set(Array.from(obj)) // If it's a Set, create a new Set from its elements.
    : JSON.parse(JSON.stringify(obj)); // Otherwise, use JSON stringify/parse for deep cloning.
}

/**
 * Reads the next integer from the input stream.
 * @returns {number} The next integer.
 */
function nextInt() {
  return myconv(next(), 1);
}

/**
 * Reads the next line as a string array, split by spaces.
 * @returns {string[]} An array of strings.
 */
function nextStrArray() {
  return myconv(next(), 2);
}

/**
 * Reads the next line as an integer array, split by spaces.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray() {
  return myconv(next(), 4);
}

/**
 * Reads the next line as a character array.
 * @returns {string[]} An array of characters.
 */
function nextCharArray() {
  return myconv(next(), 6);
}

/**
 * Retrieves the next item from the input stream.
 * @returns {string} The next raw input string.
 */
function next() {
  return obj.next();
}

/**
 * Checks if there are more items in the input stream.
 * @returns {boolean} True if there's more input, false otherwise.
 */
function hasNext() {
  return obj.hasNext();
}

/**
 * Initializes the input reader object.
 * @param {string[]} input An array of input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function init(input) {
  return {
    list:  input, // The array containing all input lines.
    index: 0,     // Current position in the input array.
    max:   input.length, // Total number of input lines.

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more input exists, false otherwise.
     */
    hasNext: function () {
      return (this.index < this.max);
    },

    /**
     * Retrieves the next line of input.
     * @returns {string} The next input line.
     * @throws {string} If there is no more input.
     */
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Outputs a string to the console, followed by a newline.
 * @param {string} s The string to output.
 */
function myout(s) {
  console.log(s);
}

/**
 * Outputs a debug message to standard error.
 * Uses 'util.inspect' for detailed object inspection.
 * @param {any} s The object/value to debug.
 */
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}

/*
 * This comment block describes the 'no' parameter for the 'myconv' function.
 * It defines various conversion modes based on the integer value of 'no'.
 *
 * Mode Definitions for 'no' parameter:
 *   - 1: Parses the input string as an integer (using parseInt).
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits the input string by spaces and converts each part to a number.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits the input string into characters and converts each to a number.
 *   - 8: Joins an array of strings with spaces.
 *   - 9: Joins an array of strings with newline characters.
 *   - 0: Joins an array of strings with no separator.
 *   - Default (or unknown/outlier): Returns the input 'i' unchanged.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i); // Convert to integer.
      case 2:
        return i.split(' '); // Split by space into string array.
      case 4:
        return i.split(' ').map(Number); // Split by space and map to numbers.
      case 6:
        return i.split(''); // Split into character array.
      case 7:
        return i.split('').map(Number); // Split into characters and map to numbers.
      case 8:
        return i.join(' '); // Join array with spaces.
      case 9:
        return i.join('\n'); // Join array with newlines.
      case 0:
        return i.join(''); // Join array without any separator.
      default:
        return i; // Return input as-is for unknown modes.
    }
  } catch (e) {
    // In case of any conversion error, return the original input.
    return i;
  }
}

/*
 * End of input/output utility functions.
 * The following section contains the main program logic.
 */

/**
 * The main function containing the core logic of the application.
 * It reads input, performs calculations, and prints the result.
 */
function Main() {
  // Read the integer N from the input.
  var N = nextInt();

  // Read an array of integers from the input.
  var list = nextIntArray();

  // Sort the 'list' array in ascending order.
  list.sort(
    function (a, b) {
      return a - b; // Standard numerical ascending sort.
    }
  );

  // Initialize 'check' array with the largest element from 'list'.
  var check = [];
  check.push(list.pop()); // pop() removes and returns the last element (largest after sort).

  // Loop N times to process subsequent levels.
  for (
    var i = 1; i <= N; i++
  ) {
    // Initialize 'check2' for the current level's elements.
    var check2 = [];

    // Populate 'check2' with (1 << i) elements from 'list'.
    // (1 << i) is equivalent to 2 raised to the power of i.
    for (
      var j = 0; j < (1 << i); j++
    ) {
      check2.push(list.pop()); // Again, taking elements from the end of the sorted list.
    }

    // Compare elements between 'check' and 'check2'.
    // This loop ensures that each element in 'check' is strictly greater than its corresponding element in 'check2'.
    for (
      var j = 0; j < check2.length; j++
    ) {
      if (check[j] <= check2[j]) {
        // If the condition is violated, print "NO" and exit.
        myout("NO");
        return;
      }
    }

    // Concatenate 'check2' to 'check' for the next iteration.
    check = check.concat(check2);
  }

  // If all conditions are met throughout the loops, print "YES".
  myout("YES");
}