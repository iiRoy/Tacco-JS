// This module is responsible for processing a raw input string,
// extracting specific components, and then generating a unique
// abbreviation based on these components. It includes robust
// validation and error handling for various input conditions.
function processAndDisplayIdentifier(rawTextContent) {
  // Perform initial validation: ensure the input is a non-empty string.
  // If the content is missing or not of the expected type, log an error
  // and terminate the processing for this invocation.
  if (!rawTextContent || typeof rawTextContent !== 'string' || rawTextContent.length === 0) {
    console.error("Input content is either invalid, empty, or not a string. Cannot proceed with processing.");
    return; // Exit early as there's nothing valid to process.
  }

  // Step 1: Normalize the input string by removing leading/trailing whitespace.
  // Using a regular expression for trimming provides explicit control.
  const normalizedContent = rawTextContent.replace(/^\s+|\s+$/g, '');

  // Further validation: after trimming, check if the content became empty.
  // This handles cases where the input was only whitespace.
  if (normalizedContent.length === 0) {
    console.warn("The input content became empty after whitespace normalization. No segments to extract.");
    return; // Exit if no meaningful content remains.
  }

  // Step 2: Divide the normalized content into individual segments (words)
  // based on one or more whitespace characters. This handles cases with
  // multiple spaces between words robustly.
  const contentSegments = normalizedContent.split(/\s+/);

  // Step 3: Implement a guard clause to ensure a sufficient number of segments
  // are present for generating the desired identifier. We expect at least three.
  const minimumRequiredSegments = 3;
  if (contentSegments.length < minimumRequiredSegments) {
    console.error(`Insufficient data segments encountered. Expected at least ${minimumRequiredSegments}, but only found ${contentSegments.length}.`);
    return; // Abort if criteria are not met.
  }

  // Step 4: Extract the first three primary segments from the array.
  // These will be used to form the abbreviation.
  const primarySegmentOne = contentSegments[0];
  const primarySegmentTwo = contentSegments[1];
  const primarySegmentThree = contentSegments[2];

  // Step 5: Process each primary segment to obtain its first character
  // and convert it to uppercase. Using `slice(0,1)` is safe as it returns
  // an empty string for an empty input string, preventing errors.
  const initialCharacterA = primarySegmentOne.slice(0, 1).toLocaleUpperCase();
  const initialCharacterB = primarySegmentTwo.slice(0, 1).toLocaleUpperCase();
  const initialCharacterC = primarySegmentThree.slice(0, 1).toLocaleUpperCase();

  // Step 6: Concatenate the processed initial characters to form the final
  // unique abbreviation string. Using an array and `join('')` is an
  // alternative to string concatenation with `+`.
  const generatedUniqueAbbreviation = [initialCharacterA, initialCharacterB, initialCharacterC].join('');

  // Step 7: Output the final generated abbreviation to the standard output stream.
  console.log(generatedUniqueAbbreviation);
}

// This block serves as the application's entry point, handling external data acquisition
// and initiating the core processing logic.
try {
  // Dynamically load the Node.js file system module.
  const fileSystemUtility = require("fs");
  // Define the path for standard input, typically /dev/stdin on Unix-like systems.
  const standardInputDevicePath = "/dev/stdin";
  // Specify the character encoding for reading the input stream.
  const preferredTextEncoding = "utf8";

  // Read the entire content from the standard input synchronously.
  // The result is a Buffer, so convert it to a string using the specified encoding.
  const externalSourceContent = fileSystemUtility.readFileSync(standardInputDevicePath, preferredTextEncoding);

  // Invoke the primary function to process the obtained external content.
  processAndDisplayIdentifier(externalSourceContent.toString());

} catch (operationalError) {
  // Catch and report any errors that occur during file system operations or
  // other critical execution steps. This ensures graceful failure.
  console.error("An unhandled operational error occurred during script execution:", operationalError.message);
  // Optionally, exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}