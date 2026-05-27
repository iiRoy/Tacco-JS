'use strict'

function ProcessInput(rawInputData) {

  const trimmedInput = rawInputData.trim();
  const splitInputValues = trimmedInput.split(' ');

  const firstNum = parseInt(splitInputValues[0], 10);
  const secondNum = parseInt(splitInputValues[1], 10);

  let resultantString = '';
  let charToRepeat;
  let repetitionCount;

  const isFirstSmaller = (firstNum < secondNum);

  if (isFirstSmaller) {
    charToRepeat = String(firstNum);
    repetitionCount = secondNum;
  } else {
    charToRepeat = String(secondNum);
    repetitionCount = firstNum;
  }

  for (let loopIndex = 0; loopIndex < repetitionCount; ++loopIndex) {
    resultantString = resultantString + charToRepeat;
  }

  console.log(resultantString);

}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
