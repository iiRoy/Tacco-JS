const InputDataStreamProcessor = (function() {
    // This function serves as the public factory to create an input reader instance.
    function createInputReader(rawSourceContent) {
        // Basic validation: ensure the input is a non-empty string.
        if (typeof rawSourceContent !== 'string' || rawSourceContent.length === 0) {
            throw new Error("Input source content must be a non-empty string for processing.");
        }
        return new DataLineParser(rawSourceContent);
    }

    // The internal class responsible for parsing lines and values.
    function DataLineParser(initialContent) {
        // Store all input lines as an array of strings.
        this._allRawLines = initialContent.trim().split('\n');
        // Pointer to keep track of the current line being processed.
        this._activeLineIndex = 0;
        // A cache to store split lines for efficient token extraction.
        this._splitLineCache = new Map();
    }

    // Method to extract the next single numeric value from the current line.
    // It assumes values are space-separated and reads them from left-to-right (original was reverse-pop).
    // The original `a` method reverses the line and pops. To maintain this, I'll keep the reverse-pop logic.
    DataLineParser.prototype.extractNextNumericValue = function(returnAsString = false) {
        const currentLinePointer = this._activeLineIndex;
        let lineTokens;

        // Check if the current line's tokens are already in the cache.
        if (this._splitLineCache.has(currentLinePointer)) {
            lineTokens = this._splitLineCache.get(currentLinePointer);
        } else {
            // If not cached, get the raw line string.
            const rawLine = this._allRawLines[currentLinePointer];
            // Handle cases where we try to read beyond the available lines.
            if (rawLine === undefined) {
                console.warn(`Warning: Attempt to read beyond end of input stream at line index ${currentLinePointer}.`);
                return returnAsString ? null : NaN;
            }
            // Split the line into tokens, then reverse to simulate original `a`'s behavior (pop from end is first element).
            lineTokens = rawLine.split(' ').reverse();
            this._splitLineCache.set(currentLinePointer, lineTokens);
        }

        // Extract the last token (which was the first token in the original order).
        const nextToken = lineTokens.pop();

        // If the current line is now empty, advance to the next line.
        if (lineTokens.length === 0) {
            this._activeLineIndex++;
            this._splitLineCache.delete(currentLinePointer); // Clear the cache for this consumed line.
        }

        // Return the token as a string or a number.
        return returnAsString ? nextToken : Number(nextToken);
    };

    // Method to read an entire line of values as an array of numbers.
    DataLineParser.prototype.readCurrentLineAsNumbers = function(returnAsStrings = false) {
        // Retrieve the current line and immediately advance the line pointer.
        const rawLineData = this._allRawLines[this._activeLineIndex++];
        
        // Clear any cached tokens for this line, as it's now fully consumed.
        this._splitLineCache.delete(this._activeLineIndex - 1);

        if (rawLineData === undefined) {
            console.warn(`Warning: Attempt to read an entire line beyond end of input stream at index ${this._activeLineIndex - 1}.`);
            return []; // Return an empty array for safety.
        }

        const tokensInLine = rawLineData.split(' ');
        return returnAsStrings ? tokensInLine : tokensInLine.map(Number);
    };

    // Method to extract a segment of N lines as a matrix (array of arrays).
    DataLineParser.prototype.extractMatrixSegment = function(linesToRead, returnAsStrings = false) {
        // Input validation for the number of lines.
        if (linesToRead <= 0) {
            console.warn("Attempted to extract a matrix with zero or negative lines. Returning empty array.");
            return [];
        }

        const segmentStart = this._activeLineIndex;
        const segmentEnd = segmentStart + linesToRead;

        // Slice the raw lines and then advance the active line pointer.
        const rawLinesForMatrix = this._allRawLines.slice(segmentStart, segmentEnd);
        this._activeLineIndex = segmentEnd;

        // Clear the entire cache as multiple lines have been consumed, affecting line indices.
        this._splitLineCache.clear();

        // Process each raw line into an array of tokens (numbers or strings).
        const processedMatrix = rawLinesForMatrix.map(line => {
            const tokens = line.split(' ');
            return returnAsStrings ? tokens : tokens.map(Number);
        });

        return processedMatrix;
    };

    // Method to extract a segment of N lines as a flat array of values.
    DataLineParser.prototype.extractLineSegment = function(linesToRead, returnAsStrings = false) {
        // Input validation.
        if (linesToRead <= 0) {
            console.warn("Attempted to extract a line segment with zero or negative lines. Returning empty array.");
            return [];
        }

        const segmentStart = this._activeLineIndex;
        const segmentEnd = segmentStart + linesToRead;

        // Slice the raw lines and then advance the active line pointer.
        const rawLinesForSegment = this._allRawLines.slice(segmentStart, segmentEnd);
        this._activeLineIndex = segmentEnd;

        // Clear the entire cache.
        this._splitLineCache.clear();

        return returnAsStrings ? rawLinesForSegment : rawLinesForSegment.map(Number);
    };

    return createInputReader; // Export the factory function.
})();

// Utilize destructuring for cleaner import of `readFileSync` from the 'fs' module.
const { readFileSync } = require("fs");

