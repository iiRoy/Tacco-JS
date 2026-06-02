"use strict";

class InputProcessor {
    constructor(rawInput) {
        this.dataSegments = rawInput.split(/ |\n/).filter(Boolean);
        this.segmentIndex = 0;
    }

    retrieveNext(asString = false) {
        const segment = this.dataSegments[this.segmentIndex++];
        return asString ? segment : Number(segment);
    }

    retrieveMany(count, asString = false) {
        const collection = [];
        for (let i = 0; i < count; i++) {
            collection.push(this.retrieveNext(asString));
        }
        return collection;
    }

    retrieveGrid(rows, cols, asString = false) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid.push(this.retrieveMany(cols, asString));
        }
        return grid;
    }
}

function constructNestedArray(initialVal, ...dims) {
    if (dims.length === 0) {
        return initialVal;
    }
    const currentDimSize = dims[0];
    const remainingDims = dims.slice(1);
    return Array.from({ length: currentDimSize }, () => constructNestedArray(initialVal, ...remainingDims));
}

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const processor = new InputProcessor(rawInputData);

const applicationResult = executeLogic();
if (applicationResult !== undefined) {
    console.log(applicationResult);
}

function executeLogic() {
    const totalNodes = processor.retrieveNext();
    let totalIterations = BigInt(processor.retrieveNext());
    const transitionMap = processor.retrieveMany(totalNodes);

    const firstOccurrenceStep = new Map();
    let currentPosition = 0;
    let iterationCount = 0;

    let cycleStartNode = -1;
    let preCyclePathLength = 0;
    let cyclePeriod = 0;

    while (iterationCount < totalIterations) {
        if (firstOccurrenceStep.has(currentPosition)) {
            cycleStartNode = currentPosition;
            preCyclePathLength = firstOccurrenceStep.get(currentPosition);
            cyclePeriod = iterationCount - preCyclePathLength;
            break;
        }
        firstOccurrenceStep.set(currentPosition, iterationCount);
        currentPosition = transitionMap[currentPosition] - 1;
        iterationCount++;
    }

    if (cycleStartNode === -1) {
        return currentPosition + 1;
    }

    if (totalIterations < BigInt(preCyclePathLength)) {
        let finalCalculatedPosition = 0;
        for (let i = 0; i < totalIterations; i++) {
            finalCalculatedPosition = transitionMap[finalCalculatedPosition] - 1;
        }
        return finalCalculatedPosition + 1;
    } else {
        const remainingIterationsInCycle = (totalIterations - BigInt(preCyclePathLength)) % BigInt(cyclePeriod);

        let finalCalculatedPosition = cycleStartNode;
        for (let i = 0; i < remainingIterationsInCycle; i++) {
            finalCalculatedPosition = transitionMap[finalCalculatedPosition] - 1;
        }
        return finalCalculatedPosition + 1;
    }
}
