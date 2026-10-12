/*
 * This script processes a list of dining establishment entries
 * provided via standard input. Each entry contains a location name
 * and a numerical quality rating.
 * The primary goal is to sort these establishments based on specific criteria.
 */
function processRestaurantData(rawDataString) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input string is not empty or merely whitespace.
    if (!rawDataString || rawDataString.trim().length === 0) {
        console.error("Error: No input data received for processing.");
        return; // Terminate execution if no meaningful input is provided.
    }

    // Split the entire raw string into individual lines.
    // The problem format typically includes a header line (e.g., count 'N')
    // and potentially a trailing empty line. We'll use slice to isolate the
    // actual data entries, effectively discarding the first and last elements.
    let rawEntryLines = rawDataString.split('\n');
    let actualDataLines = [];

    // Implement a guard clause to ensure there are enough lines to slice.
    // A minimum of 3 lines is expected: header, at least one data line, and a footer/empty line.
    if (rawEntryLines.length >= 3) {
        actualDataLines = rawEntryLines.slice(1, -1); // Exclude the first and last lines.
    } else {
        console.error("Error: Insufficient lines in the input data for the expected format (header + N entries + footer).");
        return; // Exit if the input structure is severely malformed.
    }

    // Filter out any remaining empty or whitespace-only lines.
    // This adds robustness against malformed input files.
    const cleanDataEntries = actualDataLines.filter(line => line.trim() !== '');

    if (cleanDataEntries.length === 0) {
        console.warn("Warning: No valid data entries found after initial filtering. Nothing to sort.");
        return; // No data to process after cleaning.
    }

    // --- Data Transformation ---

    // Convert each cleaned line into a structured object.
    // Each object will represent a dining establishment with its original
    // 1-based order, its geographical locale, and its quality rating.
    const diningEstablishments = cleanDataEntries.map((currentLineContent, originalSubmissionOrder) => {
        const lineSegments = currentLineContent.split(" ");

        // Validate the structure of each line. Expect at least two segments (locale and rating).
        if (lineSegments.length < 2) {
            console.warn(`Warning: Malformed line encountered: "${currentLineContent}". This entry will be skipped.`);
            return null; // Return null for invalid entries, which will be filtered out.
        }

        const establishmentLocale = lineSegments[0];
        let numericalRating = Number(lineSegments[1]); // Use Number() for parsing a string to a number.

        // Validate if the parsed rating is a valid number.
        if (isNaN(numericalRating)) {
            console.warn(`Warning: Invalid numeric rating detected for locale "${establishmentLocale}". Defaulting rating to 0.`);
            numericalRating = 0; // Assign a default value if parsing fails.
        }

        // Construct and return the normalized establishment object.
        return {
            originalOrder: originalSubmissionOrder + 1, // Store the 1-based original index.
            locale: establishmentLocale,
            rating: numericalRating
        };
    }).filter(Boolean); // Remove any 'null' entries that resulted from malformed lines.

    // Final check for data presence after mapping and filtering.
    if (diningEstablishments.length === 0) {
        console.error("Error: All dining establishment entries were invalid or malformed. No data remains for sorting.");
        return; // No valid data to sort.
    }

    // --- Sorting Logic ---

    // Apply a custom sorting algorithm to the list of establishments.
    // The primary sort key is 'locale' (city) in ascending alphabetical order.
    // The secondary sort key (for establishments with identical locales) is 'rating' (score) in descending numerical order.
    diningEstablishments.sort((establishmentA, establishmentB) => {
        // First, compare by locale using localeCompare for robust string comparison.
        const localeComparisonOutcome = establishmentA.locale.localeCompare(establishmentB.locale);

        // If locales are different, return the comparison result immediately.
        if (localeComparisonOutcome !== 0) {
            return localeComparisonOutcome;
        }

        // If locales are identical, then compare by rating in descending order.
        // A higher rating should come before a lower rating.
        return establishmentB.rating - establishmentA.rating;
    });

    // --- Output Generation ---

    // Iterate through the now-sorted list of establishments
    // and print the original 1-based index for each.
    for (const sortedEstablishment of diningEstablishments) {
        console.log(sortedEstablishment.originalOrder);
    }
}

/*
 * This critical block manages the standard input/output operations
 * for the environment (typically a Node.js runtime in a contest setting).
 * It reads all data from standard input, decodes it as UTF-8,
 * and then passes this raw string to the main processing function.
 *
 * IMPORTANT: For contest submissions, this specific line should generally
 * not be altered, as it provides the interface to the judge system.
 */
processRestaurantData(require('node:fs').readFileSync(0, 'utf8')); // Reads from stdin (file descriptor 0)