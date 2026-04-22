/* This script processes standard input to count occurrences of specific three-character sequences. */
function processInputLines ()
{
    // Iterate over each line provided in the input collection.
    for
        (
            let lineIndex = 0;
            lineIndex < receivedData.length;
            lineIndex++
        )
    {
        // Initialize counters for the target sequences for the current line.
        let joiCount = 0;
        let ioiCount = 0;

        // Extract the current line as a string for processing.
        const currentLineString = receivedData[lineIndex];

        // Loop through the current line to find three-character segments.
        // The loop stops two characters before the end to ensure a full 3-char segment can be extracted.
        for ( let charPosition = 0 ; charPosition < currentLineString.length - 2 ; charPosition++ )
        {
            // Obtain a three-character substring starting from the current character position.
            let threeCharSegment = currentLineString.substring( charPosition, charPosition + 3 );

            // Check if the extracted segment matches the first target sequence.
            if ( threeCharSegment === "JOI" )
            {
                joiCount++; // Increment the counter for "JOI".
            }
            // Otherwise, check if it matches the second target sequence.
            else if ( threeCharSegment === "IOI" )
            {
                ioiCount++; // Increment the counter for "IOI".
            }
        }

        // Output the total count of "JOI" occurrences for the current line.
        console.log( joiCount );
        // Output the total count of "IOI" occurrences for the current line.
        console.log( ioiCount );
    }
}

// Declare a global variable to accumulate all incoming standard input data.
let
receivedData = "";

// Ensure standard input stream remains open to receive data.
process.stdin.resume();

// Configure the standard input stream to interpret data as UTF-8 encoded text.
process.stdin.setEncoding( "utf8" );

// Attach an event listener for incoming 'data' chunks from standard input.
process.stdin.on
(
    'data',
    function ( dataBlock )
    {
        // Append each received data block to the global data accumulation variable.
        receivedData += dataBlock;
    }
);

// Attach an event listener for the 'end' of the standard input stream.
process.stdin.on
(
    'end',
    function ()
    {
        // Once all input has been received, split the accumulated string into an array of lines.
        // Each element in the array represents a single line from the input.
        receivedData = receivedData.split( "\n" );
        // Initiate the main processing logic with the prepared input lines.
        processInputLines();
    }
);