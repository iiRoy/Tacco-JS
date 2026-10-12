class InputHandler {
    constructor(sourceContent) {
        this._lineBuffer = sourceContent.trim().split("\n");
        this._currentLinePointer = 0;
    }

    // Internal helper to process a line into tokens once
    _getProcessedLineTokens() {
        let lineData = this._lineBuffer[this._currentLinePointer];
        if (typeof lineData === "string") {
            // Split by space and reverse to allow efficient popping from the end
            this._lineBuffer[this._currentLinePointer] = lineData.split(" ").reverse();
        }
        return this._lineBuffer[this._currentLinePointer];
    }

    // Reads the next single value from the current line's tokens
    readNextValue(returnAsString = false) {
        const tokens = this._getProcessedLineTokens();
        const extractedValue = tokens.pop();

        if (tokens.length === 0) {
            this._currentLinePointer++; // Advance to the next line if current is exhausted
        }
        return returnAsString ? extractedValue : +extractedValue;
    }

    // Reads all values from the current line as an array
    readLineValues(returnAsString = false) {
        const lineContent = this._lineBuffer[this._currentLinePointer++].split(" ");
        return returnAsString ? lineContent : lineContent.map(item => +item);
    }

    // Reads a block of lines as a matrix
    readMatrix(rowsToRead, returnAsString = false) {
        const matrixSlice = this._lineBuffer.slice(this._currentLinePointer, this._currentLinePointer + rowsToRead);
        this._currentLinePointer += rowsToRead;
        const parsedMatrix = matrixSlice.map(rowStr => rowStr.split(" "));
        return returnAsString ? parsedMatrix : parsedMatrix.map(rowArr => rowArr.map(item => +item));
    }

    // Reads a block of raw lines
    readRawLines(rowsToRead, returnAsString = false) {
        const rawLines = this._lineBuffer.slice(this._currentLinePointer, this._currentLinePointer + rowsToRead);
        this._currentLinePointer += rowsToRead;
        return returnAsString ? rawLines : rawLines.map(item => +item);
    }
}

// Function to get file content
const getFileContent = (path) => require("fs").readFileSync(path, "utf8");

// Initialize the input reader
const fileInputContent = getFileContent("/dev/stdin");
const inputReader = new InputHandler(fileInputContent);

console.log(calculateShortestPath());

function calculateShortestPath() {
    const gridHeight = inputReader.readNextValue();
    const gridWidth = inputReader.readNextValue();
    const numberOfObstacles = inputReader.readNextValue();

    // Helper to set up the grid with boundary conditions
    const setupGrid = (height, width) => {
        const grid = Array(height + 1);
        for (let row = 0; row <= height; row++) {
            grid[row] = {};
            grid[row][width + 1] = 1; // Place a sentinel obstacle at the rightmost edge
        }
        return grid;
    };

    const gridState = setupGrid(gridHeight, gridWidth);

    // Populate grid with obstacles
    for (let obstacleIndex = 0; obstacleIndex < numberOfObstacles; obstacleIndex++) {
        const obstacleCoordinates = inputReader.readLineValues(); // Format: [column, row]
        const obstacleColumn = obstacleCoordinates[0];
        const obstacleRow = obstacleCoordinates[1];
        gridState[obstacleRow][obstacleColumn] = 1; // Mark as occupied
    }

    // Determine the initial maximum path length based on the first row
    let currentMinPathLength = gridWidth; // Initialize with the full width (if no obstacles in row 1 except sentinel)
    const firstRowObstacleKeys = Object.keys(gridState[1]);
    
    // Find the leftmost obstacle in the first row (or the sentinel if no others)
    let leftmostObstacleColInRow1 = gridWidth + 1;
    for (const keyStr of firstRowObstacleKeys) {
        const colNum = parseInt(keyStr, 10);
        if (colNum < leftmostObstacleColInRow1) {
            leftmostObstacleColInRow1 = colNum;
        }
    }
    currentMinPathLength = leftmostObstacleColInRow1 - 1;

    let currentSearchXPosition = 2; // Start searching from column 2 for subsequent rows
    
    // Iterate through rows from the second row to find the shortest path
    for (let rowIterator = 2; rowIterator <= gridHeight; rowIterator++) {
        // Find the first available column in the current row, starting from currentSearchXPosition
        while (gridState[rowIterator][currentSearchXPosition]) {
            currentSearchXPosition++;
        }

        // Early exit: if the current search position is already beyond the best path found,
        // no shorter path can be achieved.
        if (currentSearchXPosition > currentMinPathLength) {
            break;
        }

        // Examine obstacles in the current row to potentially shorten the path
        const obstaclesInCurrentRow = gridState[rowIterator];
        // Get numeric keys and sort them to ensure processing from left to right
        const sortedObstacleColumns = Object.keys(obstaclesInCurrentRow).map(Number).sort((a, b) => a - b);

        for (const obstacleCol of sortedObstacleColumns) {
            // Only consider obstacles that are at or to the right of the current path's X position
            if (currentSearchXPosition > obstacleCol) {
                continue;
            }
            
            // If an obstacle is found, the path can only extend up to `obstacleCol - 1`.
            // Update `currentMinPathLength` if this new path is shorter.
            if (obstacleCol - 1 < currentMinPathLength) {
                currentMinPathLength = obstacleCol - 1;
            }
            // Once the first relevant obstacle is found, we can stop checking this row
            // because we are interested in the leftmost obstacle to determine the path limit.
            break; 
        }
        
        // Advance the currentSearchXPosition for the next row's search
        currentSearchXPosition++;
    }

    return currentMinPathLength;
}
