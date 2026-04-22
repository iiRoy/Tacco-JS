// Ensure the standard input stream is active to receive data
process.stdin.resume();
// Set the character encoding for the incoming data stream
process.stdin.setEncoding('utf8');

// An internal collection to store all lines received from standard input
const receivedDataLines = [];

// Initialize the line-by-line input processing interface
const streamProcessor = require('readline').createInterface({
    input: process.stdin,  // Use standard input as the source
    output: process.stdout // Standard output (though not used for direct replies here)
});

// Register an event listener for each time a new line of input is detected
streamProcessor.on('line', (currentLineOfData) => {
    // Add the current input line to our buffer
    receivedDataLines.push(currentLineOfData);
});

// Register an event listener for when the input stream has completely ended
streamProcessor.on('close', () => {
    // Once all input is received, trigger the main calculation and output routine
    performAlgorithmAndDisplayResult(receivedDataLines);
});


/**
 * Core function to execute the algorithm based on input data and display the final state.
 * @param {string[]} inputLines A buffer containing all received lines of input.
 */
function performAlgorithmAndDisplayResult(inputLines) {
    // --- Input Validation and Parsing ---

    // Guard clause: Ensure minimum input lines are present
    if (inputLines.length < 2) {
        console.error("Error: Not enough input lines provided. Expected at least two lines for configuration and initial data.");
        return; // Terminate execution gracefully
    }

    // Helper function for robust integer parsing
    const safeParseInteger = (stringValue) => {
        const parsedValue = parseInt(stringValue, 10);
        if (isNaN(parsedValue)) {
            console.error(`Parsing error: "${stringValue}" is not a valid integer. Defaulting to 0.`);
            return 0; // Provide a default or handle as an error
        }
        return parsedValue;
    };

    // Extract and parse configuration parameters from the first line
    const configurationTokens = inputLines[0].split(" ");
    const arrayDimensionSize = safeParseInteger(configurationTokens[0]); // Corresponds to N
    const numberOfRounds = safeParseInteger(configurationTokens[1]);     // Corresponds to K

    // Validate parsed configuration parameters
    if (arrayDimensionSize <= 0 || numberOfRounds < 0) {
        console.error(`Invalid configuration: Array dimension (${arrayDimensionSize}) must be positive, and rounds (${numberOfRounds}) cannot be negative.`);
        return;
    }

    // Initialize the primary data array by parsing the second line
    let currentDataState = inputLines[1].split(" ").map(safeParseInteger);

    // Adjust the primary data array to match the specified dimension if necessary
    if (currentDataState.length !== arrayDimensionSize) {
        console.warn(`Warning: Initial data array length (${currentDataState.length}) differs from specified dimension (${arrayDimensionSize}). Adjusting array.`);
        if (currentDataState.length < arrayDimensionSize) {
            // Pad with zeros if too short
            while (currentDataState.length < arrayDimensionSize) {
                currentDataState.push(0);
            }
        } else {
            // Truncate if too long
            currentDataState = currentDataState.slice(0, arrayDimensionSize);
        }
    }

    // --- Core Algorithm Execution ---

    // A temporary array to store the computed values for the next iteration
    let nextIterationState = Array.from({ length: arrayDimensionSize }, () => 0);

    // Outer loop: Iterate for the specified number of rounds
    for (let roundIndex = 0; roundIndex < numberOfRounds; roundIndex++) {
        // Inner loop: Calculate each element of the next state array
        for (let targetElementIndex = 0; targetElementIndex < arrayDimensionSize; targetElementIndex++) {
            let currentElementAccumulator = 0; // Reset counter for the current target element

            // Innermost loop: Compare the current target element with all elements in the current data state
            for (let sourceElementIndex = 0; sourceElementIndex < arrayDimensionSize; sourceElementIndex++) {
                const valueFromSource = currentDataState[sourceElementIndex];
                // Calculate the absolute distance between the two indices
                const positionalDifference = Math.abs(targetElementIndex - sourceElementIndex);

                // Apply the core conditional logic
                if (valueFromSource >= positionalDifference) {
                    currentElementAccumulator++;
                }
            }
            // Store the accumulated count for the current target element
            nextIterationState[targetElementIndex] = currentElementAccumulator;
        }

        // Update the primary data array with the computed next state for the subsequent round
        // Using slice() ensures a new array reference, preventing unintended modifications
        currentDataState = nextIterationState.slice();
    }

    // --- Output Generation ---

    // Prepare the elements for final display
    const elementsForOutput = [];
    // Determine how many elements to display (up to 5, or fewer if the array is smaller)
    const displayCount = Math.min(5, arrayDimensionSize);

    // Populate the output array with the relevant elements
    for (let i = 0; i < displayCount; i++) {
        elementsForOutput.push(currentDataState[i]);
    }

    // Print the selected elements joined by spaces to standard output
    console.log(elementsForOutput.join(' '));
}