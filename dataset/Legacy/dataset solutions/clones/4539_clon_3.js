const fileSystemModule = require("fs");
const inputFilePath = "/dev/stdin";
const sumThresholdValue = 10;

const rawInputContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
const stringParts = rawInputContent.split(" ");
const parsedNumbers = stringParts.map(Number);

let [firstOperand, secondOperand] = parsedNumbers;

const computedSum = firstOperand + secondOperand;

let finalOutputMessage;
if (computedSum >= sumThresholdValue) {
  finalOutputMessage = "error";
} else {
  finalOutputMessage = computedSum;
}

console.log(finalOutputMessage);
