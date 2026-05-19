var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input data into an array of lines, removing leading/trailing whitespace.
var lineSegments = rawData.trim().split("\n");

// Main processing loop. Continues until a polygon count of 0 is encountered.
while (!false) {
   // Extract the number of polygons for the current test case.
   // The `-0` converts the string to a number.
   var polygonCount = Number(lineSegments.shift());

   // If the polygon count is zero, terminate the loop.
   if (polygonCount === 0) {
      break;
   }

   // Initialize a variable to store the normalized path signature of the first polygon.
   var firstPathSignature = "";

   // Loop through each polygon in the current test case.
   // The loop runs N+1 times because the problem statement implies comparing subsequent polygons to the first.
   for (var polygonIndex = 0; polygonIndex < polygonCount + 1; polygonIndex++) {
      // Get the number of points for the current polygon.
      var pointCount = Number(lineSegments.shift());

      // Array to hold the coordinates of the current polygon's points.
      var currentPolygonPoints = [];

      // Read all points for the current polygon.
      while (pointCount--) {
         currentPolygonPoints.push(lineSegments.shift().split(" ").map(Number));
      }

      // Array to store the relative movements between consecutive points.
      var relativeMoves = [];

      // Calculate relative movements between adjacent points.
      for (var pointIndex = 1; pointIndex < currentPolygonPoints.length; pointIndex++) {
         var previousPoint = currentPolygonPoints[pointIndex - 1];
         var currentPoint = currentPolygonPoints[pointIndex];

         // Determine movement direction and magnitude.
         if (previousPoint[0] === currentPoint[0] && previousPoint[1] > currentPoint[1]) {
            relativeMoves.push(["s", previousPoint[1] - currentPoint[1]]); // South
         } else if (previousPoint[0] === currentPoint[0] && previousPoint[1] < currentPoint[1]) {
            relativeMoves.push(["n", currentPoint[1] - previousPoint[1]]); // North
         } else if (previousPoint[1] === currentPoint[1] && previousPoint[0] > currentPoint[0]) {
            relativeMoves.push(["w", previousPoint[0] - currentPoint[0]]); // West
         } else if (previousPoint[1] === currentPoint[1] && previousPoint[0] < currentPoint[0]) {
            relativeMoves.push(["e", currentPoint[0] - previousPoint[0]]); // East
         }
      }

      // Create string representations of the forward and reversed movement sequences.
      var forwardSignature = relativeMoves.join("");
      var reverseSignature = relativeMoves.reverse().join("");

      // For the first polygon (index 0), store its normalized signature.
      if (polygonIndex === 0) {
         firstPathSignature = relativeMoves.join("").replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W");
      } else {
         // For subsequent polygons, generate all 8 possible rotated/reversed signatures.
         // Forward signatures:
         var northForward = forwardSignature.replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W");
         var eastForward = forwardSignature.replace(/n/g, "E").replace(/e/g, "S").replace(/s/g, "W").replace(/w/g, "N");
         var southForward = forwardSignature.replace(/n/g, "S").replace(/e/g, "W").replace(/s/g, "N").replace(/w/g, "E");
         var westForward = forwardSignature.replace(/n/g, "W").replace(/e/g, "N").replace(/s/g, "E").replace(/w/g, "S");

         // Reversed signatures:
         var northReverse = reverseSignature.replace(/n/g, "N").replace(/e/g, "E").replace(/s/g, "S").replace(/w/g, "W");
         var eastReverse = reverseSignature.replace(/n/g, "E").replace(/e/g, "S").replace(/s/g, "W").replace(/w/g, "N");
         var southReverse = reverseSignature.replace(/n/g, "S").replace(/e/g, "W").replace(/s/g, "N").replace(/w/g, "E");
         var westReverse = reverseSignature.replace(/n/g, "W").replace(/e/g, "N").replace(/s/g, "E").replace(/w/g, "S");

         // Check if the current polygon's signature (in any orientation/direction) matches the first polygon's signature.
         if (firstPathSignature === eastForward || firstPathSignature === southForward || firstPathSignature === westForward || firstPathSignature === northForward || firstPathSignature === eastReverse || firstPathSignature === southReverse || firstPathSignature === westReverse || firstPathSignature === northReverse) {
            console.log(polygonIndex); // Output the index of the matching polygon.
         }
      }
   }
   // After processing all polygons for a test case, print a separator.
   console.log("+++++");
}
