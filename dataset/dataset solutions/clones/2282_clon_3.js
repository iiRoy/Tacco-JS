const collectedInputLines = [];

const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputLineReader.on('line', (singleLine) => {
  collectedInputLines.push(singleLine);
});

inputLineReader.on('close', () => {
  const numberOfElements = parseInt(collectedInputLines[0], 10);

  let rankOfPermutationA = 0;
  let rankOfPermutationB = 0;

  const firstTargetPermutation = collectedInputLines[1].split(' ').map(sVal => +sVal);
  const secondTargetPermutation = collectedInputLines[2].split(' ').map(s => Number(s));

  const doArraysMatch = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let currentIdx = 0; currentIdx < arr1.length; currentIdx++) {
      if (arr1[currentIdx] !== arr2[currentIdx]) {
        return false;
      }
    }
    return true;
  };

  function calculateAllPermutations(availableItems, desiredLength) {
    const generatedPermutations = [];
    const totalAvailable = availableItems.length;

    if (totalAvailable < desiredLength) {
      return [];
    }

    if (desiredLength === 1) {
      return availableItems.map(item => [item]);
    }

    for (let currentPos = 0; currentPos < totalAvailable; currentPos++) {
      const selectedItem = availableItems[currentPos];
      const remainingItemsForSubPerm = availableItems.filter((_, index) => index !== currentPos);

      const subPermutations = calculateAllPermutations(remainingItemsForSubPerm, desiredLength - 1);

      for (const subPerm of subPermutations) {
        generatedPermutations.push([selectedItem, ...subPerm]);
      }
    }
    return generatedPermutations;
  }

  const baseSequence = Array.from({ length: numberOfElements }, (_, idx) => idx + 1);

  const allPossibleOrderings = calculateAllPermutations(baseSequence, numberOfElements);

  let currentOrdinalPosition = 0;

  for (const currentOrdering of allPossibleOrderings) {
    currentOrdinalPosition++;

    if (doArraysMatch(currentOrdering, firstTargetPermutation)) {
      rankOfPermutationA = currentOrdinalPosition;
    }

    if (doArraysMatch(currentOrdering, secondTargetPermutation)) {
      rankOfPermutationB = currentOrdinalPosition;
    }
  }

  console.log(Math.abs(rankOfPermutationA - rankOfPermutationB));
});