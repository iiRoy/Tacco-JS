let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8'); // Acquire input content from standard input source

let processedLines = rawData
  .trim() // Remove leading/trailing whitespace
  .split("\n"); // Divide content into an array of lines

while (true) { /* Begin main processing cycle */

   let currentItemCount = processedLines.shift() - 0; // Retrieve the first line, convert to numeric value

   if (currentItemCount === 0) { // Check for termination condition
      break; // Exit the loop if the count is zero
   }

   let itemTokens = processedLines.shift()
      .split(" "); // Get the next line, split it by spaces into an array of tokens

   let resultDetermined = false; // Initialize a boolean flag to track if a clear outcome is found

   let itemFrequencies = {}; // Create an empty object to store the frequency of each distinct item

   for (let tokenIndex = 0; tokenIndex < currentItemCount; tokenIndex++) { /* Iterate through each item token */

      let currentItemIdentifier = itemTokens[tokenIndex]; // Get the identifier for the current item
      itemFrequencies[currentItemIdentifier] = (itemFrequencies[currentItemIdentifier] || 0) + 1; // Increment its frequency count

      let sortedFrequencies = []; // Prepare an array to hold frequency data for sorting

      for (let keyName in itemFrequencies) {
         sortedFrequencies.push([itemFrequencies[keyName], keyName]); // Populate with [count, item_name] pairs
      }

      sortedFrequencies.sort(function(firstEntry, secondEntry) { // Sort the frequency entries
         // Custom comparison function for descending order by count
         if (firstEntry[0] < secondEntry[0]) return 1;
         if (firstEntry[0] > secondEntry[0]) return -1;
         return 0;
      });

      let itemsLeft = itemTokens.length - (tokenIndex + 1); // Calculate the number of items yet to be processed

      if (sortedFrequencies.length === 1) { // If there's only one unique item
         sortedFrequencies.push([0, ""]); // Add a dummy entry with zero count for comparison
      }

      if (sortedFrequencies[0][0] === sortedFrequencies[1][0]) { // If the top two frequencies are identical
         continue; // Move to the next item token without determining a winner
      }

      if (sortedFrequencies[0][0] > sortedFrequencies[1][0] + itemsLeft) { // Check if the leading item has an insurmountable lead
         console.log(sortedFrequencies[0][1], tokenIndex + 1); // Output the winning item and the current step number
         resultDetermined = true; // Set the flag indicating a winner has been found
         break; // Exit the inner loop as the outcome is decided
      }
   }

   if (!resultDetermined) { // If no clear winner was determined after processing all items
      console.log("TIE"); // Output "TIE"
   }
}