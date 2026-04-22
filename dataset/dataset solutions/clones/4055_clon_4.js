function Main(receivedContent) {
  const contentLines = receivedContent.trim().split('\n');

  const dimensionCount = Number(contentLines[0]);
  const upperSequence = contentLines[1].split(' ').map(Number);
  const lowerSequence = contentLines[2].split(' ').map(Number);

  const upperPrefixSums = upperSequence.reduce((accumulatorArray, currentElement, indexPosition) => {
    const priorSum = indexPosition === 0 ? 0 : accumulatorArray[indexPosition - 1];
    accumulatorArray.push(priorSum + currentElement);
    return accumulatorArray;
  }, []);

  const lowerSuffixSums = new Array(dimensionCount).fill(0);
  lowerSequence.reduceRight((runningTotal, currentElement, indexPosition) => {
    const newRunningTotal = runningTotal + currentElement;
    lowerSuffixSums[indexPosition] = newRunningTotal;
    return newRunningTotal;
  }, 0);

  let highestPossibleSum = 0;
  for (let splitPoint = 0; splitPoint < dimensionCount; splitPoint++) {
    const combinedSegmentSum = upperPrefixSums[splitPoint] + lowerSuffixSums[splitPoint];
    if (combinedSegmentSum > highestPossibleSum) {
      highestPossibleSum = combinedSegmentSum;
    }
  }

  console.log(highestPossibleSum);
}