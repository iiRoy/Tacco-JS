const fileSystemModule = require('fs'); // Renamed 'fs' to 'fileSystemModule' for clarity, using const.

// Read the entire raw input data from the standard input stream.
let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Renamed 'input' to 'rawInputContent'.

// Process the raw content: trim whitespace and split into an array of lines.
let inputLineBuffer = rawInputContent.trim().split('\n'); // Renamed 'Arr' to 'inputLineBuffer'.

let currentLineIndex = 0; // Introduce a helper variable to track the current line being processed.

// Main loop to handle multiple data sets (test cases) from the input.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the string representation of the item count for the current data set.
    let itemCountString = inputLineBuffer[currentLineIndex++];

    // Attempt to convert the item count string to a numeric value.
    let activeItemCount = Number(itemCountString); // Renamed 'n' to 'activeItemCount', explicitly using Number().

    // Type III: Add a guard clause for malformed input. If conversion fails, treat as end of input.
    if (isNaN(activeItemCount)) {
        // console.error("Input format error: Non-numeric item count detected. Terminating.");
        break;
    }

    // Termination condition for the main processing loop: if the item count is zero.
    if (activeItemCount === 0) {
        break;
    }

    // Read the line containing the primary set of values.
    let primaryValuesLine = inputLineBuffer[currentLineIndex++];
    // Type III: Add a guard for potentially missing input lines.
    if (primaryValuesLine === undefined) {
        // console.error("Input format error: Missing primary values line. Terminating.");
        break;
    }
    // Parse the primary values into an array of numbers.
    let baseValueCollection = primaryValuesLine.split(' ').map(val => parseInt(val, 10)); // Renamed 'p' to 'baseValueCollection', using parseInt.

    // Read the line containing the auxiliary set of values.
    let auxiliaryValuesLine = inputLineBuffer[currentLineIndex++];
    // Type III: Add a guard for potentially missing input lines.
    if (auxiliaryValuesLine === undefined) {
        // console.error("Input format error: Missing auxiliary values line. Terminating.");
        break;
    }
    // Parse the auxiliary values into an array of numbers.
    let supplementalValueList = auxiliaryValuesLine.split(' ').map(Number); // Renamed 'j' to 'supplementalValueList'.

    // Calculate the initial total sum of all base values.
    // Type II: Rewritten reduce callback using an arrow function.
    let currentCumulativeTotal = baseValueCollection.reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Renamed 'sum' to 'currentCumulativeTotal'.

    // Sort the supplemental values in descending order to pick the largest first.
    // Type II: Rewritten sort callback using an arrow function.
    supplementalValueList.sort((valA, valB) => valB - valA);

    // Initialize the variable to store the maximum product found.
    // The initial maximum is the product of the current total sum and the active item count.
    let highestPossibleProduct = currentCumulativeTotal * activeItemCount; // Renamed 'max' to 'highestPossibleProduct'.

    // Type III: Introduce a helper variable for the decrementing count.
    let remainingActiveItems = activeItemCount;

    // Loop through the supplemental values to find the overall maximum product.
    // Type III: Changed loop condition from 'while(true)' with an internal break to explicit condition.
    while (supplementalValueList.length > 0) {
        remainingActiveItems--; // Decrement the count of items.

        // Type III: Add a guard to prevent processing with a non-positive item count.
        if (remainingActiveItems < 0) {
            // console.warn("Warning: Item count became negative during bonus application. Stopping.");
            break;
        }

        // Retrieve the next largest supplemental value.
        let nextBonusValue = supplementalValueList.shift(); // Type III: Use intermediate variable.

        // Type III: Guard against 'undefined' if somehow the list becomes empty unexpectedly.
        if (nextBonusValue === undefined) {
            break;
        }

        // Add the bonus value to the current cumulative total.
        currentCumulativeTotal += nextBonusValue;

        // Calculate the potential product with the updated total and remaining items.
        let potentialNewProduct = currentCumulativeTotal * remainingActiveItems; // Type III: Use intermediate variable.

        // Update the highest possible product if the current potential product is greater.
        highestPossibleProduct = Math.max(highestPossibleProduct, potentialNewProduct);
    }

    // Output the maximum product calculated for the current data set.
    console.log(highestPossibleProduct);
}