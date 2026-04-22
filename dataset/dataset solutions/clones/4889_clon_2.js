// This function processes raw textual data to find an optimal string concatenation.
function ProcessText( rawData ) {

    // The incoming data is split into individual lines for further handling.
    let processedLines = rawData.split( '\n' );

    // The first line indicates a minimum required combined length for the output.
    const minimumLength = Number( processedLines[0] );

    // Initialize a variable to store the size of the best overlapping segment found.
    let overlapSize = 0;

    // Retrieve the two primary string components from the processed lines.
    const firstSegment = processedLines[1];
    const secondSegment = processedLines[2];

    // Determine the maximum possible overlap length, which is the length of the shorter string.
    const maxPossibleOverlap = Math.min( firstSegment.length, secondSegment.length );

    // Iterate backwards from the maximum possible overlap down to one,
    // searching for the longest valid common segment.
    for ( let currentOverlap = maxPossibleOverlap; currentOverlap > 0; currentOverlap-- ) {

        // Extract the suffix of the first segment and the prefix of the second segment
        // based on the current overlap length.
        const suffixOfFirst = firstSegment.substr( -1 * currentOverlap );
        const prefixOfSecond = secondSegment.substr( 0, currentOverlap );

        // Calculate the combined length of the segments if this overlap is applied.
        // This is the total length minus the overlapping part.
        const combinedResultLength = firstSegment.length + secondSegment.length - currentOverlap;

        // Check if the suffix of the first string matches the prefix of the second,
        // and if the resulting combined string's length meets the minimum requirement.
        if ( suffixOfFirst === prefixOfSecond && combinedResultLength >= minimumLength ) {
            // If both conditions are met, this is the longest valid overlap found so far.
            overlapSize = currentOverlap;
            // No need to check smaller overlaps, so exit the loop.
            break;
        }
    }
    // Construct the final output string: the first segment truncated by the overlap,
    // followed by the entire second segment. This effectively concatenates them with the overlap removed.
    const finalOutputString = firstSegment.substr( 0, firstSegment.length - overlapSize ) + secondSegment;

    // Display the resulting string to the console.
    console.log( finalOutputString );
}

// Invoke the main processing function with content read from standard input.
// The input is read as a UTF-8 string and any leading/trailing whitespace is removed.
ProcessText( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );