/*
 * This JavaScript module processes input data
 * to perform a specific calculation.
 */
"use strict"; // Enforce strict parsing and error handling for better code quality.

// Defines the primary function to handle the incoming data.
function ProcessInput( rawDataString ) {
    // Break down the raw input string into an array of individual lines.
    const inputLines = rawDataString.split( '\n' );

    // Extract the first numeric value from the input and convert it to a number.
    const firstDimension = Number( inputLines[0] );

    // Retrieve the second numeric value from the input and ensure it's a number.
    const secondDimension = Number( inputLines[1] );

    // Obtain the third numeric value, which represents a total count, and cast to number.
    const totalCount = Number( inputLines[2] );

    // A conditional check based on the dimensions.
    if ( firstDimension > secondDimension ) {
        // If the first dimension is greater, calculate and display the ceiling of count divided by the first dimension.
        console.log( Math.ceil( totalCount / firstDimension ) );
    } else {
        // Otherwise (if first dimension is less than or equal to second), perform the same calculation.
        // Note: The logic for both branches is identical in this specific implementation.
        console.log( Math.ceil( totalCount / firstDimension ) );
    }
}

// Invoke the main processing function with data read from standard input.
// The 'fs' module is used to access the file system, and 'readFileSync' reads the content synchronously.
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );