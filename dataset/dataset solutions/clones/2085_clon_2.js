// This main procedure handles all incoming text content.
function ProcessInput(sourceData) {
  sourceData = sourceData.split("\n"); // Decompose the raw text into individual lines.
  
  // Extract initial configuration parameters from the first line.
  let initialParamsString = sourceData.shift(); 
  let paramA = parseInt(initialParamsString.split(" ")[0]);
  let paramB = parseInt(initialParamsString.split(" ")[1]);
  let paramM = parseInt(initialParamsString.split(" ")[2]);

  // Parse the list of prices for the first category of items.
  const itemPrices = sourceData
    .shift()
    .split(" ")
    .map(itemStr => parseInt(itemStr));

  // Parse the list of prices for the second category of items.
  const addonPrices = sourceData
    .shift()
    .split(" ")
    .map(itemStr => parseInt(itemStr));

  // The remaining lines represent the discount rules.
  const discountRules = sourceData;

  // Determine the lowest price in each category.
  let lowestFirstPrice = Math.min.apply(null, itemPrices);
  let lowestSecondPrice = Math.min.apply(null, addonPrices);

  // Calculate the base minimum cost without any specific discounts.
  let initialLowestSum = lowestFirstPrice + lowestSecondPrice;
  let overallMinimum = initialLowestSum; // Initialize the overall minimum with the base sum.

  // Iterate through each discount rule to potentially find a lower total cost.
  discountRules.forEach(discountEntry => {
    let parsedRule = discountEntry.split(" ").map(valStr => parseInt(valStr));
    let itemIndex = parsedRule[0];
    let addonIndex = parsedRule[1];
    let reductionValue = parsedRule[2];

    // Calculate the cost for this specific item and addon combination with its discount.
    let potentialMinimum = itemPrices[itemIndex - 1] + addonPrices[addonIndex - 1] - reductionValue;

    // Update the overall minimum if this combination yields a lower cost.
    if (overallMinimum > potentialMinimum) {
      overallMinimum = potentialMinimum;
    }
  });

  // Output the final lowest calculated cost.
  console.log(overallMinimum);
}

// Do not modify the following section (it handles reading input and invoking the primary function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));