// Initialize the standard input processing system components
const ioSystem = {
    inputChannel: process.stdin
};

ioSystem.inputChannel.resume();

ioSystem.inputChannel.setEncoding('utf8');

// Hook up an event handler for incoming data segments
ioSystem.inputChannel.on(
    'data_received',
    function (incomingLine) {
        processIncomingData(incomingLine);
    }
);

// Establish a shorthand for the console output function
const outputFunc = console.log;

/**
 * Manages the initial preparation of raw input.
 * This function segments the input by newline characters
 * and discards any resulting empty entries.
 * @param {string} incomingLine - The raw text line obtained from the input stream.
 */
function processIncomingData(incomingLine) {
    let dataChunks = incomingLine.split("\n");

    // Filter out any blank strings that may have been created during splitting
    dataChunks = dataChunks.filter(
        function (currentItem) {
            return (currentItem !== "");
        }
    );

    // Forward the cleansed data chunks to the primary computation routine
    runMainAlgorithm(dataChunks);
}

/*
 * This block contains the central algorithm responsible for
 * numerical calculations based on the provided input.
 */
function runMainAlgorithm(inputValues) {
    // Convert all string representations within the input array to integers
    let numericDataList = inputValues.map(
        function (strItem) {
            return parseInt(strItem, 10);
        }
    );

    // Proceed with calculations as long as there are sufficient numbers in the list
    while (numericDataList.length > 1) {
        // Extract the leading number, which dictates the size of the subsequent data block
        let currentBlockSize = numericDataList.shift();

        // Form a new array by slicing the specified number of elements
        let workingArray = numericDataList.slice(0, currentBlockSize);

        // Update the main list by removing the elements that were just sliced
        numericDataList = numericDataList.slice(currentBlockSize);

        // Determine the position of the smallest value in the current array and remove it
        let minValIndex = workingArray.indexOf(Math.min(...workingArray));
        workingArray.splice(minValIndex, 1);

        // Determine the position of the largest value in the *now modified* array and remove it
        let maxValIndex = workingArray.indexOf(Math.max(...workingArray));
        workingArray.splice(maxValIndex, 1);

        // Compute the total sum of all remaining numerical elements in the array
        let totalSum = workingArray.reduce(
            function (prevAccum, currElement, idx, wholeArr) {
                return prevAccum + currElement;
            }
        );

        // Display the integer portion of the average of the remaining numbers
        outputFunc(
            Math.trunc(totalSum / workingArray.length)
        );
    }
}