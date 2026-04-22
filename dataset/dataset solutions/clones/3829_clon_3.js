// Function responsible for processing raw textual data to extract and order unique substrings.
function processStringData(rawInputPayload) {
  // Input validation: Ensure the provided payload is a non-empty string.
  if (typeof rawInputPayload !== 'string' || rawInputPayload.trim() === '') {
    console.error("Error: Provided input payload is invalid or empty. Cannot proceed with processing.");
    return; // Exit early if input is bad
  }

  // Segment the raw input string based on whitespace characters.
  // Using match(/\S+/g) is a robust alternative to split(/\s/g) that handles multiple spaces or leading/trailing spaces gracefully.
  const parsedSegments = rawInputPayload.match(/\S+/g);

  // Validate that we have at least two essential segments: the source string and the target index.
  if (!parsedSegments || parsedSegments.length < 2) {
    console.error("Error: Insufficient input segments provided. Expected at least a source string and an index.");
    return;
  }

  // Extract the primary string from which all substrings will be generated.
  const mainSequence = parsedSegments[0];
  // Parse the desired 0-indexed lookup position, ensuring it's an integer.
  let lookupIndex = parseInt(parsedSegments[1], 10);

  // Perform further validations on the extracted data.
  if (mainSequence.length === 0) {
    console.error("Error: The primary sequence string extracted from input is empty. No substrings can be generated.");
    return;
  }
  if (isNaN(lookupIndex)) {
    console.error("Error: The target index provided is not a valid numerical value. Please check input format.");
    return;
  }

  const sequenceLength = mainSequence.length;

  // A temporary collection utilizing a Set to automatically manage uniqueness of substrings.
  const collectedUniqueSubstrings = new Set();

  // Explicitly add the full main sequence to the collection.
  collectedUniqueSubstrings.add(mainSequence);

  // Iterate through all possible starting positions for substrings within the main sequence.
  for (let startIndex = 0; startIndex < sequenceLength; startIndex++) {
    // For each starting position, iterate through all possible ending positions.
    // The endIndex goes up to sequenceLength to include substrings ending at the last character.
    for (let endIndex = startIndex + 1; endIndex <= sequenceLength; endIndex++) {
      // Extract the substring using slice, which is a common and flexible method.
      const currentSegment = mainSequence.slice(startIndex, endIndex);
      // Only add non-empty segments to the set.
      if (currentSegment.length > 0) {
        collectedUniqueSubstrings.add(currentSegment);
      }
    }
  }

  // Convert the Set of unique substrings back into an Array for sorting and indexed access.
  let distinctSortedSegments = Array.from(collectedUniqueSubstrings);

  // Sort the array of distinct substrings alphabetically (lexicographically).
  distinctSortedSegments.sort();

  // Final check: Ensure the desired lookup index is within the valid bounds of the sorted array.
  if (lookupIndex < 0 || lookupIndex >= distinctSortedSegments.length) {
    console.error(
      `Error: Desired lookup index (${lookupIndex}) is out of bounds for the generated list ` +
      `(list size: ${distinctSortedSegments.length}). Cannot retrieve element.`
    );
    // Depending on requirements, could return null, throw an error, or return a default value here.
    return;
  }

  // Retrieve the substring located at the calculated desired index.
  const retrievedResultString = distinctSortedSegments[lookupIndex];

  // Output the final result to the console with a descriptive message.
  console.log(`The requested unique substring at index ${lookupIndex} is: "${retrievedResultString}"`);
}

// Helper utility function to abstract the process of reading input from the file system.
function acquireInputFromFileSystem(sourcePath) {
  try {
    // Attempt to read the file synchronously using Node.js 'fs' module, decoding as UTF-8.
    const fileContents = require("fs").readFileSync(sourcePath, "utf8");
    return fileContents;
  } catch (readError) {
    console.error(`Failed to read input from file path "${sourcePath}":`, readError.message);
    return null; // Return null to indicate a failure in input acquisition.
  }
}

// Main execution block: This acts as the application's entry point.
const standardInputLocation = "/dev/stdin"; // Common path for standard input in *nix environments.
const rawDataFromExternalSource = acquireInputFromFileSystem(standardInputLocation);

// Only proceed with processing if raw input data was successfully obtained.
if (rawDataFromExternalSource !== null) {
  processStringData(rawDataFromExternalSource);
}