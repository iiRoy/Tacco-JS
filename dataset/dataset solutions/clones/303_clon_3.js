const fileSystemModule = require('fs'); // Import the Node.js file system module for input operations.

// Define a constant for the standard input file path.
// This path is typical for reading standard input in Unix-like environments.
const standardInputPath = '/dev/stdin';

/**
 * Determines if a given year is a Gregorian leap year.
 * A year is considered a leap year if it meets the following criteria:
 * 1. It is perfectly divisible by 400.
 * OR
 * 2. It is perfectly divisible by 4 AND NOT perfectly divisible by 100.
 *
 * @param {number} yearCandidate The integer year to evaluate for leap year status.
 * @returns {boolean} True if the year is a Gregorian leap year, false otherwise.
 */
function isGregorianLeapYear(yearCandidate) {
    // Basic validation: ensure the input is a valid number and non-negative.
    // While the problem context implies valid year inputs, this adds robustness.
    if (typeof yearCandidate !== 'number' || isNaN(yearCandidate) || yearCandidate < 0) {
        // For the purpose of this problem, we assume valid positive year inputs.
        // In a more general utility, specific error handling or a different return
        // value (e.g., throwing an error) might be appropriate.
        return false;
    }

    // Apply the standard Gregorian calendar leap year rules.
    const isDivisibleBy400 = (yearCandidate % 400 === 0);
    const isDivisibleBy4AndNotBy100 = (yearCandidate % 4 === 0 && yearCandidate % 100 !== 0);

    return isDivisibleBy400 || isDivisibleBy4AndNotBy100;
}

// Read all incoming data from standard input synchronously.
// - Decode the buffer as UTF-8 text.
// - Remove any leading or trailing whitespace (like newlines at the end).
// - Split the string into an array of individual strings using one or more
//   whitespace characters as delimiters. This handles multiple spaces/tabs.
const rawInputStrings = fileSystemModule
    .readFileSync(standardInputPath, 'utf8')
    .trim()
    .split(/\s+/); // Splits by one or more whitespace characters

// This array will accumulate all output lines before they are printed
// as a single block at the very end of the script execution.
const outputCollector = [];

// Initialize an index to traverse the `rawInputStrings` array.
// This pointer will advance by two positions for each processed year range.
let currentInputPointer = 0;

// The main processing loop iterates through the input data,
// handling pairs of years [startYear, endYear].
// The loop continues as long as there are at least two elements remaining
// in the `rawInputStrings` array to form a complete year range.
while (currentInputPointer < rawInputStrings.length - 1) {
    // Extract the string representation of the starting year for the current range.
    const startYearString = rawInputStrings[currentInputPointer];
    // Convert the start year string to an integer. Explicitly specify radix 10.
    const rangeStartYear = parseInt(startYearString, 10);

    // A starting year of 0 acts as a termination signal for the input processing.
    if (rangeStartYear === 0) {
        // If 0 is encountered, break out of the processing loop.
        break;
    }

    // Extract and parse the string representation of the ending year for the current range.
    const endYearString = rawInputStrings[currentInputPointer + 1];
    const rangeEndYear = parseInt(endYearString, 10);

    // Robustness check: Validate if the parsed years are actual numbers.
    // If either `rangeStartYear` or `rangeEndYear` is `NaN` (Not a Number),
    // it indicates malformed input. In such cases, we log a warning and skip
    // this particular year pair to continue processing subsequent valid data.
    if (isNaN(rangeStartYear) || isNaN(rangeEndYear)) {
        console.error(`Warning: Malformed year range detected: [${startYearString}, ${endYearString}]. Skipping this pair.`);
        // Advance the pointer to skip the invalid pair.
        currentInputPointer += 2;
        // Continue to the next iteration of the while loop.
        continue;
    }

    // Initialize a counter to keep track of how many leap years are found
    // within the currently processed year range.
    let leapYearsFoundInCurrentRange = 0;

    // Iterate sequentially through each year from the `rangeStartYear`
    // up to and including the `rangeEndYear`.
    for (let yearIterator = rangeStartYear; yearIterator <= rangeEndYear; yearIterator++) {
        // Use the helper function to determine if the current year is a leap year.
        if (isGregorianLeapYear(yearIterator)) {
            // If it is a leap year, convert it to a string and add it to our output collection.
            outputCollector.push(yearIterator.toString());
            // Increment the counter for found leap years.
            leapYearsFoundInCurrentRange++;
        }
    }

    // After iterating through the entire range, check if any leap years were found.
    if (leapYearsFoundInCurrentRange === 0) {
        // If no leap years were identified in the range, add "NA" to the output.
        outputCollector.push("NA");
    }

    // Add an empty string to the output collection. This will result in a blank line
    // in the final output, serving as a separator between the results of different
    // year ranges, mirroring the original script's behavior.
    outputCollector.push("");

    // Move the input pointer forward by two positions to process the next year range.
    currentInputPointer += 2;
}

// After the main loop has finished processing all available year ranges,
// join all collected output lines with newline characters and print the
// entire result to standard output.
// The original code printed an empty line after each block, including the last one,
// so no special handling is needed here to remove a trailing empty line.
console.log(outputCollector.join('\n'));