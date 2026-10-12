'use strict';

function processInput(inputLines) {
  const firstLineData = inputLines[0].split(' ');
  const totalLength = Number(firstLineData[0]);
  const operationsCount = Number(firstLineData[1]);
  const initialString = inputLines[1];

  let currentString = reduceConsecutive(initialString);
  let currentOperationIndex = 0;

  while (currentOperationIndex < operationsCount) {
    if (currentString.length === 1) {
      break;
    }
    
    const firstCharacterOfCurrent = currentString[0];
    const stringRemainderAfterThirdChar = currentString.slice(3);
    
    currentString = firstCharacterOfCurrent + stringRemainderAfterThirdChar;
    currentOperationIndex++;
  }

  const finalHappinessValue = totalLength - currentString.length;
  console.log(finalHappinessValue);
}

function reduceConsecutive(initialInput) {
  let charArray = Array.from(initialInput);
  let currentArrayLength = charArray.length;
  let scanIndex = 0;

  while (scanIndex < currentArrayLength - 1) {
    const currentChar = charArray[scanIndex];
    const nextChar = charArray[scanIndex + 1];

    if (currentChar === nextChar) {
      charArray.splice(scanIndex + 1, 1);
      currentArrayLength--;
    } else {
      scanIndex++;
    }
  }
  return charArray.join('');
}

function executeWithStandardInput() {
  let rawDataBuffer = "";
  const standardInput = process.stdin;

  standardInput.resume();
  standardInput.setEncoding("utf8");

  standardInput.on("data", (chunk) => {
    rawDataBuffer += chunk;
  });

  const handleInputEnd = () => {
    const parsedLines = rawDataBuffer.split("\n");
    processInput(parsedLines);
  };

  standardInput.on("end", handleInputEnd);
}
executeWithStandardInput();
