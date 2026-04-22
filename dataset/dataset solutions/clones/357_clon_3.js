// Function to recursively explore and mark connected regions of a specific character
function navigateAndMarkNeighbors(currentRow, currentCol, targetChar, gameMap, mapDimensions) {
    // Define relative offsets for 4-directional movement (up, down, left, right)
    const directionOffsets = [
        { dr: 0, dc: -1 }, // Left: row stays same, column decreases
        { dr: 0, dc: 1 },  // Right: row stays same, column increases
        { dr: -1, dc: 0 }, // Up: row decreases, column stays same
        { dr: 1, dc: 0 }   // Down: row increases, column stays same
    ];

    // Helper function to check if a given coordinate is within the grid boundaries
    const isWithinBounds = (r, c) => {
        const [maxRows, maxCols] = mapDimensions; // Destructure dimensions for clarity
        return r >= 0 && r < maxRows && c >= 0 && c < maxCols;
    };

    // Iterate over each possible direction to find adjacent cells
    for (const offset of directionOffsets) {
        const nextRow = currentRow + offset.dr;
        const nextCol = currentCol + offset.dc;

        // Check if the next cell is within the grid bounds before processing
        if (!isWithinBounds(nextRow, nextCol)) {
            continue; // Skip to the next direction if out of bounds
        }

        // If the neighbor's character matches the target character, mark it and recurse
        if (gameMap[nextRow][nextCol] === targetChar) {
            gameMap[nextRow][nextCol] = 'x'; // Mark as visited/processed ('x' is an arbitrary marker)
            // Recursively call the function for the newly marked neighbor
            navigateAndMarkNeighbors(nextRow, nextCol, targetChar, gameMap, mapDimensions);
        }
    }
}

// Main script execution begins here
// Read all input data from standard input synchronously
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines, trimming whitespace and filtering out any completely empty lines
let inputLineBuffer = rawInputData.trim().split('\n').filter(line => line.length > 0);

// Array to store the results (counts of distinct regions) for each processed map
const resultsCollection = [];

// Process maps in a loop until the termination condition (0 0) is encountered
while (true) {
    // Attempt to read the dimensions line from the buffer
    const dimensionsLine = inputLineBuffer.shift();

    // Primary guard clause: if no more lines are available, break the loop
    if (!dimensionsLine) {
        break;
    }

    // Parse the map dimensions (number of rows and columns) from the line
    const mapDimensions = dimensionsLine.split(' ').map(Number);
    const [numRows, numCols] = mapDimensions; // Destructure for easier access and readability

    // Check for the termination condition: map dimensions 0 0
    if (numRows === 0 && numCols === 0) {
        break; // Exit the processing loop as per problem specification
    }

    // Initialize the 2D grid for the current map
    const currentMapGrid = [];
    // Populate the grid with characters from the subsequent input lines
    for (let r = 0; r < numRows; r++) {
        const rowData = inputLineBuffer.shift(); // Get the string representation of the next row

        // Additional validation check for missing row data (robustness, though input is usually well-formed)
        if (!rowData) {
            console.error("Error: Not enough row data provided for the specified map dimensions. Aborting map processing.");
            // If input is malformed, we might push a null/error or just break
            // For this clone, we'll break to prevent further errors for this map.
            break;
        }
        currentMapGrid.push(rowData.split('')); // Split the row string into an array of characters
    }

    let distinctRegionCounter = 0; // Initialize counter for distinct regions in the current map
    // Define characters that signify the start of a new region, using a Set for efficient lookup
    const regionDefiningCharacters = new Set(['@', '#', '*']);

    // Iterate through each cell of the current map grid to find and process regions
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const cellValue = currentMapGrid[r][c];

            // If the cell contains a character that defines a new region AND it hasn't been visited ('x')
            if (regionDefiningCharacters.has(cellValue) && cellValue !== 'x') {
                distinctRegionCounter++; // Increment the count of distinct regions found
                currentMapGrid[r][c] = 'x'; // Mark the starting cell as visited immediately
                // Explore and mark all connected cells of the same type recursively
                navigateAndMarkNeighbors(r, c, cellValue, currentMapGrid, mapDimensions);
            }
        }
    }
    // Store the final count for the current map in the collection
    resultsCollection.push(distinctRegionCounter);
}

// After processing all maps, output all collected results, each on a new line
resultsCollection.forEach(count => console.log(count));