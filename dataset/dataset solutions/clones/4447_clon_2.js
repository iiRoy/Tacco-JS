console.log(
  (inputContent => {
    // This section parses the raw input string.
    // It first removes leading/trailing whitespace, then splits by newline.
    // Each line is further split by space, and values are converted to integers.
    // The first line's first element becomes 'totalNumbers', and the second line becomes 'numberSequence'.
    const [[totalNumbers], numberSequence] = inputContent
      .trim()
      .split('\n')
      .map(lineString => lineString.split(' ').map(valueString => valueString | 0));

    let oddNumberCount = 0; // Variable to store the count of odd numbers.
    let quadrupleCount = 0; // Variable to store the count of numbers divisible by four.

    // Iterate through each element in the 'numberSequence' array.
    for (let currentIdx = 0; currentIdx < totalNumbers; currentIdx++) {
      // Increment 'oddNumberCount' if the current number is odd.
      // (number & 1) is 1 for odd numbers, 0 for even numbers.
      oddNumberCount += numberSequence[currentIdx] & 1;

      // Increment 'quadrupleCount' if the current number is a multiple of 4.
      // (number % 4) is 0 for multiples of 4, so !(0) is true (1).
      quadrupleCount += !(numberSequence[currentIdx] % 4);
    }

    // Evaluate the final condition to determine the output.
    // The expression (oddNumberCount + quadrupleCount === totalNumbers) checks if all numbers are either odd or multiples of 4.
    // This boolean result is then coerced to 0 or 1 in the subtraction.
    // The overall condition checks if the adjusted odd count is less than or equal to the count of multiples of four.
    return (oddNumberCount - (oddNumberCount + quadrupleCount === totalNumbers) <= quadrupleCount)
      ? 'Yes' // Output 'Yes' if the condition is met.
      : 'No';  // Output 'No' otherwise.
  })(require('fs').readFileSync('/dev/stdin', 'utf8')) // Reads the entire content of standard input as a UTF-8 string.
);
