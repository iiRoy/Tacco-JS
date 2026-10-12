function ProcessInput(rawData) {
  // The first line of input typically contains a count, though not directly used in the main loop logic here.
  var countVal = parseInt(rawData.split("\n")[0]);

  // The second line provides a list of primary numerical values.
  var primaryValues = rawData.split("\n")[1].split(" ");

  // The third line provides a list of secondary numerical values, used for processing.
  var secondaryValues = rawData.split("\n")[2].split(" ");

  // Convert string arrays to integer arrays for numerical operations.
  // This loop processes both primary and secondary value lists.
  for (var idx = 0; idx < primaryValues.length; idx++) {
    primaryValues[idx] = parseInt(primaryValues[idx]);
    // Only convert secondary values if the index is within its bounds.
    if (idx < secondaryValues.length) {
      secondaryValues[idx] = parseInt(secondaryValues[idx]);
    }
  }

  // Initialize a variable to accumulate the total collected amount.
  var totalCollected = 0;

  // Iterate through the secondary values to perform the core calculation.
  for (var idx = 0; idx < secondaryValues.length; idx++) {
    // Get the current primary value from the primary list.
    var currentPrimary = primaryValues[idx];
    // Get the next primary value, which might be affected by the current operation.
    var nextPrimary = primaryValues[idx + 1];
    // Get the current secondary value, which dictates the collection logic.
    var currentSecondary = secondaryValues[idx];

    // Apply conditional logic based on the relationship between currentSecondary, currentPrimary, and nextPrimary.
    if (currentSecondary <= currentPrimary) {
      // If the secondary value is less than or equal to the current primary, collect it entirely.
      totalCollected += currentSecondary;
      continue; // Move to the next iteration.
    } else if (currentSecondary > currentPrimary && currentSecondary < nextPrimary) {
      // If secondary is greater than current primary but less than next primary.
      totalCollected += currentSecondary;
      // Adjust the next primary value based on the difference.
      primaryValues[idx + 1] = nextPrimary - (currentSecondary - currentPrimary);
      continue;
    } else if (currentSecondary > currentPrimary && currentSecondary > nextPrimary && currentSecondary < currentPrimary + nextPrimary) {
      // If secondary is greater than both current and next primary, but less than their sum.
      totalCollected += currentSecondary;
      // Adjust the next primary value similarly.
      primaryValues[idx + 1] = nextPrimary - (currentSecondary - currentPrimary);
      continue;
    } else {
      // This covers cases where currentSecondary is greater than or equal to the sum of currentPrimary and nextPrimary.
      totalCollected += currentPrimary + nextPrimary;
      // In this scenario, the next primary value is fully utilized, so set it to zero.
      primaryValues[idx + 1] = 0;
      continue;
    }
  }
  // Output the final accumulated total to the console.
  console.log(totalCollected);
}

// Read the entire input from standard input, assuming UTF-8 encoding, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
