function findSolutionDigit(equationString) {
  const trimmedInput = equationString.trim();
  if (trimmedInput === '') {
    return null;
  }

  const equationComponents = trimmedInput.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);

  const firstOperandString = equationComponents[1];
  const secondOperandString = equationComponents[2];
  const resultOperandString = equationComponents[3];

  const isFirstCharX_A = firstOperandString.charAt(0) === 'X';
  const isFirstCharX_B = secondOperandString.charAt(0) === 'X';
  const isFirstCharX_C = resultOperandString.charAt(0) === 'X';

  for (let candidateDigit = 0; candidateDigit <= 9; candidateDigit++) {
    const isZeroAndLeadingPlaceholder = (candidateDigit === 0) && (isFirstCharX_A || isFirstCharX_B || isFirstCharX_C);
    if (isZeroAndLeadingPlaceholder) {
      continue;
    }

    const substitutedA = firstOperandString.replace(/X/g, candidateDigit);
    const substitutedB = secondOperandString.replace(/X/g, candidateDigit);
    const substitutedC = resultOperandString.replace(/X/g, candidateDigit);

    const numericA = parseInt(substitutedA, 10);
    const numericB = parseInt(substitutedB, 10);
    const numericC = parseInt(substitutedC, 10);

    if (numericA + numericB === numericC) {
      return candidateDigit;
    }
  }
  return 'NA';
}

function solveEquations() {
  equationLines.forEach(function(currentEquationString) {
    const solution = findSolutionDigit(currentEquationString);
    if (solution !== null) {
      console.log(solution);
    }
  });
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk;
});
process.stdin.on('end', function() {
  const equationLines = rawDataBuffer.split('\n');
  solveEquations();
});
