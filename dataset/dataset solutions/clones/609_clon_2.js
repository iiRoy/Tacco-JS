process.stdin.resume();

process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'data', function ( inputSegment ) {

    const inputRows = inputSegment.split( "\n" );

    // The first line indicates the number of subsequent data lines.
    const totalCount = parseInt( inputRows[ 0 ], 10 );

    // The second line holds the string to be matched.
    const targetString = inputRows[ 1 ];

    let outerIdx, innerIdx, currentLength;

    // A counter for instances where the target string is found.
    let matchCounter = 0;

    // Loop through each data line following the initial count and target string.
    for ( outerIdx = 2; outerIdx < totalCount + 2; outerIdx++ ) {

        // Break the target string into its individual characters.
        let targetChars = targetString.split( '' );

        // Retrieve the current line from the input array.
        let currentLine = inputRows[ outerIdx ];

        let charPosition, offsetValue;

        // Boolean flag to track if a match is discovered within the current line.
        let isMatchFound = false;

        // Store the length of the current line for loop bounds.
        const lineLength = currentLine.length;

        // Iterate through various starting offsets within the current line.
        for ( offsetValue = 0; offsetValue < lineLength; offsetValue++ ) {

            // Update the length of the character array for the target string.
            currentLength = targetChars.length;

            // Loop through each character of the target string.
            for ( innerIdx = 0; innerIdx < currentLength; innerIdx++ ) {

                // Calculate the specific position in the current line to check.
                charPosition = innerIdx + offsetValue * innerIdx;

                // Check if the character at the calculated position matches the target character,
                // and if this is the last character of the target string.
                if ( currentLine[ charPosition ] === targetChars[ innerIdx ] && innerIdx === currentLength - 1 ) {

                    isMatchFound = true; // Mark as true if the entire target string matches.
                    break;              // Exit the inner loop, as a full match has been found.
                }
            }

            // If a match was found in the inner loop, exit this outer offset loop.
            if ( isMatchFound ) {
                break;
            }
        }

        // If a match was confirmed for the current line, increment the global counter.
        if ( isMatchFound ) {
            matchCounter++;
        }
    }

    // Print the final accumulated count of matches to the console.
    console.log( matchCounter );
} );