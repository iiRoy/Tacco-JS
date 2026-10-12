function ProcessData(rawData) {
  // The input string is first divided into an array of lines.
  rawData = rawData.split("\n");

  // Extract the first numerical value from the initial line of input.
  const totalItems = rawData[0].split(' ')[0] - 0;

  // Extract the second numerical value from the initial line of input.
  const itemsPerBatch = rawData[0].split(' ')[1] - 0;

  // Extract the third numerical value from the initial line of input.
  const timePerBatch = rawData[0].split(' ')[2] - 0;

  // Calculate the total duration required by determining the number of batches and multiplying by the time per batch.
  console.log(Math.ceil(totalItems / itemsPerBatch) * timePerBatch);
}

// This section handles reading data from standard input and invoking the primary processing function.
// It is crucial for the execution environment and should remain unaltered.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
