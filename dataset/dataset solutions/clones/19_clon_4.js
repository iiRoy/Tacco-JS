const dataLoader = require('fs');
const rawContent = dataLoader.readFileSync('/dev/stdin', 'utf8');

const parseNumericalRow = (textRow) => {
  return textRow.split(" ").map(Number);
};

const solveLinearSystem = (alpha1, beta1, gamma1, alpha2, beta2, gamma2) => {
  const detMain = (alpha1 * beta2) - (alpha2 * beta1);
  const detX_val = (gamma1 * beta2) - (gamma2 * beta1);

  const finalX_val = detX_val / detMain;
  const finalY_val = (gamma1 - alpha1 * finalX_val) / beta1;

  return [finalX_val, finalY_val];
};

const inputRows = rawContent.trim().split('\n');

for (const rowContent of inputRows) {
  if (rowContent.length === 0) continue;

  const numericalParameters = parseNumericalRow(rowContent);

  const [p1, q1, r1, p2, q2, r2] = numericalParameters;

  const [solutionA, solutionB] = solveLinearSystem(p1, q1, r1, p2, q2, r2);

  process.stdout.write(`${solutionA} ${solutionB}\n`);
}