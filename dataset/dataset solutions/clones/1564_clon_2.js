// This function serves as the primary entry point, handling the initial data parsing and orchestrating the coprimality checks.
function ProcessInput(rawData) {

  // Split the entire input string into individual lines.
  const processedLines = rawData.split('\n');

  // The first line is typically a count, though its direct use might vary.
  // We use parseInt for a slight type change from original 'Number'.
  let elementCount = parseInt(processedLines[0], 10);

  // Parse the second line into an array of integers.
  var numberCollection = processedLines[1].split(' ').map(parseInt);

  // First check: if the greatest common divisor of ALL numbers is not 1,
  // then they cannot be pairwise or setwise coprime.
  if (findGCD(...numberCollection) !== 1) {
    console.log("not coprime");
    return; // Terminate execution early.
  }

  // Initialize an array to store the frequency of each number.
  // The maximum possible value is 1,000,000, so the array size is 1,000,001.
  const numberOccurrences = Array(1000001).fill(0);

  // Iterate through each number in the collection to count occurrences and perform an initial check.
  for (const currentNumber of numberCollection) {
    // Numbers equal to 1 do not affect coprimality checks in this context, so they are skipped.
    if (currentNumber === 1) {
      continue;
    }
    
    // Increment the count for the current number.
    numberOccurrences[currentNumber]++;
    
    // If any number appears more than once, it immediately means they are not pairwise coprime.
    // However, they could still be setwise coprime if their overall GCD is 1 (checked above).
    // The problem statement implies this path leads to 'setwise coprime' if the overall GCD is 1.
    if (numberOccurrences[currentNumber] > 1) {
      console.log("setwise coprime");
      return; // Terminate execution.
    }
  }

  // Second phase of checks: iterate through potential common divisors (starting from 2).
  // This loop identifies if any prime factor (or composite factor) is shared by two or more numbers.
  for (let divisorCandidate = 2; divisorCandidate <= 1000001; divisorCandidate++) {
    var currentDivisorCount = 0; // Tracks how many numbers are divisible by 'divisorCandidate'.

    // For each divisor candidate, iterate through its multiples.
    for (let multiple = divisorCandidate; multiple <= 1000001; multiple += divisorCandidate) {
      // Add the occurrences of this multiple to our running total for the current divisor.
      currentDivisorCount += numberOccurrences[multiple];
      
      // If two or more numbers share this common divisor, then they are setwise coprime.
      if (currentDivisorCount >= 2) {
        console.log("setwise coprime");
        return; // Terminate execution.
      }
    }
  }

  // If none of the above conditions were met, it means no common divisors were found
  // (other than 1), and no numbers were repeated. Thus, they are pairwise coprime.
  console.log("pairwise coprime");

}

/**
 * Calculates the Greatest Common Divisor (GCD) for a dynamic list of numbers.
 * This function utilizes the Euclidean algorithm.
 * @param {...number} numbersToExamine - An array of numerical values.
 * @returns {number} The GCD of all input numbers.
 */
const findGCD = (...numbersToExamine) => {
  // A recursive helper function to compute GCD of two integers.
  // Uses ternary operator for conciseness.
  const calculateRecursiveGCD = (firstVal, secondVal) => secondVal ? calculateRecursiveGCD(secondVal, firstVal % secondVal) : firstVal;
  
  // Initialize the result with the first number in the list.
  let currentGCDResult = numbersToExamine[0];
  
  // Iterate through the rest of the numbers, updating the GCD cumulatively.
  for (var index = 1; index < numbersToExamine.length; index++) {
    currentGCDResult = calculateRecursiveGCD(currentGCDResult, numbersToExamine[index]);
  }
  
  return currentGCDResult;
};

// Execute the main processing function by reading input from standard input.
// Using 'node:fs' for a slight variation from 'fs'.
ProcessInput( require("node:fs").readFileSync("/dev/stdin", "utf8") );