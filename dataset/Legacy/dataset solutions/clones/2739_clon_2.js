// This module processes input data to determine item states and output specific indices.
function ProcessInputData(rawData) {
    // The raw input string is split into an array of lines.
    let lineSegments = rawData.split("\n");

    // The first line contains the total number of items, parsed as an integer.
    const totalItems = parseInt(lineSegments[0], 10);

    // An array is initialized to store the binary states (0 or 1) of each item.
    let itemStates = new Array(totalItems);
    // An array to collect the indices of items that end up in state 1.
    let selectedIndices = [];
    // A counter for the number of items in state 1.
    let selectionCount = 0;

    // The main logic iterates backwards from the total number of items down to 1.
    for (let currentIdx = totalItems; currentIdx > 0; currentIdx--) {
        // Calculate the zero-based array position for the current item.
        const arrayPosition = currentIdx - 1;
        // Parse the corresponding line segment to get a temporary comparison value.
        const tempValue = parseInt(lineSegments[currentIdx], 10);

        // Initialize a running sum for the current item's calculation.
        let currentSum = 0;
        // A multiplier is used to check subsequent items in a specific pattern.
        let multiplier = 2;
        // This loop aggregates states of items whose indices are multiples of the current item's index.
        while (currentIdx * multiplier <= totalItems) {
            // Add the state of the item at the calculated multiple position.
            currentSum += itemStates[currentIdx * multiplier - 1];
            // Increment the multiplier for the next iteration.
            multiplier++;
        }

        // Determine the state of the current item based on the sum and the temporary value.
        if (currentSum % 2 === tempValue) {
            // If the parity matches, the item's state is set to 0.
            itemStates[arrayPosition] = 0;
        } else {
            // Otherwise, the item's state is set to 1.
            itemStates[arrayPosition] = 1;
            // Increment the counter for selected items.
            selectionCount++;
            // Add the current item's 1-based index to the list of selected indices.
            selectedIndices.push(currentIdx);
        }
    }

    // After processing all items, check if any items were selected.
    if (selectionCount > 0) {
        // Output the total count of selected items.
        console.log('%d', selectionCount);

        // Initialize an empty string to build the output of selected indices.
        let outputString = '';
        // Iterate backwards through the collected selected indices.
        for (let currentIdx = selectionCount - 1; currentIdx >= 0; currentIdx--) {
            // Append the current selected index to the output string.
            outputString += selectedIndices[currentIdx];
            // This conditional logic appends the index again and adds a space,
            // except for the very last element where it only appends the index again.
            if (currentIdx === 0) {
                outputString += selectedIndices[currentIdx];
            } else {
                outputString += selectedIndices[currentIdx];
                outputString += ' ';
            }
        }
        // Output the formatted string of selected indices.
        console.log(outputString);
    } else {
        // If no items were selected, output 0.
        console.log('%d', 0);
    }
}

// This line should not be modified as it handles standard input/output.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
