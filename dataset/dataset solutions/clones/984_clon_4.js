const fileSystemModule = require('node:fs');
const inputFilePath = '/dev/stdin';
const newlineCharacter = '\n';

const sourceData = fileSystemModule.readFileSync(inputFilePath, 'utf8');
const dataLines = sourceData.split(newlineCharacter);

const primaryText = dataLines[0];
const totalQueries = Number(dataLines[1]);
const queryStrings = dataLines.slice(2, 2 + totalQueries);

function constructLPS(sample) {
  const patternLength = sample.length;
  const lpsArray = Array(patternLength).fill(0);
  let previousLPSLength = 0;
  let currentIndex = 1;

  while (currentIndex < patternLength) {
    if (sample[currentIndex] === sample[previousLPSLength]) {
      previousLPSLength++;
      lpsArray[currentIndex] = previousLPSLength;
      currentIndex++;
    } else {
      if (previousLPSLength !== 0) {
        previousLPSLength = lpsArray[previousLPSLength - 1];
      } else {
        lpsArray[currentIndex] = 0;
        currentIndex++;
      }
    }
  }
  return lpsArray;
}

function evaluatePresence(mainTextSource, searchPattern) {
  const mainLength = mainTextSource.length;
  const patternLength = searchPattern.length;

  if (patternLength === 0) return 1;
  if (mainLength === 0 && patternLength > 0) return 0;
  if (patternLength > mainLength) return 0;

  const patternLPS = constructLPS(searchPattern);

  let textIndex = 0;
  let patternIndex = 0;

  while (textIndex < mainLength) {
    if (searchPattern[patternIndex] === mainTextSource[textIndex]) {
      textIndex++;
      patternIndex++;
    }

    if (patternIndex === patternLength) {
      return 1;
    } else if (textIndex < mainLength && searchPattern[patternIndex] !== mainTextSource[textIndex]) {
      if (patternIndex !== 0) {
        patternIndex = patternLPS[patternIndex - 1];
      } else {
        textIndex++;
      }
    }
  }
  return 0;
}

queryStrings.forEach(currentPattern => {
  console.log(evaluatePresence(primaryText, currentPattern));
});