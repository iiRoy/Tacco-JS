function findInsertionPoint(dataArray, startIndex, endIndex, targetValue) {
    let midPoint; // Variable to store the calculated middle index
    // Perform a binary search within the specified range [startIndex, endIndex)
    // The loop continues as long as there are at least two elements in the search range.
    for (; (endIndex - startIndex) > 1; ) {
        // Calculate the middle index using an unsigned right shift for efficient integer division.
        midPoint = (startIndex + endIndex) >>> 1;
        // If the element at the middle index is less than the target value,
        // then the target must be in the upper half of the current range.
        if (dataArray[midPoint] < targetValue) {
            startIndex = midPoint; // Adjust the lower bound of the search range.
        } else {
            // Otherwise, the target is in the lower half or at the midPoint itself.
            endIndex = midPoint; // Adjust the upper bound of the search range.
        }
    }
    // After the loop, startIndex and endIndex will be adjacent.
    // Determine the correct insertion point based on the element at startIndex.
    return dataArray[startIndex] < targetValue ? endIndex : startIndex;
}

// A simple comparison function for sorting numbers in ascending order.
// This function is intended for use with Array.prototype.sort().
function numericComparator(valA, valB) {
    return valA - valB; // Returns a negative, zero, or positive value based on comparison.
}

// The primary function to process the input string and calculate the result.
function ProcessInput(inputString) {
    // Parse the first line of the input to get the total count of elements.
    // The unary plus operator converts the string to a number.
    const countElements = +inputString.split("\n")[0];

    // Parse the second line of the input.
    // Split by spaces, then map each string value to a number.
    const dataList = inputString.split("\n")[1].split(" ").map(value => value - 0);

    let totalTriplets = 0; // Initialize a counter for the valid triplets found.

    let firstVal, secondVal, thirdVal; // Declare variables for the triplet elements (thirdVal is declared but not explicitly used in this loop structure).

    // Sort the list of numbers in ascending order. This is a prerequisite for the algorithm.
    dataList.sort(numericComparator);

    // Outer loop: Iterate to select the first element of the triplet (a).
    // 'idxOne' goes up to 'countElements - 2' because we need at least two more elements for a triplet.
    for (let idxOne = 0; idxOne < countElements - 2; idxOne++) {
        firstVal = dataList[idxOne]; // Assign the current element to 'firstVal'.

        // Inner loop: Iterate to select the second element of the triplet (b).
        // 'idxTwo' starts from 'idxOne + 1' to ensure distinct elements and maintain order.
        // 'idxTwo' goes up to 'countElements - 1' because we need at least one more element.
        for (let idxTwo = idxOne + 1; idxTwo < countElements - 1; idxTwo++) {
            secondVal = dataList[idxTwo]; // Assign the current element to 'secondVal'.

            // Use the binary search function to find the upper bound for the third element (c).
            // We are looking for elements 'c' such that 'c < firstVal + secondVal'.
            // 'findInsertionPoint' returns the index of the first element >= (firstVal + secondVal).
            // Subtracting 1 gives the index of the last element < (firstVal + secondVal).
            // The search starts from 'idxTwo + 1' to ensure 'c' is distinct from 'firstVal' and 'secondVal'.
            const upperBoundIdx = findInsertionPoint(dataList, idxTwo + 1, countElements, firstVal + secondVal) - 1;

            // Calculate the number of valid 'c' values for the current 'firstVal' and 'secondVal'.
            // If 'upperBoundIdx' is greater than 'idxTwo', it means there are valid 'c' values.
            // The count is 'upperBoundIdx - idxTwo'. If 'upperBoundIdx <= idxTwo', this will be 0 or negative,
            // but since 'upperBoundIdx' will be at least 'idxTwo' (as 'findInsertionPoint' starts from 'idxTwo + 1'),
            // the result 'upperBoundIdx - idxTwo' will always be non-negative.
            totalTriplets += (upperBoundIdx - idxTwo);
        }
    }

    // Print the final calculated total number of triplets to the console.
    console.log(totalTriplets);

    // The function completes its execution.
    return;
}

// Read the input from standard input and pass it to the main processing function.
// This part interacts with the file system and is considered an external contract.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
