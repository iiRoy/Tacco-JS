var InputParserFacade = (function () {
    // Inner function to create a new parser instance from a raw string
    function createStreamProcessor(rawInputContent) {
        // Returns a fresh instance of the DataStreamParser class
        return new DataStreamParser(rawInputContent);
    }

    // Class definition for handling structured input stream parsing
    class DataStreamParser {
        /**
         * Initializes the parser with the provided raw input string.
         * The string is processed into an array of lines.
         * @param {string} rawInputContent The raw string content, typically read from a file.
         */
        constructor(rawInputContent) {
            // Split the raw content into individual lines.
            // Handles both Windows (CRLF) and Unix (LF) line endings.
            // `filter(Boolean)` removes any empty lines, including a potential trailing newline.
            this.inputLines = rawInputContent.trim().split(/\r?\n/).filter(Boolean);
            // Keeps track of the current line being processed.
            this.currentLinePointer = 0;
            // Internal buffer for tokens of the current line, allowing reverse reading.
            this.currentLineTokenBuffer = [];
        }

        /**
         * Retrieves the next single value from the input stream.
         * Values on a line are assumed to be space-separated and are read in reverse order.
         * If the current line's buffer is empty, it attempts to load the next line.
         * @param {boolean} [shouldReturnAsString=false] If true, returns the value as a string; otherwise, attempts to parse it as a floating-point number.
         * @returns {number|string|null} The parsed value, or null if the entire stream has been exhausted.
         */
        retrieveNextToken(shouldReturnAsString = false) {
            // Check if all lines have been processed or if the current buffer is empty and no more lines exist.
            if (this.currentLineTokenBuffer.length === 0 && this.currentLinePointer >= this.inputLines.length) {
                return null; // No more data available in the stream.
            }

            // If the current line's token buffer is empty, load the next line.
            if (this.currentLineTokenBuffer.length === 0) {
                const lineContent = this.inputLines[this.currentLinePointer];
                // Split the line into tokens and reverse the array. This allows using `pop()` to read from right to left.
                this.currentLineTokenBuffer = lineContent.split(" ").reverse();
                this.currentLinePointer++; // Advance to the next line for subsequent reads.
            }

            // Extract the last token from the buffer (which was the first on the line due to reversal).
            const extractedItem = this.currentLineTokenBuffer.pop();

            // Return the item as a string or convert it to a number.
            return shouldReturnAsString ? extractedItem : parseFloat(extractedItem);
        }

        /**
         * Reads an entire line of space-separated values at once.
         * @param {boolean} [returnItemsAsStrings=false] If true, returns values as strings; otherwise, as numbers.
         * @returns {Array<number|string>} An array containing the parsed values from the line. Returns an empty array if no more lines.
         */
        readEntireLine(returnItemsAsStrings = false) {
            if (this.currentLinePointer >= this.inputLines.length) {
                return []; // No more lines to read.
            }
            // Clear any remaining tokens from a partially read line before advancing.
            this.currentLineTokenBuffer = [];
            const lineContent = this.inputLines[this.currentLinePointer++];
            const tokensOnLine = lineContent.split(" ");
            return returnItemsAsStrings ? tokensOnLine : tokensOnLine.map(token => parseFloat(token));
        }

        /**
         * Reads a specified number of consecutive lines, each as an array of space-separated values.
         * @param {number} numberOfLinesToRead The count of lines to retrieve.
         * @param {boolean} [returnElementsAsStrings=false] If true, elements are strings; otherwise, numbers.
         * @returns {Array<Array<number|string>>} A 2D array (matrix) of parsed values. Returns an empty array if not enough lines.
         */
        readMultiLineBlock(numberOfLinesToRead, returnElementsAsStrings = false) {
            if (this.currentLinePointer + numberOfLinesToRead > this.inputLines.length) {
                return []; // Not enough lines remaining.
            }
            // Clear any remaining tokens from a partially read line before advancing.
            this.currentLineTokenBuffer = [];
            const lineSegment = this.inputLines.slice(this.currentLinePointer, this.currentLinePointer + numberOfLinesToRead);
            this.currentLinePointer += numberOfLinesToRead;

            const processedMatrix = lineSegment.map(line => line.split(" "));
            return returnElementsAsStrings ? processedMatrix : processedMatrix.map(row => row.map(val => parseFloat(val)));
        }

        /**
         * Reads a block of N raw lines without splitting them into tokens.
         * @param {number} lineCount The number of raw lines to read.
         * @returns {Array<string>} An array of raw line strings. Returns an empty array if not enough lines.
         */
        readRawLineBlock(lineCount) {
            if (this.currentLinePointer + lineCount > this.inputLines.length) {
                return []; // Not enough lines remaining.
            }
            // Clear any remaining tokens from a partially read line before advancing.
            this.currentLineTokenBuffer = [];
            const rawLineBlock = this.inputLines.slice(this.currentLinePointer, this.currentLinePointer + lineCount);
            this.currentLinePointer += lineCount;
            return rawLineBlock;
        }
    }

    return createStreamProcessor; // The IIFE returns the factory function.
})();

// Initialize the input reader by passing the content of /dev/stdin.
// The `fs` module is used to read the file synchronously.
const inputSourceReader = InputParserFacade(require("fs").readFileSync("/dev/stdin", "utf8"));

// Global variables to store processed input data.
let totalDataPoints = 0; // Renamed 'n'
const allXCoords = []; // Renamed 'x'
const allYCoords = []; // Renamed 'y'
const pointAzimuths = []; // Renamed 'c' - stores angles in degrees

// Constant defining the granularity of angular divisions for the simulation.
const SIMULATION_ANGULAR_STEPS = 360000; // Renamed 'q'

