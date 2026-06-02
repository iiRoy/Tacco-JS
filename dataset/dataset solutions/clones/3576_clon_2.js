function ProcessInput(inputData) {
  // Split the input string by space to get numeric parts
  const parsedNumbers = inputData.split(' ');

  // Parse the first number as the upper bound for iteration
  const upperBound = parseInt(parsedNumbers[0]);
  // Parse the second number as the divisor for modulo operations
  const divisorValue = parseInt(parsedNumbers[1]);

  // Initialize an array to store triplets that satisfy the conditions
  var matchingTriplets = [];

  // Outer loop for the first element of the triplet
  for (var firstVal = 1; firstVal <= upperBound; firstVal++) {
    // Initialize a temporary array for the current triplet
    var currentTriplet = [];
    currentTriplet[0] = firstVal; // Assign the first value

    // Middle loop for the second element of the triplet
    for (var secondVal = 1; secondVal <= upperBound; secondVal++) {
      currentTriplet[1] = secondVal; // Assign the second value

      // Inner loop for the third element of the triplet
      for (var thirdVal = 1; thirdVal <= upperBound; thirdVal++) {
        currentTriplet[2] = thirdVal; // Assign the third value

        // Check if the sum of each pair in the triplet is divisible by divisorValue
        if ((currentTriplet[0] + currentTriplet[1]) % divisorValue === 0 &&
            (currentTriplet[1] + currentTriplet[2]) % divisorValue === 0 &&
            (currentTriplet[2] + currentTriplet[0]) % divisorValue === 0) {
          // If all conditions are met, add the current triplet to the results
          matchingTriplets.push(currentTriplet);
        }
      }
    }
  }

  // Output the total count of matching triplets found
  console.log(matchingTriplets.length);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
