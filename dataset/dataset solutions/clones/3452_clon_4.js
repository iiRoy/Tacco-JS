function processData(rawData) {
    const dataLines = rawData.split("\n");

    const [stationCountStr] = dataLines[0].split(" ");
    const totalStationCount = Number(stationCountStr);

    const [baseTemperatureStr, targetTemperatureStr] = dataLines[1].split(" ");
    const initialTemperature = Number(baseTemperatureStr);
    const desiredTemperature = Number(targetTemperatureStr);

    const altitudeMeasurements = dataLines[2].split(" ").map(Number);

    const closestStationInfo = altitudeMeasurements.reduce((currentOptimal, currentAltitudeValue, stationIndex) => {
        const calculatedStationTemperature = initialTemperature - currentAltitudeValue * 0.006;
        const absoluteTemperatureDifference = Math.abs(calculatedStationTemperature - desiredTemperature);

        if (absoluteTemperatureDifference < currentOptimal.minimumDifference) {
            return {
                minimumDifference: absoluteTemperatureDifference,
                stationNumber: stationIndex + 1
            };
        } else {
            return currentOptimal;
        }
    }, { minimumDifference: Infinity, stationNumber: -1 });

    console.log(closestStationInfo.stationNumber);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
