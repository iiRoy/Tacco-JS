const getRawInputContent = () => {
    const fileDescriptor = require('process').stdin.fd;
    const fileStats = require('fs').fstatSync(fileDescriptor);
    const dataBuffer = Buffer.alloc(fileStats.size);
    require('fs').readSync(fileDescriptor, dataBuffer, 0, fileStats.size, 0);
    return dataBuffer.toString('utf8').trim();
};

const parseInputLines = (rawTextContent) => {
    return rawTextContent.split('\n').map(lineContent => lineContent.split(' ').map(Number));
};

const operatorSymbols = ['+', '-', '*'];
const desiredResult = 10;

const generatePermutationsOfIndices = (sourceArrayLength) => {
    const allPerms = [];
    const recursePermute = (currentPerm, remainingIndices) => {
        if (remainingIndices.length === 0) {
            allPerms.push(currentPerm);
            return;
        }
        for (let i = 0; i < remainingIndices.length; i++) {
            const nextIndex = remainingIndices[i];
            const newRemaining = remainingIndices.slice(0, i).concat(remainingIndices.slice(i + 1));
            recursePermute(currentPerm.concat(nextIndex), newRemaining);
        }
    };
    recursePermute([], Array.from({ length: sourceArrayLength }, (_, i) => i));
    return allPerms;
};

const allNumberIndexPermutations = generatePermutationsOfIndices(4);

const generateOperatorTriplets = () => {
    const triplets = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                triplets.push([operatorSymbols[i], operatorSymbols[j], operatorSymbols[k]]);
            }
        }
    }
    return triplets;
};

const allOperatorCombinations = generateOperatorTriplets();

const constructRpnPatternA = (val1, val2, val3, val4, opA, opB, opC) => [val1, val2, opA, val3, opB, val4, opC];
const constructRpnPatternB = (val1, val2, val3, val4, opA, opB, opC) => [val1, val2, val3, opA, opB, val4, opC];
const constructRpnPatternC = (val1, val2, val3, val4, opA, opB, opC) => [val1, val2, opA, val3, val4, opB, opC];

const rpnConstructors = [constructRpnPatternA, constructRpnPatternB, constructRpnPatternC];

const performRpnEvaluation = (rpnTokens) => {
    const evaluationStack = rpnTokens.reduce((accumulator, currentToken) => {
        if (typeof currentToken === 'number') {
            accumulator.push(currentToken);
        } else {
            const rightOperand = accumulator.pop();
            const leftOperand = accumulator.pop();
            switch (currentToken) {
                case '+': accumulator.push(leftOperand + rightOperand); break;
                case '-': accumulator.push(leftOperand - rightOperand); break;
                case '*': accumulator.push(leftOperand * rightOperand); break;
            }
        }
        return accumulator;
    }, []);
    return evaluationStack.pop();
};

const generateInfixString = (rpnTokens) => {
    const stringStack = rpnTokens.reduce((accumulator, currentToken) => {
        if (typeof currentToken === 'number') {
            accumulator.push(String(currentToken));
        } else {
            const rightExpr = accumulator.pop();
            const leftExpr = accumulator.pop();
            accumulator.push(`(${leftExpr} ${currentToken} ${rightExpr})`);
        }
        return accumulator;
    }, []);
    return stringStack.pop();
};

const findSolutionForNumbers = (currentNumbers) => {
    if (currentNumbers.every(num => num === 0)) {
        return null;
    }

    for (const indexPerm of allNumberIndexPermutations) {
        const [numA, numB, numC, numD] = indexPerm.map(idx => currentNumbers[idx]);

        for (const opsTuple of allOperatorCombinations) {
            const [opX, opY, opZ] = opsTuple;

            if (opX === '-' && opY === '-' && opZ === '-') {
                continue;
            }

            for (const rpnBuilder of rpnConstructors) {
                const rpnExpression = rpnBuilder(numA, numB, numC, numD, opX, opY, opZ);
                const computedResult = performRpnEvaluation(rpnExpression);

                if (computedResult === desiredResult) {
                    return generateInfixString(rpnExpression);
                }
            }
        }
    }
    return '0';
};

const allInputLines = parseInputLines(getRawInputContent());

for (const currentLineNumbers of allInputLines) {
    const lineResult = findSolutionForNumbers(currentLineNumbers);
    if (lineResult === null) {
        break;
    }
    console.log(lineResult);
}
