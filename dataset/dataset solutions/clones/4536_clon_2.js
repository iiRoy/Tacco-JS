function ProcessInput( rawData ) {
    // Divide the incoming string data into lines
    var parsedData = rawData.split( "\n" );

    // Extract the numerical item count from the first line
    var itemCount = parseInt( parsedData[0] );

    // Convert the second line into an array of individual characters
    var charSequence = parsedData[1].split( "" );

    // Placeholder for generated string, though it's later re-declared
    var interimResult = "";

    // Indicator for the current character type: 0 for '(', 1 for ')'
    var charTypeFlag = 0; // 0: '(', 1: ')'

    // Array to store the lengths of consecutive segments of identical characters
    var segmentLengths = new Array( itemCount + 1 ).fill( 0 );

    // Current pointer for populating the segmentLengths array
    var segmentPointer = 0;

    // Evaluate the very first character in the sequence
    if ( charSequence[0] === ")" ) {
        // If it's a closing parenthesis, adjust the pointer and flag
        segmentPointer = 1;
        charTypeFlag = 1;
        segmentLengths[ segmentPointer ]++;
    } else {
        // Otherwise, increment the count for the initial segment
        segmentLengths[ segmentPointer ]++;
    }

    // Iterate through the character sequence starting from the second element
    for ( var charPosition = 1; charPosition < itemCount; charPosition++ ) {
        // Compare the current character with the preceding one
        if ( charSequence[ charPosition ] === charSequence[ charPosition - 1 ] ) {
            // If they are identical, extend the current segment's length
            segmentLengths[ segmentPointer ]++;
        } else {
            // If the character changes, advance to a new segment
            segmentPointer++;
            segmentLengths[ segmentPointer ]++;
        }
    }
    // Debugging line for segmentLengths array (originally commented)

    // Variable to store the difference between adjacent segment lengths
    var pairDifference = 0;

    // Variable to accumulate the overall difference across all segment pairs
    var cumulativeDifference = 0;

    // Loop through the segmentLengths array, processing elements in pairs
    for ( var loopIndex = 0; loopIndex < itemCount; loopIndex += 2 ) {
        // Calculate the difference between current and subsequent segment lengths
        pairDifference = segmentLengths[ loopIndex ] - segmentLengths[ loopIndex + 1 ];
        // Add this difference to the running total
        cumulativeDifference += pairDifference;
        /* Original commented block for potential adjustments:
        if(pairDifference > 0){
            segmentLengths[loopIndex + 1] += pairDifference;
        } else if (pairDifference < 0){
            segmentLengths[loopIndex] -= pairDifference;
        }
        */
    }

    // Debugging lines for segmentLengths and cumulativeDifference (originally commented)

    // Re-initialize a string variable for the ultimate output
    var finalOutputString = "";

    // Reset an index for searching through the segments array
    var currentSeekIndex = itemCount;

    // Conditional logic based on the cumulative difference
    if ( cumulativeDifference < 0 ) {
        // If the total difference is negative, adjust the first segment
        segmentLengths[0] -= cumulativeDifference;
    } else if ( cumulativeDifference > 0 ) {
        // If the total difference is positive
        if ( ( segmentLengths[0] - segmentLengths[1] ) < 0 ) {
            // If the first segment is shorter than the second, adjust cumulative difference
            cumulativeDifference += ( segmentLengths[1] - segmentLengths[0] );
            // Make the first segment length equal to the second
            segmentLengths[0] = segmentLengths[1];
        }
        // Infinite loop to find an appropriate segment for adjustment
        while ( true ) {
            // If the current segment has a non-zero length
            if ( segmentLengths[ currentSeekIndex ] > 0 ) {
                // If the segment index is even
                if ( currentSeekIndex % 2 === 0 ) {
                    // Add the cumulative difference to the next segment
                    segmentLengths[ currentSeekIndex + 1 ] += cumulativeDifference;
                    break; // Exit the loop
                } else {
                    // If the segment index is odd, add the difference to the current segment
                    segmentLengths[ currentSeekIndex ] += cumulativeDifference;
                    break; // Exit the loop
                }
            } else {
                // If the segment is empty, move to the previous one
                currentSeekIndex--;
            }
        }
    } else if ( ( segmentLengths[0] - segmentLengths[1] ) < 0 ) {
        // If cumulative difference is zero but the first two segments are unbalanced
        var initialDifference = segmentLengths[1] - segmentLengths[0];
        // Equalize the first segment's length to the second
        segmentLengths[0] = segmentLengths[1];
        // Infinite loop for further adjustments
        while ( true ) {
            // If the current segment is non-empty and its index is even
            if ( segmentLengths[ currentSeekIndex ] > 0 && currentSeekIndex % 2 === 0 ) {
                // Copy the current segment's length to the next
                segmentLengths[ currentSeekIndex + 1 ] = segmentLengths[ currentSeekIndex ];
                break; // Exit the loop
            }
            // If the current segment is non-empty and its index is odd
            else if ( segmentLengths[ currentSeekIndex ] > 0 && currentSeekIndex % 2 === 1 ) {
                // Add the initial difference to the current segment
                segmentLengths[ currentSeekIndex ] += initialDifference;
                break; // Exit the loop
            } else {
                // If the segment is empty, move back
                currentSeekIndex--;
            }
        }

    }

    // Debugging line for final segmentLengths array (originally commented)

    // Construct the final output string based on adjusted segment lengths
    for ( var segIterator = 0; segIterator < itemCount; segIterator++ ) {
        // If the segment index is even, append opening parentheses
        if ( segIterator % 2 === 0 ) {
            for ( var charCounter = 0; charCounter < segmentLengths[ segIterator ]; charCounter++ ) {
                finalOutputString += "(";
            }
        }

        // If the segment index is odd, append closing parentheses
        if ( segIterator % 2 === 1 ) {
            for ( var charCounter = 0; charCounter < segmentLengths[ segIterator ]; charCounter++ ) {
                finalOutputString += ")";
            }
        }
    }

    // Display the final generated balanced parenthesis string
    console.log( finalOutputString );

}
// Invoke the primary processing function, reading input from standard input
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );