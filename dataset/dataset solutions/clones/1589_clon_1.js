"use strict"; // Enable strict mode for better error handling and cleaner code.

// --- Input Processing Section ---

/*
 * This block handles reading input from the standard input stream.
 * It uses Node.js's 'fs' module to read the file synchronously.
 */
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// 'cin' stores input tokens split by spaces or newlines.
// 'cid' (content index) tracks the current position in the 'cin' array.
var cin = input.split(/ |\n/),
    cid = 0;


/**
 * Retrieves the next token from the input array and attempts to convert it to a number.
 * The unary plus operator (+) is used for type conversion.
 * @returns {number} The numeric value of the next input token.
 */
function next() {
    return +cin[cid++];
}

// Fetches the next token from the input array as a string without type conversion.
function nextstr() {
    return cin[cid++];
}

/*
 * Reads the next token from the input and converts it into a BigInt.
 * This is useful for handling integer values that exceed JavaScript's standard number precision.
 */
function nextbig() {
    return BigInt(cin[cid++]);
}

/**
 * Reads a specified number of tokens from the input array.
 * Depending on the 'a' parameter, tokens are returned as strings or numbers.
 * @param {number} n - The count of tokens to read.
 * @param {boolean} a - If true, tokens are returned as strings; otherwise, they are parsed as numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts(n, a) {
    if (a) {
        // Return raw string tokens if 'a' is truthy.
        return cin.slice(cid, cid += n);
    } else {
        // Convert tokens to numbers using the map function.
        return cin.slice(cid, cid += n).map(a => +a);
    }
}

/*
 * Reads a 2D matrix (table) of 'h' rows and 'w' columns from the input.
 * Similar to 'nexts', the 'a' parameter determines the type of elements (string or number).
 * @param {number} h - The number of rows in the matrix.
 * @param {number} w - The number of columns in each row.
 * @param {boolean} a - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm(h, w, a) {
    var r = [],
        i = 0; // 'r' will store the matrix, 'i' is a loop counter.

    if (a) {
        // Populate the matrix with string elements.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        // Populate the matrix with numeric elements.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r;
}


// --- Multi-dimensional Array Initialization Utility ---

/*
 * This function creates a multi-dimensional array dynamically.
 * The first argument 'v' is the default value, followed by dimensions.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with zeros.
 * It builds a string representation of array creation and then uses `eval()` to execute it.
 * Note: `eval()` can be dangerous if the 'arguments' are not controlled.
 */
function xArray(v) {
    var a = arguments;
    var l = a.length; // 'l' holds the total number of arguments.
    var r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Innermost array.

    while (--l) {
        // Wrap the previous array definition with another dimension.
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r); // Execute the constructed string to create the array.
}


// --- Program Entry Point ---

// Execute the main logic function and store its return value.
var myOut = main();

// If 'main' returns a defined value, print it to the console.
if (myOut !== undefined) {
    console.log(String(myOut));
}


// --- Main Logic Function Definition ---

