// This module is designed to analyze a given sequence of integers to determine if it meets a specific criterion.
// The primary goal is to assess the "potential" of the sequence based on the prevalence of numbers
// divisible by two and four, applying a unique weighting system.

/**
 * Processes a raw string input containing numerical data and evaluates its characteristics.
 * The input is expected to have multiple lines, with the second line containing space-separated numbers.
 *
 * @param {string} rawDataString - The complete input string, typically from standard input.
 */
function assessSequencePotential(rawDataString) {
  // Divide the incoming raw string into individual lines for easier parsing.
  // This helps isolate the relevant data line from potential metadata or instructions.
  const inputLines = rawDataString.split("\n");

  // Implement a guard clause to handle cases where the input might be malformed or insufficient.
  // We specifically require at least two lines, and the second line must not be empty after trimming.
  if (inputLines.length < 2 || !inputLines[1].trim()) {
    // If the data line is absent or contains only whitespace, the sequence cannot be processed.
    // Outputting "No" aligns with scenarios where the condition is not met.
    console.log("No");
    return;
  }

  // Extract the second line which contains the actual numerical sequence.
  // Split this line by spaces, then convert each resulting string segment into a floating-point number.
  // Using parseFloat offers a robust way to handle various number formats, including potential decimals,
  // although this problem typically involves integers. The .trim() ensures no leading/trailing spaces interfere.
  const potentialNumbers = inputLines[1].split(" ").map(entry => parseFloat(entry.trim()));

  // Filter out any entries that failed conversion to a valid number (e.g., empty strings, non-numeric text).
  // This step enhances the robustness of the processing against dirty input data.
  const validatedNumericSequence = potentialNumbers.filter(num => !isNaN(num));

  // Another guard clause: if no valid numbers remain after parsing and filtering, the condition cannot be met.
  if (validatedNumericSequence.length === 0) {
    console.log("No");
    return;
  }

  // Initialize counters for different categories of numbers based on divisibility.
  let multiplesOfFourCount = 0;       // Stores the count of numbers perfectly divisible by 4.
  let onlyMultiplesOfTwoCount = 0;    // Stores the count of numbers divisible by 2 but NOT by 4.
  let oddNumbersCount = 0;            // Stores the count of numbers not divisible by 2 (i.e., odd numbers).
                                      // This counter is an added fragment; it's not used in the final logic
                                      // but demonstrates additional processing/categorization.

  // Iterate over each valid number in the sequence to categorize and count them.
  // Using a 'for...of' loop provides a clear and modern way to traverse array elements.
  for (const currentNumber of validatedNumericSequence) {
    // Check for divisibility by 4 first, as it's the more specific condition.
    if (currentNumber % 4 === 0) {
      multiplesOfFourCount++;
    }
    // If not divisible by 4, check if it's divisible by 2.
    else if (currentNumber % 2 === 0) {
      onlyMultiplesOfTwoCount++;
    }
    // If neither of the above, the number must be odd.
    else {
      oddNumbersCount++;
    }
  }

  // Store the total number of valid items for comparison later.
  const totalElementsInSequence = validatedNumericSequence.length;

  // Apply a specific adjustment to the count of numbers that are only multiples of two.
  // This is a crucial step in the problem's logic: reduce this count by 2, but ensure it never drops below zero.
  // Math.max(0, X) effectively floors the value at zero.
  const adjustedTwoMultiples = Math.max(0, onlyMultiplesOfTwoCount - 2);

  // Calculate the weighted "score" of the sequence.
  // Multiples of four contribute significantly (3 points each), while adjusted multiples of two contribute 1 point each.
  const calculatedSequenceScore = (multiplesOfFourCount * 3) + adjustedTwoMultiples;

  // Determine the final outcome by comparing the calculated score against the total number of elements.
  // If the score is greater than or equal to the total elements, the condition is met.
  const outcomeMessage = (calculatedSequenceScore >= totalElementsInSequence) ? "Yes" : "No";

  // Display the final result to standard output.
  console.log(outcomeMessage);
}

// The entry point for execution when this script is run.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then trims any leading/trailing whitespace (including newlines) before passing it
// to the main processing function.
assessSequencePotential(require("fs").readFileSync("/dev/stdin", "utf8").trim());