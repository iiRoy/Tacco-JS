const fileSystemModule = require('fs'); // Obtain the necessary file system functionality.

let rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Acquire all data from standard input, interpreting it as UTF-8 text.

// Pre-process the incoming data: strip any trailing newline characters and segment it into distinct lines.
let dataLineBuffer = (rawInputData.replace(/\n$/, "")).split("\n");


// Commence the primary data processing cycle; this loop will persist until an explicit exit condition is met.
while (true) {

   // Extract the initial element from the data buffer, which represents the count of entries for the current operation.
   // Convert this extracted string value to a numerical type for arithmetic operations.
   let currentBatchSize = Number(dataLineBuffer.shift());

   // Evaluate the processed count: if it indicates zero entries, it signals the conclusion of input data.
   if (currentBatchSize === 0) {
      break; // Terminate the processing loop.
   }

   // Initialize an array structure to house the computed outcomes for the current collection of entries.
   const batchResults = [];

   // Iterate sequentially through each entry, from the first up to the total count for this batch.
   for (let currentItemIdx = 0; currentItemIdx < currentBatchSize; currentItemIdx++) {

      // Retrieve the subsequent line from the buffered input and partition it into constituent segments based on space delimiters.
      let lineSegments = (dataLineBuffer.shift()).split(" ");

      // Designate the inaugural segment as the unique identifier for the current entity.
      let entityIdentifier = lineSegments.shift();

      // Transform all subsequent segments, which are presumed to be numerical representations, into floating-point numbers.
      lineSegments = lineSegments.map(parseFloat);

      // Reinsert the previously extracted entity identifier at the forefront of the numerical segments array.
      lineSegments.unshift(entityIdentifier);

      // Employ an immediately-invoked function expression (IIFE) to encapsulate and execute the calculation logic for the current entity.
      (function(entityName, initialInvestment, paramA, paramB, paramC, multiplierD, multiplierE, revenueRateF, unitsSoldS, durationMultiplierM) {
         // Compute the total operational duration by summing fixed components and a product of variable factors.
         const operationalDuration = paramA + paramB + paramC + ((multiplierD + multiplierE) * durationMultiplierM);

         // Determine the net financial gain by subtracting the initial investment from the total generated revenue.
         const netFinancialGain = (revenueRateF * unitsSoldS * durationMultiplierM) - initialInvestment;

         // Append the entity's identifier along with its calculated profitability ratio to the results collection.
         batchResults.push([entityName, netFinancialGain / operationalDuration]);
      }).apply(null, lineSegments); // Invoke the IIFE, passing the prepared line segments as arguments.
   }

   // Arrange the accumulated results: primarily by profitability in descending order, and secondarily by entity name in ascending order for ties.
   batchResults.sort(function(firstEntry, secondEntry) {
      // If profitability values are equivalent, sort based on the entity's name lexicographically.
      if (firstEntry[1] === secondEntry[1]) {
         return firstEntry[0] > secondEntry[0] ? 1 : -1; // Positive for 'firstEntry' after 'secondEntry', negative otherwise.
      } else {
         return secondEntry[1] - firstEntry[1]; // Otherwise, sort by profitability in descending order.
      }
   });

   // Iterate through the now-sorted batch results and print only the entity identifiers to the console.
   batchResults.forEach(function(outputRecord) {
      console.log(outputRecord[0]);
   });

   // Output a distinct separator character, signaling the completion of the current batch's processing.
   console.log("#");
}