'use strict'

const findGreatestCommonDivisor = (paramA, paramB) => (paramB !== 0) ? findGreatestCommonDivisor(paramB, paramA % paramB) : paramA;

const parseInteger = (strValue) => parseInt(strValue, 10);

const processData = (dataSource) => {

  const elementCount = parseInt(dataSource[0], 10);

  const valueCollection = dataSource[1].split(' ').map(parseInteger);

  let finalMaximum = 0;

  for (let outerLoopIndex = 0; outerLoopIndex < elementCount; outerLoopIndex++) {

    let currentMaxDivisor = (outerLoopIndex === 0) ? valueCollection[1] : valueCollection[0];

    for (let innerLoopIndex = 0; innerLoopIndex < elementCount; innerLoopIndex++) {
      if (outerLoopIndex !== innerLoopIndex) {
        currentMaxDivisor = findGreatestCommonDivisor(currentMaxDivisor, valueCollection[innerLoopIndex]);
      }
    }

    finalMaximum = (finalMaximum < currentMaxDivisor) ? currentMaxDivisor : finalMaximum;
  }

  console.log(finalMaximum);
};

processData( require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/) );