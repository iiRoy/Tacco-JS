'use strict';

// This function processes the input data to calculate a minimum spanning tree-like cost.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lines = rawData.split("\n");

  // Parse the first line to get grid dimensions.
  let dimensions = lines[0].split(" ");
  let widthVal = parseInt(dimensions[0]);
  let heightVal = parseInt(dimensions[1]);

  // Initialize arrays to store horizontal and vertical edge costs.
  let horizontalCosts = new Array();
  let verticalCosts = new Array();

  // Populate the horizontal costs array.
  for (let idx = 0; idx < widthVal; idx++) {
    horizontalCosts.push(lines[1 + idx]);
  }

  // Populate the vertical costs array.
  for (let idx = 0; idx < heightVal; idx++) {
    verticalCosts.push(lines[1 + widthVal + idx]);
  }

  // Create a 2D array representing grid points (nodes).
  // Each node stores its current cluster ID and potential edge costs.
  let gridPoints = new Array();
  for (let rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
    gridPoints.push([]); // Initialize a new row.
    for (let colIdx = 0; colIdx < widthVal + 1; colIdx++) {
      gridPoints[rowIdx][colIdx] = {
        "groupIdentifier": (widthVal + 1) * rowIdx + colIdx, // Unique ID for initial cluster
        "hCost": parseInt(horizontalCosts[colIdx]) || 100000001, // Horizontal edge cost from this point
        "vCost": parseInt(verticalCosts[rowIdx]) || 100000001  // Vertical edge cost from this point
      };
    }
  }

  // This function implements a Kruskal-like algorithm to find the minimum total weight
  // to connect all grid points. It's recursive.
  function computeMinimumSpanningTree(currentTotalWeight) {
    let minimumEdgeWeight = 100000001; // A large number to represent infinity (10^8 + 1)
    let edgeToMerge = []; // Stores the two nodes whose clusters will be merged

    // Iterate through the internal grid points to find the minimum edge.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      for (let colIdx = 0; colIdx < widthVal; colIdx++) {
        // Check horizontal edge to the right
        if (gridPoints[rowIdx][colIdx].hCost < minimumEdgeWeight &&
            gridPoints[rowIdx][colIdx].groupIdentifier !== gridPoints[rowIdx][colIdx + 1].groupIdentifier) {
          minimumEdgeWeight = gridPoints[rowIdx][colIdx].hCost;
          edgeToMerge[0] = gridPoints[rowIdx][colIdx];
          edgeToMerge[1] = gridPoints[rowIdx][colIdx + 1];
        }
        // Check vertical edge downwards
        if (gridPoints[rowIdx][colIdx].vCost < minimumEdgeWeight &&
            gridPoints[rowIdx][colIdx].groupIdentifier !== gridPoints[rowIdx + 1][colIdx].groupIdentifier) {
          minimumEdgeWeight = gridPoints[rowIdx][colIdx].vCost;
          edgeToMerge[0] = gridPoints[rowIdx][colIdx];
          edgeToMerge[1] = gridPoints[rowIdx + 1][colIdx];
        }
      }
    }

    // Iterate through the rightmost column (excluding the bottom-right corner)
    // to find minimum vertical edges.
    for (let colIdx = 0; colIdx < widthVal; colIdx++) {
      if (gridPoints[heightVal][colIdx].hCost < minimumEdgeWeight &&
          gridPoints[heightVal][colIdx].groupIdentifier !== gridPoints[heightVal][colIdx + 1].groupIdentifier) {
        minimumEdgeWeight = gridPoints[heightVal][colIdx].hCost;
        edgeToMerge[0] = gridPoints[heightVal][colIdx];
        edgeToMerge[1] = gridPoints[heightVal][colIdx + 1];
      }
    }

    // Iterate through the bottommost row (excluding the bottom-right corner)
    // to find minimum horizontal edges.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
      if (gridPoints[rowIdx][widthVal].vCost < minimumEdgeWeight &&
          gridPoints[rowIdx][widthVal].groupIdentifier !== gridPoints[rowIdx + 1][widthVal].groupIdentifier) {
        minimumEdgeWeight = gridPoints[rowIdx][widthVal].vCost;
        edgeToMerge[0] = gridPoints[rowIdx][widthVal];
        edgeToMerge[1] = gridPoints[rowIdx + 1][widthVal];
      }
    }

    // Identify the cluster ID that needs to be merged.
    let targetGroup = edgeToMerge[1].groupIdentifier;

    // Update all nodes belonging to the 'targetGroup' to the 'source' cluster ID.
    for (let rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
      for (let colIdx = 0; colIdx < widthVal + 1; colIdx++) {
        if (gridPoints[rowIdx][colIdx].groupIdentifier === targetGroup) {
          gridPoints[rowIdx][colIdx].groupIdentifier = edgeToMerge[0].groupIdentifier;
        }
      }
    }

    // Add the weight of the chosen edge to the total.
    currentTotalWeight += minimumEdgeWeight;

    // Check if all nodes are now in the same cluster.
    // If not, recursively call the function to find the next minimum edge.
    for (let rowIdx = 0; rowIdx < heightVal + 1; rowIdx++) {
      for (let colIdx = 0; colIdx < widthVal + 1; colIdx++) {
        if (gridPoints[0][0].groupIdentifier !== gridPoints[rowIdx][colIdx].groupIdentifier) {
          return computeMinimumSpanningTree(currentTotalWeight);
        }
      }
    }

    // If all nodes are in the same cluster, return the final total weight.
    return currentTotalWeight;
  }

  // Start the MST computation with an initial total weight of 0.
  let finalCost = computeMinimumSpanningTree(0);
  console.log(finalCost);
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
