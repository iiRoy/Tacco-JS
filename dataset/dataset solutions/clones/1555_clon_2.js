// Standard input acquisition (e.g., from a file system) is bypassed for this demonstration.
const sourceString = `4
141421356 17320508 22360679 244949`;

const textRows = sourceString.split('\n');

const itemCount = parseInt(textRows[0], 10);
const numberSequence = textRows[1]
  .split(' ')
  .map(val => parseInt(val, 10));

const divisorConstant = 1000000007;

const cumulativeValues = [0];
for (let idx = 0; idx < itemCount; idx++) {
  cumulativeValues[idx + 1] = (cumulativeValues[idx] + numberSequence[idx]) % divisorConstant;
}

function modProduct(operand1, operand2) {
  return ((operand1 >>> 16) * operand2 % divisorConstant * 65536 + (operand1 & 65535) * operand2) % divisorConstant;
}

let finalResult = 0;
for (let jdx = 1; jdx < cumulativeValues.length - 1; jdx++) {
  finalResult += modProduct(cumulativeValues[jdx], numberSequence[jdx]);
}
console.log(finalResult % divisorConstant);