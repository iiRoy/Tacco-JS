function ProcessInput(rawData) {
  "use strict";
  const lines = rawData.split('\x0A');

  const countVal = Number(lines.shift());
  const dataPoints = lines.shift().split(" ").map(val => +val);

  const leastDeviationSum = Array.from({ length: 100 }, (_, idx) => idx + 1)
    .reduce((minSoFar, targetValue) => {
      const currentDeviationSum = dataPoints.reduce((sumAccumulator, pointValue) => {
        const difference = pointValue - targetValue;
        return sumAccumulator + (difference * difference);
      }, 0);
      return Math.min(minSoFar, currentDeviationSum);
    }, Number.POSITIVE_INFINITY);

  console.log(leastDeviationSum);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
