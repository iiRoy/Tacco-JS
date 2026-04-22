const fileSystem = require('fs');

// --- Configuration and Constants ---
const STANDARD_INPUT_SOURCE = '/dev/stdin';
const LINE_SPLITTER = '\n';
const DIMENSION_SPLITTER = ' ';

/**
 * Utility function to securely read and sanitize input data from a specified path.
 * @param {string} sourceFilePath - The path to the input file (e.g., /dev/stdin).
 * @returns {string[]} An array of strings, where each string represents a trimmed line from the input.
 * @throws {Error} If the file cannot be read or contains no valid lines.
 */
const retrieveInputContent = (sourceFilePath) => {
    try {
        // Read the entire file content as a UTF-8 string.
        const fileContent = fileSystem.readFileSync(sourceFilePath, 'utf8');

        // Trim overall content to remove leading/trailing whitespace, then split by newlines.
        // Filter out any empty strings that might result from extra newlines or just whitespace.
        const cleanedLines = fileContent.trim().split(LINE_SPLITTER).filter(line => line.length > 0);

        if (cleanedLines.length === 0) {
            throw new Error("Input source is empty or contains only whitespace after processing.");
        }
        return cleanedLines;
    } catch (ioError) {
        // Log a detailed error message and terminate if input reading fails.
        console.error(`ERROR: Could not access or read input from ${sourceFilePath}. Details: ${ioError.message}`);
        process.exit(1); // Exit with a non-zero code to indicate failure.
    }
};

/**
 * Parses the initial configuration parameters (number of segments and number of instructions)
 * from the first line of the input.
 * @param {string} configLine - The first line of input containing two space-separated integers.
 * @returns {{pathSegmentCount: number, movementInstructionCount: number}} An object holding the parsed counts.
 * @throws {Error} If the configuration line is malformed or contains invalid numeric values.
 */
const extractConfigurationParameters = (configLine) => {
    const stringParameters = configLine.split(DIMENSION_SPLITTER);
    if (stringParameters.length < 2) {
        throw new Error(`Configuration line format error: Expected two numbers, got '${configLine}'.`);
    }

    const firstParam = parseInt(stringParameters[0], 10);
    const secondParam = parseInt(stringParameters[1], 10);

    // Validate that parsed values are indeed non-negative integers.
    if (isNaN(firstParam) || isNaN(secondParam) || firstParam < 0 || secondParam < 0) {
        throw new Error(`Invalid configuration values: '${stringParameters[0]}' and '${stringParameters[1]}' are not valid non-negative integers.`);
    }

    // `pathSegmentCount` corresponds to original `m` (length of `si` array is `m-1`).
    // `movementInstructionCount` corresponds to original `n`.
    return { pathSegmentCount: firstParam, movementInstructionCount: secondParam };
};

/**
 * Converts a specified number of lines from the input array into an array of integers.
 * @param {string[]} sourceLines - The array of input lines, which will be mutated (lines shifted).
 * @param {number} expectedCount - The number of integer values to parse.
 * @param {string} arrayDescription - A descriptive name for the array being parsed (for error messages).
 * @returns {number[]} An array of parsed integers.
 * @throws {Error} If insufficient lines are available or if a line cannot be parsed as an integer.
 */
const parseIntegerArrayFromLines = (sourceLines, expectedCount, arrayDescription) => {
    const parsedNumbers = [];
    for (let currentItem = 0; currentItem < expectedCount; currentItem++) {
        const line = sourceLines.shift(); // Remove and get the next line.
        if (line === undefined) {
            throw new Error(`Insufficient input for ${arrayDescription}: Expected ${expectedCount} items, but ran out of lines.`);
        }
        const numericValue = parseInt(line, 10);
        if (isNaN(numericValue)) {
            throw new Error(`Data parsing error for ${arrayDescription}: '${line}' is not a valid integer.`);
        }
        parsedNumbers.push(numericValue);
    }
    return parsedNumbers;
};


// --- Main Program Logic ---

