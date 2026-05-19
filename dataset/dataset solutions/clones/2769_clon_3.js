function ProcessInput(rawData) {
    let lines = rawData.split("\n");
    let strNums = lines[1].split(" ");

    let countValleys = parseInt(lines[0], 10);

    let elevationData = parseNumbers(strNums);
    let totalElevation = 0;
    let dataLength = elevationData.length;

    for (let i = 0; i < dataLength; i++) {
        let currentElevation = elevationData[i];
        totalElevation += currentElevation;
    }

    let oddIndexSum = 0;
    for (let i = 1; i < dataLength; i += 2) {
        let currentOddElevation = elevationData[i];
        oddIndexSum += currentOddElevation;
    }

    let initialMountainValue = totalElevation - (2 * oddIndexSum);

    let computedPeaks = [];
    computedPeaks[0] = initialMountainValue;

    for (let idx = 1; idx < dataLength; idx++) {
        let previousValleySegment = elevationData[idx - 1];
        let previousPeakValue = computedPeaks[idx - 1];
        computedPeaks[idx] = (previousValleySegment * 2) - previousPeakValue;
    }

    console.log('%s', formatOutput(computedPeaks));
}

function parseNumbers(stringArray) {
    let parsedValues = [];
    let arrayLength = stringArray.length;
    for (let i = 0; i < arrayLength; i++) {
        let currentString = stringArray[i];
        parsedValues[i] = parseInt(currentString, 10);
    }
    return parsedValues;
}

function formatOutput(valuesToJoin) {
    let joinedString = valuesToJoin.join(' ');
    let finalOutput = joinedString + '\n';
    return finalOutput;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
