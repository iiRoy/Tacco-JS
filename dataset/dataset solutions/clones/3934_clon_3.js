// This module encapsulates the logic for generating a specialized numerical sequence.
// It processes a raw input string to derive an integer, then constructs an array
// based on a series of conditional rules and arithmetic operations.
function processNumericalSequence(sourceInput) {
  // Define a collection of essential numeric constants and bounds for clarity and maintainability.
  const minimumPermittedInput = 3;
  const maximumPermittedInput = 20000;
  const initialElementValueAlpha = 3;
  const initialElementValueBeta = 9;
  const firstGenerationPhaseUpperThreshold = 10002;
  const secondGenerationPhaseStartIdx = 10002;
  const secondGenerationPhaseUpperThreshold = 15000;
  const thirdGenerationPhaseStartIdx = 15000;
  const specificInputForSpecialCase = 3;
  const specialCaseSecondElementReplacement = 25;
  const defaultLastElementModificationValue = 6;
  const arithmeticOffsetForPhaseTwo = 10000;
  const arithmeticOffsetForPhaseThree = 14999;
  const invalidInputFeedbackMessage = "入力値が無効です。範囲を確認してください。"; // "Invalid input value. Please check the range."

  // Convert the raw input string into an integer. The unary plus operator is a concise way to achieve this.
  const processedInputValue = +sourceInput.trim();

  // Initialize a dynamic array to hold the elements of our sequence.
  // Using 'let' as its contents will be extensively modified.
  let generatedNumbers = [];

  // Implement an early exit condition if the input value falls outside the predefined acceptable range.
  // This acts as a primary guard clause.
  if (processedInputValue < minimumPermittedInput || processedInputValue > maximumPermittedInput) {
    console.log(invalidInputFeedbackMessage);
    return; // Halt execution for out-of-bounds input.
  }

  // Assign the very first two elements of the sequence as per the initial specification.
  generatedNumbers[0] = initialElementValueAlpha; // The first element is always 3.
  generatedNumbers[1] = initialElementValueBeta;  // The second element is always 9 initially.

  // --- First Iteration Phase: Populating elements with a unique calculation pattern. ---
  // This loop iterates from the third element (index 2) up to a point determined by
  // either the processed input value or a fixed upper limit, whichever is smaller.
  for (let currentPosition = 2; currentPosition < processedInputValue && currentPosition < firstGenerationPhaseUpperThreshold; currentPosition++) {
    // The value for each position is derived using a combination of multiplication, subtraction,
    // and a bitwise operation to check parity (equivalent to modulo 2).
    let derivedElement = (currentPosition * 3) - 4 - (currentPosition & 1); // (currentPosition % 2) is replaced by (currentPosition & 1)
    generatedNumbers[currentPosition] = derivedElement;
    // This phase generates values that are specific to their index, often related to multiples of three.
  }

  // --- Second Iteration Phase: Extending the sequence with another distinct pattern. ---
  // This loop commences from a higher index (10002) and continues up to another
  // fixed threshold or the input value, again choosing the minimum.
  for (let currentPosition = secondGenerationPhaseStartIdx; currentPosition < processedInputValue && currentPosition < secondGenerationPhaseUpperThreshold; currentPosition++) {
    // Elements in this phase are calculated using an offset, multiplication by 6, and an addition of 3.
    // This often results in odd multiples of three.
    let computedItem = ((currentPosition - arithmeticOffsetForPhaseTwo) * 6) + 3;
    generatedNumbers[currentPosition] = computedItem;
    // These numbers typically form a sequence of odd multiples of three.
  }

  // --- Post-Generation Conditional Adjustments ---
  // These conditions apply specific modifications to existing elements based on the processed input value.
  if (processedInputValue === specificInputForSpecialCase) {
    // If the input is exactly 3, a specific element (the second one) is overridden.
    generatedNumbers[1] = specialCaseSecondElementReplacement; // Modifies the initial '9' to '25'.
    // For N=3, the sequence becomes [3, 25, 2] after the first loop and this adjustment.
  } else if (processedInputValue % 2 === 1 || processedInputValue < secondGenerationPhaseUpperThreshold) {
    // This condition triggers if the input is an odd number (excluding the '3' case above),
    // OR if the input is less than the second phase's upper threshold (15000).
    // It sets the very last element of the sequence to a default modification value.
    if (processedInputValue > 0 && processedInputValue <= maximumPermittedInput) {
      // Safely assign the value to the element at the (N-1)th index.
      generatedNumbers[processedInputValue - 1] = defaultLastElementModificationValue; // Sets the N-th element to 6.
    }
  }

  // --- Third Iteration Phase: Final expansion of the sequence for larger inputs. ---
  // This loop handles the largest range of input values, starting from index 15000
  // and continuing up to the processed input value.
  for (let currentPosition = thirdGenerationPhaseStartIdx; currentPosition < processedInputValue; currentPosition++) {
    // Elements generated here are simple multiples of six, after applying an offset.
    let multipleOfSix = (currentPosition - arithmeticOffsetForPhaseThree) * 6;
    generatedNumbers[currentPosition] = multipleOfSix;
    // This phase fills the array with values that are multiples of six.
  }

  // Filter out any potential 'undefined' elements if the array population was sparse,
  // although the logic is designed to fill consecutively up to `processedInputValue - 1`.
  // This step ensures only valid numbers are processed further.
  let finalOrderedSequence = generatedNumbers.filter(item => typeof item === 'number');

  // Sort the complete numerical sequence in ascending order.
  // Using an arrow function for a modern and concise numerical sort.
  finalOrderedSequence.sort((valueA, valueB) => valueA - valueB);

  // Output the final sorted sequence to the console, with each number separated by a single space.
  console.log(finalOrderedSequence.join(" "));
}

// The entry point for execution. It reads the entire content from standard input,
// assumes UTF-8 encoding, and passes it to the sequence processing function.
processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));