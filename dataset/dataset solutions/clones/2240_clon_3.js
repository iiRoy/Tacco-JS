"use strict";

/**
 * A utility function to safely parse a string into an integer.
 * It handles potential non-numeric inputs by returning NaN, which can then be checked.
 *
 * @param {string} valueString - The string to parse.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
function safelyParseInteger(valueString) {
    // Attempt to parse the string into an integer, specifying base 10.
    const parsedValue = parseInt(valueString, 10);

    // Return the parsed value. If the string was not a valid number, parseInt returns NaN.
    return parsedValue;
}

/**
 * Parses a single line representing an entity's configuration.
 * Expected format: "POSITION LENGTH".
 *
 * @param {string} entityConfigLine - The raw string line for an entity.
 * @returns {{position: number, length: number} | null} An object with parsed coordinates, or null if parsing fails.
 */
function extractEntityCoordinates(entityConfigLine) {
    // Validate input: ensure it's a non-empty string after trimming.
    if (typeof entityConfigLine !== 'string' || entityConfigLine.trim().length === 0) {
        // Log a warning for debugging purposes, but continue processing other lines.
        console.error("Warning: Encountered an empty or invalid entity configuration line, skipping.");
        return null;
    }

    // Split the line by one or more whitespace characters to get position and length parts.
    const coordinateParts = entityConfigLine.trim().split(/\s+/);

    // Ensure we have exactly two parts (position and length).
    if (coordinateParts.length !== 2) {
        console.error(`Error: Malformed entity configuration. Expected 'POSITION LENGTH', got '${entityConfigLine}'. Skipping.`);
        return null;
    }

    // Parse the position and length values using the safe parsing utility.
    const entityPosition = safelyParseInteger(coordinateParts[0]);
    const entityLength = safelyParseInteger(coordinateParts[1]);

    // Validate that both parsed values are actual numbers.
    if (isNaN(entityPosition) || isNaN(entityLength)) {
        console.error(`Error: Non-numeric values detected in entity configuration: '${entityConfigLine}'. Skipping.`);
        return null;
    }

    // Return a structured object for the parsed entity.
    return {
        position: entityPosition,
        length: entityLength
    };
}

/**
 * Main function to analyze a collection of entities based on their position and length.
 * It counts entities whose calculated start point is greater than zero.
 *
 * This algorithm first parses and sorts the entities. Then, it iterates through them,
 * decrementing a counter for each entity whose (position - length) is less than or equal to zero.
 * The final count represents entities whose (position - length) is strictly positive.
 *
 * @param {string} rawInputText - The complete raw input string.
 *                                The first line should contain the total number of entities.
 *                                Subsequent lines contain "POSITION LENGTH" for each entity.
 */
function analyzeEntityIntersections(rawInputText) {
    // Defensive check for empty input.
    if (!rawInputText || rawInputText.trim().length === 0) {
        console.warn("Input data is empty. No entities to process.");
        console.log(0); // Output 0 if no input.
        return;
    }

    // Split the input text into individual lines, handling various line endings.
    // Filter out any lines that are empty after trimming whitespace.
    const processedInputLines = rawInputText.split(/\r?\n/).filter(line => line.trim() !== '');

    // Extract the initial total count of entities from the first line.
    // Use `safelyParseInteger` for robustness.
    let remainingEntityCount = safelyParseInteger(processedInputLines[0]);

    // Validate the initial count.
    if (isNaN(remainingEntityCount) || remainingEntityCount < 0) {
        console.error("Invalid initial entity count provided. Expected a non-negative integer.");
        console.log(0); // Default to 0 or handle error as per problem spec.
        return;
    }

    // Extract the raw string descriptions for each entity from the rest of the lines.
    const entityDescriptionStrings = processedInputLines.slice(1);

    // Map the raw description strings to structured entity objects,
    // filtering out any descriptions that failed parsing (returned null).
    const parsedEntityData = entityDescriptionStrings
        .map(extractEntityCoordinates)
        .filter(entity => entity !== null);

    // It's possible that `remainingEntityCount` from input[0] doesn't match
    // the actual number of valid `parsedEntityData`. For this clone, we
    // adhere to the original logic where `n` starts from the first line.
    // However, we can add a debug check.
    if (parsedEntityData.length !== remainingEntityCount) {
        console.debug(`Debug: Initial count (${remainingEntityCount}) does not match actual valid entities parsed (${parsedEntityData.length}). Proceeding with initial count.`);
    }

    // Sort the parsed entities based on their primary position in ascending order.
    // This ordering is crucial for sequential processing.
    const sortedEntities = parsedEntityData.sort((entityA, entityB) => {
        // A simple subtraction for numeric comparison ensures ascending order.
        return entityA.position - entityB.position;
    });

    // Define the threshold for our comparison. In the original code, `Math.max(null, range)`
    // consistently evaluated to 0 when `range` was an array. We directly use 0 here
    // to maintain the exact original functional behavior for the condition.
    const referenceOverlapThreshold = 0;

    // Iterate through each sorted entity to apply the counting logic.
    for (const currentEntity of sortedEntities) {
        // Calculate the 'start point' for the current entity's segment.
        const calculatedStartPoint = currentEntity.position - currentEntity.length;

        // Determine if the entity's start point is less than or equal to the threshold.
        // This is the core conditional check from the original logic.
        const doesEntityOverlapOrStartBeforeThreshold = (calculatedStartPoint <= referenceOverlapThreshold);

        // If the condition is met, decrement the overall count of remaining entities.
        if (doesEntityOverlapOrStartBeforeThreshold) {
            remainingEntityCount--;
        }
        // Note: The original 'range' array and its `push` operation were functionally
        // irrelevant to the final `n` count due to how `Math.max(null, array)` behaves.
        // Therefore, they have been intentionally omitted here as a Type III deletion
        // of non-essential statements to clarify the core logic.
    }

    // Output the final calculated count.
    console.log(remainingEntityCount);
}

// Ensure the script is run in a Node.js environment for file system access.
// Read the input from standard input and pass it to the analysis function.
try {
    const fileSystemModule = require("node:fs");
    const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    analyzeEntityIntersections(inputContent);
} catch (error) {
    console.error("Failed to read input from /dev/stdin or execute analysis:", error.message);
    // Exit with a non-zero code to indicate an error, common practice in scripting.
    process.exit(1);
}