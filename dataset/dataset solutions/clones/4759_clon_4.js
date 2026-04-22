const operationDelta = {
  'I': 1,
  'D': -1
};

function determineAltitudePeak(pathSequence) {
  const trajectoryResult = pathSequence.split('').reduce((currentMetrics, segmentSymbol) => {
    const modification = operationDelta[segmentSymbol] || 0;
    const nextLevel = currentMetrics.currentLevel + modification;
    const highestPoint = Math.max(currentMetrics.peakLevel, nextLevel);
    return { currentLevel: nextLevel, peakLevel: highestPoint };
  }, { currentLevel: 0, peakLevel: 0 });

  return trajectoryResult.peakLevel;
}