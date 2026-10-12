function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Parse the first line to get the number of elements (N)
  let countElements = Number(rawData[0]);
  // Parse the second line, split by space, and convert to an array of numbers
  let numberList = rawData[1].split(" ").map(Number);

  // Check if the greatest common divisor of all numbers is not 1
  // If it's not 1, they are not coprime at all.
  if (calculateGCD(...numberList) !== 0x1) {
    console.log("not coprime");
    return; // Exit early
  }

  // Initialize an array to track the frequency of each number up to 1,000,001
  // This array will help in determining pairwise and setwise coprimality.
  let occurrenceTracker = Array(1_000_001).fill(0x0);

  // First pass: Populate the frequency array and check for immediate setwise coprimality
  // If any number appears more than once, they are setwise coprime (not pairwise).
  for (let currentNum of numberList) {
    // Skip 1 as it doesn't affect GCD checks for other numbers
    if (currentNum === 0x1) continue;

    occurrenceTracker[currentNum]++; // Increment count for the current number
    // If a number appears more than once, it means they share a common factor (themselves)
    // and thus are setwise coprime, not pairwise.
    if (occurrenceTracker[currentNum] > 0x1) {
      console.log("setwise coprime");
      return; // Exit early
    }
  }

  // Second pass: Check for common prime factors among distinct numbers
  // Iterate through potential prime factors starting from 2
  for (let divisorCandidate = 0b10; divisorCandidate <= 1_000_001; divisorCandidate++) {
    let divisorCount = 0x0; // Counter for numbers divisible by divisorCandidate

    // Iterate through multiples of divisorCandidate
    for (let multipleIndex = divisorCandidate; multipleIndex <= 1_000_001; multipleIndex += divisorCandidate) {
      // Add the frequency of the current multiple to divisorCount
      divisorCount += occurrenceTracker[multipleIndex];
      // If two or more numbers share this common divisorCandidate,
      // they are setwise coprime (not pairwise).
      if (divisorCount >= 0b10) {
        console.log("setwise coprime");
        return; // Exit early
      }
    }
  }

  // If all checks pass, it means no two numbers share a common factor greater than 1.
  console.log("pairwise coprime");
}

/**
 * Calculates the Greatest Common Divisor (GCD) of an arbitrary number of integers.
 * Uses the Euclidean algorithm.
 * @param {...number} valuesToProcess - A list of numbers for which to calculate the GCD.
 * @returns {number} The GCD of the provided numbers.
 */
function calculateGCD(...valuesToProcess) {
  // Inner helper function for the Euclidean algorithm (GCD of two numbers)
  const euclideanAlgorithm = (valA, valB) => (valB ? euclideanAlgorithm(valB, valA % valB) : valA);

  // Initialize the result with the first number
  let resultGCD = valuesToProcess[0];
  // Iterate through the rest of the numbers, updating the GCD
  for (let i = 0x1; i < valuesToProcess.length; i++) {
    resultGCD = euclideanAlgorithm(resultGCD, valuesToProcess[i]);
  }
  return resultGCD;
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
