function executeProgram() {
    // Determine the number of rows for processing
    var numRows = retrieveInput();

    // Ascertain the character count per line
    var numCols = retrieveInput();

    // Begin processing each row sequentially
    iterateNTimes(numRows, function() {
        // Acquire the current line of text
        var currentRowString = retrieveInput('string');

        // Initialize a collection to store proximity values
        var distanceList = [];

        // Track the current closest distance to the target character
        var minDistanceSoFar = -1;

        // Iterate through each character within the current line
        iterateNTimes(numCols, function(loopCounter) {
            // Check if the character at the current position is the target 'c'
            if (currentRowString.charAt(loopCounter) === 'c') {
                // If 'c' is found, its distance to itself is zero
                distanceList.push(0);
                // Reset the distance tracker for subsequent characters
                minDistanceSoFar = 1;
            }
            else {
                // If not 'c', compute its distance based on the last 'c' encountered
                // If minDistanceSoFar is not -1, increment it; otherwise, keep it -1
                distanceList.push(minDistanceSoFar !== -1 ? minDistanceSoFar++ : -1);
            }
        });
        // Present the computed proximity values for the current row
        displayOutput(distanceList.join(' '));
    });
} // End of the primary program logic

// Utility function to perform an operation a specified number of repetitions
function iterateNTimes(countValue, actionToPerform) {
    for (var loopIdx = 0; loopIdx < countValue; ++loopIdx) {
        actionToPerform(loopIdx); // Invoke the provided callback with the current iteration index
    }
}

// Configure standard input stream
process.stdin.resume();
process.stdin.setEncoding('utf8');


// Buffer to accumulate all incoming raw data
var accumulatedTextBuffer = '';
// Pointer indicating the current position for reading from the buffer
var dataReadOffset = 0;

// Function to extract values from the buffered input stream
function retrieveInput(valueKind) {
    if (valueKind === 'string') {
        // Return the raw string token
        return accumulatedTextBuffer[dataReadOffset++];
    }
    else {
        // Convert and return the token as a numeric value
        return +accumulatedTextBuffer[dataReadOffset++];
    }
}

// Function to output information to the console
function displayOutput(messageContent) {
    console.log(messageContent);
}

// Event handler for chunks of data received from standard input
process.stdin.on('data', function(partialDataSegment) {
    accumulatedTextBuffer += partialDataSegment; // Append the new data to the buffer
});

// Event handler for the completion of the input stream
process.stdin.on('end', function() {
    // Process the entire accumulated text, splitting it into tokens by whitespace
    accumulatedTextBuffer = accumulatedTextBuffer.split(/\s+/);
    // Initiate the main execution flow of the program
    executeProgram();
});