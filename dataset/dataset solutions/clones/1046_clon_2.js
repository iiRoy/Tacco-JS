const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedLines = rawData.trim().split('\n');
const [itemCount, maxContainers] = parsedLines[0].split(' ').map(Number);
const itemWeights = parsedLines.slice(1).map(Number);

const canDistribute = (weightList, containerCapacity, availableUnits) => {
  let currentContainerWeight = 0;
  for (let idx = 0; idx < weightList.length; idx++) {
    if (weightList[idx] > containerCapacity) {
      return false;
    }
    if (currentContainerWeight + weightList[idx] > containerCapacity) {
      if (--availableUnits <= 0) {
        return false;
      }
      currentContainerWeight = weightList[idx];
    } else {
      currentContainerWeight += weightList[idx];
    }
  }
  return true;
};

const possibleCapacities = [...Array(itemWeights.reduce((accumulator, currentVal) => accumulator + currentVal)).keys()];

let lowerBound = 0;
let upperBound = possibleCapacities.length;
while (lowerBound + 1 < upperBound) {
  const midPoint = Math.floor((lowerBound + upperBound) / 2);
  if (!canDistribute(itemWeights, possibleCapacities[midPoint], maxContainers)) {
    lowerBound = midPoint;
  } else {
    upperBound = midPoint;
  }
}
const finalCapacity = possibleCapacities[upperBound];
console.log(finalCapacity);
