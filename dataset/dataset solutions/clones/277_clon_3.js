const INPUT_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';
const MINIMUM_WORD_CHAR_COUNT = 3;
const MAXIMUM_WORD_CHAR_COUNT = 6;

// A utility function to determine if a string's effective length (excluding a potential trailing period)
// falls within the predefined acceptable range.
const isWordLengthValid = (candidateString) => {
    const processedString = candidateString.endsWith('.')
        ? candidateString.slice(0, -1) // Remove trailing period for length check
        : candidateString;
    return processedString.length >= MINIMUM_WORD_CHAR_COUNT && processedString.length <= MAXIMUM_WORD_CHAR_COUNT;
};

// Function responsible for reading the raw input stream and transforming it into an array of clean words.
const acquireAndNormalizeInputTokens = (sourcePath, encoding) => {
    // Utilize the 'fs' module to synchronously read the entire file content.
    const rawStreamContent = require('fs').readFileSync(sourcePath, encoding);

    // Step 1: Remove all comma characters from the content.
    const contentWithoutCommas = rawStreamContent.split(',').join('');

    // Step 2: Trim any leading or trailing whitespace from the entire string.
    const trimmedContent = contentWithoutCommas.trim();

    // Step 3: Split the content into individual tokens based on one or more whitespace characters.
    // Also, filter out any empty strings that might result from multiple spaces.
    const tokenizedInputArray = trimmedContent.split(/\s+/).filter(token => token.length > 0);

    return tokenizedInputArray;
};

// --- Main Processing Logic Starts Here ---

// Retrieve the preprocessed input tokens.
const processedInputUnits = acquireAndNormalizeInputTokens(INPUT_SOURCE_PATH, TEXT_ENCODING_FORMAT);

// Initialize a list to store the final, constructed output segments.
const collectedOutputSegments = [];

// Initialize a mutable string builder to accumulate parts of the current segment.
let currentSegmentBuilder = '';

// Iterate through each token obtained from the input.
for (let tokenPosition = 0; tokenPosition < processedInputUnits.length; tokenPosition++) {
    const currentUnit = processedInputUnits[tokenPosition]; // The token currently being examined.

    // Skip processing if the current token is an empty string, which might occur even after filtering.
    if (currentUnit.length === 0) {
        continue;
    }

    const unitContainsPeriod = currentUnit.includes('.');       // Check if a period exists anywhere.
    const unitEndsWithPeriod = currentUnit.endsWith('.');       // Check if the period is at the very end.
    let pendingBuilderReset = false; // Flag to indicate if currentSegmentBuilder should be cleared.

    // Conditional logic based on the presence and position of punctuation.
    if (unitContainsPeriod) {
        // A period is present in the current unit.
        
        // If the effective length of the unit (excluding a potential trailing period) is valid.
        if (isWordLengthValid(currentUnit)) {
            if (unitEndsWithPeriod) {
                // The unit ends with a period, signaling a segment completion.
                currentSegmentBuilder += currentUnit.slice(0, -1); // Append unit without its trailing period.
                collectedOutputSegments.push(currentSegmentBuilder); // Store the completed segment.
                // IMPORTANT: The original code does NOT reset 'str' (currentSegmentBuilder) here.
                // This means subsequent words can continue appending to the *same* builder that was just pushed.
            } else {
                // The unit contains a period, but not at the end. Append the unit as-is.
                currentSegmentBuilder += currentUnit;
            }
        } else {
            // The unit contains a period, but its effective length is out of range.
            // This invalidates the current accumulation, so mark for reset.
            pendingBuilderReset = true;
        }
    } else {
        // No period found in the current unit.
        
        // Check if the unit's length itself is within the valid range.
        if (currentUnit.length >= MINIMUM_WORD_CHAR_COUNT && currentUnit.length <= MAXIMUM_WORD_CHAR_COUNT) {
            currentSegmentBuilder += currentUnit + ' '; // Append the unit followed by a space.
        } else {
            // The unit has no period, and its length is out of range.
            // Mark for reset.
            pendingBuilderReset = true;
        }
    }

    // If the pendingBuilderReset flag was set during the processing, clear the builder.
    if (pendingBuilderReset) {
        currentSegmentBuilder = '';
    }
}

// --- Output Generation Logic ---

// Only proceed to print if there are segments collected in the final output.
if (collectedOutputSegments.length > 0) {
    let segmentPrintIterator = 0; // Initialize a counter for printing.
    // Use a while loop for diversity in loop structures.
    while (segmentPrintIterator < collectedOutputSegments.length) {
        console.log(collectedOutputSegments[segmentPrintIterator]);
        segmentPrintIterator++; // Manually increment the iterator.
    }
}
// An optional log message if no segments were formed (can be uncommented for debugging).
// else {
//     console.log("No valid output segments were generated based on the input processing rules.");
// }