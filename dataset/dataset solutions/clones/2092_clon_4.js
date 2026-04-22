"use strict";

class InputProcessor {
    constructor(sourceData) {
        this.tokenArray = sourceData.toString().trim().split(/\s+/);
        this.currentTokenIndex = 0;
    }

    retrieveNumber() {
        return parseInt(this.tokenArray[this.currentTokenIndex++], 10);
    }
}

class ValueGenerator {
    constructor(startingValue) {
        this.currentValue = startingValue;
    }

    inspectNext() {
        return this.currentValue;
    }

    extractNext() {
        const resultValue = this.currentValue;
        this.currentValue += 3;
        return resultValue;
    }
}

function executeSolution() {
    const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalNodes = dataReader.retrieveNumber();
    const connectionMap = Array.from({ length: totalNodes }, () => new Set());
    const nodeDepths = new Array(totalNodes).fill(-1);
    const assignedLabels = new Array(totalNodes);

    for (let i = 0; i < totalNodes - 1; i++) {
        const nodeOne = dataReader.retrieveNumber() - 1;
        const nodeTwo = dataReader.retrieveNumber() - 1;
        connectionMap[nodeOne].add(nodeTwo);
        connectionMap[nodeTwo].add(nodeOne);
    }

    // Breadth-First Search to determine depths
    const processingQueue = [];
    processingQueue.push([0, 0]); // [nodeIdentifier, currentLevel]
    nodeDepths[0] = 0;

    let queueHead = 0;
    while (queueHead < processingQueue.length) {
        const [activeNode, currentLevel] = processingQueue[queueHead++];
        
        for (const connectedNode of connectionMap[activeNode]) {
            if (nodeDepths[connectedNode] === -1) { // If not yet visited
                nodeDepths[connectedNode] = currentLevel + 1;
                processingQueue.push([connectedNode, currentLevel + 1]);
            }
        }
    }

    const depthParities = nodeDepths.map(d => d % 2); // 0 for even, 1 for odd

    let countOddDepths = 0;
    let countEvenDepths = 0;
    depthParities.forEach(p => {
        if (p === 1) countOddDepths++;
        else countEvenDepths++;
    });

    const generatorA = new ValueGenerator(1);
    const generatorB = new ValueGenerator(2);
    const generatorC = new ValueGenerator(3);

    const divisionThreshold = Math.floor(totalNodes / 3);

    if (countOddDepths <= divisionThreshold) { // Odd-depth nodes are the smaller group or equal to threshold
        depthParities.forEach((parityStatus, nodeIdentifier) => {
            if (parityStatus === 1) { // Odd depth node
                assignedLabels[nodeIdentifier] = generatorC.extractNext();
            } else { // Even depth node
                if (generatorA.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorA.extractNext();
                } else if (generatorB.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorB.extractNext();
                } else {
                    assignedLabels[nodeIdentifier] = generatorC.extractNext();
                }
            }
        });
    } else if (countEvenDepths <= divisionThreshold) { // Even-depth nodes are the smaller group or equal to threshold
        depthParities.forEach((parityStatus, nodeIdentifier) => {
            if (parityStatus === 0) { // Even depth node
                assignedLabels[nodeIdentifier] = generatorC.extractNext();
            } else { // Odd depth node
                if (generatorA.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorA.extractNext();
                } else if (generatorB.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorB.extractNext();
                } else {
                    assignedLabels[nodeIdentifier] = generatorC.extractNext();
                }
            }
        });
    } else { // Both groups are larger than the threshold
        depthParities.forEach((parityStatus, nodeIdentifier) => {
            if (parityStatus === 1) { // Odd depth node
                if (generatorA.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorA.extractNext();
                } else {
                    assignedLabels[nodeIdentifier] = generatorC.extractNext();
                }
            } else { // Even depth node
                if (generatorB.inspectNext() <= totalNodes) {
                    assignedLabels[nodeIdentifier] = generatorB.extractNext();
                } else {
                    assignedLabels[nodeIdentifier] = generatorC.extractNext();
                }
            }
        });
    }

    return assignedLabels.join(" ");
}

if (process.argv.length <= 2) {
    require("child_process").fork(process.argv[1], ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    const programResult = executeSolution();
    if (programResult !== undefined) {
        console.log(programResult);
    }
}