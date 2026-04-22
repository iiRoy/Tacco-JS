"use strict";

/**
 * Normalizes an angle in degrees to be within the range [0, 180].
 * This is useful for trigonometric functions like Math.cos, where
 * cos(theta) = cos(-theta) and cos(theta) = cos(360 - theta).
 * The Law of Cosines typically uses the interior angle of a triangle,
 * which is always between 0 and 180 degrees.
 *
 * @param {number} angleInDegrees The raw angle difference in degrees.
 * @returns {number} The smallest positive angle equivalent (0 to 180 degrees).
 */
const normalizeAngleForCosine = (angleInDegrees) => {
    // Ensure the angle is within the primary 0-360 degree range
    let adjustedAngle = angleInDegrees % 360;
    if (adjustedAngle < 0) {
        adjustedAngle += 360; // Convert negative angles to their positive equivalent
    }

    // Determine the smallest angle (0 to 180) for cosine calculation
    // For example, 270 degrees is effectively 90 degrees for cosine.
    return Math.min(adjustedAngle, 360 - adjustedAngle);
};

/**
 * Processes clock hand lengths and current time to calculate the
 * distance between the tips of the hour and minute hands.
 *
 * @param {string} rawDataString The input string containing hand lengths and time,
 *                                e.g., "A B H M".
 */
const processClockData = (rawDataString) => {
    // Define a constant for converting degrees to radians, essential for Math.cos()
    const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;

    // Pre-parse and validate the initial input string
    const inputLines = rawDataString.trim().split('\n');

    // Guard clause for empty or malformed input
    if (inputLines.length === 0 || !inputLines[0]) {
        console.error("Error: Input data is either missing or empty. Please provide 'A B H M'.");
        return;
    }

    // Split the first line and attempt to parse numeric values
    const numericParameters = inputLines[0].split(' ').map(strVal => {
        const parsedValue = parseInt(strVal, 10); // Explicitly specify base 10 for safety
        // Validate each parsed number
        if (isNaN(parsedValue)) {
            throw new Error(`Input Error: "${strVal}" is not a valid number. All parameters must be integers.`);
        }
        return parsedValue;
    });

    // Destructure the array into meaningful variables
    const [firstArmLength, secondArmLength, currentHour, currentMinute] = numericParameters;

    // Validate the time components for realistic clock values
    if (currentHour < 0 || currentHour > 23 || currentMinute < 0 || currentMinute > 59) {
        console.error(`Validation Error: Invalid time provided. Hour must be 0-23, Minute 0-59. Got H=${currentHour}, M=${currentMinute}.`);
        return;
    }

    // --- Calculate Hand Angles ---
    // Hour hand angle:
    // It moves 30 degrees per hour (360/12) and 0.5 degrees per minute (30/60).
    // The (currentHour % 12) handles 12 PM/AM correctly, treating 12 as 0 for angle calculation.
    const hourHandPositionDegrees = ((currentHour % 12) * 30) + (currentMinute * 0.5);

    // Minute hand angle:
    // It moves 6 degrees per minute (360/60).
    const minuteHandPositionDegrees = currentMinute * 6;

    // --- Calculate Angular Difference ---
    // Determine the raw difference between the two hand positions
    let rawAngularDifference = hourHandPositionDegrees - minuteHandPositionDegrees;

    // Normalize this difference to get the effective angle for the Law of Cosines (0-180 degrees)
    const effectiveAngleForCosine = normalizeAngleForCosine(rawAngularDifference);

    // --- Apply the Law of Cosines ---
    // The formula is c^2 = a^2 + b^2 - 2ab * cos(theta)
    const termForFirstArmSquared = firstArmLength * firstArmLength;
    const termForSecondArmSquared = secondArmLength * secondArmLength;
    const productOfArmsDoubled = 2 * firstArmLength * secondArmLength;

    // Convert the effective angle from degrees to radians for Math.cos()
    const angleInRadians = effectiveAngleForCosine * DEGREES_TO_RADIANS_FACTOR;
    const cosineOfAngle = Math.cos(angleInRadians);

    // Calculate the square of the distance between the hand tips
    const squaredDistanceBetweenTips = termForFirstArmSquared + termForSecondArmSquared - productOfArmsDoubled * cosineOfAngle;

    // Guard against potential negative values due to floating-point inaccuracies
    // (a squared distance cannot be truly negative)
    const finalSquaredDistance = Math.max(0, squaredDistanceBetweenTips);

    // Calculate the final distance by taking the square root
    const finalDistance = Math.sqrt(finalSquaredDistance);

    // Output the result, formatted to a reasonable precision
    console.log(finalDistance.toFixed(10));
};

// Main execution block: Reads input from standard input and calls the processing function.
// This is typical for competitive programming environments.
processClockData(require("fs").readFileSync("/dev/stdin", "utf8"));