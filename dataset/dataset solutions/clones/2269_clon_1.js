"use strict"; /* This file contains a set of utility functions for competitive programming,
 * including input reading, modular arithmetic, and combinatorics.
 * It's designed for JavaScript environments like Node.js.
 */
var GET = (function () {

    // The main entry point for creating a GET object.
    // It acts as a factory function.
    function f(s) {
        return new g(s);
    }

    // The internal constructor function for the GET utility.
    // 's' is the raw string input, typically from a file.
    function g(s) {
        // Store the input string as an array of lines.
        // Trim leading/trailing whitespace from the whole input, then split by newlines.
        this._s = s.trim().split("\n");

        // Initialize the current line index to 0.
        // This pointer keeps track of which line to read next.
        this._y = 0;
    }

    // Method 'a': Reads a single item from the end of the current line.
    // This is useful for inputs where numbers are read from right to left,
    // or when only the last item on a line is needed.
    // @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // If the current line is still a string, it means it hasn't been parsed yet.
        // Split it by spaces and reverse the array. Reversing allows 'pop()' to
        // effectively read elements from the *beginning* of the original line.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last element (which was the first in the original line).
        r = s[y].pop();

        // If the current line is now empty (all its elements have been popped),
        // advance the line pointer to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the extracted item. Convert to a number if 'f' is falsy.
        return f ? r : +r;
    };


    // Method 'l': Reads an entire line as an array of items.
    // @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then increment the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return the array of items, converting to numbers if 'f' is falsy.
        return f ? s : s.map(a => +a);
    };


    // Method 'm': Reads 'n' lines as a 2D matrix (array of arrays).
    // Each line is split by spaces.
    // @param {number} n - The number of lines to read.
    // @param {boolean} f - If true, returns a matrix of strings; otherwise, a matrix of numbers.
    g.prototype.m = function (n, f) {
        // Slice 'n' lines starting from the current position.
        // For each sliced line, split it by spaces to form an inner array.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, converting inner elements to numbers if 'f' is falsy.
        return f ? r : r.map(a => a.map(a => +a));
    };


    // Method 'r': Reads 'n' lines as a 1D array.
    // Each line is treated as a single item.
    // @param {number} n - The number of lines to read.
    // @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
    g.prototype.r = function (n, f) {
        // Slice 'n' lines directly.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array, converting each line's content to a number if 'f' is falsy.
        return f ? r : r.map(a => +a);
    };

    // Expose the public factory function 'f'.
    return f;

})(); // End of the Immediately Invoked Function Expression (IIFE) for GET.


// Initialize the input reader 'o' by reading the entire content
// of standard input (`/dev/stdin`) as a UTF-8 string.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Dynamically creates a multi-dimensional array with specified dimensions and initial value.
 * The first argument 'v' is the initial value for all elements.
 * Subsequent arguments define the size of each dimension, from outermost to innermost.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with zeros.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to the function.
        l = a.length,  // Total number of arguments.
        // Start building the array creation string from the innermost dimension.
        // `a[--l]` gets the last argument, which is the size of the innermost array.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the remaining dimensions (from inner to outer).
    while (--l) {
        // Wrap the current 'r' string with another `Array().map()` call
        // to create the next outer dimension.
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create and return the multi-dimensional array.
    return eval(r);
}


// Define the modulo constant. This is a common prime number used in
// competitive programming for modular arithmetic operations.
var mod = 1e9 + 7;


/*
 * Performs modular multiplication for an arbitrary number of arguments.
 * It's designed to handle potential intermediate overflows in JavaScript's
 * floating-point numbers by splitting multiplication into 16-bit parts.
 * All operations are performed modulo 'mod'.
 */
function mul() {
    var a = arguments, // Access all arguments for multiplication.
        r = a[0],      // Initialize the result with the first operand.
        i = a.length;  // Start iterating from the last operand backward.

    // Loop through the remaining arguments, multiplying them with 'r' one by one.
    // The loop runs from the second argument (index 'a.length - 2') down to the first.
    for (; --i;) {
        // Optimized modular multiplication to prevent overflow for large numbers.
        // It splits 'r' into two parts (high 16 bits and low 16 bits),
        // multiplies each part by 'a[i]', and then combines them, taking modulo at each step.
        r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i]) % mod;
    }

    return r;
}


// Declare arrays for precomputing combinatorial values.
// These are used for factorials, inverse factorials, modular inverses, and powers of 2.
var fac = [],
    finv = [],
    invs = [],
    pow2 = [];


/*
 * Precomputes and stores factorials, inverse factorials, modular inverses,
 * and powers of 2 up to a given number 'n'.
 * This function is typically called once at the beginning of a program
 * to optimize subsequent combinatorial calculations.
 */
