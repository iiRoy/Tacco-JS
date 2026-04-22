/**
 * Processes a list of graph edges to assign colors such that no two edges incident to the same node
 * share the same color, aiming to minimize the maximum color used.
 * This is a form of edge coloring, specifically trying to find the smallest available color for each edge.
 * @param {string[]} rawDataLines - An array of strings where the first element is the number of edges,
 *                                and subsequent elements are space-separated node identifiers for each edge.
 */
function processGraphEdges(rawDataLines) {
    // Validate input data presence.
    if (!rawDataLines || rawDataLines.length === 0) {
        console.error("Error: No input data provided.");
        return;
    }

    // Parse the total number of edges from the first line.
    const totalEdges = parseInt(rawDataLines[0], 10);

    // Initialize a map to store colors already assigned to edges connected to each node.
    // Key: Node identifier (number), Value: A Set of colors associated with that node.
    const nodeColorAssignments = new Map();

    // Keep track of the highest color value assigned across all edges.
    let currentMaxColor = 0;

    // Store the assigned color for each edge in the order they are processed.
    const resultingEdgeColors = [];

    // Loop through each edge starting from the second line of the input data.
    // The loop processes `totalEdges - 1` actual edge definitions.
    for (let edgeIndex = 1; edgeIndex < totalEdges; ++edgeIndex) {
        // Extract node identifiers for the current edge.
        const edgeDefinition = rawDataLines[edgeIndex];
        
        // Basic validation for edge line format.
        if (!edgeDefinition || edgeDefinition.trim().length === 0) {
            console.warn(`Warning: Skipping empty or malformed edge definition at line ${edgeIndex + 1}.`);
            continue;
        }
        const nodeIdentifiersStr = edgeDefinition.split(" ");

        // Ensure we have two parts for the edge (two node identifiers).
        if (nodeIdentifiersStr.length < 2) {
            console.error(`Error: Malformed edge definition "${edgeDefinition}" at line ${edgeIndex + 1}. Expected two node identifiers.`);
            continue;
        }

        // Convert string identifiers to numbers.
        const firstNodeId = Number(nodeIdentifiersStr[0]);
        const secondNodeId = Number(nodeIdentifiersStr[1]);

        // Ensure parsed node IDs are valid numbers.
        if (isNaN(firstNodeId) || isNaN(secondNodeId)) {
            console.error(`Error: Invalid node identifiers in "${edgeDefinition}" at line ${edgeIndex + 1}.`);
            continue;
        }

        // Retrieve sets of colors already used by edges connected to these nodes.
        // If a node hasn't been encountered before, initialize an empty Set for it.
        const firstNodeColors = nodeColorAssignments.get(firstNodeId) || new Set();
        const secondNodeColors = nodeColorAssignments.get(secondNodeId) || new Set();

        // Combine all colors used by both nodes into a single set to find unavailable colors.
        const combinedForbiddenColors = new Set();
        firstNodeColors.forEach(color => combinedForbiddenColors.add(color));
        secondNodeColors.forEach(color => combinedForbiddenColors.add(color));

        // Determine the color for the current edge.
        let assignedColorForEdge;

        // Scenario 1: If neither node has any colors assigned (i.e., this is the first edge connected to these nodes).
        if (combinedForbiddenColors.size === 0) {
            assignedColorForEdge = 1; // Assign the first available color.
            currentMaxColor = Math.max(currentMaxColor, 1); // Update the overall maximum color used.
        } else {
            // Scenario 2: Nodes already have some colors assigned. Find the smallest available color.
            let candidateColor = 1;
            // Iterate upwards from 1 until an unused color is found.
            while (combinedForbiddenColors.has(candidateColor)) {
                candidateColor++;
            }
            assignedColorForEdge = candidateColor;
            // Update the global maximum color if the newly assigned color is higher.
            currentMaxColor = Math.max(currentMaxColor, assignedColorForEdge);
        }

        // Store the newly assigned color for both nodes in their respective sets.
        firstNodeColors.add(assignedColorForEdge);
        secondNodeColors.add(assignedColorForEdge);

        // Update the node color assignments map with the modified sets.
        nodeColorAssignments.set(firstNodeId, firstNodeColors);
        nodeColorAssignments.set(secondNodeId, secondNodeColors);

        // Record the assigned color for the current edge for final output.
        resultingEdgeColors.push(assignedColorForEdge);
    }

    // Output the highest color value that was used across all edges.
    console.log(currentMaxColor);

    // Output the color assigned to each individual edge, in processing order.
    resultingEdgeColors.forEach(color => {
        console.log(color);
    });
}

// --- Entry point for execution ---
// This section handles reading input from standard input and invoking the main processing function.
const standardInputReader = require('fs').readFileSync;
const inputSourcePath = '/dev/stdin';
const encodingType = 'utf8';

try {
    // Read the entire input content from stdin.
    const rawInputContent = standardInputReader(inputSourcePath, encodingType);
    // Trim any leading/trailing whitespace and split the content into an array of lines.
    const processedInputLines = rawInputContent.trim().split("\n");
    
    // Call the main function with the processed input.
    processGraphEdges(processedInputLines);
} catch (error) {
    // Log an error if input reading or processing fails.
    console.error("Failed to read or process input:", error.message);
    // In a production environment, one might choose to exit the process here.
    // process.exit(1); 
}