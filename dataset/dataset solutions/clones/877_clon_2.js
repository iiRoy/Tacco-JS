var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
var lineBuffer = (rawData.trim()).split("\n");

// Loop as long as there are lines to process in the buffer.
while (lineBuffer.length !== 0) {
   // Initialize an array to store results for the current test case.
   var outputSegments = [];

   // Extract the first line, split by space, and convert to numbers.
   // This line contains N (number of entries) and T (time threshold).
   var configParams = (lineBuffer.shift()).split(" ").map(Number);

   // Iterate N times, processing each entry.
   for (var idx = 0; idx < configParams[0]; idx++) {
      // Get the current entry line and split it by space.
      var currentLineParts = (lineBuffer.shift()).split(" ");

      // Parse the start time (first part of the line).
      // It's in "HH:MM" format, convert to minutes.
      var startTimeComponents = currentLineParts[0].split(":").map((valStr) => Number.parseInt(valStr, 10));

      // If this is not the first entry, perform time difference calculation.
      if (idx > 0) {
         // Calculate current start time in minutes from midnight.
         var currentStartTimeMinutes = startTimeComponents[0] * 60 + startTimeComponents[1];
         // Calculate previous end time in minutes from midnight.
         var previousEndTimeMinutes = endTimeComponents[0] * 60 + endTimeComponents[1];

         // Check if the time difference meets or exceeds the threshold T.
         if (currentStartTimeMinutes - previousEndTimeMinutes >= configParams[1]) {
            // If it does, add the segment label and the time difference to the results.
            outputSegments.push(segmentLabel + " " + (currentStartTimeMinutes - previousEndTimeMinutes));
         }
      }

      // Parse the end time (third part of the line).
      // Store it for the next iteration's comparison.
      var endTimeComponents = currentLineParts[2].split(":").map((valStr) => Number.parseInt(valStr, 10));
      // Get the segment label (fourth part of the line).
      // Store it for the next iteration's output if a gap is found.
      var segmentLabel = currentLineParts[3];
   }

   // After processing all entries for the current test case, output the results.
   if (outputSegments.length === 0) {
      // If no gaps were found, print 0.
      console.log(0);
   } else {
      // Otherwise, print the count of gaps, then each gap entry on a new line.
      console.log(outputSegments.length);
      outputSegments.forEach((segmentEntry) => {
         console.log(segmentEntry);
      });
   }
}
