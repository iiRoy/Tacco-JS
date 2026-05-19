const STD_IN_FILE_PATH = '/dev/stdin';

const fileContent = require('fs').readFileSync(STD_IN_FILE_PATH, 'utf8').trim();
const inputDataLines = fileContent.split('\n');

/**
 * Calculates the sum of numeric digits in a given string.
 * @param {string} digitSequence - The string containing digits.
 * @returns {number} The sum of the digits.
 */
const computeDigitSum = (digitSequence) => {
    // Convert the string to an array of characters, then reduce by summing their numeric values.
    return Array.from(digitSequence).reduce((currentSum, charDigit) => {
        return currentSum + Number(charDigit);
    }, 0); // Initialize sum to 0
};

let currentInputLine;
// Process each line from the input data until no more lines are available.
while ((currentInputLine = inputDataLines.shift()) !== undefined) {
    // Split the current line into its constituent parts based on space.
    const lineSegments = currentInputLine.split(' ');

    // Parse the numeric values from the segments.
    const dividendValue = Number(lineSegments[0]);
    const divisorValue = Number(lineSegments[1]);
    const desiredPrecision = Number(lineSegments[2]);

    // Perform the division.
    const divisionResult = dividendValue / divisorValue;

    // Format the division result to (desiredPrecision + 1) decimal places.
    // The extra digit is to ensure the 'n'th digit is correctly captured before truncation.
    const formattedResultString = divisionResult.toFixed(desiredPrecision + 1);

    // Find the index of the decimal point in the formatted string.
    const decimalPointIndex = formattedResultString.indexOf('.');

    // Extract the decimal part, specifically the first 'desiredPrecision' digits after the point.
    // The original logic effectively truncates the last digit from toFixed(n+1),
    // which means it takes 'n' digits.
    // The end index for substring is (decimalPointIndex + 1) + desiredPrecision.
    const extractedDecimalDigits = formattedResultString.substring(
        decimalPointIndex + 1,
        decimalPointIndex + 1 + desiredPrecision
    );

    // Calculate the sum of the extracted decimal digits using the helper function.
    const totalDigitSum = computeDigitSum(extractedDecimalDigits);

    // Output the calculated sum.
    console.log(totalDigitSum);
}
