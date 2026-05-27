$( function () {
    // This script is designed to read numerical input from standard input,
    // process it in batches, and then output a specific result based on calculations.

    // Utilize the Node.js 'fs' module to synchronously read the entire content
    // of the standard input stream, interpreting it as UTF-8 encoded text.
    let rawData = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );

    // Process the raw input: first, remove any leading or trailing whitespace,
    // then split the cleaned string into an array of individual lines based on newline characters.
    let lineSegments = ( rawData . trim() ) . split( "\n" );

    // Initialize an empty array to temporarily store sums of numbers from input lines.
    let scoreAccumulator = [ ];

    // Begin iterating through each line segment obtained from the input.
    for ( let idx = 0; idx < lineSegments . length; idx++ ) {
        // Implement a specific termination condition:
        // If the score accumulator is currently empty AND the current line segment
        // is exactly the string "0 0", then the processing loop should be exited.
        if ( scoreAccumulator . length === 0 && lineSegments[ idx ] === "0 0" ) {
            break; // Exit the loop as per the specified condition.
        }

        // For the current line segment, split it by spaces and convert each resulting
        // substring into a numerical value, storing them in a new array.
        let currentNumbers = lineSegments[ idx ] . split( " " ) . map( Number );

        // Calculate the sum of the first two numbers from the current line
        // and append this sum to the score accumulator array.
        scoreAccumulator . push( currentNumbers[ 0 ] + currentNumbers[ 1 ] );

        // Check if the score accumulator has gathered exactly five entries.
        // If so, it's time to process this batch of scores.
        if ( scoreAccumulator . length === 5 ) {
            // Find the maximum value within the current batch of five accumulated scores.
            let highestScore = scoreAccumulator . reduce( function ( currentMax, nextValue ) {
                return Math . max( currentMax, nextValue );
            } );

            // Define a fixed set of character labels that correspond to the positions
            // of scores in the accumulator (A for index 0, B for index 1, etc.).
            let labelCharacters = "ABCDE" . split( "" );

            // Determine the character label that corresponds to the position
            // of the highest score found in the current batch.
            let resultLabel = labelCharacters[ scoreAccumulator . indexOf( highestScore ) ];

            // Output the determined character label followed by a space and the highest score.
            console . log( resultLabel + " " + highestScore );

            // After processing and outputting, clear the score accumulator
            // to prepare for the next batch of five scores.
            scoreAccumulator = [ ];
        }
    }
} );
