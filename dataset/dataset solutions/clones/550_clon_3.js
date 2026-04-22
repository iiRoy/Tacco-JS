let rawInputAccumulator = ''; // Stores all incoming data chunks before processing.
let processedInputLines = []; // Array to hold individual lines after splitting.

/**
 * Safely parses a string into an integer.
 * Returns the parsed integer or 0 if parsing fails or input is invalid.
 * @param {string} inputString The string to parse.
 * @returns {number} The parsed integer or 0.
 */
const safeParseInteger = (inputString) => {
  if (typeof inputString !== 'string' || inputString.trim() === '') {
    return 0; // Return a default value for invalid input
  }
  const parsed = Number.parseInt(inputString, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Core function to process the entire input dataset.
 * It iterates through test cases, builds translation maps, and applies them to segments.
 * @param {Array<string>} dataLines An array of strings, where each string is a line from the input.
 */
const processInputDataSet = (dataLines) => {
  let globalLineCursor = 0; // Pointer to the current line being read from dataLines.
  let currentTestCaseNumber = 0; // Counter for the number of test cases processed.

  // Main loop to handle multiple test cases within the input data.
  // The loop continues as long as there's valid input for a new test case.
  while (globalLineCursor < dataLines.length) {
    const numMapEntries = safeParseInteger(dataLines[globalLineCursor]);
    globalLineCursor++; // Advance cursor past the count of map entries.

    // If numMapEntries is 0 or parsing failed, it indicates the end of valid test cases.
    if (numMapEntries <= 0) {
      // If it's the very first line and it's 0, it might be an empty input.
      // Or if subsequent lines are invalid, it means no more test cases.
      if (currentTestCaseNumber === 0 && numMapEntries === 0) {
        // Optionally, handle truly empty input or an explicit 0 for first case.
      }
      break; // Exit the main processing loop.
    }

    currentTestCaseNumber++; // Increment test case counter.
    // console.log(`--- Processing Test Case #${currentTestCaseNumber} ---`); // Optional debug output

    // Initialize a new Map for translations for the current test case.
    const translationDictionary = new Map();

    // Populate the translation dictionary with key-value pairs.
    for (let localItemIndex = 0; localItemIndex < numMapEntries; localItemIndex++) {
      const rawMappingLine = dataLines[globalLineCursor];
      globalLineCursor++; // Advance cursor past the mapping line.

      if (rawMappingLine === undefined || rawMappingLine.trim() === '') {
        // Handle unexpected end of input or empty mapping line.
        // For robustness, we might skip this entry or throw an error.
        // For this clone, we'll just skip and continue.
        continue;
      }

      const currentEntryParts = rawMappingLine.split(' ');
      if (currentEntryParts.length >= 2) {
        // Store the key-value pair.
        translationDictionary.set(currentEntryParts[0], currentEntryParts[1]);
      } else {
        // Handle malformed mapping line, e.g., missing value.
        // console.warn(`Skipping malformed mapping entry: ${rawMappingLine}`); // Optional warning
      }
    }

    // Read the number of segments to look up and translate.
    const numLookupItems = safeParseInteger(dataLines[globalLineCursor]);
    globalLineCursor++; // Advance cursor past the lookup count.

    if (numLookupItems < 0) {
        // Handle invalid lookup count, e.g., negative.
        // For this clone, we'll treat it as zero items to process.
        console.warn(`Invalid lookup item count (${numLookupItems}) encountered in test case #${currentTestCaseNumber}. Treating as 0.`);
        // Ensure cursor advances if needed, though for this case, it might already be at next test case.
    }

    const outputFragments = []; // Array to collect processed string fragments.

    // Process each lookup item.
    for (let localItemIndex = 0; localItemIndex < numLookupItems; localItemIndex++) {
      const currentLookupKey = dataLines[globalLineCursor];
      globalLineCursor++; // Advance cursor past the lookup key.

      if (currentLookupKey === undefined) {
        // Unexpected end of input while expecting lookup keys.
        // Break from this inner loop and potentially the main loop if no more data.
        break;
      }

      // Attempt to find a translation; if not found, use the original key.
      const translatedValue = translationDictionary.get(currentLookupKey);
      outputFragments.push(translatedValue !== undefined ? translatedValue : currentLookupKey);
    }

    // Join all processed fragments into a single string and print.
    const finalRenderedOutput = outputFragments.join('');
    console.log(finalRenderedOutput);
  }
};

// --- Standard input handling setup ---

// Resume standard input stream to start receiving data.
process.stdin.resume();
// Set encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from stdin.
// Appends each chunk to our raw input buffer.
process.stdin.on('data', function(dataChunk) {
  rawInputAccumulator += dataChunk;
});

// Event listener for 'end' of stdin stream.
// This signals that all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated input into individual lines.
  // Handles different newline characters for cross-platform compatibility.
  processedInputLines = rawInputAccumulator.split(/\r\n|\r|\n/g);

  // Filter out any empty lines that might result from extra newlines at the end.
  // This helps prevent `safeParseInteger` from being called with empty strings
  // if the input ends with multiple newlines.
  processedInputLines = processedInputLines.filter(line => line.trim() !== '');

  // Initiate the main processing logic with the prepared lines.
  processInputDataSet(processedInputLines);
});