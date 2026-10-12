const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input: remove leading/trailing whitespace, split into lines, and convert each line to a number.
let numericData = rawData.trim().split("\n").map(Number);

// Initialize a pointer to navigate through the `numericData` array.
let dataPointer = -1;

// Main processing loop. It continues indefinitely until a specific termination condition is met.
while (true) {
    // Read the next number from the input array, which signifies the count of items for the current block.
    let currentCount = numericData[++dataPointer];

    // If the `currentCount` is zero, it indicates the end of input, so break out of the loop.
    if (currentCount === 0) {
        break;
    }

    // Initialize an empty array to store the processed values for the current block.
    let processedValues = [];
    // A boolean flag used to alternate behavior within the inner loop.
    let toggleState = false;
    // Declare variables to hold the current value being processed and an index for internal operations.
    let currentValue;
    let loopIndex;

    // Iterate `currentCount` times to process each item within the current block.
    for (let iterationCounter = 0; iterationCounter < currentCount; iterationCounter++) {
        // Fetch the next value from the input data using the global data pointer.
        currentValue = numericData[++dataPointer];
        // Set the internal loop index to the current iteration counter.
        loopIndex = iterationCounter;
        // Flip the `toggleState` for alternating logic.
        toggleState = !toggleState;

        // Conditional logic based on the `toggleState`.
        if (toggleState) {
            // If `toggleState` is true, simply append the `currentValue` to the `processedValues` array.
            processedValues.push(currentValue);
        } else {
            // If `toggleState` is false, apply more complex logic.
            // Check if the last element in `processedValues` is identical to the `currentValue`.
            if (processedValues[processedValues.length - 1] === currentValue) {
                // If they are the same, append the `currentValue` to maintain the sequence.
                processedValues.push(currentValue);
            } else {
                // If they are different, first append the `currentValue`.
                processedValues.push(currentValue);
                // Then, decrement the `loopIndex` to start modifying previous elements.
                loopIndex--;
                // Enter an inner loop to propagate the `currentValue` backwards.
                while (true) {
                    // Break condition: if `loopIndex` goes out of bounds (less than 0)
                    // or if an element at `loopIndex` already matches `currentValue`.
                    if (loopIndex < 0 || processedValues[loopIndex] === currentValue) {
                        break;
                    } else {
                        // Otherwise, update the element at `loopIndex` with the `currentValue`.
                        processedValues[loopIndex] = currentValue;
                        // Move to the previous element.
                        loopIndex--;
                    }
                }
            }
        }
    }

    // Initialize a counter for occurrences of the number zero.
    let zeroCount = 0;
    // Iterate through the `processedValues` array to count how many zeros it contains.
    processedValues.forEach(function(val) {
        if (val === 0) {
            zeroCount++;
        }
    });

    // Output the total count of zeros found in the current block's processed values.
    console.log(zeroCount);
}
