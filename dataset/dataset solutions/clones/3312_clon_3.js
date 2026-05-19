function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const firstSequence = inputLines.shift().split('');
  const secondSequence = inputLines.shift().split('');

  const sequenceOneLength = firstSequence.length;
  const sequenceTwoLength = secondSequence.length;

  const create2DArray = (rows, cols, initialValue) => {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
  };

  let lcsTable = create2DArray(sequenceOneLength + 1, sequenceTwoLength + 1, 0);

  const getMaximumValue = (valA, valB) => Math.max(valA, valB);
  const MATCH_INCREMENT = 1;

  for (let rowIterator = 1; rowIterator <= sequenceOneLength; rowIterator++) {
    for (let colIterator = 1; colIterator <= sequenceTwoLength; colIterator++) {
      const charFromFirst = firstSequence[rowIterator - 1];
      const charFromSecond = secondSequence[colIterator - 1];

      if (charFromFirst === charFromSecond) {
        lcsTable[rowIterator][colIterator] = getMaximumValue(lcsTable[rowIterator][colIterator], lcsTable[rowIterator - 1][colIterator - 1] + MATCH_INCREMENT);
      } else {
        lcsTable[rowIterator][colIterator] = getMaximumValue(lcsTable[rowIterator - 1][colIterator], lcsTable[rowIterator][colIterator - 1]);
      }
    }
  }

  let currentRowIndex = sequenceOneLength;
  let currentColIndex = sequenceTwoLength;
  const commonSubsequenceCharacters = [];
  const TERMINATION_INDEX = 0;

  while (currentRowIndex !== TERMINATION_INDEX && currentColIndex !== TERMINATION_INDEX) {
    const charAtCurrentRow = firstSequence[currentRowIndex - 1];
    const charAtCurrentCol = secondSequence[currentColIndex - 1];

    if (charAtCurrentRow === charAtCurrentCol) {
      commonSubsequenceCharacters.push(charAtCurrentRow);
      currentRowIndex--;
      currentColIndex--;
    } else {
      const valueFromAboveCell = lcsTable[currentRowIndex - 1][currentColIndex];
      const valueFromLeftCell = lcsTable[currentRowIndex][currentColIndex - 1];

      if (valueFromAboveCell < valueFromLeftCell) {
        currentColIndex--;
      } else {
        currentRowIndex--;
      }
    }
  }

  const finalResult = commonSubsequenceCharacters.reverse().join('');
  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
