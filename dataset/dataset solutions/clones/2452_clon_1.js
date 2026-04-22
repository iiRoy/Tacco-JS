"use strict"; /* This directive enables strict mode, helping to write cleaner and safer code by catching common coding errors and "unsafe" actions. */


var fs = require("fs"); // Import the Node.js 'fs' (file system) module to handle file operations.


// Read the entire content of standard input synchronously, interpreting it as UTF-8.
var input = fs.readFileSync("/dev/stdin", "utf8");

// Split the input string into an array of tokens using spaces or newlines as delimiters.
// 'cx' serves as an index to keep track of the current token being processed from 'cin'.
var cin = input.split(/ |\n/),
    cx = 0;


/**
 * Retrieves and returns the next numerical token from the input array.
 * The unary plus operator '+' is used to explicitly convert the string token to a number.
 * The 'cx' index is incremented after accessing the element.
 *
 * @returns {number} The next numerical value from the input stream.
 */
function next() {
    return +cin[cx++];
}


/**
 * Retrieves and returns the next string token from the input array.
 * The 'cx' index is incremented after accessing the element.
 *
 * @returns {string} The next string value from the input stream.
 */
function nexts() {
    return cin[cx++];
}


/**
 * Creates and initializes a multi-dimensional array with a specified value.
 * The function accepts the initial value 'v' followed by any number of dimension sizes.
 * For example, xArray(0, 2, 3) creates a 2x3 array filled with zeros.
 *
 * @param {*} v - The default value to fill the array elements with.
 * @param {...number} dimensions - A variable number of arguments representing the sizes of each dimension.
 * @returns {Array} A newly created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments,
        l = a.length,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Dynamically constructs the string representation of nested Array.map calls.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluates the constructed string to create the multi-dimensional array.
    return eval(r);
}


// --- Global Simulation Variables ---

// 'leng': Stores the remaining length of the current path segment being traversed.
// 'nextV': Represents the next vertex to visit, or the current vertex if 'leng' is 0.
// 'day': Tracks the current day in the simulation.
// 'takeday': Records the last day on which new orders were processed and "taken".
var leng = 0,
    nextV = 0,
    day = 0,
    takeday = -1;

// 'score': Accumulates the total score based on successful deliveries throughout the simulation.
var score = 0;


const INF = 1e9; // A large number representing infinity, used for initial distances in the graph.

// 'V': The total number of vertices (nodes) in the graph, read from input. (e.g., 200-400)
const V = next();

// 'E': The total number of edges (connections) in the graph, read from input. (e.g., 1.5V-2V)
const E = next();

// 'dist': A 2D array (V x V) to store the shortest path distances between any two vertices.
// Initialized with INF, representing unreachable paths.
const dist = xArray(INF, V, V);

// 'directDist': A 2D array (V x V) to store the direct distances between immediately connected vertices.
// Also initialized with INF.
const directDist = xArray(INF, V, V);

// 'e': An adjacency list representation of the graph.
// `e[i]` is an array containing all vertices directly connected to vertex 'i'.
const e = xArray("[]", V);

// Call getE() to populate the graph data structures ('dist', 'directDist', 'e') based on input edges.
getE();

// 'tmax': The maximum number of days for which the simulation will run. (e.g., 10000)
const tmax = next();

// 'tmax2': Pre-calculates tmax squared, used in the score calculation formula.
const tmax2 = tmax * tmax;

// 'ans': An array to store the result for each day of the simulation.
// Each element will hold the ID of the vertex visited on that specific day.
const ans = Array(tmax);

// 'has': A Set data structure to efficiently keep track of all vertices that currently have pending orders.
const has = new Set();

// 'orderTime': A 2D array (array of arrays) where `orderTime[v]` stores a list of days
// on which orders destined for vertex 'v' were placed.
const orderTime = xArray("[]", V);


// Execute the main simulation function and print its return value to the console.
console.log(main());

// This conditional block is typically used for debugging or alternative output.
// Since '0' is a falsy value, the code inside this 'if' statement will not execute.
if (0) {
    // If enabled, this would write the daily results to standard output.
    fs.writeFileSync("/dev/stdout", ans.join("\n"));
    // And print the final total score.
    console.log(score);
}


/**
 * The main simulation loop function.
 * It first computes all-pairs shortest paths using the Floyd-Warshall algorithm.
 * Then, it iterates day by day, calling `solve()` for each day to determine actions.
 *
 * @returns {string} A string containing the sequence of visited vertices (each +1)
 *                   separated by newlines, representing the daily actions.
 */
