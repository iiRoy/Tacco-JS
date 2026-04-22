'use strict'

/**
 * Processes raw input text to analyze a sequence of numbers,
 * identifying how many elements are strictly situated between their immediate neighbors.
 * This function aims for robustness and clarity in parsing and logic.
 *
 * @param {string} rawInputText - The complete string input, typically from stdin.
 *                                It's expected to contain at least two lines:
 *                                1. A number indicating the total count of elements in the sequence.
 *                                2. A space-separated string of numbers representing the sequence itself.
 */
function analyzeNumericSequence(rawInputText) {
  // First, ensure that the provided input is not null, undefined, or merely empty whitespace.
  // This is a foundational guard clause for input integrity.
  if (!rawInputText || rawInputText.trim().length === 0) {
    console.error("Error: The provided input string is either empty or composed entirely of whitespace.")
    return // Terminate execution gracefully if input is invalid.
  }

  // Sanitize the input by trimming leading/trailing whitespace and splitting it into individual lines.
  // A descriptive variable name `dataLines` is used to enhance readability.
  const dataLines = rawInputText.trim().split('\n')

  // Enforce a minimum number of expected lines for valid input structure.
  const REQUIRED_MIN_LINES = 2
  if (dataLines.length < REQUIRED_MIN_LINES) {
    console.error(`Error: Insufficient input lines. Expected at least ${REQUIRED_MIN_LINES}, but received ${dataLines.length}.`)
    return // Exit if the input format is incomplete.
  }

  // Extract and parse the first line, which is expected to represent the declared length of the sequence.
  // Using `Number()` for type conversion, which is explicit and handles various number formats.
  const declaredSequenceLength = Number(dataLines[0])

  // Extract the second line, which holds the space-separated numeric values.
  const numericStringSegment = dataLines[1]

  // Validate the presence of the numeric sequence string.
  if (!numericStringSegment || numericStringSegment.trim().length === 0) {
    console.error("Error: The second line, containing the numeric sequence, is missing or empty.")
    return
  }

  // Parse the string segment into an array of actual numbers.
  // The unary plus operator (`+`) is a concise way to convert string elements to numbers.
  const numericalSeries = numericStringSegment.split(' ').map(strVal => +strVal)

  // Introduce a validation step to compare the declared length with the actual parsed length.
  // This helps catch potential mismatches in the input data.
  if (numericalSeries.length !== declaredSequenceLength) {
    console.warn(`Warning: Declared sequence length (${declaredSequenceLength}) does not match the actual parsed length (${numericalSeries.length}). Proceeding with the actual length for processing.`)
    // For the purpose of the algorithm, the actual length of `numericalSeries` is paramount.
  }

  // Initialize a counter for elements that meet the specific condition.
  // The name `qualifyingElementCount` clearly indicates its purpose.
  let qualifyingElementCount = 0

  // The condition requires an element to have both a left and a right neighbor.
  // Thus, at least 3 elements are needed for any element to qualify.
  // The loop iterates from the second element (index 1) up to, but not including, the last element.
  const lastPossibleIndexForCheck = numericalSeries.length - 1
  for (let currentElementIndex = 1; currentElementIndex < lastPossibleIndexForCheck; ++currentElementIndex) {
    // Fetch the current element and its immediate neighbors for clear access.
    const valueAtCurrentPosition = numericalSeries[currentElementIndex]
    const valueToTheLeft = numericalSeries[currentElementIndex - 1]
    const valueToTheRight = numericalSeries[currentElementIndex + 1]

    // Apply the core logic: Check if the current value is strictly between its two neighbors.
    // This condition is equivalent to: (left < current < right) OR (right < current < left).
    // A mathematical property for this is: (current - left) * (current - right) < 0.
    // If 'current' is between 'left' and 'right', then (current - left) and (current - right) will have opposite signs,
    // resulting in a negative product. Otherwise, the product will be non-negative.
    const isStrictlyBetweenNeighbors = (valueAtCurrentPosition - valueToTheLeft) * (valueAtCurrentPosition - valueToTheRight) < 0

    // If the condition holds true, increment our dedicated counter.
    if (isStrictlyBetweenNeighbors) {
      qualifyingElementCount++
    }
  }

  // Output the final computed count to standard output.
  console.log(qualifyingElementCount)
}

// The primary execution block. It reads input from `/dev/stdin` and passes it to the analyzer.
// A try-catch block is used to gracefully handle potential file system errors during input reading.
try {
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8')
  analyzeNumericSequence(standardInputContent)
} catch (ioError) {
  console.error("An error occurred while attempting to read from /dev/stdin or during input processing:", ioError.message)
  // In case of a critical I/O error, it's good practice to exit with a non-zero status code.
  process.exit(1)
}