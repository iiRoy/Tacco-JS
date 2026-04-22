"use strict"; // Enforce strict mode for better code quality and error handling.

    // This primary function orchestrates the processing of received textual data.
    const processInputData = ( receivedData ) => {

        // First, clean up leading/trailing whitespace and then segment the data by newlines.
        receivedData = receivedData . trim() . split( "\n" );

        // Extract the first numerical component from the initial line of input.
        const startingPoint = parseInt( receivedData [ 0 ] . split( " " ) [ 0 ] );

        // Extract the second numerical component from the initial line of input.
        const upperThreshold = parseInt( receivedData [ 0 ] . split( " " ) [ 1 ] );


        // Initialize a mutable variable to track the current value in our sequence.
        let currentSequenceValue = startingPoint;

        // Initialize a counter for the number of doubling operations performed.
        let doublingOperationsCount = 1;


        // Continue looping as long as the current sequence value does not exceed the defined upper threshold.
        while ( currentSequenceValue <= upperThreshold ) {

            // Check if the next potential doubled value would still be within the acceptable range.
            if ( ( currentSequenceValue * 2 ) <= upperThreshold ) {
                // If doubling is still possible and valid, increment our operation counter.
                doublingOperationsCount++;
            }

            // Update the current sequence value by doubling it for the next iteration.
            currentSequenceValue *= 2;
        }

        // Display the final tally of doubling operations to the standard output.
        console . log( doublingOperationsCount );
    };


// Execute the main processing function, feeding it content read from standard input.
processInputData( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) );