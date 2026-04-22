/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes it, and then outputs a result.
 * The core logic involves geometric calculations and sorting.
 */

"use strict"; // Enforce strict mode for better code quality and error handling.

// Declare and initialize variables for input handling.
var input = require("fs")
  .readFileSync("/dev/stdin", "utf8"); // Read entire input file synchronously.

var cin = input.split(/ |\n/), // Split input by spaces or newlines into an array.
  cid = 0; // Current index for reading from the 'cin' array.

/**
 * Reads the next number from the input array.
 * @returns {number} The next number.
 */
function next() {
  return +cin[cid++]; // Convert the string to a number using unary plus operator.
}


/**
 * Reads the next string from the input array.
 * @returns {string} The next string.
 */
function nextstr() {
  return cin[cid++];
}


/**
 * Reads the next BigInt from the input array.
 * @returns {BigInt} The next BigInt.
 */
function nextbig() {
  return BigInt(cin[cid++]);
}


/**
 * Reads 'n' elements from the input array.
 * Optionally converts them to numbers if 'a' is falsy.
 * @param {number} n - The number of elements to read.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<string|number>} An array of the read elements.
 */
function nexts(n, a) {
  /*
   * The 'slice' method extracts a section of an array.
   * 'cid' is incremented by 'n' to move the pointer forward.
   */
  if (a) {
    return cin.slice(cid, cid += n);
  } else {
    // Map each element to its numeric representation.
    return cin.slice(cid, cid += n).map(a => +a);
  }
}


/**
 * Reads a 2D matrix (h rows, w columns) from the input.
 * Optionally converts elements to numbers.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm(h, w, a) {
  var r = [],
    i = 0; // Initialize result array and loop counter.

  /*
   * Loop 'h' times to populate the rows of the matrix.
   * Each row is a slice of 'w' elements from the input array.
   */
  if (a) {
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w));
    }
  } else {
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w).map(a => +a)); // Convert elements to numbers.
    }
  }

  return r;
}


/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * This function uses 'eval' which should be used with caution in production.
 * @param {*} v - The value to fill the innermost array with.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Base case for innermost array.

  /*
   * Build the string representation of nested Array.fill().map() calls.
   * This creates the multi-dimensional structure.
   */
  while (--l) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
  }

  return eval(r); // Execute the constructed string as JavaScript code.
}


/*
 * Main execution block.
 * Calls the 'main' function and handles its output.
 */
var myOut = main(); // Store the result of the main function.
if (myOut !== undefined) {
  console.log(String(myOut)); // Print the result if it's not undefined.
}


/**
 * The main function where the problem-solving logic resides.
 * @returns {string|number} The final answer or "SAFE".
 */
