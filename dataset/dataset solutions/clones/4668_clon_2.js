const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let targetNumber = Number(inputData.shift());

const calculateFactors = function(valueToFactor) {
  let factorList = [];
  for (let idx = 1; idx * idx <= valueToFactor; idx++) {
    if (valueToFactor % idx === 0) {
      factorList.push(idx);
      if (idx !== valueToFactor / idx) {
        factorList.push(valueToFactor / idx);
      }
    }
  }
  return factorList.sort((firstVal, secondVal) => firstVal - secondVal);
};

const factors = calculateFactors(targetNumber);

let minimumLength = String(targetNumber).length;

for (let loopIndex = 0; loopIndex < factors.length; loopIndex++) {
  const currentFactor = factors[loopIndex];
  const otherFactor = targetNumber / currentFactor;
  const currentLength = String(otherFactor).length > String(currentFactor).length ? String(otherFactor).length : String(currentFactor).length;
  if (minimumLength > currentLength) {
    minimumLength = currentLength;
  }
}

console.log(minimumLength);
