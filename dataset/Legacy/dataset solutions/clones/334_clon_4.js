const outputLog = console.log;

class InputSource {
    #lineBuffer;
    #currentLineIndex;

    constructor(rawInputString) {
        this.#lineBuffer = rawInputString.split("\n");
        this.#currentLineIndex = 0;
    }

    // Retrieves the next raw line from the input buffer.
    fetchNextLine() {
        if (this.#currentLineIndex >= this.#lineBuffer.length) {
            return null;
        }
        return this.#lineBuffer[this.#currentLineIndex++];
    }

    // Parses the next line into an array of integers.
    parseIntegerArray() {
        const lineContent = this.fetchNextLine();
        if (lineContent === null) {
            return [];
        }
        return lineContent.split(' ').map(Number);
    }
}

// Standalone utility functions, replacing Array.prototype extensions and variadic functions.
const determineMaximum = (...values) => Math.max(...values);
const determineMinimum = (...values) => Math.min(...values);
const computeArraySum = (numericArray) => numericArray.reduce((accum, val) => accum + val, 0);
const renderArrayAsString = (elements, delimiter = " ") => elements.join(delimiter);

// Core logic for processing grid traversals.
function executeGridPathfinding(rawInputData) {
    const inputReader = new InputSource(rawInputData);

    // Direction vectors stored in a Map for efficient lookup.
    const pathDirections = new Map([
        [">", [1, 0]], // Right (dx, dy)
        ["v", [0, 1]], // Down
        ["^", [0, -1]], // Up
        ["<", [-1, 0]]  // Left
    ]);

    // Loop to handle multiple test cases from the input.
    while (true) {
        const dimensions = inputReader.parseIntegerArray();
        const [gridRows, gridCols] = dimensions;

        // Termination condition for the entire program.
        if (gridRows === 0) {
            break;
        }

        // Grid representation: A Map where keys are "y,x" strings and values are characters.
        const gridLayout = new Map();
        for (let rIdx = 0; rIdx < gridRows; rIdx++) {
            const rowCharacters = inputReader.fetchNextLine().split("");
            for (let cIdx = 0; cIdx < gridCols; cIdx++) {
                gridLayout.set(`${rIdx},${cIdx}`, rowCharacters[cIdx]);
            }
        }

        let currentXCoord = 0;
        let currentYCoord = 0;
        // Set to track visited coordinates, preventing infinite loops by detecting revisits.
        const visitedPathCoordinates = new Set();

        let traversalOutcomeStatus = null; // Will store "LOOP" or [finalX, finalY]

        // Inner loop for simulating movement within the current grid.
        while (traversalOutcomeStatus === null) {
            const currentCoordinateKey = `${currentYCoord},${currentXCoord}`;

            // Check if the current cell has been visited before (loop detection).
            if (visitedPathCoordinates.has(currentCoordinateKey)) {
                traversalOutcomeStatus = "LOOP";
                break;
            }
            visitedPathCoordinates.add(currentCoordinateKey);

            const cellSymbol = gridLayout.get(currentCoordinateKey);

            // Check if the current cell is the termination point ('.').
            if (cellSymbol === ".") {
                traversalOutcomeStatus = [currentXCoord, currentYCoord];
                break;
            }

            // Retrieve movement deltas based on the cell symbol.
            const [deltaX, deltaY] = pathDirections.get(cellSymbol);
            currentXCoord += deltaX;
            currentYCoord += deltaY;
        }

        // Output the result for the current test case.
        if (traversalOutcomeStatus === "LOOP") {
            outputLog("LOOP");
        } else {
            outputLog(traversalOutcomeStatus[0], traversalOutcomeStatus[1]);
        }
    }
}

// Invoke the main processing function with input read from standard input.
executeGridPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));