function main() {

    // Read the primary input parameter 'n'.
    var n = next();

    // Initialize a 2D dynamic programming table 'dp' of size (n+1)x(n+1) with -1.
    var dp = xArray(-1, n + 1, n + 1);

    // 'add' is a global counter/offset for the main function's scope.
    var add = 0;

    // Read an initial pair of numbers into 'a'.
    var a = nexts(2);

    // 'q' will serve as a temporary queue for storing DP updates.
    var q;

    // Initialize specific base cases in the DP table to 0.
    dp[0][0] = 0;
    dp[0][a[0]] = 0;
    dp[0][a[1]] = 0;
    dp[a[0]][a[1]] = 0;

    // Loop from i = 1 up to n-1 to process subsequent input triplets.
    for (var i = 1; i < n; i++) {
        // Read three numbers, then sort them in ascending order.
        a = nexts(3).sort((a, b) => a - b);

        // Call the 'solve' function to process the sorted triplet.
        // The spread operator (...) passes array elements as individual arguments.
        solve(...a);
    }

    // Read the final single number into 'a'.
    a = next();

    // Calculate the final result by taking the maximum of two DP values,
    // adding 1 to one of them, and then adding the 'add' counter.
    return Math.max(dp[0][0], dp[a][a] + 1) + add;


    // --- Nested Helper Functions for DP State Transitions ---

    /*
     * The 'solve' function is the core logic for processing each triplet (u, v, w).
     * It orchestrates calls to sub-functions (solve1, solve2, solve3, f0, f1)
     * to update the DP table based on the current triplet.
     */
    function solve(u, v, w) {
        // Special case: if 'u' and 'w' are identical, increment 'add' and return early.
        if (u === w) {
            return add++;
        }

        // Clear the queue 'q' before processing a new triplet.
        q = [];

        // Apply updates related to the single element 'u'.
        solve1(u);

        // Conditionally apply updates for 'v' and 'w' based on their order.
        if (u < v) solve1(v);
        if (v < w) solve1(w);

        // Apply updates related to pairs.
        solve2(u, v);
        if (v < w) solve2(u, w);
        if (u < v) solve2(v, w);

        // Apply updates specific to the triplet (u, v, w).
        solve3(u, v, w);

        // Process all deferred updates stored in the queue 'q'.
        while (q.length) {
            // Pop the new value, then the column index, then the row index.
            var x = q.pop(),
                y = q.pop(),
                z = q.pop();

            // If the new value 'z' is greater than the current DP cell value, update it.
            if (dp[x][y] < z) {
                dp[x][y] = z;
            }
        }
    }


    /*
     * This helper function focuses on updating DP states associated with a single value 'u'.
     * It makes calls to 'f0' and 'f1' to enqueue potential DP updates.
     */
    function solve1(u) {
        f1(0, 0, u, u); // Specific update for (0,0) based on (u,u).

        // Loop from 0 to u-1 for certain updates.
        for (var i = 0; i < u; i++) {
            f0(i, u, 0, i);
        }

        // Loop from u to n for other updates.
        for (var i = u; i <= n; i++) {
            f0(u, i, 0, i);
        }
    }


    /*
     * 'solve2' handles DP updates that involve a pair of values (u, v).
     * It includes conditional logic for when u < v versus when u === v.
     */
    function solve2(u, v) {
        f0(u, v, 0, 0); // Update based on (0,0).
        f1(0, v, u, u); // Update based on (u,u).

        if (u < v) { // If 'u' is strictly less than 'v'.
            f1(0, u, v, v); // Another specific update.
        } else { // This block executes if u === v.
            // Loop from 0 to u-1.
            for (var i = 0; i < u; i++) {
                f1(0, i, i, u);
            }
            // Loop from u to n.
            for (var i = u; i <= n; i++) {
                f1(0, i, u, i);
            }
        }
    }


    /*
     * 'solve3' is the most complex helper, dealing with updates for the triplet (u, v, w).
     * It has nested conditional statements to cover different orderings and equalities of u, v, and w.
     */
    function solve3(u, v, w) {
        f1(v, w, u, u); // Initial update based on (u,u).

        if (u < v) { // If u is less than v.
            f1(u, w, v, v); // Update based on (v,v).

            if (v < w) { // If v is also less than w.
                f1(u, v, w, w); // Update based on (w,w).
            } else { // This else block means v === w.
                for (var i = 0; i < u; i++) {
                    f1(i, u, i, w);
                }
                for (var i = u; i < w; i++) {
                    f1(u, i, i, w);
                }
                for (var i = w; i <= n; i++) {
                    f1(u, i, w, i);
                }
            }
        } else { // This else block means u === v.
            f1(u, u, w, w); // Update based on (w,w).

            for (var i = 0; i < u; i++) {
                f1(i, w, i, u);
            }
            for (var i = u; i < w; i++) {
                f1(i, w, u, i);
            }
            for (var i = w; i <= n; i++) {
                f1(w, i, u, i);
            }
        }
    }


    /*
     * Helper function 'f0' enqueues a potential DP update.
     * It pushes the value from dp[c][d], and the indices b, a to the queue 'q'.
     * The update is only enqueued if dp[c][d] is strictly greater than dp[a][b].
     */
    function f0(a, b, c, d) {
        if (dp[a][b] < dp[c][d]) {
            q.push(dp[c][d], b, a); // Order: value, column index, row index.
        }
    }


    /*
     * Helper function 'f1' is similar to 'f0' but increments the source DP value by 1.
     * It enqueues (dp[c][d] + 1), and the indices b, a to the queue 'q'.
     * The update occurs if (dp[c][d] + 1) is strictly greater than dp[a][b].
     */
    function f1(a, b, c, d) {
        if (dp[a][b] < dp[c][d] + 1) {
            q.push(dp[c][d] + 1, b, a); // Order: (value + 1), column index, row index.
        }
    }

} // End of the 'main' function.