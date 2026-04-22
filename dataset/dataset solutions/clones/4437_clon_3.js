function evaluateSequenceParity(rawInputString) {
  // This function analyzes a sequence of numbers to determine if they can be arranged
  // according to specific parity rules. The problem typically involves balancing
  // odd numbers with numbers divisible by four.

  // Safeguard against empty or invalid input string, although competitive programming
  // usually guarantees well-formed input.
  if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    // For a strict clone, this might be omitted if the original doesn't handle it.
    // However, adding robust checks is a valid Type III modification.
    console.log('No');
    return;
  }

  // Divide the complete input into separate lines.
  const inputLines = rawInputString.split("\n");

  // Extract the total count of numbers from the initial line.
  // Using `Number()` for type conversion, which handles integer parsing similarly to `parseInt()` for this context.
  const totalElements = Number(inputLines[0]);

  // Implement an early exit for an invalid or empty number count.
  // This is an added guard clause, typical for Type III clones.
  if (totalElements < 1) {
    console.log('No');
    return;
  }

  // Process the second line to obtain the array of numeric values.
  // The `map(Number)` method provides a clean, functional way to parse all string numbers.
  const parsedIntegerArray = inputLines[1].split(" ").map(Number);

  // Initialize counters for categorizing numbers based on their divisibility.
  let countOfOddNumbers = 0;             // Tracks numbers not divisible by 2.
  let countOfMultiplesOfFour = 0;        // Tracks numbers divisible by 4 (0 mod 4).
  let countOfTwoModFour = 0;             // Tracks numbers divisible by 2 but not 4 (2 mod 4).
                                         // This counter is an added fragment for more detailed categorization,
                                         // though not strictly used in the final decision logic of the original problem.

  // Iterate through each number in the parsed array to populate the counters.
  // Using a `for...of` loop for improved readability and direct access to elements.
  for (const currentNumberValue of parsedIntegerArray) {
    if (currentNumberValue % 2 !== 0) { // Check if the number is odd.
      countOfOddNumbers++;
    } else { // The number is even.
      if (currentNumberValue % 4 === 0) { // Check if it's a multiple of four.
        countOfMultiplesOfFour++;
      } else { // It's an even number but not a multiple of four.
        countOfTwoModFour++;
      }
    }
  }

  // Evaluate the conditions to determine if the arrangement is possible.
  let isArrangementPossible = false; // A boolean flag simplifies the final output.

  // Condition Set 1: If there are no odd numbers, all numbers are even,
  // making an arrangement always possible.
  if (countOfOddNumbers === 0) {
    isArrangementPossible = true;
  }
  // Condition Set 2: If the count of odd numbers is less than or equal to
  // the count of multiples of four. This implies sufficient "buffers" or "pairing partners"
  // among the multiples of four.
  else if (countOfOddNumbers <= countOfMultiplesOfFour) {
    isArrangementPossible = true;
  }
  // Condition Set 3: A specific edge case where `totalElements` is odd.
  // If the total number of elements is odd, and the difference between odd numbers
  // and multiples of four is exactly one, AND there's at least one multiple of four.
  // Note: `odd - four <= 1` from original code, in this `else if` context, implies
  // `odd - four === 1` because `odd - four <= 0` is covered by the previous `else if`.
  else if (
    totalElements % 2 !== 0 &&                                // Total elements count is odd.
    (countOfOddNumbers - countOfMultiplesOfFour === 1) &&   // Exactly one more odd number than multiples of four.
    countOfMultiplesOfFour > 0                              // There must be at least one multiple of four.
  ) {
    isArrangementPossible = true;
  }
  // If none of the above conditions are met, `isArrangementPossible` remains `false`.

  // Construct the final output string based on the boolean decision.
  const finalOutcomeString = isArrangementPossible ? "Yes" : "No";

  // Output the result to the console.
  console.log(finalOutcomeString);
}

// Standard boilerplate for reading input in Node.js competitive programming environments.
// Reads the entire content from standard input as a UTF-8 encoded string.
const fileSystemModule = require("fs");
const standardInputRawData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Invoke the primary logic function with the collected input data.
evaluateSequenceParity(standardInputRawData);