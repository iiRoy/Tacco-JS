// This segment contains fundamental setup and utility functions; it's generally not the focus of the main algorithm.
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataProcessorInstance;
let capturedInputLines = [];

inputReader.on('line', (currentLine) => {
    capturedInputLines.push(currentLine);
});

inputReader.on('close', () => {
    dataProcessorInstance = setupInputProcessor(capturedInputLines);
    logDiagnostic("--- Application Execution Commenced ---");
    const executionStartTimestamp = new Date();
    executeMainLogic(); // Renamed Main function
    const totalExecutionDuration = new Date() - executionStartTimestamp;
    logDiagnostic("--- Application Execution Concluded ---");
    logDiagnostic(`Elapsed Time: ${totalExecutionDuration} ms`);
    logDiagnostic(`Memory Consumed: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Fetches the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function acquireInteger() {
    return convertInput(retrieveNextData(), 1);
}

/**
 * Fetches the next line as an array of strings, split by spaces.
 * @returns {string[]} An array of string tokens.
 */
function acquireStringArray() {
    return convertInput(retrieveNextData(), 2);
}

/**
 * Fetches the next line as an array of integers, split by spaces.
 * @returns {number[]} An array of numeric tokens.
 */
function acquireIntegerArray() {
    return convertInput(retrieveNextData(), 4);
}

/**
 * Fetches the next line as an array of individual characters.
 * @returns {string[]} An array of character strings.
 */
function acquireCharacterArray() {
    return convertInput(retrieveNextData(), 6);
}

/**
 * Retrieves the subsequent data item from the processed input.
 * @returns {string} The next data item.
 */
function retrieveNextData() {
    return dataProcessorInstance.next();
}

/**
 * Verifies if additional data items are available for processing.
 * @returns {boolean} True if more items are present, false otherwise.
 */
function checkMoreData() {
    return dataProcessorInstance.hasNext();
}

/**
 * Creates and configures an object for sequential input processing.
 * @param {string[]} rawInputLines - The initial array of all input lines.
 * @returns {object} An object providing `hasNext` and `next` methods.
 */
function setupInputProcessor(rawInputLines) {
    const processorConfiguration = {
        sourceCollection: rawInputLines,
        currentReadPosition: 0,
        totalItemsCount: rawInputLines.length,
        hasNext: function() {
            return (this.currentReadPosition < this.totalItemsCount);
        },
        next: function() {
            if (!this.hasNext()) {
                throw new Error("Input data exhausted: No further elements available for retrieval.");
            } else {
                const extractedElement = this.sourceCollection[this.currentReadPosition];
                this.currentReadPosition++;
                return extractedElement;
            }
        }
    };
    return processorConfiguration;
}

/**
 * Sends a message to the standard output stream.
 * @param {*} outputContent - The data to be logged.
 */
function publishOutput(outputContent) {
    console.log(outputContent);
}

/**
 * Logs a detailed debug message to the standard error stream.
 * @param {*} debugMessage - The content for debugging.
 */
function logDiagnostic(debugMessage) {
    console.error("DIAGNOSTIC: " + require("util").inspect(debugMessage, false, null));
}

// Input conversion utility function:
// The `conversionType` parameter dictates the desired transformation:
// 1: Parses input to an integer.
// 2: Splits input string by spaces into a string array.
// 4: Splits input string by spaces and maps to a number array.
// 6: Splits input string into an array of single characters.
// 7: Splits input string into characters and maps to a number array.
// 8: Joins array elements with a single space.
// 9: Joins array elements with a newline character.
// 0: Joins array elements without any separator.
// Default: Returns the input value unchanged (for unknown types or errors).
function convertInput(valueToConvert, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(valueToConvert, 10);
            case 2:
                return valueToConvert.split(" ");
            case 4:
                return valueToConvert.split(" ").map(Number);
            case 6:
                return valueToConvert.split("");
            case 7:
                return valueToConvert.split("").map(Number);
            case 8:
                return valueToConvert.join(" ");
            case 9:
                return valueToConvert.join("\n");
            case 0:
                return valueToConvert.join("");
            default:
                return valueToConvert;
        }
    } catch (conversionError) {
        return valueToConvert; // In case of any conversion issue, return the original.
    }
}

// End of helper utilities.
// The core problem-solving logic begins here.
function executeMainLogic() {
    // Obtain grid dimensions (height and width) from the initial input line.
    const dimensionsData = acquireIntegerArray();
    const gridHeight = dimensionsData[0];
    const gridWidth = dimensionsData[1];

    // Initialize data structures for the grid: one for characters, one for path lengths.
    const characterMap = new Array(gridHeight);
    const pathMetrics = new Array(gridHeight);

    // First pass: Populate the character map and compute initial horizontal path segments.
    for (let currentY = 0; currentY < gridHeight; currentY++) {
        characterMap[currentY] = acquireCharacterArray(); // Read row characters.
        pathMetrics[currentY] = new Array(gridWidth);

        for (let currentX = 0; currentX < gridWidth; currentX++) {
            // Each cell stores objects for path lengths in two directions.
            pathMetrics[currentY][currentX] = {
                verticalPathLength: 0,
                horizontalPathLength: 0
            };

            // If the current cell represents an open path ('.').
            if (characterMap[currentY][currentX] === ".") {
                // For horizontal paths, if it's the first column, the length is 1.
                if (currentX === 0) {
                    pathMetrics[currentY][currentX].horizontalPathLength = 1;
                } else {
                    // Otherwise, extend the path from the cell to its left.
                    pathMetrics[currentY][currentX].horizontalPathLength += pathMetrics[currentY][currentX - 1].horizontalPathLength + 1;
                }
            }
        }
    }

    // Second pass: Compute initial vertical path segments.
    // This iteration processes column by column, then row by row.
    for (let currentX = 0; currentX < gridWidth; currentX++) {
        for (let currentY = 0; currentY < gridHeight; currentY++) {
            // If the current cell is an open path.
            if (characterMap[currentY][currentX] === ".") {
                // For vertical paths, if it's the first row, the length is 1.
                if (currentY === 0) {
                    pathMetrics[currentY][currentX].verticalPathLength = 1;
                } else {
                    // Otherwise, extend the path from the cell directly above.
                    pathMetrics[currentY][currentX].verticalPathLength += pathMetrics[currentY - 1][currentX].verticalPathLength + 1;
                }
            }
        }
    }

    // Third pass: Propagate maximum path lengths in reverse direction.
    // This ensures each cell holds the maximum path length that can *end* at or *pass through* it.
    for (let currentY = gridHeight - 1; currentY >= 0; currentY--) {
        for (let currentX = gridWidth - 1; currentX >= 0; currentX--) {
            // Only update metrics for traversable cells.
            if (characterMap[currentY][currentX] === ".") {
                // Propagate horizontal path length from the rightward cell.
                if (currentX !== gridWidth - 1) {
                    pathMetrics[currentY][currentX].horizontalPathLength = Math.max(
                        pathMetrics[currentY][currentX].horizontalPathLength,
                        pathMetrics[currentY][currentX + 1].horizontalPathLength
                    );
                }
                // Propagate vertical path length from the downward cell.
                if (currentY !== gridHeight - 1) {
                    pathMetrics[currentY][currentX].verticalPathLength = Math.max(
                        pathMetrics[currentY][currentX].verticalPathLength,
                        pathMetrics[currentY + 1][currentX].verticalPathLength
                    );
                }
            }
        }
    }

    // Fourth pass: Determine the overall maximum combined path value.
    let maximalCombinedPath = 0;
    for (let currentY = 0; currentY < gridHeight; currentY++) {
        for (let currentX = 0; currentX < gridWidth; currentX++) {
            // The total path length is the sum of horizontal and vertical components,
            // minus 1 because the current cell is counted in both.
            maximalCombinedPath = Math.max(
                maximalCombinedPath,
                pathMetrics[currentY][currentX].verticalPathLength + pathMetrics[currentY][currentX].horizontalPathLength - 1
            );
        }
    }

    // Display the final calculated maximum path value.
    publishOutput(maximalCombinedPath);
}