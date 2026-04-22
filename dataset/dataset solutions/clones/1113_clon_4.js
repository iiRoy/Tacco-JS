(function applicationLauncher() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const inputData = fileContent.trim().split('\n');

  const itemCount = Number(inputData.shift());
  const collectionElements = inputData.shift().split(' ');

  const totalElementCount = collectionElements.length;
  const initialParentIndex = Math.floor(totalElementCount / 2) - 1;

  const recursiveParentIterator = (dataList, currentPosition, totalSize, subTreeAdjuster) => {
    if (currentPosition < 0) {
      return;
    }
    subTreeAdjuster(dataList, currentPosition, totalSize);
    recursiveParentIterator(dataList, currentPosition - 1, totalSize, subTreeAdjuster);
  };

  const organizeSubtree = (dataStore, rootIdentifier, dataLength) => {
    const childOneIdentifier = 2 * rootIdentifier + 1;
    const childTwoIdentifier = 2 * rootIdentifier + 2;
    let dominantNodeIdentifier = rootIdentifier;

    const rootNumericValue = Number(dataStore[rootIdentifier]);

    if (childOneIdentifier < dataLength) {
      const childOneNumericValue = Number(dataStore[childOneIdentifier]);
      if (childOneNumericValue > rootNumericValue) {
        dominantNodeIdentifier = childOneIdentifier;
      }
    }

    if (childTwoIdentifier < dataLength) {
      const childTwoNumericValue = Number(dataStore[childTwoIdentifier]);
      if (childTwoNumericValue > Number(dataStore[dominantNodeIdentifier])) {
        dominantNodeIdentifier = childTwoIdentifier;
      }
    }

    if (dominantNodeIdentifier !== rootIdentifier) {
      [dataStore[rootIdentifier], dataStore[dominantNodeIdentifier]] = [dataStore[dominantNodeIdentifier], dataStore[rootIdentifier]];
      organizeSubtree(dataStore, dominantNodeIdentifier, dataLength);
    }
  };

  recursiveParentIterator(collectionElements, initialParentIndex, totalElementCount, organizeSubtree);

  let resultAccumulator = '';
  for (let k = 0; k < collectionElements.length; k++) {
    resultAccumulator += ' ' + collectionElements[k];
  }
  console.log(resultAccumulator);
})();