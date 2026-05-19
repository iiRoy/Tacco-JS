function ProcessInput(rawData) {
  // Convert the raw input string into a numerical value.
  let limitVal = Number(rawData);

  // Initialize a variable to hold the factorial calculation.
  let factorialResult = 1;
  // Initialize a counter for the final result.
  let finalTally = 0;

  // Compute the factorial of 'limitVal'.
  for (let idx = 1; idx <= limitVal; idx++) {
    factorialResult *= idx;
  }

  // Declare an array to store the divisors found.
  const divisorsList = [];

  // Iterate from 1 up to half of the factorial result to find its divisors.
  for (let idx = 1; idx <= (factorialResult / 2); idx++) {
    // If 'idx' perfectly divides 'factorialResult', it's a divisor.
    if (factorialResult % idx === 0) {
      divisorsList.push(idx); // Add the divisor to our collection.
    }
  }

  // Loop through each element in the collected divisors list.
  for (let listIndex in divisorsList) {
    // Initialize a secondary counter for the number of sub-divisors.
    let divisorCount = 0;
    // Calculate half of the current divisor from the list.
    const currentDivisorHalf = divisorsList[listIndex] / 2;

    // Find divisors for 'currentDivisorHalf'.
    // Note: The loop starts from 0, but `X % 0` in JavaScript results in `NaN`,
    // which does not satisfy the `=== 0` condition, thus `divisorCount` is not incremented for `factorIdx = 0`.
    for (let factorIdx = 0; factorIdx <= currentDivisorHalf; factorIdx++) {
      // Check if 'factorIdx' is a divisor of 'currentDivisorHalf'.
      if ((currentDivisorHalf % factorIdx) === 0) {
        divisorCount++; // Increment the sub-divisor count.
      }
    }

    // If the count of sub-divisors is exactly 75, increment the main tally.
    if (divisorCount === 75) {
      finalTally++;
    }
  }

  // Print the final calculated tally to the console.
  console.log(finalTally);
}

// Read the input from standard input and execute the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
