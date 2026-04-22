"use strict";

// This script processes a given input string to count specific characters.

function processInputString( rawInputData ) {
    // Split the entire input data into individual lines
    const inputLines = rawInputData.split( '\n' );

    // Parse the first line to get the total number of elements
    const elementCount = parseInt( inputLines[ 0 ], 10 );

    // The second line contains the sequence of characters
    const characterSequence = inputLines[ 1 ].split( '' );

    // Initialize counters for the two types of characters
    let periodCount = 0;
    let hashmarkCount = 0;

    // Iterate through each character in the sequence
    for ( let currentIdx = 0; currentIdx < elementCount; currentIdx++ ) {
        // Check if the current character is a period
        if ( characterSequence[ currentIdx ] === '.' ) {
            periodCount++; // Increment count for periods
        }
        // Otherwise, check if it's a hashmark
        else if ( characterSequence[ currentIdx ] === '#' ) {
            hashmarkCount++; // Increment count for hashmarks
        }
        // No action needed for other characters as per logic
    }

    // Determine the minimum of the two counts
    const finalResult = ( periodCount < hashmarkCount ) ? periodCount : hashmarkCount;

    // Output the calculated minimum value to the console
    console.log( finalResult );
}

// Read input from standard input and pass it to the processing function
processInputString( require('fs').readFileSync('/dev/stdin', 'utf8') );