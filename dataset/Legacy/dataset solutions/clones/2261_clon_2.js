function ProcessCoordinates(rawData) {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split('\n');

  // Parse the first line to get the number of points.
  const numPoints = Number.parseInt(processedLines[0], 10);

  // Remove the first line (which contained numPoints).
  processedLines.shift();

  // Ensure we only process up to numPoints lines, even if more are provided.
  processedLines.splice(numPoints, processedLines.length);

  // Map the remaining lines to an array of coordinate pairs (x, y).
  const coordinates = processedLines.map(lineStr =>
    lineStr.split(' ').map(coordStr => Number.parseInt(coordStr, 10))
  );

  // Initialize the variable to store the final minimum radius.
  let finalRadius = 0.0;

  // Iterate through all unique combinations of three points (i, j, k) to form a triangle.
  // This uses three nested loops to select distinct points.
  for (let idxA = 0; idxA < numPoints; ++idxA) {
    for (let idxB = idxA + 1; idxB < numPoints; ++idxB) {
      for (let idxC = idxB + 1; idxC < numPoints; ++idxC) {
        // Calculate the squared lengths of the sides of the triangle formed by points A, B, C.
        // Store them along with an identifier for which pair of points they connect.
        const triangleSides = [];
        // Side AB squared
        triangleSides.push([
          Math.pow(coordinates[idxA][0] - coordinates[idxB][0], 2) + Math.pow(coordinates[idxA][1] - coordinates[idxB][1], 2),
          0 // Identifier for side AB
        ]);
        // Side AC squared
        triangleSides.push([
          Math.pow(coordinates[idxA][0] - coordinates[idxC][0], 2) + Math.pow(coordinates[idxA][1] - coordinates[idxC][1], 2),
          1 // Identifier for side AC
        ]);
        // Side BC squared
        triangleSides.push([
          Math.pow(coordinates[idxC][0] - coordinates[idxB][0], 2) + Math.pow(coordinates[idxC][1] - coordinates[idxB][1], 2),
          2 // Identifier for side BC
        ]);

        // Sort the sides in descending order of their squared lengths.
        // The longest side will be at index 0.
        triangleSides.sort((sideOne, sideTwo) => sideTwo[0] - sideOne[0]);

        let centerX, centerY, radiusSquared;

        // Check if the triangle is obtuse or right-angled.
        // If the square of the longest side is greater than the sum of the squares of the other two sides,
        // the circumcircle's diameter is the longest side.
        if (triangleSides[0][0] > triangleSides[1][0] + triangleSides[2][0]) {
          // The circumcircle's diameter is the longest side.
          // Determine which pair of points forms this longest side.
          if (triangleSides[0][1] === 0) { // Longest side is AB
            centerX = (coordinates[idxA][0] + coordinates[idxB][0]) / 2.0;
            centerY = (coordinates[idxA][1] + coordinates[idxB][1]) / 2.0;
            radiusSquared = Math.pow(coordinates[idxA][0] - centerX, 2) + Math.pow(coordinates[idxA][1] - centerY, 2);
          } else if (triangleSides[0][1] === 1) { // Longest side is AC
            centerX = (coordinates[idxA][0] + coordinates[idxC][0]) / 2.0;
            centerY = (coordinates[idxA][1] + coordinates[idxC][1]) / 2.0;
            radiusSquared = Math.pow(coordinates[idxA][0] - centerX, 2) + Math.pow(coordinates[idxA][1] - centerY, 2);
          } else { // Longest side is BC
            centerX = (coordinates[idxB][0] + coordinates[idxC][0]) / 2.0;
            centerY = (coordinates[idxB][1] + coordinates[idxC][1]) / 2.0;
            radiusSquared = Math.pow(coordinates[idxB][0] - centerX, 2) + Math.pow(coordinates[idxB][1] - centerY, 2);
          }
        } else {
          // The triangle is acute or right-angled, so the circumcircle is the unique circle passing through all three points.
          // Calculate the circumcenter (centerX, centerY) and circumradius (radiusSquared).
          // This involves solving a system of linear equations derived from the perpendicular bisectors.

          // Denominators for circumcenter calculation
          const denom = 2.0 * ((coordinates[idxC][0] - coordinates[idxA][0]) * (coordinates[idxA][1] - coordinates[idxB][1]) - (coordinates[idxB][0] - coordinates[idxA][0]) * (coordinates[idxA][1] - coordinates[idxC][1]));

          // Calculate centerY
          centerY = (
            (coordinates[idxC][0] - coordinates[idxA][0]) * (Math.pow(coordinates[idxA][0], 2) + Math.pow(coordinates[idxA][1], 2) - Math.pow(coordinates[idxB][0], 2) - Math.pow(coordinates[idxB][1], 2)) -
            (coordinates[idxB][0] - coordinates[idxA][0]) * (Math.pow(coordinates[idxA][0], 2) + Math.pow(coordinates[idxA][1], 2) - Math.pow(coordinates[idxC][0], 2) - Math.pow(coordinates[idxC][1], 2))
          ) / denom;

          // Calculate centerX
          if (coordinates[idxA][0] !== coordinates[idxB][0]) {
            centerX = (
              (2.0 * coordinates[idxA][1] - 2.0 * centerY) * (coordinates[idxA][1] - coordinates[idxB][1]) -
              (Math.pow(coordinates[idxA][0], 2) + Math.pow(coordinates[idxA][1], 2) - Math.pow(coordinates[idxB][0], 2) - Math.pow(coordinates[idxB][1], 2))
            ) / (2.0 * (coordinates[idxB][0] - coordinates[idxA][0]));
          } else { // If x-coordinates of A and B are the same, use A and C
            centerX = (
              (2.0 * coordinates[idxA][1] - 2.0 * centerY) * (coordinates[idxA][1] - coordinates[idxC][1]) -
              (Math.pow(coordinates[idxA][0], 2) + Math.pow(coordinates[idxA][1], 2) - Math.pow(coordinates[idxC][0], 2) - Math.pow(coordinates[idxC][1], 2))
            ) / (2.0 * (coordinates[idxC][0] - coordinates[idxA][0]));
          }

          // Calculate the squared radius from point A to the circumcenter.
          radiusSquared = Math.pow(coordinates[idxA][0] - centerX, 2) + Math.pow(coordinates[idxA][1] - centerY, 2);
        }

        // Check if all other points are contained within or on the boundary of this circle.
        let allPointsContained = true;
        for (let idxP = 0; idxP < numPoints; ++idxP) {
          // If any point is outside the current circle, this circle is not the minimum enclosing circle.
          if (Math.pow(coordinates[idxP][0] - centerX, 2) + Math.pow(coordinates[idxP][1] - centerY, 2) > radiusSquared + 1e-9) { // Add epsilon for floating point comparison
            allPointsContained = false;
            break;
          }
        }

        // If all points are contained, we found a candidate for the minimum enclosing circle.
        // Since we are iterating through all possible triangles, the first one found that encloses all points
        // will be the minimum if the problem guarantees such a triangle exists and is unique.
        // (This logic implies a specific problem context where the first valid circle is the answer,
        // or that the problem is simplified to finding *any* such circle.)
        if (allPointsContained) {
          finalRadius = Math.sqrt(radiusSquared);
          // Break out of all loops once a valid circle is found.
          break;
        }
      }
      if (finalRadius !== 0.0) {
        break;
      }
    }
    if (finalRadius !== 0.0) {
      break;
    }
  }

  // Output the calculated minimum radius.
  console.log(String(finalRadius));
  return finalRadius;
}

// This function is for debugging purposes, likely in a browser environment.
function testSolution(testCaseNum) {
  const testInputData = document.getElementById("input" + testCaseNum).value;
  const calculatedResult = ProcessCoordinates(testInputData);
  let testOutcome = "WA"; // Default to Wrong Answer

  // Compare the calculated result with the expected output.
  if (calculatedResult == document.getElementById("output" + testCaseNum).value.split('\n')[0]) {
    testOutcome = "AC"; // Accepted
  }
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Main execution block for Node.js environment.
// Reads input from standard input and passes it to the main processing function.
ProcessCoordinates(require('fs').readFileSync('/dev/stdin', 'utf8'));
