"use strict";
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenizedInput = rawData.split(/ |\n/);
let tokenIndex = 0;

function getNextNum() { return +tokenizedInput[tokenIndex++]; }
function getNextStr() { return tokenizedInput[tokenIndex++]; }
function getNextBigInt() { return BigInt(tokenizedInput[tokenIndex++]); }
function getNumsSlice(count, mapToNum) {
    const slice = tokenizedInput.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return mapToNum ? slice : slice.map(val => +val);
}
function getMatrix(height, width, mapToNum) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowSlice = tokenizedInput.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        resultMatrix.push(mapToNum ? rowSlice : rowSlice.map(val => +val));
    }
    return resultMatrix;
}
// This function's behavior relies on 'arguments' and 'eval', so it's kept as a standalone utility.
function createMultiDimArray(initialValue) {
    const args = arguments;
    let lastDimIndex = args.length - 1;
    let arrayCreationString = `Array(args[${lastDimIndex}]).fill().map(x=>{return ${initialValue};})`;
    while (--lastDimIndex) {
        arrayCreationString = `Array(args[${lastDimIndex}]).fill().map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

// Helper function to calculate scores along a path/cycle starting from a given index
function calculateScoresForSinglePath(
    startNodeIndex,
    maximumStepsAllowed,
    nodePermutationArray,
    nodeScoreArray,
    pathScoresBuffer // This buffer will be filled with cumulative scores
) {
    let currentPathLength = 1;
    // Ensure the buffer is clean for the current path calculation
    pathScoresBuffer.fill(0);

    let currentNodeId = nodePermutationArray[startNodeIndex];
    pathScoresBuffer[0] = nodeScoreArray[currentNodeId];

    // Traverse the cycle until maximumStepsAllowed or the cycle completes (returns to startNodeIndex)
    while (currentPathLength < maximumStepsAllowed && currentNodeId !== startNodeIndex) {
        currentNodeId = nodePermutationArray[currentNodeId];
        pathScoresBuffer[currentPathLength] = pathScoresBuffer[currentPathLength - 1] + nodeScoreArray[currentNodeId];
        currentPathLength++;
    }
    return currentPathLength; // Returns the number of steps taken to form the path/cycle
}

function calculateMaxScore() {
    const numElements = getNextNum();
    const maxSteps = getNextNum();
    const permutationArr = getNumsSlice(numElements).map(val => val - 1);
    const scoreArr = getNumsSlice(numElements);

    let maxOverallScore = BigInt(-2e18); // Initialize with a very small BigInt value
    const currentPathScoresBuffer = new Array(numElements); // Reused buffer for path scores

    for (let startIndex = 0; startIndex < numElements; startIndex++) {
        const actualPathLength = calculateScoresForSinglePath(
            startIndex,
            maxSteps,
            permutationArr,
            scoreArr,
            currentPathScoresBuffer
        );

        // The total score accumulated over one full cycle (or path up to actualPathLength)
        const totalScoreInCycle = currentPathScoresBuffer[actualPathLength - 1];

        if (totalScoreInCycle > 0) {
            // If the cycle yields positive score, we can repeat it
            for (let pathStep = 0; pathStep < actualPathLength; pathStep++) {
                const stepsRemainingAfterInitialPath = maxSteps - pathStep - 1;
                
                // Calculate how many full cycles can be completed with remaining steps
                const numberOfFullCycles = BigInt(Math.floor(stepsRemainingAfterInitialPath / actualPathLength));
                
                // Calculate score from repeating full cycles
                const scoreFromRepeatingCycles = numberOfFullCycles * BigInt(totalScoreInCycle);
                
                // Total score for this path configuration
                const currentScoreCandidate = BigInt(currentPathScoresBuffer[pathStep]) + scoreFromRepeatingCycles;

                if (maxOverallScore < currentScoreCandidate) {
                    maxOverallScore = currentScoreCandidate;
                }
            }
        } else {
            // If the cycle yields zero or negative score, we only consider the path without repeating cycles
            for (let pathStep = 0; pathStep < actualPathLength; pathStep++) {
                const currentScoreCandidate = BigInt(currentPathScoresBuffer[pathStep]);
                if (maxOverallScore < currentScoreCandidate) {
                    maxOverallScore = currentScoreCandidate;
                }
            }
        }
    }
    return maxOverallScore;
}

const finalResult = calculateMaxScore();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}
