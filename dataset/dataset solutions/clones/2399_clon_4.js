"use strict";

const createInputProcessor = (rawContent) => {
    let lineSegments = rawContent.trim().split('\n');
    let currentSegmentIndex = 0;
    let tokenCache = [];

    const refillTokenCache = () => {
        if (tokenCache.length === 0 && currentSegmentIndex < lineSegments.length) {
            tokenCache = lineSegments[currentSegmentIndex].split(' ').reverse();
            currentSegmentIndex++;
        }
    };

    const fetchNextToken = (asString) => {
        refillTokenCache();
        if (tokenCache.length === 0) return undefined;
        const extracted = tokenCache.shift();
        return asString ? extracted : Number(extracted);
    };

    const retrieveFullLine = (asStrings) => {
        if (currentSegmentIndex >= lineSegments.length) return undefined;
        const line = lineSegments[currentSegmentIndex].split(' ');
        currentSegmentIndex++;
        return asStrings ? line : line.map(Number);
    };

    const obtainMatrix = (rowCount, asStrings) => {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(retrieveFullLine(asStrings));
        }
        return resultMatrix;
    };

    const acquireRawLines = (count, asStrings) => {
        const collectedLines = [];
        for (let i = 0; i < count; i++) {
            if (currentSegmentIndex >= lineSegments.length) break;
            collectedLines.push(lineSegments[currentSegmentIndex]);
            currentSegmentIndex++;
        }
        return asStrings ? collectedLines : collectedLines.map(Number);
    };

    return {
        readSingle: fetchNextToken,
        readEntireLine: retrieveFullLine,
        readMatrix: obtainMatrix,
        readLinesRaw: acquireRawLines
    };
};

const inputSource = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const constructMultiArray = (initialExpression, ...dimensions) => {
    const buildArrayStringRecursive = (dims, currentExpression) => {
        if (dims.length === 0) {
            return currentExpression;
        }
        const currentDimension = dims[0];
        const remainingDimensions = dims.slice(1);
        const innerArrayString = buildArrayStringRecursive(remainingDimensions, currentExpression);
        return `Array(${currentDimension}).fill(0).map(() => ${innerArrayString})`;
    };
    const finalArrayString = buildArrayStringRecursive(dimensions, initialExpression);
    return eval(finalArrayString);
};

function solveProblem() {
    const sequenceLength = inputSource.readSingle();
    const divisor = inputSource.readSingle();
    const inputValues = inputSource.readEntireLine().map(val => val - 1);

    const cumulativeSumsModulo = inputValues.reduce((accumulator, currentElement) => {
        const lastSum = accumulator[accumulator.length - 1];
        accumulator.push((lastSum + currentElement) % divisor);
        return accumulator;
    }, [0]);

    let totalValidSubarrays = 0;
    const remainderCounts = new Map();

    cumulativeSumsModulo.forEach((currentSum, currentIndex) => {
        if (divisor <= currentIndex) {
            const valueToDecrement = cumulativeSumsModulo[currentIndex - divisor];
            remainderCounts.set(valueToDecrement, (remainderCounts.get(valueToDecrement) || 0) - 1);
        }

        const currentRemainderFreq = remainderCounts.get(currentSum) || 0;
        totalValidSubarrays += currentRemainderFreq;

        remainderCounts.set(currentSum, currentRemainderFreq + 1);
    });

    return totalValidSubarrays;
}

console.log(solveProblem());
