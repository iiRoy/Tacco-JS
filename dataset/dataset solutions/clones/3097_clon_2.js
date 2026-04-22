/* This module handles the processing of genetic sequence data. */
const processSequence = ( rawData ) =>
{
    // First, we ensure the input data is clean by trimming leading/trailing whitespace.
    const cleanedData = rawData.trim( );

    // Next, we identify contiguous segments of DNA nucleotides (A, T, C, G).
    // The regular expression searches globally for one or more occurrences of these bases.
    const sequenceBlocks = cleanedData.match( new RegExp( '[ATCG]+', 'g' ) );

    // A variable to store the longest identified sequence length, initialized to zero.
    let maximumLength = 0;

    // Iterate through each identified sequence block to find the maximum length.
    for
    (
        let blockIndex = 0;
        ( sequenceBlocks !== null && blockIndex < sequenceBlocks.length );
        blockIndex++
    )
    {
        // Compare the current block's length with the previously found maximum length.
        maximumLength = Math.max
        (
            sequenceBlocks[ blockIndex ].length,
            maximumLength
        );
    }

    // Output the final computed maximum length to the console.
    console.log( maximumLength );
};

// --- Execution Entry Point ---
// Read the raw input from standard input (e.g., a file or piped data)
// and then pass it to our main processing function.
processSequence
(
    require('fs')
        .readFileSync
        (
            '/dev/stdin',
            'UTF-8'
        )
);