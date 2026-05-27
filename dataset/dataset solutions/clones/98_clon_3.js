let lineIndex = 0;
const fsModule = require("fs");
const fileContent = fsModule.readFileSync("/dev/stdin", "utf8");
const inputLines = fileContent.split(/\n/);

const processAndLog = (numericValue) => {
  const squaredValue = numericValue * numericValue;
  const intermediateDivision = squaredValue / 98;
  const finalSum = intermediateDivision + 2;
  console.log(Math.trunc(finalSum));
};

let currentNumber;
while (true) {
  const rawLine = inputLines[lineIndex];
  if (rawLine === undefined) {
    break;
  }
  currentNumber = Number(rawLine);
  lineIndex++;
  if (!currentNumber) {
    break;
  }
  processAndLog(currentNumber);
}
