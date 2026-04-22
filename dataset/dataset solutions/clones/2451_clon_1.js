/*
 * This is a JavaScript program for a specific problem.
 * It reads input from /dev/stdin and processes it.
 * The program is designed to solve a pathfinding and delivery optimization problem.
 */
"use strict"; /* Enforces stricter parsing and error handling in the code. */

// --- Input Reading Utilities ---
// Reads the entire input from /dev/stdin as a string.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;

// Splits the input string by spaces or newlines into an array of strings.
var cin = input . split( / |\n/ ) , cx = 0 ;

/**
 * Parses the next token from the input array as a number.
 * @returns {number} The next number from the input.
 */
function next ( ) {
    return +cin[cx++] ;
}

/**
 * Retrieves the next token from the input array as a string.
 * @returns {string} The next string token from the input.
 */
function nexts ( ) {
    return cin [ cx++ ] ;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are provided as additional arguments.
 * @param {*} v The initial value for array elements.
 * @param {...number} dimensions The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , l = a . length , r = "Array(a[" + --l + "]) . fill(0) . map(x=>{return " + v + ";})" ;
    while ( --l ) {
        r = "Array(a[" + l + "]) . fill(0) . map(x=>" + r + ")" ;
    }
    return eval( r ) ; /* Using eval for dynamic array creation, be cautious. */
}

/* --- Global State Variables --- */
var leng = 0 , nextV = 0 , day = 0 , takeday = -1 ; // Variables related to path length, current vertex, day count, and last day orders were taken.
var score = 0 ; // Accumulated score.

// --- Constants and Initializations ---
const INF = 1e9 ; // Represents infinity for distance calculations.

// Graph dimensions: V = number of vertices, E = number of edges.
const V = next ( ) ; /* Typically 200-400 vertices */
const E = next ( ) ; /* Typically 1.5V-2V edges */

// Distance matrix, initialized with INF.
const dist = xArray ( INF , V , V ) ;

// Adjacency list representation using Sets for efficient lookups.
const e = xArray ( "new Set()" , V ) ;

// Populate the graph edges and distances.
getE ( ) ;

const tmax = next ( ) ; // Maximum number of days for the simulation (e.g., 10000).
const tmax2 = tmax * tmax ; // tmax squared, used in score calculation.

const ans = Array ( tmax ) ; // Array to store the answer for each day.
const has = new Set ( ) ; // Set of vertices that currently have items to deliver.

// Stores the day an order for a specific vertex was taken.
const orderTime = xArray ( "[]" , V ) ;

// --- Main Execution ---
console . log ( main ( ) ) ; // Calls the main function and prints its result.


/**
 * The primary function orchestrating the simulation.
 * It computes all-pairs shortest paths (Floyd-Warshall)
 * and then simulates day-by-day operations.
 * @returns {string} A newline-separated string of daily results.
 */
function main ( ) {

    // Floyd-Warshall Algorithm for All-Pairs Shortest Paths
    for ( var k = 0 ; k < V ; k++ ) {
        for ( var i = 0 ; i < V ; i++ ) {
            for ( var j = 0 ; j < V ; j++ ) {
                // Relax edge if a shorter path through k is found.
                if ( dist[i][k] + dist[k][j] < dist[i][j] ) {
                    dist[i][j] = dist[i][k] + dist[k][j] ;
                }
            }
        }
    }

    // Simulate day by day until tmax is reached.
    while ( day < tmax ) {
        ans[day] = solve ( ) + 1 ; // Store the result for the current day.
        day++ ; // Advance to the next day.
    }
    return ans . join ( "\n" ) ; // Join daily results with newlines.
} /* End of main function */


/**
 * Populates the edge list and initializes the distance matrix.
 * Reads E edges from input and sets initial direct distances.
 */
function getE ( ) {
    /* Initialize self-distances to zero */
    for ( var i = 0 ; i < V ; i++ ) {
        dist[i][i] = 0 ;
    }

    /* Read E edges and set distances */
    for ( var i = 0 ; i < E ; i++ ) {
        var v1 = next ( ) - 1 , v2 = next ( ) - 1 , d = next ( ) ; // Read two vertices and distance.
        dist[v1][v2] = dist[v2][v1] = d ; // Set distance for both directions (undirected graph).
        e[v1] . add ( v2 ) ; // Add v2 to v1's adjacency set.
        e[v2] . add ( v1 ) ; // Add v1 to v2's adjacency set.
    }
} /* End of getE function */


