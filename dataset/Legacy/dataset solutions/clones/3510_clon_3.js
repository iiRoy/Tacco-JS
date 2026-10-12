function processInput(rawData) {
  const lines = rawData.split('\n');
  const totalCount = parseInt(lines[0], 10);
  const allNumbersStr = lines[1].split(' ');

  const oddIndexedNums = [];
  const evenIndexedNums = [];

  const populateIndexedArrays = (count, numStrings, evensArray, oddsArray) => {
    for (let idx = 0; idx < count; idx++) {
      const currentNum = parseInt(numStrings[idx], 10);
      if (idx % 2 === 0) {
        evensArray.push(currentNum);
      } else {
        oddsArray.push(currentNum);
      }
    }
  };

  populateIndexedArrays(totalCount, allNumbersStr, evenIndexedNums, oddIndexedNums);

  evenIndexedNums.sort((a, b) => a - b);
  oddIndexedNums.sort((a, b) => a - b);

  const getTopTwoModes = (numberArray) => {
    if (numberArray.length === 0) {
      return [[null, 0], [null, 0]];
    }

    const frequencyMap = new Map();
    for (const num of numberArray) {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }

    let frequencyEntries = Array.from(frequencyMap.entries());

    frequencyEntries.sort((itemA, itemB) => itemB[1] - itemA[1]);

    const primaryMode = frequencyEntries[0] || [null, 0];
    const secondaryMode = frequencyEntries[1] || [null, 0];

    return [primaryMode, secondaryMode];
  };

  const evenModesData = getTopTwoModes(evenIndexedNums);
  const oddModesData = getTopTwoModes(oddIndexedNums);

  let minReplacements = 0;

  const primaryEvenValue = evenModesData[0][0];
  const primaryEvenCount = evenModesData[0][1];
  const secondaryEvenCount = evenModesData[1][1];

  const primaryOddValue = oddModesData[0][0];
  const primaryOddCount = oddModesData[0][1];
  const secondaryOddCount = oddModesData[1][1];

  if (primaryEvenValue !== primaryOddValue) {
    minReplacements = totalCount - (primaryEvenCount + primaryOddCount);
  } else {
    const replacementsIfEvenPrimaryKept = totalCount - (primaryEvenCount + secondaryOddCount);
    const replacementsIfOddPrimaryKept = totalCount - (secondaryEvenCount + primaryOddCount);

    minReplacements = Math.min(replacementsIfEvenPrimaryKept, replacementsIfOddPrimaryKept);
  }
  console.log(minReplacements);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
