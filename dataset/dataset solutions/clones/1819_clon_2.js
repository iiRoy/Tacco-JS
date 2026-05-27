function processInput(rawData) {
  // Parse the input string into an integer value.
  let limitVal = parseInt(rawData);
  // Initialize an array to keep track of unique factors encountered.
  const seenFactors = [];
  // Initialize a counter for the number of unique factors.
  let uniqueFactorCount = 0;

  // Handle the base case where the input is 1.
  if (limitVal === 1) {
    return console.log(0);
  }

  // Obtain the list of prime factors for the given number.
  const factorList = getPrimeFactors(limitVal);
  let previousFactor = 0; // Stores the last processed prime factor.
  let currentProduct = 0; // Stores the current product being checked for uniqueness.

  // Iterate over each prime factor obtained.
  factorList.forEach(aSingleFactor => {
    // If the current factor is different from the previous one,
    // reset the current product to this new factor.
    if (previousFactor !== aSingleFactor) {
      currentProduct = aSingleFactor; // Reset product for a new distinct factor.
    }

    // Check if the current product (or factor) has not been seen before.
    if (!seenFactors.includes(currentProduct)) {
      seenFactors.push(currentProduct); // Add it to the list of seen factors.
      uniqueFactorCount++; // Increment the count of unique factors.
    } else {
      // If the current product has been seen, multiply it by the current factor
      // to form a new product for the next iteration.
      currentProduct *= aSingleFactor;
    }

    // Update the previous factor for the next iteration.
    previousFactor = aSingleFactor;
  });

  // Output the final count of unique factors.
  console.log(uniqueFactorCount);
}

// Function to find all prime factors of a given number.
function getPrimeFactors(targetNum) {
  var factorArray = []; // Array to store the prime factors.

  // Special case for 1, though the main function handles it.
  if (targetNum === 1) {
    return [1];
  }

  var startDivisor = 2; // Start checking for divisibility from 2.

  // Continue until the number is reduced to 1.
  while (targetNum !== 1) {
    var divisorCandidate = startDivisor; // Current divisor to test.
    // Loop to find the smallest prime factor.
    while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
      // If the number is divisible by the candidate.
      if (targetNum % divisorCandidate == 0) {
        factorArray.push(divisorCandidate); // Add the factor to the list.
        targetNum /= divisorCandidate; // Divide the number by its factor.
        break; // Found a factor, break to re-evaluate with the new targetNum.
      }
      divisorCandidate++; // Increment candidate to check the next number.
    }
    startDivisor = divisorCandidate; // Update the starting divisor for the next iteration.
  }
  return factorArray; // Return the list of prime factors.
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
