const evaluateTravelPossibility = (requiredDistance, availableTime, travelSpeed) => {
  const maximumReachableDistance = travelSpeed * availableTime;
  return maximumReachableDistance >= requiredDistance;
};

const processTravelScenario = (inputDataString) => {
  const [distanceString, timeString, speedString] = inputDataString.split(" ");
  
  const targetDistance = parseInt(distanceString, 10);
  const timeLimit = parseInt(timeString, 10);
  const currentSpeed = parseInt(speedString, 10);

  const canCompleteJourney = evaluateTravelPossibility(targetDistance, timeLimit, currentSpeed);

  if (canCompleteJourney) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processTravelScenario(require('fs').readFileSync('/dev/stdin', 'utf8'));
