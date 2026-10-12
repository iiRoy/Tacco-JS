function parseStringAsInteger(inputStr) {
    return parseInt(inputStr, 10);
}

function convertStringsToNumbers(strArr) {
    const numberMapper = function(singleStr) {
        return parseStringAsInteger(singleStr);
    };
    return strArr.map(numberMapper);
}

function handleInputData(rawData) {
    const spaceSeparatedStrings = rawData.split(" ");
    const numericDataArray = convertStringsToNumbers(spaceSeparatedStrings);

    const primaryValueForComparison = numericDataArray[0];
    const requiredThreshold = 1200;

    if (primaryValueForComparison >= requiredThreshold) {
        console.log("ARC");
    } else {
        console.log("ABC");
    }
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const inputEncoding = "utf8";

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, inputEncoding);
handleInputData(rawInputContent);
