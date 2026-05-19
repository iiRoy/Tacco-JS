// This function processes the incoming data to calculate a specific distance.
function ProcessInput(rawData) {
  // Split the raw string into an array of strings based on space delimiter.
  let parsedData = rawData.split(" ");

  // Parse integer values from the array elements.
  const widthVal = parseInt(parsedData[0], 10);
  let coordA = parseInt(parsedData[1], 10);
  let coordB = parseInt(parsedData[2], 10);

  let resultDist; // Declare the variable to hold the final calculated distance.

  // Ensure coordA is always less than or equal to coordB for consistent calculation.
  if (coordA > coordB) {
    let tempCoord = coordA; // Temporary variable for swapping.
    coordA = coordB;
    coordB = tempCoord;
  }

  // Determine the distance based on the relative positions of the intervals.
  if (coordA + widthVal >= coordB) {
    // If the first interval overlaps or touches the second, the distance is zero.
    resultDist = 0;
  } else {
    // Otherwise, calculate the gap between the end of the first interval and the start of the second.
    resultDist = coordB - (coordA + widthVal);
  }

  // Output the calculated distance to the console.
  console.log('%s', resultDist);
}

// Helper function for local testing, typically triggered by a UI element.
function testExecution() {
  // Retrieve input from a DOM element for debugging purposes.
  const inputElementValue = document.getElementById("input").value;
  ProcessInput(inputElementValue); // Call the main processing function.
}

// Execute the primary function with data read from standard input in a production environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
