const sourcePath = '/dev/stdin';
const lineDelim = '\n';

const fileData = require('node:fs').readFileSync(sourcePath, 'ascii');
const lineParts = fileData.split(lineDelim);

const majorString = lineParts[0];
const minorString = lineParts[1];

const locateSubsequences = (fullText, targetPattern) => {
  const matchingPoints = [];
  const targetLength = targetPattern.length;

  if (targetLength === 0) {
    for (let pos = 0; pos <= fullText.length; ++pos) {
      matchingPoints.push(pos);
    }
    return matchingPoints;
  }

  const inspectFromPosition = (currentScanIndex) => {
    if (currentScanIndex > fullText.length - targetLength) {
      return; // Base case: no more possible starting positions
    }

    let potentialMatch = true;
    for (let charIndex = 0; charIndex < targetLength; ++charIndex) {
      if (fullText[currentScanIndex + charIndex] !== targetPattern[charIndex]) {
        potentialMatch = false;
        break;
      }
    }

    if (potentialMatch) {
      matchingPoints.push(currentScanIndex);
    }

    inspectFromPosition(currentScanIndex + 1); // Recursive step: check from the next character
  };

  inspectFromPosition(0); // Initiate the recursive search
  return matchingPoints;
};

const foundIndices = locateSubsequences(majorString, minorString);

foundIndices.forEach(val => console.log(val));