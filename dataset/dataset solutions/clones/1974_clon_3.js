// This section prepares the standard input stream, though the primary input method in this script is file-based.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function for efficient element swapping within an array.
const exchangeElements = (dataCollection, indexA, indexB) => {
    const temporaryStorage = dataCollection[indexA];
    dataCollection[indexA] = dataCollection[indexB];
    dataCollection[indexB] = temporaryStorage;
};

// Custom quicksort-like algorithm for arranging objects based on their 'valueKey' property.
function processAndArrange(itemSet) {
    // Recursive function to partition and sort sub-arrays.
    const subDivideAndSort = (lowerBoundary, upperBoundary) => {
        // Base case: if the segment is empty or contains a single element, it's already sorted.
        if (lowerBoundary >= upperBoundary) {
            return;
        }

        let leftCursor = lowerBoundary;
        let rightCursor = upperBoundary;
        // Choose the pivot value from the middle element to avoid worst-case scenarios
        // Using bitwise right shift for integer division, generally faster.
        const centralPivotValue = itemSet[(leftCursor + rightCursor) >>> 1].valueKey;

        // Main partitioning loop: continues as long as cursors haven't crossed.
        while (leftCursor < rightCursor) {
            // Move leftCursor forward until an element >= pivot is found.
            if (itemSet[leftCursor].valueKey >= centralPivotValue) {
                // Search from the right for an element that is less than or equal to the pivot (but not past leftCursor).
                while (rightCursor > leftCursor) {
                    if (itemSet[rightCursor].valueKey <= centralPivotValue) {
                        // Swap the elements found by cursors to place them in correct partitions.
                        exchangeElements(itemSet, leftCursor, rightCursor);
                        rightCursor--; // Move rightCursor inward after a successful swap.
                        break; // Exit inner loop, proceed to move leftCursor.
                    }
                    rightCursor--; // Continue moving rightCursor inward.
                }
            }
            leftCursor++; // Always move leftCursor inward.
        }

        // After partitioning, make recursive calls for the two sub-arrays.
        // The decision on where to split depends on the value at the final rightCursor position.
        const elementAtRightCursorValue = itemSet[rightCursor].valueKey;

        if (elementAtRightCursorValue > centralPivotValue) {
            // If the element at rightCursor is greater than the pivot, it belongs to the right sub-problem.
            subDivideAndSort(lowerBoundary, rightCursor - 1);
            subDivideAndSort(rightCursor, upperBoundary);
        } else if (elementAtRightCursorValue < centralPivotValue) {
            // If the element at rightCursor is less than the pivot, it belongs to the left sub-problem.
            subDivideAndSort(lowerBoundary, rightCursor);
            subDivideAndSort(rightCursor + 1, upperBoundary);
        } else {
            // If the element at rightCursor is equal to the pivot, it is correctly placed
            // and excluded from subsequent recursive calls to balance partitions.
            subDivideAndSort(lowerBoundary, rightCursor - 1);
            subDivideAndSort(rightCursor + 1, upperBoundary);
        }
    };

    // Initiate the sorting process for the entire collection from index 0 to last.
    subDivideAndSort(0, itemSet.length - 1);

    return itemSet; // Return the sorted collection.
}

// Function to calculate the Greatest Common Divisor (GCD) of two numbers using the iterative Euclidean algorithm.
const calculatePairwiseGCD = (valueOne, valueTwo) => {
    // Work with absolute values to handle negative inputs correctly for GCD.
    let currentA = Math.abs(valueOne);
    let currentB = Math.abs(valueTwo);

    // Continue the process until currentB becomes zero.
    while (currentB !== 0) {
        // Update currentA and currentB: currentA becomes old currentB, currentB becomes remainder.
        [currentA, currentB] = [currentB, currentA % currentB];
    }
    return currentA; // When currentB is zero, currentA holds the GCD.
};

// Function to compute the GCD for an entire array of numbers.
const computeCollectionGCD = (numericValues) => {
    // Guard clause for empty input array.
    if (!numericValues || numericValues.length === 0) {
        return 0; // Conventionally, GCD of an empty set is 0.
    }
    // Guard clause for single-element array.
    if (numericValues.length === 1) {
        return Math.abs(numericValues[0]); // GCD of a single number is its absolute value.
    }

    // Initialize the running GCD with the first two elements.
    let aggregateGCD = calculatePairwiseGCD(numericValues[0], numericValues[1]);

    // Iterate through the rest of the array elements.
    for (let currentPosition = 2; currentPosition < numericValues.length; currentPosition++) {
        // Optimization: if GCD becomes 1, it cannot get smaller, so we can stop early.
        if (aggregateGCD === 1) {
            return 1;
        }
        // Update the aggregate GCD with the current element.
        aggregateGCD = calculatePairwiseGCD(aggregateGCD, numericValues[currentPosition]);
    }
    return aggregateGCD; // Return the final GCD of all elements.
};

