/*
 * This file contains a JavaScript program designed to solve a specific graph-related problem.
 * It utilizes a custom input reader and helper functions for array initialization.
 * The core logic involves graph traversal, potentially a Breadth-First Search (BFS) variant.
 */

// Define a module for efficient input parsing from standard input.
var GET = (

    function () {

        // The main factory function for creating an input reader instance.
        function f(s) {
            return new g(s);
        }

        // The constructor for the input reader class.
        // It processes the raw input string, splitting it into lines.
        function g(s) {
            this._s = s.trim().split("\n"); // Trim leading/trailing whitespace and split into lines.
            this._y = 0; // Initialize line pointer to the first line.
        }


        // Prototype method 'a' for reading an "atomic" value (single token).
        // It can return either a number or a string based on the 'f' flag.
        g.prototype.a = function (f) {
            var s = this._s; // Reference to the array of input lines.
            var y = this._y; // Current line index.
            var r; // Variable to hold the result.

            // If the current line hasn't been processed into tokens yet, do so.
            // It reverses the tokens so 'pop' can read them in original order.
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse();
            }

            r = s[y].pop(); // Get the last token (which is the next in original order).

            // If the current line is exhausted, move to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return the value; convert to number if 'f' is false/falsy.
            return f ? r : +r;
        };


        // Prototype method 'l' for reading an entire line of values.
        // It can return an array of strings or an array of numbers.
        g.prototype.l = function (f) {
            // Retrieve the current line, split by spaces, and advance the line pointer.
            var s = this._s[this._y++].split(" ");

            // Return as strings or map to numbers.
            return f ? s : s.map(a => +a);
        };


        // Prototype method 'm' for reading a matrix (multiple lines, multiple columns per line).
        // 'n' specifies the number of lines to read.
        g.prototype.m = function (n, f) {
            // Slice 'n' lines, split each line by spaces to form rows of tokens.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return as string matrix or map all elements to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };


        // Prototype method 'r' for reading a range of lines (as is, or converted to numbers).
        // 'n' specifies the number of lines to read.
        g.prototype.r = function (n, f) {
            // Slice 'n' lines from the input.
            var r = this._s.slice(this._y, this._y += n);

            // Return as string array or map all elements to numbers.
            return f ? r : r.map(a => +a);
        };

        // Return the factory function 'f' to be assigned to GET.
        return f;

    }

)(); // Execute the IIFE immediately.


// Initialize the input reader 'o' by reading from /dev/stdin.
// The 'utf8' encoding is specified for character handling.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Helper function to create multi-dimensional arrays initialized with a specific value.
 * This function dynamically constructs and evaluates a string to create the array structure.
 *
 * @param {any} v - The initial value for all elements in the array.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to the function.
        l = a.length, // Get the total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Start with the innermost array dimension.

    // Loop backwards through the dimensions, building the array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")"; // Wrap the current 'r' with the next dimension.
    }

    return eval(r); // Evaluate the constructed string to create the array.
}


// Declare global variables used throughout the program.
var n,             // Represents the size/number of elements (e.g., nodes in a graph).
    s,             // A 2D array or matrix, likely representing a graph's adjacency.
    a,             // An array used for tracking visited states or other properties.
    c = 0;         // A counter variable, initialized to zero.


// Execute the main logic and print its returned result to the console.
console.log(main());


/**
 * The primary function that orchestrates the problem-solving process.
 * It reads input, performs initial processing, and then calls a solver function.
 * @returns {number} The final result of the problem.
 */
function main() {

    // Read the first input value, which is typically 'n'.
    n = o.a();

    // Read 'n' lines as a 2D array (matrix 's'), preserving them as strings.
    s = o.r(n, 1);

    // Initialize array 'a' of size 'n' with all elements set to 0.
    a = xArray(0, n);

    var f = 0; // Flag variable, initialized to 0.

    // Outer loop iterates through rows (i).
    for (var i = 0; i < n; i++) {

        // Inner loop iterates through columns (j).
        for (var j = 0; j < n; j++) {

            // Check if the current cell in matrix 's' contains the string "1".
            if (s[i][j] === "1") {
                f = a[i] = 1; // Set flag 'f' and mark 'a[i]' as 1 (visited/connected).
                break; // Break from the inner loop once a "1" is found in the row.
            }
        }

        // After checking a row, if 'a[i]' is still 0, increment counter 'c'.
        // This implies the row 'i' had no "1"s.
        if (a[i] === 0) {
            c++;
        }
    }

    // If flag 'f' is still 0 after all iterations, it means no "1"s were found anywhere.
    // In this specific problem context, this might imply a special base case.
    if (f === 0) {
        return n; // Return 'n' if no "1"s were found.
    }

    // Otherwise, proceed to the main solving logic.
    return solve();

}


/**
 * Implements the core graph traversal or algorithm to find the solution.
 * This function appears to be performing a multi-source Breadth-First Search (BFS)
 * or a similar propagation algorithm on the graph represented by 's'.
 *
 * @returns {number} The calculated answer or -1 if an invalid state is encountered.
 */
function solve() {

    var ans = 0; // Initialize the answer variable.

    // Iterate through each possible starting node 'i'.
    for (var i = 0; i < n; i++) {

        // Skip nodes that were not marked as connected in the 'main' function.
        if (a[i] === 0) {
            continue;
        }

        // Initialize a 'map' array for distances/states, filled with -1 (unvisited).
        var map = xArray(-1, n);

        // Set the distance of the current starting node 'i' to 0.
        map[i] = 0;

        var q = []; // Initialize the main queue for BFS traversal.

        // Populate the initial queue with neighbors of node 'i'.
        for (var j = 0; j < n; j++) {

            // If there's no edge from 'i' to 'j', skip.
            if (s[i][j] === "0") {
                continue;
            }

            map[j] = 1; // Mark neighbor 'j' with distance 1.
            q.push(j); // Add 'j' to the queue.
        }

        var u = 1; // 'u' represents the current "level" or distance in the BFS.

        // Standard BFS loop: continue as long as there are nodes in the queue.
        while (q.length) {

            var q2 = []; // Initialize a secondary queue for the next level.

            // Process all nodes at the current level 'u'.
            while (q.length) {

                var t = q.pop(); // Dequeue a node from the current level.

                // Explore neighbors of node 't'.
                for (var j = 0; j < n; j++) {

                    // If there's no edge from 't' to 'j', skip.
                    if (s[t][j] === "0") {
                        continue;
                    }

                    // If neighbor 'j' is unvisited.
                    if (map[j] === -1) {
                        map[j] = u + 1; // Assign distance 'u+1'.
                        q2.push(j); // Enqueue 'j' for the next level.
                    }
                    // If neighbor 'j' has been visited, check for consistency.
                    // It must either be at the previous level (u-1) or the next level (u+1).
                    // This check is crucial for determining if the graph has a valid structure
                    // (e.g., bipartite or specific path lengths).
                    else if (map[j] !== u - 1 && map[j] !== u + 1) {
                        return -1; // Return -1 if an inconsistency is found.
                    }
                }
            }

            u++; // Increment the level counter.
            q = q2; // Move to the next level's queue.
        }

        // After BFS for node 'i' completes, update the maximum 'ans' if 'u' is greater.
        // 'u' here represents the maximum depth reached from node 'i'.
        if (ans < u) {
            ans = u;
        }
    }

    // The final answer is the maximum depth found plus the counter 'c'
    // (which represents the number of isolated nodes or components without "1"s).
    return ans + c;
}