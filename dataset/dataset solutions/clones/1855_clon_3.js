/*
 * This JavaScript module is designed to calculate the spatial separation
 * between the tips of two 'clock hands' of varying lengths, given their
 * respective positions in hours and minutes on a standard clock face.
 * It processes a string input containing four numerical parameters:
 * the length of the first hand, the length of the second hand,
 * the hour value, and the minute value.
 *
 * This implementation aims to be robust by including input validation,
 * using modern JavaScript features, and structuring the code for clarity.
 *
 * Original intent: Determine Euclidean distance between two points (hand tips).
 * This clone enhances precision for hour hand movement and adds error handling.
 */
const computeHandTipDistance = (rawInputString) => {
  // First, cleanse the input by removing any leading or trailing whitespace.
  const processedString = rawInputString.trim();

  // Then, break the string into its constituent parts based on space delimiters.
  const numericalTokens = processedString.split(" ");

  // A basic validation step to ensure the input provides all necessary data.
  if (numericalTokens.length !== 4) {
    throw new Error("Input data error: Expected four numerical components (lengths, hour, minute).");
  }

  // Destructure the array of string tokens into more descriptive variable names.
  const [
    firstHandLengthStr,
    secondHandLengthStr,
    clockHourValueStr,
    clockMinuteValueStr
  ] = numericalTokens;

  // Convert the string tokens into their numerical representations.
  // Using `Number()` for type coercion and `const` for immutability where possible.
  const firstArmMagnitude = Number(firstHandLengthStr);
  const secondArmMagnitude = Number(secondHandLengthStr);
  let currentHourPosition = Number(clockHourValueStr);
  const currentMinutePosition = Number(clockMinuteValueStr);

  // Comprehensive validation for the parsed numerical inputs.
  if (isNaN(firstArmMagnitude) || isNaN(secondArmMagnitude) || isNaN(currentHourPosition) || isNaN(currentMinutePosition)) {
      throw new Error("Input parsing error: All components must be valid numbers.");
  }
  if (firstArmMagnitude < 0 || secondArmMagnitude < 0) {
      throw new Error("Invalid hand length: Lengths must be non-negative.");
  }

  // Normalize and validate clock specific ranges.
  // Handle 12 o'clock as 0 for easier modulo arithmetic or angle calculation.
  if (currentHourPosition === 12) {
      currentHourPosition = 0;
  }
  if (currentHourPosition < 0 || currentHourPosition > 11 || currentMinutePosition < 0 || currentMinutePosition > 59) {
      throw new Error("Time input out of valid range: Hour (0-11 or 12), Minute (0-59).");
  }

  // Define a constant for the conversion factor from degrees to radians.
  // This avoids recalculating Math.PI / 180 multiple times.
  const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180;

  // An arrow function for converting an angle from degrees to radians.
  const convertAngleToRadians = (degAngle) => degAngle * DEGREES_TO_RADIANS_FACTOR;

  // Calculate the precise angular position of the hour hand in degrees.
  // The hour hand moves 30 degrees per hour (360/12) and 0.5 degrees per minute (30/60).
  const hourHandDegrees = (currentHourPosition * 30) + (currentMinutePosition * 0.5);
  const hourHandRadians = convertAngleToRadians(hourHandDegrees);

  // Calculate the angular position of the minute hand in degrees.
  // The minute hand moves 6 degrees per minute (360/60).
  const minuteHandDegrees = currentMinutePosition * 6;
  const minuteHandRadians = convertAngleToRadians(minuteHandDegrees);

  // Represent the tip of the first hand (hour hand) as a Cartesian coordinate object.
  const firstHandTipCoordinates = {
    x_coord: Math.cos(hourHandRadians) * firstArmMagnitude,
    y_coord: Math.sin(hourHandRadians) * firstArmMagnitude,
  };

  // Represent the tip of the second hand (minute hand) as a Cartesian coordinate object.
  const secondHandTipCoordinates = {
    x_coord: Math.cos(minuteHandRadians) * secondArmMagnitude,
    y_coord: Math.sin(minuteHandRadians) * secondArmMagnitude,
  };

  // A utility arrow function to compute the Euclidean distance between two points.
  // Utilizes Math.hypot for a more numerically stable calculation than manual squaring and square-rooting.
  const calculateEuclideanDistance = (pointOne, pointTwo) => {
    const deltaX = pointOne.x_coord - pointTwo.x_coord;
    const deltaY = pointOne.y_coord - pointTwo.y_coord;
    return Math.hypot(deltaX, deltaY);
  };

  // Finally, compute the distance between the two hand tips.
  const separationResult = calculateEuclideanDistance(firstHandTipCoordinates, secondHandTipCoordinates);

  // Output the calculated distance to the console.
  console.log(separationResult);
};

// Entry point of the script: read from standard input and process the data.
try {
  // Read the entire content of the standard input file as a UTF-8 string.
  const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
  // Invoke the main processing function with the read data.
  computeHandTipDistance(fileData);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or data processing.
  console.error("An operational error occurred:", executionError.message);
  // In a real-world scenario, you might want to exit with a non-zero status code.
  // process.exit(1);
}