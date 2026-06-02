function processInput(rawData) {
  // Split the entire input string into individual lines.
  var lineSegments = rawData.split('\n');

  // The first line indicates the total number of test cases to process.
  var caseCount = parseInt(lineSegments[0], 10);

  // Iterate through each test case, starting from the second line (index 1).
  for (var idx = 1; idx <= caseCount; idx++) {
    // Initialize a boolean-like flag for tracking a specific condition.
    var foundSolution = 0;

    // Split the current line into numeric components.
    var currentNumbers = lineSegments[idx].split(' ');

    // Parse the four integer values for the current test case.
    var valX = parseInt(currentNumbers[0]);
    var valY = parseInt(currentNumbers[1]);
    var valZ = parseInt(currentNumbers[2]);
    var valW = parseInt(currentNumbers[3]);

    // Store the initial value of valX for later comparison.
    var initialX = valX;

    // Calculate the remainder of valX divided by valY.
    var tempX = valX % valY;

    // First set of conditional checks.
    // If valX is less than valY, it's an immediate "No".
    if (valX < valY) {
      console.log("No");
      continue; // Move to the next test case.
    }

    // If valW is less than valY, it's also an immediate "No".
    if (valW < valY) {
      console.log("No");
      continue; // Move to the next test case.
    }

    // If valX is less than valZ, it's an immediate "Yes".
    if (valX < valZ) {
      console.log("Yes");
      continue; // Move to the next test case.
    }

    // Adjust valX using the calculated remainder and valY.
    valX = tempX + valY;

    // Main loop for the core logic.
    while (valX >= valY) {
      // Check a specific condition involving valX, valY, and valZ.
      if ((valX - valY) <= valZ) {
        // Update tempX based on the condition.
        tempX = valX - valY + valW;
        valX = tempX; // Reassign valX.
      } else {
        // Update tempX if the condition is not met.
        tempX = valX - valY;
        valX = tempX; // Reassign valX.
      }

      // Check for a termination condition for the loop.
      if (valX >= 2 * initialX || valX == initialX) {
        console.log("Yes"); // Output "Yes" if condition met.
        foundSolution = 1; // Set the flag.
        break; // Exit the while loop.
      }
    }

    // After the loop, if the flag was not set, output "No".
    if (foundSolution == 0) {
      console.log("No");
    }
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
