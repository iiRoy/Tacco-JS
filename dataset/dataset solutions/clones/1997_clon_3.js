// Solution for a specific problem requiring reordering of input values from a string.
function processInputData(rawDataString) {
  // Validate the raw input string to ensure it's not empty or invalid.
  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === '') {
    console.error("Error: Provided input data is empty or malformed. Cannot proceed.");
    return; // Terminate execution for invalid input.
  }

  // Define the character used to separate tokens in the input string.
  const inputTokenDelimiter = " ";
  // Split the trimmed raw input string into an array of segments.
  const inputSegments = rawDataString.trim().split(inputTokenDelimiter);

  // Specify the minimum number of segments expected for correct processing.
  const minimumSegmentCount = 3;
  // Validate if the number of segments meets the minimum requirement.
  if (inputSegments.length < minimumSegmentCount) {
    console.error(`Error: Insufficient input segments. Expected at least ${minimumSegmentCount}, but received ${inputSegments.length}.`);
    return; // Terminate execution if input is incomplete.
  }

  // Helper function to safely parse a string segment into an integer.
  const convertSegmentToNumber = (segment) => {
    const numericValue = parseInt(segment, 10);
    // Log a warning if parsing fails and provide a default value.
    if (isNaN(numericValue)) {
      console.warn(`Warning: Failed to convert segment "${segment}" into a number. Using 0 as a fallback.`);
      return 0;
    }
    return numericValue;
  };

  // Parse and store the values from the input segments, referenced by their original positions.
  const initialNumericValues = {
    firstElement: convertSegmentToNumber(inputSegments[0]),
    secondElement: convertSegmentToNumber(inputSegments[1]),
    thirdElement: convertSegmentToNumber(inputSegments[2]),
  };

  // Assign the parsed values to new variables based on their desired output order.
  // The problem specifies output order: 3rd, 1st, 2nd element from original input.
  let reorderedOutputItemA = initialNumericValues.thirdElement;
  let reorderedOutputItemB = initialNumericValues.firstElement;
  let reorderedOutputItemC = initialNumericValues.secondElement;

  // Construct an array with the numbers in their final display sequence.
  const finalDisplaySequence = [
    reorderedOutputItemA,
    reorderedOutputItemB,
    reorderedOutputItemC
  ];
  // Join the numbers with the same delimiter used for input for consistent output formatting.
  const formattedOutputString = finalDisplaySequence.join(inputTokenDelimiter);

  // Output the result to the console.
  console.log(formattedOutputString);
}

// Main execution block: reads input from standard I/O and passes it to the processing function.
try {
  // Dynamically load the Node.js file system module.
  const nodeFileSystem = require("fs");
  // Define the standard input file path for competitive programming environments.
  const standardInputFilePath = "/dev/stdin";
  // Specify the character encoding for reading the file.
  const fileEncodingScheme = "utf8";

  // Read the entire content of the standard input file synchronously.
  const rawInputContent = nodeFileSystem.readFileSync(standardInputFilePath, fileEncodingScheme);
  // Invoke the data processing function with the content read from stdin.
  processInputData(rawInputContent);
} catch (inputReadError) {
  // Handle any errors that occur during the file reading process.
  console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
  // Optionally, provide a default or fallback processing if input cannot be read.
  // For this problem, simply logging the error is sufficient.
}