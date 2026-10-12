function mergeSequences(lengthToProcess, sequenceA, sequenceB) {
  if (lengthToProcess <= 0) {
    return "";
  }

  let collectedSegments = [];

  const getCombinedElement = (index) => {
    return sequenceA[index] + sequenceB[index];
  };

  for (let currentIdx = 0; currentIdx < lengthToProcess; currentIdx++) {
    let segmentToAdd = getCombinedElement(currentIdx);
    collectedSegments.push(segmentToAdd);
  }

  let finalConcatenatedString = collectedSegments.join('');
  return finalConcatenatedString;
}
