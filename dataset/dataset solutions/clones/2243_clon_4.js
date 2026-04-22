"use strict";
const acquireNumbers = (textualInput) => {
    const numericFragments = textualInput.trim().split(/\s+/).map(Number);
    let currentPosition = 0;
    return {
        pull: () => numericFragments[currentPosition++]
    };
};

const makeNestedList = (initialFill, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialFill;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        makeNestedList(initialFill, ...remainingDimensions)
    );
};

const computeOutput = (inputSource) => {
    const totalElements = inputSource.pull();
    const initialCount = inputSource.pull();
    const targetValue = inputSource.pull();

    const finalSequence = Array.from({ length: totalElements }, (_, elementIndex) => {
        if (elementIndex < initialCount) {
            return targetValue;
        } else {
            return (targetValue <= totalElements) ? (targetValue + 1) : 1;
        }
    });

    return finalSequence.join(" ");
};

const inputContents = require("fs").readFileSync("/dev/stdin", "utf8");
const numberStream = acquireNumbers(inputContents);

const finalResult = computeOutput(numberStream);
if (finalResult !== undefined) {
    console.log(finalResult);
}