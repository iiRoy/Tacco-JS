'use strict'; // Enforce strict parsing rules across the script.

// Orchestrates a series of asynchronous operations.
flowSeries([
  // First operational step: read a specific number of lines from input.
  function(proceed) {
    inputProcessor(4, proceed); // Request 4 lines, then continue the flow.
  },
  // Second operational step: process the collected lines.
  function(inputRowData, advance) {
    /* Helper to convert a string representation to an integer. */
    var strToNum = function(numericString) {
      return parseInt(numericString, 10); // Base 10 parsing.
    };

    // Extract primary numerical dataset from the second line.
    var primaryValues = inputRowData[1].split(' ').map(strToNum);
    // Extract query numerical dataset from the fourth line.
    var lookupQueries = inputRowData[3].split(' ').map(strToNum);

    /**
     * Performs a binary search on a sorted array segment.
     * @param {number} beginPos - Starting index of the search range.
     * @param {number} finalPos - Ending index of the search range.
     * @param {number} targetElement - The value to locate.
     * @returns {number} 1 if found, 0 otherwise.
     */
    function locateItem(beginPos, finalPos, targetElement) {
      // console.debug(`Searching range: ${beginPos} to ${finalPos} for ${targetElement}`); // Debugging placeholder.
      var dataCollection = primaryValues;
      var midValue = dataCollection[beginPos + Math.floor((finalPos - beginPos) / 2)];

      if (targetElement === midValue) {
        return 1; // Element found.
      }
      if (beginPos >= finalPos) {
        return 0; // Search range exhausted, element not found.
      }
      if (targetElement < midValue) {
        // Search in the left half.
        return locateItem(beginPos, beginPos + Math.floor((finalPos - beginPos) / 2) - 1, targetElement);
      }
      if (targetElement > midValue) {
        // Search in the right half.
        return locateItem(beginPos + Math.floor((finalPos - beginPos) / 2) + 1, finalPos, targetElement);
      }
    }

    // Process each query and accumulate results using the binary search.
    advance(lookupQueries.reduce(function(cumulativeSum, currentQuery) {
      // console.trace(`Query: ${currentQuery}, Current sum: ${cumulativeSum}`); // Detailed tracing.
      return cumulativeSum + locateItem(0, primaryValues.length - 1, currentQuery);
    }, 0)); // Initial accumulator value.
  }],
  // Final callback after all tasks in the series are complete.
  function(finalOutcome) {
    console.log(finalOutcome); // Display the computed result.
    // Terminate the process gracefully.
    process.exit(0);
  }
);


/*
 * Transforms an input string by applying a function to each character.
 * @param {string} sourceText - The string to transform.
 * @param {function} charModifier - Function (char, index) => newChar.
 * @returns {string} The newly formed string.
 */
function applyCharMap(sourceText, charModifier) {
  var modifiedString = ''; // Initialize an empty string for accumulation.
  for (var charIdx = 0; charIdx < sourceText.length; charIdx++) {
    modifiedString += charModifier(sourceText.charAt(charIdx), charIdx); // Apply transformation.
  }
  return modifiedString; // Return the result.
}

/**
 * Initializes a reader to collect a specified number of lines from standard input.
 * @param {number} lineCountLimit - The maximum number of lines to read.
 * @param {function} completionCallback - Callback to invoke with collected lines or an error.
 */
function inputProcessor(lineCountLimit, completionCallback) {
  // Setup the interface for reading input streams.
  var streamHandler = require('readline').createInterface({
    input: process.stdin, // Standard input stream.
    output: process.stdout, // Standard output stream (for prompts, not used here).
  });

  var collectedData = []; // Array to store each line.
  var processedCount = 0; // Tracks the number of lines read.

  // Event handler for each line received.
  streamHandler.on('line', function(currentText) {
    collectedData.push(currentText); // Store the line.
    ++processedCount; // Increment the count.
    // If the limit is reached, close the reader and invoke the callback.
    if (processedCount === lineCountLimit) {
      streamHandler.close(); // Stop reading.
      return completionCallback(collectedData); // Pass collected data.
    }
  });

  // Event handler for when the input stream is closed.
  streamHandler.on('close', function() {
    /* No specific action needed on close for this implementation. */
  });

  // Event handler for any errors during reading.
  streamHandler.on('error', function(errObject) {
    completionCallback(errObject); // Pass the error to the main callback.
  });
}

/**
 * Executes an array of asynchronous functions in sequence, passing results from one to the next.
 * @param {Array<function>} seriesOfTasks - An array of functions, each accepting (..., next) args.
 * @param {function} finalAction - Callback invoked after all tasks complete, or on error.
 */
function flowSeries(seriesOfTasks, finalAction) {
  var currentTaskIdx = 0; // Keeps track of the current task being executed.

  // Recursive function to execute the next task in the sequence.
  function executeNextStep(passedArgs) {
    // If all tasks are completed, invoke the final callback.
    if (currentTaskIdx === seriesOfTasks.length) {
      return finalAction.apply(null, passedArgs);
    }

    // This callback is passed to the current task, allowing it to signal completion.
    var stepCompletion = function() {
      var callArguments = arguments; // Capture arguments passed to stepCompletion.
      // Convert arguments object to an array for the next step.
      executeNextStep(Object.keys(callArguments).reduce(function(accumulator, propName) {
        accumulator.push(callArguments[propName]); // Add each argument.
        return accumulator;
      }, [])); // Start with an empty array.
    };

    passedArgs.push(stepCompletion); // Append the completion callback to current task arguments.
    var currentAction = seriesOfTasks[currentTaskIdx++]; // Get the current task and advance index.
    currentAction.apply(null, passedArgs); // Execute the current task.
  }

  executeNextStep([]); // Initiate the sequence with no initial arguments.
}