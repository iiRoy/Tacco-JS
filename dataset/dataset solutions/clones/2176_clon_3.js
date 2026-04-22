function processNumericalDataSet(rawInputPayload) {
  // This routine analyzes a supplied string payload to ascertain the uniqueness
  // of numerical entries within a specified sequence.
  // It anticipates a multi-line string where the first line provides
  // an expected element count, and the second line contains space-delimited numbers.

  // Initiate robust input validation to handle edge cases and malformed data.
  if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
    console.log("ERROR: The provided input payload is either null, not a string, or completely empty. Processing halted.");
    return;
  }

  // Deconstruct the incoming string into an array of individual lines.
  const delineatedInputSegments = rawInputPayload.split('\n');

  // Ensure that the payload contains at least the minimum required two lines of information.
  if (delineatedInputSegments.length < 2) {
    console.log("ERROR: Insufficient data lines detected in the input payload. Expected at least two lines.");
    return;
  }

  // Extract and parse the declared element count from the first line.
  // This value serves as an expectation for the subsequent data.
  const initialCountIndicator = delineatedInputSegments[0].trim();
  const specifiedElementQuantity = Number.parseInt(initialCountIndicator, 10);

  // Process the second line, splitting it into an array of string tokens.
  // A filter is applied to remove any empty strings that might arise from multiple spaces.
  const numericalComponentStrings = delineatedInputSegments[1].trim().split(' ').filter(token => token.length > 0);

  // Perform a critical data integrity check:
  // Validate if the parsed count is a positive number and matches the actual number of tokens.
  if (Number.isNaN(specifiedElementQuantity) || specifiedElementQuantity <= 0 || specifiedElementQuantity !== numericalComponentStrings.length) {
    console.log("ERROR: Data consistency failure - the specified element count does not match the actual number of elements or is invalid.");
    return;
  }

  // Define a localized helper function for consistent string-to-integer conversion.
  const stringToIntegerConverter = (stringValue) => Number.parseInt(stringValue, 10);

  // Create a mutable copy of the numerical string array to allow for in-place sorting.
  let elementsForDuplicateDetection = [...numericalComponentStrings];

  // Sort the array. The comparison function ensures that elements are ordered
  // based on their numerical values, even though they are stored as strings.
  elementsForDuplicateDetection.sort((firstItem, secondItem) => {
    const numericValueA = stringToIntegerConverter(firstItem);
    const numericValueB = stringToIntegerConverter(secondItem);
    return numericValueA - numericValueB;
  });

  // Initialize a boolean flag to record whether any duplicate elements are encountered.
  let duplicateFoundFlag = false;

  // Iterate through the numerically sorted collection.
  // The loop runs until the second-to-last element, allowing comparison with the next element.
  for (let currentIndex = 0; currentIndex < elementsForDuplicateDetection.length - 1; ++currentIndex) {
    const currentElement = elementsForDuplicateDetection[currentIndex];
    const subsequentElement = elementsForDuplicateDetection[currentIndex + 1];

    // If two adjacent elements are strictly identical (same string value) after sorting,
    // it implies a duplicate exists in the original set.
    if (currentElement === subsequentElement) {
      duplicateFoundFlag = true; // Set the flag to indicate a duplicate.
      break; // Optimize by terminating the loop immediately upon finding the first duplicate.
    }
  }

  // Output the final determination based on the state of the duplicate flag.
  if (duplicateFoundFlag) {
    console.log("STATUS: DUPLICATE ELEMENTS EXIST - OUTCOME: NEGATIVE");
  } else {
    console.log("STATUS: ALL ELEMENTS ARE DISTINCT - OUTCOME: POSITIVE");
  }
}