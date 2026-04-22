"use strict";

// A utility function to safely convert a string to a number.
// This adds a layer of abstraction and potential error handling (Type III addition).
const convertToNumber = (textValue, fallback = 0) => {
    const numericalResult = Number(textValue);
    // If the conversion results in NaN, we return a default fallback value.
    // This is a robust addition for handling unexpected input (Type III).
    return isNaN(numericalResult) ? fallback : numericalResult;
};

// The primary function responsible for processing the input and executing the problem's logic.
// Renamed from 'main' to 'processChallengeInput' (Type II).
const processChallengeInput = (rawProblemData) => {
    // Ensure the input string is clean and split into individual lines.
    // For this problem, we expect only the first line to contain relevant data.
    const inputLines = rawProblemData.trim().split('\n');

    // Add a check to ensure there's at least one line of input to work with (Type III guard clause).
    if (inputLines.length === 0) {
        console.error("Input data is empty. Cannot proceed.");
        return; // Exit early if no data.
    }

    // The first line contains the three critical numerical values.
    const firstDataRow = inputLines[0];

    // Split the first data row by space to get the string representations of numbers.
    const stringComponents = firstDataRow.split(' ');

    // Validate that we have the expected number of components (distance, time, speed).
    // This is another robustness check (Type III guard clause).
    if (stringComponents.length < 3) {
        console.error("Malformed input: Expected 3 numerical components, found less.");
        return; // Exit early if input format is incorrect.
    }

    // Parse the numerical values using our custom utility function.
    // Renamed identifiers from D, T, S to more descriptive names (Type II).
    const requiredTravelDistance = convertToNumber(stringComponents[0]); // Represents 'D'
    const maximumAllowedTime = convertToNumber(stringComponents[1]);     // Represents 'T'
    const averageTravelSpeed = convertToNumber(stringComponents[2]);     // Represents 'S'

    // Implement a crucial guard clause: prevent division by zero if speed is zero.
    // This is a significant Type III addition for robustness.
    if (averageTravelSpeed === 0) {
        // If speed is zero, travel is impossible, so the condition cannot be met.
        console.info("No");
        return;
    }

    // Calculate the estimated time needed for the journey.
    // This introduces an intermediate variable for clarity (Type III addition).
    const estimatedTimeRequired = requiredTravelDistance / averageTravelSpeed;

    // Determine the outcome based on whether the estimated time is within the allowed limit.
    // Rewritten from a ternary operator to an if-else block for structural change (Type III).
    let finalVerdict;
    if (estimatedTimeRequired <= maximumAllowedTime) {
        finalVerdict = "Yes";
    } else {
        finalVerdict = "No";
    }

    // Output the final decision to the console.
    // Changed from console.log to console.info (minor Type II change).
    console.info(finalVerdict);
};

// Read the entire content of standard input synchronously.
// Assigning the input source to a new variable name (Type II).
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main problem-solving function with the obtained input.
processChallengeInput(standardInputContent);