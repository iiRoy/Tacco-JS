// Primary function to manage the processing of incoming text.
function processInputData( rawData ) {

    // First, eliminate any extraneous spaces from the extremities of the input string.
    let trimmedData = rawData . trim( );

    // Tokenize the cleaned string by spaces, then convert each segment into a numerical value.
    const numericValues = trimmedData . split(  " "  ) . map(  Number  );

    // Compute the aggregate of the initial pair of numerical elements.
    const resultSum = numericValues[ 0 ] + numericValues[ 1 ];

    // Output the calculated sum if it adheres to a specific condition (less than 10),
    // otherwise, signal an issue with a predefined message.
    console.log(
        resultSum < 10
            ? resultSum
            : 'Invalid Result'
    );
}

// Initiate the data processing pipeline by retrieving content from the standard input stream.
processInputData(
    require( 'fs' )
        . readFileSync(
            '/dev/stdin',
            'utf8'
        )
);