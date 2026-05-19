function parseNumericInput(strValue) {
  return Number(strValue);
}

function processInput(inputLines) {
  const TARGET_COMPARISON_VALUE = 1;
  const GREETING_MESSAGE_TEXT = "Hello World";

  let initialUnusedValue = parseNumericInput(inputLines[0]);

  const firstOperand = parseNumericInput(inputLines[1]);
  const secondOperand = parseNumericInput(inputLines[2]);

  let finalOutputMessage;

  if (firstOperand === TARGET_COMPARISON_VALUE) {
    finalOutputMessage = GREETING_MESSAGE_TEXT;
  } else {
    const calculatedSum = firstOperand + secondOperand;
    finalOutputMessage = calculatedSum;
  }

  console.log(finalOutputMessage);
}

const fileSystemModule = require('fs');
const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawFileContent.trim();
const inputDataArray = processedContent.split("\n");

processInput(inputDataArray);
