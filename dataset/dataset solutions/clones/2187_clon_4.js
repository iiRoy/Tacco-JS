function processInputAndCalculate(inputLine) {
  const parts = inputLine.split(' ');
  console.log(parts);

  const dividendCandidate = Number(parts[0]);
  const divisorCandidate = Number(parts[1]);

  let calculatedQuotient;

  if (divisorCandidate === 0) {
    if (dividendCandidate >= 0) {
      while (true) {}
    } else {
      calculatedQuotient = 0;
    }
  } else {
    calculatedQuotient = Math.floor(dividendCandidate / divisorCandidate);
  }

  console.log(calculatedQuotient);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
