"use strict"
; /* This line enables strict mode for the entire script. */

// Class I: A custom input parser for competitive programming.
// It reads input based on a specific format.
function I(s, f) {
  // Store the raw input string.
  this._s = s;

  // Current column index within the current line.
  this._c = 0;

  // Current line index.
  this._l = 0;

  // The parsing function to apply to each token (defaults to Number).
  this._f = f || Number;
}


// Method 'a': Reads the next token from the input.
I.prototype.a = function () {
  // Get the current line from the input string.
  var l = this._s.split("\n")[this._l];

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

  // If all tokens on the current line have been consumed,
  // reset the column and move to the next line.
  if (t.length === this._c) {
    this._c = 0;
    this._l++;
  }

  // Apply the parsing function and return the result.
  return this._f(a);
};


// Method 'l': Reads all tokens from the current line.
I.prototype.l = function () {
  // Get the current line from the input string.
  var l = this._s.split("\n")[this._l];

  // Reset the column index for this new line.
  this._c = 0;

  // Move to the next line after processing this one.
  this._l++;

  // Split the line into tokens and apply the parsing function to each.
  return l.split(" ").map(this._f);
};

// This section contains the main logic of the program.
// It's a placeholder for the primary algorithm.
function main(input) {

  // Initialize the custom input parser with the provided input string.
  const o = new I(input);

  // Create an array of 4 elements, initialized to 0.
  const arr = Array(4).fill(0);

  // Loop three times to read three pairs of numbers.
  for (let i = 0; i < 3; i++) {
    // Read the first number of the pair.
    let a = o.a();

    // Read the second number of the pair.
    let b = o.a();

    // Increment the count for the first number (adjusting for 0-based index).
    arr[a - 1]++;

    // Increment the count for the second number (adjusting for 0-based index).
    arr[b - 1]++;
  }

  // Sort the array in ascending order, convert it to a space-separated string,
  // and compare it to the target string "1 1 2 2".
  if (arr.sort((a, b) => a - b).join(" ") === "1 1 2 2") {
    // If the sorted array matches, print "YES".
    console.log("YES");
  } else {
    // Otherwise, print "NO".
    console.log("NO");
  }
} // End of the main function definition.


// Read input from standard input and pass it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));
// This ensures the program can be run with input redirection.