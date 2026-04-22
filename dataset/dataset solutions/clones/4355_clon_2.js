var dataStream = initializeReader();

processGraphData();

function readNumber() {
    return transformData(getNextLine(), 1);
}

function readStringList() {
    return transformData(getNextLine(), 2);
}

function readNumberList() {
    return transformData(getNextLine(), 4);
}

function readCharacterList() {
    return transformData(getNextLine(), 6);
}

function getNextLine() {
    return dataStream.retrieveNext();
}

function hasMoreLines() {
    return dataStream.hasRemaining();
}

function fetchInputLines() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeReader() {
    var rawInputLines = fetchInputLines();
    var lineProcessor = {
        "sourceLines": rawInputLines,
        "currentLineIndex": 0,
        "totalLinesCount": rawInputLines.length,
        "hasRemaining": function() {
            return (this.currentLineIndex < this.totalLinesCount);
        },
        "retrieveNext": function() {
            if (!this.hasRemaining()) {
                throw "InputBoundaryExceeded: No more data lines available.";
            } else {
                var extractedLine = this.sourceLines[this.currentLineIndex];
                this.currentLineIndex++;
                return extractedLine;
            }
        }
    };
    return lineProcessor;
}

function printResult(val) {
    console.log(val);
}

function logError(msg) {
    console.error(msg);
}

// Utility for converting input values based on a specified type.
// Types: 1=Int, 2=String[], 4=Number[], 6=Char[], 7=CharNum[], 8=JoinSP, 9=JoinNL, 0=JoinNoSep.
function transformData(inputVal, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputVal);
            case 2:
                return inputVal.split(" ");
            case 4:
                return inputVal.split(" ").map((element) => Number(element));
            case 6:
                return inputVal.split("");
            case 7:
                return inputVal.split("").map((element) => Number(element));
            case 8:
                return inputVal.join(" ");
            case 9:
                return inputVal.join("\n");
            case 0:
                return inputVal.join("");
            default:
                return inputVal;
        }
    } catch (conversionError) {
        return inputVal;
    }
}

// Main logic for graph processing, likely shortest paths.
function processGraphData() {
    var vertexCount = readNumber();
    var adjacencyMatrix = new Array(vertexCount);
    for (var rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
        adjacencyMatrix[rowIdx] = readNumberList();
    }
    var reduciblePathSum = 0;
    var totalInitialPathSum = 0;
    for (var rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
        for (var colIdx = 0; colIdx < vertexCount; colIdx++) {
            totalInitialPathSum += adjacencyMatrix[rowIdx][colIdx];
        }
    }
    totalInitialPathSum /= 2;
    for (var midIdx = 0; midIdx < vertexCount; midIdx++) {
        for (var rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
            for (var colIdx = 0; colIdx < vertexCount; colIdx++) {
                if (adjacencyMatrix[rowIdx][colIdx] > (adjacencyMatrix[rowIdx][midIdx] + adjacencyMatrix[midIdx][colIdx])) {
                    printResult(-1);
                    return;
                } else if (adjacencyMatrix[rowIdx][colIdx] == (adjacencyMatrix[rowIdx][midIdx] + adjacencyMatrix[midIdx][colIdx]) && rowIdx != midIdx && colIdx != midIdx) {
                    reduciblePathSum += adjacencyMatrix[rowIdx][colIdx];
                }
            }
        }
    }
    reduciblePathSum /= 2;
    printResult(totalInitialPathSum - reduciblePathSum);
}