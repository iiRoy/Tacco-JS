"use strict"; // Enforce strict mode for the entire script.

/**
 * This function serves as the primary entry point for processing input data.
 * It calculates the distance between the tips of two clock hands (represented as vectors)
 * using the Law of Cosines, given their lengths and the current time.
 *
 * @param {string} rawData - The complete input string, expected to contain
 *                           space-separated numerical values on the first line.
 */
const processInput = (rawData) => {
    // Split the incoming raw data string into an array of lines.
    // For this problem, we only care about the first line.
    const lineParts = rawData.split('\n');

    // Extract the numerical values from the first line.
    // These represent the lengths of the two clock hands (sideA, sideB),
    // and the current hour (hourVal) and minute (minuteVal).
    // Each string element is converted to an integer.
    const [sideA, sideB, hourVal, minuteVal] = lineParts[0].split(' ').map(elementStr => parseInt(elementStr));

    // Calculate the angle of the shorter hand (hour hand) in degrees.
    // The hour hand moves 30 degrees per hour (360/12) and an additional 0.5 degrees per minute (30/60).
    const shortHandAngle = hourVal * 30 + minuteVal * 0.5;

    // Calculate the angle of the longer hand (minute hand) in degrees.
    // The minute hand moves 6 degrees per minute (360/60).
    const longHandAngle = 6 * minuteVal;

    // Determine the angular difference between the two hands.
    // The sign of this difference does not affect the cosine value,
    // as cos(x) = cos(-x).
    const angleDifference = shortHandAngle - longHandAngle;

    // Apply the Law of Cosines to find the square of the distance between the hand tips.
    // The formula is c^2 = a^2 + b^2 - 2ab * cos(C), where C is the angle between sides a and b.
    // Note: Math.cos expects angles in radians, so we convert degrees to radians (degrees * PI / 180).
    const squaredDistance = sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(Math.PI / 180 * angleDifference);

    // The final answer is the square root of the calculated squared distance.
    // This value is then printed to the console.
    console.log(Math.sqrt(squaredDistance));
};

// Read the input from standard input using Node.js's file system module.
// The input is expected to be UTF-8 encoded.
// Once read, the input string is passed to the processInput function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
