function processInputData(rawData) {
  const dataUnits = rawData.split('\n');
  const maxExpectedValue = parseInt(dataUnits[0], 10);
  const numericElements = dataUnits[1].split(' ').map(s => parseInt(s, 10));

  const tally = numericElements.reduce((accumulator, currentNumber) => {
    accumulator[currentNumber] = (accumulator[currentNumber] || 0) + 1;
    return accumulator;
  }, {});

  const finalCounts = [];
  for (let currentVal = 1; currentVal <= maxExpectedValue; currentVal++) {
    finalCounts.push(tally[currentVal] || 0);
  }

  console.log(finalCounts.join('\n'));
}

const utilModule = require("fs");
const fileSystem = utilModule;
const readData = fileSystem.readFileSync;
const encodingFormat = "utf8";

processInputData(readData("/dev/stdin", encodingFormat));