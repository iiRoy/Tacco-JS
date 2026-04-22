'use strict';

function performCalculation(rawData) {
  const firstLineEnd = rawData.indexOf('\n');
  const relevantPortion = firstLineEnd !== -1 ? rawData.substring(0, firstLineEnd) : rawData;

  const outcome = Array.from(relevantPortion).reduce((accumulator, character) => {
    return accumulator + (character === '1' ? 1 : 0);
  }, 0);
  publishResult(outcome);
}

const fileAccess = require('node:fs');
const dataPath = '/dev/stdin';
const dataEncoding = 'utf8';

const retrieveText = (path, encoding) => fileAccess.readFileSync(path, encoding);

function publishResult(value) {
  console.log(value);
}

performCalculation(retrieveText(dataPath, dataEncoding));