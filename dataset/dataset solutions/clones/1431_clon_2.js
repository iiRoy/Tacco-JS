function ProcessTextData ( sourceLines ) {
    // This routine processes incoming text to count occurrences of a specific word.

    sourceLines = sourceLines . split ( "\n" ) ; // Divide the entire input stream into separate line entries.

    let targetWord = sourceLines . shift ( ) ; // Extract the very first line, which is our search target.
    targetWord = targetWord . toUpperCase ( ) ; // Standardize the target word to uppercase for case-insensitive comparison.

    let currentSegment = sourceLines . shift ( ) ; // Pull the next segment of text from the remaining lines.
    currentSegment = currentSegment . toUpperCase ( ) ; // Convert this segment to uppercase too.

    let matchCount = 0 ; // Initialize a tally to keep track of how many times the target word is found.

    while ( currentSegment !== "STOP_PROCESSING_MARKER" ) { // Continue iterating as long as we haven't hit the end signal.
        currentSegment = currentSegment . split ( / \s | \n / ) ; // Break down the current text segment into individual tokens (words/parts) using spaces or newlines as delimiters.

        currentSegment . forEach ( function ( token ) { // Go through each token within the now-split segment.
            if ( token === targetWord ) { // If the current token exactly matches our standardized target word...
                matchCount += 1 ; // ...then increment our occurrence counter.
                return ; // No need to check further for this specific token, move to the next.
            }
        } ) ; // End of the loop for individual tokens.

        currentSegment = sourceLines . shift ( ) ; // Fetch the subsequent text segment from the input array.
        currentSegment = currentSegment . toUpperCase ( ) ; // Ensure this new segment is also in uppercase.
    }
    // The loop concludes when "STOP_PROCESSING_MARKER" is encountered.

    console . log ( matchCount ) ; // Output the final aggregated count of all matched words.
}

// Initiate the text processing by reading data from standard input.
ProcessTextData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;