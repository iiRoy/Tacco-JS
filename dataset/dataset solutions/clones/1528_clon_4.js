"use strict";
const processInput = (rawData) => {
  const numericalComponents = rawData.trim().split(' ').map(str => Number(str));
  const [firstFactor, secondFactor, thirdFactor, fourthFactor] = numericalComponents;

  const productSet = [
    firstFactor * thirdFactor,
    firstFactor * fourthFactor,
    secondFactor * thirdFactor,
    secondFactor * fourthFactor
  ];

  const peakValue = Math.max(...productSet);

  console.log(peakValue.toString());
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
