const parseInteger = (valueString) => parseInt(valueString, 10);

const parseIntegerArray = (stringArray) => stringArray.map(item => parseInteger(item));

const absoluteValue = (numberValue) => (numberValue > 0 ? numberValue : -numberValue);

function findMinimum() {
    let argumentList = arguments;
    let minimumValue = argumentList[0];
    for (let currentIdx = 1; currentIdx < argumentList.length; currentIdx++) {
        if (argumentList[currentIdx] < minimumValue) {
            minimumValue = argumentList[currentIdx];
        }
    }
    return minimumValue;
}

function findMaximum() {
    let argumentList = arguments;
    let maximumValue = argumentList[0];
    for (let currentIdx = 1; currentIdx < argumentList.length; currentIdx++) {
        if (argumentList[currentIdx] > maximumValue) {
            maximumValue = argumentList[currentIdx];
        }
    }
    return maximumValue;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
    let lineData = rawData.split('\n');

    const numK = parseIntegerArray(lineData[0].split(' '));
    const countN = numK[0];
    const targetK = numK[1];

    let initialNumbers = parseIntegerArray(lineData[1].split(' '));

    const prefixSums = [initialNumbers[0]];
    for (let idx = 1; idx < countN; idx++) {
        prefixSums[idx] = prefixSums[idx - 1] + initialNumbers[idx];
    }
    prefixSums[-1] = 0;

    const allSubarraySums = [];
    for (let idx = 0; idx < countN; idx++) {
        for (let jdx = idx; jdx < countN; jdx++) {
            allSubarraySums.push(prefixSums[jdx] - prefixSums[idx - 1]);
        }
    }

    let processedNumbers = allSubarraySums;

    const bitGroupings = [];
    const bitValues = [];
    const dataLength = processedNumbers.length;

    for (let idx = 0; idx < 30; idx++) {
        bitGroupings[idx] = [];
        bitValues[idx] = 1 << idx;
        for (let jdx = 0; jdx < dataLength; jdx++) {
            if (bitValues[idx] & processedNumbers[jdx]) {
                bitGroupings[idx].push(jdx);
            }
        }
    }

    /*
    console.log(prefixSums);
    console.log(processedNumbers);
    console.log(bitGroupings);
    */

    let finalResult = 0;
    for (let idx = 29; idx > -1; idx--) {
        if (bitGroupings[idx].length >= targetK) {
            // console.log(idx);
            finalResult += bitValues[idx];
            for (let jdx = idx - 1; jdx > -1; jdx--) {
                bitGroupings[jdx] = bitGroupings[jdx].filter(
                    (elementIndex) => bitGroupings[idx].includes(elementIndex)
                );
            }
        }
    }
    console.log(finalResult);
}
