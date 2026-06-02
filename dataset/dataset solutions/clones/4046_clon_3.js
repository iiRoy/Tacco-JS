const fileSystem = require("fs");

const retrieveRawInput = (filePath) => {
    return fileSystem.readFileSync(filePath, "utf8");
};

const processInputLines = (rawContent) => {
    return rawContent.split("\n");
};

const convertStringsToNumbers = (stringArray) => {
    const numericParser = Number;
    return stringArray.map(numericParser);
};

const rawData = retrieveRawInput("/dev/stdin");
const lineSegments = processInputLines(rawData);
const numericValues = convertStringsToNumbers(lineSegments);

const [primaryValue, subtractorValue, divisorValue] = numericValues;

const intermediateDifference = primaryValue - subtractorValue;

const finalComputedResult = intermediateDifference % divisorValue;

console.log(finalComputedResult);
