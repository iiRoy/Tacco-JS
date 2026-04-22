const fileSystemModule = require('fs');

// A specialized utility function to calculate the difference between the largest
// and smallest numbers that can be formed from a given string of digits.
const computeNumericDifference = (digitSequence) => {
    // Perform initial validation on the input string.
    // It must be a non-empty string composed solely of digits.
    if (typeof digitSequence !== 'string' || digitSequence.length === 0 || !/^\d+$/.test(digitSequence)) {
        // For invalid input, return null to signify that a valid computation
        // could not be performed for this specific sequence.
        return null;
    }

    // Transform the digit string into an array of individual numbers.
    // Using `Array.from` with a mapping function offers a clear conversion.
    const numericDigitsArray = Array.from(digitSequence, character => parseInt(character, 10));

    // To construct the largest possible number, sort the digits in descending order.
    // Create a new array using the spread operator (`...`) to avoid modifying
    // the original `numericDigitsArray` during the sort operation.
    const sortedDescendingDigits = [...numericDigitsArray].sort((valueA, valueB) => valueB - valueA);
    const constructedMaximumString = sortedDescendingDigits.join('');

    // To construct the smallest possible number, sort the digits in ascending order.
    // Again, operate on a fresh copy of the array.
    const sortedAscendingDigits = [...numericDigitsArray].sort((valueA, valueB) => valueA - valueB);
    const constructedMinimumString = sortedAscendingDigits.join('');

    // Convert the string representations of the numbers back into actual numeric types.
    // The unary plus operator (`+`) is a concise method for string-to-number conversion.
    const parsedMaximumValue = +constructedMaximumString;
    const parsedMinimumValue = +constructedMinimumString;

    // Return the final computed difference.
    return parsedMaximumValue - parsedMinimumValue;
};

// Begin by reading all the raw content from the standard input stream.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any trailing whitespace and then
// split the content into an array of individual lines.
// Filter out any lines that might become empty after trimming or splitting.
const processedInputLines = rawInputContent.trimEnd().split('\n').filter(lineData => lineData.length > 0);

// The very first line of the input is expected to contain the total
// number of processing cycles or test cases that follow.
const iterationsCountString = processedInputLines.shift();
let totalProcessingIterations;

// Attempt to parse this count into an integer. Include basic error handling
// for cases where the input is not a valid non-negative number.
try {
    totalProcessingIterations = parseInt(iterationsCountString, 10);
    if (isNaN(totalProcessingIterations) || totalProcessingIterations < 0) {
        console.error("Initialization error: The initial count of test cases was invalid or missing.");
        // If the fundamental loop count is compromised, it's best to exit.
        process.exit(1);
    }
} catch (parsingError) {
    console.error("Critical error encountered while parsing the iteration count:", parsingError.message);
    process.exit(1);
}

// Iterate through each of the specified test cases.
for (let currentCycleIndex = 0; currentCycleIndex < totalProcessingIterations; currentCycleIndex++) {
    // Retrieve the line containing the digit sequence for the current test case.
    const currentDigitSequenceLine = processedInputLines[currentCycleIndex];

    // Invoke our dedicated helper function to perform the calculation.
    const calculationOutcome = computeNumericDifference(currentDigitSequenceLine);

    // If the helper function successfully computed a result (i.e., didn't return null),
    // then print this result to the console.
    // If it returned null, it means the input for this line was invalid,
    // and we simply skip printing anything for it, aligning with the original's
    // implicit handling of potentially malformed input.
    if (calculationOutcome !== null) {
        console.log(calculationOutcome);
    }
}