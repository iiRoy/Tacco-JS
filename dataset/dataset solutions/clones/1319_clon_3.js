function processInputData(rawData) {
    const inputSegments = rawData.split("\n");

    const firstLineContent = inputSegments[0];
    const secondLineContent = inputSegments[1];

    const doubledFirstLine = firstLineContent + firstLineContent;

    const isSecondLineContained = doubledFirstLine.indexOf(secondLineContent) !== -1;

    if (isSecondLineContained) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const fileSystemHandler = require("fs");
const standardInputFile = "/dev/stdin";
const fileEncoding = "utf-8";

const fileContents = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
processInputData(fileContents);
