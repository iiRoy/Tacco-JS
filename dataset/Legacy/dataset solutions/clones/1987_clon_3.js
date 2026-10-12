function computeGCDPair(firstNum, secondNum) {
    let remainderValue = firstNum % secondNum;
    return secondNum ? computeGCDPair(secondNum, remainderValue) : firstNum;
}

function calculateGCDForMultiple(...numbersToProcess) {
    const initialAccumulatorIndex = 0;
    let currentAccumulatedGCD = numbersToProcess[initialAccumulatorIndex];
    const iterationStartIndex = 1;

    for (let argIndex = iterationStartIndex; argIndex < numbersToProcess.length; argIndex++) {
        currentAccumulatedGCD = computeGCDPair(currentAccumulatedGCD, numbersToProcess[argIndex]);
    }
    return currentAccumulatedGCD;
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";

const fileContents = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

function processInputAndComputeSum(dataString) {
    const inputLines = dataString.split('\n');
    const upperLimit = Number(inputLines[0]);

    let finalSummation = 0;
    const loopInitialValue = 1;

    for (let outerLoopVar = loopInitialValue; outerLoopVar <= upperLimit; outerLoopVar++) {
        for (let middleLoopVar = loopInitialValue; middleLoopVar <= upperLimit; middleLoopVar++) {
            for (let innerLoopVar = loopInitialValue; innerLoopVar <= upperLimit; innerLoopVar++) {
                const currentTripletGCDResult = calculateGCDForMultiple(outerLoopVar, middleLoopVar, innerLoopVar);
                finalSummation += currentTripletGCDResult;
            }
        }
    }

    console.log(finalSummation);
}

processInputAndComputeSum(fileContents);
