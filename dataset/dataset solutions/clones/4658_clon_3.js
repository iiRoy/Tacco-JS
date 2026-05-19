'use strict'

function parseNumbersFromString(lineContent) {
  const stringTokens = lineContent.split(' ');
  const numericValues = stringTokens.map(numString => Number(numString));
  return numericValues;
}

function calculateModuloSum(val1, val2, modulusValue) {
  const intermediateSum = val1 + val2;
  const finalValue = intermediateSum % modulusValue;
  return finalValue;
}

function processInputAndCompute(inputData) {
  const firstLineContent = inputData.split('\n')[0];

  const parsedNumericArray = parseNumbersFromString(firstLineContent);

  const operandA = parsedNumericArray[0];
  const operandB = parsedNumericArray[1];

  const MODULO_CONSTANT = 24;

  const computedResult = calculateModuloSum(operandA, operandB, MODULO_CONSTANT);

  console.log(computedResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndCompute(fileContent);
