const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

function executeComputation(rawData) {
    let parsedLines = [];
    let currentLineBuffer = "";
    for (let linePointer = 0; linePointer < rawData.length; linePointer++) {
        if (rawData[linePointer] === "\n") {
            parsedLines.push(currentLineBuffer);
            currentLineBuffer = "";
        } else {
            currentLineBuffer += rawData[linePointer];
        }
    }
    parsedLines.push(currentLineBuffer);

    let significantLines = [];
    for (let j = 1; j < parsedLines.length - 1; j++) {
        significantLines.push(parsedLines[j]);
    }

    let encounteredItems = {};
    let distinctQuantity = 0;

    for (let itemIdentifier of significantLines) {
        if (!encounteredItems[itemIdentifier]) {
            encounteredItems[itemIdentifier] = true;
            distinctQuantity++;
        }
    }

    console.log(distinctQuantity);
}

executeComputation(fileSystemModule.readFileSync(standardInputPath, encodingFormat));