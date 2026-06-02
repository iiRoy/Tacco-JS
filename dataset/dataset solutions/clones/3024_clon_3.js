"use strict";

const PRIME_MODULUS = 998244353;

function ensurePositiveModulo(value) {
    let result = value % PRIME_MODULUS;
    if (result < 0) {
        result += PRIME_MODULUS;
    }
    return result;
}

function InputReader(sourceContent, valueParser){
    this.sourceLines = String(sourceContent).split("\n");
    this.currentColumnIndex = 0;
    this.currentRowIndex = 0;
    this.parserFunction = valueParser || Number;
}

InputReader.prototype.fetchNextValue = function(){
    let lineData = this.sourceLines[this.currentRowIndex];
    if(!lineData) return;

    const lineTokens = lineData.trim().split(" ");
    let extractedValue = lineTokens[this.currentColumnIndex];
    this.currentColumnIndex++;

    if(this.currentColumnIndex >= lineTokens.length){
        this.currentColumnIndex = 0;
        this.currentRowIndex++;
    }
    return this.parserFunction(extractedValue);
};

InputReader.prototype.fetchLineAsParsedValues = function(){
    let lineData = this.sourceLines[this.currentRowIndex];
    if(!lineData) return;
    this.currentColumnIndex = 0;
    this.currentRowIndex++;
    return lineData.split(" ").map(this.parserFunction);
};

function processInputAndCompute(inputDataString) {
    const dataHandler = new InputReader(inputDataString);

    const numberOfElements = dataHandler.fetchNextValue();
    const valueList = [];
    for (let elementIndex = 0; elementIndex < numberOfElements; elementIndex++) {
        let nextVal = dataHandler.fetchNextValue();
        valueList.push(nextVal);
    }

    const totalSumOfValues = valueList.reduce((acc, val) => acc + val, 0);

    let totalPossibleCombinations = 1;
    for (let k = 0; k < numberOfElements; k++) {
        totalPossibleCombinations = ensurePositiveModulo(totalPossibleCombinations * 3);
    }

    let countSumsGreaterThanOrEqualToHalf = 0;

    let dpArrayA = [1];

    for (let elementIndex = 1; elementIndex <= numberOfElements; elementIndex++) {
        const currentElementValue = valueList[elementIndex - 1];
        let dpArrayB = new Array(dpArrayA.length + currentElementValue).fill(0);

        for (let currentSumValue = 0; currentSumValue < dpArrayA.length; currentSumValue++) {
            dpArrayB[currentSumValue] = ensurePositiveModulo(dpArrayB[currentSumValue] + dpArrayA[currentSumValue] * 2);

            const nextPossibleSum = currentSumValue + currentElementValue;
            if (nextPossibleSum <= totalSumOfValues) {
                dpArrayB[nextPossibleSum] = ensurePositiveModulo(dpArrayB[nextPossibleSum] + dpArrayA[currentSumValue]);
            }
        }
        dpArrayA = dpArrayB;
    }

    const thresholdSum = Math.ceil(totalSumOfValues / 2);
    for (let s = thresholdSum; s <= totalSumOfValues; s++) {
        if (s < dpArrayA.length) {
            countSumsGreaterThanOrEqualToHalf = ensurePositiveModulo(countSumsGreaterThanOrEqualToHalf + dpArrayA[s]);
        }
    }

    let countSumsExactlyHalf = 0;
    const isTotalSumEven = (totalSumOfValues % 2 === 0);

    if (isTotalSumEven) {
        const targetHalfSum = totalSumOfValues / 2;
        let dpArrayC = [1];

        for (let elementIndex = 1; elementIndex <= numberOfElements; elementIndex++) {
            const currentElementValue = valueList[elementIndex - 1];
            let dpArrayD = new Array(dpArrayC.length + 1).fill(0);

            for (let currentSumValue = 0; currentSumValue < dpArrayC.length; currentSumValue++) {
                dpArrayD[currentSumValue] = ensurePositiveModulo(dpArrayD[currentSumValue] + dpArrayC[currentSumValue]);

                const nextPossibleSum = currentSumValue + currentElementValue;
                if (nextPossibleSum <= totalSumOfValues) {
                    // This line replicates the original code's potential out-of-bounds access
                    // if nextPossibleSum exceeds dpArrayD's allocated size.
                    dpArrayD[nextPossibleSum] = ensurePositiveModulo(dpArrayD[nextPossibleSum] + dpArrayC[currentSumValue]);
                }
            }
            dpArrayC = dpArrayD;
        }
       
        if (targetHalfSum < dpArrayC.length) {
            countSumsExactlyHalf = dpArrayC[targetHalfSum];
        }
    }

    let intermediateResult = ensurePositiveModulo(totalPossibleCombinations - ensurePositiveModulo(countSumsGreaterThanOrEqualToHalf * 3));
    let finalComputedAnswer = ensurePositiveModulo(intermediateResult + ensurePositiveModulo(countSumsExactlyHalf * 3));

    console.log(finalComputedAnswer);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
