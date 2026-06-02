function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse the first line to get the number of elements.
  let countElements = parseInt(rawData[0], 10);

  // Split the second line into an array of number strings.
  let numberStrings = rawData[1].split(' ');

  // Initialize a 2D array to store prime factor counts for each number.
  let primeFactorCounts = new Array(countElements);

  // A string to accumulate unique prime factors found across all numbers.
  let primeListString = '';

  // An array to store the last factor found for each number (might be unused, but preserved).
  let lastFactor = new Array(countElements);

  // A 2D array to store the required prime factor counts for the final calculation.
  let requiredFactorCounts = new Array(countElements);

  // An array to store intermediate results for each number.
  let individualResults = new Array(countElements);

  // Loop through each of the 'countElements' numbers.
  for (let idx = 0; idx < countElements; idx++) {
    // Convert the current number string to an integer.
    numberStrings[idx] = parseInt(numberStrings[idx], 10);

    // Initialize inner arrays for prime factor counts and required factor counts.
    primeFactorCounts[idx] = new Array(1000001);
    requiredFactorCounts[idx] = new Array(1000001);

    // Initialize all factor counts to zero for the current number.
    for (let subIdx = 2; subIdx < 1000001; subIdx++) {
      requiredFactorCounts[idx][subIdx] = 0;
      primeFactorCounts[idx][subIdx] = 0;
    }

    // Re-initialize (redundant, but preserved) factor counts and perform prime factorization.
    for (let subIdx = 2; subIdx < 1000001; subIdx++) {
      primeFactorCounts[idx][subIdx] = 0; // Redundant initialization
      requiredFactorCounts[idx][subIdx] = 0; // Redundant initialization

      // Loop to find all occurrences of the current prime factor 'subIdx'.
      for (let innerIdx = 0; innerIdx >= 0; innerIdx) { // Infinite loop, relies on break
        if (numberStrings[idx] % subIdx === 0) {
          // Increment the count for this prime factor.
          primeFactorCounts[idx][subIdx]++;
          // Divide the number by the prime factor.
          numberStrings[idx] /= subIdx;
          // If this prime factor hasn't been added to the list string, add it.
          if (primeListString.indexOf(subIdx) === -1) {
            primeListString += subIdx + ',';
          }
        } else {
          // If 'subIdx' is no longer a factor, break from this inner loop.
          break;
        }
      }
      // If the number has been reduced to 1, all prime factors have been found.
      if (numberStrings[idx] === 1) {
        lastFactor[idx] = subIdx; // Store the last factor (unused, but preserved).
        break; // Break from the 'subIdx' loop for this number.
      }
    }
  }

  // Remove the trailing comma from the prime list string.
  primeListString = primeListString.slice(0, -1);

  // Split the prime list string into an array of unique prime factors.
  let uniquePrimes = primeListString.split(',');

  // Get the total count of unique prime factors.
  let primeCount = uniquePrimes.length;

  // Convert the unique prime factor strings to integers.
  for (let idx = 0; idx < primeCount; idx++) {
    uniquePrimes[idx] = parseInt(uniquePrimes[idx], 10);
  }

  // Calculate the required factor counts for each number.
  for (let idx = 0; idx < countElements; idx++) {
    for (let subIdx = 0; subIdx < primeCount; subIdx++) {
      for (let innerIdx = 0; innerIdx < countElements; innerIdx++) {
        // Compare current number's factors with other numbers' factors.
        if (idx !== innerIdx) {
          // Calculate the difference in prime factor counts.
          let currentPrime = uniquePrimes[subIdx];
          let diff = primeFactorCounts[innerIdx][currentPrime] - primeFactorCounts[idx][currentPrime] - requiredFactorCounts[idx][currentPrime];
          if (diff > 0) {
            // Update the required factor count if a higher count is found in another number.
            requiredFactorCounts[idx][currentPrime] += diff;
          }
        }
      }
    }
  }

  // Calculate the final sum of results.
  let totalSum = 0;
  for (let idx = 0; idx < countElements; idx++) {
    individualResults[idx] = 1; // Initialize the result for the current number.
    for (let subIdx = 0; subIdx < primeCount; subIdx++) {
      let currentPrime = uniquePrimes[subIdx];
      // If a required factor count is greater than zero, apply it.
      if (requiredFactorCounts[idx][currentPrime] > 0) {
        individualResults[idx] *= Math.pow(currentPrime, requiredFactorCounts[idx][currentPrime]);
      }
    }
    totalSum += individualResults[idx]; // Add the current number's result to the total sum.
  }

  // Output the total sum modulo (10^9 + 7).
  console.log(totalSum % (Math.pow(10, 9) + 7));
}

// Read input from stdin and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
