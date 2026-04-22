'use strict';

// --- Helper Functions ---

/**
 * Converts a string representation to an integer.
 * Includes basic trimming and explicit radix for robustness.
 * Returns 0 if parsing fails after warnings.
 * @param {string} inputString The string to convert.
 * @returns {number} The parsed integer value.
 */
function parseStringAsInteger(inputString) {
  // Ensure input is a string and not empty after trimming
  if (typeof inputString !== 'string' || inputString.trim().length === 0) {
    // For Type III, we can add a warning or default behavior
    console.warn(`Warning: Attempted to parse non-string or empty input: "${inputString}". Returning 0.`);
    return 0;
  }

  // Use Number.parseInt with explicit radix 10 for safety
  const numericalValue = Number.parseInt(inputString.trim(), 10);

  // Check if parsing was successful
  if (isNaN(numericalValue)) {
    console.warn(`Warning: Failed to parse "${inputString.trim()}" into an integer. Returning 0.`);
    return 0;
  }
  return numericalValue;
}

/**
 * Conducts a recursive binary search on a sorted array segment.
 * Returns 1 if the target is found, 0 otherwise, aligning with a counting objective.
 * @param {number[]} dataCollection The sorted array of numbers to search within.
 * @param {number} searchStartIdx The starting index of the current search segment.
 * @param {number} searchEndIdx The ending index of the current search segment.
 * @param {number} searchTargetValue The value being sought.
 * @returns {number} 1 if searchTargetValue is found, 0 otherwise.
 */
function performOrderedSearch(dataCollection, searchStartIdx, searchEndIdx, searchTargetValue) {
  // Guard against invalid ranges or non-array inputs early
  if (!Array.isArray(dataCollection) || searchStartIdx > searchEndIdx || searchStartIdx < 0 || searchEndIdx >= dataCollection.length) {
    return 0; // Invalid range or data, target not found
  }

  // Calculate the middle index using a common method for integer division
  const middleIndex = Math.floor((searchStartIdx + searchEndIdx) / 2);
  const valueAtMiddle = dataCollection[middleIndex];

  // Direct hit: target found at the midpoint
  if (searchTargetValue === valueAtMiddle) {
    return 1;
  }

  // If the segment has collapsed and target wasn't found, it doesn't exist
  if (searchStartIdx === searchEndIdx) {
    return 0;
  }

  // Decide which half to search next
  if (searchTargetValue < valueAtMiddle) {
    // Search in the left sub-array
    return performOrderedSearch(dataCollection, searchStartIdx, middleIndex - 1, searchTargetValue);
  } else { // searchTargetValue > valueAtMiddle
    // Search in the right sub-array
    return performOrderedSearch(dataCollection, middleIndex + 1, searchEndIdx, searchTargetValue);
  }
}

/**
 * Reads a specified quantity of lines from standard input using the readline module.
 * Calls a completion callback in Node.js error-first style.
 * @param {number} quantityOfLinesToRead The number of lines expected to be read.
 * @param {function(Error|null, string[]|null): void} completionCallback A callback invoked upon completion or error.
 */
function acquireInputLines(quantityOfLinesToRead, completionCallback) {
  const readlineModule = require('readline');
  const inputSystemInterface = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout, // stdout can be used for prompts, but not strictly needed for reading
  });

  const accumulatedLines = [];
  let currentLineCounter = 0;

  inputSystemInterface.on('line', (receivedLineContent) => {
    // For Type III, adding .trim() to normalize input
    accumulatedLines.push(receivedLineContent.trim());
    currentLineCounter++;

    // When the target quantity of lines is reached, close and callback
    if (currentLineCounter >= quantityOfLinesToRead) {
      inputSystemInterface.close();
      // Pass null for error, and the array of lines as data
      return completionCallback(null, accumulatedLines);
    }
  });

  inputSystemInterface.on('close', () => {
    // This event fires when the input stream ends or `close()` is called.
    // If not enough lines were read, it might indicate an issue with input.
    if (currentLineCounter < quantityOfLinesToRead) {
      const errorMsg = `Input stream closed prematurely. Expected ${quantityOfLinesToRead} lines but received ${currentLineCounter}.`;
      console.error(errorMsg);
      // Callback with an error if the expected number of lines wasn't met
      completionCallback(new Error(errorMsg), accumulatedLines);
    }
  });

  inputSystemInterface.on('error', (ioError) => {
    console.error('An I/O error occurred during line acquisition:', ioError);
    // Immediately propagate any I/O errors
    completionCallback(ioError);
  });
}

/**
 * Orchestrates a series of asynchronous functions, executing them one after another.
 * Each function receives the results (excluding error) from the previous and a callback for the next.
 * Functions and the final callback should adhere to the Node.js error-first convention: `(err, ...data)`.
 * @param {Array<function(...args: any[], next: function(Error|null, ...results: any[]): void): void>} seriesOfTasks An array of async functions.
 * @param {function(Error|null, ...finalResults: any[]): void} finalCompletionHandler A callback for the overall completion or error.
 */
