function Main(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineData = inputLines[0].split(" ");
    const numberOfLocations = Number(firstLineData[0]);

    const secondLineData = inputLines[1].split(" ");
    const referenceTemperature = Number(secondLineData[0]);
    const desiredTemperature = Number(secondLineData[1]);

    const heightStrings = inputLines[2].split(" ");
    const locationElevationValues = heightStrings.map(Number);

    const TEMPERATURE_DECREASE_RATE_PER_METER = 0.006;

    const calculateSiteTemperature = (initialTemp, elevation, decreaseRate) => {
        return initialTemp - (elevation * decreaseRate);
    };

    // Process the first location (index 0) to set initial minimums
    const firstLocationElevation = locationElevationValues[0];
    const firstLocationAdjustedTemp = calculateSiteTemperature(
        referenceTemperature,
        firstLocationElevation,
        TEMPERATURE_DECREASE_RATE_PER_METER
    );
    let smallestTemperatureDifference = Math.abs(firstLocationAdjustedTemp - desiredTemperature);
    let optimalLocationIdentifier = 1; // Locations are 1-indexed

    // Iterate through the remaining locations starting from the second one
    for (let locationIndex = 1; locationIndex < numberOfLocations; locationIndex++) {
        const currentElevation = locationElevationValues[locationIndex];
        const currentAdjustedTemperature = calculateSiteTemperature(
            referenceTemperature,
            currentElevation,
            TEMPERATURE_DECREASE_RATE_PER_METER
        );
        const currentDifference = Math.abs(currentAdjustedTemperature - desiredTemperature);

        // Update if a closer temperature is found
        if (currentDifference < smallestTemperatureDifference) {
            smallestTemperatureDifference = currentDifference;
            optimalLocationIdentifier = locationIndex + 1; // Store 1-indexed location
        }
    }

    console.log(optimalLocationIdentifier);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
