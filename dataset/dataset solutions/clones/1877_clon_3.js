"use strict";

class InputProcessor {
    constructor() {
        const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
        this.tokenStream = rawInputData.split(/ |\n/);
        this.currentTokenIndex = 0;
    }

    retrieveNextToken(asString = false) {
        const tokenValue = this.tokenStream[this.currentTokenIndex++];
        return asString ? tokenValue : +tokenValue;
    }

    retrieveMultipleTokens(count, asString = false) {
        const tokensSlice = this.tokenStream.slice(this.currentTokenIndex, this.currentTokenIndex + count);
        this.currentTokenIndex += count;
        return asString ? tokensSlice : tokensSlice.map(val => +val);
    }

    retrieveMatrixTokens(height, width, asString = false) {
        const resultMatrix = [];
        for (let rowIdx = 0; rowIdx < height; rowIdx++) {
            const rowTokens = this.tokenStream.slice(this.currentTokenIndex, this.currentTokenIndex + width);
            this.currentTokenIndex += width;
            resultMatrix.push(asString ? rowTokens : rowTokens.map(val => +val));
        }
        return resultMatrix;
    }
}

const globalInputReader = new InputProcessor();

function generateMultiDimensionalArray(initialFillValue) {
    const dimensionArguments = arguments;
    let currentArgLength = dimensionArguments.length;
    let arrayConstructionString = `Array(dimensionArguments[${--currentArgLength}]).fill().map(element=>{return ${initialFillValue};})`;
    while (--currentArgLength) {
        arrayConstructionString = `Array(dimensionArguments[${currentArgLength}]).fill().map(element=>${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
}

function solveProblem() {
    const numberOfElements = globalInputReader.retrieveNextToken();
    let totalRemainingSteps = BigInt(globalInputReader.retrieveNextToken());
    const stateTransitionArray = globalInputReader.retrieveMultipleTokens(numberOfElements);

    const visitedStateIterationMap = generateMultiDimensionalArray(-1, numberOfElements);

    let currentPositionIndex = 0;
    visitedStateIterationMap[0] = 0; // Mark the initial state as visited at iteration 0

    const performStateTransition = (currentIdx, transitions) => transitions[currentIdx] - 1;

    for (let currentIterationCount = 1; currentIterationCount <= totalRemainingSteps; currentIterationCount++) {
        currentPositionIndex = performStateTransition(currentPositionIndex, stateTransitionArray);

        const previousVisitIteration = visitedStateIterationMap[currentPositionIndex];
        if (previousVisitIteration >= 0) {
            // Cycle detected!
            const cycleStartPointIteration = BigInt(previousVisitIteration);
            const detectedCycleLength = BigInt(currentIterationCount) - cycleStartPointIteration;

            // Adjust the total remaining steps to jump through the cycle
            totalRemainingSteps -= BigInt(currentIterationCount);
            totalRemainingSteps %= detectedCycleLength;

            // Perform the remaining steps within the detected cycle
            for (let stepWithinCycle = 1; stepWithinCycle <= totalRemainingSteps; stepWithinCycle++) {
                currentPositionIndex = performStateTransition(currentPositionIndex, stateTransitionArray);
            }
            // After the cycle jump, the final state is determined, so exit the main loop.
            break;
        }
        // If the state is new, record the current iteration count for it.
        visitedStateIterationMap[currentPositionIndex] = currentIterationCount;
    }

    return currentPositionIndex + 1;
}

const problemSolutionOutput = solveProblem();
if (problemSolutionOutput !== undefined) {
    console.log(problemSolutionOutput);
}
