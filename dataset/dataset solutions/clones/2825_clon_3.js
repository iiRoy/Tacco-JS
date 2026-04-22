// This JavaScript module is designed to process a specific set of geometric parameters.
// It aims to calculate a specific fractional area derived from input dimensions
// and to determine if a given coordinate pair precisely matches the computed
// central point of the defined geometric space.

function processGeometricAnalysis(inputPayload) {
  // --- Input Validation and Initial Parsing ---

  // Ensure the provided input is a valid string and not empty after trimming.
  if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
    console.error("Input Error: The provided data payload is either not a string or is empty.");
    return; // Terminate execution due to invalid input.
  }

  let lineSegmentsFromInput;
  try {
    // Split the entire input string by newline characters to handle multi-line inputs.
    lineSegmentsFromInput = inputPayload.split('\n');
    // Verify that at least one meaningful line of data exists.
    if (lineSegmentsFromInput.length === 0 || lineSegmentsFromInput[0].trim().length === 0) {
      console.error("Input Error: No valid data line found within the payload.");
      return;
    }
  } catch (splittingFailure) {
    console.error("Processing Error: Failed to segment input payload by newlines.", splittingFailure);
    return;
  }

  // For this specific problem, we only care about the very first line of data.
  // Trim any leading/trailing whitespace from this crucial line.
  const primaryDataRow = lineSegmentsFromInput[0].trim();

  let stringTokens;
  try {
    // Further parse the primary data line by spaces to extract individual numerical components.
    stringTokens = primaryDataRow.split(' ');
    // Critical validation: Confirm that exactly four numerical values are provided.
    if (stringTokens.length !== 4) {
      console.error(`Input Error: Expected 4 numerical parameters, but detected ${stringTokens.length}.`);
      return;
    }
  } catch (tokenizingFailure) {
    console.error("Processing Error: Failed to tokenize the primary data row.", tokenizingFailure);
    return;
  }

  // --- Numerical Conversion and Parameter Assignment ---

  // Initialize variables to hold the parsed numeric values.
  let rectangleWidth;
  let rectangleHeight;
  let pointXCoordinate;
  let pointYCoordinate;

  try {
    // Convert string tokens into floating-point numbers.
    // Using parseFloat instead of parseInt allows for more general geometric inputs
    // that might not be strictly integer-based, though the original problem implies integers.
    rectangleWidth = parseFloat(stringTokens[0]);
    rectangleHeight = parseFloat(stringTokens[1]);
    pointXCoordinate = parseFloat(stringTokens[2]);
    pointYCoordinate = parseFloat(stringTokens[3]);

    // Comprehensive validation for successful number parsing.
    if (isNaN(rectangleWidth) || isNaN(rectangleHeight) || isNaN(pointXCoordinate) || isNaN(pointYCoordinate)) {
      console.error("Input Error: One or more input parameters could not be converted to valid numbers.");
      return;
    }

    // Domain-specific validation: Width and height must be positive values.
    if (rectangleWidth <= 0 || rectangleHeight <= 0) {
      console.error("Input Error: Rectangle dimensions (width and height) must be strictly positive.");
      return;
    }

  } catch (numericConversionError) {
    console.error("Processing Error: An issue occurred during the conversion of string tokens to numbers.", numericConversionError);
    return;
  }

  // --- Core Geometric Calculation and Logic ---

  // Calculate the exact half-dimensions of the rectangle for midpoint determination.
  const halfWidth = rectangleWidth / 2.0;
  const halfHeight = rectangleHeight / 2.0;

  // Compute a specific fractional area. In this case, it's one-quarter of the total area.
  // This is an equivalent way to express (W/2) * (H/2).
  const derivedAreaValue = (rectangleWidth * rectangleHeight) / 4.0;

  // Determine if the given (x,y) point precisely coincides with the rectangle's center.
  // A boolean flag enhances readability for the subsequent conditional logic.
  const isPointAtGeometricCenter = (pointXCoordinate === halfWidth && pointYCoordinate === halfHeight);

  // Assign a numerical flag (1 for true, 0 for false) based on the centrality check.
  const centerMatchFlag = isPointAtGeometricCenter ? 1 : 0;

  // --- Output Generation ---

  // Display the calculated fractional area and the centrality flag.
  // Using a template literal for clear and concise output formatting.
  console.log(`${derivedAreaValue} ${centerMatchFlag}`);
}

// The following line executes the main analysis function.
// It reads the entire content of the standard input stream (e.g., from a file or pipe)
// as a UTF-8 encoded string and passes it to our processing function.
processGeometricAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));