'use strict';

// Primary function to handle the entire input processing and calculation.
function ProcessInput(rawData) {
  // Divide the raw input string into individual lines.
  let lines = rawData.split("\n");

  // Extract grid dimensions from the first line of input.
  let dimensionsStr = lines[0].split(" ");
  let widthVal = parseInt(dimensionsStr[0]); // Represents the width of the grid.
  let heightVal = parseInt(dimensionsStr[1]); // Represents the height of the grid.

  // Initialize arrays to store the costs associated with horizontal and vertical edges.
  let horizontalCosts = [];
  let verticalCosts = [];

  // Populate the horizontal edge costs array from the input lines.
  for (let idx = 0; idx < widthVal; idx++) {
    horizontalCosts.push(lines[1 + idx]);
  }

  // Populate the vertical edge costs array from the input lines.
  for (let idx = 0; idx < heightVal; idx++) {
    verticalCosts.push(lines[1 + widthVal + idx]);
  }

  // Create a 2D array to represent each node in the grid.
  // Each node will store its current component ID, and the costs of its potential horizontal and vertical edges.
  let gridNodes = [];
  for (let rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
    gridNodes.push([]); // Add a new row for grid nodes.
    for (let colIdx = 0; colIdx < widthVal + 1; colIdx++) {
      gridNodes[rowIdx][colIdx] = []; // Initialize an array for node properties.
      // Property 0: Unique identifier for the connected component this node belongs to.
      gridNodes[rowIdx][colIdx][0] = (widthVal + 1) * rowIdx + colIdx;
      // Property 1: Cost of the horizontal edge extending from this node (to the right).
      // Defaults to a very large number if parsing fails (e.g., empty string).
      gridNodes[rowIdx][colIdx][1] = parseInt(horizontalCosts[colIdx]) || 100000001;
      // Property 2: Cost of the vertical edge extending from this node (downwards).
      // Defaults to a very large number if parsing fails.
      gridNodes[rowIdx][colIdx][2] = parseInt(verticalCosts[rowIdx]) || 100000001;
    }
  }

  // Recursive function to compute the Minimum Spanning Tree (MST) cost using a Kruskal-like approach.
  function calculateMinimumSpanningTree(totalWeight) {
    // Initialize the minimum edge weight found in the current iteration to a very high value.
    let currentMinEdgeWeight = 100000001; // A value larger than any expected edge cost.
    // An array to hold the component IDs of the two nodes that will be merged by the chosen minimum edge.
    let edgeToMerge = [];
    let colIdx = 0, rowIdx = 0; // Loop variables for grid traversal.

    // Iterate through the main part of the grid to find the smallest edge
    // that connects two distinct components.
    for (rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      for (colIdx = 0; colIdx < widthVal; colIdx++) {
        // Evaluate the horizontal edge (from current node to the node on its right).
        if (gridNodes[rowIdx][colIdx][1] < currentMinEdgeWeight && gridNodes[rowIdx][colIdx][0] !== gridNodes[rowIdx][colIdx + 1][0]) {
          currentMinEdgeWeight = gridNodes[rowIdx][colIdx][1];
          edgeToMerge[0] = gridNodes[rowIdx][colIdx][0]; // Component ID of the first node.
          edgeToMerge[1] = gridNodes[rowIdx][colIdx + 1][0]; // Component ID of the second node.
        }
        // Evaluate the vertical edge (from current node to the node below it).
        if (gridNodes[rowIdx][colIdx][2] < currentMinEdgeWeight && gridNodes[rowIdx][colIdx][0] !== gridNodes[rowIdx + 1][colIdx][0]) {
          currentMinEdgeWeight = gridNodes[rowIdx][colIdx][2];
          edgeToMerge[0] = gridNodes[rowIdx][colIdx][0]; // Component ID of the first node.
          edgeToMerge[1] = gridNodes[rowIdx + 1][colIdx][0]; // Component ID of the second node.
        }
      }
    }

    // Check horizontal edges in the last row of nodes (heightVal, colIdx to heightVal, colIdx+1).
    for (colIdx = 0; colIdx < widthVal; colIdx++) {
      if (gridNodes[heightVal][colIdx][1] < currentMinEdgeWeight && gridNodes[heightVal][colIdx][0] !== gridNodes[heightVal][colIdx + 1][0]) {
        currentMinEdgeWeight = gridNodes[heightVal][colIdx][1];
        edgeToMerge[0] = gridNodes[heightVal][colIdx][0];
        edgeToMerge[1] = gridNodes[heightVal][colIdx + 1][0];
      }
    }

    // Check vertical edges in the last column of nodes (rowIdx, widthVal to rowIdx+1, widthVal).
    for (rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      if (gridNodes[rowIdx][widthVal][2] < currentMinEdgeWeight && gridNodes[rowIdx][widthVal][0] !== gridNodes[rowIdx + 1][widthVal][0]) {
        currentMinEdgeWeight = gridNodes[rowIdx][widthVal][2];
        edgeToMerge[0] = gridNodes[rowIdx][widthVal][0];
        edgeToMerge[1] = gridNodes[rowIdx + 1][widthVal][0];
      }
    }

    // Perform the union operation: merge the two components found.
    // All nodes that were part of `edgeToMerge[1]`'s component are now assigned to `edgeToMerge[0]`'s component.
    for (rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
      for (colIdx = 0; colIdx < widthVal + 1; colIdx++) {
        if (gridNodes[rowIdx][colIdx][0] === edgeToMerge[1]) {
          gridNodes[rowIdx][colIdx][0] = edgeToMerge[0];
        }
      }
    }

    // Add the cost of the newly included edge to the running total.
    totalWeight += currentMinEdgeWeight;

    // Verify if all nodes are now connected into a single component.
    // This is checked by comparing every node's component ID to the component ID of the very first node (0,0).
    for (rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
      for (colIdx = 0; colIdx < widthVal + 1; colIdx++) {
        if (gridNodes[0][0][0] !== gridNodes[rowIdx][colIdx][0]) {
          // If not all nodes are connected, recursively call the function to find the next minimum edge.
          return calculateMinimumSpanningTree(totalWeight);
        }
      }
    }

    // If all nodes are part of the same component, the MST is complete, return the accumulated total cost.
    return totalWeight;
  }

  // Initiate the MST calculation with an initial total cost of zero.
  let finalCost = calculateMinimumSpanningTree(0);
  // Output the computed minimum spanning tree cost to the console.
  console.log(finalCost);
}

// Read the input data from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
