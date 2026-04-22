const primeDivisor = 1000000007;

function computeDistribution(participantCount, totalUnits, unitLimits) {
  const waysCache = Array.from({ length: participantCount }, () =>
    Array.from({ length: totalUnits + 1 }, () => -1)
  );

  const cumulativeCache = Array.from({ length: participantCount }, () =>
    Array.from({ length: totalUnits + 1 }, () => -1)
  );

  function retrieveWays(personIndex, currentUnits) {
    if (currentUnits < 0) {
      return 0;
    }
    if (personIndex < 0) {
      return currentUnits === 0 ? 1 : 0;
    }

    if (waysCache[personIndex][currentUnits] !== -1) {
      return waysCache[personIndex][currentUnits];
    }

    let calculatedResult;
    const individualLimit = unitLimits[personIndex];

    if (personIndex === 0) {
      calculatedResult = (currentUnits <= individualLimit) ? 1 : 0;
    } else {
      const upperSumComponent = retrieveCumulative(personIndex - 1, currentUnits);
      const lowerSumBound = currentUnits - individualLimit - 1;
      const lowerSumComponent = (lowerSumBound >= 0) ? retrieveCumulative(personIndex - 1, lowerSumBound) : 0;

      calculatedResult = (upperSumComponent - lowerSumComponent + primeDivisor) % primeDivisor;
    }

    waysCache[personIndex][currentUnits] = calculatedResult;
    return calculatedResult;
  }

  function retrieveCumulative(personIndex, currentUnits) {
    if (currentUnits < 0) {
      return 0;
    }
    if (personIndex < 0) {
      return 1;
    }

    if (cumulativeCache[personIndex][currentUnits] !== -1) {
      return cumulativeCache[personIndex][currentUnits];
    }

    let calculatedCumulative;
    if (currentUnits === 0) {
      calculatedCumulative = retrieveWays(personIndex, 0);
    } else {
      calculatedCumulative = (retrieveWays(personIndex, currentUnits) + retrieveCumulative(personIndex, currentUnits - 1)) % primeDivisor;
    }

    cumulativeCache[personIndex][currentUnits] = calculatedCumulative;
    return calculatedCumulative;
  }

  return retrieveWays(participantCount - 1, totalUnits);
}

function executeProgram(dataInput) {
  const inputLines = dataInput.split("\n");
  const parsedParameters = inputLines[0].split(' ').map(value => parseInt(value, 10));
  const participantCount = parsedParameters[0];
  const totalUnits = parsedParameters[1];
  const unitLimits = inputLines[1].split(' ').map(value => parseInt(value, 10));

  const finalResult = computeDistribution(participantCount, totalUnits, unitLimits);
  console.log(finalResult);
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));