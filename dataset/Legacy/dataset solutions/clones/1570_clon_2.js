/*
 This script processes some numerical data.
 It calculates a total duration based on item counts and batch processing.
*/
function ProcessInput(rawData) {
  // The rawData string is expected to contain space-separated numeric values.
  // We parse these values into distinct variables.
  const [numItems, batchSize, timePerBatch] = rawData.split(" ");

  // Calculate the number of batches needed.
  // Math.ceil ensures that even a partial batch counts as a full batch.
  const batchesRequired = Math.ceil(numItems / batchSize);

  // Compute the final time by multiplying batches by time per batch.
  const totalTime = batchesRequired * timePerBatch;

  // Display the computed total time to standard output.
  console.log(totalTime);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
