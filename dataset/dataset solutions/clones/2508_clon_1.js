"use strict"; // Enforces strict mode for cleaner code.

// Define a module 'GET' for input parsing operations.
var GET = (function () {
  // This function 'f' serves as the public constructor for the GET module.
  function f(s) {
    // It creates and returns a new instance of the internal 'g' class.
    return new g(s);
  }

  // The internal class 'g' handles the actual parsing and state management.
  function g(s) {
    // The input string 's' is trimmed of leading/trailing whitespace
    // and then split into an array of lines.
    this._s = s.trim().split("\n");

    // '_y' acts as a pointer to the current line being processed.
    this._y = 0;
  }

  // 'g.prototype.a' is a method to get a single 'atom' or value from the current line.
  // The 'f' parameter is a flag to determine if the result should be a string or number.
  g.prototype.a = function (f) {
    // Local references to the internal string array and current line index.
    var s = this._s,
      y = this._y,
      r; // 'r' will store the resulting value.

    // Check if the current line (s[y]) is still a raw string.
    if (typeof s[y] === "string") {
      // If it is, split it by spaces and reverse the order.
      // Reversing allows 'pop()' to effectively get elements from the left.
      s[y] = s[y].split(" ").reverse();
    }

    // Pop the last element from the (potentially reversed) array.
    r = s[y].pop();

    // If the current line is now empty after popping, advance to the next line.
    if (!s[y].length) {
      this._y++;
    }

    // Return the result: 'r' as a string if 'f' is truthy, otherwise convert to a number.
    return f ? r : +r;
  };

  // 'g.prototype.l' is a method to get an entire line of values.
  // The 'f' parameter again controls string vs. number conversion.
  g.prototype.l = function (f) {
    // Get the current line, split it by spaces, and then increment the line pointer.
    var s = this._s[this._y++].split(" ");

    // Return the array of strings or map it to an array of numbers.
    return f ? s : s.map(a => +a);
  };

  // 'g.prototype.m' is a method to get a matrix (multiple lines, each split into values).
  // 'n' specifies the number of lines to read.
  g.prototype.m = function (n, f) {
    // Slice 'n' lines from the input, starting from the current line pointer.
    // The line pointer '_y' is updated by adding 'n'.
    // Each sliced line is then split by spaces.
    var r = this._s.slice(this._y, (this._y += n)).map(a => a.split(" "));

    // Return the matrix of strings or map all elements to numbers.
    return f ? r : r.map(a => a.map(a => +a));
  };

  // 'g.prototype.r' is a method to get raw lines (without splitting each line into values).
  // 'n' specifies the number of lines to read.
  g.prototype.r = function (n, f) {
    // Slice 'n' lines directly from the input array.
    // The line pointer '_y' is updated.
    var r = this._s.slice(this._y, (this._y += n));

    // Return the array of raw line strings or map them to numbers.
    return f ? r : r.map(a => +a);
  };

  // The IIFE (Immediately Invoked Function Expression) returns the public constructor 'f'.
  return f;
})();

// Initialize an instance of the GET parser 'o'.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value.
 * The dimensions of the array are provided as subsequent arguments.
 *
 * @param {*} v - The default value to fill the array elements with.
 * @param {...number} dimensions - The sizes for each dimension of the array.
 * @returns {Array} A new multi-dimensional array.
 */
function xArray(v) {
  // Capture all arguments passed to the function.
  var a = arguments;
  // Get the total number of arguments.
  var l = a.length;
  // Start building the string representation of the array creation.
  // The innermost dimension is `a[l-1]`, and it's filled with `v`.
  var r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards through the remaining dimensions.
  while (--l) {
    // Wrap the current 'r' (inner array creation) with an outer array creation.
    // This effectively builds the multi-dimensional structure.
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Use 'eval' to execute the dynamically constructed string and create the array.
  // Caution: 'eval' can be a security risk if the input string is not controlled.
  return eval(r);
}

// Call the main function and print its returned value to the console.
console.log(main());


/**
 * The main entry point of the program's logic.
 * It reads input, performs calculations, and formats the output.
 *
 * @returns {string} The final computed result, formatted as a newline-separated string.
 */
function main() {
  // Read the first integer 'n' from the input.
  var n = o.a();

  // Read the next line of integers into an array 'a'.
  var a = o.l();

  // Create a frequency map (an array of size 'n' initialized with zeros).
  // This map will store the counts of each number from 1 to 'n'.
  var map = xArray(0, n);

  // Iterate through the input array 'a' to populate the frequency map.
  for (var i = 0; i < n; i++) {
    // Since 'a[i]' values are 1-indexed, subtract 1 to use them as 0-indexed array keys.
    map[a[i] - 1]++;
  }

  // Create an empty array 'set' to store the non-zero frequencies.
  var set = [];

  // Iterate through the frequency map.
  for (var i = 0; i < n; i++) {
    // If an element's count is greater than zero, add it to 'set'.
    if (map[i]) {
      set.push(map[i]);
    }
  }

  // Sort the 'set' array in descending order.
  // This is important for the subsequent calculations.
  set.sort((a, b) => b - a);

  // Initialize the 'ans' array with 'n' as its first element.
  // This array will store the computed answers for each 'i'.
  var ans = [n];

  // Loop from 'i = 2' up to 'n'.
  // This loop calculates the maximum possible 'mx' for different group sizes 'i'.
  for (var i = 2; i <= n; i++) {
    // If the number of distinct frequencies ('set.length') is less than 'i',
    // it's impossible to form 'i' groups, so the answer is 0.
    if (set.length < i) {
      ans.push(0);
    } else {
      // Calculate an initial maximum value 'mx' using integer division.
      var mx = n / i | 0;

      // Initialize 'nn' (representing remaining elements to distribute) with 'n'.
      var nn = n;

      // Iterate through the sorted frequencies in 'set'.
      // This loop adjusts 'nn' if any frequency count exceeds the current 'mx'.
      for (var l = 0; l < n && mx < set[l]; l++) {
        // Subtract the excess count from 'nn'.
        nn -= set[l] - mx;
      }

      // Recalculate 'mx' based on the adjusted 'nn' to get the final result for this 'i'.
      mx = nn / i | 0;

      // Add the calculated 'mx' to the 'ans' array.
      ans.push(mx);
    }
  }

  // Join the elements of the 'ans' array with newline characters
  // to produce the final output string.
  return ans.join("\n");
}