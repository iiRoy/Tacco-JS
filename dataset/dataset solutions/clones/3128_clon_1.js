var lines = []; // This array will store all lines read from input.
var readline = require('readline'); // Importing the 'readline' module for handling input.

var rl = readline.createInterface( {
    input : process.stdin, // Configure the input stream to be standard input.
    output: process.stdout, // Configure the output stream to be standard output.
} );

// Attach an event listener for each line of input.
rl.on( 'line', function ( x ) {
    // When a line is received, add it to our 'lines' array.
    lines.push( x );
} );

// Attach an event listener for when the input stream closes.
rl.on( 'close', function ( ) {
    // Define a modulo constant, commonly used in competitive programming.
    var MOD = Math.pow( 10, 9 ) + 7;

    // The first line of input is N, which is the total number of elements.
    var N = Number( lines.shift() );

    // Initialize an array 'C' with 'N' elements.
    var C = Array( N );

    // Populate the array 'C' by converting the remaining input lines to numbers.
    for ( var i = 0 ; i < N ; i++ ) {
        C[i] = Number( lines[i] );
    }

    // 'number' will store counts of distinct elements that are not adjacent to themselves.
    var number = {};
    // 'result' will accumulate the final count.
    var result = 0;

    /*
     * The original comments here were illustrative examples of sequences.
     * They are not part of the logic and can be removed or replaced.
     * We'll remove them for a cleaner, yet different, look.
     */

    // Iterate through the array C, comparing each element with its successor.
    for ( var i = 0 ; i < N - 1 ; i++ ) {
        // If an element C[i] is different from its next element C[i+1]...
        if ( C[i] !== C[i+1] ) {
            // Check if C[i] is already a key in the 'number' object.
            // If it's undefined, initialize its count to 1.
            // Otherwise, increment its existing count.
            number[C[i]] === undefined ? number[C[i]] = 1 : number[C[i]]++;
        }
    }

    // The last element C[N-1] is always considered for counting.
    // Increment its count in the 'number' object.
    number[ C[N-1] ]++;

    // Iterate over the keys (distinct numbers) in the 'number' object.
    Object.keys( number ).forEach( function ( keys ) {
        // Calculate combinations (Co) of 2 for each number's count.
        // Add this to the running 'result'.
        result += Co( number[keys], 2 );
        // Apply the modulo operation to 'result' to prevent overflow.
        result %= MOD;
    } );

    // The problem statement implies an initial state is also counted,
    // which effectively means adding 1 to the final calculated result.
    // This accounts for the base case or the state before any operations.
    console.log( result + 1 );
} );

// Function to calculate permutations P(n, m).
// P(n, m) = n * (n-1) * ... * (n-m+1)
function P( n, m ) {
    var result = 1; // Initialize the product.
    var counter = 0; // Counter for the number of multiplications.

    // Loop 'm' times to multiply 'n' by 'n-1', 'n-2', etc.
    while ( counter < m ) {
        result *= n; // Multiply current result by 'n'.
        n--; // Decrement 'n' for the next iteration.
        counter++; // Increment the counter.
    }
    return ( result ); // Return the calculated permutation.
}

// Function to calculate combinations Co(n, m).
// Co(n, m) = P(n, m) / P(m, m)
function Co( n, m ) {
    // Return the result of permutations P(n, m) divided by P(m, m).
    // P(m, m) is equivalent to m! (m factorial).
    return ( P( n, m ) / P( m, m ) );
}