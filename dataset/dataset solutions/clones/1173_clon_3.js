// This script processes incoming data from standard input.
// It computes geometric properties (area, perimeter, and altitude)
// of a triangle, given two side lengths and the included angle in degrees.

process.stdin.resume(); // Ensures the standard input stream stays active.
process.stdin.setEncoding('utf8'); // Configures the encoding for input data.

// Define constants for mathematical and validation purposes.
const GEOMETRIC_HALF_FACTOR = 0.5; // Constant for area calculation (0.5 * base * height or 0.5 * a * b * sin(C))
const RADIANS_PER_DEGREE = Math.PI / 180.0; // Conversion factor from degrees to radians.
const MIN_VALID_ANGLE_DEGREES = 0.001; // Smallest angle considered valid (prevents degenerate triangles).
const MAX_VALID_ANGLE_DEGREES = 179.999; // Largest angle considered valid (prevents degenerate triangles).
const FLOATING_POINT_EPSILON = 1e-9; // Tolerance for floating point comparisons.

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function (inputDataSegment) {
    // Pre-process the input: remove leading/trailing whitespace and split by any whitespace.
    const numericalComponentStrings = inputDataSegment.trim().split(/\s+/);

    // Validate that exactly three components were provided.
    if (numericalComponentStrings.length !== 3) {
        console.error("Input Error: Expected three space-separated numeric values (side1, side2, angleDegrees).");
        return; // Terminate processing for this invalid input.
    }

    // Parse the string components into floating-point numbers.
    const firstSideLength = parseFloat(numericalComponentStrings[0]);
    const secondSideLength = parseFloat(numericalComponentStrings[1]);
    const includedAngleDegrees = parseFloat(numericalComponentStrings[2]);

    // Perform validation on the parsed numeric values.
    if (isNaN(firstSideLength) || isNaN(secondSideLength) || isNaN(includedAngleDegrees)) {
        console.error("Input Error: One or more provided values could not be converted to numbers.");
        return;
    }

    // Ensure side lengths are positive.
    if (firstSideLength <= 0 || secondSideLength <= 0) {
        console.error("Validation Error: Both side lengths must be positive values.");
        return;
    }

    // Validate the included angle to ensure it forms a non-degenerate triangle.
    if (includedAngleDegrees <= MIN_VALID_ANGLE_DEGREES || includedAngleDegrees >= MAX_VALID_ANGLE_DEGREES) {
        console.error("Validation Error: The included angle must be strictly between 0 and 180 degrees.");
        return;
    }

    // Convert the angle from degrees to radians, as required by trigonometric functions.
    const includedAngleRadians = includedAngleDegrees * RADIANS_PER_DEGREE;

    // --- Step 1: Calculate the Area of the Triangle ---
    // Formula: Area = 0.5 * side1 * side2 * sin(included_angle_radians)
    const sineOfIncludedAngle = Math.sin(includedAngleRadians);
    const triangleSurfaceArea = GEOMETRIC_HALF_FACTOR * firstSideLength * secondSideLength * sineOfIncludedAngle;

    // --- Step 2: Calculate the Perimeter of the Triangle ---
    // This requires finding the length of the third side using the Law of Cosines.
    // thirdSide^2 = firstSide^2 + secondSide^2 - 2 * firstSide * secondSide * cos(included_angle_radians)
    const firstSideSquared = Math.pow(firstSideLength, 2);
    const secondSideSquared = Math.pow(secondSideLength, 2);
    const cosineOfIncludedAngle = Math.cos(includedAngleRadians);

    const cosineLawSubtractionTerm = 2.0 * firstSideLength * secondSideLength * cosineOfIncludedAngle;
    let thirdSideSquared = firstSideSquared + secondSideSquared - cosineLawSubtractionTerm;

    // Account for potential floating-point inaccuracies that might result in a tiny negative number.
    // If the value is genuinely negative, it implies an impossible triangle.
    if (thirdSideSquared < -FLOATING_POINT_EPSILON) {
        console.error("Calculation Error: The square of the third side resulted in a negative value, indicating an impossible triangle.");
        return;
    }
    // Ensure the value passed to Math.sqrt is non-negative.
    const thirdSideLength = Math.sqrt(Math.max(0, thirdSideSquared));

    const totalPerimeter = firstSideLength + secondSideLength + thirdSideLength;

    // --- Step 3: Calculate the Altitude (Height) relative to the first side ---
    // Formula: Height = secondSide * sin(included_angle_radians)
    // This is equivalent to (2 * Area) / firstSideLength.
    const altitudeToFirstSide = secondSideLength * sineOfIncludedAngle;

    // Output the computed geometric properties.
    console.log(triangleSurfaceArea);
    console.log(totalPerimeter);
    console.log(altitudeToFirstSide);
});