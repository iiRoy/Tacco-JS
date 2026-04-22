function readInputSource() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(outputMessage) {
  console.log(outputMessage); // Display result to console
}

/*
 * Input processing utility function.
 * Defines various data transformation modes:
 * 0: Return input as-is.
 * 1: Convert to integer.
 * 2: Split by space.
 * 3: Split by newline.
 * 4: Split by space and convert to number array.
 * 5: Split by newline and convert to number array.
 * 6: Split into individual characters.
 * 7: Split into individual characters and convert to number array.
 */
function transformData(inputValue, transformationMode) {
  switch (transformationMode) {
    case 0:
      return inputValue;
    case 1:
      return parseInt(inputValue);
    case 2:
      return inputValue.split(" ");
    case 3:
      return inputValue.split("\n");
    case 4:
      return inputValue.split(" ").map((item) => Number(item));
    case 5:
      return inputValue.split("\n").map((item) => Number(item));
    case 6:
      return inputValue.split("");
    case 7:
      return inputValue.split("").map((item) => Number(item));
  }
}

function Process(receivedData) {
  // Convert the incoming data to an integer for calculations.
  let processedData = transformData(receivedData, 1);

  // Calculate the base cost before tax.
  const baseCost = processedData / 1.08;

  // Compute two temporary values for comparison:
  // one rounded down after tax, one rounded up after tax.
  let lowerBound = Math.floor(baseCost * 1.08);
  let upperBound = Math.ceil(baseCost * 1.08);

  // Check if the original processed data matches either of the rounded values.
  if (processedData === lowerBound) {
    printOutput(Math.ceil(baseCost)); // Output the base cost rounded up
  } else if (processedData === upperBound) {
    printOutput(Math.floor(baseCost)); // Output the base cost rounded down
  } else {
    printOutput(":("); // If no match, output error indicator
  }
}

// Begin the program execution by reading input and processing it.
Process(readInputSource());