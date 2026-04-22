const retrieveInput = () => {
    // This helper function is responsible for safely reading the raw input data.
    // It abstracts away the file system access details.
    try {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Ensure input is trimmed to handle potential leading/trailing whitespace or empty lines.
        return fileContent.trim();
    } catch (ioError) {
        // A robust error handling mechanism for input/output operations.
        console.error("Critical error during input acquisition:", ioError.message);
        // In case of an error, return an empty string to prevent further processing with invalid data.
        return "";
    }
};

/**
 * Analyzes a set of directed graph edges to determine if a specific two-step path exists.
 * The path sought is from node '1' to an intermediate node 'X', and then from 'X' to the
 * globally largest node value 'N' found within the input data.
 *
 * @param {string} rawInputData - A multi-line string where each line represents an edge
 *                                 as "sourceNode targetNode".
 */
function evaluateGraphPathExistence(rawInputData) {
    // Implement an initial guard clause for empty or malformed input.
    if (!rawInputData || rawInputData.length === 0) {
        console.log("IMPOSSIBLE");
        return;
    }

    const inputEdgeLines = rawInputData.split("\n");

    // Another validation to handle cases where input might be just whitespace or empty lines.
    if (inputEdgeLines.length === 0 || inputEdgeLines.every(line => line.trim() === '')) {
        console.log("IMPOSSIBLE");
        return;
    }

    const graphSourceNodes = []; // Stores all source nodes from the input.
    const graphTargetNodes = []; // Stores all target nodes corresponding to source nodes.
    let globalMaximumNodeValue = 0; // Tracks the highest node value encountered across all inputs.

    // Iterate through each line of input to populate node arrays and find the maximum value.
    // Using a modern for...of loop for clarity.
    for (const lineEntry of inputEdgeLines) {
        const trimmedLine = lineEntry.trim();
        if (trimmedLine.length === 0) {
            continue; // Skip empty lines gracefully.
        }

        const nodeValueStrings = trimmedLine.split(" ");
        // Basic validation for expected number of values per line.
        if (nodeValueStrings.length < 2) {
            // Log a warning or throw an error for malformed lines if strictness is required.
            // For this problem, we'll assume valid input structure and skip.
            continue;
        }

        // Parse node values, ensuring they are valid numbers.
        const currentSourceNode = Number(nodeValueStrings[0]);
        const currentTargetNode = Number(nodeValueStrings[1]);

        // Add nodes to their respective lists.
        graphSourceNodes.push(currentSourceNode);
        graphTargetNodes.push(currentTargetNode);

        // Update the global maximum node value by comparing with both source and target.
        globalMaximumNodeValue = Math.max(globalMaximumNodeValue, currentSourceNode, currentTargetNode);
    }

    // Initialize a flag to track if the desired path has been discovered.
    let pathSuccessfullyIdentified = false;
    // Begin searching for the first step of the path: a connection starting from node '1'.
    let primarySearchIndex = -1;

    // Outer loop: Iterates through all occurrences of '1' in the source nodes.
    while (true) {
        primarySearchIndex = graphSourceNodes.indexOf(1, primarySearchIndex + 1);

        if (primarySearchIndex === -1) {
            // If '1' is no longer found as a source node, break the outer loop.
            break;
        }

        // The target node of this first connection (1 -> intermediateNode).
        const intermediateNodeCandidate = graphTargetNodes[primarySearchIndex];

        // Inner loop: Searches for the second step of the path: from the intermediate node
        // to the global maximum node value.
        let secondarySearchIndex = -1;
        while (true) {
            secondarySearchIndex = graphSourceNodes.indexOf(intermediateNodeCandidate, secondarySearchIndex + 1);

            if (secondarySearchIndex === -1) {
                // If no more connections from the intermediate node are found, break the inner loop.
                break;
            }

            // Check if the target of this second connection is the global maximum.
            if (graphTargetNodes[secondarySearchIndex] === globalMaximumNodeValue) {
                pathSuccessfullyIdentified = true; // Path 1 -> X -> N found!
                break; // Exit the inner loop immediately.
            }
        }

        if (pathSuccessfullyIdentified) {
            // If the full path is found, there's no need to continue searching.
            break; // Exit the outer loop immediately.
        }
    }

    // Output the result based on whether the path was found.
    if (pathSuccessfullyIdentified) {
        console.log("POSSIBLE");
    } else {
        console.log("IMPOSSIBLE");
    }
}

// The entry point for the script execution.
// It retrieves input and then passes it to the core analysis function.
evaluateGraphPathExistence(retrieveInput());