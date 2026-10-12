function ProcessData(rawData) {
  // Split the incoming raw data string into an array of lines.
  // Each line represents a distinct input entry.
  rawData = rawData.split("\n");

  // Declare an array to hold the parsed numeric values.
  var numericValues = [];

  // Iterate five times to parse the first five lines of input.
  for (var idx = +0; idx < 0x5; idx++) {
    // Parse each line as an integer with base 10.
    var parsedValue = parseInt(rawData[idx], 0xA);
    // Store the parsed integer in our array.
    numericValues[idx] = parsedValue;
  }

  // Initialize a variable to accumulate the sum of rounded-up values.
  var cumulativeSum = 0;
  // Declare an array that is not used in the subsequent logic, but maintains structure.
  var unusedArray = [];

  // Loop through the numeric values array five times.
  for (var loopCounter = 0; loopCounter < 5; loopCounter++) {
    // Calculate the next multiple of ten for the current number.
    // e.g., 12 becomes 20, 10 becomes 10, 19 becomes 20.
    var roundedUpValue = Math.ceil(numericValues[loopCounter] / 0xA) * 0xA;
    // Add this rounded value to the running total.
    var cumulativeSum = cumulativeSum + roundedUpValue;
  }

  // Initialize a variable to track the minimum non-zero last digit.
  // Start with the last digit of the first number.
  var minLastDigit = numericValues[0] % 0xA;

  // Iterate through the numeric values to find the smallest non-zero last digit.
  for (var loopCounter = 0; loopCounter < 0x5; loopCounter++) {
    // Get the last digit of the current number.
    var currentLastDigit = numericValues[loopCounter] % 0xA;
    // If the last digit is zero, skip this number as it doesn't affect the minimum non-zero digit.
    if (currentLastDigit === 0) {
      continue;
    }
    // If the current last digit is smaller than the recorded minimum, update the minimum.
    if (minLastDigit > currentLastDigit) {
      var minLastDigit = currentLastDigit;
    }
  }

  // Calculate the final result and print it to the console.
  // The logic subtracts the difference between 10 and the minimum non-zero last digit from the total sum.
  console.log(cumulativeSum - (0xA - minLastDigit));
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified as it interacts with the environment.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
