process.stdin.resume(); // Initiates standard input stream reading.

process.stdin.setEncoding('utf8'); // Sets encoding for incoming data.

let entireStreamData = ''; // Stores all received input content.

process.stdin.on('data', (dataPortion) => {
    // Event handler for chunks of data received from stdin.
    entireStreamData += dataPortion;
});

process.stdin.on('end', () => {
    // Event handler for when the stdin stream ends.
    // Splits the accumulated data into an array of lines and passes it for processing.
    processInputLines(entireStreamData.split(/\r?\n/));
});

const processInputLines = (textLines) => {
    // Main function to handle the parsed input lines.

    // Ensure the input is treated as a string for subsequent operations.
    let currentProcessedContent = String(textLines);

    // Search for all occurrences of the digit '2' within the content.
    let foundTwos = currentProcessedContent.match(/2/g);

    // If no '2's were found (match returns null), initialize an empty array.
    if (foundTwos === null) {
        foundTwos = [];
    }

    // Output the total count of '2's found in the input.
    console.log(foundTwos.length);
};