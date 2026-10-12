function ProcessInput(rawData) {
  // Split the incoming raw data into individual lines
  const dataRows = rawData.split("\n");

  // Extract the first numerical component from the initial line
  const firstValue = dataRows[0].split(' ')[0];

  // Extract the second numerical component from the initial line
  const secondValue = dataRows[0].split(' ')[1];

  // Determine the result based on the second value and print it
  console.log(secondValue == 1 ? 0 : firstValue - secondValue);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
