const quantifyEndZeros = (numeral) => {
    if (numeral === 0 || numeral % 10 !== 0) {
        return 0;
    }
    return 1 + quantifyEndZeros(numeral / 10);
};

const formDecreasingSequence = (startVal, collection = []) => {
    if (startVal <= 0) {
        return collection;
    }
    collection.push(startVal);
    return formDecreasingSequence(startVal - 2, collection);
};

const processNumericalInput = (rawText) => {
    const initialNumericValue = Number(rawText);
    const numericalSeries = formDecreasingSequence(initialNumericValue);
    const sumOfZeroCounts = numericalSeries.reduce((accumulatedSum, currentElement) => {
        return accumulatedSum + quantifyEndZeros(currentElement);
    }, 0);
    console.info(sumOfZeroCounts);
};

processNumericalInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));