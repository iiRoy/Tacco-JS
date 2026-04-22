let inputProcessor = initializeInputProcessor();

processGraphData();

function obtainInteger() {
    return convertInput(retrieveNextLine(), 1);
}

function obtainStringTokens() {
    return convertInput(retrieveNextLine(), 2);
}

function obtainIntegerTokens() {
    return convertInput(retrieveNextLine(), 4);
}

function obtainCharTokens() {
    return convertInput(retrieveNextLine(), 6);
}

function retrieveNextLine() {
    return inputProcessor.fetchLine();
}

function checkMoreLines() {
    return inputProcessor.hasMoreInput();
}

function acquireRawInput() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedContent = fileContent.trim();
    return processedContent.split("\n");
}

function initializeInputProcessor() {
    const rawInputLines = acquireRawInput();

    if (!rawInputLines || rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0] === '')) {
        reportError("Warning: Input stream appears to be empty.");
        return {
            inputContent: [],
            currentIndex: 0,
            totalContentLength: 0,
            hasMoreInput: function() { return false; },
            fetchLine: function() {
                reportError("Error: Attempted to read from an empty input stream.");
                return null;
            }
        };
    }

    const inputState = {
        inputContent: rawInputLines,
        currentIndex: 0,
        totalContentLength: rawInputLines.length,

        hasMoreInput: function() {
            return this.currentIndex < this.totalContentLength;
        },

        fetchLine: function() {
            if (!this.hasMoreInput()) {
                throw new Error("InputOutOfBounds: No more lines to process.");
            }
            const currentLine = this.inputContent[this.currentIndex];
            this.currentIndex++;
            return currentLine;
        }
    };
    return inputState;
}

function displayResult(valueToPrint) {
    console.log(valueToPrint);
}

function reportError(errorMessage) {
    console.error("Application Error:", errorMessage);
}

function convertInput(inputValue, conversionType) {
    if (inputValue === null || typeof inputValue === 'undefined') {
        reportError("Attempted to convert null or undefined input.");
        return inputValue;
    }

    try {
        switch (conversionType) {
            case 1:
                const parsedInt = parseInt(inputValue, 10);
                if (isNaN(parsedInt)) {
                    reportError(`Failed to parse integer from: '${inputValue}'`);
                    return inputValue;
                }
                return parsedInt;
            case 2:
                return String(inputValue).split(" ");
            case 4:
                return String(inputValue).split(" ").map(token => {
                    const num = Number(token);
                    if (isNaN(num)) {
                        reportError(`Failed to convert token '${token}' to number.`);
                        return 0;
                    }
                    return num;
                });
            case 6:
                return String(inputValue).split("");
            case 7:
                return String(inputValue).split("").map(char => {
                    const num = Number(char);
                    if (isNaN(num)) {
                        reportError(`Failed to convert char '${char}' to number.`);
                        return 0;
                    }
                    return num;
                });
            case 8:
                return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
            case 9:
                return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
            case 0:
                return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
            default:
                return inputValue;
        }
    } catch (conversionError) {
        reportError(`Error during input conversion (type ${conversionType}): ${conversionError.message}`);
        return inputValue;
    }
}

function processGraphData() {
    const initialParameters = obtainIntegerTokens();

    if (!initialParameters || initialParameters.length < 2) {
        reportError("Invalid initial input format. Expected N and M.");
        return;
    }

    const nodeCount = initialParameters[0];
    const edgeCount = initialParameters[1];

    if (nodeCount <= 0 || edgeCount < 0) {
        reportError(`Invalid graph dimensions: N=${nodeCount}, M=${edgeCount}. Node count must be positive.`);
        return;
    }
    if (nodeCount > 500) {
        reportError(`Warning: Large node count (${nodeCount}). Computation may be slow.`);
    }

    const PATH_INFINITY = 1000000007;

    const shortestPathsMatrix = Array.from({ length: nodeCount }, () =>
        Array.from({ length: nodeCount }, () => PATH_INFINITY)
    );
    const initialEdgesMatrix = Array.from({ length: nodeCount }, () =>
        Array.from({ length: nodeCount }, () => PATH_INFINITY)
    );

    for (let currentVertex = 0; currentVertex < nodeCount; currentVertex++) {
        shortestPathsMatrix[currentVertex][currentVertex] = 0;
        initialEdgesMatrix[currentVertex][currentVertex] = 0;
    }

    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const edgeDetails = obtainIntegerTokens();
        
        if (!edgeDetails || edgeDetails.length < 3) {
            reportError(`Malformed edge data at line ${edgeIndex + 2}. Skipping.`);
            continue;
        }

        const startNode = edgeDetails[0] - 1;
        const endNode = edgeDetails[1] - 1;
        const edgeWeight = edgeDetails[2];

        if (startNode < 0 || startNode >= nodeCount || endNode < 0 || endNode >= nodeCount) {
            reportError(`Invalid node indices for edge (${edgeDetails[0]}, ${edgeDetails[1]}) at line ${edgeIndex + 2}. Skipping.`);
            continue;
        }

        shortestPathsMatrix[startNode][endNode] = edgeWeight;
        shortestPathsMatrix[endNode][startNode] = edgeWeight;
        initialEdgesMatrix[startNode][endNode] = edgeWeight;
        initialEdgesMatrix[endNode][startNode] = edgeWeight;
    }

    for (let intermediateVertex = 0; intermediateVertex < nodeCount; intermediateVertex++) {
        for (let sourceVertex = 0; sourceVertex < nodeCount; sourceVertex++) {
            for (let destinationVertex = 0; destinationVertex < nodeCount; destinationVertex++) {
                const pathThroughIntermediate = shortestPathsMatrix[sourceVertex][intermediateVertex] +
                                                shortestPathsMatrix[intermediateVertex][destinationVertex];

                if (shortestPathsMatrix[sourceVertex][destinationVertex] > pathThroughIntermediate) {
                    shortestPathsMatrix[sourceVertex][destinationVertex] = pathThroughIntermediate;
                }
            }
        }
    }

    let countOfRedundantDirectEdges = 0;

    for (let rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
        for (let colIdx = 0; colIdx < nodeCount; colIdx++) {
            if (rowIdx !== colIdx &&
                initialEdgesMatrix[rowIdx][colIdx] !== PATH_INFINITY) {

                if (initialEdgesMatrix[rowIdx][colIdx] > shortestPathsMatrix[rowIdx][colIdx]) {
                    countOfRedundantDirectEdges++;
                }
            }
        }
    }

    const finalResult = countOfRedundantDirectEdges / 2;

    displayResult(finalResult);
}