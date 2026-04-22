const retrieveInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const parseNumericSequence = (textualData) => textualData.split(" ").map(Number);
const outputFinalValue = (outcome) => console.log(outcome);

const processApplicationLogic = (allInputLines) => {
  let linePointer = 0;

  const getNextDataLine = () => {
    if (linePointer >= allInputLines.length) {
      throw new Error("Data stream exhausted: no further input lines are available.");
    }
    return allInputLines[linePointer++];
  };

  const initialParameters = parseNumericSequence(getNextDataLine());
  // const itemTypeACount = initialParameters[0]; // These variables are not utilized in the original calculation logic.
  // const itemTypeBCount = initialParameters[1];
  const numberOfPromotions = initialParameters[2];

  const categoryAPrices = parseNumericSequence(getNextDataLine());
  const categoryBPrices = parseNumericSequence(getNextDataLine());

  const initialMinimumCost = Math.min(...categoryAPrices) + Math.min(...categoryBPrices);

  const promotionDetails = Array.from({ length: numberOfPromotions }, getNextDataLine);

  const ultimateLowestCost = promotionDetails.reduce((currentMinPrice, currentPromotionLine) => {
    const [itemA_identifier, itemB_identifier, discountValue] = parseNumericSequence(currentPromotionLine);
    const calculatedPromotionPrice = categoryAPrices[itemA_identifier - 1] + categoryBPrices[itemB_identifier - 1] - discountValue;
    return Math.min(currentMinPrice, calculatedPromotionPrice);
  }, initialMinimumCost);

  outputFinalValue(ultimateLowestCost);
};

processApplicationLogic(retrieveInputContent);