// Main function to orchestrate the input processing, sorting, and calculation logic.
const orchestrateCalculation = (rawDataString) => {
    // Split the raw input string into individual lines.
    const parsedInputLines = rawDataString.split("\n");

    // Extract the total number of elements from the first line.
    // Using unary plus for concise string-to-number conversion.
    const totalElementCount = +parsedInputLines[0].split(" ")[0];

    // Extract and convert the initial numeric values from the second line.
    const inputNumericSequence = parsedInputLines[1].split(" ").map(Number);

    // Basic validation: Check if the declared count matches the actual number of values.
    if (totalElementCount !== inputNumericSequence.length) {
        // Log an error and terminate if input is malformed.
        console.error("Input data mismatch: Declared element count does not align with provided values.");
        return;
    }

    // Transform the flat array into an array of objects, preserving original indices.
    const indexedDataItems = Array.from({ length: totalElementCount }, (_, originalIndex) => ({
        originalPosition: originalIndex,
        valueKey: inputNumericSequence[originalIndex]
    }));

    // Sort the collection of objects using the custom sorting algorithm.
    const orderedDataItems = processAndArrange(indexedDataItems);

    let frontBoundaryPointer = 1; // Represents the 'f' cursor in the original logic.
    let backBoundaryPointer = totalElementCount; // Represents the 'b' cursor.
    let accumulatedFinalSum = 0; // Stores the cumulative sum.

    // Iterate through the sorted data items in reverse order (from largest value to smallest).
    for (let processingIndex = totalElementCount - 1; processingIndex >= 0; processingIndex--) {
        const currentDataItem = orderedDataItems[processingIndex];
        const currentItemNumericValue = currentDataItem.valueKey;
        const currentItemOriginalPosition = currentDataItem.originalPosition;

        // Calculate 'distance' metrics based on the original position.
        const distanceToFrontSide = currentItemOriginalPosition + 1;
        const distanceToBackSide = totalElementCount - currentItemOriginalPosition;

        // Use a switch statement for clearer conditional logic, replacing if/else if/else.
        switch (true) {
            case distanceToBackSide < distanceToFrontSide:
                // If the item's original position makes it 'closer' to the back side.
                accumulatedFinalSum += currentItemNumericValue * (currentItemOriginalPosition - frontBoundaryPointer + 1);
                frontBoundaryPointer++;
                break;
            case distanceToBackSide > distanceToFrontSide:
                // If the item's original position makes it 'closer' to the front side.
                accumulatedFinalSum += currentItemNumericValue * (backBoundaryPointer - currentItemOriginalPosition - 1);
                backBoundaryPointer--;
                break;
            case distanceToBackSide === distanceToFrontSide: // Tie-breaking scenario.
                let allocationDecisionMade = false;
                // If distances are equal, check the next item in the *sorted* list (which is at `processingIndex - 1` due to reverse iteration).
                if (processingIndex > 0) {
                    const nextSmallerValueItem = orderedDataItems[processingIndex - 1];
                    const nextItemOriginalPos = nextSmallerValueItem.originalPosition;

                    const nextItemDistToFront = nextItemOriginalPos + 1;
                    const nextItemDistToBack = totalElementCount - nextItemOriginalPos;

                    if (nextItemDistToBack < nextItemDistToFront) {
                        // If the next smaller item is closer to the back, current item also goes to back.
                        accumulatedFinalSum += currentItemNumericValue * (backBoundaryPointer - currentItemOriginalPosition - 1);
                        backBoundaryPointer--;
                        allocationDecisionMade = true;
                    } else if (nextItemDistToBack > nextItemDistToFront) {
                        // If the next smaller item is closer to the front, current item also goes to front.
                        accumulatedFinalSum += currentItemNumericValue * (currentItemOriginalPosition - frontBoundaryPointer + 1);
                        frontBoundaryPointer++;
                        allocationDecisionMade = true;
                    }
                    // If the next smaller item also results in a tie (nextItemDistToBack === nextItemDistToFront),
                    // the `allocationDecisionMade` remains false, falling through to the default logic below.
                }

                if (!allocationDecisionMade) {
                    // This block handles cases where:
                    // 1. `processingIndex` is 0 (the smallest value in the sorted list) and it's a tie.
                    //    The original code would have an out-of-bounds error if `i=0` and it hits the `else` branch.
                    //    We assign it to the front side by default here.
                    // 2. `processingIndex > 0`, but the `nextSmallerValueItem` *also* resulted in a tie.
                    //    The original code's tie-breaking `if/else if` would not catch this.
                    accumulatedFinalSum += currentItemNumericValue * (currentItemOriginalPosition - frontBoundaryPointer + 1);
                    frontBoundaryPointer++;
                }
                break;
        }
    }

    // Output the final calculated total sum.
    console.log(accumulatedFinalSum);
};

// This line ensures the script reads input from standard input (or a file in /dev/stdin)
// and passes it to the main orchestration function.
orchestrateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));