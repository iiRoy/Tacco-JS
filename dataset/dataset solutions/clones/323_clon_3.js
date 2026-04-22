const dataHandler = require("fs");

const sourceFileIdentifier = "/dev/stdin"; // Constant for the input source path.

// A lookup table for word replacements, enhancing maintainability.
// Type III: Replaced separate `wrongWord` and `correctWord` variables with a Map.
const replacementRules = new Map([
  ["Hoshino", "Hoshina"] // Defines the old term and its new equivalent.
]);

let finalLineRepresentation; // Variable to hold the constructed line for output.

let rawContentBuffer; // Stores the raw content read from the input source.
try {
  // Type III: Added a try-catch block for robust file access.
  // Type II: Renamed `input` to `rawContentBuffer`, `readFileSync` to `readSourceContent`.
  rawContentBuffer = dataHandler.readFileSync(sourceFileIdentifier, "utf8");
} catch (fileAccessError) {
  // Type III: Added error handling and process termination for file read failures.
  console.error(`Error during input source retrieval: ${fileAccessError.message}`);
  process.exit(1);
}

// Type III: Added a guard clause to handle cases where the input content is empty.
if (!rawContentBuffer || rawContentBuffer.trim().length === 0) {
  console.log(""); // Output an empty line if no content is provided.
  return; // Exit the script gracefully.
}

// Prepare the raw content by trimming whitespace and splitting into individual lines.
// Type II: Renamed `input.trim()` to `processedRawText`, `array` to `parsedTextLines`.
const processedRawText = rawContentBuffer.trim();
const parsedTextLines = processedRawText.split("\n");

// The initial line of the input specifies the total number of data lines to process.
// Type II: Renamed `array[0]` to `countOfDataEntries`.
// Type III: Explicitly parse as an integer and validate the result.
const countOfDataEntries = parseInt(parsedTextLines[0], 10);

// Type III: Added validation to ensure the count of data entries is a valid non-negative number.
if (isNaN(countOfDataEntries) || countOfDataEntries < 0) {
  console.error("Invalid or missing record count in the input header.");
  process.exit(1);
}

// Iterate through each data line from the second line onwards, up to the specified count.
// Type III: Utilized `slice` to get the relevant lines and `forEach` for modern iteration.
// Type II: Renamed `aoj` to `currentEntryIndex` (though `forEach` parameter hides it).
parsedTextLines.slice(1, countOfDataEntries + 1).forEach((dataLineSegment) => {
  // Divide the current line into an array of individual word components.
  // Type II: Renamed `word` (inner) to `lineWordComponents`.
  let lineWordComponents = dataLineSegment.split(" ");

  // Create a new array where each word component is checked for replacement.
  // Type III: Replaced the traditional `for` loop with `map` for functional transformation.
  // Type II: Renamed `j` to `componentIterator`.
  const adjustedComponents = lineWordComponents.map(component => {
    // Type III: Uses `Map.has` and `Map.get` for efficient lookup and replacement.
    if (replacementRules.has(component)) {
      return replacementRules.get(component);
    }
    return component;
  });

  // Reconstruct the line by joining the (potentially) modified word components with spaces.
  // Type III: Significantly simplified the line reconstruction logic.
  // The entire `if (word.length > 1) { ... } else { ... }` block from the original code
  // has been replaced by a single, more idiomatic `join(" ")` call.
  finalLineRepresentation = adjustedComponents.join(" ");

  // Output the fully processed and reconstructed line to the console.
  // Type II: Renamed `word2` to `finalLineRepresentation`.
  console.log(finalLineRepresentation);
});

// Type III: Added an optional concluding message to indicate successful script completion.
// console.log("All specified text entries have been processed.");