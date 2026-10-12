process.stdin.resume();
process.stdin.setEncoding('ascii');

// Buffer to accumulate raw input data
let rawInputBuffer = "";
// Array to store input lines after splitting
let inputLinesArray = [];
// Index to keep track of the current line being read
let currentLineIndex = 0;

// Event listener for incoming data chunks
process.stdin.on('data', function (incomingChunk) {
    rawInputBuffer += incomingChunk;
});

// Event listener for SIGINT (Ctrl+C) signal
process.on('SIGINT', function() {
    // Split the accumulated input into an array of lines
    inputLinesArray = rawInputBuffer.split("\n");
    // Execute the main program logic
    executeProgram();
    // Exit the process
    process.exit(0);
});

// Event listener for the end of the input stream
process.stdin.on('end', function () {
    // Split the accumulated input into an array of lines
    inputLinesArray = rawInputBuffer.split("\n");
    // Execute the main program logic
    executeProgram();
});

/**
 * Reads the next line from the buffered input array.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
    return inputLinesArray[currentLineIndex++];
}

// Ignore everything above this line for the core logic //

/**
 * The main function containing the program's core logic.
 */
function executeProgram() {
    // Read the first line which contains height and width
    let inputString = fetchNextLine();
    // Split the line by space to get individual values
    inputString = inputString.split(" ");

    // Parse the height value from the first element
    const heightVal = parseInt(inputString[0], 10);
    // Parse the width value from the second element
    const widthVal = parseInt(inputString[1], 10);

    // Initialize an array to store the character grid
    let charGrid = [];

    // Loop to read each row of the grid
    for (let rowCounter = 0; rowCounter < heightVal; rowCounter++) {
        // Read the content for the current row
        let currentLineContent = fetchNextLine();
        // Add the row content to our grid array
        charGrid.push(currentLineContent);
    }

    // Loop again to print each row twice as per the problem statement
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // Output the current row
        console.log(charGrid[rowIdx]);
        // Output the current row again
        console.log(charGrid[rowIdx]);
    }
}
