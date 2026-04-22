const fileSystemModule = require('fs'); // Renamed module import for clarity

// Comprehensive comments explaining the problem context and approach.
// This script calculates the angle at which a rectangular prism (tank)
// with dimensions A x A x B (where A is width, B is height)
// needs to be tilted to achieve a specific target volume of liquid X.
// It employs a binary search algorithm to find the angle.

// --- Input Processing Section ---
// Read raw input content from standard input.
const rawInputContentString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Clean and split the input into individual lines.
const cleanedInputLineSegments = rawInputContentString.trim().split('\n');

// Extract the first line which contains the dimensions and target volume.
const primaryParameterLine = cleanedInputLineSegments.shift();

// Split this line into individual numeric tokens.
const parameterValueTokens = primaryParameterLine.split(' ');

// Parse the dimensions (A, B) and the target volume (X) as numbers.
// Using Number() for explicit type conversion.
const prismWidthDimension = Number(parameterValueTokens.shift()); // Corresponds to 'a'
const prismHeightDimension = Number(parameterValueTokens.shift()); // Corresponds to 'b'
const desiredLiquidVolume = Number(parameterValueTokens.shift()); // Corresponds to 'x'

// --- Constants and Utility Functions ---
// Define the mathematical constant PI for calculations.
const PI_VALUE = Math.PI;

// Pre-calculate the multiplier for converting degrees to radians.
const DEGREES_TO_RADIANS_CONVERSION_FACTOR = PI_VALUE / 180.0;

