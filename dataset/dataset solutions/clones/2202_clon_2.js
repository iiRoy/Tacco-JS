'use strict'

function ProcessInput(sourceText) {
  // Normalize and split the raw input string into lines
  sourceText = sourceText.trim().split('\n');

  // Extract the first line containing main parameters
  const mainParameters = sourceText[0].split(' ').map(strValue => parseInt(strValue));
  
  // Get all subsequent lines for item details
  const detailEntries = sourceText.slice(1);

  // Assign problem-specific variables from the main parameters
  const maximumTarget = mainParameters[0];
  const numberOfItems = mainParameters[1];

  // Initialize an array to store details of each item
  const itemRecords = [];
  
  // Iterate through the detail entries to populate itemRecords
  for (let lineIdx = 0; lineIdx < detailEntries.length; ++lineIdx) {
    const currentItemDetails = detailEntries[lineIdx].split(' ').map(strValue => parseInt(strValue));
    itemRecords.push({ powerRating: currentItemDetails[0], manaCost: currentItemDetails[1] });
  }

  // Initialize a dynamic programming table with a slightly different size and fill with zero
  let minimumCosts = Array(10000).fill(0);

  // Main DP loop to calculate minimum costs
  for (let itemIndex = 0; itemIndex < numberOfItems; ++itemIndex) {
    for (let currentLevel = itemRecords[itemIndex].powerRating; currentLevel <= maximumTarget; ++currentLevel) {
      // Check if a previous cost exists for the current level
      if (minimumCosts[currentLevel] !== 0) {
        // Update with the minimum of existing cost or new calculated cost
        minimumCosts[currentLevel] = Math.min(minimumCosts[currentLevel], minimumCosts[currentLevel - itemRecords[itemIndex].powerRating] + itemRecords[itemIndex].manaCost);
      } else {
        // If no previous cost, set it to the new calculated cost
        minimumCosts[currentLevel] = minimumCosts[currentLevel - itemRecords[itemIndex].powerRating] + itemRecords[itemIndex].manaCost;
      }
      
    }
  }

  // Output the final result
  console.log(minimumCosts[maximumTarget]);
  
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));