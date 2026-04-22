"use strict";

const obtainNumber = (inputString) => parseInt(inputString.trim(), 10);

const calculateReducedValue = (subjectValue, factorToRemove) => {
  let currentSubject = subjectValue;
  while (currentSubject > 0 && currentSubject % factorToRemove === 0) {
    currentSubject /= factorToRemove;
  }
  return currentSubject;
};

const acquireDivisors = (valueToFactor) => {
  const distinctDivs = new Set();
  for (let idx = 1; idx * idx <= valueToFactor; idx++) {
    if (valueToFactor % idx === 0) {
      distinctDivs.add(idx);
      distinctDivs.add(valueToFactor / idx);
    }
  }
  return Array.from(distinctDivs).sort((first, second) => first - second);
};

(function executeProcessor(inputContent) {
  const mainInputNumber = obtainNumber(inputContent);

  const prevNumberDivisors = acquireDivisors(mainInputNumber - 1);
  const countA = prevNumberDivisors.length - 1;

  const currentNumberDivisors = acquireDivisors(mainInputNumber);
  const relevantDivisors = currentNumberDivisors.filter(val => val > 1);

  let countB = 0;

  relevantDivisors.forEach(currentDivisorCandidate => {
    const resultingValue = calculateReducedValue(mainInputNumber, currentDivisorCandidate);

    if (resultingValue === 1) {
      countB++;
    } else {
      const reducedMinusOneDivisors = acquireDivisors(resultingValue - 1);
      if (reducedMinusOneDivisors.includes(currentDivisorCandidate)) {
        countB++;
      }
    }
  });

  console.log(countA + countB);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));