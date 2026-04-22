// This file processes input data to calculate a specific sum.
// It involves reading a matrix, counting occurrences, and applying Floyd-Warshall.

var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all input from standard input

// Split the input string into an array of lines.
var lines = input . split ( '\n' ) ;


/*
 * The first line of input contains a single integer 'h'.
 * It represents the number of subsequent data lines to process.
 */
var h = parseInt ( lines . shift ( ) . split ( ' ' ) [ 0 ] ) ;


// Initialize a 10x10 distance matrix 'dist'.
// Each row is read from a separate line of input, and values are parsed as integers.
var dist = [ ... Array ( 10 ) ]
    . map (
        ( ) => lines . shift ( ) . split ( ' ' ) . map (
            v => parseInt ( v , 10 ) // Parse each value as an integer
        )
    ) ;


// Initialize an array 'counts' to store frequencies of numbers 0-9.
// All counts are initially set to zero.
var counts = new Array ( 10 ) . fill ( 0 ) ;

/*
 * Process 'h' lines of input.
 * Each line contains space-separated numbers.
 * For each number, increment its corresponding count in the 'counts' array.
 */
for ( var i = 0 ; i < h ; i ++ ) {
    lines . shift ( )                         // Get the next line from the input
        . split ( ' ' )                       // Split the line by spaces into an array of strings
        . map ( v => parseInt ( v , 10 ) )        // Parse each string part as an integer
        . forEach ( v => counts [ v ] ++ ) ;       // Increment the count for the parsed value 'v'
}


// --- Floyd-Warshall Algorithm Implementation ---
// This section calculates the shortest paths between all pairs of nodes (0-9).
// 'dist[i][j]' will eventually hold the minimum cost to go from node 'i' to node 'j'.
for ( var k = 0 ; k < 10 ; ++ k ) { // Iterate through all possible intermediate nodes 'k'
    for ( var i = 0 ; i < 10 ; ++ i ) { // Iterate through all possible source nodes 'i'
        for ( var j = 0 ; j < 10 ; ++ j ) { // Iterate through all possible destination nodes 'j'
            // Update dist[i][j] if a shorter path is found by going from 'i' to 'k' and then from 'k' to 'j'
            dist [ i ] [ j ] = Math . min ( dist [ i ] [ j ] , dist [ i ] [ k ] + dist [ k ] [ j ] ) ;
        }
    }
}


/*
 * Final calculation and output:
 * Sum up the product of each number's count and its minimum distance to node '1'.
 * The numbers range from 0 to 9.
 */
console . log (
    [ ... Array ( 10 ) . keys ( ) ] // Create an array of numbers from 0 to 9 (representing node indices)
        . reduce (
            ( p , c ) => p + counts [ c ] * dist [ c ] [ 1 ] , // Accumulate sum: previous total 'p' + (count of current node 'c' * distance from 'c' to node '1')
            0                                     // The initial accumulator value is 0
        )
) ;

// End of JavaScript script.