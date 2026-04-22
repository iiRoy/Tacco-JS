"use strict";

const acquireData = () => {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const parts = rawContent.split(/\s+/).filter(Boolean); 
    let pointer = 0;

    const fetchNum = () => Number(parts[pointer++]);
    const fetchSeq = (count) => Array.from({ length: count }, () => parts[pointer++]);

    const opCount = fetchNum();
    const initialValX = fetchNum();
    const initialValY = fetchNum();
    const initialValZ = fetchNum();
    const operationSeries = fetchSeq(opCount);

    return { opCount, initialValX, initialValY, initialValZ, operationSeries };
};

const processedInput = acquireData();
const totalOps = processedInput.opCount;
const initialQuantities = [processedInput.initialValX, processedInput.initialValY, processedInput.initialValZ];
const opSequence = processedInput.operationSeries;

const failureMessage = "No";
const successIdentifier = "Yes";

const charIdx = { 'A': 0, 'B': 1, 'C': 2 };

const performPairOp = (currentQ, idx1, idx2, char1, char2, nextForbiddenOp, nextOp, isFinal) => {
    let nextQ = [...currentQ];
    nextQ[idx1]--;
    nextQ[idx2]--;

    if (nextQ[idx1] < 0 && nextQ[idx2] < 0) {
        return { isFailure: true };
    }

    let decisionChar = '';
    if (isFinal) {
        if (nextQ[idx1] > nextQ[idx2]) {
            decisionChar = char2;
        } else {
            decisionChar = char1;
        }
    } else {
        if (nextQ[idx1] > nextQ[idx2] || (nextOp !== nextForbiddenOp && nextQ[idx1] >= 0)) {
            nextQ[idx2] += 2;
            decisionChar = char2;
        } else {
            nextQ[idx1] += 2;
            decisionChar = char1;
        }
    }
    return { nextQuantities: nextQ, choice: decisionChar, isFailure: false };
};

const processCurrentOperation = (currentQuantities, currentOpString, nextOpString, isFinalStep) => {
    switch (currentOpString) {
        case 'AB': return performPairOp(currentQuantities, charIdx['A'], charIdx['B'], 'A', 'B', 'AC', nextOpString, isFinalStep);
        case 'AC': return performPairOp(currentQuantities, charIdx['A'], charIdx['C'], 'A', 'C', 'AB', nextOpString, isFinalStep);
        case 'BC': return performPairOp(currentQuantities, charIdx['C'], charIdx['B'], 'C', 'B', 'AC', nextOpString, isFinalStep);
        default: return { isFailure: true };
    }
};

const conductSequence = (currentValues, collectedChoices, indexInSequence, fullSequence) => {
    if (indexInSequence === fullSequence.length) {
        return { outcome: true, finalChoices: collectedChoices };
    }

    const currentOp = fullSequence[indexInSequence];
    const nextOp = fullSequence[indexInSequence + 1]; 
    const isLast = indexInSequence === fullSequence.length - 1;

    const opResult = processCurrentOperation(currentValues, currentOp, nextOp, isLast);

    if (opResult.isFailure) {
        return { outcome: false };
    }

    return conductSequence(
        opResult.nextQuantities,
        [...collectedChoices, opResult.choice],
        indexInSequence + 1,
        fullSequence
    );
};

const ultimateResult = conductSequence(initialQuantities, [], 0, opSequence);

if (ultimateResult.outcome) {
    console.log(successIdentifier);
    console.log(ultimateResult.finalChoices.join("\n"));
} else {
    console.log(failureMessage);
}