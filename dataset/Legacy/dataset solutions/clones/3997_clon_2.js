console.log(
  (
    (inputStr) => {
      // Process the incoming string: trim, split by space, and subtract two from each numeric part.
      const [firstVal, secondVal] = inputStr
        .trim()
        .split(' ')
        .map(currentNum => currentNum - 2);

      // Compute the absolute value of the product of the two derived numbers.
      const finalProduct = Math.abs(firstVal * secondVal);

      // Return the calculated value as a string.
      return `${finalProduct}`;
    }
  )(
    require('fs').readFileSync('/dev/stdin', 'utf8') // Read the standard input file synchronously, using UTF-8 encoding.
  )
);
