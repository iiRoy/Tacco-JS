function ProcessInput(rawData) {
  // This function processes the provided raw data to calculate a specific outcome.

  // Extract the first numeric component from the trimmed raw data.
  const firstValue = Number.parseInt(rawData.trim().split(" ")[0], 10);

  // Extract the second numeric component from the trimmed raw data.
  const secondValue = Number.parseInt(rawData.trim().split(" ")[1], 10);

  // Determine the final outcome based on the extracted values.
  // If either value is 1, the outcome is 1; otherwise, it's half their product, rounded up.
  const finalOutcome = (firstValue === 1 || secondValue === 1) ? 1 : Math.ceil(firstValue * secondValue / 2);

  // Display the calculated outcome to the console.
  console.log(finalOutcome);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
