function FactorDigitFinder(rawInputString) {
  // Convert the incoming string data into an integer for numerical operations.
  let targetNumber = parseInt(rawInputString);

  // Initialize a variable to store the minimum number of digits found for a factor pair.
  // Start with the number of digits in the target number itself as an initial upper bound.
  var minFactorDigits = (targetNumber + "").length;

  // Declare variables for the loop and intermediate calculations.
  // In the original code, 'i' and 'm' were implicitly declared, which can lead to global scope
  // if not in strict mode. Explicit 'var' declarations here ensure function-level scope,
  // maintaining similar behavior to the original's likely execution environment.
  var divisorCandidate;
  var currentMaxFactorDigits;

  // Iterate through potential divisors starting from 0 up to the square root of the target number.
  // Note: When 'divisorCandidate' is 0, 'targetNumber % 0' results in NaN,
  // making the modulo condition false. 'targetNumber / 0' results in Infinity,
  // which has a string length of 8. This iteration is harmless but does not find factors.
  for (divisorCandidate = 0; divisorCandidate < Math.sqrt(targetNumber); divisorCandidate++) {
    // Determine the maximum number of digits between the current divisor candidate
    // and its corresponding factor pair (targetNumber divided by divisorCandidate).
    currentMaxFactorDigits = Math.max(
      (divisorCandidate + "").length,
      (targetNumber / divisorCandidate + "").length
    );

    // Check if the current 'divisorCandidate' perfectly divides 'targetNumber'
    // AND if the 'currentMaxFactorDigits' is less than the 'minFactorDigits' found so far.
    if (targetNumber % divisorCandidate === 0 && currentMaxFactorDigits < minFactorDigits) {
      // If both conditions are met, update 'minFactorDigits' with this new, smaller value.
      minFactorDigits = currentMaxFactorDigits;
    }
  }

  // Print the final calculated minimum number of digits to the console.
  console.log('%s', minFactorDigits);
}

// Read the entire content of standard input, decode it as UTF-8,
// and then pass it to the main processing function.
FactorDigitFinder(require("fs").readFileSync("/dev/stdin", "utf8"));
