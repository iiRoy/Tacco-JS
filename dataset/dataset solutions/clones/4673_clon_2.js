'use strict'; // Activate strict mode for improved code quality and fewer errors

// This primary routine handles the incoming stream of information.
function ProcessEntry(rawData) {
    // Deconstruct the initial line from the input stream.
    // First, split by newline character, taking only the first segment.
    // Then, further split this segment by space characters to obtain tokens.
    const parsedLines = rawData .split('\n')[0] .split(' ');

    // Isolate the very first data element for subsequent operations.
    const firstToken = parsedLines[0];

    // Isolate the second data element for subsequent operations.
    const secondToken = parsedLines[1];

    // Evaluate if the extracted data elements hold identical values.
    if (firstToken == secondToken) {
        // Emit a confirmation message indicating equality.
        console.log('MATCH');
    }
    else {
        // Emit a distinguishing message indicating inequality.
        console.log('DIFFER');
    }
}

// Initiate the data processing by reading content from the standard input path.
// The Node.js 'fs' module is employed to synchronously read the file,
// with 'utf8' encoding specified for correct character interpretation.
ProcessEntry( require('fs') .readFileSync('/dev/stdin', 'utf8') );