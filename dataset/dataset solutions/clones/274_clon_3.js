const fileSystem = require('fs');

// Define the start dates for each Japanese Imperial Era.
// Note: JavaScript Date object months are 0-indexed (January is 0, December is 11).
const ERA_BOUNDARIES = {
    MEIJI_ERA_START: new Date(1868, 8, 8),   // September 8, 1868
    TAISHO_ERA_START: new Date(1912, 6, 30), // July 30, 1912
    SHOWA_ERA_START: new Date(1926, 11, 25), // December 25, 1926
    HEISEI_ERA_START: new Date(1989, 0, 8)   // January 8, 1989
};

// Constant label for the pre-Meiji period.
const PRE_MEIJI_PERIOD_LABEL = 'pre-meiji';

/**
 * Creates a validated Date object from year, month, and day inputs.
 * Ensures the generated date accurately reflects the input and is not a "corrected" invalid date.
 * @param {number} yearInput - The full year (e.g., 2023).
 * @param {number} monthInput - The month (1-12).
 * @param {number} dayInput - The day of the month (1-31).
 * @returns {Date | null} A Date object if valid, otherwise null.
 */
function createValidatedDate(yearInput, monthInput, dayInput) {
    // Basic numerical and range checks for components.
    if (isNaN(yearInput) || isNaN(monthInput) || isNaN(dayInput) ||
        monthInput < 1 || monthInput > 12 || dayInput < 1 || dayInput > 31) {
        return null; // Immediately reject obviously invalid components.
    }

    // Create a Date object using the 0-indexed month.
    const potentialDate = new Date(yearInput, monthInput - 1, dayInput);

    // Verify that the Date object's components match the input,
    // preventing cases like 'Feb 30' from becoming 'Mar 2'.
    if (potentialDate.getFullYear() !== yearInput ||
        potentialDate.getMonth() !== monthInput - 1 ||
        potentialDate.getDate() !== dayInput) {
        return null; // The Date object "corrected" an invalid date.
    }

    return potentialDate;
}

/**
 * Determines the Japanese Imperial Era for a given Gregorian date.
 * @param {number} currentYear - The Gregorian year.
 * @param {number} currentMonth - The Gregorian month (1-12).
 * @param {number} currentDay - The Gregorian day.
 * @returns {object | string} An object { eraName, eraYear, month, day }
 *                            or the string 'pre-meiji' if before the Meiji era,
 *                            or null if the input date is invalid.
 */
function identifyJapaneseEra(currentYear, currentMonth, currentDay) {
    const targetDate = createValidatedDate(currentYear, currentMonth, currentDay);

    if (!targetDate) {
        return null; // Invalid date input.
    }

    let resolvedEraName;
    let eraRelativeYear = currentYear; // Initialize with Gregorian year.

    // Evaluate the date against the defined era boundaries.
    if (targetDate < ERA_BOUNDARIES.MEIJI_ERA_START) {
        resolvedEraName = PRE_MEIJI_PERIOD_LABEL;
    } else if (targetDate < ERA_BOUNDARIES.TAISHO_ERA_START) {
        resolvedEraName = 'meiji';
        eraRelativeYear -= 1867; // Meiji 1 started in 1868.
    } else if (targetDate < ERA_BOUNDARIES.SHOWA_ERA_START) {
        resolvedEraName = 'taisho';
        eraRelativeYear -= 1911; // Taisho 1 started in 1912.
    } else if (targetDate < ERA_BOUNDARIES.HEISEI_ERA_START) {
        resolvedEraName = 'showa';
        eraRelativeYear -= 1925; // Showa 1 started in 1926.
    } else {
        resolvedEraName = 'heisei';
        eraRelativeYear -= 1988; // Heisei 1 started in 1989.
    }

    // Return structure differs for 'pre-meiji' as per original functionality.
    if (resolvedEraName === PRE_MEIJI_PERIOD_LABEL) {
        return PRE_MEIJI_PERIOD_LABEL;
    } else {
        return {
            eraName: resolvedEraName,
            eraYear: eraRelativeYear,
            month: currentMonth,
            day: currentDay
        };
    }
}

// Main program execution flow.
try {
    // Read all input data synchronously from the standard input.
    const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Split the content into individual lines and filter out any empty strings
    // that might result from trailing newlines or multiple consecutive newlines.
    const processedLines = rawInputContent.split('\n').filter(lineText => lineText.trim().length > 0);

    // Iterate over each non-empty input line.
    for (const singleLineText of processedLines) {
        // Parse the year, month, and day components from the line.
        // Using parseInt with radix 10 for explicit base conversion.
        const dateNumericComponents = singleLineText.split(' ').map(str => parseInt(str, 10));

        // Validate that exactly three numeric components were found.
        if (dateNumericComponents.length !== 3 || dateNumericComponents.some(isNaN)) {
            console.error(`Warning: Skipping malformed input line "${singleLineText}". Expected YYYY MM DD.`);
            continue; // Move to the next line.
        }

        const [yearValue, monthValue, dayValue] = dateNumericComponents;

        // Obtain the era information using the dedicated function.
        const eraInformation = identifyJapaneseEra(yearValue, monthValue, dayValue);

        // Based on the returned era information, format and print the output.
        if (eraInformation === PRE_MEIJI_PERIOD_LABEL) {
            console.log(PRE_MEIJI_PERIOD_LABEL);
        } else if (eraInformation === null) {
            // This path indicates an invalid date (e.g., Feb 30th) that passed initial parsing.
            console.error(`Error: Invalid date values provided for "${yearValue} ${monthValue} ${dayValue}".`);
        } else {
            // Destructure the object to get individual era details.
            const { eraName, eraYear, month, day } = eraInformation;
            // Pad single-digit month and day with a leading zero for consistent formatting.
            const formattedMonthStr = String(month).padStart(2, '0');
            const formattedDayStr = String(day).padStart(2, '0');
            console.log(`${eraName} ${eraYear} ${formattedMonthStr} ${formattedDayStr}`);
        }
    }
} catch (exception) {
    // Catch and report any errors during file reading or other critical operations.
    console.error("An unexpected error occurred during processing:", exception.message);
}