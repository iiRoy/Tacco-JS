function processInputData(rawDataString) {
    const numericSequenceStr = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51";
    const valueDelimiter = ",";

    const sequenceElements = numericSequenceStr.split(valueDelimiter);

    const parseInputIndex = (inputStr) => {
        return parseInt(inputStr, 10);
    };

    const retrieveAndParseElement = (elementsArray, baseOneIndex) => {
        const zeroBasedIndex = baseOneIndex - 1;
        const elementString = elementsArray[zeroBasedIndex];
        return Number(elementString);
    };

    const inputIndexValue = parseInputIndex(rawDataString);
    const finalComputedValue = retrieveAndParseElement(sequenceElements, inputIndexValue);

    console.log(finalComputedValue);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const inputFromFile = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(inputFromFile);
