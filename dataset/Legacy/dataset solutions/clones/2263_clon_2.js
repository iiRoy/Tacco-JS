function ProcessInputData(rawData) {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split("\n");

  // Parse the number of points from the first line.
  const pointCount = parseInt(processedLines[0]);

  // Remove the first line (which contained pointCount) from the array.
  processedLines.shift();

  // Trim any extra lines beyond the actual point data.
  // This ensures we only process 'pointCount' lines of coordinate data.
  processedLines.splice(pointCount, processedLines.length);

  // Map the remaining lines to an array of coordinate pairs.
  // Each line is split by space, and each part is parsed as an integer.
  const coordinates = processedLines.map(line => line.split(" ").map(val => parseInt(val)));

  // Initialize the variable to store the final radius.
  let finalRadius = 0;

  // Special handling for the case with exactly two points.
  // The smallest enclosing circle for two points has them as diameter endpoints.
  if (coordinates.length === 2) {
    // Calculate the distance between the two points.
    // This distance is the diameter of the circle.
    const distSq = Math.pow(coordinates[0][0] - coordinates[1][0], 2) + Math.pow(coordinates[0][1] - coordinates[1][1], 2);
    // The radius is half of the distance.
    finalRadius = Math.sqrt(distSq) / 2;
  } else {
    // General case: Iterate through all combinations of three points to find the smallest enclosing circle.
    // This algorithm checks circles defined by two points (as diameter) and three points (circumcircle).
    // The outer loop iterates through the first point (idxA).
    for (let idxA = 0; idxA < pointCount; idxA++) {
      // The second loop iterates through the second point (idxB), ensuring idxB > idxA.
      for (let idxB = idxA + 1; idxB < pointCount; idxB++) {
        // The third loop iterates through the third point (idxC), ensuring idxC > idxB.
        for (let idxC = idxB + 1; idxC < pointCount; idxC++) {
          // Array to store squared lengths of sides of the triangle formed by points A, B, C.
          // Each entry is [squared_length, identifier_for_opposite_vertex].
          // 0: side AB (opposite C), 1: side AC (opposite B), 2: side BC (opposite A).
          const sideLengths = [];
          sideLengths.push([Math.pow(coordinates[idxA][0] - coordinates[idxB][0], 2) + Math.pow(coordinates[idxA][1] - coordinates[idxB][1], 2), 0]);
          sideLengths.push([Math.pow(coordinates[idxA][0] - coordinates[idxC][0], 2) + Math.pow(coordinates[idxA][1] - coordinates[idxC][1], 2), 1]);
          sideLengths.push([Math.pow(coordinates[idxC][0] - coordinates[idxB][0], 2) + Math.pow(coordinates[idxC][1] - coordinates[idxB][1], 2), 2]);

          // Sort the sides by their squared lengths in descending order.
          // The longest side will be at index 0.
          sideLengths.sort(function(a, b) { return b[0] - a[0]; });

          let centerX, centerY; // Coordinates of the circle's center.
          let radiusSquared;   // Squared radius of the circle.

          // Check if the triangle is obtuse or right-angled.
          // If the square of the longest side is greater than or equal to the sum of squares of the other two sides,
          // the circle's diameter is the longest side.
          if (sideLengths[0][0] >= sideLengths[1][0] + sideLengths[2][0]) {
            // The circle is defined by the two endpoints of the longest side.
            // The center is the midpoint of this longest side.
            // The radius squared is the distance from one endpoint to the center.

            if (sideLengths[0][1] === 0) { // Longest side is AB (opposite C)
              centerX = (coordinates[idxA][0] + coordinates[idxB][0]) / 2;
              centerY = (coordinates[idxA][1] + coordinates[idxB][1]) / 2;
              radiusSquared = Math.pow(coordinates[idxA][0] - centerX, 2) + Math.pow(coordinates[idxA][1] - centerY, 2);
            } else if (sideLengths[0][1] === 1) { // Longest side is AC (opposite B)
              centerX = (coordinates[idxA][0] + coordinates[idxC][0]) / 2;
              centerY = (coordinates[idxA][1] + coordinates[idxC][1]) / 2;
              radiusSquared = Math.pow(coordinates[idxA][0] - centerX, 2) + Math.pow(coordinates[idxA][1] - centerY, 2);
            } else { // Longest side is BC (opposite A)
              centerX = (coordinates[idxB][0] + coordinates[idxC][0]) / 2;
              centerY = (coordinates[idxB][1] + coordinates[idxC][1]) / 2;
              radiusSquared = Math.pow(coordinates[idxB][0] - centerX, 2) + Math.pow(coordinates[idxB][1] - centerY, 2);
            }
          } else {
            // The triangle is acute. The circle is the circumcircle of the three points.
            // Calculate the circumcenter (centerX, centerY) and circumradius (radiusSquared).
            // These formulas are derived from the general equations for a circumcircle.

            const xA = coordinates[idxA][0], yA = coordinates[idxA][1];
            const xB = coordinates[idxB][0], yB = coordinates[idxB][1];
            const xC = coordinates[idxC][0], yC = coordinates[idxC][1];

            const term1 = (xC - xA) * (Math.pow(xA, 2) + Math.pow(yA, 2) - Math.pow(xB, 2) - Math.pow(yB, 2));
            const term2 = (xB - xA) * (Math.pow(xA, 2) + Math.pow(yA, 2) - Math.pow(xC, 2) - Math.pow(yC, 2));
            const denominatorY = 2 * ((xC - xA) * (yA - yB) - (xB - xA) * (yA - yC));

            centerY = (term1 - term2) / denominatorY;

            // Calculate centerX based on whether xA and xB are distinct.
            // This avoids division by zero if two points share the same x-coordinate.
            if (xA !== xB) {
              centerX = (2 * (yA - yB) * centerY - Math.pow(xA, 2) - Math.pow(yA, 2) + Math.pow(xB, 2) + Math.pow(yB, 2)) / (2 * (xB - xA));
            } else { // If xA == xB, use points A and C to calculate centerX.
              centerX = (2 * (yA - yC) * centerY - Math.pow(xA, 2) - Math.pow(yA, 2) + Math.pow(xC, 2) + Math.pow(yC, 2)) / (2 * (xC - xA));
            }

            // Calculate the squared radius from point A to the circumcenter.
            radiusSquared = Math.pow(xA - centerX, 2) + Math.pow(yA - centerY, 2);
          }

          // Now, check if this candidate circle (defined by 2 or 3 points) encloses all N points.
          let isValidCircle = true; // Assume valid until a point is found outside.
          for (let idxP = 0; idxP < pointCount; idxP++) {
            // Calculate the squared distance from the current point (idxP) to the circle's center.
            const distToCenterSq = Math.pow(coordinates[idxP][0] - centerX, 2) + Math.pow(coordinates[idxP][1] - centerY, 2);

            // If any point is outside the circle (allowing for a small floating point tolerance),
            // this circle is not the smallest enclosing circle for all points.
            if (distToCenterSq > radiusSquared + 0.000001) {
              isValidCircle = false; // Mark as invalid.
              break; // No need to check further points for this circle.
            }
          }

          // If all points are inside this circle, it's a candidate for the smallest enclosing circle.
          // Since we are iterating through combinations, the first one found that encloses all points
          // will be the answer (due to the problem constraints or specific algorithm properties).
          if (isValidCircle) {
            finalRadius = Math.sqrt(radiusSquared); // Store the radius.
            break; // Exit the innermost loop (idxC).
          }
        }
        // If a valid circle was found in the inner loop, break from the middle loop (idxB).
        if (finalRadius !== 0) {
          break;
        }
      }
      // If a valid circle was found, break from the outermost loop (idxA).
      if (finalRadius !== 0) {
        break;
      }
    }
  }

  // Output the calculated radius to the console.
  console.log('%s', finalRadius);
  // Return the result.
  return finalRadius;
}

// This function is likely for a specific testing environment (e.g., a web page).
function TestSolution(testCaseNum) {
  // Retrieve input data from a DOM element.
  const inputData = document.getElementById("input" + testCaseNum).value;
  // Process the input data using the main logic.
  const computedAnswer = ProcessInputData(inputData);
  let testOutcome = "WA"; // Assume Wrong Answer initially.

  // Compare the computed answer with the expected output from another DOM element.
  // The expected output is assumed to be on the first line.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, it's Accepted.
  }
  // Display the test outcome in a designated DOM element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main function by reading input from standard input.
// This is typical for competitive programming environments.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
