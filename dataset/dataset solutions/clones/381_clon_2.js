// Retrieve raw data from the standard input source
let sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Prepare the input by cleaning trailing newlines and segmenting into individual lines
let lineData = (sourceContent.replace(/\n$/, "")).split("\n");

// Extract the total number of processing iterations from the first line of data
let operationCount = parseInt(lineData.shift(), 10);

// Begin the main processing loop for each operation
for (let loopIndex = 0; loopIndex < operationCount; loopIndex++) {
   // Parse the current line of data, splitting by space and converting elements to integers
   let numericValues = lineData[loopIndex].split(" ").map(val => parseInt(val, 10));

   // Assign the starting and ending points for sequence generation
   let currentPosition = numericValues[0];
   let targetPosition = numericValues[1];

   // Initialize the sequence array with the starting position
   let generatedPath = [currentPosition];

   // Set the initial direction for movement within the sequence
   let stepModifier = 1;

   // Logic Branch 1: If the current position is less than the target, increment until target is reached
   if (currentPosition < targetPosition) {
      do {
         currentPosition++;
         generatedPath.push(currentPosition);
      } while (currentPosition !== targetPosition);
   }
   // Logic Branch 2: If current position is greater than target and within a lower range, decrement
   else if (currentPosition > targetPosition && currentPosition <= 5) {
      do {
         currentPosition--;
         generatedPath.push(currentPosition);
      } while (currentPosition !== targetPosition);
   }
   // Logic Branch 3: If both positions are in a higher range and current is greater, increment with a wrap-around
   else if (currentPosition > targetPosition && currentPosition >= 6 && targetPosition >= 6) {
      do {
         currentPosition++;
         if (currentPosition === 10) {
            currentPosition = 5; // Wrap-around from 10 to 5
         }
         generatedPath.push(currentPosition);
      } while (currentPosition !== targetPosition);
   }
   // Logic Branch 4: If current position is high and target is low, adjust direction on wrap-around
   else if (currentPosition > targetPosition && currentPosition >= 6 && targetPosition <= 5) {
      do {
         currentPosition += stepModifier;
         if (currentPosition === 10) {
            currentPosition = 5;
            stepModifier = -1; // Reverse direction after hitting 10 and resetting to 5
         }
         generatedPath.push(currentPosition);
      } while (currentPosition !== targetPosition);
   }

   // Display the generated sequence, with elements joined by spaces
   console.log(generatedPath.join(" "));
}