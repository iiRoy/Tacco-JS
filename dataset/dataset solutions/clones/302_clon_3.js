const determineLeapStatusForYear = (targetYear) => {
    // This helper function evaluates if a given year adheres to the Gregorian calendar leap year rules.
    // A year is a leap year if it is divisible by 4, unless it is divisible by 100 but not by 400.
    const isDivisibleByFour = (targetYear % 4 === 0);
    const isDivisibleByOneHundred = (targetYear % 100 === 0);
    const isDivisibleByFourHundred = (targetYear % 400 === 0);

    // The core logic for leap year determination.
    // It's a leap year if (divisible by 4 AND not by 100) OR (divisible by 400).
    const isIndeedLeap = (isDivisibleByFour && !isDivisibleByOneHundred) || isDivisibleByFourHundred;
    return isIndeedLeap;
};

// Define constants for input paths to improve readability and maintainability.
const STANDARD_INPUT_PATH = '/dev/stdin';
const FILE_SYSTEM_MODULE_NAME = 'fs';

// Acquire the file system module.
const fsModule = require(FILE_SYSTEM_MODULE_NAME);

// Read the entire content from the standard input as a UTF-8 string.
const rawInputData = fsModule.readFileSync(STANDARD_INPUT_PATH, 'utf8');

// Split the raw input into individual lines, representing year ranges.
// Filter out any potential empty lines that might result from extra newlines in the input.
const processedInputLines = rawInputData.split('\n').filter(line => line.trim() !== '');

// This array will accumulate all the output segments before final printing.
const accumulatedOutputSegments = [];

// Initialize an index to iterate through the processed input lines.
let lineIndex = 0;

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Retrieve the current line and advance the index for the next iteration.
    const currentInputLine = processedInputLines[lineIndex++];

    // Split the current line into its constituent year tokens (start and end).
    const currentYearRangeTokens = currentInputLine.split(' ');

    // Parse the start and end years from the tokens, ensuring they are integers.
    // Use parseInt with radix 10 for explicit base conversion.
    const startYearBoundary = parseInt(currentYearRangeTokens[0], 10);
    const endYearBoundary = parseInt(currentYearRangeTokens[1], 10);

    // Termination condition: if both start and end years are zero, exit the loop.
    // This indicates the end of input data.
    if (startYearBoundary === 0 && endYearBoundary === 0) {
        break;
    }

    // A temporary array to store all leap years found within the current range.
    const foundLeapYearsInCurrentSegment = [];
    let anyLeapYearFoundInSegment = false; // Flag to track if any leap year was found.

    // Iterate through each year within the specified range (inclusive).
    for (let yearPointer = startYearBoundary; yearPointer <= endYearBoundary; yearPointer++) {
        // Check if the current year is a leap year using our dedicated function.
        if (determineLeapStatusForYear(yearPointer)) {
            // If it's a leap year, add its string representation to our temporary list.
            foundLeapYearsInCurrentSegment.push(yearPointer.toString());
            anyLeapYearFoundInSegment = true; // Set flag to true.
        }
    }

    // If no leap years were found in the current range, add 'NA' as per requirements.
    if (!anyLeapYearFoundInSegment) {
        foundLeapYearsInCurrentSegment.push('NA');
    }

    // Join the collected leap years (or 'NA') for the current segment with newlines,
    // and add this formatted segment to our overall output accumulator.
    accumulatedOutputSegments.push(foundLeapYearsInCurrentSegment.join('\n'));
}

// Finally, join all the accumulated output segments with a single newline character
// to form the complete output string.
const finalOutputString = accumulatedOutputSegments.join('\n');

// Print the complete, formatted output to the console.
console.log(finalOutputString);