function obtainRawInput(sourceFilePath) {
    // This helper function handles the reading of input from the specified source.
    // It encapsulates the file system interaction, making the main logic cleaner.
    try {
        // Dynamically import the 'fs' module for file operations.
        const fileSystemModule = require("fs");
        // Read the entire file content as a UTF-8 string.
        return fileSystemModule.readFileSync(sourceFilePath, "utf8");
    } catch (error) {
        // Log an error if file reading fails, e.g., file not found or permissions issue.
        console.error("An error occurred while attempting to read input:", error.message);
        // Return an empty string or re-throw the error, depending on desired error handling.
        // For this context, an empty string will lead to a 'NO' result due to insufficient data.
        return "";
    }
}

function extractNumericPair(inputLine) {
    // This function parses a single line of input, expecting two space-separated numbers.
    // It includes validation to ensure the line conforms to the expected format.

    // Remove leading/trailing whitespace and split the line by one or more spaces.
    const lineComponents = inputLine.trim().split(/\s+/);

    // Validate that exactly two components were found.
    if (lineComponents.length !== 2) {
        console.warn(`Input line malformed; expected two numbers but found ${lineComponents.length} components: "${inputLine}". Skipping.`);
        return null; // Return null to indicate a parsing failure.
    }

    // Convert string components to integers, using radix 10 for safety.
    const firstValue = parseInt(lineComponents[0], 10);
    const secondValue = parseInt(lineComponents[1], 10);

    // Validate that both components successfully parsed into numbers.
    if (isNaN(firstValue) || isNaN(secondValue)) {
        console.warn(`Input line contains non-numeric values: "${inputLine}". Skipping.`);
        return null; // Indicate parsing failure due to non-numeric content.
    }

    // Further validation: Ensure node IDs are within expected range (e.g., 1 to 4).
    // This reflects typical competitive programming constraints where node IDs are positive and bounded.
    const MIN_VALID_NODE_ID = 1;
    const MAX_VALID_NODE_ID = 4; // Based on the original problem's implicit maximum node ID (cnt array size 5)

    if (firstValue < MIN_VALID_NODE_ID || firstValue > MAX_VALID_NODE_ID ||
        secondValue < MIN_VALID_NODE_ID || secondValue > MAX_VALID_NODE_ID) {
        console.warn(`Node IDs out of expected range (${MIN_VALID_NODE_ID}-${MAX_VALID_NODE_ID}): [${firstValue}, ${secondValue}] in line "${inputLine}". Skipping.`);
        return null;
    }

    return [firstValue, secondValue]; // Return the successfully parsed pair.
}

function analyzeGraphDegrees(graphInputData) {
    // This is the core logic function, renamed and refactored from 'Main'.
    // It processes graph edge data to determine node degrees.

    // Define constants for clarity and potential future modification.
    const NUMBER_OF_EDGE_LINES = 3; // The problem specifies 3 pairs of connections.
    const MAXIMUM_NODE_IDENTIFIER = 4; // Nodes are typically 1-indexed, up to 4.

    // Split the raw input string into individual line segments.
    // .trim() is used to handle potential leading/trailing newlines in the overall input.
    const rawLineSegments = graphInputData.trim().split("\n");

    // Pre-process the connection data from the input lines.
    const collectedEdgePairs = [];
    // Guard clause: Check if enough lines are present for processing.
    if (rawLineSegments.length < NUMBER_OF_EDGE_LINES) {
        console.error(`Insufficient input lines. Expected ${NUMBER_OF_EDGE_LINES} but received ${rawLineSegments.length}.`);
        return "NO"; // Early exit if input is incomplete.
    }

    // Iterate over the expected number of lines to extract node pairs.
    for (let lineIndex = 0; lineIndex < NUMBER_OF_EDGE_LINES; lineIndex++) {
        const currentLineText = rawLineSegments[lineIndex];
        const parsedNodePair = extractNumericPair(currentLineText); // Use the helper function.

        if (parsedNodePair) {
            collectedEdgePairs.push(parsedNodePair);
        } else {
            // If any of the expected lines fails parsing, it indicates invalid input.
            // The problem implies valid input for the first 3 lines.
            // A Type III change here is to make it stricter and return "NO" if any line is invalid.
            console.error(`Failed to parse a required input line at index ${lineIndex}.`);
            return "NO";
        }
    }

    // Initialize an array to track the degree (number of connections) for each node.
    // The size is (MAXIMUM_NODE_IDENTIFIER + 1) to allow for 1-based indexing up to MAX_NODE_IDENTIFIER.
    // All counts are initialized to zero.
    const nodeDegreeCounters = new Array(MAXIMUM_NODE_IDENTIFIER + 1).fill(0);

    // Iterate through each collected edge pair to update node degree counts.
    // Destructuring assignment is used for clearer access to individual nodes in a pair.
    for (const [nodeIdentifierA, nodeIdentifierB] of collectedEdgePairs) {
        // Increment the degree counter for both nodes involved in the edge.
        // It's good practice to ensure these indices are valid, though extractNumericPair already checks.
        if (nodeIdentifierA >= 1 && nodeIdentifierA <= MAXIMUM_NODE_IDENTIFIER &&
            nodeIdentifierB >= 1 && nodeIdentifierB <= MAXIMUM_NODE_IDENTIFIER) {
            nodeDegreeCounters[nodeIdentifierA]++;
            nodeDegreeCounters[nodeIdentifierB]++;
        } else {
            // This path should ideally not be hit if extractNumericPair is robust.
            console.warn(`Unexpected node ID encountered outside valid range during degree counting: [${nodeIdentifierA}, ${nodeIdentifierB}].`);
            return "NO"; // Treat as an invalid state.
        }
    }

    // Determine if any node has a degree of exactly three.
    let isAnyNodeDegreeThree = false;
    // Iterate from node ID 1 up to MAXIMUM_NODE_IDENTIFIER (skipping index 0, which is unused).
    for (let currentId = 1; currentId <= MAXIMUM_NODE_IDENTIFIER; currentId++) {
        const currentDegreeValue = nodeDegreeCounters[currentId];
        // If a node's degree is 3, set the flag and break early.
        if (currentDegreeValue === 3) {
            isAnyNodeDegreeThree = true;
            break;
        }
    }

    // The final condition check: if no node has a degree of exactly 3, output "YES", otherwise "NO".
    return isAnyNodeDegreeThree ? "NO" : "YES";
}

function initiateProgramExecution() {
    // This function serves as the program's entry point, orchestrating input reading and core logic.

    const standardInputPath = "/dev/stdin"; // Standard path for input in many environments.
    const contentFromInput = obtainRawInput(standardInputPath); // Retrieve raw data.

    // Execute the main graph analysis logic with the obtained input.
    const finalResult = analyzeGraphDegrees(contentFromInput);

    // Print the computed result to standard output.
    console.log(finalResult);
}

// Start the application.
initiateProgramExecution();