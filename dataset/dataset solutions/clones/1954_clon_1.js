"use strict"; // Enforce strict mode for better code quality and error handling.

// --- Input Processing Utilities ---

// Read all input from standard input, assuming UTF-8 encoding.
var input = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create an array of tokens.
// 'cin' (current input) holds these tokens, 'cid' (current input index) tracks our position.
var cin = input.split(/ |\n/),
    cid = 0; // Initialize token index to 0.

/**
 * Retrieves the next token from the input array.
 * @param {boolean} a - If true, returns the token as a string. If false (or undefined), converts it to a number.
 * @returns {string|number} The next token, either as string or number.
 */
function next(a) {
    // Check if 'a' is truthy to decide on type conversion.
    return a ? cin[cid++] : +cin[cid++]; // 'cid++' increments after use. The '+' unary operator converts to number.
}


/**
 * Retrieves a specified number of tokens from the input array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns tokens as strings. If false, converts them to numbers.
 * @returns {Array<string|number>} An array of the retrieved tokens.
 */
function nexts(n, a) {
    // If 'a' is true, return slice of strings.
    if (a) {
        return cin.slice(cid, cid += n);
    } else {
        // Otherwise, convert each sliced token to a number.
        return cin.slice(cid, cid += n).map(x => +x);
    }
}


/**
 * Retrieves a 2D matrix of tokens from the input.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns per row.
 * @param {boolean} a - If true, returns tokens as strings. If false, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function nextm(h, w, a) {
    var r = []; // Resulting matrix.
    var i = 0;  // Row counter.

    // If 'a' is true, push rows of strings.
    if (a) {
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w));
        }
    } else {
        // Otherwise, push rows where each token is converted to a number.
        for (; i < h; i++) {
            r.push(cin.slice(cid, cid += w).map(x => +x));
        }
    }

    return r;
}


/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses 'eval' for dynamic array creation.
 * @param {*} v - The initial value for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray("0", 2, 3) creates a 2x3 array of zeros).
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray(v) {
    var a = arguments;         // All arguments passed to the function.
    var l = a.length;          // Number of arguments (including the initial value 'v').
    var r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; // Innermost array creation string.
    // Build the string for nested array creation.
    while (--l) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    }
    return eval(r); // Evaluate the dynamically constructed string to create the array.
}


// --- Priority Queue Implementation (Min-Heap) ---

// Self-executing anonymous function (IIFE) to encapsulate the PriorityQueue.
var priorityQueue = (function () {

    /**
     * Factory function to create a new PriorityQueue instance.
     * @returns {PriorityQueue} A new PriorityQueue object.
     */
    function f() {
        return new PriorityQueue();
    }

    /**
     * Constructor for the PriorityQueue.
     * Initializes an empty heap array.
     */
    function PriorityQueue() {
        this.heap = []; // The underlying array that stores heap elements.
    }

    /**
     * Adds an element to the priority queue.
     * Elements are expected to be arrays where the first element is the priority.
     * This maintains the min-heap property.
     * @param {Array} x - The element to add.
     */
    PriorityQueue.prototype.push = function (x) {
        var h = this.heap; // Reference to the heap array.
        var i = h.length++; // Current position for the new element (end of heap).
        var j;              // Parent index.

        // Bubble up the new element to maintain heap property.
        while (i) {
            j = (i - 1) >> 1; // Calculate parent index using bitwise right shift (equivalent to floor((i-1)/2)).
            // If parent's priority is less than or equal to child's, heap property is satisfied.
            if (h[j][0] <= x[0]) {
                break;
            }
            // Otherwise, swap child with parent and continue bubbling up.
            h[i] = h[j];
            i = j;
        }
        h[i] = x; // Place the new element at its final position.
    };

    /**
     * Removes and returns the element with the highest priority (smallest value) from the queue.
     * This maintains the min-heap property by bubbling down the last element.
     * @returns {Array|undefined} The element with the smallest priority, or undefined if the queue is empty.
     */
    PriorityQueue.prototype.pop = function () {
        var h = this.heap; // Reference to the heap array.
        var r = h[0];      // The root element (highest priority) to be returned.
        var x = h.pop();   // Remove the last element and store it.
        var l = h.length;  // Current length of the heap after pop.
        var i = 0;         // Current index for bubbling down.
        var j;             // Child index.

        // If the heap is empty after popping, return 'r' (which might be undefined).
        if (l === 0) {
            return r;
        }

        var k = l >> 1; // Index of the last parent node (nodes beyond this are leaves).
        l--;            // Adjust 'l' to be the index of the last element, not length.

        // Bubble down the 'x' element from the root to maintain heap property.
        while (i < k) {
            j = (i << 1) + 1; // Calculate left child index using bitwise left shift (equivalent to 2*i + 1).

            // Check if right child exists and has higher priority than left child.
            if (j < l && h[j + 1][0] < h[j][0]) {
                j++; // If so, use the right child for comparison.
            }

            // If the element 'x' has higher priority than its smallest child, heap property is satisfied.
            if (x[0] <= h[j][0]) {
                break;
            }

            // Otherwise, swap 'x' with the smaller child and continue bubbling down.
            h[i] = h[j];
            i = j;
        }
        h[i] = x; // Place 'x' at its final position.
        return r; // Return the original root element.
    };

    return f; // Return the factory function.

})(); // End of PriorityQueue IIFE.


