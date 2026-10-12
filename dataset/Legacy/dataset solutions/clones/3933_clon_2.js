function ProcessInput(inputString) {
  // Parse the input string into an integer value.
  const parsedNumber = parseInt(inputString);

  // Initialize an array with two predefined numerical elements.
  var dataArray = [3, 5];

  // Initialize a variable to accumulate sums.
  var accumulator = 0;

  // Iterate through a specific range to populate the array and update the accumulator.
  for (var loopIndex = 2; loopIndex < parsedNumber - 1; loopIndex++) {
    // Assign a calculated value to the current array element.
    dataArray[loopIndex] = loopIndex * 2;
    // Add the newly assigned array element's value to the accumulator.
    accumulator += dataArray[loopIndex];
  }

  // Calculate the value for the last element of the array using a complex arithmetic expression.
  dataArray[parsedNumber - 1] = Math.ceil(accumulator / 30) * 30 - accumulator % 30 + 22;

  // Output the elements of the array, joined by a single space, to the console.
  console.log(dataArray.join(" "));
}

// Read the entire content of the standard input file synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
