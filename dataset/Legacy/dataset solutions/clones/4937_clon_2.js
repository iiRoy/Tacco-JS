'use strict';

// Main entry point for processing the input data
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  let lines = rawData.split("\n");

  // Parse grid dimensions from the first line
  let dimensionsStr = lines[0].split(" ");
  let gridWidth = parseInt(dimensionsStr[0]);
  let gridHeight = parseInt(dimensionsStr[1]);

  // Initialize arrays to store horizontal and vertical edge weights
  let horizontalCosts = [];
  let verticalCosts = [];

  // Populate horizontal edge weights from input lines
  for (let idx = 0; idx < gridWidth; idx++) {
    horizontalCosts.push(lines[1 + idx]);
  }

  // Populate vertical edge weights from input lines
  for (let idx = 0; idx < gridHeight; idx++) {
    verticalCosts.push(lines[1 + gridWidth + idx]);
  }

  // Initialize a 3D array to represent the grid nodes and their properties
  // Each node stores: [component_id, horizontal_edge_weight, vertical_edge_weight]
  let gridNodes = [];
  for (let rowIdx = 0; rowIdx < gridHeight + 1; rowIdx++) {
    gridNodes.push([]); // Add a new row
    for (let colIdx = 0; colIdx < gridWidth + 1; colIdx++) {
      gridNodes[rowIdx][colIdx] = []; // Add a new node at this position
      // Assign a unique initial component ID to each node
      gridNodes[rowIdx][colIdx][0] = (gridWidth + 1) * rowIdx + colIdx;
      // Assign horizontal edge weight, defaulting to a large value if not present
      gridNodes[rowIdx][colIdx][1] = parseInt(horizontalCosts[colIdx]) || 100_000_001;
      // Assign vertical edge weight, defaulting to a large value if not present
      gridNodes[rowIdx][colIdx][2] = parseInt(verticalCosts[rowIdx]) || 100_000_001;
    }
  }

  // Recursive function to calculate the Minimum Spanning Tree (MST) cost
  // This function iteratively finds the minimum available edge and merges components
  function calculateMinimumSpanningTree(currentTotalCost) {
    // Initialize minimum edge weight to a very large value
    let minimumEdgeWeight = 100_000_001;
    // Array to store the component IDs that need to be merged
    let componentsToMerge = [];
    let colIter = 0, rowIter = 0; // Iterators for grid traversal

    // Iterate through the main part of the grid (excluding last row/column for some edges)
    for (rowIter = 0; rowIter < gridHeight; rowIter++) {
      for (colIter = 0; colIter < gridWidth; colIter++) {
        // Check horizontal edge to the right
        if (gridNodes[rowIter][colIter][1] < minimumEdgeWeight && gridNodes[rowIter][colIter][0] !== gridNodes[rowIter][colIter + 1][0]) {
          minimumEdgeWeight = gridNodes[rowIter][colIter][1];
          componentsToMerge[0] = gridNodes[rowIter][colIter][0];
          componentsToMerge[1] = gridNodes[rowIter][colIter + 1][0];
        }
        // Check vertical edge downwards
        if (gridNodes[rowIter][colIter][2] < minimumEdgeWeight && gridNodes[rowIter][colIter][0] !== gridNodes[rowIter + 1][colIter][0]) {
          minimumEdgeWeight = gridNodes[rowIter][colIter][2];
          componentsToMerge[0] = gridNodes[rowIter][colIter][0];
          componentsToMerge[1] = gridNodes[rowIter + 1][colIter][0];
        }
      }
    }

    // Handle horizontal edges in the last row (gridHeight)
    for (colIter = 0; colIter < gridWidth; colIter++) {
      if (gridNodes[gridHeight][colIter][1] < minimumEdgeWeight && gridNodes[gridHeight][colIter][0] !== gridNodes[gridHeight][colIter + 1][0]) {
        minimumEdgeWeight = gridNodes[gridHeight][colIter][1];
        componentsToMerge[0] = gridNodes[gridHeight][colIter][0];
        componentsToMerge[1] = gridNodes[gridHeight][colIter + 1][0];
      }
    }

    // Handle vertical edges in the last column (gridWidth)
    for (rowIter = 0; rowIter < gridHeight; rowIter++) {
      if (gridNodes[rowIter][gridWidth][2] < minimumEdgeWeight && gridNodes[rowIter][gridWidth][0] !== gridNodes[rowIter + 1][gridWidth][0]) {
        minimumEdgeWeight = gridNodes[rowIter][gridWidth][2];
        componentsToMerge[0] = gridNodes[rowIter][gridWidth][0];
        componentsToMerge[1] = gridNodes[rowIter + 1][gridWidth][0];
      }
    }

    // Merge the components by updating component IDs
    // All nodes belonging to componentsToMerge[1] are reassigned to componentsToMerge[0]
    for (rowIter = 0; rowIter < gridHeight + 1; rowIter++) {
      for (colIter = 0; colIter < gridWidth + 1; colIter++) {
        if (gridNodes[rowIter][colIter][0] === componentsToMerge[1]) {
          gridNodes[rowIter][colIter][0] = componentsToMerge[0];
        }
      }
    }

    // Add the cost of the chosen minimum edge to the total
    currentTotalCost += minimumEdgeWeight;

    // Check if all nodes are now part of the same connected component
    // If not, recursively call the function to find the next minimum edge
    for (rowIter = 0; rowIter < gridHeight + 1; rowIter++) {
      for (colIter = 0; colIter < gridWidth + 1; colIter++) {
        // Compare each node's component ID to the component ID of the top-left node (0,0)
        if (gridNodes[0][0][0] !== gridNodes[rowIter][colIter][0]) {
          return calculateMinimumSpanningTree(currentTotalCost); // Not all connected, recurse
        }
      }
    }

    // If all nodes are connected, return the final total cost
    return currentTotalCost;
  }

  // Start the MST calculation with an initial cost of 0
  let finalCost = calculateMinimumSpanningTree(0);
  // Output the calculated minimum spanning tree cost
  console.log(finalCost);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
