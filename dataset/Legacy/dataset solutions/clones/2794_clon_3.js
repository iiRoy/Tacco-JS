'use strict';

function parseNumbersFromString(inputString) {
    return inputString.split(' ').map(Number);
}

function processInput(rawInput) {
    const INITIAL_VISIT_VALUE = -1;
    const MODULO_CYCLE_LENGTH = 3;

    const inputLines = rawInput.trim().split('\n');

    const [nodeCount, edgeCount] = parseNumbersFromString(inputLines[0]);

    const adjacencyList = Array.from({ length: nodeCount }, () => []);

    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const [sourceNodeId, destinationNodeId] = parseNumbersFromString(inputLines[edgeIndex + 1]);
        adjacencyList[sourceNodeId - 1].push(destinationNodeId - 1);
    }

    const [startNode, targetNode] = parseNumbersFromString(inputLines[edgeCount + 1]).map(nodeId => nodeId - 1);

    const visitedSteps = new Array(nodeCount).fill(INITIAL_VISIT_VALUE);

    let currentQueue = [startNode];
    visitedSteps[startNode] = 0;
    let currentStep = 0;
    let targetReached = false;

    let nextQueueSet = new Set();

    while (currentQueue.length > 0) {
        nextQueueSet.clear();
        currentStep++;

        for (const currentNode of currentQueue) {
            for (const neighborNode of adjacencyList[currentNode]) {
                if (currentStep % MODULO_CYCLE_LENGTH === 0 && neighborNode === targetNode) {
                    targetReached = true;
                    break;
                }

                const previousVisitStep = visitedSteps[neighborNode];
                if (previousVisitStep === INITIAL_VISIT_VALUE) {
                    nextQueueSet.add(neighborNode);
                    visitedSteps[neighborNode] = currentStep;
                } else {
                    if ((currentStep - previousVisitStep) % MODULO_CYCLE_LENGTH !== 0) {
                        nextQueueSet.add(neighborNode);
                        visitedSteps[neighborNode] = currentStep;
                    }
                }
            }
            if (targetReached) break;
        }
        if (targetReached) break;

        currentQueue = Array.from(nextQueueSet);
    }

    if (targetReached) {
        console.log(currentStep / MODULO_CYCLE_LENGTH);
    } else {
        console.log(INITIAL_VISIT_VALUE);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
