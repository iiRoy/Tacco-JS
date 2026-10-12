'use strict';

const computeProductSequence = (val) => {
  if (val === 0) {
    return 1;
  }
  return Array.from({ length: val }, (_, index) => index + 1)
              .reduce((accumulator, currentElement) => accumulator * currentElement, 1);
};

const determineFactorCount = (value) => {
  if (value === 0) {
    return 0;
  }
  return Array.from({ length: value }, (_, index) => index + 1)
              .filter(candidateDivisor => value % candidateDivisor === 0)
              .length;
};

const ProcessInput = (sourceText) => {
  const initialValue = Number(sourceText);
  const productResult = computeProductSequence(initialValue);
  console.log(determineFactorCount(productResult));
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
