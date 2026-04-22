/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged. Only whitespace and comments have been altered
 * extensively to create visual differentiation without affecting logic.
 */

"use strict"; // Enforces strict mode for cleaner code.

// --- Input Handling Utilities ---
// Require the 'fs' module for file system operations.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create an array of tokens.
var cin = input.split(/ |\n/),
  cid = 0; // Current index for 'cin' array.

// Function to get the next number from input.
function next() {
  return +cin[cid++]; // Converts string to number using unary plus operator.
}

// Function to get the next string token from input.
function nextstr() {
  return cin[cid++];
}

// Function to get the next BigInt from input.
function nextbig() {
  return BigInt(cin[cid++]); // Converts string to BigInt.
}

/*
 * Function to read 'n' items from input.
 * If 'a' is true, returns raw strings; otherwise, converts to numbers.
 */
function nexts(n, a) {
  // Check if 'a' (argument for raw string) is truthy.
  if (a) {
    return cin.slice(cid, cid += n); // Return slice of strings.
  } else {
    return cin.slice(cid, cid += n).map(a => +a); // Return slice of numbers.
  }
}

/**
 * Reads a 2D matrix of dimensions h x w from input.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, returns raw strings; otherwise, converts to numbers.
 * @returns {Array<Array<any>>} The 2D array (matrix).
 */
function nextm(h, w, a) {
  var r = [],
    i = 0; // Initialize result array and loop counter.

  if (a) {
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w)); // Add row of strings.
    }
  } else {
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w).map(a => +a)); // Add row of numbers.
    }
  }
  return r;
}

// Function to create multi-dimensional arrays dynamically.
function xArray(v) {
  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Innermost array.

  while (--l) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"; // Wrap with outer arrays.
  }
  return eval(r); // Evaluate the generated string as code.
}


// --- Mathematical Utilities ---

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using Euclidean algorithm.
 * @param {BigInt} a - First number.
 * @param {BigInt} b - Second number.
 * @returns {BigInt} The GCD of a and b.
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a; // Recursive GCD calculation.
}


var mod = 1e9 + 7; // Modulo constant (10^9 + 7).

/**
 * Performs modular multiplication (a * b) % mod.
 * This function uses a specific optimization for multiplication,
 * potentially for larger numbers or specific environments.
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @returns {number} The result of (a * b) % mod.
 */
function mul(a, b) {
  return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod;
}

/**
 * Calculates (a^n) % mod using binary exponentiation (exponentiation by squaring).
 * @param {number} a - Base.
 * @param {number} n - Exponent.
 * @returns {number} The result of (a^n) % mod.
 */
function pow(a, n) {
  for (var r = 1; n; a = mul(a, a), n >>= 1) {
    if (n & 1) { // If the least significant bit of n is 1.
      r = mul(a, r);
    }
  }
  return r;
}

/**
 * Ensures a number is within the range [0, mod-1] by taking modulo and handling negative results.
 * @param {number} n - The number to normalize.
 * @returns {number} The normalized number.
 */
function mput(n) {
  return (n % mod + mod) % mod;
}


// --- Main Execution Flow ---

// Call the main function and store its result.
var myOut = main();

// If main() returns a value, print it to the console.
if (myOut !== undefined) {
  console.log(myOut);
}


// --- Main Logic Function ---

function main() {
  var n = next(); // Read the number of pairs.

  var az = 0,
    bz = 0,
    z = 0; // Counters for special cases: a=0, b=0, both a=0 and b=0.

  var map = {}; // A map to store processed (a,b) pairs and their counts.

  // Loop through 'n' pairs of (a, b).
  for (var i = 0; i < n; i++) {
    var a = nextbig(),
      b = nextbig(); // Read BigInt values for a and b.

    // Handle special cases where a or b (or both) are zero.
    if (a === 0n && b === 0n) {
      z++; // Both a and b are zero.
      continue; // Skip to next pair.
    }
    if (a === 0n) {
      az++; // Only a is zero.
      continue;
    }
    if (b === 0n) {
      bz++; // Only b is zero.
      continue;
    }

    // Calculate GCD to simplify the fraction a/b.
    var c = gcd(a, b);
    a /= c, b /= c; // Divide by GCD to get the simplest form.

    // Normalize (a,b) pair: Ensure 'a' is non-negative.
    // If 'a' is negative, flip signs of both 'a' and 'b'.
    if (a < 0) {
      a = -a, b = -b;
    }

    // Store or update counts in the map.
    // The map structure is map[a][b] = count.
    if (map[a]) {
      // If 'a' already exists as a key in the map.
      if (map[a][b]) {
        // If 'b' also exists for this 'a', double its count.
        map[a][b] *= 2;
        // Apply modulo if count exceeds 'mod'.
        if (map[a][b] >= mod) {
          map[a][b] -= mod;
        }
      } else {
        // If 'b' does not exist, initialize its count to 2.
        map[a][b] = 2;
      }
    } else {
      // If 'a' does not exist, create a new inner map and initialize 'b's count.
      map[a] = {};
      map[a][b] = 2;
    }
  }

  // Calculate initial answer based on zero counts.
  // pow(2, az) represents choices for a=0 cases.
  // pow(2, bz) represents choices for b=0 cases.
  // -1 accounts for the case where neither a=0 nor b=0 is chosen.
  var ans = pow(2, az) + pow(2, bz) - 1;

  // Iterate through the map to process non-zero (a,b) pairs.
  for (var i in map) {
    for (var j in map[i]) {
      var t = 0; // Temporary variable for calculation.

      // Handle pairs where j (representing b) is negative.
      // This part seems to be handling pairs like (a,b) and (-b,a) or similar orthogonal/complementary conditions.
      if (j < 0) {
        // If j is negative, check if its positive counterpart's reciprocal exists.
        // E.g., if (a, -b) is encountered, look for (b, a).
        // If map[-j][i] exists, it means we've already processed the 'complementary' pair.
        // We 'continue' to avoid double-counting or re-processing.
        // This is specifically for (a,b) where a > 0, b < 0. We'd check for (-b, a).
        if (map[j.slice(1)] && map[j.slice(1)][i]) {
          continue;
        }
      } else {
        // If j is positive, check for a 'complementary' pair (-j, i).
        // E.g., if (a, b) is encountered, look for (b, -a).
        // If such a pair exists, its count (minus 1, possibly for base case) is added to 't'.
        if (map[j] && map[j]["-" + i]) {
          t = map[j]["-" + i] - 1;
        }
      }

      // Add the current pair's count to 't'.
      t += map[i][j];

      // Multiply the running answer 'ans' by 't' (modular multiplication).
      ans = mul(ans, t);
    }
  }

  // Final calculation:
  // Add 'z' (count of (0,0) pairs) to the result.
  // Subtract 1 from 'ans' to correct for an initial state, then apply modulo.
  return mput(ans - 1 + z);
}