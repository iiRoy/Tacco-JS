const fileSystemOperations = require('fs');

// --- Stage 1: Read and prepare input from standard stream ---

// Obtain a descriptor for the standard input stream.
const standardInputDescriptor = process.stdin.fd;

// Retrieve synchronous file status for the input descriptor to determine its size.
const inputStatResult = fileSystemOperations.fstatSync(standardInputDescriptor);
const rawStreamByteCount = inputStatResult.size; // Renamed 'length' to 'rawStreamByteCount'

let dataBufferContainer;
let actualBytesTransferred = 0; // Renamed 'bytesRead' to 'actualBytesTransferred'
let completeRawInputString = ''; // Intermediate variable for processed string content

// Proceed only if there is data available in the input stream.
if (rawStreamByteCount > 0) {
  // Allocate a buffer of the determined size to store the incoming bytes.
  dataBufferContainer = Buffer.alloc(rawStreamByteCount); // Renamed 'buffer' to 'dataBufferContainer'

  // Synchronously read the entire content from stdin into the allocated buffer.
  actualBytesTransferred = fileSystemOperations.readSync(
    standardInputDescriptor,
    dataBufferContainer,
    0, // Offset to start writing in the buffer
    rawStreamByteCount, // Number of bytes to read
    0 // Position in the file to begin reading (0 for stdin)
  );

  // Convert the portion of the buffer containing actual data into a UTF-8 string.
  completeRawInputString = dataBufferContainer.slice(0, actualBytesTransferred).toString('utf8');
} else {
  // If no input bytes are detected, issue a warning.
  // The script will continue to process an empty line array, mimicking the original behavior.
  console.warn("Warning: No data received from standard input.");
}

// Split the raw input string into an array of lines.
// Using a regex for robust line ending handling (Windows/Unix) and filtering out empty lines.
const processedInputLines = completeRawInputString
  .split(/\r?\n/) // Renamed 'input' to 'processedInputLines'
  .filter(lineSegment => lineSegment.trim().length > 0); // Remove empty or whitespace-only lines

// --- Stage 2: Define the core processing logic ---

// This function encapsulates the logic for transforming numeric lines
// based on an octal representation and a custom digit lookup.
const transformNumericLines = (digitSubstitutionMap) => { // Renamed 'k' to 'digitSubstitutionMap'
  const transformationOutputs = []; // Collects all successfully transformed strings

  // Iterate over each line that was read from the standard input.
  for (const currentLineContent of processedInputLines) { // Renamed 'l' to 'currentLineContent'
    // Attempt to convert the current line's content into a numeric value.
    const numericalInterpretation = Number(currentLineContent);

    // Only process lines that successfully convert to a non-zero number.
    // This is equivalent to the original `l - 0 && ...` check.
    if (numericalInterpretation) {
      // Convert the numeric value to its octal (base-8) string representation.
      const octalRepresentation = numericalInterpretation.toString(8);

      // Split the octal string into an array of individual digit characters.
      const octalDigitCharacters = octalRepresentation.split('');

      // Map each octal digit character to a new value using the provided substitution map.
      const substitutedDigits = octalDigitCharacters.map((singleOctalChar) => { // Renamed 'ch' to 'singleOctalChar'
        const mapIndex = parseInt(singleOctalChar, 10); // Convert char to integer for array access

        // Validate the index to prevent out-of-bounds access.
        // For octal digits (0-7), this typically covers the expected range.
        if (mapIndex >= 0 && mapIndex < digitSubstitutionMap.length) {
          return digitSubstitutionMap[mapIndex];
        } else {
          // In case of an unexpected digit or map configuration, return an empty string or handle error.
          console.error(`Error: Octal digit '${singleOctalChar}' generated an invalid index ${mapIndex} for the substitution map.`);
          return ''; // Fallback: return an empty string for invalid mappings
        }
      });

      // Join the substituted digits back into a single string.
      const finalTransformedString = substitutedDigits.join('');

      // Add the result of this line's transformation to our collection.
      transformationOutputs.push(finalTransformedString);
    }
  }

  // After processing all lines, output the collected results.
  // This aggregates all console.log calls into a single one, if any results exist.
  if (transformationOutputs.length > 0) {
    console.log(transformationOutputs.join('\n'));
  } else if (processedInputLines.length > 0) {
    // If input lines existed but none were numeric or non-zero, inform the user.
    console.log("No valid non-zero numeric lines were found for transformation.");
  } else {
    // If no input lines were even provided.
    console.log("No input lines were provided for processing.");
  }
};

// --- Stage 3: Execution ---

// Define the custom array for digit substitution.
// This array dictates how octal digits (0-7) are re-mapped.
// Note the values for original digits 4 and 6 are custom.
const customDigitMappingArray = [0, 1, 2, 3, 5, 7, 8, 9];

// Invoke the transformation function with the prepared input lines and the custom mapping.
transformNumericLines(customDigitMappingArray);