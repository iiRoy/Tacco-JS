"use strict"; // This directive enables strict mode for the entire script.

// The GET module is an Immediately Invoked Function Expression (IIFE)
// designed for efficient input parsing in competitive programming contexts.
var GET = (function () {
  /**
   * The primary entry point for creating a new input reader instance.
   * This function acts as a factory for the 'g' constructor.
   * @param {string} s - The complete input string, typically read from stdin.
   * @returns {g} A new instance of the input reader.
   */
  function f(s) {
    return new g(s);
  }

  /**
   * Constructor function for the input reader.
   * It preprocesses the raw input string into an array of lines.
   * @param {string} s - The raw input string to be parsed.
   */
  function g(s) {
    // Trim any leading/trailing whitespace from the entire input string,
    // then split it into an array of lines based on newline characters.
    // '_s' stores these lines, and '_y' keeps track of the current line index.
    this._s = s.trim().split("\n");
    this._y = 0;
  }

  /**
   * Reads a single token (word) from the current line.
   * If the current line has not yet been split into tokens, it performs that operation.
   * Tokens are extracted from the end of the line array for efficiency after reversal.
   * @param {boolean} f - If true, returns the token as a string. Otherwise, attempts to parse it as a number.
   * @returns {string|number} The next token from the input.
   */
  g.prototype.a = function (f) {
    var s = this._s, // Reference to the array of input lines.
      y = this._y, // The index of the current line being processed.
      r; // Variable to store the retrieved token.

    // If the current line is still a raw string (not yet tokenized),
    // split it by spaces and reverse it. Reversing allows `pop()` to
    // extract tokens in their original order (from left to right).
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse();
    }

    // Extract the last element from the (potentially reversed) current line array.
    r = s[y].pop();

    // If the current line becomes empty after popping, advance to the next line.
    if (!s[y].length) {
      this._y++;
    }

    // Return the token. If 'f' is true, return as string; otherwise, convert to number.
    return f ? r : +r;
  };

  /**
   * Reads an entire line of tokens and processes them.
   * The line counter is incremented automatically after reading.
   * @param {boolean} f - If true, returns tokens as strings. Otherwise, parses them as numbers.
   * @returns {string[]|number[]} An array of tokens from the read line.
   */
  g.prototype.l = function (f) {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this._s[this._y++].split(" ");

    // Return the array of tokens. If 'f' is true, return as strings; otherwise, map to numbers.
    return f ? s : s.map(a => +a);
  };

  /**
   * Reads multiple lines, interpreting each as a row in a matrix (2D array).
   * @param {number} n - The number of lines (rows) to read.
   * @param {boolean} f - If true, returns elements as strings. Otherwise, parses them as numbers.
   * @returns {string[][]|number[][]} A 2D array representing the matrix.
   */
  g.prototype.m = function (n, f) {
    // Extract 'n' lines from the input, update the line index,
    // and for each extracted line, split it into tokens.
    var r = this._s.slice(this._y, (this._y += n)).map(a => a.split(" "));

    // Return the matrix. If 'f' is true, elements are strings; otherwise, they are numbers.
    return f ? r : r.map(a => a.map(a => +a));
  };

  /**
   * Reads multiple lines, treating each line as a single item in a 1D array.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns items as strings. Otherwise, parses them as numbers.
   * @returns {string[]|number[]} A 1D array of items.
   */
  g.prototype.r = function (n, f) {
    // Extract 'n' lines from the input and update the line index.
    var r = this._s.slice(this._y, (this._y += n));

    // Return the array of lines. If 'f' is true, return as strings; otherwise, map to numbers.
    return f ? r : r.map(a => +a);
  };

  // The IIFE returns the factory function 'f', making it the public interface.
  return f;
})();

// Initialize the input parser 'o' by reading the content of /dev/stdin.
// This is a standard practice in Unix-like environments for command-line input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array with specified dimensions.
 * The last argument defines the innermost array's size, and the preceding
 * arguments define the outer dimensions.
 * @param {*} v - The value or expression to initialize each innermost element with.
 * @param {...number} dimensions - The sizes of the array dimensions (e.g., xArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments, // Access all arguments passed to this function.
    l = a.length, // Get the total number of arguments.
    // Begin constructing the `eval` string. The innermost array is created first.
    // The last argument `a[l-1]` specifies its size.
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards from the second-to-last argument down to the first.
  // Each iteration wraps the previously constructed array string with another
  // `Array().map()` call, effectively building the multi-dimensional structure.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Use `eval` to execute the dynamically constructed string, creating the array.
  // Caution: `eval` can be a security risk if the input 'v' is untrusted.
  return eval(r);
}

// Execute the main function and print its return value to the console.
console.log(main());

/**
 * The core logic of the program. This function reads input, performs calculations,
 * and returns the final result based on the problem statement.
 * It appears to solve a problem related to counting subarrays with a specific property
 * using prefix sums and a frequency map.
 * @returns {number} The computed answer.
 */
function main() {
  // Read two integer values, 'n' and 'k', from the input.
  var n = o.a();
  var k = o.a();

  // Read a line of integers into array 'a', then transform each element
  // by subtracting 1, likely converting them to 0-indexed values.
  var a = o.l().map(a => a - 1);

  // Declare an array 'b' with a size of 'n + 1'.
  var b = Array(n + 1);
  b[0] = 0; // Initialize the first element of 'b' to 0.

  // Compute prefix sums modulo 'k'.
  // b[i+1] stores the (sum of a[0]...a[i]) % k.
  for (var i = 0; i < n; i++) {
    b[i + 1] = (b[i] + a[i]) % k;
  }

  // Initialize the answer variable and a frequency map (hash object) 'c'.
  var ans = 0;
  var c = {};

  // Iterate through the prefix sum array 'b' to count valid subarrays.
  // This loop uses a sliding window approach with the frequency map 'c'.
  for (var i = 0; i <= n; i++) {
    // If the current window size (i) is greater than or equal to 'k',
    // decrement the count of the element that is falling out of the window.
    // This maintains a window of size 'k' or more.
    if (k <= i) {
      c[b[i - k]]--;
    }

    // Check if the current prefix sum b[i] has been seen before in the valid window.
    // If it exists, it means we've found subarrays whose sum modulo k is 0
    // (or rather, whose difference in prefix sums modulo k is 0).
    // Add its current count to 'ans' and then increment its frequency.
    if (c[b[i]]) {
      ans += c[b[i]]++;
    }
    // If b[i] is encountered for the first time in the current window,
    // initialize its frequency count to 1.
    else {
      c[b[i]] = 1;
    }
  }

  // Return the final calculated answer, which represents the count of valid subarrays.
  return ans;
}