'use strict'; // Enforce strict parsing and error handling for cleaner code.

/**
 * Global constant representing an extremely high edge weight or infinity.
 * This value is used as a sentinel for non-existent edges or during
 * initialization to ensure any valid edge weight will be smaller.
 */
const MAX_POSSIBLE_EDGE_WEIGHT = 100000001; // Matches the original's 10^8 + 1

/**
 * Helper function to determine if all nodes in the grid belong to the same
 * connected component, signifying that the Minimum Spanning Tree is complete.
 *
 * @param {Array<Array<Array<number>>>} currentGridState - The 3D array where each inner array
 *                                                         `[row][col][0]` stores the component ID.
 * @param {number} totalGraphRows - The total number of rows (H) in the graph, including boundary.
 * @param {number} totalGraphColumns - The total number of columns (W) in the graph, including boundary.
 * @returns {boolean} True if all nodes share the same component ID, indicating full connectivity.
 */
function checkConnectivityStatus(currentGridState, totalGraphRows, totalGraphColumns) {
    // Basic validation for grid state and dimensions.
    if (!currentGridState || totalGraphRows < 0 || totalGraphColumns < 0) {
        console.error("Error: Invalid grid state or dimensions for connectivity check.");
        return false; // Indicate an invalid state
    }

    // Use the component ID of the top-left node as the reference.
    const referenceComponentId = currentGridState[0][0][0];

    // Iterate through every node in the grid.
    for (let r = 0; r <= totalGraphRows; r++) {
        for (let c = 0; c <= totalGraphColumns; c++) {
            // If any node's component ID differs from the reference, not all nodes are connected.
            if (currentGridState[r][c][0] !== referenceComponentId) {
                return false;
            }
        }
    }
    // If the loop completes, all nodes are connected to the same component.
    return true;
}

/**
 * Recursively calculates the Minimum Spanning Tree (MST) cost for a grid graph.
 * This function mimics a Kruskal-like approach by repeatedly finding the cheapest
 * edge that connects two different components and merging them.
 *
 * @param {Array<Array<Array<number>>>} gridNodeData - A 3D array representing the grid nodes.
 *                                                     Each `gridNodeData[r][c]` is `[componentId, rightEdgeCost, downEdgeCost]`.
 * @param {number} totalGraphRows - The number of rows (H) in the conceptual grid graph.
 * @param {number} totalGraphColumns - The number of columns (W) in the conceptual grid graph.
 * @param {number} currentAccumulatedCost - The sum of edge weights chosen in previous recursive steps.
 * @param {number} [recursionDepth=0] - A counter to prevent infinite recursion in pathological cases.
 * @returns {number} The final calculated MST cost, or MAX_POSSIBLE_EDGE_WEIGHT if an error occurs.
 */
