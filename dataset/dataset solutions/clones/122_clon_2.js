const fileSystemModule = require('fs'); // Obtain the module for file system operations

const standardInputDescriptor = process.stdin.fd; // Reference to the standard input file descriptor

// Determine the byte count of the data available from standard input
const streamDataSize = fileSystemModule.fstatSync(standardInputDescriptor).size;

// Create a new buffer to store the incoming stream data
let dataReceptionBuffer = new Buffer(streamDataSize);

// Synchronously read bytes from standard input into the buffer
const actualBytesRetrieved = fileSystemModule.readSync(standardInputDescriptor, dataReceptionBuffer, 0, streamDataSize, 0);

// Transform the buffer content into a UTF-8 string, clean whitespace, and split into individual lines
const acquiredInputLines = dataReceptionBuffer.toString('utf8', 0, actualBytesRetrieved)
                                               .trim()
                                               .split('\n');

// Invoke the primary routine to handle the parsed input
executePrimaryLogic();


/**
 * Orchestrates the main processing flow for each line of input.
 */
function executePrimaryLogic() {

    // Iterate through every entry in the collection of input lines
    for (let entryIndex = 0, totalEntryCount = acquiredInputLines.length; entryIndex < totalEntryCount; entryIndex++) {
        // Check for a specific sentinel value indicating the end of meaningful input
        if (acquiredInputLines[entryIndex] === '0 0')
            break; // Terminate processing if the sentinel is found

        // Divide the current input line into its constituent string parts
        const lineSegments = acquiredInputLines[entryIndex].split(' ');
        
        // Parse the numerical values from the segmented line strings
        const numberX = parseInt(lineSegments[0]);
        const numberY = parseInt(lineSegments[1]);

        let sequenceCount = 0; // Initialize a counter for valid sequences

        // Begin a reverse iteration from 9 down to numberX
        for (let currentElement = 9; currentElement >= numberX; currentElement--) {
            // Accumulate the results from the recursive sequence calculation function
            sequenceCount += computeValidSequences(currentElement, 
                                                   numberY - currentElement, 
                                                   numberX - 1);
        }
        
        // Output the final computed sequence count for the current input line
        console.log(sequenceCount);
    }
}


/**
 * Recursively calculates the number of valid sequences.
 * 
 * @param {number} currentBoundary - The current upper boundary for elements in the sequence.
 * @param {number} remainingSumTarget - The sum that still needs to be achieved.
 * @param {number} elementsRemaining - The number of elements yet to be chosen for the sequence.
 * @returns {number} The total count of valid sequences found under the given constraints.
 */
function computeValidSequences(currentBoundary, remainingSumTarget, elementsRemaining) {
    let iterationResult = 0; // Variable to accumulate the count of valid sequences

    // Base case 1: If no more elements are needed and the target sum is met, it's a valid sequence
    if (elementsRemaining === 0 && remainingSumTarget === 0) {
        return 1;
    }

    // Base case 2: If any parameter becomes negative, it indicates an invalid path
    if (currentBoundary < 0 || remainingSumTarget < 0 || elementsRemaining < 0) {
        return iterationResult; // Returns 0 for invalid states
    }

    // Recursive step: Iterate downwards to find valid subsequent elements
    for (let nextElement = currentBoundary - 1; nextElement >= elementsRemaining - 1; nextElement--) {
        // Add the results from the recursive call with updated parameters
        iterationResult += computeValidSequences(nextElement, 
                                                 remainingSumTarget - nextElement, 
                                                 elementsRemaining - 1);
    }

    return iterationResult; // Return the total count of sequences for this specific call
}