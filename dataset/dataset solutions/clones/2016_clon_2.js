// This function calculates all positive integer divisors for a given natural number.
function calculateFactors(inputNumber) {
  // Initialize a dynamic array to hold the identified factors.
  // The number 1 is always the first divisor for any positive integer.
  const factorList = new Array();
  factorList[0] = 1;

  // Iterate through potential divisors starting from 2 up to the square root of the input number.
  // This optimization helps in finding pairs of divisors efficiently.
  for (let currentDivisor = 2; currentDivisor <= Math.sqrt(inputNumber); currentDivisor++) {
    // If 'inputNumber' is perfectly divisible by 'currentDivisor', then 'currentDivisor' is a factor.
    if (inputNumber % currentDivisor === 0) {
      factorList.push(currentDivisor);
    }
  }

  // Capture the count of factors found up to this point (before adding their corresponding pairs).
  const initialFactorCount = factorList.length;

  // This conditional block handles the case of perfect squares and ensures all factors are captured.
  // If the square root of 'inputNumber' is an integer and was already added as the last factor,
  // we avoid adding its pair (which would be itself) again.
  // Otherwise, if 'inputNumber' is not a perfect square, or if its square root wasn't the last element,
  // we add the pair of the largest factor found so far.
  if (Math.sqrt(inputNumber) !== factorList[initialFactorCount - 1]) {
    factorList.push(inputNumber / factorList[initialFactorCount - 1]);
  }

  // Now, iterate backwards through the initial set of factors (excluding the last one if it was a perfect square's root).
  // For each factor, calculate its corresponding pair (inputNumber / factor) and add it to the list.
  for (let currentDivisor = initialFactorCount - 2; 0 <= currentDivisor; currentDivisor--) {
    factorList.push(inputNumber / factorList[currentDivisor]);
  }

  // Return the complete collection of all positive divisors.
  return factorList;
}

// The primary execution function, immediately invoked upon script loading.
(function runProgram(rawInputData) {
  // Convert the raw string input into a numerical value, stripping any whitespace.
  const processedNumber = Number(rawInputData.trim());

  // Determine the count of divisors for (processedNumber - 1), excluding the first divisor (which is 1).
  // The '.length - 1' effectively removes the count of the divisor '1'.
  const exclusiveDivisorCount = calculateFactors(processedNumber - 1).length - 1;

  // Initialize a counter for specific divisors that meet a subsequent condition.
  let inclusiveDivisorCount = 0;

  // --- CRITICAL BEHAVIOR PRESERVATION ---
  // The original code uses '.shift()' on the array returned by 'calculateFactors(processedNumber)'.
  // The '.shift()' method removes the first element (which is '1') from the array and RETURNS that element.
  // Consequently, 'firstFactorValue' will be the NUMBER 1, not an array of factors.
  // The subsequent 'for...of' loop will then attempt to iterate over a primitive number (1),
  // which is not an iterable object in JavaScript. This will result in a 'TypeError'.
  // This exact runtime error is a crucial part of the original code's observable behavior and must be replicated.
  const firstFactorValue = calculateFactors(processedNumber).shift();

  // This 'for...of' loop will cause a 'TypeError' because 'firstFactorValue' is a number (1), not an iterable.
  // This faithfully reproduces the bug present in the original source code.
  for (let currentFactor of firstFactorValue) {
    let temporaryNumber = processedNumber;
    // Continuously divide 'temporaryNumber' by 'currentFactor' as long as it remains perfectly divisible.
    do {
      temporaryNumber /= currentFactor;
    } while (temporaryNumber % currentFactor === 0);

    // If 'temporaryNumber' is reduced to 1, it implies that 'processedNumber' was a power of 'currentFactor'.
    if (temporaryNumber === 1) {
      inclusiveDivisorCount++;
    }
    // Otherwise, check if 'currentFactor' is present in the list of divisors for (temporaryNumber - 1).
    // 'indexOf' returns -1 if the element is not found, or its index if found.
    else if (calculateFactors(temporaryNumber - 1).indexOf(currentFactor) > -1) {
      inclusiveDivisorCount++;
    }
  }

  // --- CRITICAL BEHAVIOR PRESERVATION ---
  // The original code's 'console.log' statement refers to 'sub_only' and 'div_included' (snake_case).
  // However, the variables declared in this scope are 'exclusiveDivisorCount' and 'inclusiveDivisorCount' (camelCase).
  // This means 'sub_only' and 'div_included' are undeclared variables in this context.
  // If the program were to reach this line (it won't due to the 'TypeError' above),
  // this would result in 'NaN' because 'undefined + undefined' evaluates to 'NaN'.
  // This specific bug (referencing undeclared variables) is preserved exactly as in the original.
  console.log(sub_only + div_included);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