function calculateMstCostIteratively(gridNodeData, totalGraphRows, totalGraphColumns, currentAccumulatedCost, recursionDepth = 0) {
    // Guard clause: Limit recursion depth to prevent stack overflow for very large or problematic inputs.
    // A heuristic maximum depth is roughly twice the number of nodes (as each edge selection reduces component count).
    if (recursionDepth > (totalGraphRows + 1) * (totalGraphColumns + 1) * 2) {
        console.error("Error: Recursion depth limit exceeded. Potential infinite loop or logic error detected.");
        return MAX_POSSIBLE_EDGE_WEIGHT; // Indicate a failure to compute MST.
    }

    // Base case: If all nodes are already connected, the MST is complete.
    if (checkConnectivityStatus(gridNodeData, totalGraphRows, totalGraphColumns)) {
        return currentAccumulatedCost;
    }

    // Object to store details of the cheapest edge found in the current iteration.
    let cheapestEdgeCandidate = {
        weight: MAX_POSSIBLE_EDGE_WEIGHT,
        firstComponent: -1,  // Component ID of the first node of the edge
        secondComponent: -1  // Component ID of the second node of the edge
    };

    // --- Step 1: Search for the minimum cost horizontal edge ---
    // Iterate through all possible horizontal edges. An edge exists between (r,c) and (r,c+1).
    // The gridNodeData has dimensions (totalGraphRows+1) x (totalGraphColumns+1).
    for (let r = 0; r <= totalGraphRows; r++) {
        for (let c = 0; c < totalGraphColumns; c++) { // Horizontal edges connect 'c' to 'c+1', so 'c' goes up to 'totalGraphColumns - 1'.
            const nodeLeftComponent = gridNodeData[r][c][0];
            const nodeRightComponent = gridNodeData[r][c + 1][0];
            const edgeWeight = gridNodeData[r][c][1]; // Cost of the edge to the right of node (r,c).

            // If this edge connects two different components and is cheaper than the current best.
            if (nodeLeftComponent !== nodeRightComponent && edgeWeight < cheapestEdgeCandidate.weight) {
                cheapestEdgeCandidate.weight = edgeWeight;
                cheapestEdgeCandidate.firstComponent = nodeLeftComponent;
                cheapestEdgeCandidate.secondComponent = nodeRightComponent;
            }
        }
    }

    // --- Step 2: Search for the minimum cost vertical edge ---
    // Iterate through all possible vertical edges. An edge exists between (r,c) and (r+1,c).
    for (let r = 0; r < totalGraphRows; r++) { // Vertical edges connect 'r' to 'r+1', so 'r' goes up to 'totalGraphRows - 1'.
        for (let c = 0; c <= totalGraphColumns; c++) {
            const nodeUpComponent = gridNodeData[r][c][0];
            const nodeDownComponent = gridNodeData[r + 1][c][0];
            const edgeWeight = gridNodeData[r][c][2]; // Cost of the edge below node (r,c).

            // If this edge connects two different components and is cheaper than the current best.
            if (nodeUpComponent !== nodeDownComponent && edgeWeight < cheapestEdgeCandidate.weight) {
                cheapestEdgeCandidate.weight = edgeWeight;
                cheapestEdgeCandidate.firstComponent = nodeUpComponent;
                cheapestEdgeCandidate.secondComponent = nodeDownComponent;
            }
        }
    }

    // If no suitable edge was found (e.g., the graph is already connected, or it's impossible to connect further).
    if (cheapestEdgeCandidate.weight === MAX_POSSIBLE_EDGE_WEIGHT) {
        // If we reach here and the graph is still not connected, it indicates a problem
        // (e.g., disconnected graph components, or an issue with edge weights).
        if (!checkConnectivityStatus(gridNodeData, totalGraphRows, totalGraphColumns)) {
            console.warn("Warning: No minimum edge found to connect components, but not all nodes are connected. Graph might be inherently disconnected or input data is problematic.");
            return MAX_POSSIBLE_EDGE_WEIGHT; // Indicate a failure to form a complete MST.
        }
        return currentAccumulatedCost; // All connected, but no more edges to consider, return current total.
    }

    // Store the component IDs that need to be merged.
    const componentToAbsorb = cheapestEdgeCandidate.secondComponent;
    const absorbingComponent = cheapestEdgeCandidate.firstComponent;

    // --- Step 3: Merge the two components ---
    // This is an inefficient but direct implementation of the original's component merging logic:
    // Iterate through all nodes in the grid and update their component ID if they belong to 'componentToAbsorb'.
    for (let r = 0; r <= totalGraphRows; r++) {
        for (let c = 0; c <= totalGraphColumns; c++) {
            if (gridNodeData[r][c][0] === componentToAbsorb) {
                gridNodeData[r][c][0] = absorbingComponent;
            }
        }
    }

    // Add the weight of the newly selected edge to the total accumulated cost.
    const updatedAccumulatedCost = currentAccumulatedCost + cheapestEdgeCandidate.weight;

    // Recursively call the function to continue finding edges until all nodes are connected.
    return calculateMstCostIteratively(gridNodeData, totalGraphRows, totalGraphColumns, updatedAccumulatedCost, recursionDepth + 1);
}

/**
 * The primary function to process raw input, initialize the grid graph,
 * and then compute and output the Minimum Spanning Tree cost.
 *
 * @param {string} rawInputString - The entire input read as a single string,
 *                                  typically from standard input.
 */
