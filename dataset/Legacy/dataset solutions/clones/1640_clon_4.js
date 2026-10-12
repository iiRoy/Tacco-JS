"use strict";
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

function* createTokenGenerator(inputString) {
    const tokens = inputString.split(/ |\n/);
    for (const token of tokens) {
        yield token;
    }
}

const tokenGenerator = createTokenGenerator(rawInputData);

function readNumber() {
    return Number(tokenGenerator.next().value);
}

function readString() {
    return tokenGenerator.next().value;
}

function readBigInt() {
    return BigInt(tokenGenerator.next().value);
}

function readNumbersArray(count, asStrings = false) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(asStrings ? readString() : readNumber());
    }
    return result;
}

function readMatrix(height, width, asStrings = false) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        matrix.push(readNumbersArray(width, asStrings));
    }
    return matrix;
}

class FenwickTree {
    constructor(size) {
        this.treeArray = Array(size + 1).fill(0);
    }

    updateValue(value, index) {
        for (let i = index; i < this.treeArray.length; i += i & -i) {
            this.treeArray[i] += value;
        }
    }

    queryPrefixSum(index) {
        let sum = 0;
        for (let i = index; i > 0; i -= i & -i) {
            sum += this.treeArray[i];
        }
        return sum;
    }
}

const finalResult = processQueries();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

function processQueries() {
    const elementCount = readNumber();
    const queryCount = readNumber();
    const colorSequence = readNumbersArray(elementCount);

    for (let i = 0; i < elementCount; i++) {
        colorSequence[i]--;
    }

    const queryList = [];
    for (let i = 0; i < queryCount; i++) {
        queryList.push({
            queryLeft: readNumber(),
            queryRight: readNumber(),
            originalQueryIndex: i
        });
    }

    queryList.sort((a, b) => a.queryRight - b.queryRight);

    const queryResults = Array(queryCount);
    const lastPositionOfColor = new Map();
    const distinctCounter = new FenwickTree(elementCount);

    let currentElementSequenceIndex = 0;

    for (const currentQuery of queryList) {
        const { queryLeft, queryRight, originalQueryIndex } = currentQuery;

        while (currentElementSequenceIndex < elementCount && (currentElementSequenceIndex + 1) <= queryRight) {
            const colorValue = colorSequence[currentElementSequenceIndex];
            const current1BasedIndex = currentElementSequenceIndex + 1;

            if (lastPositionOfColor.has(colorValue)) {
                distinctCounter.updateValue(-1, lastPositionOfColor.get(colorValue));
            }
            distinctCounter.updateValue(1, current1BasedIndex);
            lastPositionOfColor.set(colorValue, current1BasedIndex);

            currentElementSequenceIndex++;
        }

        queryResults[originalQueryIndex] = distinctCounter.queryPrefixSum(queryRight) - distinctCounter.queryPrefixSum(queryLeft - 1);
    }

    return queryResults.join("\n");
}
