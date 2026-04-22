// This function is designed to process an incoming string of raw information.
function processInput(inputString) {
  // First, the input text is segmented into individual lines,
  // then each line is further broken down by spaces.
  // Each resulting string piece is converted into an integer value.
  const structuredNumericData = inputString
    .split(/\r?\n|\r/) // Differentiates newline splitting
    .map(currentLine =>
      currentLine.split(' ').map(val => parseInt(val.trim(), 10))
    );

  // A specific data point within the structured set is evaluated.
  if (structuredNumericData[1][1] === 1) {
    // If the evaluated data point matches the target value,
    // a confirmation signal is emitted.
    console.log(1);
  } else {
    // Should the data point not match, an alternative signal is emitted.
    console.log(0);
  }
}