/**
 * Determines the next delivery target.
 * Prioritizes locations with active orders.
 * If no active orders, returns to vertex 0.
 * @returns {number} The next vertex to move to, or -2 if no valid move.
 */
function deliver ( ) {
    /* If no items are currently being carried */
    if ( has . size === 0 ) {
        if ( nextV === 0 ) {
            return -2 ; // Already at home with nothing to do.
        }
        return minPath ( nextV , 0 ) ; // Go back to home base (vertex 0).
    }

    var maxid = -1 , max = 0 ; // Variables to track the best target vertex and its order count.

    /* Iterate through vertices with active orders */
    for ( var v of has ) {
        if ( max < orderTime[v] . length ) { // If this vertex has more orders than current max.
            // Check if delivery is feasible within remaining time.
            if ( dist[nextV][v] <= tmax - day ) {
                maxid = v ; // Update best target.
                max = orderTime[v] . length ; // Update max order count.
            }
        }
    }

    /* If no suitable active order destination found */
    if ( maxid === -1 ) {
        if ( nextV === 0 ) {
            return -2 ; // Already at home with nothing to do.
        }
        return minPath ( nextV , 0 ) ; // Return to home base.
    }
    return minPath ( nextV , maxid ) ; // Go to the chosen delivery target.
} /* End of deliver function */


/**
 * Finds the next step in the shortest path from 'from' to 'to'.
 * Updates 'leng' and 'nextV' accordingly.
 * @param {number} from The starting vertex.
 * @param {number} to The destination vertex.
 * @returns {number} The next vertex in the path, or -2 if an error.
 */
function minPath ( from , to ) {
    /* If 'to' is a direct neighbor of 'from' */
    if ( e[from] . has ( to ) ) {
        leng = dist[from][to] - 1 ; // Set remaining length of journey.
        return nextV = to ; // Move to 'to'.
    }

    /* Find an intermediate neighbor 'v' on the shortest path */
    for ( var v of e[from] ) {
        if ( dist[from][to] === dist[from][v] + dist[v][to] ) {
            leng = dist[from][v] - 1 ; // Set remaining length to 'v'.
            return nextV = v ; // Move to 'v'.
        }
    }
    return -2 ; // Should not happen in a connected graph with valid path.
} /* End of minPath function */


/**
 * Executes the daily action based on current state.
 * If moving, decrements path length.
 * If at a node, performs 'take' or 'give' action.
 * Then determines next delivery target.
 * @returns {number} The next vertex to move to.
 */
function solve ( ) {
    if ( leng ) { // If currently in transit
        leng-- ; // Decrement remaining path length.
        return nextV ; // Stay on the current path.
    }

    // If arrived at a node (leng is 0)
    if ( nextV === 0 ) {
        take ( ) ; // At home, take new orders.
    } else {
        give ( ) ; // At a delivery point, give items.
    }
    return deliver ( ) ; // Determine next action / destination.
} /* End of solve function */


/**
 * Processes new orders for the current day.
 * Reads new orders from input until 'takeday' catches up with 'day'.
 * Adds new destinations to 'has' and records order times.
 */
function take ( ) {
    while ( takeday < day ) { // Process orders until current day.
        takeday++ ; // Advance the order processing day.
        var n = next ( ) ; // Number of new orders for this takeday.
        for ( var i = 0 ; i < n ; i++ ) {
            var id = next ( ) - 1 , d = next ( ) - 1 ; // Read order ID and destination.
            has . add ( d ) ; // Add destination to set of active deliveries.
            orderTime[d] . push ( takeday ) ; // Record the day the order was taken.
        }
    }
} /* End of take function */


/**
 * Handles giving (delivering) items at the current vertex (nextV).
 * Removes the current vertex from 'has' if all items are delivered.
 * Calculates and accumulates score based on delivery times.
 */
function give ( ) {
    has . delete ( nextV ) ; // Remove current vertex from active deliveries.

    /* Calculate score for all items delivered at nextV */
    while ( orderTime[nextV] . length ) {
        var t = day - orderTime[nextV] . pop ( ) ; // Time taken for this delivery.
        score += tmax2 - t * t ; // Update score using the formula.
    }
} /* End of give function */