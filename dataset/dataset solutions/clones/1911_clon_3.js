const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const initialParamsStr = inputDataLines[0].split(' ');
const [_, N_str, A_str, B_str, C_str] = initialParamsStr;
const numIterations = +N_str;
let countA = +A_str;
let countB = +B_str;
let countC = +C_str;

const operationSequence = [];
for (let i = 0; i < numIterations; i++) {
    operationSequence.push(inputDataLines[i + 1]);
}

let solutionPossible = true;
const outputOperations = [];

function processOperationStep(currentOpType, nextOpType, currentA, currentB, currentC, outputList) {
    let chosenChar = '';
    let stepSuccess = true;

    if (currentOpType === 'AB') {
        if (currentA === 0 && currentB === 0) {
            stepSuccess = false;
        } else if (currentA === 0) {
            currentA++; currentB--; chosenChar = 'A';
        } else if (currentB === 0) {
            currentA--; currentB++; chosenChar = 'B';
        } else if (nextOpType === 'AC' && currentA === 1) {
            currentA++; currentB--; chosenChar = 'A';
        } else if (nextOpType === 'BC' && currentB === 1) {
            currentA--; currentB++; chosenChar = 'B';
        } else {
            currentA++; currentB--; chosenChar = 'A';
        }
    } else if (currentOpType === 'AC') {
        if (currentA === 0 && currentC === 0) {
            stepSuccess = false;
        } else if (currentA === 0) {
            currentA++; currentC--; chosenChar = 'A';
        } else if (currentC === 0) {
            currentA--; currentC++; chosenChar = 'C';
        } else if (nextOpType === 'AB' && currentA === 1) {
            currentA++; currentC--; chosenChar = 'A';
        } else if (nextOpType === 'BC' && currentC === 1) {
            currentA--; currentC++; chosenChar = 'C';
        } else {
            currentA++; currentC--; chosenChar = 'A';
        }
    } else { // currentOpType === 'BC'
        if (currentB === 0 && currentC === 0) {
            stepSuccess = false;
        } else if (currentB === 0) {
            currentB++; currentC--; chosenChar = 'B';
        } else if (currentC === 0) {
            currentB--; currentC++; chosenChar = 'C';
        } else if (nextOpType === 'AB' && currentB === 1) {
            currentB++; currentC--; chosenChar = 'B';
        } else if (nextOpType === 'AC' && currentC === 1) {
            currentB--; currentC++; chosenChar = 'C';
        } else {
            currentB++; currentC--; chosenChar = 'B';
        }
    }

    if (stepSuccess) {
        outputList.push(chosenChar);
    }
    return { newA: currentA, newB: currentB, newC: currentC, success: stepSuccess };
}

for (let i = 0; i < numIterations - 1; i++) {
    const currentOperationType = operationSequence[i];
    const nextOperationType = operationSequence[i + 1];

    const stepResult = processOperationStep(
        currentOperationType,
        nextOperationType,
        countA,
        countB,
        countC,
        outputOperations
    );

    countA = stepResult.newA;
    countB = stepResult.newB;
    countC = stepResult.newC;
    solutionPossible = stepResult.success;

    if (!solutionPossible) {
        break;
    }
}

function handleFinalOperation(opType, currentA, currentB, currentC, outputList) {
    let finalPossible = true;
    let finalChosenChar = '';

    if (opType === 'AB') {
        if (currentA < currentB) {
            finalChosenChar = 'A';
        } else if (currentA === currentB && currentA === 0) {
            finalPossible = false;
        } else {
            finalChosenChar = 'B';
        }
    } else if (opType === 'BC') {
        if (currentC < currentB) {
            finalChosenChar = 'C';
        } else if (currentC === currentB && currentC === 0) {
            finalPossible = false;
        } else {
            finalChosenChar = 'B';
        }
    } else { // opType === 'AC'
        if (currentC < currentA) {
            finalChosenChar = 'C';
        } else if (currentC === currentA && currentC === 0) {
            finalPossible = false;
        } else {
            finalChosenChar = 'A';
        }
    }

    if (finalPossible) {
        outputList.push(finalChosenChar);
    }
    return finalPossible;
}

if (solutionPossible) {
    const lastOperationType = operationSequence[numIterations - 1];
    solutionPossible = handleFinalOperation(
        lastOperationType,
        countA,
        countB,
        countC,
        outputOperations
    );
}

if (!solutionPossible) {
    console.log('No');
} else {
    console.log('Yes');
    outputOperations.forEach(op => console.log(op));
}
