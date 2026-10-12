"use strict";

const processInput = (inputData) => {
  // Trim leading/trailing whitespace and split the input into lines.
  inputData = inputData.trim().split("\n");

  // Parse the individual cost and quantity values from the first line of input.
  const firstLineParts = inputData[0].split(" ");
  const costA = parseInt(firstLineParts[0]); // Cost of pizza A
  const costB = parseInt(firstLineParts[1]); // Cost of pizza B
  const costC = parseInt(firstLineParts[2]); // Cost of an AB-set (half)
  const countX = parseInt(firstLineParts[3]); // Desired quantity of pizza A
  const countY = parseInt(firstLineParts[4]); // Desired quantity of pizza B

  // Calculate the total cost of one complete AB set (two C pizzas).
  const costABSet = 2 * costC;

  // Evaluate if buying an AB set is more economical than purchasing A and B separately.
  if (costA + costB > costABSet) {
    // If the AB set offers a better price, calculate the total cost using different strategies.

    // Determine the price for the maximum number of full AB sets that can be purchased.
    let commonSetPrice = costABSet * Math.min(countX, countY);
    let remainingIndividualPrice = 0; // Initialize cost for any remaining individual pizzas.

    // Calculate the cost for any pizzas that cannot be covered by full AB sets.
    if (countX > countY) {
      remainingIndividualPrice = costA * (countX - countY); // Remaining A pizzas
    } else if (countY > countX) {
      remainingIndividualPrice = costB * (countY - countX); // Remaining B pizzas
    }

    // Calculate the total cost by combining full AB sets with individual remaining pizzas.
    let combinedPurchasePrice = commonSetPrice + remainingIndividualPrice;

    // Calculate the total cost if all pizzas were bought as AB sets,
    // even if it means buying more than needed for one type.
    let allSetPurchasePrice = costABSet * Math.max(countX, countY);

    // Output the minimum cost between the two strategies:
    // 1. Buying all as AB sets (potentially overbuying one type).
    // 2. Buying common parts as AB sets and remaining individually.
    console.log(Math.min(allSetPurchasePrice, combinedPurchasePrice));
  } else {
    // If buying A and B individually is cheaper or equal to an AB set,
    // then the most cost-effective approach is to buy all pizzas individually.
    console.log((costA * countX) + (costB * countY));
  }
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
