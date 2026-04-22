/**
 * @file This module processes input data to determine remaining resource capacity.
 * @author CloneGenerator
 * @version 1.1.0
 */

/**
 * Executes the core calculation logic based on provided raw string input.
 * This function parses initial resource capacity and a list of consumption units,
 * then calculates the net remaining capacity.
 *
 * @param {string} rawInputString The complete raw input string, typically from a file or stdin.
 *                                 Expected format:
 *                                 Line 1: An integer representing initial resource.
 *                                 Line 2: Space-separated integers representing individual consumption units.
 * @returns {void} Outputs the result to the console.
 */
function executeCalculation(rawInputString) {
    // Standardize newline characters and remove any leading/trailing whitespace.
    // Also, filter out any completely empty lines that might result from splitting.
    const processedLines = rawInputString.trim().split(/\r?\n/).filter(line => line.length > 0);

    // --- Input Validation: Ensure we have at least two lines for processing ---
    if (processedLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        console.log(-1); // Indicate failure
        return;
    }

    // --- Parse the initial resource capacity from the first line ---
    // Split by any whitespace and take the first token.
    // Use Number.parseInt for explicit base 10 conversion.
    const capacityString = processedLines[0].split(/\s+/)[0];
    const initialResource = Number.parseInt(capacityString, 10);

    // --- Validation: Check if the initial resource value is a valid number ---
    if (isNaN(initialResource)) {
        console.error(`Error: Invalid initial resource value '${capacityString}' on line 1.`);
        console.log(-1); // Indicate failure
        return;
    }

    // --- Process consumption units from the second line ---
    // Split the second line by any whitespace to get individual usage strings.
    // Filter out any empty strings that might result from multiple spaces.
    const usageStringTokens = processedLines[1].split(/\s+/).filter(Boolean);

    let totalConsumption = 0; // Initialize accumulator for consumption

    // --- Iterate and sum up valid consumption units ---
    // We use a traditional for loop for potential early exit or more complex error handling per item.
    for (let i = 0; i < usageStringTokens.length; i++) {
        const currentUsageToken = usageStringTokens[i];
        const parsedUsage = Number.parseInt(currentUsageToken, 10);

        // Validate each parsed usage item. If invalid, skip it or handle as an error.
        if (isNaN(parsedUsage)) {
            console.warn(`Warning: Skipping invalid consumption unit '${currentUsageToken}' at index ${i} on line 2.`);
            // Optionally, you could choose to output -1 and return here if any invalid unit is critical.
            continue; // Move to the next item
        }

        totalConsumption += parsedUsage;
    }

    // --- Calculate the final remaining value ---
    const finalRemainingBalance = initialResource - totalConsumption;

    // --- Determine and output the final result ---
    if (finalRemainingBalance < 0) {
        // If consumption exceeds resources, output -1 as per requirements.
        console.error("Alert: Total consumption has exceeded the initial resource capacity.");
        console.log(-1);
    } else {
        // Otherwise, output the calculated remaining balance.
        console.log(finalRemainingBalance);
        // console.info(`Operation successful. Remaining capacity: ${finalRemainingBalance}.`); // Optional verbose output
    }
}

// --- Main execution block for environment setup ---
// This part handles reading input from standard input and invoking the core logic.
const INPUT_SOURCE_PATH = "/dev/stdin"; // Standard input file path

try {
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync(INPUT_SOURCE_PATH, "utf8");
    executeCalculation(inputContent);
} catch (error) {
    // Catch potential errors during file reading or module loading.
    console.error(`Fatal Error: Failed to read input from ${INPUT_SOURCE_PATH}. Details:`, error.message);
    console.log(-1); // Ensure an error code is outputted in case of system failure.
}