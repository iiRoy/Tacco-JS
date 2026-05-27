process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section processes input data to identify and list leap years within specified ranges.
let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

// Loop through the input data, processing pairs of years.
for (let idx = 0; idx < inputData.length; idx += 2) {
    let leapYearCount = 0; // Counter for leap years found in the current range.
    let currentYear = inputData[idx]; // The starting year for the current range (as a string).

    // Check for a specific termination condition: if the sum of the current and next value is zero.
    // Note: This uses string concatenation for '+' and then loose comparison '=='.
    if (currentYear + inputData[idx + 1] == 0) {
        break; // Exit the main processing loop.
    }

    // Iterate through each year from the start year to the end year (inclusive).
    // Important: The loop condition uses string comparison, replicating the original's behavior.
    // The 'currentYear++' operation implicitly converts 'currentYear' to a number.
    for (; currentYear <= inputData[idx + 1]; currentYear++) {
        // Apply the standard rules to determine if 'currentYear' is a leap year.
        // Modulo operations implicitly convert 'currentYear' to a number.
        if (currentYear % 400 == 0 || (currentYear % 4 == 0 && currentYear % 100 != 0)) {
            console.log(String(currentYear).trim()); // Output the identified leap year.
            leapYearCount++; // Increment the counter for leap years.
        }
    }

    // Print an empty line after each block of output, except for the very first one.
    if (idx !== 0) {
        console.log();
    }

    // If no leap years were found within the current range, output "NA".
    if (leapYearCount == 0) {
        console.log("NA\n");
    }
}
