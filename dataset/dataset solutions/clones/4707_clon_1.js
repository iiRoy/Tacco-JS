/* This section contains various utility functions and setup
 * for input processing. It's generally boilerplate code.
 *
 * The original comment was: //Don't have to see. start------------------------------------------
 */

var  read = require('readline')
  .createInterface({
    input: process.stdin,
    output: process.stdout
  });


var obj;
var inLine = []; // This array will store lines read from input.


read.on('line', function (input) {
  inLine.push(input);
});


read.on('close', function () {
  /* When the input stream closes, initialize the object
   * that will handle reading tokens.
   */
  obj = init(inLine);

  // Output a debug message to stderr.
  console.error('\n↑入力 ↓出力');

  // Call the main processing function.
  Main();
});


/* Function to create a deep clone of an object.
 * Handles Sets specifically, otherwise uses JSON serialization.
 */
function makeClone(obj) {
  return (obj instanceof Set)
    ? new Set(Array.from(obj))
    : JSON.parse(JSON.stringify(obj));
}


// Helper to get the next integer from input.
function nextInt() {
  return myconv(next(), 1);
}


// Helper to get the next input as a string array (space-separated).
function nextStrArray() {
  return myconv(next(), 2);
}


// Helper to get the next input as an integer array (space-separated).
function nextIntArray() {
  return myconv(next(), 4);
}


// Helper to get the next input as a character array.
function nextCharArray() {
  return myconv(next(), 6);
}


// Retrieves the next token from the input buffer.
function next() {
  return obj.next();
}


// Checks if there are more tokens to read.
function hasNext() {
  return obj.hasNext();
}


/* Initializes an input reader object.
 * This object provides methods to check for and retrieve next tokens.
 */
function init(input) {
  return {
    list: input,
    index: 0,
    max: input.length,

    // Checks if the current index is within the bounds of the input list.
    hasNext: function () {
      return (this.index < this.max);
    },

    // Retrieves the next item from the input list and increments the index.
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        // Throws an error if no more input is available.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


// Prints a string to standard output.
function myout(s) {
  console.log(s);
}


// Prints a debug message to standard error, inspecting the given object.
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}


/* This function converts input based on the 'no' parameter.
 *
 * Parameter "no" determines the conversion type:
 *   - 1: Parse as integer (parseInt).
 *   - 2: Split by space into a string array.
 *   - 4: Split by space and map to numbers (integer array).
 *   - 6: Split by character into a character array.
 *   - 7: Split by character and map to numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements with no character.
 *   - Default/Outlier: Return input as-is.
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
    // If an error occurs during conversion, return the original input.
    return i;
  }
}

/* End of helper utility functions.
 * Original comment: //Don't have to see. end------------------------------------------
 */


/**
 * The main function containing the core logic of the program.
 * It reads input, performs calculations, and outputs a result.
 */
function Main() {

  var N = nextInt(); // Read the integer N.
  var list = nextCharArray(); // Read the character list.

  /* 'check' array holds the four possible initial configurations
   * for the first two elements ('S' or 'W' for sheep or wolf).
   */
  var check = [
    ["S", "S"],
    ["S", "W"],
    ["W", "S"],
    ["W", "W"]
  ];


  // Iterate through each of the four initial configurations.
  for (var i = 0; i < check.length; i++) {

    // Initialize an array 'ok' to store the deduced animal types.
    // It's N + 2 to handle boundary conditions and wrapping.
    var ok = new Array(N + 2);


    // Set the first two elements based on the current 'check' configuration.
    ok[0] = check[i][0];
    ok[1] = check[i][1];


    // Deduce the type of each animal from j=0 to N-1.
    for (var j = 0; j < N; j++) {

      /* Based on the current animal's sound (list[j]) and
       * the types of the current and next animal (ok[j], ok[j+1]),
       * determine the type of the animal at ok[j+2].
       */
      if (list[j] == "o") { // If the animal says 'o' (sheep)
        if (ok[j] == ok[j + 1]) { // If current and next are same type
          ok[j + 2] = "S"; // Then the animal at j+2 must be a Sheep
        } else { // If current and next are different types
          ok[j + 2] = "W"; // Then the animal at j+2 must be a Wolf
        }
      } else { // If the animal says 'x' (wolf)
        if (ok[j] != ok[j + 1]) { // If current and next are different types
          ok[j + 2] = "S"; // Then the animal at j+2 must be a Sheep
        } else { // If current and next are same types
          ok[j + 2] = "W"; // Then the animal at j+2 must be a Wolf
        }
      }
    }


    /* After deducing all animal types, check if the configuration
     * wraps around correctly. This means the N-th animal's type
     * should be consistent with ok[0] and ok[1] based on the rules.
     *
     * Specifically, ok[N] should match ok[0] and ok[N+1] should match ok[1]
     * for a valid circular arrangement.
     */
    if (ok[0] == ok[N] && ok[1] == ok[N + 1]) {

      // If the configuration is valid, remove the last two helper elements.
      ok.pop();
      ok.pop();

      // Print the resulting string of animal types.
      myout(ok.join(""));

      // Exit the function as a valid solution has been found.
      return;
    }
  }

  // If no valid configuration is found after checking all possibilities.
  myout(-1);
}