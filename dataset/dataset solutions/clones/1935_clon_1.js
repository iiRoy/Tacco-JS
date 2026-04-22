/**
 * This JavaScript file processes input from stdin to solve a problem.
 * It utilizes custom utility functions for input parsing, array creation,
 * and a lower_bound binary search implementation.
 * The core logic involves a Depth First Search (DFS) on a tree structure.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original code. Only whitespace and comments
 * have been altered to create a Type I clone.
 */

"use strict"; /* Enforces strict mode for cleaner code and fewer errors. */


// Read all input from /dev/stdin synchronously and decode it as UTF-8.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Initialize input processing variables.
// `cin` stores tokens split by spaces or newlines.
// `cid` is the current index for `cin`.
var cin = input.split(/ |\n/),
    cid = 0;


/**
 * Retrieves the next token from the input array.
 * If `a` is truthy, returns the token as a string.
 * Otherwise, attempts to convert the token to a number using unary plus.
 * @param {boolean} a - Flag to determine if the token should be returned as a string.
 * @returns {string|number} The next token from `cin`.
 */
function next(a) {
    return a ? cin[cid++] : +cin[cid++];
}


/**
 * Retrieves a specified number of tokens from the input array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - Flag to determine if tokens should be returned as strings.
 * @returns {Array<string|number>} An array of `n` tokens.
 */
function nexts(n, a) {
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
}


/**
 * Retrieves a 2D matrix of tokens from the input array.
 * @param {number} h - The number of rows (height).
 * @param {number} w - The number of columns (width).
 * @param {boolean} a - Flag to determine if tokens should be returned as strings.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm(h, w, a) {
    var r = [],
        i = 0; // Initialize result array and loop counter.

    if (a) { // If 'a' is true, return string values.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else { // Otherwise, convert values to numbers.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r;
}


/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * @param {*} v - The initial value for the innermost elements.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Get all arguments.
        l = a.length, // Number of dimensions + 1 (for initial value).
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Innermost array creation string.

    // Build the string for outer arrays.
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r); // Evaluate the dynamically created string to build the array.
}


/**
 * Performs a binary search to find the lower bound of an element in a sorted array.
 * @param {Array<number>} d - The sorted array to search within.
 * @param {number} e - The element to search for.
 * @param {number} [a=0] - The starting index of the search range.
 * @param {number} [b=d.length] - The ending index of the search range (exclusive).
 * @returns {number} The index of the first element not less than `e`, or `d.length` if all elements are less than `e`.
 */
function lower_bound(d, e, a = 0, b = d.length) {
    for (var c; 1 < b - a;) { // Loop while the search range has more than one element.
        c = a + b >> 1; // Calculate the middle index (integer division).
        if (d[c] < e) { // If the middle element is less than `e`, search in the right half.
            a = c;
        } else { // Otherwise, search in the left half (including the middle element).
            b = c;
        }
    }
    return d[a] < e ? b : a; // Final check to return the correct lower bound index.
}


// Declare global variables for the answer, DP array, graph, and input array.
var ans,
    dp = [0]; // Initialize DP array with a dummy value (or base case).
var g, // Adjacency list for the graph.
    a; // Array of input numbers.


// Execute the main function and capture its output.
// If the main function returns a value, print it to the console.
var myOut = main();
if (myOut !== undefined) {
    console.log(myOut);
}


/**
 * The main function orchestrates the problem-solving logic.
 * It reads input, builds the graph, and initiates the DFS.
 * @returns {string} The final answer, joined by newlines.
 */
function main() {
    var n = next(); // Read the number of nodes (N).
    a = nexts(n); // Read N numbers into array 'a'.

    // Initialize the adjacency list 'g' as an array of empty arrays.
    g = xArray("[]", n);

    // Read edges and build the graph.
    // The graph is undirected, so add edges for both directions.
    for (var i = 1; i < n; i++) {
        var u = next() - 1, // Read node u (0-indexed).
            v = next() - 1; // Read node v (0-indexed).
        g[u].push(v); // Add v to u's adjacency list.
        g[v].push(u); // Add u to v's adjacency list.
    }

    // Initialize the 'ans' array to store results for each node.
    ans = xArray(0, n);

    // Start DFS from node 0 with no parent (-1).
    dfs(0, -1);

    // Join the results in 'ans' with newlines and return.
    return ans.join("\n");
}


/**
 * Performs a Depth First Search (DFS) on the tree.
 * This DFS likely calculates the length of the longest increasing subsequence (LIS)
 * ending at each node in the path from the root, for a specific problem type.
 *
 * @param {number} v - The current node being visited.
 * @param {number} p - The parent of the current node.
 */
function dfs(v, p) {
    // Find the insertion point for a[v] in the dp array using lower_bound.
    // This helps maintain a "tail" array for LIS.
    var ix = lower_bound(dp, a[v]),
        iv; // ix: insertion index, iv: value at ix (if replaced).

    // If 'a[v]' can extend an existing LIS or replace a larger element.
    if (ix !== dp.length) {
        iv = dp[ix]; // Store the old value at 'ix'.
        dp[ix] = a[v]; // Replace it with 'a[v]'.
    } else { // If 'a[v]' extends the LIS, append it.
        ix++; // Increment 'ix' to point to the new end.
        dp.push(a[v]); // Add 'a[v]' to the end of dp.
    }

    // The length of the current LIS ending at a node in the path to 'v'
    // is dp.length - 1 (excluding the initial dummy value).
    ans[v] = dp.length - 1;

    // Recurse on children of 'v'.
    for (var i = 0; i < g[v].length; i++) {
        var V = g[v][i]; // Get a neighbor node.
        if (V === p) { // If the neighbor is the parent, skip it.
            continue;
        }
        dfs(V, v); // Perform DFS on the child node 'V', with 'v' as its parent.
    }

    // Backtrack: restore the 'dp' array to its state before processing 'v'.
    if (ix === dp.length) { // If 'a[v]' was appended to 'dp'.
        dp.pop(); // Remove the appended element.
    } else { // If 'a[v]' replaced an element at 'ix'.
        dp[ix] = iv; // Restore the original value.
    }
}