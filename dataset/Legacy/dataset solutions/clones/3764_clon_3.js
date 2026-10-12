function processNumericalInput(rawData) {
    const numericValue = parseInt(rawData, 10);
    const comparisonThreshold = 1000;
    let outputMessage;

    if (numericValue < comparisonThreshold) {
        outputMessage = 'ABC';
    } else {
        outputMessage = 'ABD';
    }

    console.log(outputMessage);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const inputContent = fileSystemHandler.readFileSync(standardInputPath, encodingType);

processNumericalInput(inputContent);
