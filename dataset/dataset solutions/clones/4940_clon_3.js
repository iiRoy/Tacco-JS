'use strict';
const fs = require('fs');

function ProcessInput(rawData) {
  const MAX_EDGE_WEIGHT = 100000001;

  let lines = rawData.split("\n");
  let dimensionsStr = lines[0].split(" ");
  let gridWidth = parseInt(dimensionsStr[0]);
  let gridHeight = parseInt(dimensionsStr[1]);

  const parseEdgeCost = (value) => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? MAX_EDGE_WEIGHT : parsed;
  };

  let horizontalCosts = new Array(gridWidth);
  for (let i = 0; i < gridWidth; i++) {
    horizontalCosts[i] = parseEdgeCost(lines[1 + i]);
  }

  let verticalCosts = new Array(gridHeight);
  for (let i = 0; i < gridHeight; i++) {
    verticalCosts[i] = parseEdgeCost(lines[1 + gridWidth + i]);
  }

  let gridPoints = new Array(gridHeight + 1);
  for (let y = 0; y <= gridHeight; y++) {
    gridPoints[y] = new Array(gridWidth + 1);
    for (let x = 0; x <= gridWidth; x++) {
      gridPoints[y][x] = {
        componentId: (gridWidth + 1) * y + x,
        horizontalEdgeCost: (x < gridWidth) ? horizontalCosts[x] : MAX_EDGE_WEIGHT,
        verticalEdgeCost: (y < gridHeight) ? verticalCosts[y] : MAX_EDGE_WEIGHT
      };
    }
  }

  const areAllNodesConnected = (grid, width, height) => {
    const referenceComponent = grid[0][0].componentId;
    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        if (grid[y][x].componentId !== referenceComponent) {
          return false;
        }
      }
    }
    return true;
  };

  const findMinConnectingEdge = (grid, width, height) => {
    let minEdgeWeight = MAX_EDGE_WEIGHT;
    let selectedEdgeEndpoints = null;

    for (let y = 0; y <= height; y++) {
      for (let x = 0; x <= width; x++) {
        const currentPoint = grid[y][x];

        if (x < width) {
          const rightPoint = grid[y][x + 1];
          if (currentPoint.componentId !== rightPoint.componentId) {
            if (currentPoint.horizontalEdgeCost < minEdgeWeight) {
              minEdgeWeight = currentPoint.horizontalEdgeCost;
              selectedEdgeEndpoints = [currentPoint, rightPoint];
            }
          }
        }

        if (y < height) {
          const downPoint = grid[y + 1][x];
          if (currentPoint.componentId !== downPoint.componentId) {
            if (currentPoint.verticalEdgeCost < minEdgeWeight) {
              minEdgeWeight = currentPoint.verticalEdgeCost;
              selectedEdgeEndpoints = [currentPoint, downPoint];
            }
          }
        }
      }
    }
    return selectedEdgeEndpoints ? { weight: minEdgeWeight, nodeA: selectedEdgeEndpoints[0], nodeB: selectedEdgeEndpoints[1] } : null;
  };

  function findMinSpanningCost(accumulatedCost) {
    if (areAllNodesConnected(gridPoints, gridWidth, gridHeight)) {
      return accumulatedCost;
    }

    const minEdgeDetails = findMinConnectingEdge(gridPoints, gridWidth, gridHeight);

    const { weight: edgeWeight, nodeA: endpointA, nodeB: endpointB } = minEdgeDetails;

    const componentToMerge = endpointB.componentId;
    const targetComponent = endpointA.componentId;

    for (let y = 0; y <= gridHeight; y++) {
      for (let x = 0; x <= gridWidth; x++) {
        if (gridPoints[y][x].componentId === componentToMerge) {
          gridPoints[y][x].componentId = targetComponent;
        }
      }
    }

    return findMinSpanningCost(accumulatedCost + edgeWeight);
  }

  let finalCalculatedCost = findMinSpanningCost(0);
  console.log(finalCalculatedCost);
}

ProcessInput(fs.readFileSync("/dev/stdin", "utf8"));
