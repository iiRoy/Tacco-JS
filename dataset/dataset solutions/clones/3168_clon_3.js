const FILE_SYSTEM_ACCESSOR = require("fs");
const STANDARD_INPUT_SOURCE = "/dev/stdin";
const INPUT_DATA_ENCODING = "utf8";

const ERA_CHANGE_YEAR = 2019;
const ERA_CHANGE_MONTH = 5;
const NEW_ERA_DESIGNATION = 'TBD';
const OLD_ERA_DESIGNATION = 'Heisei';
const DATE_COMPONENT_DELIMITER = '/';

/**
 * Processes a date string to determine the corresponding Japanese imperial era.
 * This function includes robust validation and uses explicit parsing.
 *
 * @param {string} inputDateString - The date string in "YYYY/MM" format.
 * @returns {string} The name of the determined era ('Heisei' or 'TBD').
 */
function identifyImperialEraFromDate(inputDateString) {
    // Guard clause: Ensure the input is a valid string.
    if (typeof inputDateString !== 'string' || inputDateString.length === 0) {
        console.error("Input error: Provided date string is invalid or empty. Defaulting to Heisei.");
        return OLD_ERA_DESIGNATION;
    }

    // Clean and split the input string into its year and month components.
    const dateParts = inputDateString.trim().split(DATE_COMPONENT_DELIMITER);

    // Validate the number of components. We expect exactly two: year and month.
    const EXPECTED_PART_COUNT = 2;
    if (dateParts.length !== EXPECTED_PART_COUNT) {
        console.error(`Input error: Expected ${EXPECTED_PART_COUNT} date parts (YYYY/MM), but found ${dateParts.length}. Defaulting to Heisei.`);
        return OLD_ERA_DESIGNATION;
    }

    // Parse the year and month from string to integer, specifying radix 10 for safety.
    const currentYear = parseInt(dateParts[0], 10);
    const currentMonth = parseInt(dateParts[1], 10);

    // Validate if parsing resulted in actual numbers.
    if (isNaN(currentYear) || isNaN(currentMonth)) {
        console.error("Parsing error: Failed to convert date components to valid numbers. Defaulting to Heisei.");
        return OLD_ERA_DESIGNATION;
    }

    let resultantEraLabel; // Declare a variable to hold the final era name.

    // Determine the era based on the parsed year and month values.
    // This logic is expanded from a simple ternary into an if-else structure for clarity.
    if (currentYear < ERA_CHANGE_YEAR) {
        // If the year is strictly before the transition year, it's definitely the old era.
        resultantEraLabel = OLD_ERA_DESIGNATION;
    } else if (currentYear === ERA_CHANGE_YEAR) {
        // If it's the transition year, the month determines the era.
        if (currentMonth < ERA_CHANGE_MONTH) {
            // Months before the transition month in the transition year are old era.
            resultantEraLabel = OLD_ERA_DESIGNATION;
        } else {
            // Months from and after the transition month in the transition year are new era.
            resultantEraLabel = NEW_ERA_DESIGNATION;
        }
    } else { // currentYear > ERA_CHANGE_YEAR
        // If the year is strictly after the transition year, it's definitely the new era.
        resultantEraLabel = NEW_ERA_DESIGNATION;
    }

    // Return the determined era name.
    return resultantEraLabel;
}

// Self-invoking anonymous function to encapsulate the main execution flow.
(function performEraEvaluation() {
    let rawDataBuffer; // Variable to hold the raw content read from the input source.

    try {
        // Attempt to read the entire content of the standard input file synchronously.
        // A try-catch block is used to gracefully handle potential file system errors.
        rawDataBuffer = FILE_SYSTEM_ACCESSOR.readFileSync(STANDARD_INPUT_SOURCE, INPUT_DATA_ENCODING);
    } catch (systemReadError) {
        // Log an error message if reading the input fails.
        console.error(`Critical error: Could not read from ${STANDARD_INPUT_SOURCE}. Details: ${systemReadError.message}`);
        // In case of read failure, output the default era as a fallback.
        console.log(OLD_ERA_DESIGNATION);
        return; // Exit the execution flow.
    }

    // Convert the buffer content to a string and then pass it to the era identification function.
    const resultEra = identifyImperialEraFromDate(rawDataBuffer.toString());

    // Output the final determined era to the console.
    console.log(resultEra);
})();