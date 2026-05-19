const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = fileContent.trim().split('\n');
const firstLineParts = processedLines[0].split(' ');
const itemCount = Number(firstLineParts[0]);
const numCarriers = Number(firstLineParts[1]);

const itemWeights = processedLines.slice(1).map(Number);

const canDistribute = (weightsArr, carrierCapacity, availableCarriers) => {
  let currentCarrierLoad = 0;
  for (const currentItemWeight of weightsArr) {
    if (currentItemWeight > carrierCapacity) {
      return false;
    }
    if (currentCarrierLoad + currentItemWeight > carrierCapacity) {
      availableCarriers--;
      if (availableCarriers <= 0) {
        return false;
      }
      currentCarrierLoad = currentItemWeight;
    } else {
      currentCarrierLoad += currentItemWeight;
    }
  }
  return true;
};

const totalWeightSum = itemWeights.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

let lowerBound = 0;
let upperBound = totalWeightSum;

while (lowerBound + 1 < upperBound) {
  const midPointIndex = Math.floor((lowerBound + upperBound) / 2);
  if (!canDistribute(itemWeights, midPointIndex, numCarriers)) {
    lowerBound = midPointIndex;
  } else {
    upperBound = midPointIndex;
  }
}
const minRequiredCapacity = upperBound;
console.log(minRequiredCapacity);