function main() {
    // Floyd-Warshall Algorithm: Computes the shortest path between all pairs of vertices.
    // 'k' represents the intermediate vertex that can be used to potentially shorten paths.
    for (var k = 0; k < V; k++) {
        // 'i' represents the source vertex.
        for (var i = 0; i < V; i++) {
            // 'j' represents the destination vertex.
            for (var j = 0; j < V; j++) {
                // If the path from 'i' to 'j' via 'k' is shorter than the current known path, update it.
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }

    // Main simulation loop: continues until the current day reaches 'tmax'.
    while (day < tmax) {
        // Call the 'solve' function to determine the action for the current day.
        // The result (vertex ID) is incremented by 1 before being stored in 'ans'.
        ans[day] = solve() + 1;

        // Check for an error condition where 'leng' becomes negative.
        // This indicates an issue with path calculation or traversal.
        if (leng < 0) {
            console.log(day, leng, nextV); // Log debug information.
            return; // Terminate the simulation early.
        }

        // Advance to the next day.
        day++;
    }

    // After the simulation completes, join all daily results with newlines and return the string.
    return ans.join("\n");
}


/**
 * Populates the graph's distance matrices and adjacency list from input.
 * Initializes self-loop distances to zero and sets up direct edge weights.
 */
function getE() {
    // Initialize the distance from a vertex to itself as 0.
    for (var i = 0; i < V; i++) {
        dist[i][i] = 0;
    }

    // Read 'E' number of edges from the input.
    for (var i = 0; i < E; i++) {
        // Read two connected vertices (1-indexed, convert to 0-indexed) and the distance between them.
        var v1 = next() - 1,
            v2 = next() - 1,
            d = next();

        // Update shortest path and direct path distances for both directions (undirected graph).
        dist[v1][v2] = dist[v2][v1] = directDist[v1][v2] = directDist[v2][v1] = d;

        // Add each vertex to the other's adjacency list.
        e[v1].push(v2);
        e[v2].push(v1);
    }
}


/**
 * Determines the optimal next destination for delivery based on current orders.
 * Prioritizes vertices with the most pending orders, considering reachability.
 *
 * @returns {number} The next vertex to move towards, or -2 if no suitable delivery target is found.
 */
function deliver() {
    // If there are no active orders in the 'has' set.
    if (has.size === 0) {
        // If the current location is already the origin (vertex 0), there's nothing to do.
        if (nextV === 0) {
            return -2;
        }
        // Otherwise, head back to the origin.
        return minPath(0);
    }

    var maxid = -1, // Stores the ID of the vertex with the maximum number of orders.
        max = 0; // Stores the maximum count of orders found so far.

    // Iterate through all vertices that currently have pending orders.
    for (var v of has) {
        // Check if this vertex 'v' has more orders than 'max' AND is reachable within the remaining simulation time.
        if (max < orderTime[v].length && dist[nextV][v] <= tmax - day) {
            maxid = v; // Update 'maxid' to this vertex.
            max = orderTime[v].length; // Update 'max' with the new highest order count.
        }
    }

    // If no suitable destination (reachable and with orders) was found.
    if (maxid === -1) {
        return -2;
    }

    // Otherwise, find the next step on the shortest path to the chosen 'maxid' vertex.
    return minPath(maxid);
}


/**
 * Calculates the immediate next step on the shortest path from the current vertex ('nextV')
 * to a specified target vertex ('to'). This function assumes 'dist' has been pre-computed.
 *
 * @param {number} to - The target destination vertex.
 * @returns {number} The ID of the next vertex in the shortest path, or -2 if no valid step is found.
 */
function minPath(to) {
    // Iterate through all direct neighbors 'v' of the current vertex 'nextV'.
    for (var v of e[nextV]) {
        // Check if 'v' lies on a shortest path from 'nextV' to 'to'.
        // This condition is true if the distance from 'nextV' to 'to' is equal to
        // the direct distance from 'nextV' to 'v' plus the shortest distance from 'v' to 'to'.
        if (dist[nextV][to] === directDist[nextV][v] + dist[v][to]) {
            leng = directDist[nextV][v] - 1; // Update 'leng' with the remaining steps in this direct segment.
            return nextV = v; // Move to vertex 'v' and return its ID.
        }
    }
    return -2; // Should theoretically not be reached if 'to' is truly reachable.
}


/**
 * Defines the daily action logic: either continue moving, pick up orders, or deliver orders.
 *
 * @returns {number} The ID of the vertex determined as the next target by the `deliver` function.
 */
function solve() {
    // If 'leng' is positive, it means we are currently in transit between two major vertices.
    if (leng) {
        leng--; // Decrement the remaining length of the current path segment.
        return nextV; // Stay at the current intermediate vertex ('nextV') for another step.
    }

    // If 'leng' is 0, we have arrived at a vertex.
    if (nextV === 0) {
        take(); // If at the origin (vertex 0), process new incoming orders.
    } else {
        give(); // If at any other vertex, deliver orders for that vertex.
    }

    // After performing actions at the current vertex, determine the next destination.
    return deliver();
}


/**
 * Processes new orders that have arrived up to the current simulation day.
 * Updates the `has` set and `orderTime` array with new order information.
 */
function take() {
    // Loop through days starting from 'takeday' (last day orders were checked) up to the current 'day'.
    while (takeday < day) {
        takeday++; // Increment 'takeday' to process orders for the next day.
        var n = next(); // Read the number of orders arriving on 'takeday'.

        // Process each individual order.
        for (var i = 0; i < n; i++) {
            var id = next() - 1, // Read order ID (unused in this specific logic).
                d = next() - 1; // Read destination vertex ID (0-indexed).

            has.add(d); // Add the destination vertex 'd' to the set of vertices with active orders.
            orderTime[d].push(takeday); // Record the day this order arrived for destination 'd'.
        }
    }
}


/**
 * Processes and "delivers" all pending orders at the current vertex (`nextV`).
 * Updates the `has` set and the total `score`.
 */
function give() {
    // Remove the current vertex 'nextV' from the 'has' set, as all its orders are now being delivered.
    has.delete(nextV);

    // Loop while there are still orders pending for the current vertex 'nextV'.
    while (orderTime[nextV].length) {
        // Pop the placement day of the oldest pending order for 'nextV'.
        var t = day - orderTime[nextV].pop();

        // Calculate and add to the score using the formula: tmax^2 - (time_taken)^2.
        score += tmax2 - t * t;
    }
}