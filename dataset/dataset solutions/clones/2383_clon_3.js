function ProcessInputData(rawDataString) {
  // Input string is expected to have multiple lines, each containing space-separated numeric values.
  const lineSegments = rawDataString.split('\n');

  // Validate the minimum number of input lines.
  if (lineSegments.length < 3) {
    console.error('Error: Insufficient input lines provided. Expected at least 3 for time, rate A, and rate B.');
    return; // Halt execution if input structure is critical.
  }

  /**
   * Helper function to parse a single line of space-separated numeric strings into an array of numbers.
   * Includes basic validation for format and numeric content.
   * @param {string} lineContent - The string content of a single line.
   * @param {number} expectedCount - The expected number of numeric values on the line.
   * @returns {number[]} An array of parsed numbers.
   * @throws {Error} If the line format is incorrect or contains non-numeric values.
   */
  const parseNumericLine = (lineContent, expectedCount = 2) => {
    const stringValues = lineContent.split(' ');
    // Ensure we have at least the expected number of values.
    if (stringValues.length < expectedCount) {
        throw new Error(`Invalid line format: Expected ${expectedCount} numbers, but found ${stringValues.length}.`);
    }
    // Convert string values to numbers and trim whitespace.
    const parsedNumbers = stringValues.slice(0, expectedCount).map(val => Number(val.trim()));
    // Check for any non-numeric results (NaN).
    if (parsedNumbers.some(isNaN)) {
        throw new Error('Invalid numeric input detected; one or more values could not be converted to a number.');
    }
    return parsedNumbers;
  };

  let timeIntervals;    // Corresponds to 'T' in the original code.
  let rateFactorA;      // Corresponds to 'A' in the original code.
  let rateFactorB;      // Corresponds to 'B' in the original code.

  // Attempt to parse the input lines using the helper function.
  try {
    timeIntervals = parseNumericLine(lineSegments[0]);
    rateFactorA = parseNumericLine(lineSegments[1]);
    rateFactorB = parseNumericLine(lineSegments[2]);
  } catch (parsingError) {
    console.error(`Input data parsing failed: ${parsingError.message}`);
    return; // Exit if input parsing fails.
  }

  // Calculate the net change for each of the two segments.
  // This is equivalent to T[i] * (A[i] - B[i]).
  const netChangesPerSegment = new Array(2);
  for (let segmentIndex = 0; segmentIndex < 2; segmentIndex++) {
    // Introduce an intermediate variable for readability and to demonstrate a structural change.
    const currentEffectiveRateDifference = rateFactorA[segmentIndex] - rateFactorB[segmentIndex];
    netChangesPerSegment[segmentIndex] = timeIntervals[segmentIndex] * currentEffectiveRateDifference;
  }

  let cumulativeValue = 0;           // Accumulates the sum of net changes, equivalent to 'x'.
  let priorCumulativeValue = 0;      // Stores the value of 'cumulativeValue' from the previous step, equivalent to 'xmae'.
  let operationSequenceCount = -1;   // Tracks the number of operations, starting at -1 as per original logic for output.
  const MAX_LOOP_ITERATIONS = 1_000_000; // Safety guard to prevent infinite loops in unexpected scenarios.

  // Check for a specific condition where the process might lead to 'infinity'.
  // Original condition: sa[0] == sa[1] * -1, which means sa[0] + sa[1] == 0.
  const totalDeltaSum = netChangesPerSegment[0] + netChangesPerSegment[1];
  if (totalDeltaSum === 0) {
     // If the sum of the two net changes is zero, the cumulative value will oscillate
     // (e.g., 0, 5, 0, 5, ...) or stay at zero, never satisfying the termination condition.
     console.log('infinity');
  } else {
     // Main accumulation loop, designed to mimic the original 'for(var i=0; i<1; i)' structure.
     let shouldTerminateLoop = false; // Controls the loop exit, similar to setting 'i=1' in original.
     let currentLoopIteration = 0;    // Tracks the actual number of times the loop body has run.

     while (!shouldTerminateLoop && currentLoopIteration < MAX_LOOP_ITERATIONS) {
       operationSequenceCount++; // Increment the counter for the current operation in the sequence.
       currentLoopIteration++;   // Increment the general loop iteration counter.

       // Store the current cumulative value before it gets updated in this iteration.
       priorCumulativeValue = cumulativeValue;

       // Add the appropriate net change (either netChangesPerSegment[0] or netChangesPerSegment[1])
       // based on the operation sequence count's parity.
       const deltaIndexToApply = operationSequenceCount % 2;
       cumulativeValue += netChangesPerSegment[deltaIndexToApply];

       // Termination condition: If the current cumulative value and the prior cumulative value
       // both have the same non-zero sign (both positive or both negative).
       if (cumulativeValue * priorCumulativeValue > 0) {
          shouldTerminateLoop = true; // Set flag to exit the while loop.
       }
     }

     // If the loop finished because it hit the maximum iteration limit,
     // it implies an 'infinity' scenario for practical purposes.
     if (currentLoopIteration >= MAX_LOOP_ITERATIONS && !shouldTerminateLoop) {
         console.log('infinity (maximum iterations reached without termination)');
     } else {
         // The final result is one less than the operation sequence count when the loop terminated.
         console.log(operationSequenceCount - 1);
     }
  }
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
// This part remains largely unchanged as it's environment-specific setup.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInputData(standardInputData);