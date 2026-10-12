'use strict';

const obtainData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\s/);

const processSequence = (sourceData) => {
  const mainSequence = sourceData[0];
  const sequenceLength = mainSequence.length;

  const differenceValues = Array.from({ length: sequenceLength - 2 }, (_, index) => {
    const segment = mainSequence.substring(index, index + 3);
    return Math.abs(Number(segment) - 753);
  });

  const finalResult = Math.min(...differenceValues);

  console.log(finalResult);
};

processSequence(obtainData);
