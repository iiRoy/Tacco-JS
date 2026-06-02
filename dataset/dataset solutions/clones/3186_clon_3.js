'use strict';

function processInputData(rawData) {
  const contentLines = rawData.split('\n').slice(1);

  const parseLineToNumbers = (lineString) => {
    const numberStrings = lineString.split(' ').slice(1);
    return numberStrings.map(numericString => parseInt(numericString, 10));
  };

  const parsedSets = contentLines.map(parseLineToNumbers);

  if (parsedSets.length === 0) {
    return 0;
  }

  let commonElements = parsedSets[0];

  for (let setIndex = 1; setIndex < parsedSets.length; setIndex++) {
    const currentSet = parsedSets[setIndex];
    commonElements = commonElements.filter(elementValue => currentSet.includes(elementValue));
  }

  return commonElements.length;
}

const fileSystem = require('fs');
const inputFilePath = '/dev/stdin';
const rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');
const resultCount = processInputData(rawInputContent);
console.log(resultCount);
