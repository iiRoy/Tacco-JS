const transformAndPresentKeyChars = (sourceTextData) => {
  // This function processes a given string to extract and display
  // the first capitalized character of the initial three words found.
  // It incorporates robust error handling and intermediate steps for clarity.

  // --- Input Validation and Pre-processing ---
  // A crucial guard clause to ensure that the primary input is a valid string.
  // Non-string inputs, or null/undefined values, are explicitly rejected here
  // to prevent subsequent runtime errors and ensure predictable behavior.
  if (typeof sourceTextData !== 'string' || sourceTextData === null || sourceTextData === undefined) {
    console.error("Processing aborted: Input must be a non-null, defined string value.");
    return; // Terminate function execution immediately for invalid input.
  }

  // Intermediate variable to hold the string after removing any leading or trailing whitespace.
  // This step standardizes the input, ensuring consistent parsing regardless of
  // how the input string might be formatted with external spaces.
  const refinedText = sourceTextData.trim();

  // Another intermediate variable: splitting the refined text into an array of individual words or segments.
  // Utilizing a regular expression `/\s+/` allows for robust splitting by one or more whitespace characters,
  // making it more flexible than splitting by a single space.
  const textSegments = refinedText.split(/\s+/);

  // --- Core Transformation Logic ---

  // Define a reusable anonymous helper function to encapsulate the logic for
  // extracting and capitalizing the first character of a string segment.
  // This improves modularity, readability, and makes the mapping process cleaner.
  const getFirstCharAsUppercase = (segmentItem) => {
    // An internal check to ensure the segment is a valid, non-empty string before processing.
    // This handles cases where `split` might produce an empty string (though `/\s+/` usually prevents this),
    // or if an unexpected non-string element were to enter the pipeline.
    if (typeof segmentItem !== 'string' || segmentItem.length === 0) {
      return ''; // Return an empty string if the segment is invalid or empty.
    }
    // Using `slice(0, 1)` as an alternative method to `charAt(0)` for character extraction.
    // This is then immediately converted to its uppercase representation.
    return segmentItem.slice(0, 1).toUpperCase();
  };

  // Extract only the first three relevant segments (words) from the `textSegments` array.
  // If fewer than three segments are available, `slice` will gracefully return all existing ones.
  const relevantSegments = textSegments.slice(0, 3);

  // Apply the `getFirstCharAsUppercase` transformation to each of the `relevantSegments`.
  // This `map` operation produces a new array containing the first capitalized character
  // for each of the selected segments.
  const derivedInitialsArray = relevantSegments.map(getFirstCharAsUppercase);

  // Destructure the `derivedInitialsArray` into distinct, named variables.
  // Crucially, default empty string values (`= ''`) are provided for each variable.
  // This ensures robustness: if fewer than three initials were derived (e.g., input "word1 word2"),
  // the corresponding variables will default to empty strings instead of being `undefined`,
  // preventing errors in subsequent concatenation.
  const [initialValA = '', initialValB = '', initialValC = ''] = derivedInitialsArray;

  // --- Final Output Generation ---

  // Concatenate the extracted and capitalized initials into a single final string.
  // Using the `join('')` method on an array is an alternative and often more readable
  // way to concatenate strings compared to repeated use of the `+` operator.
  const finalConcatenatedString = [initialValA, initialValB, initialValC].join('');

  // Display the final result to the console. A template literal is used for
  // constructing a clear and descriptive output message.
  console.log(`Composed Initials: ${finalConcatenatedString}`);
};

// --- Program Entry Point and I/O Handling ---

// This block serves as the entry point for the program's execution.
// It is responsible for acquiring input from the standard input stream
// and invoking the main processing function.
// Comprehensive error handling is included for file system operations.
try {
  // Use `node:fs` for explicitly referencing the Node.js built-in file system module.
  // `readFileSync` is used to synchronously read the entire content of `/dev/stdin`.
  // The `{ encoding: "utf8" }` option ensures the input is interpreted as UTF-8 text.
  const dataFromStandardInput = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

  // Once the input data is successfully acquired, the main processing logic
  // is invoked by calling our `transformAndPresentKeyChars` function.
  transformAndPresentKeyChars(dataFromStandardInput);
} catch (exceptionDetails) {
  // This `catch` block will execute if any error occurs during the `readFileSync` operation.
  // Such errors might include file not found, permission issues, or other I/O problems.
  // The error message is logged to the console for diagnostic purposes.
  console.error("An error occurred during input acquisition:", exceptionDetails.message);
  // The process is then exited with a non-zero status code (1), which conventionally
  // indicates that the program terminated due to an error or abnormal condition.
  process.exit(1);
}