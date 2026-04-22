// This module is designed to process geometric input data for a triangle,
// calculating and presenting its area, perimeter, and height based on
// two given side lengths and the angle between them.
(function (rawInputString) {
    // A fundamental constant for converting angular measurements from degrees to radians,
    // essential for trigonometric functions in JavaScript's Math object.
    const DEGREE_TO_RADIAN_CONVERSION = Math.PI / 180.0;
    // Specifies the number of decimal places for the final output values,
    // ensuring consistent precision across all results.
    const DISPLAY_PRECISION = 8;

    // Standardize line endings (e.g., convert Windows CR+LF to Unix LF) and
    // then split the entire input string into an array of individual lines.
    let inputDataLines = rawInputString.replace(/\r/g, '').split("\n");

    // Implement a basic validation check to ensure that there is at least
    // one non-empty line of input data to process.
    if (inputDataLines.length === 0 || inputDataLines[0].trim() === '') {
        console.error("Input processing error: No valid data lines were supplied.");
        return; // Terminate execution if input is missing or malformed.
    }

    // Extract the primary data line (assumed to be the first) and
    // parse it into an array of string components, typically separated by spaces.
    let mainNumericComponents = inputDataLines.shift().split(" ");

    // Further validation: verify that the expected number of numeric parameters
    // (three in this case: side A, side B, and angle) are present.
    if (mainNumericComponents.length < 3) {
        console.error("Input processing error: Insufficient numeric parameters found on the first line.");
        return; // Abort if critical parameters are missing.
    }

    // Convert the string components into their respective integer values.
    // Explicitly providing radix 10 to `parseInt` for robust parsing.
    let firstTriangleSide = parseInt(mainNumericComponents[0], 10);
    let secondTriangleSide = parseInt(mainNumericComponents[1], 10);
    let includedAngleInDegrees = parseInt(mainNumericComponents[2], 10);

    // Critical validation step: confirm that all parsed values are indeed valid numbers.
    if (isNaN(firstTriangleSide) || isNaN(secondTriangleSide) || isNaN(includedAngleInDegrees)) {
        console.error("Input processing error: One or more parsed parameters are not valid numbers.");
        return; // Halt if any input is non-numeric.
    }

    // Transform the angle from degrees into radians, as required by `Math.sin` and `Math.cos`.
    let angleInRadiansValue = includedAngleInDegrees * DEGREE_TO_RADIAN_CONVERSION;

    // --- Core Geometric Calculations for the Triangle ---

    // Pre-calculate squares of the given sides to simplify later expressions.
    let squareOfSideA = firstTriangleSide * firstTriangleSide;
    let squareOfSideB = secondTriangleSide * secondTriangleSide;

    // Obtain the sine and cosine values for the calculated angle in radians.
    let sineOfAngle = Math.sin(angleInRadiansValue);
    let cosineOfAngle = Math.cos(angleInRadiansValue);

    // Calculate the square of the third side using the Law of Cosines: c^2 = a^2 + b^2 - 2ab cos(C).
    // This intermediate step enhances readability and breaks down the complex formula.
    let thirdSideCalculationTerm = (2 * firstTriangleSide * secondTriangleSide * cosineOfAngle);
    let thirdSideLength = Math.sqrt(squareOfSideA + squareOfSideB - thirdSideCalculationTerm);

    // Compute the triangle's area using the formula: Area = (1/2) * a * b * sin(C).
    let computedTriangleArea = (firstTriangleSide * secondTriangleSide * sineOfAngle) / 2.0;

    // Determine the total perimeter of the triangle by summing all three side lengths.
    let totalTrianglePerimeter = firstTriangleSide + secondTriangleSide + thirdSideLength;

    // Calculate the height of the triangle relative to one of the given sides (e.g., 'a' as base),
    // using the formula: Height = b * sin(C).
    let triangleAltitude = secondTriangleSide * sineOfAngle;

    // --- Output Generation and Formatting ---

    // Format each calculated geometric property to the specified decimal precision.
    let formattedAreaResult = computedTriangleArea.toFixed(DISPLAY_PRECISION);
    let formattedPerimeterResult = totalTrianglePerimeter.toFixed(DISPLAY_PRECISION);
    let formattedAltitudeResult = triangleAltitude.toFixed(DISPLAY_PRECISION);

    // Display the results to the console, with each value presented on a new line.
    console.log(`${formattedAreaResult}\n${formattedPerimeterResult}\n${formattedAltitudeResult}`);

// This IIFE (Immediately Invoked Function Expression) is designed to run in a Node.js environment,
// where it reads the entire content of standard input as a UTF-8 string.
})(require("fs").readFileSync("/dev/stdin", "utf8"));