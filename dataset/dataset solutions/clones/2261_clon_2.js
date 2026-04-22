function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let dataLines = rawData.split('\n');

  // Parse the first line to get the total number of points.
  const totalPoints = parseInt(dataLines[0]);

  // Remove the first line (which contained totalPoints) from the array.
  dataLines.shift();

  // Keep only the lines corresponding to point data, discarding any extra lines.
  dataLines.splice(totalPoints, dataLines.length);

  // Parse each remaining line into an array of coordinate pairs (x, y).
  const pointCoordinates = dataLines.map(line => line.split(' ').map(strNum => parseInt(strNum)));

  // Initialize the variable to store the final calculated minimum enclosing circle radius.
  let finalResult = 0.0;

  // Iterate through all possible combinations of three distinct points (idxA, idxB, idxC).
  for (let idxA = 0; idxA < totalPoints; ++idxA) {
    for (let idxB = idxA + 1; idxB < totalPoints; ++idxB) {
      for (let idxC = idxB + 1; idxC < totalPoints; ++idxC) {
        // This array will store the squared lengths of the triangle sides and an identifier for which points form the side.
        let triangleSides = [];

        // Calculate squared length for side AB and push it with identifier 0.
        triangleSides.push([Math.pow(pointCoordinates[idxA][0] - pointCoordinates[idxB][0], 2) + Math.pow(pointCoordinates[idxA][1] - pointCoordinates[idxB][1], 2), 0]);
        // Calculate squared length for side AC and push it with identifier 1.
        triangleSides.push([Math.pow(pointCoordinates[idxA][0] - pointCoordinates[idxC][0], 2) + Math.pow(pointCoordinates[idxA][1] - pointCoordinates[idxC][1], 2), 1]);
        // Calculate squared length for side CB and push it with identifier 2.
        triangleSides.push([Math.pow(pointCoordinates[idxC][0] - pointCoordinates[idxB][0], 2) + Math.pow(pointCoordinates[idxC][1] - pointCoordinates[idxB][1], 2), 2]);

        // Sort the sides by squared length in descending order to find the longest side.
        triangleSides.sort((side1, side2) => side2[0] - side1[0]);

        let circleCenterX, circleCenterY, squaredRadius;

        // Check if the triangle is obtuse or right-angled (longest side squared > sum of other two sides squared).
        if (triangleSides[0][0] > triangleSides[1][0] + triangleSides[2][0]) {
          // If it's an obtuse or right triangle, the minimum enclosing circle's diameter is the longest side.
          if (triangleSides[0][1] === 0) { // Longest side is AB
            circleCenterX = (pointCoordinates[idxA][0] + pointCoordinates[idxB][0]) / 2.0;
            circleCenterY = (pointCoordinates[idxA][1] + pointCoordinates[idxB][1]) / 2.0;
            squaredRadius = Math.pow(pointCoordinates[idxA][0] - circleCenterX, 2) + Math.pow(pointCoordinates[idxA][1] - circleCenterY, 2);
          } else if (triangleSides[0][1] === 1) { // Longest side is AC
            circleCenterX = (pointCoordinates[idxA][0] + pointCoordinates[idxC][0]) / 2.0;
            circleCenterY = (pointCoordinates[idxA][1] + pointCoordinates[idxC][1]) / 2.0;
            squaredRadius = Math.pow(pointCoordinates[idxA][0] - circleCenterX, 2) + Math.pow(pointCoordinates[idxA][1] - circleCenterY, 2);
          } else { // Longest side is CB
            circleCenterX = (pointCoordinates[idxB][0] + pointCoordinates[idxC][0]) / 2.0;
            circleCenterY = (pointCoordinates[idxB][1] + pointCoordinates[idxC][1]) / 2.0;
            squaredRadius = Math.pow(pointCoordinates[idxB][0] - circleCenterX, 2) + Math.pow(pointCoordinates[idxB][1] - circleCenterY, 2);
          }
        } else {
          // If it's an acute triangle, the minimum enclosing circle is the circumcircle of the three points.
          // Calculate the circumcenter (circleCenterX, circleCenterY) and squared radius.
          circleCenterY = ((pointCoordinates[idxC][0] - pointCoordinates[idxA][0]) * (Math.pow(pointCoordinates[idxA][0], 2) + Math.pow(pointCoordinates[idxA][1], 2) - Math.pow(pointCoordinates[idxB][0], 2) - Math.pow(pointCoordinates[idxB][1], 2)) - (pointCoordinates[idxB][0] - pointCoordinates[idxA][0]) * (Math.pow(pointCoordinates[idxA][0], 2) + Math.pow(pointCoordinates[idxA][1], 2) - Math.pow(pointCoordinates[idxC][0], 2) - Math.pow(pointCoordinates[idxC][1], 2))) / (2 * (pointCoordinates[idxC][0] - pointCoordinates[idxA][0]) * (pointCoordinates[idxA][1] - pointCoordinates[idxB][1]) - 2 * (pointCoordinates[idxB][0] - pointCoordinates[idxA][0]) * (pointCoordinates[idxA][1] - pointCoordinates[idxC][1]));
          
          if (pointCoordinates[idxA][0] !== pointCoordinates[idxB][0]) {
            circleCenterX = ((2 * pointCoordinates[idxA][1] - pointCoordinates[idxB][1]) * circleCenterY - Math.pow(pointCoordinates[idxA][0], 2) - Math.pow(pointCoordinates[idxA][1], 2) + Math.pow(pointCoordinates[idxB][0], 2) + Math.pow(pointCoordinates[idxB][1], 2)) / (2 * (pointCoordinates[idxB][0] - pointCoordinates[idxA][0]));
          } else {
            circleCenterX = ((2 * pointCoordinates[idxA][1] - pointCoordinates[idxC][1]) * circleCenterY - Math.pow(pointCoordinates[idxA][0], 2) - Math.pow(pointCoordinates[idxA][1], 2) + Math.pow(pointCoordinates[idxC][0], 2) + Math.pow(pointCoordinates[idxC][1], 2)) / (2 * (pointCoordinates[idxC][0] - pointCoordinates[idxA][0]));
          }
          // Calculate squared radius from point A to the calculated center.
          squaredRadius = Math.pow(pointCoordinates[idxA][0] - circleCenterX, 2) + Math.pow(pointCoordinates[idxA][1] - circleCenterY, 2);
        }

        // Flag to indicate if any other point is outside the current candidate circle.
        let outlierFound = false;
        // Check if all other points are within or on the current candidate circle.
        for (let idxPnt = 0; idxPnt < totalPoints; ++idxPnt) {
          if (Math.pow(pointCoordinates[idxPnt][0] - circleCenterX, 2) + Math.pow(pointCoordinates[idxPnt][1] - circleCenterY, 2) > squaredRadius) {
            outlierFound = true; // An outlier point was found, this circle is not valid.
            break; // No need to check further for this circle.
          }
        }
        // If no outliers were found, this is a valid enclosing circle for all points.
        if (!outlierFound) {
          finalResult = Math.sqrt(squaredRadius); // Update the final result with the radius.
          break; // Found the minimum enclosing circle, exit inner loop (for idxC).
        }
      }
      // If a solution has been found, break out of the middle loop (for idxB).
      if (finalResult !== 0.0) {
        break;
      }
    }
    // If a solution has been found, break out of the outer loop (for idxA).
    if (finalResult !== 0.0) {
      break;
    }
  }

  // Output the computed radius to the console.
  console.log(`%s`, finalResult);
  // Return the result for potential further use or testing.
  return finalResult;
}

// Function for testing specific inputs in a browser environment.
function TestSolution(testCaseId) {
  // Retrieve input text from HTML element by its ID.
  const initialTextInput = document.getElementById(`input${testCaseId}`).value;
  // Run the main algorithm with the test input.
  const calculatedOutput = ProcessInput(initialTextInput);

  // Default outcome for a test is failure.
  let testResultStatus = "WrongAnswer";
  // Compare calculated result with the expected output from an HTML element.
  if (calculatedOutput === parseFloat(document.getElementById(`output${testCaseId}`).value.split('\n')[0])) {
    testResultStatus = "Accepted"; // If results match, update status to success.
  }
  // Display the test result on the page in the designated HTML element.
  document.getElementById(`result${testCaseId}`).innerHTML = testResultStatus;
}

// Execute the primary processing function with data from standard input (Node.js environment).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));