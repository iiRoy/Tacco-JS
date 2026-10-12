"use strict";

class InputProcessor {
    constructor(sourceText) {
        this.tokenStream = sourceText.split(/ |\n/).filter(Boolean);
        this.currentPosition = 0;
    }

    retrieveNext(asString = false) {
        const token = this.tokenStream[this.currentPosition++];
        return asString ? token : Number(token);
    }

    retrieveMany(count, asString = false) {
        const segment = this.tokenStream.slice(this.currentPosition, this.currentPosition + count);
        this.currentPosition += count;
        return asString ? segment : segment.map(Number);
    }

    constructNestedArray(initialElement, ...dimensions) {
        if (dimensions.length === 0) {
            return initialElement;
        }
        const currentDimensionLength = dimensions[0];
        const remainingDimensions = dimensions.slice(1);
        return Array.from({ length: currentDimensionLength }, () =>
            this.constructNestedArray(initialElement, ...remainingDimensions)
        );
    }
}

function calculateGraphDepths(totalNodes, graphAdjacencyList, startingNode) {
    const nodeDepths = Array(totalNodes).fill(-1);
    const traversalQueue = [];

    traversalQueue.push(startingNode);
    nodeDepths[startingNode] = 0;

    let queuePointer = 0;
    while (queuePointer < traversalQueue.length) {
        const currentNode = traversalQueue[queuePointer++];
        const currentDepth = nodeDepths[currentNode];

        for (const connectedNode of graphAdjacencyList[currentNode]) {
            if (nodeDepths[connectedNode] === -1) {
                nodeDepths[connectedNode] = currentDepth + 1;
                traversalQueue.push(connectedNode);
            }
        }
    }
    return nodeDepths;
}

function executeCoreLogic() {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputHandler = new InputProcessor(rawInputContent);

    const totalNodes = inputHandler.retrieveNext();
    const graphAdjacencyList = inputHandler.constructNestedArray([], totalNodes);

    for (let i = 0; i < totalNodes - 1; i++) {
        const u = inputHandler.retrieveNext() - 1;
        const v = inputHandler.retrieveNext() - 1;
        graphAdjacencyList[u].push(v);
        graphAdjacencyList[v].push(u);
    }

    const nodeDepths = calculateGraphDepths(totalNodes, graphAdjacencyList, 0);

    const finalResultArray = Array(totalNodes);
    const oddDepthNodeIndices = [];
    const evenDepthNodeIndices = [];

    for (let i = 0; i < totalNodes; i++) {
        if (nodeDepths[i] % 2 === 1) {
            oddDepthNodeIndices.push(i);
        } else {
            evenDepthNodeIndices.push(i);
        }
    }

    const sequenceType1 = []; // Numbers 1, 4, 7, ...
    const sequenceType2 = []; // Numbers 2, 5, 8, ...
    const sequenceType3 = []; // Numbers 3, 6, 9, ...
    for (let i = 1; i <= totalNodes; i++) {
        const remainder = i % 3;
        if (remainder === 1) sequenceType1.push(i);
        else if (remainder === 2) sequenceType2.push(i);
        else sequenceType3.push(i);
    }

    let oddNodeNumberSources, evenNodeNumberSources;

    if (oddDepthNodeIndices.length <= sequenceType3.length) {
        oddNodeNumberSources = [sequenceType3];
        evenNodeNumberSources = [sequenceType1, sequenceType2, sequenceType3];
    } else if (evenDepthNodeIndices.length <= sequenceType3.length) {
        evenNodeNumberSources = [sequenceType3];
        oddNodeNumberSources = [sequenceType1, sequenceType2, sequenceType3];
    } else {
        oddNodeNumberSources = [sequenceType1, sequenceType3];
        evenNodeNumberSources = [sequenceType2, sequenceType3];
    }

    const acquireNumbersFromPools = (pools, requiredCount) => {
        const collectedNumbers = [];
        for (const pool of pools) {
            const remainingToCollect = requiredCount - collectedNumbers.length;
            if (remainingToCollect <= 0) break;
            const countToTake = Math.min(remainingToCollect, pool.length);
            collectedNumbers.push(...pool.splice(0, countToTake));
        }
        return collectedNumbers;
    };

    const assignedOddNumbers = acquireNumbersFromPools(oddNodeNumberSources, oddDepthNodeIndices.length);
    const assignedEvenNumbers = acquireNumbersFromPools(evenNodeNumberSources, evenDepthNodeIndices.length);

    oddDepthNodeIndices.forEach((nodeIndex, i) => {
        finalResultArray[nodeIndex] = assignedOddNumbers[i];
    });
    evenDepthNodeIndices.forEach((nodeIndex, i) => {
        finalResultArray[nodeIndex] = assignedEvenNumbers[i];
    });

    return finalResultArray.join(" ");
}

if (process.argv.length <= 2) {
    require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    const programOutput = executeCoreLogic();
    if (programOutput !== undefined) {
        console.log(programOutput);
    }
}
