const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const equationLines = rawInputData.trim().split('\n').filter(Boolean);

equationLines.forEach(currentLine => {
  const numericCoefficients = currentLine.split(' ').map(Number);

  const coeffA = numericCoefficients[0];
  const coeffB = numericCoefficients[1];
  const constC = numericCoefficients[2];
  const coeffD = numericCoefficients[3];
  const coeffE = numericCoefficients[4];
  const constF = numericCoefficients[5];

  // Solve the system using matrix inversion method:
  // System:
  // coeffA * x + coeffB * y = constC
  // coeffD * x + coeffE * y = constF

  // Matrix form:
  // [[coeffA, coeffB], [coeffD, coeffE]] * [[x], [y]] = [[constC], [constF]]

  // Calculate the determinant of the coefficient matrix
  const mainDeterminant = (coeffA * coeffE) - (coeffB * coeffD);

  let solutionX;
  let solutionY;

  // The original code implicitly handles division by zero by producing Infinity/NaN.
  // This implementation preserves that behavior.
  solutionX = ((coeffE * constC) - (coeffB * constF)) / mainDeterminant;
  solutionY = ((coeffA * constF) - (coeffD * constC)) / mainDeterminant;

  console.log(`${solutionX} ${solutionY}`);
});
