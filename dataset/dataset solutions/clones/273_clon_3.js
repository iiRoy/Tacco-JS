/**
 * Helper function to compute the Unix timestamp (milliseconds since epoch)
 * for a given Gregorian date.
 * Uses the more robust `new Date(year, monthIndex, day)` constructor.
 *
 * @param {number} inputYear - The year (e.g., 1868).
 * @param {number} inputMonth - The month (1-12).
 * @param {number} inputDay - The day of the month (1-31).
 * @returns {number} The timestamp in milliseconds.
 */
function calculateTimestampFromDate(inputYear, inputMonth, inputDay) {
    // Months in JavaScript's Date object are 0-indexed (0 for January, 11 for December).
    const parsedDateObject = new Date(inputYear, inputMonth - 1, inputDay);
    return parsedDateObject.getTime();
}

// Define constants for the start timestamps of key Japanese historical eras.
// This avoids redundant calculations and improves readability.
const MEIJI_ERA_START_MS = calculateTimestampFromDate(1868, 9, 8); // Meiji begins Sep 8, 1868
const TAISHO_ERA_START_MS = calculateTimestampFromDate(1912, 7, 30); // Taisho begins Jul 30, 1912
const SHOWA_ERA_START_MS = calculateTimestampFromDate(1926, 12, 25); // Showa begins Dec 25, 1926
const HEISEI_ERA_START_MS = calculateTimestampFromDate(1989, 1, 8); // Heisei begins Jan 8, 1989

// Utilize Node.js 'fs' module to read input from standard input.
const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process each line of input, filtering out any empty lines.
const dateEntryLines = rawInputContent.split(/\r?\n/).filter(line => line.trim() !== '');

// Iterate over each date entry provided in the input.
for (const currentLineEntry of dateEntryLines) {
    // Parse the year, month, and day components from the current line.
    // Ensure all parts are converted to numbers.
    const dateComponents = currentLineEntry.split(" ").map(Number);

    // Basic validation: Check if exactly three numeric components were parsed.
    if (dateComponents.length !== 3 || dateComponents.some(isNaN)) {
        console.error("Error: Invalid date format encountered - skipping line:", currentLineEntry);
        continue; // Skip to the next line if parsing fails
    }

    const yearComponent = dateComponents[0];
    const monthComponent = dateComponents[1];
    const dayComponent = dateComponents[2];

    // Calculate the timestamp for the input date.
    const targetDateTimestamp = calculateTimestampFromDate(yearComponent, monthComponent, dayComponent);

    let eraOutputDescription = ""; // Variable to hold the determined era string.

    // Determine the Japanese era based on the target date's timestamp.
    // The conditions are ordered from oldest to newest to correctly apply the era.
    if (targetDateTimestamp < MEIJI_ERA_START_MS) {
        eraOutputDescription = "pre-meiji";
    } else if (targetDateTimestamp < TAISHO_ERA_START_MS) {
        // Calculate the year within the Meiji era.
        const meijiEraYear = yearComponent - 1868 + 1;
        eraOutputDescription = `meiji ${meijiEraYear} ${monthComponent} ${dayComponent}`;
    } else if (targetDateTimestamp < SHOWA_ERA_START_MS) {
        // Calculate the year within the Taisho era.
        const taishoEraYear = yearComponent - 1912 + 1;
        eraOutputDescription = `taisho ${taishoEraYear} ${monthComponent} ${dayComponent}`;
    } else if (targetDateTimestamp < HEISEI_ERA_START_MS) {
        // Calculate the year within the Showa era.
        const showaEraYear = yearComponent - 1926 + 1;
        eraOutputDescription = `showa ${showaEraYear} ${monthComponent} ${dayComponent}`;
    } else {
        // If it's not before Heisei, it must be Heisei or later (based on the original logic's scope).
        // Calculate the year within the Heisei era.
        const heiseiEraYear = yearComponent - 1989 + 1;
        eraOutputDescription = `heisei ${heiseiEraYear} ${monthComponent} ${dayComponent}`;
    }

    // Output the determined era and date information.
    console.log(eraOutputDescription);
}