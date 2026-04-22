'use strict';

/**
 * Compares two data records for sorting purposes.
 * It first compares their string identifiers in ascending alphabetical order.
 * If the identifiers are identical, it then compares their numeric values
 * in descending order.
 *
 * @param {object} firstRecord - The first data record to compare. Expected to have 'identifier' (string) and 'numericValue' (number) properties.
 * @param {object} secondRecord - The second data record to compare. Expected to have 'identifier' (string) and 'numericValue' (number) properties.
 * @returns {number} A negative value if `firstRecord` should come before `secondRecord`,
 *                   a positive value if `firstRecord` should come after `secondRecord`,
 *                   or zero if they are considered equivalent for sorting.
 */
function sortDataEntries(firstRecord, secondRecord) {
    // Primary sort criterion: 'identifier' in ascending alphabetical order.
    // The localeCompare method provides a robust way to compare strings.
    const identifierComparisonResult = firstRecord.identifier.localeCompare(secondRecord.identifier);

    // If identifiers are different, return the result of their comparison.
    if (identifierComparisonResult !== 0) {
        return identifierComparisonResult;
    }

    // If identifiers are the same, proceed to the secondary sort criterion:
    // 'numericValue' in descending numerical order.
    // Subtracting first from second achieves descending order (e.g., 100 - 50 = 50, so 100 comes before 50).
    return secondRecord.numericValue - firstRecord.numericValue;
}

/**
 * Processes raw input text, which is expected to contain a count of entries
 * followed by data lines, each with a string identifier and a numeric value.
 * It sorts these entries based on specific criteria and outputs their original
 * 1-based indices to the console.
 *
 * @param {string} rawInputText - The complete input string, typically read from standard input.
 */
function handleInputAndSort(rawInputText) {
    // Split the raw input into an array of lines, filtering out any empty strings
    // that might result from extra newlines (e.g., at the end of the file).
    const parsedInputLines = rawInputText.split('\n').filter(Boolean);

    // Implement a guard clause for empty input.
    if (parsedInputLines.length === 0) {
        console.error("Error: No data found in the provided input.");
        return;
    }

    // Extract the total number of data entries from the first line.
    const declaredEntryCountString = parsedInputLines.shift();
    const totalDataEntriesExpected = Number(declaredEntryCountString);

    // Validate the declared entry count.
    if (isNaN(totalDataEntriesExpected) || totalDataEntriesExpected < 0) {
        console.error(`Error: Invalid entry count "${declaredEntryCountString}" specified. Must be a non-negative number.`);
        return;
    }

    // Optional: Add a warning if the number of actual data lines doesn't match the declared count.
    // In competitive programming, N is often just for information, but robust systems might check.
    if (parsedInputLines.length !== totalDataEntriesExpected) {
        console.warn(`Warning: Declared entry count (${totalDataEntriesExpected}) does not match actual data lines (${parsedInputLines.length}). Processing available lines.`);
    }

    // Transform each remaining line into a more structured object.
    // This makes accessing properties by name (e.g., 'identifier', 'numericValue')
    // more readable and less error-prone than array indices.
    const structuredDataCollection = parsedInputLines.map((currentLineContent, currentLineIdx) => {
        const contentParts = currentLineContent.split(' ');

        // Validate the format of each data line.
        if (contentParts.length !== 2) {
            console.error(`Error: Data line "${currentLineContent}" at original line ${currentLineIdx + 2} is malformed. Skipping.`);
            return null; // Return null for invalid lines, to be filtered out later.
        }

        const itemIdentifier = contentParts[0];
        const itemNumericScore = Number(contentParts[1]);

        // Validate the numeric part of the data.
        if (isNaN(itemNumericScore)) {
            console.error(`Error: Non-numeric score "${contentParts[1]}" found at original line ${currentLineIdx + 2}. Skipping.`);
            return null;
        }

        // Store the original 1-based index (accounting for the shifted N and 0-based array index).
        return {
            originalLineNumber: currentLineIdx + 2,
            identifier: itemIdentifier,
            numericValue: itemNumericScore
        };
    }).filter(entry => entry !== null); // Remove any records that were invalid and returned null.

    // Sort the collection of structured data records using our custom comparison function.
    structuredDataCollection.sort(sortDataEntries);

    // After sorting, extract only the original line numbers (indices) from the sorted records.
    const finalSortedOriginalIndices = structuredDataCollection.map(entry => entry.originalLineNumber);

    // Output the resulting indices, each on a new line.
    console.log(finalSortedOriginalIndices.join('\n'));
}

// Read the entire content of the standard input asynchronously and then process it.
const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
handleInputAndSort(fileInputContent);