'use strict';

function processInput(rawData) {
  const lines = rawData.split('\n');
  const troopCount = Number(lines[0]);
  const troopDirections = lines[1];

  const eastCountsPrefixSum = new Array(troopCount + 1).fill(0);

  for (let idx = 0; idx < troopCount; ++idx) {
    const previousEastCount = eastCountsPrefixSum[idx];
    eastCountsPrefixSum[idx + 1] = previousEastCount + (troopDirections[idx] === 'E' ? 1 : 0);
  }

  let minTurnsRequired = Number.MAX_SAFE_INTEGER;

  for (let pivotIndex = 1; pivotIndex <= troopCount; ++pivotIndex) {
    const totalElementsToLeft = pivotIndex - 1;
    const eastCountInLeftSegment = eastCountsPrefixSum[pivotIndex - 1];
    const westCountInLeftSegment = totalElementsToLeft - eastCountInLeftSegment;

    const totalEastCountOverall = eastCountsPrefixSum[troopCount];
    const eastCountInRightSegment = totalEastCountOverall - eastCountInLeftSegment;

    const currentTotalTurns = westCountInLeftSegment + eastCountInRightSegment;
    minTurnsRequired = Math.min(minTurnsRequired, currentTotalTurns);
  }

  console.log(minTurnsRequired);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
