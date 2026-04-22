// This module provides a utility to process numerical streams from standard input.
// It interprets each input line as a set of three numerical parameters:
// a numerator, a denominator, and a desired number of decimal places (N).
// For each set of parameters, it computes the sum of the first N digits
// following the decimal point of the division result (numerator / denominator),
// adhering to standard JavaScript floating-point rounding rules during intermediate steps.

// Leverage the Node.js 'fs' (file system) core module for input operations.
const fileSystemAccess = require('fs');

// Define the source for input data, typically standard input in competitive programming contexts.
const inputSourceIdentifier = '/dev/stdin';
// Specify the character encoding for robust text processing.
const characterEncodingStandard = 'utf8';

/**
 * A utility function to safely convert a string representation into a numerical value.
 * It uses the Number constructor for explicit type coercion.
 * @param {string} stringValue The string to be converted.
 * @returns {number} The numerical representation of the string, or NaN if conversion fails.
 */
const convertToNumber = (stringValue) => Number(stringValue);

// --- Primary Data Processing Routine ---

// Read the complete content from the designated input source synchronously.
// The content is then trimmed to remove any extraneous leading or trailing whitespace.
let rawStreamContent = fileSystemAccess.readFileSync(inputSourceIdentifier, characterEncodingStandard).trim();

// Split the entire content into an array of individual text rows based on newline characters.
// An additional filter step ensures that any resulting empty strings (from consecutive newlines or trailing newline)
// are removed, focusing only on meaningful data rows.
const dataRowsCollection = rawStreamContent.split('\n').filter(entry => entry.length > 0);

// Declare a variable to hold the current row undergoing processing within the loop.
let activeDataRow;

// Initiate a loop to process each data row sequentially.
// The Array.prototype.shift() method is employed to extract and remove the first element
// from the dataRowsCollection array in each iteration, effectively consuming the input.
while ((activeDataRow = dataRowsCollection.shift()) !== undefined) {
    // Break down the current row into its constituent string segments using space as a delimiter.
    const numericalSegments = activeDataRow.split(' ');

    // Implement a guard clause: If the row does not contain the expected number of parameters (3),
    // skip to the next row to prevent errors.
    if (numericalSegments.length < 3) {
        continue;
    }

    // Convert the first three string segments into their respective numerical values.
    const inputNumerator = convertToNumber(numericalSegments[0]);
    const inputDenominator = convertToNumber(numericalSegments[1]);
    let targetDecimalCount = convertToNumber(numericalSegments[2]); // Using 'let' as it might be capped

    // Additional validation for parsed numerical inputs.
    // Skip processing if any input is not a valid number (NaN) or if the denominator is zero.
    if (isNaN(inputNumerator) || isNaN(inputDenominator) || isNaN(targetDecimalCount)) {
        continue;
    }
    if (inputDenominator === 0) {
        continue;
    }
    // Ensure the decimal count is not negative. If it is, treat it as zero.
    if (targetDecimalCount < 0) {
        targetDecimalCount = 0;
    }
    // Apply an upper bound to the decimal count to prevent excessive computation or string length.
    const maxAllowedPrecision = 100; // An arbitrary, reasonable limit.
    if (targetDecimalCount > maxAllowedPrecision) {
        targetDecimalCount = maxAllowedPrecision;
    }


    // Perform the division operation.
    const calculatedQuotient = inputNumerator / inputDenominator;

    // Determine the precision for the toFixed method.
    // The original logic used `n + 1` for `toFixed` and then trimmed the last digit.
    // This correctly captures the behavior of rounding the Nth digit based on the (N+1)th,
    // while still only considering the first N digits for summation.
    const effectiveFixedPrecision = targetDecimalCount + 1;

    // Convert the quotient to a string, formatted to the calculated precision.
    // This step handles the necessary rounding according to standard JavaScript rules.
    const formattedQuotientString = calculatedQuotient.toFixed(effectiveFixedPrecision);

    // Locate the index of the decimal point within the formatted string.
    const decimalPointLocation = formattedQuotientString.indexOf('.');

    // Variable to store the string representation of the fractional part (first N digits).
    let significantFractionalDigits = '';

    // Proceed only if a decimal point was found, which is expected with toFixed.
    if (decimalPointLocation !== -1) {
        // Calculate the end index for substring extraction.
        // The original code uses `str.length - 1`, which effectively removes the last digit
        // (the (N+1)th decimal digit) from the `toFixed(N+1)` result, leaving exactly N digits.
        const substringEndIndex = formattedQuotientString.length - 1;
        significantFractionalDigits = formattedQuotientString.substring(decimalPointLocation + 1, substringEndIndex);
    }
    // Note: If decimalPointLocation were -1 (e.g., if toFixed didn't add a decimal point,
    // which it always does for non-negative precision), significantFractionalDigits would remain empty.
    // This aligns with a scenario where no fractional part exists to sum.

    // Initialize an accumulator for the sum of individual digits.
    let sumOfExtractedDigits = 0;

    // Convert the string of fractional digits into an array of single-character strings.
    const individualDigitCharacters = significantFractionalDigits.split('');

    // Iterate through each character representing a digit.
    // A 'for...of' loop offers a clear and concise way to iterate over array elements.
    for (const digitCharacter of individualDigitCharacters) {
        // Convert the character digit back to a number (base 10) and add it to the running total.
        sumOfExtractedDigits += parseInt(digitCharacter, 10);
    }

    // Output the final computed sum of digits for the current input row.
    console.log(sumOfExtractedDigits);
}

// The script concludes after processing all available input rows.