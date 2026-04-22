function acquireInput()
{  /* Obtains input from standard input stream. */ return require("fs").readFileSync("/dev/stdin", "utf8").trim(); }

/*
 * Data Transformation Modes:
 * 0: Return string as-is
 * 1: Convert string to integer
 * 2: Split string by space character
 * 3: Split string by newline character
 * 4: Split by space, then convert elements to numbers
 * 5: Split by newline, then convert elements to numbers
 * 6: Split string into individual characters
 * 7: Split into characters, then convert elements to numbers
 */
function transformContent ( inputString , conversionMode ) {
  switch (conversionMode) {
    case 0: return inputString;
    case 1: return Number.parseInt(inputString);
    case 2: return inputString.split(" ");
    case 3: return inputString.split("\n");
    case 4: return inputString.split(" ").map( (element) => Number(element) );
    case 5: return inputString.split("\n").map( (item) => Number(item) );
    case 6: return inputString.split("");
    case 7: return inputString.split("").map( (char) => Number(char) );
  }
}

function executeProgram ( rawData )
{
  // First, transform the entire input into an array of lines.
  rawData = transformContent(rawData, 3);

  // Extract initial parameters from the first line.
  const firstVal = transformContent(rawData[0], 4)[0];
  const secondVal = transformContent(rawData[0], 4)[1];
  const dealCount = transformContent(rawData[0], 4)[2];

  // Process the lists of item prices.
  const fridgePrices = transformContent(rawData[1], 4);
  const microwavePrices = transformContent(rawData[2], 4);

  // Remove the processed lines from the raw data.
  rawData.shift();
  rawData.shift();
  rawData.shift();

  // Determine the minimum price for each category without any deals.
  let minimumFridgePrice = Math.min(...fridgePrices);
  let minimumMicrowavePrice = Math.min(...microwavePrices);

  // Initialize the overall minimum cost with the sum of individual minimums.
  let overallMinimumCost = minimumFridgePrice + minimumMicrowavePrice;

  // Iterate through the available special deals.
  const numberOfDeals = rawData.length;
  for (let currentDealIndex = 0; currentDealIndex < numberOfDeals; ++currentDealIndex) {
    // Parse deal details: indices of items and the discount amount.
    let fridgeIndex = transformContent(rawData[currentDealIndex], 4)[0] - 1;
    let microwaveIndex = transformContent(rawData[currentDealIndex], 4)[1] - 1;
    let discountAmount = transformContent(rawData[currentDealIndex], 4)[2];

    // Calculate the cost of the current deal.
    let currentDealCost = fridgePrices[fridgeIndex] + microwavePrices[microwaveIndex] - discountAmount;

    // Update the overall minimum cost if this deal is cheaper.
    if (currentDealCost < overallMinimumCost) {
      overallMinimumCost = currentDealCost;
    }
  }
  // Output the final minimum cost.
  console.log(overallMinimumCost);
}

// Begin program execution by acquiring input and passing it to the main logic.
executeProgram(acquireInput());