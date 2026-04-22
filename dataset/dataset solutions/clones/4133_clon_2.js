/**
 * Processes a string of numerical inputs to calculate a specific sum.
 * This function identifies numbers within a generated sequence whose digit sums fall
 * within a specified range, and then sums those identified numbers.
 * @param {string} rawData - The raw input string containing space-separated numbers.
 */
function processInputData(rawData)
{
    // Split the incoming string by spaces to get an array of string values.
    var parsedValues = rawData.split(' ');

    // Convert the first three string values to integers, representing the upper limit,
    // and the minimum and maximum allowed digit sums, respectively.
    var upperLimit = Number.parseInt(parsedValues[0], 10);
    var minDigitSum = Number.parseInt(parsedValues[1], 10);
    var maxDigitSum = Number.parseInt(parsedValues[2], 10);

    // Initialize an array to store a sequence of numbers from 1 up to 'upperLimit'.
    var numberSequence = new Array(upperLimit);

    // Variable to accumulate digit sums during iteration.
    var currentDigitTotal = 0;

    // An array to store the indices of numbers from 'numberSequence'
    // that satisfy the digit sum criteria.
    var eligibleIndices = [];

    // Final sum accumulator for the numbers identified as eligible.
    var finalAccumulation = 0;

    // First loop: Populate 'numberSequence' with integers starting from 1.
    for (var idxCounter = 0; idxCounter < upperLimit; idxCounter++) {
        numberSequence[idxCounter] = idxCounter + 1;
    }

    // Second loop: Iterate through the generated number sequence.
    // For each number, calculate the sum of its digits and check if it falls
    // within the specified [minDigitSum, maxDigitSum] range.
    for (var elementIterator = 0; elementIterator < upperLimit; elementIterator++)
    {
        // Create a temporary copy of the current number to manipulate for digit sum calculation.
        let tempNumber = numberSequence[elementIterator];

        // Inner loop: Calculate the sum of digits for 'tempNumber'.
        while (tempNumber > 0) {
            currentDigitTotal += tempNumber % 10; // Add the last digit.
            tempNumber = Math.floor(tempNumber / 10); // Remove the last digit.
        }

        // Check if the calculated digit sum is within the acceptable range.
        if (minDigitSum <= currentDigitTotal && currentDigitTotal <= maxDigitSum)
        {
            // If it is, store the index of this number in 'eligibleIndices'.
            eligibleIndices.push(elementIterator);
        }

        // Reset the digit sum accumulator for the next number.
        currentDigitTotal = 0;
    }

    // Third loop: Sum up the actual numbers from 'numberSequence'
    // that correspond to the indices stored in 'eligibleIndices'.
    for (var indexWalker = 0; indexWalker < eligibleIndices.length; indexWalker++)
    {
        finalAccumulation += numberSequence[eligibleIndices[indexWalker]];
    }

    // Output the final accumulated sum to the console.
    console.log(finalAccumulation);
}

// Invoke the main processing function with input read from standard input.
// This uses Node.js's 'fs' module to synchronously read the entire file
// at '/dev/stdin' and decodes it as UTF-8.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));