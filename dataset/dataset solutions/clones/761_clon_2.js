var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
var lineData = rawData.trim().split("\n"); // Process raw data into an array of lines, removing extra whitespace

while (true) { // Begin an indefinite processing loop
   var entryCount = lineData.shift() - 0; // Extract the first number from the line data, converting it to a numeric type
   if (entryCount === 0) { // Check if the extracted number signifies termination
      break; // Exit the loop if the number is zero
   }

   var currentEntries = lineData.shift().split(" "); // Retrieve the next line of data and split it into individual entries
   var foundWinner = false; // Initialize a flag to indicate if a clear winner has been determined
   var tallyMap = {}; // Create an empty object to store the frequency of each entry

   // Iterate through each entry in the current set of entries
   for (var idx = 0; idx < entryCount; idx++) {
      // Increment the count for the current entry in the tally map.
      // If the entry is encountered for the first time, initialize its count to 1.
      tallyMap[currentEntries[idx]] = (tallyMap[currentEntries[idx]] || 0) + 1;

      var sortedCounts = []; // Prepare an array to hold count-value pairs for sorting
      // Populate the sortedCounts array with data from the tally map
      for (var keyVal in tallyMap) {
         sortedCounts.push([tallyMap[keyVal], keyVal]);
      }

      // Sort the collected counts in descending order based on their numeric value
      sortedCounts.sort(function(itemA, itemB) {
         return itemA[0] < itemB[0]; // Comparison function for descending order
      });

      var remainingItems = currentEntries.length - (idx + 1); // Calculate how many items are left to be processed

      // If there's only one unique item counted so far, add a placeholder for the second item's count
      if (sortedCounts.length === 1) {
         sortedCounts[1] = [0]; // Assign a count of zero to a non-existent second item
      }

      // If the top two counts are identical, no definitive leader exists yet
      if (sortedCounts[0][0] === sortedCounts[1][0]) {
         continue; // Proceed to the next entry without declaring a winner
      }

      // Determine if the leading item's count is sufficiently high to guarantee a win
      // (i.e., its count is greater than the second item's count plus all remaining items)
      if (sortedCounts[0][0] > sortedCounts[1][0] + remainingItems) {
         console.log(sortedCounts[0][1], idx + 1); // Output the winning entry and the current processing step
         foundWinner = true; // Set the flag to true as a winner has been identified
         break; // Terminate the inner loop since a winner is found
      }
   }

   // After processing all entries for the current set, if no winner was found
   if (foundWinner === false) {
      console.log("TIE"); // Indicate that the result is a tie
   }
}
