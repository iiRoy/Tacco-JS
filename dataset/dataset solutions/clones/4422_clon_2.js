function calculateGCD (firstNum, secondNum) {
  // This function computes the greatest common divisor (GCD) of two integers
  // using the classic Euclidean algorithm.
  if (firstNum % secondNum === 0) {
    // If the first number is perfectly divisible by the second,
    // then the second number is the GCD.
    return secondNum;
  } else {
    // Otherwise, recursively call the function with the second number
    // and the remainder of the division.
    return calculateGCD(secondNum, firstNum % secondNum);
  }
}

function calculateLCM (valueOne, valueTwo) {
  // This function determines the least common multiple (LCM) of two numbers.
  // It leverages the relationship between LCM and GCD:
  // LCM(a, b) = |a * b| / GCD(a, b)
  const greatestCommonDivisorValue = calculateGCD(valueOne, valueTwo);

  return (valueOne * valueTwo) / greatestCommonDivisorValue;
}

function executeProgramLogic (rawInputString) {
  // The primary execution block of the application.
  // It processes the incoming text data to calculate the LCM of a series of numbers.

  let parsedNumbers = rawInputString.split('\n'); // Split the input string by newline characters.

  // Iterate through the array to convert each string element into a numeric type.
  for (let loopIndex = 0; loopIndex < parsedNumbers.length; loopIndex++) {
    parsedNumbers[loopIndex] = Number(parsedNumbers[loopIndex]);
  }

  // Check the number of parsed numeric entries.
  if (parsedNumbers.length === 2) {
    // If only two numbers were provided (likely just one actual number and an empty line),
    // output the second element (assuming it's the valid data point).
    console.log(parsedNumbers[1]);
  } else {
    // If there are more than two numbers, proceed with LCM calculation.
    // Initialize the accumulated LCM with the LCM of the first two relevant numbers.
    let accumulatedLCM = calculateLCM(parsedNumbers[1], parsedNumbers[2]);

    // Loop through the remaining numbers, starting from the third one.
    for (let loopIndex = 3; loopIndex < parsedNumbers.length; loopIndex++) {
      // Continuously update the accumulated LCM with the LCM of the current accumulated value
      // and the next number in the sequence.
      accumulatedLCM = calculateLCM(accumulatedLCM, parsedNumbers[loopIndex]);
    }

    // Display the final computed least common multiple.
    console.log(accumulatedLCM);
  }
}

// Execute the main program logic by reading input from standard input.
executeProgramLogic(require("fs").readFileSync("/dev/stdin", "utf8"));