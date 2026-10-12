const processInputData = (rawData) => {
  const lines = rawData.trim().split("\n");

  const [itemCountStr, maxOperationsStr] = lines[0].split(" ");
  const itemCount = Number(itemCountStr);
  const maxOperations = Number(maxOperationsStr);

  const itemCosts = lines[1].split(" ").map(Number).sort((a, b) => a - b);
  const factorValues = lines[2].split(" ").map(Number).sort((a, b) => b - a);

  const determineInitialUpperBound = (costs, factors, count) =>
    Array.from({ length: count }, (_, idx) => costs[idx] * factors[idx]).reduce(
      (maxVal, currentVal) => Math.max(maxVal, currentVal),
      0
    );

  const calculateRequiredAdjustments = (currentThreshold, costs, factors, count) =>
    costs.reduce(
      (accumulator, currentCost, index) =>
        accumulator + Math.max(0, currentCost - Math.floor(currentThreshold / factors[index])),
      0
    );

  let upperBound = determineInitialUpperBound(itemCosts, factorValues, itemCount);
  let lowerBound = -1;

  while (upperBound - lowerBound > 1) {
    const midpointCandidate = Math.ceil((lowerBound + upperBound) / 2);
    const totalAdjustments = calculateRequiredAdjustments(
      midpointCandidate,
      itemCosts,
      factorValues,
      itemCount
    );

    if (totalAdjustments <= maxOperations) {
      upperBound = midpointCandidate;
    } else {
      lowerBound = midpointCandidate;
    }
  }

  console.log(upperBound);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
