const calculateValue = (rawData) => {
  // Process the incoming string data by removing leading/trailing whitespace
  // and then converting it into a numerical representation.
  const numericInput = Number(rawData.trim());

  // Compute the sum of the number itself, its square, and its cube.
  return numericInput + numericInput ** 2 + numericInput ** 3;
};

// Acquire the content from standard input, decode it as UTF-8,
// and then pass it to our processing function before printing the result.
console.log(calculateValue(require('fs').readFileSync('/dev/stdin', 'utf8')));
