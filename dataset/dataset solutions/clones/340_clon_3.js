(function () {
  let rawDataBuffer = ''; // Buffer for accumulating standard input

  /**
   * Comparator function for sorting numeric values in ascending order.
   * Ensures consistent numeric comparison for Array.prototype.sort().
   * @param {string|number} firstVal - The first value to compare.
   * @param {string|number} secondVal - The second value to compare.
   * @returns {number} A negative value if firstVal is less than secondVal,
   *                   a positive value if firstVal is greater, or zero if equal.
   */
  function numericAscendingComparator (firstVal, secondVal) {
    // Explicitly convert values to numbers to handle string inputs correctly.
    const numA = Number(firstVal);
    const numB = Number(secondVal);

    // If either conversion results in NaN, fall back to string comparison,
    // though for the expected input, numbers are assumed.
    if (isNaN(numA) || isNaN(numB)) {
      return String(firstVal).localeCompare(String(secondVal));
    }

    return numA - numB;
  }

  /**
   * Organizes the properties of an object alphabetically by their keys.
   * Returns a new object with the same key-value pairs but ordered.
   * @param {Object} sourceObject - The object whose keys need to be sorted.
   * @returns {Object} A new object with keys sorted alphabetically. Returns an empty object
   *                   if the input is not a valid plain object.
   */
  function orderObjectByKeys (sourceObject) {
    // Guard clause for invalid or non-object inputs.
    if (!sourceObject || typeof sourceObject !== 'object' || Array.isArray(sourceObject)) {
      console.error("Warning: orderObjectByKeys received invalid input. Expected a plain object.");
      return {};
    }

    const objectKeys = Object.keys(sourceObject); // Extract all enumerable string keys.
    objectKeys.sort(); // Sort the keys alphabetically.

    // Use Array.prototype.reduce to construct the new ordered object.
    const orderedResult = objectKeys.reduce((accumulator, currentKey) => {
      accumulator[currentKey] = sourceObject[currentKey];
      return accumulator;
    }, {});

    return orderedResult;
  }

  /**
   * Transforms an array of elements into a single space-separated string.
   * Handles empty arrays gracefully.
   * @param {Array<string|number>} elementsList - The array of items to concatenate.
   * @returns {string} A string where array elements are joined by spaces. Returns an empty
   *                   string if the input is not an array or is an empty array.
   */
  function formatArrayElementsToString (elementsList) {
    // Guard clause for non-array or empty array inputs.
    if (!Array.isArray(elementsList) || elementsList.length === 0) {
      return "";
    }
    // Leverage the Array.prototype.join method for efficient string concatenation.
    return elementsList.join(' ');
  }

  /**
   * Main processing function to parse input, categorize data, and print results.
   * Reads from the `rawDataBuffer`, processes each line, and outputs formatted data.
   */
  function processInputData () {
    // Split the raw buffer into lines, filtering out any empty or whitespace-only lines.
    // This handles cases where input might end with a newline or contain blank lines.
    const inputLines = rawDataBuffer
      .split('\n')
      .map(line => line.trim()) // Trim whitespace from each line
      .filter(line => line.length > 0); // Exclude truly empty lines

    const numValidLines = inputLines.length;

    // Early exit if no valid lines are available after filtering.
    if (numValidLines === 0) {
      console.error("Error: No valid input lines provided for processing.");
      return;
    }

    const categorizedEntries = {}; // Object to store data, similar to a dictionary or hash map.

    // Iterate over each valid input line.
    for (let lineIndex = 0; lineIndex < numValidLines; lineIndex++) {
      const currentLine = inputLines[lineIndex];
      const lineSegments = currentLine.split(' '); // Split line by space into tokens.

      // Validate that the line contains at least two segments (key and value).
      if (lineSegments.length < 2) {
        // console.warn(`Skipping malformed input line at index ${lineIndex}: "${currentLine}"`);
        continue; // Move to the next line if malformed.
      }

      const primaryKey = lineSegments[0]; // The first segment is the category key.
      const associatedValue = lineSegments[1]; // The second segment is the value.

      // Ensure an array exists for the primaryKey; if not, initialize it.
      // This is an alternative to `hasOwnProperty` check.
      if (!categorizedEntries[primaryKey]) {
        categorizedEntries[primaryKey] = [];
      }

      // Add the value and re-sort the array for the current key.
      categorizedEntries[primaryKey].push(associatedValue);
      categorizedEntries[primaryKey].sort(numericAscendingComparator);
    }

    // Sort the entire collection of entries by their category keys.
    const finalOrderedOutput = orderObjectByKeys(categorizedEntries);

    // Output the categorized and sorted data.
    for (const categoryKey in finalOrderedOutput) {
      // Use hasOwnProperty.call for safer iteration over object properties.
      if (Object.prototype.hasOwnProperty.call(finalOrderedOutput, categoryKey)) {
        console.log(categoryKey);
        // Format the array of values into a space-separated string for output.
        console.log(formatArrayElementsToString(finalOrderedOutput[categoryKey]));
      }
    }
  }

  // --- Standard Input Stream Handling ---

  // Resume the standard input stream to listen for data.
  process.stdin.resume();
  // Set the character encoding for the input stream.
  process.stdin.setEncoding('utf8');

  // Event handler for when data chunks are received.
  process.stdin.on('data', function (incomingDataChunk) {
    rawDataBuffer += incomingDataChunk; // Append incoming data to the buffer.
  });

  // Event handler for when the input stream ends.
  process.stdin.on('end', function () {
    // Perform a final check for empty or whitespace-only input after all data is received.
    if (rawDataBuffer.trim().length === 0) {
      console.warn("Input stream ended, but no meaningful data was received.");
      return; // Exit if no data to process.
    }
    processInputData(); // Initiate the main data processing routine.
  });
}());