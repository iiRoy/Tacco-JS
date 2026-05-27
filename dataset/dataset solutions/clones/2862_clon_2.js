function processInputData(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the first line of input to get the total number of steps and the count of forbidden steps.
  const initialValues = rawData.split(" ");
  const totalSteps = parseInt(initialValues[0], 10); // N in original
  const forbiddenCount = parseInt(initialValues[1], 10); // M in original

  // Initialize an array to store the indices of the forbidden steps.
  var forbiddenSteps = []; // arrA in original
  // Populate the forbidden steps array by parsing subsequent lines of input.
  for (var idx = 0; idx < forbiddenCount; idx++) {
    forbiddenSteps.push(parseInt(rawData.split("\n")[idx + 1], 10));
  }

  // This variable will count instances where two consecutive steps are forbidden.
  // Such a scenario makes it impossible to reach the end, resulting in 0 ways.
  var consecutiveForbidden = 0; // mu in original

  // Calculate the sizes of the gaps between forbidden steps and the start/end.
  var gapSizes = []; // dansa in original
  // The first gap is from step 0 to the first forbidden step minus 1.
  gapSizes.push(forbiddenSteps[0] - 1);
  // Calculate intermediate gaps between consecutive forbidden steps.
  // Each gap is the difference between the current forbidden step and the previous one, minus 2 (for the two forbidden steps themselves).
  for (var idx = 1; idx < forbiddenCount; idx++) {
    gapSizes.push(forbiddenSteps[idx] - forbiddenSteps[idx - 1] - 2);
  }
  // The last gap is from the last forbidden step to the total number of steps minus 1.
  gapSizes.push(totalSteps - forbiddenSteps[forbiddenCount - 1] - 1);

  // Check for consecutive forbidden steps. If found, 'consecutiveForbidden' will be non-zero.
  for (var idx = 0; idx < forbiddenSteps.length; idx++) {
    // Check if the next step in the forbidden list is exactly one greater than the current.
    if (forbiddenSteps[idx + 1] - forbiddenSteps[idx] === 1) {
      consecutiveForbidden++;
    }
  }

  // Array to store the number of ways to traverse each individual gap.
  var waysPerGap = []; // nantori in original
  // Iterate through each calculated gap size.
  for (var idx = 0; idx < gapSizes.length; idx++) {
    var currentGapWays = 0; // ans in original
    // Handle base cases for gap sizes.
    if (gapSizes[idx] === 1 || gapSizes[idx] === 0) {
      currentGapWays = 1; // One way to traverse a gap of 0 or 1 step.
    } else if (gapSizes[idx] === 2) {
      currentGapWays = 2; // Two ways to traverse a gap of 2 steps (1+1 or 2).
    } else {
      // For larger gaps, use a Fibonacci-like sequence (number of ways to climb stairs).
      var fibSequence = [1, 2]; // tempArr in original, representing ways for 1 and 2 steps.
      for (var fibIdx = 2; fibIdx < gapSizes[idx]; fibIdx++) {
        // Each subsequent value is the sum of the previous two.
        var nextFibValue = fibSequence[fibIdx - 1] + fibSequence[fibIdx - 2]; // temp in original
        fibSequence.push(nextFibValue);
      }
      currentGapWays = fibSequence[gapSizes[idx] - 1]; // The last element holds the ways for the current gap size.
    }
    // Store the number of ways for the current gap, applying modulo to prevent overflow.
    waysPerGap.push(currentGapWays % 1000000007);
  }

  // Initialize the final result accumulator.
  var finalResult = 1; // ans in original
  // Multiply the number of ways for each gap to get the total number of ways.
  for (var idx = 0; idx < waysPerGap.length; idx++) {
    finalResult = (finalResult * waysPerGap[idx]) % 1000000007;
  }

  // If there were any consecutive forbidden steps, the path is blocked.
  if (consecutiveForbidden !== 0) {
    console.log(0); // Output 0 ways.
  } else {
    // Otherwise, output the calculated total number of ways.
    console.log(finalResult % 1000000007);
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
