"use strict";
function ProcessInput(rawData) {
    let dataParser = new DataStreamReader(rawData);
    let countElements = dataParser.getInt();
    let elementList = dataParser.getIntArray(countElements);

    elementList.sort((valA, valB) => valB - valA);
    elementList.push(0);

    let largestElement = elementList[0];
    let halfLargest = Math.floor(largestElement / 2);

    let finalCandidateOne = 0;
    let finalCandidateTwo = 0;

    for (let currentIdx = 1; currentIdx < countElements; currentIdx++) {
        if (elementList[currentIdx] >= halfLargest) {
            finalCandidateOne = elementList[currentIdx];
            finalCandidateTwo = elementList[currentIdx + 1];
        }
    }

    const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

    let chosenCandidate;
    if (calculateAbsoluteDifference(halfLargest, finalCandidateOne) <= calculateAbsoluteDifference(halfLargest, finalCandidateTwo)) {
        chosenCandidate = finalCandidateOne;
    } else {
        chosenCandidate = finalCandidateTwo;
    }

    console.log(`${largestElement} ${chosenCandidate}`);
}

class DataStreamReader {
    constructor(sourceData) {
        if (typeof sourceData === 'undefined') {
            throw new Error('引数（stdin）を省略できません！');
        }
        this.readIndex = 0;
        this.parsedTokens = sourceData.split(/\n|\s/);
    }

    _getNextToken() {
        return this.parsedTokens[this.readIndex++];
    }

    getInt() {
        return parseInt(this._getNextToken(), 10);
    }

    getIntArray(numItems) {
        if (typeof numItems === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(numItems);
        for (let loopCounter = 0; loopCounter < numItems; loopCounter++) {
            resultArray[loopCounter] = this.getInt();
        }
        return resultArray;
    }

    getStr() {
        return this._getNextToken();
    }

    getStrArray(numItems) {
        if (typeof numItems === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let resultArray = new Array(numItems);
        for (let loopCounter = 0; loopCounter < numItems; loopCounter++) {
            resultArray[loopCounter] = this.getStr();
        }
        return resultArray;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
