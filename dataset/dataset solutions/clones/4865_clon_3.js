const obtainRawInputData = () => {
    const fileSystem = require("fs");
    const standardInputPath = "/dev/stdin";
    let rawContentBuffer = Buffer.from(''); // Use Buffer for reading
    try {
        rawContentBuffer = fileSystem.readFileSync(standardInputPath);
    } catch (readOperationError) {
        console.error("Error encountered while accessing standard input:", readOperationError.message);
        return []; // Return an empty array on read failure
    }

    const textualContent = rawContentBuffer.toString("utf8"); // Convert buffer to string
    const processedLines = textualContent.trim().split("\n");

    // Defensive check for truly empty or whitespace-only input
    if (processedLines.length === 0 || (processedLines.length === 1 && processedLines[0] === '')) {
        console.warn("Input stream appears to be devoid of meaningful data.");
        return [];
    }
    return processedLines;
};

const processedInputLines = obtainRawInputData();

/**
 * Encapsulates the logic for iterating through a collection of data lines.
 * Provides a structured way to access data sequentially and manage stream state.
 */
class SequentialLineReader {
    #sourceDataLines;
    #currentReadPosition;
    #totalAvailableLines;

    constructor(linesCollection) {
        if (!Array.isArray(linesCollection)) {
            throw new TypeError("SequentialLineReader must be initialized with an array of lines.");
        }
        this.#sourceDataLines = linesCollection;
        this.#currentReadPosition = 0;
        this.#totalAvailableLines = linesCollection.length;
    }

    /**
     * Fetches the next line from the data stream.
     * @returns {string} The subsequent line of data.
     * @throws {Error} If the stream has been exhausted.
     */
    fetchNextDataLine() {
        if (!this.areMoreLinesAvailable()) {
            throw new Error("DataStreamExhaustion: No additional data elements are accessible.");
        }
        const nextDataItem = this.#sourceDataLines[this.#currentReadPosition];
        this.#currentReadPosition++; // Advance the pointer
        return nextDataItem;
    }

    /**
     * Verifies if there are unread lines remaining in the stream.
     * @returns {boolean} True if more lines can be read, false otherwise.
     */
    areMoreLinesAvailable() {
        return this.#currentReadPosition < this.#totalAvailableLines;
    }

    /**
     * Resets the reader's position to the beginning of the data stream.
     * (Added for completeness, not directly used in this specific problem flow).
     */
    resetReaderPosition() {
        this.#currentReadPosition = 0;
    }
}

const mainDataSourceIterator = new SequentialLineReader(processedInputLines);

const getNextInputLine = () => mainDataSourceIterator.fetchNextDataLine();
const checkInputAvailability = () => mainDataSourceIterator.areMoreLinesAvailable();

const publishResult = (messageContent) => {
    console.log(`--- OUTPUT ---\n${messageContent}\n--------------`);
};

const notifyError = (issueDescription) => {
    const currentTimestamp = new Date().toLocaleString('en-US', { hour12: false });
    console.error(`[ERROR :: ${currentTimestamp}] ${issueDescription}`);
};

/**
 * Provides various transformation utilities for input data based on a specified code.
 * Supports parsing, splitting, and mapping operations.
 * @param {string|string[]} sourceValue The value to be processed.
 * @param {number} operationCode An integer indicating the desired transformation logic.
 * @returns {any} The result of the transformation, or null if the operation fails or is unsupported.
 */
