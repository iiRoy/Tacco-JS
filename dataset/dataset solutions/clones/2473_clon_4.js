'use strict';

const processData = dataLines => {
  const integerValue = Number(dataLines[0]);
  
  const leastSum = Array.from({ length: Math.floor(Math.sqrt(integerValue)) }, (_, idx) => idx + 1)
    .filter(factor => integerValue % factor === 0)
    .map(divisorComponent => divisorComponent + integerValue / divisorComponent - 2)
    .reduce((currentMin, calculatedSum) => Math.min(currentMin, calculatedSum), Number.MAX_SAFE_INTEGER);

  console.log(leastSum);
};

const acquirePayload = () => require("node:fs").readFileSync(process.stdin.fd, "utf8").split('\n');

processData(acquirePayload());