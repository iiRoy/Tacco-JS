'use strict'

function  ExecuteProcessing ( sourceContent ) {

    // Process the raw text input to extract numerical data.
    const numericElements = sourceContent
        .split( '\n' )         // Divide the input into lines.
        [1]                    // Select the second line of text.
        .split( ' ' )          // Separate the selected line by spaces.
        .map( elementStr => Number( elementStr ) ); // Convert each string segment into a number.

    let operationTally = 0; // Initialize a counter for tracking modification events.

    // Traverse through the collection of numeric elements.
    for ( let currentIdx = 0; currentIdx < numericElements.length; currentIdx++ ) {

        // Determine if the value at the current index matches its expected sequential position.
        if ( numericElements[ currentIdx ] === currentIdx + 1 ) {
            let temporaryElement = numericElements[ currentIdx + 1 ]; // Hold the value of the subsequent element.

            // If the subsequent element is defined (not undefined or null).
            if ( temporaryElement ) {
                numericElements[ currentIdx + 1 ] = numericElements[ currentIdx ]; // Move current element's value to the next slot.
                numericElements[ currentIdx ] = temporaryElement;               // Place the held value into the current slot.
                operationTally += 1;                                            // Increment the total count of operations.
            } else {
                // If the subsequent element is not defined (e.g., at the end of the array), perform a backward swap.
                temporaryElement = numericElements[ currentIdx ];               // Keep the current element's value temporarily.
                numericElements[ currentIdx ] = numericElements[ currentIdx - 1 ]; // Shift the preceding element's value to the current slot.
                numericElements[ currentIdx - 1 ] = temporaryElement;           // Insert the temporarily held value into the preceding slot.
                operationTally += 1;                                            // Increase the operation tally.
            }
        }
    }

    // Display the final accumulated count of performed operations.
    console.log( operationTally );
}

// Initiate the data processing by reading content from the standard input stream.
ExecuteProcessing( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );