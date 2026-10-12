function processData(rawData) {
  const trimmedInput = rawData.trim();
  const inputLines = trimmedInput.split('\n');

  const firstLineSegments = inputLines[0].split(' ');
  const numberOfLocations = parseInt(firstLineSegments[0], 10);

  const secondLineSegments = inputLines[1].split(' ');
  const initialTemperature = parseInt(secondLineSegments[0], 10);
  const desiredTemperature = parseInt(secondLineSegments[1], 10);

  const locationAltitudes = inputLines[2].split(' ').map((altitudeStr) => parseInt(altitudeStr, 10));

  let minimumTemperatureDifference = Infinity;
  let optimalLocationIndex = -1;

  const temperatureDropFactor = 0.006;

  for (let currentLocIndex = 0; currentLocIndex < numberOfLocations; currentLocIndex++) {
    const currentAltitudeValue = locationAltitudes[currentLocIndex];
    const altitudeEffectOnTemp = currentAltitudeValue * temperatureDropFactor;
    const calculatedTemperatureAtAltitude = initialTemperature - altitudeEffectOnTemp;
    const absoluteDifferenceFromDesired = Math.abs(calculatedTemperatureAtAltitude - desiredTemperature);

    if (absoluteDifferenceFromDesired < minimumTemperatureDifference) {
      minimumTemperatureDifference = absoluteDifferenceFromDesired;
      optimalLocationIndex = currentLocIndex;
    }
  }

  console.log(optimalLocationIndex + 1);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
