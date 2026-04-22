"use strict"; /* This directive enables strict mode, ensuring cleaner code and catching common errors. */
var input = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input data from /dev/stdin as a UTF-8 string.

// Initialize input processing variables.
var cin = input.split(/ |\n/), /* Split the input string by spaces or newlines into an array of tokens. */
    cid = 0;                     // 'cid' (current index) tracks the position in the 'cin' array.

// --- Utility Functions for Input Parsing ---

/**
 * Retrieves and parses the next token from the input array as a number.
 * @returns {number} The parsed number.
 */
function next() {
    return +cin[cid++]; /* The unary '+' operator converts the string token to a number. cid is then incremented. */
}

/**
 * Retrieves the next token from the input array as a string.
 * @returns {string} The string token.
 */
function nextstr() {
    return cin[cid++]; /* Returns the string token directly, then increments cid. */
}

/**
 * Retrieves and parses the next token from the input array as a BigInt.
 * @returns {BigInt} The parsed BigInt.
 */
function nextbig() {
    return BigInt(cin[cid++]); /* Converts the string token to a BigInt. cid is then incremented. */
}

/**
 * Retrieves 'n' tokens from the input array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, tokens are returned as strings; otherwise, they are parsed as numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function nexts(n, a) {
    // Determine whether to return strings or numbers based on the 'a' parameter.
    return a
           ? cin.slice(cid, cid += n)             /* If 'a' is true, return a slice of string tokens. */
           : cin.slice(cid, cid += n).map(val => +val); /* If 'a' is false, return a slice of number tokens. */
}

/**
 * Reads a 2D matrix from the input.
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns in the matrix.
 * @param {boolean} a - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function nextm(h, w, a) {
    var r = [], /* Initialize an empty array to store the rows of the matrix. */
        i = 0;  // Loop counter for rows.

    if (a) { /* If 'a' is true, elements are treated as strings. */
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w)); /* Push a slice of string tokens for the current row. */
        }
    } else { /* Otherwise, elements are parsed as numbers. */
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(val => +val)); /* Push a slice of number tokens for the current row. */
        }
    }
    return r; // Return the complete matrix.
}

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions.
 * This function uses `eval`, which can be a security risk if input is untrusted.
 * @param {*} v - The initial value to fill the innermost array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, /* 'a' holds all arguments passed to the function (dimensions). */
        l = a.length,  // 'l' is the total number of dimensions.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; /* Innermost array creation string. */

    while (--l) { /* Loop to build the outer array creation strings. */
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r); /* Execute the dynamically generated string to create the array. */
}

// --- Modular Arithmetic Utilities ---

var mod = 1e9 + 7; /* The modulo constant used for all modular arithmetic operations. */

/**
 * Multiplies an arbitrary number of arguments modulo 'mod'.
 * This function uses a specific optimization for modular multiplication.
 * @returns {number} The product modulo 'mod'.
 */
function mul() {
    var a = arguments, /* 'a' holds all numbers to be multiplied. */
        r = a[0],      // Initialize result with the first argument.
        i = a.length;  // Start loop from the last argument.

    for (; --i;) { /* Loop from the second-to-last argument down to the second. */
        // This is a specific modular multiplication optimization:
        // (x * y) % m = (((x >> 16) * y % m * 65536) + ((x & 65535) * y)) % m
        r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i]) % mod;
    }
    return r; // Return the final modular product.
}

// Arrays for precomputed values in combinatorics.
var fac = [],   /* Stores factorials (n!). */
    finv = [],  /* Stores inverse factorials (1/n! mod mod). */
    invs = [],  /* (Commented out in original) Stores modular inverses (1/n mod mod). */
    pow2 = [];  /* (Commented out in original) Stores powers of 2 (2^n mod mod). */

/**
 * Precomputes factorials and inverse factorials up to 'n' modulo 'mod'.
 * @param {number} n - The maximum value for which to precompute.
 */
function fset(n) {
    fac.length = n + 1; /* Set the length of the factorial array. */
    fac[0] = fac[1] = 1; /* Base cases: 0! = 1, 1! = 1. */

    for (var i = 2; i <= n;) { /* Calculate factorials iteratively. */
        fac[i] = mul(fac[i - 1], i++); /* fac[i] = (i-1)! * i. */
    }

    finv.length = n + 1; /* Set the length of the inverse factorial array. */
    finv[0] = finv[1] = 1; /* Base cases: 1/0! = 1, 1/1! = 1. */
    finv[n] = inv(fac[n]); /* Calculate 1/n! using modular inverse function. */

    for (i = n; 2 < i;) { /* Calculate inverse factorials in descending order. */
        finv[i - 1] = mul(finv[i], i--); /* finv[i-1] = finv[i] * i. */
    }

    // The following lines are commented out in the original code,
    // so they remain commented here to preserve Type I cloning.
    // invs.length=n+1,invs[0]=invs[1]=1;
    // for(i=2;i<=n;)invs[i]=mul(fac[i-1],finv[i++]);
    // pow2.length=n+1,pow2[0]=1;
    // for(i=1;i<=n;i++)pow2[i]=pow2[i-1]*2%mod;
}

/**
 * Computes the modular multiplicative inverse of 'b' modulo 'mod'.
 * Uses the extended Euclidean algorithm.
 * @param {number} b - The number for which to find the inverse.
 * @returns {number} The modular inverse of 'b'.
 */
