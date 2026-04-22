// This JavaScript module computes a specific numerical result based on two input integers.
// It simulates a scenario where a sequence of 'N' items, starting with value 'L',
// has one item removed (the one closest to zero) before summing the rest.

// The entire logic is encapsulated within an immediately invoked arrow function expression (IIFE)
// to prevent global scope pollution and manage dependencies.
((sourceInputProvider) => {
  // Step 1: Acquire and parse the raw input data.
  // The input is expected to be a string, typically from standard input,
  // containing two space-separated whole numbers.
  let rawDataPayload = sourceInputProvider().toString();

  // Process the raw string:
  // - Trim any leading or trailing whitespace.
  // - Split the string into an array of substrings using one or more spaces as delimiters.
  // - Filter out any empty strings that might result from the split operation.
  // - Convert each remaining substring into an integer using base 10.
  const parsedNumericValues = rawDataPayload
    .trim()
    .split(/\s+/)
    .filter(strPart => strPart !== '')
    .map(strPart => Number.parseInt(strPart, 10));

  // Step 2: Implement a basic validation check for the input.
  // Ensure that at least two numerical components were successfully parsed.
  // If not, log an error and terminate execution gracefully for this context.
  if (parsedNumericValues.length < 2) {
    console.error("Input Error: Expected at least two integer values but received fewer.");
    return; // Exit if input is invalid
  }

  // Step 3: Assign the parsed values to meaningful, descriptive variables.
  // These correspond to 'N' and 'L' from the original problem statement.
  const sequenceItemCount = parsedNumericValues[0]; // Represents the total number of items in the sequence.
  const initialSequenceValue = parsedNumericValues[1]; // Represents the starting value 'L' of the sequence.

  // Step 4: Define the range of values within the sequence.
  // The sequence consists of integers: L, L+1, L+2, ..., L + (N-1).
  const lowestPossibleTaste = initialSequenceValue;
  const highestPossibleTaste = initialSequenceValue + sequenceItemCount - 1;

  let componentToExclude; // This variable will hold the value that is removed from the total sum.

  // Step 5: Determine which value from the sequence (lowestPossibleTaste to highestPossibleTaste)
  // is numerically closest to zero. This value will be subtracted from the total sum.
  //
  // Logic Breakdown:
  // Case A: If the sequence range [lowestPossibleTaste, highestPossibleTaste] includes zero.
  // This occurs when the lowest value is less than or equal to zero AND the highest value
  // is greater than or equal to zero. In this situation, the value closest to zero is 0 itself.
  if (lowestPossibleTaste <= 0 && highestPossibleTaste >= 0) {
    componentToExclude = 0;
  }
  // Case B: If all values in the sequence are positive (i.e., lowestPossibleTaste is greater than zero).
  // The value closest to zero in a positive range is the smallest value, which is the lowestPossibleTaste.
  else if (lowestPossibleTaste > 0) {
    componentToExclude = lowestPossibleTaste;
  }
  // Case C: If all values in the sequence are negative (i.e., highestPossibleTaste is less than zero).
  // The value closest to zero in a negative range is the largest (least negative) value,
  // which is the highestPossibleTaste.
  else { // This implies highestPossibleTaste < 0
    componentToExclude = highestPossibleTaste;
  }

  // Step 6: Calculate the sum of the entire arithmetic progression.
  // The formula for the sum of an arithmetic series is:
  // S = (number_of_terms / 2) * (first_term + last_term)
  const cumulativeSumOfAllComponents = (sequenceItemCount / 2) * (lowestPossibleTaste + highestPossibleTaste);

  // Step 7: Compute the final result by subtracting the identified 'componentToExclude'
  // from the total sum of the sequence.
  // Note: The sum of an arithmetic series of integers, when 'N' is an integer,
  // always results in an integer. Thus, Math.round is not necessary here for correctness.
  const finalCalculatedOutcome = cumulativeSumOfAllComponents - componentToExclude;

  // Step 8: Output the final computed numerical result to the console.
  console.log(finalCalculatedOutcome);

  // This part handles reading from standard input.
  // `require('fs').readFileSync` is bound with its arguments to create a reusable function
  // `sourceInputProvider` that can be invoked directly by the IIFE.
})(require('fs').readFileSync.bind(null, '/dev/stdin', 'utf8'));