// Function to determine the maximum value obtainable by purchasing a target number of units
function calculateOptimalPurchase(rawInputData) {
  // Split the raw input string into individual lines for processing
  const dataLines = rawInputData.split('\n');

  // Parse the primary parameters from the first line of input.
  // totalUnitsRequired: The total number of units we need to acquire (originally 'N').
  // specialOfferCount: The count of additional special offers beyond the initial set (originally 'M').
  const firstLineParts = dataLines[0].split(' ').map(Number);
  const totalUnitsRequired = firstLineParts[0];
  const specialOfferCount = firstLineParts[1];

  // Initialize an array to store all available purchase opportunities.
  // Each opportunity will be represented as an object with 'quantity' and 'pricePerUnit'.
  const availablePurchaseOptions = [];

  // Process the initial 'N' single-unit purchase options from the second line.
  // These are standard items, where each unit has its own specific price.
  const initialUnitPrices = dataLines[1].split(' ').map(Number);
  for (let unitIndex = 0; unitIndex < totalUnitsRequired; unitIndex++) {
    // Add each initial item as a deal of 1 unit at its specific price.
    availablePurchaseOptions.push({
      quantity: 1,
      pricePerUnit: initialUnitPrices[unitIndex]
    });
  }

  // Process the 'M' special offers from subsequent lines (starting from dataLines[2]).
  // Each special offer provides a specific 'offerQuantity' at a given 'offerPrice' per unit.
  for (let offerIndex = 0; offerIndex < specialOfferCount; offerIndex++) {
    const currentOfferDetails = dataLines[offerIndex + 2].split(' ').map(Number);
    const offerQuantity = currentOfferDetails[0];
    const offerPrice = currentOfferDetails[1];
    // Add this special offer to our comprehensive list of options.
    availablePurchaseOptions.push({
      quantity: offerQuantity,
      pricePerUnit: offerPrice
    });
  }

  // Sort all available purchase options in descending order based on their price per unit.
  // This greedy strategy ensures we prioritize acquiring the most expensive items first to maximize the total value.
  availablePurchaseOptions.sort((optionA, optionB) => {
    // A positive result means optionB's pricePerUnit is higher, so optionB comes first.
    return optionB.pricePerUnit - optionA.pricePerUnit;
  });

  // Variables to keep track of the total accumulated value and the number of units purchased so far.
  let accumulatedValue = 0;
  let unitsObtained = 0;

  // Iterate through the sorted purchase options to acquire the required units.
  // The loop continues as long as we haven't obtained all 'totalUnitsRequired' units.
  for (const currentOption of availablePurchaseOptions) {
    // Early exit condition: If we have already acquired all necessary units, break the loop.
    if (unitsObtained >= totalUnitsRequired) {
      break;
    }

    // Determine how many units from the current option we can actually purchase.
    // This is the minimum of:
    // 1. The quantity available in the current option.
    // 2. The remaining number of units still needed to reach 'totalUnitsRequired'.
    const unitsToPurchaseFromThisOption = Math.min(
      currentOption.quantity,
      totalUnitsRequired - unitsObtained
    );

    // If we can take any units from this option (i.e., 'unitsToPurchaseFromThisOption' is greater than 0),
    // add their value to the total and update the count of units obtained.
    if (unitsToPurchaseFromThisOption > 0) {
      accumulatedValue += unitsToPurchaseFromThisOption * currentOption.pricePerUnit;
      unitsObtained += unitsToPurchaseFromThisOption;
    }
  }

  // Output the final calculated maximum value to standard output.
  console.log(String(accumulatedValue));
}

// Standard competitive programming input handling:
// Reads the entire input from standard input (/dev/stdin) as a UTF-8 string
// and passes it to the main processing function.
calculateOptimalPurchase(require("fs").readFileSync("/dev/stdin", "utf8"));