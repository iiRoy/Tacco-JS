'use strict';

// Helper function to safely parse an integer from a string.
// If parsing fails or the string is empty, it returns a specified default value.
const parseNumericValueOrDefault = (valueString, defaultValue) => {
    const parsedValue = parseInt(valueString, 10);
    return isNaN(parsedValue) ? defaultValue : parsedValue;
};

// Constants for accessing specific data within a grid node array.
const COMPONENT_IDENTIFIER_INDEX = 0;
const HORIZONTAL_EDGE_COST_INDEX = 1;
const VERTICAL_EDGE_COST_INDEX = 2;

// A large constant representing an effectively infinite cost for an edge.
// This value is used when an edge cost is not provided or is invalid.
const INFINITE_EDGE_COST = 100000001; // Equivalent to 10^8 + 1

function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    let inputLines = rawData.split("\n");

    // Parse grid dimensions (width and height) from the first line.
    let dimensionStrings = inputLines[0].split(" ");
    let gridWidth = parseNumericValueOrDefault(dimensionStrings[0], 0);
    let gridHeight = parseNumericValueOrDefault(dimensionStrings[1], 0);

    // Extract strings representing horizontal edge costs.
    // These are 'p' values in the original problem, connecting (x,y) to (x+1,y).
    let horizontalCostStrings = [];
    for (let i = 0; i < gridWidth; i++) {
        horizontalCostStrings.push(inputLines[1 + i]);
    }

    // Extract strings representing vertical edge costs.
    // These are 'q' values in the original problem, connecting (x,y) to (x,y+1).
    let verticalCostStrings = [];
    for (let i = 0; i < gridHeight; i++) {
        verticalCostStrings.push(inputLines[1 + gridWidth + i]);
    }

    // Initialize the grid of nodes. Each node is an array:
    // [componentId, costToRight, costToDown]
    // The grid dimensions are (gridHeight + 1) x (gridWidth + 1) to account for all vertices.
    let gridNodes = [];
    for (let rowIdx = 0; rowIdx <= gridHeight; rowIdx++) {
        let currentRow = [];
        for (let colIdx = 0; colIdx <= gridWidth; colIdx++) {
            // Assign a unique initial component ID to each node.
            const initialComponentId = (gridWidth + 1) * rowIdx + colIdx;
            // Parse horizontal cost, defaulting to INFINITE_EDGE_COST if invalid.
            const hCost = parseNumericValueOrDefault(horizontalCostStrings[colIdx], INFINITE_EDGE_COST);
            // Parse vertical cost, defaulting to INFINITE_EDGE_COST if invalid.
            const vCost = parseNumericValueOrDefault(verticalCostStrings[rowIdx], INFINITE_EDGE_COST);
            currentRow.push([initialComponentId, hCost, vCost]);
        }
        gridNodes.push(currentRow);
    }

    // Helper function to determine if all nodes in the grid belong to the same component.
    // This is the termination condition for the Kruskal-like algorithm.
    const areAllComponentsUnified = (nodesGrid) => {
        const referenceComponentId = nodesGrid[0][0][COMPONENT_IDENTIFIER_INDEX];
        for (let r = 0; r <= gridHeight; r++) {
            for (let c = 0; c <= gridWidth; c++) {
                if (nodesGrid[r][c][COMPONENT_IDENTIFIER_INDEX] !== referenceComponentId) {
                    return false;
                }
            }
        }
        return true;
    };

    // Helper function to merge two components by updating their component IDs.
    // All nodes belonging to 'targetComponentId' will be reassigned to 'newComponentId'.
    const unifyComponents = (nodesGrid, targetComponentId, newComponentId) => {
        for (let r = 0; r <= gridHeight; r++) {
            for (let c = 0; c <= gridWidth; c++) {
                if (nodesGrid[r][c][COMPONENT_IDENTIFIER_INDEX] === targetComponentId) {
                    nodesGrid[r][c][COMPONENT_IDENTIFIER_INDEX] = newComponentId;
                }
            }
        }
    };

    // Implements a recursive Kruskal-like algorithm to find the minimum spanning cost.
    // It iteratively finds the cheapest edge that connects two different components
    // and adds its weight to the total cost, merging the components.
    function calculateMinimumSpanningCost(currentAccumulatedCost) {
        // Base case: If all components are already unified, return the total cost.
        if (areAllComponentsUnified(gridNodes)) {
            return currentAccumulatedCost;
        }

        let minEdgeWeight = INFINITE_EDGE_COST;
        let componentsToMerge = [0, 0]; // Stores the IDs of the two components to be merged.

        // Inner helper function to check an edge and update the minimum found edge.
        // It updates `minEdgeWeight` and `componentsToMerge` if a cheaper valid edge is found.
        const tryUpdateMinEdge = (weight, componentA, componentB) => {
            // An edge is valid if it connects two different components and is cheaper.
            if (componentA !== componentB && weight < minEdgeWeight) {
                minEdgeWeight = weight;
                componentsToMerge[0] = componentA;
                componentsToMerge[1] = componentB;
            }
        };

        // Iterate through all possible horizontal edges in the grid.
        // A horizontal edge connects (r, c) and (r, c+1).
        for (let r = 0; r <= gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                const edgeCost = gridNodes[r][c][HORIZONTAL_EDGE_COST_INDEX];
                const compId1 = gridNodes[r][c][COMPONENT_IDENTIFIER_INDEX];
                const compId2 = gridNodes[r][c + 1][COMPONENT_IDENTIFIER_INDEX];
                tryUpdateMinEdge(edgeCost, compId1, compId2);
            }
        }

        // Iterate through all possible vertical edges in the grid.
        // A vertical edge connects (r, c) and (r+1, c).
        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c <= gridWidth; c++) {
                const edgeCost = gridNodes[r][c][VERTICAL_EDGE_COST_INDEX];
                const compId1 = gridNodes[r][c][COMPONENT_IDENTIFIER_INDEX];
                const compId2 = gridNodes[r + 1][c][COMPONENT_IDENTIFIER_INDEX];
                tryUpdateMinEdge(edgeCost, compId1, compId2);
            }
        }

        // If no valid edge was found (this case should ideally not be reached if the graph is connected
        // and the `areAllComponentsUnified` check is performed first).
        if (minEdgeWeight === INFINITE_EDGE_COST) {
            return currentAccumulatedCost;
        }

        // Merge the two components identified by the minimum edge.
        // The component with ID `componentsToMerge[1]` is merged into `componentsToMerge[0]`.
        unifyComponents(gridNodes, componentsToMerge[1], componentsToMerge[0]);

        // Recursively call the function with the updated total cost.
        return calculateMinimumSpanningCost(currentAccumulatedCost + minEdgeWeight);
    }

    // Start the Kruskal-like algorithm with an initial cost of 0.
    let finalSpanningCost = calculateMinimumSpanningCost(0);
    // Output the calculated minimum spanning cost.
    console.log(finalSpanningCost);
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
