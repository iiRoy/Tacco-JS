const calculateCharges = (sourceData) => {
  const [overallQuantity, initialSegment, rateInitial, rateAdditional] = sourceData
    .split('\n')
    .map(Number);

  const finalCost = (initialSegment * rateInitial) + (overallQuantity * rateAdditional) - (initialSegment * rateAdditional);

  console.log(finalCost);
};

calculateCharges(require("fs").readFileSync("/dev/stdin", "utf8"));
