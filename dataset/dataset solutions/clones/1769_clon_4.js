const dataAcquisition = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }).split('\n');
const [principalQuantity, secondaryQuantity] = dataAcquisition[0].split(' ').map(parseFloat);

const determinationMatrix = {
  true: 'Yes',
  false: 'No'
};

const decisionPoint = principalQuantity < secondaryQuantity && secondaryQuantity <= principalQuantity * 4;

const finalDecision = determinationMatrix[decisionPoint];

console.log(finalDecision);