let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input data from standard input
const lineData = rawData.trim().split('\n'); // Split the input into an array of lines, trimming whitespace

while (true) { // Main loop to process multiple test cases
   // Extract the three main dimensions (X, Y, Z) for the current test case
   const coords = lineData.shift().split(' ').map(Number);

   // Check for the termination condition: "0 0 0"
   if (coords.join(' ') === '0 0 0') {
      break; // Exit the loop if the termination condition is met
   }

   const dimX = coords[0]; // Represents the number of movement options
   const dimY = coords[1]; // Represents the target position
   const numEvents = coords[2]; // Represents the count of special events

   // Extract the movement values for the current test case
   const moveValues = lineData.shift().split(' ').map(Number);

   // Initialize an array to store special event details, indexed by position
   const eventMap = [];

   // Populate the event map with event type and amount for each special event
   for (let idx1 = 0; idx1 < numEvents; idx1++) {
      const eventInfo = lineData.shift().split(' ').map(Number); // Read event position, type, and amount
      eventMap[eventInfo[0]] = [eventInfo[1], eventInfo[2]]; // Store event data
   }

   // Initialize the dynamic programming table (probability matrix)
   const probabilityMatrix = [];
   for (let idx1 = 0; idx1 <= dimY; idx1++) {
      probabilityMatrix[idx1] = []; // Create a new row for each position
      for (let idx2 = 0; idx2 <= 5000; idx2++) {
         probabilityMatrix[idx1][idx2] = 0; // Initialize all probabilities to zero
      }
   }

   // Set the base case: starting at position 0 with an accumulated value of 0 has 100% probability
   probabilityMatrix[0][0] = 1;

   // Iterate through positions from 0 up to dimY-1
   for (let idx1 = 0; idx1 < dimY; idx1++) {
      // Iterate through all possible accumulated values
      for (let idx3 = 0; idx3 <= 5000; idx3++) {
         // Iterate through each possible movement option
         for (let idx2 = 0; idx2 < dimX; idx2++) {
            // Calculate the next position, ensuring it doesn't exceed dimY
            const nextPos = Math.min(dimY, idx1 + moveValues[idx2]);

            // Check if there's a special event at the calculated next position
            if (eventMap[nextPos] !== undefined) {
               const eventType = eventMap[nextPos][0]; // Get the type of the event
               const eventAmount = eventMap[nextPos][1]; // Get the amount associated with the event

               // Apply event logic based on its type
               if (eventType === 1) { // Event Type 1: Move forward by eventAmount
                  probabilityMatrix[Math.min(dimY, nextPos + eventAmount)][idx3] += probabilityMatrix[idx1][idx3] / dimX;
               } else if (eventType === 2) { // Event Type 2: Increase accumulated value by eventAmount
                  probabilityMatrix[nextPos][Math.min(5000, idx3 + eventAmount)] += probabilityMatrix[idx1][idx3] / dimX;
               } else if (eventType === 3) { // Event Type 3: Decrease accumulated value by eventAmount
                  // Note: Math.min(0, idx3 - eventAmount) can result in negative indices if idx3 - eventAmount is negative.
                  // This behavior is preserved as per Type II cloning rules.
                  probabilityMatrix[nextPos][Math.min(0, idx3 - eventAmount)] += probabilityMatrix[idx1][idx3] / dimX;
               }
            } else {
               // If no special event, simply update the probability for the next position and current accumulated value
               probabilityMatrix[nextPos][idx3] += probabilityMatrix[idx1][idx3] / dimX;
            }
         }
      }
   }

   let totalExpectedValue = 0; // Variable to store the calculated expected value

   // Calculate the total expected value at the target position (dimY)
   for (let idx1 = 0; idx1 <= 5000; idx1++) {
      totalExpectedValue += idx1 * probabilityMatrix[dimY][idx1]; // Sum (value * probability)
   }

   // Output the floor of the total expected value
   console.log(Math.floor(totalExpectedValue));
}
