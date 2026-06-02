function ProcessInput(rawData) {
  // Split the entire input string by newline characters
  let processedLines = rawData.split("\n");

  // Parse the first line to get the dimensions
  let dimensions = processedLines[0].split(" ");
  let numItemsA = parseInt(dimensions[0], 10);
  let numItemsB = parseInt(dimensions[1], 10);

  // Initialize arrays for the first set of coordinates
  let coordsA_X = [];
  let coordsA_Y = [];
  // Populate the first set of coordinates
  for (let idxA = 1; idxA <= numItemsA; idxA++) {
    let itemA_Str = processedLines[idxA].split(" ");
    coordsA_X[idxA] = parseInt(itemA_Str[0], 10);
    coordsA_Y[idxA] = parseInt(itemA_Str[1], 10);
  }

  // Initialize arrays for the second set of coordinates
  let coordsB_X = [];
  let coordsB_Y = [];
  // Populate the second set of coordinates
  for (let idxB = 1; idxB <= numItemsB; idxB++) {
    let itemB_Str = processedLines[1 + numItemsA + idxB - 1].split(" ");
    coordsB_X[idxB] = parseInt(itemB_Str[0], 10);
    coordsB_Y[idxB] = parseInt(itemB_Str[1], 10);
  }

  // Iterate through each item in the first set
  for (let currentA_Idx = 1; currentA_Idx <= numItemsA; currentA_Idx++) {
    let closestDist = 0;
    let closestB_Idx = 0;

    // Find the closest item in the second set
    for (let currentB_Idx = 1; currentB_Idx <= numItemsB; currentB_Idx++) {
      let currentDist =
        Math.abs(coordsA_X[currentA_Idx] - coordsB_X[currentB_Idx]) +
        Math.abs(coordsA_Y[currentA_Idx] - coordsB_Y[currentB_Idx]);

      // If it's the first comparison or a closer distance is found
      if (currentB_Idx === 1) {
        closestDist = currentDist;
        closestB_Idx = currentB_Idx;
      } else {
        if (currentDist < closestDist) {
          closestDist = currentDist;
          closestB_Idx = currentB_Idx;
        }
      }
    }
    // Output the index of the closest item from the second set
    console.log(closestB_Idx);
  }
}

// This part handles reading from standard input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
