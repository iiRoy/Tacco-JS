"use strict"; // Enforce strict mode for cleaner code and better error handling.

/*
 * This section handles all input operations for the program.
 * It utilizes Node.js's 'fs' module to read from standard input (/dev/stdin).
 * The input is then parsed into tokens for easy consumption by helper functions.
 */
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// 'cin' (current input) stores all tokens split by spaces or newlines.
// 'cid' (current input index) acts as a pointer to the next token to read.
var cin = input.split(/ |\n/),
    cid = 0;


/**
 * Reads the next token from the input array and attempts to convert it to a number.
 * The internal cursor 'cid' is incremented after reading.
 * @returns {number} The next numerical token from the input stream.
 */
function next() {
    return +cin[cid++]; // Unary plus operator converts string to number.
}


/**
 * Retrieves the next token from the input array as a string.
 * No type conversion is performed, preserving the original string format.
 * @returns {string} The next string token from the input stream.
 */
function nextstr() {
    return cin[cid++];
}


/**
 * Reads the next token and converts it into a BigInt.
 * This is particularly useful for handling integer values that exceed JavaScript's standard `Number.MAX_SAFE_INTEGER`.
 * @returns {BigInt} The next BigInt value from the input.
 */
function nextbig() {
    return BigInt(cin[cid++]);
}


/**
 * Reads 'n' consecutive tokens from the input array.
 * Depending on the 'a' parameter, these tokens are either returned as strings or converted to numbers.
 * @param {number} n - The quantity of tokens to read.
 * @param {boolean} a - A flag: if truthy, returns strings; otherwise, returns numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function nexts(n, a) {
    // If 'a' is true, return string slices; otherwise, map to numbers.
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}


/**
 * Reads a 2D matrix (or a 2D array) of specified dimensions from the input.
 * The matrix will have 'h' rows and 'w' columns.
 * Elements can be strings or numbers based on the 'a' parameter.
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns in each row.
 * @param {boolean} a - A flag: if truthy, elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function nextm(h, w, a) {
    var r = [], // Initialize an empty array to store the matrix rows.
        i = 0;  // Loop counter for iterating through rows.

    // Conditional logic to handle string or number elements for the matrix.
    if (a) {
        // If 'a' is truthy, push slices of string tokens directly into 'r'.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        // If 'a' is falsy, convert each token in the slice to a number before pushing.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }

    return r; // Return the fully populated matrix.
}


/**
 * Creates a multi-dimensional array dynamically based on provided dimensions.
 * The array elements are initialized with the value 'v'.
 * Note: This function uses `eval()`, which can be a security risk if `v` or dimensions come from untrusted input.
 * @param {*} v - The initial value to fill the array elements with.
 * @param {...number} dimensions - The sizes for each dimension of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to the function.
        l = a.length,  // Determine the total number of arguments.
        // Construct the string for the innermost array creation.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";

    // Loop backwards through the dimensions to wrap array creations.
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }

    // Evaluate the dynamically built string to create and return the array.
    return eval(r);
}


/**
 * Calculates the Greatest Common Divisor (GCD) of two BigInt numbers using the Euclidean algorithm.
 * This is a recursive implementation of the algorithm.
 * @param {BigInt} a - The first BigInt number.
 * @param {BigInt} b - The second BigInt number.
 * @returns {BigInt} The GCD of 'a' and 'b'.
 */
function gcd(a, b) {
    // The base case for the recursion: if 'b' is 0, 'a' is the GCD.
    return b ? gcd(b, a % b) : a;
}


// Define a global modulo constant, frequently used in modular arithmetic problems.
var mod = 1e9 + 7;


/**
 * Performs modular multiplication of multiple arguments.
 * It iteratively multiplies each argument by the running result, taking modulo at each step.
 * The internal calculation `((r>>16)*a[i]%mod*65536+(r&65535)*a[i])%mod` is an optimization
 * to prevent intermediate overflows when dealing with standard JavaScript numbers before modulo,
 * especially useful if numbers can get large but still fit within 32-bit (or 53-bit safe integer).
 * @returns {number} The modular product of all arguments.
 */
function mul() {
    for (var a = arguments, // Get all arguments as an array-like object.
             r = a[0],      // Initialize the result 'r' with the first argument.
             i = a.length;  // Start loop from the total count of arguments.
         --i;) {
        // Apply the modular multiplication optimization.
        r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i]) % mod;
    }
    return r; // Return the final result after all multiplications.
}


// Declare arrays for precomputing mathematical values like factorials, inverse factorials, etc.
var fac = [],   // Stores factorials: fac[k] = k!
    finv = [],  // Stores inverse factorials: finv[k] = (k!)^(-1) mod mod
    invs = [],  // (Currently unused/commented out) Stores modular inverses of numbers.
    pow2 = [];  // (Currently unused/commented out) Stores powers of 2.


