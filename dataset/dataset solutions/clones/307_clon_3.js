/*
 * This module is designed to process numerical input provided via standard input (stdin).
 * It calculates the area based on two input dimensions and then converts this area
 * into 'Tsubo' units, which is a traditional Japanese unit of area.
 *
 * Expected Input Format: Two space-separated numeric values (e.g., "10 5.5").
 * The output will be the calculated area in Tsubo, formatted to a fixed number of decimal places.
 */
(function executeApplicationLogic() {

  // A mutable buffer to collect all data fragments received from the standard input stream.
  let accumulatedInputBuffer = '';

  // Constant for the Tsubo conversion factor.
  // One Tsubo is approximately equivalent to 3.305785 square meters.
  // This value is immutable and defined once.
  const TSUBO_TO_SQUARE_METERS_FACTOR = 3.305785;

  /**
   * A utility function responsible for displaying the final numerical outcome.
   * It ensures the output is consistently formatted to a specific precision.
   *
   * @param {number} finalCalculatedValue - The numerical result ready for display.
   */
  const presentFormattedResult = (finalCalculatedValue) => {
    // Using toFixed(6) to ensure the output has 6 decimal places, enhancing consistency.
    console.log(finalCalculatedValue.toFixed(6));
  };

  /**
   * This is the core orchestrator function. It is invoked once all data
   * from standard input has been received.
   *
   * It performs the following steps:
   * 1. Validates the presence of input data.
   * 2. Parses the input string into individual dimension tokens.
   * 3. Validates the quantity of provided dimensions.
   * 4. Converts string dimensions into numerical values.
   * 5. Validates the numerical integrity of the dimensions.
   * 6. Calculates the raw area in square meters.
   * 7. Converts the calculated area into Tsubo units.
   * 8. Presents the final converted value.
   */
  function initiateAreaConversionProcess() {
    // --- Input Validation: Check for empty or whitespace-only input ---
    const trimmedInput = accumulatedInputBuffer.trim();
    if (!trimmedInput) {
      console.error('Error: No meaningful input data was detected. Please provide dimensions.');
      return; // Halt execution if no valid input.
    }

    // --- Input Parsing: Split the string into potential dimension tokens ---
    // Using a regular expression to split by one or more whitespace characters,
    // making the parsing more robust to varied spacing.
    const dimensionStringTokens = trimmedInput.split(/\s+/);

    // --- Dimension Count Validation ---
    if (dimensionStringTokens.length < 2) {
      console.error('Error: Insufficient dimension values provided. Expected two numbers.');
      return;
    }

    // --- Numerical Conversion ---
    // Convert the string tokens into actual numbers.
    // Using `Number()` constructor for more flexible parsing (handles floats).
    const primaryDimension = Number(dimensionStringTokens[0]);
    const secondaryDimension = Number(dimensionStringTokens[1]);

    // --- Numerical Value Validation ---
    // Check if the parsed values are indeed valid finite numbers.
    if (isNaN(primaryDimension) || isNaN(secondaryDimension) || !isFinite(primaryDimension) || !isFinite(secondaryDimension)) {
      console.error('Error: One or both provided dimensions are not valid finite numbers.');
      return;
    }

    // --- Core Calculation: Area in Square Meters ---
    // Calculate the product of the two dimensions to get the area.
    const areaInSquareMeters = primaryDimension * secondaryDimension;

    // --- Conversion to Tsubo ---
    let finalAreaInTsuboUnits;
    // Add a defensive check for the conversion factor, though it's a constant and non-zero.
    if (TSUBO_TO_SQUARE_METERS_FACTOR === 0) {
      console.warn('Warning: Tsubo conversion factor is zero, result will be zero.');
      finalAreaInTsuboUnits = 0;
    } else {
      finalAreaInTsuboUnits = areaInSquareMeters / TSUBO_TO_SQUARE_METERS_FACTOR;
    }

    // --- Output Result ---
    // Call the dedicated helper to display the final result.
    presentFormattedResult(finalAreaInTsuboUnits);
  }

  // --- Setup for Standard Input Stream Handling ---

  // Keep the standard input stream alive and prevent the process from exiting prematurely.
  process.stdin.resume();

  // Set the character encoding for the incoming data to UTF-8.
  process.stdin.setEncoding('utf8');

  // Attach an event listener for 'data' events.
  // Each time a chunk of data is received, append it to our buffer.
  process.stdin.on('data', (incomingDataSegment) => {
    // Ensure the received segment is a string and not empty before appending.
    if (typeof incomingDataSegment === 'string' && incomingDataSegment.length > 0) {
      accumulatedInputBuffer += incomingDataSegment;
    }
  });

  // Attach an event listener for the 'end' event.
  // This event fires when the standard input stream has closed, indicating all data has been received.
  process.stdin.on('end', () => {
    // Once all input is collected, trigger the main processing function.
    initiateAreaConversionProcess();
  });

  // The immediately invoked function expression (IIFE) ensures that this
  // setup code runs as soon as the script is loaded.
})();