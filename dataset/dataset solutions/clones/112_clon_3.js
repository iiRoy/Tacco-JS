// This program processes a sequence of date specifications from standard input.
// For each valid input line, it determines the corresponding day of the week in the year 2004
// and prints the full name of that day. Processing terminates upon encountering the "0 0" sequence.

// Module alias for file system operations.
const systemIOHandler = require('fs');

// Defines the standard input path from which data will be read.
const inputSourcePath = '/dev/stdin';

// Reads the entire content from the specified input path as a UTF-8 string.
const rawContentPayload = systemIOHandler.readFileSync(inputSourcePath, 'utf8');

// Processes the raw input string:
// 1. Splits the string into an array of individual lines.
// 2. Trims leading/trailing whitespace from each line.
// 3. Filters out any lines that become empty after trimming.
const dateSpecificationLines = rawContentPayload
    .split('\n')
    .map(entry => entry.trim())
    .filter(Boolean); // Removes empty strings

// An immutable lookup table for converting numeric day-of-week indices (0-6) to their names.
// 0: Sunday, 1: Monday, ..., 6: Saturday.
const dayNameLookupTable = Object.freeze([
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]);

// Establishes the fixed reference year for all date calculations.
const fixedReferenceYear = 2004;

// Initializes a counter to track the current line number being processed for error reporting.
let currentLineNumber = 0;

// Iterates through each cleaned and non-empty line of date specifications.
for (const currentSpecification of dateSpecificationLines) {
    currentLineNumber++; // Increment the line counter for the current iteration.

    // Guard clause: Checks if the current line matches the termination sequence.
    // If "0 0" is found, the processing loop is exited.
    if (currentSpecification === "0 0") {
        break;
    }

    // Parses the month and day components from the current specification string.
    // Uses a regular expression to split by one or more whitespace characters.
    const components = currentSpecification.split(/\s+/);

    // Validation: Ensures that exactly two components (month and day) were successfully parsed.
    if (components.length !== 2) {
        // Logs an error and skips to the next line if the format is incorrect.
        console.error(`Error: Malformed date specification "${currentSpecification}" at line ${currentLineNumber}. Expected "MM DD". Skipping.`);
        continue;
    }

    // Extracts month and day strings.
    const monthComponent = components[0];
    const dayComponent = components[1];

    // Converts month and day components to integers.
    const numericMonth = parseInt(monthComponent, 10);
    const numericDay = parseInt(dayComponent, 10);

    // Validation: Checks if the parsed month and day are valid numeric values.
    if (isNaN(numericMonth) || isNaN(numericDay)) {
        // Logs an error and skips to the next line if components are not numbers.
        console.error(`Error: Non-numeric date components in "${currentSpecification}" at line ${currentLineNumber}. Skipping.`);
        continue;
    }

    // Constructs a standardized date string in "YYYY/MM/DD" format using template literals.
    const fullyQualifiedDateString = `${fixedReferenceYear}/${monthComponent}/${dayComponent}`;

    // Creates a new Date object based on the constructed date string.
    const targetDateTimeInstance = new Date(fullyQualifiedDateString);

    // Validation: Checks if the Date object represents a valid date.
    // `isNaN(getTime())` is a robust way to check for invalid dates.
    if (isNaN(targetDateTimeInstance.getTime())) {
        // Logs an error and skips to the next line if the date is unparseable or invalid.
        console.error(`Error: Invalid date "${fullyQualifiedDateString}" formed from "${currentSpecification}" at line ${currentLineNumber}. Skipping.`);
        continue;
    }

    // Retrieves the numeric index for the day of the week (0 for Sunday, 6 for Saturday).
    const dayIndexValue = targetDateTimeInstance.getDay();

    // Uses the lookup table to get the full name of the day.
    const resolvedDayName = dayNameLookupTable[dayIndexValue];

    // Outputs the determined day name to standard output, followed by a newline.
    // Using `process.stdout.write` as an alternative to `console.log`.
    process.stdout.write(resolvedDayName + '\n');
}