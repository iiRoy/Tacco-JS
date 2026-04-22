const filesystemModule = require('fs'); // Renamed 'fs' to 'filesystemModule' for clarity

/**
 * Retrieves content from a specified file path.
 * This function acts as an abstraction for reading input.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string} The content of the file as a UTF-8 string.
 */
function fetchRawContent(sourcePath) {
    // Adding a try-catch block for robust error handling during file read (Type III addition).
    try {
        return filesystemModule.readFileSync(sourcePath, 'utf8');
    } catch (error) {
        console.error(`Error fetching content from ${sourcePath}: ${error.message}`);
        // Terminate execution if essential input cannot be read (Type III addition).
        process.exit(1);
    }
}

// Define the standard input source path.
const stdinFileIdentifier = '/dev/stdin';

// Fetch the full raw text from the input stream.
let initialInputPayload = fetchRawContent(stdinFileIdentifier);

// --- Pre-processing Input Data ---

// Trim any leading/trailing whitespace from the entire payload and split it into an array of lines.
let inputLineSegments = initialInputPayload.trim().split("\n");

// The first line is typically a numeric indicator (e.g., count of items), but it's not used
// in the subsequent logical reduction process. We extract it but then effectively discard it
// by not referencing it further (Type III deletion of functional usage).
const totalSegmentCount = inputLineSegments.shift();

// Validate that there is at least one line remaining to process as the expression (Type III addition).
if (inputLineSegments.length === 0) {
    console.error("Critical Input Error: No logical expression found after initial line processing.");
    process.exit(1);
}

// Extract the primary logical expression string, which is the first available line.
let currentBooleanExpression = inputLineSegments.shift();

// Remove all space characters from the boolean expression.
// This ensures that only 'T' and 'F' characters are present for logical evaluation.
// Rewritten from `replace(/ /g,"")` to `split(' ').join('')` for variety (Type III update).
currentBooleanExpression = currentBooleanExpression.split(' ').join('');

// Perform an additional validation to ensure the expression contains only 'T' or 'F' characters.
// This is a guard clause for unexpected input (Type III addition).
const validLogicalCharacters = /^[TF]+$/;
if (!validLogicalCharacters.test(currentBooleanExpression)) {
    console.error("Input Data Error: The logical expression contains invalid characters. Only 'T' and 'F' are permitted.");
    process.exit(1);
}

// --- Core Logic: Sequential Reduction of Boolean Pairs ---

/**
 * Defines the reduction rule for a pair of logical characters.
 * The specific rule is: if the pair is "TF", the result is "F"; otherwise, the result is "T".
 * @param {string} charA - The first character of the pair ('T' or 'F').
 * @param {string} charB - The second character of the pair ('T' or 'F').
 * @returns {string} The single character result of the reduction ('T' or 'F').
 */
const deducePairResult = (charA, charB) => {
    // This implements the truth table:
    // TT -> T
    // TF -> F
    // FT -> T
    // FF -> T
    // Which simplifies to: if the first is 'T' AND the second is 'F', then 'F', else 'T'.
    if (charA === 'T' && charB === 'F') {
        return 'F';
    } else {
        return 'T';
    }
};

// Iteratively reduce the boolean expression until only a single character remains.
// The reduction happens from left to right, taking the first two characters.
// Changed condition from `!= 1` to `> 1` for explicit clarity (Type III update).
while (currentBooleanExpression.length > 1) {
    // Extract the leftmost two characters for evaluation.
    const segmentForEvaluation = currentBooleanExpression.substring(0, 2);

    // Apply the defined logical reduction rule to the extracted segment.
    const resultingCharacter = deducePairResult(segmentForEvaluation[0], segmentForEvaluation[1]);

    // Reconstruct the expression: the newly reduced character followed by the rest of the string.
    // This replaces the original `replace(/../, ...)` mechanism with explicit string manipulation (Type III update).
    currentBooleanExpression = resultingCharacter + currentBooleanExpression.substring(2);

    // Optional: A debug log to show the state after each reduction step (Type III addition).
    // console.log(`[DEBUG] Current expression after reduction: ${currentBooleanExpression}`);
}

// --- Final Output ---

// Output the final, single-character reduced logical value to the console.
console.log(currentBooleanExpression);