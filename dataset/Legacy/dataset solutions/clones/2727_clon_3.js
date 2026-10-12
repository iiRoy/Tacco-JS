'use strict';

function processInput(rawData) {
  const numericValue = Number(rawData);
  const squaredValue = numericValue * numericValue;
  const multiplierConstant = 3;
  const finalComputedResult = squaredValue * multiplierConstant;
  
  console.log(finalComputedResult);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');

processInput(fileContents);
