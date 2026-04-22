/* This JavaScript function is designed to process raw string data according to specific rules. */
function ProcessData( rawDataInput ) {
    // First, divide the complete input string into separate lines.
    rawDataInput = rawDataInput.split( "\n" );

    // The initial line holds three configuration parameters, often N, M, and X.
    var configParamsContainer = rawDataInput[0].split( " " );

    // The subsequent line contains the primary array of values for analysis.
    var dataValueArray = rawDataInput[1].split( " " );

    // Begin an iterative process through the 'dataValueArray', up to the limit specified by the second config parameter.
    for ( var currentIdx = 0 ; currentIdx < configParamsContainer[1] ; currentIdx++ ) {
        // Evaluate if the current element from 'dataValueArray' surpasses the third configuration threshold.
        if ( dataValueArray[currentIdx] > configParamsContainer[2] ) {
            // Determine which calculated index is smaller: the current index or the distance from the end.
            if ( currentIdx > configParamsContainer[1] - currentIdx ) {
                // Output the distance from the end of the relevant segment.
                console.log( configParamsContainer[1] - currentIdx );
                return; // Exit the function immediately upon finding the condition.
            } else {
                // Otherwise, output the current iteration index.
                console.log( currentIdx );
                return; // Exit the function immediately.
            }
        }
    }
}

// Invoke the main processing function with data read from standard input.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) );