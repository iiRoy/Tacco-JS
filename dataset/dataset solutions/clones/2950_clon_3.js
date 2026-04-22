const obtainSourceContent = () => {
    // This dedicated helper function is responsible for reading the raw input
    // from the standard input stream. It ensures the content is treated
    // as UTF-8 encoded text for consistent processing.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const parseNumericParameterSafely = (textSegment, fallbackValue = 0) => {
    // A robust utility to convert a string segment into an integer.
    // It uses base 10 for parsing and provides a configurable fallback value
    // in case the parsing operation fails (e.g., if the segment is not a valid number).
    const convertedNumber = parseInt(textSegment, 10);
    // If the result of parseInt is NaN (Not a Number), we return the specified fallback.
    return isNaN(convertedNumber) ? fallbackValue : convertedNumber;
};

const performCharacterCaseAdjust = (sourceSequence, charZeroBasedIndex) => {
    // This function modifies a specific character within a string to its lowercase equivalent.
    // It first validates the provided index to prevent errors or unexpected behavior
    // if the index is out of the string's bounds.
    if (charZeroBasedIndex < 0 || charZeroBasedIndex >= sourceSequence.length) {
        // If the index is invalid, the original string is returned without alteration.
        return sourceSequence;
    }

    // Deconstruct the source string into three distinct parts for manipulation:
    // 1. The segment before the target character.
    const initialPortion = sourceSequence.substring(0, charZeroBasedIndex);
    // 2. The target character itself, converted to lowercase.
    const adjustedCharacter = sourceSequence.charAt(charZeroBasedIndex).toLowerCase();
    // 3. The segment following the target character.
    const concludingPortion = sourceSequence.substring(charZeroBasedIndex + 1);

    // Reassemble and return the modified string.
    return `${initialPortion}${adjustedCharacter}${concludingPortion}`;
};


const processInputAndTransformString = (rawInputTextContent) => {
    'use strict'; // Enforcing strict mode within this processing function for cleaner code.

    // Step 1: Prepare the raw input by trimming extraneous whitespace and splitting it into an array of lines.
    const segmentedInputLines = rawInputTextContent.trim().split('\n');

    // Step 2: Implement initial validation for the input structure.
    // We expect at least two lines: one for the numeric parameter and one for the string.
    if (segmentedInputLines.length < 2) {
        console.error("Execution Aborted: Input data is incomplete. Expected at least two lines for processing.");
        return; // Terminate execution gracefully.
    }

    // Step 3: Extract and parse the numeric parameter from the first line.
    // The first line is anticipated to contain space-separated values; we're interested in the second value.
    const firstLineTokens = segmentedInputLines[0].split(' ');
    if (firstLineTokens.length < 2) {
        console.error("Execution Aborted: The first line of input is malformed. It must contain at least two space-separated parts.");
        return; // Terminate execution due to malformed input.
    }
    // Parse the 1-based position, defaulting to 1 if parsing fails or the value is missing.
    const oneBasedTargetPosition = parseNumericParameterSafely(firstLineTokens[1], 1);

    // Step 4: Retrieve the primary string from the second line of input.
    const primaryStringForModification = segmentedInputLines[1];

    // Step 5: Convert the 1-based position to a 0-based index suitable for JavaScript string operations.
    const zeroBasedModificationIndex = oneBasedTargetPosition - 1;

    // Step 6: Perform a critical check to ensure the calculated index is valid for the string.
    if (zeroBasedModificationIndex < 0 || zeroBasedModificationIndex >= primaryStringForModification.length) {
        // If the index is out of bounds, issue a warning and output the original string, as no modification can occur.
        console.warn(`Warning: The specified target position (${oneBasedTargetPosition}) is outside the valid range for the string "${primaryStringForModification}". No transformation applied.`);
        console.log(primaryStringForModification); // Output the unmodified string.
        return;
    }

    // Step 7: Apply the character case transformation using our dedicated helper function.
    const resultantModifiedString = performCharacterCaseAdjust(primaryStringForModification, zeroBasedModificationIndex);

    // Step 8: Output the final transformed string to the console.
    console.log(resultantModifiedString);
};

// The program's entry point:
// First, acquire the complete input content, then pass it to the main processing function.
processInputAndTransformString(obtainSourceContent());