const NEWLINE_DELIMITER = '\n';
const WHITESPACE_DELIMITER = ' ';
const CAPACITY_EXCEEDED_ERROR_VALUE = -1;

/**
 * A utility function to safely convert a string value into a number.
 * It includes basic error handling for non-numeric inputs.
 *
 * @param {string} stringRepresentation The string to be converted to a number.
 * @returns {number} The parsed numeric value, or 0 if parsing fails.
 */
function safelyParseNumericString(stringRepresentation) {
  const convertedValue = Number(stringRepresentation);
  // Check if the conversion resulted in a non-numeric value (NaN).
  if (isNaN(convertedValue)) {
    // In a production scenario, one might throw an error or log more extensively.
    // For this problem, assuming inputs are generally valid, but adding robustness.
    console.warn(`Encountered non-numeric input: "${stringRepresentation}". Treating as 0.`);
    return 0;
  }
  return convertedValue;
}

/**
 * Processes a multi-line string input to calculate the remaining capacity
 * after deducting the total weight of items from a given maximum capacity.
 *
 * The input is expected to be in the format:
 * Line 1: "<Maximum Capacity> <Number of Items>" (e.g., "100 3")
 * Line 2: "<Item Weight 1> <Item Weight 2> ... <Item Weight N>" (e.g., "10 20 30")
 *
 * The 'Number of Items' value from the first line is explicitly ignored as it's not
 * used in the final calculation, demonstrating a Type III deletion.
 *
 * @param {string} rawInputContent The complete input as a single string.
 */
function calculateContainerSpace(rawInputContent) {
  // First, validate the integrity of the input string.
  // If the input is empty or just whitespace, we cannot proceed.
  if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("Error: Provided input content is empty or invalid.");
    // Exit the function or throw an error as appropriate for the application context.
    return;
  }

  // Break down the raw input into an array of individual lines.
  const inputLines = rawInputContent.split(NEWLINE_DELIMITER);

  // Ensure that we have at least two lines of data as expected.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines for capacity and item weights.");
    return;
  }

  // Process the first line to extract the total allowed capacity.
  // We split by whitespace to get individual numeric parts.
  const capacityAndItemCount = inputLines[0].split(WHITESPACE_DELIMITER);

  // The first element is the total capacity.
  const maximumTotalCapacity = safelyParseNumericString(capacityAndItemCount[0]);
  // The second element (original 'M') represents the count of items.
  // It is parsed in the original code but not used, so we explicitly skip/delete its usage here.
  // If it were needed, it would be 'safelyParseNumericString(capacityAndItemCount[1]);'

  // Process the second line to get the weights of all individual items.
  // Validate that the item weights line is not empty after trimming.
  if (inputLines[1].trim().length === 0) {
      console.warn("Warning: The line specifying item weights is empty. Assuming no items are present.");
      // If no items, the remaining space is simply the maximum capacity.
      // We still apply the check for negative capacity, although it's unlikely here.
      const resultIfNoItems = maximumTotalCapacity;
      console.log(resultIfNoItems < 0 ? CAPACITY_EXCEEDED_ERROR_VALUE : resultIfNoItems);
      return;
  }
  const individualItemWeights = inputLines[1].split(WHITESPACE_DELIMITER).map(safelyParseNumericString);

  // Calculate the aggregate weight of all items using an iterative approach.
  // This is a Type III rewrite from a 'reduce' method to a 'for' loop.
  let accumulatedItemWeight = 0;
  for (let i = 0; i < individualItemWeights.length; i++) {
    const currentItemWeight = individualItemWeights[i];
    accumulatedItemWeight += currentItemWeight;
  }

  // Determine the remaining space by subtracting the total item weight from the capacity.
  // An intermediate variable is introduced for clarity, a Type III addition.
  const actualRemainingSpace = maximumTotalCapacity - accumulatedItemWeight;

  // Formulate the final output based on whether the capacity has been exceeded.
  // This conditional logic is rewritten from a ternary operator to an if-else block.
  let finalOutputResult;
  if (actualRemainingSpace < 0) {
    // If the items collectively weigh more than the container's capacity,
    // indicate an overflow condition with a predefined error value.
    finalOutputResult = CAPACITY_EXCEEDED_ERROR_VALUE;
  } else {
    // Otherwise, report the exact amount of space left.
    finalOutputResult = actualRemainingSpace;
  }

  // Display the computed result to the standard output.
  console.log(finalOutputResult);
}

// Entry point for the application.
// This block handles reading input from stdin and orchestrating the processing.
// A try-catch block is added for robust error handling during file system operations.
try {
  // Attempt to read all content from standard input synchronously.
  // 'utf8' encoding is specified to handle text data correctly.
  const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Pass the obtained content to our primary processing function.
  calculateContainerSpace(stdinContent);
} catch (fileReadError) {
  // If any error occurs during the file reading process (e.g., permissions, file not found),
  // log the error message for diagnostic purposes.
  console.error("An unrecoverable error occurred while reading from standard input:", fileReadError.message);
  // Optionally, terminate the process with an error code.
  // process.exit(1);
}