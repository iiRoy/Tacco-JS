function findPrimes(upperBound) {
  // Initialize an array to act as a sieve for prime numbers.
  // Each index will represent a number, and its value will indicate if it's prime.
  let sieveArray = [];
  for (let idx = 0; idx <= upperBound; idx++) {
    sieveArray[idx] = idx; // Initially, assume all numbers are prime.
  }

  // Mark 0 and 1 as not prime, as per definition.
  sieveArray[0] = false;
  sieveArray[1] = false;

  // Calculate the square root of the upper bound for optimization in the sieve.
  const limitSqrt = Math.floor(Math.sqrt(upperBound));

  // Implement the Sieve of Eratosthenes algorithm.
  // Iterate from 2 up to the square root of the upper bound.
  for (let idx = 2; idx <= limitSqrt; idx++) {
    // If the current number 'idx' is already marked as not prime, skip it.
    if (sieveArray[idx] === false) {
      continue;
    }

    // If 'idx' is prime, mark all its multiples as not prime.
    // Start marking from idx * idx, as smaller multiples would have been marked by previous primes.
    // However, the original code starts from i+i, which is also valid for marking multiples.
    for (let innerIdx = idx + idx; innerIdx <= upperBound; innerIdx += idx) {
      sieveArray[innerIdx] = false;
    }
  }

  // Collect all numbers that are still marked as prime into a new list.
  const primeNumbersList = [];
  for (let idx = 0; idx <= upperBound; idx++) {
    if (sieveArray[idx] !== false) {
      primeNumbersList.push(sieveArray[idx]);
    }
  }
  return primeNumbersList; // Return the array of prime numbers.
}

// Generate a list of prime numbers up to 50,000.
const calculatedPrimes = findPrimes(50000);

// Read input from standard input, assuming it's a file path.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace, split by newline, and convert to numbers.
const inputNumbers = (rawData.trim()).split("\n").map(Number);

// Loop indefinitely until a specific termination condition is met.
while (true) {
  // Get the next number from the input array.
  const currentNumber = inputNumbers.shift();

  // If the number is 0, terminate the loop.
  if (currentNumber === 0) {
    break;
  }

  // Initialize an object to store unique pairs of primes that sum to 'currentNumber'.
  // Using an object ensures uniqueness and avoids duplicate counting of (a,b) and (b,a).
  const uniquePairs = {};

  // Iterate through the list of pre-calculated primes.
  for (let outerIdx = 0; outerIdx < calculatedPrimes.length; outerIdx++) {
    // If the current prime is already greater than or equal to 'currentNumber',
    // further primes will also be too large, so break the outer loop.
    if (calculatedPrimes[outerIdx] >= currentNumber) {
      break;
    }

    // Iterate through the list of primes again for the second number in the pair.
    for (let innerIdx = 0; innerIdx < calculatedPrimes.length; innerIdx++) {
      // If the second prime is greater than or equal to 'currentNumber',
      // it cannot be part of a sum equal to 'currentNumber' (unless the first prime is 0, which is not prime).
      // Continue to the next inner loop iteration.
      if (calculatedPrimes[innerIdx] >= currentNumber) {
        continue;
      }

      // Check if the sum of the two primes equals 'currentNumber'.
      // Also, ensure that this specific pair (considering order for object key) has not been counted yet.
      // The original code uses p[j]+""+p[i] for the key, which means (a,b) and (b,a) would generate different keys.
      // However, the check `obj.hasOwnProperty(p[j]+""+p[i])==false` means it only checks if the *reversed* pair key exists.
      // This effectively counts (a,b) and (b,a) as distinct if a != b, but only one if a == b.
      // The problem statement implies counting unique *sets* of pairs, so (a,b) and (b,a) should be one.
      // The original code's logic for `hasOwnProperty` is a bit unusual for counting unique *sets* of pairs.
      // It seems to count (p_i, p_j) and (p_j, p_i) as distinct if p_i != p_j, but only one if p_i == p_j.
      // Let's replicate the exact original logic for the key and check.
      // The key `p[i]+""+p[j]` and `p[j]+""+p[i]` are distinct if `p[i] != p[j]`.
      // The condition `obj.hasOwnProperty(p[j]+""+p[i])==false` means it checks if the *reversed* key exists.
      // If `p[i]+p[j] == n` and `uniquePairs` does not have the key `calculatedPrimes[innerIdx] + "" + calculatedPrimes[outerIdx]`,
      // then add the key `calculatedPrimes[outerIdx] + "" + calculatedPrimes[innerIdx]` to `uniquePairs`.
      // This means if (3, 7) sums to 10, it will add "37". If later (7, 3) sums to 10, it will check for "37".
      // If "37" exists, it won't add "73". This correctly counts unique *sets* of pairs.
      if (calculatedPrimes[outerIdx] + calculatedPrimes[innerIdx] === currentNumber &&
          uniquePairs.hasOwnProperty(calculatedPrimes[innerIdx] + "" + calculatedPrimes[outerIdx]) === false) {
        uniquePairs[calculatedPrimes[outerIdx] + "" + calculatedPrimes[innerIdx]] = true;
      }
    }
  }
  // Output the total count of unique pairs found for the current number.
  console.log(Object.keys(uniquePairs).length);
}
