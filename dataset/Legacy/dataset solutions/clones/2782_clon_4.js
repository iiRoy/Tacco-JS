function processSequence(sourceData) {
  const sequenceElements = sourceData.split("\n")[1].split(" ");

  const monotonicCount = sequenceElements.reduce((accumulatorValue, currentItem, itemIndex, fullSequence) => {
    if (itemIndex > 0 && itemIndex < fullSequence.length - 1) {
      const priorItem = fullSequence[itemIndex - 1];
      const subsequentItem = fullSequence[itemIndex + 1];

      const isStrictlyIncreasing = (priorItem < currentItem) && (currentItem < subsequentItem);
      const isStrictlyDecreasing = (priorItem > currentItem) && (currentItem > subsequentItem);

      if (isStrictlyIncreasing || isStrictlyDecreasing) {
        return accumulatorValue + 1;
      }
    }
    return accumulatorValue;
  }, 0);

  console.log(monotonicCount);
}

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
