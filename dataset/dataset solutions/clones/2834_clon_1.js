var GET = (

  // This immediately invoked function expression (IIFE)
  // creates and returns a parsing utility function.
  function () {

    /**
     *  The main entry point function to create a new parser instance.
     *  @param {string} s - The input string to be parsed.
     *  @returns {g} A new instance of the parser object.
     */
    function f(s) {

      return new g(s); // Instantiate and return the parser object.

    }


    /**
     *  Constructor for the parser object.
     *  @param {string} s - The raw input string containing data lines.
     */
    function g(s) {

      // Store the processed lines. Trim removes leading/trailing whitespace,
      // and split separates the string into an array of lines.
      this._s = s.trim().split(

        "\n" // Split by newline character.

      );

      // Initialize the current line index to 0.
      this._y = 0;
    }


    /**
     *  Prototype method 'a' for the parser object.
     *  Reads a single value from the current line, treating it as space-separated.
     *  If the current line is exhausted, moves to the next.
     *  @param {boolean} [f] - If true, returns the value as a string; otherwise, as a number.
     *  @returns {string|number} The parsed value.
     */
    g.prototype.a = function (f) {

      var s = this._s, // Alias for the lines array.
        y = this._y, // Alias for the current line index.
        r; // Variable to store the result.

      // Check if the current line still needs to be processed.
      // If it's a string, it means it hasn't been split and reversed yet.
      if (typeof s[y] === "string") {

        // Split the current line by spaces and reverse it.
        // Reversing allows efficient popping from the end.
        s[y] = s[y].split(" ").reverse();

      }

      // Pop the last element (which is the next value due to reversal).
      r = s[y].pop();

      // If the current line is now empty, increment the line index to move to the next.
      if (!s[y].length) {
        this._y++;
      }

      // Return the result, converting to number if 'f' is falsy.
      return f ? r : +r;
    };


    /**
     *  Prototype method 'l' for the parser object.
     *  Reads an entire line, splitting it by spaces.
     *  @param {boolean} [f] - If true, returns array of strings; otherwise, array of numbers.
     *  @returns {Array<string|number>} An array of values from the current line.
     */
    g.prototype.l = function (f) {

      // Get the current line, increment the index, and split by spaces.
      var s = this._s[this._y++].split(" ");

      // Return based on 'f': raw strings or mapped to numbers.
      return f ? s : s.map(a => +a);
    };


    /**
     *  Prototype method 'm' for the parser object.
     *  Reads a matrix (multiple lines), splitting each line by spaces.
     *  @param {number} n - The number of lines to read for the matrix.
     *  @param {boolean} [f] - If true, returns matrix of strings; otherwise, matrix of numbers.
     *  @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    g.prototype.m = function (n, f) {

      // Slice 'n' lines from the current position, map each line to an array of strings.
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

      // Return based on 'f': raw string matrix or mapped to number matrix.
      return f ? r : r.map(a => a.map(a => +a));
    };


    /**
     *  Prototype method 'r' for the parser object.
     *  Reads 'n' raw lines without further splitting.
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} [f] - If true, returns array of raw strings; otherwise, array of numbers.
     *  @returns {Array<string|number>} An array of raw lines or numbers.
     */
    g.prototype.r = function (n, f) {

      // Slice 'n' lines from the current position.
      var r = this._s.slice(this._y, this._y += n);

      // Return based on 'f': raw strings or mapped to numbers.
      return f ? r : r.map(a => +a);
    };


    return f; // Return the factory function 'f'.

  }

)();


// Initialize the parser 'o' by reading input from stdin.
var o = GET(
  require("fs").readFileSync(
    "/dev/stdin", // Standard input file path.
    "utf8" // Read as UTF-8 encoded text.
  )
);


/**
 *  Generates an N-dimensional array initialization string.
 *  @param {string} v - The initial value for the innermost array elements (e.g., "[]", "0").
 *  @param {...number} dimensions - The sizes of the dimensions, from outermost to innermost.
 *  @returns {Array} An N-dimensional array initialized with the specified value.
 */
function xArray(v) {

  var a = arguments, // Get all arguments passed to the function.
    l = a.length, // Get the total number of arguments.
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Start with the innermost array.

  // Loop to build up the outer dimensions.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"; // Wrap the current 'r' with another array definition.
  }

  // Evaluate the constructed string to create the actual array.
  return eval(r);
}


// Initialize a 2D array 'move' with 6 sub-arrays, each initially empty.
var move = xArray(
  "[]", // Initial value for innermost elements.
  6 // Number of top-level arrays.
);

// Initialize a Set object named 'set' and add 0 to it.
var set = new Set(
  [
    0
  ]
);


// Execute the main logic and print the result to the console.
console.log(
  main()
);


/**
 *  The main function containing the core logic of the program.
 *  It processes input, updates 'move' arrays, performs calculations,
 *  and finds the minimum area.
 *  @returns {number} The minimum calculated area.
 */
