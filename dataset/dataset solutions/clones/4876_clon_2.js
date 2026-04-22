// This function processes spatial data provided as a string.
function ProcessCoordinates(rawData) {
  // Each line of the input string represents a separate data entry.
  let lineData = rawData.split("\n");

  // The first line contains the initial bounding box dimensions.
  let currentLineParts = lineData[0].split(" ");

  // Initialize the maximum and minimum X and Y coordinates.
  let maxCoordX = parseInt(currentLineParts[0], 10);
  let minCoordX = 0;
  let maxCoordY = parseInt(currentLineParts[1], 10);
  let minCoordY = 0;

  // Iterate through subsequent lines to refine the bounding box.
  for (let lineIndex = 1; lineIndex < lineData.length; lineIndex++) {
    currentLineParts = lineData[lineIndex].split(" ");

    // The third part of each line specifies the operation type.
    const operationType = parseInt(currentLineParts[2], 10);

    if (operationType === 1) {
      // Operation 1: Update minimum X if a new smaller boundary is found.
      const newXValue = parseInt(currentLineParts[0], 10);
      if (minCoordX < newXValue) {
        minCoordX = newXValue;
      }
    } else if (operationType === 2) {
      // Operation 2: Update maximum X if a new larger boundary is found.
      const newXValue = parseInt(currentLineParts[0], 10);
      if (maxCoordX > newXValue) {
        maxCoordX = newXValue;
      }
    } else if (operationType === 3) {
      // Operation 3: Update minimum Y if a new smaller boundary is found.
      const newYValue = parseInt(currentLineParts[1], 10);
      if (minCoordY < newYValue) {
        minCoordY = newYValue;
      }
    } else if (operationType === 4) {
      // Operation 4: Update maximum Y if a new larger boundary is found.
      const newYValue = parseInt(currentLineParts[1], 10);
      if (maxCoordY > newYValue) {
        maxCoordY = newYValue;
      }
    }
  }

  // Calculate the final area of the refined bounding box.
  const width = maxCoordX - minCoordX;
  const height = maxCoordY - minCoordY;
  const calculatedArea = width * height;

  // Output the area, ensuring it's not negative.
  if (calculatedArea < 1) {
    console.log(0);
  } else {
    console.log(calculatedArea);
  }
}

/* This section handles standard input/output and should not be modified. */
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));