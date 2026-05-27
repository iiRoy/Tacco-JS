function* sequenceGenerator(initialTerm, coefficient, constantTerm) {
  let currentTerm = initialTerm;
  for (let iteration = 0; iteration < 10; iteration++) {
    currentTerm = coefficient * currentTerm - constantTerm;
    yield currentTerm;
  }
}

function processInputAndGenerateOutput(sourceText) {
  const lines = sourceText.split('\n');
  const [coeffStr, constStr, startTermStr] = lines[0].split(' ');

  const coefficient = parseInt(coeffStr, 10);
  const constantTerm = parseInt(constStr, 10);
  const startTerm = parseInt(startTermStr, 10);

  for (const result of sequenceGenerator(startTerm, coefficient, constantTerm)) {
    console.log(result);
  }
}

processInputAndGenerateOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
