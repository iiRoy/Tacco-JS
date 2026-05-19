function countSpecificCharOccurrences(textData, targetChar) {
  let currentTally = 0;
  let currentIndex = 0;
  const dataLength = textData.length;

  while (currentIndex < dataLength) {
    if (textData[currentIndex] === targetChar) {
      currentTally = currentTally + 1;
    }
    currentIndex++;
  }
  return currentTally;
}

var processInputData = function processInputData(inputStringContent) {
  const INITIAL_VALUE = 700;
  const MULTIPLIER_FACTOR = 100;

  const charOccurrences = countSpecificCharOccurrences(inputStringContent, 'o');

  const calculatedBonus = charOccurrences * MULTIPLIER_FACTOR;
  const finalResult = INITIAL_VALUE + calculatedBonus;

  console.log(finalResult);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf-8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(rawInputContent);
