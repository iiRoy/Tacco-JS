function processInput(inputString) {
  // Parse the incoming string data into a 2D array of numbers.
  // First, split the entire input by various newline characters to get individual lines.
  // Then, for each line, split it by spaces and convert each resulting part into a numerical value.
  const parsedData = inputString.split(/\r\n|\r|\n/).map(lineSegment => lineSegment.split(' ').map(Number));

  // Check a specific element within the parsed data structure.
  // The condition evaluates if the element at index [1][1] of the parsedData array is strictly equal to the number 1.
  if (parsedData[1][1] === 1) {
    // If the condition is met, output the integer 1 to the console.
    console.log(1);
  } else {
    // Otherwise (if the condition is not met), output the integer 0 to the console.
    console.log(0);
  }
}
