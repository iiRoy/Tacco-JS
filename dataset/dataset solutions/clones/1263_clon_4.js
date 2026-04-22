'use strict';
(function(sourceData) {

  const buildPattern = (dimensions) => {
    const [colCount, rowCount] = dimensions;

    const borderString = '#'.repeat(colCount);

    let internalString;
    if (colCount < 2) {
        internalString = "##";
    } else {
        internalString = '#' + '.'.repeat(colCount - 2) + '#';
    }

    const lineComponents = [];

    if (rowCount > 2) {
      Array.from({ length: rowCount - 2 }).forEach(() => lineComponents.push(internalString));
    }

    lineComponents.push(borderString);
    lineComponents.unshift(borderString);

    return lineComponents.join('\n');
  };

  const parseMeasurements = (rawInput) => {
    const cleansedInput = rawInput.toString().trim();
    const measurementSets = [];
    const measurementRegex = /(\d+)\s+(\d+)/g;
    let currentMatch;

    while ((currentMatch = measurementRegex.exec(cleansedInput)) !== null) {
      const firstNum = parseInt(currentMatch[1], 10);
      const secondNum = parseInt(currentMatch[2], 10);

      if (firstNum === 0 && secondNum === 0) {
        break;
      }
      measurementSets.push([firstNum, secondNum]);
    }
    return measurementSets;
  };

  const dimensionCollection = parseMeasurements(sourceData);

  const finalConstruction = dimensionCollection.reduce((accumulatorString, currentDimensions, index) => {
    const sectionOutput = buildPattern(currentDimensions);
    if (index === 0) {
      return sectionOutput;
    } else {
      return accumulatorString + '\n\n' + sectionOutput;
    }
  }, '');

  console.log(finalConstruction);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));