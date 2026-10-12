"use strict";
const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInput.split(/ |\n/);
let currentTokenIndex = 0;

function readNextToken(asString) {
    return asString ? inputTokens[currentTokenIndex++] : +inputTokens[currentTokenIndex++];
}

function readTokensAsArray(count, asString) {
    const slice = inputTokens.slice(currentTokenIndex, currentTokenIndex + count);
    currentTokenIndex += count;
    return asString ? slice : slice.map(val => +val);
}

function readMatrix(height, width, asString) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        const row = inputTokens.slice(currentTokenIndex, currentTokenIndex + width);
        currentTokenIndex += width;
        matrix.push(asString ? row : row.map(val => +val));
    }
    return matrix;
}

function createMultiDimArray(initialValue) {
    const args = arguments;
    const argCount = args.length;
    let evalString = `Array(args[${argCount - 1}]).fill().map(() => { return ${initialValue}; })`;
    for (let i = argCount - 2; i >= 1; i--) {
        evalString = `Array(args[${i}]).fill().map(() => ${evalString})`;
    }
    return eval(evalString);
}

const programOutput = solveProblem();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function solveProblem() {
    const negativeOutcome = "No";
    const positiveOutcome = "Yes";

    const sequenceLength = readNextToken();
    const stringSequence = Array.from({ length: sequenceLength }, () => readNextToken(true));

    const analyzedSequence = stringSequence.map(currentString => {
        const { minimumBalance, finalBalanceValue } = currentString.split('').reduce(
            (accumulator, character) => {
                const balanceChange = (character === '(' ? 1 : -1);
                const newBalance = accumulator.currentBalance + balanceChange;
                return {
                    currentBalance: newBalance,
                    minimumBalance: Math.min(accumulator.minimumBalance, newBalance)
                };
            },
            { currentBalance: 0, minimumBalance: 0 }
        );
        return { minimumBalance: minimumBalance, finalBalanceValue: finalBalanceValue };
    });

    let totalNetBalance = 0;
    let availablePositiveBalance = 0;
    const negativeOrZeroBalanceSegments = [];

    analyzedSequence.forEach(segmentInfo => {
        totalNetBalance += segmentInfo.finalBalanceValue;
        if (segmentInfo.finalBalanceValue > 0) {
            availablePositiveBalance += segmentInfo.finalBalanceValue;
        } else {
            negativeOrZeroBalanceSegments.push(segmentInfo);
        }
    });

    if (totalNetBalance !== 0) {
        return negativeOutcome;
    }

    negativeOrZeroBalanceSegments.sort((segmentA, segmentB) => segmentA.minimumBalance - segmentB.minimumBalance);

    const allSegmentsFeasible = negativeOrZeroBalanceSegments.every(segmentInfo => {
        if (-segmentInfo.minimumBalance > availablePositiveBalance) {
            return false;
        }
        availablePositiveBalance += segmentInfo.finalBalanceValue;
        return true;
    });

    if (!allSegmentsFeasible) {
        return negativeOutcome;
    }

    return positiveOutcome;
}
