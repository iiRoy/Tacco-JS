/* This code snippet demonstrates a solution for a grid traversal problem.
 * It uses a Breadth-First Search (BFS) like approach with a specific
 * movement constraint (k steps in one direction).
 */
"use strict" ; // Ensures strict mode for better error handling and cleaner code.

// Input reading utilities for competitive programming environments.
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Reads all input from stdin.
var cin = input . split ( / |\n/ ) , // Splits input into tokens by spaces or newlines.
    cid = 0 ;                      // Current index for reading tokens.

/**
 * Reads the next token as a number.
 * @returns {number} The next number from the input stream.
 */
function next ( )
{
    return + cin[ cid ++ ] ; // Uses unary plus to convert string to number, then increments index.
}

/**
 * Reads the next token as a string.
 * @returns {string} The next string from the input stream.
 */
function nextstr ( )
{
    return cin[ cid ++ ] ; // Returns the string token directly, then increments index.
}

/**
 * Reads the next token as a BigInt.
 * @returns {BigInt} The next BigInt from the input stream.
 */
function nextbig ( )
{
    return BigInt ( cin[ cid ++ ] ) ; // Converts string to BigInt, then increments index.
}

/**
 * Reads 'n' tokens from the input stream.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function nexts ( n , a )
{
    // Conditional processing based on the 'a' flag.
    return a
        ? cin . slice ( cid , cid += n ) // If 'a' is true, return string slices.
        : cin . slice ( cid , cid += n ) . map ( a => + a ) ; // If 'a' is false, convert to numbers.
}

/**
 * Reads a 2D matrix of 'h' rows and 'w' columns from the input stream.
 * @param {number} h - The number of rows.
 * @param {number} w - The number of columns.
 * @param {boolean} a - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function nextm ( h , w , a )
{
    var r = [ ] , // Resulting matrix array.
        i = 0 ;   // Loop counter for rows.

    if ( a ) // If 'a' is true, read as strings.
        for ( ; i < h ; i ++ )
            r . push ( cin . slice ( cid , cid += w ) ) ; // Push string slices.
    else // If 'a' is false, read as numbers.
        for ( ; i < h ; i ++ )
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ; // Push number arrays.
    return r ; // Return the constructed matrix.
}

/**
 * Dynamically creates multi-dimensional arrays initialized with a value.
 * The last argument is the initial value 'v', and preceding arguments are dimensions.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} v - The initial value for array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray ( v )
{
    var a = arguments , // All arguments passed to the function.
        l = a . length , // Total number of arguments.
        // Builds the innermost array creation string.
        r = "Array(a[" + -- l + "]) . fill ( ) . map ( x => { return " + v + " ; } )" ;

    // Iteratively builds the outer array creation strings.
    while ( -- l )
        r = "Array(a[" + l + "]) . fill ( ) . map ( x => " + r + " )" ;

    return eval ( r ) ; // Executes the dynamically built string to create the array.
}


// Call the main function and handle its output.
var myOut = main ( ) ; // Stores the result of the main function.

// If the main function returns a value (not undefined), log it to console.
if ( myOut !== undefined )
    console . log ( String ( myOut ) ) ; // Ensures output is a string.


/*
 * The primary function containing the problem's solution logic.
 * It implements a BFS-like algorithm to find the shortest path in a grid
 * with a special movement rule (move up to k steps in a cardinal direction).
 */
function main ( )
{
    // Constants used throughout the main logic.
    const inf = 1e9 ; // A large number representing infinity for distance.
    const dx = [ 0 , 1 , 0 , - 1 ] , // Delta X coordinates for directions (Up, Right, Down, Left).
          dy = [ - 1 , 0 , 1 , 0 ] , // Delta Y coordinates for directions (Up, Right, Down, Left).
          dd = 4 ; // Total number of cardinal directions.

    // Read grid dimensions (height, width) and maximum steps 'k' per move.
    var [ h , w , k ] = nexts ( 3 ) ;

    // Read start (sy, sx) and goal (gy, gx) coordinates.
    var [ sy , sx , gy , gx ] = nexts ( 4 ) ;

    // Initialize the grid 'c' with boundary walls.
    var c = Array ( h + 2 ) ; // Create an array for h+2 rows (including top/bottom walls).
    c [ 0 ] = xArray ( " '@' " , w + 2 ) . join ( "" ) ; // Top boundary row, filled with '@'.

    // Populate the grid rows with input data, adding '@' for left/right walls.
    for ( var i = 0 ; i < h ; i ++ )
        c [ i + 1 ] = "@" + nextstr ( ) + "@" ; // Each row from input, padded with walls.

    c [ h + 1 ] = xArray ( " '@' " , w + 2 ) . join ( "" ) ; // Bottom boundary row, filled with '@'.

    // Initialize the distance array 'dist' with infinity.
    var dist = xArray ( inf , h + 2 , w + 2 ) ; // A 2D array to store shortest distances.

    // Set the starting point's distance to 0.
    dist [ sy ] [ sx ] = 0 ;

    // Initialize the queue 'q' for BFS and the current distance level 'd'.
    var q = [ sy , sx ] , // Queue stores coordinates as [y1, x1, y2, x2, ...].
        d = 0 ;            // Current distance level from the source.

    // Main BFS loop: continues as long as there are nodes to process.
    while ( q . length )
    {
        var p = [ ] ; // 'p' will store nodes for the next distance level.

        // Process all nodes at the current distance level 'd'.
        while ( q . length )
        {
            var x = q . pop ( ) , // Get x-coordinate from the queue (LIFO for pop).
                y = q . pop ( ) ; // Get y-coordinate from the queue.

            // Explore all four cardinal directions.
            for ( var i = 0 ; i < dd ; i ++ )
            {
                var xx = x , // Current x-position for movement in this direction.
                    yy = y ; // Current y-position for movement in this direction.

                // Move up to 'k' steps in the current direction.
                for ( var j = 0 ; j < k ; j ++ )
                {
                    xx += dx [ i ] ; // Update x-coordinate.
                    yy += dy [ i ] ; // Update y-coordinate.

                    // Check if the new position is an obstacle (wall).
                    if ( c [ yy ] [ xx ] === "@" )
                        break ; // Cannot move further in this direction.

                    // If this cell has already been reached with an equal or shorter path
                    // from a previous level, or from this level (if it was an earlier k-step move),
                    // then there's no need to update or re-add it.
                    if ( dist [ yy ] [ xx ] <= d )
                        break ; // No better path found through this route.

                    // If a shorter path is found, update distance and add to next level's queue.
                    dist [ yy ] [ xx ] = d + 1 ; // Update distance to current level + 1.
                    p . push ( yy , xx ) ;       // Add new coordinates to the next level queue.
                }
            }
        }
        q = p ; // Move to the next distance level's queue.
        d ++ ;  // Increment the distance level.
    }

    // After BFS, return the distance to the goal or -1 if unreachable.
    return dist [ gy ] [ gx ] === inf ? - 1 : dist [ gy ] [ gx ] ; // Ternary operator for concise return.
}