/**
 * Converts an angle from degrees to radians.
 * @param {number} angleInDegrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
const convertDegreesToRadians = (angleInDegrees) => angleInDegrees * DEGREES_TO_RADIANS_CONVERSION_FACTOR;

// --- Binary Search Initialization ---
// Initialize the lower and upper bounds for the angle search (0 to 90 degrees).
let angleSearchLowerBound = 0.0;
let angleSearchUpperBound = 90.0;

// Initialize the current angle estimate as the midpoint of the initial bounds.
let currentAngleEstimationDegrees = (angleSearchLowerBound + angleSearchUpperBound) / 2.0;

// Counter for binary search iterations to prevent infinite loops.
let searchIterationCounter = 0;
const MAXIMUM_SEARCH_ITERATIONS = 250; // Increased limit for robustness (Type III update)

// Epsilon value for floating-point comparison to determine search termination.
const ANGLE_PRECISION_EPSILON = 1e-10; // New termination condition (Type III addition)

// --- Core Logic: Volume Calculation and Binary Search ---
// Calculate the total volume of the rectangular prism.
// Assuming the base is a square of side 'prismWidthDimension' and height 'prismHeightDimension'.
const totalPrismCapacity = prismWidthDimension * prismWidthDimension * prismHeightDimension; // Corresponds to 'S'

// The problem has two main geometric scenarios based on the target volume.
// Scenario 1: Desired volume is greater than half the total capacity.
// This implies the liquid fills more than half the tank, and the cut (or tilt)
// is such that a smaller triangular prism of air is at the top.
if (desiredLiquidVolume > totalPrismCapacity / 2.0) {
    // Perform binary search to find the correct tilt angle.
    // The loop continues until the search range is sufficiently small or max iterations are reached.
    while ((angleSearchUpperBound - angleSearchLowerBound > ANGLE_PRECISION_EPSILON) && (searchIterationCounter < MAXIMUM_SEARCH_ITERATIONS)) {
        // Recalculate the midpoint angle for the current iteration.
        currentAngleEstimationDegrees = (angleSearchLowerBound + angleSearchUpperBound) / 2.0;

        // Convert the current angle estimate to radians for trigonometric functions.
        const currentAngleInRadians = convertDegreesToRadians(currentAngleEstimationDegrees);
        const tangentOfCurrentAngle = Math.tan(currentAngleInRadians); // Store tan value in an intermediate variable

        // Calculate the volume of the *removed* (empty) part.
        // In this scenario, the empty space is a triangular prism.
        // Its base is 'prismWidthDimension', height is 'prismWidthDimension * tan(angle)',
        // and length along the 'b' axis.
        // The original formula `(a * a * Math.tan(mid / 180 * Math.PI)) / 2 * a`
        // simplifies to `0.5 * a * (a * tan(theta)) * a`, which is `(a^3 * tan(theta)) / 2`.
        // This is the volume of the triangular prism of *air* at the top.
        const volumeOfAirRemoved = 0.5 * prismWidthDimension * (prismWidthDimension * tangentOfCurrentAngle) * prismWidthDimension;

        // The current remaining liquid volume is the total capacity minus the air volume.
        const currentCalculatedLiquidVolume = totalPrismCapacity - volumeOfAirRemoved; // Corresponds to 's'

        // Adjust the binary search bounds based on whether the calculated volume
        // is less than, equal to, or greater than the desired volume.
        if (desiredLiquidVolume < currentCalculatedLiquidVolume) {
            // If the desired volume is less than the current calculated volume,
            // it means the angle is too small (too little air removed, so too much liquid).
            // We need a larger angle to remove more air, so increase the lower bound.
            angleSearchLowerBound = currentAngleEstimationDegrees;
        } else {
            // If the desired volume is greater than or equal to the current calculated volume,
            // it means the angle is too large (too much air removed, so too little liquid).
            // We need a smaller angle to remove less air, so decrease the upper bound.
            angleSearchUpperBound = currentAngleEstimationDegrees;
        }
        searchIterationCounter++; // Increment iteration counter
    }
    // Output the final angle estimate, formatted to 10 decimal places.
    console.log(currentAngleEstimationDegrees.toFixed(10));
}
// Scenario 2: Desired volume is half or less than the total capacity.
// This implies the liquid fills a smaller triangular prism at the bottom.
else {
    // Perform binary search similar to the first scenario.
    while ((angleSearchUpperBound - angleSearchLowerBound > ANGLE_PRECISION_EPSILON) && (searchIterationCounter < MAXIMUM_SEARCH_ITERATIONS)) {
        currentAngleEstimationDegrees = (angleSearchLowerBound + angleSearchUpperBound) / 2.0;
        const currentAngleInRadians = convertDegreesToRadians(currentAngleEstimationDegrees);
        const tangentOfCurrentAngle = Math.tan(currentAngleInRadians); // Intermediate variable

        // Calculate the volume of the *remaining* (liquid) part directly.
        // In this scenario, the liquid forms a triangular prism.
        // Its base is 'prismHeightDimension', height is 'prismHeightDimension * tan(angle)',
        // and length along the 'a' axis.
        // The original formula `(b * b * Math.tan(mid / 180 * Math.PI)) / 2 * a`
        // simplifies to `0.5 * b * (b * tan(theta)) * a`, which is `(a * b^2 * tan(theta)) / 2`.
        const currentCalculatedLiquidVolume = 0.5 * prismHeightDimension * (prismHeightDimension * tangentOfCurrentAngle) * prismWidthDimension; // Corresponds to 's'

        // Adjust binary search bounds.
        if (desiredLiquidVolume < currentCalculatedLiquidVolume) {
            // If the desired volume is less than the current calculated volume,
            // it means the angle is too large (too much liquid).
            // We need a smaller angle to reduce the liquid volume, so decrease the upper bound.
            angleSearchUpperBound = currentAngleEstimationDegrees;
        } else {
            // If the desired volume is greater than or equal to the current calculated volume,
            // it means the angle is too small (too little liquid).
            // We need a larger angle to increase the liquid volume, so increase the lower bound.
            angleSearchLowerBound = currentAngleEstimationDegrees;
        }
        searchIterationCounter++; // Increment iteration counter
    }
    // For this scenario, the problem asks for the complementary angle (90 - found angle).
    const finalComplementaryAngle = 90.0 - currentAngleEstimationDegrees; // New helper variable for output
    console.log(finalComplementaryAngle.toFixed(10));
}