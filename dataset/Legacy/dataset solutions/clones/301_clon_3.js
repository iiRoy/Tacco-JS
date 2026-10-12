process.stdin.resume();
process.stdin.setEncoding('utf8');

const standardInputFilePath = '/dev/stdin';
let inputSegments = require('fs').readFileSync(standardInputFilePath, 'utf8').trim().split(/\s/);

/**
 * Determines if a given year is a leap year.
 * @param {number} yearCandidate - The year to check.
 * @returns {boolean} True if the year is a leap year, false otherwise.
 */
function isLeapYear(yearCandidate) {
    const isDivisibleBy400 = (yearCandidate % 400 === 0);
    const isDivisibleBy4ButNot100 = (yearCandidate % 4 === 0 && yearCandidate % 100 !== 0);
    return isDivisibleBy400 || isDivisibleBy4ButNot100;
}

let isFirstDataSetProcessed = true; // Flag to manage newline printing between data sets

for (let segmentIndex = 0; segmentIndex < inputSegments.length; segmentIndex += 2) {
    const startYearString = inputSegments[segmentIndex];
    const endYearString = inputSegments[segmentIndex + 1];

    const startYearValue = parseInt(startYearString, 10);
    const endYearValue = parseInt(endYearString, 10);

    // Termination condition: 0 0
    if (startYearValue === 0 && endYearValue === 0) {
        break;
    }

    // Print a newline before processing subsequent data sets, but not the very first one.
    // This replicates the original's `if(i!=0||i==x.length-1)console.log();` behavior.
    if (!isFirstDataSetProcessed) {
        console.log();
    }
    isFirstDataSetProcessed = false; // Mark that at least one data set has been processed

    let foundLeapYearsCount = 0;
    let currentYearIterator = startYearValue;

    while (currentYearIterator <= endYearValue) {
        if (isLeapYear(currentYearIterator)) {
            console.log(String(currentYearIterator)); // .trim() is redundant for numbers
            foundLeapYearsCount++;
        }
        currentYearIterator++;
    }

    // If no leap years were found in the specified range
    if (foundLeapYearsCount === 0) {
        console.log("NA\n");
    }
}
