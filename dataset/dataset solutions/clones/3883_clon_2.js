// This function processes the input data to calculate the maximum calorie gain.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let parsedLines = rawData.split("\n");

  // Parse the number of items (numItems) and the total distance (totalDistance) from the first line.
  let numItems = parseInt(parsedLines[0].split(" ")[0]);
  let totalDistance = parseInt(parsedLines[0].split(" ")[1]);

  // Initialize arrays to store item positions and their calorie values.
  let itemPositions = new Array(numItems);
  let itemValues = new Array(numItems);

  // Variable to track the index of the item closest to the midpoint from the origin.
  let midpointIndex = 0;

  // Loop through the input lines to populate item data.
  for (let idxA = 0; idxA < numItems; idxA++) {
    // Split each item's line into position and value.
    let tempParts = parsedLines[idxA + 1].split(" ");
    itemPositions[idxA] = parseInt(tempParts[0]);
    // Update midpointIndex if the current item's position is less than half the total distance.
    if (itemPositions[idxA] < totalDistance / 2) {
      midpointIndex = idxA;
    }
    itemValues[idxA] = parseInt(tempParts[1]);
  }

  // Initialize the maximum calorie gain found so far and the current running sum.
  let maxCalorieGain = 0;
  let currentCalorieGain = 0;

  // First pass: Calculate maximum gain by moving only in one direction (right from origin).
  for (let idxA = 0; idxA < numItems; idxA++) {
    if (idxA === 0) {
      // For the first item, gain is value minus distance from origin.
      currentCalorieGain = currentCalorieGain + itemValues[idxA] - itemPositions[idxA];
    } else {
      // For subsequent items, gain is value minus distance from previous item.
      currentCalorieGain = currentCalorieGain + itemValues[idxA] - (itemPositions[idxA] - itemPositions[idxA - 1]);
    }
    // Update the overall maximum gain.
    maxCalorieGain = Math.max(maxCalorieGain, currentCalorieGain);
  }

  // Second pass: Consider moving right, then turning back left.
  // Iterate from the midpoint index down to the origin.
  for (let idxA = midpointIndex; idxA >= 0; idxA--) {
    currentCalorieGain = 0; // Reset gain for each new starting point.
    // Move right from origin up to current item 'idxA'.
    for (let idxB = 0; idxB <= idxA; idxB++) {
      if (idxB === 0) {
        currentCalorieGain = currentCalorieGain + itemValues[idxB] - itemPositions[idxB];
      } else {
        currentCalorieGain = currentCalorieGain + itemValues[idxB] - (itemPositions[idxB] - itemPositions[idxB - 1]);
      }
      maxCalorieGain = Math.max(maxCalorieGain, currentCalorieGain);
    }
    // After reaching 'idxA', turn back and move left towards origin, then potentially past it.
    // Subtract the distance traveled back to origin from 'idxA'.
    currentCalorieGain = currentCalorieGain - itemPositions[idxA];
    // Now move left from the end (numItems-1) towards 'idxA'.
    for (let idxB = numItems - 1; idxB > idxA; idxB--) {
      if (idxB === numItems - 1) {
        // For the last item, subtract distance from totalDistance, add value.
        currentCalorieGain = currentCalorieGain - (totalDistance - itemPositions[idxB]) + itemValues[idxB];
      } else {
        // For other items, subtract distance from next item, add value.
        currentCalorieGain = currentCalorieGain - (itemPositions[idxB + 1] - itemPositions[idxB]) + itemValues[idxB];
      }
      maxCalorieGain = Math.max(maxCalorieGain, currentCalorieGain);
    }
  }

  // Third pass: Consider moving left, then turning back right.
  // Iterate from the item just past the midpoint up to the end.
  for (let idxA = midpointIndex + 1; idxA < numItems; idxA++) {
    currentCalorieGain = 0; // Reset gain for each new starting point.
    // Move left from the end (numItems-1) down to current item 'idxA'.
    for (let idxB = numItems - 1; idxB >= idxA; idxB--) {
      if (idxB === numItems - 1) {
        // For the last item, gain is value minus distance from totalDistance.
        currentCalorieGain = currentCalorieGain + itemValues[idxB] - (totalDistance - itemPositions[idxB]);
      } else {
        // For other items, gain is value minus distance from next item.
        currentCalorieGain = currentCalorieGain - (itemPositions[idxB + 1] - itemPositions[idxB]) + itemValues[idxB];
      }
      maxCalorieGain = Math.max(maxCalorieGain, currentCalorieGain);
    }
    // After reaching 'idxA', turn back and move right towards totalDistance, then potentially past it.
    // Subtract the distance traveled back to totalDistance from 'idxA'.
    currentCalorieGain = currentCalorieGain - (totalDistance - itemPositions[idxA]);
    // Now move right from the origin (0) towards 'idxA'.
    for (let idxB = 0; idxB < idxA; idxB++) {
      if (idxB === 0) {
        // For the first item, add value, subtract distance from origin.
        currentCalorieGain = currentCalorieGain + itemValues[idxB] - itemPositions[idxB];
      } else {
        // For other items, add value, subtract distance from previous item.
        currentCalorieGain = currentCalorieGain + itemValues[idxB] - (itemPositions[idxB] - itemPositions[idxB - 1]);
      }
      maxCalorieGain = Math.max(maxCalorieGain, currentCalorieGain);
    }
  }

  // Output the final maximum calorie gain.
  console.log('%s', maxCalorieGain);
}

// This function is for debugging purposes, typically used in a browser environment.
function performDebug() {
  // Get input from a DOM element.
  let browserInput = document.getElementById("input").value;
  // Call the main processing function with the browser input.
  ProcessInput(browserInput);
}

// Execute the main processing function with input read from standard input (for Node.js environment).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
