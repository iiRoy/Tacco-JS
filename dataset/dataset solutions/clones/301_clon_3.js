process.stdin.resume();
process.stdin.setEncoding('utf8');

// Functional abstraction: Determines if a given year is a leap year according to the Gregorian calendar rules.
function isYearALeap(currentYearCandidate) {
    // A year is a leap year if it's perfectly divisible by 400.
    const isDivisibleBy400 = (currentYearCandidate % 400 === 0);
    // Alternatively, it's a leap year if it's divisible by 4 but not simultaneously divisible by 100.
    const isDivisibleBy4ButNot100 = (currentYearCandidate % 4 === 0 && currentYearCandidate % 100 !== 0);
    return isDivisibleBy400 || isDivisibleBy4ButNot100;
}

// Input handling: Read the entire standard input content as a single string.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Data preparation: Split the raw string into an array of year-component strings.
// Using `trim()` removes leading/trailing whitespace, and `split(/\s+/)` handles
// various whitespace patterns (spaces, tabs, newlines) and multiple delimiters gracefully.
const yearSegmentStrings = rawInputContent.trim().split(/\s+/);

// Iteration control: Loop through the `yearSegmentStrings` array, processing elements in pairs.
// `segmentIndex` will always point to the first element of a pair (representing a start year).
for (let segmentIndex = 0; segmentIndex < yearSegmentStrings.length; segmentIndex += 2) {
    // Defensive check: Ensure we have both a start and an end year for the current pair.
    // If an odd number of year components remain, the input is malformed for the last entry.
    // We choose to gracefully terminate processing if an incomplete pair is found at the end.
    if (segmentIndex + 1 >= yearSegmentStrings.length) {
        break;
    }

    // Extract string representations of the start and end years for the current interval.
    const startYearStringValue = yearSegmentStrings[segmentIndex];
    const endYearStringValue = yearSegmentStrings[segmentIndex + 1];

    // Convert string year values to integers for numerical operations.
    // Specifying radix 10 is good practice for `parseInt`.
    const parsedStartYear = parseInt(startYearStringValue, 10);
    const parsedEndYear = parseInt(endYearStringValue, 10);

    // Input validation: Check if `parseInt` operations resulted in valid numbers (not NaN).
    // If parsing fails for a pair, skip it and proceed to the next iteration.
    if (isNaN(parsedStartYear) || isNaN(parsedEndYear)) {
        continue;
    }

    // Termination condition: The input "0 0" acts as a sentinel to stop further processing.
    // The original code relied on JavaScript's type coercion ("00" == 0). This is explicit.
    if (parsedStartYear === 0 && parsedEndYear === 0) {
        break;
    }

    // --- Replicating the Original's Specific Newline Behavior ---
    // The original code's `if(i!=0||i==x.length-1)console.log();` statements,
    // one before the inner loop and one after, resulted in unique newline patterns:
    // - No leading/trailing newline for the *first* block of output.
    // - A single leading newline and a double trailing newline for *subsequent* blocks.

    // Logic for printing a newline *before* the current output block.
    // This ensures a newline precedes all blocks except the very first one.
    if (segmentIndex !== 0) {
        process.stdout.write('\n');
    }

    let foundLeapYearsInInterval = 0;
    // Use an array to temporarily store all found leap years for the current range.
    const collectedYearsForOutput = [];

    // Iterate through each year from the start year up to and including the end year of the current interval.
    for (let currentIteratedYear = parsedStartYear; currentIteratedYear <= parsedEndYear; currentIteratedYear++) {
        if (isYearALeap(currentIteratedYear)) {
            collectedYearsForOutput.push(String(currentIteratedYear)); // Store the year as a string.
            foundLeapYearsInInterval++;
        }
    }

    // Determine what to output for the current interval based on findings.
    if (foundLeapYearsInInterval > 0) {
        // If leap years were found, print each one on a new line.
        for (const yearToDisplay of collectedYearsForOutput) {
            console.log(yearToDisplay);
        }
    } else {
        // If no leap years were found in the specified interval, print "NA".
        // Note: The original `console.log("NA\n")` prints "NA" followed by two newlines.
        console.log("NA");
    }

    // Logic for printing a newline *after* the current output block.
    // This, combined with the "NA" newline and the leading newline,
    // accurately reproduces the original's specific output formatting.
    if (segmentIndex !== 0) {
        process.stdout.write('\n');
    }
}