// Execute the primary calculation function and print its result.
// Output formatted to 8 decimal places for consistency.
console.log(computeOptimalVectorSumMagnitude().toFixed(8));

/**
 * Main function responsible for calculating the maximum resultant vector magnitude.
 * This involves simulating a rotating 180-degree arc and summing vectors within it.
 * @returns {number} The greatest magnitude found across all arc orientations.
 */
function computeOptimalVectorSumMagnitude() {
    // Read the initial count indicating how many data point pairs to expect.
    totalDataPoints = inputSourceReader.retrieveNextToken();

    // Loop to read and process each coordinate pair.
    for (let i = 0; i < totalDataPoints; i++) {
        const currentInputX = inputSourceReader.retrieveNextToken();
        const currentInputY = inputSourceReader.retrieveNextToken();

        // Skip data points where both coordinates are zero, as they don't contribute to direction or magnitude.
        if (currentInputX === 0 && currentInputY === 0) {
            continue;
        }

        // Store the valid coordinates.
        allXCoords.push(currentInputX);
        allYCoords.push(currentInputY);
        // Calculate the angle (azimuth) for the current point and store it.
        pointAzimuths.push(calculatePointAzimuth(currentInputX, currentInputY));
    }

    // Update the actual count of data points after filtering out (0,0) entries.
    totalDataPoints = allXCoords.length;

    // Early exit: if no valid points remain, the magnitude is zero.
    if (totalDataPoints === 0) {
        return 0.0;
    }

    let maximumMagnitudeSquared = 0.0; // Renamed 'ans', stores squared magnitude to avoid frequent sqrt calls.

    // Outer loop: iterates through a full 360-degree rotation, simulating different arc orientations.
    for (let currentStep = 0; currentStep < SIMULATION_ANGULAR_STEPS; currentStep++) {
        // Determine the central angle of the current 180-degree arc.
        // The arc's center sweeps from 0 to 360 degrees.
        const arcCenterAngle = (currentStep / SIMULATION_ANGULAR_STEPS) * 360.0;

        let accumulatedXComponent = 0.0; // Renamed 'tx'
        let accumulatedYComponent = 0.0; // Renamed 'ty'

        // Inner loop: sums the components of vectors whose angles fall within the current arc.
        for (let pointIndex = 0; pointIndex < totalDataPoints; pointIndex++) {
            const pointDirectionAngle = pointAzimuths[pointIndex];

            // Define the 180-degree arc's boundaries relative to the center angle.
            // The arc extends 90 degrees in both clockwise and counter-clockwise directions.
            // Modulo 360 ensures angles stay within [0, 360).
            const arcStartBoundary = (arcCenterAngle - 90.0 + 360.0) % 360.0;
            const arcEndBoundary = (arcCenterAngle + 90.0 + 360.0) % 360.0;

            let isPointWithinArc = false;
            if (arcStartBoundary <= arcEndBoundary) {
                // Standard case: the arc does not cross the 0/360 degree boundary.
                isPointWithinArc = pointDirectionAngle >= arcStartBoundary && pointDirectionAngle < arcEndBoundary;
            } else {
                // Wrap-around case: the arc crosses the 0/360 degree boundary (e.g., 300 to 60 degrees).
                isPointWithinArc = pointDirectionAngle >= arcStartBoundary || pointDirectionAngle < arcEndBoundary;
            }

            // If the point's angle is within the current arc, add its components to the sum.
            if (isPointWithinArc) {
                accumulatedXComponent += allXCoords[pointIndex];
                accumulatedYComponent += allYCoords[pointIndex];
            }
        }

        // Calculate the squared magnitude of the resultant vector for the current arc orientation.
        const currentResultantMagnitudeSquared = (accumulatedXComponent * accumulatedXComponent) + (accumulatedYComponent * accumulatedYComponent);

        // Update the overall maximum squared magnitude if the current one is greater.
        if (currentResultantMagnitudeSquared > maximumMagnitudeSquared) {
            maximumMagnitudeSquared = currentResultantMagnitudeSquared;
        }
    }

    // Return the square root of the maximum squared magnitude to get the actual magnitude.
    return Math.sqrt(maximumMagnitudeSquared);
}

/**
 * Calculates the angle (azimuth) in degrees for a given Cartesian coordinate (x, y).
 * The angle is normalized to be within the range [0, 360).
 * @param {number} xCoord The x-coordinate of the point.
 * @param {number} yCoord The y-coordinate of the point.
 * @returns {number} The angle in degrees, from 0 up to (but not including) 360.
 */
function calculatePointAzimuth(xCoord, yCoord) {
    // Handle cases where x or y is zero to ensure correct quadrant/axis angles.
    // (0,0) points are filtered out earlier and should not reach this function.
    if (xCoord === 0) {
        return yCoord > 0 ? 90.0 : 270.0; // Positive Y-axis (90 deg), Negative Y-axis (270 deg).
    }
    if (yCoord === 0) {
        return xCoord > 0 ? 0.0 : 180.0; // Positive X-axis (0 deg), Negative X-axis (180 deg).
    }

    // Use Math.atan2(y, x) for a robust angle calculation across all four quadrants.
    // Math.atan2 returns an angle in radians in the range (-PI, PI].
    let angleInRadians = Math.atan2(yCoord, xCoord);
    // Convert the angle from radians to degrees.
    let angleInDegrees = angleInRadians * (180.0 / Math.PI);

    // Normalize the angle to be within the [0, 360) range.
    // If the angle is negative, add 360 to bring it into the positive range.
    if (angleInDegrees < 0) {
        angleInDegrees += 360.0;
    }

    return angleInDegrees;
}