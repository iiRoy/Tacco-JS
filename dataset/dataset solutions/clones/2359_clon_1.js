"use strict"
// This line enforces strict mode for the entire script.
// It helps catch common coding errors and "unsafe" actions.

var GET = (function () {
  // This is an Immediately Invoked Function Expression (IIFE)
  // It creates a closure for the 'GET' function, which is then returned.

  function f(s) {
    // The main entry point for the GET module.
    // It takes a string 's' (presumably the input data)
    // and returns a new instance of the 'g' class.
    return new g(s);
  }


  function g(s) {
    // Constructor for the 'g' class.
    // Initializes the internal state for parsing input.
    this._s = s.trim().split("\n"); // Trim whitespace and split into lines.
    this._y = 0;                    // Initialize line counter.
  }


  g.prototype.a = function (f) {
    // Method 'a' (presumably 'atom' or 'advance')
    // Reads a single value from the current line.
    var s = this._s,
      y = this._y,
      r;

    // If the current line hasn't been processed into an array of tokens yet,
    // split it and reverse it to allow popping from the "front" (end of array).
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse();
    }

    r = s[y].pop(); // Get the last element (which was originally the first).

    // If the current line is now empty, advance to the next line.
    if (!s[y].length) {
      this._y++;
    }

    // Return the value. If 'f' (flag for 'float' or 'force string') is true,
    // return as string; otherwise, convert to number.
    return f ? r : +r;
  };


  g.prototype.l = function (f) {
    // Method 'l' (presumably 'line')
    // Reads an entire line as a list of values.
    var s = this._s[this._y++].split(" "); // Get current line, split by space, then advance line counter.

    // Return the array. If 'f' is true, return as strings;
    // otherwise, map all elements to numbers.
    return f ? s : s.map(a => +a);
  };


  g.prototype.m = function (n, f) {
    // Method 'm' (presumably 'matrix' or 'multiple lines')
    // Reads 'n' lines and treats them as a matrix of values.
    var r = this._s.slice(this._y, this._y += n).map(a => a.split(" ")); // Slice 'n' lines, split each by space.

    // Return the matrix. If 'f' is true, return as strings;
    // otherwise, map all nested elements to numbers.
    return f ? r : r.map(a => a.map(a => +a));
  };


  g.prototype.r = function (n, f) {
    // Method 'r' (presumably 'rows' or 'raw lines')
    // Reads 'n' lines as an array of single values or raw strings.
    var r = this._s.slice(this._y, this._y += n); // Slice 'n' lines directly.

    // Return the array. If 'f' is true, return as strings;
    // otherwise, map all elements to numbers.
    return f ? r : r.map(a => +a);
  };


  return f; // The IIFE returns the 'f' function, which is assigned to 'GET'.

})(); // End of the GET IIFE.


// Initialize the input parser 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


function xArray(v) {
  // This helper function creates multi-dimensional arrays,
  // initializing each element with a given value or expression.
  // 'v' is the initial value/expression for the innermost array elements.
  // Subsequent arguments are the dimensions of the array.

  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Start with the innermost array dimension.

  // Build the nested array creation string from outer dimensions inwards.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Use eval to dynamically create the multi-dimensional array.
  // This is a powerful but potentially risky operation if 'v' or 'a' come from untrusted sources.
  return eval(r);
}


// Call the main function and print its return value to the console.
console.log(main());


function main() {
  // Main logic for the problem.

  var h = o.a(); // Read height 'h' from input.
  var w = o.a(); // Read width 'w' from input.

  // Initialize a 2D array 'dp' (dynamic programming table)
  // where each element is a new Set().
  var dp = xArray("new Set()", h, w);

  // Read matrix 'a' of size h x w from input.
  var a = o.m(h);

  // Read matrix 'b' of size h x w from input.
  var b = o.m(h);

  // Initialize a 2D array 'c' of size h x w, filled with empty arrays initially.
  var c = xArray("[]", h);

  // Calculate the difference matrix c = a - b.
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      c[i][j] = a[i][j] - b[i][j];
    }
  }

  // Initialize the first cell of the DP table.
  // Add the absolute difference of the first element of 'c' to dp[0][0].
  dp[0][0].add(Math.abs(c[0][0]));


  // Iterate through the DP table to fill it.
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {

      // If not in the first row, consider paths from the cell above (i-1, j).
      if (i) {
        // Iterate through all values 'k' in the Set at dp[i-1][j].
        for (var k of dp[i - 1][j]) {
          // Add two new possible absolute differences to the current cell's Set:
          // 1. |k + c[i][j]|
          // 2. |k - c[i][j]|
          dp[i][j].add(Math.abs(k + c[i][j]));
          dp[i][j].add(Math.abs(k - c[i][j]));
        }
      }

      // If not in the first column, consider paths from the cell to the left (i, j-1).
      if (j) {
        // Iterate through all values 'k' in the Set at dp[i][j-1].
        for (var k of dp[i][j - 1]) {
          // Add two new possible absolute differences to the current cell's Set:
          // 1. |k + c[i][j]|
          // 2. |k - c[i][j]|
          dp[i][j].add(Math.abs(k + c[i][j]));
          dp[i][j].add(Math.abs(k - c[i][j]));
        }
      }
    }
  }

  // Find the minimum absolute difference in the final cell dp[h-1][w-1].
  var ans = 1e9; // Initialize 'ans' with a very large number.

  // Iterate through all values 'i' in the Set at the bottom-right corner.
  for (var i of dp[h - 1][w - 1]) {
    // If the current value 'i' is smaller than the current minimum 'ans', update 'ans'.
    if (i < ans) {
      ans = i;
    }
  }

  // Return the minimum absolute difference found.
  return ans;
}