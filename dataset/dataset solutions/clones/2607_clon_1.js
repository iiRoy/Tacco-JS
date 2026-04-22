/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes utilities for parsing input, creating multi-dimensional arrays,
 * and performing graph-related operations like topological sort.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Define a module for parsing input, named GET.
// This module is immediately invoked to create a singleton parsing utility.
var GET = (function () {

    // Internal helper function to create a new G instance.
    function f (s) {
        return new g(s);
    }

    /**
     * Constructor for the G class.
     * Initializes the input string, splitting it into lines and setting a line pointer.
     * @param {string} s - The raw input string.
     */
    function g (s) {
        this._s = s.trim().split("\n"); // Trim whitespace and split into an array of lines.
        this._y = 0;                     // Initialize the current line index to 0.
    }

    // Prototype methods for the G class.

    /**
     * Reads a single element from the current line.
     * Elements are read from right to left (popped from a reversed array).
     * Advances the line pointer if the current line is exhausted.
     * @param {boolean} f - If true, returns the element as a string; otherwise, as a number.
     * @returns {string|number} The parsed element.
     */
    g.prototype.a = function (f) {
        var s = this._s,
            y = this._y,
            r;

        // If the current line hasn't been processed yet, reverse its words.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        r = s[y].pop(); // Pop the last element (which was the first before reversing).

        // If the current line is now empty, move to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, optionally converting to a number.
        return f ? r : +r;
    };

    /**
     * Reads an entire line as an array of elements.
     * Advances the line pointer.
     * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
     * @returns {string[]|number[]} An array of parsed elements.
     */
    g.prototype.l = function (f) {
        var s = this._s[this._y++].split(" "); // Get current line, split by space, then advance line pointer.

        // Return the array, optionally converting elements to numbers.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads multiple lines as a matrix (2D array).
     * Advances the line pointer by 'n' lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
     * @returns {string[][]|number[][]} A 2D array of parsed elements.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines, split each by space.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix, optionally converting all elements to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads multiple lines as a 1D array.
     * Advances the line pointer by 'n' lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns elements as strings; otherwise, as numbers.
     * @returns {string[]|number[]} A 1D array of parsed elements.
     */
    g.prototype.r = function (n, f) {
        var r = this._s.slice(this._y, this._y += n); // Slice 'n' lines.

        // Return the array, optionally converting elements to numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is used to create G instances.
    return f;
})();


// Initialize the input parser 'o' by reading standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as arguments.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} v - The initial value for array elements.
 * @returns {Array} The multi-dimensional array.
 */
function xArray (v) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Build the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the string to create the array.
    return eval(r);
}


// Execute the main logic and print the result to the console.
console.log(main());


/**
 * Main function containing the problem-solving logic.
 * Reads input, constructs a graph, performs a topological sort, and returns a result.
 * @returns {number} The calculated result or -1 if a cycle is detected.
 */
function main () {
    // Read the number of nodes 'n'.
    var n = o.a();

    // Initialize a graph structure.
    // The number of edges in a complete graph with n nodes is n*(n-1)/2.
    // Each node in the graph array will have 'from' and 'to' properties,
    // which are arrays to store incoming and outgoing connections.
    var graph = xArray("{from:[],to:[]}", n * (n - 1) / 2);

    // Populate the graph based on input.
    // This loop processes 'n' lines of input, each representing connections for a node.
    for (var i = 0; i < n; i++) {
        var t = o.l(); // Read a line of connections.
        var b = f(t[0] - 1, i); // Calculate the 'edge index' for the first connection.

        // Iterate through the remaining connections on the line.
        for (var j = 1; j < n - 1; j++) {
            var a = f(t[j] - 1, i); // Calculate the 'edge index' for the current connection.

            // Add directed edges to the graph.
            graph[b].to.push(a);   // Add 'a' to the list of nodes 'b' connects to.
            graph[a].from.push(b); // Add 'b' to the list of nodes that connect to 'a'.

            b = a; // Move to the next connection in the sequence.
        }
    }

    // Perform a topological sort on the constructed graph.
    var g = topologicalSort(graph);

    // If the topological sort returns -1, it indicates a cycle.
    if (g === -1) {
        return -1;
    }

    // The result is derived from the last element of the sorted list.
    // The second element of the last pair (g[g.length-1][1]) represents a depth or level.
    // Adding 1 to it gives the final answer.
    return g[g.length - 1][1] + 1;
}


/**
 * Calculates a unique index for a pair of numbers (a, b).
 * This function essentially maps a pair of node indices to a single edge index.
 * It uses a triangular number formula.
 * @param {number} a - First number.
 * @param {number} b - Second number.
 * @returns {number} A unique index.
 */
function f (a, b) {
    var mx = Math.max(a, b); // Find the maximum of the two numbers.

    // Calculate the index using a triangular number formula.
    // (mx * (mx - 1) >> 1) is equivalent to (mx * (mx - 1) / 2).
    return (mx * (mx - 1) >> 1) + Math.min(a, b);
}


/**
 * Performs a topological sort on a directed acyclic graph (DAG).
 * Uses Kahn's algorithm (based on in-degrees).
 * @param {Array} g - The graph represented as an array of nodes, each with 'from' and 'to' arrays.
 * @returns {Array|number} An array of [node_index, depth] pairs in topological order, or -1 if a cycle is detected.
 */
function topologicalSort (g) {
    var n = g.length; // Number of nodes in the graph.

    // 'a' will store the in-degree of each node.
    var a = Array(n).fill(0);

    // 'd' will store the depth/level of each node in the topological order.
    var d = Array(n).fill(0);

    // 'q' is the queue for nodes ready to be processed (in-degree 0).
    var q = [];

    // Initialize in-degrees and the queue with nodes that have no incoming edges.
    for (var i = 0; i < n; i++) {
        if (g[i].from.length) {
            a[i] = g[i].from.length; // Set in-degree if there are incoming edges.
        } else {
            q.push([i, 0]); // Add node to queue with depth 0 if no incoming edges.
        }
    }

    // Process nodes in the queue.
    // The loop iterates using 'q.length' which changes as elements are pushed.
    for (i = 0; i < q.length; i++) {
        var v = q[i][0]; // Get the current node from the queue.

        // Iterate through all nodes that 'v' connects to.
        for (var j = 0; j < g[v].to.length; j++) {
            var V = g[v].to[j]; // Get the destination node.

            // Update the depth of the destination node.
            // The depth of V is at least the depth of v + 1.
            if (d[V] <= d[v]) {
                d[V] = d[v] + 1;
            }

            // Decrement the in-degree of the destination node.
            // If its in-degree becomes 0, it's ready to be processed.
            if (--a[V] === 0) {
                q.push([V, d[V]]); // Add to queue with its calculated depth.
            }
        }
    }

    // If the number of processed nodes in the queue is less than the total number of nodes,
    // it means there was a cycle in the graph.
    return q.length < n ? -1 : q;
}