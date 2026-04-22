'use strict';

/**
 * Primary application handler for processing grid-related input data.
 * This function orchestrates the parsing of dimensions and edge weights,
 * initializes the grid structure, and then computes the Minimum Spanning Tree (MST) cost.
 * @param {string} rawInputStringData - The complete string input received, typically from standard input.
 */
function ProcessInputData(rawInputStringData) {
    // Define a constant for an extremely high cost, used as an initial minimum or for invalid edges.
    // This value is chosen to be greater than any expected valid edge weight (10^8 + 1).
    const MAX_POSSIBLE_EDGE_COST = 100000001;

    // Split the entire input string into an array of individual lines.
    // Each line contains specific pieces of information.
    let arrayOfInputLines = rawInputStringData.split("\n");

    // The first line contains the grid's dimensions (width and height), separated by a space.
    let gridDimensionTokens = arrayOfInputLines[0].split(" ");

    // Parse the grid width and height from their string representations to integers.
    // Using radix 10 for explicit base conversion.
    let gridWidthValue = parseInt(gridDimensionTokens[0], 10);
    let gridHeightValue = parseInt(gridDimensionTokens[1], 10);

    // --- Type III Addition: Input Validation Guard Clauses ---
    // Ensure that the parsed dimensions are valid non-negative integers.
    if (isNaN(gridWidthValue) || isNaN(gridHeightValue) || gridWidthValue < 0 || gridHeightValue < 0) {
        console.error("Error: Invalid grid dimensions detected. Both width and height must be non-negative integers.");
        return; // Terminate execution if dimensions are invalid.
    }
    // Verify that the number of input lines matches the expected count based on dimensions.
    // Expected lines: 1 (dimensions) + gridWidth (horizontal costs) + gridHeight (vertical costs).
    if (arrayOfInputLines.length < (1 + gridWidthValue + gridHeightValue)) {
        console.error("Error: Insufficient input lines provided for the specified grid dimensions.");
        return; // Terminate execution if input is incomplete.
    }

    // Arrays to store the string representations of horizontal and vertical edge weights.
    // These will be parsed into numbers only when an edge is actively being considered.
    let horizontalConnectionWeights = []; // Stores 'p' values, indexed by column index 'x'.
    let verticalConnectionWeights = [];   // Stores 'q' values, indexed by row index 'y'.

    // Populate the array for horizontal edge weights.
    // These values correspond to connections between column 'x' and 'x+1' across all rows.
    for (let currentColumnIndex = 0; currentColumnIndex < gridWidthValue; currentColumnIndex++) {
        horizontalConnectionWeights.push(arrayOfInputLines[1 + currentColumnIndex]);
    }

    // Populate the array for vertical edge weights.
    // These values correspond to connections between row 'y' and 'y+1' across all columns.
    for (let currentRowIndex = 0; currentRowIndex < gridHeightValue; currentRowIndex++) {
        verticalConnectionWeights.push(arrayOfInputLines[1 + gridWidthValue + currentRowIndex]);
    }

    // --- Type III Modification: Grid Component Storage Optimization ---
    // 'gridCellComponentIdentifiers' will store the component ID for each cell (node) in the grid.
    // The grid itself has (W+1) columns and (H+1) rows, representing the nodes.
    // Unlike the original, this structure *only* stores component IDs, avoiding redundant storage of edge costs.
    let gridCellComponentIdentifiers = [];

    // Initialize each grid cell with a unique identifier.
    // This identifier serves as its initial component representative in a Disjoint Set Union (DSU) context.
    for (let rIndex = 0; rIndex <= gridHeightValue; rIndex++) {
        // Create an intermediate array for the current row's component IDs.
        let currentRowComponentIds = []; // Type III Addition: Intermediate variable.
        for (let cIndex = 0; cIndex <= gridWidthValue; cIndex++) {
            // A unique ID is generated based on its (row, column) position.
            currentRowComponentIds.push((gridWidthValue + 1) * rIndex + cIndex);
        }
        gridCellComponentIdentifiers.push(currentRowComponentIds);
    }

    /**
     * Recursively computes the Minimum Spanning Tree (MST) cost for the grid.
     * This function implements a Kruskal-like algorithm variant:
     * It repeatedly finds the globally minimum cost edge that connects two distinct components,
     * adds its weight to the total cost, merges the components, and then recurses.
     * @param {number} currentAccumulatedCost - The sum of edge weights chosen so far for the MST.
     * @returns {number} The final total cost of the Minimum Spanning Tree.
     */
    function calculateSpanningTreeCost(currentAccumulatedCost) {
        let minimumEdgeWeightFound = MAX_POSSIBLE_EDGE_COST; // Tracks the smallest edge weight in the current scan.
        let componentIdentifierA = -1; // Stores the component ID of the first node of the minimum edge.
        let componentIdentifierB = -1; // Stores the component ID of the second node of the minimum edge.
        let eligibleEdgeDiscovered = false; // Type III Addition: Flag to indicate if any valid connecting edge was found.

        // Iterate through all possible grid cells (nodes) to find the minimum connecting edge.
        // The loops cover all nodes from (0,0) up to (gridHeightValue, gridWidthValue).
        for (let rIter = 0; rIter <= gridHeightValue; rIter++) {
            for (let cIter = 0; cIter <= gridWidthValue; cIter++) {

                // --- Evaluate Potential Horizontal Edges ---
                // A horizontal edge exists between (rIter, cIter) and (rIter, cIter + 1).
                // This check is only valid if 'cIter' is not the last column index.
                if (cIter < gridWidthValue) {
                    let componentIdOfCurrentCell = gridCellComponentIdentifiers[rIter][cIter];
                    let componentIdOfRightCell = gridCellComponentIdentifiers[rIter][cIter + 1];

                    // Proceed only if the two cells are currently in different components.
                    if (componentIdOfCurrentCell !== componentIdOfRightCell) {
                        // Parse the horizontal edge weight. If parsing fails (e.g., non-numeric string),
                        // default to MAX_POSSIBLE_EDGE_COST, effectively ignoring a bad edge.
                        let parsedHorizontalCost = parseInt(horizontalConnectionWeights[cIter], 10) || MAX_POSSIBLE_EDGE_COST;

                        // If this horizontal edge is cheaper than any previously found eligible edge in this iteration.
                        if (parsedHorizontalCost < minimumEdgeWeightFound) {
                            minimumEdgeWeightFound = parsedHorizontalCost;
                            componentIdentifierA = componentIdOfCurrentCell;
                            componentIdentifierB = componentIdOfRightCell;
                            eligibleEdgeDiscovered = true; // Mark that an eligible edge has been found.
                        }
                    }
                }

                // --- Evaluate Potential Vertical Edges ---
                // A vertical edge exists between (rIter, cIter) and (rIter + 1, cIter).
                // This check is only valid if 'rIter' is not the last row index.
                if (rIter < gridHeightValue) {
                    let componentIdOfCurrentCell = gridCellComponentIdentifiers[rIter][cIter];
                    let componentIdOfBelowCell = gridCellComponentIdentifiers[rIter + 1][cIter];

                    // Proceed only if the two cells are currently in different components.
                    if (componentIdOfCurrentCell !== componentIdOfBelowCell) {
                        // Parse the vertical edge weight, handling potential parsing failures.
                        let parsedVerticalCost = parseInt(verticalConnectionWeights[rIter], 10) || MAX_POSSIBLE_EDGE_COST;

                        // If this vertical edge is cheaper than any previously found eligible edge in this iteration.
                        if (parsedVerticalCost < minimumEdgeWeightFound) {
                            minimumEdgeWeightFound = parsedVerticalCost;
                            componentIdentifierA = componentIdOfCurrentCell;
                            componentIdentifierB = componentIdOfBelowCell;
                            eligibleEdgeDiscovered = true; // Mark that an eligible edge has been found.
                        }
                    }
                }
            }
        }

        // --- Type III Rewrite: Termination Condition ---
        // If no eligible edge was found during the exhaustive scan of the grid,
        // it implies that all nodes are already connected into a single component.
        // This serves as the base case for the recursion.
        if (!eligibleEdgeDiscovered) {
            return currentAccumulatedCost;
        }

        // --- Merge Components (Union Operation) ---
        // Update the accumulated cost by adding the weight of the newly chosen minimum edge.
        let newTotalCostAfterMerge = currentAccumulatedCost + minimumEdgeWeightFound; // Type III Addition: Intermediate variable.

        // Perform the "union" operation: all cells belonging to 'componentIdentifierB'
        // are now assigned the component identifier of 'componentIdentifierA'.
        // This effectively merges the two components.
        for (let rowMergeIndex = 0; rowMergeIndex <= gridHeightValue; rowMergeIndex++) {
            for (let colMergeIndex = 0; colMergeIndex <= gridWidthValue; colMergeIndex++) {
                if (gridCellComponentIdentifiers[rowMergeIndex][colMergeIndex] === componentIdentifierB) {
                    gridCellComponentIdentifiers[rowMergeIndex][colMergeIndex] = componentIdentifierA;
                }
            }
        }
        
        // Recursively call the function to continue finding and adding edges
        // until all nodes are unified into a single spanning tree.
        return calculateSpanningTreeCost(newTotalCostAfterMerge);
    }

    // Initiate the MST calculation process with an initial accumulated cost of zero.
    let finalMinimumSpanningCost = calculateSpanningTreeCost(0);

    // Output the computed total cost of the Minimum Spanning Tree.
    console.log(finalMinimumSpanningCost);
}

// Standard Node.js boilerplate for reading input from stdin and executing the main function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));