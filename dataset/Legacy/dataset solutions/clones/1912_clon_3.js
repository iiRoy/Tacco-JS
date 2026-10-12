"use strict";
const fileSystem = require("fs");
const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

function readNextToken(asString) {
    const currentToken = tokenStream[tokenIndex++];
    return asString ? currentToken : +currentToken;
}

function readTokens(count, asStrings) {
    const tokens = tokenStream.slice(tokenIndex, tokenIndex += count);
    return asStrings ? tokens : tokens.map(val => +val);
}

function readMatrix(height, width, asStrings) {
    const resultMatrix = [];
    let rowIdx = 0;
    if (asStrings) {
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    } else {
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
    return eval(evalString);
}

const programOutput = executeLogic();
if (programOutput !== undefined) console.log(programOutput);

function checkAndDecrement(val1, val2, failureIndicator) {
    const decrementedVal1 = val1 - 1;
    const decrementedVal2 = val2 - 1;
    if (decrementedVal1 < 0 && decrementedVal2 < 0) {
        return { status: 'fail', indicator: failureIndicator };
    }
    return { status: 'ok', val1: decrementedVal1, val2: decrementedVal2 };
}

function applyGreedyChoice(currentStr, nextStrLookahead, currentA, currentB, currentC, isLastElement) {
    let charToAppend;
    let newA = currentA;
    let newB = currentB;
    let newC = currentC;

    if (currentStr === "AB") {
        const checkResult = checkAndDecrement(currentA, currentB, "No");
        if (checkResult.status === 'fail') return { status: 'fail', indicator: checkResult.indicator };
        newA = checkResult.val1;
        newB = checkResult.val2;

        const conditionMet = (newA > newB) || (!isLastElement && nextStrLookahead !== "AC" && newA >= 0);
        if (conditionMet) {
            newB += 2;
            charToAppend = "B";
        } else {
            newA += 2;
            charToAppend = "A";
        }
    } else if (currentStr === "AC") {
        const checkResult = checkAndDecrement(currentA, currentC, "No");
        if (checkResult.status === 'fail') return { status: 'fail', indicator: checkResult.indicator };
        newA = checkResult.val1;
        newC = checkResult.val2;

        const conditionMet = (newA > newC) || (!isLastElement && nextStrLookahead !== "AB" && newA >= 0);
        if (conditionMet) {
            newC += 2;
            charToAppend = "C";
        } else {
            newA += 2;
            charToAppend = "A";
        }
    } else { // currentStr === "BC"
        const checkResult = checkAndDecrement(currentB, currentC, "No");
        if (checkResult.status === 'fail') return { status: 'fail', indicator: checkResult.indicator };
        
        let tempB = checkResult.val1; // This is the original 'b' after decrement
        let tempC = checkResult.val2; // This is the original 'c' after decrement

        const conditionMet = (tempC > tempB) || (!isLastElement && nextStrLookahead !== "AC" && tempC >= 0);
        if (conditionMet) {
            tempB += 2;
            charToAppend = "B";
        } else {
            tempC += 2;
            charToAppend = "C";
        }
        newB = tempB;
        newC = tempC;
    }
    return { status: 'ok', newA, newB, newC, charToAppend };
}

function executeLogic() {
    const [countN, countA_init, countB_init, countC_init] = readTokens(4);
    const inputStrings = readTokens(countN, true);
    const resultSequence = [];
    const noResultIndicator = "No";

    let currentA = countA_init;
    let currentB = countB_init;
    let currentC = countC_init;

    const loopLimit = countN - 1;

    for (let loopIdx = 0; loopIdx < loopLimit; loopIdx++) {
        const currentInputStr = inputStrings[loopIdx];
        const nextInputStr = inputStrings[loopIdx + 1];

        const processingResult = applyGreedyChoice(currentInputStr, nextInputStr, currentA, currentB, currentC, false);

        if (processingResult.status === 'fail') {
            return noResultIndicator;
        }
        currentA = processingResult.newA;
        currentB = processingResult.newB;
        currentC = processingResult.newC;
        resultSequence.push(processingResult.charToAppend);
    }

    const lastInputStr = inputStrings[countN - 1];
    const lastProcessingResult = applyGreedyChoice(lastInputStr, null, currentA, currentB, currentC, true);

    if (lastProcessingResult.status === 'fail') {
        return noResultIndicator;
    }
    currentA = lastProcessingResult.newA;
    currentB = lastProcessingResult.newB;
    currentC = lastProcessingResult.newC;
    resultSequence.push(lastProcessingResult.charToAppend);

    console.log("Yes");
    return resultSequence.join("\n");
}
