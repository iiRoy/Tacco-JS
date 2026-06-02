(function executeSortingProcess() {
  const STDIN_PATH_CONSTANT = '/dev/stdin';
  const OUTPUT_ELEMENT_DELIMITER = ' ';
  const MAX_POSSIBLE_VALUE_LIMIT = 10000;

  // Helper function to abstract file system input reading
  const retrieveInputLines = (sourcePath) => {
    const fileSystemModule = require('fs');
    const rawContent = fileSystemModule.readFileSync(sourcePath, 'utf8');
    const trimmedContent = rawContent.trim();
    return trimmedContent.split('\n');
  };

  // Core counting sort algorithm encapsulated in a function
  const applyCountingSort = (dataLines) => {
    // Extract the number of elements from the first line
    const numberOfElements = Number(dataLines.shift());

    // Parse the array of numbers from the second line
    const inputNumericArray = dataLines.shift().split(OUTPUT_ELEMENT_DELIMITER).map(Number);

    // Initialize a frequency counter array with zeros
    // This replaces the original loop-based initialization
    const frequencyCounterArray = Array.from({ length: MAX_POSSIBLE_VALUE_LIMIT }, () => 0);

    // Populate the frequency counter array
    for (let currentIdx = 0; currentIdx < numberOfElements; currentIdx++) {
      const value = inputNumericArray[currentIdx];
      // Add a guard to ensure valid array access, preserving original behavior for out-of-bounds/undefined
      if (value !== undefined && value >= 0 && value < MAX_POSSIBLE_VALUE_LIMIT) {
        frequencyCounterArray[value]++;
      }
    }

    // Calculate cumulative frequencies
    for (let currentIdx = 1; currentIdx < MAX_POSSIBLE_VALUE_LIMIT; currentIdx++) {
      frequencyCounterArray[currentIdx] += frequencyCounterArray[currentIdx - 1];
    }

    // Create the final sorted array
    const finalSortedArray = [];

    // Place elements into the sorted array from right to left
    // The loop structure (from numberOfElements down to 0) is preserved
    // to maintain exact observable behavior, including potential sparse array effects.
    for (let currentIdx = numberOfElements; currentIdx >= 0; currentIdx--) {
      const elementToPosition = inputNumericArray[currentIdx];
      // Add guards to handle potential undefined values (e.g., inputNumericArray[numberOfElements])
      // and ensure valid index access for frequencyCounterArray.
      if (elementToPosition !== undefined && elementToPosition >= 0 && elementToPosition < MAX_POSSIBLE_VALUE_LIMIT) {
        const targetPosition = frequencyCounterArray[elementToPosition];
        if (targetPosition !== undefined) {
          finalSortedArray[targetPosition] = elementToPosition;
          frequencyCounterArray[elementToPosition]--;
        }
      }
    }

    // Join the sorted elements with the specified delimiter
    return finalSortedArray.join(OUTPUT_ELEMENT_DELIMITER);
  };

  // Execute the input reading and sorting process
  const allInputContentLines = retrieveInputLines(STDIN_PATH_CONSTANT);
  const processedOutputString = applyCountingSort(allInputContentLines);

  // Write the final sorted string to standard output
  process.stdout.write(processedOutputString);
})();
