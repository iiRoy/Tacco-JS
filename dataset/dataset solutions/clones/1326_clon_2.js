/* This script processes input from standard input,
   performing a series of string manipulations based on numeric parameters. */

var accumulatedStreamContent = ''; // Storage for all incoming data blocks.
var inputFlow = process.stdin;    // Reference to the standard input stream object.

// Configure the input stream for immediate processing and specific encoding.
inputFlow.resume();                // Initiate flow of data from the stream.
inputFlow.setEncoding( 'utf-8' );  // Define the character encoding for the stream.

// Attach an event handler for when new data arrives from the stream.
inputFlow.on( 'data', function( dataBlock ) {
    accumulatedStreamContent += dataBlock; // Concatenate each received data block to the total content.
} );

// Attach an event handler for when the input stream has completely ended.
inputFlow.on( 'end', function() {
    // Split the entire collected content into an array of individual lines.
    var processedLines = accumulatedStreamContent.split( "\n" );

    var resultCollection = []; // An array to store the final manipulated string sequences.
    var lineIterator = 0;      // An index variable to track the current position in `processedLines`.

    // Loop through the lines until a specific termination marker ('-') is encountered.
    while ( '-' != processedLines[lineIterator] ) {
        // Extract the initial string sequence from the current line.
        var currentSequence = processedLines[lineIterator++];
        // Retrieve the number of times this sequence needs to be shuffled/rotated.
        var shuffleIterations = processedLines[lineIterator++];

        // Execute the specified number of rotation operations on the current sequence.
        for ( var iterationIndex = 0; iterationIndex < shuffleIterations; iterationIndex++ ) {
            // Get the integer representing the point at which to rotate the string.
            var rotationPoint = processedLines[lineIterator++];
            // Perform the string rotation: move the first `rotationPoint` characters to the end.
            currentSequence = currentSequence.substr( rotationPoint ) + currentSequence.substr( 0, rotationPoint );
        }

        // Add the fully manipulated sequence to our collection of results.
        resultCollection.push( currentSequence );
    }

    // Output all collected results, joining them with newline characters for display.
    console.log( resultCollection.join( '\n' ) );
} );