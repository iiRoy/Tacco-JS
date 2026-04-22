// This file contains a JavaScript program designed to solve a shortest path problem
// on a grid, potentially using a Breadth-First Search (BFS) like approach
// with a k-step movement capability.
// It includes several utility functions for efficient input parsing and array initialization.

"use strict"; // Enforces strict mode, which helps catch common coding errors and "unsafe" actions.


// --- Input Processing Utility Functions ---

// Reads the entire standard input synchronously using Node.js 'fs' module.
// The input is expected from '/dev/stdin' and is read as UTF-8.
var input = require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ;

// Parses the input string into an array of tokens, splitting by spaces or newlines.
// 'cid' (current input index) keeps track of which token to read next from 'cin'.
var cin = input.split( / |\n/ ),
    cid = 0;


/**
 * Retrieves the next token from the global input array 'cin' and converts it to a number.
 * Increments the internal cursor 'cid' after retrieval.
 * @returns {number} The next numerical input token.
 */
function next ( ) {

    return +cin[ cid++ ] ;

}


/**
 * Retrieves the next token from the global input array 'cin' as a string.
 * Increments the internal cursor 'cid' after retrieval.
 * @returns {string} The next string input token.
 */
function nextstr ( ) {

    return cin[ cid++ ] ;

}


/**
 * Retrieves the next token from the global input array 'cin' and converts it to a BigInt.
 * Increments the internal cursor 'cid' after retrieval.
 * @returns {BigInt} The next BigInt input token.
 */
function nextbig ( ) {

    return BigInt( cin[ cid++ ] ) ;

}


/**
 * Reads 'n' consecutive tokens from the input array 'cin'.
 * Optionally converts them to numbers or keeps them as strings based on the 'a' parameter.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} [a] - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<number|string>} An array containing the next 'n' tokens.
 */
function nexts ( n , a ) {

    // If 'a' is truthy, return the slice of strings directly.
    // Otherwise, map each element in the slice to a number using the unary plus operator.
    return a
           ? cin.slice( cid , ( cid += n ) )
           : cin.slice( cid , ( cid += n ) ).map( a => +a ) ;

}


/**
 * Reads a 2D matrix of input tokens with dimensions h (height) and w (width).
 * Each row is read as a slice of 'w' tokens.
 * @param {number} h - The number of rows (height) for the matrix.
 * @param {number} w - The number of columns (width) for each row.
 * @param {boolean} [a] - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a ) {

    var r = [ ], // Resulting 2D array.
        i = 0;   // Loop counter for rows.

    if ( a ) { // If 'a' is true, store string values.

        for ( ; i < h ; i++ ) {

            r.push( cin.slice( cid , ( cid += w ) ) ) ;

        }

    } else { // Otherwise, convert values to numbers.

        for ( ; i < h ; i++ ) {

            r.push( cin.slice( cid , ( cid += w ) ).map( a => +a ) ) ;

        }

    }

    return r ;

}


/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function constructs and evaluates a string expression to create arrays
 * of arbitrary dimensions provided as arguments.
 * Note: Using `eval` can be a security risk and is generally discouraged in production code.
 * @param {*} v - The initial value for all elements in the multi-dimensional array.
 * @returns {Array} A multi-dimensional array initialized with 'v'.
 */
function xArray ( v ) {

    var a = arguments , // Access all arguments passed to the function.
        l = a.length ,  // Number of dimensions + 1 (for the initial value 'v').
        // Start building the string for the innermost array.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    // Loop backwards through the dimensions to build the outer array expressions.
    while ( --l ) {

        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;

    }

    // Execute the dynamically generated string to create the array.
    return eval( r ) ;

}


// --- Main Program Execution Flow ---

// Calls the 'main' function, which contains the core logic, and stores its return value.
var myOut = main( ) ;

// If 'main' returns a defined value (i.e., not 'undefined'), print it to the console.
// This handles cases where 'main' might implicitly return 'undefined' or explicitly 'null'.
if ( myOut !== undefined ) {

    console.log( String( myOut ) ) ;

}


/**
 * The primary logic function for the problem.
 * It implements a modified Breadth-First Search (BFS) algorithm to find the shortest path
 * on a grid, where movement can be up to 'k' steps in a cardinal direction.
 * @returns {number} The shortest path distance from start to goal, or -1 if the goal is unreachable.
 */
