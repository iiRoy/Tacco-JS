// This script processes input from standard input to perform text transformations.

// Obtain raw input data from the standard input stream.
var dataStream = require('fs') . readFileSync(
    '/dev/stdin',
    'utf8'
);

// Split the entire input into an array of individual lines, after trimming leading/trailing whitespace.
let lineCollection = (dataStream.trim()) . split ( "\n" );

// Main processing loop: continues as long as there are more than one line left to process.
while ( lineCollection . length > 1 )
{
    // The first number indicates how many key-value pairs will follow for the current mapping.
    let mappingCount = parseInt(lineCollection.shift(), 10);

    // Initialize an object to store the current set of key-value mappings.
    const translationMap = { };

    // Loop through to populate the translation map.
    for ( let counter = 0 ; counter < mappingCount ; counter++ )
    {
        // Extract a line, split it by space to get the key and value.
        let pairParts = ( lineCollection . shift() ) . split ( " " );
        // Store the key-value pair in the map.
        translationMap[ pairParts[ 0 ] ] = pairParts[ 1 ];
    }

    // The next number indicates how many elements will follow for the current output sequence.
    let sequenceLength = parseInt(lineCollection.shift(), 10);

    // Initialize an empty string buffer to accumulate the translated output.
    let outputBuffer = "";

    // Loop through to build the output string based on the translation map.
    for ( let elementIndex = 0 ; elementIndex < sequenceLength ; elementIndex++ )
    {
        // Get the current key to be translated.
        let currentKey = lineCollection . shift();
        // Append either the translated value or the original key if no translation exists.
        outputBuffer += ( currentKey in translationMap )
            ? translationMap[ currentKey ]
            : currentKey;
    }

    // Print the accumulated translated string to the console.
    console.log( outputBuffer );

    // Check for the termination condition: if the next line is "0", exit the loop.
    if ( lineCollection[ 0 ] === "0" ) {
        break;
    }
}