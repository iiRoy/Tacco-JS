var GET = (function() {
  // This is a self-executing anonymous function that returns a factory function 'f'.

  /**
   * Factory function to create a new GET instance.
   * @param {string} s - The input string.
   * @returns {g} A new instance of the 'g' class.
   */
  function f(s) {
    return new g(s); // Creates and returns a new 'g' object.
  }

  /**
   * Constructor for the 'g' class.
   * Initializes the internal state for reading input.
   * @param {string} s - The raw input string, typically read from a file.
   */
  function g(s) {
    // Trim whitespace from the input string and split it into an array of lines.
    this._s = s.trim().split("\n");
    // Initialize the current line index to 0.
    this._y = 0;
  }

  /**
   * Reads a single element from the current line.
   * If the current line hasn't been processed yet, it reverses the order of elements.
   * @param {boolean} f - If true, returns the element as a string; otherwise, as a number.
   * @returns {string|number} The read element.
   */
  g.prototype.a = function(f) {
    var s = this._s; // Reference to the array of lines.
    var y = this._y; // Current line index.
    var r; // Variable to hold the result.

    // Check if the current line is a string (meaning it hasn't been split and reversed yet).
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse(); // Split the line by spaces and reverse the array.
    }

    r = s[y].pop(); // Pop the last element (which is effectively the first due to reversal).

    // If the current line is empty after popping, advance to the next line.
    if (!s[y].length) {
      this._y++;
    }

    return f ? r : +r; // Return as string if 'f' is true, otherwise convert to number.
  };

  /**
   * Reads an entire line and returns it as an array of elements.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of elements from the line.
   */
  g.prototype.l = function(f) {
    // Get the current line, split it by spaces, and then increment the line index.
    var s = this._s[this._y++].split(" ");

    return f ? s : s.map(a => +a); // Return as strings or map to numbers.
  };

  /**
   * Reads 'n' lines and returns them as a 2D array (matrix).
   * Each line is split into elements.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array of elements.
   */
  g.prototype.m = function(n, f) {
    // Slice 'n' lines from the input, starting from the current index,
    // and then increment the current index by 'n'.
    var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

    // Return as strings or map all elements in the 2D array to numbers.
    return f ? r : r.map(a => a.map(a => +a));
  };

  /**
   * Reads 'n' lines and returns them as a 1D array.
   * Each line is treated as a single element.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of elements.
   */
  g.prototype.r = function(n, f) {
    // Slice 'n' lines from the input, starting from the current index,
    // and then increment the current index by 'n'.
    var r = this._s.slice(this._y, this._y += n);

    return f ? r : r.map(a => +a); // Return as strings or map to numbers.
  };

  return f; // Return the factory function 'f'.
})(); // End of IIFE

// Initialize the input reader 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a value.
 * Uses eval, so caution is advised for untrusted input.
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray(v) {
  var a = arguments; // All arguments passed to the function.
  var l = a.length; // Number of arguments.
  // Build the innermost array creation string.
  var r = "Array(a[" + (--l) + "]).fill(0).map(x=>{return " + v + ";})";

  // Build up the outer array creation strings.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  return eval(r); // Evaluate the dynamically constructed string to create the array.
}

// Define the modulus for modular arithmetic operations.
var mod = 1000003;

/**
 * Performs modular multiplication of multiple numbers.
 * The implementation uses a specific trick for multiplication by breaking down numbers.
 * @param {...number} a - Numbers to multiply.
 * @returns {number} The result of the modular multiplication.
 */
function abmod() {
  var a = arguments; // All arguments.
  var r = a[0]; // Initialize result with the first argument.
  var i = 1; // Start from the second argument.

  while (i < a.length) {
    // This is a specific modular multiplication optimization:
    // (r * b) % mod = ((r_high * 65536 + r_low) * b) % mod
    // = (r_high * b * 65536 + r_low * b) % mod
    // This assumes mod is a prime and aims to avoid overflow with intermediate products.
    r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]) % mod;
  }

  return r; // Return the final modular product.
}

// Initialize an array to store factorials.
var fac = [1, 1];

/**
 * Pre-computes factorials up to 'n' modulo 'mod'.
 * Stores them in the 'fac' array.
 * @param {number} n - The maximum number for which to compute factorial.
 */
