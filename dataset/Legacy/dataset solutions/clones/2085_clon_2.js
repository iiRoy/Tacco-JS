function ProcessInput(rawData) {
  // Split the entire input string into an array of lines.
  let lineArray = rawData.split("\n");

  // Extract the first line which contains the counts for items and offers.
  let initialConfigLine = lineArray.shift();

  // Parse the counts from the first line.
  let fridgeCount = parseInt(initialConfigLine.split(" ")[0]);
  let microwaveCount = parseInt(initialConfigLine.split(" ")[1]);
  let discountOfferCount = parseInt(initialConfigLine.split(" ")[2]);

  // Extract and parse the prices for all available fridges.
  let fridgePrices = lineArray
    .shift()
    .split(" ")
    .map(val => parseInt(val));

  // Extract and parse the prices for all available microwaves.
  let microwavePrices = lineArray
    .shift()
    .split(" ")
    .map(val => parseInt(val));

  // The remaining lines in the array represent the discount offers.
  let offerDetails = lineArray;

  // Calculate the minimum individual price for a fridge.
  let minFridgePrice = Math.min.apply(null, fridgePrices);
  // Calculate the minimum individual price for a microwave.
  let minMicrowavePrice = Math.min.apply(null, microwavePrices);

  // Determine the initial minimum total cost by summing the cheapest fridge and microwave.
  let initialMinCost = minFridgePrice + minMicrowavePrice;

  // This variable will store the lowest total cost found so far, initialized with the non-discounted minimum.
  let currentMinTotal = initialMinCost;

  // Iterate through each discount offer to check if it results in a lower total cost.
  offerDetails.forEach(offerString => {
    // Parse the components of the current discount offer: fridge index, microwave index, and discount amount.
    let offerParts = offerString.split(" ").map(val => parseInt(val));
    let fridgeIndex = offerParts[0]; // 1-based index for the fridge involved in the offer
    let microwaveIndex = offerParts[1]; // 1-based index for the microwave involved in the offer
    let discountAmount = offerParts[2]; // The monetary value of the discount

    // Calculate the total cost for this specific offer.
    // Adjust indices from 1-based to 0-based for array access.
    let calculatedCost = fridgePrices[fridgeIndex - 1] + microwavePrices[microwaveIndex - 1] - discountAmount;

    // If the calculated cost with this discount is lower than the current minimum total, update the minimum.
    if (currentMinTotal > calculatedCost) {
      currentMinTotal = calculatedCost;
    }
  });

  // Output the final minimum total cost found.
  console.log(currentMinTotal);
}

// This section handles reading input from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
