/*
 * This is a JavaScript module for reading input.
 * It provides utility functions to parse various data types from a string.
 */
var GET = (

    function () {

        /**
         * The main factory function for creating a new input parser instance.
         * @param {string} s - The raw string input to parse.
         * @returns {g} A new instance of the input parser.
         */
        function f(s) {

            return new g(s);
        } // End of factory function 'f'

        /**
         * Constructor for the input parser.
         * It takes a string, trims it, and splits it into an array of lines.
         * @param {string} s - The raw string input.
         */
        function g(s) {
            // Store the processed lines.
            this._s = s.trim().split("\n");
        } // End of constructor 'g'

        /*
         * Prototype methods for the input parser 'g'.
         * These methods provide ways to extract specific data from the parsed lines.
         */

        /**
         * Gets a single value from a specific line.
         * @param {number} n - The line number (0-indexed).
         * @returns {string} The raw string value of the specified line.
         */
        g.prototype.getValue = function (n) {

            return this._s[n];
        }; // End of getValue method

        /**
         * Gets a line and parses it into an array of values.
         * Uses the stoa (string to array) helper method.
         * @param {number} n - The line number.
         * @returns {Array} An array of parsed values from the line.
         */
        g.prototype.getArray = function (n) {
            return this.stoa(this._s[n]);
        }; // End of getArray method

        /**
         * Slices a range of lines and parses each line into a single value.
         * @param {number} s - The starting line index.
         * @param {number} limit - The number of lines to slice.
         * @returns {Array} An array of parsed values.
         */
        g.prototype.slice = function (s, limit) {
            // The `+limit + s || undefined` handles cases where limit might be 0 or falsy,
            // correctly calculating the end index for slice.
            return this._s.slice(s, +limit + s || undefined).map(v => this.stox(v));
        }; // End of slice method

        /**
         * Slices a range of lines and parses each line into an array of values.
         * @param {number} s - The starting line index.
         * @param {number} limit - The number of lines to slice.
         * @returns {Array<Array>} An array of arrays, where each inner array contains parsed values from a line.
         */
        g.prototype.sliceArray = function (s, limit) {
            return this._s.slice(s, +limit + s || undefined).map(v => this.stoa(v));
        }; // End of sliceArray method

        /**
         * Converts a space-separated string into an array of parsed values.
         * @param {string} s - The string to convert.
         * @returns {Array} An array of parsed values.
         */
        g.prototype.stoa = function (s) {
            return s.split(" ").map(v => this.stox(v));
        }; // End of stoa method

        /**
         * Converts a string value to a number if possible, otherwise returns the original string.
         * This handles cases like "NaN" where `+v` would result in NaN.
         * @param {string} v - The string value to convert.
         * @returns {number|string} The parsed number or the original string.
         */
        g.prototype.stox = function (v) {
            var i = +v; // Attempt to convert to number
            // Check if 'i' is a valid number (NaN is the only value not equal to itself)
            return (i === i) ? i : v;
        }; // End of stox method

        return f; // Return the factory function 'f' as the public interface
    } // End of IIFE
)(); // Execute the IIFE immediately

// Read input from standard input using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main function to the console.
console.log(main());

/**
 * The main function that orchestrates the problem-solving logic.
 * It reads input, processes it, and returns the final answer.
 * @returns {number} The minimum cost to satisfy all conditions, or -1 if impossible.
 */
function main() {

    // Read the first line of input, which contains N and M.
    var l1 = o.getArray(0);

    // N represents the total number of items/conditions.
    var N = l1[0];

    // M represents the number of key-related information entries.
    var M = l1[1];


    // Read all subsequent lines as arrays of numbers.
    // These lines contain information about the available keys.
    var info = o.sliceArray(1);

    // Initialize an empty array to store processed key objects.
    var keys = [];

    // Initialize 'ans' which will represent the bitmask of all required conditions.
    // Each bit corresponds to a condition from 1 to N.
    var ans = 0;

    // Calculate the bitmask for all conditions (1 to N).
    // For N=3, it would be 1<<1 | 1<<2 | 1<<3 = 2 | 4 | 8 = 14 (binary 1110)
    // The loop iterates from N down to 1.
    for (var n = N; n > 0; n--) {
        ans += 1 << n;
    } // End of loop for calculating 'ans' bitmask


    // Process the 'info' array to populate the 'keys' array.
    // The 'info' array contains M pairs of lines.
    // Each pair consists of a cost and a list of items unlocked by that cost.
    for (var i = 0; M * 2 > i; i = i + 2) {
        keys.push({
            a: info[i][0], // 'a' represents the cost of this key.
            c: info[i + 1].reduce( // 'c' represents the bitmask of items unlocked by this key.
                function (a, c) {
                    return a | 1 << c; // OR the current accumulator with the bit for item 'c'.
                },
                0 // Initial value for the bitmask.
            )
        });
    } // End of loop for processing 'keys'


    // Call the recursive 'calc' function to find all possible costs that satisfy 'ans'.
    var result = calc(ans, keys);

    // If no combination of keys can satisfy all conditions, return -1.
    if (result.length === 0) {
        return -1;
    }


    // Sort the results in ascending order to find the minimum cost.
    var sorted = result.sort(function (a, b) {
        return a - b; // Standard numerical sort.
    });

    // Return the smallest cost found.
    return sorted[0];
} // End of main function


/**
 * Recursively calculates combinations of keys to achieve the target bitmask 'ans'.
 * It explores different key combinations and accumulates their costs and unlocked items.
 *
 * @param {number} ans - The target bitmask representing all required conditions.
 * @param {Array<Object>} keys - An array of available key objects, each with 'a' (cost) and 'c' (bitmask of unlocked items).
 * @param {Object} [key] - The accumulated cost and unlocked items from previous recursive calls.
 *                         Defaults to { a: 0, c: 0 } if not provided (for the initial call).
 * @returns {Array<number>} An array of costs that successfully achieve the 'ans' bitmask.
 */
function calc(ans, keys, key) {

    // Initialize 'current' object with accumulated cost and unlocked items.
    // If 'key' is provided (i.e., not the initial call), use its values.
    // Otherwise, start with 0 cost and 0 unlocked items.
    var current = {
        a: !!key ? key.a : 0,
        c: !!key ? key.c : 0
    };


    // Initialize an array to store the results (costs) found in this branch of recursion.
    var result = [];

    // Iterate through the remaining available keys.
    for (var i = 0; keys.length > i; i++) {

        // Get the current key being considered in this iteration.
        var tempKey = keys[i];

        // Calculate the new accumulated value if 'tempKey' is added.
        var value = {
            a: current.a + tempKey.a, // Add the cost of 'tempKey'.
            c: current.c | tempKey.c // OR the unlocked items with 'tempKey's unlocked items.
        };


        // Check if the current combination of keys has satisfied all required conditions.
        if (value.c === ans) {
            // If satisfied, add the accumulated cost to the results.
            result.push(value.a);
        } // End of condition check


        // Recursively call 'calc' with the remaining keys (from the next one onwards)
        // and the 'value' accumulated so far.
        // Concatenate the results from the recursive call to the current 'result' array.
        result = result.concat(calc(ans, keys.slice(i + 1), value));
    } // End of loop through 'keys'

    // Return the collected costs that satisfy the 'ans' bitmask.
    return result;
} // End of calc function