function checkCondition(targetValue) {
   // Initialize a status indicator, assuming valid initially
   let isValid = true;
   // Counter for segments formed
   let segmentCount = 0;
   // Accumulator for current segment sum
   let currentSum = 0;

   // Iterate through the global data array
   for (let idx = 0; idx < dataArray.length; idx++) {
      // If the current element alone exceeds the target, it's impossible
      if (targetValue < dataArray[idx]) {
         isValid = false; // Mark as invalid
         break;           // Exit loop early
      } else if (currentSum + dataArray[idx] === targetValue) {
         // If adding current element exactly matches target, start a new segment
         currentSum = 0; // Reset sum for the next segment
         segmentCount++; // Increment segment count
      } else if (currentSum + dataArray[idx] > targetValue) {
         // If adding current element exceeds target, current element starts a new segment
         currentSum = dataArray[idx]; // Current element becomes the start of a new sum
         segmentCount++;              // Increment segment count
      } else { // currentSum + dataArray[idx] < targetValue
         // If adding current element is still less than target, continue accumulating
         currentSum += dataArray[idx]; // Add to current segment sum
      }

      // If the number of segments exceeds the allowed maximum, it's invalid
      if (segmentCount === maxSegments) {
         isValid = false; // Mark as invalid
         break;           // Exit loop early
      }
   }
   // Return the validity status
   return isValid;
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into an array of lines, removing leading/trailing whitespace
let lineBuffer = rawData.trim().split("\n");

// Global variables used by the checkCondition function
let dataArray = [];
let maxSegments = 0;

// Main processing loop
while (true) {
   // Get the first line, which contains M and N
   let dimensionsStr = lineBuffer.shift();
   // Check for termination condition
   if (dimensionsStr === "0 0") {
      break; // Exit the loop if "0 0" is encountered
   }

   // Parse M and N from the current line
   dimensionsStr = dimensionsStr.split(" ").map(Number);
   maxSegments = dimensionsStr[0]; // Assign M to maxSegments
   let numElements = dimensionsStr[1]; // Assign N to numElements

   // Clear the data array for the new set of elements
   dataArray = [];
   // Read N elements into the dataArray
   while (numElements--) {
      dataArray.push(Number(lineBuffer.shift())); // Convert to number and add
   }

   // Initialize binary search bounds
   let lowerBound = 0;
   let upperBound = 1500000; // A sufficiently large upper bound based on problem constraints

   // Perform binary search to find the minimum possible maximum sum
   while (true) {
      // Calculate the midpoint
      const midPoint = Math.floor((lowerBound + upperBound) / 2);

      // If the current midpoint allows for a valid segmentation
      if (checkCondition(midPoint)) {
         // Try a smaller maximum sum
         upperBound = midPoint - 1;
      } else {
         // The current midpoint is too small, need a larger maximum sum
         lowerBound = midPoint + 1;
      }

      // Termination condition for binary search
      if (lowerBound > upperBound) {
         break;
      }
   }
   // The result is lowerBound (which is R+1 from the original logic after the loop)
   console.log(upperBound + 1);
}
