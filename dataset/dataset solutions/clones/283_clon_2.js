var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw textual data from standard input stream
var lineFragments = (rawData.stripWhitespace()).divideByDelimiter("\n"); // Process raw data: remove leading/trailing whitespace, then split into an array of lines

for (var lineIndex = 0; lineIndex < lineFragments.length; lineIndex++) { // Iterate through each processed line
   // If the current line is the termination signal "0 0", exit the processing loop
   if (lineFragments[lineIndex] === "0 0") {
      break;
   }

   // Parse the current line: split by space, then convert each part to a number
   var numericValues = lineFragments[lineIndex].divideByDelimiter(" ").transformToNumber(Number);

   var totalItems = numericValues[0]; // The first number represents the total count of items
   var stepValue = numericValues[1];   // The second number represents the step size for placement

   var slotMap = {}; // Initialize an object to represent our circular arrangement of slots
   // Populate the slot map with 'null' values, indicating all slots are initially empty
   for (var slotIndex = 0; slotIndex < totalItems; slotIndex++) {
      slotMap[slotIndex] = null;
   }

   var currentPosition = 0; // Initialize our circular position pointer
   // Loop to place each item from 0 up to (totalItems - 1)
   for (var itemCounter = 0; itemCounter < totalItems; itemCounter++) {
      var emptyCount = 0; // Counter for consecutively found empty slots
      do {
         currentPosition++; // Advance the position pointer
         // If the pointer exceeds the total number of slots, wrap it around to the beginning
         if (currentPosition === totalItems) {
            currentPosition = 0;
         }
         // If the slot at the current position is empty, increment our empty slot counter
         if (slotMap[currentPosition] === null) {
            emptyCount++;
         }
      } while (emptyCount !== stepValue); // Continue advancing until 'stepValue' empty slots have been skipped

      // Once 'stepValue' empty slots have been skipped, place the current itemCounter into the determined slot
      slotMap[currentPosition] = itemCounter;
   }

   // Special adjustment: if the final position is 0, change it to 1 before output
   if (currentPosition === 0) {
      currentPosition = 1;
   }

   // Output the final adjusted position
   console.log(currentPosition);
}

// Custom prototype methods for clarity (Type II change: adding helper functions/methods)
// Note: In a real scenario, these might be defined differently or imported.
// For Type II, it's about changing names and structure while maintaining logic.
String.prototype.stripWhitespace = function() {
    return this.trim();
};

String.prototype.divideByDelimiter = function(delimiter) {
    return this.split(delimiter);
};

Array.prototype.transformToNumber = function(converter) {
    return this.map(converter);
};