var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); // Read input from standard input, remove leading/trailing whitespace
var dataRows = rawData.split('\n'); // Split the input into individual lines

let currentEntry; // Declare a variable to hold the current line being processed

// Loop through each line of input until no more lines are available
while (currentEntry = dataRows.shift()) {
    // Parse the current line: split by space, then convert each part to a number
    const dateComponents = currentEntry.split(' ').map(function(numStr) {
        return +numStr; // Convert string to number
    });

    let inputYear = dateComponents[0]; // Extract the year
    const inputMonth = dateComponents[1]; // Extract the month
    const inputDay = dateComponents[2]; // Extract the day

    let calculatedEra = ''; // Initialize the era string

    // Create a Date object for the input date (month is 0-indexed in JavaScript Date)
    const targetDate = new Date(inputYear, inputMonth - 1, inputDay);

    // Determine the Japanese era based on the target date
    if (targetDate < new Date(1868, 8, 8)) { // Before Meiji era start (Sept 8, 1868)
        calculatedEra = 'pre-meiji';
    } else if (targetDate < new Date(1912, 6, 30)) { // Meiji era (July 30, 1912)
        calculatedEra = 'meiji';
        inputYear -= 1867; // Calculate Meiji year
    } else if (targetDate < new Date(1926, 11, 25)) { // Taisho era (Dec 25, 1926)
        calculatedEra = 'taisho';
        inputYear -= 1911; // Calculate Taisho year
    } else if (targetDate < new Date(1989, 0, 8)) { // Showa era (Jan 8, 1989)
        calculatedEra = 'showa';
        inputYear -= 1925; // Calculate Showa year
    } else { // Heisei era (after Jan 8, 1989)
        calculatedEra = 'heisei';
        inputYear -= 1988; // Calculate Heisei year
    }

    // Special handling for 'pre-meiji' output
    if (calculatedEra === 'pre-meiji') {
        console.log('pre-meiji');
        continue; // Move to the next line of input
    }

    // Output the calculated era and adjusted date components
    console.log(calculatedEra, inputYear, inputMonth, inputDay);
}
