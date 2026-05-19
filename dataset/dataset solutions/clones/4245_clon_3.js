"use strict";
const STD_IN_PATH = "/dev/stdin";
const fileContent = require("fs").readFileSync(STD_IN_PATH, "utf8");
const tokenArray = fileContent.split(/ |\n/);
let currentTokenIdx = 0;

function readNextInt() { return +tokenArray[currentTokenIdx++]; }
function readNextString() { return tokenArray[currentTokenIdx++]; }
function readNextBigInt() { return BigInt(tokenArray[currentTokenIdx++]); }

function readNItems(numElements, parseAsNumbers) {
    const startIndex = currentTokenIdx;
    currentTokenIdx += numElements;
    const slicedTokens = tokenArray.slice(startIndex, currentTokenIdx);
    if (parseAsNumbers) {
        return slicedTokens.map(val => +val);
    } else {
        return slicedTokens;
    }
}

function readMatrix(height, width, parseAsNumbers) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const rowStartIndex = currentTokenIdx;
        currentTokenIdx += width;
        const rowTokens = tokenArray.slice(rowStartIndex, currentTokenIdx);
        if (parseAsNumbers) {
            resultMatrix.push(rowTokens.map(val => +val));
        } else {
            resultMatrix.push(rowTokens);
        }
    }
    return resultMatrix;
}

function createDynamicArray(initialValue) {
    const args = arguments;
    let argLength = args.length;
    let arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

const programOutput = processInputAndSolve();
if (programOutput !== undefined) {
    console.log(String(programOutput));
}

function processInputAndSolve() {
    const itemCount = readNextInt();
    const inputItems = readNItems(itemCount, true);
    const valueArray = [0].concat(inputItems);

    // Helper function to encapsulate the inner loop logic
    const applyDivisorLogic = (currentDivisor, totalCount, targetArray) => {
        let currentSumForDivisor = 0;
        // Calculate sum of multiples
        for (let multipleIdx = currentDivisor; multipleIdx <= totalCount; multipleIdx += currentDivisor) {
            currentSumForDivisor += targetArray[multipleIdx];
        }

        // If sum is negative, set multiples to zero
        if (currentSumForDivisor < 0) {
            for (let multipleIdx = currentDivisor; multipleIdx <= totalCount; multipleIdx += currentDivisor) {
                targetArray[multipleIdx] = 0;
            }
        }
    };

    // Iterate from n down to 1
    for (let divisorCandidate = itemCount; divisorCandidate >= 1; divisorCandidate--) {
        applyDivisorLogic(divisorCandidate, itemCount, valueArray);
    }

    // Sum all elements in the modified array
    const finalResultSum = valueArray.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
    }, 0); // Explicit initial value for reduce

    return finalResultSum;
}
