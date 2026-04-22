function ProcessData(dataString) {
  // Begin by extracting the initial numerical count from the first line of the raw input
  var recordCount = parseInt(dataString.split("\n")[0]);

  // Next, parse the sequence of values from the second line, splitting by spaces
  var alphaValues = dataString.split("\n")[1].split(" ");

  // Then, retrieve the corresponding sequence of values from the third line
  var betaValues = dataString.split("\n")[2].split(" ");

  // Iterate through the collected string arrays to convert their elements to integers
  for (var indexNum = 0; indexNum < alphaValues.length; indexNum++) {
    alphaValues[indexNum] = parseInt(alphaValues[indexNum]);

    // Ensure we only attempt conversion for elements within the bounds of the second array
    if (indexNum < betaValues.length) {
      betaValues[indexNum] = parseInt(betaValues[indexNum]);
    }
  }

  // Initialize a variable to accumulate the final computed score
  var totalScore = 0;

  // Commence the primary processing loop, iterating over the beta sequence
  for (var indexNum = 0; indexNum < betaValues.length; indexNum++) {
    // Fetch the current element from the alpha sequence
    var currentAlpha = alphaValues[indexNum];

    // Retrieve the subsequent element from the alpha sequence
    var nextAlpha = alphaValues[indexNum + 1];

    // Get the current element from the beta sequence
    var currentBeta = betaValues[indexNum];

    // A previously used debug output line is omitted here to maintain clean clone structure.
    // console.log("Current A: " + currentAlpha + ", Next A: " + nextAlpha + ", Current B: " + currentBeta);

    // Evaluate conditions based on the relationships between currentAlpha, nextAlpha, and currentBeta
    if (currentBeta <= currentAlpha) {
      // If currentBeta is less than or equal to currentAlpha, add currentBeta to the total
      totalScore += currentBeta;
      continue;
    } else if (currentBeta > currentAlpha && currentBeta < nextAlpha) {
      // If currentBeta is between currentAlpha and nextAlpha
      totalScore += currentBeta;
      // Adjust the nextAlpha value based on the difference
      alphaValues[indexNum + 1] = nextAlpha - (currentBeta - currentAlpha);
      continue;
    } else if (currentBeta > currentAlpha && currentBeta > nextAlpha && currentBeta < currentAlpha + nextAlpha) {
      // If currentBeta is greater than both but less than their sum
      totalScore += currentBeta;
      // Re-calculate and update the nextAlpha value
      alphaValues[indexNum + 1] = nextAlpha - (currentBeta - currentAlpha);
      continue;
    } else if (currentBeta >= currentAlpha + nextAlpha) {
      // If currentBeta is greater than or equal to the sum of currentAlpha and nextAlpha
      totalScore += currentAlpha + nextAlpha;
      // Set the nextAlpha value to zero as it has been fully utilized
      alphaValues[indexNum + 1] = 0;
      continue;
    }
  }

  // Print the final accumulated total score to the console
  console.log(totalScore);
}

// Execute the data processing routine, supplying input read asynchronously from standard input
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));