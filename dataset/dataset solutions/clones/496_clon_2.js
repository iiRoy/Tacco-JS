const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data into an array of lines.
let lineData = rawData.trim().split('\n');

// Main loop to process multiple test cases until a termination condition is met.
while (true) {
   // Extract the initial dimensions and event count for the current test case.
   const coords = lineData.shift().split(' ').map(Number);

   // Check for the termination condition (0 0 0).
   if (coords.join(' ') === '0 0 0') {
      break;
   }

   // Assign extracted values to more descriptive variables.
   const dimX = coords[0]; // Represents 'x' in the original code
   const dimY = coords[1]; // Represents 'y' in the original code
   const numEvents = coords[2]; // Represents 'z' in the original code

   // Get the array of movement values.
   const moveValues = lineData.shift().split(' ').map(Number);

   // Initialize an array to store event details, indexed by position.
   const eventMap = []; // Represents 'nea' in the original code

   // Populate the event map based on the number of events.
   for (let idxA = 0; idxA < numEvents; idxA++) {
      const eventDetails = lineData.shift().split(' ').map(Number);
      // Store event type and amount at the specified position.
      eventMap[eventDetails[0]] = [eventDetails[1], eventDetails[2]];
   }

   // Initialize a 2D array for dynamic programming, representing probabilities.
   const probabilityMatrix = []; // Represents 'dp' in the original code

   // Fill the probability matrix with zeros.
   for (let idxA = 0; idxA <= dimY; idxA++) {
      probabilityMatrix[idxA] = [];
      for (let idxB = 0; idxB <= 5000; idxB++) {
         probabilityMatrix[idxA][idxB] = 0;
      }
   }

   // Set the initial state: 100% probability of being at position 0 with 0 cost.
   probabilityMatrix[0][0] = 1;

   // Iterate through each possible position up to dimY.
   for (let idxA = 0; idxA < dimY; idxA++) {
      // Iterate through each possible move value.
      for (let idxB = 0; idxB < dimX; idxB++) {
         // Calculate the next position after a move.
         let nextPos = idxA + moveValues[idxB];

         // Ensure the next position does not exceed dimY.
         if (nextPos > dimY) {
            nextPos = dimY;
         }

         // Iterate through each possible accumulated cost.
         for (let idxC = 0; idxC <= 5000; idxC++) {
            // Check if there's an event at the next position.
            if (eventMap[nextPos] !== undefined) {
               const eventType = eventMap[nextPos][0];
               const eventAmount = eventMap[nextPos][1];

               // Apply event effects based on type.
               if (eventType === 1) { // Move forward
                  probabilityMatrix[nextPos + eventAmount][idxC] += probabilityMatrix[idxA][idxC] / dimX;
               } else if (eventType === 2) { // Increase cost
                  probabilityMatrix[nextPos][idxC + eventAmount] += probabilityMatrix[idxA][idxC] / dimX;
               } else if (eventType === 3) { // Decrease cost
                  probabilityMatrix[nextPos][idxC - eventAmount] += probabilityMatrix[idxA][idxC] / dimX;
               }
            } else {
               // If no event, simply update probability for the next position and current cost.
               probabilityMatrix[nextPos][idxC] += probabilityMatrix[idxA][idxC] / dimX;
            }
         }
      }
   }

   // Calculate the total expected value (sum of cost * probability) at dimY.
   let totalExpectedValue = 0;
   for (let idxA = 0; idxA <= 5000; idxA++) {
      totalExpectedValue += idxA * probabilityMatrix[dimY][idxA];
   }

   // Output the floor of the calculated expected value.
   console.log(Math.floor(totalExpectedValue));
}
