// A module for file system operations, aliased for clarity.
const fileSystemOperations = require('node:fs');

// Configuration constants for input processing.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';
const TEXT_ENCODING_SCHEME = 'utf8';
const LINE_DELIMITER = '\n';
const DATE_COMPONENT_DELIMITER = ' ';

// Define the boundaries and year offsets for Japanese eras.
// Eras are ordered from newest to oldest for sequential comparison logic.
const IMPERIAL_ERA_DEFINITIONS = [
    { eraIdentifier: 'heisei', eraStartBoundary: new Date(1989, 0, 8), yearOffsetFromGregorian: 1988 }, // January is 0
    { eraIdentifier: 'showa', eraStartBoundary: new Date(1926, 11, 25), yearOffsetFromGregorian: 1925 }, // December is 11
    { eraIdentifier: 'taisho', eraStartBoundary: new Date(1912, 6, 30), yearOffsetFromGregorian: 1911 }, // July is 6
    { eraIdentifier: 'meiji', eraStartBoundary: new Date(1868, 8, 8), yearOffsetFromGregorian: 1867 }  // September is 8
];

/**
 * Creates a Date object from given year, month, and day components.
 * Adjusts the month to be 0-indexed as required by JavaScript's Date constructor.
 * @param {number} year - The Gregorian year.
 * @param {number} month - The Gregorian month (1-12).
 * @param {number} day - The Gregorian day.
 * @returns {Date} A new Date object representing the specified date.
 */
function createGregorianDate(year, month, day) {
    // Subtract 1 from the month to convert it to a 0-indexed value for the Date constructor.
    return new Date(year, month - 1, day);
}

/**
 * Parses a string containing date components (year, month, day) separated by a delimiter.
 * Performs basic validation on the number of components and their numerical validity.
 * @param {string} dateString - The string to parse, e.g., "2023 10 26".
 * @param {string} delimiter - The delimiter used to separate components, e.g., " ".
 * @returns {number[]|null} An array of [year, month, day] as numbers, or null if parsing fails.
 */
function parseDateComponents(dateString, delimiter) {
    const stringComponents = dateString.split(delimiter);
    if (stringComponents.length !== 3) {
        // Input line does not contain exactly three components (year, month, day).
        return null;
    }
    const numericalComponents = stringComponents.map(Number);
    // Basic validation: ensure all components are valid numbers.
    if (numericalComponents.some(isNaN)) {
        return null;
    }
    return numericalComponents;
}

/**
 * Determines the Japanese era for a given Gregorian date and calculates the adjusted year within that era.
 * It iterates through the predefined eras from newest to oldest to find the correct one.
 * @param {Date} inputDate - The Gregorian Date object to evaluate.
 * @param {number} originalGregorianYear - The original Gregorian year from the input.
 * @returns {{eraName: string, calculatedYear: number}} An object containing the era's identifier and the adjusted year.
 */
function assignEraAndCalculateYear(inputDate, originalGregorianYear) {
    let currentEraName = 'pre-meiji'; // Default value for dates before the Meiji era.
    let adjustedYearValue = originalGregorianYear; // Default to original year if no specific era is found.

    // Iterate through defined eras from newest to oldest.
    // The first era whose start boundary is less than or equal to the input date is the correct one.
    for (const eraDef of IMPERIAL_ERA_DEFINITIONS) {
        if (inputDate >= eraDef.eraStartBoundary) {
            currentEraName = eraDef.eraIdentifier;
            adjustedYearValue = originalGregorianYear - eraDef.yearOffsetFromGregorian;
            break; // Found the correct era, no need to check older ones.
        }
    }

    return { eraName: currentEraName, calculatedYear: adjustedYearValue };
}

/**
 * Outputs a formatted message to the standard console output.
 * This function acts as a wrapper for console.log for consistent output behavior.
 * @param {string} message - The message string to display.
 */
function displayResult(message) {
    console.log(message);
}

// Main execution block for processing the input.
try {
    // Read the entire content of the standard input file synchronously.
    const rawInputContent = fileSystemOperations.readFileSync(STANDARD_INPUT_FILE_PATH, TEXT_ENCODING_SCHEME);

    // Split the content into individual records (lines),
    // then trim whitespace from each record and filter out any empty lines.
    const processedInputRecords = rawInputContent
        .trim() // Remove leading/trailing whitespace from the entire input content.
        .split(LINE_DELIMITER) // Split into an array of strings based on the newline character.
        .filter(record => record.length > 0); // Remove any records that are empty strings after splitting.

    // Process each valid input record sequentially.
    for (const recordLine of processedInputRecords) {
        const parsedDateComponents = parseDateComponents(recordLine, DATE_COMPONENT_DELIMITER);

        // If parsing fails (e.g., incorrect number of components, non-numeric values),
        // skip this line and proceed to the next one without processing.
        if (!parsedDateComponents) {
            continue;
        }

        // Destructure the parsed components into distinct year, month, and day variables.
        const [gregorianYear, gregorianMonth, gregorianDay] = parsedDateComponents;

        // Create a JavaScript Date object for the current input date for comparison.
        const evaluationDate = createGregorianDate(gregorianYear, gregorianMonth, gregorianDay);

        // Determine the Japanese era and calculate the corresponding adjusted year.
        const eraDetails = assignEraAndCalculateYear(evaluationDate, gregorianYear);

        // Handle the special case where the date falls before the Meiji era.
        if (eraDetails.eraName === 'pre-meiji') {
            displayResult('pre-meiji');
        } else {
            // Format and display the era name, adjusted year, original month, and original day.
            const formattedOutput = `${eraDetails.eraName} ${eraDetails.calculatedYear} ${gregorianMonth} ${gregorianDay}`;
            displayResult(formattedOutput);
        }
    }
} catch (error) {
    // Catch and report any errors that occur during file reading or processing.
    console.error(`An unexpected error occurred during input processing: ${error.message}`);
}