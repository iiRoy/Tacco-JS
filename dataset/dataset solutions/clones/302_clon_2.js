function checkGregorianLeap(gregorianYear) {
    // Determine if the provided year is a leap year according to Gregorian calendar rules.
    if (gregorianYear % 400 === 0) {
        return true; // Divisible by 400, so it's a leap year.
    } else if (gregorianYear % 100 === 0) {
        return false; // Divisible by 100 but not by 400, so not a leap year.
    } else if (gregorianYear % 4 === 0) {
        return true; // Divisible by 4 but not by 100, so it's a leap year.
    } else {
        return false; // Not divisible by 4, so not a leap year.
    }
}

// Read the entire standard input synchronously.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines.
var inputLines = fileContent.split('\n');

// Initialize a string to accumulate all processed output.
var finalOutputString = '';

// Process input lines until a termination condition is met.
while (true) {
    // Get the next line and split it by space to extract year range.
    var yearRangeParts = inputLines.shift().split(' ');

    // Convert the string parts to numbers for start and end years.
    var startYear = +yearRangeParts[0];
    var endYear = +yearRangeParts[1];

    // Check for the termination condition (both years are zero).
    if (startYear + endYear === 0) {
        break;
    }

    // Initialize a string to hold leap years for the current range.
    var currentBlockOutput = '';

    // Iterate through the years in the current range.
    for (var currentYear = startYear; currentYear <= endYear; currentYear++) {
        // If the current year is a leap year, append it to the block output.
        if (checkGregorianLeap(currentYear)) {
            currentBlockOutput += currentYear + '\n';
        }
    }

    // If no leap years were found in the range, append "NA".
    if (currentBlockOutput.length === 0) {
        currentBlockOutput += 'NA\n';
    }

    // Append the current block's output to the overall final string, followed by an extra newline.
    finalOutputString += currentBlockOutput + '\n';
}

// Remove the last two characters (which would be an extra newline from the last block).
finalOutputString = finalOutputString.substr(0, finalOutputString.length - 2);

// Print the final accumulated string to the console.
console.log(finalOutputString);
