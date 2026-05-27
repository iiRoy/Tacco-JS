"use strict";

// This function performs a binary search to find the lower bound of a target value
// within a given sorted array. It returns the index of the first element
// that is greater than or equal to the target. If all elements are smaller,
// it returns the length of the array.
function findLowerBound(sortedArr, targetVal) {
    let leftIdx = 0;
    let rightIdx = sortedArr.length - 1;

    // Continue binary search as long as the search range is valid.
    while (rightIdx - leftIdx >= 0) {
        // Calculate the middle index of the current search range.
        let midIdx = Math.floor((leftIdx + rightIdx) / 2);

        // If the target value is less than or equal to the element at midIdx,
        // it means the lower bound could be midIdx or to its left.
        if (targetVal <= sortedArr[midIdx]) {
            rightIdx = midIdx - 1;
        }
        // Otherwise, the target value is greater, so the lower bound must be
        // to the right of midIdx.
        else {
            leftIdx = midIdx + 1;
        }
    }
    // Upon loop termination, leftIdx will point to the correct lower bound index.
    return leftIdx;
}

// The primary function that processes the input and solves the problem.
function ProcessInput(rawData) {
    // Initialize a custom input parser.
    let inputReader = new DataParser(rawData);

    // Read the number of elements (N) and the two integer arrays (A and B).
    let numElements = inputReader.retrieveInt();
    let arrayA = inputReader.retrieveIntArray(numElements);
    let arrayB = inputReader.retrieveIntArray(numElements);

    // Create temporary arrays to store masked values for each bit position.
    let tempArrA = new Array(numElements);
    let tempArrB = new Array(numElements);

    // Initialize the variable to store the final computed result.
    let finalResult = 0;

    // Iterate through each bit position from 0 up to 29 (for 30 bits).
    for (let bitPosition = 0; bitPosition < 30; bitPosition++) {
        let parityCount = 0; // This counter tracks the parity (odd/even) of certain sums.
        // Construct a bitmask that includes all bits up to (bitPosition + 1).
        // This mask is used to consider only the relevant lower bits of numbers.
        let currentMask = (1 << (bitPosition + 1)) - 1;

        // Apply the current mask to all elements of arrayA and arrayB,
        // storing the results in the temporary arrays.
        for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
            tempArrA[elementIndex] = arrayA[elementIndex] & currentMask;
            tempArrB[elementIndex] = arrayB[elementIndex] & currentMask;
        }

        // Sort the temporary array B. This is crucial for the findLowerBound function.
        tempArrB.sort((val1, val2) => val1 - val2);

        // Calculate the threshold value, which is 2 raised to the power of the current bit position.
        let thresholdVal = 1 << bitPosition;

        // Iterate through each element of the masked temporary array A.
        for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
            // Find the lower bounds for two specific ranges in tempArrB.
            // These ranges are derived from the problem's logic to determine if
            // (tempArrA[elementIndex] + tempArrB[j]) has the 'bitPosition'-th bit set.

            // First range: [thresholdVal - tempArrA[elementIndex], 2*thresholdVal - tempArrA[elementIndex])
            let floor1 = findLowerBound(tempArrB, thresholdVal - tempArrA[elementIndex]);
            let ceil1 = findLowerBound(tempArrB, (2 * thresholdVal) - tempArrA[elementIndex]);

            // Second range: [3*thresholdVal - tempArrA[elementIndex], 4*thresholdVal - tempArrA[elementIndex])
            let floor2 = findLowerBound(tempArrB, (3 * thresholdVal) - tempArrA[elementIndex]);
            let ceil2 = findLowerBound(tempArrB, (4 * thresholdVal) - tempArrA[elementIndex]);

            // Add the counts of elements found in these ranges to the parity counter.
            // We only care about the odd or even nature of the total count.
            parityCount += ceil1 - floor1;
            parityCount %= 2; // Ensure parityCount remains 0 or 1.

            parityCount += ceil2 - floor2;
            parityCount %= 2; // Ensure parityCount remains 0 or 1.
        }

        // If the final parity count for this bit position is 1 (odd),
        // it means the 'bitPosition'-th bit of the overall answer should be set.
        if (parityCount === 1) {
            finalResult |= (1 << bitPosition);
        }
    }

    // Output the final calculated result to the console.
    console.log(finalResult);
}

// A helper class designed to parse input data from a string,
// typically read from standard input.
class DataParser {
    // The constructor takes the raw input string.
    constructor(sourceText) {
        // Validate that a source text is provided.
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        // Initialize the current index for parsing and split the input
        // string into an array of individual items (numbers or strings).
        this.currentIndex = 0;
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    // Retrieves the next item from the parsed list and converts it to an integer.
    retrieveInt() {
        return this.parsedItems[this.currentIndex++] - 0; // Unary minus converts string to number.
    }

    // Retrieves an array of integers of a specified size.
    retrieveIntArray(size) {
        // Validate that a size is provided.
        if (typeof size === 'undefined') {
            throw new Error('Argument (size >= 1) cannot be omitted!');
        }
        let resultArray = new Array(size);
        // Populate the array by repeatedly calling retrieveInt.
        for (let loopCounter = 0; loopCounter < size; loopCounter++) {
            resultArray[loopCounter] = this.retrieveInt();
        }
        return resultArray;
    }

    // Retrieves the next item from the parsed list as a string.
    retrieveString() {
        return this.parsedItems[this.currentIndex++];
    }

    // Retrieves an array of strings of a specified size.
    retrieveStrArray(strSize) {
        // Validate that a size is provided.
        if (typeof strSize === 'undefined') {
            throw new Error('Argument (size >= 1) cannot be omitted!');
        }
        let stringArray = new Array(strSize);
        // Populate the array by repeatedly calling retrieveString.
        for (let strLoopCounter = 0; strLoopCounter < strSize; strLoopCounter++) {
            stringArray[strLoopCounter] = this.retrieveString();
        }
        return stringArray;
    }
}

// This block handles the execution environment. If the code is not running
// in a browser (i.e., 'window' is undefined), it assumes a Node.js environment
// and reads input from standard input, then calls the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