function main() {

  var n = o.a(); // Read the number of input operations.

  // Loop through each operation.
  for (
    var i = 0; // Initialize loop counter.
    i < n; // Loop condition.
    i++ // Increment counter.
  ) {

    var x = o.a(); // Read x-coordinate.
    var y = o.a(); // Read y-coordinate.
    var d = o.a(1); // Read direction (as a string).

    // Conditional logic based on direction 'd'.
    if (d === "U") {

      solve(0, y); // Update 'move' array for 'U' direction with y.
      solve(5, x); // Update 'move' array for 'U' direction with x.

    } else if (d === "R") {

      solve(1, x); // Update 'move' array for 'R' direction with x.
      solve(4, y); // Update 'move' array for 'R' direction with y.

    } else if (d === "D") {

      solve(2, y); // Update 'move' array for 'D' direction with y.
      solve(5, x); // Update 'move' array for 'D' direction with x.

    } else { // Direction is 'L'.

      solve(3, x); // Update 'move' array for 'L' direction with x.
      solve(4, y); // Update 'move' array for 'L' direction with y.

    }
  }

  // Perform initial calculations and add values to the 'set'.
  calc(move[0][1], move[4][1], move[2][1]);
  calc(-move[2][0], -move[4][0], -move[0][0]);
  calc(move[1][1], move[5][1], move[3][1]);
  calc(-move[3][0], -move[5][0], -move[1][0]);

  var ans = 1e18; // Initialize 'ans' with a very large number (10^18).

  // Iterate through each value 'i' in the 'set'.
  for (var i of set) {

    // Calculate 'u' (upper bound).
    var u = max(
      move[0][1] + i,
      move[2][1] - i,
      move[4][1]
    );

    // Calculate 'd' (lower bound).
    var d = min(
      move[0][0] + i,
      move[2][0] - i,
      move[4][0]
    );

    // Calculate 'r' (right bound).
    var r = max(
      move[1][1] + i,
      move[3][1] - i,
      move[5][1]
    );

    // Calculate 'l' (left bound).
    var l = min(
      move[1][0] + i,
      move[3][0] - i,
      move[5][0]
    );

    // Calculate the area 's'.
    var s = (u - d) * (r - l);

    // Update 'ans' if the current area 's' is smaller.
    if (s < ans) {
      ans = s;
    }
  }

  return ans; // Return the minimum area found.
}


/**
 *  Updates the range (min/max) for a specific 'move' array index.
 *  Each 'move[i]' is expected to be an array of two elements: [min, max].
 *  @param {number} i - The index of the 'move' array to update.
 *  @param {number} z - The new value to consider for the range.
 */
function solve(i, z) {

  // Check if the 'move[i]' array already contains elements (i.e., initialized).
  if (move[i].length) {

    // If 'z' is smaller than the current minimum, update the minimum.
    if (move[i][0] > z) {
      move[i][0] = z;
    }
    // Else if 'z' is larger than the current maximum, update the maximum.
    else if (move[i][1] < z) {
      move[i][1] = z;
    }

  } else {

    // If 'move[i]' is empty, initialize both min and max with 'z'.
    move[i][0] = move[i][1] = z;

  }
}


/**
 *  Calculates potential values based on given inputs and adds them to the 'set'.
 *  Uses Math.max(0, ...) to ensure non-negative values.
 *  @param {number} u - First input value.
 *  @param {number} x - Second input value.
 *  @param {number} d - Third input value.
 */
function calc(u, x, d) {

  // Add (d - x) or 0 to the set.
  set.add(Math.max(0, (d - x) || 0));

  // Add (d - u) / 2 or 0 to the set.
  set.add(Math.max(0, ((d - u) / 2) || 0));

  // Add (x - u) or 0 to the set.
  set.add(Math.max(0, (x - u) || 0));

}


/**
 *  Finds the maximum value among its arguments, ignoring NaN.
 *  @param {...number} values - Numbers to compare.
 *  @returns {number} The maximum value.
 */
function max() {

  var a = arguments; // Get all arguments as an array-like object.
  var r = a[0]; // Initialize result with the first argument.

  // Iterate from the second argument onwards.
  for (
    var i = 1; // Start from the second element.
    i < a.length; // Loop until the end of arguments.
    i++ // Increment index.
  ) {

    // Skip if the current argument is NaN.
    if (isNaN(a[i])) {
      continue;
    }

    // If current result 'r' is already greater, skip.
    if (r > a[i]) {
      continue;
    }

    r = a[i]; // Update 'r' if a larger value is found.
  }

  return r; // Return the maximum value.
}


/**
 *  Finds the minimum value among its arguments, ignoring NaN.
 *  @param {...number} values - Numbers to compare.
 *  @returns {number} The minimum value.
 */
function min() {

  var a = arguments; // Get all arguments as an array-like object.
  var r = a[0]; // Initialize result with the first argument.

  // Iterate from the second argument onwards.
  for (
    var i = 1; // Start from the second element.
    i < a.length; // Loop until the end of arguments.
    i++ // Increment index.
  ) {

    // Skip if the current argument is NaN.
    if (isNaN(a[i])) {
      continue;
    }

    // If current result 'r' is already smaller, skip.
    if (r < a[i]) {
      continue;
    }

    r = a[i]; // Update 'r' if a smaller value is found.
  }

  return r; // Return the minimum value.
}