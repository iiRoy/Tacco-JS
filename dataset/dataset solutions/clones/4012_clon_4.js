'use strict';

function processInput(inputString) {
  const lines = inputString.split('\n');

  const nameList = lines.slice(1, -1);

  const targetLetters = ['M', 'A', 'R', 'C', 'H'];

  const letterOccurrences = nameList.reduce((accumulator, currentName) => {
    const firstLetter = currentName.charAt(0);
    if (targetLetters.includes(firstLetter)) {
      accumulator[firstLetter] = (accumulator[firstLetter] || 0) + 1;
    }
    return accumulator;
  }, {});

  const countArray = targetLetters.map(charKey => letterOccurrences[charKey] || 0);

  let resultAccumulator = 0;

  const arrayLength = countArray.length;

  for (let idx1 = 0; idx1 < arrayLength; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < arrayLength; idx2++) {
      for (let idx3 = idx2 + 1; idx3 < arrayLength; idx3++) {
        resultAccumulator += countArray[idx1] * countArray[idx2] * countArray[idx3];
      }
    }
  }

  console.log(resultAccumulator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
