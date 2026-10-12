function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split('\n');

  // Parse the number of points from the first line.
  let pointCount = parseInt(rawData[0], 10);

  // Remove the first line (which contained N).
  rawData.shift();

  // Remove any extra lines beyond the N coordinate pairs.
  rawData.splice(pointCount, rawData.length);

  // Map the remaining lines to an array of coordinate pairs (numbers).
  const coordinates = rawData.map(line =>
    line.split(' ').map(val => parseInt(val, 10))
  );

  // Initialize the variable to store the final calculated radius.
  let finalResult = 0.0;

  // Handle the special case where there are only two points.
  // The minimum enclosing circle for two points has the segment connecting them as diameter.
  if (coordinates.length === 2) {
    // Calculate half the distance between the two points.
    finalResult =
      Math.sqrt(
        Math.pow(coordinates[0][0] - coordinates[1][0], 2) +
          Math.pow(coordinates[0][1] - coordinates[1][1], 2)
      ) / 2.0;
  } else {
    // Iterate through all combinations of three points (i, j, k) to find the minimum enclosing circle.
    for (let idxA = 0; idxA < pointCount; idxA++) {
      for (let idxB = idxA + 1; idxB < pointCount; idxB++) {
        for (let idxC = idxB + 1; idxC < pointCount; idxC++) {
          // Array to store squared edge lengths and their corresponding point indices.
          const sideLengths = [];

          // Calculate squared lengths of the three edges of the triangle formed by points A, B, C.
          // Edge AB squared
          sideLengths.push([
            Math.pow(coordinates[idxA][0] - coordinates[idxB][0], 2) +
              Math.pow(coordinates[idxA][1] - coordinates[idxB][1], 2),
            0, // Identifier for edge AB
          ]);
          // Edge AC squared
          sideLengths.push([
            Math.pow(coordinates[idxA][0] - coordinates[idxC][0], 2) +
              Math.pow(coordinates[idxA][1] - coordinates[idxC][1], 2),
            1, // Identifier for edge AC
          ]);
          // Edge BC squared
          sideLengths.push([
            Math.pow(coordinates[idxC][0] - coordinates[idxB][0], 2) +
              Math.pow(coordinates[idxC][1] - coordinates[idxB][1], 2),
            2, // Identifier for edge BC
          ]);

          // Sort the edges by their squared lengths in descending order.
          sideLengths.sort(function (a, b) {
            return b[0] - a[0];
          });

          let centerX, centerY, radiusSquared;

          // Check if the triangle is obtuse or right-angled (longest edge squared > sum of other two squared).
          // If so, the minimum enclosing circle has the longest edge as its diameter.
          if (sideLengths[0][0] > sideLengths[1][0] + sideLengths[2][0]) {
            // Determine which edge is the longest and calculate the center and radius.
            if (sideLengths[0][1] === 0) {
              // Longest edge is AB
              centerX = (coordinates[idxA][0] + coordinates[idxB][0]) / 2.0;
              centerY = (coordinates[idxA][1] + coordinates[idxB][1]) / 2.0;
              radiusSquared =
                Math.pow(coordinates[idxA][0] - centerX, 2) +
                Math.pow(coordinates[idxA][1] - centerY, 2);
            } else if (sideLengths[0][1] === 1) {
              // Longest edge is AC
              centerX = (coordinates[idxA][0] + coordinates[idxC][0]) / 2.0;
              centerY = (coordinates[idxA][1] + coordinates[idxC][1]) / 2.0;
              radiusSquared =
                Math.pow(coordinates[idxA][0] - centerX, 2) +
                Math.pow(coordinates[idxA][1] - centerY, 2);
            } else {
              // Longest edge is BC
              centerX = (coordinates[idxB][0] + coordinates[idxC][0]) / 2.0;
              centerY = (coordinates[idxB][1] + coordinates[idxC][1]) / 2.0;
              radiusSquared =
                Math.pow(coordinates[idxB][0] - centerX, 2) +
                Math.pow(coordinates[idxB][1] - centerY, 2);
            }
          } else {
            // If the triangle is acute, the minimum enclosing circle is its circumcircle.
            // Calculate the circumcenter (centerX, centerY) and circumradius (radiusSquared).
            // Using a formula for circumcenter of three points (x1,y1), (x2,y2), (x3,y3)
            // Let p1=coordinates[idxA], p2=coordinates[idxB], p3=coordinates[idxC]
            // This is a complex formula, preserving its structure.
            centerY =
              ((coordinates[idxC][0] - coordinates[idxA][0]) *
                (Math.pow(coordinates[idxA][0], 2) +
                  Math.pow(coordinates[idxA][1], 2) -
                  Math.pow(coordinates[idxB][0], 2) -
                  Math.pow(coordinates[idxB][1], 2)) -
                (coordinates[idxB][0] - coordinates[idxA][0]) *
                  (Math.pow(coordinates[idxA][0], 2) +
                    Math.pow(coordinates[idxA][1], 2) -
                    Math.pow(coordinates[idxC][0], 2) -
                    Math.pow(coordinates[idxC][1], 2))) /
              (2.0 *
                (coordinates[idxC][0] - coordinates[idxA][0]) *
                (coordinates[idxA][1] - coordinates[idxB][1]) -
                2.0 *
                (coordinates[idxB][0] - coordinates[idxA][0]) *
                (coordinates[idxA][1] - coordinates[idxC][1]));

            // Calculate centerX based on centerY.
            if (coordinates[idxA][0] !== coordinates[idxB][0]) {
              centerX =
                ((2.0 * coordinates[idxA][1] - 2.0 * centerY) *
                  (coordinates[idxA][1] - coordinates[idxB][1]) -
                  (Math.pow(coordinates[idxA][0], 2) +
                    Math.pow(coordinates[idxA][1], 2) -
                    Math.pow(coordinates[idxB][0], 2) -
                    Math.pow(coordinates[idxB][1], 2))) /
                (2.0 * (coordinates[idxB][0] - coordinates[idxA][0]));
            } else {
              // Handle vertical line case (x_A == x_B)
              centerX =
                ((2.0 * coordinates[idxA][1] - 2.0 * centerY) *
                  (coordinates[idxA][1] - coordinates[idxC][1]) -
                  (Math.pow(coordinates[idxA][0], 2) +
                    Math.pow(coordinates[idxA][1], 2) -
                    Math.pow(coordinates[idxC][0], 2) -
                    Math.pow(coordinates[idxC][1], 2))) /
                (2.0 * (coordinates[idxC][0] - coordinates[idxA][0]));
            }
            // Calculate the squared radius from one of the points to the center.
            radiusSquared =
              Math.pow(coordinates[idxA][0] - centerX, 2) +
              Math.pow(coordinates[idxA][1] - centerY, 2);
          }

          // Check if all N points are contained within or on this candidate circle.
          let isContained = 0; // 0 means all points are contained, 1 means at least one is outside.
          for (let idxP = 0; idxP < pointCount; idxP++) {
            // If any point is outside the circle, this is not the minimum enclosing circle.
            if (
              Math.pow(coordinates[idxP][0] - centerX, 2) +
                Math.pow(coordinates[idxP][1] - centerY, 2) >
              radiusSquared
            ) {
              isContained = 1;
              break; // No need to check further points for this circle.
            }
          }

          // If all points are contained, this circle is a candidate for the MEC.
          // Since we are iterating through all combinations, the first one found that contains all points
          // and is formed by 2 or 3 points on its boundary is the MEC.
          if (isContained === 0) {
            finalResult = Math.sqrt(radiusSquared);
            break; // Exit the innermost loop (k)
          }
        }
        if (finalResult !== 0.0) {
          break; // Exit the middle loop (j)
        }
      }
      if (finalResult !== 0.0) {
        break; // Exit the outermost loop (i)
      }
    }
  }

  // Output the calculated minimum enclosing circle radius.
  console.log(String(finalResult));
  return finalResult;
}

// This function is for a specific testing environment, likely a browser.
function testSolution(testCaseNum) {
  // Retrieve input and expected output from DOM elements.
  const testInput = document.getElementById('input' + testCaseNum).value;
  const expectedOutput = document.getElementById('output' + testCaseNum).value.split('\n')[0];

  // Run the main logic with the test input.
  const solutionOutput = ProcessInput(testInput);

  // Determine if the solution is correct.
  let testOutcome = 'WA'; // Wrong Answer
  // Compare the numerical output with the parsed expected output.
  if (solutionOutput === parseFloat(expectedOutput)) {
    testOutcome = 'AC'; // Accepted
  }

  // Display the test result in the DOM.
  document.getElementById('result' + testCaseNum).innerHTML = testOutcome;
}

// Execute the main function with input from standard input (Node.js environment).
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
