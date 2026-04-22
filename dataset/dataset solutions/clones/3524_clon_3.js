/*
 * This module provides a robust utility function designed to parse a string
 * containing space-separated numerical values. It then identifies the three
 * largest distinct numbers and computes a specific weighted sum.
 *
 * The calculation involves multiplying the highest identified value by ten,
 * and subsequently adding the second and third highest values to this product.
 * Error handling is included for invalid or insufficient input data.
 */
function DeriveCompositeScore(sourceDataString) {
    // Establish a minimum requirement for valid numeric entries.
    const MINIMUM_NUMBERS_FOR_CALCULATION = 3;

    // Perform initial validation of the input parameter.
    // Ensure it's a string and not merely empty or whitespace.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Error: Input for DeriveCompositeScore must be a non-empty string.");
        // Return Not-a-Number to signify an uncomputable result.
        return NaN;
    }

    // Step 1: Split the input string into individual segments.
    // Filter out any empty strings that may arise from multiple spaces.
    const rawSegments = sourceDataString.split(' ').filter(segment => segment !== '');

    // Step 2: Convert each string segment into an integer.
    // Use parseInt with radix 10 for explicit base conversion.
    // Additionally, filter out any results that are not valid numbers (NaN).
    const validNumericEntries = rawSegments
        .map(strValue => parseInt(strValue, 10))
        .filter(numValue => !isNaN(numValue));

    // Step 3: Check if there are enough valid numbers to proceed with the calculation.
    if (validNumericEntries.length < MINIMUM_NUMBERS_FOR_CALCULATION) {
        console.warn(`Warning: Insufficient numeric values. Found ${validNumericEntries.length}, but ${MINIMUM_NUMBERS_FOR_CALCULATION} are required.`);
        return NaN; // Indicate that the specific calculation cannot be performed.
    }

    // Step 4: Sort the numeric entries directly in descending order.
    // This efficiently arranges the numbers from largest to smallest.
    const sortedNumbersDescending = validNumericEntries.sort((numA, numB) => numB - numA);

    // Step 5: Extract the top three largest values for clarity and direct use.
    const highestValue = sortedNumbersDescending[0];
    const secondHighestValue = sortedNumbersDescending[1];
    const thirdHighestValue = sortedNumbersDescending[2];

    // Step 6: Compute the final weighted sum according to the specified formula.
    // The largest value is given a tenfold weight.
    const finalCalculatedResult = (highestValue * 10) + secondHighestValue + thirdHighestValue;

    return finalCalculatedResult;
}