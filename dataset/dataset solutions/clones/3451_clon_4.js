function processData(rawInput) {
  const cleanedInput = rawInput.trim();
  const inputLines = cleanedInput.split('\n');

  const [elementCount] = inputLines[0].split(' ').map(Number);
  const [baseTemperature, desiredAltitude] = inputLines[1].split(' ').map(Number);
  const elevationValues = inputLines[2].split(' ').map(Number);

  const resultInfo = elevationValues.reduce((accumulator, currentElevation, currentIndex) => {
    const calculatedTemperature = baseTemperature - currentElevation * 0.006;
    const currentAbsoluteDifference = Math.abs(calculatedTemperature - desiredAltitude);

    if (currentAbsoluteDifference < accumulator.minimumDifference) {
      return {
        minimumDifference: currentAbsoluteDifference,
        optimalLocationIdentifier: currentIndex + 1
      };
    }
    return accumulator;
  }, { minimumDifference: Number.MAX_VALUE, optimalLocationIdentifier: -1 });

  console.log(resultInfo.optimalLocationIdentifier);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
