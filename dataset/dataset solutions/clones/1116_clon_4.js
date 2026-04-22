(() => {
  const fileSystemUtility = require('fs');
  const completeInputText = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
  const processedTextSections = completeInputText.trim().split('\n');

  const quantityLabel = Number(processedTextSections.shift()); // Consumed but not utilized, mirroring original behavior

  const rawNumericalString = processedTextSections.shift();
  const numericalArray = rawNumericalString.split(' ').map(val => parseInt(val, 10));

  const sortedPyramid = createDominantStructure(numericalArray);

  process.stdout.write(' ' + sortedPyramid.join(' ') + '\n');
})();

function createDominantStructure(dataSequence) {
  const collectionSize = dataSequence.length;

  const establishDominance = (currentRootIndex) => {
    let parentIndex = currentRootIndex;
    while (true) {
      const leftChildIndex = 2 * parentIndex + 1;
      const rightChildIndex = 2 * parentIndex + 2;
      let dominantChildOrSelfIndex = parentIndex;

      if (leftChildIndex < collectionSize && dataSequence[leftChildIndex] > dataSequence[dominantChildOrSelfIndex]) {
        dominantChildOrSelfIndex = leftChildIndex;
      }
      if (rightChildIndex < collectionSize && dataSequence[rightChildIndex] > dataSequence[dominantChildOrSelfIndex]) {
        dominantChildOrSelfIndex = rightChildIndex;
      }

      if (dominantChildOrSelfIndex !== parentIndex) {
        const temporaryStorage = dataSequence[parentIndex];
        dataSequence[parentIndex] = dataSequence[dominantChildOrSelfIndex];
        dataSequence[dominantChildOrSelfIndex] = temporaryStorage;
        parentIndex = dominantChildOrSelfIndex;
      } else {
        break;
      }
    }
  };

  for (let startingNodeIdx = Math.floor(collectionSize / 2) - 1; startingNodeIdx >= 0; startingNodeIdx--) {
    establishDominance(startingNodeIdx);
  }

  return dataSequence;
}