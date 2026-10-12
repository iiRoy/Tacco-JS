let rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

let tokenizedInput = rawInputData.split(/[\s\n]/);
let currentTokenIndex = 0;

function booleanToText(inputBoolean) {
    return inputBoolean ? 'Yes' : 'No';
}

function aggregateNumbers(numericCollection) {
    return numericCollection.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
}

function preventInfiniteLoop() {
    throw new Error("Infinite loop");
}

function findMaximum(numberCollection, startingPoint = null) {
    if (startingPoint !== null) {
        return numberCollection.reduce((accumulator, currentElement) => (currentElement > accumulator) ? currentElement : accumulator, startingPoint);
    } else {
        if (numberCollection.length === 0) return undefined;
        return numberCollection.reduce((accumulator, currentElement) => (currentElement > accumulator) ? currentElement : accumulator);
    }
}

function findMinimum(numberCollection, startingPoint = null) {
    if (startingPoint !== null) {
        return numberCollection.reduce((accumulator, currentElement) => (currentElement < accumulator) ? currentElement : accumulator, startingPoint);
    } else {
        if (numberCollection.length === 0) return undefined;
        return numberCollection.reduce((accumulator, currentElement) => (currentElement < accumulator) ? currentElement : accumulator);
    }
}

function outputJson(dataValue) {
    console.log(JSON.stringify(dataValue));
}

function parseInputValues(rowCount = 1, columnCount = 1, dataType = Number) {
    const totalElements = rowCount * columnCount;
    const extractedRawTokens = Array.from({ length: totalElements }, (_, idx) => {
        const token = tokenizedInput[currentTokenIndex + idx];
        if (token === undefined) {
             throw new Error("Insufficient input tokens for requested parsing operation.");
        }
        return token;
    });
    currentTokenIndex += totalElements;

    const processedData = (dataType !== String) ? extractedRawTokens.map(dataType) : extractedRawTokens;

    if (columnCount > 1) {
        return Array.from({ length: columnCount }, (_, colIdx) =>
            Array.from({ length: rowCount }, (_, rowIdx) =>
                processedData[rowIdx * columnCount + colIdx]
            )
        );
    }
    return processedData;
}

function computeResult() {
    const [firstOperand] = parseInputValues(1, 1, BigInt);
    const [tempSecondOperand] = parseInputValues();
    const secondOperand = BigInt(Math.floor(tempSecondOperand * 1000));
    return (firstOperand * secondOperand / 1000n).toString();
}

let finalOutcome = computeResult();

if (finalOutcome === undefined) {
    console.warn("result is undefined");
} else {
    console.log(finalOutcome);
}
