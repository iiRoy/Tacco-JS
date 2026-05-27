function generatePermutations(elementCount) {
   // This array will store all generated permutations.
   let allPermutationsResult = [];
   // This array tracks the elements currently in the permutation being built.
   let currentPermutationPath = [];

   /**
    * Recursively generates permutations of the given array.
    * @param {Array<number>} availableElements - The elements still available to be added to the permutation.
    * @returns {Array<Array<number>>} The collection of all permutations.
    */
   const explorePermutations = function(availableElements) {
      let loopIterator, chosenElement;

      // Iterate through the available elements.
      for (loopIterator = 0; loopIterator < availableElements.length; loopIterator++) {
         // Remove the current element from the available set.
         chosenElement = availableElements.splice(loopIterator, 1)[0];
         // Add it to the current permutation path.
         currentPermutationPath.push(chosenElement);

         // If no elements are left, a complete permutation has been formed.
         if (availableElements.length === 0) {
            // Add a copy of the current permutation path to the results.
            allPermutationsResult.push(currentPermutationPath.slice());
         }

         // Recursively call the function with the remaining elements.
         explorePermutations(availableElements);

         // Backtrack: re-insert the element and remove it from the current path.
         availableElements.splice(loopIterator, 0, chosenElement);
         currentPermutationPath.pop();
      }
      return allPermutationsResult;
   };

   // Initialize an array with numbers from 0 to elementCount - 1.
   let initialNumericArray = [];
   for (let idxCounter = 0; idxCounter < elementCount; idxCounter++) {
      initialNumericArray.push(idxCounter);
   }

   // Start the permutation generation process.
   return explorePermutations(initialNumericArray);
}

// Read input from standard input.
let rawDataFromFile = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim whitespace and split into lines.
let processedLines = rawDataFromFile.trim().split('\n');

// Process input sets until a zero is encountered.
while (true) {
   // Get the number of items for the current set and convert to number.
   let currentNValue = processedLines.shift() - 0;
   if (currentNValue === 0) {
      break; // Exit loop if N is 0.
   }

   // Array to store task specifications.
   let taskSpecifications = [];
   for (let idxCounter = 0; idxCounter < currentNValue; idxCounter++) {
      taskSpecifications[idxCounter] = processedLines.shift().split(' ');
   }

   // Map task specifications to a more usable format: [name, weight, limit].
   taskSpecifications = taskSpecifications.map(taskEntry => [taskEntry[0], taskEntry[1] - 0, taskEntry[2] - 0]);

   // Generate all possible orderings (permutations) of task indices.
   let allPossibleOrders = generatePermutations(currentNValue);

   let highestWeightedAverage = 0;
   let optimalOrderIndices = ''; // Stores the indices of the optimal order.

   // Iterate through each possible task order.
   allPossibleOrders.forEach(currentOrder => {
      let isFeasible = true; // Flag to check if the current order is valid.
      let cumulativeWeight = 0; // Sum of weights for tasks processed so far.
      let cumulativeWeightedPosition = 0; // Sum of (weight * position).

      // Evaluate the current task order.
      currentOrder.forEach((taskIdx, orderPosition) => {
         // Check if the cumulative weight exceeds the limit for the current task.
         if (cumulativeWeight > taskSpecifications[taskIdx][2]) {
            isFeasible = false;
         }
         cumulativeWeight += taskSpecifications[taskIdx][1]; // Add current task's weight.
         cumulativeWeightedPosition += taskSpecifications[taskIdx][1] * (orderPosition + 1); // Calculate weighted position.
      });

      // If the order is feasible and yields a better weighted average, update the maximum.
      if (isFeasible && cumulativeWeightedPosition / cumulativeWeight > highestWeightedAverage) {
         highestWeightedAverage = cumulativeWeightedPosition / cumulativeWeight;
         optimalOrderIndices = currentOrder; // Store the indices of this optimal order.
      }
   });

   // Output the names of the tasks in the optimal order, reversed and joined by newlines.
   console.log(optimalOrderIndices.map(finalTaskIndex => taskSpecifications[finalTaskIndex][0]).reverse().join('\n'));
}
