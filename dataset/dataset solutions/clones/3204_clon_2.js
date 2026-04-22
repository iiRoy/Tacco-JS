function processInputData ( rawData ) { /* This function analyzes provided textual input */

    // Parse raw string into numbers, splitting by any sequence of whitespace characters.
    const numericValues = rawData . trim ( ) . split ( /\s+/ ) . map ( ( itemString ) => {
        return Number ( itemString ) ;
    } ) ;

    // Initialize an array to count occurrences of values (expected 1 to 4).
    let frequencyCounts = new Array ( 4 ) . fill ( 0 ) ;

    // Iterate through each number to tally its frequency.
    numericValues . forEach ( ( currentValue ) => {
        // Increment the counter for the corresponding index (value - 1).
        frequencyCounts [ currentValue - 1 ] ++ ;
    } ) ;

    // Arrange the counts in ascending order for consistent pattern checking.
    frequencyCounts . sort ( ) ;

    // Check if the sorted counts match a specific pattern: [1, 1, 2, 2].
    const isPatternMatch = ( frequencyCounts [ 0 ] === 1 &&
                             frequencyCounts [ 1 ] === 1 &&
                             frequencyCounts [ 2 ] === 2 &&
                             frequencyCounts [ 3 ] === 2 ) ;

    // Display the result based on whether the pattern was matched.
    console . log ( isPatternMatch ? 'YES' : 'NO' ) ;
}

// Execute the main processing function with file content read from standard input.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;