"use strict"

const processInput = rawData => {
  const trimmedInputString = rawData.trim();
  const numChars = trimmedInputString.length;
  let currentNum = parseInt(trimmedInputString);

  const initialDivisorPower = numChars - 1;
  let currentDivisor = Math.pow(10, initialDivisorPower);
  
  let digitList = [];
  
  for (let idx = 0; idx < numChars; idx++) {
    const extractedDigit = Math.floor(currentNum / currentDivisor);
    digitList.push(extractedDigit);
    
    currentNum %= currentDivisor;
    currentDivisor = currentDivisor / 10;
  }
  
  let finalResult = 0;
  for (const digitValue of digitList) {
    finalResult += digitValue;
  }

  if (finalResult === 1) {
    finalResult = 10;
  }

  console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
