console.log((inputString => {
  const processInputData = (dataString) => {
    const lines = dataString.trim().split('\n');
    const pointCount = parseInt(lines[0], 10);

    const redPointsCollection = [];
    const bluePointsCollection = [];

    for (let k = 0; k < pointCount; k++) {
      const [xCoord, yCoord] = lines[k + 1].split(' ').map(val => parseInt(val, 10));
      redPointsCollection.push({ x: xCoord, y: yCoord, uniqueId: Symbol() });
    }

    for (let k = 0; k < pointCount; k++) {
      const [xCoord, yCoord] = lines[pointCount + k + 1].split(' ').map(val => parseInt(val, 10));
      bluePointsCollection.push({ x: xCoord, y: yCoord });
    }

    return { totalPoints: pointCount, initialRedSet: redPointsCollection, initialBlueSet: bluePointsCollection };
  };

  const { totalPoints, initialRedSet, initialBlueSet } = processInputData(inputString);

  initialBlueSet.sort((first, second) => first.x - second.x);

  const finalResult = initialBlueSet.reduce((accumulatorState, currentBluePoint) => {
    let { currentMatchCount, availableRedSet } = accumulatorState;
    const { x: currentBlueX, y: currentBlueY } = currentBluePoint;

    const potentialRedMatches = availableRedSet.filter(redP => redP.x < currentBlueX && redP.y < currentBlueY);

    if (potentialRedMatches.length > 0) {
      const bestRedCandidate = potentialRedMatches.reduce((bestFound, currentCandidate) => {
        return (currentCandidate.y > bestFound.y) ? currentCandidate : bestFound;
      }, potentialRedMatches[0]);

      currentMatchCount++;
      availableRedSet = availableRedSet.filter(redP => redP.uniqueId !== bestRedCandidate.uniqueId);
    }

    return { currentMatchCount, availableRedSet };
  }, { currentMatchCount: 0, availableRedSet: initialRedSet });

  return `${finalResult.currentMatchCount}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
