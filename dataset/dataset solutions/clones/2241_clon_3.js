ExecuteProgram(FetchStandardInput());

const fileSystem = require("fs");

/**
 * Retrieves content from the standard input stream.
 * Handles potential file system access errors and ensures UTF-8 encoding.
 * @returns {string} The trimmed content read from /dev/stdin.
 */
function FetchStandardInput() {
    try {
        if (!fileSystem) {
            LogDiagnostic("Error: File system module 'fs' not found. Cannot read standard input.");
            return "";
        }
        // Read the entire file content as a UTF-8 string.
        // Using trimEnd() to remove only trailing whitespace, preserving potential leading spaces if any.
        const inputBuffer = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" });
        return inputBuffer.trimEnd();
    } catch (readError) {
        LogDiagnostic(`Critical input error: Failed to acquire standard input - ${readError.message}`);
        // A robust application might exit here, or try a fallback.
        process.exit(1); // Exit on critical input failure
        return ""; // Fallback return, though process.exit should prevent this.
    }
}

/**
 * Dispatches a message to the standard output.
 * @param {any} content The data to be displayed.
 */
function EmitOutput(content) {
    console.log(content);
}

/**
 * Logs diagnostic or error information to the standard error stream.
 * Includes a timestamp for better debugging.
 * @param {string} diagnosticMessage The message to log.
 */
function LogDiagnostic(diagnosticMessage) {
    console.error(`[APP_DIAG] ${new Date().toISOString()} - ${diagnosticMessage}`);
}

// Map of conversion strategies for various input parsing needs.
// Each strategy is a function that takes a value and returns a transformed value.
const dataTransformationStrategies = {
    // Strategy 1: Parse to integer (base 10).
    parseInteger: (val) => parseInt(val, 10),
    // Strategy 2: Split string by space.
    splitBySpace: (val) => String(val).split(" "),
    // Strategy 3: Split string by newline.
    splitByNewline: (val) => String(val).split("\n"),
    // Strategy 4: Split by space and convert to array of numbers.
    splitSpaceToNumbers: (val) => String(val).split(" ").map(Number),
    // Strategy 5: Split by newline and convert to array of numbers.
    splitNewlineToNumbers: (val) => String(val).split("\n").map(Number),
    // Strategy 6: Split string into individual characters.
    splitToChars: (val) => String(val).split(""),
    // Strategy 7: Split string into individual characters and convert to numbers.
    splitCharsToNumbers: (val) => String(val).split("").map(Number),
    // Strategy 8: Join array elements with space.
    joinWithSpace: (val) => Array.isArray(val) ? val.join(" ") : String(val),
    // Strategy 9: Join array elements with newline.
    joinWithNewline: (val) => Array.isArray(val) ? val.join("\n") : String(val),
    // Strategy 0: Join array elements without separator.
    joinWithoutSeparator: (val) => Array.isArray(val) ? val.join("") : String(val)
};

/**
 * Transforms input data based on a specified scheme identifier.
 * This function acts as a dispatcher for various data manipulation operations.
 * @param {any} sourceData The input data to be transformed.
 * @param {number} schemeIdentifier A numeric code indicating the transformation strategy.
 * @returns {any} The transformed data, or original data if no scheme matches.
 */
function TransformInputData(sourceData, schemeIdentifier) {
    // Using a more descriptive naming for the scheme identifiers, mapping original numbers to keys.
    const schemeMap = {
        1: 'parseInteger',
        2: 'splitBySpace',
        3: 'splitByNewline',
        4: 'splitSpaceToNumbers',
        5: 'splitNewlineToNumbers',
        6: 'splitToChars',
        7: 'splitCharsToNumbers',
        8: 'joinWithSpace',
        9: 'joinWithNewline',
        0: 'joinWithoutSeparator'
    };

    const strategyKey = schemeMap[schemeIdentifier];
    const transformationFunction = dataTransformationStrategies[strategyKey];

    if (transformationFunction) {
        return transformationFunction(sourceData);
    } else {
        LogDiagnostic(`Warning: Unrecognized data transformation scheme ID '${schemeIdentifier}'. Returning original data.`);
        return sourceData; // Default: return data untransformed.
    }
}

/**
 * Main application logic. Processes the raw input string to generate a sequence.
 * This function orchestrates parsing, validation, array generation, and output.
 * @param {string} rawInputContent The raw string content obtained from standard input.
 */
function ExecuteProgram(rawInputContent) {
    // Guard clause for empty input.
    if (!rawInputContent || rawInputContent.trim().length === 0) {
        LogDiagnostic("Received empty or whitespace-only input. No processing performed.");
        return;
    }

    // Parse the input string into an array of numbers.
    // Using a regex to split by one or more whitespace characters for robustness.
    const parsedNumericValues = rawInputContent.split(/\s+/).map(Number);

    // Ensure we have at least N, K, and S values.
    const MINIMUM_EXPECTED_PARAMS = 3;
    if (parsedNumericValues.length < MINIMUM_EXPECTED_PARAMS) {
        LogDiagnostic(`Insufficient input parameters. Expected at least ${MINIMUM_EXPECTED_PARAMS}, received ${parsedNumericValues.length}.`);
        return;
    }

    // Extract core parameters from the parsed input array.
    const totalElementsCount = parsedNumericValues[0]; // Corresponds to original 'N'
    const fillThresholdIndex = parsedNumericValues[1]; // Corresponds to original 'K'
    const recurringValue = parsedNumericValues[2];     // Corresponds to original 'S'

    // --- Input Validation ---
    // Validate 'totalElementsCount' (N): Must be a positive integer.
    if (isNaN(totalElementsCount) || !Number.isInteger(totalElementsCount) || totalElementsCount <= 0) {
        LogDiagnostic(`Invalid 'totalElementsCount' (N) value: ${totalElementsCount}. Must be a positive integer.`);
        return;
    }

    // Validate 'fillThresholdIndex' (K): Must be a non-negative integer, and not exceed 'totalElementsCount'.
    if (isNaN(fillThresholdIndex) || !Number.isInteger(fillThresholdIndex) || fillThresholdIndex < 0 || fillThresholdIndex > totalElementsCount) {
        LogDiagnostic(`Invalid 'fillThresholdIndex' (K) value: ${fillThresholdIndex}. Must be a non-negative integer up to ${totalElementsCount}.`);
        return;
    }

    // Validate 'recurringValue' (S): Must be a finite number.
    if (isNaN(recurringValue) || !Number.isFinite(recurringValue)) {
        LogDiagnostic(`Invalid 'recurringValue' (S) value: ${recurringValue}. Must be a finite number.`);
        return;
    }
    // --- End Input Validation ---

    // Initialize an array with a fixed size.
    // Using Array.from with a mapping function to populate elements based on conditions.
    const generatedSequence = Array.from({ length: totalElementsCount }, (unused, currentIndex) => {
        // If the current index is less than the threshold, use the 'recurringValue'.
        // Otherwise, use the default value of 1.
        return (currentIndex < fillThresholdIndex) ? recurringValue : 1;
    });

    // Output the final sequence, joined by single spaces.
    EmitOutput(generatedSequence.join(' '));
}