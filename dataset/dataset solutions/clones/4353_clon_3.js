let inputProcessor = initializeInputHandler();

performCoreComputation();

function obtainNextInteger() {
    return transformInputSegment(retrieveNextToken(), 1);
}

function obtainNextStringArray() {
    return transformInputSegment(retrieveNextToken(), 2);
}

function obtainNextIntegerArray() {
    return transformInputSegment(retrieveNextToken(), 4);
}

function obtainNextCharacterArray() {
    return transformInputSegment(retrieveNextToken(), 6);
}

function retrieveNextToken() {
    return inputProcessor.fetchNext();
}

function hasMoreTokens() {
    return inputProcessor.checkAvailability();
}

function readStandardInputContent() {
    const fileSystemModule = require("fs");
    const rawContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const cleanedContent = rawContent.trim();
    const lineArray = cleanedContent.split("\n");
    return lineArray;
}

function initializeInputHandler() {
    const rawInputLines = readStandardInputContent();
    if (!rawInputLines || rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0] === '')) {
        console.warn("Warning: Input stream is empty or contains only whitespace. Providing a dummy handler.");
        return {
            "sourceData": [],
            "currentPosition": 0,
            "totalLines": 0,
            "checkAvailability": function() { return false; },
            "fetchNext": function() { throw new Error("Input stream is exhausted; no data to retrieve."); }
        };
    }

    const streamManager = {
        "sourceData": rawInputLines,
        "currentPosition": 0,
        "totalLines": rawInputLines.length,
        "checkAvailability": function() {
            return (this.currentPosition < this.totalLines);
        },
        "fetchNext": function() {
            if (!this.checkAvailability()) {
                throw new Error("InputHandlerError: Attempted to read past end of input stream.");
            }
            const currentLine = this.sourceData[this.currentPosition];
            this.currentPosition++;
            return currentLine;
        }
    };
    return streamManager;
}

function logResult(content) {
    console.log(content);
}

function emitDiagnostic(message) {
    console.error(`[DIAGNOSTIC]: ${message}`);
}

function transformInputSegment(inputValue, conversionType) {
    if (inputValue === null || typeof inputValue === 'undefined') {
        emitDiagnostic("Input transformation received null/undefined value. Returning as is.");
        return inputValue;
    }

    try {
        switch (conversionType) {
            case 1:
                const parsedInteger = Number.parseInt(inputValue, 10);
                return Number.isNaN(parsedInteger) ? inputValue : parsedInteger;
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map(part => Number.parseInt(part, 10));
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map(char => Number.parseInt(char, 10));
            case 8:
                return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
            case 9:
                return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
            case 0:
                return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
            default:
                emitDiagnostic(`Unsupported conversion type specified: ${conversionType}. Returning original value.`);
                return inputValue;
        }
    } catch (processingError) {
        emitDiagnostic(`An error occurred during input transformation (Type ${conversionType}): ${processingError.message}`);
        return inputValue;
    }
}

function performCoreComputation() {
    const matrixDimension = obtainNextInteger();

    if (matrixDimension <= 0) {
        logResult(0);
        emitDiagnostic("Matrix dimension is non-positive or zero. No computation performed.");
        return;
    }

    const dataGrid = Array.from({ length: matrixDimension }, () => []);

    for (let rowIndex = 0; rowIndex < matrixDimension; rowIndex++) {
        const currentRow = obtainNextIntegerArray();
        if (currentRow.length !== matrixDimension) {
            emitDiagnostic(`Input error: Row ${rowIndex} has ${currentRow.length} elements, expected ${matrixDimension}.`);
            logResult(-1);
            return;
        }
        dataGrid[rowIndex] = currentRow;
    }

    let accumulatedSumOfPaths = 0;
    let sumOfRedundantEdges = 0;

    for (let rowIterator = 0; rowIterator < matrixDimension; rowIterator++) {
        for (let colIterator = 0; colIterator < matrixDimension; colIterator++) {
            accumulatedSumOfPaths += dataGrid[rowIterator][colIterator];
        }
    }

    const uniqueRedundantEdgeTracker = new Set();

    for (let intermediateVertex = 0; intermediateVertex < matrixDimension; intermediateVertex++) {
        for (let sourceVertex = 0; sourceVertex < matrixDimension; sourceVertex++) {
            for (let destinationVertex = 0; destinationVertex < matrixDimension; destinationVertex++) {
                const directPathWeight = dataGrid[sourceVertex][destinationVertex];
                const pathViaIntermediateWeight = dataGrid[sourceVertex][intermediateVertex] + dataGrid[intermediateVertex][destinationVertex];

                if (directPathWeight > pathViaIntermediateWeight) {
                    logResult(-1);
                    return;
                } else if (directPathWeight === pathViaIntermediateWeight &&
                           sourceVertex !== intermediateVertex &&
                           destinationVertex !== intermediateVertex) {

                    const smallerIndex = Math.min(sourceVertex, destinationVertex);
                    const largerIndex = Math.max(sourceVertex, destinationVertex);
                    const edgeIdentifier = `${smallerIndex}:${largerIndex}`;

                    if (!uniqueRedundantEdgeTracker.has(edgeIdentifier)) {
                        sumOfRedundantEdges += directPathWeight;
                        uniqueRedundantEdgeTracker.add(edgeIdentifier);
                    }
                }
            }
        }
    }

    const finalCalculatedValue = (accumulatedSumOfPaths / 2) - sumOfRedundantEdges;
    logResult(finalCalculatedValue);
}