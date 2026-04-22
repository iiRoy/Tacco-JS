"use strict";

// Helper function to safely parse a string into an integer.
// It provides a default value if parsing fails, increasing robustness.
const parseNumericValueSafely = (inputValue, fallbackValue = 0) => {
    const parsedNumber = parseInt(inputValue, 10); // Always specify radix 10 for clarity and safety.
    if (isNaN(parsedNumber)) {
        // In a production scenario, one might log this warning or throw an error.
        // For this exercise, we simply return a predefined fallback.
        return fallbackValue;
    }
    return parsedNumber;
};

// Helper function that encapsulates the core comparison logic.
// This improves modularity and makes the main processing function cleaner.
const evaluateSensorDifferential = (valueA, valueB, comparisonBoundary) => {
    // Calculate the span between the two sensor points.
    const observedDifference = valueB - valueA;

    // Determine the outcome based on the comparison with the boundary.
    if (observedDifference > comparisonBoundary) {
        return ":("; // Indicate a specific condition failure.
    } else {
        return "Yay!"; // Indicate a successful or acceptable condition.
    }
};

// Constants for specific array indices, enhancing code readability and maintainability.
const INITIAL_SENSOR_POSITION = 0; // Represents the index of the first sensor reading.
const FINAL_SENSOR_POSITION = 4;   // Represents the index of the fifth sensor reading.
const REQUIRED_MINIMUM_INPUT_LINES = FINAL_SENSOR_POSITION + 2; // 5 readings + 1 threshold value.

// The primary function responsible for processing the incoming sensor data.
const processEnvironmentalReadings = (rawInputContent) => {
    // Sanitize and split the raw input string into individual lines.
    // The regex /\r?\n/ handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    const dataLines = rawInputContent.trim().split(/\r?\n/);

    // Initial validation: Ensure we have a sufficient number of input lines.
    if (dataLines.length < REQUIRED_MINIMUM_INPUT_LINES) {
        console.error("System Alert: Insufficient data provided. At least 6 lines (5 readings + 1 threshold) are expected.");
        return; // Terminate execution due to invalid input.
    }

    // Extract the threshold value from the very last line of input.
    const rawThresholdString = dataLines.pop();
    const operationalThreshold = parseNumericValueSafely(rawThresholdString, -1); // Using -1 as a fallback for the threshold.

    // Validate the parsed threshold value. If it's -1 and the original string wasn't "-1", it indicates a parsing error.
    if (operationalThreshold === -1 && rawThresholdString !== "-1") {
        console.error("System Alert: Could not interpret the operational threshold. Please provide a valid integer.");
        return; // Terminate execution if threshold is unparseable.
    }

    // Transform the remaining data lines into an array of numeric sensor values.
    const collectedSensorData = dataLines.map(line => parseNumericValueSafely(line));

    // Secondary validation: Confirm that we have enough sensor readings after parsing.
    if (collectedSensorData.length <= FINAL_SENSOR_POSITION) {
        console.error(`System Alert: Not enough sensor readings available. Expected at least ${FINAL_SENSOR_POSITION + 1} readings.`);
        return; // Terminate execution if sensor data is incomplete.
    }

    // Retrieve the specific sensor readings required for the comparison, using constants for clarity.
    const initialMeasurement = collectedSensorData[INITIAL_SENSOR_POSITION];
    const finalMeasurement = collectedSensorData[FINAL_SENSOR_POSITION];

    // Execute the core logic using the dedicated helper function.
    const outcomeMessage = evaluateSensorDifferential(initialMeasurement, finalMeasurement, operationalThreshold);

    // Display the final result to the user or system output.
    console.log(outcomeMessage);
};

// Entry point for the script: Reads input from standard input and initiates processing.
// A try-catch block is used to gracefully handle potential file system errors.
try {
    // Explicitly import the 'fs' module for file system operations.
    const fileStreamHandler = require('fs');
    const inputContentFromStdin = fileStreamHandler.readFileSync('/dev/stdin', 'utf8');
    processEnvironmentalReadings(inputContentFromStdin);
} catch (processingError) {
    console.error("Fatal Error: Unable to read from standard input. Details:", processingError.message);
    // In a robust application, one might offer a fallback or exit with a specific error code here.
    // For instance: process.exit(1);
}