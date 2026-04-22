// --- Configuration and Utilities ---

/**
 * Defines default constraints for geometric shape dimensions.
 * These values ensure that dimensions fall within a reasonable operational range.
 * @type {object}
 * @property {number} minVal - The minimum acceptable value for a dimension.
 * @property {number} maxVal - The maximum acceptable value for a dimension.
 */
const DEFAULT_BOUNDS = Object.freeze({
  minVal: 1,
  maxVal: 1000
});

/**
 * A utility function to format output messages based on a boolean condition.
 * This abstracts the direct 'YES'/'NO' output.
 * @param {boolean} conditionMet - The boolean condition to evaluate.
 * @returns {string} 'POSITIVE' if condition is true, 'NEGATIVE' otherwise.
 */
function getConditionStatus(conditionMet) {
  return conditionMet ? 'POSITIVE' : 'NEGATIVE';
}

// --- Data Processing Functions ---

/**
 * Extracts individual line segments from a raw input string.
 * This function handles the initial breakdown of the input data.
 * @param {string} rawContentString - The entire input content as a single string.
 * @param {string} lineSeparator - The character(s) used to delineate separate lines (e.g., '\n').
 * @returns {string[]} An array of strings, where each string represents a distinct line segment.
 */
function extractSegments(rawContentString, lineSeparator) {
  if (typeof rawContentString !== 'string' || !rawContentString.length) {
    console.error("Input data is invalid or empty for segment extraction. Returning an empty array.");
    return [];
  }
  // Filter ensures that truly empty lines (after trimming) are not included.
  return rawContentString.split(lineSeparator).filter(segment => segment.trim().length > 0);
}

/**
 * Parses a single segment string into an array of numeric dimensions.
 * This includes filtering out non-numeric entries and ensuring valid numbers.
 * @param {string} segmentString - A single line segment string containing space-separated values.
 * @returns {number[]} An array of numerical dimensions derived from the segment string.
 */
function parseSegmentDimensions(segmentString) {
  // This step is crucial for converting raw string data into usable numerical values.
  const numericalValues = segmentString
    .split(/\s+/) // Splits by one or more whitespace characters
    .filter(val => val.trim().length > 0) // Removes any resulting empty strings from multiple spaces
    .map(Number) // Attempts to convert each string part to a number
    .filter(val => !isNaN(val)); // Filters out any values that failed conversion (e.g., non-numeric strings)

  return numericalValues;
}

// --- Geometric Shape Class Definition ---

/**
 * Represents a generic geometric shape with three primary dimensions (sides).
 * This class encapsulates the properties and validation logic for such shapes.
 * @class GeometricShape
 * @param {object} configObject - An object containing configuration for the shape's bounds and dimensions.
 * @param {object} [configObject.bounds] - Optional object to override default min/max dimension bounds.
 * @param {number} [configObject.bounds.minVal] - Minimum dimension value.
 * @param {number} [configObject.bounds.maxVal] - Maximum dimension value.
 * @param {object} configObject.dimensions - Object containing the three primary dimension values.
 * @param {number} configObject.dimensions.val1 - The first dimension value.
 * @param {number} configObject.dimensions.val2 - The second dimension value.
 * @param {number} configObject.dimensions.val3 - The third dimension value.
 */
