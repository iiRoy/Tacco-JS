// Initialize a grid to keep track of visited cells, assuming a maximum map size
let visitedGrid = []; // A boolean matrix to mark whether a land cell has been explored

// Prepare the visited grid with an initial capacity, assuming maps won't exceed 50 rows
for (let rowIdx = 0; rowIdx < 50; rowIdx++) {
  visitedGrid[rowIdx] = [];
}

// Define row offsets for 8-directional movement (including diagonals)
const rowOffsets = [1, 1, 1, 0, 0, -1, -1, -1];
// Define column offsets for 8-directional movement (including diagonals)
const colOffsets = [1, 0, -1, 1, -1, 1, 0, -1];

/**
 * Recursively explores connected land cells (islands) using Depth-First Search.
 * Once a land cell is visited, it's marked so it won't be counted again.
 * @param {number} currentRow The current row index of the cell being examined.
 * @param {number} currentCol The current column index of the cell being examined.
 * @param {number} totalRows The total number of rows in the geographical map.
 * @param {number} totalCols The total number of columns in the geographical map.
 * @param {number[][]} worldMap The 2D array representing the terrain (1 for land, 0 for water).
 */
function exploreIsland(currentRow, currentCol, totalRows, totalCols, worldMap) {
  // Mark the current cell as visited by setting its flag to 'false'
  visitedGrid[currentRow][currentCol] = false;

  // Iterate over all 8 possible directions to find adjacent land cells
  for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
    const nextRow = currentRow + rowOffsets[directionIndex];
    const nextCol = currentCol + colOffsets[directionIndex];

    // Check if the prospective next cell is within the map boundaries
    const isValidRow = nextRow >= 0 && nextRow < totalRows;
    const isValidCol = nextCol >= 0 && nextCol < totalCols;

    // If the next cell is valid, is land (value 1), and has not been visited yet
    if (isValidRow && isValidCol && worldMap[nextRow][nextCol] === 1 && visitedGrid[nextRow][nextCol]) {
      // Recursively call the exploration function for the connected land cell
      exploreIsland(nextRow, nextCol, totalRows, totalCols, worldMap);
    }
  }
}

/**
 * Main function to process the input data, identify, and count islands.
 * It handles multiple test cases within a single input stream.
 * @param {string} rawInputData The raw string input read from standard input.
 */
function ProcessInputData(rawInputData) {
  // Split the entire input string by newline characters to get individual lines
  let processedLines = rawInputData.split("\n");
  let currentLineIndex = 0; // Pointer to keep track of the current line being processed

  // Loop indefinitely until a specific termination condition (0 0 for width/height) is met
  while (true) {
    // Parse the dimensions (width and height) from the current line
    const dimensionsLine = processedLines[currentLineIndex].split(" ");
    const currentWidth = parseInt(dimensionsLine[0], 10);
    const currentHeight = parseInt(dimensionsLine[1], 10);
    currentLineIndex++; // Advance to the next line, which will contain map data

    // If both width and height are zero, it signifies the end of input data
    if (currentWidth === 0 && currentHeight === 0) {
      break;
    }

    // Initialize a new 2D array to store the terrain map for the current test case
    const currentTerrainMap = [];

    // Read the terrain map data row by row
    for (let rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
      currentTerrainMap[rowIndex] = [];
      const mapRowData = processedLines[currentLineIndex].split(" ");
      for (let colIndex = 0; colIndex < currentWidth; colIndex++) {
        currentTerrainMap[rowIndex][colIndex] = parseInt(mapRowData[colIndex], 10);
      }
      currentLineIndex++; // Advance to the next line for the subsequent map row
    }

    // Reset the `visitedGrid` for the new map, marking all cells as initially unvisited (true)
    for (let rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
      for (let colIndex = 0; colIndex < currentWidth; colIndex++) {
        visitedGrid[rowIndex][colIndex] = true;
      }
    }

    let detectedIslandCount = 0; // Initialize a counter for islands found in this map

    // Loop to systematically find and count all distinct islands on the map
    while (true) {
      let islandFoundInThisPass = true; // Flag to determine if any new island was discovered in the current full scan
      for (let rowIndex = 0; rowIndex < currentHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < currentWidth; colIndex++) {
          // If the current cell is land (value 1) and has not yet been visited
          if (currentTerrainMap[rowIndex][colIndex] === 1 && visitedGrid[rowIndex][colIndex]) {
            detectedIslandCount++; // Increment the total island count
            islandFoundInThisPass = false; // Indicate that at least one island was found in this pass
            // Initiate a Depth-First Search to explore and mark all connected parts of this island
            exploreIsland(rowIndex, colIndex, currentHeight, currentWidth, currentTerrainMap);
          }
        }
      }
      // If no new islands were found during this complete scan of the map, exit the island-finding loop
      if (islandFoundInThisPass) {
        break;
      }
    }
    // Output the total number of islands found for the current map configuration
    console.log(detectedIslandCount);
  }
}

// Read the entire input content from standard input synchronously using the 'fs' module
// The input is expected to be UTF-8 encoded.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));