/**
 * Precomputes factorials and inverse factorials up to a given number 'n', modulo 'mod'.
 * This function populates the 'fac' and 'finv' arrays, which are essential for fast
 * calculation of combinations (nCr) and permutations (nPr) in modular arithmetic.
 * @param {number} n - The maximum value for which to precompute factorials and inverse factorials.
 */
function fset(n) {
    // Initialize the 'fac' array and set base cases.
    fac.length = n + 1;
    fac[0] = fac[1] = 1;

    // Calculate factorials: fac[i] = fac[i-1] * i.
    for (var i = 2; i <= n;) {
        fac[i] = mul(fac[i - 1], i++);
    }

    // Initialize the 'finv' array and set base cases.
    finv.length = n + 1;
    finv[0] = finv[1] = 1;

    // Compute the inverse factorial of 'n' using the modular inverse function.
    finv[n] = inv(fac[n]);

    // Calculate inverse factorials backwards: finv[i-1] = finv[i] * i.
    for (i = n; 2 < i;) {
        finv[i - 1] = mul(finv[i], i--);
    }

    /*
     * The following blocks for 'invs' (modular inverses) and 'pow2' (powers of 2)
     * are commented out in the original source, indicating they are not currently used.
     * They are retained here in a commented state to maintain Type I cloning fidelity.
     */

    // invs.length = n + 1;
    // invs[0] = invs[1] = 1;
    // for (i = 2; i <= n;) {
    //     invs[i] = mul(fac[i - 1], finv[i++]);
    // }

    // pow2.length = n + 1;
    // pow2[0] = 1;
    // for (i = 1; i <= n; i++) {
    //     pow2[i] = pow2[i - 1] * 2 % mod;
    // }
}


/**
 * Computes the modular multiplicative inverse of 'b' modulo 'mod'.
 * This function uses the Extended Euclidean Algorithm.
 * The inverse 'x' satisfies (b * x) % mod = 1.
 * @param {number} b - The number for which to find the modular inverse.
 * @returns {number} The modular inverse of 'b', guaranteed to be in the range [0, mod-1].
 */
function inv(b) {
    // Initialize variables for the Extended Euclidean Algorithm.
    for (var a = mod, // 'a' starts as the modulo value.
             u = 0,   // 'u' and 'v' are coefficients from Bezout's identity.
             v = 1,
             t;       // 't' is a temporary variable for swaps and calculations.
         b;           // The loop continues as long as 'b' is not zero.
         v = t) {     // Update 'v' after each iteration.

        // Calculate the quotient and update 'a' and 'b'.
        t = a / b | 0; // Integer division using bitwise OR 0.
        a -= t * b;
        u -= t * v;

        // Perform simultaneous swaps for 'a' and 'b'.
        t = a;
        a = b;
        b = t;

        // Perform simultaneous swaps for 'u' and 'v'.
        t = u;
        u = v;
    }

    // Ensure the result 'u' is positive and within the modulo range.
    u %= mod;
    return u < 0 ? u + mod : u;
}


/**
 * Computes 'a' raised to the power 'n' modulo 'mod' using binary exponentiation (also known as exponentiation by squaring).
 * This method is efficient for large exponents.
 * @param {number} a - The base number.
 * @param {number} n - The exponent.
 * @returns {number} The result of (a^n) % mod.
 */
function pow(a, n) {
    var r = 1; // Initialize the result to 1 (a^0 = 1).

    // Loop while the exponent 'n' is greater than zero.
    // In each iteration, 'a' is squared and 'n' is halved.
    for (; n; a = mul(a, a), n >>= 1) {
        // If the current bit of 'n' is 1 (i.e., 'n' is odd).
        if (n & 1) {
            r = mul(a, r); // Multiply the result 'r' by the current 'a'.
        }
    }
    return r; // Return the final computed power.
}


/**
 * Calculates the number of combinations "n choose r" (nCr) modulo 'mod'.
 * This function relies on precomputed factorials and inverse factorials (from `fset`).
 * The formula used is nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1) (mod mod).
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to choose.
 * @returns {number} The value of nCr % mod.
 */
function ncr(n, r) {
    return mul(fac[n], finv[r], finv[n - r]);
}


/**
 * Calculates the number of permutations "n permute r" (nPr) modulo 'mod'.
 * This function also requires precomputed factorials and inverse factorials (from `fset`).
 * The formula used is nPr = n! / (n-r)! = n! * ((n-r)!)^(-1) (mod mod).
 * @param {number} n - The total number of items.
 * @param {number} r - The number of items to permute.
 * @returns {number} The value of nPr % mod.
 */
function npr(n, r) {
    return mul(fac[n], finv[r]);
}


/**
 * Normalizes a number 'n' to be within the range [0, mod-1].
 * This is useful for ensuring results are always positive and within the desired modulo range,
 * especially after operations that might produce negative numbers (e.g., subtraction).
 * @param {number} n - The number to normalize.
 * @returns {number} The normalized number (n % mod + mod) % mod.
 */
