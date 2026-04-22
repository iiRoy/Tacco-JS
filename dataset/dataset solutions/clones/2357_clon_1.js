/*
 * This section contains utility functions for input/output handling.
 * It's generally boilerplate code for competitive programming environments.
 */
// Initialize readline interface for standard I/O operations
var read = require('readline').createInterface({
  input : process.stdin,
  output : process.stdout
});

// Declare global variables for storing parsed input and input lines
var   obj;
var inLine = [];

// Event listener for each line of input received
read.on('line', function ( input ) {
  inLine.push( input );
});

// Event listener for when the input stream closes
read.on('close', function ( ) {
  // Initialize the 'obj' with the collected input lines
  obj = init( inLine );

  // Output a debug message to stderr, indicating input/output flow
  console.error( '\n↑入力 ↓出力' );

  // Call the main program logic
  Main( );
});

/**
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone(obj) {
  return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));
}

// --- Helper functions for reading various data types from input ---
function nextInt() {
  return myconv(next(), 1);
}

function nextStrArray() {
  return myconv(next(), 2);
}

function nextIntArray() {
  return myconv(next(), 4);
}

function nextCharArray() {
  return myconv(next(), 6);
}

function next() {
  return obj.next();
}

function hasNext() {
  return obj.hasNext();
}

/**
 * Initializes an object to manage input lines.
 * Provides methods for checking if more input exists and retrieving the next line.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with input management properties and methods.
 */
function init(input) {
  return {
    list: input,
    index: 0,
    max: input.length,
    hasNext: function () {
      return (this.index < this.max);
    },
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to output to console (stdout)
function myout(s) {
  console.log(s);
}

// Function to output debug messages to console (stderr)
function myerr(s) {
  console.error('debug:' + require('util').inspect(s, false, null));
}

/*
 * This function performs various conversions on input data based on the 'no' parameter.
 *
 * Parameter 'no' mapping:
 *   - unknown or outlier: returns 'i' as is.
 *   - 1: Parses 'i' as an integer.
 *   - 2: Splits 'i' by space into an array of strings.
 *   - 4: Splits 'i' by space and maps each part to a Number (integer).
 *   - 6: Splits 'i' into an array of characters.
 *   - 7: Splits 'i' into characters and maps each to a Number.
 *   - 8: Joins array 'i' with spaces.
 *   - 9: Joins array 'i' with newlines.
 *   - 0: Joins array 'i' with no separator.
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
    // In case of an error during conversion, return the original input
    return i;
  }
}

// End of utility functions section
// ------------------------------------------------------------------

/**
 * The main function containing the core logic of the program.
 * It reads dimensions H and W, then a 2D array, and another 2D array.
 * It calculates the absolute difference between corresponding elements
 * and then uses dynamic programming to find the minimum possible sum of differences.
 */
function Main() {
  // Read the first line of input which contains H and W
  var one = nextIntArray();

  // Extract dimensions H (height) and W (width)
  var H = one[0];
  var W = one[1];

  // Initialize a 2D array (list) of size H
  var list = new Array(H);

  // Populate the 'list' array with H rows, each read as an array of integers
  for (var i = 0; i < H; i++) {
    list[i] = nextIntArray();
  }

  // Read another H rows and calculate absolute differences
  for (var i = 0; i < H; i++) {
    var tmp = nextIntArray(); // Read a temporary row
    for (var j = 0; j < W; j++) {
      // Calculate the absolute difference and store it back in 'list'
      list[i][j] = Math.abs(list[i][j] - tmp[j]);
    }
  }

  // Define a maximum possible sum for DP array sizing
  var max = 13000;

  // Initialize a 3D DP array
  var dp = new Array(H + 1);

  // Populate the DP array dimensions
  for (var i = 0; i < H + 1; i++) {
    dp[i] = new Array(W + 1);
    for (var j = 0; j < W + 1; j++) {
      dp[i][j] = new Array(max).fill(false); // Initialize with false
    }
  }


  // Base case for DP: the starting cell (0,0) with its value
  dp[0][0][list[0][0]] = true;

  // Iterate through the grid to fill the DP table
  for (var i = 0; i < H; i++) {
    for (var j = 0; j < W; j++) {
      // Skip the initial cell as it's handled by the base case
      if (i == 0 && j == 0) {
        continue;
      }

      // If in the first row (i == 0)
      if (i == 0) {
        for (var k = 0; k < max; k++) {
          if (dp[i][j - 1][k]) { // If previous cell in the same row was reachable with sum 'k'
            // Update current cell with sums/differences
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }
      // If in the first column (j == 0)
      else if (j == 0) {
        for (var k = 0; k < max; k++) {
          if (dp[i - 1][j][k]) { // If previous cell in the same column was reachable with sum 'k'
            // Update current cell with sums/differences
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }
      // For all other cells (not in the first row or column)
      else {
        for (var k = 0; k < max; k++) {
          // Check path from above (i-1, j)
          if (dp[i - 1][j][k]) {
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
          // Check path from left (i, j-1)
          if (dp[i][j - 1][k]) {
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }
    }
  }

  // After filling the DP table, find the smallest reachable absolute sum
  for (var i = 0; i < max; i++) {
    if (dp[H - 1][W - 1][i]) { // If sum 'i' is reachable at the bottom-right cell
      myout(i); // Output the smallest sum
      return;   // Terminate the function
    }
  }
}