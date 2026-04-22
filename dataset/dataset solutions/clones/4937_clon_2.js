'use strict';
// This function processes raw input data to calculate a minimum spanning tree cost.
function ProcessData(rawData) {
  // Split the entire input string into an array of individual lines.
  let lines = rawData.split('\n');

  // Parse the first line to get the grid dimensions (Width and Height).
  let dimensions = lines[0].split(' ');
  let widthVal = parseInt(dimensions[0]);
  let heightVal = parseInt(dimensions[1]);

  // Arrays to store horizontal and vertical edge weights.
  let horizontalCosts = [];
  let verticalCosts = [];

  // Populate horizontal edge costs based on input lines.
  for (let idx = 0; idx < widthVal; idx++) {
    horizontalCosts.push(lines[1 + idx]);
  }

  // Populate vertical edge costs based on input lines.
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    verticalCosts.push(lines[1 + widthVal + rowIdx]);
  }

  // Initialize a 2D array representing grid points (nodes) and their properties.
  // Each grid point stores: [component_id, h_edge_cost, v_edge_cost]
  let gridPoints = [];
  for (let r = 0; r < heightVal + 1; r++) {
    gridPoints.push([]);
    for (let c = 0; c < widthVal + 1; c++) {
      gridPoints[r][c] = [];
      // Assign a unique initial component ID to each grid point.
      gridPoints[r][c][0] = (widthVal + 1) * r + c;
      // Assign horizontal edge cost (or a large value if undefined).
      gridPoints[r][c][1] = parseInt(horizontalCosts[c]) || 100000001;
      // Assign vertical edge cost (or a large value if undefined).
      gridPoints[r][c][2] = parseInt(verticalCosts[r]) || 100000001;
    }
  }

  /**
   * Recursively finds the minimum spanning tree cost using a Kruskal-like approach.
   * In each step, it finds the cheapest edge that connects two different components,
   * merges them, and adds the edge weight to the total.
   * @param {number} currentTotalCost The accumulated cost of the MST so far.
   * @returns {number} The final minimum spanning tree cost.
   */
  function findMinimumSpanningTreeCost(currentTotalCost) {
    let smallestEdgeWeight = 100000001; // Initialize with a very large number.
    let componentsToMerge = []; // Stores the component IDs of the two components to be merged.
    let colIter = 0,
      rowIter = 0;

    // Iterate through the grid to find the cheapest edge that connects distinct components.
    // This part checks horizontal and vertical edges within the main grid area.
    for (rowIter = 0; rowIter < heightVal; rowIter++) {
      for (colIter = 0; colIter < widthVal; colIter++) {
        // Check horizontal edge cost
        if (gridPoints[rowIter][colIter][1] < smallestEdgeWeight && gridPoints[rowIter][colIter][0] !== gridPoints[rowIter][colIter + 1][0]) {
          smallestEdgeWeight = gridPoints[rowIter][colIter][1];
          componentsToMerge[0] = gridPoints[rowIter][colIter][0];
          componentsToMerge[1] = gridPoints[rowIter][colIter + 1][0];
        }
        // Check vertical edge cost
        if (gridPoints[rowIter][colIter][2] < smallestEdgeWeight && gridPoints[rowIter][colIter][0] !== gridPoints[rowIter + 1][colIter][0]) {
          smallestEdgeWeight = gridPoints[rowIter][colIter][2];
          componentsToMerge[0] = gridPoints[rowIter][colIter][0];
          componentsToMerge[1] = gridPoints[rowIter + 1][colIter][0];
        }
      }
    }

    // Check horizontal edges in the last row (H)
    for (colIter = 0; colIter < widthVal; colIter++) {
      if (gridPoints[heightVal][colIter][1] < smallestEdgeWeight && gridPoints[heightVal][colIter][0] !== gridPoints[heightVal][colIter + 1][0]) {
        smallestEdgeWeight = gridPoints[heightVal][colIter][1];
        componentsToMerge[0] = gridPoints[heightVal][colIter][0];
        componentsToMerge[1] = gridPoints[heightVal][colIter + 1][0];
      }
    }

    // Check vertical edges in the last column (W)
    for (rowIter = 0; rowIter < heightVal; rowIter++) {
      if (gridPoints[rowIter][widthVal][2] < smallestEdgeWeight && gridPoints[rowIter][widthVal][0] !== gridPoints[rowIter + 1][widthVal][0]) {
        smallestEdgeWeight = gridPoints[rowIter][widthVal][2];
        componentsToMerge[0] = gridPoints[rowIter][widthVal][0];
        componentsToMerge[1] = gridPoints[rowIter + 1][widthVal][0];
      }
    }

    // After finding the cheapest edge, merge the two components it connects.
    // All nodes belonging to the 'second' component ID (componentsToMerge[1])
    // are reassigned to the 'first' component ID (componentsToMerge[0]).
    for (let rMerge = 0; rMerge < heightVal + 1; rMerge++) {
      for (let cMerge = 0; cMerge < widthVal + 1; cMerge++) {
        if (gridPoints[rMerge][cMerge][0] === componentsToMerge[1]) {
          gridPoints[rMerge][cMerge][0] = componentsToMerge[0];
        }
      }
    }

    // Add the weight of the selected edge to the total cost.
    currentTotalCost += smallestEdgeWeight;

    // Check if all grid points are now part of the same component.
    // If not, recursively call the function to find the next cheapest edge.
    let firstComponentIdentifier = gridPoints[0][0][0];
    for (let rCheck = 0; rCheck < heightVal + 1; rCheck++) {
      for (let cCheck = 0; cCheck < widthVal + 1; cCheck++) {
        if (firstComponentIdentifier !== gridPoints[rCheck][cCheck][0]) {
          // Not all nodes are connected yet, continue building the MST.
          return findMinimumSpanningTreeCost(currentTotalCost);
        }
      }
    }

    // All nodes are connected, return the final MST cost.
    return currentTotalCost;
  }

  // Start the Kruskal-like algorithm with an initial cost of 0.
  let finalSpanningCost = findMinimumSpanningTreeCost(0);
  // Output the computed minimum spanning tree cost.
  console.log(finalSpanningCost);
}

// Read input from standard input and pass it to the main processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));