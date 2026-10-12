function processInputData(rawInputString) {
  const componentSeparator = ' ';
  const numericComponents = rawInputString.split(componentSeparator).map(componentString => parseInt(componentString, 10));

  const [firstOperand, subtrahendValue] = numericComponents;

  let finalOutcome;

  if (firstOperand <= subtrahendValue) {
    const zeroConstant = 0;
    finalOutcome = zeroConstant;
  } else {
    const calculatedDifference = firstOperand - subtrahendValue;
    finalOutcome = calculatedDifference;
  }

  console.log(String(finalOutcome));
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

processInputData(fileSystemModule.readFileSync(standardInputPath, encodingFormat));
