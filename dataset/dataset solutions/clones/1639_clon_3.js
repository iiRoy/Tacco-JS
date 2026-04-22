// This function serves as the main entry point for processing the input data
// related to color sequences and segment queries.
function AnalyzeColorSegments(sourceText) {

  // Step 1: Initial Input Parsing
  // Break down the entire provided text into an array of individual lines.
  const allInputLines = sourceText.split("\n");

  // A reusable utility function to convert an array of string numbers into actual integers.
  // It handles potential whitespace around the numbers.
  const convertStringsToIntegers = (stringParts) => stringParts.map(str => parseInt(str.trim(), 10));

  // The first line of input typically contains global parameters.
  // We extract these parameters, though some might not be directly used in the core logic.
  const globalParameters = convertStringsToIntegers(allInputLines[0].split(" "));
  // The first value (originally 'n') is often a total count, but it's not utilized
  // in the subsequent unique color counting process. It's parsed but not assigned
  // to an active variable, thus effectively removed from the flow.
  let totalNumberOfOperations = globalParameters[1]; // This represents 'q', the number of queries.

  // The second line contains the full sequence of color identifiers.
  // These are treated as strings as their values don't require numerical operations.
  const masterColorSequence = allInputLines[1].split(" ");

  // Optional: Add a basic validation check for the number of operations.
  // If no valid operations are specified, we can exit early.
  if (totalNumberOfOperations <= 0) {
    // In a production system, this might involve logging or throwing an error.
    // For competitive programming, it simply means no further processing is needed.
    return;
  }

  // Step 2: Process Each Query Iteratively
  // We loop through each operation, starting from the third line of the input (index 2).
  for (let currentQueryIndex = 0; currentQueryIndex < totalNumberOfOperations; currentQueryIndex++) {
    // Extract the specific line of input that defines the current query's parameters.
    const queryDefinitionLine = allInputLines[currentQueryIndex + 2];
    const segmentBoundaryValues = convertStringsToIntegers(queryDefinitionLine.split(" "));

    // The input provides 1-based indices for the segment boundaries.
    // We adjust them to be 0-based for array access in JavaScript.
    const segmentStartZeroBased = segmentBoundaryValues[0] - 1;
    const segmentEndZeroBased = segmentBoundaryValues[1]; // The end is exclusive in the original loop.

    // A Set data structure is employed here for efficient tracking of unique colors.
    // This is a significant Type III structural change from using an array and indexOf.
    const collectedUniqueShades = new Set();
    let distinctShadeTally = 0; // An explicit counter, demonstrating an added intermediate step.

    // Iterate through the elements within the defined segment.
    // The loop condition ensures we cover all elements from 'start' up to (but not including) 'end'.
    for (let segmentElementPointer = segmentStartZeroBased; segmentElementPointer < segmentEndZeroBased; segmentElementPointer++) {
      // Retrieve the color identifier at the current position within the master sequence.
      const currentShadeIdentifier = masterColorSequence[segmentElementPointer];

      // Check if this color has already been recorded as unique for the current segment.
      if (!collectedUniqueShades.has(currentShadeIdentifier)) {
        // If it's a new unique color, add it to our set.
        collectedUniqueShades.add(currentShadeIdentifier);
        distinctShadeTally++; // Increment the explicit counter.
      }
    }

    // Output the total count of distinct colors found in the analyzed segment.
    // We use the Set's built-in size property for accuracy, though distinctShadeTally holds the same value.
    console.log(collectedUniqueShades.size);
  }
}

// This line handles the environment-specific input reading.
// It reads the entire content of standard input synchronously and passes it to our main processing function.
AnalyzeColorSegments(require("fs").readFileSync("/dev/stdin", "utf8"));