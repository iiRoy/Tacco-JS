const rawData = require('fs') .readFileSync( '/dev/stdin' , 'utf8' ).trim( ); /* Acquire all input from standard input, cleanse leading/trailing whitespace. */

const dataRows = rawData.split('\n'); // Divide the raw input string into an array of individual text lines.

while ( true ) { // Initiate an endless processing loop.

    let baseSide = +(dataRows.shift( ));  // Retrieve and convert the first numerical dimension (e.g., a base measurement).
    let heightVal = +(dataRows.shift( )); // Retrieve and convert the second numerical dimension (e.g., a height measurement).

    if ( baseSide + heightVal === 0 ) { // Evaluate the termination condition: if both dimensions sum to zero.
        break ; // Exit the loop if the condition is met.
    }

    // Compute a specific geometric value using the acquired dimensions.
    // The formula resembles the surface area calculation for a specific shape.
    const computedResult = ( ( baseSide * baseSide ) + ( baseSide * Math.sqrt( ( 4 * heightVal * heightVal ) + ( baseSide * baseSide ) ) ) ) .toFixed( 6 ) ;
    console.log( computedResult ) ; // Print the calculated result, formatted to precisely six decimal places.
}