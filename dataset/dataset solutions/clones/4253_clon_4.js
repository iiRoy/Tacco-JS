function processInput(rawText) {
  const numericValue = parseInt(rawText);

  const rootEstimate = Math.floor(Math.sqrt(numericValue));

  const largestPerfectSquare = rootEstimate * rootEstimate;

  console.log(largestPerfectSquare);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
