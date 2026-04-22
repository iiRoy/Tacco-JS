const fileSystemHandler = require('fs');

// Define constants for file paths and specific string patterns
const STANDARD_INPUT_SOURCE = '/dev/stdin';
const EMPTY_TEXT_REPRESENTATION = "";
const PARENTHESIS_PAIR_REGEX = /\(\)/g; // Regular expression to match '()' globally

/**
 * Retrieves the raw textual data from a specified file path.
 * Includes error handling for file access issues.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string} The complete raw content of the file, or an empty string on error.
 */
function fetchRawDocumentContent(sourcePath) {
    try {
        // Read file synchronously, ensuring UTF-8 encoding
        const documentContent = fileSystemHandler.readFileSync(sourcePath, 'utf8');
        return documentContent;
    } catch (readError) {
        // Output a warning if the file cannot be read and return an empty string
        console.error("Issue encountered while accessing input document:", readError.message);
        return EMPTY_TEXT_REPRESENTATION;
    }
}

/**
 * Transforms a multi-line string into an array of individual lines,
 * trimming each line and filtering out any empty results.
 * @param {string} fullTextData - The raw string containing multiple lines.
 * @returns {string[]} An array of processed lines.
 */
function tokenizeInputIntoLines(fullTextData) {
    // If the input is empty or just whitespace, return an empty array immediately
    if (!fullTextData || fullTextData.trim() === EMPTY_TEXT_REPRESENTATION) {
        return [];
    }
    // Trim the entire data block, then split by newlines.
    // Each resulting line is also trimmed to remove leading/trailing whitespace.
    return fullTextData
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== EMPTY_TEXT_REPRESENTATION); // Remove any lines that become empty after trimming
}

/**
 * Iteratively removes all adjacent '()' sequences from a given string
 * until no more such pairs can be found.
 * @param {string} sequenceToPurify - The string that needs cleaning.
 * @returns {string} The string after all '()' pairs have been removed.
 */
function removeRedundantParenthesisPairs(sequenceToPurify) {
    let currentWorkingSequence = sequenceToPurify;
    let sequenceModifiedInPass = true; // Sentinel to control the loop

    // Continue processing as long as the sequence was modified in the last pass
    while (sequenceModifiedInPass) {
        const lengthBeforePass = currentWorkingSequence.length;
        // Replace all occurrences of '()' with an empty string in one pass
        currentWorkingSequence = currentWorkingSequence.replace(PARENTHESIS_PAIR_REGEX, EMPTY_TEXT_REPRESENTATION);
        // Check if the sequence length changed, indicating '()' pairs were removed
        if (currentWorkingSequence.length === lengthBeforePass) {
            sequenceModifiedInPass = false; // No changes, so stop looping
        }
    }
    return currentWorkingSequence;
}

// --- Main application logic begins here ---

// Step 1: Acquire the raw content from standard input
const rawInputContent = fetchRawDocumentContent(STANDARD_INPUT_SOURCE);

// Step 2: Process the raw content into an array of meaningful lines
let processedInputLines = tokenizeInputIntoLines(rawInputContent);

// Early exit condition: If no valid input lines were found, output "NO"
if (processedInputLines.length === 0) {
    console.log("NO");
    // process.exit(0); // Optionally terminate the process
}

// Step 3: Extract the total number of processing iterations from the first line
// The .shift() method removes the first element from the array.
const totalProcessingIterations = Number(processedInputLines.shift());

// Initialize an accumulator for the final string sequence
let accumulatedResultantSequence = EMPTY_TEXT_REPRESENTATION;

// Step 4: Iterate through the remaining input lines to construct the primary sequence
// Using a traditional for loop to match the original control flow
for (let currentIterationIndex = 0; currentIterationIndex < totalProcessingIterations; currentIterationIndex++) {
    const currentLineEntry = processedInputLines[currentIterationIndex];

    // Validation: Ensure the current line entry exists
    if (!currentLineEntry) {
        console.warn(`Warning: Missing input line for iteration ${currentIterationIndex}. Skipping this operation.`);
        continue;
    }

    // Split the line into its constituent parts (character string and repetition count)
    const lineComponentsArray = currentLineEntry.split(' ');

    // Validation: Check if the line has exactly two expected components
    if (lineComponentsArray.length !== 2) {
        console.warn(`Warning: Malformed input line "${currentLineEntry}" at iteration ${currentIterationIndex}. Expected two parts (string and count), found ${lineComponentsArray.length}. Skipping.`);
        continue;
    }

    const stringToReplicate = lineComponentsArray[0];
    // Explicitly convert the second component to a number
    const replicationCount = Number(lineComponentsArray[1]);

    // Validation: Ensure the replication count is a valid non-negative number
    if (isNaN(replicationCount) || replicationCount < 0) {
        console.warn(`Warning: Invalid replication count "${lineComponentsArray[1]}" for iteration ${currentIterationIndex}. Must be a non-negative number. Skipping.`);
        continue;
    }

    // Modern JavaScript way to repeat a string
    const generatedSegment = stringToReplicate.repeat(replicationCount);
    // Append the newly generated segment to the main sequence accumulator
    accumulatedResultantSequence += generatedSegment;
}

// Step 5: Apply the cleansing process to the accumulated sequence
const finalPurifiedSequence = removeRedundantParenthesisPairs(accumulatedResultantSequence);

// Step 6: Determine the final outcome based on whether the sequence is entirely empty
const isSequenceUltimatelyCleared = (finalPurifiedSequence === EMPTY_TEXT_REPRESENTATION);

// Output the result to the console
if (isSequenceUltimatelyCleared) {
    console.log("YES");
} else {
    console.log("NO");
}