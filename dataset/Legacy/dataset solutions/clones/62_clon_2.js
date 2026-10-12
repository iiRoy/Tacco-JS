(function(rawData) {
  // Process the raw input string: remove trailing newline and split into lines.
  var lineSegments = rawData.replace(/\n$/, '').split('\n');

  // The first line indicates the total number of test cases.
  var testCaseCount = lineSegments.shift();

  // Iterate through each pair of numbers provided in the input.
  while (lineSegments.length > 0) {
    // Extract the string representations of the two numbers for the current test case.
    var firstOperandStr = lineSegments.shift();
    var secondOperandStr = lineSegments.shift();

    // Calculate their sum using the custom big integer addition function.
    var computedSumResult = performBigIntAddition(firstOperandStr, secondOperandStr);

    // Check if the resulting sum exceeds a predefined length limit.
    if (computedSumResult.length >= 80) {
      // If it's too long, print an 'overflow' message.
      console.log('overflow');
      continue; // Move to the next test case.
    }

    // Otherwise, print the calculated sum.
    console.log('%s', computedSumResult);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.

/**
 * Performs big integer addition on two numbers represented as strings.
 * The function handles numbers of arbitrary length by processing them digit by digit.
 *
 * @param {string} firstOperandStr - The first number as a string.
 * @param {string} secondOperandStr - The second number as a string.
 * @returns {string} The sum of the two numbers as a string.
 */
function performBigIntAddition(firstOperandStr, secondOperandStr) {
  var longNumDigits, shortNumDigits; // Arrays to hold digits of the numbers, reversed.

  // Determine which number is longer to assign 'a' (longer) and 'b' (shorter) consistently.
  if (firstOperandStr.length > secondOperandStr.length) {
    longNumDigits = firstOperandStr.split('').map(Number).reverse();
    shortNumDigits = secondOperandStr.split('').map(Number).reverse();
  } else {
    shortNumDigits = firstOperandStr.split('').map(Number).reverse();
    longNumDigits = secondOperandStr.split('').map(Number).reverse();
  }

  // Add corresponding digits from the shorter number to the longer number.
  for (var digitIndex = 0; digitIndex < shortNumDigits.length; digitIndex++) {
    longNumDigits[digitIndex] += shortNumDigits[digitIndex];
  }

  // Process carries from right to left (least significant to most significant digit).
  for (var digitIndex = 0; digitIndex < longNumDigits.length; digitIndex++) {
    // If a digit position's sum is 10 or more, a carry is generated.
    if (longNumDigits[digitIndex] >= 10) {
      var carryValue = Math.floor(longNumDigits[digitIndex] / 10); // Calculate the carry.
      longNumDigits[digitIndex] = longNumDigits[digitIndex] % 10; // Keep only the unit digit.

      // Add the carry to the next digit position.
      // If it's the last digit, this will extend the array.
      if (digitIndex + 1 < longNumDigits.length) {
        longNumDigits[digitIndex + 1] += carryValue;
      } else {
        longNumDigits.push(carryValue); // Append new digit if carry extends beyond original length.
      }
    }
  }

  // Reverse the array of digits back to the correct order and join them into a string.
  return longNumDigits.reverse().join('');
}
