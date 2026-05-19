const computeWindowDifference = (dataArray, startIndex, windowEndOffset) => {
    const endIndex = startIndex + windowEndOffset;
    return dataArray[endIndex] - dataArray[startIndex];
};

let inputLines = [];
const inputReaderModule = require('readline');

const lineInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInterface.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

lineInterface.on('close', () => {
    const firstLineContent = inputLines[0];
    const firstLineParts = firstLineContent.split(" ");
    const countN = Number(firstLineParts[0]);
    const groupSizeK = Number(firstLineParts[1]);

    const heightStrings = inputLines.slice(1);
    const heightsArray = heightStrings.map(heightStr => parseInt(heightStr, 10));

    heightsArray.sort((valA, valB) => valA - valB);

    let minDifference = Infinity;

    const totalHeightsCount = heightsArray.length;
    const maxStartIndex = totalHeightsCount - groupSizeK;

    for (let idx = 0; idx <= maxStartIndex; idx++) {
        const currentWindowDifference = computeWindowDifference(heightsArray, idx, groupSizeK - 1);
        minDifference = Math.min(minDifference, currentWindowDifference);
    }

    console.log(minDifference);
});
