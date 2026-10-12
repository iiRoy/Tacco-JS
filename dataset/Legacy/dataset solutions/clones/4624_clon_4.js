"use strict";

const calculateDigitSum = (digitStringSegment) =>
  [...digitStringSegment.trim()].reduce((accumulatorValue, currentCharacter) =>
    accumulatorValue + Number(currentCharacter), 0);

const parseAndSumLines = (fullInputContent) => {
  const [firstDataLine, secondDataLine] = fullInputContent.trim().split('\n');
  const sumOfFirstDigits = calculateDigitSum(firstDataLine);
  const sumOfSecondDigits = calculateDigitSum(secondDataLine);
  return { sumOfFirstDigits, sumOfSecondDigits };
};

const determineComparisonOutcome = (valueOne, valueTwo) =>
  valueOne > valueTwo ? 'GREATER' : 'LESS';

const initiateProcessing = (inputRetrievalFunction) => {
  const rawText = inputRetrievalFunction();
  const { sumOfFirstDigits, sumOfSecondDigits } = parseAndSumLines(rawText);
  const finalResult = determineComparisonOutcome(sumOfFirstDigits, sumOfSecondDigits);
  console.log(finalResult);
};

initiateProcessing(() => require('fs').readFileSync('/dev/stdin', 'utf8'));
