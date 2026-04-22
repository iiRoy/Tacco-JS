const processPair = (firstValue, secondValue) => {
    if (firstValue > secondValue) {
        return firstValue - secondValue;
    } else if (firstValue === secondValue) {
        return firstValue;
    } else {
        return secondValue - firstValue;
    }
};

const evolveArray = (currentNumericSeries, remainingTransformations) => {
    if (remainingTransformations === 0) {
        return currentNumericSeries[0];
    }

    const nextSeriesLength = Math.ceil(currentNumericSeries.length / 2);

    const nextNumericSeries = Array.from({ length: nextSeriesLength }, (_, idx) => {
        const primaryElement = currentNumericSeries[2 * idx];
        const secondaryElement = currentNumericSeries[2 * idx + 1];
        return processPair(primaryElement, secondaryElement);
    });

    return evolveArray(nextNumericSeries, remainingTransformations - 1);
};

const applyTransformation = (rawText) => {
    const linesOfText = rawText.split("\n").filter(Boolean);
    const transformationCount = parseInt(linesOfText[0], 10);
    const initialNumericSeries = linesOfText.slice(1).map(Number);

    return evolveArray(initialNumericSeries, transformationCount);
};

const acquiredData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(applyTransformation(acquiredData));