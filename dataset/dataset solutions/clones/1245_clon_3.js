// This script is designed to compute and present the area and circumference of a circular shape.
// The numerical value representing the radius of the circle is expected to be supplied via standard input.

// Acquire the file system module from Node.js core libraries to facilitate input operations.
const fileSystemInterface = require('fs');

// Declare a constant for the mathematical value of Pi to enhance code clarity and maintainability.
const APPROXIMATE_PI_VALUE = Math.PI;

// Specify the desired number of fractional digits for the final output values.
const DISPLAY_DECIMAL_PRECISION = 6;

let incomingStreamContent; // This variable will temporarily store the raw string data read from stdin.

try {
    // Attempt to synchronously read the entire content from the standard input stream.
    // The '/dev/stdin' path is a conventional method for accessing stdin in Unix-like environments.
    incomingStreamContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
} catch (readingError) {
    // Should an error occur during the input reading process, capture and report it.
    // As a fallback mechanism, a default radius value is assigned to allow script continuation,
    // demonstrating a robust error handling strategy.
    console.error("An issue was encountered while attempting to read from standard input. Proceeding with a default radius of 15.0.");
    incomingStreamContent = "15.0"; // Assigning a predefined fallback value.
}

// Process the raw input string: remove leading/trailing whitespace and convert it to a floating-point number.
// parseFloat is chosen to correctly handle potential decimal radius values.
let currentCircleRadius = parseFloat(incomingStreamContent.trim());

// Implement a validation check for the parsed radius value.
// It's crucial that the radius is a valid, positive number for geometric calculations.
if (isNaN(currentCircleRadius) || currentCircleRadius <= 0) {
    console.error("The provided radius is either invalid or not positive. Please ensure a valid positive numeric input.");
    // In scenarios where invalid input makes further computation meaningless,
    // it's appropriate to terminate the process.
    process.exit(1);
}

// --- Initiating the Calculation Phase for Circle Attributes ---

// First, compute the diameter of the circle, which is twice its radius.
const calculatedDiameter = 2 * currentCircleRadius;

// Next, determine the raw circumference (or perimeter) using the diameter and the Pi constant.
const unformattedCircumference = calculatedDiameter * APPROXIMATE_PI_VALUE;

// Calculate the square of the radius, an intermediate step for area computation.
const radiusSquaredValue = Math.pow(currentCircleRadius, 2); // Utilizing Math.pow for explicit squaring.

// Subsequently, calculate the raw area of the circle using the squared radius and Pi.
const unformattedArea = radiusSquaredValue * APPROXIMATE_PI_VALUE;

// --- Formatting the Numerical Results for Presentation ---

// Convert the calculated circumference to a string, formatted to the predefined number of decimal places.
const finalCircumferenceOutput = unformattedCircumference.toFixed(DISPLAY_DECIMAL_PRECISION);

// Convert the calculated area to a string, similarly formatted for consistent output.
const finalAreaOutput = unformattedArea.toFixed(DISPLAY_DECIMAL_PRECISION);

// --- Presenting the Final Results ---

// Output the formatted area and circumference values to the console.
// A template literal is employed for clean and readable string interpolation.
console.log(`${finalAreaOutput} ${finalCircumferenceOutput}`);

// This marks the conclusion of the script's execution for circle property determination.