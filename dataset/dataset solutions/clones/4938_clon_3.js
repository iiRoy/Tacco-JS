'use strict';

function ProcessInput(rawData) {
  let lines = rawData.split("\n");

  const MAX_EDGE_WEIGHT = 100000001; // Constant representing an effectively infinite edge weight

  // Helper function to parse initial dimensions and cost arrays
  function parseInitialData(inputLines) {
    let dimensionsStr = inputLines[0].split(" ");
    let parsedWidth = parseInt(dimensionsStr[0]);
    let parsedHeight = parseInt(dimensionsStr[1]);

    let horizontalCostsRaw = [];
    for (let idx = 0; idx < parsedWidth; idx++) {
      horizontalCostsRaw.push(inputLines[1 + idx]);
    }

    let verticalCostsRaw = [];
    for (let idx = 0; idx < parsedHeight; idx++) {
      verticalCostsRaw.push(inputLines[1 + parsedWidth + idx]);
    }
    return {
      width: parsedWidth,
      height: parsedHeight,
      pCosts: horizontalCostsRaw,
      qCosts: verticalCostsRaw
    };
  }

  const initialData = parseInitialData(lines);
  const width = initialData.width;
  const height = initialData.height;
  const pCosts = initialData.pCosts;
  const qCosts = initialData.qCosts;

  // Helper function for safe parsing of cost strings, defaulting to MAX_EDGE_WEIGHT
  function getParsedCost(costStr) {
    const val = parseInt(costStr);
    return isNaN(val) ? MAX_EDGE_WEIGHT : val;
  }

  // Initialize the grid of nodes. Each node stores its component ID and associated edge costs.
  // gridNodes[row][col] = [componentId, horizontalEdgeCostToRight, verticalEdgeCostToBottom]
  let gridNodes = [];
  for (let row = 0; row <= height; row++) {
    gridNodes.push([]);
    for (let col = 0; col <= width; col++) {
      gridNodes[row][col] = [
        (width + 1) * row + col, // Unique component ID for each node initially
        getParsedCost(pCosts[col]), // Horizontal edge cost from (row, col) to (row, col+1)
        getParsedCost(qCosts[row]) // Vertical edge cost from (row, col) to (row+1, col)
      ];
    }
  }

  // Recursive function to calculate the Minimum Spanning Tree cost
  function calculateMinimumSpanningTreeCost(currentTotalCost) {
    let minEdgeFound = MAX_EDGE_WEIGHT;
    let componentsToMerge = {
      sourceComponentId: -1,
      targetComponentId: -1
    };

    // Helper function to find the minimum-weight edge that connects two different components
    function findNextMinConnectingEdge() {
      let localMinWeight = MAX_EDGE_WEIGHT;
      let localMergeInfo = {
        source: -1,
        target: -1
      };

      // Check all horizontal edges
      // An edge exists between (row, col) and (row, col+1)
      // This applies for all rows (0 to H) and columns (0 to W-1)
      for (let row = 0; row <= height; row++) {
        for (let col = 0; col < width; col++) {
          const nodeA = gridNodes[row][col];
          const nodeB = gridNodes[row][col + 1];
          const edgeWeight = nodeA[1]; // Cost of horizontal edge from nodeA

          if (nodeA[0] !== nodeB[0] && edgeWeight < localMinWeight) {
            localMinWeight = edgeWeight;
            localMergeInfo.source = nodeA[0];
            localMergeInfo.target = nodeB[0];
          }
        }
      }

      // Check all vertical edges
      // An edge exists between (row, col) and (row+1, col)
      // This applies for all rows (0 to H-1) and columns (0 to W)
      for (let row = 0; row < height; row++) {
        for (let col = 0; col <= width; col++) {
          const nodeA = gridNodes[row][col];
          const nodeB = gridNodes[row + 1][col];
          const edgeWeight = nodeA[2]; // Cost of vertical edge from nodeA

          if (nodeA[0] !== nodeB[0] && edgeWeight < localMinWeight) {
            localMinWeight = edgeWeight;
            localMergeInfo.source = nodeA[0];
            localMergeInfo.target = nodeB[0];
          }
        }
      }
      return {
        weight: localMinWeight,
        merge: localMergeInfo
      };
    }

    const minEdgeResult = findNextMinConnectingEdge();
    minEdgeFound = minEdgeResult.weight;
    componentsToMerge.sourceComponentId = minEdgeResult.merge.source;
    componentsToMerge.targetComponentId = minEdgeResult.merge.target;

    // If no connecting edge was found, it implies all nodes are already connected.
    // This condition should ideally be caught by `areAllNodesConnected` first.
    if (minEdgeFound === MAX_EDGE_WEIGHT) {
      return currentTotalCost;
    }

    // Helper function to merge two components by updating their component IDs
    function performComponentUnion(sourceId, targetId) {
      for (let row = 0; row <= height; row++) {
        for (let col = 0; col <= width; col++) {
          if (gridNodes[row][col][0] === targetId) {
            gridNodes[row][col][0] = sourceId;
          }
        }
      }
    }

    performComponentUnion(componentsToMerge.sourceComponentId, componentsToMerge.targetComponentId);
    let updatedCost = currentTotalCost + minEdgeFound;

    // Helper function to check if all nodes belong to the same component
    function areAllNodesUnified() {
      const referenceComponentId = gridNodes[0][0][0];
      for (let row = 0; row <= height; row++) {
        for (let col = 0; col <= width; col++) {
          if (gridNodes[row][col][0] !== referenceComponentId) {
            return false;
          }
        }
      }
      return true;
    }

    // If not all nodes are connected, recurse to find the next minimum edge
    if (!areAllNodesUnified()) {
      return calculateMinimumSpanningTreeCost(updatedCost);
    } else {
      // All nodes are connected, return the final accumulated cost
      return updatedCost;
    }
  }

  let finalCost = calculateMinimumSpanningTreeCost(0);
  console.log(finalCost);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
