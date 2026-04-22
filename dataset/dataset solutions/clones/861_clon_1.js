/*
 * This JavaScript file is a collection of utility functions and
 * prototype extensions, culminating in a main execution block
 * that solves a specific algorithmic problem.
 *
 * It demonstrates common patterns for competitive programming or
 * general utility scripting in Node.js environments.
 */

// Assign console.log to a shorter alias for convenience.
print = console.log;

// Read all input from standard input.
// The input is treated as UTF-8, split into lines,
// and the last (potentially empty) line is removed.
ls = require("fs")
  .readFileSync("/dev/stdin", "utf-8")
  .split("\n");

ls.length--; // Adjust array length to discard the final empty string if present.


/*
 * Extend the Object.prototype with a 'trace' method.
 * This method is useful for debugging as it prints the string
 * representation of the object to the console and then returns
 * the object itself, allowing for method chaining.
 */
Object.prototype.trace = function() {
  print(this + "");
  return this;
};


/*
 * Extend String.prototype with an 'int' method.
 * This method splits the string by a specified delimiter (or space by default),
 * and then converts each resulting segment into an integer using the global 'int' function.
 */
String.prototype.int = function(c) {
  return this.split(c || " ")
    .map(int);
};


// Create a short alias for Array.prototype to simplify further extensions.
ap = Array.prototype;


/*
 * Add a 'trace' method to Array.prototype.
 * Similar to Object.prototype.trace, it prints the array's content
 * and returns the array itself for chaining.
 */
ap.trace = function() {
  print(this);
  return this;
};


/*
 * Add a 'max' method to Array.prototype.
 * This method finds and returns the maximum numeric value within the array.
 * It leverages Math.max.apply to handle arrays.
 */
ap.max = function() {
  return Math.max.apply(null, this);
};


/*
 * Add a 'min' method to Array.prototype.
 * This method finds and returns the minimum numeric value within the array.
 * It uses Math.min.apply for array processing.
 */
ap.min = function() {
  return Math.min.apply(null, this);
};


/*
 * Add a 'copy' method to Array.prototype.
 * This creates a shallow copy of the array using the 'map' method
 * with the identity function 'id'.
 */
ap.copy = function() {
  return this.map(id);
};


/*
 * Add a 'rotate' method to Array.prototype.
 * This method rotates the array elements by 'n' positions.
 * Elements that are shifted off the beginning are re-appended to the end.
 */
ap.rotate = function(n) {
  return this.slice(n, this.length)
    .concat(this.slice(0, n));
};


/*
 * Add a 'permutation' method to Array.prototype.
 * This method computes all possible permutations of the array's elements.
 * It uses a recursive approach to generate the permutations.
 */
ap.permutation = function() {
  if (this.length == 0) {
    return [];
  }
  if (this.length == 1) {
    return [this];
  }

  var ret = [],
    ar = this,
    i = 0;

  for (; i < ar.length; ++i) {
    ret = ret.concat(
      ar.slice(0, i) // Elements before the current element
      .concat(ar.slice(i + 1, ar.length)) // Elements after the current element
      .permutation() // Recursively permute the remaining elements
      .map(function(p) {
        return p.concat(ar[i]); // Append the current element to each sub-permutation
      })
    );
  }
  return ret;
};


/*
 * Add a 'flatten' method to Array.prototype.
 * This method flattens a nested array by one level.
 * For example, `[[1, 2], [3]]` becomes `[1, 2, 3]`.
 */
ap.flatten = function() {
  for (var i = 0, ret = []; i < this.length; ++i) {
    ret = ret.concat(this[i]);
  }
  return ret;
};


/*
 * Add a 'nub' method to Array.prototype.
 * This method removes duplicate elements from the array, preserving
 * the order of the first occurrence of each unique element.
 */
ap.nub = function() {
  var that = this; // Capture 'this' for use in the filter callback.
  return this.filter(function(x, i) {
    // Return true if the element 'x' does not appear later in the array.
    return that.slice(i + 1).indexOf(x) < 0;
  });
};


/*
 * Global helper function: iota
 * Generates an array of 'n' numbers.
 * Starts from 'b' (default 0) and increments by 's' (default 1) for each element.
 */
function iota(n, b, s) {
  b = b || 0; // Default starting value is 0.
  s = s || 1; // Default step value is 1.
  for (var ret = []; n--; b += s) {
    ret.push(b);
  }
  return ret;
}


/*
 * Global helper function: int
 * Converts its input 's' into an integer using the unary plus operator.
 */
function int(s) {
  return +s;
}


/*
 * Global helper function: add
 * Returns the sum of two numbers, 'a' and 'b'.
 */
function add(a, b) {
  return a + b;
}


/*
 * Global helper function: sub
 * Returns the difference of two numbers, 'a' minus 'b'.
 */
function sub(a, b) {
  return a - b;
}


/*
 * Global helper function: bus
 * Returns the difference of two numbers, 'b' minus 'a'.
 */
function bus(a, b) {
  return b - a;
}


/*
 * Global helper function: id
 * The identity function, simply returns its input 'x' unchanged.
 */
function id(x) {
  return x;
}


/*
 * Main program execution block.
 * This is an Immediately Invoked Function Expression (IIFE)
 * to encapsulate variables and prevent global pollution.
 */
(function main() {
  // Parse input values from the 'ls' array.
  // n: The total size or dimension from the first line.
  // ab: An array containing two integer coordinates (a, b) from the second line.
  // cd: An array containing two integer coordinates (c, d) from the third line.
  var n = +ls[0],
    ab = ls[1].int(),
    a = ab[0],
    b = ab[1],
    cd = ls[2].int(),
    c = cd[0],
    d = cd[1];

  // Initialize 'min' with a large value, representing a maximum possible distance.
  var min = n * n;

  /*
   * Helper function 'dis':
   * Calculates the Manhattan distance between two points (a,b)
   * if they were mapped onto a grid of size 'i' x 'i'.
   * The grid coordinates are derived using modulo and integer division.
   */
  function dis(a, b, i) {
    return Math.abs((a % i) - (b % i)) + Math.abs(((a / i) | 0) - ((b / i) | 0));
  }


  // Loop through possible grid sizes, from 1 up to (n-1).
  for (var i = 1; i < n; ++i) {
    // Calculate the total combined distance for the current grid size 'i'.
    // This sum includes the distance between (a, b) and the distance between (c, d).
    var d = dis(a, b, i) + dis(c, d, i);

    /*
     * The following line is commented out in the original code.
     * It would typically be used for debugging to show the current
     * grid size 'i' and the calculated distance 'd'.
     * print(i, d);
     */

    // If the newly calculated total distance 'd' is less than the current minimum,
    // update 'min' to this new smaller value.
    if (min > d) {
      min = d;
    }
  }

  // After iterating through all possible grid sizes, print the overall minimum distance found.
  print(min);
})();


/*
 * This is a special comment for the Vim text editor.
 * It instructs Vim to treat this file as a JavaScript file,
 * which helps with syntax highlighting and other editor features.
 */
// vim: set ft=javascript: