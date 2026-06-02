'use strict';

const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

const rawInputContent = require('fs')
  .readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');

const splitInputStrings = rawInputContent.split(/\s/);

const parseStringToNumber = (inputStringValue) => {
  return Number(inputStringValue);
};

const executeFareCalculation = (fareDataStrings) => {
  const numericFareValues = fareDataStrings.map(val => parseStringToNumber(val));

  const firstTrainOption = numericFareValues[0];
  const secondTrainOption = numericFareValues[1];
  const firstBusOption = numericFareValues[2];
  const secondBusOption = numericFareValues[3];

  const minimumTrainFare = Math.min(firstTrainOption, secondTrainOption);
  const minimumBusFare = Math.min(firstBusOption, secondBusOption);

  const finalCalculatedSum = minimumTrainFare + minimumBusFare;

  console.log(finalCalculatedSum);
};

executeFareCalculation(splitInputStrings);
