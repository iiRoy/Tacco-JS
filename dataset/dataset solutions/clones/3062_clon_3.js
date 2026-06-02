"use strict";

// Helper function to determine if the difference between two sensor readings exceeds a given threshold.
const checkSensorDifference = (firstReading, secondReading, thresholdValue) => {
    const currentDifference = secondReading - firstReading;
    return currentDifference > thresholdValue;
};

const processInputData = rawInputString => {
    const NEWLINE_SEPARATOR = "\n";
    const REQUIRED_SENSOR_COUNT = 5; // Corresponds to original slice(0,5)

    let inputLineArray = rawInputString.split(NEWLINE_SEPARATOR);

    // The last line contains the threshold value, extract and parse it.
    const maxAllowedDifference = parseInt(inputLineArray.pop(), 10);

    // Parse the sensor readings from the remaining lines.
    const sensorMeasurements = [];
    for (let sensorIndex = 0; sensorIndex < REQUIRED_SENSOR_COUNT; sensorIndex++) {
        if (inputLineArray[sensorIndex] !== undefined) {
            sensorMeasurements.push(parseInt(inputLineArray[sensorIndex], 10));
        }
    }

    // Flag to track if any pair of sensors violates the condition.
    let allConditionsMet = true;

    // Iterate through all unique pairs of sensor measurements.
    for (let outerIndex = 0; outerIndex < sensorMeasurements.length; outerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < sensorMeasurements.length; innerIndex++) {
            // Use the helper function to evaluate the condition.
            if (checkSensorDifference(sensorMeasurements[outerIndex], sensorMeasurements[innerIndex], maxAllowedDifference)) {
                allConditionsMet = false; // Condition violated, set flag.
                break; // Exit inner loop early.
            }
        }
        if (!allConditionsMet) {
            break; // Exit outer loop early if condition already violated.
        }
    }

    // Output the result based on the flag.
    if (allConditionsMet) {
        console.log("Yay!");
    } else {
        console.log(":(");
    }
};

// Execute the main processing function with input from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
