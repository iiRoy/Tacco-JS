function processInput(rawData) {
    const inputDelimiter = " ";
    const stringSegments = rawData.split(inputDelimiter);

    const parseStringSegment = (segmentValue) => {
        const numericalBase = 10;
        return parseInt(segmentValue, numericalBase);
    };

    const numericValues = stringSegments.map(parseStringSegment);

    const firstValueAdjusted = numericValues[0] - 1;
    const secondValueAdjusted = numericValues[1] - 1;

    const calculatedProduct = firstValueAdjusted * secondValueAdjusted;

    console.log(calculatedProduct);
}

const fileSystemHandler = require("fs");
const standardInputFile = "/dev/stdin";
const fileEncoding = "utf8";
const fileContents = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
processInput(fileContents);
