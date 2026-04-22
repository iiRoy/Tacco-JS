const fileSystemOperations = require("fs");

const standardInputResourcePath = "/dev/stdin";
const inputDataEncoding = "utf8";

// A consistent reference year for date calculations.
// The choice of year (e.g., 2004 vs. 2024) primarily affects leap year considerations,
// but for determining the day of the week for a given month/day, any non-leap year or leap year
// can be used as long as its leap status is known. 2024 is a leap year, as was 2004.
const BASE_CALCULATION_YEAR = 2024;

// An array holding the full names of the days of the week.
// Indexed from 0 (Sunday) to 6 (Saturday), aligning with Date.prototype.getDay().
const WEEKDAY_FULL_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

try {
    // Read the complete content from the standard input synchronously.
    const entireInputContent = fileSystemOperations.readFileSync(standardInputResourcePath, inputDataEncoding);

    // Split the input content into an array of individual lines.
    // Filter out any lines that are empty or contain only whitespace,
    // which can occur due to extra newlines in the input.
    const processedInputLines = entireInputContent
        .split('\n')
        .filter(lineSegment => lineSegment.trim().length > 0);

    // Iterate over each line of the filtered input.
    // The original code used 'some' without returning a truthy value,
    // which effectively made it iterate through all elements. 'forEach' explicitly
    // represents this "process all" iteration behavior.
    processedInputLines.forEach(function(currentDataEntry) {
        // Remove any leading or trailing whitespace from the current line to ensure clean parsing.
        const cleanedDataEntry = currentDataEntry.trim();

        // Split the cleaned line into its constituent parts based on a space delimiter.
        // We expect two parts: the month and the day.
        const parsedDateComponents = cleanedDataEntry.split(' ');

        // Implement a validation check to ensure the input line has the expected format.
        // If it doesn't have exactly two components, log an error and skip this entry.
        if (parsedDateComponents.length !== 2) {
            console.error(`Input Format Error: Line '${cleanedDataEntry}' is not in 'month day' format. Skipping.`);
            return; // Move to the next iteration of the loop.
        }

        // Extract the month and day as strings from the parsed components.
        const monthStringValue = parsedDateComponents[0];
        const dayStringValue = parsedDateComponents[1];

        // Convert the extracted string values into integers for numerical operations.
        const integerMonthValue = parseInt(monthStringValue, 10);
        const integerDayValue = parseInt(dayStringValue, 10);

        // Check for the specific problem termination condition: if the month value is 0.
        // If it is, this line should be ignored as per the problem's implicit rules (often marks end of input).
        if (integerMonthValue === 0) {
            // No output for a month 0 entry; simply bypass further processing for this line.
            return; // Move to the next iteration.
        }

        // Perform initial validation on the numerical month and day values.
        // Ensure they are valid numbers (not NaN) and fall within typical ranges.
        if (isNaN(integerMonthValue) || integerMonthValue < 1 || integerMonthValue > 12 ||
            isNaN(integerDayValue) || integerDayValue < 1 || integerDayValue > 31) {
            console.error(`Data Validation Warning: Month '${monthStringValue}' or Day '${dayStringValue}' is invalid. Skipping.`);
            return; // Skip this entry due to invalid numerical values.
        }

        // Construct a Date object using the predefined base year, the 0-indexed month, and the day.
        // The Date constructor intelligently handles month (0-11) and day values,
        // adjusting if they exceed normal ranges (e.g., Feb 30 becomes Mar 2).
        const computedDateObject = new Date(BASE_CALCULATION_YEAR, integerMonthValue - 1, integerDayValue);

        // Critical validation: Verify that the Date object, after its internal normalization,
        // still corresponds to the exact month and day that were provided in the input.
        // This catches non-existent dates like February 30th or April 31st.
        if (computedDateObject.getFullYear() !== BASE_CALCULATION_YEAR ||
            computedDateObject.getMonth() !== (integerMonthValue - 1) ||
            computedDateObject.getDate() !== integerDayValue) {
            console.error(`Date Inconsistency: The date ${monthStringValue}/${dayStringValue}/${BASE_CALCULATION_YEAR} does not exist. Skipping.`);
            return; // Skip entries that represent non-existent dates.
        }

        // Retrieve the day of the week as an integer (0 for Sunday, 6 for Saturday).
        const dayOfWeekIdentifier = computedDateObject.getDay();

        // Use the day of the week identifier as an index to fetch the full name
        // from the predefined array of weekday names.
        const finalWeekdayResult = WEEKDAY_FULL_NAMES[dayOfWeekIdentifier];

        // Output the determined full weekday name to the console.
        console.log(finalWeekdayResult);
    });

} catch (processingException) {
    // Catch and report any unexpected errors that occur during file reading or processing,
    // providing a user-friendly error message.
    console.error("An unforeseen issue occurred during input processing:", processingException.message);
    // Terminate the process with a non-zero exit code to indicate an error state.
    process.exit(1);
}