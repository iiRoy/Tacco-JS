const calculateOptimalGrouping = (targetValue) => {
  const potentialFactors = Array.from(
    { length: Math.floor(Math.sqrt(targetValue)) },
    (_, index) => index + 1
  );

  const leastCoupling = potentialFactors.reduce((currentMin, trialFactor) => {
    if (targetValue % trialFactor === 0) {
      const currentCoupling = trialFactor + (targetValue / trialFactor);
      return (currentMin < currentCoupling) ? currentMin : currentCoupling;
    }
    return currentMin;
  }, 9007199254740991);

  return leastCoupling;
};

const executeProgramFlow = (incomingData) => {
  const parsedQuantity = parseInt(incomingData, 10);
  const finalCoupling = calculateOptimalGrouping(parsedQuantity);
  process.stdout.write((finalCoupling - 2).toString() + "\n");
};

executeProgramFlow(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());