// 1. Acquire all raw input lines.
let allInputLines = retrieveInputContent(STANDARD_INPUT_SOURCE);

// Ensure there are enough lines for configuration and data.
if (allInputLines.length < 1) { // At least one line for dimensions
    console.error("ERROR: Input is too short. Expected at least one line for dimensions.");
    process.exit(1);
}

// 2. Parse the initial configuration from the first line.
const configurationLine = allInputLines.shift(); // Remove the first line containing M and N.
const { pathSegmentCount, movementInstructionCount } = extractConfigurationParameters(configurationLine);

// 3. Populate the array of path segment costs.
// Note: The original problem defines 'm' such that the `si` array has `m-1` elements.
const pathSegmentCosts = parseIntegerArrayFromLines(allInputLines, pathSegmentCount - 1, "path segment costs");

// 4. Populate the array of movement instructions.
const movementInstructions = parseIntegerArrayFromLines(allInputLines, movementInstructionCount, "movement instructions");

// Initialize variables for the traversal simulation.
let totalAccumulatedCost = 0; // Stores the sum of costs for all traversals.
let currentPositionIndex = 0; // Represents the current logical position on the path, starting at 0.

// Optional: Add a check for no movement instructions.
if (movementInstructions.length === 0) {
    console.log("No movement instructions provided. Total cost is 0.");
    process.exit(0);
}

// 5. Execute the core traversal logic.
// Iterate through each high-level movement instruction.
for (const specificInstruction of movementInstructions) {
    // Determine the direction of travel (1 for positive, -1 for negative).
    const stepDirection = (specificInstruction > 0) ? 1 : -1;
    // Get the absolute number of individual steps to take for this instruction.
    let remainingSteps = Math.abs(specificInstruction);

    // Perform each individual step of the current instruction.
    while (remainingSteps > 0) {
        remainingSteps--; // Decrement the step counter.

        let segmentCostIndex; // The index of the path segment whose cost needs to be added.

        // If moving right (e.g., from index X to X+1), the cost is associated with segment X.
        if (stepDirection === 1) {
            segmentCostIndex = currentPositionIndex;
        }
        // If moving left (e.g., from index X to X-1), the cost is associated with segment X-1.
        else { // stepDirection === -1
            segmentCostIndex = currentPositionIndex - 1;
        }

        // --- Type III Addition: Boundary check for segment access ---
        // Ensure the calculated segmentCostIndex is within the valid bounds of the pathSegmentCosts array.
        if (segmentCostIndex < 0 || segmentCostIndex >= pathSegmentCosts.length) {
            // This scenario might indicate an edge case or an invalid path.
            // For this clone, we'll log a warning and skip adding cost for this out-of-bounds step.
            console.warn(`WARNING: Attempted to access path segment cost at invalid index ${segmentCostIndex}. Path segment array size is ${pathSegmentCosts.length}. Skipping this step's cost.`);
        } else {
            // Add the cost of the traversed segment to the total.
            totalAccumulatedCost += pathSegmentCosts[segmentCostIndex];
        }

        // Update the current position index based on the direction of travel.
        currentPositionIndex += stepDirection;

        // --- Type III Addition: Boundary check for current position ---
        // Ensure the current position index remains within the logical bounds (0 to pathSegmentCount-1).
        // `pathSegmentCount` (original `m`) represents the total number of points/nodes, so valid indices are 0 to `m-1`.
        if (currentPositionIndex < 0 || currentPositionIndex >= pathSegmentCount) {
             console.warn(`WARNING: Current position index (${currentPositionIndex}) went out of expected logical bounds [0, ${pathSegmentCount - 1}]. This might indicate an issue with instructions or problem constraints.`);
             // Depending on problem specifics, one might clamp the index, throw an error, or continue.
             // For this clone, we'll issue a warning and continue, assuming the problem constraints implicitly handle this.
        }
    }
}

// 6. Output the final calculated total cost.
console.log(totalAccumulatedCost);