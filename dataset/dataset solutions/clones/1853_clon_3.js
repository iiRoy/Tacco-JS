const TAU_RADIANS = Math.PI * 2;

const parseNumericInput = (strValue, defaultValue = 0) => {
    const num = Number(strValue);
    if (isNaN(num) || !isFinite(num)) {
        console.warn(`Warning: Invalid numeric input '${strValue}'. Using default value ${defaultValue}.`);
        return defaultValue;
    }
    return num;
};

process.stdin.setEncoding("utf8");
process.stdin.on("data", incomingPayload => {
    // Process raw input data, expecting space-separated numeric values.
    // Example format: "length1 length2 currentHour currentMinute" (e.g., "3 4 9 0")
    
    // Trim whitespace and split by one or more spaces to handle varying input styles.
    const dataTokens = incomingPayload.trim().split(/\s+/);

    // Validate the number of expected input components.
    const EXPECTED_TOKEN_COUNT = 4;
    if (dataTokens.length < EXPECTED_TOKEN_COUNT) {
        console.error(`Error: Insufficient input values. Expected ${EXPECTED_TOKEN_COUNT}, received ${dataTokens.length}.`);
        return;
    }

    // Safely parse string tokens into numerical dimensions and time components.
    const dimensionOne = parseNumericInput(dataTokens[0]);
    const dimensionTwo = parseNumericInput(dataTokens[1]);
    const currentClockHour = parseNumericInput(dataTokens[2]);
    const currentClockMinute = parseNumericInput(dataTokens[3]);

    // Apply specific domain-level validations for the parsed data.
    if (dimensionOne <= 0 || dimensionTwo <= 0) {
        console.error("Error: Both clock hand lengths must be positive numbers.");
        return;
    }
    if (currentClockHour < 0 || currentClockHour > 12 || currentClockMinute < 0 || currentClockMinute >= 60) {
        console.error("Error: Invalid time values. Hour must be 0-12, Minute must be 0-59.");
        return;
    }

    // Compute the spatial separation between the tips of the clock hands.
    const calculatedSeparation = calculateHandTipSeparation(dimensionOne, dimensionTwo, currentClockHour, currentClockMinute);
    
    // Display the final computed result.
    console.log(calculatedSeparation);
});

/**
 * Computes the straight-line distance between the endpoints of two clock hands.
 * This is effectively finding the third side of a triangle using the Law of Cosines,
 * where the clock hands form two sides and the angle between them is derived from the time.
 *
 * @param {number} handLengthA - Length of the first clock hand.
 * @param {number} handLengthB - Length of the second clock hand.
 * @param {number} inputHours - Current hour (0-12).
 * @param {number} inputMinutes - Current minute (0-59).
 * @returns {number} The distance between the tips of the two hands.
 */
const calculateHandTipSeparation = (handLengthA, handLengthB, inputHours, inputMinutes) => {
    // Define constants for clock geometry.
    const MINUTES_PER_FULL_HOUR = 60;
    const HOURS_ON_CLOCK_FACE = 12;

    // Calculate the angular position of the minute hand in radians.
    // A full circle (2*PI radians) is 60 minutes.
    const minuteHandPositionRadians = (TAU_RADIANS * inputMinutes) / MINUTES_PER_FULL_HOUR;

    // Calculate the angular position of the hour hand in radians.
    // The hour hand moves based on the hour, and also incrementally with the minutes.
    const hoursComponent = inputHours / HOURS_ON_CLOCK_FACE;
    const minutesComponent = inputMinutes / (MINUTES_PER_FULL_HOUR * HOURS_ON_CLOCK_FACE);
    const hourHandPositionRadians = TAU_RADIANS * (hoursComponent + minutesComponent);

    // Determine the raw angular difference between the two hands.
    let absoluteAngularDifference = Math.abs(minuteHandPositionRadians - hourHandPositionRadians);

    // Normalize the angle to be the smallest possible angle between the hands (0 to PI radians).
    // This is because the cosine of an angle is the same as the cosine of (2*PI - angle).
    const effectiveAngleBetweenHands = Math.min(absoluteAngularDifference, TAU_RADIANS - absoluteAngularDifference);

    // Apply the Law of Cosines to find the unknown side (distance).
    return computeThirdSideWithCosineLaw(handLengthA, handLengthB, effectiveAngleBetweenHands);
};

/**
 * Computes the length of the third side of a triangle given two sides and the included angle.
 * This function implements the Law of Cosines formula: c = sqrt(a^2 + b^2 - 2ab*cos(C)).
 *
 * @param {number} sideValX - Length of the first known side.
 * @param {number} sideValY - Length of the second known side.
 * @param {number} includedAngleRad - The angle (in radians) between sideValX and sideValY.
 * @returns {number} The length of the third side.
 */
const computeThirdSideWithCosineLaw = (sideValX, sideValY, includedAngleRad) => {
    // Ensure side lengths are non-negative for physical validity.
    // If negative values are passed, treat them as positive.
    const processedSideX = Math.abs(sideValX);
    const processedSideY = Math.abs(sideValY);

    // Calculate the squares of the two known sides.
    const squareOfSideX = Math.pow(processedSideX, 2);
    const squareOfSideY = Math.pow(processedSideY, 2);

    // Calculate the term involving the cosine of the included angle.
    const cosineTerm = 2 * processedSideX * processedSideY * Math.cos(includedAngleRad);

    // Apply the Law of Cosines formula.
    const squaredResult = squareOfSideX + squareOfSideY - cosineTerm;

    // Ensure the value under the square root is not negative due to floating point inaccuracies.
    // Clamp it at zero if it's slightly negative.
    const finalDistanceValue = Math.sqrt(Math.max(0, squaredResult));

    return finalDistanceValue;
};