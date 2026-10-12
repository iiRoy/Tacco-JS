function processInput(dataString) {
  const [firstOperand, secondOperand] = dataString.split(' ').map(Number);

  // The product of two integers is odd if and only if both integers are odd.
  // Otherwise, the product is even. This avoids explicit multiplication.
  const isResultOdd = (firstOperand % 2 !== 0) && (secondOperand % 2 !== 0);

  // Use a ternary operator to determine the output string,
  // replacing the original if-else control flow.
  const finalVerdict = isResultOdd ? 'Odd' : 'Even';

  console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
