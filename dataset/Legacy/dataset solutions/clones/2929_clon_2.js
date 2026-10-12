function processInput(rawData) {
  // Extract the first numerical component from the input string.
  let factorR = rawData.split(" ")[0] - 0; // Convert the string part to a number.

  // Extract the second numerical component from the input string.
  let offsetD = rawData.split(" ")[1] - 0; // Convert the string part to a number.

  // Extract the third numerical component from the input string.
  let initialValueX = rawData.split(" ")[2] - 0; // Convert the string part to a number.

  // Declare an array to hold the computed sequence values.
  const sequenceValues = [];

  // Set the starting value of the sequence.
  sequenceValues[0] = initialValueX;

  // Iterate to compute and display the next ten values in the sequence.
  for (let idx = 1; idx <= 10; idx++) {
    // Apply the recurrence relation: current_value = factorR * previous_value - offsetD.
    sequenceValues[idx] = factorR * sequenceValues[idx - 1] - offsetD;
    // Output the newly calculated sequence value.
    console.log(sequenceValues[idx]);
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
