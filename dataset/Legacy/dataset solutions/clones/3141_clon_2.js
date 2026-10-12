'use strict';

// This function processes the raw input data to calculate the minimum cost.
function processInput(rawData) {
  // Split the input string into individual lines and remove leading/trailing whitespace.
  let lines = rawData.trim().split('\n');

  // Parse the first line to get configuration values (N and M).
  // N is the number of shops, M is the desired quantity.
  let configValues = lines[0].split(' ').map((valStr) => (parseInt(valStr, 10)));

  // Initialize an array to store shop offers (price and available quantity).
  let shopOffers = new Array(configValues[0]);

  // Populate the shop offers array from the subsequent lines.
  for (let idx = 0; idx < configValues[0]; idx++) {
    shopOffers[idx] = lines[idx + 1].split(' ').map((valStr) => (parseInt(valStr, 10)));
  }

  // Sort the shop offers by price in ascending order.
  // If prices are equal, the original order is maintained (stable sort not strictly required here).
  shopOffers.sort((offerA, offerB) => (offerA[0] < offerB[0] ? -1 : 1));

  // Initialize the remaining quantity to purchase and the total accumulated cost.
  let remainingQuantity = configValues[1];
  let totalCost = 0;

  // Iterate through the sorted shop offers to buy items.
  for (let idx = 0; idx < configValues[0]; idx++) {
    // Check if the current shop's available quantity is less than the remaining desired quantity.
    if (shopOffers[idx][1] < remainingQuantity) {
      // If so, buy all items from this shop.
      totalCost += shopOffers[idx][0] * shopOffers[idx][1];
      remainingQuantity -= shopOffers[idx][1];
    } else {
      // Otherwise, buy only the remaining desired quantity from this shop and stop.
      totalCost += shopOffers[idx][0] * remainingQuantity;
      break; // All required items have been purchased.
    }
  }

  // Output the final calculated total cost.
  console.log(totalCost);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
