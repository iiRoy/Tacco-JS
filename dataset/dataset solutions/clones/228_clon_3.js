const stdioReader = require('fs');

// Primary execution starts here.
// Initializes the application and processes input data.
function initiatePrimeSumProcessor() {
  // Determine the maximum value for prime number generation and summation.
  // This value is derived from the problem constraints.
  const maximumSumValue = 50000;
  const sqrtOfMax = Math.floor(Math.sqrt(maximumSumValue)); // Used for sieve optimization

  // Generate a list of prime numbers up to the maximum possible sum.
  const primeCollection = buildPrimeList(maximumSumValue);
  
  // Create an array to store the frequency of each sum of two primes.
  // The index represents the sum, and the value represents its count.
  const sumOccurrences = new Int32Array(maximumSumValue + 1);

  // Iterate through all possible pairs of primes from the collected list
  // to calculate their sums and increment the frequency counter.
  // The outer loop iterates through each prime number `p_first` in the collection.
  for (let firstPrimeIdx = 1; firstPrimeIdx < primeCollection.length; ++firstPrimeIdx) {
    const p_first = primeCollection[firstPrimeIdx];
    
    // The inner loop iterates through primes `p_second` up to `p_first` (inclusive).
    // This ensures that each unique pair (p_a, p_b) is considered once,
    // and (p_a, p_a) is also considered. The problem statement's original
    // implementation counts (p_a, p_b) and (p_b, p_a) as distinct if a != b,
    // which this loop structure achieves by iterating k up to i.
    for (let secondPrimeIdx = 1; secondPrimeIdx <= firstPrimeIdx; ++secondPrimeIdx) {
      const p_second = primeCollection[secondPrimeIdx];
      const currentSum = p_first + p_second;

      // Optimization: If the current sum exceeds the maximum target value,
      // further sums involving p_first (with increasing p_second values)
      // will also exceed the limit. So, we can break from the inner loop.
      if (currentSum > maximumSumValue) {
        break;
      }
      
      // Increment the count for the calculated sum.
      sumOccurrences[currentSum]++;
    }
  }

  // --- Input Processing ---
  // Read the entire standard input synchronously.
  const rawInputContent = stdioReader.readFileSync(process.stdin.fd, 'utf8');
  // Split the input into lines and filter out any empty lines.
  const inputLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

  let linePointer = 0;
  let queryValue;

  // Process each line of input until an invalid or zero value is encountered.
  // The original code uses `+input[i++]` which implicitly converts to number.
  // We'll use `Number.parseInt` for explicit conversion and robustness.
  while (true) {
    const currentLine = inputLines[linePointer++];
    if (currentLine === undefined) { // End of input lines
      break;
    }

    queryValue = Number.parseInt(currentLine.trim(), 10);
    
    // Check for invalid input (NaN) or termination condition (0).
    if (Number.isNaN(queryValue) || queryValue === 0) {
      break;
    }

    // Output the pre-calculated count for the current query value.
    // If the query value is outside the valid range (e.g., > maximumSumValue),
    // sumOccurrences[queryValue] will be 0, which is the correct result.
    console.log(sumOccurrences[queryValue]);
  }
}

// Function to generate a list of prime numbers up to a specified limit
// using the Sieve of Eratosthenes algorithm.
function buildPrimeList(upperBound) {
  // `isCompositeFlags` array: `true` if the index is a composite number, `false` otherwise.
  // Initialize all values to `false` (assuming prime until proven composite).
  const isCompositeFlags = new Array(upperBound + 1).fill(false);

  // 0 and 1 are not prime numbers.
  isCompositeFlags[0] = true;
  isCompositeFlags[1] = true;

  // Iterate from 2 up to the square root of the upper bound.
  // Numbers larger than `sqrt(upperBound)` will have already been marked
  // by their prime factors if they are composite.
  const limitForSieveIteration = Math.floor(Math.sqrt(upperBound));
  for (let num = 2; num <= limitForSieveIteration; ++num) {
    // If `num` is marked as composite, skip it.
    if (isCompositeFlags[num]) {
      continue;
    }
    
    // If `num` is prime, mark all its multiples as composite.
    // Start marking from `num * num` because smaller multiples (e.g., 2*num, 3*num)
    // would have already been marked by smaller prime factors (2, 3, etc.).
    for (let multiple = num * num; multiple <= upperBound; multiple += num) {
      isCompositeFlags[multiple] = true;
    }
  }

  // Collect all prime numbers into a new array.
  // The original code uses an `Int32Array` of size 5134, which is `count_of_primes_below_50000 + 1`.
  // We'll use a standard `Array` and then convert if needed, or pre-allocate.
  // Let's pre-allocate based on an approximate prime count (e.g., N/ln(N)).
  // For 50000, it's roughly 50000/ln(50000) approx 50000/10.8 = 4630.
  // The original code's 5134 is a safe upper bound. We'll use a dynamic array for simplicity.
  const resultantPrimes = [0]; // Placeholder at index 0, as original code uses 1-based indexing for primes

  for (let idx = 2; idx <= upperBound; ++idx) {
    if (!isCompositeFlags[idx]) {
      resultantPrimes.push(idx);
    }
  }
  
  // Return the array of prime numbers.
  return new Int32Array(resultantPrimes); // Convert to Int32Array for consistency with original data type
}

// Invoke the main processing function to start the application.
initiatePrimeSumProcessor();