(function executeComputation() {

  const acquireNumericInput = () => {
    return +require('node:fs').readFileSync('/dev/stdin', 'utf8').trim() + 1;
  };

  function multiplyTwoByTwoMatrices(leftOperand, rightOperand) {
    const productMatrix = [[0, 0], [0, 0]];
    productMatrix[0][0] = leftOperand[0][0] * rightOperand[0][0] + leftOperand[0][1] * rightOperand[1][0];
    productMatrix[0][1] = leftOperand[0][0] * rightOperand[0][1] + leftOperand[0][1] * rightOperand[1][1];
    productMatrix[1][0] = leftOperand[1][0] * rightOperand[0][0] + leftOperand[1][1] * rightOperand[1][0];
    productMatrix[1][1] = leftOperand[1][0] * rightOperand[0][1] + leftOperand[1][1] * rightOperand[1][1];
    return productMatrix;
  }

  function elevateMatrixToPower(baseMatrix, powerValue) {
    let resultAccumulator = [[1, 0], [0, 1]];
    let currentBase = baseMatrix;

    while (powerValue > 0) {
      if (powerValue % 2 === 1) {
        resultAccumulator = multiplyTwoByTwoMatrices(resultAccumulator, currentBase);
      }
      currentBase = multiplyTwoByTwoMatrices(currentBase, currentBase);
      powerValue = powerValue >>> 1;
    }
    return resultAccumulator;
  }

  const desiredSequenceIndex = acquireNumericInput();

  if (desiredSequenceIndex === 0) {
    process.stdout.write('0\n');
    return;
  }
  if (desiredSequenceIndex === 1) {
    process.stdout.write('1\n');
    return;
  }

  const fibonacciGeneratorMatrix = [[1, 1], [1, 0]];
  const resultantMatrix = elevateMatrixToPower(fibonacciGeneratorMatrix, desiredSequenceIndex - 1);

  process.stdout.write(String(resultantMatrix[0][0]) + '\n');

})();