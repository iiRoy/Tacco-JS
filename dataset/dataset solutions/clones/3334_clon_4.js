function processInputData(rawData) {
    const processedLines = rawData.trim().split("\n").map(line => line.split(" "));
    const sequenceSize = parseInt(processedLines[0][0], 10);
    const numericSequence = processedLines[1].map(element => parseInt(element, 10));

    const scoreDifferenceMatrix = Array.from({ length: sequenceSize }, () => Array(sequenceSize).fill(0));

    for (let startIdx = 0; startIdx < sequenceSize; startIdx++) {
        scoreDifferenceMatrix[startIdx][startIdx] = numericSequence[startIdx];
    }

    for (let startIdx = 0; startIdx < sequenceSize - 1; startIdx++) {
        scoreDifferenceMatrix[startIdx][startIdx + 1] = Math.abs(numericSequence[startIdx] - numericSequence[startIdx + 1]);
    }

    for (let currentLength = 3; currentLength <= sequenceSize; currentLength++) {
        for (let startIdx = 0; startIdx <= sequenceSize - currentLength; startIdx++) {
            const endIdx = startIdx + currentLength - 1;
            const scoreIfLeftChosen = numericSequence[startIdx] - scoreDifferenceMatrix[startIdx + 1][endIdx];
            const scoreIfRightChosen = numericSequence[endIdx] - scoreDifferenceMatrix[startIdx][endIdx - 1];
            scoreDifferenceMatrix[startIdx][endIdx] = Math.max(scoreIfLeftChosen, scoreIfRightChosen);
        }
    }

    console.log(scoreDifferenceMatrix[0][sequenceSize - 1]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
