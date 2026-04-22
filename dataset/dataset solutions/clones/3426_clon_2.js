// Import the necessary module loading function from the Node.js environment.
const moduleLoader = require;

// Obtain a reference to the file system utility module for input/output operations.
const fileSysUtil = moduleLoader("node:fs");

// Define the file path for reading standard input, typically from the command line.
const inputLocation = "/dev/stdin";

// Specify the character encoding standard to be used when reading the file content.
const textEncodingStandard = "utf8";

// Read the entire textual content from the specified input location using the defined encoding.
const sourceContent = fileSysUtil.readFileSync(inputLocation, textEncodingStandard);

// Declare a constant numerical value that will be used as a reference for calculations.
const targetNumericValue = 753;

// Perform a series of operations to find the smallest absolute difference.
// This involves iterating through all possible three-character numeric segments within the source content.
Math.min(
  // The spread operator (...) is used here to pass an array of calculated differences
  // as individual arguments to the Math.min function, effectively replacing .apply(null, ...).
  ...Array(sourceContent.length - 2) // Generate an array with a length equal to the number of possible 3-char segments.
    // Map over this array, where each element represents a starting index for a segment.
    .map((
      _unusedParameter, // This parameter is a placeholder as its value is not directly used.
      currentPosition // This parameter represents the current starting index for the substring extraction.
    ) => {
      // Extract a substring of three characters starting from the 'currentPosition'.
      const segmentStr = sourceContent.slice(currentPosition, currentPosition + 3);

      // Convert the extracted string segment into an integer using base 10.
      // This explicitly handles string-to-number conversion.
      const segmentNumeric = parseInt(segmentStr, 10);

      // Calculate the absolute difference between the predefined target value and the numeric segment.
      return Math.abs(targetNumericValue - segmentNumeric);
    })
);