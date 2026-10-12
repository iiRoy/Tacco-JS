function generateRepeatedString(charValue, repeatCount) {
  let currentResult = '';
  for (let idx = 0; idx < repeatCount; idx++) {
    currentResult += charValue;
  }
  return currentResult;
}

function processInput(rawInputString) {
  const RADIX_BASE = 10;
  
  let inputParts = rawInputString.split(" ");
  let firstNum = parseInt(inputParts[0], RADIX_BASE);
  let secondNum = parseInt(inputParts[1], RADIX_BASE);
  
  let generatedSequence = "";
  
  if (firstNum < secondNum) {
    generatedSequence = generateRepeatedString(firstNum, secondNum);
  } else {
    generatedSequence = generateRepeatedString(secondNum, firstNum);
  }
  
  console.log(generatedSequence);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
