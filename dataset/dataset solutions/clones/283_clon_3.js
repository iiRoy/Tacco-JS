// This script processes a series of numerical configurations to simulate a placement game.
// It reads input from standard input, expecting each line to contain two space-separated integers.

// Acquire raw input data from the standard input stream using Node.js file system module.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Normalize the input: remove any leading/trailing whitespace from the entire content
// and then split it into an array of individual lines based on newline characters.
const processedInputLines = fileContent.trim().split("\n");

// Initialize a counter to manage which line is currently being processed from the input array.
let inputLineIndex = 0;

// Begin the main processing loop. It continues as long as there are lines left to read.
while (inputLineIndex < processedInputLines.length) {
    // Fetch the current line's string data.
    const currentDataString = processedInputLines[inputLineIndex];
    // Increment the index immediately to prepare for the next iteration.
    inputLineIndex++;

    // Check for a specific termination sequence "0 0". This acts as an end-of-input marker.
    if (currentDataString === "0 0") {
        break; // Exit the loop if the termination sequence is found.
    }

    // Parse the numbers from the current line. It splits the string by space
    // and then converts each part into a numerical value.
    const parsedNumericValues = currentDataString.split(" ").map(Number);

    // Implement a basic guard clause to ensure the input line contains at least two numbers.
    // If not, it logs an error and skips to the next line of input.
    if (parsedNumericValues.length < 2) {
        console.error("Malformed input line detected; skipping: " + currentDataString);
        continue;
    }

    // Extract the two primary parameters for this simulation round.
    // 'totalCapacity' represents the total number of available slots (N in original).
    // 'skipCount' represents how many empty slots to skip before placing an item (m in original).
    const totalCapacity = parsedNumericValues[0];
    const skipCount = parsedNumericValues[1];

    // Further validation for the extracted parameters to prevent logical errors or crashes.
    // 'totalCapacity' must be a positive integer for the simulation to make sense.
    if (totalCapacity <= 0) {
        console.error(`Invalid total capacity value (must be positive): ${totalCapacity}`);
        continue;
    }
    // 'skipCount' should also be positive for the skipping logic to work as intended.
    if (skipCount <= 0) {
        console.error(`Invalid skip count value (must be positive): ${skipCount}`);
        continue;
    }

    // Initialize the data structure representing the circular slots.
    // An array is used, with each element initially set to 'null' to signify an empty slot.
    const slotStatusArray = new Array(totalCapacity).fill(null);

    // This variable tracks the current position in the circular array,
    // indicating the last slot where an item was placed or the starting point for the next search.
    let currentRingPointer = 0;

    // Main loop for placing each item. 'itemSequenceNumber' corresponds to 'k' in the original code.
    for (let itemSequenceNumber = 0; itemSequenceNumber < totalCapacity; ++itemSequenceNumber) {
        // Counter for the number of empty slots found during the search phase.
        let encounteredEmptySlots = 0;
        // A flag to control the inner search loop, indicating when the target slot has been identified.
        let searchFinished = false;

        // Inner loop: repeatedly advance the pointer and check slots until the target empty slot is found.
        do {
            // Move the pointer to the next position in the circular array.
            // The modulo operator ensures the pointer wraps around from the last slot to the first.
            currentRingPointer = (currentRingPointer + 1) % totalCapacity;

            // If the slot at the 'currentRingPointer' is empty (contains 'null').
            if (slotStatusArray[currentRingPointer] === null) {
                encounteredEmptySlots++; // Increment the count of empty slots.
            }

            // Check if the required number of empty slots has been encountered.
            if (encounteredEmptySlots === skipCount) {
                searchFinished = true; // Set the flag to terminate the inner loop.
            }
        } while (!searchFinished); // Continue looping until the search is complete.

        // Once the correct empty slot is identified, place the current item's sequence number into it.
        slotStatusArray[currentRingPointer] = itemSequenceNumber;
    }

    // Prepare the final output value.
    // The problem statement specifies an adjustment: if the final pointer position is 0, it should be output as 1.
    let finalOutputPosition = currentRingPointer;
    if (finalOutputPosition === 0) {
        finalOutputPosition = 1; // Adjust 0-based index to 1 for the specific output requirement.
    }

    // Output the calculated final position for the current set of input parameters.
    console.log(finalOutputPosition);
}

// The script has finished processing all available input lines.