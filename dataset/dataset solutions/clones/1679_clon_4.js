class InputProcessor {
    constructor(sourceText) {
        this.dataTokens = sourceText.split(/ |\n/);
        this.tokenIndex = 0;
    }

    retrieveNumeric() {
        return Number(this.dataTokens[this.tokenIndex++]);
    }

    retrieveString() {
        return this.dataTokens[this.tokenIndex++];
    }

    retrieveBigInteger() {
        return BigInt(this.dataTokens[this.tokenIndex++]);
    }

    retrieveMultiple(count, transformation) {
        const segment = this.dataTokens.slice(this.tokenIndex, this.tokenIndex + count);
        this.tokenIndex += count;
        return transformation ? segment.map(transformation) : segment;
    }

    retrieveGrid(rows, columns, transformation) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const rowSegment = this.dataTokens.slice(this.tokenIndex, this.tokenIndex + columns);
            this.tokenIndex += columns;
            grid.push(transformation ? rowSegment.map(transformation) : rowSegment);
        }
        return grid;
    }
}

function generateMultiDimensionalArray(initialElement, ...dimensions) {
    const recursiveBuilder = (dimList) => {
        if (dimList.length === 0) return initialElement;
        const currentDimension = dimList[0];
        const remainingDimensions = dimList.slice(1);
        return Array.from({ length: currentDimension }, () => recursiveBuilder(remainingDimensions));
    };
    return recursiveBuilder(dimensions);
}

function calculateSetBitCount(numberValue) {
    if (numberValue === 0) return 0;
    return numberValue.toString(2).split('1').length - 1;
}

function computeInitialModuloValue(binarySequence, modulusDivisor) {
    return Array.from(binarySequence).reduce((accumulator, digitChar) => {
        return (accumulator * 2 + Number(digitChar)) % modulusDivisor;
    }, 0);
}

function countReductionOperations(startingValue) {
    let currentOperand = startingValue;
    let operationCount = 0;
    while (currentOperand !== 0) {
        operationCount++;
        currentOperand %= calculateSetBitCount(currentOperand);
    }
    return operationCount;
}

function processBitTypeLogic(totalBits, bitSequence, initialRemainder, currentModulus, targetBitChar, outputArray) {
    if (currentModulus < 1) return;

    let powerOfTwoModulo;
    if (targetBitChar === '0') {
        powerOfTwoModulo = 1; // Corresponds to 2^0 % modulus for the last bit (index totalBits-1)
    } else { // targetBitChar === '1'
        powerOfTwoModulo = (currentModulus - 1 + currentModulus) % currentModulus; // Corresponds to (modulus-1) % modulus for the last bit
    }

    for (let bitIndex = totalBits - 1; bitIndex >= 0; bitIndex--) {
        if (bitSequence[bitIndex] === targetBitChar) {
            let temporaryValue = (initialRemainder + powerOfTwoModulo + currentModulus) % currentModulus;
            outputArray[bitIndex] = 1 + countReductionOperations(temporaryValue);
        }
        powerOfTwoModulo = (powerOfTwoModulo * 2) % currentModulus;
    }
}

var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
var inputHandler = new InputProcessor(fileContent);

function executeSolution() {
    const totalBitsCount = inputHandler.retrieveNumeric();
    const binaryStringRepresentation = inputHandler.retrieveString();

    let modulusForZeroBits = 1 + Array.from(binaryStringRepresentation).filter(char => char === '1').length;

    const finalResultArray = generateMultiDimensionalArray(0, totalBitsCount);

    const initialRemainderForZero = computeInitialModuloValue(binaryStringRepresentation, modulusForZeroBits);
    processBitTypeLogic(totalBitsCount, binaryStringRepresentation, initialRemainderForZero, modulusForZeroBits, '0', finalResultArray);

    let modulusForOneBits = modulusForZeroBits - 2;

    if (modulusForOneBits < 1) {
        return finalResultArray.join("\n");
    }

    const initialRemainderForOne = computeInitialModuloValue(binaryStringRepresentation, modulusForOneBits);
    processBitTypeLogic(totalBitsCount, binaryStringRepresentation, initialRemainderForOne, modulusForOneBits, '1', finalResultArray);

    return finalResultArray.join("\n");
}

var programOutput = executeSolution();
if (programOutput !== undefined) console.log(String(programOutput));
