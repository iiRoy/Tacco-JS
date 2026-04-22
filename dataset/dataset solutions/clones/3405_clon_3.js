const FILE_SYSTEM_MODULE = require("fs"); // Import the file system capabilities.

const STANDARD_INPUT_DEVICE_PATH = "/dev/stdin"; // Define the standard input file path.
const INPUT_CONTENT_ENCODING = "utf8";           // Specify the character encoding for input.

// Numeric identifiers for significant days leading up to and including Christmas.
const CHRISTMAS_DAY_NUMERIC = 25;
const CHRISTMAS_EVE_NUMERIC = 24;
const TWO_DAYS_BEFORE_NUMERIC = 23;
const THREE_DAYS_BEFORE_NUMERIC = 22;

// Core textual components for the holiday message.
const BASE_HOLIDAY_TEXT = "Christmas";
const EVE_QUALIFIER_TEXT = " Eve";

/**
 * Orchestrates the process of reading a day identifier from standard input,
 * determining relevant holiday greetings, and printing the result.
 */
function produceFestiveOutput() {
    let inputRawData = ""; // Variable to hold the raw input string.

    // Attempt to read all content from the standard input synchronously.
    try {
        inputRawData = FILE_SYSTEM_MODULE.readFileSync(STANDARD_INPUT_DEVICE_PATH, INPUT_CONTENT_ENCODING);
    } catch (readOperationError) {
        // If an error occurs during file reading, log it and terminate the process.
        console.error("Failed to acquire input data:", readOperationError.message);
        return; // Exit early if input is unavailable.
    }

    // Sanitize the input string by removing any leading or trailing whitespace.
    // This processed string will be used for all subsequent comparisons.
    const cleanedDayIdentifier = inputRawData.trim();

    // Initialize an empty string to potentially append an "Eve" qualifier.
    let supplementaryDescription = "";

    // Determine if the "Eve" qualifier should be added based on the cleaned input string.
    // The original code used `i == 24`, `i == 23`, `i == 22` which are string comparisons.
    // We replicate this behavior using strict equality against stringified numeric constants.
    if (cleanedDayIdentifier === String(CHRISTMAS_EVE_NUMERIC) ||
        cleanedDayIdentifier === String(TWO_DAYS_BEFORE_NUMERIC) ||
        cleanedDayIdentifier === String(THREE_DAYS_BEFORE_NUMERIC)) {
        supplementaryDescription = EVE_QUALIFIER_TEXT;
    }

    // Define the regular expression pattern to check if the input string contains
    // any of the significant holiday day numbers. This matches the original `i.match(...)` behavior,
    // which checks for substrings (e.g., "124" would match "24").
    const HOLIDAY_PRESENCE_PATTERN = /(?:25|24|23|22)/;

    // Evaluate if the cleaned input string contains any of the pattern's numeric codes.
    // The `test()` method returns a boolean, matching the original's truthy/falsy check.
    const isHolidayPeriodActive = HOLIDAY_PRESENCE_PATTERN.test(cleanedDayIdentifier);

    // If the input indicates an active holiday period, construct and print the final message.
    if (isHolidayPeriodActive) {
        // Combine the base greeting with any determined supplementary description.
        // Using a template literal for string construction provides an alternative to '+' concatenation.
        const completeHolidayMessage = `${BASE_HOLIDAY_TEXT}${supplementaryDescription}`;
        console.log(completeHolidayMessage);
    }
    // No output is generated if the input does not match the holiday period criteria,
    // mirroring the original's conditional `&& console.log`.
}

// Execute the main function to start the holiday greeting generation.
produceFestiveOutput();