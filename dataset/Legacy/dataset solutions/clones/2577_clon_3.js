const parseIntegerArray = (lineString) => {
    const RADIX_DECIMAL = 10;
    return lineString.split(' ').map(val => parseInt(val, RADIX_DECIMAL));
};

function processInputData(rawData) {
    const lines = rawData.split("\n");

    const firstLineNumbers = parseIntegerArray(lines[0]);
    const arraySize = firstLineNumbers[0];

    const bValues = parseIntegerArray(lines[1]);

    let sumOfElements = bValues[0];

    const intermediateLoopUpperBound = arraySize - 2;

    for (let idx = 0; idx < intermediateLoopUpperBound; idx++) {
        const currentVal = bValues[idx];
        const nextVal = bValues[idx + 1];
        sumOfElements += Math.min(currentVal, nextVal);
    }

    const lastRelevantElementIndex = arraySize - 2;
    sumOfElements += bValues[lastRelevantElementIndex];

    console.log(sumOfElements);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
