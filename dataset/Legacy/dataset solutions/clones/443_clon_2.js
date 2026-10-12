function findPrimes(upperBound) {
  // Initialize a boolean array for the Sieve of Eratosthenes
  let sieveArray = [];
  for (let idx1 = 0; idx1 <= upperBound; idx1++) {
    sieveArray[idx1] = idx1; // Populate with numbers initially
  }

  // Mark 0 and 1 as not prime
  sieveArray[0] = false;
  sieveArray[1] = false;

  // Calculate the square root limit for the sieve
  const limitSqrt = Math.floor(Math.sqrt(upperBound));

  // Apply the Sieve algorithm
  for (let idx1 = 2; idx1 <= limitSqrt; idx1++) {
    // If the current number is already marked as not prime, skip it
    if (sieveArray[idx1] === false) {
      continue;
    }
    // Mark multiples of the current prime as not prime
    for (let idx2 = idx1 + idx1; idx2 <= upperBound; idx2 += idx1) {
      sieveArray[idx2] = false;
    }
  }

  // Create an object to store prime numbers for quick lookup
  const primeMap = {};
  for (let idx1 = 0; idx1 <= upperBound; idx1++) {
    if (sieveArray[idx1] !== false) {
      primeMap[sieveArray[idx1]] = true; // Store prime numbers as keys
    }
  }
  return primeMap;
}

// Pre-calculate primes up to 1,000,000
const primeNumbersCache = findPrimes(1000000);

// Simulate reading input from a file or stdin
const rawDataString = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';

// Process the input string into an array of lines
let inputLines = (rawDataString.trim()).split("\n");

// Main processing loop
while (true) {
  // Read the first line of each test case (n and x)
  const currentLineParts = inputLines.shift().split(" ").map(Number);
  const countItems = currentLineParts[0];
  const targetSum = currentLineParts[1];

  // Termination condition for the loop
  if (countItems === 0 && targetSum === 0) {
    break;
  }

  // Initialize a dynamic programming array to track reachable sums
  const reachableSums = [];
  for (let sumIndex = 0; sumIndex <= 1000000; sumIndex++) {
    reachableSums[sumIndex] = false;
  }

  // Store the item values for the current test case
  const itemValues = [];
  for (let sumIndex = 0; sumIndex < countItems; sumIndex++) {
    const currentValue = inputLines.shift() - 0; // Convert string to number
    itemValues.push(currentValue);
    reachableSums[currentValue] = true; // Mark initial reachable sums
  }

  // A sum of 0 is always reachable (by choosing no items)
  reachableSums[0] = true;

  // Populate the reachableSums array using dynamic programming
  // For each possible sum, check if adding any itemValue makes a new sum reachable
  for (let sumIndex = 0; sumIndex <= 1000000; sumIndex++) {
    for (let itemIndex = 0; itemIndex < itemValues.length; itemIndex++) {
      if (reachableSums[sumIndex]) {
        reachableSums[sumIndex + itemValues[itemIndex]] = true;
      }
    }
  }

  // Find the largest prime sum less than or equal to targetSum
  let resultSum = 0;
  for (let sumIndex = targetSum; sumIndex > 0; sumIndex--) {
    if (reachableSums[sumIndex] && primeNumbersCache.hasOwnProperty(sumIndex)) {
      resultSum = sumIndex;
      break; // Found the largest prime sum
    }
  }

  // Output the result
  console.log((resultSum === 0) ? "NA" : resultSum);
}
