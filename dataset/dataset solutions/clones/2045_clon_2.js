const executeCalculation = ( inputFeed ) => {
    // Extract the primary numerical measurement from the first line of the provided input array.
    // Utilizing parseFloat ensures that both integer and floating-point values are correctly parsed.
    const dimensionMetric = parseFloat( inputFeed[0] );

    // Perform the central computation: calculate the cube of one-third of the dimensionMetric.
    // The result is then formatted to a fixed number of decimal places (12) for precision.
    console.log(
        (
            ( dimensionMetric / 3.0 ) *
            ( dimensionMetric / 3.0 ) *
            ( dimensionMetric / 3.0 )
        ).toFixed( 12 )
    );
};


// The program's execution begins here.
// It reads raw data from standard input, processes it, and then passes it to the calculation function.
executeCalculation(
    require( 'fs' )
        .readFileSync(
            '/dev/stdin',
            { encoding: 'utf8' } // Specify UTF-8 encoding for text interpretation.
        )
        .trim()                  // Remove any leading or trailing whitespace from the entire content.
        .split( '\n' )           // Divide the content into an array of strings, one for each line.
);