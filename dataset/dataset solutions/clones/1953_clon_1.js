"use strict" ;

// This script reads input from standard input, processes it, and prints the result.
// It includes utility functions for parsing input and implements Dijkstra's algorithm
// with a custom priority queue.

// --- Input Reading Utilities ---

// Require the 'fs' (file system) module to read input from a file.
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the entire input string by spaces or newlines into an array of tokens.
// 'cid' is a cursor to keep track of the current token being read.
var cin = input . split ( / | \n / ) , cid = 0 ;


/**
 * Reads the next token from the global input array `cin`.
 * Increments the internal cursor `cid`.
 * @param {boolean} a - If true, returns the token as a string. If false or undefined,
 *                      attempts to convert the token to a number using the unary plus operator.
 * @returns {string|number} The next token.
 */
function next ( a ) {
    // Conditional (ternary) operator to decide between string or number conversion.
    return a ? cin [ cid ++ ] : + cin [ cid ++ ] ;
}

/**
 * Reads a specified number of tokens from the global input array `cin`.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, returns tokens as an array of strings. If false or undefined,
 *                      converts tokens to numbers and returns an array of numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts ( n , a ) {
    // Uses slice to extract 'n' elements and then increments 'cid'.
    // If 'a' is true, return string array. Otherwise, map to numbers.
    return a
        ? cin . slice ( cid , cid += n )
        : cin . slice ( cid , cid += n ) . map ( a => + a )
    ;
}

/**
 * Reads a 2D matrix (array of arrays) from the input.
 * @param {number} h - The number of rows (height) of the matrix.
 * @param {number} w - The number of columns (width) of each row.
 * @param {boolean} a - If true, elements are strings. If false, elements are numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function nextm ( h , w , a ) {
    var r = [ ] , i = 0 ; // Initialize result array 'r' and loop counter 'i'.

    // Conditional block to handle string or number parsing.
    if ( a ) {
        // Loop 'h' times to read each row as an array of strings.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) ) ;
        }
    } else {
        // Loop 'h' times to read each row and convert elements to numbers.
        for ( ; i < h ; i ++ ) {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
        }
    }

    return r ; // Return the populated matrix.
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as additional arguments after 'v'.
 * For example: `xArray(0, 2, 3)` creates `[[0,0,0],[0,0,0]]`.
 * @param {*} v - The value to fill the innermost array elements with.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // All arguments passed to the function.
        l = a . length , // Total number of arguments.
        // Start building the string representation for the innermost array.
        // `a[--l]` gets the last dimension.
        r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

    // Loop backwards through the dimensions to build nested `map` calls.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    // Use `eval` to execute the dynamically constructed string and create the array.
    return eval ( r ) ;
}


// --- Dijkstra's Algorithm Implementation ---

/**
 * Implements Dijkstra's algorithm for finding the shortest paths in a graph.
 * This class uses an adjacency list representation for the graph.
 */
class dijkstra {
    /**
     * Constructor for the dijkstra class.
     * @param {number} n - The number of nodes in the graph.
     */
    constructor ( n ) {
        // Initialize the graph as an array of empty arrays (adjacency lists).
        this . graph = Array ( n ) . fill ( ) . map ( a => [ ] ) ;
    }

    /**
     * Adds a directed edge from node 'u' to node 'v' with a given 'cost'.
     * The adjacency list stores [destination_node, edge_cost] pairs.
     * @param {number} u - The source node.
     * @param {number} v - The destination node.
     * @param {number} cost - The cost of traversing this edge.
     */
    add ( u , v , cost ) {
        this . graph [ u ] . push ( v , cost ) ;
    }

    /**
     * Adds an undirected edge between node 'u' and node 'v' with a given 'cost'.
     * This is implemented by adding two directed edges: u -> v and v -> u.
     * @param {number} u - The first node.
     * @param {number} v - The second node.
     * @param {number} cost - The cost of traversing the edge in either direction.
     */
    add2 ( u , v , cost ) {
        this . graph [ u ] . push ( v , cost ) ; // Edge u to v
        this . graph [ v ] . push ( u , cost ) ; // Edge v to u
    }

