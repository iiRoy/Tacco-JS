"use strict";

process.stdin.resume(); // Activate standard input stream
process.stdin.setEncoding("utf-8"); // Set character encoding for input

function displayOutput(dataToDisplay) { // Function to present data to the console
    console.log(dataToDisplay); // Log the provided data
}

let receivedDataBuffer = ""; // Accumulator for all incoming data
let currentParseIndex = 0; // Pointer for the current line being processed

process.stdin.on("data", incomingChunk => { // Event listener for 'data' chunks
    receivedDataBuffer += incomingChunk; // Append current chunk to buffer
});

process.stdin.on("end", () => { // Event listener for 'end' of input stream
    receivedDataBuffer = receivedDataBuffer.split("\n"); // Split buffered data into an array of lines
    executePrimaryLogic(); // Invoke the core application logic
});

function fetchNextInputLine() { // Utility to retrieve the next line from the buffer
    return receivedDataBuffer[currentParseIndex++]; // Return line and advance index
}

// --- Auxiliary setup concludes here ---
// --- Main computational segment begins ---

function executePrimaryLogic() {

    // Acquire and process the initial input line
    var numericalArray = fetchNextInputLine() // Get the raw line
                               .split(" ")      // Separate by space
                               .map(itemStr => Number(itemStr)); // Convert each part to a number

    // Extract individual numerical components
    var firstVal = numericalArray[0];
    var secondVal = numericalArray[1];

    // Determine the greatest and smallest values
    var maximumValue = Math.max(firstVal, secondVal);
    var minimumValue = Math.min(firstVal, secondVal);

    // Perform arithmetic calculations
    var quotientResult = Math.floor(maximumValue / minimumValue); // Integer division
    var productResult = Math.floor(maximumValue * minimumValue); // Integer multiplication

    // Compute the final derived value
    var finalComputedValue = Math.floor(productResult / quotientResult);

    // Output the conclusive result
    displayOutput(finalComputedValue);

}