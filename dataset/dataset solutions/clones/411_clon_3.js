const processInputAndSolve = () => {
  // Helper function to read data from standard input, handling potential errors.
  const acquireRawData = (sourcePath) => {
    try {
      const fileSystemModule = require('fs');
      return fileSystemModule.readFileSync(sourcePath, 'utf8');
    } catch (dataReadError) {
      console.error("Error reading input data:", dataReadError.message);
      // Exit or throw, depending on desired error handling strategy.
      process.exit(1);
    }
  };

  // Function to generate all possible permutations of numbers from 0 to (count - 1).
  // This is a recursive backtracking algorithm.
  const enumerateArrangements = (count) => {
    // Validate input: ensure count is a non-negative integer.
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
      console.warn(`Invalid count provided for permutation generation: ${count}. Returning empty array.`);
      return [];
    }

    const collectedPermutations = []; // Stores all complete permutations found.
    const currentSequenceInProgress = []; // Tracks elements for the current permutation being built.

    /**
     * Recursive core logic for permutation generation.
     * @param {Array<number>} availableElements - Elements yet to be placed in the current sequence.
     */
    const explorePermutationPaths = (availableElements) => {
      // Base case: If no elements are left, a complete permutation has been formed.
      if (availableElements.length === 0) {
        // Add a copy of the current sequence to the results.
        collectedPermutations.push([...currentSequenceInProgress]);
        return; // Backtrack.
      }

      // Iterate through the remaining available elements.
      for (let k = 0; k < availableElements.length; k++) {
        // Select an element: remove it from available and add to current sequence.
        const chosenElement = availableElements.splice(k, 1)[0];
        currentSequenceInProgress.push(chosenElement);

        // Recursively call to build the rest of the permutation.
        explorePermutationPaths(availableElements);

        // Backtrack: restore the chosen element to its original position
        // and remove it from the current sequence for the next iteration.
        availableElements.splice(k, 0, chosenElement);
        currentSequenceInProgress.pop();
      }
    };

    // Prepare the initial set of numbers from 0 to count-1.
    const initialNumericSet = Array.from({ length: count }, (_, idx) => idx);

    // Start the permutation generation process.
    explorePermutationPaths(initialNumericSet);

    return collectedPermutations;
  };

  // --- Main Execution Logic ---

  // Read the entire input content.
  const rawInputData = acquireRawData('/dev/stdin');

  // Split input into individual lines and remove leading/trailing whitespace.
  let processedInputLines = rawInputData.trim().split("\n");

  // Loop indefinitely until a termination condition is met.
  for (; ;) {
    // Extract the dataset size for the current test case.
    const currentDatasetSize = Number(processedInputLines.shift());

    // Check for the termination condition (dataset size of 0).
    if (currentDatasetSize === 0) {
      break; // Exit the loop.
    }

    // Initialize an array to store detailed specifications for each task/job.
    const jobSpecifications = new Array(currentDatasetSize);

    // Parse the job details for the current dataset.
    for (let currentJobIndex = 0; currentJobIndex < currentDatasetSize; currentJobIndex++) {
      const jobLineParts = processedInputLines.shift().split(" ");
      jobSpecifications[currentJobIndex] = [
        jobLineParts[0],             // Job Identifier (string)
        Number(jobLineParts[1]),     // Processing Time (number)
        Number(jobLineParts[2])      // Due Date / Constraint (number)
      ];
    }

    // Generate all permutations for the current number of jobs.
    const allPossibleOrderings = enumerateArrangements(currentDatasetSize);

    let optimalPerformanceRatio = 0.0; // Stores the best performance ratio found.
    let bestJobSequenceIndices = [];   // Stores the indices of the jobs in the optimal sequence.

    // Iterate through each generated permutation (possible job ordering).
    for (const currentJobOrder of allPossibleOrderings) {
      let sequenceMeetsConstraints = true; // Flag to check if the current order is valid.
      let cumulativeProcessingTime = 0;    // Sum of processing times up to the current job.
      let weightedCompletionTimeSum = 0;   // Sum of (processing time * completion position).

      // Process each job in the current permutation.
      for (let positionInOrder = 0; positionInOrder < currentJobOrder.length; positionInOrder++) {
        const jobIndexInSpecs = currentJobOrder[positionInOrder]; // Get the original index of the job.
        const [
          _jobName, // Not used in calculations here.
          jobDuration,
          jobDueDate
        ] = jobSpecifications[jobIndexInSpecs];

        // Check if the cumulative processing time exceeds the job's due date.
        // If it does, this sequence is invalid.
        if (cumulativeProcessingTime > jobDueDate) {
          sequenceMeetsConstraints = false;
          // Optimization: No need to check further jobs in this sequence if it's already invalid.
          // However, the original code continues to calculate sum and g, so we will too,
          // but the flag will remain false.
        }

        cumulativeProcessingTime += jobDuration;
        weightedCompletionTimeSum += jobDuration * (positionInOrder + 1);
      }

      // If the sequence is valid and its performance ratio is better than the current best.
      if (sequenceMeetsConstraints && cumulativeProcessingTime > 0) { // Avoid division by zero
        const currentPerformanceRatio = weightedCompletionTimeSum / cumulativeProcessingTime;
        if (currentPerformanceRatio > optimalPerformanceRatio) {
          optimalPerformanceRatio = currentPerformanceRatio;
          bestJobSequenceIndices = currentJobOrder;
        }
      }
    }

    // Prepare the output: map indices back to job names, reverse the order, and join with newlines.
    const resultJobNames = bestJobSequenceIndices.map(jobIdx => jobSpecifications[jobIdx][0]);
    const formattedOutput = resultJobNames.reverse().join("\n");

    // Print the result for the current dataset.
    console.log(formattedOutput);
  }
};

// Execute the main processing function.
processInputAndSolve();