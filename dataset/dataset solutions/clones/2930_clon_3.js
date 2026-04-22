function calculateRecurrenceSequence(sourceDataString) {
  // Define a constant for the number of sequence elements to generate.
  const SEQUENCE_ELEMENT_COUNT = 10;

  // Validate the input string to ensure it's not empty or just whitespace.
  if (!sourceDataString || sourceDataString.trim() === '') {
    console.error("Input data is empty or invalid. Cannot process.");
    return ''; // Return an empty string or throw an error as appropriate.
  }

  // Split the raw input into individual lines and trim whitespace.
  const inputLines = sourceDataString.trim().split('\n');

  // Ensure there's at least one line of input to process.
  if (inputLines.length === 0) {
    console.error("No data lines found in the input. Processing aborted.");
    return '';
  }

  // Parse the first line which contains the three numerical parameters.
  // We use `map(Number)` for robust integer parsing and handling potential non-numeric inputs.
  const numericalParameters = inputLines[0].split(' ').map(Number);

  // Validate that we have exactly three numerical parameters and that they are valid numbers.
  if (numericalParameters.length < 3 || numericalParameters.some(isNaN)) {
    console.error("Error: Invalid numerical parameters detected in the first line. Expected 3 numbers.");
    return '';
  }

  // Destructure the parsed parameters for better readability.
  const [growthFactor, environmentalReduction, initialPopulationValue] = numericalParameters;

  // Initialize an array to store the computed sequence values.
  const sequenceTerms = [];

  // The first term in the sequence is based on the initial population.
  // The recurrence relation is X_n = X_{n-1} * R - D.
  // The problem implies X_0 = initialPopulationValue * growthFactor - environmentalReduction.
  // The original code actually calculates anss[0] = x*r-D, then anss[i] = anss[i-1]*r-D.
  // So, `x` is effectively the `previousTerm` for the first calculation.
  let previousCalculatedTerm = initialPopulationValue;

  // Iterate to generate the required number of sequence terms.
  for (let currentIteration = 0; currentIteration < SEQUENCE_ELEMENT_COUNT; currentIteration++) {
    // Calculate the next term in the sequence using the recurrence relation.
    const nextTerm = previousCalculatedTerm * growthFactor - environmentalReduction;
    sequenceTerms.push(nextTerm); // Add the newly calculated term to our results array.
    previousCalculatedTerm = nextTerm; // Update the previous term for the next iteration.
  }

  // Join all the calculated sequence terms with newline characters for the final output string.
  const formattedResultString = sequenceTerms.join('\n');

  // Output the result to the console, typically required in competitive programming environments.
  console.log(formattedResultString);

  // Return the formatted string containing the sequence.
  return formattedResultString;
}

/**
 * A utility function to retrieve the value from a DOM element by its ID.
 * Returns null if the element is not found.
 * @param {string} elementId - The ID of the HTML element.
 * @returns {string|null} The value of the element, or null if not found.
 */
function obtainElementValue(elementId) {
  const targetElement = document.getElementById(elementId);
  return targetElement ? targetElement.value : null;
}

/**
 * A utility function to update the innerHTML of a DOM element by its ID.
 * @param {string} elementId - The ID of the HTML element.
 * @param {string} content - The HTML content to set.
 */
function updateElementContent(elementId, content) {
  const targetElement = document.getElementById(elementId);
  if (targetElement) {
    targetElement.innerHTML = content;
  } else {
    console.warn(`Attempted to update non-existent element: ${elementId}`);
  }
}

/**
 * This function simulates a test run for the calculation logic, typically used in a development environment.
 * It fetches input and expected output from specific DOM elements and displays the test outcome.
 * @param {number} testCaseIndex - The index or identifier for the current test case (e.g., 1 for "input1", "output1").
 */
function executeTestScenario(testCaseIndex) {
  const inputElementIdentifier = `input${testCaseIndex}`;
  const outputElementIdentifier = `output${testCaseIndex}`;
  const resultElementIdentifier = `result${testCaseIndex}`;

  // Retrieve test input and expected output from the DOM.
  const testInputString = obtainElementValue(inputElementIdentifier);
  const expectedResultString = obtainElementValue(outputElementIdentifier);

  // Guard against missing test data in the DOM.
  if (!testInputString || !expectedResultString) {
    console.error(`Test scenario ${testCaseIndex} is incomplete: Missing input or expected output elements.`);
    updateElementContent(resultElementIdentifier, "MISSING_DATA");
    return;
  }

  let testStatusMessage = "INITIALIZING";
  let actualComputationResult;

  try {
    // Execute the main calculation function with the retrieved test input.
    actualComputationResult = calculateRecurrenceSequence(testInputString);

    // Compare the actual result with the expected result.
    if (actualComputationResult === expectedResultString) {
      testStatusMessage = "ACCEPT"; // Indicates a successful match.
    } else {
      testStatusMessage = "REJECT"; // Indicates a mismatch.
      console.error(`Test ${testCaseIndex} failed:`);
      console.error(`  Expected:\n${expectedResultString}`);
      console.error(`  Actual:\n${actualComputationResult}`);
    }
  } catch (operationError) {
    // Catch any errors that occur during the calculation process.
    testStatusMessage = "EXECUTION_ERROR";
    console.error(`An unhandled error occurred during test ${testCaseIndex} execution:`, operationError);
  } finally {
    // Always update the result display in the DOM.
    updateElementContent(resultElementIdentifier, testStatusMessage);
  }
}

// This line is typically used in competitive programming platforms to read input from stdin
// and immediately execute the main logic.
// It ensures compatibility with Node.js environment where 'require("fs")' is available.
calculateRecurrenceSequence(require("fs").readFileSync("/dev/stdin", "utf8"));