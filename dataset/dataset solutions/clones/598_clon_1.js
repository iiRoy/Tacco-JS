/* This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been modified extensively.
 */

function   BFS ( X , Y ) {
    // Define directional arrays for movement in a 2D grid (up, down, left, right)
    var dx = [ 0 , -1 , 1 , 0 ] ;

    var dy = [ -1 , 0 , 0 , 1 ] ; // Y-coordinate changes for corresponding directions

    var cnt = 0 ; // Initialize counter for the path length

    // Initialize the BFS queue with the starting point (X, Y), initial count, and initial 's' value
    var bfs = [ [ X , Y , cnt , 1 ] ] ;

    var obj = { } ; // An object, though not explicitly used in this BFS logic. Can be ignored.

    var memo = [ ] ; // Memoization table to store visited states and their 's' values

    // Initialize the memoization table with a large size (1001x1001) and default values (0)
    for ( var i = 0 ; i <= 1000 ; i ++ ) {
        memo [ i ] = [ ] ;
        for ( var j = 0 ; j <= 1000 ; j ++ ) {
            memo [ i ] [ j ] = 0 ; // Set all initial memo values to zero, indicating unvisited or lower 's'
        }
    }

    // Mark the starting point in the memoization table with its initial 's' value (which is 0 here, implicitly)
    memo [ X ] [ Y ] = 0 ;

    // J acts as the pointer/index for the BFS queue, indicating the current element being processed
    var J = 0 ;

    while ( true ) { // Loop indefinitely until a break condition is met inside
        // Retrieve the current 'leaf' (node) from the BFS queue based on the pointer J
        var leaf = bfs [ J ] ;

        J ++ ; // Move to the next element in the queue for the subsequent iteration

        var x = leaf [ 0 ] ; // Current x-coordinate of the node
        var y = leaf [ 1 ] ; // Current y-coordinate of the node
        var c = leaf [ 2 ] ; // Current path count (number of steps) to reach this node
        var s = leaf [ 3 ] ; // Current 's' value, representing the required 'power' level collected so far

        // Check if the target 'power' level (power + 1) has been reached
        if ( s === power + 1 ) {
            cnt = c ; // If so, store the current path count as the answer
            break ;   // And exit the BFS loop as the shortest path is found
        }

        // Explore all four possible directions (up, down, left, right) from the current node
        for ( var i = 0 ; i < 4 ; i ++ ) {
            var xx = x + dx [ i ] ; // Calculate the new x-coordinate for the neighbor
            var yy = y + dy [ i ] ; // Calculate the new y-coordinate for the neighbor

            var ss = s ; // Copy the current 's' value for potential modification if a power-up is found

            // Boundary checks: ensure the new coordinates are within the grid limits
            if ( xx < 0 || yy < 0 || xx >= hw [ 1 ] || yy >= hw [ 0 ] ) continue ; // Skip if out of bounds

            // Obstacle check: if the cell contains 'X', it's an unpassable obstacle
            if ( YX [ yy ] [ xx ] == "X" ) continue ; // Skip if it's an obstacle

            // Power-up check: if the cell contains the current 'ss' value (as a string), increment 'ss'
            if ( YX [ yy ] [ xx ] === "" + ss ) ss ++ ; // Collect power-up

            // Memoization check: if this path to (xx, yy) has already been visited
            // with an 's' value greater than or equal to the current 'ss', skip.
            // This ensures we always take the path that collects more power or is equally good.
            if ( memo [ xx ] [ yy ] >= ss ) continue ;

            // Update memoization table with the new 's' value for (xx, yy)
            memo [ xx ] [ yy ] = ss ;

            // Add the new valid neighbor to the BFS queue with its updated state
            bfs [ bfs.length ] = [ xx , yy , c + 1 , ss ] ;
        }
    }

    // Return the final path count after the BFS completes
    return cnt ;
}

// --- Main Program Execution Section ---

// Read input from standard input, using Node.js 'fs' module
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace and split the input string into an array of lines
var Arr = ( input.trim ( ) ) . split ( "\n" ) ;

// Parse the first line (shifted from Arr) for height, width, and initial power level
var hw = ( Arr.shift ( ) ) . split ( " " ) . map ( Number ) ;

// Extract the 'power' value from the parsed header array
var power = hw [ 2 ] ;

var YX = [ ] ; // Initialize an array to store the grid map

var start = [ ] ; // Initialize an array to store the starting coordinates (x, y)

// Process the remaining lines to build the grid map and find the starting point 'S'
for ( var i = 0 ; i < hw [ 0 ] ; i ++ ) {
    var arr = ( Arr.shift ( ) ) . split ( "" ) ; // Get a row of the grid as an array of characters

    // Check if the current row contains the starting point 'S'
    if ( arr.indexOf ( "S" ) != -1 ) start = [ arr.indexOf ( "S" ) , i ] ; // Store its (x, y) coordinates

    YX.push ( arr ) ; // Add the processed row to the grid map array
}

// Call the BFS function with the determined starting coordinates
var ans = BFS ( start [ 0 ] , start [ 1 ] ) ;

// Print the final answer (the minimum path count) to the console
console.log ( ans ) ;