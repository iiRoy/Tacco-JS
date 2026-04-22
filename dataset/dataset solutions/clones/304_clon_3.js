/**
 * Assesses whether a given calendar year qualifies as a leap year
 * according to the Gregorian calendar rules.
 *
 * The standard rules for a Gregorian leap year are:
 * 1. A year is a leap year if it is perfectly divisible by 4.
 * 2. However, if the year is also perfectly divisible by 100, it is NOT a leap year...
 * 3. ...UNLESS it is also perfectly divisible by 400, in which case it IS a leap year.
 *
 * This function encapsulates these rules into a single logical expression.
 *
 * @param {number} currentYearValue The numerical representation of the year to be evaluated.
 * @returns {boolean} Returns 'true' if the year is a leap year, 'false' otherwise.
 */
function evaluateLeapStatus(currentYearValue) {
    // Intermediate boolean variables are used to enhance readability
    // and explicitly represent each condition of the leap year rule.
    const isDivisibleBy4 = (currentYearValue % 4 === 0);
    const isDivisibleBy100 = (currentYearValue % 100 === 0);
    const isDivisibleBy400 = (currentYearValue % 400 === 0);

    // The combined logical expression for leap year determination:
    // (Divisible by 4 AND NOT divisible by 100) OR (Divisible by 400)
    // This covers all three rules effectively.
    return (isDivisibleBy4 && !isDivisibleBy100) || isDivisibleBy400;
}

// Acquire raw input data from the standard input stream.
// The 'fs' module is utilized for file system operations, and '/dev/stdin'
// is the conventional path for reading standard input in Unix-like systems.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. Trim any leading or trailing whitespace from the entire input.
// 2. Split the cleaned input string into an array of individual lines,
//    where each element represents a distinct line from the original input.
const processedInputLines = rawInputContent.trim().split('\n');

// A boolean flag to control the printing of empty lines for output separation.
// It ensures that an empty line is printed only *between* sets of results,
// not before the very first output block or after the last one.
let needsOutputSeparator = false;

// Commence iteration through each line of the processed input data array.
// The loop continues as long as there are lines to process.
for (let currentLineIndex = 0; currentLineIndex < processedInputLines.length; currentLineIndex++) {
    // Retrieve the current line and trim any specific leading/trailing whitespace
    // that might be present on that individual line.
    const currentDataLine = processedInputLines[currentLineIndex].trim();

    // Check for the designated termination signal ("0 0").
    // If this specific string is encountered, it signifies the end of input,
    // and the processing loop is immediately exited.
    if (currentDataLine === "0 0") {
        break;
    }

    // If the 'needsOutputSeparator' flag is true, it means a previous block of
    // output has been printed, and an empty line is now required for visual separation
    // before the results of the current input line are displayed.
    if (needsOutputSeparator) {
        console.log("");
    }

    // Split the current data line into its constituent parts based on a space delimiter.
    // This is expected to yield two string tokens representing the start and end years.
    const yearRangeTokens = currentDataLine.split(" ");

    // Parse the two string tokens into their numerical integer representations.
    // `parseInt()` with a radix of 10 is used for robust and explicit decimal conversion.
    const beginningYear = parseInt(yearRangeTokens[0], 10);
    const endingYear = parseInt(yearRangeTokens[1], 10);

    // Initialize an empty array to serve as a container for all leap years
    // that are identified within the current specified range.
    const detectedLeapYears = [];

    // Begin an iterative scan through the entire range of years,
    // starting from the 'beginningYear' and concluding with the 'endingYear' (inclusive).
    for (let yearUnderConsideration = beginningYear; yearUnderConsideration <= endingYear; yearUnderConsideration++) {
        // Invoke the 'evaluateLeapStatus' helper function to determine if the
        // 'yearUnderConsideration' is indeed a leap year.
        if (evaluateLeapStatus(yearUnderConsideration)) {
            // If the year is confirmed to be a leap year, add its value to our collection.
            detectedLeapYears.push(yearUnderConsideration);
        }
    }

    // After scanning the entire range, check the size of the 'detectedLeapYears' array.
    if (detectedLeapYears.length === 0) {
        // If the array is empty, it indicates that no leap years were found
        // within the specified range, so "NA" is printed to standard output.
        console.log("NA");
    } else {
        // If one or more leap years were detected, iterate over each found year
        // and print its value on a new line.
        detectedLeapYears.forEach(individualLeapYear => {
            console.log(individualLeapYear);
        });
    }

    // After successfully processing and outputting results for the current input line,
    // set the 'needsOutputSeparator' flag to true. This ensures that an empty line
    // will be printed before the next block of output, if any, maintaining separation.
    needsOutputSeparator = true;
}