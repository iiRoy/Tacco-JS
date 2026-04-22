function writeToOutput(dataCollection) {
    process.stdout.write(dataCollection.join(" ") + "\n");
}

function recurseAndInsert(dataSequence, currentInsertionIndex) {
    if (currentInsertionIndex >= dataSequence.length) {
        return;
    }

    let currentVal = dataSequence[currentInsertionIndex];
    let comparisonIdx = currentInsertionIndex - 1;

    while (comparisonIdx >= 0 && dataSequence[comparisonIdx] > currentVal) {
        dataSequence[comparisonIdx + 1] = dataSequence[comparisonIdx];
        comparisonIdx--;
    }

    dataSequence[comparisonIdx + 1] = currentVal;

    writeToOutput(dataSequence);

    recurseAndInsert(dataSequence, currentInsertionIndex + 1);
}

function processInputData(rawData) {
    let extractLines = rawData.split("\n");
    let numericItems = extractLines[1].split(" ").map(Number);

    writeToOutput(numericItems);

    recurseAndInsert(numericItems, 1);
}

const obtainSourceData = require("fs").readFileSync;
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

processInputData(obtainSourceData(standardInputPath, textEncoding));