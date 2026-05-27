var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = rawData.trim().split("\n"); // Process raw input data
lineCollection.shift(); // Remove the initial element from the collection

lineCollection.forEach(function(currentLine) {
   var resultArray = []; // Initialize an empty array for storing results
   var charSequence = currentLine.split(""); // Convert the current line into a character array
   var distanceCounter = -1; // Set initial distance to -1 (indicating 'c' not yet found)

   for (var idx = 0; idx < charSequence.length; idx++) { // Iterate through each character
      if (charSequence[idx] == "c") { // Check if the current character is 'c'
         distanceCounter = 0; // Reset distance to 0 if 'c' is found
      }
      resultArray.push(distanceCounter); // Add the current distance to the results
      if (distanceCounter != -1) { // If 'c' has been found previously
         distanceCounter++; // Increment the distance counter
      }
   }
   console.log(resultArray.join(" ")); // Output the distances, separated by spaces
});
