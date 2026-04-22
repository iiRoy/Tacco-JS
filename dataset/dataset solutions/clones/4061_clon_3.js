function processConstraintSystem(rawInputLines) {
    // Helper function to safely parse an integer from a string.
    const parseIntegerSafely = (strValue) => Number.parseInt(strValue, 10);

    // Split the entire input block into individual lines.
    const allInputLines = rawInputLines.split("\n");

    // --- Input Validation and Initial Data Extraction ---

    // Guard clause: Ensure there's at least one line for dimensions and one for constraints.
    if (!allInputLines || allInputLines.length < 2) {
        console.log("No"); // Indicate an invalid input scenario.
        return;
    }

    // Parse the first line to get the total number of nodes (totalElements)
    // and the total number of constraints (numberOfEquations).
    const dimensionDetails = allInputLines[0].split(" ").map(parseIntegerSafely);
    const totalElements = dimensionDetails[0];
    const numberOfEquations = dimensionDetails[1];

    // --- Data Structure Initialization ---

    // elementValues: An array to store the computed value for each element (node).
    // Initialized to 0. The actual value will be determined during propagation.
    const elementValues = new Array(totalElements).fill(0);

    // hasValueBeenSet: A boolean array to track if an element's value has been
    // definitively calculated and assigned. This prevents redundant computations.
    const hasValueBeenSet = new Array(totalElements).fill(false);

    // relativeDifferenceGraph: An adjacency list to represent the relationships between elements.
    // Each entry `relativeDifferenceGraph[u]` contains `[v, diff]` pairs,
    // indicating that `elementValues[v] - elementValues[u] = diff`.
    const relativeDifferenceGraph = Array.from({ length: totalElements }, () => []);

    // Arrays to store the original constraints for a final verification step.
    const sourceElementIndices = new Array(numberOfEquations);
    const targetElementIndices = new Array(numberOfEquations);
    const requiredDifferences = new Array(numberOfEquations);

    // --- Parsing Constraints and Building the Graph ---

    // Iterate through each constraint line to populate the graph and store original constraints.
    for (let eqIndex = 0; eqIndex < numberOfEquations; eqIndex++) {
        // Parse the current constraint line: [L, R, D]
        const currentEquationParts = allInputLines[eqIndex + 1].split(" ").map(parseIntegerSafely);
        const leftIdx = currentEquationParts[0] - 1; // Convert to 0-based index
        const rightIdx = currentEquationParts[1] - 1; // Convert to 0-based index
        const diffVal = currentEquationParts[2];

        // Store the original constraint details.
        sourceElementIndices[eqIndex] = leftIdx;
        targetElementIndices[eqIndex] = rightIdx;
        requiredDifferences[eqIndex] = diffVal;

        // Add edges to the graph:
        // 1. From L to R with difference D (R = L + D)
        relativeDifferenceGraph[leftIdx].push(rightIdx, diffVal);
        // 2. From R to L with difference -D (L = R - D)
        relativeDifferenceGraph[rightIdx].push(leftIdx, -diffVal);
    }

    // Flag to store the consistency result. Default to "Yes".
    let isSystemConsistent = "Yes";

    // --- Value Propagation Algorithm (Iterative DFS) ---

    // This function explores a connected component of the graph,
    // calculating and propagating values for all elements within it.
    // It uses an iterative Depth-First Search (DFS) approach with an explicit stack.
    function propagateComponentValues(initialNode) {
        // The stack stores pairs: [currentNodeIndex, currentAdjListPointer]
        // currentAdjListPointer points to the index of the last processed pair in the adjacency list.
        const propagationStack = [];

        // If the initialNode's value hasn't been set, establish it as a base (e.g., 0).
        // This effectively sets a reference point for its connected component.
        if (!hasValueBeenSet[initialNode]) {
            elementValues[initialNode] = 0;
            hasValueBeenSet[initialNode] = true;

            // If the initial node has connections, add it to the stack to start traversal.
            if (relativeDifferenceGraph[initialNode].length > 0) {
                 propagationStack.push([initialNode, relativeDifferenceGraph[initialNode].length - 2]);
            }
        }

        // Process elements from the stack until it's empty.
        while (propagationStack.length > 0) {
            const [currentNodeIndex, currentAdjListPointer] = propagationStack.pop();

            // If the pointer is negative, all neighbors of this node have been processed
            // (or it had no neighbors left to process in this direction), so continue.
            if (currentAdjListPointer < 0) {
                continue;
            }

            // Extract neighbor information from the adjacency list.
            const neighborNodeIndex = relativeDifferenceGraph[currentNodeIndex][currentAdjListPointer];
            const relativeOffsetValue = relativeDifferenceGraph[currentNodeIndex][currentAdjListPointer + 1];

            // If the neighbor's value hasn't been determined yet:
            if (!hasValueBeenSet[neighborNodeIndex]) {
                // Calculate the neighbor's value based on the current node's value.
                elementValues[neighborNodeIndex] = elementValues[currentNodeIndex] + relativeOffsetValue;
                hasValueBeenSet[neighborNodeIndex] = true;

                // Push the current node back onto the stack to process its *next* neighbor (backtracking).
                // This ensures all branches from the current node are explored.
                propagationStack.push([currentNodeIndex, currentAdjListPointer - 2]);

                // Push the neighbor node onto the stack to explore its connections (going deeper).
                if (relativeDifferenceGraph[neighborNodeIndex].length > 0) {
                    propagationStack.push([neighborNodeIndex, relativeDifferenceGraph[neighborNodeIndex].length - 2]);
                }
            } else {
                // If the neighbor's value is already set, it means this path has been explored.
                // We don't need to re-process it, but we still need to continue
                // processing other neighbors of the current node.
                propagationStack.push([currentNodeIndex, currentAdjListPointer - 2]);
            }
        }
    }

    // Iterate through all possible elements to ensure all connected components are processed.
    for (let nodeIterator = 0; nodeIterator < totalElements; nodeIterator++) {
        // If an element's value hasn't been set, it means it's part of an unvisited component.
        // Start a new propagation from this element.
        // Also ensure the node actually has connections to propagate.
        if (!hasValueBeenSet[nodeIterator] && relativeDifferenceGraph[nodeIterator].length > 0) {
            propagateComponentValues(nodeIterator);
        }
        // Isolated nodes (with no connections) will remain with value 0 and `hasValueBeenSet` as false.
        // This is acceptable as they don't participate in any constraints that would change their value.
    }

    // --- Final Consistency Verification ---

    // After all values have been propagated, check if all original constraints hold true.
    for (let eqIterator = 0; eqIterator < numberOfEquations; eqIterator++) {
        const source = sourceElementIndices[eqIterator];
        const target = targetElementIndices[eqIterator];
        const requiredDiff = requiredDifferences[eqIterator];

        // If the calculated difference between element values does not match the
        // required difference from the constraint, the system is inconsistent.
        if (elementValues[target] - elementValues[source] !== requiredDiff) {
            isSystemConsistent = "No";
            break; // No need to check further; inconsistency found.
        }
    }

    // Output the final result.
    console.log(isSystemConsistent);
}

// Entry point: Read input from standard input and pass it to the main processing function.
processConstraintSystem(require("fs").readFileSync("/dev/stdin", "utf8"));