'use strict';

// This primary routine handles the incoming data stream
function ProcessInput(rawData) {
    // Determine the frequency of a specific character in the initial segment
    let occurrenceCount = rawData
        .split("\n")[0] // Extract the first logical segment from the raw content
        .split("1")     // Divide this segment using the target character '1' as a delimiter
        .length         // Obtain the total number of sub-segments created by the division
        - 1;            // Subtract one to derive the actual count of the target character

    // Display the computed frequency to the standard output device
    console.log(occurrenceCount);
}


// Initiate the processing by feeding data obtained from the system's standard input
ProcessInput(
    require('fs') // Access the native file system capabilities
        .readFileSync( // Perform a synchronous read operation on a file
            '/dev/stdin', // Specify the path to the standard input file
            'utf8'        // Ensure the content is interpreted using UTF-8 encoding
        )
);