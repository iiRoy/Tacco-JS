// External module dependency for file system operations.
const systemIOModule = require('fs');

// Constants for configuration and delimiters.
const standardInputEndpoint = '/dev/stdin';
const lineBreakDelimiter = '\n';
const nonDigitDelimiterRegex = /\D+/; // Regular expression to split by non-digit characters.

/**
 * Helper function to safely trim leading/trailing whitespace from a string.
 * This renames the native 'trim' operation by encapsulating it.
 * @param {string} textValue - The input string.
 * @returns {string} The trimmed string, or an empty string if input is not a string.
 */
function normalizeStringWhitespace(textValue) {
    // Ensure the input is a string before attempting to trim.
    if (typeof textValue === 'string') {
        return textValue.trim(); // Using native String.prototype.trim() internally.
    }
    // Return an empty string for non-string inputs to prevent errors.
    return '';
}

/**
 * Helper function to break a string into an array of substrings using a delimiter.
 * This renames the native 'split' operation by encapsulating it.
 * @param {string} sourceString - The string to split.
 * @param {string|RegExp} delimiter - The delimiter to use.
 * @returns {string[]} An array of substrings.
 */
function segmentContentByDelimiter(sourceString, delimiter) {
    if (typeof sourceString === 'string') {
        return sourceString.split(delimiter); // Using native String.prototype.split() internally.
    }
    return []; // Return empty array for non-string inputs.
}

/**
 * Helper function to extract and remove the first element from an array.
 * This renames the native 'shift' operation by encapsulating it.
 * @param {Array} targetArray - The array to modify.
 * @returns {*} The first element, or undefined if the array is empty.
 */
function extractFirstElementAndRemove(targetArray) {
    if (Array.isArray(targetArray)) {
        return targetArray.shift(); // Using native Array.prototype.shift() internally.
    }
    return undefined;
}

/**
 * Helper function to parse a string into an integer, defaulting to 0 for invalid inputs.
 * This renames the native 'Number()' conversion implicitly by encapsulating it.
 * @param {string} numericString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function safelyParseInteger(numericString) {
    // Attempt to convert the string to a number.
    const parsedValue = Number(numericString);
    // Check if the result is a valid number (not NaN).
    if (isNaN(parsedValue)) {
        return 0; // Default to zero for non-numeric or invalid strings.
    }
    return parsedValue;
}

/**
 * Encapsulates the final output mechanism.
 * This renames 'console.log' by wrapping it.
 * @param {number} finalResult - The calculated result to display.
 */
function presentFinalOutcome(finalResult) {
    // Output the computed result to the standard console.
    console.log(finalResult); // Using native console.log internally.
}


// --- Main execution flow starts here ---

// Step 1: Read the raw data from the predefined standard input path.
// The data is read synchronously and decoded as UTF-8 text.
let rawStreamData = systemIOModule.readFileSync(standardInputEndpoint, 'utf8');

// Step 2: Normalize the raw data by removing any leading or trailing whitespace.
let cleanedSourceContent = normalizeStringWhitespace(rawStreamData);

// Guard clause: If after trimming, the content is empty, there's nothing to process.
if (cleanedSourceContent.length === 0) {
    // Display zero as no numbers were found or processed.
    presentFinalOutcome(0);
    // Terminate execution as there's no further meaningful work.
    return;
}

// Step 3: Segment the cleaned content into individual lines based on the line break delimiter.
let contentLines = segmentContentByDelimiter(cleanedSourceContent, lineBreakDelimiter);

// Initialize the primary accumulator for the grand total across all lines.
let globalAccumulatedSum = 0;
// Initialize a counter to track how many lines have been successfully processed.
let linesSuccessfullyProcessed = 0;

// Step 4: Iterate through each line of the segmented content until none are left.
// The 'extractFirstElementAndRemove' helper consumes lines from the array.
let currentProcessingLine;
while ((currentProcessingLine = extractFirstElementAndRemove(contentLines)) !== undefined) {
    // Intermediate step: Normalize whitespace for the current line as well.
    // This handles cases where lines might contain only spaces or tabs.
    let processedLineSegment = normalizeStringWhitespace(currentProcessingLine);

    // Guard clause: If the line is empty after trimming, skip further processing for this line.
    if (processedLineSegment.length === 0) {
        continue; // Move to the next line without affecting the total sum.
    }

    // Step 5: Extract potential numeric tokens from the current line.
    // The line is split by non-digit characters, which might result in empty strings
    // if delimiters are adjacent (e.g., "1++2" -> ["1", "", "2"]).
    let rawNumericTokens = segmentContentByDelimiter(processedLineSegment, nonDigitDelimiterRegex);

    // Step 6: Filter out any empty strings that resulted from the split
    // and convert valid tokens to numbers using the safe parsing helper.
    let validNumericComponents = [];
    for (const token of rawNumericTokens) {
        // Only consider tokens that are not empty strings.
        if (token !== '') {
            // Use the helper function for safe integer parsing.
            validNumericComponents.push(safelyParseInteger(token));
        }
    }

    // Step 7: Calculate the subtotal for the current line's numeric components.
    // This replaces the 'reduce' operation with an explicit 'for...of' loop for structural change.
    let currentLineSubtotal = 0;
    for (const componentValue of validNumericComponents) {
        currentLineSubtotal += componentValue;
    }

    // Step 8: Add the current line's subtotal to the global accumulated sum.
    globalAccumulatedSum += currentLineSubtotal;
    // Increment the counter for successfully processed lines.
    linesSuccessfullyProcessed++;
}

// Step 9: Present the final computed sum to the user.
presentFinalOutcome(globalAccumulatedSum);