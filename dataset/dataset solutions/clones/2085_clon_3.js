const fs = require("fs");

function splitNumbersKeepingOriginalBehavior(lineText) {
  return lineText.split(" ").map(value => parseInt(value));
}

function readProblemData(rawInput) {
  const remainingLines = rawInput.split("\n");

  const firstLine = remainingLines.shift();
  const configValues = splitNumbersKeepingOriginalBehavior(firstLine);

  const refrigeratorCount = configValues[0];
  const electronicsCount = configValues[1];
  const couponCount = configValues[2];

  const refrigeratorPrices = splitNumbersKeepingOriginalBehavior(remainingLines.shift());
  const electronicsPrices = splitNumbersKeepingOriginalBehavior(remainingLines.shift());

  return {
    refrigeratorCount,
    electronicsCount,
    couponCount,
    refrigeratorPrices,
    electronicsPrices,
    couponLines: remainingLines
  };
}

function getSmallestValue(values) {
  return Math.min.apply(null, values);
}

function calculateBaseMinimumCost(refrigeratorPrices, electronicsPrices) {
  const cheapestRefrigerator = getSmallestValue(refrigeratorPrices);
  const cheapestElectronic = getSmallestValue(electronicsPrices);

  return cheapestRefrigerator + cheapestElectronic;
}

function calculateCouponCost(couponLine, refrigeratorPrices, electronicsPrices) {
  const couponParts = splitNumbersKeepingOriginalBehavior(couponLine);

  const refrigeratorIndex = couponParts[0] - 1;
  const electronicsIndex = couponParts[1] - 1;
  const discountAmount = couponParts[2];

  return refrigeratorPrices[refrigeratorIndex] + electronicsPrices[electronicsIndex] - discountAmount;
}

function findMinimumCostWithCoupons(problemData) {
  let bestCost = calculateBaseMinimumCost(
    problemData.refrigeratorPrices,
    problemData.electronicsPrices
  );

  for (const couponLine of problemData.couponLines) {
    const discountedCost = calculateCouponCost(
      couponLine,
      problemData.refrigeratorPrices,
      problemData.electronicsPrices
    );

    if (bestCost > discountedCost) {
      bestCost = discountedCost;
    }
  }

  return bestCost;
}

function Main(input) {
  const problemData = readProblemData(input);
  const answer = findMinimumCostWithCoupons(problemData);

  console.log(answer);
}

Main(fs.readFileSync("/dev/stdin", "utf8"));