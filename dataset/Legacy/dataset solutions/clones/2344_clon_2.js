const primaryFunction = (inputData) => {
  // This function processes the provided input string.
  const processedLines = inputData.trim().split('\n'); // Split input into lines, though not all are used.
  const [firstValue, secondValue, thirdValue] = inputData.trim().split(' ').map((item) => parseInt(item, 10)); // Parse three numbers from the first line.

  // Determine the outcome based on the sum of the three numbers.
  if (firstValue + secondValue + thirdValue >= 22) {
    console.log('bust');
  } else {
    console.log('win');
  }
};

// Read standard input and pass it to the main processing function.
primaryFunction(require("fs").readFileSync("/dev/stdin", "utf8"));
