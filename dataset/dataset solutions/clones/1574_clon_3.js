// Helper utility to compute the sum of numerical digits from a given string representation.
// It handles potential non-digit characters by treating them as zero, maintaining numeric summation.
function calculateDigitSum(digitSourceString) {
    // If the input string is null, undefined, or empty, its digit sum is considered zero.
    if (!digitSourceString || digitSourceString.length === 0) {
        return 0;
    }

    // Convert the string into an array of individual character digits.
    // Then, map each character to its corresponding numerical value.
    // Non-numeric characters encountered during parsing will default to 0 for the sum.
    const convertedNumbersList = Array.from(digitSourceString).map(charElement => {
        const numericalRepresentation = Number(charElement); // Convert character to number
        // Guard against non-numeric characters; treat them as 0 to continue summation.
        return isNaN(numericalRepresentation) ? 0 : numericalRepresentation;
    });

    // Accumulate all the numerical values to get the total sum.
    const aggregatedTotal = convertedNumbersList.reduce((currentAccumulator, currentNumericValue) => {
        return currentAccumulator + currentNumericValue;
    }, 0); // Start accumulation from zero.

    return aggregatedTotal;
}

// Main orchestrator function responsible for processing the raw input data.
// It extracts the relevant digit sequence, calculates its sum, and determines divisibility.
function processInputData(sourceDataString) {
    // Define a constant for the divisibility check, enhancing readability and maintainability.
    const DIVISIBILITY_THRESHOLD = 9;

    // Pre-process the input string:
    // 1. Trim any leading or trailing whitespace.
    // 2. Split the string into an array of lines.
    const parsedInputLines = sourceDataString.trim().split('\n');

    // Focus on the first line of input, which is expected to contain the sequence of digits.
    // If the first line is empty or doesn't exist, an empty string is used as a fallback.
    const primaryDigitSequence = parsedInputLines[0] || '';

    // Utilize the helper function to compute the sum of all digits in the primary sequence.
    const finalSumOfDigits = calculateDigitSum(primaryDigitSequence);

    // Evaluate if the calculated sum is perfectly divisible by the predefined threshold.
    const isSumPerfectlyDivisible = (finalSumOfDigits % DIVISIBILITY_THRESHOLD === 0);

    // Construct the final output message based on the divisibility check.
    const outputMessage = isSumPerfectlyDivisible ? "Yes" : "No";

    // Print the determined outcome to the console.
    console.log(outputMessage);
}

// Entry point of the program:
// Reads the content of standard input synchronously, using UTF-8 encoding,
// and then passes this content to the main processing routine.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));