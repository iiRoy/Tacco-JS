const InputParserFactory = (function () {
    const parseNumericValue = (str) => Number(str);

    class InputDataParser {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readNextValue(asString = false) {
            let currentLineSegment = this._sourceLines[this._currentLineIndex];

            if (typeof currentLineSegment === "string") {
                currentLineSegment = currentLineSegment.split(" ").reverse();
                this._sourceLines[this._currentLineIndex] = currentLineSegment;
            }

            const extractedValue = currentLineSegment.pop();

            if (currentLineSegment.length === 0) {
                this._currentLineIndex++;
            }

            return asString ? extractedValue : parseNumericValue(extractedValue);
        }

        readLineValues(asString = false) {
            const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
            return asString ? lineContent : lineContent.map(parseNumericValue);
        }

        readMatrix(numRows, asString = false) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                                .map(line => line.split(" "));
            return asString ? matrixRows : matrixRows.map(row => row.map(parseNumericValue));
        }

        readRows(numRows, asString = false) {
            const rowsContent = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
            return asString ? rowsContent : rowsContent.map(parseNumericValue);
        }
    }

    return function createParserInstance(sourceString) {
        return new InputDataParser(sourceString);
    };
})();

const inputReaderInstance = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimensionalArray(initialValue) {
    const args = arguments;
    let argLength = args.length;
    let arrayCreationString = `Array(args[${--argLength}]).fill(0).map(x=>{return ${initialValue};})`;
    while (--argLength) {
        arrayCreationString = `Array(args[${argLength}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

const MODULUS_CONSTANT = 998244353;

function performModularMultiplication() {
    const operands = arguments;
    let resultAccumulator = operands[0];
    for (let operandIndex = 1; operandIndex < operands.length; operandIndex++) {
        const currentOperand = operands[operandIndex];
        resultAccumulator = ((resultAccumulator >> 16) * currentOperand % MODULUS_CONSTANT * 65536 + (resultAccumulator & 65535) * currentOperand) % MODULUS_CONSTANT;
    }
    return resultAccumulator;
}

function calculateModularPower(base, exponent) {
    let powerResult = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
        if (currentExponent & 1) {
            powerResult = performModularMultiplication(currentBase, powerResult);
        }
        currentBase = performModularMultiplication(currentBase, currentBase);
        currentExponent >>= 1;
    }
    return powerResult;
}

function updateDPStateWithDoubleAndSingle(currentDPState, elementValue, modulus) {
    const nextDPStateLength = currentDPState.length + elementValue;
    const nextDPState = new Array(nextDPStateLength).fill(0);

    for (let sumIndex = 0; sumIndex < currentDPState.length; sumIndex++) {
        const waysToReachCurrentSum = currentDPState[sumIndex];

        nextDPState[sumIndex] = (nextDPState[sumIndex] + waysToReachCurrentSum * 2) % modulus;

        const newSumIndex = sumIndex + elementValue;
        if (newSumIndex < nextDPStateLength) {
            nextDPState[newSumIndex] = (nextDPState[newSumIndex] + waysToReachCurrentSum) % modulus;
        }
    }
    return nextDPState;
}

function updateDPStateSimple(currentDPState, elementValue, modulus) {
    const nextDPStateLength = currentDPState.length + elementValue;
    const nextDPState = new Array(nextDPStateLength).fill(0);

    for (let sumIndex = 0; sumIndex < currentDPState.length; sumIndex++) {
        const waysToReachCurrentSum = currentDPState[sumIndex];

        nextDPState[sumIndex] = (nextDPState[sumIndex] + waysToReachCurrentSum) % modulus;

        const newSumIndex = sumIndex + elementValue;
        if (newSumIndex < nextDPStateLength) {
            nextDPState[newSumIndex] = (nextDPState[newSumIndex] + waysToReachCurrentSum) % modulus;
        }
    }
    return nextDPState;
}

function computeSubsetSumWays(elementsArray, countValue, targetSumValue) {
    let currentDPState = [1];

    for (let i = 0; i < countValue; i++) {
        currentDPState = updateDPStateSimple(currentDPState, elementsArray[i], MODULUS_CONSTANT);
    }

    const waysForTarget = currentDPState[targetSumValue] || 0;
    return (waysForTarget * 3) % MODULUS_CONSTANT;
}

function executeProblemSolution() {
    const elementCount = inputReaderInstance.readNextValue();
    const dataElements = inputReaderInstance.readRows(elementCount).sort((a, b) => a - b);
    const totalSum = dataElements.reduce((acc, val) => acc + val, 0);

    let dynamicProgState = [1];

    for (let i = 0; i < elementCount; i++) {
        dynamicProgState = updateDPStateWithDoubleAndSingle(dynamicProgState, dataElements[i], MODULUS_CONSTANT);
    }

    let finalAnswer = calculateModularPower(3, elementCount);

    if (totalSum % 2 === 0) {
        const waysToHalfSum = computeSubsetSumWays(dataElements, elementCount, totalSum / 2);
        finalAnswer = (finalAnswer + waysToHalfSum) % MODULUS_CONSTANT;
    }

    const halfSumCeiling = Math.floor((totalSum + 1) / 2);

    for (let sumIdx = halfSumCeiling; sumIdx < dynamicProgState.length; sumIdx++) {
        const waysForThisSum = dynamicProgState[sumIdx];
        const subtractionTerm = (waysForThisSum * 3) % MODULUS_CONSTANT;
        finalAnswer = (finalAnswer - subtractionTerm + MODULUS_CONSTANT) % MODULUS_CONSTANT;
    }

    return (finalAnswer + MODULUS_CONSTANT) % MODULUS_CONSTANT;
}

console.log(executeProblemSolution());
