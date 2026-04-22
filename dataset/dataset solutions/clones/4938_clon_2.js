'use strict';

// This function processes grid input data and calculates the minimum spanning tree cost.
function ProcessGridData(RAW_DATA_STRING) {
  // Split the raw input string into individual lines.
  const dataLines = RAW_DATA_STRING.split('\n');

  // Extract grid dimensions from the first line.
  const dimensionsString = dataLines[0].split(' ');
  const gridWidth = Number.parseInt(dimensionsString[0]);
  const gridHeight = Number.parseInt(dimensionsString[1]);

  // Arrays to store edge weights along horizontal and vertical paths.
  const horizontalWeights = [];
  const verticalWeights = [];

  // Populate horizontal edge weights from input lines.
  for ( let idx = 0; idx < gridWidth; ++idx ) {
    horizontalWeights.push(dataLines[1 + idx]);
  }

  // Populate vertical edge weights from input lines.
  for ( let idx = 0; idx < gridHeight; ++idx ) {
    verticalWeights.push(dataLines[1 + gridWidth + idx]);
  }

  // Initialize a 2D grid structure to represent cells and their connections.
  // Each cell stores its component ID, horizontal edge weight, and vertical edge weight.
  const cellConnections = [];
  for ( let rowCoord = 0; rowCoord < gridHeight + 1; ++rowCoord ) {
    cellConnections.push([]);
    for ( let colCoord = 0; colCoord < gridWidth + 1; ++colCoord ) {
      cellConnections[rowCoord][colCoord] = [];
      // Assign a unique initial component identifier to each cell.
      cellConnections[rowCoord][colCoord][0] = (gridWidth + 1) * rowCoord + colCoord;
      // Store horizontal edge weight (or a large default if not available).
      cellConnections[rowCoord][colCoord][1] = Number.parseInt(horizontalWeights[colCoord]) || 100000001;
      // Store vertical edge weight (or a large default if not available).
      cellConnections[rowCoord][colCoord][2] = Number.parseInt(verticalWeights[rowCoord]) || 100000001;
    }
  }

  // Recursive function to implement a variation of Kruskal's algorithm for MST.
  // It repeatedly finds the minimum edge and merges components until all cells are connected.
  function computeMST(totalWeightAccumulator) {
    let currentMinEdgeWeight = 100000001; // Initialize with a very high cost (effectively infinity).
    let connectionToMerge = [];         // Stores the component IDs of the two nodes to be merged.
    let colIterator = 0, rowIterator = 0; // Iterators for grid traversal.

    // Iterate through the grid to find the smallest available edge (horizontal or vertical).
    // This loop covers all internal horizontal and vertical edges.
    for ( rowIterator = 0; rowIterator < gridHeight; ++rowIterator ) {
      for ( colIterator = 0; colIterator < gridWidth; ++colIterator ) {
        // Check horizontal edge: if it's smaller than current minimum AND connects different components.
        if ( cellConnections[rowIterator][colIterator][1] < currentMinEdgeWeight &&
             cellConnections[rowIterator][colIterator][0] !== cellConnections[rowIterator][colIterator + 1][0] ) {
          currentMinEdgeWeight = cellConnections[rowIterator][colIterator][1];
          connectionToMerge[0] = cellConnections[rowIterator][colIterator][0];
          connectionToMerge[1] = cellConnections[rowIterator][colIterator + 1][0];
        }
        // Check vertical edge: if it's smaller than current minimum AND connects different components.
        if ( cellConnections[rowIterator][colIterator][2] < currentMinEdgeWeight &&
             cellConnections[rowIterator][colIterator][0] !== cellConnections[rowIterator + 1][colIterator][0] ) {
          currentMinEdgeWeight = cellConnections[rowIterator][colIterator][2];
          connectionToMerge[0] = cellConnections[rowIterator][colIterator][0];
          connectionToMerge[1] = cellConnections[rowIterator + 1][colIterator][0];
        }
      }
    }

    // Check horizontal edges in the last row (H-th row, indices H, H+1).
    for ( colIterator = 0; colIterator < gridWidth; ++colIterator ) {
      if ( cellConnections[gridHeight][colIterator][1] < currentMinEdgeWeight &&
           cellConnections[gridHeight][colIterator][0] !== cellConnections[gridHeight][colIterator + 1][0] ) {
        currentMinEdgeWeight = cellConnections[gridHeight][colIterator][1];
        connectionToMerge[0] = cellConnections[gridHeight][colIterator][0];
        connectionToMerge[1] = cellConnections[gridHeight][colIterator + 1][0];
      }
    }

    // Check vertical edges in the last column (W-th column, indices W, W+1).
    for ( rowIterator = 0; rowIterator < gridHeight; ++rowIterator ) {
      if ( cellConnections[rowIterator][gridWidth][2] < currentMinEdgeWeight &&
           cellConnections[rowIterator][gridWidth][0] !== cellConnections[rowIterator + 1][gridWidth][0] ) {
        currentMinEdgeWeight = cellConnections[rowIterator][gridWidth][2];
        connectionToMerge[0] = cellConnections[rowIterator][gridWidth][0];
        connectionToMerge[1] = cellConnections[rowIterator + 1][gridWidth][0];
      }
    }

    // Perform the union operation: merge the two components identified by connectionToMerge.
    // All cells belonging to the second component ID are reassigned to the first component ID.
    for ( rowIterator = 0; rowIterator < gridHeight + 1; ++rowIterator ) {
      for ( colIterator = 0; colIterator < gridWidth + 1; ++colIterator ) {
        if ( cellConnections[rowIterator][colIterator][0] === connectionToMerge[1] ) {
          cellConnections[rowIterator][colIterator][0] = connectionToMerge[0];
        }
      }
    }

    // Add the cost of the chosen edge to the running total.
    totalWeightAccumulator += currentMinEdgeWeight;

    // Check if all cells are now part of the same connected component.
    // If not, recursively call computeMST to find the next smallest edge.
    for ( rowIterator = 0; rowIterator < gridHeight + 1; ++rowIterator ) {
      for ( colIterator = 0; colIterator < gridWidth + 1; ++colIterator ) {
        // Compare current cell's component ID to the component ID of the very first cell.
        if ( cellConnections[0][0][0] !== cellConnections[rowIterator][colIterator][0] ) {
          return computeMST(totalWeightAccumulator); // Not fully connected, continue.
        }
      }
    }

    // All cells are connected; return the accumulated total weight.
    return totalWeightAccumulator;
  }

  // Initiate the MST calculation with an initial total weight of zero.
  let finalSpanningTreeWeight = computeMST(0);
  // Output the final calculated minimum spanning tree weight.
  console.info(finalSpanningTreeWeight);
}

// Read input from standard input and pass it to the main processing function.
ProcessGridData(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));