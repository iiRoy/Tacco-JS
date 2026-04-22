// Define a custom function to import modules, mirroring 'require'
var moduleImporter = require;

// Access the file system utility via the custom importer
var fileSystemUtility = moduleImporter('fs');

// Specify the standard input device path
const standardInputDevice = '/dev/stdin';

// Set the preferred text encoding for file operations
const preferredTextEncoding = 'utf8';

// Obtain raw content from the standard input file
var sourceContent = fileSystemUtility.readFileSync(standardInputDevice, preferredTextEncoding);

// Prepare the content by removing leading/trailing whitespace and splitting into an array of lines
var contentLines = sourceContent.trim().split("\n");

// Iterate through each individual line in the processed content
for (
  let lineIndex = 0; // Initialize a counter for the current line
  lineIndex < contentLines.length; // Continue as long as there are more lines
  lineIndex++ // Advance to the next line
) {
  // Convert the current line string to a numeric value and then increment it by one
  // Using Number() ensures explicit type conversion.
  var adjustedNumericValue = Number(contentLines[lineIndex]) + 1;

  // Perform a specific mathematical calculation: 0.5 * N * (N - 1)
  // This formula calculates the sum of integers from 1 to (N-1), where N is adjustedNumericValue.
  var calculatedSequenceSum = 0.5 * adjustedNumericValue * (adjustedNumericValue - 1);

  // Output the final result, incremented by one, to the standard console output
  console.log(calculatedSequenceSum + 1);
}