function main() {
  var inf = 1e9; // Define a large number to represent infinity for comparisons.
  var n = next(); // Read the first input, which is 'n'.

  /*
   * 'a' is a 4-element array, where each element is an empty array.
   * This likely stores points categorized by direction (U, R, D, L).
   */
  var a = xArray("[]", 4);

  /*
   * 's' is an object mapping direction strings to numeric indices (0-3).
   * U: Up, R: Right, D: Down, L: Left.
   */
  var s = {
    U: 0,
    R: 1,
    D: 2,
    L: 3
  };

  // Loop 'n' times to read input points and categorize them.
  for (var i = 0; i < n; i++) {
    var x = next(),
      y = next(),
      U = nextstr(); // Read x-coordinate, y-coordinate, and direction string.

    // Store the point data in the corresponding direction array.
    // Each point is stored as [x, y, x-y, x+y].
    a[s[U]].push([x, y, x - y, x + y]);
  }

  var ans = inf; // Initialize the answer with infinity.

  /*
   * Sort the arrays based on different criteria.
   * a[0] (U) and a[2] (D) are sorted by x-coordinate (index 0).
   * a[1] (R) and a[3] (L) are sorted by y-coordinate (index 1).
   */
  a[0].sort((a, b) => a[0] - b[0]);
  a[1].sort((a, b) => a[1] - b[1]);
  a[2].sort((a, b) => a[0] - b[0]);
  a[3].sort((a, b) => a[1] - b[1]);

  /*
   * First set of checks:
   * Compares points in 'a[0]' (Up) with 'a[2]' (Down)
   * and 'a[1]' (Right) with 'a[3]' (Left).
   * This seems to be checking for collisions along horizontal/vertical lines.
   */
  for (var k = 0; k < 2; k++) {
    var id = 0; // Pointer for the second array in comparison.

    /*
     * Only proceed if the second array (a[k+2]) has elements.
     * Iterate through points in 'a[k]'.
     */
    if (a[k + 2].length) {
      for (var i = 0; i < a[k].length; i++) {
        // Advance 'id' pointer while points in 'a[k+2]' are "behind" 'a[k][i]'.
        while (a[k + 2].length > id && a[k + 2][id][k] < a[k][i][k]) {
          id++;
        }

        // If 'id' reached the end, no more potential matches for current 'a[k][i]'.
        if (id === a[k + 2].length) {
          break;
        }

        /*
         * Check for collision condition:
         * - Same primary coordinate (x for k=0, y for k=1).
         * - Second coordinate of a[k][i] is less than a[k+2][id][1-k].
         * This implies a point a[k][i] is "before" a[k+2][id] on the same line.
         */
        if (a[k][i][k] === a[k + 2][id][k] && a[k][i][1 - k] < a[k + 2][id][1 - k]) {
          // Update minimum answer with the distance between these two points.
          ans = Math.min(ans, a[k + 2][id][1 - k] - a[k][i][1 - k]);
        }
      }
    }
  }

  /*
   * Re-sort all arrays based on the 'x+y' coordinate (index 3).
   * This is likely for checking collisions along diagonals (constant x+y).
   */
  a[0].sort((a, b) => a[3] - b[3]);
  a[1].sort((a, b) => a[3] - b[3]);
  a[2].sort((a, b) => a[3] - b[3]);
  a[3].sort((a, b) => a[3] - b[3]);

  /*
   * Second set of checks:
   * Compares points in 'a[0]' (Up) with 'a[1]' (Right)
   * and 'a[2]' (Down) with 'a[3]' (Left).
   * This seems to be checking for collisions along diagonals where x+y is constant.
   */
  for (var k = 0; k < 4; k += 2) { // k will be 0 then 2.
    var id = 0; // Pointer for the second array.

    /*
     * Only proceed if the second array (a[k+1]) has elements.
     * Iterate through points in 'a[k]'.
     */
    if (a[k + 1].length) {
      for (var i = 0; i < a[k].length; i++) {
        // Advance 'id' pointer while points in 'a[k+1]' are "behind" 'a[k][i]' based on x+y.
        while (a[k + 1].length > id && a[k + 1][id][3] < a[k][i][3]) {
          id++;
        }

        // If 'id' reached the end, no more potential matches.
        if (id === a[k + 1].length) {
          break;
        }

        /*
         * Check for collision condition:
         * - Same 'x+y' coordinate (index 3).
         * - The '1-k/2' index corresponds to 'y' for k=0 and 'x' for k=2.
         *   This means checking if a[k][i] is "before" a[k+1][id] on the diagonal.
         */
        if (a[k][i][3] === a[k + 1][id][3] && a[k][i][1 - k / 2] < a[k + 1][id][1 - k / 2]) {
          // Update minimum answer with 2 times the distance.
          ans = Math.min(ans, (a[k + 1][id][1 - k / 2] - a[k][i][1 - k / 2]) * 2);
        }
      }
    }
  }

  /*
   * Re-sort all arrays based on the 'x-y' coordinate (index 2).
   * This is likely for checking collisions along diagonals (constant x-y).
   */
  a[0].sort((a, b) => a[2] - b[2]);
  a[1].sort((a, b) => a[2] - b[2]);
  a[2].sort((a, b) => a[2] - b[2]);
  a[3].sort((a, b) => a[2] - b[2]);

  /*
   * Third set of checks:
   * Compares points in 'a[0]' (Up) with 'a[3]' (Left)
   * and 'a[1]' (Right) with 'a[2]' (Down).
   * This also checks for collisions along diagonals where x-y is constant.
   */
  for (var k = 0; k < 2; k++) { // k will be 0 then 1.
    var id = 0; // Pointer for the second array.

    /*
     * Only proceed if the second array (a[3-k]) has elements.
     * Iterate through points in 'a[k]'.
     */
    if (a[3 - k].length) {
      for (var i = 0; i < a[k].length; i++) {
        // Advance 'id' pointer while points in 'a[3-k]' are "behind" 'a[k][i]' based on x-y.
        while (a[3 - k].length > id && a[3 - k][id][2] < a[k][i][2]) {
          id++;
        }

        // If 'id' reached the end, no more potential matches.
        if (id === a[3 - k].length) {
          break;
        }

        /*
         * Check for collision condition:
         * - Same 'x-y' coordinate (index 2).
         * - The '0' index here refers to the x-coordinate.
         *   This means checking if a[k][i] is "before" a[3-k][id] on the diagonal.
         */
        if (a[k][i][2] === a[3 - k][id][2] && a[k][i][0] < a[3 - k][id][0]) {
          // Update minimum answer with 2 times the distance.
          ans = Math.min(ans, (a[3 - k][id][0] - a[k][i][0]) * 2);
        }
      }
    }
  }

  /*
   * Final result determination:
   * If 'ans' is still infinity, it means no collisions were found.
   * Otherwise, return the minimum distance multiplied by 5.
   */
  return ans === inf ? "SAFE" : ans * 5;
}