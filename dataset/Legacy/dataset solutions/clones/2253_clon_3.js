"use strict";

// Input parsing utility, Type II clone of original GET
var InputParser = (function() {
  function createParser(sourceString) {
    return new ParserInstance(sourceString);
  }

  function ParserInstance(sourceString) {
    this.inputLines = sourceString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  ParserInstance.prototype.readAtom = function(returnAsString) {
    var lines = this.inputLines,
      lineIndex = this.currentLineIndex,
      value;
    if (typeof lines[lineIndex] === "string") {
      lines[lineIndex] = lines[lineIndex].split(" ").reverse();
    }
    value = lines[lineIndex].pop();
    if (!lines[lineIndex].length) {
      this.currentLineIndex++;
    }
    return returnAsString ? value : +value;
  };

  ParserInstance.prototype.readLine = function(returnAsString) {
    var lineParts = this.inputLines[this.currentLineIndex++].split(" ");
    return returnAsString ? lineParts : lineParts.map(item => +item);
  };

  ParserInstance.prototype.readMatrix = function(numRows, returnAsString) {
    var matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(line => line.split(" "));
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  ParserInstance.prototype.readRows = function(numRows, returnAsString) {
    var rows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows);
    return returnAsString ? rows : rows.map(item => +item);
  };

  return createParser;
})();

var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays, replacing original xArray with eval
function createMultiDimArray(initialValue, ...dimensions) {
  function createRecursive(dims, currentDimIndex) {
    if (currentDimIndex === dims.length - 1) {
      return Array(dims[currentDimIndex]).fill(initialValue);
    }
    return Array(dims[currentDimIndex]).fill(0).map(() => createRecursive(dims, currentDimIndex + 1));
  }
  return createRecursive(dimensions, 0);
}

// Global variables for grid dimensions and data
let distanceMap, gridHeight, gridWidth, gridData;

// Main execution block
console.log(processGrid());

// Main function renamed and refactored
function processGrid() {
  gridHeight = inputReader.readAtom();
  gridWidth = inputReader.readAtom();
  gridData = inputReader.readRows(gridHeight, true); // Read grid as strings

  let overallMaxDistance = 0;

  // Iterate through each cell in the grid
  for (let rowCoord = 0; rowCoord < gridHeight; rowCoord++) {
    for (let colCoord = 0; colCoord < gridWidth; colCoord++) {
      // If a path cell ('.') is found, perform BFS from it
      if (gridData[rowCoord][colCoord] === ".") {
        calculateDistancesFromSource(rowCoord, colCoord);

        // After BFS, find the maximum distance in the current distanceMap
        const currentRunMax = findMaxInDistanceMap(distanceMap, gridHeight, gridWidth);
        if (overallMaxDistance < currentRunMax) {
          overallMaxDistance = currentRunMax;
        }
      }
    }
  }
  return overallMaxDistance;
}

// Helper function to find the maximum value in the distance map
function findMaxInDistanceMap(map, height, width) {
  let currentMax = 0;
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (currentMax < map[r][c]) {
        currentMax = map[r][c];
      }
    }
  }
  return currentMax;
}

// BFS function renamed and refactored
function calculateDistancesFromSource(startRow, startCol) {
  // Initialize distance map with -1 (unvisited)
  distanceMap = createMultiDimArray(-1, gridHeight, gridWidth);
  distanceMap[startRow][startCol] = 0; // Distance from source to itself is 0

  // Queue for BFS, storing [row, col] pairs. Using pop() for LIFO within a level.
  let currentLevelQueue = [[startRow, startCol]];
  let currentDistance = 1;

  // Possible movements: Up, Down, Left, Right
  const neighborOffsets = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
  ];

  while (currentLevelQueue.length) {
    let nextLevelQueue = []; // Queue for the next distance level

    // Process all nodes at the current distance level
    while (currentLevelQueue.length) {
      const [currentRow, currentCol] = currentLevelQueue.pop(); // Get last added node (LIFO)

      // Check all four neighbors
      for (const [dy, dx] of neighborOffsets) {
        const nextRow = currentRow + dy;
        const nextCol = currentCol + dx;

        // Validate neighbor coordinates are within grid bounds
        if (nextRow < 0 || nextRow >= gridHeight || nextCol < 0 || nextCol >= gridWidth) {
          continue; // Skip if out of bounds
        }

        // If neighbor is a path ('.') and unvisited (-1)
        if (gridData[nextRow][nextCol] === "." && distanceMap[nextRow][nextCol] === -1) {
          distanceMap[nextRow][nextCol] = currentDistance; // Set distance
          nextLevelQueue.push([nextRow, nextCol]); // Add to next level's queue
        }
      }
    }
    currentDistance++; // Increment distance for the next level
    currentLevelQueue = nextLevelQueue; // Move to the next level
  }
}
