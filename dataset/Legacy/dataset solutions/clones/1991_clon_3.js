function processSequence(sequenceLengthStr, inputSequence) {
  const len = parseInt(sequenceLengthStr, 10);
  const charArray = inputSequence.split('');

  let redCount = 0;
  let greenCount = 0;
  let blueCount = 0;

  for (const currentChar of charArray) {
    switch (currentChar) {
      case 'R':
        redCount++;
        break;
      case 'G':
        greenCount++;
        break;
      case 'B':
        blueCount++;
        break;
    }
  }

  const initialCombinations = redCount * greenCount * blueCount;
  let validTripletCount = 0;

  const checkTripletConditions = (sequenceChars, indexA, indexB, sequenceLength) => {
    const charA = sequenceChars[indexA];
    const charB = sequenceChars[indexB];

    // Condition 1: The characters at indexA and indexB must be different.
    if (charA === charB) {
      return false;
    }

    const indexC = 2 * indexB - indexA;

    // Condition 2: The third index must be within bounds.
    if (indexC >= sequenceLength) {
      return false;
    }

    const charC = sequenceChars[indexC];

    // Condition 3 & 4: The character at indexC must be different from charA and charB.
    if (charA === charC || charB === charC) {
      return false;
    }

    return true; // All conditions met, this is a valid triplet.
  };

  for (let idx1 = 0; idx1 < len; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < len; idx2++) {
      if (checkTripletConditions(charArray, idx1, idx2, len)) {
        validTripletCount++;
      }
    }
  }

  console.log(initialCombinations - validTripletCount);
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');

processSequence(inputData[0], inputData[1]);
