function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  const linesArray = rawData.split("\n");

  // Parse the first line to get the total item count and the number of items to select
  const [itemCount, selectCount] = linesArray[0].split(" ");

  // Process the second line:
  // 1. Split by space to get string representations of numbers.
  // 2. Convert each string to a Number.
  // 3. Sort the numbers in descending order (largest first).
  const sortedNumbers = linesArray[1]
    .split(" ")
    .map((numStr) => Number(numStr))
    .sort((valA, valB) => valA < valB); // Custom sort for descending order

  // Initialize a variable to store the sum of the selected numbers
  let totalSum = 0;

  // Loop through the first 'selectCount' elements of the sorted array
  // and add them to the total sum.
  for (let idx = 0; idx < selectCount; idx++) {
    totalSum += sortedNumbers[idx];
  }

  // Output the final calculated sum to the console.
  console.log(totalSum);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
