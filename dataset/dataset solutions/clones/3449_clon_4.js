function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const [_, temperatureAltitudeLine, heightValuesLine] = inputLines;
    const [initialTemperatureStr, desiredAltitudeStr] = temperatureAltitudeLine.split(" ");
    const locationHeightsStrs = heightValuesLine.split(" ");

    const initialTemperature = Number(initialTemperatureStr);
    const desiredAltitude = Number(desiredAltitudeStr);

    const locationHeights = locationHeightsStrs.map(Number);

    const calculationResult = locationHeights.reduce((accumulator, currentHeightValue, currentIndex) => {
        const currentCalculatedTemperature = initialTemperature - currentHeightValue * 0.006;

        const altitudeDifferenceComponent = (desiredAltitude >= 0)
            ? (desiredAltitude - currentCalculatedTemperature)
            : (desiredAltitude + currentCalculatedTemperature);

        const currentAbsoluteDifference = Math.abs(altitudeDifferenceComponent);
        accumulator.absoluteDifferences.push(currentAbsoluteDifference);

        if (currentIndex >= 1) {
            const previousAbsoluteDifference = accumulator.absoluteDifferences[currentIndex - 1];
            if (previousAbsoluteDifference > currentAbsoluteDifference) {
                accumulator.finalResultIndex = currentIndex + 1;
            } else if (currentAbsoluteDifference >= previousAbsoluteDifference) {
                accumulator.finalResultIndex = currentIndex;
            }
        }
        return accumulator;
    }, { absoluteDifferences: [], finalResultIndex: undefined });

    console.log(calculationResult.finalResultIndex);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
