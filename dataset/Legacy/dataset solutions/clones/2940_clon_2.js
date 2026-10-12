function ProcessInput(rawData) {
    // Split the entire input string into individual lines for processing.
    let textRows = rawData.split('\n');

    // Extract the first line, then split it by space to get initial configuration values.
    let firstLineParts = textRows.shift().split(' ');

    // Convert the first part to a number, representing the count of items.
    let numItems = firstLineParts[0] * 1;
    // Convert the second part to a number, representing the count of operations.
    let numOperations = firstLineParts[1] * 1;

    // Extract the next line, split by space to get item values, and sort them numerically in ascending order.
    let itemValues = textRows.shift().split(' ').sort(function (valA, valB) {
        return valA - valB; // Numeric sort for string numbers
    });

    // Remove the last element from the textRows array, which might be an empty string from the final newline.
    textRows.pop();

    // Sort the remaining lines (which represent operations) based on their second component (value) in descending order.
    let operationDetails = textRows.sort(function(op1, op2) {
        // Split each operation string and compare their second elements after converting to numbers.
        return op2.split(' ')[1] * 1 - op1.split(' ')[1] * 1;
    });

    // Initialize an index to track the current position in the itemValues array.
    let currentIndex = 0;

    // Iterate through each operation defined in operationDetails.
    for (let loopCounter = 0; loopCounter < operationDetails.length; loopCounter++) {
        // Split the current operation string into its constituent parts.
        let currentOpParts = operationDetails[loopCounter].split(' ');

        // Get the quantity (count) for the current operation.
        let opCount = currentOpParts[0] * 1;
        // Get the value to apply for the current operation.
        let opValue = currentOpParts[1] * 1;

        // Apply this operation 'opCount' times, or until conditions are met.
        while (opCount > 0) {
            // If we have processed all available item values, stop.
            if (itemValues[currentIndex] === undefined) {
                break;
            }

            // If the current item's value is less than the operation's value, update it.
            if (itemValues[currentIndex] * 1 < opValue) { // Ensure comparison is numeric
                itemValues[currentIndex] = opValue; // Assign the new value.
            } else {
                // If the current item's value is not less, then due to the initial sorting of itemValues,
                // subsequent items will also not be less. So, we can stop applying this specific operation.
                break;
            }
            currentIndex++; // Move to the next item value.
            opCount--; // Decrement the remaining count for this operation.
        }
        // If all item values have been processed, no need to continue with further operations.
        if (itemValues[currentIndex] === undefined) {
            break;
        }
    }

    // Calculate the final sum of all item values after all modifications.
    let finalSum = itemValues.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue * 1; // Ensure numeric addition.
    }, 0);

    // Output the computed final sum to the console.
    console.log(finalSum);
}

// Read the entire input from standard input (typically a file in competitive programming environments)
// and then invoke the main processing function with this raw data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
