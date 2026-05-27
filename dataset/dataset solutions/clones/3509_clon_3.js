function countFrequencies(sourceArray, startIndex, step) {
  const frequencyMap = {};
  for (let k = startIndex; k < sourceArray.length; k += step) {
    const currentVal = sourceArray[k];
    frequencyMap[currentVal] = (frequencyMap[currentVal] || 0) + 1;
  }
  return frequencyMap;
}

function getSortedKeysByCount(freqMap) {
  return Object.keys(freqMap).sort((keyA, keyB) => freqMap[keyB] - freqMap[keyA]);
}

function processInput(rawData) {
  const arrayLength = parseInt(rawData[0].split(" ")[0], 10);
  const numericValues = rawData[1].split(" ").map(Number);

  const evenIndexedCounts = countFrequencies(numericValues, 0, 2);
  const oddIndexedCounts = countFrequencies(numericValues, 1, 2);

  const sortedEvenKeys = getSortedKeysByCount(evenIndexedCounts);
  const sortedOddKeys = getSortedKeysByCount(oddIndexedCounts);

  let totalMismatches = 0;
  let evenBaseIndex = 0;
  let oddBaseIndex = 0;

  const topEvenKey = sortedEvenKeys[0];
  const topOddKey = sortedOddKeys[0];

  if (topEvenKey === topOddKey) {
    const secondEvenKey = sortedEvenKeys[1];
    const secondOddKey = sortedOddKeys[1];

    if (secondEvenKey > secondOddKey) {
      evenBaseIndex = 0;
      oddBaseIndex = 1;
    } else {
      evenBaseIndex = 1;
      oddBaseIndex = 0;
    }
  } else {
    evenBaseIndex = 0;
    oddBaseIndex = 0;
  }

  totalMismatches += sortedEvenKeys.filter((_val, idx) => idx !== evenBaseIndex)
                                   .reduce((sum, key) => sum + evenIndexedCounts[key], 0);

  totalMismatches += sortedOddKeys.filter((_val, idx) => idx !== oddBaseIndex)
                                  .reduce((sum, key) => sum + oddIndexedCounts[key], 0);

  console.log(totalMismatches);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
