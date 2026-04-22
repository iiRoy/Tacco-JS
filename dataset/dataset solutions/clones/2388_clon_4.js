'use strict'
function processEntry(receivedInput) {
  const dayValueMap = {
    'SUN': 7,
    'MON': 6,
    'TUE': 5,
    'WED': 4,
    'THU': 3,
    'FRI': 2,
    'SAT': 1
  };

  const targetDay = receivedInput.split('\n')[0];
  const resultNumber = dayValueMap[targetDay];
  console.log(resultNumber);
}

const systemIO = require('fs');
const inputFilePath = '/dev/stdin';
const encodingType = 'utf8';

processEntry(systemIO.readFileSync(inputFilePath, encodingType));