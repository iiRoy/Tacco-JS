console.log((function(rawContent){
  const lineSegments = rawContent.trim().split('\n');
  const entityCount = parseInt(lineSegments[0].split(' ')[0], 10);

  const entireCollection = lineSegments.slice(1).map(segment => {
    const [xVal, yVal] = segment.split(' ').map(Number);
    return { horizontal: xVal, vertical: yVal };
  });

  const primaryElements = entireCollection.slice(0, entityCount);
  const secondaryElements = entireCollection.slice(entityCount);

  const orderedPrimary = primaryElements.sort((e1, e2) => e2.horizontal - e1.horizontal);
  const orderedSecondary = secondaryElements.sort((e1, e2) => e2.horizontal - e1.horizontal);

  const pairingResult = orderedSecondary.reduce((accumulator, currentSecondary) => {
    const { totalMatches, availablePrimary } = accumulator;
    const { horizontal: secondaryX, vertical: secondaryY } = currentSecondary;

    const eligiblePrimaryIndex = availablePrimary.findIndex(primaryItem =>
      primaryItem.horizontal < secondaryX && primaryItem.vertical < secondaryY
    );

    if (eligiblePrimaryIndex !== -1) {
      const updatedPrimarySet = availablePrimary.filter((_, idx) => idx !== eligiblePrimaryIndex);
      return {
        totalMatches: totalMatches + 1,
        availablePrimary: updatedPrimarySet
      };
    } else {
      return {
        totalMatches: totalMatches,
        availablePrimary: availablePrimary
      };
    }
  }, { totalMatches: 0, availablePrimary: orderedPrimary });

  return `${pairingResult.totalMatches}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));