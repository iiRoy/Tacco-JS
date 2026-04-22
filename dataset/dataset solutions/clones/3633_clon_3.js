// This module is responsible for processing a numerical input to determine
// a participant's competition tier based on their performance score.
// It applies a set of predefined thresholds to classify the score.

/**
 * Defines the lower boundary for the "ARC" competition tier.
 * Scores strictly below this value typically fall into the "ABC" tier.
 * @type {number}
 */
const TIER_LOWER_BOUND = 1200;

/**
 * Defines the lower boundary for the "AGC" competition tier.
 * Scores strictly below this value (but at or above TIER_LOWER_BOUND)
 * typically fall into the "ARC" tier.
 * @type {number}
 */
const TIER_UPPER_BOUND = 2800;

/**
 * Reads raw text content from a specified file path, typically used for
 * standard input in competitive programming environments.
 * Includes basic error handling for file operations.
 *
 * @param {string} inputFilePath - The path to the file to be read (e.g., "/dev/stdin").
 * @returns {string | null} The content of the file as a UTF-8 string, or null if an error occurs.
 */
function fetchSourceMaterial(inputFilePath) {
    try {
        // Access the Node.js file system module.
        const fileSystemUtility = require("fs");
        // Read the entire file synchronously and decode it as UTF-8 text.
        const receivedDataBuffer = fileSystemUtility.readFileSync(inputFilePath, "utf8");
        return receivedDataBuffer;
    } catch (ioError) {
        // Report any issues encountered during the file reading process.
        console.error("Failed to retrieve source material from path:", inputFilePath, "Error:", ioError.message);
        return null; // Indicate a failure to read the file.
    }
}

/**
 * Classifies a given numerical score into one of the defined competition tiers.
 * This function encapsulates the core business logic for tier assignment.
 *
 * @param {number} participantScore - The validated numerical score of a participant.
 * @returns {string} The name of the determined competition tier ("ABC", "ARC", or "AGC").
 */
function assignCompetitionTier(participantScore) {
    let assignedCategory = "Undefined"; // Initialize with a placeholder value.

    // Evaluate the score against the defined thresholds.
    // The order of checks is inverted compared to the original,
    // starting from the highest threshold down to the lowest.

    const isAboveUpperThreshold = participantScore >= TIER_UPPER_BOUND;
    const isAboveLowerThreshold = participantScore >= TIER_LOWER_BOUND;

    if (isAboveUpperThreshold) {
        // If the score meets or exceeds the upper tier boundary, it's "AGC".
        assignedCategory = "AGC";
    } else if (isAboveLowerThreshold) {
        // If not "AGC", but meets or exceeds the lower tier boundary, it's "ARC".
        // This implicitly means participantScore is less than TIER_UPPER_BOUND.
        assignedCategory = "ARC";
    } else {
        // If neither of the above conditions are met, the score must be
        // strictly below TIER_LOWER_BOUND, thus it's "ABC".
        assignedCategory = "ABC";
    }

    return assignedCategory;
}

/**
 * The main orchestrator function that processes the raw input string,
 * validates it, and then determines and outputs the final competition tier.
 *
 * @param {string} incomingDataString - The raw string input, expected to contain a single numerical value.
 */
function processScoreForTier(incomingDataString) {
    // Step 1: Pre-processing and sanitization of the input string.
    // Remove any leading or trailing whitespace characters.
    const cleanedInput = incomingDataString ? incomingDataString.trim() : "";

    // Guard clause: Check if the input is empty after trimming.
    if (cleanedInput.length === 0) {
        console.error("Input string is empty or contains only whitespace. Cannot proceed with analysis.");
        return; // Terminate execution if input is invalid.
    }

    // Step 2: Attempt to convert the cleaned string into a numerical value.
    // Using Number() for parsing, which can be slightly different from parseInt()
    // for certain edge cases but generally suitable for competitive programming.
    const numericalRating = Number(cleanedInput);

    // Guard clause: Validate that the conversion resulted in a valid number.
    if (isNaN(numericalRating)) {
        console.error(`Input value '${cleanedInput}' cannot be converted to a valid numerical score. Aborting.`);
        return; // Terminate if the input is not a number.
    }

    // Optional: Add a check for non-negative scores, depending on problem constraints.
    // For this specific problem, negative scores would still fall into "ABC".
    if (numericalRating < 0) {
        console.warn(`A negative score (${numericalRating}) was detected. Processing as per standard rules.`);
    }

    // Step 3: Utilize the helper function to determine the appropriate tier.
    const finalTierResult = assignCompetitionTier(numericalRating);

    // Step 4: Output the determined competition tier to standard output.
    console.log(finalTierResult);
}

// Application Entry Point:
// This block executes when the script is run.
const standardInputDevicePath = "/dev/stdin"; // Standard path for input in Unix-like systems.
const rawInputContentFromSource = fetchSourceMaterial(standardInputDevicePath);

// Proceed with score analysis only if the input material was successfully acquired.
if (rawInputContentFromSource !== null) {
    processScoreForTier(rawInputContentFromSource);
} else {
    // If fetchSourceMaterial returned null, an error message has already been logged.
    // No further action needed here, as the problem is unrecoverable at this point.
}