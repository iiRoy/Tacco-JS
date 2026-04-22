(() => {
  try {
    // Retrieve the raw data from the standard input stream.
    // This assumes the script is executed in an environment where /dev/stdin is available.
    const rawDataContent = require("fs").readFileSync("/dev/stdin", "UTF-8");

    // Invoke the primary processing routine with the acquired data.
    const finalCalculatedScore = calculateCombinedProductScore(rawDataContent);

    // Display the final computed result to standard output.
    console.log(finalCalculatedScore);
  } catch (operationError) {
    // Handle any errors that occur during file reading or initial processing.
    console.error("An error occurred during script execution:", operationError.message);
    // Exit with a non-zero code to indicate an error.
    process.exit(1);
  }
})();

/**
 * Computes the sum of products for all unique pairs of numeric values provided in the input.
 *
 * @param {string} fullInputString - The complete input content as a single string,
 *                                   expected to contain multiple lines separated by newlines.
 * @returns {number} The aggregated sum of all pairwise products.
 */
function calculateCombinedProductScore(fullInputString) {
  // Divide the input string into an array of individual lines.
  const inputLineArray = fullInputString.split("\n");

  // Perform a preliminary check to ensure sufficient input lines are present.
  if (inputLineArray.length < 2) {
    console.warn("Warning: Input string does not contain enough lines. Expected at least 2.");
    return 0; // Return zero if input is insufficient, as no calculations can be performed.
  }

  // Parse the first line to determine the expected number of items.
  const expectedItemCountString = inputLineArray[0];
  const declaredItemQuantity = Number(expectedItemCountString);

  // Validate the parsed item quantity. It must be a positive number.
  if (isNaN(declaredItemQuantity) || declaredItemQuantity <= 0) {
    console.warn(`Warning: Invalid or non-positive item quantity detected: '${expectedItemCountString}'. Defaulting to zero score.`);
    return 0;
  }

  // Initialize the variable that will accumulate the sum of products.
  let cumulativeScore = 0;

  // Process the second line, which contains space-separated numeric values.
  // Filter out any empty strings that might result from multiple spaces or trimming.
  const rawValueStrings = inputLineArray[1].split(" ").filter(segment => segment.trim() !== '');

  // Convert the string representations of values into actual numbers.
  // A temporary array is used for storing the successfully parsed numeric values.
  const processedNumericValues = [];
  for (const valueToken of rawValueStrings) {
    const parsedNumber = Number(valueToken);
    if (!isNaN(parsedNumber)) {
      processedNumericValues.push(parsedNumber);
    } else {
      // Log a warning for any non-numeric tokens encountered.
      console.warn(`Warning: Skipping non-numeric value token: '${valueToken}'.`);
    }
  }

  // Optional: Verify if the count of parsed values matches the declared quantity.
  if (processedNumericValues.length !== declaredItemQuantity) {
    console.warn(`Warning: Mismatch between declared item quantity (${declaredItemQuantity}) and actual parsed numeric values (${processedNumericValues.length}). Calculation proceeds with available values.`);
    // Depending on requirements, one might throw an error or adjust `declaredItemQuantity` here.
  }

  // Core calculation logic: Iterate through all unique pairs of values.
  // The outer loop picks the first element of a pair.
  for (let firstElementIndex = 0; firstElementIndex < processedNumericValues.length - 1; firstElementIndex++) {
    // Store the value of the first element for clarity and efficiency.
    const currentFirstValue = processedNumericValues[firstElementIndex];

    // The inner loop picks the second element, ensuring it's always after the first element
    // to avoid duplicate pairs and self-multiplication.
    for (let secondElementIndex = firstElementIndex + 1; secondElementIndex < processedNumericValues.length; secondElementIndex++) {
      // Store the value of the second element.
      const currentSecondValue = processedNumericValues[secondElementIndex];

      // Compute the product of the current pair.
      const productOfPair = currentFirstValue * currentSecondValue;

      // Add the calculated product to the running total.
      cumulativeScore = cumulativeScore + productOfPair;
    }
  }

  // Return the final accumulated score.
  return cumulativeScore;
}