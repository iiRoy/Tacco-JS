function processInputData(rawData) {
  // Split the entire input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to get the count of numbers.
  const arraySize = parseInt(inputLines[0], 10);

  // Process the second line: split by spaces and convert each part to an integer.
  const numberArray = inputLines[1].split(" ").map(currentValue => parseInt(currentValue, 10));

  // Initialize a counter for the total number of divisions performed.
  let totalDivisions = 0;

  // Iterate through each element in the array of numbers.
  for (let idx = 0; idx < arraySize; idx++) {
    // Continuously divide the current number by 2 as long as it is even.
    while (numberArray[idx] % 2 === 0) {
      numberArray[idx] = numberArray[idx] / 2; // Update the number after division.
      totalDivisions++; // Increment the division counter.
    }
  }

  // Print the final accumulated count of divisions to the console.
  console.log(totalDivisions);
}

// Read the content from standard input synchronously and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
