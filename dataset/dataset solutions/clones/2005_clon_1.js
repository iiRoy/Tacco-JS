/*
 * This JavaScript code reads input from standard input, processes it,
 * and then prints a result to standard output.
 * It uses the 'readline' module to handle input line by line.
 * The core logic involves BigInt arithmetic and state tracking
 * to find a specific minimum value based on a given algorithm.
 *
 * This file is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

process.stdin.resume( ); // Start the standard input stream to listen for data

process.stdin.setEncoding('utf8'); // Define the character encoding for the input stream


var   lines   =   [ ] ; // Declare an array to hold all lines read from stdin

var reader = require('readline').createInterface({ // Initialize the readline interface
    input   :   process.stdin,                     // Direct input to standard input
    output  :   process.stdout                     // Direct output to standard output (though not actively used for writing in this script)
});

// Attach an event listener for each 'line' received
reader.on( 'line', ( line ) => {
                                 // Push the current line into our 'lines' array
    lines.push(line);
} );

// Attach an event listener for the 'close' event, indicating end of input
reader.on( 'close', ( ) => {
    // Parse the first line of input, splitting by space and mapping to BigInt values
    let [ N, K ] = lines[0].split(" ").map( v => BigInt(v) );

    const map = { }; // Create an empty object to serve as a hash map (or set) for visited numbers

    let ans = N; // Initialize 'ans' with the starting value of N

    // Begin a loop that continues as long as the current value of N has not been seen before in the map
    while ( ! map[N] ) {
        const a = N % K; // Calculate the remainder when N is divided by K

        map[a] = true; // Mark the remainder 'a' as visited in our map

        // Update 'ans' to be the minimum of its current value and 'a'
        ans = ans > a ? a : ans;

        // Determine the next value of N based on a conditional expression
        N = K > a ? K - a : a - K;

        // If 'ans' has reached 0, we've found the absolute minimum, so we can exit the loop early
        if ( ans == 0 )
        {
            break;
        }
    }

    // Print the final answer to the console, converting the BigInt to a string
    console.log( ans.toString( ) );
} );