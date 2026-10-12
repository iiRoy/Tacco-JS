process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8

let globalInputBuffer = ''; // This variable accumulates all incoming data from stdin

process.stdin.on('data', function(dataChunk) {
    // Append each received data chunk to the buffer
    globalInputBuffer += dataChunk;
});

process.stdin.on('end', function() {
    // When the 'end' event is triggered, all input has been received.
    // Split the accumulated buffer by newlines and pass it to the main processing function.
    ProcessInputData(globalInputBuffer.split(/\r?\n/));
});

function ProcessInputData(linesOfData) {
    // The primary function to handle the parsed input lines.

    // Split the first line of input by spaces to get individual number strings.
    const parsedNumbers = linesOfData[0].split(' ');

    // Check for equality between the first two numbers.
    if (parsedNumbers[0] == parsedNumbers[1]) {
        // If the first and second numbers are identical, the third number is the unique one.
        console.log(parsedNumbers[2]);
    }
    // Otherwise, check if the first and third numbers are identical.
    else if (parsedNumbers[0] == parsedNumbers[2]) {
        // If the first and third numbers are identical, the second number is the unique one.
        console.log(parsedNumbers[1]);
    }
    // If neither of the above conditions is met, it implies the second and third numbers are identical,
    // making the first number the unique one.
    else {
        console.log(parsedNumbers[0]);
    }

    // Return a status code, typically 0 for successful execution.
    return 0;
}