function main ( ) {

    // Define a large constant to represent infinity, used for unvisited cells in distance array.
    const inf = 1e9 ;

    // Direction vectors for 4-way (cardinal) movement: [up, right, down, left].
    // dx: change in x-coordinate, dy: change in y-coordinate.
    const dx = [ 0 , 1 , 0 , -1 ] ,
          dy = [ -1 , 0 , 1 , 0 ] ,
          dd = 4 ; // Number of possible directions.

    // Read grid dimensions (height, width) and the maximum step count 'k'.
    var [ h , w , k ] = nexts( 3 ) ;

    // Read start coordinates (sy, sx) and goal coordinates (gy, gx).
    var [ sy , sx , gy , gx ] = nexts( 4 ) ;

    // Initialize the grid 'c' with extra rows for padding (borders).
    // 'h+2' accounts for a top and a bottom border row.
    var c = Array( h + 2 ) ;

    // Create the top border row, filled with obstacle characters ('@').
    // 'w+2' accounts for left and right border columns.
    c[ 0 ] = xArray( "'@'" , w + 2 ).join( "" ) ;

    // Populate the main grid rows. Each row is read as a string from input,
    // then wrapped with '@' characters for left and right borders.
    for ( var i = 0 ; i < h ; i++ ) {

        c[ i + 1 ] = "@" + nextstr( ) + "@" ;

    }

    // Create the bottom border row, similar to the top border.
    c[ h + 1 ] = xArray( "'@'" , w + 2 ).join( "" ) ;

    // Initialize the distance array 'dist' for all cells with 'infinity'.
    // This array will store the minimum number of "moves" (each move can be k steps)
    // required to reach a particular cell.
    var dist = xArray( inf , h + 2 , w + 2 ) ;

    // Set the distance to the starting cell (sy, sx) as 0.
    dist[ sy ][ sx ] = 0 ;

    // Initialize the queue 'q' for the BFS. It stores pairs of (y, x) coordinates.
    // 'd' represents the current distance level being explored.
    var q = [ sy , sx ] ,
        d = 0 ;

    // Main BFS loop: continues as long as there are cells in the current level's queue.
    while ( q.length ) {

        // 'p' is a temporary queue to store cells that will be visited in the next distance level (d+1).
        var p = [ ] ;

        // Process all cells that are at the current distance 'd'.
        // This inner loop effectively drains the 'q' (current level's queue).
        while ( q.length ) {

            // Pop coordinates from the queue. Note that 'pop()' retrieves from the end,
            // so we pop x then y to get the (y, x) pair that was pushed last.
            var x = q.pop( ) ,
                y = q.pop( ) ;

            // Explore all four cardinal directions (up, right, down, left).
            for ( var i = 0 ; i < dd ; i++ ) {

                // 'xx' and 'yy' represent the current coordinates being explored
                // *within* a single k-step movement in a specific direction.
                var xx = x ,
                    yy = y ;

                // Attempt to move up to 'k' steps in the current direction 'i'.
                for ( var j = 0 ; j < k ; j++ ) {

                    xx += dx[ i ] ; // Update x-coordinate based on direction.
                    yy += dy[ i ] ; // Update y-coordinate based on direction.

                    // If the new cell (yy, xx) is an obstacle ('@'),
                    // we cannot move further in this direction, so break.
                    if ( c[ yy ][ xx ] === "@" ) {

                        break ;

                    }

                    // If we have already found a path to this cell with 'd' or fewer steps,
                    // then reaching it via 'd+1' from the current path is not optimal or redundant.
                    // So, we stop exploring further in this direction from this current cell.
                    if ( dist[ yy ][ xx ] <= d ) {

                        break ;

                    }

                    // If the current path (d+1) is better than any previously recorded path
                    // to this cell (i.e., 'dist[yy][xx]' is still 'inf' or greater than 'd+1'),
                    // then update its distance and add it to the next level's queue 'p'.
                    if ( dist[ yy ][ xx ] > d + 1 ) {

                        p.push( yy , xx ) ;        // Add the new cell's coordinates to the next level's queue.
                        dist[ yy ][ xx ] = d + 1 ; // Update the minimum distance to reach this cell.

                    }

                } // End of inner loop (j: k-steps).

            } // End of direction loop (i: dd directions).

        } // End of current level queue processing (inner while loop).

        // After processing all cells at distance 'd', move to the next level.
        q = p ;   // The next level's queue becomes the current queue.
        d++ ;     // Increment the distance level.

    } // End of main BFS loop (outer while loop).

    // After the BFS completes, check the distance to the goal cell (gy, gx).
    // If it's still 'inf', the goal is unreachable. Otherwise, return the found distance.
    return dist[ gy ][ gx ] === inf ? -1 : dist[ gy ][ gx ] ;

} // End of main function.