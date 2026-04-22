const fileSystem = require('fs');

// --- Configuration Parameters ---
// Specifies the file path for data input.
const DATA_SOURCE_PATH = '/dev/stdin';
// Defines the character sequence used to separate distinct records (lines).
const RECORD_SEPARATOR_CHAR = '\n';
// Defines the character used to delimit individual fields within a record.
const FIELD_DELIMITER_CHAR = ',';

// --- Utility Functions ---

/**
 * Securely retrieves and prepares raw textual content from a designated file.
 * Incorporates error handling for file access issues.
 * @param {string} sourcePath - The complete path to the input file.
 * @returns {string | null} The cleaned content of the file, or null if an error occurred.
 */
function acquireFileContent(sourcePath) {
    try {
        // Reads the entire file content as a UTF-8 string.
        const contentBuffer = fileSystem.readFileSync(sourcePath, 'utf8');
        // Removes any leading or trailing whitespace before returning.
        return contentBuffer.trim();
    } catch (readError) {
        // Logs a detailed error message if file reading fails.
        console.error(`Failed to read data from ${sourcePath}:`, readError.message);
        return null; // Indicates a failure to obtain content.
    }
}

/**
 * Transforms a single, raw text line into an array of numeric values.
 * Includes validation to ensure all parsed components are valid numbers.
 * @param {string} recordString - The textual representation of a single data record.
 * @param {string} separator - The character used to split fields within the record.
 * @returns {number[] | null} An array of numbers if parsing is successful, otherwise null.
 */
function parseRecordToNumericArray(recordString, separator) {
    // Splits the record string into an array of string fields.
    const stringFieldSegments = recordString.split(separator);

    // The original logic expects at least two numeric values per record for calculation.
    if (stringFieldSegments.length < 2) {
        // console.warn(`Skipping incomplete record: "${recordString}". At least two fields are required.`);
        return null; // Invalid record format.
    }

    // Converts each string segment to a number.
    const numericFieldValues = stringFieldSegments.map(str => Number(str));

    // Verifies that every converted value is a legitimate number.
    const allFieldsAreValidNumbers = numericFieldValues.every(val => !isNaN(val));

    return allFieldsAreValidNumbers ? numericFieldValues : null;
}

/**
 * Processes an array of raw text records, converting each into a validated array of numbers.
 * Invalid records (those that cannot be parsed) are filtered out.
 * @param {string[]} rawRecordCollection - An array of strings, where each string is a data record.
 * @param {string} fieldSeparator - The character used to separate fields within each record.
 * @returns {number[][]} An array of arrays, with each inner array containing numeric data.
 */
function transformRawRecordsToNumericEntries(rawRecordCollection, fieldSeparator) {
    // Maps each raw record through the parsing function and filters out any null results.
    return rawRecordCollection
        .map(record => parseRecordToNumericArray(record, fieldSeparator))
        .filter(processedEntry => processedEntry !== null);
}

/**
 * Computes two key metrics from a collection of numeric data pairs:
 * 1. The total sum of products (first element * second element).
 * 2. The rounded average of all second elements.
 * @param {number[][]} numericDataPairs - An array of arrays, where each inner array is [valueA, valueB].
 * @returns {{weightedSum: number, roundedAverageOfSecond: number}} An object holding the computed metrics.
 */
function performDataAggregation(numericDataPairs) {
    let accumulatedWeightedSum = 0; // Stores the sum of (valueA * valueB).
    let accumulatedSecondElementSum = 0; // Stores the sum of all valueB.
    let countOfValidPairs = 0; // Tracks how many pairs contributed to the sum.

    // Iterates over each pair to accumulate necessary sums.
    for (const currentDataPair of numericDataPairs) {
        // Ensures the current pair is valid and has at least two elements.
        if (currentDataPair && currentDataPair.length >= 2) {
            accumulatedWeightedSum += currentDataPair[0] * currentDataPair[1];
            accumulatedSecondElementSum += currentDataPair[1];
            countOfValidPairs++;
        }
    }

    // Calculates the rounded average of the second elements.
    // Implements a guard to prevent division by zero if no valid pairs were found.
    const roundedAverageSecondElement = (countOfValidPairs > 0)
        ? Math.round(accumulatedSecondElementSum / countOfValidPairs)
        : 0; // Defaults to 0 if no data to average.

    return {
        weightedSum: accumulatedWeightedSum,
        roundedAverageOfSecond: roundedAverageSecondElement
    };
}

/**
 * Displays the final calculated metrics to the standard output.
 * @param {{weightedSum: number, roundedAverageOfSecond: number}} computedMetrics - The object containing results.
 */
function outputAnalysisResults(computedMetrics) {
    // Presents the results using clear, descriptive labels.
    console.log(`Total Product Sum: ${computedMetrics.weightedSum}, Average of Quantities: ${computedMetrics.roundedAverageOfSecond}`);
}

// --- Primary Execution Flow ---

/**
 * Orchestrates the entire data processing and analysis pipeline.
 */
function executeMainAnalysisProcess() {
    // Step 1: Obtain raw data from the configured source file.
    const rawContent = acquireFileContent(DATA_SOURCE_PATH);

    // Guard clause: Exit if no content was retrieved or it's empty.
    if (!rawContent || rawContent.length === 0) {
        console.error("No content available for processing. Terminating.");
        return;
    }

    // Step 2: Split the raw content into individual records (lines).
    // Filters out any empty records that might arise from splitting.
    const rawRecords = rawContent.split(RECORD_SEPARATOR_CHAR).filter(rec => rec.length > 0);

    // Guard clause: Exit if no valid records were parsed.
    if (rawRecords.length === 0) {
        console.error("No valid data records found in the input. Terminating.");
        return;
    }

    // Step 3: Convert raw records into a structured array of numeric entries.
    const structuredNumericEntries = transformRawRecordsToNumericEntries(rawRecords, FIELD_DELIMITER_CHAR);

    // Guard clause: Exit if no valid numeric entries could be processed.
    if (structuredNumericEntries.length === 0) {
        console.error("No valid numeric data entries were generated. Terminating.");
        return;
    }

    // Step 4: Perform the core aggregation calculations.
    const finalMetrics = performDataAggregation(structuredNumericEntries);

    // Step 5: Display the calculated results to the user.
    outputAnalysisResults(finalMetrics);
}

// Initiates the data analysis process upon script execution.
executeMainAnalysisProcess();