function fset(n) {
    // Initialize factorial array: fac[i] = i! % mod.
    fac.length = n + 1;
    fac[0] = fac[1] = 1; // 0! = 1, 1! = 1.
    for (var i = 2; i <= n;) {
        fac[i] = mul(fac[i - 1], i++); // fac[i] = (fac[i-1] * i) % mod.
    }

    // Initialize inverse factorial array: finv[i] = (i!)^-1 % mod.
    finv.length = n + 1;
    finv[0] = finv[1] = 1; // (0!)^-1 = 1, (1!)^-1 = 1.
    // Calculate the largest inverse factorial using modular inverse.
    finv[n] = inv(fac[n]);
    // Calculate remaining inverse factorials in descending order.
    // finv[i-1] = finv[i] * i (mod mod) because ( (i-1)! )^-1 = (i!)^-1 * i.
    for (i = n; 2 < i;) {
        finv[i - 1] = mul(finv[i], i--);
    }

    // Initialize modular inverse array: invs[i] = i^-1 % mod.
    invs.length = n + 1;
    invs[0] = invs[1] = 1; // 0 doesn't have an inverse, but often invs[1]=1.
    // Calculate invs[i] = fac[i-1] * finv[i] (mod mod) because i^-1 = (i-1)! * (i!)^-1.
    for (i = 2; i <= n;) {
        invs[i] = mul(fac[i - 1], finv[i++]);
    }

    // Initialize powers of 2 array: pow2[i] = 2^i % mod.
    pow2.length = n + 1;
    pow2[0] = 1; // 2^0 = 1.
    for (i = 1; i <= n; i++) {
        pow2[i] = pow2[i - 1] * 2 % mod; // pow2[i] = (pow2[i-1] * 2) % mod.
    }
}


/*
 * Calculates the modular multiplicative inverse of 'b' modulo 'mod'.
 * This function uses the Extended Euclidean Algorithm.
 * It finds 'x' such that (b * x) % mod == 1.
 * Requires 'mod' to be a prime number for the standard definition of modular inverse.
 */
function inv(b) {
    var a = mod, // 'a' is the modulus.
        u = 0,   // Coefficient for 'a' in Bezout's identity.
        v = 1,   // Coefficient for 'b' in Bezout's identity.
        t;       // Temporary variable for swaps.

    // The core loop of the Extended Euclidean Algorithm.
    // It iteratively reduces 'a' and 'b' while updating 'u' and 'v'.
    for (; b;) {
        t = a / b | 0; // Integer division: quotient.
        a -= t * b;    // Update 'a' (remainder).
        u -= t * v;    // Update 'u' (coefficient for original 'a').

        // Swap (a, b).
        t = a;
        a = b;
        b = t;

        // Swap (u, v).
        t = u;
        u = v;
        v = t;
    }

    u %= mod; // Ensure 'u' is within the range [-(mod-1), mod-1].
    // Adjust 'u' to be positive if it's negative.
    return u < 0 ? u + mod : u;
}


/*
 * Performs modular exponentiation (a^n % mod).
 * This function uses the "exponentiation by squaring" (binary exponentiation) method
 * for efficient calculation of large powers.
 */
function pow(a, n) {
    var r = 1; // Initialize the result to 1 (a^0).

    // Loop while the exponent 'n' is greater than 0.
    for (; n; a = mul(a, a), n >>= 1) {
        // If the current bit of 'n' is 1 (n is odd),
        // multiply the result 'r' by the current base 'a'.
        if (n & 1) {
            r = mul(a, r);
        }
    }

    return r;
}


/*
 * Calculates "n choose r" (nCr) modulo 'mod'.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod mod).
 * Requires the `fset` function to have been called beforehand to precompute
 * factorials and inverse factorials.
 */
function ncr(n, r) {
    // Check for invalid inputs (e.g., r < 0 or r > n).
    // While technically not part of the original, good practice often includes:
    // if (r < 0 || r > n) return 0;
    // if (r === 0 || r === n) return 1;
    // if (r > n / 2) r = n - r; // Optimization: C(n, r) = C(n, n-r)
    return mul(fac[n], finv[r], finv[n - r]);
}


/*
 * Calculates "n permute r" (nPr) modulo 'mod'.
 * nPr = n! / (n-r)! = n! * ((n-r)!)^-1 (mod mod).
 * Requires the `fset` function to have been called beforehand.
 */
function npr(n, r) {
    // Similar input checks as ncr could be added here.
    // if (r < 0 || r > n) return 0;
    return mul(fac[n], finv[r]);
}


// The main execution block of the script.
// It calls the 'main' function and prints its return value to the console.
console.log(main());


/*
 * The primary logic function for the problem.
 * It reads input, performs the necessary calculations, and returns the final answer.
 */
function main() {
    // Read an integer 'n' from the input.
    var n = o.a();

    // Read a line of space-separated integers into an array 'x'.
    var x = o.l();

    // Precompute factorials, inverse factorials, etc., up to n+1.
    // This is needed for combinatorial calculations.
    fset(n + 1);

    var ans = 0; // Initialize the answer variable.

    // Initialize 'u' with (n-1)! modulo 'mod'.
    var u = fac[n - 1];

    // Loop from i = 1 up to (n-1).
    // This loop likely calculates a sum involving differences and combinatorial terms.
    for (var i = 1; i < n; i++) {
        // Add `(x[i] - x[i-1]) * u` to `ans`, all modulo `mod`.
        // The `mul` function handles modular multiplication.
        ans += mul(x[i] - x[i - 1], u);

        // Update 'u' for the next iteration based on a specific formula.
        // The formula involves (n-1)! and the inverse of (i+1).
        u = (u + mul(fac[n - 1], invs[i + 1])) % mod;
    }

    // Ensure the final answer is positive before returning.
    // JavaScript's % operator can return negative results for negative operands.
    return ans % mod;
}