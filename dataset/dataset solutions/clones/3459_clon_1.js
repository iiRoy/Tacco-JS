"use strict";

/*
 * This file contains a solution for a dynamic programming problem.
 * It uses a custom input parser `I` and a helper function `buildArray`.
 * The main logic is within the `main` function.
 */

// Custom input parser class.
// The original timestamp was 21:39, indicating the time of creation or a specific version.
function I /* InputParser */(s /* input string */, f /* parsing function, e.g., Number */) {
  // Store the input string, split by newlines, into an array of lines.
  this._s = s.split("\n");
  // _c represents the current column (word) index within the current line.
  this._c = 0;
  // _l represents the current line index.
  this._l = 0;
  // _f is the function used to parse individual input tokens, defaulting to Number.
  this._f = f || Number;
}

// Prototype method to read a single token (word) from the input.
I.prototype.a /* advanceAndParse */ = function() {
  // Get the current line.
  var l = this._s[this._l];

  // If the line is empty or undefined, there's no more input.
  if (!l) {
    return;
  }

  // Trim whitespace from the line and split it into tokens by space.
  var t = l.trim().split(" ");
  // Get the token at the current column index.
  var a = t[this._c];

  // Move to the next column.
  this._c++;

  // If all tokens on the current line have been consumed, reset column and advance to the next line.
  if (t.length === this._c) {
    this._c = 0;
    this._l++;
  }

  // Parse and return the extracted token.
  return this._f(a);
};

// Prototype method to read an entire line of tokens and parse them.
I.prototype.l /* readLineAndParse */ = function() {
  // Get the current line.
  var l = this._s[this._l];

  // If the line is empty or undefined, there's no more input.
  if (!l) {
    return;
  }

  // Reset the column index for the new line.
  this._c = 0;
  // Advance to the next line.
  this._l++;

  // Split the line into tokens, parse each token using _f, and return the array.
  return l.split(" ").map(this._f);
};


/*
 * Helper function to build a multi-dimensional array initialized with a specific value.
 * This function recursively creates nested arrays based on the dimensions provided.
 */
function buildArray(r /* dimensions array, e.g., [h, w] */, t /* initial value */) {
  // Initialize the result with the base value.
  let l = t || 0;

  // Iterate backwards through the dimensions to build the array from the inside out.
  for (let t_idx = r.length; t_idx > 0; t_idx--) {
    // Get the current dimension size.
    const n = r[t_idx - 1];
    // Create an array of size 'n', fill it, and map each element to a deep copy of the current 'l'.
    // JSON.parse(JSON.stringify(l)) is used for deep cloning, ensuring independent objects/arrays.
    l = Array(n).fill().map(() => JSON.parse(JSON.stringify(l)));
  }

  // Return the fully constructed multi-dimensional array.
  return l;
}


// A constant representing a large prime modulus, often used in competitive programming for answers.
const mod = 1000000007;


/*
 * The main function that processes the input and computes the result.
 * It solves a dynamic programming problem, likely related to combinatorics or paths on a grid.
 */
function main(input /* raw input string */) {
  // Initialize the input parser with the provided input.
  var o = new I(input);

  // Read the problem parameters: height (h), width (w), and target column (k).
  var h = o.a(); // Height of the grid/structure
  var w = o.a(); // Width of the grid/structure
  var k = o.a(); // Target column (1-indexed)

  // Precomputed 'wc' array (likely "ways to choose" or "Fibonacci-like sequence").
  // This looks like a Fibonacci sequence: F(1)=1, F(2)=1, F(3)=2, F(4)=3, ...
  // The first two elements are both 1.
  var wc = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]; // Fibonacci sequence for small indices

  // Initialize a 2D dynamic programming array 'dp' of size h x w with all elements set to 0.
  var dp = buildArray([h, w], 0);

  // Base cases for the DP table (first row, i=0).
  // These initial values likely correspond to the starting configuration or initial ways.
  // dp[0][0] is the number of ways to reach (0,0).
  dp[0][0] = wc[w - 1];
  // dp[0][1] is the number of ways to reach (0,1).
  dp[0][1] = wc[w - 2];


  // Iterate through the rows of the DP table, starting from the second row (i=1).
  for (var i = 1; i < h; i++) {
    // Iterate through the columns for the current row.
    for (var j = 0; j < w; j++) {

      // --- DP Transition Rules ---

      // Case 1: Stay in the same column 'j'.
      // Add ways from dp[i-1][j] multiplied by a combinatorial factor.
      dp[i][j] += dp[i - 1][j] * (wc[w - j - 1] * wc[j]);

      // Case 2: Move from column 'j-1' to column 'j'.
      // Check if moving from left is valid (j-1 >= 0).
      if (j - 1 >= 0) {
        // Add ways from dp[i-1][j-1] multiplied by a combinatorial factor.
        dp[i][j] += dp[i - 1][j - 1] * (wc[w - j - 1] * wc[j - 1]);
      }

      // Case 3: Move from column 'j+1' to column 'j'.
      // Check if moving from right is valid (j+1 <= w-1).
      if (j + 1 <= w - 1) {
        // Add ways from dp[i-1][j+1] multiplied by a combinatorial factor.
        dp[i][j] += dp[i - 1][j + 1] * (wc[w - j - 2] * wc[j]);
      }

      // Apply modulo operation to keep the numbers within limits.
      dp[i][j] %= mod;
    }
  }

  // The final answer is the value in the DP table at the last row (h-1) and target column (k-1).
  // k is 1-indexed in problem statement, so convert to 0-indexed for array access.
  console.log(dp[h - 1][k - 1]);
}


// Read input from standard input and pass it to the main function.
// For competitive programming, this typically reads from a file or stdin.
main(require("fs").readFileSync("/dev/stdin", "utf8"));