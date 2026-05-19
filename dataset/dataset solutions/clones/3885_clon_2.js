"use strict";

// This function processes the input string to determine the minimum cost.
const processInput = (inputString) => {
  // Parse the numerical values from the first line of the input.
  let numberTokens = inputString.split("\n")[0].split(" ");

  // Extract and convert individual item costs and quantities to numbers.
  let costA = numberTokens[0] * 1;
  let costB = numberTokens[1] * 1;
  let costAB = numberTokens[2] * 1; // Cost for a combined set of A and B
  let countA = numberTokens[3] * 1;
  let countB = numberTokens[4] * 1;

  let finalResult = 0; // Initialize the variable to store the calculated minimum total cost.

  // Calculate the average cost if buying A and B individually.
  let averageIndividualCost = (costA + costB) / 2;

  // Determine if buying the combined AB set is more cost-effective than buying A and B separately.
  let isCombinedCheaper = (averageIndividualCost > costAB);

  // Find the smaller quantity between item A and item B.
  let minCount = countA > countB ? countB : countA;

  // Calculate the remaining quantity of the item that has more units.
  let remainingCount = countA > countB ? countA - countB : countB - countA;

  // Identify the price of the item type that has the remaining quantity.
  let priceOfRemainingType = countA > countB ? costA : costB;

  // Calculate the cost for the remaining items. This involves checking if it's cheaper
  // to buy these remaining items as individual units or as combined AB sets (if applicable).
  let remainingCost = (priceOfRemainingType / 2) > costAB ? costAB * remainingCount * 2 : remainingCount * priceOfRemainingType;

  // Apply the core logic to determine the total minimum cost.
  if (isCombinedCheaper) {
    // If the combined AB set is cheaper, calculate the cost for the common quantity
    // using the combined price, then add the cost for the remaining items.
    finalResult = costAB * minCount * 2 + remainingCost;
  } else {
    // If individual items are cheaper or equal, calculate the total cost by buying all items individually.
    finalResult = costA * countA + costB * countB;
  }

  // Output the final computed minimum cost to the console.
  console.log(finalResult);
};

// Read the entire content of standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
