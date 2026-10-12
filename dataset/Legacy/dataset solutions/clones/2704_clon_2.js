function ProcessInput(rawData) {
  // Extract the first line to determine the count value.
  var countVal = parseInt(rawData.split('\n')[0]);
  // Obtain the second line, then split it by spaces to get the primary numerical sequence.
  var primaryValues = rawData.split('\n')[1].split(' ');
  // Retrieve the third line, splitting it by spaces to form the secondary numerical sequence.
  var secondaryValues = rawData.split('\n')[2].split(' ');

  // Iterate through the primary values array to convert string elements to integers.
  for (var idx = 0; idx < primaryValues.length; idx++) {
    primaryValues[idx] = parseInt(primaryValues[idx]);
    // If the current index is within the bounds of the secondary values array,
    // convert its element to an integer as well.
    if (idx < secondaryValues.length) {
      secondaryValues[idx] = parseInt(secondaryValues[idx]);
    }
  }

  // Initialize a variable to accumulate the final sum.
  var totalSum = 0;

  // Begin the main processing loop, iterating through the secondary values.
  for (var idx = 0; idx < secondaryValues.length; idx++) {
    // Assign current and next primary values, and the current secondary value to temporary variables for clarity.
    var currentPrimary = primaryValues[idx];
    var nextPrimary = primaryValues[idx + 1];
    var currentSecondary = secondaryValues[idx];

    // The following line was commented out in the original and is kept as such.
    // console.log("currentPrimary:" + currentPrimary + ",nextPrimary:" + nextPrimary + ":currentSecondary:" + currentSecondary);

    // Evaluate different conditions to update the total sum and potentially modify the primary values array.
    if (currentSecondary <= currentPrimary) {
      // If the current secondary value is less than or equal to the current primary, add it directly to the sum.
      totalSum += currentSecondary;
      continue; // Move to the next iteration.
    } else if (currentSecondary > currentPrimary && currentSecondary < nextPrimary) {
      // If current secondary is greater than current primary but less than next primary.
      totalSum += currentSecondary;
      // Adjust the next primary value based on the difference.
      primaryValues[idx + 1] = nextPrimary - (currentSecondary - currentPrimary);
      continue; // Move to the next iteration.
    } else if (currentSecondary > currentPrimary && currentSecondary > nextPrimary && currentSecondary < currentPrimary + nextPrimary) {
      // If current secondary is greater than both current and next primary, but less than their sum.
      totalSum += currentSecondary;
      // Adjust the next primary value similarly.
      primaryValues[idx + 1] = nextPrimary - (currentSecondary - currentPrimary);
      continue; // Move to the next iteration.
    } else if (currentSecondary >= currentPrimary + nextPrimary) {
      // If current secondary is greater than or equal to the sum of current and next primary.
      totalSum += currentPrimary + nextPrimary;
      // Set the next primary value to zero.
      primaryValues[idx + 1] = 0;
      continue; // Move to the next iteration.
    }
  }
  // Output the final calculated total sum to the console.
  console.log(totalSum);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
