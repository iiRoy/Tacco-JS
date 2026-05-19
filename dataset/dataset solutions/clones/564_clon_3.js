function calculateMaxWindowSum(inputArray, windowSize) {
    const allWindowSums = [];
    let currentWindowSumValue;

    const computeInitialWindowSum = (arr, startOffset, len) => {
        let sumAccumulator = 0;
        for (let k = 1; k <= len; k++) {
            sumAccumulator += arr[startOffset + k];
        }
        return sumAccumulator;
    };

    for (let currentOffset = 0; currentOffset < inputArray.length - windowSize; currentOffset++) {
        if (currentOffset === 0) {
            currentWindowSumValue = computeInitialWindowSum(inputArray, currentOffset, windowSize);
        } else {
            currentWindowSumValue = allWindowSums[currentOffset - 1] - inputArray[currentOffset - 1] + inputArray[currentOffset + windowSize];
        }
        allWindowSums.push(currentWindowSumValue);
    }

    allWindowSums.sort((valA, valB) => valB - valA);
    console.log(allWindowSums[0]);
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()).split("\n");

let currentBlockNumbers;
let currentBlockWindowLength;

for (let lineIndex = 0; lineIndex < lineData.length; lineIndex++) {
    const currentLineContent = lineData[lineIndex];

    if (currentLineContent === "0 0") {
        break;
    }

    const parsedValues = currentLineContent.split(" ").map(Number);
    const isHeaderLine = (parsedValues.length === 2);
    const isLastInputLine = (lineIndex === lineData.length - 1);

    if (isHeaderLine || isLastInputLine) {
        if (lineIndex !== 0) {
            calculateMaxWindowSum(currentBlockNumbers, currentBlockWindowLength);
        }
        currentBlockNumbers = [];
        currentBlockWindowLength = parsedValues[1] - 0;
    } else {
        currentBlockNumbers.push(parsedValues[0]);
    }
}
