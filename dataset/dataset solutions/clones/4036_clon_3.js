var DataReaderFactory = (function() {
    /**
     * TextDataReader: A utility class for parsing text input line by line, token by token.
     * It manages an internal buffer of lines and tokens for efficient sequential access.
     * @param {string} rawInputContent - The raw string input, typically from a file or console.
     */
    function TextDataReader(rawInputContent) {
        // Normalize line endings across different OS and filter out any completely empty lines.
        this.sourceLines = rawInputContent.split(/\r?\n/).filter(line => line.length > 0);
        this.currentLinePointer = 0;       // Points to the next line to be processed from sourceLines.
        this.currentLineTokens = [];       // Buffer for tokens of the currently active line.
        this.currentTokenIndex = 0;        // Points to the next token to be read from currentLineTokens.
    }

    /**
     * Internal helper to load the next line's tokens into the buffer if needed.
     * Advances the currentLinePointer if a new line is loaded.
     */
    TextDataReader.prototype._loadNextLineTokens = function() {
        // If all tokens from the current line have been consumed, try to load the next line.
        if (this.currentTokenIndex >= this.currentLineTokens.length) {
            if (this.currentLinePointer < this.sourceLines.length) {
                // Split the next line by spaces to get its tokens.
                this.currentLineTokens = this.sourceLines[this.currentLinePointer].split(' ');
                this.currentTokenIndex = 0; // Reset token index for the new line.
                this.currentLinePointer++;  // Move to the next source line.
            } else {
                // No more lines left in the input. Clear buffers.
                this.currentLineTokens = [];
                this.currentTokenIndex = 0;
            }
        }
    };

    /**
     * Reads and returns the next single token from the input stream.
     * @param {boolean} [shouldReturnAsString=false] - If true, returns the token as a string; otherwise, attempts to parse as a number.
     * @returns {string|number|undefined} The next token, or undefined if no more tokens are available.
     */
    TextDataReader.prototype.readNextValue = function(shouldReturnAsString = false) {
        this._loadNextLineTokens(); // Ensure tokens are available for the current logical line.

        if (this.currentTokenIndex < this.currentLineTokens.length) {
            const token = this.currentLineTokens[this.currentTokenIndex];
            this.currentTokenIndex++; // Advance to the next token.
            return shouldReturnAsString ? token : Number(token);
        }
        return undefined; // No more tokens.
    };

    /**
     * Reads an entire line and returns all its tokens as an array.
     * This operation consumes the current line and advances the line pointer.
     * @param {boolean} [shouldReturnAsString=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<string|number>} An array of tokens from the current line.
     */
    TextDataReader.prototype.readLineAsTokens = function(shouldReturnAsString = false) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            return []; // No more lines to read.
        }

        const lineContent = this.sourceLines[this.currentLinePointer];
        this.currentLinePointer++; // Advance to the next source line.
        this.currentLineTokens = []; // Clear token buffer as we've read a full line.
        this.currentTokenIndex = 0;  // Reset token index.

        const tokensOnLine = lineContent.split(' ');
        return shouldReturnAsString ? tokensOnLine : tokensOnLine.map(val => Number(val));
    };

    /**
     * Reads a specified number of consecutive lines and returns them as a 2D array (matrix).
     * Each inner array represents tokens from one line.
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [shouldReturnAsString=false] - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
     * @returns {Array<Array<string|number>>} A matrix of tokens.
     */
    TextDataReader.prototype.readMatrixData = function(numberOfLines, shouldReturnAsString = false) {
        const resultingMatrix = [];
        for (let i = 0; i < numberOfLines; i++) {
            const lineTokens = this.readLineAsTokens(shouldReturnAsString);
            resultingMatrix.push(lineTokens);
        }
        return resultingMatrix;
    };

    /**
     * Reads a specified number of lines directly as an array of strings (or numbers if specified).
     * Useful for grid maps or single-value-per-line inputs.
     * @param {number} lineCount - The number of lines to collect.
     * @param {boolean} [shouldReturnAsString=true] - If false, attempts to parse each line as a number. Default is true.
     * @returns {Array<string|number>} An array where each element is the content of a line.
     */
    TextDataReader.prototype.collectLines = function(lineCount, shouldReturnAsString = true) {
        const collectedContent = [];
        for (let i = 0; i < lineCount; i++) {
            if (this.currentLinePointer < this.sourceLines.length) {
                const lineValue = this.sourceLines[this.currentLinePointer];
                this.currentLinePointer++;
                // Reset token buffer as full lines are consumed.
                this.currentLineTokens = [];
                this.currentTokenIndex = 0;
                collectedContent.push(shouldReturnAsString ? lineValue : Number(lineValue));
            } else {
                break; // Stop if we run out of lines prematurely.
            }
        }
        return collectedContent;
    };

    /**
     * Factory function to create a new TextDataReader instance.
     * @param {string} inputSourceString - The string content to be processed by the reader.
     * @returns {TextDataReader} A new instance of TextDataReader.
     */
    function createTextDataReader(inputSourceString) {
        return new TextDataReader(inputSourceString);
    }

    return createTextDataReader;
})();

// Initialize the input parser by reading content from standard input synchronously.
var inputParser = DataReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main puzzle solving function and print its result to the console.
console.log(solveMazePath());

