const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', function (currentLine) {
  const inputParts = currentLine.split(' ');
  const upperBoundary = Number.parseInt(inputParts[0], 10);

  const includesNumeralThree = (numericValue) => String(numericValue).includes('3');

  const outputSegments = Array.from({ length: Math.max(0, upperBoundary - 2) }, (_, index) => index + 3)
    .filter(candidateNum => candidateNum % 3 === 0 || includesNumeralThree(candidateNum))
    .map(selectedNum => ' ' + selectedNum);

  const finalResultString = outputSegments.join('');

  console.log(finalResultString);
  process.exit();
});

process.stdin.on('end', function () {
  // This handler is effectively not reached due to process.exit()
  // but is retained for structural equivalence to the original.
});
