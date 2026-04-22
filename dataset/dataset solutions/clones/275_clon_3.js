const fileSystemUtility = require('fs'); // Access the Node.js file system module.

// Define the standard input path for reading data.
const STANDARD_INPUT_SOURCE = '/dev/stdin';

/**
 * Configuration for Japanese Imperial Eras.
 * These are ordered from the most recent to the oldest to facilitate
 * sequential checking in the era determination logic.
 *
 * Each object defines:
 * - `eraTag`: A short string identifier for the era.
 * - `eraStartDate`: A `Date` object representing the first day of the era.
 * - `gregorianYearBasis`: The Gregorian year used as a reference point for
 *   calculating the era year (e.g., Meiji 1 is 1868 - 1867).
 */
const IMPERIAL_CALENDAR_PERIODS = [
    {
        eraTag: 'heisei',
        eraStartDate: new Date(1989, 0, 7), // January is month 0, day 7. Heisei began on this date.
        gregorianYearBasis: 1988 // Heisei year = Gregorian year - 1988
    },
    {
        eraTag: 'showa',
        eraStartDate: new Date(1926, 11, 25), // December is month 11, day 25. Showa began on this date.
        gregorianYearBasis: 1925 // Showa year = Gregorian year - 1925
    },
    {
        eraTag: 'taisho',
        eraStartDate: new Date(1912, 6, 30), // July is month 6, day 30. Taisho began on this date.
        gregorianYearBasis: 1911 // Taisho year = Gregorian year - 1911
    },
    {
        eraTag: 'meiji',
        eraStartDate: new Date(1868, 8, 8), // September is month 8, day 8. Meiji began on this date.
        gregorianYearBasis: 1867 // Meiji year = Gregorian year - 1867
    }
];

/**
 * Creates a standard JavaScript `Date` object from given year, month, and day components.
 * This helper ensures consistent date object creation, particularly handling the
 * 0-indexed nature of `Date` object months.
 *
 * @param {number} yearVal - The full Gregorian year (e.g., 2023).
 * @param {number} monthVal - The 1-indexed month (1 for January, 12 for December).
 * @param {number} dayVal - The day of the month (1-31).
 * @returns {Date} A `Date` object representing the specified date.
 */
function generateDateInstance(yearVal, monthVal, dayVal) {
    // Basic validation for month and day ranges, though Date constructor handles overflow.
    if (monthVal < 1 || monthVal > 12 || dayVal < 1 || dayVal > 31) {
        // In a production system, this might throw an error or return null.
        // For this context, we rely on Date constructor's behavior.
    }
    return new Date(yearVal, monthVal - 1, dayVal); // Adjust month to be 0-indexed
}

/**
 * Determines the Japanese Imperial Era for a given Gregorian date and calculates
 * the corresponding era year.
 *
 * @param {Date} inputDateObject - The `Date` object to classify.
 * @param {number} originalGregorianYear - The original Gregorian year from input,
 *                                         needed for era year calculation.
 * @returns {{eraIdentifier: string, eraRelativeYear: number|null}} An object containing
 *          the era's identifier and its year relative to the era's start.
 *          `eraRelativeYear` is `null` if the date precedes all defined eras.
 */
function classifyJapaneseEra(inputDateObject, originalGregorianYear) {
    let identifiedEra = 'pre-meiji'; // Default to pre-Meiji if no other era matches
    let computedEraYear = null;

    // Iterate through eras from newest to oldest. The first era whose start date
    // is on or before the input date is the correct era.
    for (const eraDetails of IMPERIAL_CALENDAR_PERIODS) {
        if (inputDateObject >= eraDetails.eraStartDate) {
            identifiedEra = eraDetails.eraTag;
            computedEraYear = originalGregorianYear - eraDetails.gregorianYearBasis;
            break; // Found the era, exit loop
        }
    }

    return {
        eraIdentifier: identifiedEra,
        eraRelativeYear: computedEraYear
    };
}

// --- Main Program Logic ---

// Read the entire content from the standard input file, decode as UTF-8, and remove leading/trailing whitespace.
let rawInputData = fileSystemUtility.readFileSync(STANDARD_INPUT_SOURCE, 'utf8').trim();

// Split the raw data into individual text lines.
// `.filter(Boolean)` removes any empty strings that might result from extra newlines.
let processedInputLines = rawInputData.split('\n').filter(Boolean);

// Iterate over each line of input data.
for (let i = 0; i < processedInputLines.length; i++) {
    const currentInputRecord = processedInputLines[i];

    // Skip if the record is empty or only contains whitespace after filtering. (Guard clause)
    if (!currentInputRecord.trim()) {
        console.warn(`Warning: Encountered an empty or whitespace-only line at index ${i}. Skipping.`);
        continue;
    }

    // Split the record by spaces and convert each part to a number.
    // `Number` constructor is used as a concise way to cast string to number.
    const numericalComponents = currentInputRecord.split(' ').map(Number);

    // Validate the number of components. Expecting Year, Month, Day. (Input validation)
    const EXPECTED_COMPONENT_COUNT = 3;
    if (numericalComponents.length !== EXPECTED_COMPONENT_COUNT) {
        console.error(`Error: Malformed date record "${currentInputRecord}". Expected ${EXPECTED_COMPONENT_COUNT} numbers (Y M D). Skipping.`);
        continue; // Move to the next input line
    }

    // Assign components to clearly named variables for better readability.
    const inputGregorianYear = numericalComponents[0];
    const inputGregorianMonth = numericalComponents[1];
    const inputGregorianDay = numericalComponents[2];

    // Create a `Date` object for the current record.
    const dateForEraEvaluation = generateDateInstance(inputGregorianYear, inputGregorianMonth, inputGregorianDay);

    // Determine the era and calculate the era-relative year.
    const eraClassificationResult = classifyJapaneseEra(dateForEraEvaluation, inputGregorianYear);

    // Output the result based on the era classification.
    if (eraClassificationResult.eraIdentifier === 'pre-meiji') {
        console.log('pre-meiji');
    } else {
        // Construct the output string with era name, era year, and original month/day.
        const formattedOutputString = `${eraClassificationResult.eraIdentifier} ${eraClassificationResult.eraRelativeYear} ${inputGregorianMonth} ${inputGregorianDay}`;
        console.log(formattedOutputString);
    }
}