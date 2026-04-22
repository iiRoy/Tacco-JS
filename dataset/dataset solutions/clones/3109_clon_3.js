// Function to carefully insert a value into a collection at a specified position.
function injectValue(targetCollection, valueToInject) {
  // Ensure the insertion position is valid (at least 1, as 0-indexed implies valueToInject-1).
  // This guard handles unexpected negative or zero values, although problem context implies positive.
  if (valueToInject <= 0) {
    // For values less than or equal to zero, we might choose to insert at the beginning,
    // or throw an error, depending on specific requirements. Here, inserting at index 0.
    console.warn("Detected a non-positive value for injection. Inserting at the start of the collection.");
    targetCollection.splice(0, 0, valueToInject); // Insert at the very beginning
    return;
  }

  // Standard insertion: place the value at the (valueToInject - 1) index.
  targetCollection.splice(valueToInject - 1, 0, valueToInject);
}

// Main processing routine for handling the input sequence and performing insertions.
function executeSequenceInsertion(inputDataString) {
  // Define a constant for the error state output, promoting readability.
  const ERROR_CODE_FOR_FAILURE = -1;

  // Split the raw input string into an array of lines.
  const allInputLines = inputDataString.split("\n");

  // Input validation: ensure there's at least a second line to process.
  if (allInputLines.length < 2) {
    console.log(ERROR_CODE_FOR_FAILURE);
    return; // Exit early if input is insufficient.
  }

  // Parse the second line of input into a sequence of numbers.
  // Using Array.from with a mapping function for parsing each string segment.
  const insertionSequence = Array.from(allInputLines[1].split(" "), (strSegment) =>
    parseInt(strSegment.trim(), 10)
  );

  // Initialize the dynamic collection where elements will be progressively placed.
  const finalResultCollection = [];
  // Flag to indicate if any insertion rule was violated during processing.
  let integrityBreachDetected = false;

  // Iterate through the provided sequence of numbers using a block-scoped loop variable.
  for (let currentIterationIndex = 0; currentIterationIndex < insertionSequence.length; ++currentIterationIndex) {
    // Calculate the maximum allowed position for the current element based on its index.
    const maximumPermittedPosition = currentIterationIndex + 1;
    // Retrieve the element intended for placement from the sequence.
    const elementForPlacement = insertionSequence[currentIterationIndex];

    // Check the core integrity condition: the element's value must not exceed its allowed position.
    if (elementForPlacement > maximumPermittedPosition) {
      integrityBreachDetected = true;
      // If a breach is found, there's no need to continue processing the rest of the sequence.
      break; // Exit the loop prematurely.
    }

    // Perform the insertion using the dedicated helper function.
    injectValue(finalResultCollection, elementForPlacement);
  }

  // After the loop, check if an integrity breach was detected.
  if (integrityBreachDetected) {
    console.log(ERROR_CODE_FOR_FAILURE);
    return; // Output error and terminate execution.
  }

  // If all insertions were successful, print each element of the final collection.
  // Utilizing forEach for a concise output loop.
  finalResultCollection.forEach((itemInCollection) => {
    console.log(itemInCollection);
  });
}

// Main application entry point: Reads input from standard input and delegates processing.
// Using a descriptive constant for the file system module.
const nodeFileSystemModule = require('fs');
executeSequenceInsertion(nodeFileSystemModule.readFileSync('/dev/stdin', 'utf8'));