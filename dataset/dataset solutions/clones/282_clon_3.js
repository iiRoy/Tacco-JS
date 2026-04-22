// This script processes a series of numerical configurations
// read from standard input, simulating a circular placement problem.
// It continues processing until a specific termination sequence is encountered.

// Import the Node.js 'fs' module to read file system data.
const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Define the string that signals the end of input data.
const terminationSequence = "0 0";

// Process the raw input: trim leading/trailing whitespace and split into individual lines.
const incomingLines = sourceData.trim().split("\n");

// An array to accumulate the results of each processed configuration.
// This allows all results to be printed at once at the very end.
const finalResults = [];

// Iterate through each line of the input data.
// 'currentLineIndex' serves as a counter for the data sets.
for (let currentLineIndex = 0; currentLineIndex < incomingLines.length; currentLineIndex++) {
    const currentDataSet = incomingLines[currentLineIndex];

    // Check if the current line matches the termination sequence.
    if (currentDataSet === terminationSequence) {
        // If it's the termination sequence, stop processing further lines and exit the loop.
        break;
    }

    // Parse the numbers from the current line.
    // It's expected to be two space-separated integers.
    // `parseInt(element, 10)` ensures parsing as base-10 integers.
    const numericalParameters = currentDataSet.split(" ").map(element => parseInt(element, 10));

    // Basic validation for the parsed parameters.
    // Ensure there are exactly two numbers and they are valid, non-NaN integers.
    if (numericalParameters.length !== 2 || isNaN(numericalParameters[0]) || isNaN(numericalParameters[1])) {
        // If the line is malformed or contains non-numeric data, skip to the next data set.
        // Pushing a specific value (-1) can indicate an input parsing error for this line.
        finalResults.push(-1);
        continue;
    }

    // Extract the two main parameters for the current problem instance.
    const totalSlotsAvailable = numericalParameters[0]; // Corresponds to 'N' in the original problem
    const emptySlotsToSkip = numericalParameters[1];   // Corresponds to 'm' in the original problem

    // Further validation: ensure parameters are positive for meaningful execution.
    // Negative or zero values would lead to undefined or trivial behavior.
    if (totalSlotsAvailable <= 0 || emptySlotsToSkip <= 0) {
        // If parameters are non-positive, this configuration is considered invalid.
        // Pushing a specific value (-2) can indicate invalid problem parameters.
        finalResults.push(-2);
        continue;
    }

    // Initialize an array representing the circular slots.
    // Each slot is initially 'null', signifying it is empty and available.
    const occupiedPositionsTracker = Array(totalSlotsAvailable).fill(null);

    // This variable keeps track of the current position in the circular arrangement.
    // It is initialized to 0, and will be incremented at the start of the inner loop,
    // effectively starting the search from position 1 relative to the last placement.
    let currentCircularSpot = 0;

    // Loop through each element (or 'person') that needs to be placed into a slot.
    // 'elementSequenceId' tracks which element is currently being placed (from 0 up to totalSlotsAvailable - 1).
    for (let elementSequenceId = 0; elementSequenceId < totalSlotsAvailable; elementSequenceId++) {
        let countOfEmptySlotsFound = 0; // This counter resets for each element placement operation.

        // This inner loop continuously searches for the 'emptySlotsToSkip'-th empty slot.
        // It's an infinite loop that will be explicitly broken once the target slot is found.
        while (true) {
            // Move to the next position in the circular array.
            // The modulo operator (`%`) ensures that the index wraps around from (N-1) back to 0,
            // simulating a circular structure.
            currentCircularSpot = (currentCircularSpot + 1) % totalSlotsAvailable;

            // If the current spot in the tracker array is 'null', it means the slot is empty.
            if (occupiedPositionsTracker[currentCircularSpot] === null) {
                countOfEmptySlotsFound++; // Increment the counter for empty slots found.
            }

            // Once the required number of empty slots (as specified by 'emptySlotsToSkip')
            // have been counted, the 'currentCircularSpot' is the target location for the element.
            if (countOfEmptySlotsFound === emptySlotsToSkip) {
                // Mark this spot as occupied by the current element's ID.
                occupiedPositionsTracker[currentCircularSpot] = elementSequenceId;
                // Break out of this inner search loop, as the element has been successfully placed.
                break;
            }
        }
    }
    // After all elements have been placed, the 'currentCircularSpot' variable
    // will hold the index where the very last element was positioned.
    finalResults.push(currentCircularSpot);
}

// Iterate through the collected results and print each one to standard output,
// each on a new line, mimicking the original program's output format.
finalResults.forEach(outputValue => {
    console.log(outputValue);
});