// This module processes a dataset to determine a specific outcome based on selection criteria.
function EvaluateCriteria(receivedContent) {
  // Initialize the decision message. By default, assume a positive outcome.
  let outcomeMessage = "Yes";

  // Pre-process the raw input content by cleaning leading/trailing whitespace
  // and then segmenting it into individual lines for easier parsing.
  const processedLines = receivedContent.trim().split("\n");

  // Define a utility function to compute the sum of numeric values within an array.
  const aggregateNumericValues = (collection) => {
    // First, perform a preliminary check: if the collection is not a valid array
    // or if it contains no elements, return 0 to prevent errors and ensure correctness.
    if (!Array.isArray(collection) || collection.length === 0) {
      return 0;
    }
    // Use the `reduce` method to sum all elements. An explicit initial value of 0
    // is provided to handle cases where the array might somehow become empty after filtering.
    return collection.reduce((currentSum, element) => currentSum + element, 0);
  };

  // Extract the first line which contains space-separated item counts.
  const [itemCountString, selectionCountString] = processedLines[0].split(" ");

  // Parse the string representations into integer numerical values.
  // Using `parseInt` with radix 10 for explicit base conversion.
  const totalItemsCount = parseInt(itemCountString, 10);
  const selectionThresholdQuantity = parseInt(selectionCountString, 10);

  // Implement a basic validation for the selection threshold.
  // If it's not a number or is non-positive, it indicates an invalid input scenario.
  if (isNaN(selectionThresholdQuantity) || selectionThresholdQuantity <= 0) {
      // Log an error message to the console for debugging purposes.
      console.error("Error: The provided selection threshold is invalid or non-positive.");
      // Set the outcome to "No" as the criteria cannot be met under these conditions.
      outcomeMessage = "No";
      // In a real-world scenario, an early return might be appropriate here.
      // For this problem's context, we'll proceed, but the outcome is already determined.
  }

  // Retrieve the array of data points from the second line of input.
  // Each string value is converted to a number using the `Number()` constructor.
  let dataPointsCollection = processedLines[1].split(" ").map(val => Number(val));

  // Filter out any entries that might have resulted in `NaN` during the parsing process,
  // ensuring that only valid numeric data points remain for calculations.
  dataPointsCollection = dataPointsCollection.filter(val => !isNaN(val));

  // Sort the collection of data points in descending order (largest to smallest).
  // A verbose comparison function is used for improved readability.
  dataPointsCollection.sort((firstElement, secondElement) => {
    // The difference (second - first) ensures descending order.
    return secondElement - firstElement;
  });

  // Determine the actual number of elements to select.
  // This prevents attempting to slice more elements than are available in the collection.
  const actualElementsToSelect = Math.min(selectionThresholdQuantity, dataPointsCollection.length);
  // Extract the primary elements (the top 'M' elements) from the sorted collection.
  const primarySelectedElements = dataPointsCollection.slice(0, actualElementsToSelect);

  // Calculate the total sum of all data points in the original collection.
  const overallSumOfAllValues = aggregateNumericValues(dataPointsCollection);

  // Compute the divisor required for the minimum acceptance threshold calculation.
  // Using a bitwise left shift (equivalent to multiplication by 4) as an alternative operation.
  const thresholdDenominator = selectionThresholdQuantity << 2; // M * 4

  // Implement a guard clause to prevent division by zero, which would lead to `Infinity` or `NaN`.
  if (thresholdDenominator === 0) {
      // Issue a warning if the denominator is zero, indicating a potential issue in input or logic.
      console.warn("Warning: The calculated threshold denominator is zero. This will prevent a valid comparison.");
      // If the denominator is zero, the criteria cannot be reasonably met.
      outcomeMessage = "No";
  } else {
      // Calculate the critical minimum acceptance threshold based on the total sum and the divisor.
      const minimumAcceptanceValue = overallSumOfAllValues / thresholdDenominator;

      // Identify the smallest value among the primary selected elements.
      // This is the last element in the `primarySelectedElements` array because it's sorted descending.
      const smallestAmongSelected = primarySelectedElements[primarySelectedElements.length - 1];

      // Perform the final comparative check.
      // If the smallest of the selected elements falls below the acceptance threshold,
      // the overall condition is not met.
      if (smallestAmongSelected < minimumAcceptanceValue) {
        outcomeMessage = "No";
      }
  }

  // Output the final determined status message to standard output.
  console.log(outcomeMessage);
}

// Standard input/output handling for competitive programming environments.
// This block of code reads the entire input from `/dev/stdin` and passes it
// to the `EvaluateCriteria` function. Do not modify this section.
EvaluateCriteria(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local testing, uncomment the line below and comment out the production input line.
// EvaluateCriteria(require("fs").readFileSync("./input.txt", "utf8"));