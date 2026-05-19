function processInputContent(rawContent) {
  const cleanedInputString = rawContent.trim();

  const stringComponents = cleanedInputString.split(" ");
  const numericalValues = stringComponents.map(strItem => Number(strItem));

  const firstOperand = numericalValues[0];
  const secondOperand = numericalValues[1];

  const adjustedFirst = firstOperand - 1;
  const adjustedSecond = secondOperand - 1;

  const finalResult = adjustedFirst + adjustedSecond;

  console.log(finalResult);
}

const fileSystemUtility = require("fs");
const standardInputSource = "/dev/stdin";
const textEncoding = "utf8";

const fileContentBuffer = fileSystemUtility.readFileSync(standardInputSource, textEncoding);
processInputContent(fileContentBuffer);
