var InputReaderFactory = (function () {
    function _processValue(value, asString) {
        return asString ? value : +value;
    }

    function createReader(sourceString) {
        return new InputReader(sourceString);
    }

    function InputReader(sourceString) {
        this.inputLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    InputReader.prototype.readSingleValue = function (asString) {
        var lines = this.inputLines;
        var lineIdx = this.currentLineIndex;
        var resultValue;

        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ");
        }

        resultValue = lines[lineIdx].shift();

        if (lines[lineIdx].length === 0) {
            this.currentLineIndex++;
        }
        return _processValue(resultValue, asString);
    };

    InputReader.prototype.readLineValues = function (asString) {
        var lineContent = this.inputLines[this.currentLineIndex++];
        var values = lineContent.split(" ");
        return asString ? values : values.map(val => _processValue(val, asString));
    };

    InputReader.prototype.readMatrix = function (numRows, asString) {
        var matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numRows);
        this.currentLineIndex += numRows;
        var processedMatrix = matrixRows.map(row => row.split(" "));
        return asString ? processedMatrix : processedMatrix.map(row => row.map(val => _processValue(val, asString)));
    };

    InputReader.prototype.readRawLines = function (numLines, asString) {
        var rawLines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
        this.currentLineIndex += numLines;
        return asString ? rawLines : rawLines.map(val => _processValue(val, asString));
    };

    return createReader;
})();

var inputParser = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments;
    var argCount = args.length;
    var arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

function initializeVisitedState(size) {
    return createMultiDimArray(1, size);
}

function executeBFS(startNode, totalNodes, adjList, trackLevels = false) {
    let visitedState = initializeVisitedState(totalNodes);
    let currentLevelQueue = [startNode];
    let nextLevelQueue = [];
    let lastVisitedNode = startNode;
    let currentLevelCount = 0;

    visitedState[startNode] = 0;

    while (currentLevelQueue.length > 0 || nextLevelQueue.length > 0) {
        if (currentLevelQueue.length === 0) {
            if (trackLevels) {
                currentLevelCount++;
            }
            currentLevelQueue = nextLevelQueue;
            nextLevelQueue = [];
        }

        const processingNode = currentLevelQueue.pop();
        lastVisitedNode = processingNode;

        for (const neighborNode of adjList[processingNode]) {
            if (visitedState[neighborNode] === 1) {
                nextLevelQueue.push(neighborNode);
                visitedState[neighborNode] = 0;
            }
        }
    }
    return { finalNode: lastVisitedNode, maxDepth: currentLevelCount };
}

console.log(main());

function main() {
    var nodeCount = inputParser.readSingleValue();
    var adjacencyList = createMultiDimArray("[]", nodeCount);

    for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const [nodeA, nodeB] = inputParser.readLineValues().map(val => val - 1);
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    const firstBFSResult = executeBFS(0, nodeCount, adjacencyList, false);
    const diameterStartNode = firstBFSResult.finalNode;

    const secondBFSResult = executeBFS(diameterStartNode, nodeCount, adjacencyList, true);
    const diameterLength = secondBFSResult.maxDepth;

    return diameterLength % 3 === 1 ? "Second" : "First";
}
