function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    const primaryLine = dataLines[0];
    const numberStrings = primaryLine.split(" ");
    const numeratorValue = parseFloat(numberStrings[0]);
    const denominatorValue = parseFloat(numberStrings[1]);
    const calculatedResult = numeratorValue / denominatorValue;
    console.log(calculatedResult);
}

function entryPoint() {
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";
    const encodingFormat = "utf8";
    const fullInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
    processInputData(fullInputContent);
}

entryPoint();
