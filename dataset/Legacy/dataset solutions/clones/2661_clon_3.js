'use strict'

function prepareInputLines(rawInputString) {
  const allInputSegments = rawInputString.split('\n');
  allInputSegments.pop();
  const initialLineValue = allInputSegments.shift();
  return allInputSegments;
}

function computeFactorial(numericValue) {
  if (numericValue === 0 || numericValue === 1) {
    return 1;
  }
  let currentProduct = 1;
  for (let i = 2; i <= numericValue; i++) {
    currentProduct *= i;
  }
  return currentProduct;
}

function generateAnagramGroupCounts(listOfStrings) {
  const anagramMapping = {};
  for (const currentStringItem of listOfStrings) {
    const sortedCharactersKey = currentStringItem.split('').sort().join('');
    anagramMapping[sortedCharactersKey] = (anagramMapping[sortedCharactersKey] || 0) + 1;
  }
  return anagramMapping;
}

function processAnagramPairs(inputStringCollection) {
  const groupCounts = generateAnagramGroupCounts(inputStringCollection);

  let totalCalculatedPairs = 0;

  Object.values(groupCounts).forEach(groupMemberCount => {
    if (groupMemberCount >= 2) {
      const pairsForThisGroup = computeFactorial(groupMemberCount) / 2;
      totalCalculatedPairs += pairsForThisGroup;
    }
  });

  console.log(totalCalculatedPairs);
}

function orchestrateProcessing(rawInputData) {
  const processedStringLines = prepareInputLines(rawInputData);
  processAnagramPairs(processedStringLines);
}

orchestrateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
