/**
 * Analyzes game input to determine if a set of attack powers collectively
 * meets or exceeds a specified damage threshold. This function encapsulates
 * the logic for parsing input data, validating numerical values,
 * summing up individual power contributions, and presenting the final outcome.
 *
 * @param {string} rawGameInput - The complete input string, typically received
 *                                from standard input, containing multiple lines
 *                                of game-related numerical data.
 */
function processGameOutcome(rawGameInput) {
    // Defensive check: Ensure the provided input is indeed a string.
    if (typeof rawGameInput !== 'string') {
        console.error("Error: Input provided to processGameOutcome is not a string.");
        return; // Terminate execution if input is invalid.
    }

    // Split the raw input into individual lines.
    // The filter method ensures that any empty lines (e.g., a trailing newline)
    // are robustly removed, preventing issues with empty array elements.
    const scenarioLines = rawGameInput.split('\n').filter(lineContent => lineContent.trim().length > 0);

    // Basic validation: Check if the minimum expected number of lines are present.
    // We anticipate at least two lines for the threshold/count and the attack values.
    if (scenarioLines.length < 2) {
        console.error("Input error: Not enough data lines provided. Expected at least two lines.");
        return;
    }

    // Process the first line to extract the required damage threshold and the expected
    // number of individual attack values.
    const headerSegments = scenarioLines[0].split(' ');
    if (headerSegments.length < 2) {
        console.error("Input error: First line malformed. Expected two space-separated numbers.");
        return;
    }

    // Convert string segments to numerical types. Using Number() for flexibility
    // and parseInt() with radix for explicit integer conversion.
    const requiredDamageThreshold = Number(headerSegments[0]);
    const expectedAttackCount = parseInt(headerSegments[1], 10);

    // Validate that the parsed values are indeed numbers.
    if (isNaN(requiredDamageThreshold) || isNaN(expectedAttackCount)) {
        console.error("Input error: Failed to parse valid numbers from the first line.");
        return;
    }

    // Parse the second line, which contains space-separated individual attack power values.
    // Filter out any empty strings that might result from multiple spaces.
    const attackPowerStringValues = scenarioLines[1].split(' ').filter(val => val.trim().length > 0);
    let individualAttackPowers = [];

    // Iterate through the string values and convert them to numbers.
    // Includes a check for non-numeric entries.
    for (const powerText of attackPowerStringValues) {
        const parsedPowerValue = Number(powerText);
        if (isNaN(parsedPowerValue)) {
            // Log a warning and skip non-numeric entries to avoid breaking the sum.
            console.warn(`Warning: Encountered non-numeric attack power '${powerText}', skipping.`);
            continue;
        }
        individualAttackPowers.push(parsedPowerValue);
    }

    // Optional: Add a check if the actual number of parsed attacks matches the expected count.
    // This could indicate a data discrepancy, though the problem logic might proceed regardless.
    if (individualAttackPowers.length !== expectedAttackCount) {
        // console.warn(`Note: Actual number of attacks (${individualAttackPowers.length}) differs from expected (${expectedAttackCount}).`);
    }

    // Handle edge case: If no valid attack powers were parsed but a positive threshold is set.
    if (individualAttackPowers.length === 0 && requiredDamageThreshold > 0) {
        console.log('No'); // Cannot meet a positive threshold with zero attacks.
        return;
    }

    // Calculate the cumulative sum of all individual attack powers.
    // This replaces the Array.prototype.reduce method with an explicit for loop.
    let totalCombinedPower = 0;
    for (let i = 0; i < individualAttackPowers.length; i++) {
        totalCombinedPower += individualAttackPowers[i];
    }

    // Determine the final outcome based on whether the total power meets the threshold.
    let finalDecision;
    if (totalCombinedPower >= requiredDamageThreshold) {
        finalDecision = 'Yes';
    } else {
        finalDecision = 'No';
    }

    // Output the result to standard output.
    console.log(finalDecision);
}

// This self-executing anonymous function (IIFE) handles the standard input/output
// mechanism required by many competitive programming environments.
// It reads the entire content of /dev/stdin and passes it to the main processing function.
(function initializeApplicationEnvironment() {
    const filesystemModule = require("fs"); // Import the Node.js file system module.
    const standardInputFilePath = "/dev/stdin"; // Define the path for standard input.

    try {
        // Read the entire content of the standard input file synchronously.
        // Specify 'utf8' encoding to handle text data correctly.
        const inputBufferContent = filesystemModule.readFileSync(standardInputFilePath, "utf8");

        // Invoke the core logic function with the retrieved input.
        processGameOutcome(inputBufferContent);
    } catch (ioError) {
        // Catch and report any errors that occur during file reading.
        console.error("Application Error: Failed to read input from standard input.", ioError);
        // In a production scenario, more sophisticated error handling or logging
        // might be implemented here, potentially exiting with a non-zero status.
    }
})();