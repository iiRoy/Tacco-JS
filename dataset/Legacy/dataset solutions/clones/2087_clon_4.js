const acquireInputContent = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const parseLines = (text) => text.split("\n");
const parseNumericSequence = (text) => text.split(" ").map(Number);

const processPurchaseOptimization = (rawInputContent) => {
  const allInputLines = parseLines(rawInputContent);

  const [
    configLine,
    categoryAPricesLine,
    categoryBPricesLine,
    ...discountOfferLines
  ] = allInputLines;

  const [categoryAItemCount, categoryBItemCount, numberOfDeals] = parseNumericSequence(configLine);

  const pricesForCategoryA = parseNumericSequence(categoryAPricesLine);

  const pricesForCategoryB = parseNumericSequence(categoryBPricesLine);

  const minPriceCategoryA = Math.min(...pricesForCategoryA);
  const minPriceCategoryB = Math.min(...pricesForCategoryB);
  let currentMinimumCost = minPriceCategoryA + minPriceCategoryB;

  currentMinimumCost = discountOfferLines.reduce((accumulator, offerLine) => {
    const [offerIndexA, offerIndexB, discountAmount] = parseNumericSequence(offerLine);

    const calculatedOfferCost =
      pricesForCategoryA[offerIndexA - 1] +
      pricesForCategoryB[offerIndexB - 1] -
      discountAmount;

    return Math.min(accumulator, calculatedOfferCost);
  }, currentMinimumCost);

  console.log(currentMinimumCost);
};

processPurchaseOptimization(acquireInputContent());
