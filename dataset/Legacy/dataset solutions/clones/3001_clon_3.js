function processInputData(rawData) {
  const inputParts = rawData.split(" ");

  const firstVal = parseInt(inputParts[0], 10);
  const secondVal = parseInt(inputParts[1], 10);
  const timeLimit = parseInt(inputParts[2], 10);

  const adjustedTimeForCalculation = timeLimit + 0.5;
  const divisionIntermediateResult = adjustedTimeForCalculation / firstVal;
  const flooredCount = Math.floor(divisionIntermediateResult);
  const finalComputedValue = flooredCount * secondVal;

  console.log(finalComputedValue);
}

const fileSystemHandler = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";

const fileContent = fileSystemHandler.readFileSync(standardInputFilePath, fileEncoding);
processInputData(fileContent);
