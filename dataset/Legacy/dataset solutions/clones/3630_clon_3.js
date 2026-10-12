"use strict";
function ProcessData(rawData) {
    let dataParser = new DataStreamProcessor(rawData);
    let numElements = dataParser.readInteger();
    let modulusVal = dataParser.readInteger();
    let inputArray = dataParser.readIntegerArray(numElements);
    let remainderCounts = new Map();
    let prefixSumsMod = new Array(numElements + 1);
    prefixSumsMod[0] = 0;
    for (let i = 0; i < numElements; i++) {
        let currentSumBeforeMod = prefixSumsMod[i] + inputArray[i];
        prefixSumsMod[i + 1] = currentSumBeforeMod % modulusVal;
    }
    let resultCount = 0;
    const totalPrefixSums = prefixSumsMod.length;
    for (let i = 0; i < totalPrefixSums; i++) {
        let currentPrefixSumValue = prefixSumsMod[i];
        let currentCount = remainderCounts.get(currentPrefixSumValue) || 0;
        resultCount += currentCount;
        remainderCounts.set(currentPrefixSumValue, currentCount + 1);
    }
    console.log(resultCount);
}
class DataStreamProcessor {
    constructor (inputString) {
        this.currentIndex = 0;
        this.dataTokens = inputString.split(/\n|\s/);
    }
    readInteger() {
        return Number(this.dataTokens[this.currentIndex++]);
    }
    readIntegerArray(count) {
        return this._populateArray(count, this.readInteger);
    }
    readString() {
        return this.dataTokens[this.currentIndex++];
    }
    readStringArray(count) {
        return this._populateArray(count, this.readString);
    }
    _populateArray(size, itemReader) {
        let newArray = new Array(size);
        for (let idx = 0; idx < size; idx++) {
            newArray[idx] = itemReader.call(this);
        }
        return newArray;
    }
}
if (typeof window == "undefined") {
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
