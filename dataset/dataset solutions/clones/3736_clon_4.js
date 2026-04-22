"use strict";
const rawSource = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

const configLineIdx = 0;
const dataLineIdx = 1;
const firstParamIdx = 0;
const secondParamIdx = 1;

const configTokens = rawSource[configLineIdx].match(/\d+/g);
const paramA = parseInt(configTokens[firstParamIdx]);
const paramB = parseInt(configTokens[secondParamIdx]);

const valueSeries = rawSource[dataLineIdx].match(/\d+/g).map(Number);

const locateSmallestElement = (numericArray) => {
  let smallestVal = numericArray[0];
  let originalPos = 0;
  for (let i = 1; i < numericArray.length; i++) {
    if (numericArray[i] < smallestVal) {
      smallestVal = numericArray[i];
      originalPos = i;
    }
  }
  return { smallestVal: smallestVal, originalPos: originalPos };
};

const performCeilingDivision = (numerator, denominator) => {
    if (denominator === 0) {
        if (numerator > 0) return Infinity;
        if (numerator === 0) return NaN;
        return -Infinity;
    }
    const result = numerator / denominator;
    return result === (result | 0) ? result : (result > 0 ? (result | 0) + 1 : (result | 0));
};

const calculateCompositeMetric = (valA, valB, seriesInput) => {
  const discoveryResult = locateSmallestElement(seriesInput);
  const targetIndex = discoveryResult.originalPos;

  const divisorOne = valB - 1;
  const divisorTwo = valA - valB - 1;

  const termOne = performCeilingDivision(targetIndex, divisorOne);
  const termTwo = performCeilingDivision(targetIndex, divisorTwo);

  return termOne + termTwo;
};

console.log(calculateCompositeMetric(paramA, paramB, valueSeries));