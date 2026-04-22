function computeSpecialCount(rawData) {
  // Validate if input data is provided and not just whitespace.
  if (!rawData || rawData.trim() === '') {
    console.error("Input data is missing or empty. Cannot proceed with calculations.");
    return;
  }

  // Split the raw input string by newlines to process individual lines.
  const processedData = rawData.split("\n");

  // Attempt to parse the first line as the upper limit for number processing.
  const upperLimit = Number(processedData[0]);

  // Perform validation on the parsed upper limit.
  if (isNaN(upperLimit) || upperLimit < 1) {
    console.error("The provided upper limit is not a valid positive number. Please check your input.");
    return;
  }

  // Define the maximum prime number we are interested in tracking.
  // This value is based on the problem's constraints (array size 101).
  const MAX_PRIME_TRACKED = 100;

  // Initialize an array to store the frequency of each prime factor encountered
  // across all numbers up to the upperLimit. Array is 1-indexed for primes.
  const primeFactorTallies = new Array(MAX_PRIME_TRACKED + 1).fill(0);

  /**
   * Helper function to decompose a given number into its prime factors
   * and increment their counts in the shared tallies store.
   * @param {number} targetNumber - The number to factorize.
   * @param {number[]} talliesStore - The array holding prime factor counts.
   */
  const collectPrimeFactors = (targetNumber, talliesStore) => {
    let tempValue = targetNumber; // Use a temporary variable for division
    let currentDivisor = 2;       // Start checking from the first prime number

    // Optimize factorization by checking divisors up to the square root of the remaining value.
    while (currentDivisor * currentDivisor <= tempValue) {
      // If currentDivisor is a factor, repeatedly divide tempValue by it
      // and increment its tally until it's no longer a factor.
      if (tempValue % currentDivisor === 0) {
        while (tempValue % currentDivisor === 0) {
          // Only track factors within our defined range.
          if (currentDivisor <= MAX_PRIME_TRACKED) {
            talliesStore[currentDivisor]++;
          }
          tempValue /= currentDivisor;
        }
      }
      currentDivisor++; // Move to the next potential divisor.
    }

    // If, after the loop, tempValue is still greater than 1, it means
    // the remaining tempValue is itself a prime factor (and larger than its original square root).
    if (tempValue > 1) {
      if (tempValue <= MAX_PRIME_TRACKED) {
        talliesStore[tempValue]++;
      }
    }
  };

  // Iterate through all numbers from 2 up to the specified upper limit.
  // Number 1 has no prime factors, so we can start from 2.
  for (let currentNum = 2; currentNum <= upperLimit; currentNum++) {
    collectPrimeFactors(currentNum, primeFactorTallies);
  }

  // Initialize counters for primes appearing with specific frequencies.
  let countAtLeastFour = 0;   // Primes with frequency >= 4
  let countTwoOrThree = 0;    // Primes with frequency of 2 or 3

  // Iterate through the collected prime factor tallies to categorize them.
  // We start from 2 as 1 is not a prime and 0 is not used.
  for (let factorIdx = 2; factorIdx <= MAX_PRIME_TRACKED; factorIdx++) {
    const currentTally = primeFactorTallies[factorIdx];

    if (currentTally >= 4) {
      countAtLeastFour++;
    } else if (currentTally === 2 || currentTally === 3) {
      countTwoOrThree++;
    }
  }

  /**
   * Calculates the number of combinations (n choose k).
   * C(n, k) = n! / (k! * (n-k)!)
   * @param {number} n - The total number of items.
   * @param {number} k - The number of items to choose.
   * @returns {number} The number of combinations.
   */
  const calculateCombinations = (n, k) => {
    // Handle edge cases for combinations
    if (k < 0 || k > n) {
      return 0; // Cannot choose negative items or more items than available
    }
    if (k === 0 || k === n) {
      return 1; // One way to choose 0 items (choose nothing) or all n items
    }
    // Optimization: C(n, k) = C(n, n-k)
    if (k > n / 2) {
      k = n - k;
    }

    let res = 1;
    // Calculate combinations iteratively: C(n, k) = (n * (n-1) * ... * (n-k+1)) / k!
    for (let i = 1; i <= k; i++) {
      res = res * (n - i + 1) / i;
    }
    return res;
  };

  // Compute the first part of the final result based on the problem's specific formula.
  // This term typically involves choosing one prime from 'two or three' category
  // and two primes from 'at least four' category.
  const firstTermContribution = countTwoOrThree * calculateCombinations(countAtLeastFour, 2);

  // Compute the second part of the final result.
  // This term typically involves choosing three primes from 'at least four' category.
  const secondTermContribution = calculateCombinations(countAtLeastFour, 3);

  // Sum both contributions to get the overall final result.
  const finalResult = firstTermContribution + secondTermContribution;

  // Output the computed result to the console using a template literal.
  console.log(`${finalResult}`);
}

// A utility function for local testing environments, typically triggered by a UI element
// (e.g., a button click in a web page with an input field).
function performTestRun() {
  const testInput = document.getElementById("input").value;
  computeSpecialCount(testInput); // Invoke the main processing logic with test data.
}

// Standard entry point for competitive programming platforms using Node.js filesystem access.
// This section reads input from standard input and passes it to the main processing function.
const nodeFileSystem = require("fs");
const inputContent = nodeFileSystem.readFileSync("/dev/stdin", { encoding: "utf8" });
computeSpecialCount(inputContent);