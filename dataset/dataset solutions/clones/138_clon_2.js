require("fs")
  // Read the entire file synchronously from /dev/stdin using UTF-8 encoding.
  .readFileSync("/dev/stdin", "utf8")

  // Remove any leading or trailing whitespace characters from the content.
  .trim()

  // Divide the cleaned content into an array of strings, splitting by any single whitespace character.
  .split(/\s/)

  // Apply a transformation function to each element (data segment) in the array.
  .map(
    /*
     * This anonymous function processes an individual data segment.
     * @param {string} inputLine - A single string segment from the input.
     */
    function (inputLine) {
      // Declare local variables for the current processing scope.
      let parsedNumbers; // Stores numerical values derived from the input line.
      let targetIndex; // Used as an index or counter in loops.
      let loopCounter; // A general-purpose counter for iterations.
      let accumulatedValue; // An accumulator for various calculations.

      // Initialize all counters and accumulators to zero at the start of processing.
      targetIndex = loopCounter = accumulatedValue = 0;

      // Split the input line by commas to get an array of string values.
      parsedNumbers = inputLine.split(",");

      // Loop through the first ten elements to calculate a cumulative negative sum.
      // Each element parsedNumbers[loopCounter] is updated with the new accumulatedValue
      // which is current accumulatedValue minus the original value of parsedNumbers[loopCounter].
      for (loopCounter = 0; loopCounter < 10; loopCounter++) {
        parsedNumbers[loopCounter] = accumulatedValue -= parsedNumbers[loopCounter];
      }

      // Perform a specific calculation: multiply accumulatedValue by a ratio
      // derived from the 10th and 11th elements of parsedNumbers.
      accumulatedValue *= parsedNumbers[10] / (-parsedNumbers[10] - parsedNumbers[11]);

      // Loop to find the first targetIndex where the value at that index
      // in parsedNumbers is greater than the negative of the accumulatedValue.
      // The loop continues, incrementing targetIndex, until the condition is no longer met.
      for (
        ; // No initialization needed here, as targetIndex is already zero.
        parsedNumbers[targetIndex] > -accumulatedValue; // Condition for loop continuation.
        targetIndex++ // Increment targetIndex after each iteration.
      ) {
        // The loop body is intentionally empty; all logic is in the header.
      }

      // Output the final incremented targetIndex to the console.
      // The ++ operator increments targetIndex before its value is used in console.log.
      console.log(++targetIndex);
    }
  );