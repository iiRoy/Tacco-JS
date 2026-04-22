const fileSystemModule = require('fs');

// Define the standard input path, common in competitive programming environments.
const standardInputSource = '/dev/stdin';

// Read all raw data from standard input, decode it as UTF-8,
// remove any leading/trailing whitespace, and then split it into an array of individual lines.
const inputLineBuffer = fileSystemModule.readFileSync(standardInputSource, 'utf8').trim().split('\n');

// A control flag to manage the execution of the primary processing loop.
let shouldProceedWithNextDataset = true;

// The main loop that iterates through multiple datasets provided in the input.
while (shouldProceedWithNextDataset) {
    // Extract the next line from our input buffer.
    // If the buffer is exhausted, `shift()` will return `undefined`.
    const currentParameterLine = inputLineBuffer.shift();

    // Implement a robust check for the end of input or malformed empty lines.
    // This serves as an additional safeguard beyond the explicit '0 0' sentinel.
    if (!currentParameterLine || currentParameterLine.trim() === '') {
        // No more valid lines to process, or an unexpected empty line.
        break;
    }

    // Parse the first line of the current dataset, which contains two space-separated numbers:
    // the count of subsequent numbers and the maximum allowable sum.
    // Using destructuring for clear assignment.
    const [datasetSize, maximumPermittedSum] = currentParameterLine.split(' ').map(Number);

    // Check for the specific termination condition (0 0), as defined by the problem.
    if (datasetSize === 0 && maximumPermittedSum === 0) {
        shouldProceedWithNextDataset = false; // Update flag to terminate the loop.
        break; // Exit the loop immediately.
    }

    // Initialize an array to store the numerical values specific to this dataset.
    const numbersForProcessing = [];

    // Populate the `numbersForProcessing` array by reading `datasetSize` lines from the input.
    for (let lineIndex = 0; lineIndex < datasetSize; lineIndex++) {
        // A critical guard clause to handle cases where there aren't enough data lines
        // as declared by `datasetSize`. This prevents errors from `shift()` on an empty array.
        if (inputLineBuffer.length === 0) {
             console.error("Data integrity warning: Insufficient data lines for declared dataset size.");
             shouldProceedWithNextDataset = false; // Mark for termination due to malformed input.
             break; // Exit the inner loop.
        }
        // Convert the string line to a number using the unary plus operator and add it to the array.
        numbersForProcessing.push(+inputLineBuffer.shift());
    }

    // If an error (insufficient data) was detected in the previous loop,
    // ensure the outer loop also terminates.
    if (!shouldProceedWithNextDataset) {
        break;
    }

    // According to the problem's logic, a zero must be included in the set of numbers
    // to allow for combinations involving zero.
    numbersForProcessing.push(0);

    // Create an array to hold all valid sums of pairs from `numbersForProcessing`.
    const collectionOfPossibleSums = [];

    // Iterate through `numbersForProcessing` to generate all unique pairs (including self-pairing).
    // Calculate the sum of each pair and add it to `collectionOfPossibleSums` if it's within the limit.
    for (let elementIdxA = 0; elementIdxA < numbersForProcessing.length; elementIdxA++) {
        for (let elementIdxB = elementIdxA; elementIdxB < numbersForProcessing.length; elementIdxB++) {
            const currentPairTotal = numbersForProcessing[elementIdxA] + numbersForProcessing[elementIdxB];

            // Only sums that do not exceed `maximumPermittedSum` are considered valid.
            if (currentPairTotal <= maximumPermittedSum) {
                collectionOfPossibleSums.push(currentPairTotal);
            }
        }
    }

    // Sort the generated `collectionOfPossibleSums` in ascending numerical order.
    // An arrow function provides a concise sorting callback.
    collectionOfPossibleSums.sort((valueOne, valueTwo) => valueOne - valueTwo);

    // Initialize the variable to store the highest valid sum found for this dataset.
    let ultimateResultSum = 0;

    // Employ a two-pointer technique to efficiently find the largest sum of two elements
    // from `collectionOfPossibleSums` that is less than or equal to `maximumPermittedSum`.
    let rightSearchPointer = collectionOfPossibleSums.length - 1;

    // The left pointer iterates from the start of the sorted sums.
    for (let leftSearchPointer = 0; leftSearchPointer < collectionOfPossibleSums.length; leftSearchPointer++) {
        // While the current sum formed by the two pointers exceeds the limit,
        // move the right pointer inwards to find a smaller sum.
        // The condition `leftSearchPointer <= rightSearchPointer` ensures pointers don't cross invalidly.
        while (leftSearchPointer <= rightSearchPointer &&
               collectionOfPossibleSums[leftSearchPointer] + collectionOfPossibleSums[rightSearchPointer] > maximumPermittedSum) {
            rightSearchPointer--;
        }

        // If the left pointer has surpassed the right pointer, it means no more valid pairs
        // can be formed with the current `leftSearchPointer` or any subsequent ones.
        if (leftSearchPointer > rightSearchPointer) {
            break; // Exit the loop.
        }

        // If a valid pair is found, update `ultimateResultSum` if the current sum is greater.
        ultimateResultSum = Math.max(ultimateResultSum,
                                     collectionOfPossibleSums[leftSearchPointer] + collectionOfPossibleSums[rightSearchPointer]);
    }

    // Output the final calculated maximum attainable sum for the current dataset.
    console.log(ultimateResultSum);
}