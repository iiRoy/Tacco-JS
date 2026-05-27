const parseInitialData = (inputLines) => {
    const arraySizeN = parseInt(inputLines[0], 10);
    const rawNumbersString = inputLines[1].split(" ");
    const parsedNumbers = rawNumbersString.map(str => parseInt(str, 10));
    return parsedNumbers;
};

const findMedianOfThree = (numA, numB, numC) => {
    const sortedValues = [numA, numB, numC].sort((x, y) => x - y);
    return sortedValues[1];
};

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    let currentWorkingArray = parseInitialData(inputLines);

    const SUB_ARRAY_WINDOW_SIZE = 3;

    const computeNextLevelArray = (sourceArray) => {
        const elementsToProcess = sourceArray.length - (SUB_ARRAY_WINDOW_SIZE - 1);
        if (elementsToProcess <= 0) {
            return [];
        }

        const nextLevelResult = [];
        for (let k = 0; k < elementsToProcess; k++) {
            const subArrayWindow = sourceArray.slice(k, k + SUB_ARRAY_WINDOW_SIZE);
            nextLevelResult.push(findMedianOfThree(subArrayWindow[0], subArrayWindow[1], subArrayWindow[2]));
        }
        return nextLevelResult;
    };

    while (currentWorkingArray.length > 1) {
        currentWorkingArray = computeNextLevelArray(currentWorkingArray);
    }

    console.log('%d', currentWorkingArray[0]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
