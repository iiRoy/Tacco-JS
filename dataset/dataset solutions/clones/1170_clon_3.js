process.stdin.resume(); // Ensures the standard input stream remains open and active.

// Configure the character encoding for data received from standard input.
// Using 'utf8' ensures proper handling of various characters.
process.stdin.setEncoding('utf8');

// Establish an event listener to process incoming data segments from standard input.
process.stdin.on('data', function (receivedInputPayload) {
  // --- Input Validation and Pre-processing ---

  // Perform an initial check for the validity of the input payload.
  // It must be a non-empty string after trimming whitespace.
  if (typeof receivedInputPayload !== 'string' || receivedInputPayload.trim().length === 0) {
    console.error("Execution Aborted: Received an invalid or empty input payload. Expected a string with data.");
    return; // Exit the handler if input is not acceptable.
  }

  // Normalize and split the input string into potential numerical components.
  // Using a regular expression `/\s+/` handles multiple spaces between numbers robustly.
  const stringComponents = receivedInputPayload.trim().split(/\s+/);

  // Define the expected number of numerical components (four for two 2D points).
  const REQUIRED_NUM_COMPONENTS = 4;

  // Validate that the correct number of components was provided.
  if (stringComponents.length !== REQUIRED_NUM_COMPONENTS) {
    console.error(`Execution Aborted: Incorrect number of components. Expected ${REQUIRED_NUM_COMPONENTS}, but found ${stringComponents.length}.`);
    return;
  }

  // --- Data Parsing ---

  // Initialize an array to store the successfully parsed floating-point numbers.
  const numericalCoordinates = [];

  // Iterate through the string components and attempt to parse each into a float.
  for (let i = 0; i < stringComponents.length; i++) {
    const currentComponent = stringComponents[i];
    const parsedFloatingValue = parseFloat(currentComponent);

    // Validate that each parsed component is indeed a valid number.
    if (isNaN(parsedFloatingValue)) {
      console.error(`Execution Aborted: Failed to parse component '${currentComponent}' into a valid number.`);
      return; // Terminate if any component is not a number.
    }
    numericalCoordinates.push(parsedFloatingValue);
  }

  // --- Coordinate Assignment ---

  // Assign the parsed numerical values to clearly named variables representing two points.
  // Point A (first point) coordinates.
  const pointA_coordX = numericalCoordinates[0];
  const pointA_coordY = numericalCoordinates[1];

  // Point B (second point) coordinates.
  const pointB_coordX = numericalCoordinates[2];
  const pointB_coordY = numericalCoordinates[3];

  // --- Distance Calculation Steps ---

  // Step 1: Calculate the difference in the X-coordinates.
  const differenceInX = pointA_coordX - pointB_coordX;

  // Step 2: Calculate the difference in the Y-coordinates.
  const differenceInY = pointA_coordY - pointB_coordY;

  // Step 3: Square the X-coordinate difference.
  // Using the exponentiation operator (**) for squaring.
  const squaredDifferenceX = differenceInX ** 2;

  // Step 4: Square the Y-coordinate difference.
  const squaredDifferenceY = differenceInY ** 2;

  // Step 5: Sum the squared differences. This is the sum of squares.
  const sumOfSquaredDeltas = squaredDifferenceX + squaredDifferenceY;

  // Step 6: Compute the final Euclidean distance by taking the square root of the sum.
  // This is the application of the Pythagorean theorem for 2D distance.
  const computedEuclideanDistance = Math.sqrt(sumOfSquaredDeltas);

  // --- Output Result ---

  // Display the calculated Euclidean distance to the standard output.
  console.log(computedEuclideanDistance);
});