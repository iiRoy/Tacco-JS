const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

const parseInputValues = (inputString) => {
  const trimmedString = inputString.trim();
  const stringValues = trimmedString.split(' ');
  const numericValues = stringValues.map(Number);
  return numericValues;
};

const calculateMinimumCost = (rawInputData) => {
  const [priceA, priceB, priceC, quantityX, quantityY] = parseInputValues(rawInputData);

  // Strategy 1: Purchase all A pizzas and all B pizzas individually.
  const costOptionOne = priceA * quantityX + priceB * quantityY;

  // Strategy 2: Purchase enough AB pizzas to cover the larger of X or Y,
  // effectively buying more than needed for the smaller quantity.
  const largerQuantity = Math.max(quantityX, quantityY);
  const costOptionTwo = priceC * largerQuantity * 2; // Each AB pizza provides one A and one B.

  // Strategy 3: Purchase AB pizzas for the common quantity, then buy
  // any remaining A or B pizzas individually.
  const commonQuantity = Math.min(quantityX, quantityY);
  const remainingX = Math.max(0, quantityX - commonQuantity);
  const remainingY = Math.max(0, quantityY - commonQuantity);

  const costForCommonAB = priceC * commonQuantity * 2;
  const costForRemainingA = priceA * remainingX;
  const costForRemainingB = priceB * remainingY;

  const costOptionThree = costForCommonAB + costForRemainingA + costForRemainingB;

  // Determine the lowest cost among the three strategies.
  const finalLowestCost = Math.min(costOptionOne, costOptionTwo, costOptionThree);

  console.log(finalLowestCost);
};

calculateMinimumCost(fileContent);
