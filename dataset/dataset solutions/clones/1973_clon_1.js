// This file contains a solution to a competitive programming problem.
// It uses custom input parsing functions and dynamic programming to find an optimal value.

"use strict"; // Enforce strict mode for better code quality and to catch common coding errors.

// --- Input Parsing Utilities ---

/**
 * Reads the entire input from standard input (/dev/stdin) as a UTF-8 string.
 * This variable holds the raw input content.
 * @type {string}
 */
var input = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Parses the raw input string into an array of tokens.
 * Tokens are separated by spaces or newlines.
 * 'cid' acts as a pointer to the current token being processed.
 * @type {string[]}
 */
var cin = input.split(/ |\n/),
    cid = 0; // Initialize current input index to 0.

/**
 * Retrieves the next token from the global input array 'cin'.
 * Increments the internal pointer 'cid' after retrieval.
 *
 * @param {boolean} a - If true, returns the token as a string.
 *                      If false (or falsy), attempts to convert the token to a number.
 * @returns {string|number} The next token from the input.
 */
function next(a) {
  return a ? cin[cid++] : +cin[cid++];
}

/**
 * Retrieves a specified number of tokens from the global input array 'cin'.
 *
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns the tokens as an array of strings.
 *                      If false (or falsy), returns the tokens as an array of numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function nexts(n, a) {
  return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}

/**
 * Reads a 2D matrix of dimensions 'h' (height/rows) by 'w' (width/columns) from the input.
 *
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns in each row.
 * @param {boolean} a - If true, returns a matrix of strings.
 *                      If false (or falsy), returns a matrix of numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm(h, w, a) {
  var r = [], // Initialize an empty array to store the resulting matrix rows.
      i = 0;  // Initialize a loop counter for rows.

  if (a) {
    // If 'a' is true, read tokens as strings.
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w)); // Slice 'w' tokens and push as a row.
    }
  } else {
    // If 'a' is false, read tokens and convert them to numbers.
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w).map(a => +a)); // Slice and map to numbers.
    }
  }
  return r; // Return the constructed matrix.
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The function takes the initial value as the first argument, followed by the dimensions.
 * For example, `xArray(0, 3, 4)` creates a 3x4 array filled with zeros.
 *
 * @param {*} v - The initial value to fill the array elements with.
 * @param {...number} dimensions - The desired dimensions of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments, // Capture all arguments passed to the function.
      l = a.length,  // Get the total number of arguments.
      // Construct the string for the innermost array creation.
      // 'l' is decremented to get the last dimension.
      r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

  // Iteratively build the string for outer array dimensions.
  while (--l) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
  }
  // Evaluate the constructed string to create and return the array structure.
  return eval(r);
}


// --- Main Program Execution ---

// Call the main function to execute the problem's core logic.
var myOut = main();

// If the main function returns a defined value, print it to the console.
// This is typical for competitive programming problems where the result is printed.
if (myOut !== undefined) {
  console.log(myOut);
}


/**
 * The main function encapsulates the problem-solving logic.
 * It reads 'n' items, processes them using a specific sorting and dynamic programming approach,
 * and returns the final calculated maximum value.
 *
 * @returns {number} The maximum value obtained from the dynamic programming calculation.
 */
function main() {
  // Read the first number from input, which represents 'n', the count of items.
  var n = next();

  // Initialize an empty array 'a' to store pairs of [value, original_index].
  var a = [];

  // Loop 'n' times to read each item's value and store it along with its original index.
  for (var i = 0; i < n; i++) {
    a.push([next(), i]); // Read the next value and push [value, current_index].
  }

  // Sort the array 'a' in descending order based on the item's value (the first element of the pair).
  // The original index (second element) remains paired with its value.
  a.sort((a, b) => b[0] - a[0]);

  // Initialize a dynamic programming array 'dp' of size 'n + 1' with all elements set to 0.
  var dp = xArray(0, n + 1);

  // Iterate through the sorted items to populate and update the DP table.
  for (var i = 0; i < n; i++) {
    // Calculate the value for dp[i+1]. This step considers placing the current item
    // 'a[i]' in a specific configuration related to its value and indices.
    dp[i + 1] = dp[i] + (n - i - a[i][1] - 1) * a[i][0];

    // Inner loop: Iterate backwards from 'i' down to 1.
    // This loop explores different placements for the current item 'a[i]' within the DP state.
    for (var j = i; j; j--) {
      // Update dp[j] by adding a contribution from the current item 'a[i]'.
      // This calculation involves the item's value and various index differences.
      dp[j] += (a[i][1] - (i - j)) * a[i][0];

      // Calculate a temporary value 't' based on dp[j-1] and the current item's contribution.
      // This represents an alternative way to reach the state 'j'.
      var t = dp[j - 1] + (n - j - a[i][1]) * a[i][0];

      // If the temporary value 't' is greater than the current dp[j], update dp[j] with 't'.
      // This ensures we always keep the maximum possible value for each DP state.
      if (dp[j] < t) {
        dp[j] = t;
      }
    }
    // Update dp[0] with a contribution from the current item 'a[i]'.
    // This typically covers the base case or a specific placement at the beginning.
    dp[0] += (a[i][1] - i) * a[i][0];
  }

  // After all items are processed, return the maximum value found in the 'dp' array.
  // This maximum value represents the final solution to the problem.
  return Math.max(...dp);
}