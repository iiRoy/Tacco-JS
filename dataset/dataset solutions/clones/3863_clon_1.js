/*
 * This entire script is a solution for a programming problem.
 * It utilizes a custom input parsing utility named 'GET'.
 * The 'GET' utility is designed to streamline reading various data types
 * from standard input, typically encountered in competitive programming.
 */

var GET = (

    // This is an Immediately Invoked Function Expression (IIFE).
    // It creates a private scope for the input parsing functions.
    function (  ) {

        // The public facing function of the GET module.
        // It initializes a new parser instance.
        function f(s) {
            return new g(s);
        }

        /*
         * Constructor function for the parser object.
         * It takes the raw input string 's' and prepares it for parsing.
         */
        function g(s) {
            // Trim whitespace from the start/end of the input string,
            // then split it into an array of lines.
            // This array '_s' holds all input lines.
            this._s = s.trim().split("\n");

            // '_y' is the current line index, indicating which line
            // is next to be processed. Starts at the first line (index 0).
            this._y = 0;
        }

        // Define prototype methods for the parser 'g'.
        // These methods provide different ways to extract data.

        /*
         * Method 'a': Reads an "atomic" value (a single number or string)
         * from the current line.
         * @param {boolean} f - If true, returns string; otherwise, returns number.
         */
        g.prototype.a = function(f) {
            // Retrieve internal state variables.
            var s = this._s,
                y = this._y,
                r; // 'r' will store the extracted value.

            // Check if the current line (s[y]) is still a raw string.
            // If it is, it means it hasn't been split into individual elements yet.
            if ( typeof s[y] === "string" ) {
                // Split the line by spaces. Reversing it allows 'pop()' to
                // extract elements from left to right (first element first).
                s[y] = s[y].split(" ").reverse();
            }

            // Extract the next value from the current line.
            r = s[y].pop();

            // If the current line has been fully consumed (no elements left).
            if ( !s[y].length ) {
                // Advance to the next line for subsequent reads.
                this._y++;
            }

            // Return the value, either as a string or converted to a number.
            return f ? r : +r;
        };


        /*
         * Method 'l': Reads an entire line of values.
         * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
         */
        g.prototype.l = function(f) {
            // Get the current line, increment the line index, and split by spaces.
            var s = this._s[this._y++].split(" ");

            // Return the array, optionally mapping all elements to numbers.
            return f ? s : s.map(a => +a);
        };

        // Method 'm': Reads a matrix (2D array) of 'n' lines.
        // Each line is split into elements.
        g.prototype.m = function(n, f) {
            // Slice 'n' lines from the input,
            // then increment the line pointer '_y' by 'n'.
            // Map each sliced line by splitting it into an array of strings.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // If 'f' is true, return the string matrix.
            // Otherwise, map all elements within the matrix to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        /*
         * Method 'r': Reads 'n' raw lines.
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns array of raw strings; otherwise, array of numbers.
         */
        g.prototype.r = function(n, f) {
            // Extract 'n' lines from the input array.
            // The '_y' pointer is advanced by 'n' lines.
            var r = this._s.slice(this._y, this._y += n);

            // Return the lines, either as strings or converted to numbers.
            return f ? r : r.map(a => +a);
        };

        // The IIFE returns the 'f' function, which becomes the 'GET' module.
        return f;

    }

)(); // End of the IIFE for GET parser.


// Initialize the input parser 'o' using the GET module.
// It reads the entire content of '/dev/stdin' as UTF-8.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Execute the main logic and print its return value to the console.
console.log(main());


/**
 * The main function contains the core logic of the program.
 * It calculates the number of pairs of indices (i, j) such that i < j
 * and the sum of elements from index 0 to i is equal to
 * the sum of elements from index 0 to j.
 * This is a classic prefix sum problem.
 * @returns {number} The final calculated count of such pairs.
 */
function main() {

    // Read the number of elements 'n' from the input.
    var n = o.a();

    // Read the array 'a' of 'n' elements from the input.
    // This assumes 'a' is on a single line.
    var a = o.l();

    // 'b' is a Map used to store the frequency of each prefix sum encountered.
    // Key: prefix sum value, Value: count of times this sum has occurred.
    var b = new Map();

    // Initialize the map with a prefix sum of 0 occurring once.
    // This accounts for subarrays starting from index 0 that sum to 0.
    b.set(0, 1);

    // 'ans' will store the final result (count of pairs).
    var ans = 0;

    // 't' will store the current running prefix sum.
    var t = 0;

    // Iterate through the input array 'a' from left to right.
    for ( var i = 0; i < n; i++ ) {

        // Update the current prefix sum by adding the current element.
        t += a[i];

        // Check if the current prefix sum 't' has been seen before.
        if ( b.get(t) ) {
            // If yes, increment its count in the map.
            b.set(t, b.get(t) + 1);
        } else {
            // If no, add it to the map with a count of 1.
            b.set(t, 1);
        }
    }

    // After processing all elements, iterate through the frequencies stored in map 'b'.
    // For each sum value, if it appeared 'i' times, it means there are 'i' indices
    // where the prefix sum is that value.
    // The number of pairs (j, k) such that prefix_sum[j] == prefix_sum[k] is i * (i - 1) / 2.
    // This formula calculates combinations (C(i, 2)).
    b.forEach(i => ans += i * (i - 1) / 2);

    // Return the total count of valid pairs.
    return ans;

}