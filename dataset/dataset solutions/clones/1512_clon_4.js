const calculateResult = (sourceData) => {
  const boundaryValue = Number.parseInt(sourceData.split('\n')[0], 10);

  const finalTally = Array.from({ length: boundaryValue }, (_, index) => index + 1)
    .reduce((accumulatedTotal, currentDivisor) => {
      const limitForMultiplier = Math.floor((boundaryValue - 1) / currentDivisor);
      return accumulatedTotal + limitForMultiplier;
    }, 0);

  process.stdout.write(String(finalTally) + '\n');
};

const acquireAndProcess = () => {
  const contentPayload = require("node:fs").readFileSync("/dev/stdin", "utf8");
  calculateResult(contentPayload);
};

acquireAndProcess();