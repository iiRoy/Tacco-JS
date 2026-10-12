"use strict";

function ProcessInput(sourceText) {
    let dataReader = new DataStreamProcessor(sourceText);
    let countElements = dataReader.retrieveInteger();
    let inputArray = dataReader.retrieveIntegerArray(countElements);

    let resultCount = 0;

    for (let startIdx = 0; startIdx < countElements; startIdx++) {
        let currentSubarraySum = 0;
        let currentSubarrayOR = 0;
        for (let endIdx = startIdx; endIdx < countElements; endIdx++) {
            currentSubarraySum += inputArray[endIdx];
            currentSubarrayOR |= inputArray[endIdx];

            if (currentSubarraySum === currentSubarrayOR) {
                resultCount++;
            } else {
                // If the sum of elements in the subarray does not equal their bitwise OR,
                // it implies that at least one bit position is set in more than one number
                // within this subarray. Any further extension of this subarray will also
                // maintain this property (or introduce new conflicts), so we can stop
                // extending this subarray from the current startIdx.
                break;
            }
        }
    }
    console.log(resultCount);
}

class DataStreamProcessor {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.positionIndex = 0;
        this.tokenList = sourceText.split(/\n|\s/);
    }

    retrieveInteger() {
        return this.tokenList[this.positionIndex++] - 0;
    }

    retrieveIntegerArray(size) {
        if (typeof size === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let arr = new Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = this.retrieveInteger();
        }
        return arr;
    }

    retrieveString() {
        return this.tokenList[this.positionIndex++];
    }

    retrieveStringArray(size) {
        if (typeof size === 'undefined') {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let arr = new Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = this.retrieveString();
        }
        return arr;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
