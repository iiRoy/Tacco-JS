function determineLeapYearStatus(yearCandidate) {
    const isDivisibleBy = (num, divisor) => num % divisor === 0;

    // A year is a leap year if it is divisible by 4
    // but not by 100, unless it is also divisible by 400.
    const isDivisibleBy4 = isDivisibleBy(yearCandidate, 4);
    const isDivisibleBy100 = isDivisibleBy(yearCandidate, 100);
    const isDivisibleBy400 = isDivisibleBy(yearCandidate, 400);

    if (!isDivisibleBy4) { // If not divisible by 4, it's not a leap year
        return false;
    }

    if (isDivisibleBy100) { // If divisible by 4 and by 100
        // It must also be divisible by 400 to be a leap year
        return isDivisibleBy400;
    }

    // If divisible by 4 but not by 100, it is a leap year
    return true;
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.trim().split("\n");

let outputBlockCounter = 0; // Tracks the number of processed input blocks

for (let currentLineIdx = 0; currentLineIdx < inputLinesArray.length; currentLineIdx++) {
    const currentLine = inputLinesArray[currentLineIdx];

    if (currentLine === "0 0") {
        break; // Terminate processing upon encountering the "0 0" sentinel
    }

    // Print an empty line between output blocks, but not before the very first block's output
    if (outputBlockCounter > 0) {
        console.log("");
    }
    outputBlockCounter++; // Increment the counter for the current block

    const yearRangeParts = currentLine.split(" ");
    // Explicitly convert string parts to numbers
    const rangeStartYear = Number(yearRangeParts[0]);
    const rangeEndYear = Number(yearRangeParts[1]);

    // Generate an array containing all years within the specified range (inclusive)
    const yearRangeLength = rangeEndYear - rangeStartYear + 1;
    const allYearsInCurrentRange = Array.from({ length: yearRangeLength }, (_, k) => rangeStartYear + k);

    // Filter the generated years to identify only the leap years using the helper function
    const foundLeapYears = allYearsInCurrentRange.filter(determineLeapYearStatus);

    // Output the results based on whether any leap years were found
    if (foundLeapYears.length === 0) {
        console.log("NA");
    } else {
        // Iterate through the array of found leap years and print each one on a new line
        foundLeapYears.forEach(singleLeapYear => console.log(singleLeapYear));
    }
}
