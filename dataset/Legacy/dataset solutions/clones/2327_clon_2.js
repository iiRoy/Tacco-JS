function ProcessInputData(incomingText) {
  // Split the entire input string by newline characters to get individual lines.
  // The first line contains the numbers we need to process.
  let lineSegments = incomingText.split("\n");

  // Parse the first line, which contains two space-separated integers.
  lineSegments[0] = lineSegments[0].split(" ");

  // Extract the first integer and store its original value.
  let firstInteger = parseInt(lineSegments[0][0], 10);
  let originalFirst = firstInteger;

  // Extract the second integer and store its original value.
  let secondInteger = parseInt(lineSegments[0][1], 10);
  let originalSecond = secondInteger;

  // Initialize arrays to store prime factor counts for each number.
  // The size 100000 is chosen based on the problem constraints.
  let firstNumberFactors = new Array(100001);
  let secondNumberFactors = new Array(100001);

  // Initialize the product that will be calculated.
  let calculatedProduct = 1;

  // Set initial values for factor arrays (indices 0 and 1 are not used for prime factors).
  firstNumberFactors[0] = 0;
  firstNumberFactors[1] = 0;
  secondNumberFactors[0] = 0;
  secondNumberFactors[1] = 0;

  // Iterate from 2 up to 100000 to find prime factors for both numbers.
  for (let idx = 2; idx <= 100000; idx++) {
    // Initialize factor counts for the current index.
    firstNumberFactors[idx] = 0;
    secondNumberFactors[idx] = 0;

    // Factorize the first number by the current index 'idx'.
    // This loop continues as long as 'firstInteger' is divisible by 'idx'.
    for (let loopControl = 0; loopControl < 1; ) {
      if (firstInteger % idx === 0) {
        firstInteger = firstInteger / idx;
        firstNumberFactors[idx] += 1;
      } else {
        // If not divisible, exit this inner loop.
        loopControl = 1;
      }
    }

    // Factorize the second number by the current index 'idx'.
    // This loop continues as long as 'secondInteger' is divisible by 'idx'.
    for (let loopControl = 0; loopControl < 1; ) {
      if (secondInteger % idx === 0) {
        secondInteger = secondInteger / idx;
        secondNumberFactors[idx] += 1;
      } else {
        // If not divisible, exit this inner loop.
        loopControl = 1;
      }
    }
  }

  // Calculate the product based on the prime factors.
  // This loop iterates through all potential prime factors.
  for (let idx = 2; idx <= 100000; idx++) {
    // If both numbers share this prime factor.
    if (firstNumberFactors[idx] !== 0 && secondNumberFactors[idx] !== 0) {
      // Multiply 'calculatedProduct' by 'idx' for the minimum number of times it appears in both.
      for (let loopControl = 0; loopControl < Math.min(firstNumberFactors[idx], secondNumberFactors[idx]); loopControl++) {
        calculatedProduct *= idx;
      }
    } else if (firstNumberFactors[idx] !== 0) {
      // If only the first number has this prime factor.
      // Multiply 'calculatedProduct' by 'idx' for all times it appears in the first number.
      for (let loopControl = 0; loopControl < firstNumberFactors[idx]; loopControl++) {
        calculatedProduct *= idx;
      }
    } else if (secondNumberFactors[idx] !== 0) {
      // If only the second number has this prime factor.
      // Multiply 'calculatedProduct' by 'idx' for all times it appears in the second number.
      for (let loopControl = 0; loopControl < secondNumberFactors[idx]; loopControl++) {
        calculatedProduct *= idx;
      }
    }
  }

  // Determine the overall maximum value among the calculated product and original numbers.
  let overallMaximum = 0;

  // Compare with the calculated product.
  if (overallMaximum < calculatedProduct) {
    overallMaximum = calculatedProduct;
  }

  // Compare with the original first number.
  if (overallMaximum < originalFirst) {
    overallMaximum = originalFirst;
  }

  // Compare with the original second number.
  if (overallMaximum < originalSecond) {
    overallMaximum = originalSecond;
  }

  // Output the final maximum value.
  console.log(overallMaximum);
}

// This line should not be modified (reads from standard input and calls the main processing function).
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
