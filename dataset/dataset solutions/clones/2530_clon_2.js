function ProcessInput(rawData) {
  // The rawData string contains all input data.
  // The first line is rawData[0], second is rawData[1], etc.
  const parsedValues = rawData.split(" ");

  let firstNum = Number(parsedValues[0]);
  let secondNum = Number(parsedValues[1]);

  // Calculate the greatest common divisor of the two numbers.
  let commonDivisorResult = calculateGCD(firstNum, secondNum);
  let coprimeCount = 0;
  let coprimeFactors = [1]; // Initialize with 1, as 1 is always a factor and coprime.

  // Iterate through potential factors up to the square root of the GCD.
  for (let factorCandidate = 1; factorCandidate < Math.sqrt(commonDivisorResult); factorCandidate++) {
    if (commonDivisorResult % factorCandidate === 0) {
      // If factorCandidate is a divisor, check its coprimality with existing factors.
      for (let existingFactorIdx in coprimeFactors) {
        // If not coprime with any existing factor, break and discard factorCandidate.
        if (calculateGCD(coprimeFactors[existingFactorIdx], factorCandidate) !== 1) {
          break;
        }

        // If factorCandidate is coprime with all existing factors, add it.
        if (existingFactorIdx == coprimeFactors.length - 1) {
          coprimeCount++;
          coprimeFactors.push(factorCandidate);
        }
      }
    }
  }

  // Now, check the complementary factors (commonDivisorResult / factorCandidate).
  // We start from 2 because 1 was handled and commonDivisorResult/1 is commonDivisorResult itself.
  for (let factorCandidate = 2; factorCandidate < Math.sqrt(commonDivisorResult); factorCandidate++) {
    // Check if commonDivisorResult is divisible by its complement (commonDivisorResult / factorCandidate).
    // This is equivalent to checking if commonDivisorResult is divisible by factorCandidate.
    if (commonDivisorResult % (commonDivisorResult / factorCandidate) === 0) {
      let complementaryFactor = commonDivisorResult / factorCandidate;

      // Check coprimality of the complementary factor with existing factors.
      for (let existingFactorIdx in coprimeFactors) {
        if (calculateGCD(coprimeFactors[existingFactorIdx], complementaryFactor) !== 1) {
          break;
        }

        // If coprime with all, add it.
        if (existingFactorIdx == coprimeFactors.length - 1) {
          coprimeCount++;
          coprimeFactors.push(complementaryFactor);
        }
      }
    }
  }

  // If the GCD is a perfect square, its square root is a unique factor
  // that would have been missed by the two loops (as they go up to < sqrt).
  if (Number.isInteger(Math.sqrt(commonDivisorResult))) {
    coprimeCount++; // Increment for the square root itself.
  }

  // Output the final count of coprime factors.
  console.log(coprimeCount);
}

// Function to compute the greatest common divisor using the Euclidean algorithm.
function calculateGCD(val1, val2) {
  if (val2 === 0) {
    return val1;
  }
  return calculateGCD(val2, val1 % val2);
}

// The following line should not be modified. It handles standard input/output.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
