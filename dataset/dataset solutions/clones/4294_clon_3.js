// This module handles numerical data processing based on specific equality conditions.
const processRawData = (sourceText) => {
  // Ensure the input string is not empty before proceeding.
  if (!sourceText || sourceText.length === 0) {
    console.error("Input data is empty. Cannot process.");
    return; // Early exit in case of no data
  }

  // Sanitize and segment the textual input into potential number strings.
  // Using a regex for split provides robustness against multiple spaces.
  const numericStringSegments = sourceText.trim().split(/\s+/);

  // Validate that we have exactly three segments as expected.
  if (numericStringSegments.length !== 3) {
    console.error("Expected three numerical values, but received a different count.");
    return; // Early exit if input count is incorrect
  }

  let parsedNumbers = []; // Intermediate array to hold converted numbers

  // Iterate through segments to convert them to numbers, adding validation.
  for (const segment of numericStringSegments) {
    const currentNumber = Number(segment); // Explicit conversion using Number()
    if (isNaN(currentNumber)) {
      console.error(`Invalid numerical segment encountered: '${segment}'. Processing halted.`);
      return; // Exit if any segment is not a valid number
    }
    parsedNumbers.push(currentNumber);
  }

  // Extract the individual numerical components from the validated array for clarity.
  const [valOne, valTwo, valThree] = parsedNumbers;

  let finalOutcome; // Declare a variable to hold the determined result.

  // Evaluate the numerical relationships to find the specific output value.
  // This logic determines which value to print based on equality pairs,
  // following the original problem's specific conditional flow.
  if (valOne === valTwo) {
    // If the first two numbers are identical, the third one is selected.
    // This covers cases like (5, 5, 10) -> 10, or (5, 5, 5) -> 5.
    finalOutcome = valThree;
  } else if (valOne === valThree) {
    // If the first and third numbers are identical, the second one is selected.
    // This covers cases like (5, 10, 5) -> 10.
    finalOutcome = valTwo;
  } else {
    // This final branch covers all other scenarios:
    // 1. Where valTwo === valThree but valOne is different (e.g., 10, 5, 5 -> 10).
    // 2. Where all three numbers are distinct (e.g., 5, 10, 15 -> 5).
    finalOutcome = valOne;
  }

  // Display the computed result to the standard output stream.
  console.log(finalOutcome);
};

// --- Execution Entry Point ---
// Obtain the raw input string from the environment's standard input stream.
// This typically reads from /dev/stdin in Unix-like systems.
// Using 'node:fs' for explicit module namespace and an options object for encoding.
const stdInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Invoke the primary processing routine with the acquired input data.
processRawData(stdInputContent);