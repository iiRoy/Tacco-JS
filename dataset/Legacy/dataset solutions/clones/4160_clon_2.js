function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const linesOfData = rawData.split("\n");

  // Parse the second line of input into an array of integers.
  // The numbers are space-separated.
  var originalNumbers = linesOfData[1].split(" ").map((numStr) => parseInt(numStr, 10));

  // Determine the largest number present in the input array.
  const maximumValue = originalNumbers.reduce((accumulator, current) => accumulator > current ? accumulator : current);

  // Initialize a variable to accumulate the total adjustments.
  var totalAdjustments = 0;

  // Iterate from 0 up to the maximum value found in the input numbers.
  for (var currentValue = 0; currentValue <= maximumValue; currentValue++) {
    // Filter the original array to find all elements that match the current iteration value.
    var matchingElements = originalNumbers.filter((element) => element === currentValue);

    // If the count of matching elements is less than the current value,
    // add the count of matching elements to the total adjustments.
    if (matchingElements.length < currentValue) {
      totalAdjustments += matchingElements.length;
    }
    // If the count of matching elements is greater than the current value,
    // add the difference (count - current value) to the total adjustments.
    else if (matchingElements.length > currentValue) {
      totalAdjustments += matchingElements.length - currentValue;
    }
  }

  // Output the final calculated total adjustments to the console.
  console.log(totalAdjustments);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
