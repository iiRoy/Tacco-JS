/*
 * This file contains utility functions and a main program logic.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from an original source.
 */

// Function to parse a string into an integer.
function    pint(s) {
  return parseInt(s);
}


// Function to parse a string into a floating-point number.
function pfloat(s) {
  return parseFloat(s);
}

// Extend Array prototype for numeric ascending sort.
Array.prototype.sortNumAsc = function() {
  return this.sort((a, b) => (a - b));
};

/*
 * Extend Array prototype for numeric descending sort.
 * This will sort an array of numbers in reverse order.
 */
Array.prototype.sortNumDesc = function() {
  return this.sort((a, b) => (b - a));
};

// Extend Array prototype for string ascending sort.
Array.prototype.sortStrAsc = function() {
  return this.sort();
};

// Extend Array prototype for string descending sort.
Array.prototype.sortStrDesc = function() {
  return this.sort().reverse();
};

/*
 * Extend Array prototype to return a new array
 * with a specific item removed.
 */
Array.prototype.without = function(itm) {
  return this.filter((elem) => elem !== itm);
};

// Variable to accumulate input from stdin.
let input = '';

// Resume stdin to start receiving data.
process.stdin.resume();

// Set the encoding for stdin.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', chunk => input += chunk);

/*
 * Event listener for the 'end' of stdin.
 * Processes the input and calls the main function.
 */
process.stdin.on('end', () => {
  // Split input into lines, trim each line.
  let lines = input.split('\n').map(l => l.trim());

  // Remove the last line if it's empty (common for input streams).
  if (lines[lines.length - 1] === '') {
    lines = lines.slice(0, -1);
  }

  // Call the main program logic with the processed lines.
  main(lines);
});


/**
 * The main function that contains the core logic of the program.
 * It takes an array of strings (lines) as input.
 * @param {string[]} lines - An array of input lines.
 */
function main(lines) {
  // Destructure the first line into three variables: a, b, and c.
  let [a, b, c] = lines[0].split(' ').map(x => x.trim());

  // Check conditions and print "YES" or "NO".
  console.log(
    (a[a.length - 1] === b[0] && // Check if the last character of 'a' matches the first character of 'b'.
      b[b.length - 1] === c[0]) // Check if the last character of 'b' matches the first character of 'c'.
    ?
    "YES" // If both conditions are true.
    :
    "NO" // Otherwise.
  );
}