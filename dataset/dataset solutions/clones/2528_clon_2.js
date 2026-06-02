function ProcessInput(rawData) {
  // This function processes the provided raw input string.
  const lines = rawData.split("\n");

  // The first line contains configuration parameters, parsed as integers.
  const configParams = lines[0].split(" ").map((val) => parseInt(val, 10));

  // The second line contains a sequence of numbers, also parsed as integers.
  const sequenceValues = lines[1].split(" ").map((val) => parseInt(val, 10));

  // Initialize an array to store ordered indices.
  // Note: The original code initializes with `new Array(n)` where `n` is an array like `[5]`.
  // This results in an array `[[5]]` of length 1, which is then extended by assignments.
  // This specific behavior is preserved.
  const orderedIndices = new Array(configParams);

  // Iterate from 1 up to the value of the first configuration parameter.
  for (let idx = 1; idx <= configParams[0]; idx++) {
    // Assign the current index 'idx' to the position indicated by 'sequenceValues[idx]'.
    orderedIndices[sequenceValues[idx]] = idx;
  }

  // Output the resulting array elements joined by a space.
  console.log(orderedIndices.join(' '));
}

// Do not modify this specific invocation line.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
