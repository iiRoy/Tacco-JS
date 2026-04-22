var inputProcessor = initializeInputSystem();

ExecuteProgram();

function obtainInteger() {
    return convertData(fetchNextLine(), 1);
}

function obtainStringArray() {
    return convertData(fetchNextLine(), 2);
}

function obtainIntegerArray() {
    return convertData(fetchNextLine(), 4);
}

function obtainCharacterArray() {
    return convertData(fetchNextLine(), 6);
}

function fetchNextLine() {
    return inputProcessor.getNextLine();
}

function checkMoreLines() {
    return inputProcessor.hasMoreLines();
}

function acquireRawInput() {
    return require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
        .split("\n");
}

function initializeInputSystem() {
    var inputContent = acquireRawInput();
    var systemInputHandler = {
        "lineBuffer": inputContent,
        "currentLineIndex": 0,
        "totalLineCount": inputContent.length,
        "hasMoreLines": function() {
            return (this.currentLineIndex < this.totalLineCount);
        },
        "getNextLine": function() {
            if (!this.hasMoreLines()) {
                throw new Error("InputBufferExhausted: No more input lines available.");
            } else {
                var retrievedLine = this.lineBuffer[this.currentLineIndex];
                this.currentLineIndex++;
                return retrievedLine;
            }
        }
    };
    return systemInputHandler;
}

function displayOutput(valueToPrint) {
    console.log(valueToPrint);
}

function logErrorToConsole(errorMessage) {
    console.error(errorMessage);
}

/*
 * Data conversion utility function.
 * Handles various transformation modes for input values.
 *
 * Conversion Modes:
 *   1: Convert to integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space and convert elements to numbers.
 *   6: Split string into an array of single characters.
 *   7: Split string into characters and convert elements to numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any delimiter.
 *   Default: Returns the input value unchanged if no matching mode or on error.
 */
function convertData(sourceValue, conversionMode) {
    try {
        switch (conversionMode) {
            case 1:
                return parseInt(sourceValue, 10);
            case 2:
                return sourceValue.split(" ");
            case 4:
                return sourceValue.split(" ").map((itemString) => Number(itemString));
            case 6:
                return sourceValue.split("");
            case 7:
                return sourceValue.split("").map((itemString) => Number(itemString));
            case 8:
                return sourceValue.join(" ");
            case 9:
                return sourceValue.join("\n");
            case 0:
                return sourceValue.join("");
            default:
                return sourceValue;
        }
    } catch (caughtException) {
        return sourceValue;
    }
}

function ExecuteProgram() {
    var matrixSize = obtainInteger();
    var distanceMatrix = new Array(matrixSize);

    for (var rowIterator = 0; rowIterator < matrixSize; rowIterator++) {
        distanceMatrix[rowIterator] = obtainIntegerArray();
    }

    var redundantPathSum = 0;
    var totalPathWeight = 0;

    for (var rowIterator = 0; rowIterator < matrixSize; rowIterator++) {
        for (var colIterator = 0; colIterator < matrixSize; colIterator++) {
            totalPathWeight += distanceMatrix[rowIterator][colIterator];
        }
    }

    logErrorToConsole(totalPathWeight);

    totalPathWeight /= 2;

    var processedEdges = new Set();

    for (var intermediateNode = 0; intermediateNode < matrixSize; intermediateNode++) {
        for (var rowIterator = 0; rowIterator < matrixSize; rowIterator++) {
            for (var colIterator = 0; colIterator < matrixSize; colIterator++) {
                if (distanceMatrix[rowIterator][colIterator] > (distanceMatrix[rowIterator][intermediateNode] + distanceMatrix[intermediateNode][colIterator])) {
                    displayOutput(-1);
                    return;
                } else if (distanceMatrix[rowIterator][colIterator] === (distanceMatrix[rowIterator][intermediateNode] + distanceMatrix[intermediateNode][colIterator]) && rowIterator !== intermediateNode && colIterator !== intermediateNode) {
                    var edgeIdentifier = Math.min(rowIterator, colIterator).toString() + ":" + Math.max(rowIterator, colIterator).toString();
                    if (!processedEdges.has(edgeIdentifier)) {
                        redundantPathSum += distanceMatrix[rowIterator][colIterator];
                        processedEdges.add(edgeIdentifier);
                    }
                }
            }
        }
    }

    logErrorToConsole(redundantPathSum);

    displayOutput(totalPathWeight - redundantPathSum);
}