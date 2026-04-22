var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input
var lineArray = dataSource.trim().split("\n"); // Process raw input into an array of lines

var mainString = lineArray[0]; // Extract the primary string for searching
var patternString = lineArray[1]; // Extract the pattern string to find

// Begin the search for the pattern within the main string
for ( var outerIndex = 0 ; outerIndex < mainString.length ; outerIndex++ ) {
   var matchFound = true; // Assume a match initially for the current outerIndex position

   // Compare characters from the main string with the pattern string
   for ( var innerIndex = 0 ; innerIndex < patternString.length ; innerIndex++ ) {
      // If a character mismatch is found, this is not a match
      if ( mainString[outerIndex + innerIndex] !== patternString[innerIndex] ) {
         matchFound = false; // Set flag to indicate no match
         break; // No need to check further characters for this outerIndex, exit inner loop
      }
   }

   // If matchFound is still true after the inner loop, it means the pattern was found
   if ( matchFound ) {
      console.log(outerIndex); // Output the starting position of the successful match
   }
}