function mput(n) {
    return (n % mod + mod) % mod;
}


// Execute the main logic of the program and store its return value.
var myOut = main();

// If the main function produced a result (i.e., it didn't return undefined), print it to the console.
if (myOut !== undefined) {
    console.log(myOut);
}


/**
 * The primary function containing the main business logic of the program.
 * It processes pairs of BigInts, categorizes them, simplifies them using GCD,
 * and then computes a final aggregate answer based on these processed pairs,
 * applying modular arithmetic throughout.
 * @returns {number} The final calculated result, normalized modulo 'mod'.
 */
function main() {
    var n = next(); // Read the initial integer 'n', representing the count of pairs.

    var az = 0, // Counter for pairs where 'a' is zero and 'b' is non-zero.
        bz = 0; // Counter for pairs where 'b' is zero and 'a' is non-zero.

    // A map (JavaScript object) to store the counts of unique, simplified (a, b) BigInt pairs.
    var map = {};

    // Iterate 'n' times to read and process each pair of BigInts.
    for (var i = 0; i < n; i++) {
        var a = nextbig(), // Read the first BigInt of the pair.
            b = nextbig(); // Read the second BigInt of the pair.

        // If both 'a' and 'b' are zero, this pair is ignored as per problem logic.
        if (a === 0n && b === 0n) {
            continue;
        }

        // If only 'a' is zero, increment 'az' and proceed to the next pair.
        if (a === 0n) {
            az++;
            continue;
        }

        // If only 'b' is zero, increment 'bz' and proceed to the next pair.
        if (b === 0n) {
            bz++;
            continue;
        }

        // Calculate the Greatest Common Divisor (GCD) of 'a' and 'b' to simplify the pair.
        var c = gcd(a, b);
        a /= c; // Divide 'a' by its GCD.
        b /= c; // Divide 'b' by its GCD.

        // Normalize the pair: if 'a' is negative, flip signs of both 'a' and 'b'.
        // This ensures a consistent canonical representation for map keys (e.g., (-1, -2) becomes (1, 2)).
        if (a < 0) {
            a = -a;
            b = -b;
        }

        // Store or increment the count of the simplified (a, b) pair in the map.
        // BigInts are converted to string keys implicitly when used as object properties.
        if (map[a]) {
            // If the key 'a' already exists in the map.
            if (map[a][b]) {
                // If the specific pair (a, b) exists, increment its count.
                map[a][b]++;
            } else {
                // Otherwise, initialize the count for this new (a, b) pair to 1.
                map[a][b] = 1;
            }
        } else {
            // If 'a' does not exist as a key, create a new nested object for it.
            map[a] = {};
            map[a][b] = 1; // Initialize the count for this (a, b) pair to 1.
        }
    }

    // Initialize the answer. This part typically accounts for special cases or base combinations.
    // pow(2, az) + pow(2, bz) - 1 likely handles combinations involving only a=0 or only b=0.
    var ans = pow(2, az) + pow(2, bz) - 1;

    // Iterate through the simplified (a, b) pairs stored in the 'map'.
    for (var i in map) {    // 'i' represents the string-converted 'a' value.
        for (var j in map[i]) { // 'j' represents the string-converted 'b' value for the current 'i'.
            var t = 0; // Temporary variable to accumulate contributions for this pair group.

            // The logic here seems to handle pairs (a, b) and their "orthogonal" counterparts (b, -a) or similar.
            // Note: 'j' and 'i' are string keys. 'j < 0' implicitly converts 'j' to a number for comparison.
            if (j < 0) {
                // If 'b' is negative, check if its positive counterpart (abs(b), a) has already been processed.
                // This avoids double-counting or ensures canonical processing order.
                if (map[j.slice(1)] && map[j.slice(1)][i]) {
                    continue; // Skip if the canonical positive 'b' form has been handled.
                }
            } else {
                // If 'b' is positive, check for the existence of an "orthogonal" pair (b, -a).
                if (map[j] && map[j]["-" + i]) {
                    // If such a pair exists, its contribution is (2^count_of_orthogonal - 1).
                    t = pow(2, map[j]["-" + i]) - 1;
                }
            }

            // Add the contribution of the current pair (a, b), which is 2^(count_of_current_pair).
            t += pow(2, map[i][j]);

            // Multiply the running total answer by 't', ensuring modular arithmetic.
            // 't % mod' is used here because 't' could be the sum of two 'pow' results, potentially exceeding 'mod'.
            ans = mul(ans, t % mod);
        }
    }

    // Return the final answer, adjusted by subtracting 1 and normalized modulo 'mod'.
    // The subtraction of 1 is likely part of the problem's specific combinatorial formula.
    return mput(ans - 1);
}