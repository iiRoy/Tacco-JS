const fileSystemModule = require('fs');

let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let lineSegments = rawInputContent.trim().split("\n");

lineSegments.forEach(function(currentSegment) {
   let numericalData = currentSegment.split(" ").map(Number);
   let overlapTally = 0;

   (function(rectA_x_start, rectA_y_start, rectA_x_end, rectA_y_end, rectB_x_start, rectB_y_start, rectB_x_end, rectB_y_end) {
      // Check for horizontal overlap between the two rectangles
      if (rectB_x_end >= rectA_x_start && rectB_x_start <= rectA_x_end) {
         overlapTally++;
      }
      // Check for vertical overlap between the two rectangles
      if (rectB_y_end >= rectA_y_start && rectB_y_start <= rectA_y_end) {
         overlapTally++;
      }
   }).apply(null, numericalData); // Pass the numerical data as arguments to the anonymous function

   // Output "YES" if both horizontal and vertical overlaps were detected, otherwise "NO"
   console.log((overlapTally === 2) ? "YES" : "NO");
});
