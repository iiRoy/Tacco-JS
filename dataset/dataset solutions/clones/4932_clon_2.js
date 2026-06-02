const ioModule = require('readline'); // Obtain the necessary module for input/output operations.

// Establish an interface for handling console input and output streams.
const lineProcessor = ioModule.createInterface({
    input: process.stdin,   // Designate standard input as the source.
    output: process.stdout  // Designate standard output for any prompts (though not used for this specific task).
});

// Initiate a query to the user, expecting a single line of text.
lineProcessor.question('', (receivedText) => {
    // Define the immutable reference string for comparison.
    const targetSequence = "CODEFESTIVAL2016";
    
    // Initialize a counter for tracking character differences.
    let divergenceTally = 0;

    // Ascertain the total length of the target sequence.
    const sequenceExtent = targetSequence.length;

    // Iterate through each character position up to the length of the target sequence.
    for (let positionMarker = 0; positionMarker < sequenceExtent; positionMarker++) {
        // Compare the character at the current position in the received text
        // with the character at the same position in the target sequence.
        if (receivedText[positionMarker] !== targetSequence[positionMarker]) {
            divergenceTally++; // Increment the tally if a mismatch is detected.
        }
    }

    // Output the final computed count of divergences to the console.
    console.log(divergenceTally);
    
    // Terminate the input/output interface gracefully.
    lineProcessor.close();
});
