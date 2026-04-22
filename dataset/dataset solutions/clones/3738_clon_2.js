'use strict'; // Enable strict mode for better error handling.

/*
 * This function computes a specific ratio for a given number.
 * It calculates the sum of its digits and then returns the number divided by that sum.
 *
 * @param {number} currentNumber - The integer for which to compute the ratio.
 * @returns {number} The ratio of the number to its sum of digits.
 */
function calculateDigitRatio(currentNumber) {
    let digitSum = 0; // Initialize a variable to accumulate the sum of digits.
    let tempNumber = currentNumber; // Use a temporary variable to avoid modifying the original number during calculation.

    while (tempNumber > 0) { // Continue as long as there are digits left to process.
        digitSum += tempNumber % 10; // Add the last digit to the sum.
        tempNumber = Math.floor(tempNumber / 10); // Remove the last digit by integer division.
    }

    return currentNumber / digitSum; // Return the final computed ratio.
}

/*
 * This is the primary function that processes input and generates a sequence of numbers.
 * It iteratively finds numbers that minimize the digit ratio calculated by 'calculateDigitRatio'.
 *
 * @param {string} rawData - The raw input string, typically read from stdin.
 * @returns {number} An exit code, typically 0 for success.
 */
function processInputData(rawData) {
    // Split the input string by newlines to get individual lines.
    rawData = rawData.split('\n');

    // Extract the first line and parse the first part as an integer.
    let firstLineParts = rawData[0].split(' ');
    let limitCount = Number.parseInt(firstLineParts[0], 10); // The number of iterations to perform.

    console.log(1); // The first number in the sequence is always 1.

    let baseValue = 2; // Initialize the starting base value for the sequence search.

    // Loop 'limitCount - 1' times to generate the remaining sequence numbers.
    for (let iterationIndex = 1; iterationIndex < limitCount; ++iterationIndex) {
        let bestCandidate = baseValue; // Initialize the best candidate for the current iteration.
        let modifiedValue = baseValue; // A mutable value used in the inner loop.

        // Calculate the digit ratio for the initial best candidate.
        let minRatio = calculateDigitRatio(bestCandidate);

        // Inner loop: explore variations of 'baseValue' by modifying individual digits.
        // The 'powerOfTen' variable represents 1, 10, 100, etc., to target specific digit places.
        for (let powerOfTen = 1; powerOfTen <= baseValue * 10; powerOfTen *= 10) {
            // This calculation attempts to find a number with a smaller digit sum ratio
            // by effectively replacing a digit with '9' at the current 'powerOfTen' position,
            // while preserving higher-order digits and zeroing out lower-order digits,
            // then adding '9' at the 'powerOfTen' position.
            // Example: if baseValue is 123 and powerOfTen is 10,
            // (baseValue / 10) % 10 is 2. (9 - 2) * 10 = 70.
            // (123 - (123 % 100)) + 70 + (10 - 1) = 100 + 70 + 9 = 179. (This logic is slightly different from original)
            // The original logic is: y = y + (9 - (y / d) % 10) * d
            // Let's re-implement the original logic with new names.
            // The target is to change the digit at 'powerOfTen' position to 9.
            // For example, if current number is 123, and powerOfTen is 10 (tens place),
            // (123 / 10) % 10 = 2. (9 - 2) * 10 = 70.
            // 123 + 70 = 193. This effectively changes the tens digit from 2 to 9.
            modifiedValue = baseValue + (9 - Math.floor((baseValue / powerOfTen)) % 10) * powerOfTen;

            // Calculate the digit ratio for the newly modified value.
            let currentRatio = calculateDigitRatio(modifiedValue);

            // If the new ratio is smaller, update the best candidate and minimum ratio.
            if (currentRatio < minRatio) {
                bestCandidate = modifiedValue;
                minRatio = currentRatio;
            }
        }

        console.log(bestCandidate); // Output the best candidate found for this iteration.
        baseValue = bestCandidate + 1; // Prepare the base value for the next iteration.
    }

    return 0; // Indicate successful execution.
}

// Read input synchronously from standard input and then process it.
processInputData(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);