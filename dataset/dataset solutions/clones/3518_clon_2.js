var parseInteger = val => Number.parseInt(val, 10);
var parseIntegerArray = inputElements => inputElements.map(val => parseInteger(val));
var getAbsoluteValue = inputVal => (inputVal > 0) ? inputVal : -inputVal;

function findMinimumValue() {
  var argumentList = arguments;
  var currentMinimum = argumentList[0];
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    if (argumentList[loopIndex] < currentMinimum) {
      currentMinimum = argumentList[loopIndex];
    }
  }
  return currentMinimum;
}

function findMaximumValue() {
  var argumentList = arguments;
  var currentMaximum = argumentList[0];
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    if (argumentList[loopIndex] > currentMaximum) {
      currentMaximum = argumentList[loopIndex];
    }
  }
  return currentMaximum;
}

function calculateGreatestCommonDivisor() {
  var argumentList = arguments;
  var gcdResult = argumentList[0];
  // Helper function for the Euclidean algorithm calculation
  var euclideanHelper = (numOne, numTwo) => numTwo ? euclideanHelper(numTwo, numOne % numTwo) : numOne;
  for (var loopIndex = 1; loopIndex < argumentList.length; loopIndex++) {
    gcdResult = euclideanHelper(gcdResult, argumentList[loopIndex]);
  }
  return gcdResult;
}


// Initiate the main program flow by reading from the standard input stream
executeProcessing(require('node:fs').readFileSync('/dev/stdinput', 'utf8'));


function executeProcessing(sourceContent) {
  // Split the entire raw input into an array of individual lines
  var linesOfText = sourceContent.split('\n');

  // Convert the first line to an integer, representing the total number of entries
  var numberOfEntries = parseInteger(linesOfText[0]);

  // Create an array to hold all the coordinate pairs after parsing
  var pointCoordinates = [];

  // Process each subsequent line, converting them into coordinate arrays
  for (var iterationIndex = 0; iterationIndex < numberOfEntries; iterationIndex++) {
    // Parse the current line (split by space) into an array of numbers
    pointCoordinates[iterationIndex] = parseIntegerArray(linesOfText[iterationIndex + 1].split(' '));

    // Perform a specific parity check involving the current and first coordinate pair
    if ((pointCoordinates[iterationIndex][0] + pointCoordinates[iterationIndex][1] + pointCoordinates[0][0] + pointCoordinates[0][1]) % 2 !== 0) {
      console.log(-1); // Output an error value if the parity condition is not met
      return 0; // Exit the function immediately
    }
  }

  // Calculate a parity offset based on the sum of the first coordinate pair's components
  var parityCheckResult = (pointCoordinates[0][0] + pointCoordinates[0][1]) % 2;

  // If the parity check result is 1, re-order certain coordinate pairs
  if (parityCheckResult === 1) {
    pointCoordinates = pointCoordinates.map(currentElement => currentElement[0] % 2 === 0 ? currentElement : currentElement.reverse());
  }

  /*
   * This block determines the required 'dimension' for path generation.
   * It starts with a base value and adjusts it based on coordinate parities.
   */
  var pathDimension = 20;

  // Increment dimension if the x-coordinate of the first point is odd
  if (pointCoordinates[0][0] % 2 === 1) {
    pathDimension++;
  }

  // Increment dimension if the y-coordinate of the first point is odd
  if (pointCoordinates[0][1] % 2 === 1) {
    pathDimension++;
  }

  // Print the calculated path dimension to the console
  console.log(pathDimension);

  // Initialize an array to store the default step directions
  var stepDirections = [];
  stepDirections.length = pathDimension;
  stepDirections.fill(1); // Populate the array with a uniform value

  // Convert the step directions array to a space-separated string for output
  stepDirections = stepDirections.join(' ');
  console.log(stepDirections);

  // Generate a movement path string for each processed coordinate set
  for (var iterationIndex = 0; iterationIndex < numberOfEntries; iterationIndex++) {
    var resultPathString = '';
    var currentPoint = pointCoordinates[iterationIndex];

    // If the x-coordinate is odd, append 'R' and increment x
    if (currentPoint[0] % 2 === 1) {
      resultPathString += 'R';
      currentPoint[0]++;
    }

    // If the y-coordinate is odd, append 'R' and increment y
    if (currentPoint[1] % 2 === 1) {
      resultPathString += 'R';
      currentPoint[1]++;
    }

    // Append 'R' characters to the path based on the adjusted x-coordinate
    resultPathString += ''.padEnd((10 + currentPoint[0]) / 2, 'R');
    // Append 'L' characters to the path based on the adjusted x-coordinate
    resultPathString += ''.padEnd((10 - currentPoint[0]) / 2, 'L');
    // Append 'U' characters to the path based on the adjusted y-coordinate
    resultPathString += ''.padEnd((10 + currentPoint[1]) / 2, 'U');
    // Append 'D' characters to the path based on the adjusted y-coordinate
    resultPathString += ''.padEnd((10 - currentPoint[1]) / 2, 'D');

    // Output the complete path string for the current point
    console.log(resultPathString);
  }

  // Return 0 to signify successful program termination
  return 0;
}