// --- Main Program Execution ---

// Call the main function and store its result.
var myOut = main();

// If the main function returns a value (not undefined), print it to console.
if (myOut !== undefined) {
    console.log(myOut);
}


/**
 * The main function implementing the problem's logic.
 * This appears to be a variation of Dijkstra's algorithm.
 * @returns {string} The computed answer, typically joined by newlines.
 */
function main() {
    // Read N (number of cities), M (number of roads), S (initial silver coins).
    var [n, m, s] = nexts(3);

    // Calculate maximum silver coins possible, adjusted for potential travel costs.
    // This looks like N * 50 (max_silver_per_city) - N (min_silver_cost_per_city_travel).
    const mx = n * 50 - n;

    // Initialize an adjacency list for the graph.
    // Each element is an array representing a city's connections.
    var graph = xArray("[]", n);

    // Read M road connections and populate the graph.
    for (var i = 0; i < m; i++) {
        // Read u (city A), v (city B), a (silver cost), b (time cost).
        var [u, v, a, b] = nexts(4);

        // Adjust city indices to be 0-based.
        u--;
        v--;

        // Add bidirectional edges to the graph.
        // Each edge stores [destination_city, silver_cost, time_cost].
        graph[u].push([v, a, b]);
        graph[v].push([u, a, b]);
    }

    // Read N pairs of (silver_exchange_rate, time_to_exchange) for each city.
    var d = nextm(n, 2);

    // Initialize a 3D distance map (or state-space DP table).
    // map[city_index][silver_coins_at_city] stores the minimum time to reach that state.
    // Initialize with a very large value (1e18) to represent infinity.
    var map = xArray(1e18, n, mx + 1);

    // 'rem' tracks the number of cities for which the final answer hasn't been found.
    var rem = n;

    // 'ans' stores the minimum time to reach each city, regardless of silver coins.
    // Initialize with infinity.
    var ans = xArray(1e18, n);

    // Create a new priority queue for Dijkstra's algorithm.
    // Elements in PQ are [time, city_index, silver_coins].
    var pq = new priorityQueue();

    // Cap initial silver coins at 'mx' if 's' is greater.
    // This is because 'mx' is the maximum useful silver amount.
    if (s > mx) {
        s = mx;
    }

    // Push the starting state: [time=0, city=0, initial_silver].
    pq.push([0, 0, s]);

    // Main Dijkstra-like loop. Continues as long as there are unvisited cities.
    while (rem) {
        // Pop the state with the minimum time from the priority queue.
        var [t, v, c] = pq.pop(); // t=time, v=city, c=silver_coins.

        // If 'ans[v]' is still infinity, it means this is the first time we've finalized
        // the minimum time to reach city 'v'. Decrement 'rem' and record the time.
        if (ans[v] === 1e18) {
            rem--;
            ans[v] = t;
        }

        // If we've already found a shorter path to this state (v, c) with less time, skip.
        if (map[v][c] < t) {
            continue;
        }

        // --- Option 1: Exchange silver coins at the current city ---
        // Only if current silver 'c' is less than the maximum useful amount 'mx'.
        if (c < mx) {
            var tt = t + d[v][1]; // New time: current time + time to exchange.
            var cc = c + d[v][0]; // New silver: current silver + silver gained from exchange.

            // Cap new silver at 'mx'.
            if (cc >= mx) {
                cc = mx;
            }

            // If this new state (v, cc) can be reached in less time 'tt' than previously known,
            // update the map and push it to the priority queue.
            if (map[v][cc] > tt) {
                map[v][cc] = tt;
                pq.push([tt, v, cc]);
            }
        }

        // --- Option 2: Travel to an adjacent city ---
        // Iterate through all neighbors of the current city 'v'.
        for (var i = 0; i < graph[v].length; i++) {
            // Calculate new silver coins after paying for travel.
            var cc = c - graph[v][i][1]; // current silver - silver cost for this road.

            // If we don't have enough silver for this road, skip.
            if (cc < 0) {
                continue;
            }

            // Calculate new time and destination city.
            var tt = t + graph[v][i][2]; // New time: current time + time cost for this road.
            var V = graph[v][i][0];      // Destination city.

            // If this new state (V, cc) can be reached in less time 'tt' than previously known,
            // update the map and push it to the priority queue.
            if (map[V][cc] <= tt) { // Note: using <= here to avoid redundant pushes if time is equal.
                continue;
            }

            map[V][cc] = tt;
            pq.push([tt, V, cc]);
        }
    }

    // The problem asks for results for cities 1 to N-1 (excluding city 0).
    // Slice the 'ans' array from index 1 and join the results with newlines.
    return ans.slice(1).join("\n");
}