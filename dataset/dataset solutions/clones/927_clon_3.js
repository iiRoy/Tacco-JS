function runFibonacciCalculation() {
  const fileSystemModule = require('fs');
  const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const fibonacciSequenceIndex = Number(rawInputString) + 1;

  const squareRootOfFive = Math.sqrt(5);

  const goldenRatioPhi = (1 + squareRootOfFive) / 2;
  const conjugateGoldenRatioPsi = (1 - squareRootOfFive) / 2;

  const phiToThePowerN = Math.pow(goldenRatioPhi, fibonacciSequenceIndex);
  const psiToThePowerN = Math.pow(conjugateGoldenRatioPsi, fibonacciSequenceIndex);

  const binetFormulaNumerator = phiToThePowerN - psiToThePowerN;

  const unroundedResult = binetFormulaNumerator / squareRootOfFive;

  console.log(Math.round(unroundedResult));
}

runFibonacciCalculation();
