"use strict";

// This section handles input processing from standard input,
// mimicking competitive programming setup for faster I/O.
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
  cid = 0; // `cin` stores tokens, `cid` is current index.

/**
 * Retrieves the next numerical token from the input stream.
 * It automatically increments the internal pointer.
 * @returns {number} The parsed number.
 */
function next() {
  return +cin[cid++]; // Unary plus converts string to number.
}

// Retrieves the next string token from the input stream.
function nextstr() {
  return cin[cid++];
}

/*
 * Fetches the next token and converts it to a BigInt.
 * This is crucial for handling very large integer values.
 * @returns {BigInt} The parsed BigInt.
 */
function nextbig() {
  return BigInt(cin[cid++]);
}

/**
 * Reads 'n' tokens from the input.
 * Can return them as strings or numbers based on the 'a' flag.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, return as strings; otherwise, map to numbers.
 * @returns {Array<string|number>} An array of the read tokens.
 */
function nexts(n, a) {
  if (a) {
    return cin.slice(cid, cid += n);
  } else {
    return cin.slice(cid, cid += n).map(a => +a);
  }
}

/**
 * Reads a 2D matrix of dimensions h x w from the input.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function nextm(h, w, a) {
  var r = [],
    i = 0; // Initialize result array and loop counter.

  if (a) {
    // Read elements as strings.
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w));
    }
  } else {
    // Read elements as numbers.
    for (; i < h; i++) {
      r.push(cin.slice(cid, cid += w).map(a => +a));
    }
  }

  return r;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a value `v`.
 * The dimensions are passed as subsequent arguments.
 * Example: `xArray(0, 2, 3)` creates `[[0,0,0],[0,0,0]]`.
 * @param {*} v - The initial value for array elements.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

  while (--l) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
  }

  return eval(r); // Executes the string as JavaScript code.
}


// --- Mathematical Utility Functions ---

/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInts
 * using the Euclidean algorithm (recursive implementation).
 * @param {BigInt} a - First number.
 * @param {BigInt} b - Second number.
 * @returns {BigInt} The GCD of 'a' and 'b'.
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

var mod = 1e9 + 7; // A common prime modulus used in modular arithmetic.

/**
 * Performs modular multiplication of multiple arguments.
 * It's optimized to prevent intermediate overflows in JavaScript
 * by splitting numbers and using properties of modular arithmetic.
 * @param {...number} args - Numbers to multiply.
 * @returns {number} The product modulo `mod`.
 */
function mul() {
  for (var a = arguments, r = a[0], i = a.length; --i;) {
    // This specific multiplication technique is for performance/precision
    // in environments where numbers might overflow easily before modulo.
    // It's effectively `(r * a[i]) % mod` but broken down.
    r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i]) % mod;
  }
  return r;
}

// Arrays to precompute factorials, inverse factorials, and powers of 2 (if needed).
var fac = [],
  finv = [],
  invs = [],
  pow2 = [];

/**
 * Precomputes factorials and their modular inverses up to 'n'.
 * This is essential for calculating combinations (nCr) and permutations (nPr) quickly.
 * @param {number} n - The upper limit for precomputation.
 */
function fset(n) {
  fac.length = n + 1; // Resize array to hold up to n!.
  fac[0] = fac[1] = 1; // Base cases for factorial.

  // Calculate factorials: fac[i] = fac[i-1] * i.
  for (var i = 2; i <= n;) {
    fac[i] = mul(fac[i - 1], i++);
  }

  finv.length = n + 1; // Resize array for inverse factorials.
  finv[0] = finv[1] = 1; // Base cases for inverse factorial.
  finv[n] = inv(fac[n]); // Calculate (n!)^(-1) mod mod using modular inverse function.

  // Calculate inverse factorials downwards: finv[i-1] = finv[i] * i.
  for (i = n; 2 < i;) {
    finv[i - 1] = mul(finv[i], i--);
  }

  // The following lines are commented out in the original code,
  // but they demonstrate how other precomputations might be done.
  // invs.length=n+1,invs[0]=invs[1]=1;
  // for(i=2;i<=n;)invs[i]=mul(fac[i-1],finv[i++]);
  // pow2.length=n+1,pow2[0]=1;
  // for(i=1;i<=n;i++)pow2[i]=pow2[i-1]*2%mod;
}

/**
 * Computes the modular multiplicative inverse of 'b' modulo `mod`.
 * Uses the Extended Euclidean Algorithm. Assumes `mod` is prime.
 * @param {number} b - The number whose inverse is to be found.
 * @returns {number} The modular inverse of 'b'.
 */
function inv(b) {
  var a = mod,
    u = 0,
    v = 1,
    t; // Variables for Euclidean algorithm.

  while (b) {
    t = a / b | 0; // Integer division.
    a -= t * b;
    u -= t * v;

    // Swap 'a' and 'b', then 'u' and 'v'.
    t = a, a = b, b = t;
    t = u, u = v, v = t;
  }

  u %= mod; // Ensure 'u' is in the positive range [0, mod-1].
  return u < 0 ? u + mod : u;
}

/**
 * Calculates (a^n) % mod using binary exponentiation (exponentiation by squaring).
 * This is very efficient for large exponents.
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} (a^n) % mod.
 */
function pow(a, n) {
  var r = 1; // Initialize result.

  for (; n; a = mul(a, a), n >>= 1) { // Loop while n > 0.
    if (n & 1) { // If the current bit of n is 1.
      r = mul(a, r); // Multiply result by 'a'.
    }
  }

  return r;
}

