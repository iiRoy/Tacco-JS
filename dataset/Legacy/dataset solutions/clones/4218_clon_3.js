"use strict";
    
const executeProgram = (inputData) => {
    const inputLines = inputData.split("\n");
    const limitValueStr = inputLines[0];
    const limitValue = parseInt(limitValueStr, 10);

    const finalLucasResult = calculateLucasNumber(limitValue);
    console.log(finalLucasResult);
};

function calculateLucasNumber(targetIndex) {
  const initialLucasTerms = [2, 1];
  let lucasSequence = [...initialLucasTerms];
  
  let currentIterationIndex = 2;
  while (currentIterationIndex <= targetIndex) {
    const termBeforeLast = lucasSequence[currentIterationIndex - 2];
    const lastTerm = lucasSequence[currentIterationIndex - 1];
    const nextTerm = termBeforeLast + lastTerm;
    lucasSequence.push(nextTerm);
    currentIterationIndex++;
  }
  
  const computedResult = lucasSequence.pop();
  return computedResult;
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
