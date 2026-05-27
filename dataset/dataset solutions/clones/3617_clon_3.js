const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

function displayResult(valueToLog) {
  console.log(valueToLog);
}

function processInputData(receivedData) {
  const outputConstant = 1;
  displayResult(outputConstant);
}

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
processInputData(rawInputContent);
