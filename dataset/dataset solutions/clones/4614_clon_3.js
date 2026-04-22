// This module provides a robust function to compute a cumulative duration
// based on a sequence of timestamps, applying specific capping rules for intervals.

/**
 * Calculates the total effective duration from a series of event timestamps.
 *
 * The computation involves parsing input data that specifies a total number
 * of events (N), a maximum allowable duration for any single interval (T),
 * and a list of timestamps.
 *
 * For each pair of consecutive timestamps (t_k, t_{k+1}), the actual duration
 * (t_{k+1} - t_k) is considered. If this duration is less than T, the actual
 * duration is added to the running total. If the duration is T or greater,
 * only T is added to the total, effectively capping the contribution of that
 * interval.
 *
 * A final contribution of T is added to the total, accounting for the duration
 * of the last event.
 *
 * @param {string} rawInputString - The full input data as a string. Expected format:
 *   Line 1: "N T" (e.g., "3 5")
 *   Line 2: "t1 t2 ... tN" (e.g., "1 2 3")
 *   Where N is the total count of timestamps, T is the max interval cap,
 *   and t_i are the event timestamps.
 */
const calculateCappedEventDuration = (rawInputString) => {
  // Define string delimiters for parsing, making them easily modifiable.
  const LINE_SEPARATOR = "\n";
  const ELEMENT_SEPARATOR = " ";

  // Variable to accumulate the effective time.
  let accumulatedTimeUnits = 0;

  try {
    // Guard clause: Check for invalid or empty input string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
      console.error("Error: Provided input string is either invalid or empty.");
      return; // Exit the function if input is not valid.
    }

    // Split the input into an array of lines, filtering out any empty lines.
    const inputLineSegments = rawInputString.trim().split(LINE_SEPARATOR).filter(Boolean);

    // Validate that we have the minimum required number of lines.
    if (inputLineSegments.length < 2) {
      console.error("Error: Insufficient data lines. Expected at least two lines (N T and timestamps).");
      return;
    }

    // Process the first line to extract the event count and the duration cap.
    const headerElements = inputLineSegments[0].split(ELEMENT_SEPARATOR);

    // Validate the number of elements in the header line.
    if (headerElements.length < 2) {
      console.error("Error: First line must contain two numeric values: total event count and max interval cap.");
      return;
    }

    // Convert string parts to integers using parseInt with radix 10 for safety.
    const totalEventQuantity = parseInt(headerElements[0], 10);
    const maxAllowedInterval = parseInt(headerElements[1], 10);

    // Validate the parsed numeric values.
    if (isNaN(totalEventQuantity) || isNaN(maxAllowedInterval) || totalEventQuantity < 0 || maxAllowedInterval < 0) {
      console.error("Error: Event count (N) and max interval (T) must be non-negative integers.");
      return;
    }

    // Process the second line to get the array of event timestamps.
    // Each string element is mapped to an integer.
    const eventChronology = inputLineSegments[1].split(ELEMENT_SEPARATOR).map(timeStr => parseInt(timeStr, 10));

    // Perform a consistency check between the declared event quantity and the actual array length.
    // If the actual number of timestamps is less than expected, it's an error.
    if (eventChronology.length < totalEventQuantity) {
        console.error(`Error: Declared ${totalEventQuantity} events, but only ${eventChronology.length} timestamps were provided.`);
        return;
    }
    // If more timestamps are provided than declared, we will only process up to totalEventQuantity.
    if (eventChronology.length > totalEventQuantity) {
        console.warn(`Warning: More timestamps provided (${eventChronology.length}) than declared (${totalEventQuantity}). Processing only the first ${totalEventQuantity}.`);
        // Trim the array to match the declared count.
        eventChronology.length = totalEventQuantity;
    }

    // Handle edge cases for very few events:
    // If no events, total duration is 0.
    if (totalEventQuantity === 0) {
        console.log(0);
        return;
    }
    // If only one event, its effective duration is just the max allowed interval.
    if (totalEventQuantity === 1) {
        // This is consistent with the original code's `ans + T` when the loop doesn't run.
        console.log(maxAllowedInterval);
        return;
    }

    // Helper lambda function to determine the effective duration for a single interval.
    const getEffectiveInterval = (startMoment, endMoment, capDuration) => {
        const measuredDifference = endMoment - startMoment;
        // Check for non-monotonic timestamps, which might indicate malformed data.
        if (measuredDifference < 0) {
            console.warn(`Data anomaly: Timestamp ${endMoment} precedes ${startMoment}. Ignoring this interval.`);
            return 0; // Or throw an error, depending on desired strictness.
        }
        return Math.min(measuredDifference, capDuration);
    };

    // Iterate through the event timestamps, starting from the second event (index 1).
    // The loop calculates the duration for N-1 intervals.
    for (let currentEventIndex = 1; currentEventIndex < totalEventQuantity; ++currentEventIndex) {
      const precedingTimestamp = eventChronology[currentEventIndex - 1];
      const presentTimestamp = eventChronology[currentEventIndex];

      // Add the capped duration of the current interval to the running total.
      accumulatedTimeUnits += getEffectiveInterval(precedingTimestamp, presentTimestamp, maxAllowedInterval);
    }

    // The problem statement implies an additional `T` is always added
    // to the final sum, representing the duration of the very last event.
    const finalCalculatedResult = accumulatedTimeUnits + maxAllowedInterval;

    // Output the final computed duration to standard output.
    console.log(finalCalculatedResult);

  } catch (processingError) {
    // Catch any unexpected errors during the process and log them.
    console.error(`An unforeseen issue occurred: ${processingError.message}`);
    // Depending on requirements, one might re-throw the error or return a specific error code.
  }
};

// This immediately invoked function expression (IIFE) handles the script's execution environment.
// It detects if the script is run directly via Node.js and reads from standard input.
(() => {
  // Check if `require` is available and if this script is the main entry point.
  if (typeof require === 'function' && require.main === module) {
    try {
      const nodeFileSystem = require("fs"); // Dynamically import the 'fs' module.
      // Read all data from standard input, encoded as UTF-8.
      const standardInputData = nodeFileSystem.readFileSync("/dev/stdin", "utf8");
      // Pass the read data to our main processing function.
      calculateCappedEventDuration(standardInputData);
    } catch (ioError) {
      // Handle errors specifically related to file system operations or input reading.
      console.error(`Failed to read from /dev/stdin or process the input: ${ioError.message}`);
    }
  } else {
    // This block executes if the script is imported as a module or run in a non-Node.js environment.
    console.warn("Script is not running as the main module in a Node.js environment. Skipping automatic stdin processing.");
    // For testing or alternative execution paths, you might call `calculateCappedEventDuration`
    // with a predefined string here, e.g.:
    // calculateCappedEventDuration("3 5\n1 2 3");
  }
})();