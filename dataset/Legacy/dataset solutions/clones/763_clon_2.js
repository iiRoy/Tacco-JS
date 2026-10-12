var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lines = rawData.trim().split("\n"); // Split input into an array of lines, removing leading/trailing whitespace

while (true) {
   // Process each test case
   var count = parseInt(lines.shift(), 10); // Get the number of elements for this case, convert to integer
   if (count === 0) {
      // If count is 0, it's the end of input
      break;
   }

   var elements = lines.shift().split(" "); // Get the elements for this case, split by space
   var foundWinner = false; // Flag to track if a winner is found in the current test case
   var elementCounts = {}; // Object to store counts of each element

   // Iterate through the elements to find a potential winner
   for (var idx = 0; idx < count; idx++) {
      // Increment count for the current element
      elementCounts[elements[idx]] = (elementCounts[elements[idx]] || 0) + 1;

      var sortedCounts = []; // Array to hold [count, element] pairs for sorting
      for (var keyVal in elementCounts) {
         // Populate the array with counts and elements
         sortedCounts.push([elementCounts[keyVal], keyVal]);
      }

      // Sort the elements by their counts in ascending order
      sortedCounts.sort(function(itemA, itemB) {
         return itemA[0] - itemB[0];
      });

      var remainingItems = count - (idx + 1); // Calculate how many items are left to process

      // Handle the case where there's only one unique element type
      if (sortedCounts.length === 1) {
         // Add a dummy second element with count 0 to simplify comparison logic
         sortedCounts[1] = [0];
      }

      // If the top two counts are equal, no clear leader yet, continue
      if (sortedCounts[0][0] === sortedCounts[1][0]) {
         continue;
      }

      // Check if the leading element's count is greater than the second leading
      // plus all remaining items. If so, it's an undeniable winner.
      if (sortedCounts[0][0] > sortedCounts[1][0] + remainingItems) {
         console.log(sortedCounts[0][1] + " " + (idx + 1)); // Output winner and step count
         foundWinner = true; // Set flag to true
         break; // Exit the loop for this test case
      }
   }

   // If no winner was found after processing all elements
   if (foundWinner === false) {
      console.log("TIE"); // Output "TIE"
   }
}
