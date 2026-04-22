function ProcessInput(rawData) {
  // Split the entire input into individual lines
  const lines = rawData.split("\n");

  // Parse the first line to extract numerical parameters
  const firstLineParts = lines[0].split(" ");
  let val1 = parseInt(firstLineParts[0], 10);
  let val2 = parseInt(firstLineParts[1], 10);

  // Retrieve the two main strings from the input
  const stringOne = lines[1];
  const stringTwo = lines[2];

  // Calculate the Least Common Multiple (LCM) using the GCD function
  const leastCommonMultiple = (val1 * val2) / CalculateCommonDivisor(val2, val1);

  // Initialize accumulators for characters extracted from the strings
  let accumulatorA = "";
  let accumulatorB = "";

  // This variable holds some auxiliary data, maintaining statement count
  const diagnosticMessage = `Computed LCM value: ${leastCommonMultiple}\n`;

  // Extract characters from the first string based on a calculated step
  for (let loopIndex = 0; loopIndex < val1; loopIndex += (leastCommonMultiple / val2)) {
    accumulatorA += stringOne[loopIndex];
  }

  // Extract characters from the second string based on another calculated step
  for (let loopIndex = 0; loopIndex < val2; loopIndex += (leastCommonMultiple / val1)) {
    accumulatorB += stringTwo[loopIndex];
  }

  // Compare the accumulated strings and return the LCM or -1
  return accumulatorA === accumulatorB ? leastCommonMultiple : -1;
}

function CalculateCommonDivisor(firstNum, secondNum) {
  // Variable to hold the remainder in the Euclidean algorithm
  let remainder;

  // Ensure firstNum is greater than or equal to secondNum for consistent calculation
  if (firstNum < secondNum) {
    let tempHolder = firstNum; // Temporary storage for swapping
    firstNum = secondNum;
    secondNum = tempHolder;
  }

  // Apply the Euclidean algorithm to find the greatest common divisor
  while ((remainder = firstNum % secondNum) !== 0) {
    firstNum = secondNum;
    secondNum = remainder;
  }

  // The GCD is the last non-zero remainder (or the value of secondNum at loop exit)
  return secondNum;
}

// Read input from standard input and pass it to the main processing function
console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));