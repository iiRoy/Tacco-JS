// This module is designed to process structured input data, typically representing graph-like
// connections, to extract specific characteristics about the nodes within that structure.
// It aims to identify "terminal" nodes (those without outgoing connections) and a "root candidate"
// (the highest-indexed node without incoming connections).

function ProcessInputData(rawData) {
    // --- Phase 1: Input Validation and Initial Parsing ---

    // A crucial first step is to validate the input. If the raw data is missing or not a string,
    // it indicates a problem, and we should gracefully handle it by logging an error and exiting.
    if (!rawData || typeof rawData !== 'string') {
        console.error("Input processing halted: Received invalid or empty data block.");
        return; // Terminate execution as valid input is essential.
    }

    // Helper function to robustly convert a string segment into an integer.
    // This adds a layer of error handling for potentially malformed number strings.
    const extractInteger = (textSegment) => {
        // Remove leading/trailing whitespace before parsing.
        const numericValue = parseInt(textSegment.trim(), 10);
        if (isNaN(numericValue)) {
            // Log a warning if a segment cannot be converted, indicating potential data issues.
            console.warn(`Encountered non-numeric data "${textSegment}". Defaulting to 0.`);
            return 0; // Return a default value in case of parsing failure.
        }
        return numericValue;
    };

    // Break down the entire raw input into an array of individual text lines.
    const inputLines = rawData.split("\n");

    // The very first line of the input is expected to contain two key parameters:
    // the total number of nodes in the system (N) and the count of additional edges (M).
    const systemParameters = inputLines[0].split(" ").map(extractInteger);
    const totalNodeCount = systemParameters[0]; // Corresponds to 'n' in the original problem.
    const additionalEdgeCount = systemParameters[1]; // Corresponds to 'm' in the original problem.

    // --- Phase 2: Edge Data Collection and Storage ---

    // For efficient lookups later, we'll use JavaScript `Set` objects.
    // Sets provide O(1) average time complexity for checking if an item exists,
    // which is more performant than O(N) array `indexOf` for larger datasets.
    const outgoingConnectionNodes = new Set(); // Stores all nodes that are sources of an edge.
    const incomingConnectionNodes = new Set(); // Stores all nodes that are targets of an edge.

    // Determine the total number of lines that describe edges.
    // The problem implies N-1 initial edges for a connected component, plus M additional ones.
    const numEdgeDescriptionLines = (totalNodeCount > 0 ? totalNodeCount - 1 : 0) + additionalEdgeCount;

    // Iterate through each line describing an edge, starting from the second line of the input.
    for (let currentLineIdx = 1; currentLineIdx <= numEdgeDescriptionLines; currentLineIdx++) {
        // Ensure the current line exists before attempting to process it.
        if (!inputLines[currentLineIdx]) {
            console.warn(`Missing data for edge description at line ${currentLineIdx + 1}. Skipping.`);
            continue; // Move to the next iteration if the line is empty or undefined.
        }

        const edgeComponents = inputLines[currentLineIdx].split(" ");
        const sourceIdentifier = extractInteger(edgeComponents[0]);
        const targetIdentifier = extractInteger(edgeComponents[1]);

        // Add the identifiers to their respective sets.
        outgoingConnectionNodes.add(sourceIdentifier);
        incomingConnectionNodes.add(targetIdentifier);
    }

    // --- Phase 3: Node Classification ---

    // Initialize data structures to store the results of our node classification.
    const endPointNodes = []; // Nodes that do not initiate any connections (i.e., "leaves").
    let highestIndexRootCandidate = 0; // A node that does not receive any connections (i.e., a "root").
                                       // If multiple exist, this will store the one with the largest ID.

    // Iterate through every possible node ID, from 1 up to the total count of nodes.
    for (let nodeIdIterator = 1; nodeIdIterator <= totalNodeCount; nodeIdIterator++) {
        // Check if the current node ID is present in the set of nodes that have outgoing connections.
        // If it's NOT found, then it's an end-point node (a "leaf").
        if (!outgoingConnectionNodes.has(nodeIdIterator)) {
            endPointNodes.push(nodeIdIterator);
        }

        // Check if the current node ID is present in the set of nodes that have incoming connections.
        // If it's NOT found, then it's a potential root node.
        // The problem's implicit behavior suggests we should retain the highest-indexed such node.
        if (!incomingConnectionNodes.has(nodeIdIterator)) {
            highestIndexRootCandidate = nodeIdIterator;
        }
    }

    // --- Phase 4: Output Results ---

    // Display the identified end-point nodes and the final root candidate.
    console.log(endPointNodes, highestIndexRootCandidate);
}

// The following section is standard boilerplate for competitive programming environments
// and should not be altered. It reads input from standard I/O and invokes the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));