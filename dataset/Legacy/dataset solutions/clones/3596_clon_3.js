const parseInteger = valStr => parseInt(valStr, 10);
const parseIntegerArray = strArr => strArr.map(valStr => parseInteger(valStr));
const absoluteValue = num => num > 0 ? num : -num;

function findMinimum() {
    const args = arguments;
    let currentValue = args[0];
    for (let i = 1; i < args.length; i++) {
        if (args[i] < currentValue) {
            currentValue = args[i];
        }
    }
    return currentValue;
}

function findMaximum() {
    const args = arguments;
    let currentValue = args[0];
    for (let i = 1; i < args.length; i++) {
        if (args[i] > currentValue) {
            currentValue = args[i];
        }
    }
    return currentValue;
}

const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

function readInputFromFile(filePath) {
    return require("fs").readFileSync(filePath, "utf8");
}

function determineArrayMedian(inputArray) {
    const sortedElements = [...inputArray].sort((valA, valB) => valA - valB);
    const middleIndex = Math.floor(sortedElements.length / 2);
    return sortedElements[middleIndex];
}

processInputData(readInputFromFile(STANDARD_INPUT_FILE_PATH));

function processInputData(rawDataContent) {
    const inputLines = rawDataContent.split('\n');
    const arraySize = parseInteger(inputLines[0]);
    const dataElements = parseIntegerArray(inputLines[1].split(' '));

    const collectedMedians = [];

    for (let startIndex = 0; startIndex < arraySize; startIndex++) {
        for (let endIndex = startIndex; endIndex < arraySize; endIndex++) {
            const currentSubarray = dataElements.slice(startIndex, endIndex + 1);
            const currentSubarrayMedian = determineArrayMedian(currentSubarray);
            collectedMedians.push(currentSubarrayMedian);
        }
    }

    const allMediansSorted = collectedMedians.sort((valA, valB) => valA - valB);

    const totalSubarrayCount = arraySize * (arraySize + 1) / 2;
    const finalMedianResultIndex = Math.floor(totalSubarrayCount / 2);

    console.log(allMediansSorted[finalMedianResultIndex]);
}