function executeAsyncSeries(seriesOfTasks, finalCompletionHandler) {
  let taskIteratorIndex = 0;

  /**
   * Advances the execution to the next task in the series.
   * Handles error propagation and final completion.
   * @param {Array<any>} previousStepOutcome An array where the first element is an error (or null)
   *                                         and subsequent elements are data from the preceding task.
   */
  function proceedToNextStage(previousStepOutcome) {
    // Check if the previous task reported an error
    const potentialError = previousStepOutcome[0];
    if (potentialError) {
      // If an error occurred, stop the series and invoke the final handler with the error
      return finalCompletionHandler(potentialError);
    }

    // If all tasks have been executed, complete the series
    if (taskIteratorIndex >= seriesOfTasks.length) {
      // Pass the data from the last successful task to the final handler
      return finalCompletionHandler.apply(null, previousStepOutcome);
    }

    const currentTaskExecutable = seriesOfTasks[taskIteratorIndex++];

    /**
     * The callback provided to the current task to signal its completion.
     * Expects arguments in the form `(err, ...data)`.
     */
    const signalTaskCompletion = function() {
      // Convert the 'arguments' object into a real array for easier manipulation
      const receivedArgs = Array.from(arguments);
      // Recursively call to advance to the next stage with the current task's outcome
      proceedToNextStage(receivedArgs);
    };

    // Prepare arguments for the current task:
    // It receives only the data (elements from index 1 onwards) from the previous step,
    // plus its own completion callback.
    const argumentsForCurrentTask = previousStepOutcome.slice(1);
    argumentsForCurrentTask.push(signalTaskCompletion);

    // Execute the current task within a try-catch block to handle synchronous errors
    try {
      currentTaskExecutable.apply(null, argumentsForCurrentTask);
    } catch (syncError) {
      // If a synchronous error occurs, immediately signal completion with the error
      signalTaskCompletion(syncError);
    }
  }

  // Initiate the series execution. The first task receives no data from a 'previous' step,
  // so we pass `[null]` to signify no initial error and no prior data.
  proceedToNextStage([null]);
}

// --- Main Application Entry Point ---

// Define and execute the sequence of operations
executeAsyncSeries([
  // Task 1: Read a specific number of lines from standard input
  function(callbackForNextStep) {
    // We expect 4 lines of input as per the problem description
    acquireInputLines(4, (acquisitionError, retrievedLines) => {
      if (acquisitionError) {
        // If an error occurred during input acquisition, pass it along
        return callbackForNextStep(acquisitionError);
      }
      // Successfully retrieved lines, pass them to the next task
      callbackForNextStep(null, retrievedLines);
    });
  },

  // Task 2: Process the acquired lines to perform binary search counts
  function(allInputLines, callbackForNextStep) {
    // Validate that we received enough lines for processing
    if (!Array.isArray(allInputLines) || allInputLines.length < 4) {
      return callbackForNextStep(new Error("Insufficient input data: Expected 4 lines, but fewer were provided."));
    }

    // Parse the second line (index 1) to get the primary dataset
    const primaryDatasetString = allInputLines[1];
    const primaryNumbers = primaryDatasetString.split(' ').map(parseStringAsInteger);

    // Parse the fourth line (index 3) to get the query values
    const queryValuesString = allInputLines[3];
    const queryNumbers = queryValuesString.split(' ').map(parseStringAsInteger);

    // Filter out any non-numeric results from parsing to ensure clean data for search
    const cleanPrimaryNumbers = primaryNumbers.filter(val => typeof val === 'number' && !isNaN(val));
    const cleanQueryNumbers = queryNumbers.filter(val => typeof val === 'number' && !isNaN(val));

    // The problem implies the primary dataset is sorted. If not, a sort step would be needed here:
    // cleanPrimaryNumbers.sort((a, b) => a - b);

    let totalMatchCount = 0;
    const maxPrimaryIndex = cleanPrimaryNumbers.length - 1;

    // Type III change: Replacing array.reduce with a traditional for...of loop
    // to iterate through query numbers and accumulate search results.
    for (const currentQueryNumber of cleanQueryNumbers) {
      // Perform binary search for each query number
      totalMatchCount += performOrderedSearch(cleanPrimaryNumbers, 0, maxPrimaryIndex, currentQueryNumber);
    }

    // Pass the final computed count to the next step
    callbackForNextStep(null, totalMatchCount);
  }
],
// Final callback: Executed after all tasks complete or an error occurs
function(overallError, finalComputedResult) {
  if (overallError) {
    // Log and exit with an error code if any task failed
    console.error('Execution terminated due to an unhandled error:', overallError.message || overallError);
    process.exit(1);
  } else {
    // Log the successful result and exit cleanly
    console.log('Result of binary search operations:', finalComputedResult);
    process.exit(0);
  }
});