function fSet(n) {
  // Loop from 2 up to 'n'.
  for (var i = 2; i <= n;) {
    // Calculate fac[i] as (fac[i-1] * i) % mod.
    fac[i] = abmod(fac[i - 1], i++);
  }
}

/**
 * Computes the modular multiplicative inverse of 'a' modulo 'mod'
 * using the Extended Euclidean Algorithm.
 * Assumes 'mod' is prime.
 * @param {number} a - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'a'.
 */
function modinv(a) {
  var b = mod; // 'b' is the modulus.
  var u = 1; // Coefficient for 'a'.
  var v = 0; // Coefficient for 'b'.
  var t; // Temporary variable.

  // Extended Euclidean Algorithm.
  while (b) {
    t = a / b | 0; // Integer division.
    a -= t * b; // Update 'a'.
    u -= t * v; // Update 'u'.

    // Swap (a, b) and (u, v).
    t = a;
    a = b;
    b = t;
    t = u;
    u = v;
    v = t;
  }

  u %= mod; // Ensure 'u' is within [0, mod-1].
  return u < 0 ? u + mod : u; // Adjust for negative results.
}

/**
 * Computes nPr (permutations) modulo 'mod'.
 * nPr = n! / (n-r)!
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} nPr modulo 'mod'.
 */
function nPrmod(n, r) {
  // nPr = n! * ( (n-r)! )^-1 mod mod
  // We need to handle cases where (n-r) might be negative due to (n-r+mod)%mod if r > n.
  // However, for permutations, r must be <= n. The modulo on (n-r) is unusual here,
  // perhaps to ensure a positive index, but (n-r) should always be non-negative.
  return abmod(fac[n], modinv(fac[(n - r + mod) % mod]));
}

/**
 * Computes (a^n) modulo 'mod' using binary exponentiation (exponentiation by squaring).
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} (a^n) modulo 'mod'.
 */
function powmod(a, n) {
  var r = 1; // Initialize result to 1.

  // Iterate while 'n' is greater than 0.
  for (; n; a = abmod(a, a), n >>= 1) {
    // If the last bit of 'n' is 1, multiply 'r' by 'a'.
    if (n & 1) {
      r = abmod(a, r);
    }
  }

  return r; // Return the final result.
}

// Call the main function and print its result to the console.
console.log(main());

/**
 * The main function that processes queries and calculates results.
 * @returns {string} The final answer string, with results separated by newlines.
 */
function main() {
  // Read the number of queries 'q' from input.
  var q = o.a();
  // Initialize an array to store answers for each query.
  var ans = Array(q).fill(0);

  // Pre-compute factorials up to 'mod' (which is actually mod-1, as mod is prime).
  // The definition of 'fSet' goes up to 'n', so 'mod' means up to mod-1.
  fSet(mod);

  // Process each query.
  for (var i = 0; i < q; i++) {
    // Read a line containing three numbers: t[0]=x, t[1]=d, t[2]=n.
    var t = o.l(),
      x = t[0],
      d = t[1],
      n = t[2];

    // If n is greater than or equal to mod, or x is 0, the result is 0 (mod mod).
    // This is because Fermat's Little Theorem applies when exponent is mod-1,
    // and for n >= mod, the result will be 0 if mod is prime and x is a multiple of mod,
    // or (x^(n % (mod-1))) if x is not a multiple of mod.
    // However, the problem statement implies a direct 0 for n >= mod.
    if (n >= mod || x === 0) {
      continue; // Skip this query, answer remains 0.
    }

    // Special case: if d is 0.
    if (d === 0) {
      // The expression becomes x^n.
      ans[i] = powmod(x, n);
    } else {
      // General case: d is not 0.
      // Calculate 'a' = (mod - x * d^-1) % mod.
      // The inner (mod-abmod(x,modinv(d)))%mod+mod)%mod ensures a positive result.
      var a = ((mod - abmod(x, modinv(d))) % mod + mod) % mod;
      // Calculate 'p' = aPn.
      var p = nPrmod(a, n);
      // Calculate 'm' = (mod-d)^n.
      var m = powmod(mod - d, n);
      // The final answer is (p * m) % mod.
      ans[i] = abmod(p, m);
    }
  }

  // Join the calculated answers with newline characters.
  return ans.join("\n");
}