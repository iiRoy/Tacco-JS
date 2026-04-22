console.log((inputData => {
  // First, parse the input string into structured data.
  // The first line typically contains a single number (startingCount), the second line contains a sequence of numbers (numberSequence).
  const [
    [startingCount],
    numberSequence
  ] =
    inputData
      .trim() // Remove leading/trailing whitespace from the input string.
      .split`\n` // Split the entire string into an array of lines based on newline characters.
      .map(lineContent => // Process each individual line of the input.
        lineContent
          .split` ` // Split each line into an array of string values, using spaces as delimiters.
          .map(stringVal =>
            stringVal | 0 // Convert each string value to an integer using a bitwise OR 0 operation.
          )
      );

  // Initialize the range bounds. These variables will represent the minimum and maximum possible values of an interval.
  let minimumValue = 2,
    maximumValue = 2;

  // Iterate backward through the 'numberSequence' array. The loop starts from 'startingCount - 2' and goes down to 0.
  // This iteration process is crucial for refining the 'minimumValue' and 'maximumValue' based on specific division rules.
  for (
    let loopIndex = startingCount - 2;
    loopIndex >= 0;
    loopIndex--
  ) {
    // Critical condition check for an impossible scenario:
    // If the current maximum possible value, when combined with the next element in the sequence (minus one),
    // results in a value strictly less than the current element in the sequence, then no valid range can be constructed.
    if (maximumValue + numberSequence[loopIndex + 1] - 1 < numberSequence[loopIndex]) {
      return '-1'; // Return a specific string to indicate an unresolvable or impossible state.
    }

    // Calculate the new 'minimumValue'.
    // It must be the smallest multiple of 'numberSequence[loopIndex]' that is greater than or equal to the current 'minimumValue'.
    minimumValue = Math.ceil(minimumValue / numberSequence[loopIndex]) * numberSequence[loopIndex];

    // Calculate the new 'maximumValue'.
    // This calculation involves several steps to ensure it aligns with the division rules for both the current and the next elements.
    maximumValue =
      Math.ceil(maximumValue / numberSequence[loopIndex + 1]) * numberSequence[loopIndex + 1] +
      numberSequence[loopIndex + 1] -
      1;

    // Further adjust the 'maximumValue'.
    // This step ensures that 'maximumValue' is the largest possible value that still satisfies the conditions
    // related to 'numberSequence[loopIndex]'. Effectively, it is reduced to the highest multiple of 'numberSequence[loopIndex]'
    // that is less than or equal to the current 'maximumValue'.
    maximumValue -= maximumValue % numberSequence[loopIndex];
  }

  // After the loop completes, format and return the final calculated range.
  // The final upper bound requires an additional adjustment involving the first element of the sequence.
  return `${minimumValue} ${maximumValue + numberSequence[0] - 1}`;
})(
  // Read the input data from standard input.
  // This leverages Node.js's built-in 'fs' (file system) module to synchronously read a file.
  require('fs').readFileSync('/dev/stdin', 'utf8')
));