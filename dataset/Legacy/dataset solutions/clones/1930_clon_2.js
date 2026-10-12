function ProcessInput(rawData) {
  // Parse the raw input string into an array of integers
  let parsedValues = rawData.split(' ').map(itemStr => parseInt(itemStr, 10));

  // Destructure the array into two distinct numerical variables
  const [firstNum, secondNum] = parsedValues;

  // Initialize an array to store the generated pairs
  let resultPairs = [];

  // Check if the first number is odd
  if (firstNum % 2 !== 0) {
    // If N is odd, generate pairs (l, r) such that l + r = N and l < r
    for (let leftPtr = 1, rightPtr = firstNum - 1; leftPtr < rightPtr; leftPtr++, rightPtr--) {
      resultPairs.push(leftPtr + ' ' + rightPtr);
    }
  } else {
    // If N is even, generate pairs with a special adjustment
    let adjustmentMade = false; // Flag to track if the adjustment has been applied
    for (let leftPtr = 1, rightPtr = firstNum - 1; leftPtr < rightPtr; leftPtr++, rightPtr--) {
      // Apply adjustment if not already made and the difference is within a certain range
      if (!adjustmentMade && (rightPtr - leftPtr) <= (firstNum / 2)) {
        rightPtr--; // Decrement the right pointer
        adjustmentMade = true; // Mark adjustment as made
      }
      resultPairs.push(leftPtr + ' ' + rightPtr);
    }
  }

  // Output the first 'M' generated pairs
  for (let idx = 1; idx <= secondNum; idx++) {
    console.log(resultPairs[idx - 1]);
  }
}

// This part reads input from standard input. Do not modify this line.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
