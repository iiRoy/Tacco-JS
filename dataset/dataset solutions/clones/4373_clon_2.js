function ProcessInput(rawData) {
  // This function processes the raw input string.
  // It splits the string by spaces and converts each part to a number.
  const parsedValues = rawData.split(' ').map(numStr => Number(numStr));

  // Extract the first numerical value.
  const firstVal = parsedValues[0];
  // Extract the second numerical value.
  const secondVal = parsedValues[1];

  // Check if the first value is less than or equal to the second value.
  if (firstVal <= secondVal) {
    // If true, output '0'.
    console.log('0');
  } else {
    // Otherwise, output the difference between the first and second values.
    console.log(firstVal - secondVal);
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
