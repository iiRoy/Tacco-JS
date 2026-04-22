"use strict";

// This function serves as the primary entry point for processing the input data.
// It analyzes a given character sequence to determine if it matches specific patterns.
const analyzeCharacterSequence = (inputDataSet) => {

    // The first line of the input data set is expected to contain the sequence for analysis.
    let targetSequence = inputDataSet[0];

    // A boolean flag to keep track if any of the predefined patterns are successfully identified.
    let patternDetected = false;

    // Define the exact length expected for the target sequence as a constant for clarity and maintainability.
    const EXPECTED_STRING_LENGTH = 4;

    // --- Input Validation and Early Exit (Type III: Guard Clause / New Fragments) ---
    // Perform robust validation on the input target sequence.
    // Check if it's null, undefined, not a string, or doesn't match the expected length.
    if (!targetSequence || typeof targetSequence !== 'string' || targetSequence.length !== EXPECTED_STRING_LENGTH) {
        // If the input is invalid, no pattern can be matched. Log 'No' and terminate execution for this input.
        console.log('No');
        return;
    }

    // --- Character Extraction (Type III: Helper Variables / Intermediate Steps) ---
    // Extract individual characters from the target sequence into distinct, descriptive variables.
    // Using `charAt()` explicitly states intent over direct bracket notation.
    const firstPositionChar = targetSequence.charAt(0);  // Character at index 0
    const secondPositionChar = targetSequence.charAt(1); // Character at index 1
    const thirdPositionChar = targetSequence.charAt(2);  // Character at index 2
    const fourthPositionChar = targetSequence.charAt(3); // Character at index 3

    // --- Pattern Evaluation Logic (Type III: Rewritten Statements / Extensive Changes) ---

    // Evaluate the first pattern type: AABB (e.g., "1122", "aabb").
    // This requires the first two characters to be identical, the last two to be identical,
    // and critically, the first pair must be different from the second pair.
    const checkPatternAABB = (
        firstPositionChar === secondPositionChar &&
        thirdPositionChar === fourthPositionChar &&
        firstPositionChar !== thirdPositionChar
    );

    // Evaluate the second pattern type: ABAB (e.g., "1212", "cdcd").
    // This requires the first and third characters to be identical, the second and fourth to be identical,
    // and the first character must be different from the second character.
    const checkPatternABAB = (
        firstPositionChar === thirdPositionChar &&
        secondPositionChar === fourthPositionChar &&
        firstPositionChar !== secondPositionChar
    );

    // Evaluate the third pattern type: ABBA (e.g., "1221", "effe").
    // This requires the first and fourth characters to be identical, the second and third to be identical,
    // and the first character must be different from the second character.
    const checkPatternABBA = (
        firstPositionChar === fourthPositionChar &&
        secondPositionChar === thirdPositionChar &&
        firstPositionChar !== secondPositionChar
    );

    // --- Consolidate Pattern Detection (Type III: Updated/Rewritten Logic) ---
    // If any of the specific pattern checks result in true, set the overall detection flag to true.
    // This replaces multiple conditional assignments with a single, clear logical OR operation.
    if (checkPatternAABB || checkPatternABAB || checkPatternABBA) {
        patternDetected = true;
    }

    // --- Final Output Generation (Type III: Updated Statement) ---
    // Prepare the final message based on whether any pattern was detected.
    // Using a ternary operator for concise conditional string assignment.
    const programResultOutput = patternDetected ? 'Yes' : 'No';

    // Print the determined result to the console.
    console.log(programResultOutput);
};

// --- Execution Entry Point (Type II: Renamed Identifiers, Type III: Minor Formatting) ---
// This block handles reading input from the standard input stream,
// typically used in competitive programming environments, and then
// invokes the main analysis function with the processed data.
analyzeCharacterSequence(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));