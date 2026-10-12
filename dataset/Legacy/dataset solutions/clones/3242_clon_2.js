function ProcessInput(rawData) {
  // The raw input string is split by newline characters to get individual lines.
  var lineSegments = rawData.split("\n");

  // The first line contains the total count of items.
  var itemCount = parseInt(lineSegments[0]);

  // Process subsequent lines to create a collection of dishes.
  // Each dish entry will store two initial values and their sum.
  // The collection is then sorted based on the sum of values.
  var dishCollection = lineSegments.slice(1).map(function(currentLine) {
    var parts = currentLine.split(" ");
    let val1 = parseInt(parts[0]);
    let val2 = parseInt(parts[1]);
    return [val1, val2, val1 + val2];
  }).sort(function(firstDish, secondDish) {
    // Custom sort function: ascending order based on the third element (sum).
    if (firstDish[2] < secondDish[2]) {
      return -1;
    }
    if (firstDish[2] > secondDish[2]) {
      return 1;
    }
    return 0; // Elements are equal
  });

  // Initialize scores for two participants.
  var scoreA = 0;
  var scoreB = 0;

  // Iterate through the sorted dish collection.
  for (var idx = 0; idx < itemCount; idx++) {
    var offset = 0;
    var maxOffset = 0;

    // Find a contiguous block of dishes with the same sum.
    // Within this block, identify the dish that maximizes a specific component
    // based on the current iteration index (idx).
    while (idx + offset < itemCount && dishCollection[idx + offset][2] === dishCollection[idx][2]) {
      // The component to compare (0 or 1) depends on whether idx is even or odd.
      if (dishCollection[idx + offset][idx % 2] > dishCollection[idx + maxOffset][idx % 2]) {
        maxOffset = offset;
      }
      offset++;
    }

    // If a different dish within the block was found to be "better" (maxOffset > 0),
    // swap it with the current dish at 'idx'.
    if (maxOffset !== 0) {
      var tempDish = dishCollection[idx].slice(0); // Create a shallow copy
      dishCollection[idx] = dishCollection[idx + maxOffset].slice(0);
      dishCollection[idx + maxOffset] = tempDish;
    }

    // Assign scores based on the current iteration index.
    // If idx is even, add the first component to scoreA.
    if (idx % 2 === 0) {
      scoreA += dishCollection[idx][0];
    }
    // If idx is odd, add the second component to scoreB.
    else {
      scoreB += dishCollection[idx][1];
    }
  }

  // Output the difference between the two scores.
  console.log('%d', scoreA - scoreB);
}

// Do not modify this line! It handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
