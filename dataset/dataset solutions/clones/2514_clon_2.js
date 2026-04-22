var inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var dataProcessor;
var receivedLines = [];
inputReader.on('line', function(incomingData) {
    receivedLines.push(incomingData);
});
inputReader.on('close', function() {
    dataProcessor = initializeProcessor(receivedLines);
    console.error("\n");
    var startTime = Date.now();
    ExecuteProgram();
    var elapsedTime = Date.now() - startTime;
    logDebugMessage("execution_time : " + elapsedTime + " ms");
    logDebugMessage("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
});

function duplicateObject(originalObject) {
    return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
    return transformValue(fetchNextItem(), 1);
}

function retrieveStringArray() {
    return transformValue(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
    return transformValue(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
    return transformValue(fetchNextItem(), 6);
}

function fetchNextItem() {
    return dataProcessor.fetchNextItem();
}

function hasMoreItems() {
    return dataProcessor.hasMoreItems();
}

function initializeProcessor(dataEntries) {
    var processorInstance = {
        sourceLines: dataEntries,
        currentPosition: 0,
        totalCount: dataEntries.length,
        hasMoreItems: function() {
            return (this.currentPosition < this.totalCount);
        },
        fetchNextItem: function() {
            if (!this.hasMoreItems()) {
                throw "InputEndOfFileException - No more entries available";
            } else {
                var extractedEntry = this.sourceLines[this.currentPosition++];
                return extractedEntry;
            }
        }
    };
    return processorInstance;
}

function displayResult(messageContent) {
    console.log(messageContent);
}

function logDebugMessage(messageContent) {
    console.error("diagnostic_info:" + require("util").inspect(messageContent, false, null));
}

// Parameter 'conversionType' specifies the transformation:
// 1: parseInt.
// 2: split by space.
// 4: split by space and map to Number.
// 6: split into characters.
// 7: split into characters and map to Number.
// 8: join with spaces.
// 9: join with newlines.
// 0: join without separator.
// Default: return original value.
function transformValue(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map(Number);
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map(Number);
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (err) {
        return inputValue;
    }
}

// Main execution function for the program.
function ExecuteProgram() {
    var nodeCount = retrieveInteger();
    var graphNodes = new Array(nodeCount);
    for (var idxA = 0; idxA < nodeCount; idxA++) {
        graphNodes[idxA] = {
            nodeIdentifier: idxA,
            adjacentNodes: [],
            visitedStatus: false,
            levelValue: 1
        };
    }
    for (var idxA = 0; idxA < nodeCount; idxA++) {
        var tempCharacters = retrieveCharacterArray();
        for (var idxB = 0; idxB < nodeCount; idxB++) {
            if (idxA !== idxB && tempCharacters[idxB] === "1") {
                graphNodes[idxA].adjacentNodes.push(idxB);
            }
        }
    }

    var finalResult = -1;
    var greatestLevel = -1;
    var preservedNodesState;
    for (var idxA = 0; idxA < nodeCount; idxA++) {
        var currentLevel = performBFS(idxA);
        if (greatestLevel < currentLevel) {
            preservedNodesState = graphNodes;
            greatestLevel = currentLevel;
        }
    }

    for (var idxA = 0; idxA < nodeCount - 1; idxA++) {
        for (var idxB = idxA + 1; idxB < nodeCount; idxB++) {
            if (graphNodes[idxA].adjacentNodes.indexOf(idxB) !== -1 && graphNodes[idxB].adjacentNodes.indexOf(idxA) !== -1) {
                if (graphNodes[idxA].levelValue % 2 === graphNodes[idxB].levelValue % 2) {
                    displayResult(-1);
                    return;
                }
            }
        }
    }
    displayResult(greatestLevel);

    // Breadth-First Search subroutine.
    function performBFS(startNodeIndex) {
        for (var idxA = 0; idxA < nodeCount; idxA++) {
            graphNodes[idxA].visitedStatus = false;
            graphNodes[idxA].levelValue = 1;
        }
        var traversalQueue = [startNodeIndex];
        graphNodes[startNodeIndex].visitedStatus = true;
        var currentMaxDepth = 0;
        while (traversalQueue.length > 0) {
            var currentNodeIndex = traversalQueue.shift();
            var neighbors = graphNodes[currentNodeIndex].adjacentNodes;
            currentMaxDepth = graphNodes[currentNodeIndex].levelValue;
            for (var idxC = 0; idxC < neighbors.length; idxC++) {
                if (!graphNodes[neighbors[idxC]].visitedStatus) {
                    graphNodes[neighbors[idxC]].visitedStatus = true;
                    graphNodes[neighbors[idxC]].levelValue = graphNodes[currentNodeIndex].levelValue + 1;
                    traversalQueue.push(neighbors[idxC]);
                }
            }
        }
        return currentMaxDepth;
    }
}