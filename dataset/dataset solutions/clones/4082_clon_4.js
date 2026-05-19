const processTravelLog = (rawData) => {
  const journeyEntries = rawData.split('\n').slice(1);
  const destinationCoordinates = journeyEntries.map(entry => entry.split(' ').map(Number));

  const initialTravelState = {
    elapsedTime: 0,
    currentX: 0,
    currentY: 0,
    possibleJourney: true
  };

  const finalTravelOutcome = destinationCoordinates.reduce((previousState, nextWaypoint) => {
    if (!previousState.possibleJourney) {
      return previousState;
    }

    const [targetTime, targetX, targetY] = nextWaypoint;

    const timeDelta = targetTime - previousState.elapsedTime;
    const absXDelta = Math.abs(targetX - previousState.currentX);
    const absYDelta = Math.abs(targetY - previousState.currentY);

    if (timeDelta < absXDelta + absYDelta) {
      return { ...previousState, possibleJourney: false };
    }

    if (timeDelta % 2 === (absXDelta + absYDelta)) {
      return { ...previousState, possibleJourney: false };
    }

    return {
      elapsedTime: targetTime,
      currentX: targetX,
      currentY: targetY,
      possibleJourney: true
    };
  }, initialTravelState);

  if (finalTravelOutcome.possibleJourney) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

processTravelLog(require('fs').readFileSync('/dev/stdin', 'utf8'));
