'use strict';

function createLcsTable(numRows, numCols) {
  const table = new Array(numRows);
  for (let r = 0; r < numRows; r++) {
    table[r] = new Array(numCols).fill(null).map(() => [0, '']);
  }
  return table;
}

function calculateLCS(strA, strB) {
  const lenA = strA.length;
  const lenB = strB.length;

  const lcsTable = createLcsTable(lenA + 1, lenB + 1);

  for (let idxA = 1; idxA <= lenA; idxA++) {
    for (let idxB = 1; idxB <= lenB; idxB++) {
      const charA = strA[idxA - 1];
      const charB = strB[idxB - 1];

      if (charA === charB) {
        const [prevLen, prevStr] = lcsTable[idxA - 1][idxB - 1];
        lcsTable[idxA][idxB] = [1 + prevLen, prevStr + charA];
      } else {
        const prevCellFromUp = lcsTable[idxA - 1][idxB];
        const prevCellFromLeft = lcsTable[idxA][idxB - 1];

        if (prevCellFromLeft[0] > prevCellFromUp[0]) {
          lcsTable[idxA][idxB] = prevCellFromLeft;
        } else {
          lcsTable[idxA][idxB] = prevCellFromUp;
        }
      }
    }
  }
  return lcsTable[lenA][lenB][1];
}

function processInputAndSolve(rawInput) {
  const inputLines = rawInput.split('\n');
  const firstString = inputLines[0];
  const secondString = inputLines[1];
  const resultLCS = calculateLCS(firstString, secondString);
  console.log(resultLCS);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
