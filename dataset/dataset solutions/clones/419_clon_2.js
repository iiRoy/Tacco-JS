function evaluateTarget(targetValue) {
   // A boolean indicator for the possibility of achieving the target
   var isFeasible = true;
   // Counter for the number of segments formed
   var segmentCounter = 0;
   // Accumulator for the current segment's sum
   var currentSegmentSum = 0;

   // Iterate through each element in the global value list
   for (var itemIndex = 0; itemIndex < dataCollection.length; itemIndex++) {
      // If any individual element is greater than the target, it's not feasible
      if (targetValue < dataCollection[itemIndex]) {
         isFeasible = false;
         break; // Exit loop early
      }
      // If adding the current element completes a segment exactly equal to the target
      else if (currentSegmentSum + dataCollection[itemIndex] === targetValue) {
         currentSegmentSum = 0; // Reset sum for the next segment
         segmentCounter++; // Increment segment count
      }
      // If adding the current element would exceed the target for the current segment
      else if (currentSegmentSum + dataCollection[itemIndex] > targetValue) {
         currentSegmentSum = dataCollection[itemIndex]; // Start a new segment with the current element
         segmentCounter++; // Increment segment count
      }
      // If adding the current element is still within the target for the current segment
      else if (currentSegmentSum + dataCollection[itemIndex] < targetValue) {
         currentSegmentSum += dataCollection[itemIndex]; // Continue accumulating
      }

      // If the number of segments exceeds the maximum allowed, it's not feasible
      if (segmentCounter === maximumSegments) {
         isFeasible = false;
         break; // Exit loop early
      }
   }
   return isFeasible; // Return the feasibility status
}
// Read all content from standard input
var fileContentBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input into an array of lines
var lineArray = fileContentBuffer.trim().split("\n");

// Main loop for processing multiple test cases
while (true) {
   // Extract the configuration line (dimensions)
   var configString = lineArray.shift();

   // Check for the termination condition "0 0"
   if (configString === "0 0") break;

   // Parse the configuration values into numbers
   configString = configString.split(" ").map(Number);
   var maximumSegments = configString[0]; // The maximum allowed number of segments
   var elementCount = configString[1]; // The total number of data elements

   var dataCollection = []; // Array to hold the numerical data elements

   // Populate the data collection from subsequent input lines
   while (elementCount--) {
      dataCollection.push(lineArray.shift() - 0); // Convert string to number
   }

   // Initialize bounds for binary search
   var searchLowerBound = 0; // Minimum possible target value
   var searchUpperBound = 1500000; // Maximum possible target value (problem-specific upper limit)

   // Perform binary search to find the optimal target value
   while (true) {
      var currentMidpoint = Math.floor((searchLowerBound + searchUpperBound) / 2); // Calculate the midpoint

      // Evaluate if the current midpoint target is achievable
      if (evaluateTarget(currentMidpoint)) {
         searchUpperBound = currentMidpoint - 1; // Try a smaller target
         // If bounds cross, the smallest feasible target is found
         if (searchLowerBound > searchUpperBound) {
            console.log(searchUpperBound + 1); // Output the result
            break; // Exit binary search
         }
      } else {
         searchLowerBound = currentMidpoint + 1; // Try a larger target
         // If bounds cross, the smallest feasible target is found
         if (searchLowerBound > searchUpperBound) {
            console.log(searchUpperBound + 1); // Output the result
            break; // Exit binary search
         }
      }
   }
}