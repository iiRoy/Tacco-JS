'use strict';

const createInputProcessor = (rawContent) => {
    const lineSegments = rawContent.split('\n');
    if (lineSegments[lineSegments.length - 1] === '') {
        lineSegments.pop();
    }
    let currentLineIndex = 0;

    const extractNumbers = () => {
        const lineData = lineSegments[currentLineIndex++];
        return lineData.split(' ').map(Number);
    };

    const extractAllNumbers = () => {
        const remainingLines = lineSegments.slice(currentLineIndex);
        currentLineIndex = lineSegments.length;
        return remainingLines.map(Number);
    };

    const extractAllStrings = () => {
        const remainingLines = lineSegments.slice(currentLineIndex);
        currentLineIndex = lineSegments.length;
        return remainingLines;
    };

    const extractNStrings = (count) => {
        const start = currentLineIndex;
        currentLineIndex += count;
        return lineSegments.slice(start, start + count);
    };

    return {
        getNumericLine: extractNumbers,
        getNumericVector: extractAllNumbers,
        getStringVector: extractAllStrings,
        getNStringLines: extractNStrings
    };
};

const inputSource = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

(() => {
    const parameters = inputSource.getNumericLine();
    const arrayLength = parameters[0];
    const requiredCount = parameters[1];
    const dataArray = inputSource.getNumericLine();

    const allSubarraySums = Array.from({ length: arrayLength }, (_, startIndex) =>
        dataArray.slice(startIndex).reduce((accumulator, currentValue) => {
            const nextSum = (accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0) + currentValue;
            accumulator.push(nextSum);
            return accumulator;
        }, [])
    ).flat();

    let finalResult = 0;

    for (let bitPosition = 41; bitPosition >= 0; --bitPosition) {
        const currentBitValue = 1 << bitPosition;
        const potentialTarget = finalResult + currentBitValue;

        const matchingCount = allSubarraySums.reduce((count, elementValue) => {
            return ((elementValue & potentialTarget) === potentialTarget) ? count + 1 : count;
        }, 0);

        if (matchingCount >= requiredCount) {
            finalResult += currentBitValue;
        }
    }

    console.log(finalResult);
})();
