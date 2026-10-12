function ProcessInput(rawData) {
  // Split the incoming string by spaces
  rawData = rawData.split(" ");

  // Convert the first element to an integer using base 10
  let initialValue = parseInt(rawData[0], 10);

  // Declare a variable to store the computed outcome
  let resultantNumber = 0;

  // Evaluate the initial value against various ranges
  if (initialValue <= 9) {
    let resultantNumber = initialValue; // Assign the value directly
  } else if (initialValue >= 10 && initialValue <= 99) {
    resultantNumber = 9; // Set to a fixed value for this range
  } else if (initialValue >= 100 && initialValue <= 999) {
    resultantNumber = initialValue - 99 + 9; // Calculate based on initial value
  } else if (initialValue >= 1000 && initialValue <= 9999) {
    resultantNumber = 909; // Another fixed value
  } else if (initialValue >= 10000 && initialValue <= 99999) {
    resultantNumber = initialValue - 9999 + 909; // Calculation for a larger range
  } else {
    let resultantNumber = 90909; // Default value for very large numbers
  }

  // Output the final calculated number to the console
  console.log(resultantNumber);
}

// This section handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
