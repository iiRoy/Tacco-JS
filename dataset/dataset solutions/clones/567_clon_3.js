/*
 * This module processes numerical input lines to determine the minimum
 * number of specific denominations required to reach a target value (1000).
 * It simulates a change-making process using fixed coin values.
 *
 * This version incorporates extensive identifier renaming, structural
 * modifications, and additional validation steps to create a Type III clone
 * of the original functionality, ensuring the core logic remains similar
 * despite significant code variations.
 */
(function (rawInputData) {

  // Define available denominations for change calculation.
  // These represent common currency values in descending order,
  // ensuring the greedy algorithm finds the minimum count.
  const CURRENCY_DENOMINATIONS = [500, 100, 50, 10, 5, 1];
  const TARGET_BASE_VALUE = 1000; // The fixed value from which input is subtracted.

  // Pre-process the raw input string:
  // 1. Remove carriage return characters globally (for cross-platform consistency).
  // 2. Split the cleaned string into individual lines based on newline characters.
  // 3. Use `map` to remove any leading or trailing whitespace from each line segment.
  // 4. Use `filter` to discard any lines that become empty after trimming,
  //    preventing attempts to parse blank lines.
  var lineSegments = rawInputData
    .replace(/\r/g, '') // Explicitly remove carriage returns as in the original
    .split('\n')
    .map(function(segment) {
      return segment.trim();
    })
    .filter(function(segment) {
      return segment.length > 0;
    });

  var totalDenominationCount = 0; // Accumulator for the number of denominations used per calculation.
  var currentInputAmount = 0;     // Stores the parsed numerical value from the current line.
  var remainingAmountToCover = 0; // The difference between TARGET_BASE_VALUE and currentInputAmount.

  // Main processing loop: iterates through each valid input line.
  // The loop continues indefinitely until a specific break condition is met,
  // typically when a '0' or invalid input is encountered.
  for (;;) { // An alternative syntax for an infinite loop, equivalent to while(true)

    // Guard clause: Check if there are any input lines left to process.
    // If the array is empty, it signifies the end of the input stream.
    if (lineSegments.length === 0) {
      break; // Exit the main processing loop.
    }

    // Attempt to parse the next input line as a number.
    // `lineSegments.shift()` retrieves and removes the first element.
    // `Number()` is used for explicit type conversion; it handles empty strings to 0
    // and non-numeric strings to NaN, which are then validated.
    let nextLine = lineSegments.shift();
    currentInputAmount = Number(nextLine);

    // Validate the parsed input amount.
    // If it's zero or not a valid number (NaN), it signifies the end of input or an error.
    if (currentInputAmount === 0 || isNaN(currentInputAmount)) {
      break; // Exit the main processing loop.
    }

    // Reset the counter for the current calculation before starting.
    totalDenominationCount = 0;

    // Calculate the amount that needs to be covered by denominations.
    // This is the difference from the TARGET_BASE_VALUE.
    // If currentInputAmount exceeds TARGET_BASE_VALUE, remainingAmountToCover will be negative.
    // The subsequent inner loop's condition (`remainingAmountToCover > 0`) will naturally
    // prevent it from executing in this scenario, causing `totalDenominationCount` to remain 0,
    // which matches the original code's behavior for such inputs.
    remainingAmountToCover = TARGET_BASE_VALUE - currentInputAmount;

    // Inner loop to determine the minimum number of denominations.
    // It iterates through the predefined currency denominations in descending order
    // as long as there is a positive amount remaining to cover.
    for (let i = 0; i < CURRENCY_DENOMINATIONS.length && remainingAmountToCover > 0; i++) {
        let currentDenomination = CURRENCY_DENOMINATIONS[i];

        // Only process if the current denomination can actually be used to reduce the remaining amount.
        if (remainingAmountToCover >= currentDenomination) {
            // Calculate how many times the current denomination fits into the remaining amount.
            let numberOfUnits = Math.floor(remainingAmountToCover / currentDenomination);

            // Add the calculated number of units to the total count.
            totalDenominationCount += numberOfUnits;

            // Subtract the value of these units from the remaining amount.
            remainingAmountToCover -= (numberOfUnits * currentDenomination);
        }
        // No explicit check for remainingAmountToCover < 0 here, as the loop condition handles it.
    }

    // Output the calculated total denomination count for the current input.
    // Using console.info as an alternative to console.log, maintaining output functionality.
    console.info(totalDenominationCount);

  } // End of main processing loop.

  // Optional: A final message for clarity that all input processing is complete.
  // console.log("All input processing completed.");

})(require("fs").readFileSync("/dev/stdin", "utf8"));