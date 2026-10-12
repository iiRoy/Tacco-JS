"use strict";

function _arrayGenerator(valueExpression) {
    let functionArguments = arguments;
    let argumentCount = functionArguments.length;
    let currentArgumentIndex = argumentCount - 1;
    let generatedString = `Array(functionArguments[${currentArgumentIndex}]).fill(0).map(element => { return ${valueExpression}; })`;

    while (--currentArgumentIndex > 0) {
        generatedString = `Array(functionArguments[${currentArgumentIndex}]).fill(0).map(element => ${generatedString})`;
    }
    return eval(generatedString);
}

const colorMap = { R: "B", B: "R" };

const inputReader = require("readline").createInterface(process.stdin, process.stdout);

function queryAndGetResponse(queryValues, responseCallback) {
    console.log("?", queryValues.join(" "));
    return responseCallback();
}

const mainProcess = (function* () {
    const readLineAsync = () => inputReader.once("line", s => mainProcess.next(s));

    let resultColors = [];
    let sizeNInput = yield readLineAsync();
    let sizeN = parseInt(sizeNInput, 10);

    const doubleN = 2 * sizeN;

    let queryArray = Array.from({ length: sizeN }, (_, index) => index + 1);

    const initialResponse = yield queryAndGetResponse(queryArray, readLineAsync);

    let lowerBound = 1;
    let upperBound = sizeN + 1;
    let pivotValue;

    while (upperBound - lowerBound > 1) {
        pivotValue = Math.floor((upperBound + lowerBound + 1) / 2);

        for (let i = 0; i < sizeN; i++) {
            queryArray[i] = pivotValue + i;
        }

        const currentResponse = yield queryAndGetResponse(queryArray, readLineAsync);

        if (initialResponse[0] !== currentResponse[0]) {
            upperBound = pivotValue;
        } else {
            lowerBound = pivotValue;
        }
    }

    pivotValue = upperBound;

    const firstColorPosition = pivotValue - 2;
    const secondColorPosition = pivotValue - 2 + sizeN;

    resultColors[firstColorPosition] = initialResponse[0];
    resultColors[secondColorPosition] = colorMap[initialResponse[0]];

    let shiftedQueryArray = [];
    let pValuesSet = new Set();

    for (let i = 0; i < sizeN - 1; i++) {
        const currentPValue = (pivotValue + i) % doubleN;
        queryArray[i] = currentPValue; // Can be 0
        pValuesSet.add(queryArray[i]);

        const currentQValue = (queryArray[i] + sizeN - 1) % doubleN + 1; // Will be 1 to 2N
        shiftedQueryArray[i] = currentQValue;
    }

    const resolveSingleColor = function*(targetIndex, baseQueryArr) {
        let tempQueryArr = [...baseQueryArr];
        tempQueryArr[sizeN - 1] = targetIndex;
        const response = yield queryAndGetResponse(tempQueryArr, readLineAsync);
        return response[0];
    };

    for (let i = 1; i <= doubleN; i++) {
        if (resultColors[i - 1]) {
            continue;
        }

        let determinedColor;
        if (pValuesSet.has(i)) {
            determinedColor = yield* resolveSingleColor(i, shiftedQueryArray);
        } else {
            determinedColor = yield* resolveSingleColor(i, queryArray);
        }
        resultColors[i - 1] = determinedColor;
    }

    console.log("!", resultColors.join(""));
})();

mainProcess.next();
