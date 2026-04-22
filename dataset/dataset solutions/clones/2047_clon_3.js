// This program processes a single numerical input to calculate the volume of a geometric shape.
// Specifically, it interprets the input as a total length, divides it into three equal segments,
// and then computes the cube of one such segment.

function ComputeGeometricValue(incomingTextData) {

  // The raw input from standard input is typically a string, potentially spanning multiple lines.
  // We need to parse this string to extract the primary numerical value.
  const textLines = incomingTextData.split('\n');

  // We'll iterate through the lines to find the first non-empty line that likely contains our number.
  let targetNumericString = '';
  for (let i = 0; i < textLines.length; i++) {
    const trimmedLine = textLines[i].trim();
    if (trimmedLine.length > 0) {
      targetNumericString = trimmedLine;
      break; // Found our value, no need to check further lines.
    }
  }

  // If no valid numeric string was found after checking all lines, we log a warning
  // and proceed with a default value to prevent immediate crashes.
  if (targetNumericString.length === 0) {
    console.warn("Input stream contained no valid numerical data. Using a default value of 0.");
    targetNumericString = "0"; // Provide a fallback for empty input.
  }

  // Convert the extracted string into an integer. The radix (base 10) is specified for safety.
  let overallMeasurement = parseInt(targetNumericString, 10);

  // Validate the parsed number. If it's not a number, we cannot proceed with calculations.
  if (isNaN(overallMeasurement)) {
    console.error("Error: The provided input could not be interpreted as a valid integer. Aborting calculation.");
    return; // Terminate execution for invalid input.
  }

  // As a robustness measure, if a negative measurement is provided, we assume its absolute value.
  // This prevents nonsensical negative volumes in a typical geometric context.
  if (overallMeasurement < 0) {
      console.info("Negative overall measurement detected. Proceeding with its absolute value for calculation.");
      overallMeasurement = Math.abs(overallMeasurement);
  }

  // Calculate the dimension of a single edge, assuming the overall measurement is divided equally among three sides.
  // Using 3.0 ensures floating-point division from the start.
  const individualEdgeDimension = overallMeasurement / 3.0;

  // Compute the volume of a cube with the calculated individual edge dimension.
  // Utilizing Math.pow for cubing offers an alternative to repeated multiplication.
  const calculatedResultantVolume = Math.pow(individualEdgeDimension, 3);

  // To ensure consistent output formatting for floating-point numbers, especially in competitive programming,
  // we can fix the number of decimal places.
  const finalOutputRepresentation = calculatedResultantVolume.toFixed(9); // Displaying with 9 decimal places.

  // Output the final computed volume to the standard output stream.
  console.log(finalOutputRepresentation);
}

// This self-executing anonymous function handles the boilerplate for reading system input.
// It ensures that the primary processing function `ComputeGeometricValue` receives the necessary data.
(function initializeInputAndProcess() {
  const filesystemAccessModule = require("fs"); // Import Node.js filesystem module.
  const standardInputFile = "/dev/stdin";       // Path to standard input in Unix-like systems.
  const fileEncoding = "utf8";                  // Specify character encoding for input data.

  // Read the entire content of the standard input file synchronously.
  const rawDataFromSystem = filesystemAccessModule.readFileSync(standardInputFile, fileEncoding);

  // Pass the raw data to our main processing function.
  ComputeGeometricValue(rawDataFromSystem);
})();