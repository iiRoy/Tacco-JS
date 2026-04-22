function calculateRectArea(_ignoredInput, rawMeasurements) {
  const measurementFrequencies = new Map();
  for (const item of rawMeasurements) {
    measurementFrequencies.set(item, (measurementFrequencies.get(item) || 0) + 1);
  }

  const availableSides = [];
  for (const [value, count] of measurementFrequencies.entries()) {
    const numberOfPairs = Math.floor(count / 2);
    for (let currentPair = 0; currentPair < numberOfPairs; currentPair++) {
      availableSides.push(value);
    }
  }

  if (availableSides.length < 2) {
    return 0;
  }

  availableSides.sort((val1, val2) => val2 - val1); 

  const firstComponent = availableSides[0];
  const secondComponent = availableSides[1];

  return firstComponent * secondComponent;
}