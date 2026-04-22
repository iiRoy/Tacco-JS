/*
 * This JavaScript file processes input from standard input.
 * It's designed to read a sequence of numbers and perform
 * a specific calculation based on their frequencies.
 *
 * Type I Clone: Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions are strictly preserved.
 */

var lines = []; // Array to hold all input lines.
var readline = require('readline'); // Module for reading input line by line.

// Create an interface for reading input.
var rl = readline.createInterface( {
    input : process.stdin,       // Use standard input.
    output : process.stdout,     // Use standard output (though not written to directly here).
} );

// Event handler for each line received.
rl.on( 'line', function ( x ) {
    lines.push( x ); // Add the current line to our collection.
} );


// Event handler when the input stream closes.
rl.on( 'close', function ( ) {
    
    // Parse the first line as N.
    var N = Number( lines[0] );
    
    // Parse the second line: split by spaces and convert to numbers.
    var a = lines[1].split( " " ).map( value => Number( value ) );

    var counter = {}; // Object to store frequency of numbers.
    
    // Populate the counter object.
    for ( var value of a ) {
        if ( counter[value] === undefined ) { // If this number hasn't been seen yet.
            counter[value] = 0; // Initialize its count to zero.
        }
        counter[value]++; // Increment the count for this number.
    }

    var ans = 0; // Initialize the answer variable.
    
    // Iterate over each unique number found in 'a'.
    Object.keys( counter ).forEach( i => {
        var index = Number( i ); // Convert the key (string) back to a number.
        
        // This is an original comment, preserved.
        // 当該数字　=== index or 当該数字 === 0
        
        // Check if the number itself is not equal to its frequency count.
        if ( index !== counter[index] ) {

            // If the number is less than its count, we need to reduce the count to match the number.
            if ( index < counter[index] ) {
                ans += counter[index] - index; // Add the excess count to 'ans'.
            }
            // If the number is greater than its count, we need to remove all occurrences of this number.
            else {
                ans += counter[index]; // Add the total count of this number to 'ans'.
            }
        }
    } );

    console.log( ans ); // Output the final result.
} );