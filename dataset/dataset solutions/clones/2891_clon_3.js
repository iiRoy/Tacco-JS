(function() {
  /**
   * Defines the specific character that the analysis function will search for.
   * This enhances readability and makes the code easier to modify.
   */
  const TARGET_CHARACTER_SYMBOL = 'x';

  /**
   * Sets the critical count threshold for the target character.
   * If the number of occurrences meets or exceeds this value, a specific outcome is triggered.
   */
  const OCCURRENCE_LIMIT_THRESHOLD = 8;

  /**
   * Processes an incoming string of data to evaluate a specific condition
   * based on the count of a predefined character within its first significant line.
   *
   * @param {string} incomingDataSource - The raw string data, potentially containing multiple lines.
   */
  function assessInputCondition(incomingDataSource) {
    // Defensive programming: Validate the input type and content.
    // An invalid or empty string cannot be meaningfully processed for character counts.
    if (typeof incomingDataSource !== 'string' || incomingDataSource.trim().length === 0) {
      // If the input is fundamentally invalid or empty, we can assume the condition
      // for too many 'x's is not met. Thus, outputting 'YES' is a safe default.
      console.log('YES');
      return;
    }

    // Extract the primary line of interest from the raw data.
    // The `.split('\n')[0]` ensures only the first line is considered,
    // and `.trim()` removes any leading/trailing whitespace from that line.
    const mainContentLine = incomingDataSource.split('\n')[0].trim();

    // If, after extraction and trimming, the primary content line is empty,
    // it implies no target characters can be found.
    if (mainContentLine.length === 0) {
      console.log('YES'); // No 'x's present, so the count is certainly below the threshold.
      return;
    }

    // Initialize a counter for the occurrences of our target character.
    let foundCharCount = 0;

    // Iterate through each character of the cleaned main content line.
    // Using a 'for...of' loop provides a clear and modern way to access individual characters.
    for (const currentSymbol of mainContentLine) {
      // Increment the counter if the current character matches our target symbol.
      if (currentSymbol === TARGET_CHARACTER_SYMBOL) {
        foundCharCount++;
      }
    }

    // Based on the total count of the target character, determine the final output.
    // The logic here is an inversion of the original condition for Type III variation.
    if (foundCharCount < OCCURRENCE_LIMIT_THRESHOLD) {
      // If the count is strictly less than the threshold, the condition is met.
      console.log('YES');
    } else {
      // Otherwise, the count is equal to or greater than the threshold.
      console.log('NO');
    }
  }

  // --- Program Entry Point ---
  // Access the Node.js 'fs' (file system) module to read standard input.
  const fileSystemUtility = require("fs");

  // Read the entire content from standard input ('/dev/stdin') using UTF-8 encoding.
  const standardInputData = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Invoke the main processing function with the data obtained from standard input.
  assessInputCondition(standardInputData);

}());