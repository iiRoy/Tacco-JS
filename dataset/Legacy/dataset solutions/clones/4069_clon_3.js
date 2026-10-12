const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

let rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, encodingType);
let processedInputString = rawInputBuffer.trim();

let stringForParsing = processedInputString.replace(/\s/, "");
let numericValue = parseInt(stringForParsing, 10);

const mathOperations = Math;
let calculatedRootValue = mathOperations.sqrt(numericValue);

const positiveResultText = "YES";
const negativeResultText = "No";

let finalOutputMessage;
if (Number.isInteger(calculatedRootValue)) {
    finalOutputMessage = positiveResultText;
} else {
    finalOutputMessage = negativeResultText;
}

console.log(finalOutputMessage);