const applyDataTransformation = (sourceValue, operationCode) => {
    // Basic validation for input value
    if (sourceValue === null || typeof sourceValue === 'undefined' || (typeof sourceValue === 'string' && sourceValue.trim() === '')) {
        notifyError("Transformation attempted on an invalid (null/undefined/empty) source value.");
        return null;
    }

    // Using if-else if for transformation logic instead of switch
    if (operationCode === 1) { // Convert to integer
        const integerValue = parseInt(sourceValue, 10);
        if (isNaN(integerValue)) {
            notifyError(`Failed to convert "${sourceValue}" to an integer. Returning null.`);
            return null;
        }
        return integerValue;
    } else if (operationCode === 2) { // Split string by space
        return String(sourceValue).split(" ");
    } else if (operationCode === 4) { // Split by space and convert parts to numbers
        return String(sourceValue).split(" ").map(item => Number(item));
    } else if (operationCode === 6) { // Split string into individual characters
        return String(sourceValue).split("");
    } else if (operationCode === 7) { // Split into characters and convert parts to numbers
        return String(sourceValue).split("").map(item => Number(item));
    }
    // Cases 8, 9, 0 from the original `myconv` are removed as they are not utilized in the `executeGridAnalysis` logic.

    notifyError(`Unsupported transformation operation code: ${operationCode}. Returning original value.`);
    return sourceValue; // Fallback to returning the original value for unknown codes
};

// Define constants for clarity and easier modification (Type III addition)
const SUCCESS_MESSAGE = "Possible";
const FAILURE_MESSAGE = "Impossible";
const TARGET_CHARACTER = '#';

/**
 * Executes the core grid analysis logic.
 * Reads grid dimensions and data, then counts specific characters to determine a condition.
 */
const executeGridAnalysis = () => {
    // Step 1: Read and parse grid dimensions
    const rawDimensionLine = getNextInputLine();
    const [gridRows, gridCols] = applyDataTransformation(rawDimensionLine, 4); // Use transformation code 4

    // Validate parsed dimensions (Type III addition: robust input validation)
    if (isNaN(gridRows) || isNaN(gridCols) || gridRows <= 0 || gridCols <= 0) {
        notifyError(`Invalid grid dimensions: Rows=${gridRows}, Cols=${gridCols}. Both must be positive numbers.`);
        publishResult(FAILURE_MESSAGE);
        return;
    }

    // Step 2: Initialize and populate the grid data structure
    const gridMatrix = Array.from({ length: gridRows }, () => []); // Initialize with empty arrays

    for (let currentRowIndex = 0; currentRowIndex < gridRows; currentRowIndex++) {
        const currentRawRow = getNextInputLine();
        const processedRowCharacters = applyDataTransformation(currentRawRow, 6); // Use transformation code 6

        // Validate processed row data (Type III addition)
        if (processedRowCharacters === null || processedRowCharacters.length !== gridCols) {
            notifyError(`Data for row ${currentRowIndex} is malformed or incorrect length. Expected ${gridCols} characters.`);
            publishResult(FAILURE_MESSAGE);
            return;
        }
        gridMatrix[currentRowIndex] = processedRowCharacters;
    }

    // Step 3: Count the occurrences of the target character in the grid
    // Type III addition: Extract counting logic into a dedicated helper function
    const countSpecificCharacterInGrid = (matrix, characterToFind) => {
        let characterCount = 0;
        // Rewriting loops using modern array methods (Type III update)
        matrix.forEach(row => {
            row.forEach(cell => {
                if (cell === characterToFind) {
                    characterCount++;
                }
            });
        });
        return characterCount;
    };

    const totalTargetCharacterCount = countSpecificCharacterInGrid(gridMatrix, TARGET_CHARACTER);

    // Step 4: Evaluate the condition and publish the final result
    const requiredCharacterCount = gridRows + gridCols - 1; // Intermediate calculation (Type III addition)

    if (totalTargetCharacterCount === requiredCharacterCount) {
        publishResult(SUCCESS_MESSAGE);
    } else {
        publishResult(FAILURE_MESSAGE);
    }

    // Add a concluding log message (Type III addition)
    console.log(`[DEBUG] Grid dimensions: ${gridRows}x${gridCols}. Target character '${TARGET_CHARACTER}' found: ${totalTargetCharacterCount}. Expected: ${requiredCharacterCount}.`);
};

// Initiate the grid analysis process
executeGridAnalysis();