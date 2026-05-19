function processInput(inputString) {
    const DELIMITER_CHAR = " ";
    const partsArray = inputString.split(DELIMITER_CHAR);
    const finalResult = determineOutcome(partsArray);
    console.log(finalResult);
}

function determineOutcome(inputParts) {
    const MATCH_RESULT = "H";
    const NO_MATCH_RESULT = "D";

    function areFirstTwoElementsEqual(partsArray) {
        return partsArray[0] === partsArray[1];
    }

    if (areFirstTwoElementsEqual(inputParts)) {
        return MATCH_RESULT;
    } else {
        return NO_MATCH_RESULT;
    }
}

function readStandardInput() {
    const fileSystemModule = require("fs");
    const filePath = "/dev/stdin";
    const encodingType = "utf8";
    return fileSystemModule.readFileSync(filePath, encodingType);
}

const rawInputData = readStandardInput();
processInput(rawInputData);
