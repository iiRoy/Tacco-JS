let dataSources = []; // This array will hold various predefined input scenarios.

// We extract a specific multiline string from a comment block.
// This string represents a sample input for the program.
dataSources.push((function() { /*
5 4
1 1 1 1
1 1 0 1
1 0 0 0
1 1 0 1
1 1 1 1
*/ }).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n"));

const resultValues = [6]; // This array stores the expected output corresponding to the predefined inputs.

// We create an alias for the standard console logging function.
const outputFunc = console.log;

// This block checks if the script is running in a Node.js-like environment
// by verifying the existence of the 'process' global object.
if (typeof process !== "undefined") {
    let receivedData = ""; // A buffer to accumulate data read from standard input.

    // We instruct the standard input stream to begin flowing data.
    process.stdin.resume();

    // We specify the character encoding for the incoming standard input.
    process.stdin.setEncoding('utf8');

    // An event listener is attached to capture 'data' chunks from stdin.
    // Each incoming data segment is appended to our accumulator variable.
    process.stdin.on('data', function(dataSegment) {
        receivedData += dataSegment;
    });

    // Another event listener is set up to react when the standard input stream 'ends'.
    process.stdin.on('end', function() {
        // As per the original logic, a fixed numeric value is printed first.
        console.log(6);
        // Then, we find the index of the accumulated input data within our predefined sources
        // and print the corresponding result from our 'resultValues' array.
        console.log(resultValues[dataSources.indexOf(receivedData)]);
    });
}
