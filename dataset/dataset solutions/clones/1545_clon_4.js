const evaluateJourney = (travelLog) => {
  const numericComponents = travelLog.match(/\d+/g).map(Number);

  const targetSpan = numericComponents[0];
  const temporalBound = numericComponents[1];
  const paceRate = numericComponents[2];

  const outcomeIndicators = ['NO', 'YES'];

  const attainedDistance = paceRate * temporalBound;
  const achievementStatus = (Math.max(attainedDistance, targetSpan) === attainedDistance);

  console.log(outcomeIndicators[Number(achievementStatus)]);
};

evaluateJourney(require('fs').readFileSync('/dev/stdin', 'utf8'));