function inv(b) {
    var a = mod, /* 'a' starts as the modulus. */
        u = 0,   // Coefficient for 'a' in Bezout's identity.
        v = 1,   // Coefficient for 'b' in Bezout's identity.
        t;       // Temporary variable for swaps.

    for (; b; v = t) { /* Loop until 'b' becomes zero. */
        t = a / b | 0; /* Calculate quotient (integer division). */
        a -= t * b;    /* Update 'a'. */
        u -= t * v;    /* Update 'u'. */
        t = a;         /* Swap 'a' and 'b'. */
        a = b;
        b = t;
        t = u;         /* Swap 'u' and 'v'. */
        u = v;
    }
    u %= mod; /* Ensure 'u' is within the modulo range. */
    return u < 0 ? u + mod : u; /* Adjust negative results to be positive. */
}

/**
 * Computes (a^n) modulo 'mod' using the exponentiation by squaring algorithm.
 * @param {number} a - The base.
 * @param {number} n - The exponent.
 * @returns {number} (a^n) mod 'mod'.
 */
function pow(a, n) {
    var r = 1; /* Initialize result to 1. */
    for (; n; a = mul(a, a), n >>= 1) { /* Loop while 'n' is greater than zero. */
        if (n & 1) { /* If the least significant bit of 'n' is 1. */
            r = mul(a, r); /* Multiply result by current 'a'. */
        }
    }
    return r; // Return the final power.
}

/**
 * Computes "n choose r" (nCr) modulo 'mod'.
 * Requires 'fset' to have been called for factorials and inverse factorials.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to choose.
 * @returns {number} nCr mod 'mod'.
 */
function ncr(n, r) {
    return mul(fac[n], finv[r], finv[n - r]); /* nCr = n! / (r! * (n-r)!) mod mod. */
}

/**
 * Computes "n permute r" (nPr) modulo 'mod'.
 * Requires 'fset' to have been called for factorials and inverse factorials.
 * @param {number} n - Total number of items.
 * @param {number} r - Number of items to permute.
 * @returns {number} nPr mod 'mod'.
 */
function npr(n, r) {
    return mul(fac[n], finv[n - r]); /* nPr = n! / (n-r)! mod mod. */
}

/**
 * Ensures a number is within the [0, mod-1] range by taking modulo and adjusting negative results.
 * @param {number} n - The number to normalize.
 * @returns {number} The normalized number.
 */
function mput(n) {
    return (n % mod + mod) % mod; /* Ensures the result is always positive and within [0, mod-1]. */
}

// --- Main Program Execution Flow ---

// Calculate a timestamp used for an internal timeout check.
var tm = +(new Date()) + 1900; /* Get current time in milliseconds and add 1900 for a future timeout. */

// Execute the main logic of the program.
var myOut = main(); /* Call the 'main' function and store its return value. */

// Output the result if it's not undefined.
if (myOut !== undefined) { /* Check if the main function returned a value. */
    console.log(String(myOut)); /* Convert the result to a string and print it to standard output. */
}

/**
 * The core logic of the program.
 * It reads input values, performs a specific bitwise operation and adjustment algorithm,
 * and returns a BigInt result or -1 if a condition is met.
 * @returns {BigInt|number} The calculated answer or -1.
 */
function main() {
    var n = next(); /* Read the first integer, which is 'n'. */

    var a1 = nextbig(), /* Read the first BigInt value, 'a1'. */
        a2 = nextbig(); /* Read the second BigInt value, 'a2'. */

    var x = 0n; /* Initialize a BigInt variable 'x' to zero. */

    // Loop to calculate the XOR sum of 'n-2' subsequent BigInts.
    for (var i = 2; i < n; i++) {
        x ^= nextbig(); /* XOR 'x' with each subsequent BigInt from input. */
    }

    var ans = 0n,         /* Initialize the answer variable as a BigInt. */
        a = a1 ^ a2 ^ x;  /* Calculate the initial value of 'a' using XOR. */

    // Main loop: continues as long as 'a' is not equal to 0n.
    while (a) {
        // Check for an early termination condition.
        if (a1 === 1 || new Date() > tm) { /* If a1 is 1 OR the current time exceeds the timeout. */
            return -1; /* Return -1 to indicate an error or specific condition met. */
        }

        // Inner loop: iterates through bit positions from 40 down to 0.
        for (var i = 40; i >= 0; i--) {
            var k = 1n << BigInt(i); /* Calculate 2^i as a BigInt for bitwise operations. */

            if ((a & k) === 0n) { /* Check if the i-th bit of 'a' is zero. */
                continue; /* If it's zero, move to the next bit position. */
            }

            var u; /* Declare a temporary BigInt variable 'u'. */
            u = (a1 & (k - 1n)) + 1n; /* Calculate the first part of 'u'. */
            u = min(u, k - (a2 & (k - 1n))); /* Update 'u' using the 'min' helper function. */

            if (u < a1) { /* Check if 'u' is strictly less than 'a1'. */
                ans += u; /* Add 'u' to the total answer. */
                a1 -= u;  /* Subtract 'u' from 'a1'. */
                a2 += u;  /* Add 'u' to 'a2'. */
                break;    /* Break out of the inner loop (bit position loop). */
            } else {
                return -1; /* If u is not less than a1, return -1. */
            }
        }
        a = a1 ^ a2 ^ x; /* Recalculate 'a' based on the updated 'a1' and 'a2' for the next main loop iteration. */
    }
    return ans; /* Return the final calculated answer. */
}

/**
 * A simple helper function to determine the minimum of two BigInt values.
 * @param {BigInt} a - The first BigInt.
 * @param {BigInt} b - The second BigInt.
 * @returns {BigInt} The smaller of the two BigInts.
 */
function min(a, b) {
    return a > b ? b : a; /* Ternary operator to return the smaller value. */
}