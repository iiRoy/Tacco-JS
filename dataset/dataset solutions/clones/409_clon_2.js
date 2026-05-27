var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineData = rawData.trim().split("\n");

// Main processing loop
while (true) {
   // Extract the number of items for the current test case
   var itemCount = lineData.shift() - 0;

   // If itemCount is 0, terminate the program
   if (itemCount === 0) break;

   // Array to store details of each item: [name, value, weight_limit]
   var itemDetails = [];

   // Populate itemDetails from the input lines
   for (var idx = 0; idx < itemCount; idx++) {
      itemDetails[idx] = lineData.shift().split(" ");
   }

   // Convert numeric parts of item details to actual numbers
   itemDetails = itemDetails.map(entry => [entry[0], entry[1] - 0, entry[2] - 0]);

   // Sort items by their value in descending order
   itemDetails.sort((firstItem, secondItem) => {
      return secondItem[1] - firstItem[1];
   });

   // Variables to track the best combination found
   var bestRatio = 0;
   var resultSequence = "";

   // Recursive function to explore all possible combinations
   var exploreCombinations = function (currentPath, remainingIndices, currentWeight, currentScore) {
      // Base case: if no more items to consider
      if (remainingIndices.length === 0) {
         // Check if the current combination yields a better ratio
         if (bestRatio < currentScore / currentWeight) {
            resultSequence = currentPath;
            bestRatio = currentScore / currentWeight;
         }
         return;
      }

      // Iterate through the available items
      for (var idx = 0; idx < remainingIndices.length; idx++) {
         var currentIndex = remainingIndices[idx];
         // Check if adding the current item exceeds its weight limit
         if (currentWeight <= itemDetails[currentIndex][2]) {
            // Construct the path for the next recursive call
            var nextPath = currentPath + currentIndex;
            // Filter out the current item from the remaining indices
            var filteredIndices = remainingIndices.filter(itemIdx => currentIndex !== itemIdx);
            // Recursively call with updated parameters
            exploreCombinations(
               nextPath,
               filteredIndices,
               currentWeight + itemDetails[currentIndex][1],
               currentScore + itemDetails[currentIndex][1] * (currentPath.length + 1)
            );
         }
      }
   };

   // Initialize an array with all item indices
   var initialIndices = [];
   for (var idx = 0; idx < itemCount; idx++) {
      initialIndices.push(idx);
   }

   // Start the recursive exploration
   exploreCombinations("", initialIndices, 0, 0);

   // Output the names of the items in the best sequence, reversed and joined by newlines
   console.log(resultSequence.split("").map(charIdx => itemDetails[charIdx - 0][0]).reverse().join("\n"));
}
