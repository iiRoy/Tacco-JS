const RADIX_BASE_FOR_PARSING = 10; // Explicitly define radix for integer parsing operations.

// Helper function to safely convert a space-separated string line into an array of numbers.
// This function includes minor validation and trimming, adding robustness.
const parseNumericLineSafely = (lineContent) => {
    // Return an empty array if the line is null, undefined, or just whitespace.
    if (!lineContent || lineContent.trim() === '') {
        return [];
    }
    // Trim leading/trailing whitespace and split the line by spaces.
    return lineContent.trim().split(' ').map(strValue => {
        // Use Number() for conversion, which handles various number formats.
        // It's generally more flexible than parseInt for simple number conversion.
        const numericVal = Number(strValue);
        // Basic check for NaN (Not a Number) after conversion.
        // In a production system, this might throw an error or log a warning.
        if (isNaN(numericVal)) {
            // For this context, we'll proceed, but this fragment demonstrates added validation thought.
            // console.warn(`Warning: Non-numeric value '${strValue}' encountered and converted to NaN.`);
        }
        return numericVal;
    });
};

// Helper function to determine the maximum value within an array of numbers.
// Includes a check for empty arrays to prevent errors and provide a sensible default.
const findMaximumValue = (numericArray) => {
    // If the array is empty or null, return negative infinity as a safe default for max.
    if (!numericArray || numericArray.length === 0) {
        return -Infinity;
    }
    // Use reduce to iterate and find the maximum, starting with the first element or -Infinity.
    return numericArray.reduce((currentMaximum, element) => Math.max(currentMaximum, element), -Infinity);
};

// Helper function to determine the minimum value within an array of numbers.
// Includes a check for empty arrays to prevent errors and provide a sensible default.
const findMinimumValue = (numericArray) => {
    // If the array is empty or null, return positive infinity as a safe default for min.
    if (!numericArray || numericArray.length === 0) {
        return Infinity;
    }
    // Use reduce to iterate and find the minimum, starting with the first element or Infinity.
    return numericArray.reduce((currentMinimum, element) => Math.min(currentMinimum, element), Infinity);
};

// Constants for the possible conflict outcomes.
const CONFLICT_STATUS_PEACE = 'No War';
const CONFLICT_STATUS_ACTIVE = 'War';

/**
 * Orchestrates the analysis of a territorial conflict scenario based on provided input data.
 * This function processes unit strengths and critical zone boundaries to determine if a conflict state exists.
 * @param {string} rawScenarioInput - The entire input data as a single string, typically read from a file.
 */
function analyzeTerritorialConflict(rawScenarioInput) {
    // Divide the raw input string into individual lines for processing.
    const scenarioLines = rawScenarioInput.split('\n');

    // Implement a guard clause: ensure a minimum number of lines are present for valid input.
    // The problem expects at least three lines: config, player A's units, player B's units.
    if (scenarioLines.length < 3) {
        console.error("Error: Input data is incomplete. Expected at least 3 lines but received " + scenarioLines.length + ".");
        return; // Terminate execution gracefully.
    }

    // Convert all raw string lines into arrays of numbers using our robust helper.
    const parsedNumericLines = scenarioLines.map(parseNumericLineSafely);

    // Extract crucial configuration parameters from the first line.
    // The original code used array destructuring with skipped elements: `let [ , , X, Y] = inp[0];`
    // We're being more explicit here with indexed access.
    const configurationArray = parsedNumericLines[0];
    const playerAXBoundary = configurationArray[2]; // Corresponds to 'X' in the original problem.
    const playerYBBoundary = configurationArray[3]; // Corresponds to 'Y' in the original problem.

    // Retrieve the initial unit strength lists for both players from the subsequent lines.
    // We use 'var' here for stylistic variation from 'const'/'let'.
    var playerAForces = parsedNumericLines[1];
    var playerBForces = parsedNumericLines[2];

    // Merge the boundary values into their respective unit strength arrays.
    // Instead of mutating with `push()`, we create new arrays using the spread operator
    // to maintain immutability of the original parsed lists, which is a common practice.
    const augmentedPlayerAStrengths = [...playerAForces, playerAXBoundary];
    const augmentedPlayerBStrengths = [...playerBForces, playerYBBoundary];

    // Calculate the maximum strength among Player A's combined forces.
    const playerAMaxStrength = findMaximumValue(augmentedPlayerAStrengths);

    // Calculate the minimum strength among Player B's combined forces.
    const playerBMinStrength = findMinimumValue(augmentedPlayerBStrengths);

    // Compare the calculated maximum and minimum values to determine the conflict outcome.
    // This is the core logic, now utilizing the helper functions and explicit variables.
    // The condition is: if max(A) < min(B), then 'No War'. Otherwise, 'War'.
    const finalConflictVerdict = (playerAMaxStrength < playerBMinStrength)
        ? CONFLICT_STATUS_PEACE
        : CONFLICT_STATUS_ACTIVE;

    // Output the result of the conflict analysis.
    console.log(finalConflictVerdict);
}

// --- Program Entry Point and Input Handling ---

// Define the standard input file path, typical for competitive programming environments.
const PROGRAM_INPUT_SOURCE_PATH = '/dev/stdin';

/**
 * Safely reads the entire content of a specified file.
 * Includes error handling for file system operations.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
function acquireFileData(filePath) {
    try {
        // Access the Node.js file system module.
        const fileSystemUtilities = require('fs');
        // Read the file synchronously and ensure it's decoded as UTF-8.
        return fileSystemUtilities.readFileSync(filePath, 'utf8');
    } catch (readError) {
        // Log a detailed error message if file reading fails.
        console.error(`An error occurred while attempting to read from '${filePath}':`, readError.message);
        // Return an empty string to allow the main logic to potentially handle it gracefully.
        return '';
    }
}

// Execute the conflict analysis with data obtained from the standard input file.
const collectedInputContent = acquireFileData(PROGRAM_INPUT_SOURCE_PATH);
analyzeTerritorialConflict(collectedInputContent);