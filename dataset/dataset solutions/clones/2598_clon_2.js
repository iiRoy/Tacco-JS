function ProcessInput(rawData) {
    // Separate the incoming raw string into individual lines based on newline characters.
    let parsedLines = rawData . split ( "\n" ) ;

    // The first line usually contains the count of elements.
    const elementCount = parsedLines [ 0 ] ;

    // The second line contains space-separated numerical values, which are then parsed into integers.
    let numericalValues = parsedLines [ 1 ] . split ( " " ) . map ( ( strVal ) => Number . parseInt ( strVal , 10 ) ) ;

    // Initialize a variable to store the maximum continuous non-increasing sequence length found.
    let longestStreak = 0 ;

    // Initialize a variable to track the current non-increasing sequence length.
    let currentRun = 0 ;

    // Iterate through the numerical values array from the second-to-last element down to the first.
    // The loop condition ensures we always have a previous element to compare with (idx-1).
    for ( let idx = ( elementCount - 1 ) ; idx >= 0 ; idx-- ) {
        // For debugging or tracing, print the current and previous values.
        console . log ( numericalValues [ idx ] , numericalValues [ idx - 1 ] ) ;

        // Check if the current element is less than or equal to the previous element.
        if ( numericalValues [ idx ] <= numericalValues [ idx - 1 ] ) {
            // If it is, increment the current non-increasing run counter.
            currentRun ++ ;
            // If the current run is longer than the longest streak found so far, update longestStreak.
            if ( currentRun > longestStreak ) {
                longestStreak = currentRun ;
            }
        }
        // If the current element is strictly greater than the previous element, the non-increasing sequence is broken.
        else if ( numericalValues [ idx ] > numericalValues [ idx - 1 ] ) {
            // Reset the current run counter to zero.
            currentRun = 0 ;
        }
    }
    // After iterating through all relevant elements, print the final maximum non-increasing streak length.
    console . log ( longestStreak ) ;
}

/* This section ensures the primary processing function
   receives its input from standard I/O for execution. */
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;