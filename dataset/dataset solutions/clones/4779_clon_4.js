'use strict';

function processInputAndCount() {
  const [upperBound, desiredSum] = require("fs").readFileSync("/dev/stdin", "utf8")
    .split('\n')[0]
    .split(' ')
    .map(Number);

  const finalTally = Array.from({ length: upperBound + 1 }, (_, currentX) => {
    return Array.from({ length: upperBound + 1 }, (_, currentY) => {
      const currentZ = desiredSum - currentX - currentY;
      return (currentZ >= 0 && currentZ <= upperBound) ? 1 : 0;
    }).reduce((sumForX, count) => sumForX + count, 0);
  }).reduce((totalSum, sumForX) => totalSum + sumForX, 0);

  console.log(finalTally);
}

processInputAndCount();
