const printToConsole = console.log;

const INPUT_FILE_PATH = "/dev/stdin";
const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync(INPUT_FILE_PATH, "UTF-8");

const initialSplitLines = rawInputContent.split("\n");
const parsedInputData = [];
for (const singleLine of initialSplitLines) {
  if (singleLine.trim() !== "") {
    parsedInputData.push(singleLine.split(" "));
  }
}

const firstLineParts = parsedInputData[0];
const firstNumber = firstLineParts[0];
const targetPosition = Number(firstLineParts[1]);

const dataLinesForProcessing = parsedInputData.slice(1);

const finalResultArray = [];

for (const currentPairStr of dataLinesForProcessing) {
  const elementVal = Number(currentPairStr[0]);
  const repeatCount = Number(currentPairStr[1]);

  const segmentToAppend = Array(repeatCount).fill(elementVal);
  finalResultArray.push(...segmentToAppend);
}

const finalOutputIndex = targetPosition - 1;
printToConsole(finalResultArray[finalOutputIndex]);
