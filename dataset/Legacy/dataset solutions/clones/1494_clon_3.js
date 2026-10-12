const processCities = (inputString) => {
  const parsedLines = inputString.split(/\n/);
  const numericLines = parsedLines.map(line => line.split(/\s/).map(val => +val));
  return numericLines;
};

const findRelatedCities = (baseCityIndex, cityCoordinates) => {
  const matchingIndices = [];
  const currentCityCoords = cityCoordinates[baseCityIndex];

  const areCitiesRelated = (cityA, cityB) => {
    const [ax, ay] = cityA;
    const [bx, by] = cityB;
    return (ax > bx && ay > by) || (ax < bx && ay < by);
  };

  for (let otherCityIndex = 0; otherCityIndex < cityCoordinates.length; otherCityIndex++) {
    const otherCityCoords = cityCoordinates[otherCityIndex];
    if (areCitiesRelated(currentCityCoords, otherCityCoords)) {
      matchingIndices.push(otherCityIndex);
    }
  }
  return matchingIndices;
};

const addUniqueCities = (currentPath, potentialAdditions) => {
  const existingPathSet = new Set(currentPath);

  for (const candidateCity of potentialAdditions) {
    if (!existingPathSet.has(candidateCity)) {
      currentPath.push(candidateCity);
      existingPathSet.add(candidateCity);
    }
  }
  return currentPath;
};

const main = (inputString) => {
  const processedInput = processCities(inputString);
  const cityCount = processedInput[0][0];
  const cityCoordinates = processedInput.slice(1, cityCount + 1);

  const resultLengths = [];

  for (let startCityIndex = 0; startCityIndex < cityCount; startCityIndex++) {
    const reachableCities = [];
    reachableCities.push(startCityIndex);

    let queuePointer = 0;

    while (queuePointer < reachableCities.length) {
      const currentCityIdx = reachableCities[queuePointer];
      const newlyFoundCities = findRelatedCities(currentCityIdx, cityCoordinates);
      addUniqueCities(reachableCities, newlyFoundCities);
      queuePointer++;
    }

    const pathLength = reachableCities.length;
    resultLengths[startCityIndex] = pathLength;
  }
  console.log(resultLengths.join("\n"));
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
