// Defines the primary function for processing environmental data to identify optimal locations.
function analyzeEnvironmentalData(rawMeasurementString) {
    // Constant representing the rate at which temperature decreases with increasing altitude (Celsius per meter).
    const TEMPERATURE_LAPSE_RATE_PER_1000M = 6.0; // 0.006 per meter = 6.0 per 1000 meters

    // Splits the raw input string into an array of individual data lines.
    let dataLines = rawMeasurementString.split("\n");

    // Validate the minimum number of data lines required for processing.
    // Expecting at least 3 lines: station count, base/target temps, and altitudes.
    if (dataLines.length < 3) {
        console.error("Error: Insufficient data lines provided in the input stream.");
        // In a robust application, this would throw an error or handle the case more gracefully.
        return;
    }

    // Extracts the total number of observation points (stations) from the first line.
    let firstLineComponents = dataLines[0].split(" ");
    let totalObservationPoints = parseInt(firstLineComponents[0], 10);

    // Extracts the base temperature at sea level and the target ideal temperature from the second line.
    let secondLineComponents = dataLines[1].split(" ");
    let baseSeaLevelTemperature = parseFloat(secondLineComponents[0]);
    let idealTargetTemperature = parseFloat(secondLineComponents[1]);

    // Extracts all altitude readings for the observation points from the third line.
    // Using .map(Number) to convert string tokens directly into a numeric array.
    let altitudeReadings = dataLines[2].split(" ").map(Number);

    // Optional: Adjust the total observation points if the provided altitude data is shorter than declared.
    if (altitudeReadings.length < totalObservationPoints) {
        console.warn(`Warning: Declared ${totalObservationPoints} observation points, but only ${altitudeReadings.length} altitude readings were found. Adjusting total points to available data.`);
        totalObservationPoints = altitudeReadings.length;
    }
    
    // If no observation points are available after parsing, terminate.
    if (totalObservationPoints === 0) {
        console.log("No observation points to process.");
        return;
    }

    // Helper function to compute the temperature at a specific altitude.
    // Temperature decreases by 0.006 degrees Celsius for every meter of altitude.
    const calculateAltitudeTemperature = (altitudeInMeters, baseTempAtZeroAltitude) => {
        // The original formula was t - h * 0.006.
        // 0.006 is equivalent to TEMPERATURE_LAPSE_RATE_PER_1000M / 1000.
        return baseTempAtZeroAltitude - (altitudeInMeters * (TEMPERATURE_LAPSE_RATE_PER_1000M / 1000));
    };

    // Initialize tracking variables for the closest observation point.
    // We start by evaluating the very first observation point to set initial values.
    let firstStationAltitude = altitudeReadings[0];
    let firstStationActualTemperature = calculateAltitudeTemperature(firstStationAltitude, baseSeaLevelTemperature);
    
    // Calculate the initial minimum temperature deviation.
    let minimumTemperatureDeviation = Math.abs(firstStationActualTemperature - idealTargetTemperature);
    // The index of the optimal observation point (1-based for output).
    let optimalObservationPointIndex = 1; 

    // Loop through the remaining observation points, starting from the second one (index 1).
    for (let currentPointIterator = 1; currentPointIterator < totalObservationPoints; currentPointIterator++) {
        let currentStationAltitude = altitudeReadings[currentPointIterator];
        let currentStationCalculatedTemperature = calculateAltitudeTemperature(currentStationAltitude, baseSeaLevelTemperature);

        let currentTemperatureDeviation = Math.abs(currentStationCalculatedTemperature - idealTargetTemperature);

        // If the current point's temperature deviation is less than the previously recorded minimum,
        // update the minimum deviation and the index of the optimal point.
        if (currentTemperatureDeviation < minimumTemperatureDeviation) {
            minimumTemperatureDeviation = currentTemperatureDeviation;
            optimalObservationPointIndex = currentPointIterator + 1; // Update to 1-based index
        }
    }

    // Display the 1-based index of the observation point that has a temperature closest to the ideal target.
    console.log(optimalObservationPointIndex);
}

// Standard boilerplate for competitive programming environments:
// Reads the entire input from standard input and then processes it.
// This section typically remains outside the core logic function.
analyzeEnvironmentalData(require("fs").readFileSync("/dev/stdin", "utf8"));