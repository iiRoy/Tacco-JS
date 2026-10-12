"use strict";
// Input parsing using a generator for a different approach
function* tokenProvider(sourceText) {
    // Split by any sequence of whitespace characters and filter out empty strings
    const tokens = sourceText.split(/\s+/).filter(Boolean);
    let currentIdx = 0;
    while (currentIdx < tokens.length) {
        yield tokens[currentIdx++];
    }
}

let globalTokenStream; // Will be initialized once

// Helper to extract the next numeric value from the stream
function fetchNumericValue() {
    return Number(globalTokenStream.next().value);
}

// Helper to extract the next string value from the stream
function fetchStringValue() {
    return globalTokenStream.next().value;
}

// BFS implementation with a single queue and explicit head pointer
function calculateGridDistances(mapData, initialPointX, initialPointY) {
    const obstacleSymbol = "#";
    const unreachableDistance = 1e9; // Consistent with original's INF

    const mapHeight = mapData.length;
    const mapWidth = mapData[0].length;

    // Initialize distance grid with unreachableDistance
    const distanceMatrix = Array.from({ length: mapHeight }, () =>
        Array(mapWidth).fill(unreachableDistance)
    );

    // Define movement vectors as an array of objects
    const movementVectors = [
        { deltaX: 0, deltaY: -1 }, // North
        { deltaX: 1, deltaY: 0 },  // East
        { deltaX: 0, deltaY: 1 },  // South
        { deltaX: -1, deltaY: 0 }  // West
    ];

    // Queue for BFS, storing objects with coordinates and current path cost
    const bfsQueue = [];

    // Set starting point distance and add to queue
    distanceMatrix[initialPointY][initialPointX] = 0;
    bfsQueue.push({ x: initialPointX, y: initialPointY, cost: 0 });

    let queueHead = 0; // Manual head pointer for efficient queue processing
    while (queueHead < bfsQueue.length) {
        const { x: currentX, y: currentY, cost: currentPathCost } = bfsQueue[queueHead++];

        for (const vector of movementVectors) {
            const nextX = currentX + vector.deltaX;
            const nextY = currentY + vector.deltaY;
            const newPathCost = currentPathCost + 1;

            // Check boundary conditions
            if (nextX < 0 || nextX >= mapWidth || nextY < 0 || nextY >= mapHeight) {
                continue;
            }

            // Check if it's an obstacle or if a shorter path has already been found
            if (mapData[nextY][nextX] === obstacleSymbol || distanceMatrix[nextY][nextX] <= newPathCost) {
                continue;
            }

            // Update distance and add to queue
            distanceMatrix[nextY][nextX] = newPathCost;
            bfsQueue.push({ x: nextX, y: nextY, cost: newPathCost });
        }
    }
    return distanceMatrix;
}

// Main application logic encapsulated
function processChallenge() {
    const gridRows = fetchNumericValue();
    const gridCols = fetchNumericValue();
    const maxAllowedSteps = fetchNumericValue();

    // Read the grid as an array of strings
    const gridContent = Array.from({ length: gridRows }, () => fetchStringValue());

    let startCoordX, startCoordY;

    // Locate the 'S' character using functional iteration
    gridContent.forEach((rowString, rowIndex) => {
        const charPosition = rowString.indexOf("S");
        if (charPosition !== -1) {
            startCoordX = charPosition;
            startCoordY = rowIndex;
        }
    });

    const pathCosts = calculateGridDistances(gridContent, startCoordX, startCoordY);

    let minimumBoundaryReach = Infinity; // Using Infinity for initial minimum

    // Iterate through all cells to find the minimum steps to reach a boundary
    // using nested functional iteration
    Array.from({ length: gridRows }).forEach((_, yPos) => {
        Array.from({ length: gridCols }).forEach((__, xPos) => {
            const currentCellPathCost = pathCosts[yPos][xPos];

            // Skip if the path cost exceeds the maximum allowed steps
            if (currentCellPathCost > maxAllowedSteps) {
                return; // Acts like 'continue' for forEach
            }

            // Calculate steps required to reach each of the four boundaries
            // The +1 is for the step from the current cell to the boundary region
            const stepsToNorthEdge = Math.ceil(yPos / maxAllowedSteps);
            const stepsToWestEdge = Math.ceil(xPos / maxAllowedSteps);
            const stepsToSouthEdge = Math.ceil((gridRows - 1 - yPos) / maxAllowedSteps);
            const stepsToEastEdge = Math.ceil((gridCols - 1 - xPos) / maxAllowedSteps);

            // Determine the minimum steps to any boundary from the current cell
            const currentCellMinBoundarySteps = Math.min(
                stepsToNorthEdge,
                stepsToWestEdge,
                stepsToSouthEdge,
                stepsToEastEdge
            ) + 1;

            // Update the overall minimum if a smaller value is found
            if (currentCellMinBoundarySteps < minimumBoundaryReach) {
                minimumBoundaryReach = currentCellMinBoundarySteps;
            }
        });
    });

    return minimumBoundaryReach;
}

// Immediately-invoked function expression to manage execution flow
(function() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    globalTokenStream = tokenProvider(fileContent);

    const finalResult = processChallenge();
    if (finalResult !== undefined) {
        console.log(finalResult);
    }
})();
