function ProcessInput( rawData )
{
    // This function is designed to analyze an incoming text string
    // against a predefined standard sequence of characters.

    rawData = rawData . trim ( ) ; // Remove any leading or trailing whitespace from the input.

    let mismatchCount = 0 ; // Initialize a variable to track the number of differing characters.
    const referenceString = "CODEFESTIVAL2016" ; // Define the fixed string used for comparison.

    // Begin an iterative process to compare each character.
    for ( let idx = 0 ;
          idx < rawData . length ;
          idx++ )
    {
        // Extract a single character from the raw input data at the current index.
        let currentInputChar = rawData . slice ( idx , idx + 1 ) ;

        // Extract the corresponding character from the reference sequence.
        let currentRefChar = referenceString . slice ( idx , idx + 1 ) ;

        // Check if the characters from the input and the reference string are not identical.
        if ( currentInputChar !== currentRefChar )
        {
            mismatchCount++ ; // If a difference is found, increment the counter.
        }
    }

    // Output the final tally of character discrepancies to the console.
    console . log ( mismatchCount ) ;
}

// Execute the primary analysis function, providing it with data
// read synchronously from the standard input stream, encoded as UTF-8.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;