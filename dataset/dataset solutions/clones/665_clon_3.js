const inputHandler = require('readline'); // Module to handle line-by-line input from the console.

// Set up the interface to read from standard input and write to standard output.
const consoleInputOutputInterface = inputHandler.createInterface({
    input: process.stdin,
    output: process.stdout
});

// An array to buffer all incoming lines from standard input until EOF.
const receivedDataSegments = [];
// A pointer to keep track of the current position in the `receivedDataSegments` array.
let currentSegmentIndex = 0;

// Register an event listener to capture each line as it's entered.
consoleInputOutputInterface.on('line', (singleLineString) => {
    receivedDataSegments.push(singleLineString); // Add the line to our buffer.
});

// Register an event listener to execute when the input stream closes (e.g., user presses Ctrl+D).
consoleInputOutputInterface.on('close', () => {
    // This variable will hold the accumulated sum for each processing block.
    let aggregatedNumericTotal = 0;
    // An optional counter to track how many main processing cycles have completed.
    let primaryProcessingCycleCount = 0;

    // The core processing loop. It continues as long as there are lines left in our buffer.
    // This effectively simulates the infinite loop of the original Java code,
    // but with a defined end based on input availability.
    while (currentSegmentIndex < receivedDataSegments.length) {
        // Reset the total for the current block of operations.
        aggregatedNumericTotal = 0;
        primaryProcessingCycleCount++; // Increment the cycle counter for this iteration.

        // Retrieve the first line of the current data block. This line determines
        // how many subsequent lines need to be processed.
        const blockSpecificationString = receivedDataSegments[currentSegmentIndex++];

        // Attempt to parse the string into an integer. The radix (10) is specified for safety.
        const controllingValueForBlock = parseInt(blockSpecificationString, 10);

        // --- Input Validation / Guard Clause A ---
        // Check if the parsed value is a valid number. If not, it indicates bad input.
        if (isNaN(controllingValueForBlock)) {
            console.error(`ERR: Input stream encountered non-numeric block specifier "${blockSpecificationString}". Halting operation.`);
            break; // Exit the main processing loop due to invalid input.
        }

        // --- Termination Condition (Directly mirrors original Java's `if (n == 0) break;`) ---
        // If the controlling value is zero, it's a signal to stop all further processing.
        if (controllingValueForBlock === 0) {
            // console.log("INFO: Termination signal (zero value) received. Concluding operations.");
            break; // Exit the main processing loop.
        }

        // Determine the number of sub-items to process within this block.
        // The original Java used integer division `n/4`. `Math.floor` replicates this.
        const numberOfSubIterations = Math.floor(controllingValueForBlock / 4);

        // A temporary accumulator for values within the inner processing loop.
        let subBlockAccumulator = 0;
        // A counter for successfully processed items in the inner loop.
        let subItemsSuccessfullyProcessed = 0;

        // Inner loop: processes a specific number of subsequent lines based on `numberOfSubIterations`.
        for (let subIterationIndex = 0; subIterationIndex < numberOfSubIterations; ++subIterationIndex) {
            // --- Input Validation / Guard Clause B ---
            // Ensure there are enough lines available in the buffer for the inner loop to complete.
            if (currentSegmentIndex >= receivedDataSegments.length) {
                console.error(`CRITICAL ERROR: Insufficient data for inner cycle ${primaryProcessingCycleCount}. Expected ${numberOfSubIterations} items, but only found ${subItemsSuccessfullyProcessed}. Exiting forcefully.`);
                process.exit(1); // Terminate the entire process with an error code.
            }

            // Retrieve the next line, which represents an item to be summed.
            const itemValueString = receivedDataSegments[currentSegmentIndex++];
            // Parse this item string into an integer.
            const parsedItemComponent = parseInt(itemValueString, 10);

            // --- Input Validation / Guard Clause C ---
            // Check if the parsed item is a valid number.
            if (isNaN(parsedItemComponent)) {
                console.warn(`WARNING: Non-numeric item "${itemValueString}" found in inner loop (cycle ${primaryProcessingCycleCount}, item ${subIterationIndex}). This value will be skipped.`);
                continue; // Skip the current invalid item and proceed to the next iteration.
            }

            // Add the valid item's value to the temporary accumulator.
            subBlockAccumulator += parsedItemComponent;
            subItemsSuccessfullyProcessed++; // Increment the counter for valid items.
        }

        // After the inner loop, assign the accumulated sub-total to the main block total.
        // This acts as an intermediate step, fulfilling a Type III modification.
        aggregatedNumericTotal = subBlockAccumulator;

        // Output the final calculated sum for the current block of operations.
        console.log(aggregatedNumericTotal);
    } // End of the main processing loop.

    // Optional: A final message indicating that all input has been processed.
    // console.log(`INFO: All available input processed. Total main cycles completed: ${primaryProcessingCycleCount}.`);
});