const acquireSource = require("fs").readFileSync;
const inputLocation = "/dev/stdin";
const textEncoding = "utf8";

function deriveValues(dataStream) {
    let currentNumberString = "";
    const numericSequence = [];
    for (let index = 0; index < dataStream.length; ++index) {
        const charUnit = dataStream[index];
        if (charUnit >= '0' && charUnit <= '9') {
            currentNumberString += charUnit;
        } else if (currentNumberString.length > 0) {
            numericSequence.push(Number(currentNumberString));
            currentNumberString = "";
        }
    }
    if (currentNumberString.length > 0) {
        numericSequence.push(Number(currentNumberString));
    }
    return numericSequence;
}

function computeLowestPairSum(inputSet) {
    const arrangedElements = [...inputSet].sort((first, second) => first - second);
    return arrangedElements[0] + arrangedElements[1];
}

function initiateProcessing(dataContent) {
    const parsedValues = deriveValues(dataContent);
    const computedResult = computeLowestPairSum(parsedValues);
    console.log(computedResult);
}

initiateProcessing(acquireSource(inputLocation, textEncoding));