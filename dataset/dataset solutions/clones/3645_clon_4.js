"use strict";

const SEQUENCE_TARGET = "ABC";
const NUMERIC_LIMIT = 1000000007;
const TARGET_LEN = SEQUENCE_TARGET.length;

let memoizedSolutions;
let currentWorkingString;
let stringDataLength;

function calculateMatchings(positionInString, targetSegmentIndex) {
    if (memoizedSolutions[positionInString][targetSegmentIndex] !== null) {
        return memoizedSolutions[positionInString][targetSegmentIndex];
    }

    if (targetSegmentIndex === TARGET_LEN) {
        return 1;
    }
    if (positionInString === stringDataLength) {
        return 0;
    }

    let currentWays = 0;
    const charAtCurrentPosition = currentWorkingString[positionInString];

    currentWays = (currentWays + calculateMatchings(positionInString + 1, targetSegmentIndex) * (charAtCurrentPosition === '?' ? 3 : 1)) % NUMERIC_LIMIT;

    if (charAtCurrentPosition === '?' || charAtCurrentPosition === SEQUENCE_TARGET[targetSegmentIndex]) {
        currentWays = (currentWays + calculateMatchings(positionInString + 1, targetSegmentIndex + 1)) % NUMERIC_LIMIT;
    }

    memoizedSolutions[positionInString][targetSegmentIndex] = currentWays;
    return currentWays;
}

function processInputAndDisplay(rawInput) {
    currentWorkingString = rawInput.trim();
    stringDataLength = currentWorkingString.length;

    memoizedSolutions = new Array(stringDataLength + 1).fill(null).map(() => new Array(TARGET_LEN + 1).fill(null));

    console.log(calculateMatchings(0, 0));
}

if (typeof window === "undefined") {
    processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));
}