    /**
     * Solves the single-source shortest path problem from a specified start node.
     * @param {number} start - The index of the starting node.
     * @returns {Array<number>} An array where `dp[i]` is the shortest distance
     *                          from the `start` node to node `i`.
     */
    solve ( start ) {
        const INF = 1e18 ; // A sufficiently large number to represent infinity.
        const g = this . graph ; // Alias for the graph for easier access.

        var pq = new priorityQueue ( ) ; // Instantiate a new priority queue.
        pq . push ( 0 , start ) ; // Add the start node with distance 0 to the PQ.

        var dp = Array ( g . length ) . fill ( INF ) ; // Initialize distance array with infinity.
        dp [ start ] = 0 ; // The distance from start to start is 0.

        // Loop as long as there are nodes to process in the priority queue.
        while ( pq . size ) {
            // Extract the node 'v' with the smallest distance 't' from the PQ.
            var [ t , v ] = pq . pop ( ) ;

            // If we've already found a shorter path to 'v', skip this entry.
            if ( dp [ v ] < t ) {
                continue ;
            }

            // Iterate through all neighbors of node 'v'.
            // Edges are stored as [destination, cost] pairs, so increment by 2.
            for ( var i = 0 ; i < g [ v ] . length ; i += 2 ) {
                var V = g [ v ] [ i ] , // Neighbor node.
                    c = g [ v ] [ i + 1 ] + t ; // New accumulated cost to reach neighbor V.

                // If the newly calculated path to V is not shorter than the current shortest path, skip.
                if ( dp [ V ] <= c ) {
                    continue ;
                }

                dp [ V ] = c ; // Update the shortest distance to V.
                pq . push ( c , V ) ; // Add or update V in the priority queue.
            }
        }
        return dp ; // Return the array of shortest distances.
    }
}


// --- Min-Priority Queue Implementation (Binary Heap) ---

/**
 * Implements a min-priority queue using a binary heap data structure.
 * It stores items as [priority, value] pairs, ordered by priority.
 */
class priorityQueue {
    /**
     * Constructor for the priorityQueue class.
     */
    constructor ( ) {
        this . a = [ ] ; // The main array representing the binary heap (stores priorities).
        this . map = new Map ( ) ; // A map to store values associated with each priority.
                                   // Each priority can have multiple associated values.
    }

    /**
     * Inserts an item with a given priority and its associated value into the queue.
     * @param {number} num - The priority of the item (e.g., distance).
     * @param {*} inc - The value associated with the priority (e.g., node index).
     */
    push ( num , inc ) {
        const a = this . a , map = this . map ;
        var i , j ; // 'i' is the current index, 'j' is the parent index.

        // Bubble up the new element to maintain the min-heap property.
        // Start from the end of the array.
        for ( i = a . length ; i ; i = j ) {
            j = i - 1 >> 1 ; // Calculate parent index: (i-1)/2 using bitwise right shift.
            if ( num >= a [ j ] ) { // If the new number is greater than or equal to its parent,
                break ;             // it's in the correct position relative to its parent.
            }
            a [ i ] = a [ j ] ; // Move parent down to child's position.
        }
        a [ i ] = num ; // Place the new number in its final sorted position.

        // Store the associated value 'inc' in the map.
        // If 'num' already exists as a key, push 'inc' to its array. Otherwise, create a new array.
        if ( map . has ( num ) ) {
            map . get ( num ) . push ( inc ) ;
        } else {
            map . set ( num , [ inc ] ) ;
        }
    }

    /**
     * Removes and returns the item with the smallest priority from the queue.
     * @returns {Array<number|*>|undefined} An array containing `[priority, value]` of the smallest item,
     *                                      or `undefined` if the queue is empty.
     */
    pop ( ) {
        const a = this . a , map = this . map , l = a . length , x = a . pop ( ) ; // Remove last element.

        // Handle edge cases: empty or single-element queue.
        if ( l < 2 ) {
            if ( l === 0 ) {
                return ; // Queue was empty.
            }
            // Queue had one element, which was 'x'.
            return [ x , map . get ( x ) . pop ( ) ] ;
        }

        var r = a [ 0 ] ; // The root (smallest priority) to be returned.
        var i = 0 , j ; // 'i' is current index, 'j' is child index.

        // Bubble down the removed last element ('x') from the root to maintain heap property.
        // Loop while 'i' has at least one child (i.e., 'i' is not a leaf node in the context of the new length 'l-1').
        for ( ; i < l - 1 >> 1 ; i = j ) {
            j = i + i + 1 ; // Calculate left child index.
            // If right child exists and is smaller than left child, choose right child.
            if ( a [ j ] > a [ j + 1 ] ) {
                j ++ ;
            }
            if ( a [ j ] >= x ) {
                break ; // If the child is greater than or equal to 'x', 'x' is in its correct position.
            }
            a [ i ] = a [ j ] ; // Move the smaller child up.
        }
        a [ i ] = x ; // Place 'x' in its final position.

        // Retrieve and return the associated value for the original root 'r'.
        return [ r , map . get ( r ) . pop ( ) ] ;
    }

