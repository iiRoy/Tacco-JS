function main(input) {
  const journeySegments = input.split('\n').slice(1);
  const destinationCoordinates = journeySegments.map(segment =>
    segment.split(' ').map(Number)
  );

  const finalOutcome = destinationCoordinates.reduce(
    (currentStatus, nextPoint) => {
      if (!currentStatus.possible) {
        return currentStatus;
      }

      const { time: previousTime, x: previousX, y: previousY } = currentStatus;
      const [targetTime, targetX, targetY] = nextPoint;

      const timeElapsed = targetTime - previousTime;
      const xDisplacement = targetX - previousX;
      const yDisplacement = targetY - previousY;

      const totalDisplacementSum = xDisplacement + yDisplacement;

      if (timeElapsed < totalDisplacementSum) {
        return { ...currentStatus, possible: false };
      }

      if ((timeElapsed - totalDisplacementSum) % 2 !== 0) {
        return { ...currentStatus, possible: false };
      }

      return {
        time: targetTime,
        x: targetX,
        y: targetY,
        possible: true,
      };
    },
    { time: 0, x: 0, y: 0, possible: true }
  );

  if (finalOutcome.possible) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
