const fileSystem = require('fs');

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf-8');

let linesArray = rawData.split('\n');

let testCaseCount = linesArray[0];

let minTotalCost = 0;
let costTwo = 0;
let costThree = 0;
let costFive = 0;
let costOne = 0;

function calculateMinCost(currentNum, accumulatedCost) {
  if (currentNum >= 2) {
    let remainderVal = currentNum % 2;
    let divisorCount = (currentNum - remainderVal) / 2;

    if (remainderVal === 0 || divisorCount === 1) {
      let tempCost = accumulatedCost + costTwo * divisorCount + costOne * remainderVal;
      if (minTotalCost === 0 || minTotalCost > tempCost) {
        minTotalCost = tempCost;
      }
    } else {
      calculateMinCost(divisorCount, accumulatedCost + costTwo + costOne * remainderVal);
      divisorCount = divisorCount + 1;
      remainderVal = currentNum - divisorCount * 2;
      if (remainderVal === 0) {
        let tempCost = accumulatedCost + costTwo * divisorCount + costOne;
        if (minTotalCost === 0 || minTotalCost > tempCost) minTotalCost = tempCost;
      } else calculateMinCost(divisorCount, accumulatedCost + costTwo + costOne * remainderVal);
    }
  }

  if (currentNum >= 3) {
    let remainderVal = currentNum % 3;
    let divisorCount = (currentNum - remainderVal) / 3;
    if (remainderVal === 0 || divisorCount === 1) {
      let tempCost = accumulatedCost + costThree * divisorCount + costOne * remainderVal;
      if (minTotalCost === 0 || minTotalCost > tempCost) {
        minTotalCost = tempCost;
      }
    } else {
      calculateMinCost(divisorCount, accumulatedCost + costThree + costOne * remainderVal);
      divisorCount = divisorCount + 1;
      remainderVal = currentNum - divisorCount * 3;
      if (remainderVal === 0) {
        let tempCost = accumulatedCost + costThree * divisorCount + costOne;
        if (minTotalCost === 0 || minTotalCost > tempCost) minTotalCost = tempCost;
      } else calculateMinCost(divisorCount, accumulatedCost + costThree + costOne * remainderVal);
    }
  }
/*
  if (currentNum >= 5) {
    let remainderVal = currentNum % 5;
    let divisorCount = (currentNum - remainderVal) / 5;
    if (remainderVal === 0 || divisorCount === 1) {
      let tempCost = accumulatedCost + costFive * divisorCount + costOne * remainderVal;
      if (minTotalCost === 0 || minTotalCost > tempCost) { minTotalCost = tempCost; };
    } else {
      calculateMinCost(divisorCount, accumulatedCost + costFive + costOne * remainderVal);
      divisorCount = divisorCount + 1;
      remainderVal = currentNum - divisorCount * 5;
      if (remainderVal === 0) {
        let tempCost = accumulatedCost + costFive * divisorCount + costOne;
        if (minTotalCost === 0 || minTotalCost > tempCost) minTotalCost = tempCost;
      } else calculateMinCost(divisorCount, accumulatedCost + costFive + costOne * remainderVal);
    }
  }
*/
}

for (let idx = 1; idx <= testCaseCount; idx++) {
  let currentLineParts = linesArray[idx].split(' ');
  let targetValue = parseInt(currentLineParts[0], 10);
  costTwo = parseInt(currentLineParts[1], 10);
  costThree = parseInt(currentLineParts[2], 10);
  costFive = parseInt(currentLineParts[3], 10);
  costOne = parseInt(currentLineParts[4], 10);
  minTotalCost = 0;
  calculateMinCost(targetValue, 0);
  console.log(minTotalCost);
}
