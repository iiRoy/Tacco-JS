const eraseOne = (sourceArray, itemToRemove) => {
    // Helper function to remove the first occurrence of a specific value from an array.
    // Returns a new array with the item removed.
    const firstIndex = sourceArray.indexOf(itemToRemove);
    if (firstIndex === -1) {
        return [...sourceArray]; // Item not found, return a shallow copy
    }
    return sourceArray.filter((_, idx) => idx !== firstIndex);
};

function checkCondition(dataCollection, currentIdx, comparisonValue) {
    // Determines if the element at a given index meets a certain condition.
    // Ensures the index is within valid bounds before access.
    if (currentIdx < 0 || currentIdx >= dataCollection.length) {
        return false; // Index out of bounds, condition cannot be met
    }
    return dataCollection[currentIdx] >= comparisonValue;
}

function locateFirstGreaterOrEqual(sortedArray, targetValue) {
    // Implements a general-purpose binary search to find the first index
    // where the element is greater than or equal to the target value.
    // Returns the insertion point or the array's length if all elements are smaller.
    if (!sortedArray || sortedArray.length === 0) {
        return 0; // Empty array, insertion point is 0
    }

    let searchLow = -1; // Represents an index that definitely does NOT satisfy the condition
    let searchHigh = sortedArray.length; // Represents an index that MIGHT satisfy the condition (or is out of bounds)

    // Continue searching while there's more than one element between high and low pointers
    while (searchHigh - searchLow > 1) {
        const midPoint = Math.floor((searchLow + searchHigh) / 2);

        if (checkCondition(sortedArray, midPoint, targetValue)) {
            searchHigh = midPoint; // Condition met, try a smaller index
        } else {
            searchLow = midPoint; // Condition not met, try a larger index
        }
    }
    return searchHigh; // searchHigh will be the first index satisfying the condition
}

const processInputData = rawData => {
    const lines = rawData.trim().split("\n");
    const itemCount = parseInt(lines[0], 10);

    // Parse the second line into an array of numbers
    const numericalData = lines[1].split(" ").map(Number);

    // Sort the primary data array in ascending order for binary search
    numericalData.sort((valA, valB) => valA - valB);

    let cumulativeSum = 0; // Accumulator for the final result

    // Iterate through all unique pairs of elements in the sorted array
    for (let outerIdx = 0; outerIdx < itemCount - 1; outerIdx++) {
        for (let innerIdx = outerIdx + 1; innerIdx < itemCount; innerIdx++) {
            const currentA = numericalData[outerIdx];
            const currentB = numericalData[innerIdx];

            // Create a temporary list by removing specific elements
            // The order of removal is crucial as eraseOne only removes the first occurrence
            let workingList = [...numericalData];
            workingList = eraseOne(workingList, currentB);
            workingList = eraseOne(workingList, currentA);

            const sumOfPair = currentA + currentB;
            const diffOfPair = Math.abs(currentA - currentB);

            workingList = eraseOne(workingList, sumOfPair);
            workingList = eraseOne(workingList, diffOfPair);

            // Ensure there are enough elements left for meaningful search operations
            if (workingList.length < 2) {
                continue;
            }

            // Find boundaries using the binary search function on the modified list
            const upperSearchBoundary = locateFirstGreaterOrEqual(workingList, sumOfPair);
            const lowerSearchBoundary = locateFirstGreaterOrEqual(workingList, diffOfPair);

            // Add the difference between boundaries to the cumulative sum
            cumulativeSum += (upperSearchBoundary - lowerSearchBoundary);
        }
    }
    // Output the final result, truncated to an integer
    console.log(Math.trunc(cumulativeSum / 3));
};

// Standard input reading for competitive programming environments
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));