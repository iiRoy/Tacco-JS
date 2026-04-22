"use strict";
let rawInputData = require('node:fs').readFileSync('/dev/fd/0', 'utf-8');
let tokenSequence = rawInputData.split(/[\s\n]+/), currentTokenIndex = 0;

function readInteger() { return Number(tokenSequence[currentTokenIndex++]); }
function readStringValue() { return tokenSequence[currentTokenIndex++]; }
function readBigIntValue() { return BigInt(tokenSequence[currentTokenIndex++]); }

function retrieveArray(itemCount, asNumbersFlag) {
    if (asNumbersFlag) {
        return tokenSequence.slice(currentTokenIndex, currentTokenIndex += itemCount).map(val => Number(val));
    } else {
        return tokenSequence.slice(currentTokenIndex, currentTokenIndex += itemCount);
    }
}

function retrieveMatrix(numRows, numCols, asNumbersFlag) {
    let resultGrid = [];
    let currentRow = 0;
    if (asNumbersFlag) {
        for (; currentRow < numRows; currentRow++) {
            resultGrid.push(tokenSequence.slice(currentTokenIndex, currentTokenIndex += numCols).map(val => Number(val)));
        }
    } else {
        for (; currentRow < numRows; currentRow++) {
            resultGrid.push(tokenSequence.slice(currentTokenIndex, currentTokenIndex += numCols));
        }
    }
    return resultGrid;
}

function initializeMultiDimensionalArray(initialValue) {
    let dimensions = arguments, dimCount = dimensions.length, arrayCreationCode;
    arrayCreationCode = `Array(dimensions[${--dimCount}]).fill().map(x => {return ${initialValue};})`;
    while (--dimCount) {
        arrayCreationCode = `Array(dimensions[${dimCount}]).fill().map(x => ${arrayCreationCode})`;
    }
    return eval(arrayCreationCode);
}

let currentModulo = 1_000_000_007;

function calculateModularProduct() {
    let operands = arguments, productResult = operands[0], opIndex = operands.length;
    while (--opIndex) {
        productResult = ( (productResult >>> 16) * operands[opIndex] % currentModulo * 65536 + (productResult & 0xFFFF) * operands[opIndex] ) % currentModulo;
    }
    return productResult;
}

let factorialsStore = [], inverseFactorials = [];

function precomputeFactorials(limitValue) {
    factorialsStore.length = limitValue + 1;
    factorialsStore[0] = factorialsStore[1] = 1;
    for (let counter = 2; counter <= limitValue;) {
        factorialsStore[counter] = calculateModularProduct(factorialsStore[counter - 1], counter++);
    }
    inverseFactorials.length = limitValue + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[limitValue] = calculateModularInverse(factorialsStore[limitValue]);
    for (let counter = limitValue; 2 < counter;) {
        inverseFactorials[counter - 1] = calculateModularProduct(inverseFactorials[counter], counter--);
    }
}

function calculateModularInverse(divisor) {
    let dividend = currentModulo, xCoefficient = 0, yCoefficient = 1, tempVar;
    for (; divisor; yCoefficient = tempVar) {
        tempVar = Math.floor(dividend / divisor);
        dividend -= tempVar * divisor;
        xCoefficient -= tempVar * yCoefficient;
        tempVar = dividend;
        dividend = divisor;
        divisor = tempVar;
        tempVar = xCoefficient;
        xCoefficient = yCoefficient;
    }
    xCoefficient %= currentModulo;
    return (xCoefficient < 0) ? (xCoefficient + currentModulo) : xCoefficient;
}

function modularExponentiation(baseVal, exponentVal) {
    let resultVal = 1;
    for (; exponentVal; baseVal = calculateModularProduct(baseVal, baseVal), exponentVal >>>= 1) {
        if (exponentVal & 1) {
            resultVal = calculateModularProduct(baseVal, resultVal);
        }
    }
    return resultVal;
}

function nChooseK(totalItems, chosenItems) {
    return calculateModularProduct(factorialsStore[totalItems], inverseFactorials[chosenItems], inverseFactorials[totalItems - chosenItems]);
}

function nPermuteK(totalItems, chosenItems) {
    return calculateModularProduct(factorialsStore[totalItems], inverseFactorials[totalItems - chosenItems]);
}

function normalizeModulo(inputNumber) {
    return ( (inputNumber % currentModulo) + currentModulo ) % currentModulo;
}

let programResult = executeMainLogic();
if (programResult !== undefined) {
    console.info(String(programResult));
}

function executeMainLogic() {
    let elementCount = readInteger();
    let firstOperand = readBigIntValue(), secondOperand = readBigIntValue();
    let xorSumOthers = 0n;
    for (let loopIndex = 2; loopIndex < elementCount; loopIndex++) {
        xorSumOthers ^= readBigIntValue();
    }

    let finalAnswer = 0n, currentXorSum = firstOperand ^ secondOperand ^ xorSumOthers;

    while (currentXorSum !== 0n) {
        if (firstOperand === 1n) {
            return -1;
        }
        for (let bitPosition = 40; bitPosition >= 0; bitPosition--) {
            let bitMask = 1n << BigInt(bitPosition);
            if ((currentXorSum & bitMask) === 0n) {
                continue;
            }

            let moveAmount;
            moveAmount = (firstOperand & (bitMask - 1n)) + 1n;
            moveAmount = findMinBigInt(moveAmount, bitMask - (secondOperand & (bitMask - 1n)));

            if (moveAmount < firstOperand) {
                finalAnswer += moveAmount;
                firstOperand -= moveAmount;
                secondOperand += moveAmount;
                break;
            } else {
                return -1;
            }
        }
        currentXorSum = firstOperand ^ secondOperand ^ xorSumOthers;
    }
    return finalAnswer;
}

function findMinBigInt(valA, valB) {
    return (valA > valB) ? valB : valA;
}