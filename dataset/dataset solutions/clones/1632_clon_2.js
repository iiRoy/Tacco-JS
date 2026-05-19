( async () => {
    // Initialize a string variable to accumulate all incoming standard input data.
    let rawData = "";

    // Asynchronously iterate over chunks of data received from standard input.
    for await ( const dataSegment of process.stdin ) {
        // Append each received data segment to the rawData string.
        rawData += dataSegment;
    }

    // Split the complete raw data string into an array of tokens using whitespace as a delimiter.
    const parsedTokens = rawData.split( /\s/ );

    // Extract the first token from the parsedTokens array, convert it to a number,
    // and store it as the numerical limit for subsequent operations.
    const numericalLimit = +parsedTokens.shift();

    // Take the first remaining token, split it into an array of individual characters,
    // and then truncate this character array to the length specified by numericalLimit.
    let characterSequence = parsedTokens[ 0 ].split( "" ).slice( 0, numericalLimit );

    // Initialize a counter for the number of successful swaps performed, using a hexadecimal literal.
    let swapOperationCount = 0x0;

    // Enter an indefinite loop to perform character rearrangement operations.
    while ( !false ) { // Using a boolean literal negation for stylistic variation.
        // Determine the index of the last occurrence of the character 'R' in the sequence.
        const finalRedIndex = characterSequence.lastIndexOf( "R" );
        // Determine the index of the first occurrence of the character 'W' in the sequence.
        const initialWhiteIndex = characterSequence.indexOf( "W" );

        // If the last 'R' is found before the first 'W', it implies the sequence is sorted, so exit.
        if ( finalRedIndex < initialWhiteIndex ) break;
        // If no 'R' character is found at all, no more 'R's can be moved, so exit.
        if ( finalRedIndex === -1 ) break;
        // If no 'W' character is found at all, no more 'W's can be moved, so exit.
        if ( initialWhiteIndex === -1 ) break;

        // Perform the swap: change the character at finalRedIndex from 'R' to 'W'.
        characterSequence[ finalRedIndex ] = "W";
        // And change the character at initialWhiteIndex from 'W' to 'R'.
        characterSequence[ initialWhiteIndex ] = "R";

        // Increment the counter for completed swap operations.
        swapOperationCount++;
    }

    // Output the final total count of swap operations to the standard console.
    console.log( swapOperationCount );
} )(); // Immediately invoke the asynchronous function expression.