/**
 * Computes the binomial coefficient "n choose r" modulo `mod`.
 * Requires `fset(n)` to have been called beforehand.
 * Formula: C(n, r) = n! / (r! * (n-r)!)
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} C(n, r) % mod.
 */
function ncr(n, r) {
  return mul(fac[n], finv[r], finv[n - r]);
}

/**
 * Computes the number of permutations "n permute r" modulo `mod`.
 * Requires `fset(n)` to have been called beforehand.
 * Formula: P(n, r) = n! / (n-r)!
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to arrange.
 * @returns {number} P(n, r) % mod.
 */
function npr(n, r) {
  return mul(fac[n], finv[r]);
}

/**
 * Normalizes a number to be within the [0, mod-1] range.
 * Handles negative results from the % operator in JavaScript.
 * @param {number} n - The number to normalize.
 * @returns {number} The normalized number modulo `mod`.
 */
function mput(n) {
  return (n % mod + mod) % mod;
}


// --- Main Program Execution ---

var myOut = main(); // Execute the main function of the problem.

// If the main function returns a value, print it to the console.
if (myOut !== undefined) {
  console.log(myOut);
}

// --- Core Logic for the Problem ---

/**
 * The primary function containing the solution to the problem.
 * It processes pairs of BigInts, categorizes them, and calculates a final result.
 * @returns {number} The computed final answer modulo `mod`.
 */
function main() {
  var n = next(); // Read the total number of pairs.

  var az = 0, // Counter for pairs of type (0, b) where b != 0.
    bz = 0, // Counter for pairs of type (a, 0) where a != 0.
    z = 0; // Counter for pairs of type (0, 0).

  var map = {}, // A hash map to store normalized (a, b) pairs and their counts.
    ar = []; // An array to keep track of unique 'a' values encountered in `map`.

  // Loop through each of the 'n' input pairs.
  for (var i = 0; i < n; i++) {
    var a = nextbig(), // Read the first number of the pair as BigInt.
      b = nextbig(); // Read the second number of the pair as BigInt.

    // Handle special cases first:
    // Case 1: Both 'a' and 'b' are zero.
    if (a === 0n && b === 0n) {
      z++;
      continue; // Move to the next pair.
    }

    // Case 2: 'a' is zero, 'b' is not zero.
    if (a === 0n) {
      az++;
      continue; // Move to the next pair.
    }

    // Case 3: 'b' is zero, 'a' is not zero.
    if (b === 0n) {
      bz++;
      continue; // Move to the next pair.
    }

    // For general cases (a != 0, b != 0):
    // Normalize the pair (a, b) by dividing by their GCD.
    // This reduces them to their simplest form (coprime).
    var c = gcd(a, b);
    a /= c;
    b /= c;

    // Ensure 'a' is always positive for consistent mapping.
    // If 'a' is negative, flip the signs of both 'a' and 'b'.
    if (a < 0) {
      a = -a;
      b = -b;
    }

    // Store the normalized pair (a, b) in the `map`.
    // The structure is `map[a][b] = count`.
    if (map[a]) {
      // If 'a' already exists in the map.
      if (map[a][b]) {
        map[a][b]++; // Increment count for existing (a, b) pair.
      } else {
        map[a][b] = 1; // Initialize count for a new 'b' under this 'a'.
      }
    } else {
      // If 'a' is encountered for the first time.
      map[a] = {}; // Create a new sub-object for this 'a'.
      map[a][b] = 1; // Initialize count for (a, b).
      ar.push(a); // Add 'a' to the list of unique 'a's.
    }
  }

  // Calculate the initial answer based on the special cases (az, bz).
  // The logic is (2^az - 1) + (2^bz - 1) + 1 (for the empty set)
  // Which simplifies to 2^az + 2^bz - 1.
  var ans = pow(2, az) + pow(2, bz) - 1;

  // Process the unique normalized (a, b) pairs stored in `map`.
  for (var k = 0; k < ar.length; k++) {
    var i = ar[k]; // Get a unique 'a' value.

    // Iterate over all 'b' values associated with the current 'a'.
    for (var j in map[i]) {
      var t = 0; // Temporary variable to accumulate contributions for a group.

      // Logic for handling "orthogonal" or "perpendicular" pairs.
      // A common pattern in problems where (a,b) and (-b,a) or (b,-a) are related.
      // If j (which is 'b') is negative.
      if (j < 0) {
        // Check if an "opposite" pair (e.g., (|-b|, a)) has already been processed.
        // If map[-j][i] exists, it means we've already considered this group
        // when processing the positive counterpart of 'j' (i.e., -j).
        // This prevents double-counting or incorrect grouping.
        if (map[j.slice(1)] && map[j.slice(1)][i]) {
          continue;
        }
      } else {
        // If j (which is 'b') is positive.
        // Check for a pair (b, -a) which would be map[j]["-"+i].
        // If such a perpendicular pair exists, add its contribution (2^count - 1).
        if (map[j] && map[j]["-" + i]) {
          t = pow(2, map[j]["-" + i]) - 1;
        }
      }

      // Add the contribution of the current (a, b) group itself (2^count - 1).
      t += pow(2, map[i][j]);

      // Multiply the running answer by the combined contribution of this group.
      // The % mod is applied to 't' before multiplication to keep numbers small.
      ans = mul(ans, t % mod);
    }
  }

  // Final adjustment:
  // Subtract 1 from `ans` (to remove the contribution of the empty set,
  // which is implicitly included in the product logic of (2^k - 1) + 1).
  // Then, add `z` (the count of (0,0) pairs), as they are independent.
  return mput(ans - 1 + z);
}