const processQuaternionProduct = (firstQuad, secondQuad) => {
  const [w1, x1, y1, z1] = firstQuad;
  const [w2, x2, y2, z2] = secondQuad;

  const realComponent = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
  const iComponent = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
  const jComponent = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
  const kComponent = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;

  return [realComponent, iComponent, jComponent, kComponent];
};

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileData.trim().split('\n');

const totalCases = Number(dataLines[0]);
const inputCases = dataLines.slice(1, totalCases + 1);

inputCases.forEach(lineContent => {
  const numericalInputs = lineContent.split(' ').map(Number);
  const quadOne = numericalInputs.slice(0, 4);
  const quadTwo = numericalInputs.slice(4, 8);

  const productResult = processQuaternionProduct(quadOne, quadTwo);
  console.log(productResult.join(' '));
});
