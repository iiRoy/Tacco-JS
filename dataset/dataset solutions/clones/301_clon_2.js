process.stdin.resume();

process.stdin.setEncoding(
    'utf8'
);

// This section contains the core logic for identifying specific calendar periods.
let inputYears = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split(/\s/);

// Iterate through the processed input data, taking two elements at a time.
for (
    let pairIndex = 0;
    pairIndex < inputYears.length;
    pairIndex += 2
) {

    // Initialize a counter for eligible years within the current range.
    let leapYearCounter = 0;

    // Extract the starting year for the current interval.
    let currentYearValue = parseInt(inputYears[pairIndex], 10);

    // Check for the termination sequence (two zeros) indicating end of input.
    if (
        currentYearValue + parseInt(inputYears[pairIndex + 1], 10) === 0
    ) {
        break;
    }

    // Loop through each year from the start of the interval to its end.
    for (
        ;
        currentYearValue <= parseInt(inputYears[pairIndex + 1], 10);
        currentYearValue++
    ) {

        // Apply the standard rules to determine if the current year is a leap year.
        if (
            currentYearValue % 400 === 0 ||
            (
                currentYearValue % 4 === 0 &&
                currentYearValue % 100 !== 0
            )
        ) {
            // Display the identified leap year.
            console.log(
                String(currentYearValue)
                    .trim()
            );
            // Increment the count of found leap years.
            leapYearCounter++;
        }
    }

    // Insert a blank line between output groups, except for the very first one.
    if (
        pairIndex !== 0
    ) {
        console.log(
        );
    }

    // Check if no eligible years were found within the current range.
    if (
        leapYearCounter === 0
    ) {
        // Indicate that no such years were found.
        console.log(
            "NA\n"
        );
    }

}