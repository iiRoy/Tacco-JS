var GET = (

  function () { // Self-executing function to create a private scope

    /**
     * The main entry point for the GET parser.
     * @param {string} s - The raw input string.
     * @returns {g} An instance of the internal parser class.
     */
    function f(s) {
      return new g(s);
    }



    /**
     * Internal parser class. Manages the input string and current line pointer.
     * @param {string} s - The input string, typically read from a file.
     */
    function g(s) {
      // Store the input string, trimmed and split by newlines.
      this._s = s.trim().split("\n");
      // Initialize the current line index.
      this._y = 0;
    }


    /*
     * Prototype methods for the parser 'g'.
     * These methods handle reading different data types.
     */


    /**
     * Reads a single item (number or string) from the current line.
     * Advances the line pointer if the current line is exhausted.
     * @param {boolean} f - If true, returns as string; otherwise, as number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function (f) {
      // s: array of lines, y: current line index, r: result
      var s = this._s,
        y = this._y,
        r;

      // If the current line hasn't been split into items yet, do so.
      // Items are split by space and reversed so pop() gets them in order.
      if (typeof s[y] === "string") {
        s[y] = s[y].split(" ").reverse();
      }

      // Pop the last item (which is the first item on the line due to reverse).
      r = s[y].pop();

      // If the current line is now empty, move to the next line.
      if (!s[y].length) {
        this._y++;
      }

      // Return as string if 'f' is true, else convert to number.
      return f ? r : +r;
    };



    /**
     * Reads an entire line, splitting it by spaces.
     * Advances the line pointer.
     * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The parsed line.
     */
    g.prototype.l = function (f) {
      // Split the current line by spaces and advance the line pointer.
      var s = this._s[this._y++].split(" ");

      // Return as array of strings or map to numbers.
      return f ? s : s.map(a => +a);
    };



    /**
     * Reads 'n' lines as a matrix (array of arrays), splitting each by spaces.
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns matrix of strings; otherwise, matrix of numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    g.prototype.m = function (n, f) {
      // Slice 'n' lines from the input, split each line, and advance the line pointer.
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

      // Return as matrix of strings or map all elements to numbers.
      return f ? r : r.map(a => a.map(a => +a));
    };



    /**
     * Reads 'n' lines as a raw array.
     * Advances the line pointer by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} The parsed array.
     */
    g.prototype.r = function (n, f) {
      // Slice 'n' lines from the input and advance the line pointer.
      var r = this._s.slice(this._y, this._y += n);

      // Return as array of strings or map to numbers.
      return f ? r : r.map(a => +a);
    };


    // The IIFE returns the main 'f' function, which is assigned to GET.
    return f;

  }

)();
// Initialize the input object 'o' using the GET parser.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
var o = GET( require("fs") . readFileSync( "/dev/stdin", "utf8" ) );
/**
 * Creates a multi-dimensional array initialized with a value 'v'.
 * The dimensions are provided as subsequent arguments.
 * This function uses 'eval' for dynamic array creation.
 *
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The multi-dimensional array.
 */
function xArray(v) {
  var a = arguments, // Capture all arguments
    l = a.length, // Get total number of arguments
    r = "Array(a[" + --l + "])" + // Start with the innermost array dimension
    ".fill(0)" + // Fill with a placeholder (0)
    ".map(x=>{return " + v + ";})"; // Map to the desired initial value 'v'

  // Loop backwards through the remaining dimensions to build the nested Array.map structure.
  while (--l) {
    r = "Array(a[" + l + "])" + // Current dimension
      ".fill(0)" + // Fill with placeholder
      ".map(x=>" + r + ")"; // Nest the previously built array expression
  }
  // Evaluate the constructed string as JavaScript code to create the array.
  return eval(r);
}
// Define a large number to represent infinity or an unreachable state.
var INF = 1e9; // 10^9

// Execute the main logic and print its result to the console.
console.log( main() );
/**
 * The main function implementing the problem's logic.
 * This appears to be a variation of a knapsack or shortest path problem
 * on a bitmask DP state.
 *
 * @returns {number} The minimum cost, or -1 if unreachable.
 */
function main() {

  // Read the number of items (n) and number of available keys/sets (m).
  var n = o.a();
  var m = o.a();

  // 'a' will store the cost of each key/set.
  var a = Array(m);
  // 'c' will store the bitmask representation of items unlocked by each key/set.
  var c = Array(m);


  // Loop through each of the 'm' available keys/sets.
  for (var i = 0; i < m; i++) {
    // Read the cost of the i-th key/set.
    a[i] = o.a();

    // Read the number of items this key/set unlocks (b).
    // 't' will be the bitmask for the current key/set.
    var b = o.a(),
      t = 0;

    // For each item unlocked by this key/set.
    for (var j = 0; j < b; j++) {
      // Read the item index (ci).
      var ci = o.a();
      // Add this item to the bitmask 't'.
      // ci-1 is used because item indices are likely 1-based in input.
      t += 1 << (ci - 1);
    }
    // Store the computed bitmask for the i-th key/set.
    c[i] = t;
  }


  // Initialize a DP array.
  // dp[i] will store the minimum cost to achieve the state represented by bitmask 'i'.
  // The size of the DP array is 2^n, representing all possible subsets of 'n' items.
  var dp = xArray(INF, 1 << n);

  // The cost to achieve the initial state (no items unlocked, bitmask 0) is 0.
  dp[0] = 0;


  // Iterate through all possible states (bitmasks).
  // 'i' represents the current set of items unlocked.
  for (var i = 0; i < (1 << n); i++) {
    // If the current state 'i' is unreachable, skip it.
    if (dp[i] === INF) {
      continue;
    }

    // For each available key/set (j).
    for (var j = 0; j < m; j++) {
      // Calculate the new state 't' by unlocking items from key/set 'j'
      // in addition to the items already unlocked in state 'i'.
      var t = i | c[j];

      // If the cost to reach state 't' through state 'i'
      // is less than the currently known minimum cost for state 't'.
      if ((dp[i] + a[j]) < dp[t]) {
        // Update the minimum cost for state 't'.
        dp[t] = dp[i] + a[j];
      }
    }
  }


  // The final state we want to reach is all 'n' items unlocked,
  // which is represented by a bitmask (1 << n) - 1.
  var finalStateCost = dp[(1 << n) - 1];

  // If the final state is still INF, it means it's unreachable.
  // Otherwise, return the minimum cost.
  return finalStateCost === INF ? -1 : finalStateCost;

}