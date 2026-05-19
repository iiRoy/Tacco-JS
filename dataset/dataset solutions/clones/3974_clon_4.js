"use strict";
function findInsertionPoint(dataArr, targetVal, lowIdx = 0, highIdx = dataArr.length - 1) {
    if (lowIdx > highIdx) {
        return lowIdx;
    }
    const midIdx = Math.floor((lowIdx + highIdx) / 2);
    if (targetVal <= dataArr[midIdx]) {
        return findInsertionPoint(dataArr, targetVal, lowIdx, midIdx - 1);
    } else {
        return findInsertionPoint(dataArr, targetVal, midIdx + 1, highIdx);
    }
}

function processInputData(inputContent) {
    const dataReader = new DataStreamParser(inputContent);
    const numElements = dataReader.getInteger();
    const initialA = dataReader.getIntegerCollection(numElements);
    const initialB = dataReader.getIntegerCollection(numElements);

    const finalResult = Array.from({ length: 30 }).reduce((currentAnswer, _, bitPosition) => {
        const bitMask = (1 << (bitPosition + 1)) - 1;
        const firstArraySubset = initialA.map(val => val & bitMask);
        const secondArraySubset = initialB.map(val => val & bitMask).sort((x, y) => x - y);

        const powerOfTwo = 1 << bitPosition;

        const paritySum = firstArraySubset.reduce((currentParity, currentAVal) => {
            const startRange1 = findInsertionPoint(secondArraySubset, 1 * powerOfTwo - currentAVal);
            const endRange1 = findInsertionPoint(secondArraySubset, 2 * powerOfTwo - currentAVal);
            const startRange2 = findInsertionPoint(secondArraySubset, 3 * powerOfTwo - currentAVal);
            const endRange2 = findInsertionPoint(secondArraySubset, 4 * powerOfTwo - currentAVal);

            const diff1 = endRange1 - startRange1;
            const diff2 = endRange2 - startRange2;

            return (currentParity + diff1 + diff2) & 1;
        }, 0);

        if (paritySum === 1) {
            return currentAnswer | (1 << bitPosition);
        }
        return currentAnswer;
    }, 0);

    console.log(finalResult);
}

class DataStreamParser {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') throw new Error('Input source text cannot be omitted!');
        this.tokenIterator = sourceText.split(/\n|\s/)[Symbol.iterator]();
    }

    getInteger() {
        let currentToken;
        do {
            currentToken = this.tokenIterator.next().value;
        } while (currentToken === '');
        return currentToken - 0;
    }

    getIntegerCollection(count) {
        if (typeof count === 'undefined' || count < 1) throw new Error('Collection count must be a positive integer!');
        return Array.from({ length: count }, () => this.getInteger());
    }

    getString() {
        let currentToken;
        do {
            currentToken = this.tokenIterator.next().value;
        } while (currentToken === '');
        return currentToken;
    }

    getStringCollection(count) {
        if (typeof count === 'undefined' || count < 1) throw new Error('Collection count must be a positive integer!');
        return Array.from({ length: count }, () => this.getString());
    }
}

if (typeof window === "undefined") processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
