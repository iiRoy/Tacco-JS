const fileSystemOperations = require('fs');

// Define the path for reading standard input.
const standardInputSourcePath = '/dev/stdin';

// Read the entire content of the standard input file.
// The data is expected to be a UTF-8 encoded string.
let rawInputContent = fileSystemOperations.readFileSync(standardInputSourcePath, 'utf8');

// Pre-process the raw input:
// 1. Remove any leading or trailing whitespace.
// 2. Split the content into an array of strings, with each string representing a line.
let availableInputLines = rawInputContent.trim().split('\n');

// This outer loop processes multiple distinct test cases or data blocks
// until a specific termination condition is encountered.
while (true) {
    // Attempt to retrieve and process the first line of the current data block.
    // This line typically contains metadata like dimensions.
    // Check if there are any lines left to process to prevent errors.
    if (availableInputLines.length === 0) {
        // If no more lines, it implies unexpected end of input or malformed data.
        break;
    }

    // Extract the first line, split it by spaces, and convert each part to an integer.
    // Example: "3 100" becomes an array [3, 100].
    const currentDimensions = availableInputLines.shift()
                                                .split(' ')
                                                .map(dimensionStr => parseInt(dimensionStr, 10));

    // Assign the extracted dimensions to descriptive variables.
    const numberOfInputValues = currentDimensions[0];
    const maximumAllowedSum = currentDimensions[1];

    // Check for the problem's specified termination condition:
    // If both N and M are zero, it signals the end of input blocks.
    if (numberOfInputValues === 0 && maximumAllowedSum === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize an array to store the numerical values for the current test case.
    let numericDataSet = [];

    // Populate the 'numericDataSet' with 'numberOfInputValues' values.
    // Each value is read from a new line in the input.
    for (let currentValIndex = 0; currentValIndex < numberOfInputValues; ++currentValIndex) {
        // Basic check to ensure we don't try to read past the end of available input.
        if (availableInputLines.length === 0) {
            // This scenario suggests the input is malformed (fewer numbers than declared).
            // In competitive programming, input is usually guaranteed to be valid.
            break;
        }
        numericDataSet.push(parseInt(availableInputLines.shift(), 10));
    }

    // Add a zero to the numeric data set. This is a common technique
    // to allow sums where one of the chosen numbers is effectively zero,
    // thereby making it possible to consider single numbers from the original input
    // as part of the pairwise sum calculation (e.g., value + 0 = value).
    numericDataSet.push(0);

    // Initialize an array to store all possible pairwise sums.
    let allPairwiseSums = [];

    // Generate all combinations of two numbers from 'numericDataSet' (including self-pairing).
    // The outer loop iterates from the first element.
    // The inner loop iterates from the current outer element's index to avoid duplicate pairs
    // (e.g., (A, B) is same as (B, A)) and ensure self-pairing (A, A).
    for (let firstElementIdx = 0; firstElementIdx < numericDataSet.length; ++firstElementIdx) {
        for (let secondElementIdx = firstElementIdx; secondElementIdx < numericDataSet.length; ++secondElementIdx) {
            const calculatedSum = numericDataSet[firstElementIdx] + numericDataSet[secondElementIdx];
            allPairwiseSums.push(calculatedSum);
        }
    }

    // Sort the array of all possible sums in ascending numerical order.
    // This is crucial for the efficient two-pointer approach used subsequently.
    allPairwiseSums.sort((sumA, sumB) => sumA - sumB);

    // Variable to hold the largest sum found that is less than or equal to 'maximumAllowedSum'.
    let bestSumFound = 0;

    // Implement a two-pointer strategy to find the 'bestSumFound'.
    // 'leftPtr' starts at the beginning of the sorted sums array.
    // 'rightPtr' starts at the end of the sorted sums array.
    let rightPtr = allPairwiseSums.length - 1;

    // Iterate 'leftPtr' from the start.
    for (let leftPtr = 0; leftPtr < allPairwiseSums.length; ++leftPtr) {
        // While the sum of elements at 'leftPtr' and 'rightPtr' exceeds 'maximumAllowedSum',
        // and 'rightPtr' has not gone past the beginning of the array,
        // move 'rightPtr' inwards (to the left) to find a smaller sum.
        // The condition `rightPtr > 0` ensures `rightPtr` stays a valid index for `allPairwiseSums[rightPtr]`.
        while (rightPtr > 0 && allPairwiseSums[leftPtr] + allPairwiseSums[rightPtr] > maximumAllowedSum) {
            rightPtr--;
        }

        // After the inner loop, 'rightPtr' points to the largest element such that
        // allPairwiseSums[leftPtr] + allPairwiseSums[rightPtr] is less than or equal to 'maximumAllowedSum'
        // (or 'rightPtr' is 0, and this is the smallest sum for 'leftPtr').

        // Check if the current sum combination is valid (i.e., within the limit).
        // It's possible for `rightPtr` to become `0` and even `allPairwiseSums[leftPtr] + allPairwiseSums[0]`
        // to still be greater than `maximumAllowedSum`. This check handles that.
        if (allPairwiseSums[leftPtr] + allPairwiseSums[rightPtr] <= maximumAllowedSum) {
            // Update 'bestSumFound' if the current valid sum is greater than the previously recorded best.
            bestSumFound = Math.max(bestSumFound, allPairwiseSums[leftPtr] + allPairwiseSums[rightPtr]);
        }
    }

    // Output the result for the current data block to standard output,
    // followed by a newline character for proper formatting.
    process.stdout.write(bestSumFound.toString() + '\n');
}

// The program concludes once all data blocks have been processed
// and the termination condition (N=0, M=0) has been met.