class InputHandler {
    constructor(sourceLines) {
        this.sourceData = sourceLines;
        this.currentPosition = 0;
    }

    hasMoreEntries() {
        return this.currentPosition < this.sourceData.length;
    }

    retrieveNextEntry() {
        if (this.hasMoreEntries()) {
            return this.sourceData[this.currentPosition++];
        }
        throw new Error('InputExhaustedException: No further input available');
    }

    parseInteger() {
        return parseInt(this.retrieveNextEntry(), 10);
    }

    parseIntegerArray() {
        return this.retrieveNextEntry().split(' ').map(Number);
    }
}

let globalInputProcessor;
let collectedInputLines = [];

const consoleReader = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});

consoleReader.on('line', function(inputLine){
    collectedInputLines.push(inputLine);
});

consoleReader.on('close', function(){
    globalInputProcessor = new InputHandler(collectedInputLines);
    console.error('\n↑Input ↓Output');
    executePrimaryLogic();
});

function displayOutput(content) {
    console.log(content);
}

function logDebug(content) {
    console.error('debug:' + require('util').inspect(content, false, null));
}

function executePrimaryLogic() {
    const initialParameters = globalInputProcessor.parseIntegerArray();
    const totalNodes = initialParameters[0];
    const maximumColors = initialParameters[1];

    const graphStructure = new Array(totalNodes);
    for (let i = 0; i < totalNodes; i++) {
        graphStructure[i] = {
            connections: [],
            nodeIdentifier: i,
            colorAssignmentCount: 0,
            isVisited: false
        };
    }

    for (let i = 0; i < totalNodes - 1; i++) {
        const edgeDetails = globalInputProcessor.parseIntegerArray();
        graphStructure[edgeDetails[0] - 1].connections.push(edgeDetails[1] - 1);
        graphStructure[edgeDetails[1] - 1].connections.push(edgeDetails[0] - 1);
    }

    let overallCombinations = 1;
    const modulusValue = 1000000007;

    graphStructure[0].isVisited = true;

    // Recursive Depth-First Search for coloring
    function determineNodeColorings(
        currentNodeIndex,
        availableColorsForCurrent,
        forbiddenCountForChildren,
        initialMaxColorsValue
    ) {
        graphStructure[currentNodeIndex].colorAssignmentCount = availableColorsForCurrent;

        let nextForbiddenCountForChildren = forbiddenCountForChildren;
        if (nextForbiddenCountForChildren < 2) {
            nextForbiddenCountForChildren++;
        }

        let processedSiblingCount = 0;
        for (let i = 0; i < graphStructure[currentNodeIndex].connections.length; i++) {
            const neighborIndex = graphStructure[currentNodeIndex].connections[i];
            if (!graphStructure[neighborIndex].isVisited) {
                graphStructure[neighborIndex].isVisited = true;
                const colorsForNeighbor = initialMaxColorsValue - processedSiblingCount - nextForbiddenCountForChildren;
                determineNodeColorings(neighborIndex, colorsForNeighbor, nextForbiddenCountForChildren, initialMaxColorsValue);
                processedSiblingCount++;
            }
        }
    }

    determineNodeColorings(0, maximumColors, 0, maximumColors);

    for (let i = 0; i < totalNodes; i++) {
        overallCombinations = (overallCombinations * graphStructure[i].colorAssignmentCount) % modulusValue;
    }

    displayOutput(overallCombinations);
}
