function calculateProduct(dataString) {
  /*
   * This routine computes the product of (prime factor count + 1)
   * for all prime factors of numbers up to a given upper bound.
   * The result is taken modulo a large prime number.
   */
  const upperBound = Number.parseInt(dataString, 10);

  let primeFactorsCount = {}; // Stores the aggregated counts of each unique prime factor

  // Iterate through each number from 2 up to the specified upper bound
  for (let currentNumber = 2; currentNumber <= upperBound; currentNumber++) {
    let temporaryValue = currentNumber; // A mutable copy of the current number for factorization

    // Find prime factors by trial division
    for (let divisorCandidate = 2; divisorCandidate * divisorCandidate <= temporaryValue; divisorCandidate++) {
      if (temporaryValue % divisorCandidate === 0) {
        let factorOccurrence = 0; // Counts how many times this specific divisor appears

        // Keep dividing by the current divisor until it's no longer a factor
        while (temporaryValue % divisorCandidate === 0) {
          factorOccurrence++;
          temporaryValue /= divisorCandidate;
        }

        // Update the overall count for this prime factor
        if (primeFactorsCount[divisorCandidate]) {
          primeFactorsCount[divisorCandidate] = primeFactorsCount[divisorCandidate] + factorOccurrence;
        } else {
          primeFactorsCount[divisorCandidate] = factorOccurrence;
        }
      }
    }

    // If temporaryValue is still greater than 1, it means the remaining value is a prime factor itself
    if (temporaryValue !== 1) {
      if (primeFactorsCount[temporaryValue]) {
        primeFactorsCount[temporaryValue]++;
      } else {
        primeFactorsCount[temporaryValue] = 1;
      }
    }
  }

  let finalResult = 1;
  const moduloValue = 1_000_000_007; // A large prime number for modular arithmetic

  // Compute the product of (count + 1) for each unique prime factor, modulo moduloValue
  for (const factorKey in primeFactorsCount) {
    finalResult = (finalResult * (primeFactorsCount[factorKey] + 1)) % moduloValue;
  }

  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function
calculateProduct(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());