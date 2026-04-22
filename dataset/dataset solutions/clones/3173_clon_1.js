var lines = [ ] ; // Array to store input lines.

/*
 * Declare global variables for N, A, B, C,
 * 'l' (likely representing lengths of bamboo segments),
 * and 'result' initialized to a very large value.
 */
var N, A, B, C ;
var l ;
var result = Infinity ;


// Require the 'readline' module for reading input line by line.
var readline = require( "readline" ) ;

// Create an interface for reading input from stdin and writing output to stdout.
var rl = readline.createInterface( {
    input : process.stdin ,
    output : process.stdout
} ) ;


/*
 * Event listener for each line of input received.
 * Appends the received line 'x' to the 'lines' array.
 */
rl.on( 'line', function ( x ) {
    lines.push( x ) ;
} ) ;


/*
 * Event listener for the 'close' event,
 * which signals the end of input.
 * This is where the main processing logic begins.
 */
rl.on( 'close', function ( ) {

    // Extract the first line of input to parse N, A, B, C.
    var tmp = lines.shift( ) ;

    /*
     * Parse N, A, B, C from the first line.
     * The values are space-separated.
     */
    N = Number( tmp.split( " " ) [ 0 ] ) ;
    A = Number( tmp.split( " " ) [ 1 ] ) ;
    B = Number( tmp.split( " " ) [ 2 ] ) ;
    C = Number( tmp.split( " " ) [ 3 ] ) ;

    // Initialize the 'l' array with a size of N.
    l = Array( N ) ;

    /*
     * Populate the 'l' array with bamboo segment lengths
     * from the remaining input lines.
     */
    for ( var i = 0 ; i < N ; i++ ) {
        l [ i ] = Number( lines [ i ] ) ;
    }

    // Start the Depth-First Search (DFS) to explore all combinations.
    dfs( 0, [ ] ) ;

    // Output the final minimum result.
    console.log( result ) ;
} ) ;


/*
 * Depth-First Search (DFS) function to assign each bamboo segment
 * to one of four categories: target A, target B, target C, or unused.
 *
 * @param {number} n        The current index of the bamboo segment being considered.
 * @param {Array<number>} bamboo  An array representing the assignment of each bamboo segment.
 *                                 0 for A, 1 for B, 2 for C, 3 for unused.
 */
function dfs ( n, bamboo ) {
    // Base case: If all bamboo segments have been assigned.
    if ( n === N ) {
        calc( bamboo ) ; // Calculate cost for this assignment.
        return ( 0 ) ;   // Return value (not used for further processing).
    }

    // Iterate through the four possible assignments for the current bamboo segment.
    for ( var i = 0 ; i < 4 ; i++ ) {
        bamboo [ n ] = i ;            // Assign the current bamboo segment.
        dfs( n + 1, bamboo ) ;        // Recursively call for the next segment.
    }
}


/*
 * Calculates the cost for a given assignment of bamboo segments.
 *
 * @param {Array<number>} bamboo An array representing the assignment of each bamboo segment.
 *                                0 for A, 1 for B, 2 for C, 3 for unused.
 */
function calc ( bamboo ) {
    var a = 0 ; // Accumulated length for target A.
    var b = 0 ; // Accumulated length for target B.
    var c = 0 ; // Accumulated length for target C.

    // Counters for the number of bamboo segments used for each target.
    var counter_a = 0 ;
    var counter_b = 0 ;
    var counter_c = 0 ;

    // Iterate through each bamboo segment and sum its length based on its assignment.
    for ( var i = 0 ; i < N ; i++ ) {
        // If assigned to target A
        if ( bamboo [ i ] === 0 ) {
            if ( l [ i ] !== 0 ) {
                a = a + l [ i ] ;
                counter_a++ ;
            }
        }
        // If assigned to target B
        else if ( bamboo [ i ] === 1 ) {
            if ( l [ i ] !== 0 ) {
                b = b + l [ i ] ;
                counter_b++ ;
            }
        }
        // If assigned to target C
        else if ( bamboo [ i ] === 2 ) {
            if ( l [ i ] !== 0 ) {
                c = c + l [ i ] ;
                counter_c++ ;
            }
        }
        // If assigned as unused (bamboo[i] === 3), do nothing.
        else {
            /* This segment is not used for any target. */
        }
    }

    /*
     * Adjust counters: If a target used bamboo segments, subtract 1
     * because the first segment used doesn't incur a "combination cost".
     * If no segments were used, the counter remains 0.
     */
    counter_a - 1 < 0 ? counter_a = 0 : counter_a = counter_a - 1 ;
    counter_b - 1 < 0 ? counter_b = 0 : counter_b = counter_b - 1 ;
    counter_c - 1 < 0 ? counter_c = 0 : counter_c = counter_c - 1 ;

    // Only consider valid combinations where all three targets (A, B, C) have bamboo segments assigned.
    if ( a > 0 && b > 0 && c > 0 ) {
        // Calculate the current cost for this combination.
        var currentCost = Math.abs( A - a ) + Math.abs( B - b ) + Math.abs( C - c ) + ( counter_a + counter_b + counter_c ) * 10 ;

        // Update the global minimum result if the current cost is lower.
        if ( result > currentCost ) {
            result = currentCost ;
        }
    }
}