    /**
     * Getter for the current size (number of elements) of the priority queue.
     * @returns {number} The number of elements in the queue.
     */
    get size ( ) {
        return this . a . length ;
    }

    /**
     * Getter for the smallest priority value in the queue (the root of the heap).
     * @returns {number} The smallest priority value.
     */
    get top ( ) {
        return this . a [ 0 ] ;
    }
}


// --- Main Program Execution ---

// Define a constant for the maximum fuel/state capacity per city.
const mx = 2500 ;

// Call the main function to execute the problem logic.
var myOut = main ( ) ;

// If the main function returns a defined value, print it to the console.
if ( myOut !== undefined ) {
    console . log ( myOut ) ;
}


/**
 * The main function orchestrates the solution to the problem.
 * It reads input, constructs a state-space graph, runs Dijkstra's,
 * and processes the results.
 * @returns {string} The final answer, typically formatted for output.
 */
function main ( ) {
    // Read N (number of cities), M (number of roads), S (initial fuel/silver).
    var [ n , m , s ] = nexts ( 3 ) ;

    // Create a Dijkstra graph. Each city 'i' has 'mx' possible states (0 to mx-1 fuel).
    // The total number of nodes in this state-space graph is N * MX.
    // Node index for city 'city_idx' with 'fuel_level' is `city_idx * mx + fuel_level`.
    var g = new dijkstra ( mx * n ) ;

    // Process each of the M roads.
    for ( var i = 0 ; i < m ; i ++ ) {
        // Read road details: u, v (connected cities), a (silver cost to travel),
        // b (time cost to travel).
        var [ u , v , a , b ] = nexts ( 4 ) ;

        u -- ; // Convert city indices from 1-based to 0-based.
        v -- ;

        u *= mx ; // Calculate the base index for city 'u' in the state graph.
        v *= mx ; // Calculate the base index for city 'v' in the state graph.

        // Add edges for traveling between cities.
        // We can only travel if current fuel 'j' is greater than or equal to 'a'.
        // The loop iterates from max possible fuel down to 'a'.
        for ( var j = mx ; j -- > a ; ) {
            // Add a directed edge from (city u, fuel j) to (city v, fuel j-a) with cost b.
            g . add ( u + j , v + j - a , b ) ;
            // Add a directed edge from (city v, fuel j) to (city u, fuel j-a) with cost b.
            g . add ( v + j , u + j - a , b ) ;
        }
    }

    // Process each of the N cities for fuel refill options.
    for ( var i = 0 ; i < n ; i ++ ) {
        // Read refill details: c (silver gained), d (time cost to refill).
        var [ c , d ] = nexts ( 2 ) ;

        var v = i * mx ; // Calculate the base index for the current city 'i'.

        // Add edges for refilling fuel within the current city.
        // From current fuel 'j' to `min(mx-1, j+c)` fuel, with cost 'd'.
        // The fuel level cannot exceed `mx-1`.
        for ( var j = 0 ; j < mx - 1 ; j ++ ) {
            g . add ( v + j , v + Math . min ( mx - 1 , j + c ) , d ) ;
        }
    }

    // Solve the shortest path from the starting state.
    // The starting state is city 0 (implied, as problems often start at city 1 and convert to 0-indexed)
    // with initial fuel 's', capped at `mx-1`.
    var dp = g . solve ( Math . min ( mx - 1 , s ) ) ;

    // Initialize an array 'ans' to store the minimum cost to reach each city.
    // Initialize with a large value (1e18) for all cities.
    var ans = xArray ( 1e18 , n ) ;

    // Calculate the minimum cost to reach each city (from city 1 to N-1),
    // considering all possible final fuel levels at that city.
    for ( var i = 1 ; i < n ; i ++ ) {
        var v = i * mx ; // Base index for the current city 'i'.
        for ( var j = 0 ; j < mx ; j ++ ) {
            // Update the minimum cost to reach city 'i' by checking all its fuel states.
            ans [ i ] = Math . min ( ans [ i ] , dp [ v + j ] ) ;
        }
    }

    // Return the answer. Slice from index 1 to exclude city 0 (if problem implies 0-indexed start),
    // and join the results with newline characters for standard output.
    return ans . slice ( 1 ) . join ( "\n" ) ;
}