const MAX_TIME_SLOT_DIMENSION = 200002;

/**
 * Utility function to safely parse a string into an integer.
 * It handles cases where parsing might fail by returning a default value.
 * @param {string} inputString - The string to be parsed.
 * @param {number} [fallbackValue=0] - The value to return if parsing fails.
 * @returns {number} The parsed integer or the fallback value.
 */
const safeParseInteger = (inputString, fallbackValue = 0) => {
  const parsedNumber = parseInt(inputString, 10);
  return Number.isNaN(parsedNumber) ? fallbackValue : parsedNumber;
};

/**
 * Identifies the largest numerical value within a given data set.
 * This function iterates through the elements and keeps track of the maximum encountered.
 * @param {Array<number>} numericDataSet - An array of numbers to search through.
 * @returns {number} The highest value found in the data set, or Number.NEGATIVE_INFINITY if the set is empty or invalid.
 */
function findLargestValue(numericDataSet) {
  // Validate input: if the data set is null, undefined, or empty, return a default.
  if (!numericDataSet || numericDataSet.length === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  let currentMaximum = Number.NEGATIVE_INFINITY; // Initialize with the smallest possible number to ensure any value will be greater.

  // Iterate over each item in the collection.
  for (const currentItem of numericDataSet) {
    // Use Math.max for a concise way to update the maximum value.
    currentMaximum = Math.max(currentMaximum, currentItem);
  }

  return currentMaximum;
}

/**
 * Processes raw multi-line input data to calculate the peak simultaneous recorder usage.
 * This involves parsing event data, aggregating activity across time slots for various categories,
 * and then finding the overall maximum load.
 * @param {string} rawDataString - The complete input data as a single string, with lines separated by newline characters.
 */
function processInputData(rawDataString) {
  // Defensive check: Ensure input data is valid before proceeding.
  if (!rawDataString || rawDataString.trim().length === 0) {
    console.error("Input processing aborted: No valid raw data string provided.");
    return;
  }

  // Step 1: Parse the raw input string into structured data.
  const allInputLines = rawDataString.split('\n');

  // Convert each line into an array of integers.
  // This creates a 2D array where each inner array represents an event or configuration.
  const eventDetailsMatrix = allInputLines.map(lineText =>
    lineText.split(' ').map(token => safeParseInteger(token))
  );

  // The very first line contains global configuration parameters (total events N, distinct categories C).
  const initialConfiguration = eventDetailsMatrix.shift();

  // Destructure the configuration parameters for clarity.
  const [totalEventRecords, distinctCategories] = initialConfiguration;

  // Basic validation for configuration parameters.
  if (totalEventRecords === undefined || distinctCategories === undefined || totalEventRecords < 0 || distinctCategories < 0) {
    console.error("Error: Malformed initial configuration. N or C are invalid.");
    return;
  }

  // Step 2: Initialize data structures for tracking and aggregation.

  // `categoryActivityTracker` will hold activity levels for a *single* category at a time.
  // It's reset for each category iteration.
  const categoryActivityTracker = Array(MAX_TIME_SLOT_DIMENSION).fill(0);

  // `aggregatedChannelLoad` accumulates the total recorder usage across *all* categories.
  // This array stores the final aggregated load for each time point.
  const aggregatedChannelLoad = Array(MAX_TIME_SLOT_DIMENSION).fill(0);

  // Step 3: Iterate through each distinct category to calculate its impact.
  for (let currentCategoryIndex = 1; currentCategoryIndex <= distinctCategories; currentCategoryIndex++) {
    // Reset the tracker for the new category to ensure fresh calculation.
    categoryActivityTracker.fill(0);

    // Sub-Step A: Populate `categoryActivityTracker` with event changes for the current category.
    for (let recordIndex = 0; recordIndex < totalEventRecords; recordIndex++) {
      const currentEventRecord = eventDetailsMatrix[recordIndex];

      // Ensure the event record is valid and has expected number of elements.
      if (!currentEventRecord || currentEventRecord.length < 3) {
        // Skip this record if it's malformed to prevent errors.
        console.warn(`Warning: Skipping malformed event record at index ${recordIndex}.`);
        continue;
      }

      const eventStartTime = currentEventRecord[0];
      const eventEndTime = currentEventRecord[1];
      const eventAssignedCategory = currentEventRecord[2];

      // Only process events that belong to the current category being analyzed.
      if (eventAssignedCategory === currentCategoryIndex) {
        // Apply differential array technique: increment at start, decrement at end.
        // Adjusting time points: start times are odd-indexed, end times are even-indexed.
        const adjustedStartPoint = eventStartTime * 2 - 1;
        const adjustedEndPoint = eventEndTime * 2;

        // Ensure indices are within bounds before modifying the array.
        if (adjustedStartPoint >= 0 && adjustedStartPoint < MAX_TIME_SLOT_DIMENSION) {
          categoryActivityTracker[adjustedStartPoint]++;
        } else {
          console.warn(`Out of bounds start point: ${adjustedStartPoint} for event category ${currentCategoryIndex}.`);
        }

        if (adjustedEndPoint >= 0 && adjustedEndPoint < MAX_TIME_SLOT_DIMENSION) {
          categoryActivityTracker[adjustedEndPoint]--;
        } else {
          console.warn(`Out of bounds end point: ${adjustedEndPoint} for event category ${currentCategoryIndex}.`);
        }
      }
    }

    // Sub-Step B: Compute prefix sums on `categoryActivityTracker`.
    // This converts the point changes into cumulative activity levels over time for the current category.
    for (let timePointIterator = 1; timePointIterator < MAX_TIME_SLOT_DIMENSION; timePointIterator++) {
      categoryActivityTracker[timePointIterator] += categoryActivityTracker[timePointIterator - 1];
    }

    // Sub-Step C: Aggregate the current category's activity into the global `aggregatedChannelLoad`.
    // This combines the usage from the current category with all previous categories.
    for (let timePointIterator = 0; timePointIterator < MAX_TIME_SLOT_DIMENSION; timePointIterator++) {
      aggregatedChannelLoad[timePointIterator] += categoryActivityTracker[timePointIterator];
    }
  }

  // Step 4: Determine the overall maximum load from the aggregated results.
  // The result is the highest number of simultaneous recorders needed across all time points.
  const peakRecorderUsage = findLargestValue(aggregatedChannelLoad);

  // Output the final result.
  console.log(peakRecorderUsage);
}

// --- Main execution flow starts here ---

// Define the standard input file path.
const STANDARD_INPUT_FILE = '/dev/stdin';

/**
 * Helper function to synchronously read content from a specified file.
 * Includes basic error handling for file operations.
 * @param {string} filePath - The path to the file to be read.
 * @param {string} [encoding='utf8'] - The character encoding for reading the file.
 * @returns {string|null} The file's content as a string, or null if an error occurs.
 */
const fetchFileContentsSynchronously = (filePath, encoding = 'utf8') => {
  try {
    // Attempt to read the file synchronously using Node.js 'fs' module.
    return require('fs').readFileSync(filePath, encoding);
  } catch (fileError) {
    // Log any exceptions that occur during file reading.
    console.error(`Error: Could not read input file '${filePath}'. Details: ${fileError.message}`);
    return null; // Indicate failure to read file.
  }
};

// Retrieve the raw input content from the standard input file.
const inputContent = fetchFileContentsSynchronously(STANDARD_INPUT_FILE);

// Only proceed with data processing if the file content was successfully retrieved.
if (inputContent !== null) {
  processInputData(inputContent);
} else {
  // If file reading failed, inform the user about the application termination.
  console.error("Application cannot proceed without valid input data.");
}