function generateSortedItems(itemsCollection) {
    // This function creates an array where elements are placed at their value's index.
    const orderedElements = [];
    itemsCollection.forEach(itemVal => orderedElements[itemVal] = itemVal);
    // Filter out any undefined slots, leaving only the actual items.
    return orderedElements.filter(itemVal => itemVal !== undefined);
}

function calculateMinSwapCost(itemArray, arrayLength, totalCostTracker, sortedArray) {
    // Initialize the minimum value found among misplaced items.
    let currentMinVal = sortedArray[arrayLength - 1];
    // Counter for elements that are not in their correct sorted position.
    let mismatchCount = 0;

    // Iterate through the array to find misplaced elements and the smallest among them.
    for (let idx = 0; idx < arrayLength; idx++) {
        if (itemArray[idx] !== sortedArray[idx]) {
            mismatchCount++;
            // Update currentMinVal if a smaller misplaced item is found.
            currentMinVal = itemArray[idx] < currentMinVal ? itemArray[idx] : currentMinVal;
        }
    }

    // Special handling if the first element is 0 and there are more than two mismatches.
    if (itemArray[0] === 0 && mismatchCount > 2) {
        // Move 0 to the position of currentMinVal, and currentMinVal to the first position.
        itemArray[itemArray.indexOf(currentMinVal)] = 0;
        itemArray[0] = currentMinVal;
        // Add currentMinVal to the total cost.
        totalCostTracker[0] += currentMinVal;
        currentMinVal = 0; // The new minimum is now 0.
    }

    // If there are any mismatches, perform a swap operation.
    if (mismatchCount) {
        const currentMinIndex = itemArray.indexOf(currentMinVal);
        // Find the index of the element that *should* be at currentMinIndex's position.
        const targetElementIndex = itemArray.indexOf(sortedArray[currentMinIndex]);
        const temporaryValue = itemArray[targetElementIndex]; // Store the value at the target index.

        // Perform the swap: move currentMinVal to its correct position, and the displaced element to currentMinVal's original spot.
        itemArray[targetElementIndex] = currentMinVal;
        itemArray[currentMinIndex] = temporaryValue;
        // Update the total cost with the values involved in the swap.
        totalCostTracker[0] += currentMinVal + temporaryValue;
        // Recursively call the function to continue sorting until all elements are in place.
        calculateMinSwapCost(itemArray, arrayLength, totalCostTracker, sortedArray);
    }
}

function processInputData(inputString) {
    // Split the input string into individual lines.
    const lines = inputString.split("\n");
    // Parse the first line as the array length.
    const dataSize = parseInt(lines.shift(), 10);
    // Parse the second line as an array of integers.
    const initialItems = lines[0].split(' ').map((element) => parseInt(element, 10));
    // Initialize an array to track the cumulative cost, starting at 0.
    const finalCost = [0];
    // Generate the perfectly sorted version of the initial items.
    const properlyOrdered = generateSortedItems(initialItems);

    // Call the main sorting function to calculate the minimum cost.
    calculateMinSwapCost(initialItems, dataSize, finalCost, properlyOrdered);
    // Output the final calculated cost.
    console.log(finalCost[0]);
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
