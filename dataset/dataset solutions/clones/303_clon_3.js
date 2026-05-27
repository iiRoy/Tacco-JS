const fileSystemModule = require('fs');

// Helper function to determine if a given year is a leap year.
// A year is a leap year if it is divisible by 400,
// OR if it is divisible by 4 but not by 100.
const isLeapYear = (yearCandidate) => {
    const isDivisibleByFourHundred = yearCandidate % 400 === 0;
    const isDivisibleByFour = yearCandidate % 4 === 0;
    const isDivisibleByOneHundred = yearCandidate % 100 === 0;

    return isDivisibleByFourHundred || (isDivisibleByFour && !isDivisibleByOneHundred);
};

// Read the entire content from standard input,
// decode it as UTF-8, remove leading/trailing whitespace,
// and then split it into an array of string tokens using any whitespace as a delimiter.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputTokens = rawInputContent.trim().split(/\s/);

const totalTokenCount = processedInputTokens.length;

// Iterate through the array of input tokens, processing two tokens at a time:
// the first token represents the starting year, and the second represents the ending year.
for (let tokenIndex = 0; tokenIndex < totalTokenCount; tokenIndex += 2) {
    let currentLeapYearCount = 0;

    // Extract and parse the starting year from the current token.
    const startYearString = processedInputTokens[tokenIndex];
    const startYearValue = parseInt(startYearString, 10); // Ensure base 10 parsing.

    // If the parsed starting year is 0, it signals the end of the input data,
    // so terminate the processing loop.
    if (startYearValue === 0) {
        break;
    }

    // Extract and parse the ending year from the next token in the sequence.
    const endYearString = processedInputTokens[tokenIndex + 1];
    const endYearValue = parseInt(endYearString, 10); // Ensure base 10 parsing.

    // Loop through each year from the start year to the end year (inclusive).
    for (let yearIterator = startYearValue; yearIterator <= endYearValue; yearIterator++) {
        // Check if the current year in the iteration is a leap year using our helper function.
        if (isLeapYear(yearIterator)) {
            console.log(yearIterator); // If it's a leap year, print it to standard output.
            currentLeapYearCount++;    // Increment the counter for leap years found in this range.
        }
    }

    // After checking all years in the current range, if no leap years were found,
    // print "NA" to indicate no applicable years.
    if (currentLeapYearCount === 0) {
        console.log("NA");
    }
    
    // Print an empty line to standard output, separating the output for different year ranges.
    console.log();
}
