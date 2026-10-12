function ProcessInput(rawData) {
  // Parse the input string into an array of numbers
  const parsedValues = rawData.split(' ').map(valStr => Number(valStr));

  // Extract the individual numerical components
  const targetVal = parsedValues[0]; // The primary value
  const firstOption = parsedValues[1]; // The first candidate value
  const secondOption = parsedValues[2]; // The second candidate value

  // Compare the absolute differences to determine which candidate is closer
  // If the distance from targetVal to firstOption is greater than
  // the distance from targetVal to secondOption, then secondOption is closer.
  if (Math.abs(targetVal - firstOption) > Math.abs(targetVal - secondOption)) {
    console.log('B'); // Output 'B' if the second option is closer
  } else {
    console.log('A'); // Otherwise, output 'A' (first option is closer or equidistant)
  }
}

// Read the entire standard input as a UTF-8 string and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
