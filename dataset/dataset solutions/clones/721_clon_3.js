// This script is designed to process multiple lines of text provided via standard input.
// Its primary function is to validate the structural balance of specific character pairs,
// namely square brackets '[]' and parentheses '()', within each line.
// Non-essential characters are first removed, and then the core logic attempts
// to iteratively collapse all valid '[]' and '()' pairs until no more can be found.
// The final determination for each line is whether all such structural elements
// have been successfully balanced and removed.

const fileSystemModule = require('fs'); // Import the Node.js file system module for I/O operations.

// Define the absolute path for reading standard input on Unix-like systems.
const standardInputEndpoint = '/dev/stdin';

// Define a regular expression pattern to identify and filter out characters
// that are not part of the structural balance check. This includes:
// - All alphabetic characters (case-insensitive)
// - The literal period/dot character
// - Any whitespace character (spaces, tabs, newlines, etc.)
const irrelevantCharacterFilter = /[A-Za-z.\s]/g;

// Define a regular expression pattern to find and collapse valid, adjacent
// pairs of brackets or parentheses. This pattern matches either '[]' or '()'.
const validPairCollapsePattern = /\[\]|\(\)/g;

/**
 * Evaluates a given text string to determine if its bracket and parenthesis pairs are balanced.
 * The process involves filtering out non-structural characters and then iteratively
 * collapsing all '[]' and '()' pairs until the string can no longer be reduced.
 *
 * @param {string} textSegment - The individual line of text to be analyzed.
 * @returns {string} 'yes' if all structural pairs are balanced and the string becomes empty,
 *                   'no' otherwise.
 */
function assessBracketBalance(textSegment) {
    // Step 1: Preliminary filtering. Remove all characters deemed irrelevant
    // to the structural balance check. A mutable string variable is used here.
    let currentWorkingString = textSegment.replace(irrelevantCharacterFilter, '');

    // Optimization/Guard Clause: If the string is already empty after initial filtering,
    // it implies trivial balance, so we can return 'yes' immediately.
    if (currentWorkingString.length === 0) {
        return 'yes';
    }

    // Step 2: Iteratively collapse all found '[]' and '()' pairs.
    // This loop continues as long as replacements are being successfully made,
    // indicating that the string is still being reduced.
    let reductionOccurredInIteration = true;
    while (reductionOccurredInIteration) {
        const stringStateBeforeReduction = currentWorkingString; // Capture state before modification.
        currentWorkingString = currentWorkingString.replace(validPairCollapsePattern, '');

        // Check if the string's length changed after the replacement.
        // If it didn't, no more pairs could be collapsed, and the loop should terminate.
        reductionOccurredInIteration = (stringStateBeforeReduction.length !== currentWorkingString.length);
    }

    // Step 3: Final determination. If the string is completely empty after all
    // possible collapses, it signifies that all structural pairs were perfectly balanced.
    return (currentWorkingString === '') ? 'yes' : 'no';
}

// Main execution block:
try {
    // Read the entire content from the specified standard input path.
    // The content is interpreted as a UTF-8 encoded string.
    const fullInputBuffer = fileSystemModule.readFileSync(standardInputEndpoint, { encoding: 'utf8' });

    // Pre-process the input:
    // 1. Trim any leading or trailing whitespace from the entire input block.
    // 2. Split the cleaned block into an array of individual lines using the newline character as a delimiter.
    // 3. For each resulting line, apply a trim operation to remove any line-specific
    //    leading/trailing whitespace, ensuring consistent line content.
    const individualInputLines = fullInputBuffer.trim().split('\n').map(singleLine => singleLine.trim());

    // Iterate through each line prepared for evaluation.
    // A standard 'for' loop is used to maintain explicit control over the iteration index.
    for (let lineIterator = 0; lineIterator < individualInputLines.length; lineIterator++) {
        const currentLineForProcessing = individualInputLines[lineIterator];

        // Guard Clause: Skip any lines that are empty after trimming.
        // This prevents unnecessary processing for blank lines.
        if (currentLineForProcessing.length === 0) {
            continue;
        }

        // Invoke the core logic function to get the balance assessment for the current line.
        const balanceVerdict = assessBracketBalance(currentLineForProcessing);

        // Output the result of the balance assessment to standard output.
        console.log(balanceVerdict);
    }

} catch (processingError) {
    // Catch and report any errors that occur during file reading or script execution.
    // This provides basic robustness to the script.
    console.error(`An unexpected error interrupted the process: ${processingError.message}`);
    // Optionally, a non-zero exit code could be used here to signal failure to the shell.
    // process.exit(1);
}