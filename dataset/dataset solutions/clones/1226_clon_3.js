const fileSystemModule = require('fs');

// Define the path for reading standard input, making it a distinct constant.
const standardInputPath = '/dev/stdin';

/**
 * Obtains raw input from the specified path, processes it, and returns an array of numbers.
 * This function handles reading the file, splitting the content, and parsing each segment.
 * It also includes a basic validation for the number of expected parameters.
 * @returns {Array<number>} An array containing the parsed numerical values.
 */
function processRawInputValues() {
    // Read the entire content of the input stream as a UTF-8 string.
    const rawDataString = fileSystemModule.readFileSync(standardInputPath, 'utf8');

    // Trim whitespace from the string, then split it by spaces, and convert each part to a number.
    const numericalComponents = rawDataString.trim().split(' ').map(Number);

    // A crucial check to ensure all expected parameters are present.
    // If not, it indicates an issue with the input format or quantity.
    const expectedParameterCount = 5;
    if (numericalComponents.length !== expectedParameterCount) {
        // Log an error message to the console's error stream.
        console.error(`Input Error: Expected ${expectedParameterCount} numerical parameters, but received ${numericalComponents.length}.`);
        // Terminate the process with a non-zero exit code to signal an error.
        process.exit(1);
    }

    return numericalComponents;
}

/**
 * Evaluates whether a given circle is entirely confined within a rectangular boundary.
 * The boundary is assumed to start at (0,0) and extend to (boundaryWidth, boundaryHeight).
 * @param {number} containerWidth The total width of the containing rectangle.
 * @param {number} containerHeight The total height of the containing rectangle.
 * @param {number} sphereCenterX The X-coordinate of the circle's central point.
 * @param {number} sphereCenterY The Y-coordinate of the circle's central point.
 * @param {number} sphereRadius The radius of the circle.
 * @returns {boolean} Returns `true` if the circle is fully inside the bounds, `false` otherwise.
 */
function checkCircleContainment(containerWidth, containerHeight, sphereCenterX, sphereCenterY, sphereRadius) {
    // The coordinate system's lower bound (often 0,0 in these types of problems).
    const coordinateSystemMinimum = 0;

    // Calculate the extreme horizontal positions of the circle.
    const minimumXPosition = sphereCenterX - sphereRadius;
    const maximumXPosition = sphereCenterX + sphereRadius;

    // Calculate the extreme vertical positions of the circle.
    const minimumYPosition = sphereCenterY - sphereRadius;
    const maximumYPosition = sphereCenterY + sphereRadius;

    // Determine if the circle's X-axis extent is within the container's X-bounds.
    // Both the leftmost and rightmost points must be within [0, containerWidth].
    const isWithinHorizontalLimits = (minimumXPosition >= coordinateSystemMinimum) && (maximumXPosition <= containerWidth);

    // Determine if the circle's Y-axis extent is within the container's Y-bounds.
    // Both the bottommost and topmost points must be within [0, containerHeight].
    const isWithinVerticalLimits = (minimumYPosition >= coordinateSystemMinimum) && (maximumYPosition <= containerHeight);

    // The circle is fully contained only if it satisfies both horizontal and vertical constraints.
    return isWithinHorizontalLimits && isWithinVerticalLimits;
}

// --- Primary Execution Block ---

// Fetch and parse the numerical input from the standard input stream.
const parsedNumericValues = processRawInputValues();

// Utilize array destructuring to assign the parsed values to descriptive constants.
const [
    boundaryRectangleWidth,  // Corresponds to 'W' in original
    boundaryRectangleHeight, // Corresponds to 'H' in original
    circleCenterPointX,      // Corresponds to 'x' in original
    circleCenterPointY,      // Corresponds to 'y' in original
    circleDimensionRadius    // Corresponds to 'r' in original
] = parsedNumericValues;

// Execute the core logic to ascertain if the geometric shape is within its bounds.
const isCircleSuccessfullyContained = checkCircleContainment(
    boundaryRectangleWidth,
    boundaryRectangleHeight,
    circleCenterPointX,
    circleCenterPointY,
    circleDimensionRadius
);

// Output the final verdict: 'Yes' if the circle fits, 'No' otherwise.
// A ternary operator provides a clean, single-line conditional output.
console.log(isCircleSuccessfullyContained ? 'Yes' : 'No');