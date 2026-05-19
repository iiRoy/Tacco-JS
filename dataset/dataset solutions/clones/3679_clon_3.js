const parseInteger = x => parseInt(x, 10);
const parseIntegerArray = arr => arr.map(x => parseInteger(x));
const absoluteValue = x => x > 0 ? x : -x;

function findMinimum() {
    const argsList = Array.from(arguments);
    let currentMin = argsList[0];
    for (let idx = 1; idx < argsList.length; ++idx) {
        if (argsList[idx] < currentMin) {
            currentMin = argsList[idx];
        }
    }
    return currentMin;
}

function findMaximum() {
    const argsList = Array.from(arguments);
    let currentMax = argsList[0];
    for (let idx = 1; idx < argsList.length; ++idx) {
        if (argsList[idx] > currentMax) {
            currentMax = argsList[idx];
        }
    }
    return currentMax;
}

function determineOperationSymbol(numA, numB) {
    const targetSumValue = 15;
    const targetProductValue = 15;

    const calculatedSum = numA + numB;
    const calculatedProduct = numA * numB;

    if (calculatedSum === targetSumValue) {
        return '+';
    } else if (calculatedProduct === targetProductValue) {
        return '*';
    } else {
        return 'x';
    }
}

function processInput(rawData) {
    const splitInput = rawData.split(' ');
    const firstOperand = parseInteger(splitInput[0]);
    const secondOperand = parseInteger(splitInput[1]);

    const finalSymbol = determineOperationSymbol(firstOperand, secondOperand);

    console.log(finalSymbol);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
