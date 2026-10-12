'use strict';

function processInputData(rawContent) {
    const numericLines = rawContent.split('\n')
                                   .filter(line => line.trim() !== '')
                                   .map(Number);

    const firstValue = numericLines[0];
    const remainingValues = numericLines.slice(1);

    return { primaryCount: firstValue, divisorCandidates: remainingValues };
}

function calculateFinalResult(primaryCount, divisorCandidates) {
    const minimumDivisor = Math.min(...divisorCandidates);
    const ceilingDivisionResult = Math.ceil(primaryCount / minimumDivisor);
    const finalAnswer = ceilingDivisionResult + 4;
    return finalAnswer;
}

function executeProgram(inputString) {
    const { primaryCount, divisorCandidates } = processInputData(inputString);
    const finalOutput = calculateFinalResult(primaryCount, divisorCandidates);
    console.log(finalOutput);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
