/*
 * This file defines a custom input reader class 'gets'
 * and a main function 'main' that solves a specific problem.
 * The 'gets' class provides utility methods for parsing input.
 */

// Define the 'gets' constructor function.
// It initializes an internal array '_s' by splitting the input string by newlines.
function gets(str) {
  // Store the input string, split by newline characters.
  this._s = str.split("\n");
  /*
   * Initialize the current line index to 0.
   * This property tracks which line is being read next.
   */
  this._y = 0;
}
; // Semicolon at the end of function definition, followed by prototype.

// Define methods for the 'gets' prototype.
// These methods provide different ways to read and parse input data.
gets.prototype = {

  /*
   * Method 'a': Reads and parses a single atomic value from the current line.
   * If 'f' is true, returns the value as a string; otherwise, as a number.
   */
  a: function (f) {
    // Local variables for convenience.
    var s = this._s, // Reference to the array of input lines.
      y = this._y, // Current line index.
      r; // Variable to hold the result.

    // If the current line exists and hasn't been processed into an array of words yet,
    // split it by spaces and reverse it for easy 'pop' operations.
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse();
    }

    // Pop the last element from the current line's array (which is now the first word due to reverse).
    r = s[y].pop();

    // If the current line is now empty, increment the line index to move to the next line.
    if (!s[y].length) {
      this._y++;
    }

    // Return the result, either as a string (if 'f' is truthy) or as a number (otherwise).
    return f ? r : +r;
  },

  /*
   * Method 'l': Reads an entire line, splits it by spaces, and returns the resulting array.
   * If 'f' is true, returns an array of strings; otherwise, an array of numbers.
   */
  l: function (f) {
    // Get the current line, increment the line index, then split the line by spaces.
    var s = this._s[this._y++].split(" ");
    // Return the array. If 'f' is true, return as strings; otherwise, map to numbers.
    return f ? s : s.map(a => +a);
  },

  /*
   * Method 'm': Reads 'n' lines, parsing each into an array of values.
   * If 'f' is true, each line is an array of strings; otherwise, an array of numbers.
   * Returns an array of these line arrays.
   */
  m: function (n, f) {
    // Local variables.
    var s = this._s, // Input lines array.
      y = this._y, // Current line index.
      r = [], // Array to store the results.
      i = 0; // Loop counter.

    // If 'f' is true, parse each line into an array of strings.
    if (f) {
      for (; i < n; i++) {
        r[i] = s[y + i].split(" ");
      }
    }
    // Otherwise, parse each line into an array of numbers.
    else {
      for (; i < n; i++) {
        r[i] = s[y + i].split(" ").map(a => +a);
      }
    }

    // Advance the line index by 'n' lines.
    this._y += n;
    // Return the array of parsed lines.
    return r;
  },
};

// Create an instance of the 'gets' class.
// It reads the entire content of "/dev/stdin" as a UTF-8 string.
var o = new gets(require("fs").readFileSync("/dev/stdin", "utf8"));

// Call the 'main' function and print its return value to the console.
console.log(main());


// The main function where the problem logic resides.
function main() {

  // Read the first number, which represents 'n'.
  var n = o.a();
  // Read 'n' lines, each containing two numbers, into a 2D array 'x'.
  var x = o.m(n);

  // Calculate the parity (0 or 1) of the sum of the first coordinate pair.
  // This 't' value is used as a reference parity.
  var t = (x[0][0] + x[0][1]) & 1;

  // Loop through the remaining coordinate pairs to check their parity.
  for (var i = 1; i < n; i++) {
    // Calculate the parity of the current coordinate pair.
    var u = (x[i][0] + x[i][1]) & 1;

    // If any pair's parity 'u' does not match the reference parity 't',
    // it's impossible to solve, so return -1.
    if (u !== t) {
      return -1;
    }
  }

  // Determine 'm', the number of steps/directions.
  // This depends on the parity 't'.
  var m = 32 - t;

  // Initialize an array 'd' which will store decreasing powers of 2.
  // The first element is a large power of 2.
  var d = [1 << 30];

  // Populate the 'd' array. Each element is half of the previous one.
  for (i = 1; i < 31; i++) {
    d[i] = d[i - 1] >> 1; // Right shift by 1 is equivalent to division by 2.
  }

  // If 'm' is even (meaning 't' was 0), ensure the last element of 'd' is 1.
  // This effectively adds a 1 to the 'd' array if 't' was 0.
  if (m % 2 === 0) {
    d[31] = 1;
  }

  // Initialize an array 'w' to store the sequence of moves for each point.
  var w = [];

  // Loop through each point in 'x'.
  for (i = 0; i < n; i++) {
    w[i] = ""; // Initialize the move string for the current point.

    // Loop 'm' times to determine 'm' moves for the current point.
    for (var j = 0; j < m; j++) {
      // Prioritize movement along the axis with the larger absolute coordinate.
      if (Math.abs(x[i][0]) > Math.abs(x[i][1])) {
        // Move along the X-axis.
        if (x[i][0] > 0) {
          x[i][0] -= d[j]; // Move right (decrease X)
          w[i] += "R"; // Append 'R' for Right.
        } else {
          x[i][0] += d[j]; // Move left (increase X)
          w[i] += "L"; // Append 'L' for Left.
        }
      } else {
        // Move along the Y-axis.
        if (x[i][1] > 0) {
          x[i][1] -= d[j]; // Move up (decrease Y)
          w[i] += "U"; // Append 'U' for Up.
        } else {
          x[i][1] += d[j]; // Move down (increase Y)
          w[i] += "D"; // Append 'D' for Down.
        }
      }
    }
  }

  // Return the result in the specified format:
  // m (number of steps)
  // d (space-separated list of powers of 2 used)
  // w (newline-separated list of move strings for each point)
  return m + "\n" + d.join(" ") + "\n" + w.join("\n");
}