/*
 * This JavaScript file contains helper functions for competitive programming
 * and a main logic to solve a Union-Find problem.
 * It reads input from /dev/stdin and processes it.
 */

"use strict"; // Enforce strict mode for cleaner code.

// Global variables for input processing
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin   = input.split(/ |\n/), // Split input by space or newline
    cid   = 0;                   // Current index for reading from cin array

/**
 * Reads the next number from the input array.
 * @returns {number} The next number.
 */
function next() {
    return +cin[cid++]; // Convert string to number using unary plus
}

/**
 * Reads the next string from the input array.
 * @returns {string} The next string.
 */
function nextstr() {
    return cin[cid++];
}

/**
 * Reads the next BigInt from the input array.
 * @returns {BigInt} The next BigInt.
 */
function nextbig() {
    return BigInt(cin[cid++]);
}

/**
 * Reads 'n' items from the input array.
 * If 'a' is true, returns them as strings. Otherwise, converts them to numbers.
 * @param {number} n - Number of items to read.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<string|number>} An array of read items.
 */
function nexts(n, a) {
    return a
           ? cin.slice(cid, cid += n)
           : cin.slice(cid, cid += n).map(a => +a);
}

/**
 * Reads 'n' items, converts them to numbers, and sorts them.
 * If 'a' is true, sorts in descending order; otherwise, in ascending order.
 * @param {number} n - Number of items to read.
 * @param {boolean} a - If true, sort descending; otherwise, sort ascending.
 * @returns {Array<number>} A sorted array of numbers.
 */
function nextssort(n, a) {
    return a
           ? cin.slice(cid, cid += n).map(a => +a).sort((a, b) => b - a)
           : cin.slice(cid, cid += n).map(a => +a).sort((a, b) => a - b);
}

/**
 * Reads a 2D matrix of dimensions h x w from the input.
 * If 'a' is true, returns elements as strings. Otherwise, converts them to numbers.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm(h, w, a) {
    var r = [],
        i = 0;
    if (a) {
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r;
}

/**
 * Creates a multi-dimensional array initialized with a value or a function.
 * This function uses 'eval', which should be used with caution in production.
 * @param {*} v - The initial value for the innermost array elements.
 * @returns {Array} The multi-dimensional array.
 */
function xArray(v) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r); // Executes the generated string as JavaScript code
}


/**
 * Implements a Union-Find (Disjoint Set Union) data structure.
 * Used for keeping track of a set of elements partitioned into a number of disjoint (non-overlapping) subsets.
 */
class unionFind {
    /**
     * Constructor for the unionFind class.
     * Initializes 'n' disjoint sets, each containing one element.
     * @param {number} n - The number of elements.
     */
    constructor(n) {
        this.a = Array(n + 1).fill(-1); // Array to store parent pointers and size/rank
    }

    /**
     * Finds the root (representative) of the set containing element 'i'.
     * Uses path compression for optimization.
     * @param {number} i - The element to find the root for.
     * @returns {number} The root of the set.
     */
    root(i) {
        // If 'i' is the root (value is negative), return 'i'.
        // Otherwise, recursively find the root and apply path compression.
        return this.a[i] < 0
               ? i
               : (this.a[i] = this.root(this.a[i]));
    }

    /**
     * Checks if two elements 'x' and 'y' are in the same set.
     * @param {number} x - First element.
     * @param {number} y - Second element.
     * @returns {boolean} True if 'x' and 'y' are in the same set, false otherwise.
     */
    same(x, y) {
        return this.root(x) === this.root(y);
    }

    /**
     * Unites the sets containing elements 'x' and 'y'.
     * Uses union by size/rank for optimization.
     * @param {number} x - First element.
     * @param {number} y - Second element.
     * @returns {boolean} True if the sets were successfully united (i.e., they were different), false otherwise.
     */
    unite(x, y) {
        const a = this.a; // Cache the array reference for performance
        x = this.root(x);  // Find the root of x's set
        y = this.root(y);  // Find the root of y's set

        if (x === y) {
            return false; // Already in the same set, no union needed
        }

        // Union by size/rank heuristic: attach smaller tree under larger tree
        if (a[y] < a[x]) {
            a[y] += a[x]; // Update size of new root (y)
            a[x]  = y;    // Make y the parent of x
        } else {
            a[x] += a[y]; // Update size of new root (x)
            a[y]  = x;    // Make x the parent of y
        }
        return true; // Sets were united
    }

    /**
     * Returns the size of the set containing element 'i'.
     * The size is stored as a negative value in the root element.
     * @param {number} i - The element whose set size is to be determined.
     * @returns {number} The size of the set.
     */
    size(i) {
        return -this.a[this.root(i)];
    }
}

// --- Main execution block ---
// Call the main function and capture its output.
var myOut = main();

// If the main function returns a value, print it to console.
if (myOut !== undefined) {
    console.log(String(myOut)); // Ensure output is treated as a string
}

/*
 * The primary logic of the program.
 * Solves a problem using the Union-Find data structure.
 * Reads 'n' elements and 'q' queries.
 * Queries can either unite two elements or check if they are in the same set.
 */
function main() {
    // Read N (number of elements) and Q (number of queries)
    var [n, q] = nexts(2);

    // Initialize Union-Find structure with N elements
    var uf = new unionFind(n);

    // Array to store results of 'same' queries
    var ans = [];

    // Process Q queries
    for (var i = 0; i < q; i++) {
        // Read query type (t), and elements (u, v)
        var [t, u, v] = nexts(3);

        if (t) {
            // Query type 1: Check if u and v are in the same set
            if (uf.same(u, v)) {
                ans.push(1); // They are in the same set
            } else {
                ans.push(0); // They are in different sets
            }
        } else {
            // Query type 0: Unite the sets containing u and v
            uf.unite(u, v);
        }
    }

    // Join the results with newlines and return as a single string
    return ans.join("\n");
}