function GeometricShape(configObject) {
  /**
   * Internal helper function to safely initialize the shape's properties.
   * @param {object} cfg - The configuration object passed to the constructor.
   * @private
   */
  const _initProperties = (cfg) => {
    // Initialize dimension bounds, creating a mutable copy from defaults.
    this.dimensionBounds = { ...DEFAULT_BOUNDS
    };
    // Initialize side dimensions to null, indicating they are not yet set or are invalid.
    this.sides = {
      sideA: null,
      sideB: null,
      sideC: null
    };

    // Apply configuration if provided and valid.
    if (cfg && typeof cfg === 'object') {
      // Overwrite default bounds if specific bounds are provided in the config.
      if (cfg.bounds && typeof cfg.bounds === 'object') {
        this.dimensionBounds.minVal = cfg.bounds.minVal ?? DEFAULT_BOUNDS.minVal;
        this.dimensionBounds.maxVal = cfg.bounds.maxVal ?? DEFAULT_BOUNDS.maxVal;
      }

      // Set side dimensions, validating each against the established bounds.
      if (cfg.dimensions && typeof cfg.dimensions === 'object') {
        const {
          val1,
          val2,
          val3
        } = cfg.dimensions; // Using generic names for dimension values

        // Only assign if the dimension value is within the defined constraints.
        if (this.isPointWithinBounds(val1)) {
          this.sides.sideA = val1;
        }
        if (this.isPointWithinBounds(val2)) {
          this.sides.sideB = val2;
        }
        if (this.isPointWithinBounds(val3)) {
          this.sides.sideC = val3;
        }
      }
    }
  };

  _initProperties(configObject);
}

/**
 * Checks if a given numerical measure falls within the shape's defined dimension bounds.
 * This method ensures individual dimensions adhere to predefined limits.
 * @param {number} pointMeasure - The value of a dimension to be checked.
 * @returns {boolean} True if the measure is within bounds (inclusive), false otherwise or if not a number.
 */
GeometricShape.prototype.isPointWithinBounds = function(pointMeasure) {
  return (
    typeof pointMeasure === 'number' &&
    pointMeasure >= this.dimensionBounds.minVal &&
    pointMeasure <= this.dimensionBounds.maxVal
  );
};

/**
 * Determines if all necessary dimensions (sides A, B, and C) for the shape are valid (non-null).
 * This verifies the fundamental integrity of the shape's properties.
 * @returns {boolean} True if all three sides are set and valid, false otherwise.
 */
GeometricShape.prototype.hasValidDimensions = function() {
  return Boolean(this.sides.sideA && this.sides.sideB && this.sides.sideC);
};

/**
 * Checks if the geometric shape satisfies the Pythagorean theorem (a^2 + b^2 = c^2),
 * which is a characteristic of a right-angled configuration for triangles.
 * @returns {boolean} True if the shape's dimensions form a right-angled relationship, false otherwise.
 */
GeometricShape.prototype.checkPythagoreanTheorem = function() {
  // Guard clause: Cannot check for Pythagorean theorem if dimensions are not valid.
  if (!this.hasValidDimensions()) {
    return false;
  }

  const sideLengths = [this.sides.sideA, this.sides.sideB, this.sides.sideC];

  // Additional validation: Ensure we have exactly three side lengths.
  if (sideLengths.length !== 3) {
    console.warn("Internal error: Shape does not have exactly three side lengths for Pythagorean check.");
    return false;
  }

  // Sort lengths in ascending order (a, b, c) to easily identify the two smaller sides and the largest.
  sideLengths.sort((val1, val2) => val1 - val2);

  // Calculate squares using direct multiplication for potentially better performance than Math.pow.
  const squaredLengths = sideLengths.map(side => side * side);

  // Apply the Pythagorean theorem: (smaller side 1)^2 + (smaller side 2)^2 = (largest side)^2
  const sumOfSmallerSquares = squaredLengths[0] + squaredLengths[1];
  const largestSquare = squaredLengths[2];

  // For integer comparisons, direct equality is suitable.
  return sumOfSmallerSquares === largestSquare;
};

// --- Main Processing Logic ---

/**
 * Orchestrates the parsing of input data and subsequent processing of geometric shapes.
 * This is the central control flow for the application's core task.
 * @param {string} sourceDataStr - The raw string data containing shape dimensions, typically from a file.
 */
