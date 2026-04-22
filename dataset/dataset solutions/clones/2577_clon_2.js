/*
 * This module defines a function for processing textual input
 * and calculating an aggregate sum based on specific rules.
 */
function ProcessInputAndCalculate(sourceContent) {
    // The raw input string is separated into individual text lines.
    sourceContent = sourceContent.split( "\n" );

    // Extract the first line to determine array size and other initial parameters.
    const initialValuesRow = sourceContent[0].split( ' ' ).map( ( itemValue ) => parseInt( itemValue, 10 ) );
    const collectionSize = initialValuesRow[0]; // The first number represents the total count of elements.
    const dataSequence = sourceContent[1].split( ' ' ).map( ( itemValue ) => parseInt( itemValue, 10 ) ); // The second line contains the primary numerical sequence.

    // Initialize the sum with the very first element of the numerical sequence.
    var runningTotal = dataSequence[0];

    // Loop through the sequence to accumulate minimums of adjacent elements.
    // The iteration stops before the last two elements, which are handled separately.
    for ( var currentIdx = 0; currentIdx < collectionSize - 2; currentIdx++ ) {
        runningTotal += Math.min( dataSequence[currentIdx], dataSequence[currentIdx + 1] );
    }

    // Add the second-to-last element of the original sequence to the total.
    runningTotal += dataSequence[collectionSize - 2];

    // Display the final computed aggregate value.
    console.log( runningTotal );
}

// Execute the processing function using data acquired from the standard input stream.
ProcessInputAndCalculate(
    require( "fs" ).readFileSync( "/dev/stdin", "utf8" )
);