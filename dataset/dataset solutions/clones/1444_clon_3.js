const nodeFs = require('fs');

const DEGREE_TO_RADIAN_CONVERSION_FACTOR = Math.PI / 180.0;

/**
 * Transforms an angle from degrees into its radian equivalent.
 * @param {number} degreesValue - The angle measurement in degrees.
 * @returns {number} The corresponding angle in radians.
 */
function convertAngleToRadians(degreesValue) {
    return degreesValue * DEGREE_TO_RADIAN_CONVERSION_FACTOR;
}

/**
 * Processes a raw string of space-separated values, converting them into an array of floating-point numbers.
 * Includes basic validation for numeric integrity.
 * @param {string} rawStringData - The unprocessed input string.
 * @returns {number[]} An array containing the parsed numerical values.
 * @throws {Error} If any part of the string cannot be converted to a valid number.
 */
function extractNumericData(rawStringData) {
    const cleansedString = rawStringData.trim();
    const stringComponentArray = cleansedString.split(' ');

    const numericalResultArray = stringComponentArray.map(item => parseFloat(item));

    // Ensure all components were successfully converted to numbers.
    const containsInvalidNumber = numericalResultArray.some(val => isNaN(val));
    if (containsInvalidNumber) {
        throw new Error("Input contains non-numeric values. Please provide valid numbers.");
    }

    return numericalResultArray;
}

// Entry point for the script's execution.
try {
    // Attempt to read the input from the standard input stream.
    const fileContent = nodeFs.readFileSync('/dev/stdin', 'utf8');

    // Parse the textual content into an array of numbers.
    const triangleParameters = extractNumericData(fileContent);

    // Verify that the required number of parameters (three) is provided.
    if (triangleParameters.length < 3) {
        throw new Error("Insufficient input. Expected three numerical parameters for triangle calculations (side1, side2, angle).");
    }

    // Assign the parsed values to descriptive variables.
    const firstTriangleSide = triangleParameters[0];
    const secondTriangleSide = triangleParameters[1];
    const angleInDegrees = triangleParameters[2];

    // Perform initial validation on the geometric parameters.
    if (firstTriangleSide <= 0 || secondTriangleSide <= 0) {
        throw new Error("Triangle side lengths must be positive values.");
    }
    if (angleInDegrees <= 0 || angleInDegrees >= 180) {
        throw new Error("The included angle must be strictly between 0 and 180 degrees.");
    }

    // Convert the angle to radians for trigonometric functions.
    const angleInRadians = convertAngleToRadians(angleInDegrees);

    // Pre-calculate sine and cosine to avoid redundant computations.
    const sineOfAngle = Math.sin(angleInRadians);
    const cosineOfAngle = Math.cos(angleInRadians);

    // --- Core Triangle Calculations ---

    // 1. Compute the triangle's surface area (A).
    // Formula: A = 0.5 * side1 * side2 * sin(angle)
    const triangleSurfaceArea = 0.5 * firstTriangleSide * secondTriangleSide * sineOfAngle;

    // 2. Determine the length of the third side using the Law of Cosines.
    // Formula: side3^2 = side1^2 + side2^2 - 2 * side1 * side2 * cos(angle)
    const squareOfFirstSide = Math.pow(firstTriangleSide, 2);
    const squareOfSecondSide = Math.pow(secondTriangleSide, 2);
    const termTwoABcosC = 2 * firstTriangleSide * secondTriangleSide * cosineOfAngle;
    const squareOfThirdSide = squareOfFirstSide + squareOfSecondSide - termTwoABcosC;

    // Guard against impossible triangle configurations where square of side is negative.
    if (squareOfThirdSide < 0) {
        throw new Error("Geometric inconsistency: Cannot compute third side (negative value under square root). Input might describe an impossible triangle.");
    }
    const thirdTriangleSide = Math.sqrt(squareOfThirdSide);

    // 3. Calculate the total perimeter of the triangle.
    const totalPerimeter = firstTriangleSide + secondTriangleSide + thirdTriangleSide;

    // 4. Calculate the height (h) corresponding to the first side.
    // Formula: h = (2 * Area) / base
    let heightCorrespondingToSideA;
    // Prevent division by zero if the base side happens to be zero (though already validated as > 0).
    if (firstTriangleSide === 0) {
        throw new Error("Cannot calculate height if the base side chosen is zero.");
    } else {
        heightCorrespondingToSideA = (2 * triangleSurfaceArea) / firstTriangleSide;
    }

    // --- Output Formatting and Display ---

    // Format all computed values to a fixed number of decimal places for consistent output.
    const formattedArea = triangleSurfaceArea.toFixed(8);
    const formattedPerimeter = totalPerimeter.toFixed(8);
    const formattedHeight = heightCorrespondingToSideA.toFixed(8);

    // Print the final results to the console, separated by spaces.
    console.log(`${formattedArea} ${formattedPerimeter} ${formattedHeight}`);

} catch (processingError) {
    // Centralized error handling for any issues during execution.
    console.error(`An error occurred during triangle calculation: ${processingError.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}