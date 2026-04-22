((inputPayload) => {
  const decomposeInput = (rawData) => {
    return rawData.trim().split(/\s+/).map(Number);
  };

  const [valueAlpha, valueBeta, valueCombinedHalf, neededAlpha, neededBeta] = decomposeInput(inputPayload);

  const determineSummation = (vA, vB, nA, nB) => vA * nA + vB * nB;

  const determineHybridSum = (vA, vB, vCH, nA, nB) => {
    const combinedFullPrice = vCH * 2;
    const unitsBoughtAsCombined = Math.min(nA, nB);
    const leftOverAlpha = Math.max(0, nA - unitsBoughtAsCombined);
    const leftOverBeta = Math.max(0, nB - unitsBoughtAsCombined);
    return combinedFullPrice * unitsBoughtAsCombined + vA * leftOverAlpha + vB * leftOverBeta;
  };

  const determineBulkSum = (vCH, nA, nB) => {
    const combinedFullPrice = vCH * 2;
    return combinedFullPrice * Math.max(nA, nB);
  };

  const candidateTotals = [
    determineSummation(valueAlpha, valueBeta, neededAlpha, neededBeta),
    determineHybridSum(valueAlpha, valueBeta, valueCombinedHalf, neededAlpha, neededBeta),
    determineBulkSum(valueCombinedHalf, neededAlpha, neededBeta)
  ];

  console.log(Math.min(...candidateTotals));
})(require("fs").readFileSync("/dev/stdin", "utf8"));