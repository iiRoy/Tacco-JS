function calculateAverageTemperature(initialTemp, altitudeFactor, decreaseFactor) {
  return initialTemp - (altitudeFactor * decreaseFactor);
}

function processInput(rawData) {
  const lines = rawData.split('\n');

  let smallestDiff = Infinity;
  let bestIndex = -1;

  const TEMP_DECREASE_FACTOR = 0.006;

  const totalLocations = parseInt(lines[0], 10);
  
  const tempAndTargetParts = lines[1].split(' ');
  const baseTemp = parseInt(tempAndTargetParts[0], 10);
  const targetTemp = parseInt(tempAndTargetParts[1], 10);
  
  const locations = lines[2].split(' ').map(val => parseInt(val, 10));

  for (let k = 0; k < locations.length; k++) {
    const currentAltitude = locations[k];
    const currentAvgTemp = calculateAverageTemperature(baseTemp, currentAltitude, TEMP_DECREASE_FACTOR);
    const currentDiff = Math.abs(targetTemp - currentAvgTemp);

    if (currentDiff <= smallestDiff) {
      smallestDiff = currentDiff;
      bestIndex = k;
    }
  }

  console.log((bestIndex + 1).toString());
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
