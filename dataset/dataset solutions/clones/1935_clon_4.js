"use strict";
const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

class InputProcessor {
    constructor(rawInput) {
        this.tokens = rawInput.split(/ |\n/);
        this.tokenIndex = 0;
    }

    readNumber() {
        return +this.tokens[this.tokenIndex++];
    }

    readNumbers(count) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(+this.tokens[this.tokenIndex++]);
        }
        return numbers;
    }
}

function createNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () => createNestedArray(initialValue, ...remainingDimensions));
}

function findSmallestGreaterOrEqualIndex(sortedArray, targetValue) {
    let searchLow = 0;
    let searchHigh = sortedArray.length;
    while (searchLow < searchHigh) {
        const midPoint = Math.floor((searchLow + searchHigh) / 2);
        if (sortedArray[midPoint] < targetValue) {
            searchLow = midPoint + 1;
        } else {
            searchHigh = midPoint;
        }
    }
    return searchLow;
}

function processGraphLIS() {
    const dataReader = new InputProcessor(rawInputData);
    const nodeCount = dataReader.readNumber();
    const nodeValues = dataReader.readNumbers(nodeCount);

    const graphAdjacency = createNestedArray([], nodeCount);
    for (let k = 0; k < nodeCount - 1; k++) {
        const u = dataReader.readNumber() - 1;
        const v = dataReader.readNumber() - 1;
        graphAdjacency[u].push(v);
        graphAdjacency[v].push(u);
    }

    const resultLengths = createNestedArray(0, nodeCount);
    const currentLISSequence = [0]; 
    const traversalStack = [];

    // Stack frame structure: { nodeIdentifier: number, parentIdentifier: number, isPreVisitPhase: boolean, lisModificationDetails: object }
    // lisModificationDetails: { insertionIndex: number, originalValueAtIndex: number | undefined, wasElementAppended: boolean }

    traversalStack.push({
        nodeIdentifier: 0,
        parentIdentifier: -1,
        isPreVisitPhase: true,
        lisModificationDetails: null
    });

    while (traversalStack.length > 0) {
        const currentFrame = traversalStack[traversalStack.length - 1];
        const { nodeIdentifier, parentIdentifier, isPreVisitPhase } = currentFrame;

        if (isPreVisitPhase) {
            const valueForCurrentNode = nodeValues[nodeIdentifier];
            const insertionPoint = findSmallestGreaterOrEqualIndex(currentLISSequence, valueForCurrentNode);

            let originalElementAtInsertion = undefined;
            let elementWasAppended = false;

            if (insertionPoint !== currentLISSequence.length) {
                originalElementAtInsertion = currentLISSequence[insertionPoint];
                currentLISSequence[insertionPoint] = valueForCurrentNode;
            } else {
                currentLISSequence.push(valueForCurrentNode);
                elementWasAppended = true;
            }

            resultLengths[nodeIdentifier] = currentLISSequence.length - 1;

            currentFrame.lisModificationDetails = {
                insertionIndex: insertionPoint,
                originalValueAtIndex: originalElementAtInsertion,
                wasElementAppended: elementWasAppended
            };
            currentFrame.isPreVisitPhase = false;

            const neighbors = graphAdjacency[nodeIdentifier];
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighbor = neighbors[i];
                if (neighbor !== parentIdentifier) {
                    traversalStack.push({
                        nodeIdentifier: neighbor,
                        parentIdentifier: nodeIdentifier,
                        isPreVisitPhase: true,
                        lisModificationDetails: null
                    });
                }
            }
        } else {
            traversalStack.pop();

            const { insertionIndex, originalValueAtIndex, wasElementAppended } = currentFrame.lisModificationDetails;

            if (wasElementAppended) {
                currentLISSequence.pop();
            } else {
                currentLISSequence[insertionIndex] = originalValueAtIndex;
            }
        }
    }

    return resultLengths.join("\n");
}

const finalOutput = processGraphLIS();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}
