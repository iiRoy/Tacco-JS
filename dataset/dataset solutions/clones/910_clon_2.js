// Initial environment setup for script execution, often ignored in JS itself
var processSolution = function() {
   /*
    * This function encapsulates the main computational logic.
    * It continuously reads input until a specific termination condition is met.
    */
   var currentData; // Holds parsed numerical data from each input line

   // Loop indefinitely until the first element of the parsed input is falsy (e.g., 0)
   for (; (currentData = obtainInputLine().split(' ').map(Number))[0];) {
      const dimensionA = currentData[0]; // First numerical parameter from input
      const targetCoord = currentData[1]; // Second numerical parameter from input

      // Calculate and display the minimum absolute difference
      // The calculation involves generating a series of values based on dimensionA
      // and then finding the Euclidean distance (hypot) for each, comparing with targetCoord.
      displayOutput(Math.min.apply(
         null,
         Array.apply(null, {
            length: 1 + (dimensionA / 2 | 0) // Integer division for array length
         }).map(function(_discarded, currentIdx) {
            // For each index, calculate the absolute difference between targetCoord
            // and the hypotenuse of (currentIdx, dimensionA - currentIdx).
            return Math.abs(targetCoord - Math.hypot(currentIdx, dimensionA - currentIdx));
         })
      ));
   }
};


// --- Input/Output Handling Section ---

if (typeof process !== 'undefined') {
   // Node.js environment specific I/O setup
   var displayOutput = function(valToLog) {
      console.log(valToLog); // Use Node's console.log for output
   };

   var obtainInputLine = (function() {
      var bufferedLines = []; // Stores complete lines read from stdin
      var linePointer = 0;    // Index for the next line to be returned

      var consoleInput = process.openStdin(); // Open standard input stream
      consoleInput.setEncoding('utf8');      // Set encoding for input data

      var incompleteChunk = ""; // Stores partial line data across 'data' events

      // Event listener for incoming data chunks
      consoleInput.on('data', function(incomingPayload) {
         // Combine any incomplete previous chunk with the new payload
         var extractedSegments = (incompleteChunk + incomingPayload).split("\n");
         incompleteChunk = extractedSegments.pop(); // The last part might be incomplete, save it

         // Process all complete lines found in the current payload
         for (var segmentIndex = 0; segmentIndex < extractedSegments.length; segmentIndex++) {
            if (extractedSegments[segmentIndex] === '') continue; // Skip empty lines
            bufferedLines.push(extractedSegments[segmentIndex]);  // Add valid lines to buffer
         }
      });

      // Event listener for the end of the input stream
      consoleInput.on('end', function(_terminationEvent) {
         // If there's any remaining data after the stream ends, process it as a final line
         if (incompleteChunk) {
            var extractedSegments = (incompleteChunk + "\n").split("\n");
            incompleteChunk = extractedSegments.pop();
            for (var segmentIndex = 0; segmentIndex < extractedSegments.length; segmentIndex++) {
               if (extractedSegments[segmentIndex] === '') continue;
               bufferedLines.push(extractedSegments[segmentIndex]);
            }
         }
         processSolution(); // Once all input is buffered, execute the main logic
      });

      // Returns the next line from the buffer
      return function() {
         if (bufferedLines.length <= linePointer) return null; // No more lines available
         return bufferedLines[linePointer++]; // Return line and advance pointer
      };
   })();
} else {
   // V8 / standalone JS engine environment (e.g., d8)
   processSolution(); // Directly call the main logic as I/O is handled by the environment
}