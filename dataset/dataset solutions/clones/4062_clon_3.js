// This program evaluates a set of relative position constraints between various entities.
// It determines if the given system of constraints is consistent ("Yes") or inconsistent ("No").
// The problem can be viewed as finding relative coordinates on a 1D line or checking graph consistency.

/**
 * Processes a raw string input containing node and constraint data
 * to determine the consistency of relative position relationships.
 * @param {string} rawDataString - The multi-line string input.
 */
function ProcessInputData(rawDataString) {
    // Extensive comments about the purpose of the function
    // The core logic attempts to assign relative coordinates to nodes based on provided differences.
    // If a contradiction is found, the system is inconsistent.
    // If multiple disconnected components exist, it anchors an arbitrary node in each to resolve.

    // 1. Input Parsing and Initial Setup
    // Split the input string into individual lines, filtering out any empty lines.
    let inputLines = rawDataString.split("\n").filter(line => line.trim() !== '');

    // Guard clause: If no meaningful input lines are provided, it's an invalid scenario.
    if (inputLines.length === 0) {
        console.log("No"); // Or handle as an error, depending on problem spec.
        return;
    }

    // Helper function to parse a space-separated string of numbers into an array of integers.
    const parseNumericLine = (lineContent) => lineContent.split(" ").map(val => Number.parseInt(val.trim(), 10));

    // The first line contains the total number of nodes (N) and the count of constraints (M).
    let dimensionsArray = parseNumericLine(inputLines[0]);
    const totalNodeCount = dimensionsArray[0]; // Corresponds to 'N' in original
    const numberOfRelations = dimensionsArray[1]; // Corresponds to 'M' in original

    // Basic validation for input dimensions. Node count must be positive, relations can be zero.
    if (totalNodeCount <= 0 || numberOfRelations < 0) {
        console.log("No");
        return;
    }

    // Constants for easier access to elements within a constraint array [u, v, w].
    // A constraint [u, v, w] signifies that position[v] - position[u] = w.
    const SOURCE_NODE_INDEX = 0;
    const TARGET_NODE_INDEX = 1;
    const DIFFERENCE_VALUE_INDEX = 2;

    // 2. Data Structure Initialization
    // 'isNodeAnchored': A boolean array to track if a node's relative position has been determined.
    // Nodes are 1-indexed, so array size is totalNodeCount + 1. Initialized to 'false'.
    let isNodeAnchored = new Array(totalNodeCount + 1).fill(false);

    // 'relativePositionValues': An array to store the calculated relative positions of nodes.
    // Nodes are 1-indexed. Initialized to 0. The actual value is relative to an anchored node.
    let relativePositionValues = new Array(totalNodeCount + 1).fill(0);

    // Establish an initial reference point: Node 1 is arbitrarily anchored.
    // Its relative position is implicitly 0, serving as the origin for its connected component.
    isNodeAnchored[1] = true;

    // 'pendingRelationEdges': A list to store the constraints read from input.
    // Each element is an array [u, v, w].
    let pendingRelationEdges = [];
    // Read all constraint lines, starting from the second line (index 1).
    for (let k = 0; k < numberOfRelations; k++) {
        let currentConstraint = parseNumericLine(inputLines[k + 1]);
        // Basic check for valid constraint format (expecting 3 numbers).
        if (currentConstraint.length === 3) {
            pendingRelationEdges.push(currentConstraint);
        } else {
            // Log a warning or handle malformed constraint if necessary.
            // For this problem, we assume valid input format.
            // console.warn(`Malformed constraint skipped: ${inputLines[k + 1]}`);
        }
    }

    let finalConsistencyStatus = "Yes"; // Optimistic default outcome.
    let progressMadeDuringPass = true; // Flag to track if any constraints were resolved in an iteration.

    // 3. Main Constraint Resolution Loop
    // Continue as long as there are unresolved constraints AND progress is being made.
    // If no progress is made in a pass, it implies either all resolvable constraints are done
    // within the current components, or an inconsistency has been found.
    while (pendingRelationEdges.length > 0 && progressMadeDuringPass) {
        progressMadeDuringPass = false; // Reset flag for the current iteration pass.

        // A temporary list to hold constraints that cannot be resolved in this pass.
        let unresolvedRelationsForNextIteration = [];

        // Iterate through each constraint in the current list of pending relations.
        for (let currentRelationIndex = 0; currentRelationIndex < pendingRelationEdges.length; currentRelationIndex++) {
            const currentEdge = pendingRelationEdges[currentRelationIndex];
            const uNode = currentEdge[SOURCE_NODE_INDEX];
            const vNode = currentEdge[TARGET_NODE_INDEX];
            const weightDifference = currentEdge[DIFFERENCE_VALUE_INDEX];

            // Check the anchored status of both nodes involved in the current constraint.
            const uIsKnown = isNodeAnchored[uNode];
            const vIsKnown = isNodeAnchored[vNode];

            // Scenario A: Both nodes (u and v) are already anchored.
            if (uIsKnown && vIsKnown) {
                // Verify consistency: The calculated difference must match the given weight.
                if (relativePositionValues[vNode] - relativePositionValues[uNode] !== weightDifference) {
                    finalConsistencyStatus = "No"; // Inconsistency detected.
                    // Immediately stop all processing as the system is invalid.
                    pendingRelationEdges = []; // Clear the list to terminate the outer while loop.
                    break; // Exit the inner for loop.
                }
                // If consistent, this constraint is satisfied and can be discarded.
                progressMadeDuringPass = true; // Mark that a constraint was processed.
            }
            // Scenario B: Only the source node (u) is anchored.
            else if (uIsKnown) {
                // Anchor the target node (v) and calculate its position relative to u.
                isNodeAnchored[vNode] = true;
                relativePositionValues[vNode] = relativePositionValues[uNode] + weightDifference;
                progressMadeDuringPass = true; // Mark that a new node was anchored.
            }
            // Scenario C: Only the target node (v) is anchored.
            else if (vIsKnown) {
                // Anchor the source node (u) and calculate its position relative to v.
                isNodeAnchored[uNode] = true;
                relativePositionValues[uNode] = relativePositionValues[vNode] - weightDifference;
                progressMadeDuringPass = true; // Mark that a new node was anchored.
            }
            // Scenario D: Neither node is anchored. This constraint cannot be resolved yet.
            else {
                unresolvedRelationsForNextIteration.push(currentEdge); // Keep for the next pass.
            }
        }

        // Update the list of pending relations for the next iteration.
        pendingRelationEdges = unresolvedRelationsForNextIteration;

        // If no progress was made in this pass, but there are still pending constraints,
        // it implies that we have encountered disconnected components.
        // We need to arbitrarily anchor a new unanchored node to start resolving its component.
        if (!progressMadeDuringPass && pendingRelationEdges.length > 0) {
            let nextUnanchoredNodeCandidate = -1;
            // Search for the lowest-indexed unanchored node to establish a new reference point.
            for (let currentComponentNode = 1; currentComponentNode <= totalNodeCount; currentComponentNode++) {
                if (!isNodeAnchored[currentComponentNode]) {
                    nextUnanchoredNodeCandidate = currentComponentNode;
                    break; // Found the next starting point for a new component.
                }
            }

            if (nextUnanchoredNodeCandidate !== -1) {
                // Anchor this node and set its relative position to 0.
                // This implicitly starts a new independent coordinate system for its component.
                isNodeAnchored[nextUnanchoredNodeCandidate] = true;
                relativePositionValues[nextUnanchoredNodeCandidate] = 0;
                progressMadeDuringPass = true; // This action counts as making progress.
            }
            // If `nextUnanchoredNodeCandidate` is -1 here, it means all nodes are anchored,
            // but `pendingRelationEdges` is not empty. This indicates an unresolved inconsistency
            // that didn't fit the `uIsKnown && vIsKnown` check, or a logical flaw.
            // In such a scenario, `progressMadeDuringPass` remains `false`, and the outer loop terminates.
        }
    }

    // 4. Output the Final Result
    // Print "Yes" if all constraints were consistent and resolved, "No" otherwise.
    console.log(finalConsistencyStatus);
}

// Entry point for executing the program.
// This section handles reading the input from standard input (typically a file).
const fileSystemUtility = require("fs"); // Use a more descriptive name for the fs module.
const standardInputPath = "/dev/stdin"; // Path for standard input on many Unix-like systems.

// Use a try-catch block for robust file reading and error handling.
try {
    const fileContent = fileSystemUtility.readFileSync(standardInputPath, "utf8");
    ProcessInputData(fileContent);
} catch (error) {
    // If an error occurs during file reading or processing, log it and output "No".
    console.error("An error occurred during input processing:", error.message);
    console.log("No"); // Output "No" as a fail-safe in case of unexpected errors.
}