function computeMinimumSpanningTree(rawInputString) {
    // Input validation: Ensure the input string is valid.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Error: Invalid or empty input string provided.");
        return;
    }

    const inputLines = rawInputString.split("\n");

    // Input validation: Check for minimum required lines.
    if (inputLines.length < 1) {
        console.error("Error: Input contains insufficient lines. Expected at least grid dimensions.");
        return;
    }

    // Parse grid dimensions (Width and Height) from the first line.
    const dimensionComponents = inputLines[0].split(" ");
    if (dimensionComponents.length < 2) {
        console.error("Error: Missing grid dimensions (W H) in the first line of input.");
        return;
    }

    const totalColumns = parseInt(dimensionComponents[0]); // Corresponds to W (width)
    const totalRows = parseInt(dimensionComponents[1]);    // Corresponds to H (height)

    // Validate parsed dimensions.
    if (isNaN(totalColumns) || totalColumns <= 0 || isNaN(totalRows) || totalRows <= 0) {
        console.error(`Error: Invalid grid dimensions. W (${totalColumns}) and H (${totalRows}) must be positive integers.`);
        return;
    }

    // Read horizontal edge costs (p array in original). These connect (r,c) to (r,c+1).
    const horizontalConnectionCosts = [];
    // Ensure enough input lines are available for horizontal costs.
    if (inputLines.length < 1 + totalColumns) {
        console.error(`Error: Insufficient input lines for ${totalColumns} horizontal edge costs.`);
        return;
    }
    for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
        const costString = inputLines[1 + colIndex];
        const parsedCost = parseInt(costString);
        // If parsed value is not a number, assign the MAX_POSSIBLE_EDGE_WEIGHT sentinel.
        horizontalConnectionCosts.push(isNaN(parsedCost) ? MAX_POSSIBLE_EDGE_WEIGHT : parsedCost);
    }

    // Read vertical edge costs (q array in original). These connect (r,c) to (r+1,c).
    const verticalConnectionCosts = [];
    // Ensure enough input lines are available for vertical costs.
    if (inputLines.length < 1 + totalColumns + totalRows) {
        console.error(`Error: Insufficient input lines for ${totalRows} vertical edge costs.`);
        return;
    }
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        const costString = inputLines[1 + totalColumns + rowIndex];
        const parsedCost = parseInt(costString);
        // If parsed value is not a number, assign the MAX_POSSIBLE_EDGE_WEIGHT sentinel.
        verticalConnectionCosts.push(isNaN(parsedCost) ? MAX_POSSIBLE_EDGE_WEIGHT : parsedCost);
    }

    // Initialize the 3D grid data structure.
    // The grid represents (H+1) x (W+1) nodes.
    // Each `gridNodeData[r][c]` stores:
    // [0]: The current component identifier of this node.
    // [1]: The cost of the horizontal edge extending to the right from (r,c).
    // [2]: The cost of the vertical edge extending downwards from (r,c).
    const gridNodeData = [];
    for (let r = 0; r <= totalRows; r++) {
        gridNodeData.push([]);
        for (let c = 0; c <= totalColumns; c++) {
            // Assign a unique initial component ID to each node.
            const nodeComponentIdentifier = (totalColumns + 1) * r + c;

            // Determine the cost of the horizontal edge to the right of (r,c).
            // If 'c' is the last column index, there's no edge to the right.
            const rightwardEdgeCost = (c < totalColumns)
                ? horizontalConnectionCosts[c]
                : MAX_POSSIBLE_EDGE_WEIGHT;

            // Determine the cost of the vertical edge below (r,c).
            // If 'r' is the last row index, there's no edge downwards.
            const downwardEdgeCost = (r < totalRows)
                ? verticalConnectionCosts[r]
                : MAX_POSSIBLE_EDGE_WEIGHT;

            gridNodeData[r][c] = [
                nodeComponentIdentifier,
                rightwardEdgeCost,
                downwardEdgeCost
            ];
        }
    }

    // Initiate the recursive calculation of the Minimum Spanning Tree cost.
    const finalSpanningTreeCost = calculateMstCostIteratively(
        gridNodeData,
        totalRows,
        totalColumns,
        0 // Start with an initial accumulated cost of zero.
    );

    // Output the final calculated MST cost.
    console.log(finalSpanningTreeCost);
}

// Entry point for execution: Read from standard input and pass to the main processing function.
// This part is typically environment-dependent and kept similar to the original for execution context.
computeMinimumSpanningTree(require("fs").readFileSync("/dev/stdin", "utf8"));