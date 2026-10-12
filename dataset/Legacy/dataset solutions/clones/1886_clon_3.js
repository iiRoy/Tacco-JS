"use strict";
const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
let inputTokens = rawInputData.split(/ |\n/);
let tokenPointer = 0;

const getNextToken = (asString = false) => {
    const tokenValue = inputTokens[tokenPointer++];
    return asString ? tokenValue : Number(tokenValue);
};

const getMultipleTokens = (count, asString = false) => {
    const tokensSlice = inputTokens.slice(tokenPointer, tokenPointer + count);
    tokenPointer += count;
    return asString ? tokensSlice : tokensSlice.map(Number);
};

const getMatrixTokens = (rows, cols, asString = false) => {
    const resultMatrix = [];
    for (let r = 0; r < rows; r++) {
        const rowTokens = inputTokens.slice(tokenPointer, tokenPointer + cols);
        tokenPointer += cols;
        resultMatrix.push(asString ? rowTokens : rowTokens.map(Number));
    }
    return resultMatrix;
};

const createDynamicArray = (initialValue, ...dimensions) => {
    let arrayConstructionString = `Array(dimensions[${dimensions.length - 1}]).fill().map(() => (${initialValue}))`;
    for (let i = dimensions.length - 2; i >= 0; i--) {
        arrayConstructionString = `Array(dimensions[${i}]).fill().map(() => ${arrayConstructionString})`;
    }
    return eval(arrayConstructionString);
};

const programResult = solveProblem();
if (programResult !== undefined) {
    console.log(programResult);
}

function solveProblem() {
    const NO_RESPONSE = "No";
    const YES_RESPONSE = "Yes";

    const sequenceCount = getNextToken();
    let positiveEndSequences = []; // Corresponds to 'ud' in original, sequences that start negative and end positive
    let negativeEndSequences = []; // Corresponds to 'up' in original, sequences that start negative and end negative or zero
    let totalBalanceSum = 0;
    let currentAccumulatedBalance = 0; // Corresponds to 'rest' in original, balance from sequences starting non-negative

    const analyzeParenthesisSequence = (sequenceString) => {
        let minBalanceEncountered = 0;
        let currentSequenceBalance = 0;
        for (let charIndex = 0; charIndex < sequenceString.length; charIndex++) {
            if (sequenceString[charIndex] === "(") {
                currentSequenceBalance++;
            } else {
                currentSequenceBalance--;
                if (currentSequenceBalance < minBalanceEncountered) {
                    minBalanceEncountered = currentSequenceBalance;
                }
            }
        }
        return { min: minBalanceEncountered, final: currentSequenceBalance };
    };

    for (let i = 0; i < sequenceCount; i++) {
        const currentSequence = getNextToken(true);
        const { min: seqMinBalance, final: seqFinalBalance } = analyzeParenthesisSequence(currentSequence);

        totalBalanceSum += seqFinalBalance;

        if (seqMinBalance >= 0) {
            // Sequence never goes negative, can be processed immediately
            currentAccumulatedBalance += seqFinalBalance;
        } else if (seqFinalBalance <= 0) {
            // Sequence starts negative and ends negative or zero
            // Stored as [-min_balance + final_balance, final_balance]
            negativeEndSequences.push([-seqMinBalance + seqFinalBalance, seqFinalBalance]);
        } else {
            // Sequence starts negative and ends positive
            // Stored as [-min_balance, final_balance]
            positiveEndSequences.push([-seqMinBalance, seqFinalBalance]);
        }
    }

    if (totalBalanceSum !== 0) {
        return NO_RESPONSE;
    }

    // Process positive-ending sequences first
    // Sort by the required minimum balance (first element) in ascending order
    positiveEndSequences.sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < positiveEndSequences.length; i++) {
        const [requiredBalance, balanceChange] = positiveEndSequences[i];
        if (requiredBalance > currentAccumulatedBalance) {
            return NO_RESPONSE;
        }
        currentAccumulatedBalance += balanceChange;
    }

    // Process negative-ending sequences next
    // Sort by the required minimum balance (first element) in descending order
    negativeEndSequences.sort((a, b) => b[0] - a[0]);

    for (let i = 0; i < negativeEndSequences.length; i++) {
        const [requiredBalance, balanceChange] = negativeEndSequences[i];
        if (requiredBalance > currentAccumulatedBalance) {
            return NO_RESPONSE;
        }
        currentAccumulatedBalance += balanceChange;
    }

    return YES_RESPONSE;
}