// Initialize the input processing utility with content from standard input.
const inputParserInstance = InputDataStreamProcessor(readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and display the computed result.
console.log(`The calculated minimum safe column is: ${findMinimumTraversableColumn()}`);

// Main function to solve the problem.
function findMinimumTraversableColumn() {
    // Read the primary dimensions and obstacle count from the input stream.
    const gridHeight = inputParserInstance.extractNextNumericValue();
    const gridWidth = inputParserInstance.extractNextNumericValue();
    const totalObstacles = inputParserInstance.extractNextNumericValue();

    // Implement robust input validation for critical parameters.
    if (isNaN(gridHeight) || isNaN(gridWidth) || isNaN(totalObstacles) ||
        gridHeight <= 0 || gridWidth <= 0 || totalObstacles < 0) {
        console.error(`Error: Invalid input dimensions or obstacle count detected. Height: ${gridHeight}, Width: ${gridWidth}, Obstacles: ${totalObstacles}. All must be valid positive numbers (obstacles can be zero).`);
        return -1; // Indicate an error state.
    }

    // Initialize a 2D structure to represent the grid and mark blocked cells.
    // Using an array of plain objects (`Object.create(null)`) for sparse column storage,
    // which is memory-efficient for grids with few obstacles per row.
    const obstacleMapGrid = new Array(gridHeight + 1); // 1-indexed rows.
    for (let currentGridRow = 0; currentGridRow <= gridHeight; ++currentGridRow) {
        obstacleMapGrid[currentGridRow] = Object.create(null); // Each row is an empty object.
        // Explicitly mark the column just beyond the grid width as an impassable boundary.
        obstacleMapGrid[currentGridRow][gridWidth + 1] = 1; // '1' denotes a blocked cell.
    }

    // Populate the obstacle map with data from the input.
    for (let obsCount = 0; obsCount < totalObstacles; ++obsCount) {
        const obstacleCoordinates = inputParserInstance.readCurrentLineAsNumbers();
        // Validate obstacle coordinates to ensure they are within grid bounds.
        if (obstacleCoordinates.length !== 2 ||
            obstacleCoordinates[0] < 1 || obstacleCoordinates[0] > gridWidth ||
            obstacleCoordinates[1] < 1 || obstacleCoordinates[1] > gridHeight) {
            console.warn(`Skipping malformed or out-of-bounds obstacle entry: [${obstacleCoordinates[0]}, ${obstacleCoordinates[1]}].`);
            continue; // Proceed to the next obstacle without processing this invalid one.
        }
        // Mark the specified cell as blocked.
        obstacleMapGrid[obstacleCoordinates[1]][obstacleCoordinates[0]] = 1;
    }

    // Determine the minimum safe column index traversable from top to bottom.
    let minimumReachableColumn = gridWidth; // Initialize with the widest possible safe path.

    // Analyze the first row to set an initial baseline for `minimumReachableColumn`.
    // We explicitly convert keys to numbers and sort them for predictable behavior.
    const obstaclesInFirstRow = Object.keys(obstacleMapGrid[1]).map(Number).sort((a, b) => a - b);
    if (obstaclesInFirstRow.length > 0) {
        // The path can extend up to the column just before the first obstacle in row 1.
        minimumReachableColumn = obstaclesInFirstRow[0] - 1;
    }

    // `currentPathColumn` tracks the leftmost available column in the current row,
    // considering the path from the previous row. Starts from column 2 for the second row.
    let currentPathColumn = 2;

    // Iterate through the grid rows, starting from the second row.
    for (let rowIterator = 2; rowIterator <= gridHeight; ++rowIterator) {
        // Advance `currentPathColumn` until an unblocked cell is found in the current row.
        while (obstacleMapGrid[rowIterator][currentPathColumn]) {
            currentPathColumn++;
        }

        // Early exit condition: if the current path column exceeds the best known
        // `minimumReachableColumn`, no further improvement is possible.
        if (currentPathColumn > minimumReachableColumn) {
            // console.debug(`Optimization: Early exit as currentPathColumn (${currentPathColumn}) > minimumReachableColumn (${minimumReachableColumn}).`);
            break;
        }

        // Retrieve and sort all column indices in the current row that contain obstacles.
        const sortedObstacleColumns = Object.keys(obstacleMapGrid[rowIterator]).map(Number).sort((a, b) => a - b);

        // Iterate through the obstacles in the current row.
        for (const obstacleColumnIndex of sortedObstacleColumns) {
            // Only consider obstacles that are at or to the right of the `currentPathColumn`.
            // Obstacles to the left do not constrain the current path.
            if (currentPathColumn > obstacleColumnIndex) {
                continue;
            }

            // Update `minimumReachableColumn` if a new, tighter constraint is found.
            // The path can only extend up to the column just before this obstacle.
            minimumReachableColumn = Math.min(minimumReachableColumn, obstacleColumnIndex - 1);
            break; // Once the first relevant obstacle is found, no need to check further in this row.
        }

        // Prepare for the next row by moving to the next potential path column.
        currentPathColumn++;
    }

    return minimumReachableColumn; // Return the final computed minimum safe column.
}