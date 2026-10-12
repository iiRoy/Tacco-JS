function ProcessInput(rawData) {
  // Split the incoming string data by spaces
  const parsedValues = rawData.split(" ");

  // Convert string parts to numerical dimensions and coordinates
  const rectWidth = Number(parsedValues[0]);
  const rectHeight = Number(parsedValues[1]);
  const coordX = Number(parsedValues[2]);
  const coordY = Number(parsedValues[3]);

  // Initialize variables for the final result and intermediate calculations
  let finalOutcome = 0;
  let largestArea = 0;
  let areaCount = 0;

  // Evaluate different geometric conditions to determine the largest area
  if (coordX === rectWidth / 2 && coordY === rectHeight / 2) {
    // Case: Point is exactly at the center
    largestArea = (rectWidth * rectHeight) / 2;
    areaCount = 1;
  } else if (coordX === rectWidth || coordY === rectHeight || coordX === rectWidth / 2 || coordY === rectHeight / 2) {
    // Case: Point is on an edge or a central axis
    largestArea = (rectWidth * rectHeight) / 2;
  } else if ((coordX / coordY) === (rectWidth / rectHeight) || ((coordX / coordY) * coordX + coordY) === rectHeight) {
    // Case: Point lies on a specific diagonal or related line
    largestArea = (rectWidth * rectHeight) / 2;
    areaCount = 1;
  } else {
    // General case: Calculate areas based on specific geometric properties
    let minSquareDimX = coordY / coordX * rectHeight;
    let minSquareDimY = coordX / coordY * rectWidth;
    let minSquareVal = 0;

    // Determine a specific minimum square value based on dimensions
    if (minSquareDimX < rectWidth) {
      minSquareVal = (coordX - minSquareDimX) * (rectHeight - coordY);
    } else if (minSquareDimY < rectHeight) {
      minSquareVal = (rectWidth - coordX) * (coordY - minSquareDimY);
    }

    // Perform two distinct area calculations
    const calculationA = (rectWidth - coordX) * (rectHeight - coordY) / 2 + (coordX * coordY) + minSquareVal;
    const calculationB = rectWidth * rectHeight - calculationA;

    // Assign the larger of the two calculated areas to largestArea
    if (calculationA > calculationB) {
      largestArea = calculationA;
    } else {
      largestArea = calculationB;
    }
  }

  // Calculate the final outcome by subtracting the largest area from the total rectangle area
  finalOutcome = (rectWidth * rectHeight) - largestArea;

  // Output the final result and the area count to the console
  console.log(finalOutcome + ' ' + areaCount);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