/**
 * Solves a specific maze navigation problem.
 * It uses a Breadth-First Search (BFS) to find the shortest path from (0,0) to (gridWidth-1, gridHeight-1).
 * The objective is to calculate the number of '.' (walkable) cells that are NOT part of this shortest path.
 * Returns -1 if no valid path exists or if input is invalid.
 */
function solveMazePath() {
    // Read the dimensions of the grid from the input.
    const gridHeight = inputParser.readNextValue();
    const gridWidth = inputParser.readNextValue();

    // --- Input Validation: Grid Dimensions ---
    if (gridHeight === undefined || gridWidth === undefined ||
        isNaN(gridHeight) || isNaN(gridWidth) ||
        gridHeight <= 0 || gridWidth <= 0) {
        // Guard clause for invalid or missing dimensions.
        console.error("Error: Invalid or non-positive grid dimensions provided.");
        return -1;
    }

    // Read the maze map itself. Each line is treated as a string.
    const mazeLayout = inputParser.collectLines(gridHeight, true);

    // --- Input Validation: Maze Layout Consistency ---
    if (mazeLayout.length !== gridHeight) {
        // Guard clause for mismatch between declared height and actual map height.
        console.error("Error: Declared grid height does not match actual map rows.");
        return -1;
    }
    for (let r = 0; r < gridHeight; r++) {
        if (mazeLayout[r].length !== gridWidth) {
            // Guard clause for inconsistent row widths.
            console.error(`Error: Row ${r} has a width (${mazeLayout[r].length}) inconsistent with declared grid width (${gridWidth}).`);
            return -1;
        }
    }

    // Initialize a 2D array to keep track of visited cells and their shortest distance from the start.
    // A value of 0 means unvisited. Any positive integer represents the distance.
    const distanceTracker = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));

    // Calculate the total number of walkable ('.') cells in the entire maze.
    // This value is used later to determine the number of unused walkable cells.
    let totalWalkableSpaces = 0;
    for (let r = 0; r < gridHeight; r++) {
        // Use a regex match; if no '.' are found, `match` returns null, so default to an empty array.
        const walkableInRow = (mazeLayout[r].match(/\./g) || []).length;
        totalWalkableSpaces += walkableInRow;
    }

    // Define the fixed starting and ending coordinates for the path.
    const startRow = 0;
    const startCol = 0;
    const endRow = gridHeight - 1;
    const endCol = gridWidth - 1;

    // --- Pre-check: Start/End Cell Validity ---
    // Ensure that the start and end points are not blocked ('#').
    if (mazeLayout[startRow][startCol] === '#' || mazeLayout[endRow][endCol] === '#') {
        return -1; // Path cannot begin or end on a wall.
    }

    // Initialize the BFS queue with the starting cell.
    // Each element in the queue is [row, col].
    let currentLevelQueue = [[startRow, startCol]];
    // Mark the starting cell as visited with a distance of 1 (representing the first step/level).
    distanceTracker[startRow][startCol] = 1;

    // Define possible movement directions (Up, Down, Left, Right) as delta values.
    const MOVEMENT_DIRECTIONS = [
        { dR: -1, dC: 0 }, // Move Up
        { dR: 1, dC: 0 },  // Move Down
        { dR: 0, dC: -1 }, // Move Left
        { dR: 0, dC: 1 }   // Move Right
    ];

    // Main BFS loop: 'currentPathLength' represents the number of steps taken from the start.
    for (let currentPathLength = 1; ; currentPathLength++) {
        // If the queue for the current level is empty, it means no path to the target exists.
        if (currentLevelQueue.length === 0) {
            return -1;
        }

        // Prepare a new queue to store cells for the next level of exploration.
        const nextLevelQueue = [];

        // Process all cells that were discovered at the 'currentPathLength' distance.
        while (currentLevelQueue.length > 0) {
            // Dequeue the next cell for processing. Using `shift()` ensures FIFO (true BFS).
            const [currentRow, currentCol] = currentLevelQueue.shift();

            // Check if the current cell is the target destination.
            if (currentRow === endRow && currentCol === endCol) {
                // If target reached, the shortest path length is 'currentPathLength'.
                // The problem asks for total walkable cells minus path length.
                return totalWalkableSpaces - currentPathLength;
            }

            // Explore all four possible neighbors (up, down, left, right).
            for (const direction of MOVEMENT_DIRECTIONS) {
                const neighborRow = currentRow + direction.dR;
                const neighborCol = currentCol + direction.dC;

                // Check if the neighbor coordinates are within the grid boundaries.
                const isWithinBounds = neighborRow >= 0 && neighborRow < gridHeight &&
                                       neighborCol >= 0 && neighborCol < gridWidth;

                if (isWithinBounds) {
                    // Check if the neighbor cell is walkable ('.') and has not been visited yet (distanceTracker is 0).
                    const isWalkableCell = mazeLayout[neighborRow][neighborCol] === '.';
                    const hasNotBeenVisited = distanceTracker[neighborRow][neighborCol] === 0;

                    if (isWalkableCell && hasNotBeenVisited) {
                        // Mark the neighbor as visited and record its distance.
                        // Distance is one more than the current cell's distance.
                        distanceTracker[neighborRow][neighborCol] = currentPathLength + 1;
                        // Add the neighbor to the queue for the next level of BFS.
                        nextLevelQueue.push([neighborRow, neighborCol]);
                    }
                }
            }
        }
        // After processing all cells at the current level, move to the next level.
        currentLevelQueue = nextLevelQueue;
    }
}