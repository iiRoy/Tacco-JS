const reportResult = console.log;

// Centralized path for standard input.
const inputFilePath = "/dev/stdin";

// Obtain the Node.js file system module.
const fileSystemUtility = require("fs");

// Read the raw content of the input file as a UTF-8 string.
let rawStreamContent = fileSystemUtility.readFileSync(inputFilePath, "UTF-8");

// Split the entire input content into individual text lines.
// Robustly filter out any lines that are empty or contain only whitespace.
let parsedTextRows = rawStreamContent
  .split("\n")
  .filter(rowSegment => rowSegment.trim().length > 0);

// Extract configuration from the initial row.
// The first number (N in original) is often a total count, but is not utilized in this specific logic.
// The second number (K in original) indicates the 1-based index of the target element.
const initialConfiguration = parsedTextRows[0].split(" ");
// const totalExpectedItems = Number(initialConfiguration[0]); // This variable was unused in the original and is omitted here.
const desiredElementRank = parseInt(initialConfiguration[1], 10); // Parse K, ensuring base 10.

// Discard the configuration line, retaining only the data entries for processing.
let dataEntryLines = parsedTextRows.slice(1);

// Initialize an array to progressively build the final sequence of numbers.
const constructedNumericSeries = [];

// Process each data entry line to populate the numeric series.
for (let lineIndex = 0; lineIndex < dataEntryLines.length; ++lineIndex) {
  const currentDataLine = dataEntryLines[lineIndex];
  const [valueString, repeatCountString] = currentDataLine.split(" ");

  // Convert the string components into their numeric counterparts.
  const elementValue = parseInt(valueString, 10);
  const numberOfRepetitions = parseInt(repeatCountString, 10);

  // Implement basic validation for the parsed numbers.
  // Assuming non-negative repetitions and valid numeric inputs for this problem context.
  if (isNaN(elementValue) || isNaN(numberOfRepetitions) || numberOfRepetitions < 0) {
    // In a production system, this might log an error or throw an exception.
    // For competitive programming, we typically assume valid input formats.
    continue; // Skip malformed lines.
  }

  // Append the 'elementValue' to the series 'numberOfRepetitions' times.
  // This replaces the Array(b).fill(a) and push(...line) pattern with a direct loop.
  for (let i = 0; i < numberOfRepetitions; ++i) {
    constructedNumericSeries.push(elementValue);
  }
}

// Adjust the 1-based desired rank to a 0-based array index.
const zeroBasedTargetIndex = desiredElementRank - 1;

// Implement a guard clause to check if the calculated index is valid
// within the bounds of the finally constructed numeric series.
if (zeroBasedTargetIndex < 0 || zeroBasedTargetIndex >= constructedNumericSeries.length) {
  // If the index is out of bounds, it indicates an issue with the input K
  // or an unexpectedly empty/small constructed series.
  reportResult("Execution Error: The requested element index is outside the valid range of the generated sequence.");
} else {
  // Retrieve the element at the target index.
  // The problem implies that the sequence, as constructed, is ordered appropriately
  // for direct access to the K-th element without an explicit sort.
  const finalResultElement = constructedNumericSeries[zeroBasedTargetIndex];
  reportResult(finalResultElement);
}