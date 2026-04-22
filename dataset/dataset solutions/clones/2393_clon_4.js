class InputProcessor {
    constructor(inputLines) {
        this.sourceData = inputLines;
        this.currentLineIndex = 0;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.sourceData.length;
    }

    retrieveNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error("No further input lines available.");
        }
        return this.sourceData[this.currentLineIndex++];
    }

    obtainNextInteger() {
        return parseInt(this.retrieveNextLine(), 10);
    }

    obtainNextIntegerList() {
        return this.retrieveNextLine().split(" ").map(Number);
    }
}

let globalInputManager;

const emitSolution = (content) => console.log(content);
const captureDiagnostic = (info) => console.error("DIAGNOSTIC_OUTPUT: " + require("util").inspect(info, false, null));

const standardInputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const collectedInputLines = [];
standardInputReader.on('line', (lineText) => { collectedInputLines.push(lineText); });
standardInputReader.on('close', () => {
    globalInputManager = new InputProcessor(collectedInputLines);
    const startExecutionTime = new Date();
    runAlgorithm();
    const endExecutionTime = new Date() - startExecutionTime;
    
    captureDiagnostic("elapsed_time : " + (endExecutionTime) + "ms");
    captureDiagnostic("memory_footprint : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function runAlgorithm() {
    const totalNodes = globalInputManager.obtainNextInteger();

    const graphConnections = new Map();
    for (let nodeIdx = 0; nodeIdx < totalNodes; ++nodeIdx) {
        graphConnections.set(nodeIdx, new Map());
    }

    const finalEdgeHues = new Map();

    for (let edgeIdx = 0; edgeIdx < totalNodes - 1; ++edgeIdx) {
        const nodePair = globalInputManager.obtainNextIntegerList();
        const nodeA = nodePair[0] - 1;
        const nodeB = nodePair[1] - 1;

        graphConnections.get(nodeA).set(nodeB, { edge_identifier: edgeIdx, assigned_hue: null });
        graphConnections.get(nodeB).set(nodeA, { edge_identifier: edgeIdx, assigned_hue: null });
    }

    let highestHueAchieved = 0;

    const processingQueue = [[0, 0]];

    while (processingQueue.length > 0) {
        const currentContext = processingQueue.shift();
        const activeNode = currentContext[0];
        const forbiddenHue = currentContext[1];

        let candidateHue = 1;

        for (const [neighborNode, edgeDetails] of graphConnections.get(activeNode).entries()) {
            if (edgeDetails.assigned_hue === null) {
                if (candidateHue === forbiddenHue) {
                    candidateHue++;
                }
                
                edgeDetails.assigned_hue = candidateHue;
                graphConnections.get(neighborNode).get(activeNode).assigned_hue = candidateHue;

                finalEdgeHues.set(edgeDetails.edge_identifier, candidateHue);
                
                processingQueue.push([neighborNode, candidateHue]);
                highestHueAchieved = Math.max(highestHueAchieved, candidateHue);
                candidateHue++;
            }
        }
    }

    emitSolution(highestHueAchieved);

    const sortedHuesForOutput = new Array(totalNodes - 1);
    for (let idx = 0; idx < totalNodes - 1; ++idx) {
        sortedHuesForOutput[idx] = finalEdgeHues.get(idx);
    }
    emitSolution(sortedHuesForOutput.join("\n"));
}