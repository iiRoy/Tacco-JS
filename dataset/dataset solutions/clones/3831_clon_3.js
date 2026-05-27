function getUniqueElements(inputCollection) {
  const seenElements = new Set();
  const distinctElements = [];
  for (const currentElement of inputCollection) {
    if (!seenElements.has(currentElement)) {
      seenElements.add(currentElement);
      distinctElements.push(currentElement);
    }
  }
  return distinctElements;
}

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const targetString = inputLines[0];
  const selectionCount = parseInt(inputLines[1], 10);

  const generateAllSubstrings = (sourceStr) => {
    const generatedSubstrings = [];
    const strLength = sourceStr.length;
    for (let startIndex = 0; startIndex < strLength; startIndex++) {
      for (let lengthOffset = 0; lengthOffset < strLength - startIndex; lengthOffset++) {
        const endIndex = startIndex + lengthOffset + 1;
        generatedSubstrings.push(sourceStr.slice(startIndex, endIndex));
      }
    }
    return generatedSubstrings;
  };

  let substringsCollection = generateAllSubstrings(targetString);
  substringsCollection = getUniqueElements(substringsCollection);

  const sortedUniqueSubstrings = [];
  const totalSubstrings = substringsCollection.length;

  for (let selectionIndex = 0; selectionIndex < selectionCount; selectionIndex++) {
    let smallestCandidateString = '';
    let isFirstCandidateFound = false;

    for (let candidateIndex = 0; candidateIndex < totalSubstrings; candidateIndex++) {
      const evaluatedString = substringsCollection[candidateIndex];
      const isAlreadySelected = sortedUniqueSubstrings.includes(evaluatedString);

      if (isAlreadySelected) {
        continue;
      }

      if (!isFirstCandidateFound) {
        smallestCandidateString = evaluatedString;
        isFirstCandidateFound = true;
      } else if (evaluatedString < smallestCandidateString) {
        smallestCandidateString = evaluatedString;
      }
    }
    sortedUniqueSubstrings.push(smallestCandidateString);
  }

  console.log(sortedUniqueSubstrings[sortedUniqueSubstrings.length - 1]);
}

const fileSystem = require('fs');
const inputFilePath = '/dev/stdin';
const fileContent = fileSystem.readFileSync(inputFilePath, 'utf8');
processInputData(fileContent);