function processGeometricShapes(sourceDataStr) {
  let shapesProcessedCount = 0; // Counter for successfully processed shapes.

  try {
    const parsedLines = extractSegments(sourceDataStr, "\n");

    if (parsedLines.length === 0) {
      console.warn("No valid lines found in the input data after extraction. Exiting processing.");
      return;
    }

    // Iterate over each parsed line segment to create and evaluate geometric shapes.
    parsedLines.forEach((currentLineSegment, index) => {
      const numericalDimensions = parseSegmentDimensions(currentLineSegment);

      // Guard clause: Ensure enough dimensions are present to form a shape.
      if (numericalDimensions.length < 3) {
        console.warn(`Line ${index + 1}: Skipping due to insufficient dimensions (${numericalDimensions.length} found, 3 required). Segment: "${currentLineSegment}"`);
        return;
      }

      // Destructure the first three dimensions for clearer access.
      const [dim1, dim2, dim3] = numericalDimensions;

      // Add a specific, arbitrary validation example: Warn if the very first dimension of the first line is excessively large.
      // This is an example of adding a new, non-essential fragment for Type III.
      if (index === 0 && dim1 > DEFAULT_BOUNDS.maxVal * 5) {
        console.warn(`Line ${index + 1}: The initial dimension (${dim1}) on the first line is unusually large. Proceeding with caution.`);
      }

      try {
        const shapeInstance = new GeometricShape({
          bounds: {
            minVal: DEFAULT_BOUNDS.minVal,
            maxVal: DEFAULT_BOUNDS.maxVal
          },
          dimensions: {
            val1: dim1,
            val2: dim2,
            val3: dim3
          }
        });

        // Basic sanity check after construction to ensure a meaningful shape was created.
        if (!shapeInstance || !shapeInstance.sides.sideA) {
          console.warn(`Line ${index + 1}: Failed to construct a valid shape instance or first side is invalid. Skipping.`);
          return;
        }

        if (shapeInstance.hasValidDimensions()) {
          const isPythagorean = shapeInstance.checkPythagoreanTheorem();
          const outputMessage = getConditionStatus(isPythagorean);
          console.log(outputMessage);
          shapesProcessedCount++;
        } else {
          // This branch handles cases where dimensions were provided but were out of bounds or otherwise invalid.
          console.log(`Line ${index + 1}: Dimensions are incomplete or out of configured bounds. Skipping check.`);
        }
      } catch (shapeError) {
        console.error(`Error processing shape from line ${index + 1} ("${currentLineSegment}"): ${shapeError.message}`);
      }
    });

    console.info(`\n--- Processing Summary ---`);
    console.info(`Total shapes successfully analyzed: ${shapesProcessedCount}`); // New summary output.
    console.info(`--------------------------`);

  } catch (mainError) {
    console.error(`An unhandled error occurred during the main processing loop: ${mainError.message}`);
  }
}

// --- Entry Point / Main Execution Block ---

// This Immediately Invoked Function Expression (IIFE) serves as the application's starting point,
// ensuring scope isolation and controlling the execution flow.
(function() {
  const fileSystemModule = require('fs'); // Renamed `fs` to avoid generic variable names
  let rawInputData = ''; // Using `let` as it might be reassigned with fallback data

  try {
    // Attempt to read the input from standard input, using UTF-8 encoding and trimming whitespace.
    rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
  } catch (readError) {
    console.error(`ERROR: Failed to read input from /dev/stdin: ${readError.message}`);
    // Provide fallback dummy data if file reading fails. This is a Type III addition.
    rawInputData = "10 20 30\n3 4 5\n5 12 13\n6 8 10\n1 1 1001\n1001 1 1\n7 24 25\n1  2  3\n";
    console.warn("WARNING: Using built-in fallback dummy data due to input read error.");
  }

  // Add a guard clause for empty input, even after potential fallback data assignment.
  if (!rawInputData) {
    console.error("No input data available for processing. Exiting application.");
    return; // Terminate execution if no data is present.
  }

  // Initiate the core processing logic with the obtained input data.
  processGeometricShapes(rawInputData);
})();