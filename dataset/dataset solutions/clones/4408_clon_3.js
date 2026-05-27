function computeRectangleArea(numItems, segmentLengths) {
  segmentLengths.sort((valA, valB) => valB - valA);

  const collectedDimensions = [];
  let currentIndex = 0;
  const lastPossibleIndex = segmentLengths.length - 1;

  while (currentIndex < lastPossibleIndex && collectedDimensions.length < 2) {
    const currentSegmentValue = segmentLengths[currentIndex];
    const nextSegmentValue = segmentLengths[currentIndex + 1];

    if (currentSegmentValue === nextSegmentValue) {
      collectedDimensions.push(currentSegmentValue);
      currentIndex += 2;
    } else {
      currentIndex++;
    }
  }

  const dimensionOne = collectedDimensions.length > 0 ? collectedDimensions[0] : 0;
  const dimensionTwo = collectedDimensions.length > 1 ? collectedDimensions[1] : 0;

  return dimensionOne * dimensionTwo;
}
