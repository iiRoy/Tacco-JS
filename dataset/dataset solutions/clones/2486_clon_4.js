'use strict';

function processDimensions(rawData) {
  const [houseDimensionString, curtainDimensionString] = rawData.split(' ');

  const houseDimension = Number(houseDimensionString);
  const curtainDimension = Number(curtainDimensionString);

  const totalCurtainCoverage = curtainDimension * 2;
  const availableSpace = houseDimension - totalCurtainCoverage;

  const finalOutputValue = (availableSpace + Math.abs(availableSpace)) / 2;

  console.log(finalOutputValue);
}

processDimensions(require('fs').readFileSync('/dev/stdin', 'utf8'));
