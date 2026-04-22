/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been added, removed, or modified to create a visually
 * different but logically and structurally identical clone.
 */

"use strict"
  ; /* Enforce strict mode for cleaner code practices */

var GET = (

  function (
  ) {

    // Helper function to create a new G instance
    function f(s) {

      return new g(s)
        ; /* Create and return a new G object */

    }

    // Constructor for the G object
    function g(s) {

      /*
       * Initialize the internal string array _s
       * by trimming the input string and splitting it by newlines.
       * Initialize the current line index _y to 0.
       */
      this._s = s.trim().split(
        "\n"
      )
        ;
      this._y = 0
        ;

    }

    // Prototype method 'a' for reading a single value
    g.prototype.a = function (f) {

      var s = this._s
        , // Reference to the internal string array
        y = this._y
        , // Current line index
        r
        ; // Variable to hold the result

      // If the current line is a string, split it and reverse it
      if (typeof s[y] === "string") {

        s[y] = s[y].split(" ").reverse()
          ;

      }

      // Pop the last element from the current line
      r = s[y].pop()
        ;

      // If the current line is now empty, advance to the next line
      if (!s[y].length) {

        this._y++
          ;

      }

      // Return the result, parsing to number if 'f' is false/falsy
      return f ? r : +r
        ;

    }
      ;

    // Prototype method 'l' for reading a line of values
    g.prototype.l = function (f) {

      // Get the current line, split by space, and advance the line index
      var s = this._s[this._y++].split(" ")
        ;

      // Return the values, parsing to numbers if 'f' is false/falsy
      return f ? s : s.map(a => +a)
        ;

    }
      ;

    // Prototype method 'm' for reading a matrix (multiple lines, multiple columns)
    g.prototype.m = function (n, f) {

      /*
       * Slice 'n' lines from the internal array, advance the line index,
       * and map each line to an array of strings (split by space).
       */
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "))
        ;

      // Return the matrix, parsing inner arrays to numbers if 'f' is false/falsy
      return f ? r : r.map(a => a.map(a => +a))
        ;

    }
      ;

    // Prototype method 'r' for reading raw lines
    g.prototype.r = function (n, f) {

      /*
       * Slice 'n' lines from the internal array and advance the line index.
       */
      var r = this._s.slice(this._y, this._y += n)
        ;

      // Return the lines, parsing to numbers if 'f' is false/falsy
      return f ? r : r.map(a => +a)
        ;

    }
      ;

    // Return the factory function 'f'
    return f
      ;

  }

)()
  ; // Immediately invoked function expression to define GET

/*
 * Use the GET factory to create an input object 'o'.
 * It reads content from /dev/stdin using 'fs' module.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"))
  ;

/*
 * Generates a multi-dimensional array initialization string.
 *
 * @param {any} v - The value to fill the innermost array with.
 * @returns {string} A string representation of the array initialization.
 */
function xArray(v) {

  var a = arguments
    , // Access to function arguments
    l = a.length
    , // Number of arguments
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"
    ; // Innermost array initialization

  // Loop to build up the multi-dimensional array string
  while (--l) {

    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"
      ;

  }

  return eval(r)
    ; // Evaluate the generated string to create the array

}

// Define the modulo constant for calculations
var mod = 998244353
  ;

/*
 * Performs modular multiplication of two numbers.
 * This function uses a trick to handle large numbers within JavaScript's
 * floating-point limitations by splitting into high and low bits.
 *
 * @param {number} a - First operand.
 * @param {number} b - Second operand.
 * @returns {number} The result of (a * b) % mod.
 */
function mul(a, b) {

  return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod
    ;

}

/*
 * Performs modular exponentiation (a^n % mod).
 * Uses the binary exponentiation (exponentiation by squaring) algorithm.
 *
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} The result of (a^n) % mod.
 */
function pow(a, n) {

  for (var r = 1; n; a = mul(a, a), n >>= 1) {

    if (n & 1) {

      r = mul(a, r)
        ;

    }

  }

  return r
    ;

}

// Call the main function and print its result to the console
console.log(main())
  ;

/*
 * The main function that encapsulates the problem's logic.
 * It calculates a specific combinatorial value modulo 'mod'.
 */
function main() {

  var n = o.a()
    ; // Read an integer 'n' from input using the GET object

  var ans = pow(3, n)
    ; // Initialize 'ans' with 3^n % mod

  var fac = 2
    , // Initialize 'fac' for factorial-like terms
    m = n / 2
    ; // Calculate half of 'n'

  var inv = []
    ; // Array to store modular inverses

  inv.length = m + 2
    ; // Set the length of the inverse array

  inv[0] = inv[1] = 1
    ; // Base cases for modular inverse

  // Loop to calculate 'ans' and update 'fac' and 'inv'
  for (var i = 0; i < m;) {

    ans -= fac
      ; // Subtract 'fac' from 'ans'

    /*
     * Update 'fac' using modular multiplication:
     * fac = fac * (n - i) * 2 * inv[i] % mod
     */
    fac = mul(mul(fac, (n - i) * 2), inv[++i])
      ;

    /*
     * Calculate modular inverse using the formula:
     * inv[i+1] = mod - (inv[mod % (i+1)] * (mod / (i+1))) % mod
     */
    inv[i + 1] = mod - mul(inv[mod % (i + 1) | 0], (mod / (i + 1) | 0))
      ;

  }

  ans %= mod
    ; // Ensure 'ans' is within the modulo range

  // Return 'ans', adjusting if it's negative
  return ans < 0 ? ans + mod : ans
    ;

}