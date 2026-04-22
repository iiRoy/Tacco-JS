// This script processes numerical input from standard input to perform a specific calculation.

// Ensure the standard input stream remains active for data reception.
process.stdin.resume();

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data chunks received from standard input.
let receivedDataBuffer = '';

// Event listener for incoming data chunks.
process.stdin.on('data', (dataFragment) => {
    // Append the current data fragment to the overall buffer.
    receivedDataBuffer += dataFragment;
});

// Event listener for the end of the input stream. This is where the main processing begins.
process.stdin.on('end', () => {
    // Split the accumulated buffer into an array of lines based on the newline character.
    const processedInputLines = receivedDataBuffer.split("\n");

    // --- Input Parsing and Validation Section ---

    // Validate if there are enough lines to extract both the count of items and their values.
    const MINIMUM_EXPECTED_LINES = 2;
    if (processedInputLines.length < MINIMUM_EXPECTED_LINES) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines for proper data processing.");
        // Terminate execution as input is incomplete.
        return;
    }

    // Attempt to parse the first line as the total number of items to be processed.
    const totalItemsString = processedInputLines[0];
    const totalItemsCount = parseInt(totalItemsString, 10); // Explicitly specify radix 10 for robustness.

    // Validate the parsed number of items. It must be a valid positive integer.
    if (isNaN(totalItemsCount) || totalItemsCount <= 0) {
        console.error(`Error: Invalid or non-positive item count provided: '${totalItemsString}'. A positive integer is required.`);
        return; // Halt execution due to invalid input.
    }

    // Extract the raw string values for the item quantities from the second line, splitting by space.
    const rawValueStrings = processedInputLines[1].split(" ");

    // Initialize an array to hold the parsed integer quantities.
    const itemQuantitiesArray = [];

    // Iterate through the raw string values, parse them, and validate each one.
    for (let currentParseIndex = 0; currentParseIndex < totalItemsCount; currentParseIndex++) {
        const individualRawValue = rawValueStrings[currentParseIndex];
        const parsedNumericValue = parseInt(individualRawValue, 10);

        // Validate each individual item quantity. It must be a non-negative integer.
        if (isNaN(parsedNumericValue) || parsedNumericValue < 0) {
            console.error(`Error: Invalid item quantity encountered: '${individualRawValue}' at position ${currentParseIndex}. Expected a non-negative integer.`);
            return; // Halt execution if any individual value is invalid.
        }
        // Add the validated parsed value to our quantities array.
        itemQuantitiesArray.push(parsedNumericValue);
    }

    // --- Core Algorithm Logic Section ---

    let totalOperationsPerformed = 0; // Counter for the total number of operations.
    let anyModificationDetected = true; // Flag to control the main processing loop.

    // The main processing loop continues as long as changes are made in an inner pass.
    while (anyModificationDetected) {
        // Reset the modification flag at the beginning of each major iteration.
        anyModificationDetected = false;

        // Iterate through each item quantity in the array.
        for (let primaryItemIndex = 0; primaryItemIndex < totalItemsCount; primaryItemIndex++) {
            // Store the current item's value in a temporary variable for easier access and consistency.
            const currentPrimaryItemValue = itemQuantitiesArray[primaryItemIndex];

            // Only proceed if the current item's quantity is positive.
            if (currentPrimaryItemValue > 0) {
                // Inner loop: Compare the current item with all subsequent items in the array.
                // The condition `!(currentPrimaryItemValue > itemQuantitiesArray[secondaryItemIndex])`
                // is logically equivalent to `currentPrimaryItemValue <= itemQuantitiesArray[secondaryItemIndex]`.
                for (let secondaryItemIndex = primaryItemIndex + 1;
                     secondaryItemIndex < totalItemsCount && !(currentPrimaryItemValue > itemQuantitiesArray[secondaryItemIndex]);
                     secondaryItemIndex++) {
                    
                    // If the secondary item's quantity is positive, decrement it.
                    // This check prevents values from going unnecessarily negative if they were already zero.
                    if (itemQuantitiesArray[secondaryItemIndex] > 0) {
                        itemQuantitiesArray[secondaryItemIndex] = itemQuantitiesArray[secondaryItemIndex] - 1; // Explicit decrement.
                    }
                }

                // After the inner loop, decrement the current primary item's quantity.
                itemQuantitiesArray[primaryItemIndex] = currentPrimaryItemValue - 1; // Explicit decrement.
                
                // Increment the overall counter for operations performed.
                totalOperationsPerformed = totalOperationsPerformed + 1; // Explicit increment.

                // Set the modification flag to true, indicating that a change occurred in this pass.
                anyModificationDetected = true;
            }
        }
    }

    // Output the final calculated total number of operations.
    console.log(totalOperationsPerformed);
});